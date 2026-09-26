---
id: case-radiator-o-ring-leak-001
title: "Radiator Connection: Leak Depends on Nut Position"
document_type: case
status: draft
version: "0.1"
language: en
domain:
  - heating
system:
  - radiator
component:
  - radiator-valve
connection_type:
  - insert-o-ring
seal_type:
  - o-ring
pipe_type:
  - unknown
symptom:
  - leak
  - leak-changes-with-tightening
failure_mode:
  - wrong-seal-size
  - misalignment
  - seal-overcompressed
aliases:
  - "radiator leaking from the pipe"
  - "leak changes when tightening the nut"
related:
  - seal-o-ring-radial-001
  - connection-insert-o-ring-001
  - diagnostic-leak-tightening-001
safety_level: medium
source_class:
  - internal-observation
evidence_level: observed
---

# Radiator Connection: Leak Depends on Nut Position

> This file is an example of the structure and serves as an integration test
> for the requirements. It is not a finalized canonical article.

## Context

A metal connection between a radiator valve and a pipe was disassembled. The
assembly contains a brass spigot and an O-ring. The original O-ring had been
replaced with a homemade substitute.

## Observed symptom

The amount of leakage changes with the position of the retaining nut.

Maximum tightening does not produce the smallest leak. There is an intermediate
nut position at which the connection does not drip.

## Observed construction

The O-ring is located on a brass spigot that enters a socket in the body.

The working model is:

- the nut creates axial clamping and retains the assembly;
- the spigot enters the socket;
- the O-ring creates the hydraulic seal;
- the nut thread is not treated as the primary sealing surface.

## Measurements

The groove was measured approximately as:

- diameter in the groove area: about 17 mm;
- groove width: about 2 mm.

These two values alone are not sufficient to determine a commercial O-ring size
unambiguously.

## Working hypotheses

### Incorrect O-ring size

If the O-ring is too thick or has an unsuitable inside diameter, it may seal
only within a limited axial position.

### Excessive deformation during tightening

With additional tightening, the O-ring may deform, twist, or move relative to
the intended sealing zone.

### Misalignment

If the pipe applies a side load to the spigot, additional tightening may
increase the tilt or uneven compression of the O-ring.

## What was confirmed

- the leak comes from the pipe connection side;
- the assembly contains an O-ring;
- the O-ring had been replaced;
- the leak depends on the nut position;
- maximum tightening is not the optimum position.

## What remains unconfirmed

- the original O-ring size;
- the original O-ring material;
- the exact geometry of the internal socket;
- whether the pipe applies a side load to the spigot;
- whether a washer or support element is missing.

## Useful follow-up measurements

- diameter at the bottom of the groove;
- spigot diameter immediately on both sides of the groove;
- exact groove width;
- inside diameter of the socket, if accessible;
- dimensions of the original O-ring, if it was retained.

## General conclusion from the case

When a connection leak changes non-monotonically as tightening changes, “tighten
it more” is not a reliable diagnostic strategy. Check the actual sealing
element, its size, its position, and the alignment of the assembly.
