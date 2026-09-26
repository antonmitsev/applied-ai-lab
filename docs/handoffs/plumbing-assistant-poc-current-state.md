# Plumbing Assistant — POC Current-State Checkpoint

| Field | Value |
| --- | --- |
| Checkpoint date | 2026-09-26 |
| Branch | `main` |
| Last pushed commit | `db6fdfc` |
| POC status | Local, internal-only POC complete; no public release |
| Default runtime | `MOCK_PROVIDER=true` |
| Resume authority | This file, then the POC task board |

## What exists now

The repository contains a runnable local end-to-end Plumbing Assistant POC:

```text
SSR landing/legal pages
        ↓
Express API boundary
        ↓
server-owned safety pre-triage
        ↓
local Markdown KB → deterministic lexical retrieval
        ↓
mock runtime with citations or external-call dry-run preview
```

### Application behavior

- `GET /` serves the Bulgarian landing page; `GET /en` serves English.
- Terms, Privacy, Cookies, Safety, and Sources have ten bilingual SSR routes.
- Navigation is full-document server routing. There is no React hydration or
  SPA router; inline JavaScript only calls `/api/chat` and `/api/new-chat`.
- `POST /api/chat` validates the request, runs the server-owned safety gate, and
  returns a validated response shape.
- Routine questions with local evidence receive a deterministic mock answer and
  citations.
- Routine questions without local evidence receive a dry-run preview such as
  `call ai-app({...})`; no AI provider is called.
- Critical/caution safety cases bypass the runtime and return the fixed safety
  response.

### Interface and content

- Local dependency-free styling uses pastel green surfaces and a burgundy
  heading accent (`#7b3047`).
- Landing `h1` is `2.85rem`, mobile `2.25rem`, and document `h1` is `2.5rem`.
- Service Markdown rendering supports headings, lists, inline code, bold,
  links, and GFM-style tables with alignment.
- The personal email address was removed from the public landing and service
  pages. The final contact channel is intentionally pending before release.

## How to run it

From the repository root:

```bash
docker compose up -d --build plumbing-assistant
```

Open:

- <http://127.0.0.1:3000>
- <http://127.0.0.1:3000/en>
- <http://127.0.0.1:3000/en/terms>
- <http://127.0.0.1:3000/api/health>

Use `docker compose up -d --build` after source changes. A plain
`docker container restart ...` only restarts the existing image and does not
compile or include new code.

Stop the local POC with:

```bash
docker compose down
```

## Verified at this checkpoint

- `npm run validate` passes repository, KB, source-manifest, and safety checks;
- app typecheck, lint, format, build, 18 unit tests, and 13 integration tests
  pass;
- Docker image builds and the local container starts on loopback;
- legal pages render actual `<table>`, `<thead>`, `<th>`, `<tbody>`, and `<td>`
  elements;
- an unknown local query returns the `call ai-app({...})` dry-run preview;
- no provider key, public traffic, or paid provider call is used.

## What remains blocked

The next controlled product decision is `POC-110`: provider/model, data
processing, budget, source approval, and explicit authority for a live call.
Do not enable a real provider, ingest unapproved source bodies, or publish the
service until that decision and the applicable release evidence exist.

## Easy new-session prompt

Paste this in a new session:

> Работим по Plumbing Assistant POC. Прочети
> `docs/handoffs/plumbing-assistant-poc-current-state.md` и
> `docs/planning/plumbing-assistant-poc-plan.md`. Продължи от последния
> checkpoint, без да повтаряш готовото. Първо покажи текущия статус, после
> изпълни следващата безопасна стъпка.
