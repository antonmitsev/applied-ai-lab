import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildKnowledgeIndex, searchKnowledge } from "./kb.js";

interface RetrievalCase {
  case_id: string;
  query: string;
  expected_ids: string[];
}

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const kbRoot = path.join(appRoot, "docs", "kb");
const casesPath = path.join(appRoot, "evals", "plumbing-kb", "retrieval-cases.json");

describe("current local KB retrieval cases", () => {
  it("returns every expected unit in the bounded result set", async () => {
    const [index, casesFile] = await Promise.all([
      buildKnowledgeIndex(kbRoot),
      readFile(casesPath, "utf8").then(
        (content) => JSON.parse(content) as { cases: RetrievalCase[] },
      ),
    ]);

    const indexedIds = new Set(index.chunks.map((chunk) => chunk.unitId));
    const misses = casesFile.cases.flatMap((testCase) => {
      const indexedExpected = testCase.expected_ids.filter((id) => indexedIds.has(id));
      const returned = new Set(
        searchKnowledge(index, testCase.query, 10).map((result) => result.unitId),
      );
      return indexedExpected
        .filter((id) => !returned.has(id))
        .map((id) => `${testCase.case_id}:${id}`);
    });
    expect(misses).toEqual([]);
    expect(
      casesFile.cases.some((testCase) => testCase.expected_ids.some((id) => !indexedIds.has(id))),
    ).toBe(true);
  });
});
