---
id: kb-next-steps-001
title: "Plan for the Next Iterations"
document_type: meta
status: draft
version: "0.1"
language: en
---

# Plan for the Next Iterations

## Iteration 1.5 — Operational requirements

This iteration must be completed before accumulating new technical content.

- validator for frontmatter, IDs, headings, taxonomy, and related references;
- provenance model and evidence-level rules;
- initial retrieval and answer evaluation set;
- safety response contract for clarify-first, local-diy, and stop-and-escalate;
- decision about which statuses enter the development and production indexes;
- short report from the validation and evaluation tooling.

Definition of Done: a new knowledge unit can be added and automatically checked
for structural validity, traceability, safety, and readiness for a specific
index.

### Progress

Completed:

- `scripts/validate-kb.mjs` with development and production modes;
- `scripts/validate-kb.test.mjs` with deterministic built-in tests;
- integration into `npm run validate`;
- stable filename/ID alignment for current case documents.
- initial 20-case bilingual retrieval evaluation set and JSON Schema.
- machine-readable safety response contract with 10 deterministic vectors.

Remaining before source-backed indexing:

- decide the first development and production index manifests.

The canonical units below remain `draft` until source governance, technical
review, and applicability review are complete.

## Iteration 2 — Fundamental connections

Goal: the first real knowledge package.

Create canonical units for:

1. threaded connection;
2. union with a flat gasket;
3. O-ring — radial sealing;
4. O-ring — axial sealing;
5. compression fitting;
6. conical connection;
7. press fitting;
8. spigot + O-ring insert connection.

Acceptance criteria:

- every topic follows 03-content-schema.md;
- every topic has aliases;
- every topic states what provides mechanical retention and what provides
  sealing;
- every topic has at least three typical failure modes;
- topics have cross-links to related units.

### Progress

Iteration 2 is complete as a draft canonical package. The eight planned units
are present and cross-linked:

- `connection-threaded-001`;
- `connection-union-flat-gasket-001`;
- `seal-o-ring-radial-001`;
- `seal-o-ring-axial-001`;
- `connection-compression-001`;
- `connection-conical-001`;
- `connection-press-001`;
- `connection-insert-o-ring-001`.

The package also includes `diagnostic-leak-tightening-001` as the first
diagnostic pattern and the existing radiator case as a case-specific example.
All current KB documents pass development validation with zero warnings.

## Iterative content-to-index workflow

Source governance, technical review, and index validation are repeatable gates.
They apply to every content batch, not only to the first KB package.

Work in small batches of approximately three to five related units:

1. Create or update the units as `draft` content.
2. Identify the claims that need sources and add candidate records to the
   source-governance workflow.
3. Review applicability, provenance, technical meaning, and safety boundaries.
4. Promote accepted units to `reviewed` or `verified` with structured
   provenance.
5. Add the batch to a development index and run structural, retrieval, and
   safety checks.
6. Fix failed checks or unresolved references before release.
7. Build or update the production index manifest only for the validated batch,
   binding it to the registry version and immutable source/index evidence.
8. Repeat the cycle for the next batch.

The development index may contain draft content when explicitly marked. The
production index must contain only reviewed or verified units with approved
source applicability and no unresolved safety or provenance issues. A batch
may remain in development while later batches are drafted; production
promotion is incremental and does not require the whole KB to be complete.

## Iteration 3 — Sealing materials

- EPDM;
- NBR;
- PTFE;
- flat rubber gaskets;
- fiber gaskets;
- hemp and paste;
- thread sealant;
- silicone grease and compatibility.

## Iteration 4 — Diagnostic patterns

- leaks only when hot;
- leaks only under pressure;
- leaks after disassembly;
- leak changes with tightening;
- leak changes with pipe movement;
- leak appears away from the visible wet area.

## Iteration 5 — Radiators

After the foundations are built:

- radiator valve;
- thermostatic valve;
- lockshield valve;
- air vent;
- typical radiator connections;
- leak diagnosis;
- case studies.

## Deferred

Drainage and wastewater systems are a separate domain to be considered after
the clean-water and heating model is stable.
