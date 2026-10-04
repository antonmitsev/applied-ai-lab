import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildKnowledgeIndex, createDevelopmentIndexReceipt, searchKnowledge } from "./kb.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const kbRoot = path.join(repositoryRoot, "docs/kb");
const sourceManifestPath = path.join(repositoryRoot, "sources/plumbing-assistant/manifest.json");

describe("local knowledge index", () => {
  it("builds deterministic chunks with stable provenance fields", async () => {
    const [index, repeated] = await Promise.all([
      buildKnowledgeIndex(kbRoot),
      buildKnowledgeIndex(kbRoot),
    ]);
    expect(index.version).toBe("poc-kb-0.3");
    expect(index.documents).toHaveLength(16);
    expect(index.chunks).toHaveLength(193);
    expect(index.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(repeated.fingerprint).toBe(index.fingerprint);
    expect(index.chunks.every((chunk) => chunk.chunkId.startsWith(`${chunk.unitId}--`))).toBe(true);
    expect(index.documents.map((document) => document.unitId)).toEqual([
      "case-radiator-connection-findings-001",
      "case-radiator-o-ring-leak-001",
      "connection-compression-001",
      "connection-conical-001",
      "connection-insert-o-ring-001",
      "connection-press-001",
      "connection-threaded-001",
      "connection-union-flat-gasket-001",
      "diagnostic-leak-tightening-001",
      "diagnostic-radiator-cold-bottom-001",
      "diagnostic-radiator-cold-top-001",
      "diagnostic-radiator-completely-cold-001",
      "diagnostic-radiator-gurgling-001",
      "procedure-radiator-bleeding-001",
      "seal-o-ring-axial-001",
      "seal-o-ring-radial-001",
    ]);
    expect(
      index.documents.every(
        (document) =>
          !document.sourcePath.startsWith("/") &&
          document.status === "draft" &&
          document.sha256.match(/^[a-f0-9]{64}$/),
      ),
    ).toBe(true);
    const sourceManifest = JSON.parse(await readFile(sourceManifestPath, "utf8")) as {
      sources: Array<{ source_id: string }>;
    };
    const registeredSourceIds = new Set(sourceManifest.sources.map((source) => source.source_id));
    expect(
      index.documents
        .flatMap((document) => document.sourceIds)
        .every((sourceId) => registeredSourceIds.has(sourceId)),
    ).toBe(true);
    expect(createDevelopmentIndexReceipt(index)).toMatchObject({
      environment: "development",
      mode: "local_lexical",
      documentCount: 16,
      chunkCount: 193,
      fingerprint: index.fingerprint,
    });
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
