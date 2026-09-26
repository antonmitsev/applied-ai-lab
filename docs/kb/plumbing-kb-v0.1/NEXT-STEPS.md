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

Remaining before Iteration 2:

- decide the first development and production index manifests.

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
