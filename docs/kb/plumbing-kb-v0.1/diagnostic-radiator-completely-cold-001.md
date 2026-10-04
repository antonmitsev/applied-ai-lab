---
id: diagnostic-radiator-completely-cold-001
title: "Diagnosis: One Radiator Is Completely Cold"
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
  - radiator-valve
  - thermostatic-valve
symptom:
  - poor-flow
  - stuck-valve
failure_mode:
  - debris
  - unknown
aliases:
  - "one radiator completely cold"
  - "radiator not heating"
  - "cold radiator while others are hot"
  - "един радиатор не топли"
  - "радиаторът е изцяло студен"
  - "всички радиатори топлят освен един"
related:
  - diagnostic-radiator-cold-top-001
  - diagnostic-radiator-cold-bottom-001
  - procedure-radiator-bleeding-001
safety_level: medium
source_class:
  - manufacturer-documentation
evidence_level: sourced
source_refs:
  - ref: "src_vaillant_radiator_not_working"
    locator: "Why is one radiator not working? and check radiator valves"
    accessed: "2026-10-04"
  - ref: "src_danfoss_winter_radiator"
    locator: "Steps 1-4: check, bleed, valve, expert"
    accessed: "2026-10-04"
  - ref: "src_caleffi_idronics_32"
    locator: "Heat-emitter checks, pages 18-19"
    accessed: "2026-10-04"
applies_to:
  - "One water-filled domestic radiator remaining cold while other radiators in the same system heat normally"
---

# Diagnosis: One Radiator Is Completely Cold

> Development source-backed unit. This symptom has several plausible causes;
> start with non-destructive observations and do not infer a boiler repair from
> one cold radiator.

## Symptom

One radiator remains cold over its full surface after the heating has stabilized,
while other radiators in the same installation become warm.

If all radiators are cold, use a system-level path instead: check visible user
settings, the heat-source display, documented pressure indication, and the exact
appliance manual without opening the appliance.

## Most likely causes

Possible local causes include:

- a manual or thermostatic radiator valve set closed;
- a thermostatic valve pin that is not opening;
- trapped air or an airlock;
- restricted flow from debris or a blockage;
- a closed return/lockshield valve;
- a balancing or zone-flow problem.

The symptom does not distinguish these causes by itself.

## What distinguishes the causes

- A partly warm radiator, especially cold at the top, supports trapped air more
  than a fully closed flow path.
- Correct visible valve settings with a fully cold radiator keep a stuck valve,
  blockage, or flow problem in consideration.
- Several cold radiators or a heat-source fault display points away from a
  single radiator fault.
- Warm pipework up to one valve but no radiator warming is useful technician
  evidence, but surfaces may be too hot to touch safely.

## Tests

1. Confirm that other radiators heat and that the room control is requesting
   heat.
2. Inspect only user-operable valve settings. Record the positions before
   changing anything.
3. Check whether any part of the radiator becomes warm after stable operation.
4. Listen for air noise and look for leaks, corrosion, or a damaged valve.
5. Check the heat-source display and pressure indication without removing any
   cover. Use only the exact product manual to interpret a code or pressure
   range.
6. If the pattern supports trapped air, use the related diagnosis and bleeding
   procedure. If the radiator remains fully cold, arrange valve and flow testing.

Removing a thermostat head or testing a valve pin is product-dependent. Do it
only when the exact manufacturer instructions identify the head and permit that
user action; never loosen the valve body or water-side connection.

## How to interpret the results

- A closed user setting that restores normal heat after correction supports a
  control-setting cause.
- Air released with later even heating supports trapped air for that event.
- No change after safe settings and air checks supports a valve, blockage,
  balancing, or zone-flow problem that needs a technician.
- If all radiators are affected, investigate the heat source and system controls
  rather than dismantling the one radiator.

## What not to do

- Do not force a valve pin, loosen the valve body, or remove a water-side fitting.
- Do not change hidden balancing positions without recording and understanding
  the system design.
- Do not open a boiler or heat-pump casing or attempt electrical or gas work.
- Do not assume low pressure has one universal target or refill method; use the
  exact appliance instructions.

## Next steps

Provide the radiator heat pattern, valve type and visible settings, whether other
radiators work, pressure indication, error code, noises, and leak observations
to a qualified heating technician. These facts narrow the diagnosis without an
unsafe disassembly.

## Safety

Stop for any leak, damaged/corroded valve, hot surface, abnormal pressure,
appliance fault, shared-system uncertainty, or need to access gas, electrical,
combustion, or pressurized components.

## Sources

- `src_vaillant_radiator_not_working` — manufacturer differential diagnosis for
  one versus all cold radiators;
- `src_danfoss_winter_radiator` — manufacturer check/bleed/valve/escalation path;
- `src_caleffi_idronics_32` — professional heat-emitter and system-flow checks.

## Related topics

- `diagnostic-radiator-cold-top-001` — partial cold-top pattern;
- `diagnostic-radiator-cold-bottom-001` — restricted lower-region pattern;
- `procedure-radiator-bleeding-001` — bounded air-release procedure.
