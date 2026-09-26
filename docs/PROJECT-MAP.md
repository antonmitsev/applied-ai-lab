# Applied AI Lab — Human Project Map

This is the short, human-readable map of the Plumbing Assistant project.

The project is not only a chatbot. It is a chain:

```text
requirements → design → knowledge → sources → retrieval → safety → tests → application → release
```

## What each part does

| Area | Location | Plain-language purpose |
| --- | --- | --- |
| Project entry point | `README.md` | What the repository is and how to orient yourself. |
| Requirements | `docs/requirements/` | What the product must do and how success is defined. |
| Architecture and decisions | `docs/architecture/`, `docs/decisions/` | How the system should work and why important choices were made. |
| Knowledge base | `docs/kb/` | Plumbing and heating knowledge: connections, seals, symptoms, failures, and diagnosis. |
| Source governance | `docs/sources/`, `sources/` | Which external documents may support answers. The registry has three metadata-only candidates; all remain in review. |
| Retrieval evaluation | `evals/plumbing-kb/` | Small tests proving that the right KB units can be found. |
| Full AI evaluation | `evals/plumbing-assistant/`, `docs/evaluation/` | Scenarios for safety, grounding, bilingual behavior, and release quality. |
| Safety and security | `docs/safety/`, `docs/security/`, `SECURITY.md` | Boundaries for dangerous work, private data, images, prompt injection, and abuse. |
| Public service rules | `docs/service/` | AI notices, privacy, terms, cookies, sources, and public-facing wording. |
| Planning and traceability | `docs/planning/`, `docs/traceability/` | What is being built, who owns it, and which requirement each task satisfies. The [POC task board](planning/plumbing-assistant-poc-plan.md) is the daily resume point. |
| Audits and handoffs | `docs/audits/`, `docs/handoffs/` | Readiness decisions, open risks, and transfer notes. |
| Validation scripts | `scripts/` | Deterministic checks for repository structure, KB content, and safety contracts. |
| Applications | `apps/` | The runnable product. The Plumbing Assistant now has a local end-to-end POC with SSR UI, mock chat, retrieval, safety gate, and legal routes. |
| Shared packages | `packages/` | Reusable code, added only when it is genuinely shared. |
| CI | `.github/workflows/` | Automated checks run for repository changes. |

## The KB in one sentence

The KB connects:

```text
component → connection → mechanical retention → sealing → failure → symptom → diagnosis
```

Its canonical language is English. Bulgarian terms are kept as aliases and
evaluation queries so people can search naturally in Bulgarian.

The current KB contains the requirements layer, the first eight foundational
connection/seal units, one diagnostic unit, and case examples. They are valid
for development but remain `draft` until sources and human technical review are
completed.

## How quality is checked

From the repository root:

```bash
npm run validate       # repository + KB + safety contract
npm run test:kb        # KB parser and retrieval-baseline tests
npm run test:safety    # deterministic safety-contract tests
```

The checks are read-only and do not need credentials or network access.

Current validated baseline:

- requirements traceability: `135/135`;
- KB documents: `23`, with `0` validation warnings;
- retrieval evaluation cases: `20`;
- safety vectors: `10`;
- KB tests: `6/6`.
- POC unit tests: `15/15`;
- POC integration tests: `13/13`;

Passing these checks means the repository is internally consistent. It does
not yet mean that a public AI service is ready. The runtime, reviewed source
registry, application evaluation runner, deployment, and release evidence are
still required.

## Current project status

The requirements foundation, first draft KB package, and internal mock POC are
complete. The next important step is controlled evidence work:

1. review a source-backed batch and complete missing KB units;
2. make an explicit provider/model, data, and budget decision;
3. compare the reviewed project path with direct ChatGPT on the staged testing plan;
4. complete release/legal/deployment evidence before any public traffic.

## Maintenance rule

Update this document in the same commit whenever the project structure changes.
This includes:

- a new top-level project area or important sub-area;
- a change in the role or location of an existing area;
- a new required validation command or test family;
- a major milestone or status change;
- a change in the path from requirements to release.

Small content edits inside an already documented area do not require a map
change. Run `npm run validate` after updating this map and keep links current.
