# Privacy Notice

| Field | Value |
| --- | --- |
| Status | Pre-publication draft — deployment verification and qualified review required |
| Version | `0.1.0-draft` |
| Last updated | 22 September 2026 |
| Controller | Anton Mitsev |
| Privacy contact | The channel will be published before public release |

This draft describes the approved minimal MVP design. It must not be published
as final until the real hosting, OpenAI project settings, logs, vendors, and
international transfers have been verified and recorded.

## 1. Data processed and purposes

| Data | Purpose | Maximum application retention |
| --- | --- | ---: |
| Question text, bounded visible history, and answer | Generate and validate a useful, safe response | Current-request memory; the signed visible history remains only in `sessionStorage` for 60 idle minutes/4 hours total |
| One submitted image and extracted observations | Analyse the current case | Request memory/temporary file; recovery cleanup within 15 minutes; the image is not put in conversation history |
| Random visitor token and derived quota ID | Access, daily limits, budget, and abuse prevention | Cookie and quota records for up to 30 days |
| Short-lived keyed network bucket | Limit automated abuse | Up to 48 hours; the raw IP address is used only in request memory |
| Token, cost, latency, error, and outcome counters | Budget, reliability, and aggregate statistics | Pseudonymous usage rows for up to 30 days; anonymous aggregates for up to 13 months |
| Content-free access/error logs | Security and diagnosis | Access logs up to 7 days; error logs up to 30 days |
| Information in a future contact request | Answer a question, correction, or rights request | Only while needed for the request and legal duties |

The application must not record questions, answers, images, conversation
envelopes, authorization headers, or raw IP addresses in the usage store,
application/access logs, analytics, or backups. Do not submit unnecessary
personal data, addresses, faces, documents, or sensitive information.

## 2. Proposed legal basis

The proposed MVP relies on legitimate interests under GDPR Article 6(1)(f) to
provide a response explicitly requested by the visitor, protect the service,
prevent abuse, and control cost. The interest is bounded through minimisation,
short retention, pseudonymisation, and a global budget.

This basis and its balancing test require qualified privacy/legal confirmation
before publication. If specific future processing requires consent, it will not
start before a free and informed opt-in with easy withdrawal. Depending on the
case, responding to contact may involve steps at your request or compliance
with a legal obligation.

## 3. Recipients and OpenAI

Necessary data may be processed by:

- the selected hosting/edge provider, which must be named here before launch;
- OpenAI through the Responses API to generate/validate a response;
- an internet-search provider only when live web search is needed;
- public websites, which may receive a minimal technical request when a public
  source is fetched.

The OpenAI request explicitly sets `store: false` and does not use OpenAI
Conversation objects. This limits application-state storage but does not mean
Zero Data Retention. According to current OpenAI documentation, API data is not
used to train models unless the customer opts in; standard abuse-monitoring
logs may contain customer content for up to 30 days; and submitted images are
scanned and may in defined cases be retained for review. See the current
[OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data).

OpenAI project settings, model, prompt caching, image/file lifecycle, and any
regional settings must be checked again for every public release. The service
does not claim Zero Data Retention unless that is evidenced for the deployed
project.

## 4. International transfers

The actual hosting regions, vendor legal entities, and mechanisms for transfers
outside the EEA have not yet been selected. They are a blocking pre-publication
placeholder: the final page must name recipients, countries, and applicable
safeguards or explain how to obtain a copy of them.

## 5. Cookies and browser storage

The service uses one necessary protected visitor cookie for up to 30 days and
`sessionStorage` for the current conversation. It uses no advertising,
cross-site tracking, analytics cookies, or high-entropy fingerprinting. See the
[Cookie Policy](cookies.en.md) for details and future-change rules.

## 6. Your rights

Under applicable law you may have rights to information, access, rectification,
erasure, restriction, objection, and portability, and rights concerning certain
solely automated decisions. The service does not make decisions with legal or
similarly significant effects about you.

Use the contact channel that will be published before public release. Minimal
verification may be needed to avoid disclosing another person's data. With short-lived pseudonymous
records, the operator may be unable to associate a row with a real person
without more information and will not collect extra data solely to identify
you.

You may complain to the Bulgarian
[Commission for Personal Data Protection](https://cpdp.bg/en/) without limiting
other administrative or judicial remedies.

## 7. Security, deletion, and changes

The project uses separated keys, signed tokens, bounded retention, content-free
logs, and limited access. No system can guarantee absolute security. “New chat”
deletes local conversation history; contact the operator about other retention.

The version and date appear above. A material change to data, purposes, vendors,
or retention requires prior updates to both language pages and their tests.
