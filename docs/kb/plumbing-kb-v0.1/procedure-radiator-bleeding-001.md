---
id: procedure-radiator-bleeding-001
title: "Procedure: Bleed an Accessible Water-Filled Radiator"
document_type: procedure
status: draft
version: "0.1"
language: en
domain:
  - heating
  - tools
system:
  - radiator
component:
  - radiator
symptom:
  - air
  - noise
  - poor-flow
aliases:
  - "bleed a radiator"
  - "release air from radiator"
  - "radiator bleed valve"
  - "обезвъздушаване на радиатор"
  - "как се обезвъздушава радиатор"
  - "изпускане на въздух от радиатор"
related:
  - diagnostic-radiator-cold-top-001
  - diagnostic-radiator-gurgling-001
  - diagnostic-radiator-completely-cold-001
safety_level: medium
source_class:
  - manufacturer-documentation
evidence_level: sourced
source_refs:
  - ref: "src_worcester_bleed_radiator"
    locator: "How to bleed a radiator, steps 1-8"
    accessed: "2026-10-04"
  - ref: "src_vaillant_cold_radiators"
    locator: "How to bleed a radiator and post-procedure checks"
    accessed: "2026-10-04"
  - ref: "src_danfoss_winter_radiator"
    locator: "Step 2: Bleed your radiator"
    accessed: "2026-10-04"
applies_to:
  - "An accessible manual bleed valve on a water-filled domestic radiator where the heating can be switched off and allowed to cool"
---

# Procedure: Bleed an Accessible Water-Filled Radiator

> Development source-backed procedure. Use only for a known manual radiator
> bleed valve. The appliance and system manual takes precedence.

## Goal

Release a local air pocket from the top of an accessible radiator and verify
that the vent closes without leakage.

## Required tools

- the correct radiator key or the exact tool specified for the vent;
- a cloth and a small container for drips;
- the heat-source user manual or a known safe way to check system pressure after
  the procedure.

Do not substitute pliers or a poorly fitting tool that can damage the vent.

## Preconditions

- The radiator is part of a water-filled heating system, not a steam system.
- The heating can be switched off and the radiator and connected pipes can cool
  completely.
- The bleed valve is accessible, identifiable, and not visibly corroded,
  rounded, cracked, or already leaking.
- A small water release can be contained without reaching electrical equipment
  or damaging the building.
- The user knows how the specific system pressure is checked after bleeding and
  will not refill an unknown appliance from generic instructions.

If any precondition is not met, stop and request qualified help.

## Steps

1. With the heating operating normally, identify the radiator that remains cold
   mainly at the top. Do not open the vent yet.
2. Switch the heating off and wait until the radiator and connected pipes are
   fully cool.
3. Place the container and cloth directly below the bleed vent.
4. Fit the correct key and open the vent slowly by a small amount. Do not remove
   the screw and do not continue turning once air can escape.
5. If air is present, allow the hissing to stop. Close the vent as soon as a
   steady small flow of water appears.
6. Tighten only enough to stop the flow. Dry the valve and inspect it for renewed
   moisture.
7. Repeat only on other radiators that show the same supported symptom and meet
   every precondition.
8. Check the system pressure according to the exact heat-source manual. If the
   pressure is outside its documented range and the approved restoration method
   is unknown, stop and contact a technician.
9. Restart the heating and verify that the radiator warms more evenly and the
   bleed valve remains dry.

## Checkpoints

- Before opening: system off, radiator cool, correct valve and tool identified.
- During venting: only a controlled hiss or small water flow; no hot discharge,
  damaged screw, or uncontrolled leak.
- After closing: valve dry, pressure checked against product instructions, and
  no appliance fault displayed.

## What can go wrong

- A worn or damaged vent may not reseal.
- Hot or pressurized water can cause injury or property damage.
- Bleeding can lower pressure in a sealed system.
- No water at the vent may indicate low pressure, isolation, or a circulation
  problem rather than a reason to open the vent further.
- Repeated air can indicate an underlying system fault.

## Post-assembly check

Observe the vent during warm-up and again after the system reaches normal
operation. Confirm that it remains dry and that no new fault or abnormal
pressure indication appears. Improvement supports trapped air as the cause but
does not prove that a recurring source of air has been corrected.

## When to stop

Stop immediately if the water is hot, the vent will not move with the correct
tool, the screw begins to round or come out, water cannot be contained, the
valve will not reseal, pressure is unknown or abnormal, an appliance fault
appears, or the installation is shared or outside the user's control.

## Sources

- `src_worcester_bleed_radiator` — manufacturer sequence and pressure reminder;
- `src_vaillant_cold_radiators` — cooling, controlled opening, and escalation;
- `src_danfoss_winter_radiator` — homeowner bleeding and leak-check guidance.

## Related topics

- `diagnostic-radiator-cold-top-001` — when the symptom supports bleeding;
- `diagnostic-radiator-gurgling-001` — noise and repeated-air interpretation;
- `diagnostic-radiator-completely-cold-001` — alternative causes of no heat.
