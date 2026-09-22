# Agent execution entry point

These instructions apply to any human or AI coding agent working in this
repository. They govern project execution, not the OpenAI model used by the
future Plumbing Assistant runtime.

## Required read order

Before changing application code, read:

1. `docs/handoffs/plumbing-assistant-implementation-handoff.md`
2. `docs/requirements/plumbing-assistant-v0.2.md`
3. `docs/audits/plumbing-assistant-implementation-readiness-audit.md`
4. `docs/planning/plumbing-assistant-implementation-plan.md`
5. `docs/engineering/agent-execution-contract.md`
6. the design, FR/AC rows, and security/safety policies referenced by the
   selected task.

Run `npm run validate` before work and before handoff.

## Authority order

Current user instructions override repository documents. Otherwise follow:

1. accepted requirements baseline;
2. accepted ADRs and safety/security/service policies;
3. machine-readable contracts and test vectors;
4. traceability and implementation-plan task contract;
5. local implementation conventions.

Do not weaken a higher-level rule merely to make code or tests pass. Record a
conflict and stop the affected task.

## Execution rules

- Select one `ready` task whose dependencies are satisfied.
- Use the task template and name exact FR/AC IDs, deliverables, tests, and
  evidence before broad implementation.
- Reversible internal details may be decided and documented by the executor.
  Product scope, safety posture, privacy/legal basis, public-release approval,
  framework/hosting/provider commitments, and material cost/risk changes require
  owner approval.
- Implement behavior and deterministic tests together. Planned paths do not
  count as evidence.
- Keep provider, deployment, signing, and evaluation secrets out of the
  repository and untrusted CI.
- Do not deploy publicly, ingest unapproved third-party documents, enable live
  paid calls, or mark an implementation control passed without explicit scope
  and evidence.
- Update implementation plan status, PA-TRACE-001 actual paths, and PA-AUDIT-002
  evidence in the same change that completes a task.

The complete vendor-neutral protocol and stop conditions are in
`docs/engineering/agent-execution-contract.md`.
