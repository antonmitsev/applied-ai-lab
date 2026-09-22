# Plumbing Assistant — Architecture context

This document captures the intended system boundaries. Component selection and
detailed design follow after the v0.1 requirements are accepted.

```text
Browser
  ├─ SSR landing page and bilingual chat UI
  ├─ signed anonymous visitor token
  ├─ authenticated conversation envelope in sessionStorage
  └─ text and image input
          │
          ▼
Node.js application
  ├─ input validation and deterministic safety pre-triage
  ├─ conversation-envelope verification and reconstruction
  ├─ per-visitor and global budget enforcement
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
  ├─ bounded visible history and structured output
  ├─ file_search ────────► Curated vector store
  └─ web_search ─────────► Current public sources

Local admin CLI
  └─ Ed25519-signed request ──► Read-only statistics endpoint
```

## Trust boundaries

- The browser is untrusted. It never receives provider or administrative secrets.
- Conversation state is client-carried but server-authenticated. Invalid,
  expired, oversized, or wrongly bound state fails before retrieval or model use.
- Visitor identity is pseudonymous and rate-limit oriented, not an assertion of
  real-world identity.
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

## Fail-closed conditions

The application must not call the model when:

- the visitor token is absent or invalid;
- the visitor or global quota cannot be verified;
- the global circuit breaker is open;
- required input validation fails.
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

## Conversation state and retention

The browser carries a bounded, HMAC-authenticated state envelope in
`sessionStorage`. The Node.js application validates it and reconstructs the
visible history for each stateless provider request. No conversation content is
written to the usage store or logs. See
[ADR-0001](../decisions/0001-conversation-state-and-retention.md) for the data
flow, exact limits, retention matrix, and required verification.
