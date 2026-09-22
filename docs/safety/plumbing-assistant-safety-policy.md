# Plumbing Assistant — Safety Policy and Hazard Matrix

| Field | Value |
| --- | --- |
| Policy ID | `PA-SAFE-001` |
| Status | Draft; domain-expert review required |
| Version | 0.1 |
| Date | 2026-09-22 |
| Audit finding | `AUD-P0-002` |
| Output contract | [Assistant response schema](../contracts/assistant-response.schema.json) |

## 1. Objective

This policy prevents the language model from being the sole authority that
decides whether its own procedural answer is safe. The Node.js application owns
the minimum urgency, permitted response mode, fixed emergency wording, and final
rendering decision.

The assistant provides information for non-professionals. It does not confirm
that an installation is safe, authorize work, or replace a qualified plumbing
or heating professional.

## 2. Enforcement principles

1. Safety severity can be raised by any stage and lowered by none.
2. Explicit structured danger signals are evaluated before retrieval or model
   generation.
3. Unknown answers to material safety questions block routine instructions.
4. Model output is data. It is never rendered before schema and policy checks.
5. Critical responses use reviewed server-owned templates, not generated prose.
6. Caution responses use reviewed templates and approved low-risk action codes.
7. Generated procedural steps are eligible only for a routine case with adequate
   evidence and no unanswered material safety question.
8. A malformed, refused, incomplete, contradictory, or unsupported model output
   fails to a caution response without procedural steps.
9. Moderation is defense in depth for general harmful content; it does not
   replace the plumbing-specific hazard matrix.
10. Bulgarian and English templates express the same safety decision and actions.

## 3. Safety pipeline

```text
request and conversation-state validation
  -> structured intake normalization
  -> deterministic pre-triage
       -> explicit critical match: fixed critical response; no model call
       -> unresolved material signal: caution/question flow
       -> otherwise continue
  -> input moderation
  -> bounded retrieval and model request
  -> strict structured-output parse
  -> deterministic post-validation
  -> urgency floor = max(pre-triage, model, post-validation)
       -> critical: fixed critical template
       -> caution: fixed caution shell + approved action codes only
       -> routine: validated grounded response
  -> escaped rendering and audit-safe metrics
```

The implementation must maintain one server-side severity order:

```text
routine < caution < critical
```

No prompt, tool result, model field, client parameter, or prior conversation item
may lower the pre-triage floor.

## 4. Structured safety intake

Before routine guidance, the application must resolve these fields to `yes` or
`no`. `unknown` is not equivalent to `no`.

| Field | Question represented |
| --- | --- |
| `active_uncontrolled_leak` | Is water actively escaping and not controlled? |
| `water_near_electricity` | Is water on or near sockets, wiring, appliances, a distribution board, or other electrical equipment? |
| `scalding_or_steam` | Is there very hot water, steam, a hot surface, or scalding risk? |
| `abnormal_pressure_signs` | Is a gauge outside its marked normal range, a relief valve discharging, or a component bulging/noisy under pressure? |
| `wastewater_exposure` | Is sewage or contaminated wastewater backing up or contacting occupied areas? |
| `gas_combustion_signal` | Is there gas smell, combustion trouble, fumes, a carbon-monoxide alarm, or a request to open combustion equipment? |
| `building_common_system` | Does the affected part appear to be a riser, shared heating loop, common drain, or building-owned component? |
| `sealed_or_metered_component` | Is the requested action on a seal, water/heat meter, utility tag, or tamper-evident component? |
| `component_identified` | Is the component and relevant connection sufficiently identified? |
| `isolation_known_and_accessible` | Is an appropriate shutoff known, reachable, and safe to operate without tools or force? |

The UI should collect structured answers where practical. Free text and images
may suggest a hazard but must not silently convert a negated or ambiguous phrase
into a safe answer. When natural-language detection is uncertain, the server
asks a focused question and keeps the case at least `caution`.

## 5. Hazard matrix

This matrix is an engineering draft. A qualified Bulgarian plumbing/heating
professional must validate triggers, actions, wording, and escalation paths
before public release.

| Code | Hazard | Deterministic trigger | Minimum urgency | Permitted response | Mandatory blocks / handoff |
| --- | --- | --- | --- | --- | --- |
| `HZ-001` | Uncontrolled water release or flooding | `active_uncontrolled_leak=yes` | Critical | Fixed isolation-and-distance template; known accessible shutoff only | No disassembly; emergency plumber/building manager; 112 only for immediate danger |
| `HZ-002` | Water near electricity | `water_near_electricity=yes` | Critical | Fixed keep-away template | Do not touch water, equipment, plugs, breakers, or wet-area shutoffs; emergency services/electricity operator as appropriate |
| `HZ-003` | Scalding, steam, or dangerously hot component | `scalding_or_steam=yes` | Critical | Fixed distance/cooldown template | No bleeding, opening, draining, or touching; urgent professional handoff |
| `HZ-004` | Abnormal pressure or pressurized component failure | `abnormal_pressure_signs=yes` | Critical | Fixed do-not-adjust template | No filling, bleeding, opening, capping, or relief-valve manipulation; heating specialist |
| `HZ-005` | Wastewater or sewage backup | `wastewater_exposure=yes` | Critical when spreading/contact is active; otherwise Caution | Fixed exposure-limiting template | No chemical mixing or contaminated-area procedure; plumber/building manager |
| `HZ-006` | Gas, combustion, flue, or carbon-monoxide signal | `gas_combustion_signal=yes` | Critical and out of scope | Fixed leave/avoid-ignition template | No boiler, burner, gas-valve, or flue instructions; emergency services/gas operator |
| `HZ-007` | Shared riser or building-common system | `building_common_system=yes` | Caution; Critical if combined with HZ-001–005 | Identification and non-invasive observation only | No isolation or modification without authorization; building manager/professional |
| `HZ-008` | Sealed meter, heat meter, or utility-owned component | `sealed_or_metered_component=yes` | Caution | Identification and official-document explanation only | No seal removal, bypass, opening, calibration, or tampering; utility/building manager |
| `HZ-009` | Unknown component or compatibility | `component_identified!=yes` for a procedural request | Caution | Ask for markings, model, measurements, and safe photos | No part recommendation, force, cutting, opening, or connection change |
| `HZ-010` | Invasive or concealed work | User asks to cut, drill, chase, solder, press, weld, or open concealed building fabric | Caution | Explain scope and prerequisites | No procedural instruction until services and authorization are established; professional handoff |
| `HZ-011` | Chemical drain-treatment risk | Chemical already used, product unknown, or mixing requested | Critical if reaction/fumes/heat; otherwise Caution | Fixed no-mixing/ventilation-and-label template | No mixing, plunging over chemicals, or neutralization recipe; poison/emergency guidance when symptomatic |
| `HZ-012` | Underfloor-heating or manifold intervention | Unknown system state, actuator/electrical interaction, hot loop, or pressure change requested | Caution | Read-only observation and control identification | No loop opening, draining, filling, electrical actuator work, or balancing procedure without identified system and approved playbook |
| `HZ-013` | Evidence conflict or safety uncertainty | Intake, image, history, retrieval, and model output materially disagree | Caution | State uncertainty and ask one focused safety question | No procedural steps until resolved |

If several hazards match, the response uses the highest urgency and includes all
matched hazard codes in content-free metrics. Hazard evidence text is never
logged.

## 6. Server-owned action registry

Model-produced actions are identifiers, not executable instructions. The server
maps approved identifiers to reviewed Bulgarian and English copy. Unknown or
disabled identifiers fail validation.

| Action code | Maximum mode | Preconditions | Initial status |
| --- | --- | --- | --- |
| `KEEP_DISTANCE` | Critical | Any relevant physical hazard | Enabled pending wording review |
| `KEEP_OTHERS_AWAY` | Critical | Exposure area exists | Enabled pending wording review |
| `CALL_112_IMMEDIATE_DANGER` | Critical | Immediate risk to life, injury, fire, electrical contact, gas/CO, or uncontrollable dangerous event | Enabled pending Bulgarian emergency review |
| `CONTACT_BUILDING_MANAGER` | Caution | Shared/building-owned system is possible | Enabled pending wording review |
| `CONTACT_EMERGENCY_PLUMBER` | Critical | Active water damage without safe control | Enabled pending directory-independent wording review |
| `CONTACT_HEATING_SPECIALIST` | Caution | Pressurized or central-heating intervention | Enabled pending wording review |
| `DO_NOT_TOUCH_ELECTRICAL` | Critical | `HZ-002` | Enabled pending wording review |
| `DO_NOT_MIX_CHEMICALS` | Critical | `HZ-011` | Enabled pending wording review |
| `CLOSE_KNOWN_ACCESSIBLE_WATER_VALVE` | Critical | Valve purpose is known, dry/safely reachable, hand-operated, and no force is needed | Candidate; expert approval required |
| `PLACE_CONTAINER_IF_SAFE` | Caution | Small non-hot drip, no electrical/wastewater exposure, stable placement | Candidate; expert approval required |
| `OBSERVE_WITHOUT_TOUCHING` | Caution | Observation point is safely accessible | Candidate; expert approval required |
| `READ_GAUGE_WITHOUT_ADJUSTING` | Caution | Gauge visible without opening or touching hot/electrical parts | Candidate; expert approval required |
| `PHOTOGRAPH_LABEL_FROM_SAFE_DISTANCE` | Caution | No approach to hazardous area is required | Candidate; expert approval required |
| `CHECK_OTHER_FIXTURE_FLOW` | Routine | No active leak, wastewater, heat, pressure, or electrical hazard | Candidate; expert approval required |

No candidate action may be enabled in production until an expert records approval
and its exact localized copy is covered by snapshot tests. Radiator bleeding,
system filling, drain chemicals, dismantling, connection replacement, and
underfloor-loop adjustment are deliberately absent until separate playbooks are
reviewed.

## 7. Output contract and post-validation

The model must return the JSON contract in
[`assistant-response.schema.json`](../contracts/assistant-response.schema.json)
using OpenAI Structured Outputs with `strict: true`. The schema deliberately
uses the provider-supported subset of JSON Schema. Cross-field conditions, array
uniqueness, URL protocol/allowlist checks, and policy semantics are enforced by
the separate server-side post-validator. The application handles provider
refusal, incomplete output, parsing failure, and schema failure as controlled
errors.

The post-validator must reject or escalate when:

- the model urgency is below the deterministic floor;
- any material safety intake field required for the proposed action is unknown;
- a hazard code conflicts with the selected urgency or scope;
- a critical response includes generated procedural steps;
- a caution response includes generated procedural steps;
- an action code is unknown, disabled, or missing its preconditions;
- an identifier expected to be unique is duplicated;
- a generated routine step lacks an adequate source;
- exact product compatibility lacks an exact product/variant source;
- the response contains a URL, URL protocol, or source ID not supplied and
  allowed by the retrieval layer;
- the response is incomplete, refused, malformed, or exceeds configured bounds.

The server derives render mode after validation. The model does not choose the
template. User-controlled and retrieved text must be escaped before display.

## 8. Response modes

### Critical

Render only reviewed localized content assembled from:

1. a clear stop statement;
2. the matched hazard name;
3. applicable enabled critical action codes;
4. prohibited actions from the matrix;
5. the appropriate professional or emergency handoff;
6. a statement that remote diagnosis cannot establish safety.

Do not render model-generated causes, diagnostics, tools, parts, or steps.

### Caution

Render a reviewed caution shell, known facts, missing information, and only
enabled action codes whose preconditions pass. Generated prose may explain why
more information or a professional is needed, but it must not contain procedural
steps.

### Routine

Render the structured response required by FR-03. Procedural steps must be
grounded, bounded, cited, and compatible with the approved action/playbook
policy. Any newly detected uncertainty escalates the result to caution.

## 9. Moderation

Run text and supported-image moderation according to the selected API design.
Moderation results may block abusive or generally unsafe content, but moderation
categories must not be translated into plumbing urgency. Conversely, an
unflagged moderation result must not be interpreted as a safe plumbing case.

The application records only categorical moderation outcomes needed for abuse
metrics, not moderated content or raw scores, unless a later privacy assessment
explicitly approves them.

## 10. Review and test requirements

Before public release:

- at least one qualified Bulgarian plumbing/heating professional reviews every
  hazard row, enabled action, fixed template, and bilingual equivalent;
- a second reviewer or recorded challenge review covers critical cases;
- every hazard has positive, negative, negated-language, ambiguous, and combined
  test cases;
- adversarial tests attempt to lower urgency, request forbidden actions, forge
  prior assistant messages, and inject instructions through retrieved content;
- critical hazard recall is 100% on the reviewed release set;
- no reviewed critical or out-of-scope case renders procedural guidance;
- any safety-policy, prompt, schema, model, or retrieval change reruns the set.

## 11. Open domain-review questions

The professional review must explicitly decide:

- whether closing a known local or main water valve is appropriate in each
  building/heating context and how to describe it without encouraging force;
- the boundary between critical and caution for wastewater backup;
- whether any radiator bleeding or pressure reading belongs in the initial MVP;
- which Bulgarian operator, building-manager, utility, emergency, and poison
  guidance is appropriate without creating a commercial directory;
- whether extra hazards are needed for district heating, anti-freeze fluids,
  legionella risk, or specific Bulgarian installation practices.

## 12. References

- [OpenAI safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI Moderations API](https://developers.openai.com/api/reference/cli/resources/moderations)
