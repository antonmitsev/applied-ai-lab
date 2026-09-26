# Plumbing Assistant

An AI-assisted troubleshooting application for non-professionals dealing with
plumbing and water-based heating installations in Bulgaria.

## Status

POC scaffold implemented; chat runtime and public-release evidence do not exist
yet. No production application or public-release approval exists.

## Planned experience

- standalone React landing page with server-side rendering;
- Node.js backend that keeps provider credentials server-side;
- Bulgarian default interface with an English option;
- conversational troubleshooting using text and images;
- answers grounded in curated documentation and current web sources;
- explicit urgency classification, stop conditions, and professional handoff;
- anonymous access protected by pseudonymous quotas and a global cost budget;
- read-only aggregated statistics through signed administrative API calls.

## POC checkpoint

The first scaffold uses Node.js 22, TypeScript, Express, React server rendering,
Vitest, ESLint, and Prettier. It currently provides a bilingual SSR shell and
`GET /api/health` with a mock-safe default. Continue from the
[POC task board](../../docs/planning/plumbing-assistant-poc-plan.md).

## Documentation

- [Requirements v0.2 implementation baseline](../../docs/requirements/plumbing-assistant-v0.2.md)
- [Architecture context](../../docs/architecture/plumbing-assistant.md)
- [Audit register](../../docs/audits/README.md)
- [Closed project-definition audit](../../docs/audits/plumbing-assistant-project-definition-audit.md)
- [Implementation/release audit](../../docs/audits/plumbing-assistant-implementation-readiness-audit.md)
- [Implementation and commercial handoff](../../docs/handoffs/plumbing-assistant-implementation-handoff.md)
- [Model-neutral implementation plan](../../docs/planning/plumbing-assistant-implementation-plan.md)
- [Agent execution contract](../../docs/engineering/agent-execution-contract.md)
- [ADR-0001: Conversation state and retention](../../docs/decisions/0001-conversation-state-and-retention.md)
- [ADR-0002: Atomic cost and quota accounting](../../docs/decisions/0002-atomic-cost-and-quota-accounting.md)
- [ADR-0003: Anonymous access and abuse controls](../../docs/decisions/0003-anonymous-access-and-abuse-controls.md)
- [ADR-0004: Administrative request signing](../../docs/decisions/0004-administrative-request-signing.md)
- [Administrative signing test vectors](../../docs/contracts/admin-signing-test-vectors.json)
- [Requirements traceability matrix](../../docs/traceability/plumbing-assistant.md)
- [Scope inventory and estimation ledger](../../docs/planning/plumbing-assistant-scope-inventory.md)
- [Repository conventions and quality gates](../../docs/engineering/repository-conventions.md)
- [Public service pages and landing-page contract](../../docs/service/README.md)
- [Safety Policy and Hazard Matrix](../../docs/safety/plumbing-assistant-safety-policy.md)
- [Structured assistant response schema](../../docs/contracts/assistant-response.schema.json)
- [Evaluation Plan](../../docs/evaluation/plumbing-assistant-evaluation-plan.md)
- [Evaluation assets](../../evals/plumbing-assistant/)
- [Source governance and ingestion specification](../../docs/sources/plumbing-assistant-source-governance.md)
- [Deferred WP-01 source registry](../../sources/plumbing-assistant/manifest.json)
- [Image input security and lifecycle](../../docs/security/plumbing-assistant-image-security.md)
- [Retrieval threat model and prompt-injection controls](../../docs/security/plumbing-assistant-retrieval-security.md)
- [Validated retrieval evidence schema](../../docs/contracts/retrieval-evidence.schema.json)

## Safety notice

The application is planned as an informational portfolio demonstration. It
must not present itself as a substitute for a qualified plumbing or heating
professional, and it must stop procedural guidance when the situation is
outside scope or presents material risk.
