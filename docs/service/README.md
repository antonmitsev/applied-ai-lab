# Public Service Pages and Landing-page Disclosure Contract

| Field | Value |
| --- | --- |
| Specification ID | `PA-SERVICE-001` |
| Status | Pre-publication content complete; UI and qualified review pending |
| Content version | `0.1.0-draft` |
| Last updated | 2026-09-22 |
| Owner | Anton Mitsev |
| Audit finding | `AUD-P2-011` |

## Purpose

This directory is the versioned source copy for the public service pages. The
documents govern use of the operated Plumbing Assistant service; they do not
replace or alter the repository's [0BSD source-code license](../../LICENSE).

The machine-readable [route manifest](public-pages.json) is authoritative for
route names, language pairs, persistent footer links, copyright text, and the
pre-chat notice. React page components may render this content from another
format, but their meaning and version metadata must remain equivalent.

## Required public routes

| Page | Bulgarian (default) | English | Source copy |
| --- | --- | --- | --- |
| Terms of Use | `/terms` | `/en/terms` | [BG](terms.bg.md) · [EN](terms.en.md) |
| Privacy Notice | `/privacy` | `/en/privacy` | [BG](privacy.bg.md) · [EN](privacy.en.md) |
| Cookie Policy | `/cookies` | `/en/cookies` | [BG](cookies.bg.md) · [EN](cookies.en.md) |
| Safety Notice | `/safety` | `/en/safety` | [BG](safety.bg.md) · [EN](safety.en.md) |
| Source Policy | `/sources` | `/en/sources` | [BG](sources.bg.md) · [EN](sources.en.md) |

Every route is a standalone SSR page with a stable canonical URL, correct
`lang`, reciprocal language link, unique title and description, visible content
version and update date, keyboard-accessible navigation, and a link back to the
landing page. Legal and safety content must remain usable without JavaScript.

## Landing page and chat placement

The Bulgarian `/` and English `/en` landing pages must:

1. state before the first chat submission that the visitor is interacting with
   AI, not a person;
2. show a concise safety limitation and links to the full Safety and Privacy
   pages next to the chat start control;
3. make the five service-page links permanently available in the footer;
4. render the same footer on every public page and chat state;
5. avoid using acceptance of Terms or acknowledgement of Privacy as consent for
   unrelated data processing;
6. show a cookie preference control only if a non-essential technology is
   actually configured.

The AI disclosure cannot be hidden only inside Terms. It must be clear from the
start of the first interaction and meet the accessibility requirements that
apply to the rest of the interface.

## Required footer

The footer contains these visible items in both languages:

- `© 2026 Anton Mitsev`, linked to <https://tonymitsev.com>;
- Terms, Privacy, Cookies, Safety, and Sources links;
- a contact/correction link to `mailto:me@tonymitsev.com`;
- a source-code link to <https://github.com/antonmitsev/applied-ai-lab>;
- an `0BSD` link to the repository `LICENSE` file.

Copyright identifies the author/operator. It does not introduce restrictions
inconsistent with 0BSD. Third-party source material remains subject to its own
rights and is not relicensed merely because it is cited by the service.

## Cookie and notice behavior

The approved MVP profile is `necessary-only`:

- one scoped, `HttpOnly`, `Secure`, `SameSite=Strict` visitor cookie used for
  security and quota enforcement;
- current-tab conversation state in `sessionStorage`;
- no advertising, cross-site tracking, analytics cookie, or high-entropy device
  fingerprinting.

Under this profile the UI publishes the Cookie Policy but does not show a
misleading accept/reject banner for technologies the user cannot switch off. If
any non-essential storage or tracking is introduced, it must default to off,
be blocked before opt-in, offer equally prominent accept and reject actions,
support later withdrawal, and trigger updated bilingual documents and tests.

## Release evidence

Before public launch:

- the operator and every deployed processor/host and international-transfer
  statement must be verified against the real deployment;
- the proposed legal bases and service wording require qualified Bulgarian/EU
  privacy/legal review;
- a domain professional must review the safety wording;
- browser tests must prove route availability, bilingual parity, footer links,
  pre-chat notice visibility, copyright/link correctness, keyboard access, and
  cookie behavior;
- a release record must bind the rendered page digests to the content version.

Repository validation proves that the source-copy set and manifest are
complete. It is not a legal opinion and is not evidence that the future React
implementation renders the pages correctly.

## Primary references

- [GDPR transparency and data-minimisation principles](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)
- [GDPR, Articles 12–14](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)
- [EU AI Act Article 50 transparency guidance](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act)
- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data)
- [Bulgarian Commission for Personal Data Protection](https://cpdp.bg/)
