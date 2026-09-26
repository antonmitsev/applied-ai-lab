# Plumbing Assistant — POC Task Plan

This is the working task board for the first end-to-end proof of concept. It
is intentionally smaller than the full public-MVP implementation plan.

The POC must prove one thing:

> A small, safe, source-grounded plumbing assistant is more useful and more
> reliable for the target questions than a direct general ChatGPT conversation.

## Status legend

- `done` — deliverables exist and the Definition of Done is evidenced;
- `in_progress` — the task is actively being worked on;
- `ready` — dependencies are satisfied and this is a valid next task;
- `planned` — not started and waiting for dependencies or sequencing;
- `blocked` — cannot proceed without a documented external decision or change.

Only one task should normally be `in_progress`. Keep the next task as `ready`
so work can resume without reconstructing context.

## Current checkpoint

| Field | Value |
| --- | --- |
| POC status | Implementation in progress |
| Current task | `POC-090` — `in_progress` |
| Next action | Add a deterministic mock provider backed by bounded local retrieval |
| Last completed task | `POC-080` |
| Last validated commit | This checkpoint; see `git log -1` |
| Repository baseline | `npm run validate` passes |
| Runtime provider | Mock by default; real provider explicitly opt-in |
| Public traffic | Disabled; internal/local POC only |

## Task board

| ID | Task | Status | Depends on |
| --- | --- | --- | --- |
| `POC-000` | POC scope, acceptance criteria, and task board | `done` | — |
| `POC-010` | Stack decision and application scaffold | `done` | `POC-000` |
| `POC-020` | Docker Compose development environment | `done` | `POC-010` |
| `POC-030` | Configuration, health endpoint, and error model | `done` | `POC-010` |
| `POC-040` | Source-backed pilot batch | `done` | `POC-000` |
| `POC-050` | Local KB extraction, chunking, and lexical index | `done` | `POC-040` |
| `POC-060` | Express chat API boundary | `done` | `POC-030`, `POC-050` |
| `POC-070` | Landing page and bilingual legal routes | `done` | `POC-030` |
| `POC-080` | Deterministic safety pre-triage and response validation | `done` | `POC-030` |
| `POC-090` | Mock model/provider adapter | `in_progress` | `POC-030`, `POC-080` |
| `POC-100` | Text-only bilingual chat UI | `planned` | `POC-060`, `POC-070`, `POC-090` |
| `POC-110` | Optional real OpenAI adapter | `planned` | `POC-090`, `POC-100` |
| `POC-120` | Thirty-pair bilingual pilot and baseline runner | `planned` | `POC-040`, `POC-100` |
| `POC-130` | Integration, browser, failure-path, and Docker tests | `planned` | `POC-020`, `POC-060`, `POC-100`, `POC-120` |
| `POC-140` | POC report and continue/change/stop decision | `planned` | `POC-110`, `POC-120`, `POC-130` |

## Task definitions

### POC-000 — POC scope, acceptance criteria, and task board

Status: `done`

Deliverables:

- this task board;
- [staged testing plan](../evaluation/plumbing-assistant-testing-plan.md);
- current draft KB and requirements baseline;
- explicit internal-only POC boundary.

Definition of Done:

- the next task is unambiguous;
- every later task has a dependency and a testable outcome;
- public traffic, live web retrieval, and uncontrolled paid calls are excluded.

### POC-010 — Stack decision and application scaffold

Status: `done`

Scope alignment: this is the POC slice of `PA-IMP-000`, covering `FR-22`,
`AC-95–AC-101`, and audit control `IMP-010`. It does not claim that the full
repository-quality or public-release requirements are complete.

Recommended initial choice:

- Node.js 22;
- TypeScript;
- Express;
- React server-rendered or a deliberately thin server-rendered UI boundary;
- one workspace under `apps/plumbing-assistant/`;
- adapter interfaces for provider, retrieval, safety, and persistence.

Deliverables:

- recorded stack decision/ADR;
- application package and entry point;
- development and test commands;
- no live provider call;
- a minimal page or health response proving the process starts.

Definition of Done:

- the app builds and starts locally;
- strict type/lint/test commands exist;
- `npm run validate` still passes;
- the chosen boundaries do not require changing the accepted safety or privacy
  design.

Evidence:

- decision: [ADR-0005](../decisions/0005-poc-stack-and-local-topology.md);
- workspace: `apps/plumbing-assistant/`;
- SSR shell: `src/app.tsx` and `src/server.ts`;
- unit tests: `src/app.test.tsx`;
- integration tests: `tests/integration/server.test.ts`;
- package checks: `typecheck`, `lint`, `format:check`, `test:unit`,
  `test:integration`, and `build`;
- dependency audit: `npm audit --omit=optional` reports zero vulnerabilities.

Known limitations carried to later tasks:

- no chat endpoint or provider call;
- no KB retrieval or source-backed index;
- no legal-page renderer or full landing experience;
- no public traffic or deployment.

### POC-020 — Docker Compose development environment

Status: `done`

Deliverables:

- `Dockerfile` for the app;
- `compose.yaml` with one app service and a loopback-only published port;
- safe default environment with `MOCK_PROVIDER=true`;
- healthcheck and documented start/stop commands;
- no secrets committed to the repository.

Definition of Done:

- a new machine can build and start the POC with one documented Compose command;
- the image builds the application and runs the production-shaped runtime;
- no network or provider credential is required for the default mode.

Evidence:

- `.dockerignore` excludes secrets, dependencies, build output, and VCS data;
- `apps/plumbing-assistant/Dockerfile` uses a Node 22 multi-stage build and a
  non-root runtime user;
- `compose.yaml` binds only to `127.0.0.1`, enables `MOCK_PROVIDER=true`, and
  defines an HTTP healthcheck;
- `docker compose config --quiet` passes;
- `docker compose build plumbing-assistant` passes and reports zero image-build
  dependency vulnerabilities.

Known limitation: the Compose file is intentionally for local development and
does not define persistence, reverse proxying, TLS, or public deployment.

### POC-030 — Configuration, health endpoint, and error model

Status: `done`

Deliverables:

- typed environment/configuration parsing;
- `GET /api/health`;
- consistent JSON error shape;
- development versus provider-enabled mode;
- explicit maximum request size and call budget.

Definition of Done:

- missing or invalid configuration fails clearly;
- health output does not expose secrets;
- provider calls are impossible in default mock mode;
- unit tests cover invalid configuration and provider failure.

Evidence:

- `apps/plumbing-assistant/src/config.ts` parses the port, environment, provider
  mode, request-size limit, and per-request provider-call budget;
- `apps/plumbing-assistant/src/server.ts` exposes safe health metadata, a stable
  API 404 shape, and bounded JSON parsing;
- integration tests cover invalid configuration, health output, SSR routes, and
  the API error boundary;
- workspace typecheck, lint, formatting, integration tests, and build pass.

Known limitation: provider failure handling is exercised by the provider
adapter task, because no provider adapter exists yet.

### POC-040 — Source-backed pilot batch

Status: `done` (development registration checkpoint)

Deliverables:

- three provenance-complete candidate source records;
- rights, scope, URL, version, and review metadata fields populated without
  inventing approval evidence;
- a source registry validator that fails closed for malformed records and never
  permits non-approved records into an index.

Definition of Done:

- candidate records validate against the pinned source schema;
- all three records are explicitly `in_review`, have pending rights decisions,
  and are excluded from indexing;
- the pilot boundary states that production source approval is still pending.

Evidence:

- `sources/plumbing-assistant/manifest.json` contains three official GB
  candidate records with canonical HTTPS URLs and explicit pending review and
  rights state;
- `scripts/validate-source-manifest.mjs` validates the manifest and enforces
  the approved-for-index lifecycle invariant;
- `npm run validate` includes the source-manifest check.

Known limitation: these records are not approved for production retrieval. The
POC may use the existing repository draft KB as a development corpus, but it
must not present that corpus as an approved external source index.

### POC-050 — Local KB extraction, chunking, and lexical index

Status: `done` (development corpus checkpoint)

Deliverables:

- deterministic Markdown extraction;
- stable unit/chunk IDs;
- local lexical/full-text index;
- retrieval adapter interface that can later support a vector store;
- returned metadata for title, unit ID, source ID, and evidence level.

Definition of Done:

- the current retrieval cases run against the local index;
- expected units are returned for symptom, connection, seal, and alias queries;
- unrelated and missing-evidence cases fail closed or request clarification;
- the index build is reproducible from a pinned input set.

Evidence:

- `apps/plumbing-assistant/src/kb.ts` extracts English content units, skips
  `meta` and `requirements` documents, creates stable section chunk IDs, and
  returns unit/title/source/evidence metadata;
- lexical search supports Bulgarian suffix variants and a small explicit
  Bulgarian-to-English plumbing vocabulary bridge;
- `src/kb.test.ts` covers deterministic indexing, Bulgarian retrieval, and
  empty/unknown fail-closed behavior;
- `src/kb.retrieval.test.ts` runs all 20 current retrieval cases against the
  local index and verifies every expected ID that exists in the corpus is
  returned within the bounded result set.

Known limitation: the evaluation set intentionally names future units that are
not yet present in `docs/kb`; the test records this as an explicit coverage gap
instead of fabricating chunks. This is development retrieval only, not an
approved source-backed production index.

### POC-060 — Express chat API boundary

Status: `done` (provider-neutral boundary)

Deliverables:

- `POST /api/chat`;
- `POST /api/new-chat`;
- request and response schemas;
- bounded text history for the POC;
- retrieval and provider adapter calls through server-owned code.

Definition of Done:

- invalid input never reaches the provider;
- response shape is validated before rendering;
- provider credentials never reach the browser;
- timeout, empty result, and provider failure paths are tested.

Evidence:

- `apps/plumbing-assistant/src/chat.ts` defines bounded bilingual requests,
  response/citation types, typed validation, and an explicit unavailable runtime;
- `src/server.ts` exposes `POST /api/new-chat` and `POST /api/chat` through
  server-owned code and maps validation/provider failures to the stable error
  shape;
- unit tests cover invalid language, empty messages, history limits, and the
  unavailable runtime;
- integration tests cover server-owned chat IDs and validation before provider
  execution.

Known limitation: the default chat runtime intentionally returns
`PROVIDER_NOT_CONFIGURED` until the deterministic mock adapter task is complete.

### POC-070 — Landing page and bilingual legal routes

Status: `done` (SSR content checkpoint)

Deliverables:

- Bulgarian `/` and English `/en` landing routes;
- the ten bilingual Terms, Privacy, Cookies, Safety, and Sources routes;
- AI disclosure, safety notice, footer, language links, and contact link;
- no-JavaScript-readable legal content;
- route content rendered from `docs/service/` source copies.

Definition of Done:

- every route from `docs/service/public-pages.json` is reachable;
- BG/EN content and links are equivalent;
- browser smoke tests cover footer, notice, title, language, and legal links;
- no legal text is silently rewritten in the UI layer.

Evidence:

- `apps/plumbing-assistant/src/service-pages.ts` loads the repository-owned
  public-page manifest and source copies, escapes rendered content, maps local
  service links to routes, and returns server-rendered HTML;
- `src/app.tsx` includes the bilingual AI notice, language link, required legal
  links, contact, source-code, and copyright footer;
- integration tests cover the Bulgarian and English landing routes and all ten
  legal routes;
- the Docker runtime now carries `docs/service/` without adding public traffic
  or deployment configuration.

Known limitation: the POC renderer is a deliberately small Markdown subset; it
does not claim final typography, accessibility, or legal/deployment approval.

### POC-080 — Deterministic safety pre-triage and response validation

Status: `done` (server-owned safety gate)

Deliverables:

- POC implementation of the safety response contract;
- critical/caution/clarify-first handling;
- fixed stop-and-escalate responses;
- response post-validation;
- safety audit events without conversation content.

Definition of Done:

- existing frozen safety vectors pass through the application boundary;
- critical hazards bypass normal generated procedure;
- unsafe model actions cannot lower established severity;
- unknown high-risk conditions do not receive local-DIY steps.

Evidence:

- `apps/plumbing-assistant/src/safety.ts` applies the monotonic
  routine/caution/critical floor, hazard classes, server-owned action codes,
  and bilingual language selection;
- `src/server.ts` executes pre-triage before `ChatRuntime.respond()` and returns
  a fixed stop response for non-routine cases;
- unit tests cover critical electricity, unknown compatibility, and routine
  local-DIY decisions;
- integration tests prove the critical path returns without the unavailable
  runtime/provider.

Known limitation: this POC pre-triage is a conservative keyword detector and
does not claim the complete structured intake, reviewed localized templates, or
qualified domain review required for public release.

### POC-090 — Mock model/provider adapter

Status: `planned`

Deliverables:

- deterministic mock responses keyed by fixtures;
- provider adapter interface;
- structured output parsing;
- explicit unsupported/insufficient-evidence responses;
- no-token development path for UI and API testing.

Definition of Done:

- the full text chat flow works without an API key;
- fixtures exercise informational, diagnostic, clarify-first, and escalation
  responses;
- mock output cannot bypass server-side safety validation.

### POC-100 — Text-only bilingual chat UI

Status: `planned`

Deliverables:

- chat input and response rendering;
- BG/EN selection;
- loading, error, empty, clarification, and escalation states;
- source/citation display;
- new-chat action;
- no image upload yet.

Definition of Done:

- a user can complete a text conversation in both languages;
- safety and uncertainty are visually prominent;
- citations and handoff are understandable;
- basic keyboard and mobile checks pass.

### POC-110 — Optional real OpenAI adapter

Status: `planned`

Deliverables:

- server-side provider adapter behind an explicit feature flag;
- `store: false` and bounded request configuration;
- provider timeout, error, and budget behavior;
- no live calls in CI or default Docker mode.

Definition of Done:

- one manually controlled local smoke test succeeds;
- provider failure is safe and does not corrupt state;
- usage/cost is bounded and visible to the local operator;
- credentials remain outside the repository and browser.

### POC-120 — Thirty-pair bilingual pilot and baseline runner

Status: `planned`

Deliverables:

- 30 reviewed Bulgarian/English scenario pairs;
- direct-ChatGPT baseline capture;
- project-assistant capture;
- human reference labels;
- deterministic score/report format.

Definition of Done:

- the same prompts and fixtures can be replayed;
- safety, grounding, usefulness, uncertainty, and language parity are scored;
- critical failures are individually visible and block a positive conclusion;
- the report binds results to commit, KB, model, prompt, and index versions.

### POC-130 — Integration, browser, failure-path, and Docker tests

Status: `planned`

Deliverables:

- API integration tests;
- browser smoke tests;
- container startup and health tests;
- invalid input, timeout, empty retrieval, provider error, and safety failure
  cases;
- reproducible local test command.

Definition of Done:

- the POC can be built and tested from a clean checkout;
- default tests need no credentials or network;
- the same failure does not silently become a successful answer;
- `npm run validate` and POC tests pass together.

### POC-140 — POC report and continue/change/stop decision

Status: `planned`

Deliverables:

- short comparison report against direct ChatGPT;
- known limitations and open risks;
- cost and latency observations;
- recommendation to continue, change direction, or stop;
- updated task board and project map if structure changed.

Definition of Done:

- the decision is based on recorded cases, not impressions;
- critical safety failures are disclosed;
- no public-release claim is made from POC evidence alone;
- the next implementation phase has a clear owner and starting task.

## Daily handoff rule

At the end of every work session:

1. update the task status;
2. record completed files and commands;
3. record the next exact action;
4. record blockers and decisions needed;
5. run the relevant tests and `npm run validate`;
6. commit only when the checkpoint is coherent.

At the start of the next session, read this section and the current task row
before changing code. Do not infer progress from conversation history alone.
