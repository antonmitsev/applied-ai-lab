---
id: kb-readme-001
title: "Domestic Plumbing — RAG-Ready Knowledge Base"
document_type: meta
status: draft
version: "0.1"
language: en
---

# Domestic Plumbing — RAG-Ready Knowledge Base

This repository defines the architecture and rules for building an indexed
knowledge base for a personal chatbot focused on domestic plumbing, heating,
and related repairs.

English is the canonical documentation language. Bulgarian terms are retained
only where they improve retrieval of Bulgarian user queries, such as aliases
and evaluation examples.

## Purpose

The KB must allow a RAG system to find the right context not only by component
name, but also by:

- symptom;
- connection type;
- sealing method;
- material;
- pipe type;
- system or appliance;
- diagnostic test;
- typical assembly error.

For example, a query such as “the radiator connection leaks more when I
tighten it fully” should find knowledge about O-rings, radial sealing,
misalignment, over-tightening, and radiator connections even when the user does
not know the component names.

## Principle

The KB is not one large document. It is a collection of small, stably
addressable Markdown documents connected by identifiers and metadata.

The primary model is:

**component → connection → mechanical retention → sealing → failure → symptom → diagnosis → repair**

## Requirements layer

This version contains requirements and rules, but is not yet populated with
complete canonical content:

1. 01-scope.md — scope and boundaries;
2. 02-taxonomy.md — classification and metadata;
3. 03-content-schema.md — knowledge-unit templates;
4. 04-indexing-rules.md — identifiers, links, and chunking;
5. 05-rag-writing-guide.md — retrieval-oriented writing rules;
6. _examples/case-radiator-o-ring-leak-001.md — example and integration test;
7. 06-validation-and-quality.md — structural and editorial quality gates;
8. 07-provenance-and-evidence.md — sources and evidence levels;
9. 08-retrieval-evaluation.md — retrieval and answer evaluation;
10. 09-safety-response-policy.md — chatbot boundaries and safety behavior.

## Definition of Done for the architecture

The architecture is ready for content population when:

- a new topic can be classified without inventing a new structure;
- the same component can be found through different symptoms;
- every knowledge unit has a stable ID;
- sections can be read outside the context of the full file;
- a real diagnostic case can be described without losing causal logic;
- risk and DIY boundaries can be represented in machine-readable metadata;
- every unit has traceable provenance and an evidence level;
- invalid references, metadata, and headings are caught automatically;
- a regression evaluation set exists before mass population begins;
- safety-sensitive answers have a defined stop and escalation path;
- the system is independent of a specific vector database, embedding model, or
  RAG framework.

## Next step

Before building the first knowledge package, implement a minimal validator,
evaluation set, and safety response contract. Then build:

- glossary/;
- fundamentals/;
- fittings/;
- seals/;
- valves/.

The first real knowledge package should cover threaded connections, flat
gaskets, O-rings, unions, and compression fittings.
