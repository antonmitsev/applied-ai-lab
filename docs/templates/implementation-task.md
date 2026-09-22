# Implementation Task Template

Copy this template into the owning application/task system. Replace every
placeholder; unresolved required fields mean the task is not ready.

| Field | Value |
| --- | --- |
| Task ID | `PA-IMP-___` |
| Title | `<one independently verifiable outcome>` |
| Status | `planned` / `ready` / `in_progress` / `ready_for_review` / `blocked` / `done` |
| Owner/executor | `<person or agent session>` |
| Baseline commit | `<full commit SHA>` |
| FR/AC | `<exact IDs>` |
| Audit control | `<IMP-001…IMP-011>` |
| Dependencies | `<task IDs and external decisions>` |

## Outcome

State the observable capability that will exist when the task is complete.

## Inputs

- normative requirement/design/contract links;
- existing code and test paths;
- approved decisions and fixtures;
- assumptions verified before work.

## Deliverables

- exact component/configuration paths;
- deterministic tests and fixtures;
- documentation/traceability/audit evidence updates;
- migration or rollback material when applicable.

## Non-goals

List adjacent behavior this task does not authorize.

## Safety, security, and privacy constraints

List applicable invariants, prohibited data, secret boundaries, failure mode,
retention, and logging rules.

## Verification

| Command/test | Expected result | Evidence location |
| --- | --- | --- |
| `npm run validate` | Exit 0 | CI/local summary |
| `<task-specific command>` | `<objective assertion>` | `<report/path>` |

## Stop conditions

List unresolved decisions, conflicts, external writes, destructive operations,
or evidence failures that require owner/reviewer direction.

## Definition of done

- [ ] deliverables exist and contain no placeholder implementation;
- [ ] deterministic success and failure tests pass;
- [ ] applicable cleanup/concurrency/restart/privacy paths pass;
- [ ] PA-TRACE-001 contains actual component/test paths;
- [ ] PA-AUDIT-002 links sanitized evidence;
- [ ] implementation plan status and newly unblocked tasks are updated;
- [ ] `npm run validate` and required CI checks pass;
- [ ] reviewer accepted the change or documented remaining findings.

## Handoff

Record changed paths, commands/results, decisions, residual risks, and the next
safe task. Do not rely on the executor's private conversation history.
