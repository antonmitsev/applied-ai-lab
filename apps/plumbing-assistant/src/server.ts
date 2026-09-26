import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App, type Language } from "./app.js";
import { parseConfig, type AppConfig } from "./config.js";

export function createServer(config: AppConfig = parseConfig()): Express {
  const server = express();
  server.disable("x-powered-by");
  server.use(express.json({ limit: config.maxRequestBytes }));

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
        typeof error === "object" && error !== null && "status" in error && error.status === 413
          ? 413
          : 500;
      response.status(statusCode).json({
        error: {
          code: statusCode === 413 ? "REQUEST_TOO_LARGE" : "INTERNAL_ERROR",
          message: statusCode === 413 ? "Request body is too large" : "Internal server error",
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
