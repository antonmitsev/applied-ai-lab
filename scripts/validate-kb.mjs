import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultKbRoot = path.join(repositoryRoot, "docs", "kb");
const allowedDocumentTypes = new Set([
  "concept",
  "component",
  "connection",
  "seal",
  "procedure",
  "diagnostic",
  "case",
  "tool",
  "safety",
  "requirements",
  "meta",
]);
const allowedStatuses = new Set(["draft", "reviewed", "verified", "deprecated"]);
const allowedSafetyLevels = new Set(["low", "medium", "high"]);
const allowedEvidenceLevels = new Set(["observed", "sourced", "reviewed", "verified", "hypothesis"]);
const allowedSourceClasses = new Set([
  "manufacturer-documentation",
  "standard-or-regulation",
  "expert-review",
  "internal-observation",
  "derived-reasoning",
]);
const allowedQueryTypes = new Set([
  "technical-term",
  "conversational",
  "misspelling",
  "symptom",
  "connection",
  "seal",
  "material",
  "incomplete",
  "image-unavailable",
  "safety",
  "clarify-first",
  "negative",
  "diagnostic",
]);
const allowedResponseClasses = new Set(["informational", "diagnostic", "local-diy", "clarify-first", "stop-and-escalate"]);
const allowedEvaluationSafety = new Set(["low", "medium", "high", "clarify-first", "stop-and-escalate"]);
const requiredBaseFields = ["id", "title", "document_type", "status", "version", "language"];
const specialDocumentTypes = new Set(["requirements", "meta"]);
const requiredSections = {
  component: [["short description"], ["function"], ["typical failures"], ["diagnosis"]],
  connection: [["short description"], ["what actually seals"], ["typical failures"], ["symptoms"], ["diagnosis"]],
  seal: [["what it is"], ["how it seals"], ["critical dimensions"], ["compatibility"]],
  diagnostic: [["symptom"], ["most likely causes"], ["tests"], ["how to interpret the results"]],
  procedure: [["goal"], ["preconditions"], ["steps"], ["when to stop"]],
  case: [["context", "purpose", "the specific assembly"], ["observed symptom", "observed behavior"], ["measurements", "measurements so far"], ["working hypotheses", "most likely explanations"]],
  safety: [["purpose"], ["safety"], ["when to stop"]],
};

/** Returns a repository-relative path with stable slash separators. */
function displayPath(file, root = repositoryRoot) {
  return path.relative(root, file).split(path.sep).join("/");
}

/** Converts a simple YAML scalar into the limited frontmatter value types used by this KB. */
function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "[]") return [];
  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replaceAll("''", "'");
  return trimmed;
}

/** Parses the deliberately small YAML frontmatter subset used by KB documents. */
function parseFrontmatter(content) {
  const lines = content.replaceAll("\r\n", "\n").split("\n");
  if (lines[0]?.trim() !== "---") throw new Error("frontmatter must start with ---");

  let end = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === "---") {
      end = index;
      break;
    }
  }
  if (end < 0) throw new Error("frontmatter closing --- is missing");

  const frontmatter = {};
  for (let index = 1; index < end; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const match = /^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/.exec(line);
    if (!match) throw new Error("unsupported frontmatter line " + (index + 1));

    const key = match[1];
    const rawValue = match[2] ?? "";
    if (rawValue.trim()) {
      frontmatter[key] = parseScalar(rawValue);
      continue;
    }

    const items = [];
    let cursor = index + 1;
    while (cursor < end && /^\s+-\s*(.*)$/.test(lines[cursor])) {
      const itemText = /^\s+-\s*(.*)$/.exec(lines[cursor])[1];
      const objectItem = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(itemText);
      if (!objectItem) {
        items.push(parseScalar(itemText));
        cursor += 1;
        continue;
      }
      const object = { [objectItem[1]]: parseScalar(objectItem[2]) };
      cursor += 1;
      while (cursor < end && /^\s{4,}[A-Za-z][A-Za-z0-9_-]*:\s*(.*)$/.test(lines[cursor])) {
        const property = /^\s{4,}([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(lines[cursor]);
        object[property[1]] = parseScalar(property[2]);
        cursor += 1;
      }
      items.push(object);
    }
    frontmatter[key] = items.length > 0 ? items : null;
    index = cursor - 1;
  }

  return {
    frontmatter,
    body: lines.slice(end + 1).join("\n"),
    bodyStartLine: end + 2,
  };
}

/** Extracts Markdown headings while ignoring fenced code examples. */
function extractHeadings(markdown, firstLine = 1) {
  const headings = [];
  const lines = markdown.split("\n");
  let inFence = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(?:\`\`\`|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (match) headings.push({ level: match[1].length, text: match[2], line: firstLine + index });
  }
  return headings;
}

/** Normalizes a heading or metadata label for case-insensitive section checks. */
function normalizeLabel(value) {
  return value.toLocaleLowerCase("en-US").replace(/^\d+(?:\.\d+)*\.?\s+/, "").replaceAll(/[\`*_:#]/g, "").replaceAll(/\s+/g, " ").trim();
}

/** Creates a structured validation issue for machine-readable reports. */
function makeIssue(file, code, message, severity = "error", line = undefined, root = repositoryRoot) {
  return { file: displayPath(file, root), code, message, severity, ...(line ? { line } : {}) };
}

/** Checks one knowledge document and returns errors and warnings without writing files. */
function validateKnowledgeDocument({ file, content, allIds, production = false, root = repositoryRoot }) {
  const issues = [];
  let parsed;
  try {
    parsed = parseFrontmatter(content);
  } catch (error) {
    return [makeIssue(file, "FRONTMATTER_INVALID", error.message, "error", undefined, root)];
  }

  const metadata = parsed.frontmatter;
  for (const field of requiredBaseFields) {
    if (metadata[field] === undefined || metadata[field] === null || metadata[field] === "") {
      issues.push(makeIssue(file, "REQUIRED_FIELD_MISSING", "required frontmatter field " + field + " is missing", "error", undefined, root));
    }
  }

  if (typeof metadata.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id)) {
    issues.push(makeIssue(file, "ID_INVALID", "id must contain only lowercase letters, numbers, and hyphens", "error", undefined, root));
  }
  if (typeof metadata.document_type !== "string" || !allowedDocumentTypes.has(metadata.document_type)) {
    issues.push(makeIssue(file, "DOCUMENT_TYPE_INVALID", "document_type must be one of: " + [...allowedDocumentTypes].join(", "), "error", undefined, root));
  }
  if (typeof metadata.status !== "string" || !allowedStatuses.has(metadata.status)) {
    issues.push(makeIssue(file, "STATUS_INVALID", "status must be one of: " + [...allowedStatuses].join(", "), "error", undefined, root));
  }
  if (metadata.language !== "en") {
    issues.push(makeIssue(file, "LANGUAGE_NOT_EN", "canonical KB documents must use language: en; user-language examples belong in aliases or evaluation cases", "error", undefined, root));
  }

  const type = metadata.document_type;
  const special = specialDocumentTypes.has(type);
  if (!special) {
    if (production && !["reviewed", "verified"].includes(metadata.status)) {
      issues.push(makeIssue(file, "PRODUCTION_STATUS_INVALID", "production content must have status reviewed or verified", "error", undefined, root));
    }
    for (const field of ["aliases", "related"]) {
      if (!Array.isArray(metadata[field])) issues.push(makeIssue(file, "LIST_FIELD_INVALID", field + " must be a YAML list", "error", undefined, root));
    }
    if (typeof metadata.safety_level !== "string" || !allowedSafetyLevels.has(metadata.safety_level)) {
      issues.push(makeIssue(file, "SAFETY_LEVEL_INVALID", "content units must have safety_level: low, medium, or high", "error", undefined, root));
    }
    if (metadata.source_class !== undefined) {
      if (!Array.isArray(metadata.source_class) || metadata.source_class.some((value) => !allowedSourceClasses.has(value))) {
        issues.push(makeIssue(file, "SOURCE_CLASS_INVALID", "source_class contains an unsupported value", "error", undefined, root));
      }
    }
    if (metadata.evidence_level !== undefined && (typeof metadata.evidence_level !== "string" || !allowedEvidenceLevels.has(metadata.evidence_level))) {
      issues.push(makeIssue(file, "EVIDENCE_LEVEL_INVALID", "evidence_level must be observed, sourced, reviewed, verified, or hypothesis", "error", undefined, root));
    }
    if (metadata.status !== "draft" || production) {
      for (const field of ["source_class", "evidence_level", "source_refs", "applies_to"]) {
        if (metadata[field] === undefined || metadata[field] === null) {
          issues.push(makeIssue(file, "PROVENANCE_FIELD_MISSING", field + " is required for reviewed, verified, or production content", "error", undefined, root));
        }
      }
      if (metadata.source_refs !== undefined && (!Array.isArray(metadata.source_refs) || metadata.source_refs.length === 0 || metadata.source_refs.some((value) => !value || typeof value !== "object" || typeof value.ref !== "string"))) {
        issues.push(makeIssue(file, "SOURCE_REFS_INVALID", "source_refs must be a non-empty list of objects with a ref field", "error", undefined, root));
      }
      if (metadata.applies_to !== undefined && (!Array.isArray(metadata.applies_to) || metadata.applies_to.length === 0)) {
        issues.push(makeIssue(file, "APPLIES_TO_INVALID", "applies_to must be a non-empty YAML list", "error", undefined, root));
      }
    }

    const expectedBase = path.basename(file, ".md");
    if (expectedBase !== metadata.id) {
      const severity = production || metadata.status !== "draft" ? "error" : "warning";
      issues.push(makeIssue(file, "FILENAME_ID_MISMATCH", "filename " + expectedBase + ".md does not match id " + metadata.id, severity, undefined, root));
    }
  }

  if (Array.isArray(metadata.aliases)) {
    const aliases = metadata.aliases.map(String);
    if (new Set(aliases).size !== aliases.length) issues.push(makeIssue(file, "ALIASES_DUPLICATE", "aliases must be unique", "error", undefined, root));
    if (aliases.some((alias) => !alias.trim())) issues.push(makeIssue(file, "ALIAS_EMPTY", "aliases must not contain empty values", "error", undefined, root));
  }
  if (Array.isArray(metadata.related)) {
    const related = metadata.related.map(String);
    if (new Set(related).size !== related.length) issues.push(makeIssue(file, "RELATED_DUPLICATE", "related IDs must be unique", "error", undefined, root));
    for (const relatedId of related) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(relatedId)) {
        issues.push(makeIssue(file, "RELATED_ID_INVALID", "related ID " + relatedId + " is not a valid stable ID", "error", undefined, root));
      } else if (!allIds.has(relatedId)) {
        const severity = production || metadata.status !== "draft" ? "error" : "warning";
        issues.push(makeIssue(file, "RELATED_ID_MISSING", "related ID " + relatedId + " does not exist in the current KB", severity, undefined, root));
      }
    }
  }

  const headings = extractHeadings(parsed.body, parsed.bodyStartLine);
  const h1Count = headings.filter((heading) => heading.level === 1).length;
  if (special ? h1Count < 1 : h1Count !== 1) {
    const expected = special ? "at least one" : "exactly one";
    issues.push(makeIssue(file, "H1_COUNT_INVALID", "document must contain " + expected + " top-level # heading", "error", undefined, root));
  }
  const headingLabels = new Set(headings.filter((heading) => heading.level === 2).map((heading) => normalizeLabel(heading.text)));
  for (const alternatives of requiredSections[type] ?? []) {
    if (!alternatives.some((section) => headingLabels.has(normalizeLabel(section)))) {
      issues.push(makeIssue(file, "REQUIRED_SECTION_MISSING", "missing required section: " + alternatives.join(" or "), "error", undefined, root));
    }
  }

  return issues;
}

/** Recursively lists Markdown documents below the KB root. */
async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listMarkdownFiles(target)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(target);
  }
  return files.sort();
}

/** Validates every Markdown knowledge document and returns a structured report. */
async function validateKnowledgeBase(directory = defaultKbRoot, options = {}) {
  const files = await listMarkdownFiles(directory);
  const documents = [];
  const issues = [];
  const allIds = new Set();

  for (const file of files) {
    const content = await readFile(file, "utf8");
    let parsed;
    try {
      parsed = parseFrontmatter(content);
      documents.push({ file, content, metadata: parsed.frontmatter });
      if (parsed.frontmatter.id) {
        if (allIds.has(parsed.frontmatter.id)) issues.push(makeIssue(file, "ID_DUPLICATE", "duplicate ID " + parsed.frontmatter.id, "error", undefined, options.root ?? repositoryRoot));
        allIds.add(parsed.frontmatter.id);
      }
    } catch {
      documents.push({ file, content, metadata: {} });
    }
  }

  for (const document of documents) {
    issues.push(...validateKnowledgeDocument({
      file: document.file,
      content: document.content,
      allIds,
      production: options.production ?? false,
      root: options.root ?? repositoryRoot,
    }));
  }

  return {
    files: files.length,
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
  };
}

/** Validates the versioned retrieval evaluation set without requiring the KB units to exist yet. */
async function validateEvaluationSet(file = path.join(repositoryRoot, "evals", "plumbing-kb", "retrieval-cases.json"), root = repositoryRoot) {
  const issues = [];
  let document;
  try {
    document = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    return { cases: 0, errors: [makeIssue(file, "EVAL_JSON_INVALID", error.message, "error", undefined, root)], warnings: [] };
  }

  if (document.schema_version !== "1") issues.push(makeIssue(file, "EVAL_SCHEMA_VERSION_INVALID", "schema_version must be 1", "error", undefined, root));
  if (!["draft", "reviewed", "verified"].includes(document.status)) issues.push(makeIssue(file, "EVAL_STATUS_INVALID", "evaluation status must be draft, reviewed, or verified", "error", undefined, root));
  if (!Array.isArray(document.cases)) return { cases: 0, errors: [...issues, makeIssue(file, "EVAL_CASES_INVALID", "cases must be an array", "error", undefined, root)], warnings: [] };
  if (document.cases.length < 20) issues.push(makeIssue(file, "EVAL_CASE_COUNT_LOW", "the initial retrieval evaluation set must contain at least 20 cases", "error", undefined, root));

  const seenCaseIds = new Set();
  const observedLanguages = new Set();
  const observedTypes = new Set();
  for (const [index, evaluationCase] of document.cases.entries()) {
    const location = index + 1;
    const casePrefix = "case " + location;
    const required = ["case_id", "query", "language", "query_type", "expected_ids", "useful_ids", "avoid_ids", "safety_expectation", "response_class"];
    for (const field of required) {
      if (evaluationCase?.[field] === undefined) issues.push(makeIssue(file, "EVAL_FIELD_MISSING", casePrefix + " is missing " + field, "error", undefined, root));
    }
    if (typeof evaluationCase?.case_id !== "string" || !/^KB-EVAL-[0-9]{3}$/.test(evaluationCase.case_id)) {
      issues.push(makeIssue(file, "EVAL_CASE_ID_INVALID", casePrefix + " has an invalid case_id", "error", undefined, root));
    } else if (seenCaseIds.has(evaluationCase.case_id)) {
      issues.push(makeIssue(file, "EVAL_CASE_ID_DUPLICATE", "duplicate evaluation case " + evaluationCase.case_id, "error", undefined, root));
    } else {
      seenCaseIds.add(evaluationCase.case_id);
    }
    if (typeof evaluationCase?.query !== "string" || !evaluationCase.query.trim()) issues.push(makeIssue(file, "EVAL_QUERY_INVALID", casePrefix + " query must be non-empty", "error", undefined, root));
    if (!["bg", "en"].includes(evaluationCase?.language)) issues.push(makeIssue(file, "EVAL_LANGUAGE_INVALID", casePrefix + " language must be bg or en", "error", undefined, root));
    else observedLanguages.add(evaluationCase.language);
    if (!allowedQueryTypes.has(evaluationCase?.query_type)) issues.push(makeIssue(file, "EVAL_QUERY_TYPE_INVALID", casePrefix + " has an unsupported query_type", "error", undefined, root));
    else observedTypes.add(evaluationCase.query_type);
    if (!allowedEvaluationSafety.has(evaluationCase?.safety_expectation)) issues.push(makeIssue(file, "EVAL_SAFETY_INVALID", casePrefix + " has an unsupported safety_expectation", "error", undefined, root));
    if (!allowedResponseClasses.has(evaluationCase?.response_class)) issues.push(makeIssue(file, "EVAL_RESPONSE_CLASS_INVALID", casePrefix + " has an unsupported response_class", "error", undefined, root));

    for (const field of ["expected_ids", "useful_ids", "avoid_ids"]) {
      const values = evaluationCase?.[field];
      if (!Array.isArray(values)) {
        issues.push(makeIssue(file, "EVAL_ID_LIST_INVALID", casePrefix + " " + field + " must be an array", "error", undefined, root));
        continue;
      }
      if (field === "expected_ids" && values.length === 0) issues.push(makeIssue(file, "EVAL_EXPECTED_EMPTY", casePrefix + " expected_ids must not be empty", "error", undefined, root));
      if (new Set(values).size !== values.length) issues.push(makeIssue(file, "EVAL_ID_LIST_DUPLICATE", casePrefix + " " + field + " contains duplicates", "error", undefined, root));
      for (const value of values) if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) issues.push(makeIssue(file, "EVAL_STABLE_ID_INVALID", casePrefix + " contains an invalid knowledge-unit ID", "error", undefined, root));
    }
  }

  for (const requiredType of ["symptom", "connection", "safety", "incomplete", "image-unavailable", "misspelling"]) {
    if (!observedTypes.has(requiredType)) issues.push(makeIssue(file, "EVAL_COVERAGE_MISSING", "evaluation set does not cover query_type " + requiredType, "error", undefined, root));
  }
  if (!observedLanguages.has("bg") || !observedLanguages.has("en")) issues.push(makeIssue(file, "EVAL_LANGUAGE_COVERAGE_MISSING", "evaluation set must contain both Bulgarian and English queries", "error", undefined, root));
  return {
    cases: document.cases.length,
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
  };
}

/** Formats and prints a validation report for the command-line interface. */
function printReport(report, production, evaluationReport) {
  const mode = production ? "production" : "development";
  for (const issue of [...report.errors, ...report.warnings]) {
    const location = issue.line ? issue.file + ":" + issue.line : issue.file;
    console.error("[" + issue.severity + "] " + issue.code + " " + location + " — " + issue.message);
  }
  for (const issue of [...evaluationReport.errors, ...evaluationReport.warnings]) {
    const location = issue.line ? issue.file + ":" + issue.line : issue.file;
    console.error("[" + issue.severity + "] " + issue.code + " " + location + " — " + issue.message);
  }
  if (report.errors.length === 0) {
    console.log("KB validation passed (" + mode + "): " + report.files + " Markdown files; " + report.warnings.length + " warning(s).");
  } else {
    console.error("KB validation failed (" + mode + "): " + report.errors.length + " error(s); " + report.warnings.length + " warning(s).");
  }
  if (evaluationReport.errors.length === 0) console.log("Retrieval evaluation passed: " + evaluationReport.cases + " cases.");
  else console.error("Retrieval evaluation failed: " + evaluationReport.errors.length + " error(s).");
}

/** Runs the validator when this file is invoked as a command. */
async function main() {
  const production = process.argv.includes("--production");
  const report = await validateKnowledgeBase(defaultKbRoot, { production });
  const evaluationReport = await validateEvaluationSet();
  printReport(report, production, evaluationReport);
  if (report.errors.length > 0 || evaluationReport.errors.length > 0) process.exitCode = 1;
}

export { extractHeadings, parseFrontmatter, validateEvaluationSet, validateKnowledgeBase, validateKnowledgeDocument };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
