import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./app.js";

describe("POC landing shell", () => {
  it("renders the Bulgarian AI notice", () => {
    const markup = renderToStaticMarkup(<App language="bg" />);

    expect(markup).toContain("Разговаряте с AI помощник");
    expect(markup).toContain('lang="bg"');
    expect(markup).toContain('href="/en"');
    expect(markup).toContain('id="chat-form"');
    expect(markup).toContain("Изпрати");
  });

  it("renders the English AI notice", () => {
    const markup = renderToStaticMarkup(<App language="en" />);

    expect(markup).toContain("You are interacting with an AI assistant");
    expect(markup).toContain('lang="en"');
    expect(markup).toContain('href="/"');
    expect(markup).toContain('id="chat-form"');
    expect(markup).toContain("Send");
  });
});
