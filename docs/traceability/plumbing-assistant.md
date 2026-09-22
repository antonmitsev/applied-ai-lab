# Plumbing Assistant — Requirements Traceability Matrix

| Field | Value |
| --- | --- |
| Matrix ID | `PA-TRACE-001` |
| Status | Active; implementation evidence pending |
| Date | 2026-09-22 |
| Requirements | [v0.1 baseline](../requirements/plumbing-assistant-v0.1.md) plus [v0.2 working draft](../requirements/plumbing-assistant-v0.2-draft.md) |
| Convention | [PA-REPO-001](../engineering/repository-conventions.md) |

## How to read the matrix

Each stable requirement or acceptance criterion appears exactly once. A range
means that every ID in the range currently shares the same design boundary,
component, evidence family, metric, and status; it must be split when that stops
being true.

`Design ready` means the specification is sufficient to start the component. It
does not mean the implementation, domain/legal/privacy review, or release
evidence exists. `Defined` means the product intent exists but a later
implementation decision is still expected. The repository validator fails on a
missing or duplicated FR/AC mapping.

<!-- traceability-start -->
| Requirement(s) | Design / decision | Planned implementation owner | Automated evidence | AI evaluation / release metric | Status |
| --- | --- | --- | --- | --- | --- |
| `FR-01` | [Architecture](../architecture/plumbing-assistant.md) | SSR shell, landing page, bilingual UI | SSR, responsive, route, accessibility, metadata tests | Keyboard/mobile review; BG/EN experience parity | Defined; framework pending |
| `FR-02` | [ADR-0001](../decisions/0001-conversation-state-and-retention.md), [PA-IMG-001](../security/plumbing-assistant-image-security.md), [PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md) | Chat intake, state envelope, upload boundary, orchestration | Input/state/upload component and E2E tests | Missing-information recall; image and bilingual strata | Design ready; implementation pending |
| `FR-03` | [PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md), [response schema](../contracts/assistant-response.schema.json) | Orchestrator, post-validator, fixed and normal renderers | Schema, policy, action/source, snapshot tests | Safety gates; structured completion; citation quality | Design ready; expert and implementation pending |
| `FR-04` | [PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md) | Safety intake, deterministic pre-triage, monotonic severity | Hazard, ambiguity, downgrade, fixed-template tests | Critical recall 100%; unsafe guidance and severity violations 0 | Design ready; expert and implementation pending |
| `FR-05` | [PA-SOURCE-001](../sources/plumbing-assistant-source-governance.md), [PA-RET-001](../security/plumbing-assistant-retrieval-security.md) | Retrieval planner, curated adapter, web adapter, evidence gateway | Source lifecycle, query/tool, evidence, URL/citation tests | Citation coverage/correctness; injection and compatibility gates | Design ready; WP-01 and implementation pending |
| `FR-06` | [PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md), WP-02 in [requirements v0.1](../requirements/plumbing-assistant-v0.1.md) | Handoff renderer; future neutral directory adapter | Handoff/action tests; future directory neutrality tests | Required-handoff accuracy; no endorsement/paid-placement output | Defined; directory research deferred |
| `FR-07` | [ADR-0003](../decisions/0003-anonymous-access-and-abuse-controls.md) | Visitor-token and same-origin boundary | Token, CSRF, Origin, reset, proxy and privacy tests | Auth failure before provider call; no fingerprint requirement | Design ready; implementation/privacy review pending |
| `FR-08` | [ADR-0002](../decisions/0002-atomic-cost-and-quota-accounting.md), [ADR-0003](../decisions/0003-anonymous-access-and-abuse-controls.md) | Admission, reservation, reconciliation, circuit breaker | Concurrency, crash, overshoot, threshold and load tests | Zero budget overshoot; measured p95/cost via WP-03 | Design ready; benchmark and implementation pending |
| `FR-09` | [ADR-0001](../decisions/0001-conversation-state-and-retention.md), [ADR-0002](../decisions/0002-atomic-cost-and-quota-accounting.md) | Persistent usage ledger and retention jobs | Transaction, recovery, retention and content-exclusion tests | Accounting accuracy; forbidden persisted-content count 0 | Design ready; datastore selection/implementation pending |
| `FR-10` | [ADR-0004](../decisions/0004-administrative-request-signing.md) | Read-only statistics route and local CLI | Method/route, aggregate allowlist, CORS/cache tests | No user content; only approved aggregate fields | Design ready; implementation pending |
| `FR-11` | [ADR-0004](../decisions/0004-administrative-request-signing.md), [vectors](../contracts/admin-signing-test-vectors.json) | CLI signer, server verifier, key registry, nonce store | Interop, tamper, replay, proxy, rotation tests | Unauthorized/replayed admin successes 0 | Design ready; implementation pending |
| `FR-12` | [ADR-0001](../decisions/0001-conversation-state-and-retention.md), [ADR-0004](../decisions/0004-administrative-request-signing.md) | Aggregate query/service and response serializer | Field allowlist, redaction, cache and retention tests | Forbidden/admin payload disclosure count 0 | Design ready; implementation pending |
| `FR-13` | [ADR-0001](../decisions/0001-conversation-state-and-retention.md) | Client-carried state codec and stateless provider adapter | Envelope, expiry, size, deletion, `store:false` tests | Conversation/privacy regressions 0 | Design ready; implementation/privacy notice pending |
| `FR-14` | [PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md), [response schema](../contracts/assistant-response.schema.json) | Pre-triage, strict generation, post-validator, renderers | Hazard/action/schema/monotonic/fixed-output tests | Release-blocking safety thresholds in PA-EVAL-001 | Design ready; expert and implementation pending |
| `FR-15` | [PA-EVAL-001](../evaluation/plumbing-assistant-evaluation-plan.md), [case schema](../../evals/plumbing-assistant/case.schema.json) | Eval runner, deterministic graders, report generator | Dataset/schema/metric/repetition/report tests | All PA-EVAL-001 safety, quality, bilingual and operational gates | Design ready; runner/dataset/review pending |
| `FR-16` | [ADR-0002](../decisions/0002-atomic-cost-and-quota-accounting.md) | Price catalogue, atomic ledger, breakers and recovery | Integer, transaction, concurrency, crash and drift tests | Overshoot 0; operational thresholds from WP-03 | Design ready; benchmark and implementation pending |
| `FR-17` | [ADR-0003](../decisions/0003-anonymous-access-and-abuse-controls.md) | Token/CSRF/proxy boundary and privacy-minimized buckets | Auth, reset, expiry, proxy, retention and config tests | Paid calls after invalid boundary 0; identifier leakage 0 | Design ready; privacy review/implementation pending |
| `FR-18` | [PA-SOURCE-001](../sources/plumbing-assistant-source-governance.md), [source schema](../sources/source-manifest.schema.json) | Registry validator, ingestion/build pipeline, reconciler | Rights/checksum/build/withdrawal/reconciliation tests | Preferred-source and exact-compatibility gates | Design ready; WP-01/implementation pending |
| `FR-19` | [PA-IMG-001](../security/plumbing-assistant-image-security.md) | Upload scanner/normalizer, inline provider adapter, janitor | Format/bomb/metadata/cleanup/resource tests | Image safety/compatibility gates; retention violations 0 | Design ready; privacy review/implementation pending |
| `FR-20` | [PA-RET-001](../security/plumbing-assistant-retrieval-security.md), [evidence schema](../contracts/retrieval-evidence.schema.json) | Planner, isolated retrieval, evidence gateway, safe renderer | Channel/tool/query/domain/evidence/citation/exfiltration tests | Injection/tool/URL/exfiltration failures 0 | Design ready; adversarial corpus/implementation pending |
| `FR-21` | [ADR-0004](../decisions/0004-administrative-request-signing.md), [vectors](../contracts/admin-signing-test-vectors.json) | CLI/server canonicalizers, verifier, replay/key services | Byte/vector, encoding, clock, concurrency, restart and lifecycle tests | Invalid/replayed/cross-scope acceptance 0 | Design ready; interoperability implementation pending |
| `FR-22` | [PA-REPO-001](../engineering/repository-conventions.md), PA-TRACE-001 | Repository validator, CI workflows and protected settings | Syntax/link/ref/coverage/vector/hygiene/dependency checks | Complete unique traceability; protected checks and sanitized reports | Base CI implemented; app suites/settings evidence pending |
| `AC-01` | [Architecture](../architecture/plumbing-assistant.md) | SSR/UI/chat journey | BG/EN browser E2E | Complete no-account flow in both languages | Defined; implementation pending |
| `AC-02` | [PA-IMG-001](../security/plumbing-assistant-image-security.md), [PA-RET-001](../security/plumbing-assistant-retrieval-security.md) | Text/image intake through sourced renderer | Multimodal E2E and citation validation | Structured completion and citation coverage gates | Design ready; implementation pending |
| `AC-03` | [PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md), [PA-EVAL-001](../evaluation/plumbing-assistant-evaluation-plan.md) | Safety pipeline | Critical/out-of-scope regression suite | Critical recall 100%; unsafe guidance 0 | Design ready; expert/dataset/implementation pending |
| `AC-04` | [ADR-0003](../decisions/0003-anonymous-access-and-abuse-controls.md) | Auth and quota admission boundary | Invalid-token/store/budget fail-closed tests | Provider calls after failed admission 0 | Design ready; implementation pending |
| `AC-05` | [ADR-0002](../decisions/0002-atomic-cost-and-quota-accounting.md) | Visitor/global budget configuration | Startup invariant and concurrency tests | Ten-visitor consumption at most 50% global | Design ready; WP-03/implementation pending |
| `AC-06` | [ADR-0002](../decisions/0002-atomic-cost-and-quota-accounting.md) | Global circuit breaker | Boundary, drift and recovery tests | Paid calls after breaker opens 0 | Design ready; implementation pending |
| `AC-07` | [ADR-0004](../decisions/0004-administrative-request-signing.md) | Admin CLI and statistics endpoint | Positive interop and aggregate-response E2E | Valid CLI request succeeds without content leakage | Design ready; implementation pending |
| `AC-08` | [ADR-0004](../decisions/0004-administrative-request-signing.md) | Admin verifier and nonce store | Unsigned/stale/replay/concurrent tests | Unauthorized or replay success 0 | Design ready; implementation pending |
| `AC-09` | [Security policy](../../SECURITY.md), [repository convention](../engineering/repository-conventions.md) | Repository and deployment hygiene | Repository validator, secret scanning, push protection | Tracked secrets/runtime/user data 0 | Partial automation; repository settings evidence pending |
| `AC-10` | [PA-EVAL-001](../evaluation/plumbing-assistant-evaluation-plan.md), [repository convention](../engineering/repository-conventions.md) | CI plus eval runner | Required component suites and release evaluation | All protected checks and release gates pass | Design ready; implementation/dataset/protection pending |
| `AC-11–AC-17` | [ADR-0001](../decisions/0001-conversation-state-and-retention.md) | State/privacy boundary | Statelessness, envelope, limits, deletion and config tests | Privacy/retention violations 0 | Design ready; implementation pending |
| `AC-18–AC-24` | [PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md) | Independent safety pipeline | Monotonic, fixed/caution, schema, hazard and expert-review evidence | Critical safety gates | Design ready; expert/implementation pending |
| `AC-25–AC-32` | [PA-EVAL-001](../evaluation/plumbing-assistant-evaluation-plan.md) | Dataset, runner, graders and reports | Coverage, formula, repeatability and CI tests | Published safety/quality/bilingual/operational thresholds | Design ready; dataset/runner pending |
| `AC-33–AC-40` | [ADR-0002](../decisions/0002-atomic-cost-and-quota-accounting.md) | Atomic cost ledger and breakers | Integer, transaction, concurrency, crash, price/config and load tests | Budget overshoot 0; WP-03 limits | Design ready; benchmark/implementation pending |
| `AC-41–AC-49` | [ADR-0003](../decisions/0003-anonymous-access-and-abuse-controls.md) | Anonymous boundary and abuse controls | Token/origin/CSRF/reset/proxy/retention/config tests | Invalid paid calls and identifier leaks 0 | Design ready; privacy review/implementation pending |
| `AC-50–AC-59` | [PA-SOURCE-001](../sources/plumbing-assistant-source-governance.md) | Registry, ingestion, index and reconciliation | Schema/rights/checksum/build/withdrawal/citation tests | Source/citation/compatibility gates | Design ready; WP-01/implementation pending |
| `AC-60–AC-70` | [PA-IMG-001](../security/plumbing-assistant-image-security.md) | Image boundary and cleanup | Framing/format/isolation/normalization/cleanup/resource tests | Image/adversarial gates; retained artifacts 0 | Design ready; privacy review/implementation pending |
| `AC-71–AC-82` | [PA-RET-001](../security/plumbing-assistant-retrieval-security.md) | Staged retrieval and evidence/citation boundary | Trust/tool/query/URL/evidence/render/failure/capture tests | Injection/capability/URL/exfiltration failures 0 | Design ready; corpus/implementation pending |
| `AC-83–AC-94` | [ADR-0004](../decisions/0004-administrative-request-signing.md) | Admin CLI, verifier, nonce/key services and proxy boundary | Vector/request/header/query/signature/time/replay/key/redaction suites | Unauthorized, replay, scope and disclosure failures 0 | Design ready; implementation pending |
| `AC-95–AC-101` | [PA-REPO-001](../engineering/repository-conventions.md), PA-TRACE-001 | Repository validator, CI, branch/security settings and future app suites | Coverage/change/layout/quality/dependency/secret/protection tests | 123/123 mapped IDs; required checks passing; leaked secrets 0 | Base validator/workflow implemented; app suites/settings evidence pending |
<!-- traceability-end -->

## Maintenance and closure

The matrix describes the current evidence gap honestly: no production
application implementation exists. `AUD-P2-010` can close only when the first
implementation replaces planned component/test names with real paths, CI jobs
are protected and passing, required repository security settings are evidenced,
and the release report links back to every applicable row.
