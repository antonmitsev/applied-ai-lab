---
id: kb-content-schema-001
title: "Content Schema for Knowledge Units"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# Content Schema for Knowledge Units

## 1. Core principle

One file must have one clear topic. A file may contain several sections, but
must not combine unrelated knowledge merely because it concerns the same
appliance.

Examples:

- good: “Radial sealing with an O-ring”;
- good: “Diagnosis: leak changes when tightening”;
- bad: “Everything about radiators”.

## 2. Base template

~~~md
---
id: connection-insert-o-ring-001
title: "Spigot and O-Ring Connection"
document_type: connection
status: draft
version: "0.1"
language: en
domain:
  - heating
connection_type:
  - insert-o-ring
seal_type:
  - o-ring
aliases:
  - "O-ring connection"
related: []
safety_level: medium
---

# Spigot and O-Ring Connection

## Short description

2–5 sentences that are understandable on their own.

## Components

...

## How it works mechanically

...

## What actually seals

...

## What does not seal

...

## Typical failures

...

## Symptoms

...

## Diagnosis

...

## Repair / correction

...

## Assembly errors

...

## Safety

...

## Related topics

- seal-o-ring-radial-001
~~~

## 3. Schema for component

Required sections:

- Short description;
- Function;
- Components;
- Inputs and outputs;
- How it connects;
- Typical failures;
- Diagnosis;
- Related topics.

## 4. Schema for connection

Required sections:

- Short description;
- Components;
- How the mechanical connection is created;
- What actually seals;
- What does not seal;
- Permitted movement/tightening;
- Typical failures;
- Symptoms;
- Diagnosis;
- Assembly errors;
- Related topics.

## 5. Schema for seal

Required sections:

- What it is;
- Where it is used;
- How it seals;
- Critical dimensions;
- Materials;
- What correct installation looks like;
- Typical failures;
- Signs of an incorrect size;
- Compatibility;
- Related topics.

## 6. Schema for diagnostic

~~~md
## Symptom

A specific observable behavior.

## Most likely causes

Causes without invented percentages.

## What distinguishes the causes

Observations that increase or decrease the likelihood.

## Tests

The safest and most informative test first.

## How to interpret the results

If X → check Y.

## What not to do

Actions that could mask the problem or cause damage.

## Next steps

What is needed for confirmation.
~~~

## 7. Schema for procedure

Every procedure must contain:

- Goal;
- Required tools;
- Preconditions;
- Steps;
- Checkpoints;
- What can go wrong;
- Post-assembly check;
- When to stop.

Steps must be concrete and verifiable.

## 8. Schema for case

A real case must not be presented as a universal rule.

~~~md
## Context
## Observed symptom
## What was disassembled
## Measurements
## Changes made
## Observations after the change
## Working hypotheses
## What was confirmed
## What remains unconfirmed
## Conclusions applicable to other cases
## Related knowledge units
~~~

## 9. Facts versus hypotheses

Content must clearly distinguish:

- **Fact** — measured, observed, or a general engineering principle;
- **Hypothesis** — a likely explanation that has not yet been confirmed;
- **Test conclusion** — a conclusion tied to a specific result.

Do not present “most likely” as “certain”.

## 10. Numerical data

When a dimension matters, record it with context.

Bad:

> 17×2

Good:

> Measured diameter at the bottom of the groove: approximately 17 mm;
> measured groove width: approximately 2 mm.

If a product designation differs from the measured geometry, state this
explicitly.
