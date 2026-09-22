# ADR-0003 — Anonymous Access and Abuse Controls

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-22 |
| Decision owner | Anton Mitsev |
| Audit finding | `AUD-P1-005` |
| Applies to | Plumbing Assistant MVP |

## Context

The public assistant has no accounts, while every model or retrieval request can
create cost and consume a finite shared service allowance. A browser token can
distinguish one installation for quota purposes, but it cannot prove a person's
identity: the visitor can delete it, use another browser, or distribute traffic
across networks. Conversely, invasive fingerprinting would create privacy and
accessibility harm without making anonymous users reliably unique.

The design therefore needs to make casual reset and automated abuse expensive,
limit the effect of one source, and put an absolute bound on owner cost. It does
not need to turn an anonymous portfolio demonstration into an identity system.

## Decision

Anonymous access uses layered, privacy-minimized controls. The signed visitor
token is the primary quota key, but it is **rate-limiting evidence, not a
real-world identity**. Browser fingerprinting is neither required nor treated as
proof of uniqueness.

The global atomic monetary budget and circuit breaker from
[ADR-0002](0002-atomic-cost-and-quota-accounting.md) remain the ultimate cost
boundary. With valid price data and request bounds, a distributed attacker may
still exhaust availability for the UTC day, but cannot make the application
admit work beyond its configured global budget. This availability risk is
explicitly accepted for the registration-free MVP.

## First-party access protocol

The Node.js application issues a versioned visitor token containing:

- a cryptographically random visitor ID with at least 128 bits of entropy;
- issue and expiry times;
- a schema version and signing-key ID;
- an HMAC-SHA-256 authentication tag made with a dedicated server secret.

The token contains no IP address, browser attributes, or other personal data. It
has a maximum lifetime of 30 days and is delivered only in a cookie with
`HttpOnly`, `Secure`, `SameSite=Strict`, and a narrow API `Path`. The cookie has
no `Domain` attribute. The token does not need to be confidential; authenticity,
entropy, expiry, and transport protection are the security properties.

Chat requests must be same-origin JSON `POST` requests and must pass all of:

1. valid visitor-token authentication and expiry;
2. an exact configured `Origin` allowlist;
3. compatible Fetch Metadata, including `Sec-Fetch-Site: same-origin`;
4. a server-issued CSRF value bound to the visitor token and supplied in a
   custom request header;
5. content-type, body-size, and schema validation.

The CSRF value is supplied by the same-origin page bootstrap and kept only in
page memory. The application does not enable wildcard CORS. Token issuance is
itself short-window rate limited. A missing, invalid, expired, or altered token
does not silently mint a replacement during a chat request; an explicit page or
new-session flow is required.

These controls protect paid endpoints from drive-by and cross-origin use. They
do not defend against same-origin script execution, so the UI must retain normal
XSS controls such as contextual output escaping and a restrictive Content
Security Policy.

## Privacy-minimized abuse signals

The server may use only the following supplemental signals in the MVP:

### Visitor quota key

The persistent quota key is:

```text
visitor_quota_id = HMAC-SHA-256(visitor_quota_key, visitor_id)
```

The raw token and visitor ID are not written to the quota ledger or logs. The
derived quota ID follows the 30-day operational retention defined for usage
records.

### Network bucket

The connection address is used only in request memory. The application
normalizes it to an IPv4 `/24` or IPv6 `/56` prefix and derives:

```text
network_bucket = HMAC-SHA-256(daily_network_key, normalized_prefix)
```

Only the current and immediately previous UTC daily keys may be retained, so a
bucket cannot remain linkable for more than 48 hours. Raw addresses and prefixes
must not enter application logs, access logs, metrics, traces, the usage ledger,
or backups. The bucket is pseudonymous operational data, not anonymous data.

Client-address headers are accepted only from explicitly configured trusted
reverse proxies. Direct client traffic cannot select its address through
`Forwarded`, `X-Forwarded-For`, or vendor-specific headers. Production startup
or health checks fail closed if the deployment's proxy trust chain is
ambiguous.

### Optional coarse client bucket

If WP-03 demonstrates a need, the server may create a daily keyed bucket from
low-entropy values already present in ordinary HTTP requests, limited to browser
family and major version, operating-system family, and primary accepted
language. It has the same maximum 48-hour linkability and must never be the sole
reason for denial.

The MVP must not collect canvas, WebGL, audio, installed-font, plugin,
device-enumeration, sensor, or cross-site identifiers. Adding any high-entropy
fingerprinting requires a new requirements decision, privacy impact assessment,
legal review, and appropriate user notice or consent mechanism before
implementation.

### OpenAI safety identifier

Every OpenAI model request includes a stable, privacy-preserving identifier for
the lifetime of the visitor token:

```text
safety_identifier = "pa_" + base64url(
  HMAC-SHA-256(openai_safety_key, visitor_id)
)
```

The encoded result must not exceed the provider's 64-character limit. It
contains neither the visitor token nor directly identifying data, and it is not
reused as a prompt-cache key. OpenAI documents `safety_identifier` as a stable
identifier that helps detect abusive end-user activity and recommends a session
identifier for previews without signed-in users. See the official
[Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
and [Responses API reference](https://developers.openai.com/api/reference/cli/resources/responses/methods/create).

## Enforcement layers

Before retrieval or an OpenAI call, a request must pass:

1. the first-party access protocol;
2. token-issuance and per-visitor short-window throttles;
3. a privacy-minimized network-bucket throttle;
4. per-visitor concurrency and daily monetary limits;
5. a network daily monetary share limit;
6. the global atomic monetary reservation and circuit breaker;
7. hard request, token, image, tool, and timeout limits;
8. the provider-project monthly spend cap;
9. applicable moderation and domain-safety controls.

The network daily monetary limit must be configurable, must allow for shared
home, office, carrier, and public networks, and must not exceed one quarter of
the global daily budget. WP-03 selects its final measured value and the
short-window thresholds. A network denial returns a generic localized message
and retry time; it makes no claim that the visitor is malicious and does not
block the public landing page.

The MVP does not add a third-party CAPTCHA. If later evidence supports a
challenge step, its accessibility, privacy, availability, and data-processing
impact requires a separate decision.

## Threat model

| Threat | Required control | Accepted residual risk |
| --- | --- | --- |
| Delete or rotate visitor cookie | Daily network bucket, token-mint throttle, global budget | Mobile/network rotation can obtain another allowance |
| High-rate script from one source | Short-window visitor and network throttles, concurrency cap | Shared networks can experience false positives |
| Parallel requests race the quota | ADR-0002 atomic reservation | Conservative admission may reject valid work near a boundary |
| Distributed botnet | Global circuit breaker and provider-project cap | It can exhaust the day's availability, but not the configured application budget |
| Cross-site request/drive-by use | Strict same-site cookie, Origin, Fetch Metadata, CSRF header, no wildcard CORS | Same-origin XSS remains in scope for application security |
| Token theft or replay | HTTPS, `HttpOnly`, scoped cookie, expiry and key rotation | A stolen token may be replayed until expiry or revocation |
| Token forgery/key compromise | Strong HMAC, secret separation, key IDs, rotation procedure | Active-key compromise requires incident response and invalidation |
| Spoofed client IP headers | Explicit trusted-proxy chain and deployment tests | Proxy misconfiguration can reduce accuracy and must fail closed |
| Privacy-invasive fingerprinting | Explicit attribute prohibition and change gate | Short-lived keyed buckets remain pseudonymous data |
| Abuse of model behavior | Moderation, domain safety pipeline, `safety_identifier` | Provider and application detection are not guarantees |
| Identifier leakage in telemetry | Bounded aggregate labels and log tests | A deployment platform may need separate verified redaction controls |

## Key separation and rotation

Separate secrets are mandatory for:

- visitor-token authentication;
- CSRF derivation;
- persistent visitor quota IDs;
- daily network and optional coarse-client buckets;
- OpenAI safety identifiers;
- conversation envelopes from ADR-0001.

No secret may be committed to the repository or reused across purposes. Signed
artifacts include a key ID. A normal rotation accepts the active and immediately
previous signing key for the bounded migration interval, then retires the old
key. Daily bucket keys are derived from a protected root and UTC date and are
destroyed after the 48-hour overlap.

Compromise of the visitor-token or quota key requires rotation, invalidation of
affected tokens, opening the circuit breaker while accounting integrity is
checked, and a documented incident review. Rotation must not erase monetary
charges or allow already consumed allowance to be reclaimed.

## Data retention and transparency

| Data | Location | Maximum retention |
| --- | --- | ---: |
| Raw connection address and request headers used for derivation | Request memory | Request lifetime |
| Visitor cookie | Browser | 30 days |
| Persistent visitor quota ID and ledger data | Usage store | 30 days |
| Network and optional coarse-client buckets | Abuse-control store | 48 hours |
| Content-free aggregate operational metrics | Metrics store | Per ADR-0001 retention policy |
| OpenAI `safety_identifier` | OpenAI request | Per the deployed provider data policy disclosed to users |

The Bulgarian and English privacy notices must describe the purposes,
categories, recipients, retention, and user contact path. Keyed hashes and
short-lived buckets must not be described as anonymous merely because the raw
value is not stored. They are used only for security, abuse prevention, and
quota enforcement—not advertising, behavioral profiling, or cross-site
tracking.

The applicable legal basis, notice wording, and handling of deletion or access
requests require privacy/legal review before public launch. This ADR defines a
technical minimization decision and does not itself make a legal-compliance
claim.

## Failure behavior

The paid path fails before retrieval or model use when token, origin, CSRF,
proxy trust, quota-store health, key configuration, or an applicable quota
cannot be verified. Failure of an optional coarse signal does not by itself
deny the request; the remaining mandatory layers still apply.

No browser fingerprint is required for the backend to work. The mandatory
proofs are the server-issued visitor token and same-origin request binding. This
replaces a fragile “fingerprint must exist” rule with deterministic,
server-verifiable controls.

## Verification required before closing AUD-P1-005

1. Token tests cover entropy, tampering, expiry, cookie attributes, key rotation,
   and replay across visitor bindings.
2. Integration tests reject invalid Origin, Fetch Metadata, content type, CSRF,
   and token input without retrieval or provider calls.
3. Proxy tests prove untrusted forwarded-address headers cannot select a bucket.
4. Reset and parallel-client tests prove visitor, network, concurrency, and
   global controls compose as specified.
5. Load tests prove atomic budget enforcement and the one-quarter network-share
   configuration invariant.
6. Log, trace, metric, ledger, and backup inspections find no raw address,
   token, visitor ID, or high-entropy fingerprint data.
7. Tests prove bucket rotation and deletion make signals unlinkable after their
   stated lifetime.
8. OpenAI SDK-boundary tests prove every model request carries a stable,
   correctly bounded, non-PII `safety_identifier` distinct from cache keys.
9. WP-03 records measured thresholds and shared-network false-positive results.
10. Reviewed Bulgarian and English notices match the deployed behavior, and the
    privacy/legal review is recorded.

## Consequences

### Positive

- The MVP stays registration-free without pretending to identify human beings.
- Cost remains absolutely bounded even when weaker anonymous signals are reset.
- Abuse controls collect substantially less data than conventional device
  fingerprinting.
- False-positive and distributed-attack risks are stated and testable.
- Provider abuse monitoring receives a stable pseudonymous session identifier.

### Negative

- Determined distributed abuse can consume the day's availability.
- Shared networks can hit a network limit because multiple people share one
  prefix.
- Key rotation, trusted-proxy configuration, and short-lived bucket cleanup add
  operational work.
- Final thresholds still depend on WP-03 measurements and privacy review.
