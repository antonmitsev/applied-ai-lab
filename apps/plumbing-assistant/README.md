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
- [Architecture context](../../docs/architecture/plumbing-assistant.md)

## Safety notice

The application is planned as an informational portfolio demonstration. It
must not present itself as a substitute for a qualified plumbing or heating
professional, and it must stop procedural guidance when the situation is
outside scope or presents material risk.
