---
id: kb-taxonomy-001
title: "Taxonomy and Metadata"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# Taxonomy and Metadata

## 1. Purpose

The taxonomy must allow a knowledge unit to be found from multiple perspectives.

For example, one radiator connection may belong simultaneously to:

- domain: heating;
- system: radiator;
- component: radiator-valve;
- connection_type: insert-o-ring;
- seal_type: o-ring;
- pipe_type: pex-al-pex;
- symptom: leak-changes-with-tightening.

## 2. Core dimensions

### domain

Broad area:

- water-supply;
- heating;
- hot-water;
- faucets;
- general-plumbing;
- diagnostics;
- tools.

### system

Specific system or appliance:

- radiator;
- boiler;
- faucet;
- water-meter;
- domestic-piping;
- filter;
- valve-assembly.

### component

Physical component:

- pipe;
- fitting;
- union;
- nipple;
- valve;
- radiator-valve;
- thermostatic-valve;
- check-valve;
- safety-valve;
- flex-hose;
- cartridge;
- aerator;
- flange.

### connection_type

How parts are joined:

- threaded;
- union;
- compression;
- press;
- push-fit;
- insert-o-ring;
- flat-gasket;
- conical-seat;
- hose-connection.

### seal_type

What actually stops the water:

- thread-seal;
- o-ring;
- flat-gasket;
- conical-metal-seat;
- conical-elastomer-seat;
- valve-seat;
- integrated-seal;
- unknown.

### material

- brass;
- copper;
- steel;
- galvanized-steel;
- stainless-steel;
- ppr;
- pex;
- pex-al-pex;
- rubber;
- epdm;
- nbr;
- ptfe.

### pipe_type

- ppr;
- pex;
- pex-al-pex;
- copper;
- steel;
- galvanized-steel;
- flex-hose;
- unknown.

### symptom

Controlled diagnostic tags:

- leak;
- drip;
- seepage;
- leak-hot-only;
- leak-cold-only;
- leak-under-pressure;
- leak-changes-with-tightening;
- leak-changes-with-pipe-position;
- leak-after-reassembly;
- pressure-drop;
- noise;
- air;
- poor-flow;
- stuck-valve.

### failure_mode

- wrong-seal-size;
- seal-worn;
- seal-cut;
- seal-twisted;
- seal-overcompressed;
- misalignment;
- damaged-seat;
- corrosion;
- loose-joint;
- overtightened;
- wrong-assembly-order;
- missing-part;
- thermal-expansion;
- debris;
- unknown.

## 3. Document types

The document_type field must be one of:

- concept — principle or term;
- component — part or device;
- connection — connection type;
- seal — seal type;
- procedure — sequence of actions;
- diagnostic — symptom → checks → causes;
- case — real-world case;
- tool — tool;
- safety — risk or precaution topic;
- requirements — documentation for the KB itself;
- meta — README, index, and similar documents.

## 4. Required frontmatter fields

Every content document must have:

~~~yaml
id: seal-o-ring-radial-001
title: "Radial Sealing with an O-Ring"
document_type: seal
status: draft
version: "0.1"
language: en
~~~

## 5. Recommended fields

~~~yaml
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
material:
  - brass
  - epdm
pipe_type:
  - pex-al-pex
symptom:
  - leak
  - leak-changes-with-tightening
failure_mode:
  - wrong-seal-size
aliases:
  - "O-ring"
  - "О-пръстен"
  - "О ринг"
related:
  - connection-insert-o-ring-001
  - diagnostic-leak-tightening-001
safety_level: low
~~~

## 6. Safety level

safety_level:

- low — inspection, measurement, or dry testing;
- medium — disassembly of a local water or heating connection after safe
  depressurization;
- high — work with a risk of serious flooding, high temperature, electricity,
  or a shared installation.

This field does not replace a written safety section.

## 7. Aliases and conversational language

Because users often do not know the exact term, aliases should contain:

- the technical term;
- conversational variants;
- common misspellings;
- the English term when it is widely used.

Example:

~~~yaml
aliases:
  - "O-ring"
  - "О-пръстен"
  - "О ринг"
  - "гумен пръстен"
~~~

Do not add misleading aliases merely to increase recall.

## 8. Expansion principle

Add a new taxonomy value only when:

1. an existing value cannot be used meaningfully;
2. the value will be useful for several documents or an important real case;
3. its meaning can be defined unambiguously.

When in doubt, prefer the broader existing tag.
