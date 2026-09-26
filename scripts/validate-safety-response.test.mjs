import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { resolveSafetyDecision, validateSafetyResponseContract } from "./validate-safety-response.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Loads the repository safety contract for pure decision tests. */
async function loadContract() {
  return JSON.parse(await readFile(path.join(repositoryRoot, "docs/contracts/kb-safety-response-contract.json"), "utf8"));
}

test("critical hazard always forces stop and escalation", async () => {
  const contract = await loadContract();
  const result = resolveSafetyDecision({
    pre_triage: "routine",
    model_urgency: "routine",
    post_validation_floor: "routine",
    hazards: ["HZ-002"],
    material_safety_unknown: false,
    safety_level: "high",
    requested_response_class: "local-diy",
    generated_steps_requested: true,
  }, contract);
  assert.deepEqual(result, {
    urgency: "critical",
    response_class: "stop-and-escalate",
    generated_steps_allowed: false,
    professional_required: true,
  });
});

test("unknown material safety blocks local DIY steps", async () => {
  const contract = await loadContract();
  const result = resolveSafetyDecision({
    pre_triage: "routine",
    model_urgency: "routine",
    post_validation_floor: "routine",
    hazards: [],
    material_safety_unknown: true,
    safety_level: "medium",
    requested_response_class: "local-diy",
    generated_steps_requested: true,
  }, contract);
  assert.deepEqual(result, {
    urgency: "caution",
    response_class: "clarify-first",
    generated_steps_allowed: false,
    professional_required: false,
  });
});

test("repository contract and all frozen vectors pass", async () => {
  const report = await validateSafetyResponseContract(
    path.join(repositoryRoot, "docs/contracts/kb-safety-response-contract.json"),
    path.join(repositoryRoot, "docs/contracts/kb-safety-response-test-vectors.json"),
  );
  assert.equal(report.issues.length, 0, JSON.stringify(report.issues, null, 2));
  assert.equal(report.vectors, 10);
});
