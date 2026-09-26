import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildKnowledgeIndex, searchKnowledge } from "./kb.js";

const kbRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../docs/kb");

describe("local knowledge index", () => {
  it("builds deterministic chunks with stable provenance fields", async () => {
    const index = await buildKnowledgeIndex(kbRoot);
    expect(index.version).toBe("poc-kb-0.1");
    expect(index.chunks.length).toBeGreaterThan(20);
    expect(index.chunks.every((chunk) => chunk.chunkId.startsWith(`${chunk.unitId}--`))).toBe(true);
  });

  it("retrieves the O-ring unit for Bulgarian symptom language", async () => {
    const results = searchKnowledge(
      await buildKnowledgeIndex(kbRoot),
      "О рингът на щуцера просълзява",
    );
    expect(results.map((result) => result.unitId)).toContain("seal-o-ring-radial-001");
  });

  it("fails closed for an empty or unknown query", async () => {
    const index = await buildKnowledgeIndex(kbRoot);
    expect(searchKnowledge(index, "")).toEqual([]);
    expect(searchKnowledge(index, "quantum banana plumbing")).toEqual([]);
  });
});
