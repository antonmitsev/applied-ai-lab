# ADR-0005 — POC Stack and Local Topology

| Field | Value |
| --- | --- |
| Decision ID | `ADR-0005` |
| Status | Accepted for the internal POC only |
| Date | 2026-09-26 |
| Owner | Anton Mitsev |
| Revisit | Before public deployment or a second application |

## Decision

The first Plumbing Assistant POC uses:

- Node.js 22;
- TypeScript with strict compiler settings;
- Express as the trusted HTTP server boundary;
- React and `react-dom/server` for the small server-rendered UI shell;
- Vitest for deterministic unit and integration tests;
- ESLint and Prettier for static and formatting checks;
- a mock provider by default, with a later explicit real-provider adapter;
- one application workspace under `apps/plumbing-assistant/`.

The initial POC does not commit to a production hosting topology, external
database, vector store, image pipeline, live web retrieval, or model choice.

## Why

This stack is small enough to run locally and in one future container while
preserving the accepted boundary between browser, trusted Node.js server,
retrieval, safety, and provider adapters. React SSR keeps the POC compatible
with the accepted service-page and no-JavaScript direction without requiring a
full production framework decision yet.

## Local topology

```text
Browser
  │
  ▼
Express + React SSR
  ├─ public route shell
  ├─ health endpoint
  ├─ future safety boundary
  ├─ future retrieval adapter
  └─ future provider adapter
```

Docker Compose is a packaging and reproducibility task (`POC-020`), not a
requirement of this scaffold. The default application mode must not require
credentials, network access, or paid provider calls.

## Non-goals

- This ADR does not mark the application production-ready.
- It does not approve public deployment or live user data.
- It does not select an OpenAI model, hosting provider, or production database.
- It does not weaken safety, privacy, source-governance, or release gates.

