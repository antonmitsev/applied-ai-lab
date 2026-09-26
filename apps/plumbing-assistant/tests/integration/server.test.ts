import { EventEmitter } from "node:events";
import nodePath from "node:path";
import { createRequest, createResponse, type RequestOptions } from "node-mocks-http";
import { describe, expect, it } from "vitest";
import { parseConfig } from "../../src/config.js";
import { createServer } from "../../src/server.js";

const testConfig = parseConfig({ NODE_ENV: "test" });

async function invoke(path: string, options: Pick<RequestOptions, "method" | "body"> = {}) {
  const requestOptions: RequestOptions = { method: options.method ?? "GET", url: path };
  if (options.body !== undefined) requestOptions.body = options.body;
  const request = createRequest(requestOptions);
  const response = createResponse({ eventEmitter: EventEmitter });
  const ended = new Promise<void>((resolve) => response.once("end", resolve));

  createServer(testConfig, { serviceRoot: nodePath.resolve("../../docs/service") })(
    request,
    response,
  );
  await ended;
  return response;
}

describe("POC HTTP boundary", () => {
  it("returns a content-free health response", async () => {
    const response = await invoke("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData()).toEqual({
      service: "plumbing-assistant",
      status: "ok",
      mode: "poc",
      environment: "test",
      providerMode: "mock",
      maxProviderCallsPerRequest: 1,
    });
  });

  it("returns a stable JSON error for unknown API routes", async () => {
    const response = await invoke("/api/missing");

    expect(response.statusCode).toBe(404);
    expect(response._getJSONData()).toEqual({
      error: { code: "NOT_FOUND", message: "API route not found" },
    });
  });

  it("creates a server-owned chat identifier", async () => {
    const response = await invoke("/api/new-chat", { method: "POST" });

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData().chatId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("rejects a chat request without a JSON payload before any provider call", async () => {
    const response = await invoke("/api/chat", { method: "POST" });

    expect(response.statusCode).toBe(400);
    expect(response._getJSONData()).toEqual({
      error: { code: "INVALID_REQUEST", message: "language must be bg or en" },
    });
  });

  it("returns a server-owned critical safety response before the runtime", async () => {
    const response = await invoke("/api/chat", {
      method: "POST",
      body: { language: "en", message: "There is water near electricity and sparks." },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData()).toMatchObject({
      language: "en",
      responseClass: "stop-and-escalate",
      citations: [],
    });
  });

  it("uses the default mock runtime for a routine request", async () => {
    const response = await invoke("/api/chat", {
      method: "POST",
      body: { language: "en", message: "How does a threaded plumbing connection seal?" },
    });

    expect(response.statusCode).toBe(200);
    expect(response._getJSONData()).toMatchObject({
      language: "en",
      responseClass: "informational",
    });
    expect(response._getJSONData().citations.length).toBeGreaterThan(0);
  });

  it("renders both SSR landing routes", async () => {
    const [bgResponse, enResponse] = await Promise.all([invoke("/"), invoke("/en")]);

    expect(bgResponse.statusCode).toBe(200);
    expect(enResponse.statusCode).toBe(200);
    expect(bgResponse._getData()).toContain('lang="bg"');
    expect(enResponse._getData()).toContain('lang="en"');
  });

  it("renders all bilingual legal pages from service source copies", async () => {
    for (const route of [
      "/terms",
      "/privacy",
      "/cookies",
      "/safety",
      "/sources",
      "/en/terms",
      "/en/privacy",
      "/en/cookies",
      "/en/safety",
      "/en/sources",
    ]) {
      const response = await invoke(route);
      expect(response.statusCode, route).toBe(200);
      expect(response._getData(), route).toContain("<article>");
    }
  });
});

describe("configuration boundary", () => {
  it("rejects invalid ports and boolean provider flags", () => {
    expect(() => parseConfig({ PORT: "0" })).toThrow("PORT must be an integer");
    expect(() => parseConfig({ MOCK_PROVIDER: "yes" })).toThrow(
      "MOCK_PROVIDER must be true or false",
    );
  });

  it("allows explicit external mode without exposing credentials", () => {
    expect(parseConfig({ MOCK_PROVIDER: "false", NODE_ENV: "production" })).toMatchObject({
      nodeEnv: "production",
      providerMode: "external",
    });
  });
});
