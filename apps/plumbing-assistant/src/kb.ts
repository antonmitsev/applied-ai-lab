import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface KnowledgeChunk {
  chunkId: string;
  unitId: string;
  title: string;
  text: string;
  aliases: string[];
  language: "en";
  sourceId: string | null;
  evidenceLevel: string | null;
}

export interface KnowledgeIndex {
  root: string;
  chunks: KnowledgeChunk[];
  version: string;
}

export interface SearchResult extends KnowledgeChunk {
  score: number;
}

function parseList(frontmatter: string, field: string): string[] {
  const match = new RegExp(`^${field}:\\n((?:\\s+-\\s+.*\\n?)*)`, "m").exec(frontmatter);
  if (!match) return [];
  const listBody = match[1] ?? "";
  return [...listBody.matchAll(/^\s+-\s+(?:"([^"]+)"|'([^']+)'|(.*?))\s*$/gm)]
    .map((item) => item[1] ?? item[2] ?? item[3] ?? "")
    .filter(Boolean);
}

function parseScalar(frontmatter: string, field: string): string | null {
  const match = new RegExp(`^${field}:\\s*(.*)$`, "m").exec(frontmatter);
  if (!match || match[1] === "null") return null;
  return (match[1] ?? "").replace(/^(["'])(.*)\1$/, "$2");
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function splitMarkdown(content: string): { frontmatter: string; body: string } | null {
  const normalized = content.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) return null;
  const end = normalized.indexOf("\n---\n", 4);
  if (end < 0) return null;
  return { frontmatter: normalized.slice(4, end), body: normalized.slice(end + 6) };
}

function splitSections(body: string, title: string): Array<{ heading: string; text: string }> {
  const lines = body.split("\n");
  const sections: Array<{ heading: string; text: string }> = [];
  let heading = title;
  let content: string[] = [];
  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      if (content.join("\n").trim()) sections.push({ heading, text: content.join("\n").trim() });
      heading = match[1] ?? title;
      content = [];
      continue;
    }
    if (!/^#\s+/.test(line)) content.push(line);
  }
  if (content.join("\n").trim()) sections.push({ heading, text: content.join("\n").trim() });
  return sections;
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listMarkdownFiles(target)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(target);
  }
  return files.sort();
}

export async function buildKnowledgeIndex(root: string): Promise<KnowledgeIndex> {
  const chunks: KnowledgeChunk[] = [];
  for (const file of await listMarkdownFiles(root)) {
    const parsed = splitMarkdown(await readFile(file, "utf8"));
    if (!parsed) continue;
    const unitId = parseScalar(parsed.frontmatter, "id");
    const title = parseScalar(parsed.frontmatter, "title");
    if (!unitId || !title || parseScalar(parsed.frontmatter, "language") !== "en") continue;
    if (["meta", "requirements"].includes(parseScalar(parsed.frontmatter, "document_type") ?? ""))
      continue;
    const aliases = parseList(parsed.frontmatter, "aliases");
    const sourceRefs = parseList(parsed.frontmatter, "source_refs");
    const sections = splitSections(parsed.body, title);
    sections.forEach((section, index) => {
      chunks.push({
        chunkId: `${unitId}--${index + 1}-${slugify(section.heading)}`,
        unitId,
        title,
        text: `${title}\n${section.heading}\n${section.text}`,
        aliases,
        language: "en",
        sourceId: sourceRefs[0] ?? null,
        evidenceLevel: parseScalar(parsed.frontmatter, "evidence_level"),
      });
    });
  }
  return { root, chunks, version: "poc-kb-0.1" };
}

function tokenVariants(value: string): Set<string> {
  const tokens = value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const variants = new Set(tokens);
  const BulgarianConcepts: Record<string, string[]> = {
    бойлер: ["boiler", "water-heater"],
    връзка: ["connection", "joint"],
    гарнитура: ["gasket"],
    гайка: ["nut"],
    холендър: ["union"],
    пръстен: ["ring", "o-ring"],
    ринг: ["ring", "o-ring"],
    спира: ["seal", "stop"],
    теч: ["leak"],
    тече: ["leak"],
    тръба: ["pipe"],
    щуцер: ["spigot"],
  };
  for (const token of tokens) {
    for (const suffix of ["ът", "ят", "та", "то", "те", "ия", "а", "я"]) {
      if (token.length > suffix.length + 3 && token.endsWith(suffix))
        variants.add(token.slice(0, -suffix.length));
    }
  }
  for (const token of [...variants]) {
    if (BulgarianConcepts[token])
      for (const synonym of BulgarianConcepts[token]) variants.add(synonym);
  }
  return variants;
}

export function searchKnowledge(index: KnowledgeIndex, query: string, limit = 5): SearchResult[] {
  const queryTokens = tokenVariants(query);
  if (queryTokens.size === 0) return [];
  const phrase = query.toLocaleLowerCase().trim();
  const byUnit = new Map<string, SearchResult>();
  for (const chunk of index.chunks) {
    const contentTokens = tokenVariants(`${chunk.title} ${chunk.text} ${chunk.aliases.join(" ")}`);
    let score = 0;
    for (const token of queryTokens) if (contentTokens.has(token)) score += 1;
    if (
      phrase.length > 4 &&
      `${chunk.text} ${chunk.aliases.join(" ")}`.toLocaleLowerCase().includes(phrase)
    )
      score += 2;
    if (score === 0) continue;
    const existing = byUnit.get(chunk.unitId);
    if (!existing || score > existing.score) byUnit.set(chunk.unitId, { ...chunk, score });
  }
  const ranked = [...byUnit.values()]
    .filter((result) => queryTokens.size < 2 || result.score >= 2)
    .sort((left, right) => right.score - left.score || left.chunkId.localeCompare(right.chunkId));
  return ranked.slice(0, limit);
}
