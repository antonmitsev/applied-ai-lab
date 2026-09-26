---
id: kb-session-handoff-001
title: "Session Handoff — Domestic Plumbing RAG Knowledge Base"
document_type: meta
status: draft
version: "0.1"
language: en
---

# Session Handoff — Domestic Plumbing RAG Knowledge Base

## Project goal

We are building a RAG-ready, indexed knowledge base for domestic plumbing and
heating, intended for a personal chatbot.

The idea is not one large document, but a collection of small, stably
addressable Markdown knowledge units with:

- YAML frontmatter;
- stable IDs;
- taxonomy;
- cross-references;
- clear retrieval-friendly sections;
- separation between canonical knowledge, diagnostic knowledge, and case studies.

The primary reasoning model is:

**component → connection → mechanical retention → sealing → failure → symptom → diagnosis → repair**

---

## How the project started

The first real case study is a leak from a radiator connection to a pipe.

Observed:

- the connection has a brass spigot and an O-ring;
- the original O-ring was replaced with a homemade substitute;
- the leak changes with the position of the retaining nut;
- maximum tightening does not produce the smallest leak;
- there is an intermediate position with no dripping;
- the groove was measured approximately as 17 mm in diameter and 2 mm in width;
- this is not sufficient by itself to determine the commercial O-ring size;
- working hypotheses include incorrect O-ring size, excessive deformation, twisting,
  or spigot/pipe misalignment.

A key general principle from the case is:

> For one connection, determine separately:
> 1. what keeps the parts together mechanically;
> 2. what actually stops the water.

This is a guiding principle for the entire KB.

---

## Scope v1

Included in the first version:

- fundamentals;
- pipes;
- fittings and connections;
- seals;
- taps and valves;
- water supply;
- faucets;
- water heaters;
- radiators and heating;
- pressure and diagnostics;
- tools.

### Deferred

- drainage and wastewater;
- toilet systems;
- pumps and pressure-boosting systems;
- underfloor heating;
- boilers;
- gas installations;
- industrial plumbing;
- whole-system design.

---

## Documents created in v0.1

The plumbing-kb-v0.1 package contains:

### README.md

Explains the purpose, architecture, and Definition of Done.

### 01-scope.md

Defines what is and is not included in the project.

### 02-taxonomy.md

Defines metadata dimensions such as:

- domain;
- system;
- component;
- connection_type;
- seal_type;
- material;
- pipe_type;
- symptom;
- failure_mode.

It also defines:

- document_type;
- aliases;
- related;
- safety_level.

### 03-content-schema.md

Defines templates for:

- component;
- connection;
- seal;
- diagnostic;
- procedure;
- case.

### 04-indexing-rules.md

Defines:

- stable IDs;
- naming conventions;
- cross-references;
- heading-based chunking;
- canonical versus case knowledge;
- versioning;
- deduplication.

Example IDs:

~~~text
seal-o-ring-radial-001
connection-compression-pexalpex-001
component-radiator-valve-001
diagnostic-leak-tightening-001
case-radiator-o-ring-leak-001
~~~

### 05-rag-writing-guide.md

Defines retrieval-oriented writing rules:

- sections should be understandable on their own;
- avoid vague pronouns;
- separate mechanical retention from hydraulic sealing;
- write causally;
- distinguish facts, observations, hypotheses, and conclusions;
- do not invent precision;
- images supplement but do not carry the only critical knowledge.

### _examples/case-radiator-o-ring-leak-001.md

The first real case study and an integration test for the structure.

### NEXT-STEPS.md

Contains the proposed next iterations.

### Additional requirements documents

Before Iteration 2, these were added:

- 06-validation-and-quality.md — validation levels and quality gates;
- 07-provenance-and-evidence.md — source classes and evidence levels;
- 08-retrieval-evaluation.md — test cases and regression rules;
- 09-safety-response-policy.md — response classes and escalation boundaries.

---

# Next task

## Prerequisite — Iteration 1.5

Before adding new canonical knowledge, implement a minimal validator, evaluation
set, and safety response contract according to the requirements documents.

The validator portion is complete: `scripts/validate-kb.mjs` is integrated into
`npm run validate`, and `npm run test:kb` covers its parser and quality gates.
The development run currently reports only unresolved references to planned
future canonical units; production mode correctly rejects the draft case files.
The initial retrieval evaluation set is also present at
`evals/plumbing-kb/retrieval-cases.json` with 20 bilingual cases.
The safety response contract is present at
`docs/contracts/kb-safety-response-contract.json`; its 10 deterministic vectors
pass `npm run test:safety`.

## Iteration 2 — Fundamental connections

This is the next concrete content task.

Create canonical knowledge units for:

1. **Threaded connection**
2. **Union with a flat gasket**
3. **O-ring — radial sealing**
4. **O-ring — axial sealing**
5. **Compression fitting**
6. **Conical connection**
7. **Press fitting**
8. **Spigot + O-ring insert connection**

## Acceptance criteria for each knowledge unit

Each file must:

- follow 03-content-schema.md;
- have YAML frontmatter;
- have a stable ID;
- have aliases;
- state clearly what provides mechanical retention;
- state clearly what provides sealing;
- contain at least three typical failure modes;
- contain symptoms;
- contain diagnostic checks;
- contain assembly errors;
- have cross-links to related units;
- keep case-specific data separate from general rules.

---

# Recommended order for Iteration 2

Work on one knowledge unit at a time:

### 1. seal-o-ring-radial-001.md

Reason: it directly builds on the current radiator case.

### 2. connection-insert-o-ring-001.md

Describes spigot + O-ring + socket + retaining element.

### 3. diagnostic-leak-tightening-001.md

Generalizes the pattern: “the leak changes non-monotonically with tightening”.

### 4. connection-threaded-001.md

### 5. connection-union-flat-gasket-001.md

### 6. connection-compression-001.md

### 7. connection-conical-seat-001.md

### 8. connection-press-001.md

---

# Important design decisions so far

## 1. Markdown + YAML frontmatter

The format must remain independent of a specific RAG framework.

## 2. One file = one clear topic

Do not create encyclopedic “everything about...” files.

## 3. Chunk boundaries by headings

The ## heading is the preferred natural chunk boundary.

Guideline:

- 300–900 tokens per typical chunk;
- do not force the writing to fit a particular chunk size.

## 4. Canonical knowledge separate from cases

Real cases support retrieval and pattern recognition, but general rules must have
separate canonical units.

## 5. Conversational language through aliases

Example:

~~~yaml
aliases:
  - "O-ring"
  - "О-пръстен"
  - "О ринг"
  - "гумен пръстен"
~~~

## 6. Do not assume the user's terminology

A user may ask:

> “Why does this nut still leak when I tighten it more?”

RAG should reach:

- O-ring;
- insert connection;
- overcompression;
- misalignment;
- leak-changes-with-tightening.

---

# Open questions for future iterations

These decisions are not yet finalized:

- whether to maintain a separate glossary/ with canonical terms;
- whether aliases should be stored only in frontmatter or also in a central index;
- whether confidence or evidence_level metadata needs a separate field;
- whether to add a separate applicable_to field;
- whether manufacturer-specific knowledge should be a separate layer;
- whether dimensions and standards should be separate reference tables;
- whether images need an image manifest with alt text and semantic descriptions;
- how to validate the YAML schema automatically;
- whether to add a JSON Schema for frontmatter.

---

# Prompt for continuing in a new session

Use directly:

> Continue the “Domestic Plumbing RAG Knowledge Base” project. We have a v0.1
> requirements package with scope, taxonomy, content schema, indexing rules,
> RAG writing guide, validation, provenance, evaluation, and safety policies.
> The next content iteration is fundamental connections. Start with
> seal-o-ring-radial-001.md, then connection-insert-o-ring-001.md and
> diagnostic-leak-tightening-001.md. Follow the existing requirements,
> canonical/case separation, and stable IDs. Do not change the architecture
> without a reason; if you find an architectural issue, propose the change
> separately before mass editing.

---

# Files to carry into the next session

Minimum:

- plumbing-kb-v0.1.zip;
- this SESSION-HANDOFF.md.

Optional:

- case-radiator-connection-findings-001.md.

If the archive is available, it already contains the current structure and the
radiator case.
