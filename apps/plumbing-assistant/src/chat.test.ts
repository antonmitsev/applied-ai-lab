import { describe, expect, it } from "vitest";
import { ApiError, createUnavailableChatRuntime, parseChatRequest } from "./chat.js";

describe("chat request boundary", () => {
  it("accepts bounded bilingual text history", () => {
    expect(parseChatRequest({ language: "bg", message: "Тече от връзката", history: [] })).toEqual({
      language: "bg",
      message: "Тече от връзката",
      history: [],
    });
  });

  it("rejects invalid and overlong input", () => {
    expect(() => parseChatRequest({ language: "de", message: "hello" })).toThrow(ApiError);
    expect(() => parseChatRequest({ language: "en", message: "" })).toThrow(ApiError);
    expect(() =>
      parseChatRequest({ language: "en", message: "x", history: new Array(13).fill({}) }),
    ).toThrow("at most 12 turns");
  });

  it("has an explicit unavailable default runtime", async () => {
    await expect(
      createUnavailableChatRuntime().respond({ language: "en", message: "hello", history: [] }),
    ).rejects.toMatchObject({
      statusCode: 503,
      code: "PROVIDER_NOT_CONFIGURED",
    });
  });
});
