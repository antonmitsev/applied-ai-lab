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
| `validatePublicDisclosures()` | Validates the five Bulgarian/English service-document pairs, unique routes, version/date metadata, contact path, footer/copyright/repository links, pre-chat notices, and necessary-only storage profile; read-only. |
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
