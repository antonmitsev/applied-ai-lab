---
id: kb-safety-response-policy-001
title: "Safety Response Policy for the Plumbing Chatbot"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# Safety Response Policy for the Plumbing Chatbot

The machine-readable policy contract is
`docs/contracts/kb-safety-response-contract.json`; its deterministic vectors are
validated by `scripts/validate-safety-response.mjs`. This document explains the
intent and boundaries behind that contract.

## 1. Purpose

The KB describes technical knowledge, but knowledge alone does not determine
how the chatbot should respond under risk. This document is the contract
between the retrieval layer and the response layer.

The chatbot must prefer safe diagnosis, clear boundaries, and escalation over a
confident instruction based on incomplete data.

## 2. Response classes

Every answer belongs to one of the following classes:

- informational — a principle, term, or explanation with no action on the
  system;
- diagnostic — safe observations and checks;
- local-diy — a limited action after its preconditions are checked;
- stop-and-escalate — stop DIY actions and refer the user to a qualified
  professional, building manager, service provider, or emergency service as
  appropriate;
- clarify-first — critical information is missing, so no specific procedure
  should be given.

## 3. Mandatory boundaries

The chatbot must not give a specific DIY procedure without additional
escalation for:

- gas installations;
- accessible electrical parts of a boiler or other appliance;
- shared risers and systems outside the user's control;
- an uncontrolled leak or immediate flooding risk;
- high temperature or pressure that has not been confirmed safe;
- a visible crack, corrosion weakening, or deformation of a pipe or fitting;
- an unknown configuration where a wrong action could interrupt or damage the
  whole installation.

In these cases, the answer may explain the principle and safe first steps, but
must clearly state where DIY action stops.

## 4. Minimum safety contract for procedure/diagnostic units

Every procedure or diagnostic document that leads to an action must contain:

- safety preconditions;
- how flow is stopped or the system is depressurized, where applicable;
- hot-water, electrical, or flooding risks;
- observable stop conditions;
- how the result is checked after the action;
- when to switch to stop-and-escalate.

## 5. Generated-answer contract

For a diagnostic or repair question, the answer should contain, where
applicable:

1. a short description of the understood assembly or symptom;
2. what is confirmed and what is only a hypothesis;
3. the safest next check;
4. how to interpret the result;
5. what not to do;
6. the stop condition and required escalation;
7. the knowledge unit or source used.

Missing critical data must lead to a clarifying question rather than an
invented assumption.

## 6. Safety metadata and retrieval

safety_level is a signal for the response policy, not a decorative tag:

- low normally permits informational answers or non-destructive diagnosis;
- medium requires verified preconditions and local depressurization before
  disassembly;
- high defaults to clarify-first or stop-and-escalate.

When retrieved context contains conflicting safety instructions, choose the
more conservative boundary and mark the need for human review.
