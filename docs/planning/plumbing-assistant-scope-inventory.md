# Plumbing Assistant — Scope Inventory and Estimation Ledger

| Field | Value |
| --- | --- |
| Inventory ID | `PA-SCOPE-001` |
| Status | Active implementation-baseline inventory |
| As of | 2026-09-22 |
| Machine-readable allocation | [scope inventory JSON](plumbing-assistant-scope-inventory.json) |
| Requirements source | [PA-REQ-002](../requirements/plumbing-assistant-v0.2.md) |

## Why this document exists

This is the executive counting and estimation view of the project. It serves
three deliberately different uses:

- **portfolio:** show that “AI chatbot” includes product, retrieval, safety,
  privacy, security, operations, evaluation, and governance work;
- **delivery control:** detect categories that have many acceptance criteria
  but no implementation or review evidence;
- **commercial estimation:** turn an agreed scope into effort, external-review,
  infrastructure, and API-cost lines without pricing the project by screen count.

It is not the detailed implementation traceability matrix and it is not a fixed
quote. [PA-TRACE-001](../traceability/plumbing-assistant.md) remains the source
for requirement-level evidence.

## Current measured scope

The allocation gives every active FR and AC exactly one **primary** category so
the totals do not double-count cross-cutting work.

| Primary category | FR | AC | Main cost drivers |
| --- | ---: | ---: | --- |
| Product and UX | 4 | 1 | SSR landing/chat, bilingual and accessible interaction |
| AI, retrieval, and sources | 3 | 23 | ingestion, retrieval isolation, citations, current web search, adversarial cases |
| Domain safety | 2 | 8 | deterministic triage, fixed templates, expert-reviewed hazards |
| Security, privacy, and data lifecycle | 5 | 28 | tokens, state, uploads, retention, proxy/log controls, privacy review |
| Cost controls, abuse, and infrastructure | 2 | 10 | atomic ledger, limits, breaker, concurrency/load evidence |
| Administration and signed statistics | 4 | 14 | CLI/server protocol, key lifecycle, replay store, private aggregates |
| Evaluation and engineering quality | 2 | 17 | datasets, graders, CI, browser suites, release reports |
| Operated-service terms and public disclosures | 1 | 11 | Terms, Privacy, Cookies, Safety, Sources, footer and qualified reviews |
| **Total** | **23** | **112** | **135 uniquely allocated requirement records** |

The repository validator checks the totals and uniqueness against the active
requirements. A requirement can affect several disciplines, but its primary
allocation changes only through a reviewed update to the JSON ledger.

## Artifact inventory

| Artifact family | Current count | What is measured |
| --- | ---: | --- |
| Requirements baseline manifest/components | 1 / 2 | PA-REQ-002 plus frozen v0.1 scope and approved v0.2 audit delta |
| Functional requirements | 23 | `FR-01` through `FR-23` |
| Acceptance criteria | 112 | `AC-01` through `AC-112` |
| Architecture decisions | 4 | Conversation, cost, anonymous access, admin signing |
| Core architecture document | 1 | Runtime/component boundary |
| Safety policies | 1 | Policy and hazard matrix |
| Security specifications | 2 | Image lifecycle and retrieval/prompt injection |
| Source-governance specifications | 1 | Selection, ingestion, freshness, withdrawal, rights |
| Evaluation plans | 1 | Dataset, metrics, gates, reports |
| Machine-readable contracts/vectors | 3 | Response, retrieval evidence, signing vectors |
| Public service source pages | 10 | Five Bulgarian/English document pairs |
| Public service route manifests | 1 | Routes, footer, copyright, AI notice, storage profile |
| Active audits / archived findings | 2 / 1 | Closed definition audit, open implementation audit, historical working paper |
| Execution contract / task graph / task template | 1 / 1 / 1 | Model-neutral authority, dependencies, coverage, evidence protocol |
| Durable implementation/commercial handoff | 1 | Resume and acquisition snapshot |
| Repository quality scripts/workflows | 1 / 1 | Local validator / GitHub quality workflow |

Counts measure scope, not completion. Ten written source pages, for example, do
not prove that ten accessible SSR routes exist or that a lawyer approved them.

## Estimation method

Estimate at the smallest independently verifiable deliverable, normally one
FR split into its implementation and applicable AC evidence. Use this scale:

| Size | Typical effort | Suitable example |
| --- | ---: | --- |
| XS | 2–4 hours | Static copy/link change with deterministic test |
| S | 0.5–1 day | One bounded component or route with unit tests |
| M | 1–3 days | Component plus integration/error-path evidence |
| L | 3–7 days | Cross-component security, storage, or provider boundary |
| XL | Must be split | Work that cannot be reviewed and accepted within one week |

For each backlog item record:

| Field | Meaning |
| --- | --- |
| Requirement IDs | Exact FR and AC delivered |
| Deliverable | Code, configuration, dataset, document, or review evidence |
| Size and expected days | Development/test effort, excluding external waiting |
| Dependencies | Decisions, providers, source research, or preceding components |
| External review | Legal/privacy, domain, accessibility, or security specialist |
| Runtime cost | Hosting, database, monitoring, OpenAI, search, storage |
| Risk reserve | Usually 20–35% for unresolved provider, safety, and integration risk |
| Exit evidence | Test/report/reviewer needed before the item is billable as complete |

## Simple commercial formula

Use variables instead of embedding a market rate in requirements:

```text
implementation = sum(role days × agreed day rate)
external review = legal/privacy + domain + accessibility/security review
launch cost = hosting + managed data services + monitoring + initial API budget
risk reserve = 20–35% of unresolved implementation work
quoted total = implementation + external review + launch cost + risk reserve
monthly run rate = fixed cloud services + measured API/search/storage usage
```

Price separately:

1. **portfolio prototype** — selected requirements, synthetic fixtures, no
   public safety or compliance claim;
2. **public MVP** — all applicable release blockers, reviews, deployment,
   observability, incident paths, and objective tests;
3. **ongoing operation** — source refresh, model/provider regression runs,
   security/dependency maintenance, support, and usage cost.

This prevents an attractive prototype estimate from being mistaken for the
cost of operating a safe public service.

## Update rule

Update this document and its JSON allocation whenever an FR/AC is added,
removed, or reclassified. Update effort and commercial figures only after a
backlog item has explicit deliverables, dependencies, and exit evidence. Actual
hours and provider spend belong in release/operations reports, not in the
requirements baseline.
