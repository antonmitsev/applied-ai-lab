# Model-neutral Agent Execution Contract

| Field | Value |
| --- | --- |
| Contract ID | `PA-AGENT-001` |
| Status | Active for implementation |
| Date | 2026-09-22 |
| Applies to | Human engineers and AI coding agents |
| Product runtime provider | Out of scope for executor selection |

## Purpose

This contract makes the accepted project definition executable by a different
agent, model, vendor, or engineering team without relying on hidden chat
context. It governs how the repository is changed. References to OpenAI in the
requirements govern the application's runtime provider boundary; they do not
require OpenAI tooling to implement the repository.

An executor may be Codex, Claude, Gemini, another model, or a human. Completion
is judged by repository evidence, not by the identity or confidence of the
executor.

## Minimum task packet

No implementation task starts without:

- stable task ID and one accountable scope;
- exact FR/AC and PA-AUDIT-002 control IDs;
- satisfied dependency IDs;
- input designs/contracts and known assumptions;
- concrete file/component outputs;
- deterministic verification commands and expected evidence;
- security/privacy/safety constraints;
- explicit non-goals and stop conditions;
- status and handoff notes.

Use the [implementation task template](../templates/implementation-task.md).
The machine-readable [implementation plan](../planning/plumbing-assistant-implementation-plan.json)
defines the initial dependency graph and coverage.

## Decision authority

| Decision | Executor authority |
| --- | --- |
| Naming, private helper structure, test organization, reversible refactoring | Decide and document locally |
| Dependency patch/minor version consistent with accepted stack and policy | Decide after tests and dependency review |
| Framework, hosting topology, primary datastore, runtime model/provider commitment | Recommend with evidence; owner approval before commitment |
| New personal-data category, longer retention, fingerprinting, analytics, non-essential cookie | Stop; requirements/privacy review and owner approval required |
| Safety downgrade, domain expansion, lower evaluation threshold, unsupported procedural guidance | Prohibited without new requirement and qualified review |
| Public deployment, live user data, production credentials, paid budget activation | Explicit owner authorization and applicable PA-AUDIT-002 gate required |
| License, copyright ownership, brand/domain transfer, commercial warranty | Stop; owner and qualified legal review required |

When a required choice is unresolved, complete safe read-only investigation and
record options, evidence, recommendation, migration cost, and decision owner.
Do not hide a material choice inside generated code.

## Execution lifecycle

### 1. Orient

Read the required entry documents, inspect the repository state, run the
baseline validator, and confirm the selected task is `ready`. Do not repeat
completed work or overwrite unrelated changes.

### 2. Bind scope

Create or update a task packet. List exact output paths and tests. Split work
that is too large for one independently reviewable change. An XL item cannot be
implemented as one opaque agent session.

### 3. Implement

Follow repository conventions, least privilege, fail-closed boundaries, and
content-free diagnostics. Prefer deterministic fixtures and adapters. Paid or
network-backed tests must be separately gated and budgeted.

### 4. Verify

Run the task's checks plus `npm run validate`. Inspect failure, cleanup,
concurrency, restart, and privacy paths where relevant. Never replace a missing
test with a narrative claim.

### 5. Record evidence

Update PA-TRACE-001 planned paths to actual paths, attach sanitized test/report
evidence, and update the corresponding PA-AUDIT-002 control. Change task status
only when its definition of done is satisfied.

### 6. Handoff

Report outcome, changed paths, executed checks, unresolved risks, decisions,
and the next newly unblocked task. The handoff must let a fresh executor
continue without the original conversation.

## Status state machine

```text
planned ──dependencies satisfied──> ready ──work begins──> in_progress
in_progress ──evidence complete──> ready_for_review ──accepted──> done
       └────────material blocker──> blocked
```

- `blocked` requires the exact condition and decision owner; difficulty alone
  is not a blocker.
- `done` requires code/configuration and the promised evidence, not only a
  document or a passing placeholder.
- A failed review returns the task to `in_progress` with findings.

## Required stop conditions

Stop the affected workstream and request direction when:

- requirements, ADRs, schemas, or safety policies materially conflict;
- completing the task would add unauthorized data collection or retention;
- a security or safety invariant would need to be weakened;
- the actual provider/deployment behavior contradicts public copy;
- secrets, real user data, unlicensed source bodies, or private evaluation data
  appear in the worktree or logs;
- destructive migration, public deployment, external purchase, or legal
  commitment lacks authority;
- evidence shows the proposed architecture cannot meet an AC.

Safe work on independent tasks may continue; do not mark the blocked control
passed.

## Context and portability rules

- Repository files are the durable memory. Chat transcripts are not project
  evidence.
- Use stable IDs and repository-relative paths; do not depend on one agent's
  proprietary memory, planning format, or hidden reasoning.
- Store decisions as ADRs, behavior as tests/contracts, and progress as plan and
  audit evidence.
- Prompts may help execution but are not normative requirements.
- Any executor-specific configuration must be optional and point back to this
  contract rather than duplicating policy.

## Completion standard

An implementation is portable when a fresh executor can determine, only from
the repository: what is required, what is already done, what evidence exists,
what remains, what decisions are open, and what it is not authorized to do.
