import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = path.join(repositoryRoot, "docs", "contracts", "kb-safety-response-contract.json");
const vectorPath = path.join(repositoryRoot, "docs", "contracts", "kb-safety-response-test-vectors.json");
const severityOrder = ["routine", "caution", "critical"];
const responseClasses = ["informational", "diagnostic", "local-diy", "clarify-first", "stop-and-escalate"];
const responseClassRank = new Map([
  ["informational", 0],
  ["diagnostic", 1],
  ["local-diy", 1],
  ["clarify-first", 2],
  ["stop-and-escalate", 3],
]);

/** Returns the highest severity from the contract's monotonic severity order. */
function maxSeverity(...values) {
  const known = values.filter((value) => severityOrder.includes(value));
  return known.sort((left, right) => severityOrder.indexOf(right) - severityOrder.indexOf(left))[0] ?? "routine";
}

/** Returns the more restrictive response class for deterministic policy escalation. */
function moreRestrictiveClass(left, right) {
  return responseClassRank.get(right) > responseClassRank.get(left) ? right : left;
}

/** Resolves one response decision without a model, network, or filesystem side effect. */
function resolveSafetyDecision(input, contract) {
  let urgency = maxSeverity(input.pre_triage, input.model_urgency, input.post_validation_floor);
  let responseClass = input.requested_response_class;

  for (const hazardCode of input.hazards ?? []) {
    const floor = contract.hazard_floors[hazardCode];
    if (!floor) throw new Error("unknown hazard code " + hazardCode);
    urgency = maxSeverity(urgency, floor.minimum_urgency);
    responseClass = moreRestrictiveClass(responseClass, floor.response_class);
  }

  if (input.material_safety_unknown) {
    urgency = maxSeverity(urgency, "caution");
    responseClass = moreRestrictiveClass(responseClass, "clarify-first");
  }

  if (input.safety_level === "high" && input.requested_response_class === "local-diy") {
    urgency = maxSeverity(urgency, "caution");
    responseClass = moreRestrictiveClass(responseClass, "clarify-first");
  }

  if (urgency === "critical") responseClass = "stop-and-escalate";
  const classPolicy = contract.response_classes[responseClass];
  urgency = maxSeverity(urgency, classPolicy.minimum_urgency);

  return {
    urgency,
    response_class: responseClass,
    generated_steps_allowed: Boolean(input.generated_steps_requested) &&
      classPolicy.generated_steps_allowed &&
      urgency === "routine",
    professional_required: classPolicy.professional_required || responseClass === "stop-and-escalate",
  };
}

/** Creates one structured validator issue for a contract or vector failure. */
function issue(code, message, file = contractPath) {
  return { code, message, file: path.relative(repositoryRoot, file).split(path.sep).join("/") };
}

/** Checks the contract shape and returns all deterministic policy issues. */
function validateContract(contract) {
  const issues = [];
  if (contract.contract_id !== "PA-SAFE-CONTRACT-001") issues.push(issue("CONTRACT_ID_INVALID", "contract_id must be PA-SAFE-CONTRACT-001"));
  if (contract.schema_version !== "1") issues.push(issue("CONTRACT_VERSION_INVALID", "schema_version must be 1"));
  if (!["draft", "reviewed", "verified"].includes(contract.status)) issues.push(issue("CONTRACT_STATUS_INVALID", "contract status is invalid"));
  if (JSON.stringify(contract.severity_order) !== JSON.stringify(severityOrder)) issues.push(issue("SEVERITY_ORDER_INVALID", "severity_order must remain routine < caution < critical"));
  for (const responseClass of responseClasses) {
    const policy = contract.response_classes?.[responseClass];
    if (!policy) issues.push(issue("RESPONSE_CLASS_MISSING", "missing response class " + responseClass));
    else if (!severityOrder.includes(policy.minimum_urgency) || !severityOrder.includes(policy.maximum_urgency)) issues.push(issue("RESPONSE_CLASS_URGENCY_INVALID", "invalid urgency bounds for " + responseClass));
  }
  const expectedHazards = Array.from({ length: 13 }, (_, index) => "HZ-" + String(index + 1).padStart(3, "0"));
  for (const hazardCode of expectedHazards) {
    const floor = contract.hazard_floors?.[hazardCode];
    if (!floor || !severityOrder.includes(floor.minimum_urgency) || !responseClasses.includes(floor.response_class)) {
      issues.push(issue("HAZARD_FLOOR_INVALID", "invalid or missing floor for " + hazardCode));
    }
  }
  if (!Array.isArray(contract.allowed_action_codes) || contract.allowed_action_codes.length === 0 || new Set(contract.allowed_action_codes).size !== contract.allowed_action_codes.length) {
    issues.push(issue("ACTION_REGISTRY_INVALID", "allowed_action_codes must be a non-empty unique list"));
  }
  if (contract.output_schema !== "docs/contracts/assistant-response.schema.json") issues.push(issue("OUTPUT_SCHEMA_REFERENCE_INVALID", "contract must point to the existing assistant response schema"));
  if (contract.safety_policy !== "docs/safety/plumbing-assistant-safety-policy.md") issues.push(issue("SAFETY_POLICY_REFERENCE_INVALID", "contract must point to PA-SAFE-001"));
  return issues;
}

/** Validates all frozen safety vectors against the deterministic contract resolver. */
function validateVectors(vectors, contract) {
  const issues = [];
  if (vectors.contract_id !== contract.contract_id) issues.push(issue("VECTOR_CONTRACT_MISMATCH", "test vectors reference a different contract", vectorPath));
  if (vectors.schema_version !== contract.schema_version) issues.push(issue("VECTOR_VERSION_MISMATCH", "test vectors use a different schema version", vectorPath));
  if (!Array.isArray(vectors.vectors) || vectors.vectors.length < 10) {
    issues.push(issue("VECTOR_COUNT_LOW", "at least 10 deterministic safety vectors are required", vectorPath));
    return issues;
  }

  const ids = new Set();
  for (const vector of vectors.vectors) {
    if (!/^SAFE-VECTOR-[0-9]{3}$/.test(vector.vector_id) || ids.has(vector.vector_id)) {
      issues.push(issue("VECTOR_ID_INVALID", "vector IDs must be unique SAFE-VECTOR-NNN values", vectorPath));
    }
    ids.add(vector.vector_id);
    let result;
    try {
      result = resolveSafetyDecision(vector.input, contract);
    } catch (error) {
      issues.push(issue("VECTOR_INPUT_INVALID", vector.vector_id + ": " + error.message, vectorPath));
      continue;
    }
    for (const field of ["urgency", "response_class", "generated_steps_allowed", "professional_required"]) {
      if (result[field] !== vector.expected?.[field]) {
        issues.push(issue("VECTOR_EXPECTATION_MISMATCH", vector.vector_id + " expected " + field + "=" + vector.expected?.[field] + " but resolver returned " + result[field], vectorPath));
      }
    }
  }
  return issues;
}

/** Loads and validates the safety contract and its deterministic test vectors. */
async function validateSafetyResponseContract(contractFile = contractPath, vectorsFile = vectorPath) {
  let contract;
  let vectors;
  const issues = [];
  try {
    contract = JSON.parse(await readFile(contractFile, "utf8"));
  } catch (error) {
    issues.push(issue("CONTRACT_JSON_INVALID", error.message, contractFile));
  }
  try {
    vectors = JSON.parse(await readFile(vectorsFile, "utf8"));
  } catch (error) {
    issues.push(issue("VECTOR_JSON_INVALID", error.message, vectorsFile));
  }
  if (!contract || !vectors) return { vectors: 0, issues };
  issues.push(...validateContract(contract));
  issues.push(...validateVectors(vectors, contract));
  return { vectors: vectors.vectors?.length ?? 0, issues };
}

/** Runs the safety contract validator as a read-only command. */
async function main() {
  const report = await validateSafetyResponseContract();
  if (report.issues.length > 0) {
    console.error("Safety response contract validation failed:");
    for (const validationIssue of report.issues) console.error("- " + validationIssue.code + " " + validationIssue.file + ": " + validationIssue.message);
    process.exitCode = 1;
    return;
  }
  console.log("Safety response contract passed: " + report.vectors + " deterministic vectors.");
}

export { resolveSafetyDecision, validateContract, validateSafetyResponseContract, validateVectors };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
