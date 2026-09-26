import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateChatResponse } from "./chat.js";
import { createMockChatRuntime } from "./mock-runtime.js";
import { preTriage } from "./safety.js";

interface PilotPair {
  pair_id: string;
  bg: string;
  en: string;
  category: string;
  expected_class: string;
  expected_hazards: string[];
  review_status: string;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");

describe("development bilingual pilot", () => {
  it("replays 30 pairs through pre-triage and the mock project path", async () => {
    const lines = (
      await readFile(path.join(root, "evals/plumbing-assistant/poc-pilot.jsonl"), "utf8")
    )
      .trim()
      .split("\n");
    const pairs = lines.map((line) => JSON.parse(line) as PilotPair);
    expect(pairs).toHaveLength(30);
    expect(new Set(pairs.map((pair) => pair.review_status))).toEqual(new Set(["development"]));

    const runtime = createMockChatRuntime(path.join(root, "docs/kb"));
    for (const pair of pairs) {
      for (const [language, message] of [
        ["bg", pair.bg],
        ["en", pair.en],
      ] as const) {
        const safety = preTriage(message, language);
        if (pair.category === "critical") expect(safety.urgency).toBe("critical");
        if (pair.expected_hazards.length > 0)
          expect(safety.hazards).toEqual(expect.arrayContaining(pair.expected_hazards));
        if (safety.urgency === "routine")
          validateChatResponse(await runtime.respond({ language, message, history: [] }), language);
      }
    }
  });
});
