---
id: kb-provenance-evidence-001
title: "Sources, Provenance, and Evidence Levels"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# Sources, Provenance, and Evidence Levels

## 1. Purpose

The KB must be able to answer not only “what does this document claim?” but
also:

- where the claim came from;
- which context it applies to;
- whether it is an observation, a general principle, or a working hypothesis;
- how safely it can be used for a specific recommendation.

This is especially important for dimensions, materials, temperatures,
pressures, compatibility, and safety instructions.

## 2. Required provenance fields for content units

The following fields extend the base frontmatter:

~~~yaml
source_class:
  - manufacturer-documentation
evidence_level: reviewed
source_refs:
  - ref: "manufacturer-manual-001"
    locator: "section 4.2"
    accessed: "2026-09-26"
applies_to:
  - "the described construction or a clearly specified component type"
reviewed_by: "human"
reviewed_at: "2026-09-26"
~~~

For a case study, source_class may be internal-observation, and source_refs may
point to photographs, measurements, or notes without inventing an external
source.

## 3. Controlled values

### source_class

- manufacturer-documentation — manual, datasheet, or installation drawing;
- standard-or-regulation — applicable standard or regulatory document;
- expert-review — review by a qualified specialist;
- internal-observation — a specific observation or measurement;
- derived-reasoning — a conclusion derived from other documents and clearly
  marked as such.

A unit may have more than one source_class.

### evidence_level

- observed — observed in a specific case;
- sourced — supported by a named technical source;
- reviewed — reviewed for meaning and applicability;
- verified — confirmed by a source, measurement, or repeatable test;
- hypothesis — a working hypothesis that must not be presented as fact.

The highest level assigned to a unit does not upgrade weaker individual claims
inside it. Mixed-strength claims must be marked locally.

## 4. Separating claims

A canonical document must distinguish:

- **General principle** — applies to a class of constructions;
- **Sourced fact** — comes from a specific document;
- **Observation** — seen or measured in a specific assembly;
- **Hypothesis** — a possible explanation awaiting confirmation;
- **Conclusion** — what follows from a performed test.

A case-specific measurement does not automatically become a universal size or
rule.

## 5. Source requirements

Each source_ref must be specific enough for a person to find again. Where
applicable, record:

- publisher or manufacturer;
- document title and model;
- version or date;
- URL or repository path;
- page, section, table, or figure;
- access date.

For an internal observation, record what was measured, with which instrument,
and the approximate error or uncertainty.

## 6. Conflicts and ageing

When sources conflict:

1. do not hide the conflict by merging the claims;
2. describe the contexts in which they differ;
3. state which source takes precedence and why;
4. if the conflict cannot be resolved, mark the claim as hypothesis or
   escalate it for human review.

When technical data changes, use version, deprecated, and superseded_by
instead of silently overwriting the old document.
