# Plumbing Assistant — Implementation and Release Readiness Audit

| Field | Value |
| --- | --- |
| Audit ID | `PA-AUDIT-002` |
| Status | Not started |
| Current decision | No public-release decision |
| Created | 2026-09-22 |
| Requirements baseline | [PA-REQ-002](../requirements/plumbing-assistant-v0.2.md) |
| Predecessor | [PA-AUDIT-001 — Closed](plumbing-assistant-project-definition-audit.md) |
| First review | After the application scaffold and deterministic unit boundary exist |

## Audit question

Does the implemented, configured, reviewed, and deployed system satisfy the
accepted requirements with objective evidence and an acceptable residual-risk
record?

This audit begins with implementation. A design document alone cannot pass an
implementation control, and a working demo alone cannot pass a public-release
control without its required safety, privacy, security, and operational
evidence.

## Control register

| Control | Implementation evidence required | Initial status |
| --- | --- | --- |
| `IMP-001` Conversation/data lifecycle | State codec, provider boundary, cleanup, retention, log and configuration tests | Not started |
| `IMP-002` Independent safety | Pre-triage, monotonic severity, fixed renderers, domain review and critical regressions | Not started |
| `IMP-003` AI evaluation | Reviewed dataset, runner, deterministic graders, repetitions and versioned report | Not started |
| `IMP-004` Cost and quota | Atomic reservation/reconciliation, price catalogue, breakers, recovery and WP-03 load evidence | Not started |
| `IMP-005` Anonymous access/privacy | Token, Origin/CSRF, trusted proxy, minimized buckets, deletion and privacy review | Not started |
| `IMP-006` Governed sources | WP-01 registry, rights/freshness review, reproducible ingestion, activation and withdrawal | Not started |
| `IMP-007` Image boundary | Framing, actual-format validation, isolation, normalization, resource limits and cleanup | Not started |
| `IMP-008` Retrieval containment | Staged tools, query/URL/evidence gates, safe citations and adversarial corpus | Not started |
| `IMP-009` Admin statistics | CLI/server interoperability, replay store, key lifecycle, proxy path and response privacy | Not started |
| `IMP-010` Engineering/repository | Real format/type/test jobs, protected checks, scanning, supply-chain and release artifacts | In progress: base repository controls only |
| `IMP-011` Public service surface | SSR routes/footer, AI disclosure, cookie behavior, deployment parity and qualified reviews | Not started: source copy exists |

## Delivery gates

| Gate | Decision criterion | Evidence |
| --- | --- | --- |
| `I0` Scaffold | Chosen stack builds, runs, types, lints, and serves SSR shell | ADR/decision plus deterministic CI |
| `I1` Internal text prototype | Bilingual text flow works against adapters with no public traffic | Unit/integration tests and synthetic fixtures |
| `I2` Safety and grounding | Safety, sources, retrieval, images, and bilingual evaluation gates pass | Domain review and versioned evaluation report |
| `I3` Cost and abuse | Atomic quotas, measured limits, budget breaker, and abuse boundaries pass | WP-03 benchmark and load/security tests |
| `I4` Operational readiness | Privacy, deletion, key rotation, monitoring, incident, backup, and rollback paths pass | Runbooks, deployment review, legal/privacy evidence |
| `I5` Public MVP | I0–I4 pass; no open P0/P1 implementation blocker | Signed release decision with immutable evidence |

Implementation may progress incrementally, but public chat, image upload, live
web retrieval, and admin access remain disabled until their applicable controls
pass. `I5` is the only public `GO` decision.

## Evidence rules

- Every passing control links actual source/test/config/report paths and commit
  IDs; planned paths do not count.
- Tests cover failure, timeout, concurrency, restart, cleanup, and downgrade
  paths where applicable.
- Provider-backed evidence records model/project/config versions without
  exposing credentials, user content, or hidden evaluation data.
- External review records reviewer qualification, scope, date, outcome,
  required changes, and resolution; a document marked “review required” does
  not count as review.
- Deployment facts override pre-publication assumptions and must update both
  language notices before `I5`.
- Accepted risk records owner, rationale, compensating control, expiry, and
  review date. P0/P1 public-release blockers cannot disappear through wording.

## First implementation review checklist

1. Record framework, workspace, runtime, package-manager, and deployment-spike
   decisions.
2. Add real format, lint, strict type, unit, integration, browser, and coverage
   commands to CI.
3. Implement trusted configuration parsing and provider/store adapter
   interfaces before business logic.
4. Implement deterministic safety intake and state/quota boundaries before the
   first live model call.
5. Update PA-TRACE-001 planned paths to actual component and test paths.
6. Mark only evidenced controls `In progress`, `Ready for review`, or `Passed`.

## Final decision record

No release decision exists yet. This section will record the reviewed commit,
deployment, evidence manifest, open risks, reviewers, and `GO/NO-GO` outcome
when gate I5 is evaluated.
