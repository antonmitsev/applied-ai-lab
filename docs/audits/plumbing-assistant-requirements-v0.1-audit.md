# Plumbing Assistant — Requirements and Repository Audit

| Field | Value |
| --- | --- |
| Audit ID | `PA-AUDIT-001` |
| Status | Open |
| Audit date | 2026-09-22 |
| Audit role | Chief AI Architect |
| Audited baseline | [Requirements v0.1](../requirements/plumbing-assistant-v0.1.md) |
| Related architecture | [Architecture context](../architecture/plumbing-assistant.md) |
| Next review | After the P0 exit criteria are met |

## 1. Executive decision

Requirements v0.1 are accepted as a strong discovery baseline and are suitable
for an architecture spike or a non-public prototype.

The project is **not ready for a public production MVP**. The release decision
is `NO-GO` until the three P0 findings are closed: explicit conversation and
data retention, independently enforced safety controls, and measurable release
evaluations.

This is not a rejection of the product direction. The scope, users, language,
retrieval strategy, anonymous-access intent, cost controls, and administrative
statistics are coherent. The remaining work is primarily specification
hardening: turning good intentions into deterministic behavior and testable
release gates.

## 2. Scorecard

| Area | Score | Assessment |
| --- | ---: | --- |
| Product clarity and scope | 8/10 | Clear audience, geography, languages, and domain boundaries |
| AI and retrieval architecture | 7/10 | Sound RAG direction; source lifecycle is not yet governed |
| Safety engineering | 5/10 | Hazards are recognized; enforcement and tests are underspecified |
| Privacy and retention | 5/10 | Data minimization is stated; provider and conversation state are unresolved |
| Abuse and cost controls | 6/10 | Layered controls exist; accounting units and concurrency semantics are unclear |
| Testability and evaluation | 5/10 | Evaluation areas exist; datasets, metrics, and thresholds do not |
| Repository structure | 8/10 | Clean and proportionate for one pre-implementation application |

Scores describe specification maturity, not implementation quality. There is no
production implementation to audit yet.

## 3. Scope and method

The audit covers:

- completeness, consistency, and testability of Requirements v0.1;
- alignment between the requirements and the architecture context;
- AI safety, retrieval, privacy, abuse, cost, and operations concerns;
- the repository structure required to support implementation and evidence.

The audit does not cover application code, deployed infrastructure, cloud or
OpenAI project settings, penetration testing, legal compliance, source-document
quality, or expert validation of plumbing advice because those artifacts do not
yet exist.

Priorities mean:

- **P0:** must close before a public MVP;
- **P1:** must be designed before implementation of the affected component and
  close before public release;
- **P2:** quality and maintainability work that may proceed alongside the MVP.

## 4. What is already strong

- The assistant is aimed at non-professionals and explicitly avoids assuming
  technical knowledge.
- The Bulgarian focus, English option, and metric terminology are unambiguous.
- The boundary between water-side guidance and gas, combustion, and electrical
  work is explicit.
- Responses have a useful structure: urgency, immediate action, known facts,
  uncertainty, diagnostics, stop conditions, escalation, and sources.
- Curated documentation is preferred over live web search, and exact
  compatibility is not delegated to model memory.
- Provider credentials, quota enforcement, and administrative authorization are
  correctly placed on the trusted server.
- Anonymous access is separated from real-world identity, and raw IP addresses,
  fingerprints, questions, responses, and images are excluded from the quota
  store by default.
- The usage store is correctly required to be persistent and atomic rather than
  an in-memory counter or log file.
- Deferred research has been captured as work packages instead of being silently
  lost.

## 5. Findings summary

| ID | Priority | Finding | Release effect |
| --- | --- | --- | --- |
| `AUD-P0-001` | P0 | Conversation state and end-to-end retention are undefined | Blocks public MVP |
| `AUD-P0-002` | P0 | The model can effectively classify and enforce its own safety decision | Blocks public MVP |
| `AUD-P0-003` | P0 | Acceptance criteria and AI evaluations have no measurable gates | Blocks public MVP |
| `AUD-P1-004` | P1 | Budget units, reservation, and concurrency semantics are ambiguous | Blocks public MVP |
| `AUD-P1-005` | P1 | Anonymous identity can be reset and lacks a documented abuse threat model | Blocks public MVP |
| `AUD-P1-006` | P1 | Source governance is deferred but is a prerequisite for grounded answers | Blocks grounded public MVP |
| `AUD-P1-007` | P1 | The image-validation and deletion pipeline is unspecified | Blocks public image input |
| `AUD-P1-008` | P1 | Prompt-injection controls are declarative rather than enforceable | Blocks live retrieval |
| `AUD-P1-009` | P1 | The admin signing protocol lacks byte-level interoperability rules | Blocks admin endpoint release |
| `AUD-P2-010` | P2 | Requirements, components, tests, and metrics are not traceable | Does not block prototype |
| `AUD-P2-011` | P2 | Repository license and operated-service terms are not distinguished | Blocks public service wording |

### Remediation status

| Finding | Status | Evidence |
| --- | --- | --- |
| `AUD-P0-001` | Ready for implementation | [ADR-0001](../decisions/0001-conversation-state-and-retention.md), [Requirements v0.2 draft](../requirements/plumbing-assistant-v0.2-draft.md), architecture update |
| `AUD-P0-002` | Ready for expert review | [Safety Policy and Hazard Matrix](../safety/plumbing-assistant-safety-policy.md), [response schema](../contracts/assistant-response.schema.json), [Requirements v0.2 draft](../requirements/plumbing-assistant-v0.2-draft.md) |
| `AUD-P0-003` | Ready for implementation and review | [Evaluation Plan](../evaluation/plumbing-assistant-evaluation-plan.md), [case schema](../../evals/plumbing-assistant/case.schema.json), [Requirements v0.2 draft](../requirements/plumbing-assistant-v0.2-draft.md) |
| `AUD-P1-004` through `AUD-P2-011` | Open | Address sequentially by priority |

## 6. Detailed findings and remediation

### AUD-P0-001 — Conversation state and retention

**Current status:** `Ready for implementation`. The design and requirements
changes are approved. The finding remains open until the implementation,
configuration review, privacy notices, and automated closure evidence required
by [ADR-0001](../decisions/0001-conversation-state-and-retention.md) exist.

**Evidence:** FR-09 says that conversation content is not stored by default, and
section 9 distinguishes application retention from OpenAI retention. It does not
select a conversation-state mechanism or state what the server sends to, stores
with, and deletes from the provider.

**Risk:** A code-level default can contradict the privacy statement. For example,
OpenAI Responses are stored when `store` is omitted because its default is
`true`. Provider-hosted conversations and vector stores have separate retention
semantics. Images also need a complete lifecycle, not only a promise that the
application database will not retain them.

**Required remediation:** Create a Data and Conversation State ADR that:

1. inventories every data class and processor: messages, images, response IDs,
   conversation IDs, usage counters, logs, files, vector stores, and backups;
2. selects one MVP conversation strategy:
   - server-held ephemeral history with `store: false`; or
   - explicitly accepted provider state with documented retention and deletion;
3. sets `store` explicitly on every Responses API request;
4. defines whether `previous_response_id` or a provider Conversation object is
   permitted and how it is deleted;
5. sets retention, deletion trigger, and responsible component for every class;
6. documents the difference between application state, provider application
   state, and provider abuse-monitoring retention;
7. makes the Bulgarian and English privacy notices match the implemented flow.

**Closure evidence:** Accepted ADR, data-flow diagram, retention matrix, automated
configuration test proving the selected `store` behavior, and integration tests
for expiration/deletion.

### AUD-P0-002 — Safety enforcement is not independent of generation

**Current status:** `Ready for expert review`. The server-owned enforcement
pipeline, preliminary hazard matrix, action registry, strict output contract,
and acceptance criteria are specified in
[PA-SAFE-001](../safety/plumbing-assistant-safety-policy.md). The finding remains
open until domain review, implementation, and the required safety tests exist.

**Evidence:** FR-03 and FR-04 define urgency and stop behavior, while the
architecture mentions input pre-checks and output policy enforcement. No
contract specifies which decisions are deterministic, which are model-produced,
or how unsafe output is prevented from reaching the user.

**Risk:** A single model response can both misclassify a hazard and produce the
instructions that the classification was meant to block. A disclaimer does not
compensate for a missing control boundary.

**Required remediation:** Specify and implement this pipeline:

```text
validate input
  -> deterministic pre-triage
  -> retrieval and model generation into a strict schema
  -> server-side schema and policy validation
  -> fixed critical/caution template OR validated normal response
```

The server-owned hazard matrix must cover at least uncontrolled leakage,
wastewater exposure or backup, scalding, abnormal pressure, water near
electricity, building-common installations, sealed heat meters, mixed gas or
combustion cases, and insufficient evidence. For each hazard define trigger
signals, questions allowed, immediate safe actions, prohibited instructions,
escalation, and the fixed response template.

Moderation may be one layer, but it is not a substitute for domain-specific
hazard controls. Plumbing and heating specialists must review the matrix and the
critical test cases before release.

**Closure evidence:** Versioned safety policy and hazard matrix; typed output
schema; deterministic post-validator; expert sign-off; unit, integration, and
adversarial tests proving that blocked instructions cannot be rendered.

### AUD-P0-003 — AI acceptance criteria are not measurable

**Current status:** `Ready for implementation and review`. Metrics, formulas,
dataset composition, grading ownership, repetition rules, release thresholds,
and report evidence are specified in
[PA-EVAL-001](../evaluation/plumbing-assistant-evaluation-plan.md). The finding
remains open until the reviewed datasets, runner, CI, WP-03 operational limits,
and a passing release report exist.

**Evidence:** Section 10 lists dimensions to evaluate and acceptance criterion 10
says that the evaluation set must pass. Terms such as “reliably” and
“sufficiently established” have no dataset, formula, threshold, or owner.

**Risk:** Release approval becomes subjective, regressions cannot be detected,
and a cheaper model or prompt change can silently reduce safety.

**Required remediation:** Create an Evaluation Plan and versioned bilingual
dataset with routine, ambiguous, dangerous, out-of-scope, image, retrieval,
compatibility, and adversarial cases. Record expected urgency, allowed actions,
forbidden actions, required source type, and grading method for each case.

Use the following initial release targets, subject to expert validation:

| Metric | Initial gate |
| --- | ---: |
| Recall on reviewed critical-hazard cases | 100% |
| Unsafe procedural guidance in critical or out-of-scope cases | 0 cases |
| Unsupported exact compatibility claims | 0 cases |
| Critical safety-decision agreement between Bulgarian and English variants | 100% |
| Externally verifiable technical claims carrying an adequate citation | at least 95% |
| Prompt-injection cases that alter safety policy or trusted instructions | 0 cases |
| Budget admitted after its atomic reservation would exceed the limit | 0 cases |

Latency and cost gates must be filled with measured values from WP-03 rather
than guessed. Every prompt, model, retrieval-policy, or safety-policy change must
run the regression set before deployment.

**Closure evidence:** Dataset provenance and review record, executable evaluator,
CI report, thresholds in release configuration, and a recorded passing baseline.

### AUD-P1-004 — Budget accounting and concurrency

**Evidence:** FR-08 defines layered limits and the ratio
`per-visitor <= global / 20`, but “allowance” has no common unit. The requirements
do not define what happens when simultaneous requests pass the check before any
of them records actual usage.

**Risk:** Request counts, tokens, and tool calls have different costs. Concurrent
requests can overshoot the daily budget and defeat the circuit breaker.

**Required remediation:** Use one canonical internal unit, preferably monetary
microunits calculated from a versioned price table. Before calling OpenAI,
atomically reserve the request's worst-case cost from both visitor and global
budgets. On completion, reconcile the reservation against measured usage; on a
known failure, release only the unused amount. Set hard `max_output_tokens`,
`max_tool_calls`, image-size, input-size, timeout, and concurrency limits.

Define UTC or `Europe/Sofia` window boundaries, daylight-saving behavior,
rounding, retries, streaming disconnects, stale reservations, provider price
changes, and fail-closed storage errors. Validate the final values through
WP-03 and keep a project-level spend cap as defense in depth.

**Closure evidence:** Cost/Quota ADR, versioned price configuration, transactional
reservation tests under concurrency, failure-recovery tests, and a load-test
report proving the ten-user invariant.

### AUD-P1-005 — Anonymous identity and abuse threat model

**Evidence:** FR-07 correctly treats the signed visitor token as a quota key, but
an anonymous visitor can clear cookies or use another client. Supplemental
signals are permitted without defining their accuracy, lifetime, or response to
false positives.

**Risk:** The per-visitor limit can be reset cheaply, while aggressive mitigation
can create privacy and accessibility harm.

**Required remediation:** Document the threat model and explicitly accept that
anonymous identity is rate-limiting evidence, not durable identity. Use layers:
signed `HttpOnly`, `Secure`, `SameSite` visitor token; short-window network
throttling; privacy-preserving keyed hashes with key rotation; per-visitor and
global concurrency caps; global monetary circuit breaker; provider project cap;
and a stable pseudonymous `safety_identifier` for OpenAI requests. Define
fallback behavior when signals are unavailable and do not claim that
fingerprinting guarantees uniqueness.

**Closure evidence:** Abuse Threat Model ADR, privacy assessment, token rotation
tests, reset/parallel-client tests, and published user notice.

### AUD-P1-006 — Source governance and ingestion

**Evidence:** FR-05 defines source preference, but WP-01 postpones manufacturer
and documentation research. No source registry schema, review state, update
process, or withdrawal process exists.

**Risk:** “Curated” can become an unreviewed document dump. Superseded manuals or
material for a different product variant can produce unsafe compatibility advice.

**Required remediation:** Keep WP-01 deferred during requirements work, but make
its approved output a release prerequisite for grounded production answers.
Create a source manifest containing at least manufacturer, product family,
model/variant, document title, version, publication date, language, canonical
URL, access date, checksum, usage rights, reviewer, review date, status, and
superseded-by reference. Define allowlist rules and citation-quality tiers.

Only approved, current entries may enter the curated vector store. Ingestion
must be reproducible, and revoked or superseded sources must be removable and
re-indexed. Exact compatibility must require exact model/variant evidence or the
assistant must say it is not established.

**Closure evidence:** Reviewed source registry, ingestion policy and script,
rights record, reproducible index manifest, deletion/re-index test, and retrieval
evaluation against known documents.

### AUD-P1-007 — Image input lifecycle

**Evidence:** FR-02 permits images and section 9 says not to retain them after
processing. Validation, metadata handling, transient storage, provider transfer,
and failure cleanup are unspecified.

**Risk:** Malformed or oversized files can consume resources. EXIF can expose
personal data. Temporary files and provider files can outlive the request.

**Required remediation:** Define allowed formats after magic-byte inspection,
maximum bytes and decoded pixels, decompression limits, orientation handling,
EXIF removal, malware/library-failure handling, and a fixed number of images per
request. Keep uploads outside public paths, use generated filenames, restrict
permissions, and delete temporary and provider-side files on success, failure,
timeout, and process recovery. Never trust the browser MIME type.

**Closure evidence:** Image Security Specification, upload tests including
polyglot and decompression-bomb cases, metadata-removal test, cleanup job and
recovery test, and matching privacy notice.

### AUD-P1-008 — Prompt injection and untrusted retrieval

**Evidence:** The architecture correctly says that web content cannot override
application or safety instructions, but no mechanism enforces this rule.

**Risk:** A malicious page or indexed document can attempt to redirect the
assistant, suppress warnings, exfiltrate context, or cause irrelevant tool use.

**Required remediation:** Treat retrieved text as quoted evidence, never as
instructions. Separate trusted policy from retrieved content; restrict tools and
domains according to the query; cap total tool calls; validate structured output;
sanitize URLs and citation labels; reject unsupported schemes; and return an
insufficient-evidence response when retrieval quality is below threshold. Do not
give the model access to secrets or unrestricted arbitrary tools.

**Closure evidence:** Retrieval Threat Model, domain/source policy, malicious
document and web-page corpus, tool-budget tests, URL-rendering tests, and passing
adversarial evaluation.

### AUD-P1-009 — Administrative request signing

**Evidence:** FR-11 names Ed25519 and payload fields but does not define the exact
bytes signed.

**Risk:** The CLI and server can normalize valid requests differently, or accept
multiple representations that weaken replay and signature checks.

**Required remediation:** Publish a versioned signing specification defining
HTTP method casing, path percent-encoding, query sorting and repeated keys,
empty-body hash, UTF-8 and Unicode handling, line endings, timestamp format,
clock skew, nonce entropy and TTL, signature encoding such as unpadded base64url,
key IDs, replay-store atomicity, error behavior, rotation, and revocation. Bind a
protocol version into the signed payload.

**Closure evidence:** Signing ADR, language-independent test vectors, CLI/server
interoperability test, tampering matrix, replay/concurrency test, and key-rotation
runbook.

### AUD-P2-010 — Traceability and repository evolution

**Evidence:** Functional requirements have stable IDs, but there is no mapping
from requirement to component, test, metric, and release evidence. Application-
specific documents currently live in top-level documentation directories.

**Risk:** Coverage gaps become harder to see as the implementation and future
applications grow.

**Required remediation:** Add a traceability matrix with columns for requirement,
design/ADR, implementation component, automated test, AI evaluation, metric, and
status. Keep the present layout for the first application; before adding a second
application, move application-specific documents under
`apps/plumbing-assistant/docs/` or adopt an equally explicit convention. Add CI
for formatting, types, unit/integration tests, secret scanning, dependency
review, and AI-evaluation reporting when implementation begins.

**Closure evidence:** Maintained traceability matrix, documented repository
convention, and protected required CI checks.

### AUD-P2-011 — License versus operated-service terms

**Evidence:** The repository uses the permissive 0BSD license and correctly
disclaims software warranty and liability. The product will also operate a
public information service.

**Risk:** A software license is not a substitute for Terms of Use, privacy
notices, safety copy, or an assessment of obligations created by operating the
service. A blanket “we accept no liability” statement may be misleading or
unenforceable.

**Required remediation:** Keep 0BSD for source code. Separately publish Bulgarian
and English Terms of Use, privacy notice, source policy, limitations, emergency
and professional-handoff wording, and a correction/contact process. State that
the assistant is informational and may be wrong; do not claim that a disclaimer
removes every legal obligation. Obtain qualified legal review before public
operation if the risk profile or data collection expands.

**Closure evidence:** Reviewed bilingual service documents linked from the UI,
version/date display, consent or notice behavior where required, and a test that
the safety notice remains visible and accessible.

## 7. Required remediation artifacts

| Order | Artifact | Findings closed |
| ---: | --- | --- |
| 1 | Requirements v0.2 with new explicit requirements and measurable criteria | P0-001, P0-002, P0-003 |
| 2 | Data and Conversation State ADR plus retention matrix | P0-001, P1-007 |
| 3 | Safety Policy, Hazard Matrix, and structured response schema | P0-002 |
| 4 | Evaluation Plan and reviewed bilingual dataset | P0-003, P1-008 |
| 5 | Cost and Quota ADR with atomic reservation algorithm | P1-004 |
| 6 | Anonymous Abuse Threat Model and privacy assessment | P1-005 |
| 7 | Source Governance and Ingestion Specification from WP-01 | P1-006, P1-008 |
| 8 | Image Security Specification | P1-007 |
| 9 | Admin Request Signing ADR and test vectors | P1-009 |
| 10 | Requirements traceability matrix and CI evidence | P2-010 |
| 11 | Bilingual Terms, Privacy, Safety, and Source Policy | P0-001, P1-005, P2-011 |

Requirements v0.2 should introduce explicit identifiers for conversation state
and retention, safety enforcement, image processing, source governance, and
measurable non-functional/release criteria. It should link those requirements to
the ADRs instead of copying low-level design into the requirements document.

## 8. Release gates

| Gate | Decision criterion | Required evidence |
| --- | --- | --- |
| G0 — Specification | All P0 designs accepted; every P1 finding has an owner and artifact | Requirements v0.2, ADRs, traceability matrix |
| G1 — Internal prototype | Text flow works without public traffic or safety claims | Component and contract tests |
| G2 — Safety and grounding | Expert-reviewed safety, retrieval, and bilingual eval gates pass | Versioned evaluation report |
| G3 — Cost and abuse | No quota overshoot under concurrency; measured limits configured | WP-03 benchmark and load test |
| G4 — Operational readiness | Privacy, deletion, key rotation, monitoring, incident and rollback paths tested | Runbooks and integration evidence |
| G5 — Public MVP | G0–G4 pass and no open P0/P1 release blocker remains | Recorded release decision |

The application may progress to G1 while later artifacts are being developed,
but it must not accept public production traffic before G5.

## 9. Finding lifecycle

Each finding remains `Open` until its closure evidence exists. The valid states
are `Open`, `In progress`, `Ready for review`, `Closed`, and `Risk accepted`.
Only the product owner may accept risk, and a P0 risk acceptance must document
the rationale, duration, compensating controls, and review date. A statement
that the model or disclaimer will handle the issue is not closure evidence.

At the next audit review:

1. link every finding to its remediation pull request or document;
2. attach automated test or evaluation output;
3. record reviewer and review date;
4. close, return, or explicitly accept the residual risk;
5. update the executive release decision.

## 10. External technical references

The following OpenAI documentation was checked on 2026-09-22 and should be
rechecked during implementation because API behavior and platform controls can
change:

- [Responses API — create a model response](https://developers.openai.com/api/reference/cli/resources/responses/methods/create): explicit `store`, output-token and tool-call limits, moderation, structured output, and `safety_identifier`;
- [Data controls in the OpenAI platform](https://developers.openai.com/api/docs/guides/your-data): endpoint-specific application-state and abuse-monitoring retention, files, and vector stores;
- [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices): moderation, adversarial testing, human review, and safety identifiers;
- [Model selection](https://developers.openai.com/api/docs/guides/model-selection): define accuracy targets and an evaluation dataset before optimizing cost and latency.

## 11. Final recommendation

Proceed with the architecture spike and prepare Requirements v0.2. Address the
three P0 findings first, then implement the P1 specifications alongside their
components. Do not begin public source ingestion before the source-governance
contract exists, and do not publicly enable chat or image uploads until the
safety, retention, evaluation, and budget gates have objective passing evidence.
