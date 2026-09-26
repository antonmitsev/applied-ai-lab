import { EventEmitter } from "node:events";
import { createRequest, createResponse } from "node-mocks-http";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server.js";

async function invoke(path: string) {
  const request = createRequest({ method: "GET", url: path });
  const response = createResponse({ eventEmitter: EventEmitter });
  const ended = new Promise<void>((resolve) => response.once("end", resolve));

  createServer()(request, response);
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
    });
  });

  it("renders both SSR landing routes", async () => {
    const [bgResponse, enResponse] = await Promise.all([invoke("/"), invoke("/en")]);

    expect(bgResponse.statusCode).toBe(200);
    expect(enResponse.statusCode).toBe(200);
    expect(bgResponse._getData()).toContain('lang="bg"');
    expect(enResponse._getData()).toContain('lang="en"');
  });
});
