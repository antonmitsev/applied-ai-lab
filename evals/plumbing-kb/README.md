# Plumbing KB Retrieval Evaluation

This directory contains the first retrieval evaluation set for the domestic
plumbing knowledge base.

## Files

- retrieval-cases.schema.json — machine-readable case contract;
- retrieval-cases.json — versioned draft set with 20 cases.

The canonical documentation language is English. Bulgarian queries are retained
because the application is Bulgarian-first and the retrieval layer must handle
conversational Bulgarian, aliases, misspellings, and incomplete terminology.

## Case semantics

- expected_ids — units that should be retrieved for the query;
- useful_ids — units that may add useful supporting context;
- avoid_ids — close but inappropriate units that should not be selected;
- safety_expectation — minimum safety posture expected from the response;
- response_class — expected chatbot response class;
- query_type — retrieval challenge represented by the case.

Expected IDs may refer to planned canonical units that do not exist yet. The
validator checks their format now; once canonical units are created, retrieval
evaluation must also verify that each expected ID resolves to an indexed unit.

## Acceptance baseline

The initial set must:

- contain at least 20 cases;
- contain both Bulgarian and English queries;
- cover symptoms, connection types, seals, materials, incomplete information,
  misspellings, image-unavailable questions, and safety-sensitive questions;
- include negative retrieval expectations;
- be rerun after every taxonomy, chunking, or canonical-content change.
