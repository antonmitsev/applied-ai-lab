# Plumbing Assistant — Requirements v0.2 Implementation Baseline

| Field | Value |
| --- | --- |
| Baseline ID | `PA-REQ-002` |
| Status | Accepted for implementation |
| Baseline date | 2026-09-22 |
| Owner | Anton Mitsev |
| Product type | Public portfolio demonstration |
| Definition audit | [PA-AUDIT-001 — Closed](../audits/plumbing-assistant-project-definition-audit.md) |
| Implementation audit | [PA-AUDIT-002 — Not started](../audits/plumbing-assistant-implementation-readiness-audit.md) |

## Baseline decision

Requirements v0.2 are the approved implementation baseline. To avoid copying
and silently diverging more than 1,300 lines, the baseline is configuration-
controlled as these two immutable components:

1. [Requirements v0.1](plumbing-assistant-v0.1.md) — original product scope,
   FR-01 through FR-12, AC-01 through AC-10, and WP-01 through WP-03;
2. [Requirements v0.2 approved delta](plumbing-assistant-v0.2-draft.md) —
   remediation requirements FR-13 through FR-23 and AC-11 through AC-112.

Both components are normative. Where the approved delta explicitly changes or
narrows the v0.1 baseline, the delta prevails. This manifest is the stable entry
point that implementation, review, commercial handoff, and future changes must
reference.

## Approved scope totals

| Record type | Active count | Range |
| --- | ---: | --- |
| Functional requirements | 23 | `FR-01`–`FR-23` |
| Acceptance criteria | 112 | `AC-01`–`AC-112` |
| Deferred work packages | 3 | `WP-01`–`WP-03` |
| Architecture decisions | 4 | `ADR-0001`–`ADR-0004` |

Every active FR and AC is uniquely mapped in
[PA-TRACE-001](../traceability/plumbing-assistant.md) and uniquely classified in
[PA-SCOPE-001](../planning/plumbing-assistant-scope-inventory.md).

## Normative design package

Implementation must follow, rather than reinterpret, these accepted boundaries:

- [system architecture](../architecture/plumbing-assistant.md);
- [conversation state and retention](../decisions/0001-conversation-state-and-retention.md);
- [atomic cost and quota accounting](../decisions/0002-atomic-cost-and-quota-accounting.md);
- [anonymous access and abuse controls](../decisions/0003-anonymous-access-and-abuse-controls.md);
- [administrative request signing](../decisions/0004-administrative-request-signing.md);
- [safety policy and hazard matrix](../safety/plumbing-assistant-safety-policy.md);
- [image lifecycle](../security/plumbing-assistant-image-security.md);
- [retrieval and prompt-injection controls](../security/plumbing-assistant-retrieval-security.md);
- [source governance and ingestion](../sources/plumbing-assistant-source-governance.md);
- [evaluation plan](../evaluation/plumbing-assistant-evaluation-plan.md);
- [public service pages and landing contract](../service/README.md);
- [repository conventions and quality gates](../engineering/repository-conventions.md).

Machine-readable schemas, signing vectors, source manifests, evaluation cases,
and public-page manifests are part of the same controlled package.

## Controlled implementation choices

The following choices intentionally remain open because they require a spike,
deployment selection, measurement, or procurement rather than more requirements
writing:

- React SSR framework and package/workspace layout;
- OpenAI model routing and exact version;
- hosting, edge/proxy topology, region, and processors;
- SQLite versus an external atomic store;
- production limits and prices after WP-03;
- initial reviewed source set after WP-01;
- optional professional directory only after WP-02;
- visual identity and final product name.

Each choice must be recorded in an ADR or implementation decision before its
dependent component merges. It must not weaken an existing FR/AC silently.

## Definition-of-ready decision

The project is ready to enter implementation because:

- audience, geography, languages, scope, exclusions, and UX are explicit;
- every safety-, privacy-, cost-, retrieval-, image-, and admin-sensitive
  boundary has a design owner and acceptance evidence;
- inputs/outputs and critical interoperability boundaries have schemas or test
  vectors;
- traceability, estimation inventory, repository validation, CI, and public
  service source copy exist;
- deferred research and measurement are explicit work packages rather than
  hidden assumptions;
- implementation and public release are governed separately by PA-AUDIT-002.

“Accepted for implementation” does not mean implemented, legally approved, or
safe for public traffic. The public `GO/NO-GO` decision belongs exclusively to
PA-AUDIT-002 after objective evidence exists.

## Change control

This baseline is frozen by the Git commit that introduces this manifest and is
identified by that immutable commit in each handoff/release record. A future
requirement change must:

1. allocate a new non-reused FR/AC ID where behavior changes;
2. update the owning design, traceability, scope inventory, tests/evaluations,
   and affected public copy;
3. record the rationale and compatibility impact;
4. pass `npm run validate` and protected repository checks;
5. increment the baseline version when scope or release behavior changes.
