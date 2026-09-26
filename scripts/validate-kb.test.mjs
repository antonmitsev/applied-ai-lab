import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractHeadings, parseFrontmatter, validateEvaluationSet, validateKnowledgeBase, validateKnowledgeDocument } from "./validate-kb.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Joins fixture lines without depending on Markdown template-string parsing. */
function fixture(lines) {
  return lines.join("\n");
}

test("parses scalar and list frontmatter values", () => {
  const parsed = parseFrontmatter(fixture([
    "---",
    "id: example-001",
    "title: \"Example\"",
    "related:",
    "  - other-001",
    "  - \"third-001\"",
    "language: en",
    "---",
    "# Example",
  ]));
  assert.equal(parsed.frontmatter.id, "example-001");
  assert.deepEqual(parsed.frontmatter.related, ["other-001", "third-001"]);
  assert.equal(parsed.frontmatter.language, "en");
});

test("parses structured source references", () => {
  const parsed = parseFrontmatter(fixture([
    "---",
    "id: example-001",
    "source_refs:",
    "  - ref: manual-001",
    "    locator: \"section 2\"",
    "    accessed: \"2026-09-26\"",
    "---",
    "# Example",
  ]));
  assert.deepEqual(parsed.frontmatter.source_refs, [{
    ref: "manual-001",
    locator: "section 2",
    accessed: "2026-09-26",
  }]);
});

test("ignores headings inside fenced examples", () => {
  const headings = extractHeadings(fixture([
    "# Real heading",
    "~~~md",
    "# Example heading",
    "~~~",
    "## Real section",
  ]));
  assert.deepEqual(headings.map((heading) => heading.text), ["Real heading", "Real section"]);
});

test("reports invalid production provenance and references", () => {
  const issues = validateKnowledgeDocument({
    file: path.join(repositoryRoot, "docs/kb/bad-001.md"),
    content: fixture([
      "---",
      "id: bad-001",
      "title: \"Bad\"",
      "document_type: case",
      "status: verified",
      "version: \"0.1\"",
      "language: en",
      "aliases: []",
      "related:",
      "  - missing-001",
      "safety_level: medium",
      "---",
      "# Bad",
      "## Context",
      "## Observed symptom",
      "## Measurements",
      "## Working hypotheses",
      "## What was confirmed",
      "## What remains unconfirmed",
    ]),
    allIds: new Set(["bad-001"]),
    production: true,
    root: repositoryRoot,
  });
  assert.ok(issues.some((issue) => issue.code === "RELATED_ID_MISSING" && issue.severity === "error"));
  assert.ok(issues.some((issue) => issue.code === "PROVENANCE_FIELD_MISSING"));
});

test("current KB has no validation errors in development mode", async () => {
  const report = await validateKnowledgeBase(path.join(repositoryRoot, "docs/kb"));
  assert.equal(report.errors.length, 0, JSON.stringify(report.errors, null, 2));
});

test("retrieval evaluation set meets the initial baseline", async () => {
  const report = await validateEvaluationSet(path.join(repositoryRoot, "evals/plumbing-kb/retrieval-cases.json"), repositoryRoot);
  assert.equal(report.errors.length, 0, JSON.stringify(report.errors, null, 2));
  assert.equal(report.cases, 20);
});
