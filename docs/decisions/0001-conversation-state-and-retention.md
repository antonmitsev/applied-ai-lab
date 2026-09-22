# ADR-0001 — Conversation State and Data Retention

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-22 |
| Decision owner | Anton Mitsev |
| Audit finding | `AUD-P0-001` |
| Applies to | Plumbing Assistant MVP |

## Context

The assistant needs enough conversational context to ask follow-up questions,
refine a diagnosis, and preserve safety information. It is also a public,
anonymous portfolio application that should not create a durable database of
questions, responses, or user images.

The OpenAI Responses API stores Response objects by default when `store` is
omitted. Provider Conversation objects have a separate, longer-lived lifecycle.
Relying on either default would conflict with the product's data-minimization
intent and would make deletion and privacy wording harder to reason about.

The browser is an untrusted boundary. Accepting an arbitrary message history
from it would allow previous assistant messages and safety classifications to be
silently modified before the next model call.

## Decision

The MVP will use **application-managed, client-carried conversation state** and
will make **stateless foreground requests** to the OpenAI Responses API.

### Provider state

Every model request must:

- set `store: false` explicitly;
- omit `conversation`;
- omit `previous_response_id`;
- set background execution to `false` or omit it only when the SDK default is
  covered by an automated contract test;
- resend the current trusted developer instructions on every turn;
- send the bounded, server-validated visible conversation history needed for
  the current answer.

The MVP will not create OpenAI Conversation objects and will not depend on
retrieving prior Response objects. It will not preserve hidden reasoning items
between turns. Each request reasons from the visible validated transcript and
the current retrieval results. A future change may carry provider-encrypted
reasoning items only after a separate privacy, size, and cost review.

These choices limit provider application-state persistence but do not remove
provider abuse-monitoring retention. The user-facing privacy notice must explain
that distinction and must not claim Zero Data Retention unless the deployed
OpenAI project has actually been approved and configured for it.

### Client-carried state

After each successful turn, the Node.js server returns an integrity-protected
conversation envelope. The browser stores the envelope in `sessionStorage` and
sends it with the next message. It must not be stored in `localStorage`, a
persistent cookie, an analytics product, or the usage database.

The envelope is a versioned payload authenticated with HMAC-SHA-256 using a
server-side secret dedicated to conversation state. It contains:

- schema version;
- random conversation ID with at least 128 bits of entropy;
- binding to the pseudonymous visitor-token hash;
- conversation start, issue, idle-expiry, and absolute-expiry timestamps;
- turn count;
- the bounded sequence of validated user and assistant text items;
- structured image observations needed for follow-up, but never image bytes;
- key ID and authentication tag.

The payload does not need confidentiality from its user because the same text is
already displayed in that user's browser. The authentication tag provides
integrity and visitor binding. XSS prevention remains necessary because script
running in the page could read any visible conversation.

The browser may keep a separate presentation copy of the transcript in memory,
but the server trusts only a valid envelope it issued. Replaying an older valid
envelope may fork a conversation; it must not bypass usage accounting because
every resulting model call is charged to the visitor and global budgets.

### Lifetime and bounds

Initial MVP limits are:

| Control | Limit |
| --- | ---: |
| User turns per conversation | 10 |
| Idle lifetime | 60 minutes |
| Absolute lifetime | 4 hours |
| Encoded envelope size | 128 KiB |
| Browser persistence | Current tab session only |

The server rejects an invalid, expired, oversized, incorrectly bound, or
unsupported-version envelope before retrieval or model calls. When a limit is
reached, the UI keeps the visible transcript long enough to let the user read it
but requires a new conversation for further messages. No silent truncation is
allowed because an omitted earlier hazard could change the safety outcome.

The exact input-token ceiling is owned by the future Cost and Quota ADR. It may
be lower than the envelope-size limit. The stricter limit always wins.

### Images

An image belongs only to the current request. Image bytes are not placed in the
conversation envelope. If follow-up depends on the image, the validated response
may carry a short textual observation forward.

The server should use inline image input when the selected API and size limits
permit it. If a provider-side File object is unavoidable, the implementation
must set the shortest supported expiry and issue an explicit deletion after the
request. Local temporary files must be deleted after processing, with a janitor
removing abandoned files within 15 minutes. The full validation pipeline remains
owned by `AUD-P1-007`.

### Operational data

The persistent usage store contains identifiers and counters defined by FR-09,
not conversation content. Application and reverse-proxy logs must exclude
request/response bodies, image data, conversation envelopes, authorization
headers, full URLs containing user content, and raw IP addresses.

Errors must use a correlation ID and bounded categorical fields. Developers must
reproduce content-dependent failures locally with synthetic or explicitly
consented test cases rather than enabling production prompt logging.

## Data flow

```text
Browser tab
  ├─ visible transcript: memory
  └─ authenticated state envelope: sessionStorage
             │ current message + envelope + optional current image
             ▼
Node.js server
  ├─ validates visitor token, envelope, limits, and current input
  ├─ reconstructs bounded trusted visible history
  ├─ holds request and image buffers transiently
  └─ records content-free usage counters
             │ full bounded input; store:false; no conversation IDs
             ▼
OpenAI Responses API
  └─ returns structured output and usage
             │
             ▼
Node.js server
  ├─ validates output and reconciles usage
  └─ returns rendered response + new authenticated envelope
```

## Retention matrix

| Data class | Location | Contains user content | Retention | Deletion/enforcement |
| --- | --- | --- | --- | --- |
| Visible transcript | Browser memory | Yes | Current tab/session | Cleared by new-chat action, tab close, or page lifecycle |
| Conversation envelope | Browser `sessionStorage` | Yes | 60-minute idle and 4-hour absolute TTL | Server rejects expiry; browser clears on expiry/new chat |
| Request buffers | Node.js process memory | Yes | Request lifetime | References released in completion/failure cleanup |
| Local temporary image | Non-public temporary storage | Yes | Request lifetime; 15-minute recovery ceiling | `finally` cleanup plus janitor |
| OpenAI Response application state | OpenAI | Yes | No application-state storage requested | Every request asserts `store: false`; contract test |
| OpenAI abuse-monitoring data | OpenAI | Potentially | Provider policy; currently up to 30 days by default | Disclosed; rechecked before release; ZDR not claimed |
| Provider prompt cache | OpenAI | Encoded application state | Provider/project policy | Rechecked for selected model and project before release |
| Provider file for user image | OpenAI, only if unavoidable | Yes | Shortest supported expiry | Explicit delete after response plus reconciliation job |
| Curated source documents and vector index | Repository/source storage and OpenAI vector store | No user chat content | Until superseded, withdrawn, or project teardown | Source registry and periodic reconciliation under WP-01 |
| Pseudonymous usage rows | Usage store | No chat content | 30 days | Scheduled deletion with count verification |
| Anonymous aggregate metrics | Usage store | No | 13 months | Monthly retention job |
| Content-free application errors | Log service | No | 30 days | Log retention policy |
| Content-free access logs | Edge/server | No | 7 days | Provider/server retention policy; raw IP logging disabled |
| Usage-store backups | Encrypted backup storage | No chat content | 7 days | Rolling expiry; restore procedure preserves deletion schedule |

Retention values are maximums, not minimums. A shorter operational lifetime is
allowed. Changes require updating this ADR, both privacy notices, and relevant
automated retention tests before deployment.

## Failure behavior

- A missing envelope starts a new conversation only when the request explicitly
  declares that intent.
- An invalid, expired, oversized, or wrongly bound envelope fails closed without
  an OpenAI or retrieval call.
- Failure to verify provider-request configuration fails closed.
- Failure to write usage accounting follows the quota fail-closed policy.
- Provider timeouts or invalid outputs do not mint a new envelope.
- Cleanup failure emits a content-free operational alert and is retried.

## Key management

Conversation-state keys are separate from visitor-token, admin-signing, and
provider keys. The active key signs new envelopes; the immediately previous key
may verify existing envelopes for no longer than the four-hour absolute lifetime.
Keys never enter the repository or browser. Rotation and compromise response
will be included in the deployment runbook.

## Verification required before closing the audit finding

The design portion of `AUD-P0-001` is complete. Final closure still requires:

1. a unit test for every envelope rejection condition;
2. an SDK-boundary test proving `store: false` and the absence of `conversation`
   and `previous_response_id` on every model request;
3. integration tests for new chat, expiry, deletion, cleanup, and key rotation;
4. a log-capture test proving that content and envelopes are absent;
5. verified OpenAI project data-control settings;
6. Bulgarian and English privacy notices matching the deployed behavior.

## Consequences

### Positive

- No application conversation database is required.
- A server restart does not lose an active client-carried conversation as long
  as the verification key remains available.
- Provider application-state retention is explicitly disabled.
- Conversation history cannot be silently altered without detection.
- The state and its cost are strictly bounded.

### Negative

- Conversations do not synchronize between tabs or devices and disappear when
  the tab session ends.
- Every request resends bounded visible history, increasing input tokens.
- The envelope increases request size.
- Key rotation and state-version compatibility require deliberate handling.
- Follow-up questions cannot re-inspect an earlier image unless the user uploads
  it again; only validated text observations remain available.

## Alternatives rejected for the MVP

### OpenAI Conversation objects

Rejected because their items persist until deleted and add a provider-side
deletion lifecycle that is unnecessary for an anonymous short-lived assistant.

### `previous_response_id`

Rejected because it relies on provider-held Response state and makes the
privacy/retention behavior less direct than sending bounded state with
`store: false`.

### Server-side persistent conversation database

Rejected because accounts, cross-device history, and long-lived cases are not
MVP requirements. It would increase privacy, security, deletion, and operations
scope without improving the intended short troubleshooting session.

### Unsigned browser-provided transcript

Rejected because the browser is untrusted and must not be able to rewrite prior
assistant or policy-relevant content without detection.

## References

- [OpenAI conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- [OpenAI Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)
- [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)
