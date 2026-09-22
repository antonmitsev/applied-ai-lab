# Plumbing Assistant — Architecture context

This document captures the intended system boundaries. Component selection and
detailed design follow after the v0.1 requirements are accepted.

```text
Browser
  ├─ SSR landing page and bilingual chat UI
  ├─ signed anonymous visitor token
  └─ text and image input
          │
          ▼
Node.js application
  ├─ input validation and safety pre-checks
  ├─ per-visitor and global budget enforcement
  ├─ conversation orchestration
  ├─ response/citation rendering contract
  └─ aggregated usage accounting
          │
          ├──────────────► Persistent usage store
          │
          ▼
OpenAI Responses API
  ├─ model reasoning and structured output
  ├─ file_search ────────► Curated vector store
  └─ web_search ─────────► Current public sources

Local admin CLI
  └─ Ed25519-signed request ──► Read-only statistics endpoint
```

## Trust boundaries

- The browser is untrusted. It never receives provider or administrative secrets.
- Visitor identity is pseudonymous and rate-limit oriented, not an assertion of
  real-world identity.
- The Node.js application owns authorization, quotas, tool budgets, and output
  policy enforcement.
- OpenAI is an external processor. Requests must follow the configured data and
  retention policy.
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

Normal procedural guidance must stop when risk or scope classification requires
professional escalation.
