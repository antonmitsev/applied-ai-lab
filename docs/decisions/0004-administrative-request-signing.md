# ADR-0004 — Administrative Request Signing Protocol

| Field | Value |
| --- | --- |
| Status | Accepted design; implementation and interoperability tests pending |
| Protocol | `PA-ADMIN-SIG-1` |
| Date | 2026-09-22 |
| Decision owner | Anton Mitsev |
| Audit finding | `AUD-P1-009` |
| Applies to | Read-only Plumbing Assistant administrative statistics API |

## Context

The MVP has no administrative web interface. A local CLI retrieves aggregated
statistics from one HTTPS endpoint using an Ed25519 key whose private half never
reaches the application server. Requirements v0.1 names the fields to sign but
does not define their bytes. Independent CLI and server implementations could
therefore disagree about path, query, encoding, line endings, or empty bodies,
and a valid captured request could be replayed.

This protocol is intentionally application-specific. It does not claim to
implement the general HTTP Message Signatures standard. Version 1 supports only
the read-only statistics operation; a future method, path, body, or character
repertoire requires a new protocol version and review.

## Decision summary

`PA-ADMIN-SIG-1` signs a UTF-8 canonical request with Ed25519. The signed data
binds the protocol version, deployment audience, key ID, timestamp, one-time
nonce, method, exact endpoint path, canonical query, content type, and SHA-256
body digest.

The server verifies the signature and then atomically consumes the nonce in a
persistent store before returning statistics. HTTPS, trusted-proxy validation,
rate limiting, response privacy controls, and least-privilege aggregate output
remain mandatory; a signature does not replace them.

## Supported request

Version 1 accepts only:

```text
GET /api/admin/stats?period=<value>
```

`period` is required exactly once and is one of `1d`, `7d`, or `30d`. The
request body is exactly zero octets. `Content-Type`, `Content-Encoding`, and
`Transfer-Encoding` must be absent; `Content-Length` may be absent or exactly
`0`. Any other method, path, parameter, duplicate parameter, body, or transfer
framing is rejected. Adding a future operation requires a distinct allowlisted
route contract and, when it changes these invariants, `PA-ADMIN-SIG-2`.

The verifier obtains the raw request target from the Node.js HTTP trust boundary
before a router decodes or rewrites it. A reverse proxy must forward it without
normalization. Deployment tests compare the CLI request target, edge/proxy
target, and Node.js raw target byte for byte.

## Headers

Every request supplies exactly one instance of each header:

```text
X-Admin-Signature-Version: PA-ADMIN-SIG-1
X-Admin-Key-Id: <key-id>
X-Admin-Timestamp: <Unix seconds>
X-Admin-Nonce: <base64url nonce>
X-Admin-Signature: <base64url Ed25519 signature>
```

The server checks header multiplicity from the raw header list before framework
coalescing. After the HTTP stack removes permitted framing OWS, each parsed
value must match its complete grammar. Internal whitespace, controls, obsolete
line folding, or non-ASCII bytes are invalid. Framing OWS is not part of the
signed value and must not be used to distinguish requests.

| Header | Exact format |
| --- | --- |
| Version | Literal `PA-ADMIN-SIG-1` |
| Key ID | `ak_` followed by 8–61 ASCII letters, digits, `_`, or `-`; maximum 64 characters |
| Timestamp | Base-10 Unix seconds, digits only, no sign and no leading zero; maximum 10 digits for v1 |
| Nonce | Exactly 32 random octets encoded as 43 unpadded base64url characters |
| Signature | Exactly 64 Ed25519 signature octets encoded as 86 unpadded base64url characters |

Base64url uses the RFC 4648 URL-safe alphabet, canonical zero pad bits, and no
`=` padding. A decoder must reject padding, whitespace, standard-base64 `+` or
`/`, non-alphabet characters, non-canonical encodings, or an unexpected decoded
length. Key IDs are public selectors, not secrets, and must not contain user or
device information.

## Deployment audience

Every deployment has a stable, non-secret ASCII audience configured in both the
CLI profile and server, for example:

```text
plumbing-assistant:production
```

The production, staging, development, and preview audiences must differ. The
audience is not taken from `Host`, `Forwarded`, or another request header. This
prevents a request signed for one environment from authenticating to another
even if public keys are accidentally shared.

## Canonical request

The canonical request is these ten fields in this exact order, joined by one LF
octet (`0x0A`), with no BOM, CR, spaces around fields, or trailing LF:

```text
PA-ADMIN-SIG-1
<audience>
<key-id>
<timestamp>
<nonce>
GET
<canonical-path>
<canonical-query>
<canonical-content-type>
<body-sha256>
```

All fields are ASCII in v1, so their UTF-8 encoding is byte-identical. Unicode,
invalid UTF-8, NUL, controls, and CR/LF are rejected rather than normalized.
Implementations must build the byte buffer directly and must not use platform
line endings, JSON serialization, form encoding, locale-aware comparison, or
Unicode normalization.

### Method

The only canonical method is uppercase ASCII `GET`. Lowercase or mixed-case
methods are rejected; they are not silently converted.

### Path

The only canonical path is the exact ASCII string `/api/admin/stats`. The raw
path must match it byte for byte. Percent encoding, an absolute URI, fragments,
backslashes, repeated slashes, dot segments, a trailing slash, or decoded
equivalents are rejected rather than normalized.

This deliberate restriction removes path-decoding differences between the CLI,
proxy, framework, and application. A new path is an explicit route contract,
not an alias of this one.

### Query

The raw query must match the ASCII expression
`^period=(1d|7d|30d)$` byte for byte. The canonical query is that unchanged raw
string and excludes the leading `?`.

Version 1 performs no percent decoding, form decoding, re-encoding, sorting, or
Unicode normalization. It accepts only one fixed-position pair, so there is no
alternative order to normalize. Repeated keys or pairs, unknown or empty
parameters, percent escapes (including escapes for unreserved characters), `+`,
spaces, semicolon separators, fragments, controls, non-ASCII, and invalid UTF-8
are rejected rather than collapsed or sorted. This eliminates equivalence
classes such as `7d` versus `%37d` and parser differences where `+` may mean a
space.

### Content type and body digest

The canonical content-type line is empty. The body is zero octets and its
lowercase SHA-256 hexadecimal digest is always:

```text
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

The server hashes the bytes actually received and compares the result to this
constant before signature acceptance. A non-empty body or content framing is
rejected even if its digest could otherwise be signed.

## Signing and verification

The CLI creates a 32-octet nonce with the operating system cryptographic random
generator for every attempt, obtains current UTC Unix seconds, constructs the
exact canonical bytes, and produces a pure Ed25519 signature as specified by
RFC 8032. Ed25519ph and Ed25519ctx are not permitted. With Node.js `crypto`, the
algorithm argument for Ed25519 signing and verification is `null`.

The server processes a structurally bounded request in this order:

1. apply a coarse pre-authentication network rate and connection/header-size
   limit;
2. require HTTPS as established by the explicit trusted-proxy boundary;
3. validate raw header multiplicity and syntax, raw request target, method,
   framing, body length, and protocol version;
4. load the exact audience-scoped key record and require `active` or
   `retiring` state with current validity dates;
5. require `abs(server_unix_seconds - timestamp) <= 90`;
6. canonicalize independently from the raw request and verify the 64-octet
   Ed25519 signature;
7. atomically insert `(audience, key_id, nonce)` into the replay store with
   its expiry; a uniqueness conflict rejects the request;
8. apply the authenticated route/query authorization and return only approved
   aggregate statistics.

The application must never trust canonical bytes supplied by the client. It
reconstructs them. Signature verification uses the original canonical request,
not its SHA-256 digest; the body alone is represented by a digest.

## Time and replay protection

The allowed clock skew is 90 seconds in either direction. Deployment health
must verify UTC clock synchronization with an observed maximum offset of 30
seconds. If clock health, the key registry, or the replay store cannot be
verified, the endpoint fails closed with no statistics.

The replay store is authoritative, persistent, and shared by all instances. A
single-server deployment may use the same transactional SQLite service as usage
accounting; a multi-instance deployment requires a shared atomic store. The
primary key is `(audience, key_id, nonce)`. A verified nonce is retained for
five minutes from first acceptance, which exceeds the complete timestamp
window. Cleanup may be asynchronous, but expiry must not make a still-fresh
request reusable.

Nonce insertion occurs only after successful cryptographic verification so an
unauthenticated attacker cannot fill the store with arbitrary nonces. It occurs
before statistics are read or returned. Under concurrent replay, exactly one
transaction may insert the nonce and at most one request may succeed. A server
restart must not clear accepted nonces.

## Key representation and lifecycle

The CLI uses an Ed25519 private key in PKCS#8 PEM. An encrypted PKCS#8 file or
operating-system-backed key store is preferred. A local unencrypted file
requires explicit opt-in, mode `0600`, a private directory, and no backup or
shell-history leakage. The private key is never accepted through a command-line
argument, environment variable, repository file, browser, or server upload.

The server registry contains only:

- key ID and Ed25519 public key in SPKI PEM;
- allowed audience and route (`GET /api/admin/stats`);
- state: `pending`, `active`, `retiring`, or `revoked`;
- `not_before`, `not_after`, creation/revocation metadata, and operator note.

Import rejects a private key, a non-Ed25519 key, duplicate key ID/public key,
invalid dates, an unknown audience/route, or a test-vector key. Public-key
configuration lives in a protected runtime registry, not a client-controlled
header or the public repository.

### Normal rotation

1. Generate the new key on the administrator device and back it up securely.
2. Add only its public key as `pending`; validate algorithm, ownership, and
   audience out of band.
3. Activate it, update the CLI profile, and complete a signed smoke request.
4. Mark the old key `retiring` for at most 24 hours.
5. Revoke the old key, reload the registry atomically, verify rejection with a
   previously prepared request, and remove obsolete private-key copies.

At most one key is `active`; at most one is `retiring`. Revocation overrides
dates and takes effect at the authorization boundary immediately after the
atomic registry update. Registry caches must be invalidated by version and may
not extend revocation. Rotation never clears the nonce table.

### Compromise response

Immediately mark the key `revoked`, atomically deploy the registry, disable the
endpoint if registry propagation cannot be proven, inspect content-free access
and failure counts, create a replacement key, and record the incident. Do not
publish a suspected private key, signature, nonce, or canonical request in an
issue. Statistics remain unavailable until a replacement is verified.

## Errors, responses, and observability

Missing, malformed, unknown, stale, future, revoked, wrongly scoped, badly
signed, or replayed authentication returns the same status and body:

```text
HTTP 401
{"error":"admin_auth_failed"}
```

Infrastructure inability to verify authentication returns `503` with
`admin_auth_unavailable`. A query/schema error is returned as `400` only after
successful authentication. `405` is not used to reveal method validity before
authentication. Authentication failures do not echo a field, key ID, nonce,
signature, timestamp, canonical request, public key, or parser detail.

All responses use `Cache-Control: no-store`; authenticated responses also use
`Content-Type: application/json; charset=utf-8` and must not enter CDN/shared
caches. CORS is disabled. The endpoint is read-only and returns only FR-12
aggregates.

Allowed logs and metrics are timestamp bucket, deployment, result category,
latency, and bounded rate-limit counters. They exclude full key IDs, nonces,
signatures, canonical requests, raw request targets, public keys, CLI paths, and
statistics payloads. Diagnostic categories are available only in protected
server telemetry and are never reflected to the caller.

## Verification and test matrix

The language-independent vectors are in
[admin-signing-test-vectors.json](../contracts/admin-signing-test-vectors.json).
The fixed seed is an RFC 8032 test fixture, is not secret, must never be accepted
by a deployed registry, and is forbidden outside tests.

Required automated evidence includes:

- CLI/server interoperability using the positive vector and freshly generated
  keys;
- byte equality for canonical request, UTF-8, LF-only line endings, empty line,
  no trailing LF, body hash, and signature;
- rejection after changing each signed field or any request-target/body byte;
- rejection of duplicate/coalesced headers, padding, non-canonical base64url,
  wrong lengths, CR/LF, non-grammar whitespace, Unicode, invalid UTF-8, and
  controls;
- query tests reject reordered/extra pairs, repeated route parameters, literal
  plus, `%20`, uppercase/lowercase escapes, unreserved escapes, double encoding,
  delimiters, empty pairs, unknown parameters, and invalid escapes;
- boundary tests at timestamps `-91`, `-90`, `+90`, and `+91` seconds;
- concurrent replay proving exactly one success, restart persistence, expiry,
  store outage, clock-health failure, and cross-audience rejection;
- key tests for pending, active, retiring, expired, not-yet-valid, revoked,
  unknown, wrong algorithm, duplicate, normal rotation, and emergency revoke;
- proxy tests proving HTTPS/trusted forwarding and raw-target preservation;
- response-cache, CORS, aggregate-field allowlist, redaction, rate-limit, and
  generic-error tests.

## Consequences

The protocol is small enough to implement twice and compare byte for byte. It
remains safe under process restart and concurrent replay, and a key cannot move
between environments or gain another route merely by changing headers.

The trade-off is deliberate rigidity. Unicode query data, request bodies,
additional methods or paths, and a general third-party signing ecosystem are
outside v1. If those become necessary, prefer adopting RFC 9421 with a mature
interoperable library or define a reviewed `PA-ADMIN-SIG-2`; do not loosen v1 in
place.

## References

- [RFC 8032 — EdDSA and Ed25519](https://www.rfc-editor.org/rfc/rfc8032.html)
- [RFC 4648 — Base64url encoding](https://www.rfc-editor.org/rfc/rfc4648.html)
- [RFC 3986 — URI generic syntax](https://www.rfc-editor.org/rfc/rfc3986.html)
- [RFC 9421 — HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421.html)
- [Node.js Crypto — `sign` and `verify`](https://nodejs.org/api/crypto.html)
