---
id: connection-threaded-001
title: "Threaded Plumbing Connection"
document_type: connection
status: draft
version: "0.1"
language: en
domain:
  - general-plumbing
  - water-supply
  - heating
system:
  - domestic-piping
  - valve-assembly
component:
  - fitting
  - valve
  - pipe
connection_type:
  - threaded
seal_type:
  - thread-seal
  - flat-gasket
  - conical-seat
  - o-ring
material:
  - brass
  - steel
  - galvanized-steel
  - ptfe
symptom:
  - leak
  - leak-after-reassembly
  - leak-changes-with-tightening
failure_mode:
  - loose-joint
  - overtightened
  - wrong-assembly-order
  - missing-part
  - damaged-seat
  - corrosion
  - debris
aliases:
  - "threaded fitting"
  - "screw connection"
  - "threaded pipe joint"
  - "резбова връзка"
  - "връзка на резба"
  - "теч от резбата"
related:
  - connection-insert-o-ring-001
  - diagnostic-leak-tightening-001
  - seal-o-ring-radial-001
safety_level: medium
source_class:
  - derived-reasoning
evidence_level: hypothesis
applies_to:
  - "Generic detachable threaded plumbing connections; exact sealing method must be confirmed from the fitting design"
---

# Threaded Plumbing Connection

> Draft canonical unit. “Threaded” describes how parts are joined, not by
> itself which surface or consumable seals the fluid.

## Short description

A threaded plumbing connection joins two parts through matching or compatible
threads. The thread can provide mechanical engagement and retention, while the
fluid seal may be created by thread interference, a thread sealant, a flat
gasket, an O-ring, a conical seat, or a combination defined by the fitting
design.

The connection must therefore be classified by both `connection_type` and
`seal_type`. A leak near a thread is not enough evidence that the thread itself
is the sealing surface.

## Components

A threaded assembly may contain:

- a male threaded end, nipple, tailpiece, or pipe end;
- a female threaded port, socket, nut, or fitting body;
- a shoulder, face, cone, or seat that establishes the final position;
- thread sealant such as tape, paste, or a specified anaerobic product;
- a flat gasket, O-ring, or other separate sealing element;
- a locknut, union nut, washer, adapter, or support element;
- connected pipework that must not impose unintended side load.

The exact parts and their assembly order depend on whether the connection is
tapered, parallel, a union, a valve port, or a component-specific adapter.

## How the mechanical connection is created

The male and female threads are aligned and engaged without cross-threading.
The parts are then tightened until the designed thread engagement and final
position are reached. A shoulder, gasket face, cone, or O-ring land may define
the stop; in other designs, the thread engagement and interference are the
primary mechanical constraint.

The connected pipe should be supported independently where needed. A pipe
wrench or spanner must not be used to force misaligned pipework into the final
position, because the resulting bending load can damage the fitting or create a
leak at a nearby seal.

## What actually seals

The sealing element depends on the construction:

- a tapered thread may use controlled interference and an approved thread
  sealant;
- a parallel thread may mainly retain the parts while a face gasket, O-ring, or
  conical seat seals;
- a union connection commonly uses a separate gasket or machined seat at its
  union faces;
- a valve or adapter may have a component-specific sealing land that is not
  visible until the joint is separated.

Identify the design before selecting tape, paste, a gasket, or an O-ring. The
thread type, material, fluid, temperature, pressure, and required final
orientation all affect the permitted sealing method.

## What does not seal

Do not assume that the following is the sealing surface:

- any thread that merely provides mechanical engagement;
- a locknut that clamps a separate gasket or O-ring;
- a visible shoulder that is not machined as a seat;
- extra tape or paste added to a connection designed to seal on a gasket,
  conical seat, or O-ring;
- a gasket placed on a face that the design does not use for sealing.

Adding a sealant to the wrong location can prevent the joint from reaching its
designed position, contaminate a valve or system, or hide a damaged seat.

## Permitted movement and tightening

During assembly, the threads must turn smoothly by hand for the initial
engagement. Resistance or wobble at the start is a reason to stop and inspect
alignment and thread condition.

After the design stop or specified orientation is reached, the joint should not
move in normal service. Do not use unlimited tightening to compensate for a
wrong seal, damaged thread, missing gasket, or poor alignment.

Some threaded connections require a final orientation that cannot be achieved
by simply reversing the joint. If the joint is overtightened past its intended
position, disassembly and inspection may be safer than backing it off while
pressurized.

## Typical failures

Typical failure modes include:

- cross-threading, damaged, worn, or corroded threads;
- insufficient engagement or loose assembly;
- excessive tightening that cracks, distorts, or strips a fitting;
- wrong thread standard, size, gender, or taper;
- missing, damaged, displaced, or incompatible gasket or O-ring;
- unsuitable, excessive, or incorrectly applied thread sealant;
- a conical or flat sealing face damaged by tools, debris, or corrosion;
- misalignment or unsupported pipe loading the joint;
- a leak from a nearby connection mistaken for a thread leak.

The visible location and the thread type must be confirmed before assigning one
of these causes.

## Symptoms

Common symptoms include:

- water appearing around the thread, nut, shoulder, or union face;
- leakage after the joint has been disassembled and rebuilt;
- leakage that changes after tightening or after the component is rotated;
- a joint that reaches the expected orientation too early or too late;
- a nut that tightens but leaves the pipe or fitting loose;
- a leak that remains despite adding more thread sealant;
- a crack or deformation visible near a female threaded port.

Water can travel along a thread, pipe, or fitting body. The lowest visible wet
point is not necessarily the sealing source.

## Diagnosis

When the connection can be isolated and depressurized safely:

1. Identify the isolation point and remove stored pressure and heat.
2. Dry the assembly and locate the first wet point under the lowest safe test
   condition.
3. Photograph or mark the assembly orientation before changing it.
4. Determine whether the joint is tapered, parallel, a union, or a component-
   specific connection; do not infer this from appearance alone.
5. Identify the actual sealing feature: thread seal, gasket, O-ring, cone, or
   face seat.
6. If disassembly is justified, inspect thread engagement, sealant, gasket or
   O-ring condition, seating faces, cracks, debris, and pipe alignment.
7. Check the replacement part against the thread specification and sealing
   method, not only against outside appearance.

If the thread standard, material, isolation state, or sealing feature is
uncertain, stop before applying more force or sealant.

## Assembly errors

Common errors include:

- starting the thread at an angle or forcing it with a tool;
- applying sealant to a thread that is not intended to seal;
- wrapping tape in the wrong direction or using more material than the port
  can accept;
- covering an opening with sealant fragments;
- omitting a gasket, O-ring, washer, or component-specific support;
- reusing a damaged seal or contaminated sealing face;
- tightening while the pipe is under bending or torsional load;
- setting final orientation by over-tightening;
- testing or disassembling the joint while pressurized or hot.

## Safety

Isolate the relevant branch and verify that pressure and temperature are safe
before loosening a threaded connection. Be prepared for trapped water and for a
joint to release suddenly when its seal is disturbed.

Stop and escalate when isolation cannot be verified, the connection is part of a
shared riser or central-heating circuit, the fitting is cracked or corroded,
the joint is near energized equipment, or failure could cause uncontrolled
flooding.

## Related topics

- `connection-insert-o-ring-001` — contrast between mechanical retention and
  O-ring sealing;
- `seal-o-ring-radial-001` — O-ring sealing when the threaded part retains a
  separate radial seal;
- `diagnostic-leak-tightening-001` — symptom-led diagnosis when tightening
  changes the leak.

