import { readFile } from "node:fs/promises";
import path from "node:path";

interface PageVariant {
  route: string;
  source: string;
  title: string;
}

interface PageDocument {
  id: string;
  bg: PageVariant;
  en: PageVariant;
}

interface PageManifest {
  landing_routes: { bg: string; en: string };
  documents: PageDocument[];
}

export interface ServicePage {
  id: string;
  language: "bg" | "en";
  route: string;
  title: string;
  markdown: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value: string, language: "bg" | "en", documents: PageDocument[]): string {
  let html = escapeHtml(value)
    .replaceAll(/`([^`]+)`/g, "<code>$1</code>")
    .replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, target: string) => {
    const linkedPage = documents.find((document) => target === document[language].source);
    const href = linkedPage?.[language].route ?? target;
    const safeHref = /^(?:https:\/\/|mailto:|\/)/.test(href) ? href : "#";
    return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
  });
  return html;
}

export function renderMarkdown(
  markdown: string,
  language: "bg" | "en",
  documents: PageDocument[],
): string {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const output: string[] = [];
  let listOpen = false;
  for (const line of lines) {
    if (!line.trim()) {
      if (listOpen) {
        output.push("</ul>");
        listOpen = false;
      }
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      if (listOpen) {
        output.push("</ul>");
        listOpen = false;
      }
      const level = heading[1]?.length ?? 1;
      output.push(
        `<h${level}>${inlineMarkdown(heading[2] ?? "", language, documents)}</h${level}>`,
      );
      continue;
    }
    const item = /^[-*]\s+(.+)$/.exec(line);
    if (item) {
      if (!listOpen) {
        output.push("<ul>");
        listOpen = true;
      }
      output.push(`<li>${inlineMarkdown(item[1] ?? "", language, documents)}</li>`);
      continue;
    }
    if (listOpen) {
      output.push("</ul>");
      listOpen = false;
    }
    output.push(`<p>${inlineMarkdown(line, language, documents)}</p>`);
  }
  if (listOpen) output.push("</ul>");
  return output.join("\n");
}

export async function loadServicePage(root: string, route: string): Promise<ServicePage | null> {
  const manifest = JSON.parse(
    await readFile(path.join(root, "public-pages.json"), "utf8"),
  ) as PageManifest;
  for (const document of manifest.documents) {
    for (const language of ["bg", "en"] as const) {
      const page = document[language];
      if (page.route !== route) continue;
      const markdown = await readFile(path.join(root, page.source), "utf8");
      return { id: document.id, language, route, title: page.title, markdown };
    }
  }
  return null;
}

export async function getServiceManifest(root: string): Promise<PageManifest> {
  return JSON.parse(await readFile(path.join(root, "public-pages.json"), "utf8")) as PageManifest;
}

export function renderServicePage(page: ServicePage, manifest: PageManifest): string {
  const alternateLanguage = page.language === "bg" ? "en" : "bg";
  const alternate = manifest.documents.find((document) => document.id === page.id)?.[
    alternateLanguage
  ];
  const home = page.language === "bg" ? manifest.landing_routes.bg : manifest.landing_routes.en;
  const body = renderMarkdown(page.markdown, page.language, manifest.documents);
  return `<main class="document-shell" lang="${page.language}"><nav class="site-header"><a class="brand" href="${home}"><span class="brand-mark" aria-hidden="true">⌁</span>Plumbing Assistant</a><a class="language-switcher" href="${alternate?.route ?? home}">${alternateLanguage.toUpperCase()}</a></nav><article>${body}</article></main>`;
}
