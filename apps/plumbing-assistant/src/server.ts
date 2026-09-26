import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App, type Language } from "./app.js";
import {
  ApiError,
  createUnavailableChatRuntime,
  parseChatRequest,
  type ChatRuntime,
} from "./chat.js";
import { parseConfig, type AppConfig } from "./config.js";
import { getServiceManifest, loadServicePage, renderServicePage } from "./service-pages.js";

export interface ServerDependencies {
  chatRuntime?: ChatRuntime;
  serviceRoot?: string;
}

function defaultServiceRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), "docs/service"),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../docs/service"),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../docs/service"),
  ];
  return (
    candidates.find((candidate) => existsSync(path.join(candidate, "public-pages.json"))) ??
    candidates[0] ??
    process.cwd()
  );
}

export function createServer(
  config: AppConfig = parseConfig(),
  dependencies: ServerDependencies = {},
): Express {
  const server = express();
  server.disable("x-powered-by");
  server.use(express.json({ limit: config.maxRequestBytes }));
  const chatRuntime = dependencies.chatRuntime ?? createUnavailableChatRuntime();
  const serviceRoot = dependencies.serviceRoot ?? defaultServiceRoot();

  server.get("/api/health", (_request, response) => {
    response.json({
      service: "plumbing-assistant",
      status: "ok",
      mode: "poc",
      environment: config.nodeEnv,
      providerMode: config.providerMode,
      maxProviderCallsPerRequest: config.maxProviderCallsPerRequest,
    });
  });

  server.post("/api/new-chat", (_request, response) => {
    response.status(201).json({ chatId: randomUUID() });
  });

  server.post("/api/chat", async (request, response, next) => {
    try {
      const chatRequest = parseChatRequest(request.body);
      const result = await chatRuntime.respond(chatRequest);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  server.get(["/", "/en"], (request, response) => {
    const language: Language = request.path === "/en" ? "en" : "bg";
    const body = renderToStaticMarkup(createElement(App, { language }));
    const title = language === "bg" ? "Plumbing Assistant — POC" : "Plumbing Assistant — POC";

    response.type("html").send(`<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body>${body}</body>
    </html>`);
  });

  server.get(
    [
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
    ],
    async (request, response, next) => {
      try {
        const [page, manifest] = await Promise.all([
          loadServicePage(serviceRoot, request.path),
          getServiceManifest(serviceRoot),
        ]);
        if (!page) {
          response.status(404).send("Not found");
          return;
        }
        const body = renderServicePage(page, manifest);
        response
          .type("html")
          .send(
            `<!doctype html><html lang="${page.language}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${page.title}</title></head><body>${body}</body></html>`,
          );
      } catch (error) {
        next(error);
      }
    },
  );

  server.use("/api", (_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "API route not found",
      },
    });
  });

  server.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      if (response.headersSent) {
        next(error);
        return;
      }

      const statusCode =
        error instanceof ApiError
          ? error.statusCode
          : typeof error === "object" && error !== null && "status" in error && error.status === 413
            ? 413
            : 500;
      const code =
        error instanceof ApiError
          ? error.code
          : statusCode === 413
            ? "REQUEST_TOO_LARGE"
            : "INTERNAL_ERROR";
      const message =
        error instanceof ApiError
          ? error.message
          : statusCode === 413
            ? "Request body is too large"
            : "Internal server error";
      response.status(statusCode).json({
        error: {
          code,
          message,
        },
      });
    },
  );

  return server;
}

const entrypoint = process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false;

if (entrypoint) {
  const config = parseConfig();
  createServer(config).listen(config.port, () => {
    console.log(`Plumbing Assistant POC listening on http://localhost:${config.port}`);
  });
}
