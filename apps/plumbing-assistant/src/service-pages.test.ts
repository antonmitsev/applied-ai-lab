import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./service-pages.js";

describe("service Markdown renderer", () => {
  it("renders GFM-style tables with alignment and inline Markdown", () => {
    const html = renderMarkdown(
      "| Field | Value |\n| :--- | ---: |\n| **Status** | `draft` |\n| Contact | [Email](mailto:test@example.com) |",
      "en",
      [],
    );

    expect(html).toContain('<table><thead><tr><th scope="col" align="left">Field</th>');
    expect(html).toContain('<th scope="col" align="right">Value</th>');
    expect(html).toContain("<strong>Status</strong>");
    expect(html).toContain("<code>draft</code>");
    expect(html).toContain('href="mailto:test@example.com"');
    expect(html).toContain("</tbody></table></div>");
  });

  it("does not treat an ordinary pipe paragraph as a table", () => {
    const html = renderMarkdown("A | B", "en", []);

    expect(html).toBe("<p>A | B</p>");
  });
});
