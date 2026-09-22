# Plumbing Assistant

An AI-assisted troubleshooting application for non-professionals dealing with
plumbing and water-based heating installations in Bulgaria.

## Status

Requirements definition. No production implementation is present yet.

## Planned experience

- standalone React landing page with server-side rendering;
- Node.js backend that keeps provider credentials server-side;
- Bulgarian default interface with an English option;
- conversational troubleshooting using text and images;
- answers grounded in curated documentation and current web sources;
- explicit urgency classification, stop conditions, and professional handoff;
- anonymous access protected by pseudonymous quotas and a global cost budget;
- read-only aggregated statistics through signed administrative API calls.

## Documentation

- [Requirements v0.1](../../docs/requirements/plumbing-assistant-v0.1.md)
- [Requirements v0.2 working draft](../../docs/requirements/plumbing-assistant-v0.2-draft.md)
- [Architecture context](../../docs/architecture/plumbing-assistant.md)
- [Requirements and repository audit](../../docs/audits/plumbing-assistant-requirements-v0.1-audit.md)
- [ADR-0001: Conversation state and retention](../../docs/decisions/0001-conversation-state-and-retention.md)
- [ADR-0002: Atomic cost and quota accounting](../../docs/decisions/0002-atomic-cost-and-quota-accounting.md)
- [ADR-0003: Anonymous access and abuse controls](../../docs/decisions/0003-anonymous-access-and-abuse-controls.md)
- [Safety Policy and Hazard Matrix](../../docs/safety/plumbing-assistant-safety-policy.md)
- [Structured assistant response schema](../../docs/contracts/assistant-response.schema.json)
- [Evaluation Plan](../../docs/evaluation/plumbing-assistant-evaluation-plan.md)
- [Evaluation assets](../../evals/plumbing-assistant/)
- [Source governance and ingestion specification](../../docs/sources/plumbing-assistant-source-governance.md)
- [Deferred WP-01 source registry](../../sources/plumbing-assistant/manifest.json)

## Safety notice

The application is planned as an informational portfolio demonstration. It
must not present itself as a substitute for a qualified plumbing or heating
professional, and it must stop procedural guidance when the situation is
outside scope or presents material risk.
