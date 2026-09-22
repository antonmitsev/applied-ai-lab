# Plumbing Assistant — Requirements v0.2 Approved Audit Delta

| Field | Value |
| --- | --- |
| Status | Frozen normative component of PA-REQ-002 |
| Date opened | 2026-09-22 |
| Owner | Anton Mitsev |
| Base document | [Requirements v0.1](plumbing-assistant-v0.1.md) |
| Baseline manifest | [PA-REQ-002](plumbing-assistant-v0.2.md) |
| Audit | [PA-AUDIT-001](../audits/plumbing-assistant-project-definition-audit.md) |

## Purpose of this delta

This document records the approved requirements introduced while the v0.1 audit
findings were addressed. Together with Requirements v0.1 it is a frozen,
normative component of PA-REQ-002. The baseline manifest supplies the stable
implementation entry point and precedence rule without duplicating these
requirements into a diverging copy.

## Change log

| Audit finding | Requirement change | Status |
| --- | --- | --- |
| `AUD-P0-001` | Added FR-13 and AC-11 through AC-17 | Approved for implementation |
| `AUD-P0-002` | Added FR-14 and AC-18 through AC-24 | Domain-expert review required |
| `AUD-P0-003` | Added FR-15 and AC-25 through AC-32 | Evaluation implementation required |
| `AUD-P1-004` | Added FR-16 and AC-33 through AC-40 | Approved for implementation; WP-03 values pending |
| `AUD-P1-005` | Added FR-17 and AC-41 through AC-49 | Approved for implementation; privacy review and WP-03 values pending |
| `AUD-P1-006` | Added FR-18 and AC-50 through AC-59 | Approved design; WP-01 research and ingestion implementation pending |
| `AUD-P1-007` | Added FR-19 and AC-60 through AC-70 | Approved design; implementation, privacy notice, and verification pending |
| `AUD-P1-008` | Added FR-20 and AC-71 through AC-82; response schema v2 | Approved design; implementation and adversarial evaluation pending |
| `AUD-P1-009` | Added FR-21 and AC-83 through AC-94 | Approved design; CLI/server implementation and interoperability tests pending |
| `AUD-P2-010` | Added FR-22 and AC-95 through AC-101 | Traceability and base CI implemented; application suites and protected settings pending |
| `AUD-P2-011` | Added FR-23 and AC-102 through AC-112 | Bilingual source copy and route contract complete; UI, deployment verification, and qualified reviews pending |

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

### FR-18 — Governed sources and reproducible ingestion

Curated retrieval must implement
[PA-SOURCE-001](../sources/plumbing-assistant-source-governance.md). The
repository-owned, schema-validated source registry is authoritative; provider
files and vector stores are derived deployment artifacts.

WP-01 must produce a reviewed source record for every curated document,
including publisher/manufacturer, product and exact variant scope, title,
version, publication date, language, canonical URL, access date, SHA-256,
rights decision and evidence, reviewer and dates, lifecycle state, citation
tier, and supersession linkage. Publicly reachable content must not be assumed
to permit ingestion or redistribution.

Only current, review-valid, rights-approved records with `status: approved` may
enter an index. Index builds must pin the registry commit, source checksums,
ingestion program, extraction profile, chunking profile, and provider
configuration, and must emit a conforming immutable index manifest. A partial or
failed staging build must never become active.

Runtime results must join to the active registry snapshot and pass lifecycle,
scope, language, build, score, and claim-entailment checks. Citation titles,
URLs, tiers, and IDs must come from the registry rather than retrieved content
or generated labels.

Exact compatibility claims require an approved current source that explicitly
identifies the exact manufacturer and model/variant and entails the claimed
match. Family guidance, visual similarity, retail data, or model memory is
insufficient; absent exact evidence, compatibility must be reported as not
established.

Withdrawal or supersession must immediately suppress the source at runtime and
trigger a verified replacement index. Cleanup must remove both the vector-store
attachment and the underlying provider File when no approved build references
it. Live web results must never enter the curated index without the complete
WP-01 review lifecycle.

### FR-19 — Secure image input lifecycle

Image input must implement
[PA-IMG-001](../security/plumbing-assistant-image-security.md). An image is
untrusted, potentially sensitive, current-request data and must not be accepted
on the basis of its filename, extension, or browser MIME type.

The MVP accepts at most one JPEG, PNG, or non-animated WebP image per request,
with a maximum encoded size of 8 MiB, maximum decoded size of 25 megapixels and
8,192 px per dimension, and maximum 20:1 aspect ratio. Complete signature,
container, malware, resource-bounded decode, and animation checks are mandatory.

Every accepted input must be orientation-corrected, converted to sRGB, stripped
of metadata and alpha, resized without upscaling to at most 2,048 px on the long
edge, and re-encoded as a new JPEG no larger than 4 MiB. The original must never
be sent directly to the provider.

The normal path sends the normalized JPEG as an inline Base64 `input_image` with
`detail: high` in the current foreground Responses API request. It must set
`store: false`, must not request echo of the image URL, and must not create a
provider File. If an exceptional File path is later enabled, it requires the
shortest supported expiry, immediate confirmed deletion, orphan reconciliation,
and an image-route circuit breaker for cleanup backlog.

Image bytes, Base64, thumbnails, hashes, metadata, filenames, local paths, and
provider file IDs must not enter conversation state, general logs, traces,
metrics, analytics, the usage ledger, or backups. Browser and local temporary
artifacts must be removed on every completion and failure path; a janitor must
remove abandoned local artifacts within 15 minutes.

Image evidence must not lower safety urgency or establish exact compatibility
by visual similarity alone. Failure of image readiness or processing disables
the image route explicitly and may leave text-only chat available; the system
must never silently answer as if a rejected image had been inspected.

### FR-20 — Staged retrieval and prompt-injection containment

Retrieval must implement
[PA-RET-001](../security/plumbing-assistant-retrieval-security.md). User input,
conversation text, images/OCR, document bodies, web content, tool output, model
output, titles, and URLs are untrusted data and must never be interpolated into
developer messages or treated as permission.

The application must separate retrieval planning, curated search, isolated live
web search, evidence validation, tool-free final synthesis, and deterministic
post-validation. Curated search is a direct server operation. The isolated web
call receives only a minimized validated query and `web_search`; it receives no
private context or other tool. The final synthesis call must have no tools.

At most two 200-character minimized queries and two web tool calls are allowed.
Queries must exclude raw messages/history, retrieved/OCR text, URLs, markup,
controls, obfuscation, credentials, PII, secrets, and application identifiers.
A later query must not be derived from an earlier result.

Every retrieved item must pass the active source/domain policy, URL
normalization, relevance, scope, score, injection-signal, and size gates and
enter a request-local bundle conforming to
[PA-EVIDENCE-001](../contracts/retrieval-evidence.schema.json). Live web evidence
cannot establish exact compatibility. Quarantined items must not reach final
synthesis. Absent eligible evidence, the system must return insufficient
evidence without procedural guidance or model-memory fallback.

Final model output must conform to assistant response schema version 2 and emit
only evidence IDs. The server must validate claim eligibility and entailment,
then hydrate titles, canonical HTTPS URLs, tiers, and localized labels from the
validated registries. Retrieved HTML, model-authored URLs, and Markdown links
must never be rendered.

Raw plans, queries, results, excerpts, URLs, evidence bundles, and injection
payloads are request-memory data and must not enter logs, traces, analytics,
usage storage, conversation state, or backups. Injection detection is defense in
depth and must not be represented as complete protection.

### FR-21 — Versioned administrative request signing

The read-only statistics endpoint and local CLI must implement
[ADR-0004](../decisions/0004-administrative-request-signing.md) exactly. The
MVP protocol is `PA-ADMIN-SIG-1` and supports only an empty-body
`GET /api/admin/stats` request with one allowlisted `period` parameter.

The Ed25519 signature must cover the protocol version, configured deployment
audience, key ID, Unix timestamp, 32-byte one-time nonce, method, exact path,
canonical query, empty content-type field, and SHA-256 digest of the zero-byte
body. All canonical fields are ASCII, joined by LF with no trailing LF. Unicode,
ambiguous paths, unsupported encodings, duplicate headers, bodies, and transfer
framing must fail closed rather than be normalized.

The server must reconstruct canonical bytes from the raw Node.js request target,
verify a current audience/route-scoped public key and a timestamp within 90
seconds, then atomically consume the nonce in a persistent shared store before
returning statistics. The nonce record must survive restart and remain for five
minutes. Exactly one concurrent use may succeed.

Private keys must remain on administrator devices in PKCS#8 PEM or an
OS-backed key store and must never enter the repository, browser, server,
environment variables, command arguments, logs, or telemetry. The runtime key
registry stores SPKI Ed25519 public keys only and supports pending, active,
retiring, and revoked states with audience, route, and validity bounds.

HTTPS and an explicit trusted-proxy boundary are mandatory. The endpoint must
fail closed when clock health, the replay store, key registry, raw-target
preservation, or authentication cannot be verified. Authentication failures use
one generic response; successful statistics responses are non-cacheable and
contain only the approved FR-12 aggregates.

### FR-22 — Requirements traceability and repository quality gates

The project must implement
[PA-REPO-001](../engineering/repository-conventions.md) and maintain
[PA-TRACE-001](../traceability/plumbing-assistant.md) as the authoritative
mapping from every active FR and AC to its design, implementation owner,
automated evidence, AI evaluation or metric, and current status.

CI must deterministically reject invalid JSON/JSONL, broken local documentation
links, unresolved local schema references, missing or duplicate traceability
coverage, invalid protocol vectors, and tracked secret/runtime artifacts. Pull
requests must receive dependency review. Repository secret scanning, push
protection, and protected required checks must be enabled and evidenced outside
the committed files.

The current typed top-level documentation layout is permitted while Plumbing
Assistant is the only application. Before a second application is added,
application-owned documents, evaluations, and sources must migrate together to
an explicit `apps/<slug>/` namespace; only genuinely shared artifacts may remain
at the root.

The first application scaffold must add real format, lint, strict type, unit,
integration, and browser-test jobs. Model smoke and release evaluations must run
only from trusted commits with bounded credentials and sanitized reports. Empty
or always-success placeholders do not count as evidence, and fork pull requests
must never receive provider, deployment, signing, or holdout-data secrets.

### FR-23 — Public service pages and landing-page disclosures

The application must implement
[PA-SERVICE-001](../service/README.md) and its versioned bilingual source copy.
The 0BSD license governs repository source code; it must not be presented as a
replacement for the Terms, Privacy Notice, Cookie Policy, Safety Notice, or
Source Policy governing the operated service.

The Bulgarian landing page `/`, English landing page `/en`, and every public
application page must have persistent footer links to separate Bulgarian and
English SSR routes for Terms, Privacy, Cookies, Safety, and Sources. Every
service page must expose its version and update date, work without client-side
JavaScript, provide language and landing-page navigation, and meet the same
keyboard and screen-reader requirements as the main interface.

Before the first chat submission, the interface must clearly state that the
visitor is interacting with AI rather than a person, that output may be wrong,
and that the service does not replace a qualified professional. The concise
notice must link to the full Safety and Privacy pages and must not be hidden only
inside Terms or behind an acknowledgement control.

The persistent footer must include `© 2026 Anton Mitsev` linked to
`https://tonymitsev.com`, a correction/contact link, the public source-code
repository, and the 0BSD license. Copyright attribution must not imply that
third-party cited material is owned or relicensed by the project.

The MVP storage profile is necessary-only: one secured visitor cookie and
current-tab `sessionStorage`, with no advertising, cross-site tracking,
analytics cookie, or high-entropy fingerprinting. The Cookie Policy remains
linked without showing a fictitious consent banner. Any future non-essential
technology must be disabled until a valid opt-in, provide equally easy reject
and withdrawal controls, and trigger prior bilingual policy and test updates.

The source copy must disclose service limitations, emergency and professional
handoff, source selection, correction/contact process, recipients, purposes,
retention, data-subject rights, and unresolved deployment facts. It must not be
marked final before the real hosting/provider configuration is verified and
the required qualified legal/privacy and domain reviews are recorded.

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

### AC-50 — Source-registry contract

The WP-01 registry validates against the pinned schema and automated semantic
checks enforce unique IDs, valid lifecycle transitions, review dates, rights
decisions, scope rules, and valid supersession references.

### AC-51 — Approved-only ingestion

Tests prove candidate, in-review, rejected, withdrawn, superseded, expired,
checksum-mismatched, or rights-unapproved records cannot be uploaded or activated.

### AC-52 — Exact compatibility refusal

Bulgarian and English evaluation cases prove exact compatibility is asserted
only for a matching approved model/variant passage and is otherwise explicitly
reported as not established.

### AC-53 — Reproducible index receipt

Every build emits a schema-valid index manifest binding the registry commit,
source and extracted checksums, program and profile versions, provider file IDs,
processing states, and verification results.

### AC-54 — Staging activation

Integration tests prove only a complete, checksum-valid, smoke-tested staging
build can atomically become active and that the previous build remains available
for the bounded rollback window.

### AC-55 — Withdrawal and deletion

Tests prove a withdrawal is denied at runtime before rebuild, absent from the
replacement index, detached from the vector store, deleted as an underlying
provider File when unreferenced, and absent from known-document search.

### AC-56 — Citation integrity

Every rendered citation maps to the active registry's immutable source ID,
canonical HTTPS URL, reviewed title, and tier; every procedural step maps to an
entailing retrieved passage.

### AC-57 — Rights and repository boundary

Automated checks reject provider ingestion without an approved ingestion
decision and reject committing source bytes without approved redistribution.

### AC-58 — Freshness and reconciliation

Expired reviews fail closed. Scheduled checks detect changed or unavailable
sources without auto-approving new bytes, and provider reconciliation reports no
orphaned files, unknown indexed sources, or missing approved sources.

### AC-59 — WP-01 and retrieval release evidence

Grounded public release requires a reviewed non-empty WP-01 registry, documented
coverage gaps, bilingual retrieval evaluation, and an active registry commit and
index build ID in the release report.

### AC-60 — Upload framing and bounds

Tests prove exact one-image, byte, multipart, field-count, dimension, pixel,
aspect-ratio, normalized-size, and streaming limits for declared and chunked
requests.

### AC-61 — Actual-format validation

Fixtures prove fake MIME/extension, truncation, corruption, unsupported formats,
animated input, polyglots, trailing payloads, and decompression bombs fail before
the main provider call.

### AC-62 — Scanner and decoder isolation

Scanner and isolated decoder tests cover unavailable, timeout, crash, memory,
CPU, malformed-output, and concurrency failures with no fallback to original
bytes.

### AC-63 — Metadata-free normalization

Tests with EXIF GPS and orientation, XMP, IPTC, ICC, comments, thumbnails,
filenames, and alpha prove correct oriented pixels and absence of forbidden data
in the normalized JPEG.

### AC-64 — Inline provider boundary

SDK-boundary tests prove the normal path sends only the normalized inline JPEG
with `detail: high`, `store: false`, no image echo include, no provider File, and
no original bytes or metadata.

### AC-65 — Local cleanup and recovery

Success, rejection, disconnect, cancellation, timeout, decoder crash, provider
failure, invalid output, process restart, and janitor tests leave no local image
artifact beyond the 15-minute recovery ceiling.

### AC-66 — Exceptional provider File cleanup

If the File path is enabled, tests prove configured expiry, immediate confirmed
deletion, lost-response orphan reconciliation, cleanup-ledger expiry, and a
circuit breaker for any unconfirmed object older than 15 minutes.

### AC-67 — Image-data exclusion

Capture tests find no image bytes, Base64, thumbnails, hashes, metadata,
filenames, local paths, or provider file IDs in browser stores, conversation
envelopes, general logs, traces, metrics, analytics, usage storage, or backups.

### AC-68 — Safety and evidence composition

Tests prove images cannot lower urgency, conflicts trigger `HZ-013`, unreadable
images do not cause invented identification, and visual similarity alone cannot
establish exact compatibility.

### AC-69 — Resource and cost containment

Concurrent-upload tests stay within decoder worker, memory, temporary-storage,
timeout, concurrency, token, and atomic monetary limits.

### AC-70 — Bilingual image release evidence

Reviewed Bulgarian and English notices, errors, and evaluation cases cover
clear, unreadable, misleading, conflicting, safety-critical, label-detail, and
exact-compatibility images and match deployed retention behavior.

### AC-71 — Trust-channel separation

Message-construction tests prove untrusted or model-generated variables never
enter developer messages and API keys, tokens, internal records, and server
paths never enter any model request.

### AC-72 — Stage and tool isolation

Tests prove curated search is server-owned, only the isolated public call has
`web_search`, it has no private context or other tool, and final synthesis
enforces an empty tool list and `tool_choice: none` or equivalent.

### AC-73 — Query minimization

Tests enforce two queries, 200 characters each, and reject controls, bidi and
zero-width obfuscation, URLs, markup, code, credentials, PII, secrets, raw
history/OCR/results, and result-derived query recursion.

### AC-74 — Domain and URL enforcement

Tests cover domain-policy expiry, suffix tricks, IDNA confusables, credentials,
ports, IP/private hosts, shorteners, redirects, nested URLs, parameters,
fragments, schemes, escaping, and secure external-link attributes.

### AC-75 — Evidence contract and bounds

Every retrieval result passes schema and semantic validation, unique active
source joins, claim-scope and score rules, at most eight items, 1,200 characters
per excerpt, 8,000 total excerpt characters, and quarantine rules.

### AC-76 — Tool and budget containment

SDK-boundary and load tests prove the fixed tool set, two-tool-call ceiling,
timeouts, result/output limits, no autonomous recursion, and ADR-0002 atomic
cost reservation and reconciliation.

### AC-77 — ID-only model citations

Assistant response schema version 2 accepts only source IDs from the model;
unknown, stale, quarantined, wrong-scope, non-entailing, or exact-compatibility-
ineligible IDs fail closed.

### AC-78 — Server-owned citation rendering

Rendering tests prove titles, URLs, tiers, and labels come only from validated
server registries and no retrieved HTML, script, model URL, or Markdown link is
rendered.

### AC-79 — Insufficient-evidence behavior

Retrieval failure, policy expiry, empty or all-quarantined results, conflicts,
URL/citation failure, timeout, and circuit breaker produce
`insufficient_evidence` with no procedural steps or model-memory fallback.

### AC-80 — Retrieval-data exclusion

Capture tests find no plans, queries, raw results, excerpts, URLs, evidence
bundles, or injection payloads in general logs, traces, analytics, usage storage,
conversation envelopes, metrics labels, or backups.

### AC-81 — Adversarial retrieval gates

The reviewed bilingual corpus covers direct and indirect injection, fake policy,
urgency downgrade, tool and secret requests, exfiltration, hidden/encoded text,
citation spoofing, malicious empty results, poisoned documents, OCR/images, and
multi-turn persistence with zero unauthorized tool calls, safety-floor changes,
unapproved URLs/actions, or exfiltration.

### AC-82 — Retrieval release evidence

The release report binds application, prompt, assistant/evidence schemas,
domain/source policy, adversarial corpus, detector, model, and tool configuration
versions and contains no open retrieval circuit-breaker incident.

### AC-83 — Canonical byte interoperability

Independent CLI and server implementations reproduce every canonical byte,
digest, and signature in the versioned language-independent test vector,
including UTF-8, LF-only separators, the empty content-type line, and no trailing
LF.

### AC-84 — Narrow request contract

Tests accept only uppercase `GET`, exact `/api/admin/stats`, one
`period=(1d|7d|30d)` pair, zero body bytes, and permitted empty-body framing;
all aliases, extra parameters, duplicate route parameters, bodies, and transfer
encodings fail closed.

### AC-85 — Header and encoding strictness

Tests reject missing or repeated signing headers, coalescing ambiguity,
non-grammar whitespace, controls, CR/LF, Unicode, invalid UTF-8, padded or
non-canonical base64url, wrong decoded lengths, malformed timestamps, key IDs,
and nonces.

### AC-86 — Query canonicalization

Cross-language tests prove the canonical query is the unchanged single ASCII
`period` pair and reject reordered/extra or repeated pairs, literal plus, `%20`,
percent escapes including unreserved forms, double encoding, delimiters, empty
pairs, fragments, Unicode, and invalid escapes without framework-dependent
normalization.

### AC-87 — Signature and scope verification

Tests prove pure Ed25519 verification over the reconstructed canonical request,
reject every single-field or byte mutation, and reject wrong keys, algorithms,
audiences, routes, deployments, and body digests.

### AC-88 — Time-window enforcement

Tests accept timestamp offsets of exactly `-90` and `+90` seconds, reject `-91`
and `+91`, reject unhealthy clock state, and verify deployment clock offset is
at most 30 seconds.

### AC-89 — Atomic replay prevention

Concurrent tests prove exactly one insertion and at most one success for a
nonce. Replay remains rejected across process restart and instances; store
outage fails closed; records remain for five minutes and are not consumed by an
invalid signature.

### AC-90 — Raw request and proxy boundary

Deployment tests prove HTTPS enforcement, trusted forwarding, header
multiplicity inspection, and byte-identical raw request targets from CLI through
edge/proxy to the Node.js boundary. Unverified rewriting disables the endpoint.

### AC-91 — Key lifecycle and separation

Registry tests reject private, non-Ed25519, duplicate, test-vector, wrongly
scoped, not-yet-valid, expired, pending, and revoked keys; accept only active or
bounded retiring keys; and prove normal rotation and emergency revocation
without clearing replay state.

### AC-92 — CLI private-key handling

The CLI never accepts private-key bytes in arguments or environment variables,
checks local file ownership and mode, supports encrypted PKCS#8 or an OS-backed
key, redacts errors, and does not leak keys, passphrases, canonical requests,
nonces, or signatures to shell history or logs.

### AC-93 — Generic failures and private responses

All authentication failures return the same `401 admin_auth_failed` response;
verification infrastructure failure returns `503 admin_auth_unavailable` with
no fallback. CORS, caches, logs, traces, metrics, and errors expose neither
authentication material nor statistics payloads.

### AC-94 — Administrative release evidence

The release report binds protocol, CLI, server, key-registry, proxy, replay-
store, and test-vector versions and includes passing interoperability, tamper,
concurrency/restart, rotation/revocation, redaction, rate-limit, and aggregate-
field allowlist suites.

### AC-95 — Complete traceability coverage

The repository validator proves every active `FR-01` through `FR-23` and
`AC-01` through `AC-112` appears exactly once in PA-TRACE-001, including IDs
expanded from ranges, with every required column populated.

### AC-96 — Coupled change control

Pull requests changing requirements, designs, contracts, component ownership,
tests, metrics, or status update the affected traceability rows in the same
change; CI rejects missing, duplicated, obsolete, or unknown IDs.

### AC-97 — Repository ownership convention

Review proves each artifact follows PA-REPO-001 ownership and naming rules. A
second application cannot merge before the documented namespace migration is
complete and all links and traceability checks pass.

### AC-98 — Deterministic repository validation

The read-only PR/push workflow passes JSON/JSONL, local-link, local-schema-ref,
traceability, cryptographic-vector, and repository-hygiene checks using the
repository-owned validator and no application/provider secrets.

### AC-99 — Implementation test gates

The first application scaffold introduces non-placeholder format, lint, strict
type, unit, integration, browser, and coverage jobs; changed behavior cannot
merge while an applicable required job is missing, skipped, or failing.

### AC-100 — Supply-chain and secret controls

Dependency review blocks newly introduced moderate-or-higher vulnerabilities;
external actions are pinned and update-monitored; secret scanning and push
protection are enabled; fork pull requests receive no protected secrets.

### AC-101 — Protected release evidence

Protected `main` requires repository quality, dependency, implementation, and
applicable evaluation checks. Closure evidence records the repository settings,
passing checks, application test paths, sanitized evaluation report, and a
traceability review with no unexplained implementation-pending release item.

### AC-102 — Complete bilingual route set

SSR integration tests return `200` for `/terms`, `/privacy`, `/cookies`,
`/safety`, `/sources` and their `/en/...` counterparts. Each route has the
correct document title, `lang`, canonical URL, reciprocal language link,
content version, update date, and landing-page navigation without requiring
client-side JavaScript.

### AC-103 — Persistent landing and footer links

Browser tests prove the five service-page links are keyboard-accessible and
visible in the footer of both landing pages, every service page, and every chat
state. Links resolve within the selected language and no production route uses
a placeholder or dead target.

### AC-104 — First-interaction AI disclosure

Before the first message can be submitted, Bulgarian and English views visibly
state that the visitor is interacting with AI, output may be wrong, and the
service does not replace a qualified professional. The notice links to Safety
and Privacy, is announced accessibly, and remains available after chat starts.

### AC-105 — Terms and license separation

Content tests prove the Terms cover operated-service scope, permitted use,
availability, limitations, mandatory-rights preservation, changes, and contact;
identify 0BSD as applying to source code only; and make no claim that a blanket
disclaimer removes non-excludable legal obligations.

### AC-106 — Privacy notice deployment parity

Before release, reviewed Bulgarian and English Privacy pages name the actual
controller, purposes, proposed and approved legal bases, data categories,
recipients/processors, international-transfer safeguards, retention, rights,
complaint authority, contact, OpenAI behavior, and every deployed browser or
server-side storage mechanism. No unresolved placeholder may reach production.

### AC-107 — Cookie behavior parity

In the necessary-only profile, tests find no non-essential cookie/storage,
analytics, advertising, cross-site identifier, high-entropy fingerprinting, or
misleading consent banner. If configuration enables a non-essential technology,
tests prove it remains blocked before opt-in and that reject and withdrawal are
as easy as acceptance.

### AC-108 — Safety and emergency copy

The concise and full bilingual Safety notices preserve the approved domain
scope, AI limitation, critical stop conditions, 112 wording for immediate
danger, out-of-scope boundaries, professional handoff, and the rule that images
or model output cannot lower a deterministic safety floor. A qualified domain
review is recorded before release.

### AC-109 — Public source policy

The bilingual Source Policy explains source tiers, live-search use, citation
limits, rights, freshness, withdrawal, non-endorsement, unfinished WP-01/WP-02,
and the correction channel. Tests prove cited titles and URLs originate from
validated server evidence rather than free model output.

### AC-110 — Correction and contact path

Every service page exposes the configured contact path. A documented process
can receive, triage, correct, withdraw, and record unsafe, inaccurate, stale,
privacy, and rights reports without asking the reporter to resend unnecessary
personal or protected content.

### AC-111 — Copyright and repository links

The persistent footer renders exactly `© 2026 Anton Mitsev` linked to
`https://tonymitsev.com`, plus valid links to the public source repository and
its 0BSD license. Accessibility and link tests cover both languages and all
public layouts.

### AC-112 — Versioned review and release evidence

Repository validation proves that every required document has one Bulgarian
and one English source, unique routes, matching version/date metadata, required
footer entries, and a necessary-only storage profile. Public release additionally
requires recorded legal/privacy review, domain review, deployment verification,
passing SSR/browser/accessibility tests, and rendered-content digests bound to
the released version.
