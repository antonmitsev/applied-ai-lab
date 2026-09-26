---
id: kb-retrieval-evaluation-001
title: "Retrieval and Answer Evaluation"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# Retrieval and Answer Evaluation

## 1. Purpose

Before the KB is populated with many documents, we need a way to check
whether its structure retrieves the right knowledge and whether the chatbot
uses it safely.

The evaluation set is part of the requirements, not a later optimization.

The initial set is stored in `evals/plumbing-kb/retrieval-cases.json` and is
validated against `evals/plumbing-kb/retrieval-cases.schema.json`.

## 2. Retrieval test case

Each test question must be representable as a machine-readable record:

~~~yaml
- id: eval-leak-tightening-001
  query: "Радиаторната връзка тече повече, когато затегна гайката докрай."
  language: bg
  expected_ids:
    - diagnostic-leak-tightening-001
    - seal-o-ring-radial-001
  useful_ids:
    - connection-insert-o-ring-001
  avoid_ids: []
  safety_expectation: "medium"
  query_type: symptom
~~~

The minimum fields are id, query, expected_ids, query_type, and
safety_expectation.

## 3. Test-set coverage

The first evaluation set must contain at least 20 questions covering:

- a technical term;
- conversational language;
- a common misspelling;
- a symptom without the component name;
- a question about a specific connection type;
- a question about a seal or material;
- a question with incomplete information;
- a question with an image when image understanding is not yet available;
- a safety-sensitive question;
- a question where the correct result is a clarifying question or refusal of a
  specific instruction.

The set must also contain negative examples where a similar but inappropriate
knowledge unit must not be selected.

## 4. Retrieval criteria

For each test, check:

- whether at least one expected_id appears in the top-k results;
- whether the most relevant canonical unit appears before case-specific notes
  when the question is general;
- whether deprecated units are excluded;
- whether safety metadata is preserved;
- whether the result contains enough parent context after chunking.

Initial thresholds are configured in the evaluation runner, but every
threshold must have a name, version, and explanation. “It looks good” is not
sufficient evidence by itself.

## 5. Generated-answer criteria

Manual or automated review checks whether the answer:

- answers the actual question;
- uses the correct component and connection type;
- does not present a hypothesis as a confirmed fact;
- identifies missing measurements or clarifications;
- includes the safety boundary for a DIY action;
- does not recommend “tighten it more” as a universal diagnostic;
- identifies the knowledge unit IDs or human-readable sources used.

## 6. Regression rule

Every change to taxonomy, chunking, the retrieval pipeline, or a canonical unit
must run against the complete evaluation set. A change is not accepted merely
because it improves one question if it harms a safety-sensitive or negative
test.

Evaluation results must preserve:

- KB version;
- evaluation-set version;
- retrieval configuration used;
- results per test case;
- failed cases and the decision taken for them.
