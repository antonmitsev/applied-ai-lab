import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { App, type Language } from "./app.js";

export function createServer(): Express {
  const server = express();
  server.disable("x-powered-by");

  server.get("/api/health", (_request, response) => {
    response.json({
      service: "plumbing-assistant",
      status: "ok",
      mode: "poc",
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

  return server;
}

function getPort(): number {
  const rawPort = process.env.PORT ?? "3000";
  const port = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

const entrypoint = process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false;

if (entrypoint) {
  const port = getPort();
  createServer().listen(port, () => {
    console.log(`Plumbing Assistant POC listening on http://localhost:${port}`);
  });
}
