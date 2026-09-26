---
id: kb-validation-quality-001
title: "Validation and Quality Gates for Knowledge Units"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# Validation and Quality Gates for Knowledge Units

## 1. Purpose

This document defines how a knowledge unit is checked before indexing and
before it can be used by the chatbot.

Validation must distinguish between:

- a structurally valid file;
- editorially acceptable content;
- technically reviewed content;
- content approved for production retrieval.

A valid Markdown file is not automatically a trustworthy technical
instruction.

## 2. Readiness levels

`status` has the following practical meaning:

- `draft` — may be edited and used in a development index, but is not enough
  grounds for a production answer;
- `reviewed` — passed structural and editorial review and was reviewed by a
  person;
- `verified` — has named sources or clearly described observations and passed
  a technical review for its applicable context;
- `deprecated` — must not be retrieved as current knowledge.

By default, the production index includes only `reviewed` and `verified`
units. `draft` is included only in an explicitly marked development mode.

## 3. Structural validation

The automated validator must check that:

- YAML frontmatter parses without errors;
- `id` is unique and follows the rules in `04-indexing-rules.md`;
- the content filename matches its `id`;
- `id`, `title`, `document_type`, `status`, `version`, and `language` are
  present;
- `document_type`, `status`, `language`, and `safety_level` use allowed
  values;
- `aliases` and `related` are lists;
- every ID in `related` exists;
- the file has exactly one `#` heading;
- required sections for the relevant `document_type` are present;
- there are no duplicate IDs or duplicate canonical titles;
- no content outside the expected structure hides critical information from
  the indexer.

Numbered filenames such as `01-scope.md` are an allowed exception to the
filename = ID rule for requirements and meta documents.

## 4. Editorial and semantic review

Human review must confirm that:

- the file has one clear topic;
- each main section is understandable on its own;
- terms and aliases do not mix different components;
- facts, observations, hypotheses, and conclusions are distinguished;
- general rules are not presented as the result of one specific case;
- numbers clearly describe what was measured;
- the instruction does not rely on information hidden only in an image;
- cross-references are meaningful rather than merely present.

## 5. Checks by document type

Minimum checks are:

- `component` and `connection`: mechanical retention, sealing, failure modes,
  symptoms, and diagnostics;
- `seal`: geometry, material, compatibility, installation, and signs of an
  incorrect size;
- `diagnostic`: observable symptom, differentiating tests, and interpretation;
- `procedure`: preconditions, checkpoints, stop conditions, and post-action
  verification;
- `case`: context, observations, measurements, hypotheses, and unconfirmed
  parts;
- `safety`: concrete hazard, action boundary, and escalation rule.

## 6. Quality gate before indexing

A unit may enter a development index only when:

1. structural validation passes;
2. there are no unresolved references to missing IDs;
3. an appropriate `safety_level` is present;
4. unknowns are explicitly marked;
5. it is clear whether the document is canonical, diagnostic, or case
   knowledge.

A unit may enter a production index only when it additionally:

1. has status `reviewed` or `verified`;
2. has provenance according to `07-provenance-and-evidence.md`;
3. has passed the relevant retrieval tests;
4. has no unresolved safety review;
5. is not superseded or `deprecated`.

## 7. Validator report

The validator must return a machine-readable result containing at least:

- file path;
- `id`;
- validation level;
- `pass` / `fail` / `warning`;
- check code;
- short message;
- line or heading when available.

Warnings must not be lost even when a file is formally valid.
