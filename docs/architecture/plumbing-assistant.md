# Plumbing Assistant — Architecture context

This document captures the intended system boundaries. Component selection and
detailed design follow after the v0.1 requirements are accepted.

```text
Browser
  ├─ SSR landing page and bilingual chat UI
  ├─ signed anonymous visitor token in a hardened cookie
  ├─ in-memory CSRF value for same-origin API binding
  ├─ authenticated conversation envelope in sessionStorage
  └─ text + one memory-only image selection
          │
          ▼
Node.js application
  ├─ input validation and deterministic safety pre-triage
  ├─ visitor-token, origin, CSRF and proxy-boundary validation
  ├─ short-lived keyed network abuse bucket
  ├─ isolated image scan, decode and metadata-free normalization
  ├─ conversation-envelope verification and reconstruction
  ├─ per-visitor and global budget enforcement
  ├─ atomic worst-case reservation and usage reconciliation
  ├─ conversation orchestration
  ├─ strict response-schema and policy validation
  ├─ server-owned safety-template rendering
  └─ aggregated usage accounting
          │
          ├──────────────► Persistent usage store
          │
          ▼
OpenAI Responses API
  ├─ stateless request with store:false
  ├─ pseudonymous safety_identifier
  ├─ normalized inline input_image; no File on normal path
  ├─ bounded visible history and structured output
  ├─ file_search ────────► Versioned curated vector store
  └─ web_search ─────────► Current public sources

Source build pipeline
  ├─ reviewed repository source registry
  ├─ checksum, rights, lifecycle and scope gates
  ├─ deterministic extraction and chunking
  └─ verified staging index ──► atomic active-build switch

Local admin CLI
  └─ Ed25519-signed request ──► Read-only statistics endpoint
```

## Trust boundaries

- The browser is untrusted. It never receives provider or administrative secrets.
- Conversation state is client-carried but server-authenticated. Invalid,
  expired, oversized, or wrongly bound state fails before retrieval or model use.
- Visitor identity is pseudonymous and rate-limit oriented, not an assertion of
  real-world identity.
- The required visitor token and same-origin proof are deterministic controls;
  browser fingerprinting is neither required nor accepted as identity proof.
- The Node.js application owns authorization, quotas, tool budgets, and output
  policy enforcement.
- OpenAI is an external processor. Requests must follow the configured data and
  retention policy.
- MVP model requests set `store: false` and use neither provider Conversation
  objects nor `previous_response_id`. Provider abuse-monitoring and prompt-cache
  retention remain separate platform concerns disclosed to users.
- Web content is untrusted input. Retrieved pages cannot override application or
  safety instructions.
- The usage store contains operational aggregates, not conversation content.
- The admin private key exists only on the administrator's device.

## Retrieval policy

1. Prefer a relevant, reviewed document from the curated knowledge base.
2. Use live web search when the curated base is insufficient or freshness matters.
3. Prefer manufacturer and authoritative sources.
4. Expose citations and distinguish sourced facts from inference.
5. State that evidence is insufficient instead of inventing compatibility or
   procedural details.

The repository source registry is authoritative; a provider file or retrieval
score is not approval. Runtime retrieval joins results to the active registry
snapshot and rejects expired, withdrawn, superseded, out-of-scope, or
wrong-build sources. Exact compatibility requires an approved passage for the
exact model/variant. See
[PA-SOURCE-001](../sources/plumbing-assistant-source-governance.md).

## Fail-closed conditions

The application must not call the model when:

- the visitor token is absent or invalid;
- Origin, Fetch Metadata, CSRF, or trusted-proxy validation fails;
- the visitor or global quota cannot be verified;
- the global circuit breaker is open;
- required input validation fails;
- the supplied conversation envelope is invalid, expired, oversized, uses an
  unsupported version, or is bound to another visitor.

Normal procedural guidance must stop when risk or scope classification requires
professional escalation.

## Safety enforcement

Safety severity is monotonic: any stage may raise urgency, and no stage may
lower an established floor. Explicit critical structured signals bypass model
generation and render a reviewed fixed response. Other model outputs must match
a strict schema and pass server-side hazard, action, source, and response-mode
validation. Critical and caution paths cannot render generated procedural steps.

See the [Safety Policy and Hazard Matrix](../safety/plumbing-assistant-safety-policy.md)
and the machine-readable
[assistant response schema](../contracts/assistant-response.schema.json).

## Evaluation boundary

Evaluation covers deterministic components, model behavior with frozen retrieval
fixtures, the deployed-equivalent end-to-end path, live-source canaries, and
human review. Release reports bind results to immutable application, model,
prompt, schema, safety-policy, source, and dataset versions. See
[PA-EVAL-001](../evaluation/plumbing-assistant-evaluation-plan.md).

## Cost admission boundary

No paid provider or tool call begins before the authoritative usage store
atomically reserves its bounded worst-case `micro_usd` cost against visitor and
global UTC budgets. Reserved plus charged cost participates in all subsequent
admission decisions. Actual usage reconciles the ledger, while ambiguous
provider outcomes settle conservatively at the reserved maximum. See
[ADR-0002](../decisions/0002-atomic-cost-and-quota-accounting.md).

## Anonymous access boundary

The server-issued visitor cookie is the primary quota key and is bound to
same-origin API calls with Origin, Fetch Metadata, and an in-memory CSRF value.
Short-lived keyed network buckets make trivial cookie reset less useful without
persisting raw addresses or collecting high-entropy device fingerprints. Each
OpenAI request carries a purpose-separated pseudonymous `safety_identifier`.
The global atomic monetary limit remains authoritative if every anonymous signal
is reset. See
[ADR-0003](../decisions/0003-anonymous-access-and-abuse-controls.md).

## Image input boundary

The server never forwards a browser upload directly. It authenticates and
streams one bounded image, verifies the actual format, scans and decodes it in a
resource-limited worker, applies orientation, strips metadata, and creates a new
bounded sRGB JPEG. Only that derivative may be sent inline in the current
`store:false` request. Original and normalized buffers are current-request data;
all completion and failure paths clean them, with a 15-minute recovery janitor.
See [PA-IMG-001](../security/plumbing-assistant-image-security.md).

## Conversation state and retention

The browser carries a bounded, HMAC-authenticated state envelope in
`sessionStorage`. The Node.js application validates it and reconstructs the
visible history for each stateless provider request. No conversation content is
written to the usage store or logs. See
[ADR-0001](../decisions/0001-conversation-state-and-retention.md) for the data
flow, exact limits, retention matrix, and required verification.
