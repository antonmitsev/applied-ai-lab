# Plumbing Assistant — Staged Testing Plan

| Field | Value |
| --- | --- |
| Plan ID | `PA-TEST-001` |
| Status | Draft implementation plan |
| Applies to | KB, retrieval, safety pipeline, answer generation, and release decisions |
| Related design | [PA-EVAL-001](plumbing-assistant-evaluation-plan.md) |
| Current baseline | Requirements and draft KB validated; runtime not implemented |

## 1. Purpose

This plan answers one practical question:

> Does the project produce safer, better-grounded, and more useful plumbing
> assistance than asking a general ChatGPT conversation directly?

The comparison must be evidence-based. A fluent answer is not enough. The
project must demonstrate better handling of source grounding, uncertainty,
safety boundaries, terminology, and repeatability without unacceptable cost or
latency.

## 2. Test principles

- Test the complete user-visible behavior, not only the model.
- Keep safety enforcement independent from the model’s own wording.
- Use the same facts, images, model snapshot, and task order for every
  comparison that is intended to be fair.
- Separate development fixtures from release holdout cases.
- Record the application commit, KB commit, source registry version, index
  manifest, model, prompt, and test runner version for every report.
- Treat a critical safety failure as a release blocker, even if the average
  score is good.
- Keep Bulgarian and English cases semantically equivalent and score them for
  both correctness and language quality.

## 3. Comparison groups

Every comparative evaluation should use three groups where applicable:

### A. General ChatGPT baseline

The same task is asked in a normal ChatGPT conversation or equivalent direct
model call without the project KB, retrieval gateway, or project safety
pipeline. Record the exact model and date because a consumer chat product may
change over time.

### B. Project assistant

The same task is run through the project’s complete path:

```text
intake → deterministic safety pre-triage → retrieval → model → post-validation
→ safe renderer → citations or handoff
```

### C. Human reference

A qualified plumbing/heating reviewer defines the acceptable answer boundary:
correct cause classes, safe checks, forbidden actions, escalation conditions,
and required uncertainty. The reviewer is not expected to write a perfect
answer for every case; the reference defines what must and must not be claimed.

The project succeeds only when it improves the dimensions that matter. It does
not need to win every stylistic comparison with general ChatGPT.

## 4. Test layers

### Layer 0 — Repository and document checks

Run on every change:

- Markdown links and repository hygiene;
- KB frontmatter, IDs, headings, required sections, and related references;
- development versus production status rules;
- source-reference and provenance validation;
- safety contract schema and frozen vectors;
- JSON Schema and JSONL validation.

Current commands:

```text
npm run validate
npm run test:kb
npm run test:safety
```

### Layer 1 — KB semantic review

For every batch of three to five units, a reviewer checks:

- one clear topic per file;
- mechanical retention versus sealing distinction;
- facts, observations, hypotheses, and conclusions;
- dimensions with measurement context;
- compatibility claims and their scope;
- failure modes, symptoms, diagnosis, and stop conditions;
- aliases that improve retrieval without merging different components;
- meaningful cross-links.

Draft units may enter development testing. Production indexing requires
`reviewed` or `verified` status, provenance, source applicability, and resolved
safety review.

### Layer 2 — Retrieval tests

Measure whether the right knowledge is found before answer generation.

The current 20-case bilingual retrieval set is the initial structural baseline.
The next retrieval batch should add:

- material and compatibility queries;
- image-unavailable and incomplete-input queries;
- Bulgarian colloquialisms and misspellings;
- negative queries that should not retrieve an unrelated unit;
- cross-links between symptom, connection, seal, and diagnostic units.

For each case record:

- expected unit IDs;
- acceptable supporting unit IDs;
- forbidden distractor or unrelated units;
- retrieval rank and score;
- whether the result contains enough context to answer safely.

Minimum development measures are recall@k, precision of the top results, and
the rate of cases with no unsafe or irrelevant primary context. Production
thresholds must be frozen after the first reviewed source-backed benchmark.

### Layer 3 — Deterministic safety tests

Run without a model or network for:

- water near electricity;
- uncontrolled leaks and flooding;
- hot or pressurized systems;
- shared risers and central heating;
- unknown isolation points;
- gas, combustion, and other out-of-scope hazards;
- unknown material or compatibility;
- prompt attempts to downgrade urgency;
- contradictory or incomplete safety intake.

Required properties:

- critical hazards always produce stop-and-escalate behavior;
- severity cannot be downgraded by later model text;
- unsafe generated steps are removed or replaced with a fixed safe response;
- unknown high-risk conditions produce clarify-first or escalation;
- safety rules remain active even when retrieval contains hostile instructions.

The existing safety contract and 10 frozen vectors are the starting point, not
the final application evidence.

### Layer 4 — Model contract tests

Use frozen retrieval fixtures, an exact prompt version, a selected model
snapshot, and strict structured output validation. Test:

- correct classification of component, connection, symptom, and risk;
- recognition of missing information;
- calibrated uncertainty;
- citation and source-scope correctness;
- refusal to claim exact compatibility without exact evidence;
- Bulgarian/English semantic parity;
- correct use of `informational`, `diagnostic`, `local-diy`,
  `clarify-first`, and `stop-and-escalate` response classes.

### Layer 5 — End-to-end tests

Exercise the deployed-equivalent boundary, including:

- conversation state and retention;
- anonymous request and abuse controls;
- text and image input boundaries;
- retrieval and evidence gateway;
- model timeout and provider failure;
- quota reservation and reconciliation;
- response post-validation and rendering;
- citations, handoff, cleanup, and logs.

No live public traffic is used for the first release gate.

### Layer 6 — Human review

Use independent reviewers for:

- plumbing/heating correctness;
- Bulgarian and English meaning;
- safety and escalation;
- clarity and usefulness;
- citations and applicability.

The author of a critical case must not be its sole approver. Model-based grading
may assist with soft quality, but it cannot be the only grader for safety.

## 5. Dataset plan

### Pilot dataset

Before building the full application, create a small reviewed pilot:

- 30 bilingual scenario pairs;
- 10 critical or caution safety cases;
- 10 routine plumbing and heating cases;
- 5 diagnostic and incomplete-information cases;
- 5 out-of-scope or adversarial cases;
- at least 5 cases with images or image-unavailable conditions;
- at least 5 cases requiring a specific “I do not know yet” response.

Use the pilot to prove the runner, graders, versioning, and baseline comparison.
It is not sufficient for a public release.

### Public release dataset

The requirements baseline calls for at least 120 reviewed Bulgarian/English
scenario pairs, producing at least 240 language executions before repeat runs.
The release set must include critical hazards, routine requests, incomplete
evidence, compatibility claims, multi-turn state, image cases, prompt
injection, malicious retrieval content, and out-of-scope work.

Keep at least 40 reviewed pairs as a holdout set that is not used to tune
prompts. Publish its manifest hash and aggregate results without exposing
private or licensed content.

## 6. Metrics and release gates

### Safety gates

- critical-hazard recall: 100% overall and per hazard code;
- unsafe procedural guidance in blocked cases: 0;
- forbidden exact-compatibility claims: 0;
- safety downgrade violations: 0;
- required escalation omissions: 0.

Any failure in these gates blocks release until fixed and added to regression
coverage.

### Grounding and retrieval gates

- every factual technical claim has an applicable source or is explicitly
  marked as a hypothesis/general principle;
- citations point to approved source IDs and relevant passages;
- no source is used after withdrawal, expiry, or supersession;
- retrieval thresholds are met on both languages and on the holdout set;
- irrelevant or adversarial retrieved text cannot override system policy.

### Usefulness gates

Measure:

- correct identification of the relevant connection or seal class;
- useful next diagnostic step;
- correct recognition of missing information;
- explanation quality in Bulgarian and English;
- unnecessary escalation and refusal rate;
- user effort to reach a safe next step.

The project should be better than the direct baseline on grounding and safety,
while remaining acceptably useful and understandable. A prettier answer alone
does not justify the project.

### Operational gates

Measure only after the runtime exists:

- latency distribution;
- cost per successful interaction;
- quota and breaker behavior;
- timeout and retry behavior;
- image processing limits;
- cleanup, logging, monitoring, and rollback evidence.

## 7. Failure handling

Every failed case becomes one of:

1. a corrected implementation;
2. a corrected KB or source record;
3. a new regression case;
4. an explicit accepted limitation;
5. a release blocker requiring escalation.

No failure is hidden by averaging it into a score. Reports must show the case,
the expected boundary, the observed output class, the responsible layer, the
fix, and the rerun result.

## 8. First execution plan

The next practical sequence is:

1. Select three to five KB units and create reviewed source records.
2. Build the 30-pair pilot and define human ground truth.
3. Implement the minimal text-only internal prototype.
4. Run the direct ChatGPT baseline and the project assistant on the same pilot.
5. Fix safety and grounding failures before adding images or live retrieval.
6. Expand to the 120-pair release dataset only after the runner and reporting
   are reproducible.
7. Make a written continue, change direction, or stop decision based on the
   measured difference from the baseline.

## 9. Current conclusion

The repository currently passes document, retrieval-fixture, and safety-contract
checks, but it does not yet contain the runtime, reviewed source registry,
application evaluation runner, or release evidence required to claim that the
project beats direct ChatGPT in production.

