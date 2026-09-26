---
id: case-radiator-connection-findings-001
title: "Radiator Connection — Findings and Working Diagnosis"
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
symptom:
  - leak
  - leak-changes-with-tightening
  - leak-changes-with-pipe-position
failure_mode:
  - wrong-seal-size
  - misalignment
  - seal-overcompressed
aliases:
  - "radiator connection findings"
  - "radiator leak working diagnosis"
related:
  - case-radiator-o-ring-leak-001
  - seal-o-ring-radial-001
  - connection-insert-o-ring-001
source_class:
  - internal-observation
evidence_level: observed
safety_level: medium
---

# Radiator Connection — Findings and Working Diagnosis

> This is a case-specific working note. It is not a canonical specification.
> General rules must be kept in the linked canonical knowledge units.

## Purpose

This document summarizes the current findings about a leak from the right-hand
connection of a radiator valve. It can be supplied as context to a personal
chatbot so the analysis does not have to start from zero.

## 1. The specific assembly

This concerns a radiator with an angled radiator valve and a detachable
connection to the pipe on the right.

Observed sequence of elements:

**radiator → union to the radiator → valve body → cylindrical socket → brass spigot/adapter with O-ring → metal connector/nut → pipe**

The leak has been confirmed on the right-hand, pipe side, not at the connection
to the radiator.

## 2. How the connection seals

The right-hand detachable connection does not primarily rely on the thread for
water tightness.

The actual seal is made by an O-ring seated on the brass spigot and sealing
radially inside the cylindrical socket of the valve.

The nut has primarily a mechanical function:

- it pulls the spigot inward;
- it keeps the connection assembled;
- it affects the centering and axial position of the spigot;
- it indirectly affects how much and where the O-ring is compressed.

Therefore, more tightening does not necessarily mean a better seal.

## 3. Observed behavior

After disassembly, the original O-ring had been replaced with a homemade
substitute.

The leak changes with the nut position:

- some positions leak more;
- others leak less;
- there is an intermediate position with no dripping at all;
- the maximum-tightening position is not the driest.

This behavior strongly points to a problem with:

1. the O-ring size or geometry;
2. spigot alignment;
3. possible side loading from the pipe;
4. interaction between the O-ring and a chamfer or edge inside the socket.

## 4. Most likely explanations

### 4.1 Incorrect O-ring size

The homemade O-ring probably does not match the original in:

- inside diameter;
- cord diameter;
- hardness;
- material.

One possible scenario:

- with little tightening, the O-ring is not compressed enough → leakage;
- at the correct position, it sits on the smooth cylindrical zone and seals;
- with more tightening, it moves toward a chamfer or edge, twists, or is
  over-deformed → the leak returns.

### 4.2 Slightly tilted spigot

The pipe appears rigid and may keep the assembly under slight stress.

If the spigot enters at a small angle:

- the O-ring is compressed more on one side;
- the opposite side may be insufficiently compressed;
- turning or tightening the nut changes the geometry, so the leak depends on
  position.

## 5. Measurements so far

The O-ring groove was measured approximately as:

**17 × 2 mm**

There is uncertainty about how this measurement was interpreted. The 17 mm
value may be the diameter at the bottom of the groove, while 2 mm may be the
width or the approximate cord size.

This is not enough to select an O-ring with certainty, but it is a useful
starting point.

## 6. Practical O-ring selection

If the groove bottom is approximately 17 mm in diameter and the groove is
intended for an approximately 2 mm cord, the first candidate to test is:

**O-ring 16 × 2 mm**

Reasoning:

- the O-ring should sit slightly stretched on the groove;
- it should not be loose;
- it should not require strong stretching;
- it should protrude slightly above the surrounding metal surface.

Useful trial sizes:

- 15 × 2 mm — probably too stretched;
- **16 × 2 mm — first candidate**;
- 17 × 2 mm — may be too loose;
- 16 × 2.5 mm — probably too thick and may deform during tightening.

O-ring dimensions are usually specified as:

**inside diameter × cord diameter**

For example, **16 × 2 mm**.

## 7. Selection by direct comparison

The best practical method is to take the brass spigot to a shop and test
O-rings directly on the groove.

A suitable ring should:

- sit naturally in the groove;
- have no wave, bulge, or loose section;
- not fall out of the groove;
- not be excessively stretched;
- protrude slightly above the metal surface;
- be rotatable in the groove with some resistance;
- have no large amount of lateral play.

An unsuitable ring:

- almost disappears into the groove → probably too thin;
- sits too high → probably too thick;
- forms a wave → inside diameter is too large;
- requires strong stretching → inside diameter is too small.

## 8. O-ring material

For a heating system and hot water, EPDM is a preferred candidate, approximately
70 Shore A.

EPDM is suitable for water and temperature cycling in many heating
applications. Compatibility must still be checked against the actual medium,
temperature, additives, and manufacturer requirements.

Use only a compatible lubricant with EPDM, such as a small amount of silicone
grease. Do not use mineral oils, mineral grease, or petroleum jelly on EPDM.

These are working recommendations for this case, not universal material
selection rules.

## 9. Diagnostic test

With the nut in the position where the connection is dry:

- move the pipe very slightly up, down, and sideways;
- observe whether seepage starts.

Interpretation:

- if pipe movement changes the leak, side loading or misalignment is more
  likely;
- if movement has little effect but a small nut-position change has a large
  effect, O-ring size or position is more likely.

Do not apply force that could damage the connection or create a flooding risk.

## 10. What to inspect during the next disassembly

The O-ring may show the cause through its contact marks:

- uniformly flattened → overall size or cord-diameter issue is more likely;
- more flattened on one side → the spigot may be entering at an angle;
- twisted or showing a spiral mark → it may rotate during assembly;
- cut or pinched → it may have been trapped between metal edges;
- pushed out of the groove → it may be too thick;
- almost no contact marks → it may be too thin.

Inspect the cylindrical surface inside the female socket for:

- rust;
- scratches;
- a sharp edge;
- deposits;
- deformation.

## 11. What must not be assumed

- Maximum tightening is not automatically the correct position.
- PTFE tape applied outside the connection does not fix a leak past the O-ring.
- A homemade ring cut from or joined out of random rubber is not a reliable
  long-term solution.
- A temporarily dry position does not guarantee stability after temperature
  cycles.

## 12. Working recommendation

The most reasonable next step is:

1. obtain a standard EPDM O-ring of a suitable size;
2. start with a trial around **16 × 2 mm** if the groove measurement really is
   approximately 17 mm in diameter and 2 mm in cord/groove dimension;
3. clean the groove and female socket thoroughly;
4. apply only a small amount of silicone grease;
5. assemble without excessive tightening;
6. check both cold and after several heating/cooling cycles.

## 13. Additional information needed for an exact size

The following caliper measurements would support a more accurate selection:

- diameter at the bottom of the groove;
- outside diameter across the edges immediately beside the groove;
- groove width;
- inside diameter of the female cylindrical socket.

These dimensions can be used to estimate actual O-ring compression and select a
size by engineering reasoning rather than trial alone.

## 14. Short chatbot context

**Problem:** The radiator connection leaks on the right-hand, pipe side.

**Assembly:** A brass spigot enters a cylindrical socket in the radiator valve
and seals with an O-ring. The nut retains and positions the connection.

**History:** The original O-ring was replaced with a homemade substitute. The
leak depends on the nut position. There is an intermediate position with no
leak; maximum tightening is not best.

**Working diagnosis:** The most likely causes are an incorrect O-ring size or
cord diameter and/or a slightly tilted spigot caused by side loading from the
pipe.

**Measurement:** The groove was measured approximately as 17 × 2 mm.

**First trial candidate:** an EPDM O-ring around 16 × 2 mm, but the final size
must be confirmed with more accurate groove and socket measurements.
