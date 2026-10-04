# Plumbing Assistant — POC Current-State Checkpoint

| Field | Value |
| --- | --- |
| Checkpoint date | 2026-10-04 |
| Branch | `main` |
| Last implementation commit | `df30fd0` |
| Handoff basis | Source-backed radiator batch at `df30fd0` |
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
- The local development index includes all 16 eligible repository-owned
  knowledge units as 193 heading-based chunks and exposes a reproducible
  content fingerprint/receipt.
- Five new radiator units cover cold-top, cold-bottom, gurgling,
  completely-cold, and bleeding paths. They paraphrase six official source
  pages/documents and retain source IDs and locators; no third-party source body
  is stored or uploaded.
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
- `npm run index:development --workspace=@applied-ai-lab/plumbing-assistant`
  emits build `idx_local_1dcdcb4aff8bd991` for the complete
  16-document/193-chunk corpus without network access;
- the development baseline contains 28 validated KB Markdown files, 30
  bilingual retrieval cases, and 9 metadata-only source records;
- app typecheck, lint, format, build, 18 unit tests, and 13 integration tests
  pass;
- Docker build/start remain verified by the preceding application checkpoint;
  they were not rerun for this content/index-only batch;
- legal pages render actual `<table>`, `<thead>`, `<th>`, `<tbody>`, and `<td>`
  elements;
- an unknown local query returns the `call ai-app({...})` dry-run preview;
- no provider key, public traffic, or paid provider call is used.

## What remains blocked

The next controlled product decisions are qualified technical/applicability
review of the five new radiator units and `POC-110`: provider/model, data
processing, budget, and explicit authority for a live call. Do not enable a
real provider, ingest unapproved source bodies, or publish the service until
the applicable approval and release evidence exist.

## Easy new-session prompt

Paste this in a new session:

> Работим по Plumbing Assistant POC. Прочети
> `docs/handoffs/plumbing-assistant-poc-current-state.md` и
> `docs/planning/plumbing-assistant-poc-plan.md`. Продължи от последния
> checkpoint, без да повтаряш готовото. Първо покажи текущия статус, после
> изпълни следващата безопасна стъпка.
