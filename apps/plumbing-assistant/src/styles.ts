export const siteStyles = `
:root {
  color-scheme: light;
  --ink: #19352b;
  --muted: #5f7469;
  --line: #d5e4da;
  --surface: #ffffff;
  --surface-soft: #f1f8f3;
  --mint: #dff2e5;
  --mint-strong: #b9dfc5;
  --green: #2f7654;
  --green-dark: #22563e;
  --accent: #7b3047;
  --shadow: 0 18px 50px rgba(40, 91, 62, 0.11);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }

html { background: #edf7ef; }

body {
  margin: 0;
  min-width: 320px;
  color: var(--ink);
  background:
    radial-gradient(circle at 80% 0%, rgba(185, 223, 197, 0.5), transparent 32rem),
    linear-gradient(180deg, #f5fbf6 0%, #edf7ef 100%);
  line-height: 1.6;
}

a { color: var(--green-dark); text-underline-offset: 0.18em; }
a:hover { color: var(--green); }

button, textarea { font: inherit; }

.site-shell,
.document-shell {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--ink);
  font-weight: 750;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: 0.8rem;
  color: var(--green-dark);
  background: var(--mint-strong);
  box-shadow: inset 0 0 0 1px rgba(47, 118, 84, 0.12);
}

.language-switcher {
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  font-weight: 750;
  text-decoration: none;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;
  padding: clamp(2rem, 7vw, 6rem) 0 4rem;
}

.eyebrow {
  margin: 0 0 0.9rem;
  color: var(--green);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 12ch;
  margin: 0;
  color: var(--accent);
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 0.99;
  letter-spacing: -0.065em;
}

.hero-description {
  max-width: 54ch;
  margin: 1.35rem 0 0;
  color: var(--muted);
  font-size: 1.08rem;
}

.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.trust-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: var(--mint);
  color: var(--green-dark);
  font-size: 0.82rem;
  font-weight: 700;
}

.status-pill::before {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 50%;
  background: #4d9a68;
  content: "";
}

.chat-card {
  padding: clamp(1.2rem, 3vw, 1.75rem);
  border: 1px solid rgba(185, 223, 197, 0.95);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow);
}

.chat-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.chat-card h2 {
  margin: 0;
  color: var(--accent);
  font-size: 1.3rem;
  letter-spacing: -0.025em;
}

.chat-card-header p {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.chat-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 750;
}

.chat-form textarea {
  display: block;
  width: 100%;
  min-height: 9.5rem;
  resize: vertical;
  padding: 0.9rem 1rem;
  border: 1px solid var(--line);
  border-radius: 0.85rem;
  color: var(--ink);
  background: #fbfefc;
}

.chat-form textarea:focus {
  border-color: var(--green);
  outline: 3px solid rgba(47, 118, 84, 0.15);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.8rem;
}

.button {
  min-height: 2.7rem;
  padding: 0.55rem 1rem;
  border: 1px solid var(--green);
  border-radius: 0.7rem;
  cursor: pointer;
  font-weight: 750;
}

.button-primary { color: #fff; background: var(--green); }
.button-primary:hover { background: var(--green-dark); }
.button-secondary { color: var(--green-dark); background: transparent; border-color: var(--line); }
.button-secondary:hover { background: var(--surface-soft); }
.button:focus-visible { outline: 3px solid rgba(47, 118, 84, 0.25); outline-offset: 2px; }

.ai-notice {
  margin: 1.1rem 0 0;
  padding: 0.75rem 0.85rem;
  border-radius: 0.7rem;
  color: #496257;
  background: var(--surface-soft);
  font-size: 0.8rem;
}

.response-panel {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.85rem;
  background: #fbfefc;
}

.response-panel p { margin: 0; white-space: pre-wrap; }
.response-panel ol { margin: 0.75rem 0 0; padding-left: 1.25rem; color: var(--muted); font-size: 0.82rem; }

.site-nav,
.site-footer {
  padding: 1.3rem 0;
  color: var(--muted);
  font-size: 0.86rem;
}

.site-nav { border-top: 1px solid var(--line); }
.site-nav a { margin-right: 0.85rem; }
.site-footer { display: flex; flex-wrap: wrap; gap: 0.6rem 1rem; justify-content: space-between; border-top: 1px solid var(--line); }

.document-shell { padding-bottom: 3rem; }
.document-shell article {
  max-width: 780px;
  margin: 2rem auto 0;
  padding: clamp(1.4rem, 4vw, 3rem);
  border: 1px solid var(--line);
  border-radius: 1.2rem;
  background: var(--surface);
  box-shadow: var(--shadow);
}
.document-shell article h1,
.document-shell article h2,
.document-shell article h3 { line-height: 1.15; letter-spacing: -0.035em; }
.document-shell article h1,
.document-shell article h2,
.document-shell article h3 { color: var(--accent); }
.document-shell article h1 { font-size: clamp(2rem, 5vw, 3.2rem); }
.document-shell article h2 { margin-top: 2rem; }
.document-shell article p { color: #40584b; }
.document-shell article li { margin: 0.4rem 0; color: #40584b; }
.document-shell code { padding: 0.12rem 0.3rem; border-radius: 0.3rem; background: var(--surface-soft); }
.table-wrap { overflow-x: auto; margin: 1.35rem 0; border: 1px solid var(--line); border-radius: 0.75rem; }
.document-shell table { width: 100%; min-width: 620px; border-collapse: collapse; font-size: 0.9rem; }
.document-shell th,
.document-shell td { padding: 0.75rem 0.85rem; border-bottom: 1px solid var(--line); vertical-align: top; text-align: left; }
.document-shell th { color: var(--green-dark); background: var(--surface-soft); font-size: 0.8rem; letter-spacing: 0.02em; }
.document-shell tr:last-child td { border-bottom: 0; }
.document-shell td p { margin: 0; }

@media (max-width: 760px) {
  .hero { grid-template-columns: 1fr; padding-top: 2rem; }
  .hero h1 { max-width: 15ch; }
  .chat-card { order: -1; }
  .site-footer { display: block; }
  .site-footer > * { display: inline-block; margin: 0.25rem 0.75rem 0.25rem 0; }
}
`;
