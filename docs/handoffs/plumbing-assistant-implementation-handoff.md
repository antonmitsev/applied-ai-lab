# Plumbing Assistant — Implementation and Commercial Handoff

| Field | Value |
| --- | --- |
| Handoff ID | `PA-HANDOFF-001` |
| Status | Ready for implementation handoff |
| Snapshot date | 2026-09-22 |
| Product owner | Anton Mitsev |
| Requirements | [PA-REQ-002](../requirements/plumbing-assistant-v0.2.md) |
| Definition audit | [Closed](../audits/plumbing-assistant-project-definition-audit.md) |
| Implementation audit | [Not started](../audits/plumbing-assistant-implementation-readiness-audit.md) |

## Executive recap

Plumbing Assistant is a planned free, public, Bulgarian-first AI portfolio
application with an English option. It helps non-professionals understand and
safely troubleshoot domestic plumbing and water-based heating issues in
Bulgaria. Gas, combustion, electrical repair, regulated work, and unsupported
definitive diagnosis are outside scope.

The product-definition phase is complete. The repository contains an accepted
requirements baseline, architecture decisions, safety/security/source policies,
machine-readable contracts, an evaluation plan, public service copy,
traceability, estimation inventory, CI, and deterministic repository
validation. No production application has been implemented and no public
release is approved.

## What is being handed over

| Asset | State |
| --- | --- |
| Product and requirements | Accepted: 23 FR, 112 AC, 3 deferred work packages |
| Architecture and ADRs | Accepted for implementation |
| Safety/security/privacy design | Defined; implementation and qualified reviews pending |
| Source/retrieval governance | Defined; WP-01 registry and ingestion pending |
| AI evaluation | Metrics/contracts defined; dataset completion and runner pending |
| Cost/abuse controls | Algorithms defined; WP-03 calibration pending |
| Public service/legal copy | Ten bilingual source pages and route/footer contract ready; review/rendering pending |
| Repository quality | Validator and CI active; application suites/settings evidence pending |
| Application code | Not started |
| Deployment/operations | Not selected or implemented |

## Target runtime shape

The accepted solution is a React SSR user experience with a trusted Node.js
boundary. The server owns OpenAI credentials, safety enforcement, retrieval,
quota admission, persistence, signed admin verification, and final rendering.
The browser owns only presentation and bounded authenticated conversation state.
OpenAI requests are server-side, explicitly use `store: false`, and do not use
provider Conversation objects in the MVP.

Primary components are:

```text
SSR landing + bilingual chat + public service pages
                │
trusted Node.js API boundary
  ├─ visitor/Origin/CSRF and quota admission
  ├─ deterministic safety pre-triage
  ├─ state and image validation
  ├─ curated/live retrieval evidence gateway
  ├─ OpenAI adapter with strict structured output
  ├─ deterministic post-validation and renderer
  ├─ atomic usage/cost store
  └─ signed read-only administrative statistics
```

## Recommended implementation sequence

1. **Foundation:** choose SSR framework/runtime/package layout, create adapters,
   configuration schema, CI jobs, error model, and test harness.
2. **Trusted boundaries:** implement visitor protocol, state envelope, atomic
   quota ledger, safety intake, and content-free logging with frozen fixtures.
3. **Text path:** add strict OpenAI adapter, response validation, fixed
   critical/caution renderers, and bilingual chat without live retrieval.
4. **Sources and retrieval:** execute WP-01, implement registry/ingestion,
   evidence gateway, citations, controlled web stage, and adversarial tests.
5. **Images and administration:** add isolated image processing and the signed
   statistics CLI/endpoint with full failure-path tests.
6. **Public surface:** render the ten SSR service pages, footer/copyright links,
   AI disclosure, cookie behavior, accessibility, and no-JS coverage.
7. **Release evidence:** complete dataset/domain review, WP-03, privacy/legal
   review, deployment configuration, runbooks, load tests, and PA-AUDIT-002 I5.

## Decisions the next owner must make

- SSR framework and hosting topology;
- OpenAI model(s), project controls, region, and pricing snapshot;
- SQLite or managed atomic store based on topology;
- domain reviewer and legal/privacy reviewer;
- initial manufacturers/documents for WP-01;
- exact quotas and budgets after WP-03;
- final brand, domain, and visual identity.

These are controlled choices, not permission to discard existing safety or
privacy requirements.

## How to resume later

1. Read [PA-REQ-002](../requirements/plumbing-assistant-v0.2.md), this handoff,
   and [PA-AUDIT-002](../audits/plumbing-assistant-implementation-readiness-audit.md).
2. Run `npm run validate`; do not begin from an invalid baseline.
3. Check PA-TRACE-001 and select the smallest unimplemented workstream.
4. Record the open technical choice that workstream depends on.
5. Implement code and tests together, then replace planned traceability paths
   with actual ones.
6. Update PA-AUDIT-002 with evidence, never with unsupported completion claims.

Suggested first task: decide and scaffold the React SSR/Node.js workspace,
introducing real format, lint, strict type, unit, integration, E2E, and coverage
jobs without making a live provider call.

## Commercial and acquisition view

A commercial handoff can include the project definition, repository history,
copyright ownership that the seller is entitled to transfer, future private
implementation, brand/domain rights if separately owned, deployment assets,
support, and delivery services. A buyer should verify chain of title, third-
party dependencies, source-document rights, data-processing roles, domains,
accounts, and external-review status.

The published repository is licensed under 0BSD. That license already permits
the public to use, copy, modify, and distribute the published software for any
purpose. A sale therefore must not be described as granting exclusivity over
copies already released under 0BSD. Commercial value can still come from
copyright/title transfer, brand/domain, implementation velocity, unpublished
assets, hosted operation, maintenance, expertise, and warranties negotiated in
a separate agreement. Obtain qualified legal advice before representing an
exclusive asset sale. The repository [LICENSE](../../LICENSE) is controlling;
`0BSD` is also listed by [SPDX](https://spdx.org/licenses/) and the
[Open Source Initiative](https://opensource.org/licenses).

The service Terms are distinct from the source-code license. Third-party
documentation, standards, manufacturer material, provider services, and future
directory information retain their own rights and are not automatically part of
an acquisition.

## Estimation and due diligence

Use [PA-SCOPE-001](../planning/plumbing-assistant-scope-inventory.md) for the
measured requirement/category inventory and pricing formula. A quote must state
whether it covers only a portfolio prototype or PA-AUDIT-002 public-release
closure, plus external reviews, source research, infrastructure, API spend,
support, and risk reserve.

Before sale or implementation transfer, attach:

- the exact commit and passing CI run;
- repository visibility, branch/security settings, and contributor list;
- a dependency/license inventory after application dependencies exist;
- a list of owned domains, marks, accounts, secrets, and deployment resources;
- accepted/open PA-AUDIT-002 controls and evidence;
- external contracts/reviews and source-use permissions;
- known liabilities, incidents, user data, and operating costs, if any.

## Snapshot integrity

At this handoff, no API key, production secret, user data, private evaluation
set, downloaded third-party manual, runtime database, or deployment account is
included. `npm run validate` is the local integrity check; the Git commit
containing this document and its Repository Quality run are the portable
snapshot identity.
