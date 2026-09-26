# Repository scripts

This directory contains deterministic repository-maintenance commands. Scripts
must use only repository inputs, must not require production credentials, and
must be safe to run locally or from an untrusted fork pull request.

Every script added here must document:

- its purpose and invocation;
- files it reads or changes;
- required environment variables and network access;
- every top-level function and its side effects;
- success/failure behavior;
- any security-sensitive assumptions.

## `validate-repository.mjs`

Run from the repository root:

```bash
npm run validate
```

The validator is read-only. It uses Node.js built-ins, reads the repository
tree, prints a short success summary, and exits non-zero with all discovered
problems. It requires no environment variables, dependencies, network access,
OpenAI key, deployment secret, or private test data.

### Checks

- every `.json` file parses and every non-empty `.jsonl` line parses;
- document-local JSON `$ref` pointers resolve;
- relative Markdown links point to existing files/directories;
- every active FR/AC is mapped exactly once in PA-TRACE-001;
- every active FR/AC has exactly one primary category in PA-SCOPE-001;
- the model-neutral implementation graph is acyclic, dependency-valid, and
  covers every active FR/AC and implementation-audit control;
- the accepted baseline, split audits, durable handoff, and agent entry point
  expose consistent implementation-ready status markers;
- the bilingual public-service source pages, routes, footer, copyright, AI
  notice, and cookie profile match PA-SERVICE-001;
- the published `PA-ADMIN-SIG-1` vector reproduces and verifies byte for byte;
- every maintenance script and top-level function has README and inline JSDoc
  documentation;
- forbidden runtime/secret filenames and high-confidence credential patterns
  are absent.

This lightweight credential-pattern check is defense in depth. It does not
replace GitHub secret scanning, push protection, or human review.

### Function reference

| Function | Purpose and side effects |
| --- | --- |
| `fail(message)` | Adds one validation problem to the in-memory failure list; it does not throw or write files, allowing all checks to finish. |
| `relative(file)` | Converts an absolute path below the repository root to a portable `/`-separated display path. |
| `walk(directory)` | Recursively returns regular files while skipping VCS, dependency, build, and coverage directories; read-only filesystem traversal. |
| `resolveJsonPointer(document, pointer)` | Resolves a document-local RFC 6901-style `#/...` pointer, including `~0` and `~1` unescaping; returns `undefined` when missing. |
| `collectLocalRefs(value, refs)` | Recursively collects only JSON references beginning with `#`; mutates the supplied in-memory `refs` array and performs no I/O. |
| `validateJson(files)` | Parses JSON/JSONL inputs and checks local `$ref` targets; records all errors and returns parsed-file/record counts. |
| `validateMarkdownLinks(files)` | Extracts Markdown inline-link destinations, skips external/anchor links, and verifies relative targets with filesystem metadata reads. |
| `expandTraceRange(label)` | Converts one ID or a same-prefix inclusive range such as `AC-11–AC-17` into individual normalized IDs; returns an empty array for malformed ranges. |
| `validateTraceability()` | Builds the active ID set from requirements, expands matrix rows, and records missing, duplicate, unknown, malformed, or incomplete mappings. |
| `validatePublicDisclosures()` | Validates the five Bulgarian/English service-document pairs, unique routes, version/date metadata, absence of private email addresses, footer/copyright/repository links, pre-chat notices, and necessary-only storage profile; read-only. |
| `validateScopeInventory()` | Expands the planning ledger's FR/AC ranges and proves every active requirement has one and only one primary estimation category; read-only. |
| `validateImplementationPlan()` | Validates task IDs, statuses, dependency existence/readiness, acyclic ordering, deliverables, verification families, audit-control coverage, and complete active FR/AC allocation in the model-neutral implementation plan; read-only. |
| `validateProjectBaseline()` | Checks that the final requirements manifest, closed definition audit, not-started implementation audit, durable handoff, execution contract, and root agent entry point expose their required status/identity markers; read-only. |
| `validateAdminSigningVector()` | Reconstructs canonical bytes, hashes, keys, nonce, and deterministic Ed25519 signature from the public test fixture; never accesses a runtime key. |
| `validateScriptDocumentation(files)` | Discovers JavaScript maintenance scripts and records missing per-script README sections, missing function-reference rows, or missing adjacent JSDoc comments. |
| `validateRepositoryHygiene(files)` | Checks paths and text content for prohibited runtime artifacts and selected high-confidence credential forms; reads files but never deletes or rewrites them. |

### Exit behavior

When every check passes, the script prints counts and exits with status `0`.
When one or more checks fail, it prints every collected failure and sets exit
status `1`. An unexpected Node.js/runtime error also terminates non-zero.

### Maintenance rule

When a requirement format, matrix format, contract, or repository layout
changes, update the validator, this README, PA-REPO-001, and the affected tests
in the same change. Do not weaken a check solely to make CI green; document and
review the underlying policy change.

## `validate-kb.mjs`

Run from the repository root:

```bash
npm run validate:kb
npm run validate:kb -- --production
```

The validator is read-only. It reads Markdown files below `docs/kb`, parses the
small YAML frontmatter subset used by this KB, checks controlled metadata,
stable IDs, references, headings, required sections, filenames, and production
provenance gates. It also validates the versioned retrieval evaluation set
under `evals/plumbing-kb`. It requires no environment variables, network access,
credentials, or external dependencies.

Development mode permits draft-only warnings for references to planned future
units. Production mode turns those warnings into failures and requires
reviewed/verified content status and provenance fields. User-language terms may remain in aliases
and evaluation examples; canonical document metadata and prose are English.

### Function reference

| Function | Purpose and side effects |
| --- | --- |
| `displayPath(` | Converts a path to a repository-relative slash-separated display path; read-only. |
| `parseScalar(` | Parses one supported frontmatter scalar or empty-list value; no I/O. |
| `parseFrontmatter(` | Parses the KB frontmatter subset and returns metadata/body boundaries; no I/O. |
| `extractHeadings(` | Extracts Markdown headings while ignoring fenced code blocks; no I/O. |
| `normalizeLabel(` | Normalizes heading labels for required-section comparisons; no I/O. |
| `makeIssue(` | Creates one structured validation issue; no I/O. |
| `validateKnowledgeDocument(` | Checks one document against metadata, filename, reference, heading, and section rules; read-only. |
| `listMarkdownFiles(` | Recursively lists Markdown files below the KB directory; read-only filesystem traversal. |
| `validateKnowledgeBase(` | Validates all KB documents and returns errors/warnings without writing files. |
| `validateEvaluationSet(` | Validates the versioned retrieval evaluation JSON, case shape, ID format, and minimum coverage; read-only. |
| `printReport(` | Prints the structured validation result; stdout/stderr only. |
| `main(` | Parses the production flag, runs the KB validator, and sets a non-zero exit status on errors. |

## `validate-kb.test.mjs`

Run from the repository root:

```bash
npm run test:kb
```

The tests use Node's built-in test runner and in-memory fixtures. They verify
frontmatter parsing, fenced-heading handling, production failures, and the
current KB development-mode baseline. They do not write repository files,
access the network, or require credentials.

### Function reference

| Function | Purpose and side effects |
| --- | --- |
| `fixture(` | Joins test fixture lines into a Markdown string; no I/O. |

## `validate-source-manifest.mjs`

Run from the repository root:

```bash
node scripts/validate-source-manifest.mjs
```

The validator is read-only. It reads the source manifest and pinned source
schema, validates the registry shape, checks unique source IDs, and enforces
that only approved records can be marked eligible for indexing. It uses the
repository's already-pinned Ajv dependency and requires no environment
variables, network access, credentials, or source-document bytes.

### Function reference

This script is intentionally a top-level validation command with no exported
functions or write side effects.

## `validate-safety-response.mjs`

Run from the repository root:

```bash
npm run validate:safety
```

The validator checks the machine-readable safety response policy and executes
the frozen deterministic vectors in `docs/contracts/`. It does not call a
model, network, provider, or production service.

### Function reference

| Function | Purpose and side effects |
| --- | --- |
| `maxSeverity(` | Returns the highest monotonic severity; no I/O. |
| `moreRestrictiveClass(` | Selects the more restrictive response class; no I/O. |
| `resolveSafetyDecision(` | Applies severity floors, hazard overrides, unknown-safety rules, and step gating; no I/O. |
| `issue(` | Creates one structured contract-validation issue; no I/O. |
| `validateContract(` | Checks contract identity, classes, hazards, actions, and references; no I/O. |
| `validateVectors(` | Executes all frozen vectors against the deterministic resolver; no I/O. |
| `validateSafetyResponseContract(` | Loads and validates the contract and vectors; read-only filesystem access. |
| `main(` | Runs the safety validator and sets a non-zero exit status on failure. |

## `validate-safety-response.test.mjs`

Run from the repository root:

```bash
npm run test:safety
```

The tests cover critical-hazard escalation, unknown-safety blocking, and the
complete frozen vector set. They do not access the network or credentials.

### Function reference

| Function | Purpose and side effects |
| --- | --- |
| `loadContract(` | Loads the repository contract for pure policy tests; read-only filesystem access. |
