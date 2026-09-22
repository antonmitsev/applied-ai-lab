# Plumbing Assistant — Requirements v0.2 Working Draft

| Field | Value |
| --- | --- |
| Status | Working draft; not yet a consolidated release baseline |
| Date opened | 2026-09-22 |
| Owner | Anton Mitsev |
| Base document | [Requirements v0.1](plumbing-assistant-v0.1.md) |
| Audit | [PA-AUDIT-001](../audits/plumbing-assistant-requirements-v0.1-audit.md) |

## Purpose of this draft

This document records approved requirement changes while the audit findings are
addressed sequentially. It is cumulative over Requirements v0.1. When all P0
findings and the specification portions of the P1 findings are resolved, the
base document and this delta will be consolidated into a standalone v0.2.

## Change log

| Audit finding | Requirement change | Status |
| --- | --- | --- |
| `AUD-P0-001` | Added FR-13 and AC-11 through AC-17 | Approved for implementation |
| `AUD-P0-002` | Added FR-14 and AC-18 through AC-24 | Domain-expert review required |
| `AUD-P0-003` | Added FR-15 and AC-25 through AC-32 | Evaluation implementation required |
| `AUD-P1-004` | Added FR-16 and AC-33 through AC-40 | Approved for implementation; WP-03 values pending |
| `AUD-P1-005` | Added FR-17 and AC-41 through AC-49 | Approved for implementation; privacy review and WP-03 values pending |

## Added functional requirements

### FR-13 — Conversation state and retention

The MVP must use application-managed, client-carried conversation state as
defined by [ADR-0001](../decisions/0001-conversation-state-and-retention.md).

Every OpenAI Responses API request must explicitly set `store: false`. The MVP
must not create OpenAI Conversation objects, set `conversation`, or use
`previous_response_id`.

The server must reconstruct the next model input only from:

- the current validated user input;
- a valid, unexpired, size-bounded, server-authenticated state envelope bound to
  the current pseudonymous visitor;
- current trusted application instructions;
- retrieval results selected for the current request.

The conversation envelope must be stored only in browser `sessionStorage`, must
expire after 60 minutes of inactivity or four hours from conversation creation,
and must allow no more than ten user turns or 128 KiB of encoded state. The
server must reject altered, expired, oversized, unsupported, or wrongly bound
state before retrieval or provider calls. Conversation history must never be
silently truncated.

Images are current-request data and must not be embedded in the conversation
envelope. A response may carry forward bounded textual observations needed for
follow-up. The user must re-upload an image when later visual inspection is
required.

Question text, response text, state envelopes, and images must not enter the
persistent usage store, application logs, access logs, analytics systems, or
backups. The product must expose a clear new-chat action that deletes local
conversation state.

The Bulgarian and English privacy notices must distinguish:

- temporary state held in the browser and server memory;
- pseudonymous application usage records;
- OpenAI application-state behavior controlled with `store: false`;
- OpenAI abuse-monitoring and prompt-cache retention;
- curated documents stored separately from user conversation content.

The product must not claim Zero Data Retention unless the deployed OpenAI
project is verified to have that control enabled.

### FR-14 — Independently enforced safety pipeline

The Node.js application must enforce the
[Safety Policy and Hazard Matrix](../safety/plumbing-assistant-safety-policy.md).
The model must not be the sole authority that decides whether its own procedural
answer is safe.

The server must perform deterministic pre-triage from validated structured
safety fields. An explicit critical match must return reviewed fixed content
without a model call. Otherwise, model output must conform to the strict
[assistant response schema](../contracts/assistant-response.schema.json) and
pass deterministic post-validation before rendering.

The final urgency must be the maximum severity produced by pre-triage, model
classification, and post-validation. No later stage may lower an earlier safety
floor. Unknown answers to material safety questions must block routine
instructions.

Critical responses must contain only reviewed localized templates and enabled
server-owned action codes. Caution responses must contain a reviewed caution
shell and enabled action codes; they must not contain generated procedural
steps. Generated procedural steps may be rendered only for a validated routine
case with adequate cited evidence.

Moderation must be treated as an independent abuse/content-safety layer. An
unflagged moderation result must not classify a plumbing case as safe, and a
moderation category must not replace domain urgency.

### FR-15 — Evaluation and release evidence

The project must implement the repository-owned
[Evaluation Plan](../evaluation/plumbing-assistant-evaluation-plan.md). Evaluation
must cover the complete application behavior, not only isolated model output.

The dataset must use the versioned case contract under
`evals/plumbing-assistant/`, include paired Bulgarian and English cases, and meet
the minimum reviewed coverage defined by PA-EVAL-001. Safety ground truth must be
approved by qualified domain reviewers. Model-based graders may assist soft
quality scoring but must not be the sole authority for safety gates.

The repository-native runner, deterministic graders, thresholds, and report
format are the source of release truth. A hosted evaluation service may be used
as an optional backend but must not be required to interpret or reproduce the
release decision.

Every release report must bind results to immutable application, model, prompt,
schema, safety-policy, source-manifest, and dataset versions. Any
release-blocking safety failure makes the run fail regardless of aggregate
quality scores.

### FR-16 — Atomic monetary quota accounting

The application must enforce the
[Atomic Cost and Quota Accounting ADR](../decisions/0002-atomic-cost-and-quota-accounting.md).
The canonical authorization unit is integer `micro_usd`, calculated from a
versioned, reviewed price catalogue. Request count, token count, and tool count
must not substitute for the monetary visitor and global budget.

Before any paid provider or tool call, the authoritative usage store must
atomically reserve the request's bounded worst-case cost against both visitor
and global UTC daily budgets and increment visitor concurrency. Charged plus
reserved amounts are consumed for admission purposes.

The backend must set hard input, image, output-token, per-tool, total-tool,
timeout, and concurrency limits. Production startup must fail closed if limits,
price data, recovery configuration, or provider-cap confirmation are absent or
invalid.

The configured visitor daily limit must be no greater than one twentieth of the
global daily limit. This invariant is measured in `micro_usd` and validated at
startup, so ten fully utilized visitors can consume at most half of the global
daily budget.

Successful requests reconcile to authoritative usage. Requests that may have
reached the provider but have unknown usage settle at the full reservation.
Actual cost above reservation opens the global circuit breaker and blocks new
provider calls pending review.

### FR-17 — Anonymous access and abuse controls

The application must implement
[ADR-0003](../decisions/0003-anonymous-access-and-abuse-controls.md).
Anonymous access must use layered, privacy-minimized controls and must not claim
to identify a unique person.

The server must issue a signed, expiring visitor token with at least 128 bits of
random entropy in an `HttpOnly`, `Secure`, `SameSite=Strict`, narrowly scoped
cookie. Every chat request must also pass exact same-origin, Fetch Metadata,
CSRF-header, content-type, size, and schema validation before retrieval or a
paid provider call. Token issuance must be rate limited.

The visitor token is the primary quota key. A short-lived daily keyed network
bucket may supplement it, using an IPv4 `/24` or IPv6 `/56` prefix and no raw
address persistence. Supplemental signals are pseudonymous, not anonymous, and
must expire within 48 hours. High-entropy browser or device fingerprinting is
prohibited in the MVP.

Every OpenAI model request must include a stable, non-PII `safety_identifier`
derived from the visitor ID using a purpose-specific keyed hash. It must be
distinct from prompt-cache identifiers and conform to the provider length
limit.

Per-visitor, network, concurrency, global monetary, request-shape, and provider
project controls must compose. The network daily monetary limit must not exceed
one quarter of the global daily budget. The global atomic budget remains the
absolute application cost boundary when anonymous signals are reset or absent.

Production must fail closed before retrieval or provider use when mandatory
token, same-origin, proxy-trust, key, quota-store, or budget checks cannot be
verified. Failure of an optional coarse client signal alone must not deny
access. Bulgarian and English notices must accurately describe the signals,
purposes, recipients, and retention.

## Added acceptance criteria

### AC-11 — Stateless provider request

An automated SDK-boundary test proves that every Responses API request contains
`store: false` and contains neither `conversation` nor `previous_response_id`.

### AC-12 — State integrity

Missing state may start a conversation only through the explicit new-chat flow.
Altered, expired, oversized, unsupported-version, or visitor-mismatched state is
rejected without a retrieval or OpenAI call.

### AC-13 — State lifetime and limits

Automated tests prove the 60-minute idle TTL, four-hour absolute TTL, ten-user-
turn limit, 128 KiB envelope limit, and absence of silent truncation.

### AC-14 — Content-free persistence and logs

Integration tests inspect the usage store, application logs, access logs, and
backups and find no question text, response text, image data, authorization
headers, or conversation envelopes.

### AC-15 — Cleanup

Success, validation failure, provider failure, timeout, disconnect, and process
recovery tests prove that request buffers and temporary images follow the
retention matrix in ADR-0001.

### AC-16 — Privacy notice parity

Reviewed Bulgarian and English privacy notices describe the implemented data
flow and retention behavior without claiming unsupported provider controls.

### AC-17 — Provider configuration review

Before public release, the selected OpenAI project, model, SDK version, prompt
cache behavior, file lifecycle, and data controls are verified against current
official documentation and the result is recorded in release evidence.

### AC-18 — Monotonic severity

Unit and integration tests prove that no client field, prior message, retrieval
result, model field, or renderer path can lower the deterministic urgency floor.

### AC-19 — Fixed critical rendering

Every reviewed critical case renders only the fixed localized critical response
contract. No model-generated cause, diagnostic, tool, part, or procedural step
is displayed.

### AC-20 — Caution restrictions

Every caution case renders only the reviewed caution shell, known facts, missing
information, handoff, and enabled action codes. `generated_steps` is empty.

### AC-21 — Strict output validation

Provider refusal, incomplete output, JSON parsing failure, schema failure,
unknown hazard/action/source IDs, unmet action preconditions, and unsupported
citations all fail to a caution response without procedural steps.

### AC-22 — Hazard coverage

Every hazard in PA-SAFE-001 has positive, negative, negated-language,
ambiguous, and combined-hazard tests in Bulgarian and English.

### AC-23 — Domain review

A qualified Bulgarian plumbing/heating professional approves every production
hazard row, enabled action, and Bulgarian/English fixed template. Critical cases
receive a second or recorded challenge review.

### AC-24 — Safety release threshold

The reviewed release set achieves 100% recall for critical hazards and renders
zero procedural instructions for critical or out-of-scope cases.

### AC-25 — Reviewed dataset size and coverage

The release dataset contains at least 120 reviewed Bulgarian/English scenario
pairs and satisfies every stratum and cross-cutting coverage constraint in
PA-EVAL-001.

### AC-26 — Deterministic grader pass

All deterministic component, schema, post-validation, renderer, fail-closed, and
action-precondition tests pass with zero failures.

### AC-27 — Safety gates

Every release-blocking safety gate in PA-EVAL-001 passes on every required
repetition, including 100% critical recall and zero unsafe procedural guidance
in critical or out-of-scope cases.

### AC-28 — Quality and bilingual gates

Every quality and bilingual metric meets its stated numerator, denominator, and
threshold. Critical Bulgarian/English pairs agree on urgency, hazards, and
action codes in 100% of executions.

### AC-29 — Human and automated grader agreement

The review record demonstrates at least 0.80 Cohen's kappa for independent human
urgency and allowed-action labels before the release dataset is frozen. Any
model-based grader is separately calibrated against human decisions.

### AC-30 — Reproducible run manifest

Every release evaluation records the application commit and immutable model,
prompt, schema, policy, source, dataset, reasoning, and tool configuration.

### AC-31 — Operational thresholds

WP-03 replaces all `TBD` cost and latency gates with measured, owner-approved
values. No public release gate may pass while those values remain undefined.

### AC-32 — Continuous regression

Relevant pull requests run targeted evaluation strata, and a release candidate
runs the complete reviewed suite with a content-free `PASS` report committed or
linked as release evidence.

### AC-33 — Integer monetary accounting

Unit tests prove upward rounding and exact integer cost calculation for every
enabled model, token class, image class, and retrieval tool.

### AC-34 — Atomic admission

Concurrent transaction tests prove that no two requests can reserve the same
remaining visitor or global budget and that admission cannot exceed either
limit.

### AC-35 — Ten-visitor invariant

Configuration and load tests prove that ten visitors exhausting their individual
daily limits reserve or charge no more than 50% of the global daily limit.

### AC-36 — Conservative uncertain outcome

Timeout, disconnect, crash, and ambiguous provider-acceptance tests retain or
settle the full reservation and never release unverified cost.

### AC-37 — Reservation recovery

Idempotent recovery tests settle stale reservations exactly once, repair
concurrency, and preserve a ledger audit trail after process termination at each
reservation lifecycle boundary.

### AC-38 — Circuit breaker

The shared circuit breaker blocks retrieval and provider calls when the global
limit, storage-health, price-catalogue, or invariant conditions require it, and
closing it does not erase accounting history.

### AC-39 — Price and deployment verification

Release evidence records the active price-catalogue version, source and review
date, request caps, datastore conformance result, and verified provider-project
monthly spend cap.

### AC-40 — WP-03 calibration

WP-03 replaces development placeholders with measured request and monetary
limits. No placeholder is accepted in public production configuration.

### AC-41 — Visitor-token security

Automated tests prove token entropy, signing, tamper rejection, expiry, cookie
attributes, key rotation, and absence of IP or browser attributes in the token.

### AC-42 — Same-origin paid path

Integration tests prove invalid token, Origin, Fetch Metadata, CSRF header,
content type, body size, or input schema is rejected before retrieval or any
OpenAI call.

### AC-43 — Reset-resistant layering

Reset and parallel-client tests prove deleting a visitor token does not bypass
network, concurrency, global atomic budget, or circuit-breaker controls.

### AC-44 — Signal minimization and retention

Log, trace, metric, ledger, backup, and expiry tests prove raw connection
addresses, raw tokens, visitor IDs, and high-entropy fingerprints are not
retained and daily buckets are unlinkable after at most 48 hours.

### AC-45 — OpenAI safety identifier

SDK-boundary tests prove every model request carries a stable, purpose-separated,
non-PII `safety_identifier` within the provider length limit.

### AC-46 — Trusted proxy boundary

Deployment and integration tests prove only explicitly trusted proxies can
supply client-address headers and ambiguous proxy configuration fails closed.

### AC-47 — No mandatory fingerprint

The chat works with permitted browser privacy protections when the visitor token
and same-origin proofs are valid. No canvas, WebGL, audio, font, plugin, device,
sensor, or cross-site identifier is collected.

### AC-48 — Bounded distributed-abuse outcome

Load tests prove one network cannot be configured to consume more than 25% of
the global daily budget and distributed traffic cannot exceed the global atomic
admission budget, although it may exhaust remaining daily availability.

### AC-49 — Privacy and threshold release evidence

WP-03 records measured thresholds and shared-network false-positive results.
Public release requires reviewed Bulgarian and English notices plus a recorded
privacy/legal review of the deployed behavior.
