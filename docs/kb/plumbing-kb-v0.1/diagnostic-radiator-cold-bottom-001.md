---
id: diagnostic-radiator-cold-bottom-001
title: "Diagnosis: Radiator Markedly Cold at the Bottom"
document_type: diagnostic
status: draft
version: "0.1"
language: en
domain:
  - diagnostics
  - heating
system:
  - radiator
component:
  - radiator
symptom:
  - poor-flow
failure_mode:
  - debris
  - corrosion
aliases:
  - "radiator cold at the bottom"
  - "radiator hot at top cold at bottom"
  - "bottom of radiator not heating"
  - "радиаторът е студен отдолу"
  - "радиаторът топли само отгоре"
  - "студена долна част на радиатора"
related:
  - diagnostic-radiator-cold-top-001
  - diagnostic-radiator-completely-cold-001
safety_level: medium
source_class:
  - manufacturer-documentation
evidence_level: sourced
source_refs:
  - ref: "src_worcester_cold_bottom"
    locator: "Why is my radiator cold at the bottom?"
    accessed: "2026-10-04"
  - ref: "src_worcester_bleed_radiator"
    locator: "Do your radiators need bleeding?"
    accessed: "2026-10-04"
  - ref: "src_caleffi_idronics_32"
    locator: "Radiator and heat-emitter checks, pages 18-19"
    accessed: "2026-10-04"
applies_to:
  - "Water-filled domestic radiators after stable warm-up; a mild top-to-bottom gradient may be normal heat transfer"
---

# Diagnosis: Radiator Markedly Cold at the Bottom

> Development source-backed unit. A cooler return side is not automatically a
> fault. This unit concerns a pronounced cold lower region with poor heat output
> after the system has stabilized.

## Symptom

The upper part of a radiator becomes warm or hot, but a substantial lower area
remains distinctly cold after the heating system has had time to stabilize. The
room may heat slowly or fail to reach the expected temperature.

Some temperature drop across a working radiator is normal because heat is being
released into the room. Diagnose a problem only when the cold region is marked,
persistent, and associated with reduced performance.

## Most likely causes

Possible causes include restricted water circulation from sludge, magnetite,
corrosion debris, or another blockage. Poor overall flow, a partly closed valve,
or hydraulic imbalance can create a similar result.

Trapped air is a weaker fit when the top is already hot and the cold region is
mainly at the bottom. Bleeding should not be presented as the universal repair
for this pattern.

## What distinguishes the causes

- One radiator with a pronounced cold lower region supports a local restriction
  more than a heat-source fault.
- Several slow or cold radiators support a system circulation, balancing, or
  water-quality problem.
- A cold upper region with a warmer bottom supports trapped air instead.
- A completely cold radiator requires valve, control, and system-wide checks
  before a debris diagnosis.
- Dark water released during a separate approved service operation may support
  a debris/corrosion hypothesis, but the user should not drain the system merely
  to look for it.

## Tests

1. Let the heating reach stable operation and compare the temperature pattern
   with nearby radiators.
2. Confirm from visible controls only that the radiator is intended to be on.
3. Check whether the issue affects one radiator, one zone, or the whole system.
4. Look for leaks, external corrosion, closed valves, an appliance error display,
   or an abnormal pressure indication without opening the system.
5. Record whether the cold area is a small gradual gradient or a large sharply
   defined region with poor room heating.

Internal flushing, chemical treatment, radiator removal, and circulation
measurements are technician tasks unless an exact product procedure and safe
isolation plan exist.

## How to interpret the results

- A mild gradient with normal room heating can be normal heat transfer.
- A large persistent cold lower region on one radiator supports restricted local
  circulation or debris, but does not identify the exact deposit or repair.
- Similar symptoms across several radiators shift suspicion to system flow,
  water quality, balancing, or heat-source operation.
- If the pattern disappears during later stable operation, the initial reading
  was probably taken during warm-up and should not trigger a repair.

## What not to do

- Do not repeatedly bleed a radiator solely because its bottom is cooler.
- Do not remove or flush a radiator while hot, pressurized, or not positively
  isolated.
- Do not add cleaning chemicals without checking system materials, appliance
  requirements, concentration, and disposal instructions.
- Do not strike the radiator or force valves to dislodge a suspected blockage.

## Next steps

Record the stable heat pattern, affected radiators, visible settings, pressure
indication, and any history of corrosion or repeated air. A qualified heating
technician can then distinguish local blockage from balancing, valve, pump, or
system-water problems and select an appropriate cleaning method.

## Safety

Stop DIY diagnosis at any point that requires opening, draining, chemically
treating, or removing a pressurized heating component. Escalate immediately for
an uncontrolled leak, severe corrosion, hot discharge, electrical proximity,
or an appliance fault.

## Sources

- `src_worcester_cold_bottom` — manufacturer symptom and escalation guidance;
- `src_worcester_bleed_radiator` — distinction between cold-top and cold-bottom
  patterns;
- `src_caleffi_idronics_32` — system-level hydronic troubleshooting context.

## Related topics

- `diagnostic-radiator-cold-top-001` — trapped-air pattern;
- `diagnostic-radiator-completely-cold-001` — no-heat differential diagnosis.
