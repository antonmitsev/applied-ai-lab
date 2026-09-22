# Plumbing Assistant — Model-neutral Implementation Plan

| Field | Value |
| --- | --- |
| Plan ID | `PA-PLAN-001` |
| Status | Ready to start |
| Baseline | [PA-REQ-002](../requirements/plumbing-assistant-v0.2.md) |
| Execution contract | [PA-AGENT-001](../engineering/agent-execution-contract.md) |
| Machine-readable graph | [implementation plan JSON](plumbing-assistant-implementation-plan.json) |
| First task | `PA-IMP-000` |

## Purpose

This plan converts requirements into a dependency-ordered delivery graph that
can be executed by any coding agent/model or human team. It does not select the
model used by the application at runtime.

The JSON graph is authoritative for task IDs, dependency edges, coverage,
status, deliverables, and verification families. The repository validator
rejects unknown dependencies, cycles, invalid status, and missing FR/AC
coverage.

## Workstream order

| Task | Outcome | Depends on | Initial status |
| --- | --- | --- | --- |
| `PA-IMP-000` | Stack decision and tested application scaffold | — | Ready |
| `PA-IMP-010` | Bilingual SSR shell and public service routes | 000 | Planned |
| `PA-IMP-020` | Anonymous request/security boundary | 000 | Planned |
| `PA-IMP-030` | Client-carried conversation state | 000, 020 | Planned |
| `PA-IMP-040` | Atomic usage/cost/quota ledger | 000, 020 | Planned |
| `PA-IMP-050` | Deterministic safety pipeline | 000 | Planned |
| `PA-IMP-060` | Structured bilingual text chat | 010, 030, 040, 050 | Planned |
| `PA-IMP-070` | Governed sources and contained retrieval | 050, 060 | Planned |
| `PA-IMP-080` | Secure image lifecycle | 040, 050, 060 | Planned |
| `PA-IMP-090` | Signed aggregate admin statistics | 000, 040 | Planned |
| `PA-IMP-100` | AI evaluation runner and reports | 060, 070, 080 | Planned |
| `PA-IMP-110` | Professional handoff experience | 010, 050, 060 | Planned |
| `PA-IMP-120` | Operational hardening and I5 release decision | All product workstreams | Planned |

Parallel work is allowed only after dependencies and shared contracts are
stable. PA-IMP-010, 020, and 050 may proceed in parallel after PA-IMP-000.

## Starting a task

1. Confirm all dependencies are `done` and change only the selected task to
   `ready`/`in_progress`.
2. Instantiate the [task template](../templates/implementation-task.md).
3. Replace broad deliverables with exact paths and commands for the chosen
   stack.
4. Resolve or escalate decisions using PA-AGENT-001 authority rules.
5. Implement, test, update traceability/audit evidence, and hand off.

Task status in JSON is a planning assertion, not completion evidence. A task is
`done` only when its task packet, PA-TRACE-001 rows, and PA-AUDIT-002 control all
link the promised objective evidence.

## First-session boundary

PA-IMP-000 may research and recommend a current supported stack, but committing
the framework, hosting topology, primary datastore, or runtime provider/model
requires the owner decision recorded by PA-AGENT-001. It must not make a live
OpenAI call, deploy publicly, or create production resources.
