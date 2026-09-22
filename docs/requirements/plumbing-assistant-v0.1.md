# Plumbing Assistant — Requirements v0.1

| Field | Value |
| --- | --- |
| Status | Draft baseline |
| Date | 2026-09-22 |
| Owner | Anton Mitsev |
| Product type | Public portfolio demonstration |

## 1. Purpose

Build a free, publicly accessible AI assistant that helps non-professionals
understand and safely troubleshoot common plumbing and water-based heating
problems in Bulgaria. The project must demonstrate applied AI engineering,
including retrieval, multimodal input, structured reasoning, safety controls,
cost governance, evaluation, and secure operation.

The product is informational. It does not replace a qualified professional and
must not claim that a disclaimer alone removes legal responsibility.

## 2. Target users

The primary users are homeowners and tenants without professional plumbing or
heating experience.

The product must:

- use plain language and explain unavoidable technical terms;
- present actions in small, ordered steps;
- avoid assuming specialist tools or prior knowledge;
- ask focused follow-up questions before offering procedural guidance;
- make uncertainty, risk, and stop conditions prominent.

## 3. Geographic and language scope

- The application is oriented toward Bulgaria.
- Bulgarian is the default language.
- The complete interface and assistant experience are also available in English.
- Technical guidance must remain appropriate for Bulgaria regardless of the
  selected interface language.
- Metric units and terminology common in Bulgaria must be used.

## 4. Domain scope

### 4.1 Included

- domestic water supply and drainage;
- water risers and branch connections;
- water-based central-heating connections;
- heat meters;
- radiator valves, lockshields, vents, and radiators;
- manifolds and hydronic underfloor heating;
- visible leaks, blockages, low pressure, trapped air, and similar symptoms;
- identification and explanation of relevant components from user-provided images.

### 4.2 Excluded

- gas supply and combustion systems;
- burner, combustion-chamber, and flue work;
- electrical repair;
- instructions requiring regulated professional authorization;
- definitive diagnosis where the available evidence is insufficient.

For mixed-domain cases, the assistant must isolate the in-scope water-side
information and stop before giving out-of-scope instructions.

## 5. User experience

### FR-01 — Landing page

The product must be a standalone responsive landing page with an embedded chat
experience. It must explain the purpose, scope, limitations, source policy, and
safety model before or alongside the chat.

### FR-02 — Conversational input

Users must be able to submit text and supported images. The assistant must ask
only the follow-up questions needed to distinguish plausible causes and risk.

Typical intake fields include:

- affected fixture or component;
- whether a leak is currently active;
- hot water, cold water, heating circuit, or drainage;
- building type and approximate location within the installation;
- visible markings, manufacturer, and model when available;
- relevant pipe or connection material and measured size;
- presence of water near electricity, hot surfaces, or pressure vessels.

### FR-03 — Structured answer

The assistant response must consistently expose:

1. urgency level;
2. immediate safe action;
3. known facts and missing information;
4. ranked plausible causes without false certainty;
5. safe diagnostic checks;
6. tools or parts only when compatibility is sufficiently established;
7. explicit stop conditions;
8. when a qualified professional is required;
9. cited sources.

### FR-04 — Urgency classification

Every troubleshooting flow must classify the situation:

- **Critical:** stop normal guidance and present immediate damage- or
  injury-limiting actions that are safe for a non-professional;
- **Caution:** allow limited diagnostic checks and recommend professional help;
- **Routine:** allow appropriate low-risk self-service guidance.

Examples requiring escalation include uncontrolled leakage, wastewater backup,
scalding risk, water close to electrical equipment, and unsafe pressure-related
conditions.

### FR-05 — Sources and retrieval

The application must use the OpenAI Responses API with retrieval tools selected
according to the question:

- `file_search` for curated documentation;
- `web_search` for current or missing public information;
- a future structured catalogue for exact product and compatibility data.

Sources must be visible and clickable. Manufacturer documentation and applicable
authoritative material take precedence over stores, aggregators, forums, or
unsourced summaries. The system must say when adequate evidence was not found.

The product must not treat the model's inherent knowledge as a sufficient source
for exact compatibility, safety, or version-specific instructions.

### FR-06 — Professional handoff

When the problem exceeds the supported scope or risk threshold, the assistant
must recommend contacting a qualified professional. A future neutral directory
may help users discover publicly listed professionals, but the product must not
present paid placement, advertising, endorsement, or a service guarantee.

## 6. Anonymous access and abuse prevention

### FR-07 — Anonymous visitor identity

No account registration is required. The server must issue a signed,
pseudonymous visitor token. Chat API requests without a valid token must fail
closed before any OpenAI request is made.

The visitor token is the primary quota key. Privacy-minimized, pseudonymized
network and browser signals may supplement it for abuse detection. Raw IP
addresses and raw browser fingerprints must not be retained in the usage store.

Aggressive fingerprinting must not be introduced without a documented privacy
assessment and an appropriate user notice or consent mechanism.

### FR-08 — Layered quotas

The backend must enforce:

- short-window request throttling;
- a daily allowance per visitor;
- a maximum number of concurrent requests per visitor;
- maximum input, image, output-token, and tool-call budgets;
- a global daily application budget;
- an OpenAI project-level monthly spend limit;
- a circuit breaker that stops provider calls when the global budget is reached.

Until measurements provide exact values, the following invariant applies:

```text
per-visitor daily allowance <= global daily allowance / 20
```

Ten visitors exhausting their individual allowances must therefore consume no
more than 50% of the global daily allowance.

### FR-09 — Usage store

The quota mechanism requires persistent server-side storage. In-memory state
and append-only logs are not acceptable as the authoritative quota source.

For a single persistent Node.js server, SQLite is the preferred MVP option. For
serverless or horizontally scaled deployment, use an external transactional or
atomic key-value store.

Only the minimum operational fields should be stored:

- pseudonymous visitor hash;
- quota-window start;
- request and rejection counts;
- input and output token counts;
- web-search and file-search call counts;
- estimated provider cost;
- last activity timestamp.

Question text, response text, images, raw fingerprints, and raw IP addresses are
not required for quota enforcement and must not be stored by default.

## 7. Administrative statistics

### FR-10 — No administrative UI in the MVP

The MVP must not include an administrative web panel. It must expose aggregated,
read-only statistics through a dedicated administrative endpoint.

Example:

```text
GET /api/admin/stats?period=7d
```

### FR-11 — Signed administrative requests

Administrative requests must be authenticated with Ed25519 signatures. The
server stores only registered public keys; private keys remain on administrator
devices and outside the repository and deployment environment.

The canonical signed payload must include:

- HTTP method;
- normalized path and query;
- timestamp;
- unique nonce;
- SHA-256 hash of the request body.

The server must reject unknown keys, invalid signatures, expired timestamps, and
reused nonces. HTTPS remains mandatory. Key identification, rotation, and
revocation must be supported.

Expected request headers:

```text
X-Admin-Key-Id
X-Admin-Timestamp
X-Admin-Nonce
X-Admin-Signature
```

A small local CLI must create signatures and call the endpoint.

### FR-12 — Aggregated output

Administrative statistics may include:

- request and approximate unique-visitor counts;
- token and retrieval-tool usage;
- estimated cost;
- throttled and rejected requests;
- error counts and latency summaries.

The endpoint must not expose prompts, responses, images, raw IP addresses, or
browser fingerprints.

## 8. Technical constraints

- React user interface with server-side rendering;
- Node.js server runtime;
- all OpenAI API calls originate from trusted server-side code;
- no provider key may be shipped to the browser;
- bilingual routing and metadata must support discoverability and sharing;
- mobile-first responsive design;
- accessible keyboard navigation and readable status/error messages;
- graceful handling of provider failure, timeouts, and rate limits.

The specific SSR framework, model, hosting provider, and usage-store backend are
architecture decisions, not requirements decisions.

## 9. Privacy and retention

- Collect the minimum data needed for operation and abuse prevention.
- Publish a privacy notice in Bulgarian and English.
- Define and automatically enforce retention periods for pseudonymous usage data.
- Never include user content or operational data in the public repository.
- Do not retain uploaded images after processing unless a later requirement and
  valid retention basis are explicitly approved.
- Clearly distinguish application data retention from OpenAI platform retention.

## 10. Quality and evaluation

Before public release, the product must be evaluated against a reviewed set of
representative cases covering routine, ambiguous, out-of-scope, and dangerous
situations.

At minimum, evaluation must measure:

- correct urgency classification;
- recognition of missing information;
- appropriate professional escalation;
- absence of unsafe or out-of-scope procedural instructions;
- citation presence and source quality;
- factual grounding and calibrated uncertainty;
- Bulgarian and English usability;
- cost and latency per representative conversation.

## 11. Portfolio requirements

The public repository must demonstrate:

- requirements and architecture documentation;
- documented trade-offs and architecture decisions;
- automated checks and representative tests;
- an evaluation approach for AI behavior;
- safe secret handling;
- deployment instructions using placeholders only;
- screenshots or a short demonstration after a usable UI exists;
- a link to the live deployment when available.

## 12. Deferred work packages

The following are explicitly captured but must not be performed during this
requirements phase.

### WP-01 — Manufacturer and documentation research

Research manufacturers, product categories, official instructions, technical
sources, document versions, languages, access rights, and ingestion priority.
The output is a reviewed source registry. No research or downloading is included
in v0.1.

### WP-02 — Neutral professional directory research

Investigate a non-commercial list of publicly listed plumbing and heating
professionals. Define neutral inclusion and ordering rules, source attribution,
freshness checks, correction/removal procedures, and a clear non-endorsement
notice. No directory data is collected in v0.1.

### WP-03 — Usage benchmark and quota calibration

Measure representative conversations to establish token use, retrieval calls,
latency, concurrency, and provider cost. Use the results to select exact
per-visitor, daily-global, and monthly limits. No guessed production quota is
treated as final in v0.1.

## 13. Open decisions

- product name and visual identity;
- React SSR framework;
- OpenAI model-routing strategy;
- deployment provider and topology;
- SQLite versus managed key-value storage after deployment selection;
- exact retention periods;
- initial evaluation dataset and expert review process;
- repository software license;
- production limits after WP-03.

## 14. MVP acceptance criteria

The MVP is acceptable when:

1. a visitor can use the complete flow in Bulgarian or English without an account;
2. text and image inputs produce a structured, sourced response;
3. representative dangerous cases reliably stop normal procedural guidance;
4. requests fail closed when the visitor token or quota check is invalid;
5. ten fully utilized visitor allowances cannot exhaust the global daily budget;
6. the global circuit breaker prevents further provider spend after its limit;
7. an administrator can retrieve aggregate statistics using the signing CLI;
8. unsigned, stale, or replayed administrative requests are rejected;
9. secrets and runtime/user data are absent from the public repository;
10. automated tests and the reviewed AI evaluation set pass.
