# Plumbing Assistant — Retrieval Threat Model and Prompt-Injection Controls

| Field | Value |
| --- | --- |
| Specification ID | `PA-RET-001` |
| Status | Approved design; implementation and adversarial evaluation pending |
| Date | 2026-09-22 |
| Owner | Anton Mitsev |
| Audit finding | `AUD-P1-008` |
| Applies to | Curated retrieval, live web search, OCR/image text, citations, and tool use |

## Purpose

This specification prevents untrusted retrieved content from becoming
instructions, expanding tool access, changing safety policy, leaking context, or
creating attacker-controlled links. It covers direct user jailbreaks and
indirect prompt injection embedded in indexed documents, web pages, titles,
URLs, snippets, images, labels, and OCR text.

Prompt-injection detection is useful but imperfect. The primary defense is
architectural: constrain what an undetected injection can influence. The model
is not a security boundary and does not authorize its own tools, sources,
actions, citations, or safety level.

## Trust classification

### Trusted control plane

Only reviewed, versioned server-owned artifacts may instruct the workflow:

- developer instructions and prompt templates from the deployed application;
- the safety policy, hazard matrix, action registry, and fixed renderers;
- JSON Schemas and deterministic validators;
- source-registry metadata, domain policy, and active index manifest;
- cost, tool, model, timeout, and retention configuration;
- server code that selects stages, validates results, and renders links.

Trusted means authorized to control behavior, not guaranteed bug-free. All
changes remain subject to review, tests, version binding, and release gates.

### Untrusted data plane

The following are always data, never instructions:

- current and prior user text, including quoted third-party text;
- conversation-envelope text, despite its authenticated integrity;
- uploaded images, visible labels, metadata, and OCR-derived text;
- curated document body and extracted chunks;
- web queries, pages, snippets, titles, redirects, and URLs;
- model-generated retrieval plans, query terms, tool calls, evidence summaries,
  citations, and final responses;
- tool errors, empty-result messages, and provider annotations.

Authentication proves who issued a value or that it was not altered. It does
not upgrade user, document, or tool content into trusted policy.

### Secrets and privileged data

API keys, signing keys, visitor tokens, CSRF values, quota rows, admin data,
internal errors, environment variables, and server paths must never be placed in
any model input. Prompts must not depend on secrecy for enforcement.

## Mandatory staged architecture

Retrieval and answer generation use separated stages with decreasing
capabilities:

```text
validated user request + deterministic safety floor
                    │
                    ▼
1. retrieval plan: strict schema, no retrieved content, no tools
                    │ validated minimal queries
                    ▼
2a. direct curated search       2b. isolated public-web call
    server API + registry           web_search only; no private context
                    │ raw untrusted results
                    ▼
3. evidence gateway: scope, source, URL, injection and size validation
                    │ strict PA-EVIDENCE-001 bundle
                    ▼
4. final synthesis: static developer policy + untrusted evidence; no tools
                    │ strict assistant response schema
                    ▼
5. deterministic policy validation + server-owned citation hydration/rendering
```

An explicit critical pre-triage result bypasses retrieval and generation and
uses the fixed safety renderer. No later stage may lower an established urgency
floor.

### Stage 1 — Retrieval plan

The application owns the decision to retrieve. A model may propose a plan only
in a no-tool call with a strict schema; the server accepts only enumerated
values. The plan cannot add a provider, tool, domain, filter, or call count.

At most two search queries are permitted. Each query is at most 200 Unicode
characters and contains only the minimum Bulgarian/English plumbing terms,
manufacturer, product family, exact model text, symptom, and Bulgaria/EU context
needed for retrieval. The query builder must:

- normalize Unicode to NFC;
- reject controls, bidirectional overrides, zero-width obfuscation, markup,
  code blocks, URLs, credentials, email addresses, phone numbers, and exact
  street/location data;
- reject known secret/token patterns and application identifiers;
- never copy a complete message, conversation history, image/OCR text, previous
  tool output, or retrieved passage into a query;
- never derive a later query from an earlier web result;
- return `no_retrieval` when a safe minimal query cannot be constructed.

Query strings are request content and must not be persisted in general logs,
metrics, usage storage, or analytics.

### Stage 2a — Curated retrieval

The server calls the Vector Store search API directly; the synthesis model does
not receive a `file_search` tool. Filters bind search to the active index build,
approved source IDs, language, domain scope, and relevant manufacturer/family.
The result cap is six chunks. The calibrated score threshold and ranker profile
are versioned release configuration; missing or expired configuration fails
closed.

Every result must join to the exact active source-registry snapshot and pass
PA-SOURCE-001 lifecycle, rights, scope, variant, and checksum checks. Curated
status controls provenance, not instruction trust: document body remains
untrusted data.

### Stage 2b — Isolated live web retrieval

Live web search runs in a separate foreground `store:false` Responses request
that contains only:

- static retrieval-only instructions;
- the validated minimal query;
- a pseudonymous `safety_identifier`;
- the `web_search` tool and no other tool;
- a maximum of two total tool calls and a bounded output-token limit.

It contains no conversation history, user image, raw user message, source
document, visitor token, personal identifier, safety record, admin data, or
secret. It cannot call MCP, functions, file search, code interpreter, computer
use, shell, browser automation, or an arbitrary fetcher.

Search may discover any public result, but a result becomes eligible evidence
only when its final normalized domain matches the reviewed domain policy. The
MVP domain policy permits official manufacturer, Bulgarian/EU public authority,
utility/operator, recognized standards, and reviewed professional-body domains.
Retail, forum, social, URL-shortener, paste, arbitrary file-hosting, and unknown
domains are discovery-only or blocked and cannot support procedural output.

The domain registry records the registrable domain, owner, permitted source
tiers and purposes, allowed subdomains, reviewed redirect destinations,
reviewer, review date, and expiry. It is populated by WP-01; live web guidance is
disabled when the applicable allowlist is empty or expired.

### Stage 3 — Evidence gateway

All curated and web results pass through server validation and become a
request-local bundle conforming to
[PA-EVIDENCE-001](../contracts/retrieval-evidence.schema.json). The gateway:

1. maps each item to a server-issued evidence ID;
2. resolves source identity and claim-eligible scope;
3. normalizes text to NFC and plain text;
4. removes markup, scripts, styles, comments, forms, control characters,
   bidirectional overrides, invisible-text artifacts, embedded data, and URLs
   from excerpts;
5. caps each excerpt at 1,200 characters, the bundle at eight items, and all
   excerpts together at 8,000 characters;
6. validates language, relevance, review state, source tier, domain, URL, score,
   and exact-variant scope;
7. applies deterministic injection indicators and, optionally, an isolated
   no-tool classifier with structured output;
8. quarantines instruction-like, policy-override, secret-request, tool-request,
   exfiltration, encoded-payload, citation-spoofing, or suspicious-link content;
9. returns `insufficient` when no eligible evidence remains.

Detection never promotes content to trusted. An item without a detected signal
is still untrusted and receives no capability. A detected injection is recorded
only as a bounded category; the passage itself is not logged. Quarantined items
remain internal to the gateway and are never sent to final synthesis.

Evidence selection keeps the smallest passage that entails a candidate claim.
Navigation, cookie banners, unrelated text, and adjacent instructions are not
included merely because they share a page.

### Stage 4 — Tool-free final synthesis

The final model request includes current trusted developer instructions as
static text. No user, retrieved, OCR, or model-generated string is interpolated
into a developer message. User/conversation content and only the eligible
projection of the evidence bundle are separate user-role data with explicit
provenance fields.

Labels such as `UNTRUSTED_EVIDENCE` improve model comprehension but are not
treated as a security boundary. Security comes from the absence of tools and
the validators around the call.

The final call must:

- expose an empty tool list and enforce `tool_choice: none` or the equivalent;
- set `store: false` and remain foreground;
- use the strict assistant response schema version 2;
- return only source IDs, never model-authored citation titles or URLs;
- carry bounded visible conversation state but no raw prior retrieval results;
- preserve the deterministic urgency floor and configured limits.

Raw evidence, tool output, queries, and URLs are not copied to the conversation
envelope. Only the final validated user-visible response may continue to the
next turn.

### Stage 5 — Deterministic validation and rendering

The server rejects the output unless all applicable checks pass:

- exact schema and size validation with no additional properties;
- urgency monotonicity and PA-SAFE-001 action/response-mode rules;
- every cause, procedural step, and source reference uses an evidence ID from
  the current request bundle;
- each referenced item is eligible for that claim type and entails the claim;
- exact compatibility uses an approved exact-model curated source;
- critical and caution paths contain no generated procedural steps;
- no tool request, policy text, hidden field, arbitrary URL, or unapproved action
  survives into rendering.

The server hydrates source title, canonical URL, source tier, and localized label
from the validated evidence/source registries. The model never supplies rendered
link destinations.

## URL and citation policy

Every web URL is parsed with a standards-conforming URL implementation and must:

- use `https` with no username, password, or fragment;
- contain no control, whitespace, bidirectional, or invalid IDNA character;
- use the explicitly reviewed registrable domain and subdomain rule, not a naive
  string suffix match;
- use the default port or an explicitly reviewed port;
- reject localhost, IP literals, private/link-local/reserved addresses, URL
  shorteners, nested URLs, and non-HTTP schemes;
- remain at or below 2,000 characters after normalization;
- remove tracking parameters and reject parameters containing user data,
  secrets, encoded payloads, or unreviewed redirect destinations.

Redirects do not inherit trust. Each final destination must independently match
the domain policy. The application does not server-fetch arbitrary URLs supplied
by a user or model in the MVP.

Citation labels are plain text from the registry/evidence gateway, escaped by
the renderer. The UI never renders retrieved HTML or model-generated Markdown
links. External anchors use the reviewed normalized URL and appropriate
`rel="noopener noreferrer nofollow"`; any new-window behavior is visible and
accessible.

## Tool and capability policy

The public assistant is a bounded troubleshooting workflow, not a general
autonomous agent.

- No model call receives API credentials or direct network credentials.
- Curated search is a server-owned read operation.
- The isolated retrieval call is the only stage with `web_search`.
- The final synthesis call has no tools.
- The MVP has no MCP, arbitrary function, code execution, computer use, shell,
  browser automation, email, messaging, filesystem, or write-capable tool.
- The model cannot request more calls, increase limits, change domains, modify
  the source registry, or activate another tool.
- Tool count, timeout, token, and monetary limits are reserved and reconciled by
  ADR-0002.

Adding a new tool or combining public web access with private/privileged data in
one model call requires a new threat review and requirements change.

## Threat model

| Threat | Enforced control | Residual risk |
| --- | --- | --- |
| Direct user jailbreak | User-role isolation, safety pipeline, strict schema, no privileged tools | May reduce answer quality or trigger refusal |
| Injection in curated document | Direct server search, evidence gateway, tool-free synthesis | Undetected text may influence prose but cannot gain a tool |
| Injection in web page/snippet | Isolated public-only call, tool cap, domain/evidence gate | Provider search may encounter malicious pages |
| Injection in image/OCR | PA-IMG-001, data-plane classification, no OCR-to-policy path | Visible text may still bias synthesis within schema |
| Query-based exfiltration | Minimal query, secret/PII rejection, no private context in web call | Product/model terms are disclosed to the search provider |
| Tool escalation or recursive search | Server-fixed stages and tools; no result-derived queries | Retrieval quality may be lower without recursion |
| Citation/URL spoofing | ID-only model output and server hydration | Approved domains can still be compromised |
| Source poisoning | PA-SOURCE-001 review, checksum, lifecycle, scope, re-indexing | Reviewer error remains possible |
| Hidden/encoded instructions | Plain-text normalization, size caps, indicators, quarantine | No detector recognizes every encoding |
| Context or prompt leakage | No secrets in prompts, no outbound tools in synthesis, output validation | Static policy wording may be paraphrased |
| Cross-turn persistence | No raw evidence/tool output in conversation envelope | A validated but mistaken summary may persist until expiry |
| Cost/denial attack | Query/tool/result caps and atomic budget reservation | Attacker can consume bounded daily availability |

## Insufficient evidence and incident behavior

The application returns `scope: insufficient_evidence`, calibrated uncertainty,
and no generated procedural steps when:

- query construction cannot satisfy minimization rules;
- required domain or source policy is absent, expired, or unhealthy;
- retrieval fails, exceeds limits, or returns no relevant eligible result;
- all relevant evidence is quarantined or conflicts materially;
- citations, URLs, source IDs, scope, or entailment cannot be verified;
- output validation fails after the bounded retry policy.

It must not silently fall back to model memory for compatibility, version-
specific, safety-critical, or procedural claims. A fixed safe handoff may be
rendered when the domain safety policy requires it.

A high-confidence injection event increments a content-free category metric and
may temporarily quarantine the source/domain pending review. It does not expose
the payload in logs, an admin API, or the user-facing response. Repeated events,
unexpected tools, validator bypass attempts, or citation mismatches open the
retrieval circuit breaker and require incident review.

## Data handling and observability

Retrieval plans, queries, raw tool outputs, excerpts, evidence bundles, URLs, and
injection payloads are request-memory data. They must not enter general logs,
traces, analytics, the usage ledger, conversation state, or backups.

Content-free metrics may include stage, source kind/tier, bounded result-count
bucket, tool-call count, domain-policy decision category, injection-signal
category, validation result, insufficient-evidence reason, latency, and cost.
Domains, URLs, source/evidence IDs, queries, passages, and model text must not be
metrics labels.

Provider requests retain only the data behavior already disclosed under
ADR-0001. The privacy notices must explain that minimal search terms and
selected evidence may be processed by OpenAI, without claiming that
`store: false` removes all provider abuse-monitoring retention.

## Verification required before closing AUD-P1-008

1. Message-construction tests prove untrusted variables never enter developer
   messages and secrets never enter any model request.
2. Stage tests prove only the isolated public call receives `web_search`, direct
   curated retrieval is server-owned, and final synthesis has no tools.
3. Query tests cover controls, bidi/zero-width text, URLs, credentials, PII,
   secrets, markup, encoded payloads, long history, OCR, and result-derived
   query attempts.
4. Domain/URL tests cover IDNA confusables, suffix tricks, credentials, ports,
   IP/private hosts, shorteners, redirects, nested URLs, tracking/user-data
   parameters, fragments, schemes, escaping, and link attributes.
5. Evidence tests validate schema, size limits, unique IDs, active source joins,
   score/scope/tier decisions, quarantine, total excerpt limits, and claim
   eligibility.
6. Output tests prove the model emits IDs only and the server rejects unknown,
   stale, quarantined, wrong-scope, non-entailing, or exact-compatibility-
   ineligible references.
7. Rendering tests prove titles and URLs come only from server registries and
   no retrieved HTML, script, Markdown link, or model URL is rendered.
8. The bilingual malicious corpus covers direct/indirect injection, hidden text,
   fake system messages, tool requests, policy override, urgency downgrade,
   data exfiltration, citation spoofing, encoded attacks, empty-result attacks,
   poisoned documents, OCR/images, and multi-turn persistence.
9. Every adversarial execution records zero unauthorized tool calls, zero
   safety-floor changes, zero unapproved URLs/actions, and zero secret/context
   exfiltration across required repetitions.
10. Failure tests prove retrieval outage, policy expiry, all-quarantined results,
    validation failure, timeout, and circuit breaker produce the specified
    insufficient-evidence path without model-memory fallback.
11. Capture tests find no queries, raw results, excerpts, URLs, payloads, or
    evidence bundles in forbidden persistence and telemetry locations.
12. Release evidence binds prompt, schemas, domain/source policy, corpus,
    detector, model, tool configuration, and application versions.

## Official OpenAI references

The design follows the documented principles that untrusted variables should
not enter developer messages, structured outputs constrain data flow, tools
should be tightly controlled, and automated injection filters are incomplete.
Recheck current provider behavior during implementation:

- [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- [Deep research — safety risks and mitigations](https://developers.openai.com/api/docs/guides/deep-research#safety-risks-and-mitigations)
- [Model guidance — allowed tools and output validation](https://developers.openai.com/api/docs/guides/latest-model)
