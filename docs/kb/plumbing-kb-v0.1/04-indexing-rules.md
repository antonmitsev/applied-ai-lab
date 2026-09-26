---
id: kb-indexing-rules-001
title: "Rules for IDs, Links, and RAG Indexing"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# Rules for IDs, Links, and RAG Indexing

## 1. Stable IDs

Every document receives a permanent id.

Format:

~~~text
<type>-<topic>-<variant>-<nnn>
~~~

Examples:

~~~text
seal-o-ring-radial-001
connection-compression-pexalpex-001
component-radiator-valve-001
diagnostic-leak-tightening-001
case-radiator-o-ring-leak-001
~~~

Rules:

- only a–z, 0–9, and hyphens;
- no spaces;
- no dates in the ID;
- the ID does not change when the title is edited;
- an old ID is never reused for another topic.

## 2. Filenames

Preferred:

~~~text
<id>.md
~~~

Example:

~~~text
seal-o-ring-radial-001.md
~~~

Readable numbered names such as those in the first requirements iteration are
allowed for meta and requirements files.

## 3. Cross-references

Links between knowledge units must use the stable ID.

In YAML:

~~~yaml
related:
  - seal-o-ring-radial-001
  - diagnostic-leak-tightening-001
~~~

In text:

~~~md
See: seal-o-ring-radial-001
~~~

A Markdown hyperlink may be added, but the ID is the canonical link.

## 4. Heading structure

- one # heading per file;
- ## for main retrieval sections;
- ### only when needed;
- avoid deep levels such as #### and below;
- headings must describe their content.

Bad:

~~~md
## Other
~~~

Good:

~~~md
## Typical reasons an O-ring leaks after assembly
~~~

## 5. Chunking strategy

Documents must be written so that an indexer can chunk them by headings.

Recommended strategy:

1. preserve frontmatter as metadata;
2. use # for document context;
3. use ## as the preferred natural chunk boundary;
4. split very long ## sections with ###;
5. add the document title and parent headings to each chunk.

Guideline, not a hard rule:

- typical chunk: 300–900 tokens;
- very small sections may be merged with adjacent sections;
- overlap should be minimal and used only when genuinely needed.

The knowledge base must not be written around one specific chunk size.

## 6. Chunk self-sufficiency

Every main chunk must contain enough context to be useful on its own.

Bad:

> That does not apply here.

Good:

> In a connection with a radially sealing O-ring, the retaining nut thread is
> usually not the hydraulic seal.

## 7. Retrieval keywords

Do not use artificial keyword stuffing.

Instead:

- put the technical term in the title;
- put conversational variants in aliases;
- put symptoms in symptom;
- put causes in failure_mode;
- naturally repeat the main term in self-contained sections.

## 8. Canonical versus case knowledge

General rules belong in canonical knowledge units.

A case study may point to them, but must not be the only place where an
important general principle is described.

Example:

- canonical: seal-o-ring-radial-001;
- case: case-radiator-o-ring-leak-001.

## 9. Versioning

Minimum fields:

~~~yaml
status: draft
version: "0.1"
~~~

Allowed status values:

- draft;
- reviewed;
- verified;
- deprecated.

When a substantial change is made, increase version.

For an outdated topic:

~~~yaml
status: deprecated
superseded_by: new-id-001
~~~

## 10. Sources and provenance

When a knowledge unit contains external technical data, it must have a Sources
section or structured metadata, as defined in
07-provenance-and-evidence.md.

Case observations must be distinguished from general technical data.

## 11. Deduplication

The same general principle must not be copied in full into many files.

Preferred:

- a short local explanation;
- a link to the canonical ID.

This reduces the risk that RAG returns conflicting versions of the same fact.
