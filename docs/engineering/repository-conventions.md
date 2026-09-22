# Repository Conventions and Quality Gates

| Field | Value |
| --- | --- |
| Specification ID | `PA-REPO-001` |
| Status | Active for the requirements-stage repository |
| Date | 2026-09-22 |
| Owner | Anton Mitsev |
| Audit finding | `AUD-P2-010` |

## Purpose

This document defines where artifacts belong, how requirements remain
traceable, and which checks become mandatory as the repository moves from
requirements to implementation. The convention is intentionally proportionate
to one application while defining an explicit migration trigger for a second.

## Current one-application layout

The repository keeps the first application's long-lived artifacts in typed
top-level collections:

| Path | Ownership and content |
| --- | --- |
| `apps/plumbing-assistant/` | Deployable application code and its local README |
| `docs/requirements/` | Versioned product requirements and deltas |
| `docs/architecture/` | System boundaries and component relationships |
| `docs/decisions/` | Accepted architecture decisions with stable ADR IDs |
| `docs/safety/`, `docs/security/` | Enforceable safety and security specifications |
| `docs/contracts/` | Machine-readable schemas and interoperability vectors |
| `docs/evaluation/` | Evaluation policy, metrics, thresholds, and release rules |
| `docs/sources/` | Source governance, ingestion, and index contracts |
| `docs/traceability/` | Requirement-to-design/test/evidence mappings |
| `evals/plumbing-assistant/` | Portable evaluation schemas, fixtures, and public cases |
| `sources/plumbing-assistant/` | Content-free source registry; permitted document bytes only when redistributable |
| `scripts/` | Repository-owned deterministic validation and maintenance tools |
| `.github/workflows/` | Least-privilege CI; no application or provider secrets in PR jobs |

Application-specific top-level documents use the `plumbing-assistant-` prefix
unless a directory already supplies an unambiguous application namespace.
Cross-project artifacts must not silently depend on Plumbing Assistant policy.

## Second-application migration trigger

Before a second deployable application is added, application-owned documents
move together under:

```text
apps/<application-slug>/docs/
apps/<application-slug>/evals/
apps/<application-slug>/sources/
```

Shared ADRs, schemas, scripts, and packages may remain at the root only after
their application-specific assumptions are removed and both consumers are
named. The migration is one reviewed change that updates all links and the
traceability validator; parallel old/new locations are not maintained.

This trigger prevents premature nesting today without allowing a future second
application to make ownership ambiguous.

## Stable identifiers and traceability

- Functional requirements use `FR-NN`; acceptance criteria use `AC-NN`.
- ADRs, policies, contracts, and evaluations use stable document IDs.
- IDs are never reused. Superseded IDs remain discoverable and point to their
  replacement.
- Every active FR and AC appears exactly once in the authoritative
  [traceability matrix](../traceability/plumbing-assistant.md), either alone or
  in an explicitly expanded contiguous range.
- A traceability row names design, planned/actual component, automated evidence,
  AI evaluation or metric, and implementation status.
- A requirement change is incomplete until its design links, traceability row,
  tests/evaluation impact, and release evidence are updated in the same change.

Ranges are allowed only when every included criterion has the same owner,
design boundary, evidence family, metric, and status. Split a range as soon as
one member diverges.

## Test and evidence placement

When implementation begins:

- unit tests live beside or immediately below their owning package;
- cross-component tests live under the owning application's `tests/integration/`;
- browser tests live under `apps/plumbing-assistant/tests/e2e/`;
- deterministic security protocol vectors remain under `docs/contracts/`;
- AI behavior cases and graders remain under `evals/plumbing-assistant/` until
  the second-application migration;
- sanitized immutable release reports live under a future
  `reports/plumbing-assistant/` path or external artifact store with a checked-in
  content-free manifest and digest.

Raw user data, private holdout cases, provider secrets, hidden reasoning,
runtime stores, and unsanitized model output never become CI artifacts.

## Current CI boundary

The [Repository Quality workflow](../../.github/workflows/quality.yml) runs on
pull requests and pushes to `main` with read-only repository permission. Its
repository-owned [validator](../../scripts/validate-repository.mjs) checks:

- JSON and JSONL syntax;
- local Markdown links;
- local JSON Schema references;
- complete, unique FR/AC traceability coverage;
- the `PA-ADMIN-SIG-1` cryptographic vector;
- per-script and per-function maintenance documentation;
- forbidden secret/runtime filenames and high-confidence credential patterns.

Every repository script must also follow the function-level documentation rule
in [scripts/README.md](../../scripts/README.md); undocumented scripts or
top-level functions are not accepted as maintained automation.

The pull-request workflow also runs GitHub's dependency review action and fails
on newly introduced moderate-or-higher vulnerabilities. External actions are
pinned to reviewed release commits. Dependabot reviews GitHub Action updates.

Repository settings, which cannot be proven by a committed workflow, must
enable secret scanning and push protection and require the `repository-quality`
and `dependency-review` checks on protected `main`. Bypass events require an
owner-reviewed record. GitHub documents push protection as a pre-push secret
control and dependency review as a pull-request dependency-diff control.

## Implementation CI expansion

The first application scaffold must add these non-placeholder package scripts
and required jobs in the same change:

| Required command | Evidence |
| --- | --- |
| `npm run format:check` | Formatting is reproducible and produces no diff |
| `npm run lint` | Static rules pass without ignored errors |
| `npm run typecheck` | Application and tests compile with strict types |
| `npm run test:unit` | Deterministic component tests and coverage report |
| `npm run test:integration` | Server, store, provider-adapter, and failure-path tests |
| `npm run test:e2e` | SSR, bilingual, accessibility, and critical user journeys |
| `npm run eval:smoke` | Small credential-gated model contract suite on trusted branches only |
| `npm run eval:release` | Manually approved full suite producing a sanitized immutable report |

Fork pull requests never receive OpenAI, deployment, signing, or holdout-data
secrets. Deterministic tests use frozen fixtures. Provider-backed smoke and
release evaluations run only from trusted commits with explicit budgets and the
release rules in PA-EVAL-001.

No empty or always-success placeholder counts as evidence. If a component does
not yet exist, the traceability status remains implementation pending.

## Change review checklist

1. Identify affected FR/AC IDs before implementation.
2. Update or add the design/ADR and machine-readable contract.
3. Update the traceability matrix and split grouped rows when mappings diverge.
4. Add deterministic tests and affected AI cases before changing the behavior.
5. Run `npm run validate` locally.
6. Review the diff for secrets, user data, licensed document bodies, and stale
   links.
7. Require passing protected checks and attach sanitized release evidence when
   a release gate is affected.

## External references

- [GitHub push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)
- [GitHub dependency review action](https://github.com/actions/dependency-review-action)
- [GitHub checkout action](https://github.com/actions/checkout)
- [GitHub setup-node action](https://github.com/actions/setup-node)
