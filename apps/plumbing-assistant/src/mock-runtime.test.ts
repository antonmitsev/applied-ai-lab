import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateChatResponse } from "./chat.js";
import { createMockChatRuntime } from "./mock-runtime.js";

const kbRoot = path.resolve(process.cwd(), "../../docs/kb");

describe("mock chat runtime", () => {
  it("answers from local retrieval without a provider key", async () => {
    const response = validateChatResponse(
      await createMockChatRuntime(kbRoot).respond({
        language: "en",
        message: "How does a threaded plumbing connection seal?",
        history: [],
      }),
      "en",
    );

    expect(response).toMatchObject({ language: "en", responseClass: "informational" });
    expect(response.citations.length).toBeGreaterThan(0);
  });
});
