---
id: diagnostic-radiator-cold-top-001
title: "Diagnosis: Radiator Cold at the Top"
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
  - air
  - poor-flow
aliases:
  - "radiator cold at the top"
  - "radiator warm at the bottom"
  - "top of radiator not heating"
  - "радиаторът е студен отгоре"
  - "радиаторът топли само отдолу"
  - "студена горна част на радиатора"
related:
  - procedure-radiator-bleeding-001
  - diagnostic-radiator-gurgling-001
  - diagnostic-radiator-completely-cold-001
safety_level: medium
source_class:
  - manufacturer-documentation
evidence_level: sourced
source_refs:
  - ref: "src_worcester_bleed_radiator"
    locator: "Do your radiators need bleeding?"
    accessed: "2026-10-04"
  - ref: "src_vaillant_cold_radiators"
    locator: "When should you bleed a radiator?"
    accessed: "2026-10-04"
  - ref: "src_caleffi_idronics_32"
    locator: "Introduction and radiator checks, pages 4-5 and 18-19"
    accessed: "2026-10-04"
applies_to:
  - "Water-filled domestic radiators after the heating system has had time to reach stable operation"
---

# Diagnosis: Radiator Cold at the Top

> Development source-backed unit. The temperature pattern is a diagnostic clue,
> not proof of one cause. Product instructions and the actual system arrangement
> take precedence.

## Symptom

After the heating has been running long enough to warm the system, the lower
part of one radiator is warm while the upper part remains distinctly cooler or
cold. Bubbling or gurgling may also be present.

Do not classify a radiator during the first minutes of warm-up. A temporary
temperature difference while hot water is first entering the radiator is not
enough to diagnose trapped air.

## Most likely causes

The leading hypothesis is air collected in the upper part of the radiator. Air
occupies space that should contain circulating water and reduces the wetted heat
transfer area.

Other possibilities include insufficient system pressure, poor circulation, a
partly closed valve, a system-wide air problem, or a fault outside the radiator.
The symptom alone does not establish which component needs repair.

## What distinguishes the causes

- A cold upper section with a warm lower section and audible gurgling supports
  the trapped-air hypothesis.
- A completely cold radiator does not provide the same pattern; check settings,
  valves, and whether other radiators heat normally.
- Several affected radiators, repeated air after bleeding, or a falling pressure
  indication suggests a wider system problem rather than a one-time local air
  pocket.
- A warm top with a markedly cold lower section points away from trapped air and
  toward restricted circulation or debris.

## Tests

1. Confirm that the heating is calling for heat and allow the system to reach a
   stable operating condition without changing boiler settings.
2. Compare the top and bottom of the affected radiator using the back of the
   hand without touching exposed hot pipework. Stop if any surface is too hot to
   approach safely.
3. Compare one affected radiator with nearby radiators. Record whether the issue
   is local or system-wide.
4. Listen for gurgling or trickling and look for visible leaks, corrosion, or an
   appliance error display.
5. If the radiator is cold mainly at the top and the system can be safely cooled,
   use `procedure-radiator-bleeding-001` only after its preconditions are met.

## How to interpret the results

- If air escapes and the radiator later heats more evenly, trapped air was a
  supported cause for that event.
- If no air escapes, no water reaches the vent, or the pattern does not improve,
  do not keep opening the vent; pressure, circulation, valve, or blockage checks
  are needed.
- If the same symptom returns soon, treat repeated air as a system condition
  requiring investigation rather than repeating the procedure indefinitely.
- If multiple radiators remain cold or the heat source reports a fault, follow
  its exact user manual or contact a qualified heating technician.

## What not to do

- Do not bleed a hot radiator or work near exposed electrical parts.
- Do not remove the bleed screw or open an unknown valve fully.
- Do not add system pressure without the exact appliance instructions.
- Do not assume every cold area is trapped air or that repeated bleeding fixes
  the underlying cause.

## Next steps

For a single accessible radiator with no leak, no appliance fault, and a known
safe pressure-restoration method, controlled bleeding may be a limited local
action. Otherwise record the heat pattern, noises, pressure indication, and
which radiators are affected for a qualified technician.

## Safety

Stop and escalate if the system cannot be switched off and cooled, water is near
electrical equipment, the bleed valve is damaged or leaking, pressure is unknown
or abnormal, the installation is shared, or the leak cannot be contained.

## Sources

- `src_worcester_bleed_radiator` — manufacturer homeowner guidance on the
  cold-top pattern and bleeding.
- `src_vaillant_cold_radiators` — manufacturer guidance on air symptoms,
  cooling, and post-bleed pressure checks.
- `src_caleffi_idronics_32` — professional hydronic troubleshooting context.

## Related topics

- `procedure-radiator-bleeding-001` — bounded bleeding procedure;
- `diagnostic-radiator-gurgling-001` — air-related noise pattern;
- `diagnostic-radiator-completely-cold-001` — radiator with no warm area.
