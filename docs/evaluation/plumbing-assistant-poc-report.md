# Plumbing Assistant POC Report

| Field | Result |
| --- | --- |
| Scope | Local, internal-only proof of concept |
| Runtime | Node 22 target, TypeScript, Express, React SSR, deterministic mock provider |
| Provider spend | Zero; no API key and no paid provider call |
| Public traffic | Disabled |
| Pilot | 30 Bulgarian/English development pairs, replayed in both languages |
| Decision | Continue engineering; do not publish yet |

## What the POC proves

The repository can now run one bounded path from server-rendered landing page to
chat request, deterministic safety pre-triage, local lexical retrieval, mock
structured response, citation metadata, and escaped client rendering. It also
has bilingual legal/source pages, local Docker packaging, a healthcheck,
failure-path handling, styled responsive UI, Markdown tables, and an explicit
dry-run preview of the future provider call when local retrieval is empty.

The POC does **not** prove that the product is more useful or safer than direct
ChatGPT. The source registry is still in review, the KB is draft/development
content, several evaluation IDs are future units, and no human-reviewed
project-versus-baseline comparison has been run.

## Evidence

- `npm run validate` passes repository, KB, source-manifest, and safety checks;
- the app workspace passes typecheck, lint, formatting, unit tests, integration
  tests, and build;
- the 30-pair development replay passes without credentials;
- Docker Compose builds and starts a healthy localhost-only container;
- headless Chrome loads the English SSR landing page and exposes the text chat,
  notice, legal links, and footer;
- service pages render Markdown tables as semantic HTML tables;
- the mock fallback shows the bounded `call ai-app({...})` preview without
  making a provider request;
- failure tests cover invalid input, critical hazard bypass, empty retrieval,
  provider failure, and malformed provider output.

## Continue / change / stop

**Continue**, with a hard no-public-release boundary. The next work should be:

1. complete qualified source, rights, jurisdiction, and domain review;
2. create the missing KB units and replace development pilot labels with human
   review records only when that review actually happens;
3. decide the provider/model, data-processing settings, budget, and authority
   before implementing a live adapter;
4. run the same reviewed pilot against the project and an approved direct
   baseline, then publish only content-free comparison evidence.

The POC is therefore a useful engineering checkpoint, not a launch approval or
a claim of superiority over ChatGPT. The durable resume details are in the
[current-state checkpoint](../handoffs/plumbing-assistant-poc-current-state.md).
