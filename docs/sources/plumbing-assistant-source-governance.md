# Plumbing Assistant — Source Governance and Ingestion Specification

| Field | Value |
| --- | --- |
| Specification ID | `PA-SOURCE-001` |
| Status | Approved design; WP-01 research and implementation pending |
| Date | 2026-09-22 |
| Owner | Anton Mitsev |
| Audit finding | `AUD-P1-006` |
| Applies to | Curated retrieval for the Plumbing Assistant MVP |

## Purpose and current boundary

This specification defines how a public document becomes an approved, indexed,
citable source and how it is updated or removed. It prevents the curated
knowledge base from becoming an unreviewed document dump.

It does **not** perform WP-01. No manufacturer list, manual research, download,
rights decision, or OpenAI upload is included in this change. The initial
[source registry](../../sources/plumbing-assistant/manifest.json) is intentionally
empty and records `research_status: not_started`.

Grounded public production answers remain blocked until WP-01 produces a
reviewed registry with adequate coverage and the ingestion implementation passes
the release evidence in this document.

## Sources of truth

The repository-owned source registry is authoritative for source identity,
scope, review state, rights decision, checksum, citation metadata, and ingestion
eligibility. The vector store is a derived deployment artifact and must never be
treated as the source catalogue.

The governed artifacts are:

- [source-manifest.schema.json](source-manifest.schema.json), which defines each
  reviewed source record;
- [manifest.json](../../sources/plumbing-assistant/manifest.json), which will be
  populated by WP-01 and reviewed through normal Git history;
- [index-manifest.schema.json](index-manifest.schema.json), which defines the
  content-free receipt for every reproducible index build;
- a versioned ingestion program and extraction/chunking profiles, to be created
  during implementation;
- an environment-specific index manifest produced by every build.

An OpenAI file or vector-store ID proves only that an object exists at the
provider. It does not prove that the underlying source is current, in scope,
approved, or legally suitable for the selected use.

## Source identity and required metadata

Every candidate receives an immutable `source_id`. A new edition or changed
file gets a new source record and checksum; it does not silently replace the
bytes behind an existing approved ID.

The manifest records at least:

- publisher and manufacturer, where applicable;
- source type and authority class;
- product family and exact model/variant coverage;
- document title, version, publication date, and language;
- canonical HTTPS URL and access timestamp;
- SHA-256 checksum of the acquired bytes;
- access, ingestion, and redistribution rights decisions plus their evidence;
- reviewer, review date, next review date, and lifecycle status;
- citation tier and localized citation labels;
- ingestion priority, artifact locator, and chunking profile;
- withdrawal reason and `superseded_by` linkage when applicable.

Null values are permitted while a source is a candidate. The manifest schema
requires complete review, rights, checksum, and citation data before a record
can have `status: approved` and `approved_for_index: true`.

## Authority and citation tiers

`authority_class` describes what a source is competent to establish. The
separate `citation_tier` maps to the structured response contract.

| Authority class | Response tier | Permitted evidentiary use |
| --- | --- | --- |
| `manufacturer_model` | `manufacturer` | Exact named model/variant instructions and compatibility within the stated document scope |
| `manufacturer_family` | `manufacturer` | Product-family guidance; not exact compatibility unless the document explicitly lists the variant |
| `public_authority` | `authority` | Bulgarian/EU safety, public-health, utility, or regulatory guidance within jurisdiction |
| `recognized_standard` | `authority` | Requirements or terminology only when access and quotation/use rights are reviewed |
| `professional_body` | `professional` | General trade practice and educational guidance |
| `reputable_secondary` | `secondary` | Context and discovery; never the sole support for safety-critical or exact compatibility claims |
| `excluded` | `secondary` | Never indexed or cited in a generated procedural answer |

Retail listings, marketplaces, scraped manual aggregators, SEO articles, forums,
social posts, and unattributed summaries are `excluded` from the curated store.
They may help discover a canonical source during WP-01 but cannot become evidence
merely because they are publicly reachable.

No single ordering is correct for every claim. A manufacturer is primary for
its exact component; an applicable public authority is primary for public-safety
or regulatory guidance. Conflicts must be surfaced for human review rather than
resolved by retrieval score.

## Exact compatibility rule

An answer may claim that a part, valve, fitting, control, or procedure is
compatible with a specific product only when an approved current source:

1. identifies the exact manufacturer and model/variant supplied by the user;
2. explicitly covers the claimed component or procedure;
3. applies to the relevant market/version and is not superseded;
4. supports the claim in the retrieved passage, not only in nearby metadata.

A family-level manual, visually similar photograph, retailer description, or
model-memory association is insufficient. When exact evidence is absent, the
response must say that compatibility is not established, ask for the model label
or documentation, and avoid purchase or installation instructions that depend
on the unproven match.

## Lifecycle and review

The allowed lifecycle is:

```text
candidate ──► in_review ──► approved
    │             │             ├──► superseded
    └─────────────┴──► rejected └──► withdrawn
```

- `candidate`: discovered but not yet acquired and assessed;
- `in_review`: bytes, provenance, scope, rights, and technical relevance are
  being checked;
- `approved`: complete, current, rights-approved, and eligible for indexing;
- `superseded`: replaced by a linked newer source and immediately ineligible;
- `withdrawn`: removed because of a safety, accuracy, provenance, rights, or
  availability problem;
- `rejected`: unsuitable and never eligible.

The technical reviewer must understand the source scope and the water-side
system domain. A separate rights reviewer may be the same person for the MVP,
but both decisions and dates remain explicit. The document must be re-reviewed
at least every 90 days for exact compatibility or safety-critical material and
every 180 days for other approved material. An expired review makes the source
ineligible until renewed.

Weekly automated checks may detect URL, redirect, checksum, publication, or
availability changes, but they may not automatically approve new bytes. Any
content change creates a candidate revision and triggers human review.

## Rights and public-repository rules

Public availability does not by itself grant redistribution or ingestion
permission. WP-01 must record the reviewed decision and evidence without
claiming legal certainty that was not established.

- `ingestion_decision: approved` is required for vector-store upload.
- `redistribution_decision: approved` is required before source bytes may be
  committed to this public repository.
- If ingestion is approved but redistribution is not, the manifest and checksum
  may be public while the acquired bytes stay in a controlled private archive.
- `pending` or `prohibited` ingestion decisions fail closed.
- Secrets, account-gated material without authorization, personal data, and
  user-provided conversation content are never curated sources.

The source registry contains no copied document body. Short human-written notes
must not reproduce substantial source text.

## Deterministic ingestion gate

Only a record satisfying every condition below may enter a production index:

1. the registry and record validate against the pinned schema version;
2. `status` is `approved` and the review has not expired;
3. ingestion rights are `approved` and evidence is present;
4. the canonical URL uses HTTPS and its domain is on the reviewed allowlist;
5. the acquired file's SHA-256 exactly matches the approved checksum;
6. product scope, language, citation metadata, artifact locator, and chunking
   profile are complete;
7. MIME type, byte size, malware scan, and parser checks pass;
8. no active withdrawal or supersession record targets the source.

Redirect targets are revalidated against the allowlist. Fetching uses bounded
sizes and timeouts and cannot access loopback, link-local, private-network, or
cloud-metadata addresses. Documents are parsed in an isolated process with no
script, macro, network, or active-content execution.

Prompt-injection handling for retrieved text is completed under `AUD-P1-008`.
Until then, live retrieval and production ingestion remain release-blocked.

## Reproducible index build

An index build is immutable and uses a staging vector store. Its inputs are
pinned by:

- source-registry Git commit and registry version;
- exact approved source IDs and SHA-256 checksums;
- ingestion-program version;
- parser and extraction profile versions;
- chunking profile and parameters;
- provider and embedding/retrieval configuration relevant to the build.

The pipeline uploads only checksum-verified artifacts, attaches file attributes,
waits for every vector-store file to reach `completed`, runs deterministic smoke
queries, and emits an index manifest conforming to
[index-manifest.schema.json](index-manifest.schema.json). Failed or partial
builds cannot become active.

The OpenAI Vector Store API supports file attributes and filtered search. The
deployment uses a bounded subset no larger than the provider's 16-attribute
limit:

| Attribute | Purpose |
| --- | --- |
| `source_id` | Join to the authoritative registry |
| `authority_class` | Claim-appropriate filtering |
| `citation_tier` | Response-contract mapping |
| `manufacturer_slug` | Product-scope filtering |
| `product_family_slug` | Family-scope filtering |
| `language` | Bulgarian/English selection |
| `registry_version` | Build provenance |
| `review_valid_until` | Defensive freshness check |
| `checksum_prefix` | Diagnostic provenance, never the canonical checksum |

The complete checksum and scope remain in the source and index manifests. A
checksum prefix or provider attribute alone is never trusted for authorization.

After verification, deployment switches one application-owned `active_build_id`
to the staging build. The preceding build is retained only for a bounded rollback
window and then deleted according to the provider cleanup procedure.

## Runtime retrieval and citation

The application accepts a curated retrieval result only when:

- its `source_id` exists in the exact active registry snapshot;
- the source is still approved, current, and eligible for the requested claim;
- the result belongs to the active index build;
- any requested manufacturer, family, variant, jurisdiction, and language scope
  matches;
- the score passes a calibrated threshold and the passage entails the claim.

Provider metadata is defense in depth. The application rechecks registry state
after retrieval so that an emergency denylist can suppress a source before a
rebuild completes.

Rendered citation title, canonical URL, tier, and source ID come from the
registry—not from untrusted document text or model-generated labels. All cited
IDs must exist in the structured `source_refs`, and procedural steps must cite
the passage that supports them.

Live web-search results never enter the curated index automatically. They remain
request-local evidence governed separately, and a promising result becomes only
a `candidate` for a future reviewed registry change.

## Supersession, withdrawal, and provider deletion

A safety or rights withdrawal takes effect immediately:

1. commit the new `withdrawn` or `superseded` registry state with reason and,
   when applicable, `superseded_by`;
2. add the source ID to the application denylist before the next model request;
3. build and test a replacement index without the ineligible source;
4. atomically activate the replacement build;
5. detach/delete the vector-store file and delete the underlying OpenAI File
   object when no approved index references it;
6. verify by provider listing and known-document search that no active result can
   retrieve its content;
7. delete controlled archived bytes when rights or incident handling requires
   it, retaining only the minimum content-free audit evidence;
8. record timestamps, actor, reason, affected builds, and deletion results.

Deleting only a local manifest row is insufficient. OpenAI files other than the
special batch default can persist until manually deleted, so provider
reconciliation is mandatory.

## Failure behavior

The curated retrieval path fails closed when the registry, active index
manifest, checksum mapping, review state, or provider-file reconciliation cannot
be verified. It must not silently fall back to model memory for exact
compatibility or safety-critical claims.

If curated evidence is absent, the system may use policy-compliant live web
search only after the live-retrieval controls are implemented. Otherwise it
returns insufficient evidence and a safe next step.

## Required implementation and release evidence

`AUD-P1-006` remains open until all of the following exist:

1. WP-01 produces a reviewed, non-empty source registry with documented coverage.
2. Registry validation enforces cross-record uniqueness, lifecycle transitions,
   dates, rights decisions, exact-scope rules, and `superseded_by` references.
3. A versioned ingestion program produces the same extracted checksums and chunk
   plan from the same inputs.
4. Staging-build tests prove partial or failed uploads cannot become active.
5. Rights tests prove non-redistributable bytes never enter the public repository
   and non-ingestible sources never reach the provider.
6. Withdrawal tests prove runtime suppression, re-indexing, vector attachment
   removal, underlying File deletion, and absence from known-document search.
7. Retrieval tests cover Bulgarian and English queries, variants, conflicting
   sources, expired reviews, and exact-compatibility refusal.
8. Citation tests prove every rendered source maps to the active registry and
   every material procedural claim maps to an entailing passage.
9. A provider reconciliation job reports no orphaned files, unknown indexed
   sources, or missing approved sources.
10. Release evidence records the active registry commit and index build ID.

## OpenAI implementation note

The design relies only on documented provider behavior: vector-store search can
filter by file attributes, vector-store files expose processing status, and
uploaded files normally persist until explicitly deleted. Recheck these details
against the official OpenAI documentation when implementation begins:

- [Search vector store](https://developers.openai.com/api/reference/typescript/resources/vector_stores/methods/search)
- [Create vector store file](https://developers.openai.com/api/reference/cli/resources/vector_stores/subresources/files/methods/create)
- [Upload file](https://developers.openai.com/api/reference/typescript/resources/files/methods/create)
