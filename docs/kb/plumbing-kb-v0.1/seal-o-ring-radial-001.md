---
id: seal-o-ring-radial-001
title: "Radial Sealing with an O-Ring"
document_type: seal
status: draft
version: "0.1"
language: en
domain:
  - general-plumbing
  - heating
system:
  - domestic-piping
  - radiator
component:
  - fitting
  - valve
connection_type:
  - insert-o-ring
  - press-fit
seal_type:
  - o-ring
material:
  - epdm
  - nbr
symptom:
  - leak
  - leak-after-reassembly
  - leak-changes-with-tightening
failure_mode:
  - wrong-seal-size
  - seal-worn
  - seal-cut
  - seal-twisted
  - seal-overcompressed
  - damaged-seat
  - misalignment
  - debris
aliases:
  - "radial O-ring seal"
  - "O-ring seal"
  - "O-пръстен"
  - "О ринг"
  - "гумен пръстен"
related:
  - connection-insert-o-ring-001
  - diagnostic-leak-tightening-001
safety_level: medium
source_class:
  - derived-reasoning
evidence_level: hypothesis
applies_to:
  - "Generic static radial O-ring seals in domestic plumbing and heating; not exact product compatibility"
---

# Radial Sealing with an O-Ring

> Draft canonical unit. This document describes a general sealing principle. It
> does not identify the correct replacement size or material for a specific
> product without measurements and approved technical documentation.

## What it is

An O-ring is a circular elastomeric sealing element with a round cross-section.
In a radial seal, the ring is installed in a groove and compressed between an
internal and an external cylindrical surface. The O-ring provides the fluid
barrier; the surrounding parts provide the geometry that retains and compresses
it.

The terms **radial seal** and **axial seal** must not be treated as
interchangeable. Radial sealing is described here. Face or axial sealing needs a
separate unit because the groove geometry, pressure direction, and installation
checks differ.

## Where it is used

Radial O-ring seals are used in detachable or serviceable connections where one
part enters a bore or socket in another part. Examples include valve and
fitting spigots, cartridge housings, removable covers, and some radiator
connections.

The exact application depends on the component drawing. A visually similar
connection may use a flat gasket, a conical seat, or an integrated seal instead
of an O-ring.

## How it seals

The groove and the mating cylindrical surface deform the O-ring so that it
maintains contact around the sealing circumference. Fluid pressure can increase
contact on one side, but pressure alone does not make an incorrectly sized,
damaged, or displaced ring reliable.

Mechanical retention and sealing are separate functions:

- the housing, retaining nut, shoulder, clip, or interference geometry retains
  the assembled parts;
- the O-ring seals the interface between the specified cylindrical surfaces;
- a thread or retaining nut is not automatically the sealing surface merely
  because it changes the clamping force.

## Critical dimensions

The following dimensions and conditions must be considered together:

- O-ring inside diameter;
- O-ring cross-section, also called cord diameter;
- groove diameter, depth, width, and corner radii;
- mating bore or shaft diameter;
- available lead-in chamfer and edge condition;
- expected compression, stretch, and gland fill;
- surface condition, alignment, and allowable movement.

An observed groove measurement is not enough to select a commercial O-ring
unambiguously. The ring size, groove geometry, mating diameter, service medium,
temperature, pressure, and manufacturer design must be checked as one system.

Do not promote a case-specific value such as an approximately 17 mm groove
measurement to a universal product size. Store that value in the relevant case
document together with how it was measured and its uncertainty.

## Materials

Common elastomer families include EPDM, NBR, FKM, and silicone, but the material
must be selected for the actual medium, temperature, pressure, motion, and
exposure time. Material names alone do not establish compatibility; compound
formulation and service conditions also matter.

For domestic water and heating applications, EPDM and NBR may both appear in
the market, but they are not interchangeable by default. The assistant must not
recommend one solely from a photograph or from the word “rubber”. Use the
component manufacturer’s specification or a reviewed compatibility source.

## What correct installation looks like

A correctly installed radial O-ring should be:

- the specified size and material for the application;
- seated continuously in its groove, without twists, cuts, nicks, or trapped
  debris;
- installed over a clean, deburred lead-in path rather than across a sharp edge
  or exposed thread;
- lubricated only with a lubricant known to be compatible with the elastomer
  and the fluid system;
- assembled without forcing the ring out of the groove or scraping it over a
  bore, transverse hole, or thread;
- aligned so that the mating surfaces do not impose unintended side load;
- retained by the connection geometry, not by excessive tightening.

After assembly, inspect for immediate leakage and verify the joint under the
lowest safe test condition available. A joint that stops dripping only at one
nut position is not evidence that maximum tightening is correct.

## Typical failures

Typical failure modes include:

- wrong inside diameter or cross-section;
- a ring cut, nicked, flattened, hardened, swollen, or otherwise worn;
- twisting during insertion or assembly;
- over-compression, extrusion, or displacement from the groove;
- insufficient compression because the groove, mating part, or ring is out of
  tolerance;
- damaged, rough, corroded, or contaminated sealing surfaces;
- pipe or fitting misalignment that loads the ring unevenly;
- chemical or thermal incompatibility;
- missing support, retainer, washer, or other assembly part.

The same visible symptom can result from more than one failure mode. The list
is a diagnostic starting point, not a claim that one cause is certain.

## Signs of an incorrect size

The following observations increase suspicion of an incorrect size, but do not
prove it:

- the ring sits loose in the groove or cannot be seated uniformly;
- the ring rolls, pinches, or moves during insertion;
- leakage changes non-monotonically as a retaining nut is tightened;
- the ring is visibly flattened beyond the intended sealing zone;
- the ring is cut during assembly or extrudes into a clearance gap;
- the connection seals only in one axial or angular position;
- the replacement ring looks similar but differs in cross-section or inside
  diameter from the removed ring.

Confirm the dimensions and the construction before replacing the ring again.
Do not infer the size from a single diameter measurement or from an arbitrary
commercial label.

## Compatibility

Compatibility must be checked against the actual fluid and service conditions,
including potable-water requirements where applicable, temperature range,
pressure, cleaning agents, antifreeze, oils, and any treatment chemicals.

The assistant may explain compatibility factors, but must not claim that a
specific elastomer is approved for a named product or fluid without a reviewed
source covering that exact scope. When the medium, temperature, or product
model is unknown, the safe answer is to request the missing information or
recommend checking the manufacturer’s documentation.

## Safety

Before loosening a connection, isolate the relevant supply and account for
stored pressure, hot water, and heating-system temperature. Work on a water
heater connected to mains electricity, a shared riser, or a hot pressurized
heating system may require a qualified person.

Stop and escalate when the isolation point is uncertain, the joint cannot be
depressurized safely, water may contact energized equipment, the fitting or
pipe is cracked, or a small mistake could cause flooding.

## Related topics

- `connection-insert-o-ring-001` — how a spigot, socket, and retaining element
  create the connection;
- `diagnostic-leak-tightening-001` — diagnosis when leakage changes with nut
  position or tightening;
- `case-radiator-o-ring-leak-001` — a case-specific observation that must not
  be generalized into a universal O-ring size.

