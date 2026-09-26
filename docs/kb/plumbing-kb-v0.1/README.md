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

## Requirements and current content

This version contains the requirements and the first draft canonical package.
The requirements and operational documents are:

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

The first canonical package is currently `draft` and contains:

- `connection-threaded-001.md`;
- `connection-union-flat-gasket-001.md`;
- `seal-o-ring-radial-001.md`;
- `seal-o-ring-axial-001.md`;
- `connection-compression-001.md`;
- `connection-conical-001.md`;
- `connection-press-001.md`;
- `connection-insert-o-ring-001.md`;
- `diagnostic-leak-tightening-001.md`;
- the radiator case example and the earlier case findings document.

Draft status is intentional: source registry review, applicability review, and
human technical review are still required before production indexing.

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

The architecture gate is implemented. The next work is to:

- complete the first development and production index manifests;
- run source-governance research and create approved source records;
- add sealing-material units for EPDM, NBR, PTFE, gaskets, thread sealants,
  and compatibility;
- expand diagnostic patterns and radiator-specific units;
- promote individual units only after provenance and technical review.
