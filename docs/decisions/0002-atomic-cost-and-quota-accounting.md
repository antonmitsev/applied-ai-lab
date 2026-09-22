# ADR-0002 — Atomic Cost and Quota Accounting

| Field | Value |
| --- | --- |
| Status | Accepted |
| Date | 2026-09-22 |
| Decision owner | Anton Mitsev |
| Audit finding | `AUD-P1-004` |
| Applies to | Plumbing Assistant MVP |

## Context

The public assistant has no registration and the repository owner pays provider
costs. Request counts, tokens, images, and retrieval calls do not have equal
cost, so the invariant `per-visitor allowance <= global allowance / 20` needs one
canonical unit. A read-then-call-then-write implementation would allow concurrent
requests to pass the same budget check and overspend before usage is recorded.

Exact production limits cannot be selected responsibly until WP-03 benchmarks
representative conversations. The enforcement algorithm and accounting semantics
can be fixed before those values are known.

## Decision

Use integer **micro-US-dollars** (`micro_usd`, one million units per USD) as the
canonical cost unit. All limits, reservations, charges, and estimates use signed
64-bit integers or a database integer type that safely covers configured values.
No floating-point value participates in an authorization decision.

The usage store atomically reserves the maximum permitted cost of a request
before any provider or paid tool call. Actual usage reconciles the reservation
afterward. Reserved plus charged cost is considered consumed when deciding
whether another request may start.

## Budget hierarchy

Every request must pass all applicable controls:

1. short-window request throttle;
2. maximum concurrent requests for the visitor;
3. per-request input, image, output-token, tool-call, and time limits;
4. visitor daily monetary budget;
5. application daily monetary budget;
6. application circuit breaker;
7. provider-project monthly spend cap as external defense in depth.

The application day is `[00:00:00, 24:00:00)` UTC. The UI may display the
equivalent Sofia time, including daylight-saving changes, but storage keys and
authorization calculations use UTC.

The configured invariant is:

```text
visitor_daily_limit_micro_usd <= floor(global_daily_limit_micro_usd / 20)
```

Configuration loading fails if this invariant is false. Therefore ten visitors
each consuming their full allowance can reserve or charge at most 50% of the
global daily budget. This is a cost guarantee, not a request-count approximation.

## Versioned price catalogue

The application owns a versioned price catalogue containing every billable
dimension used by an enabled request path:

- provider and model snapshot;
- uncached, cached, and cache-write input token rates when applicable;
- output token rate, including reasoning tokens according to provider billing;
- image-input rate or conservative image-cost function;
- web-search and file-search call rates;
- vector-store/storage costs that are allocated to the application budget;
- currency, source URL, effective time, checked time, and reviewer.

Rates are stored as integer `micro_usd` per an explicit quantity. Rounding is
always upward at the billable component level. Aliases may not silently change
the price record used by a reservation. A deployment may use only model/tool
combinations present in the active catalogue.

Provider prices must be rechecked before deployment and on a scheduled basis.
When a rate cannot be bounded from the catalogue and hard request limits, that
request path is disabled.

## Worst-case reservation

The reservation calculator uses validated request data and hard API limits:

```text
reserved_cost =
  ceil(max_uncached_input_tokens * uncached_input_rate)
  + ceil(max_cache_write_tokens * cache_write_rate)
  + ceil(max_output_tokens * output_rate)
  + max_image_cost
  + ceil(max_web_search_calls * web_search_rate)
  + ceil(max_file_search_calls * file_search_rate)
  + configured_provider_uncertainty_margin
```

Only terms enabled for the selected request are included. The input estimate
must be produced by a provider-compatible token counter when available or a
documented conservative bound. The hard `max_output_tokens` includes visible and
reasoning output. `max_tool_calls`, per-tool limits, image count/dimensions, and
request timeout are mandatory.

The uncertainty margin is a bounded configuration value for known billing
rounding or delayed price updates; it is not a substitute for an unbounded tool
or missing price.

## Atomic admission algorithm

The authoritative store executes these steps in one transaction or equivalent
atomic operation:

1. determine the current UTC visitor and global windows;
2. read the visitor's active request count and consumed amount;
3. read the global consumed amount and circuit-breaker state;
4. reject if throttling, concurrency, breaker, or storage health fails;
5. calculate the request reservation from the active price-catalogue version;
6. reject if `charged + reserved + new_reservation` exceeds either monetary
   limit;
7. insert a unique pending reservation with visitor hash, amount, price version,
   creation time, deadline, and request correlation ID;
8. increment visitor/global reserved amounts and visitor concurrency;
9. commit;
10. only then issue the provider request.

SQLite uses a write transaction such as `BEGIN IMMEDIATE` with bounded busy
handling. A horizontally scaled or serverless deployment must use a datastore
transaction, compare-and-set, or server-side atomic script providing the same
invariant. Process-local locks are insufficient.

## Reconciliation

When the provider returns authoritative usage, the application calculates actual
cost with the reservation's price-catalogue version and atomically:

- changes the reservation from `pending` to `settled`;
- subtracts the full reserved amount;
- adds actual charged amount;
- decrements concurrency;
- records only content-free usage dimensions and status.

If validation fails before any paid call begins, the reservation is cancelled
and fully released. If the provider request may have been accepted but actual
usage is unknown because of timeout, disconnect, or ambiguous transport failure,
the full reservation is settled as charged. It is not released on an assumption
that no billing occurred.

If observed actual cost exceeds its reservation, the application records an
invariant breach, charges the actual amount, opens the global circuit breaker,
and blocks new provider calls until an administrator reviews the price catalogue
and estimator. The release evaluation requires zero such breaches.

Streaming disconnect does not cancel accounting. If final usage is known, it is
reconciled normally; otherwise the maximum reservation is charged. Automatic
provider retries after a request may have been accepted are disabled unless the
selected API path has a verified idempotency design and the retry shares one
bounded reservation.

## Reservation recovery

Pending reservations have an operational deadline longer than the provider
timeout. A recovery worker claims expired reservations atomically and settles
them at their full amount unless authoritative lower usage is available. It also
decrements concurrency exactly once. Recovery is idempotent and must tolerate a
process crash between provider completion and local settlement.

A reservation is never deleted to repair counters. Counter repair derives totals
from the reservation ledger and records an administrative audit event.

## Circuit breaker

The circuit breaker is authoritative shared state, not a process-local flag. It
opens when:

- the global daily charged plus reserved amount reaches its limit;
- quota storage is unavailable or inconsistent;
- a reservation invariant is breached;
- the active price catalogue is missing, expired, or incompatible;
- an administrator activates it during an incident.

Opening the breaker blocks admission before retrieval or OpenAI calls. Closing
it requires the configured automatic UTC window rollover or an authenticated,
audited administrative action. It must not erase charges or reservations.

## Minimum ledger fields

The implementation may normalize these fields across tables, but must preserve:

- reservation ID and content-free correlation ID;
- pseudonymous visitor hash;
- UTC visitor/global window IDs;
- state: `pending`, `settled`, or `cancelled`;
- reserved and charged `micro_usd`;
- price-catalogue version;
- bounded token, image, and tool usage counts;
- admitted, deadline, and settled timestamps;
- categorical result/rejection reason;
- recovery and invariant-breach flags.

No prompt, response, image, conversation envelope, raw IP address, or raw browser
fingerprint belongs in the ledger.

## Configuration contract

The following values are required and cannot default silently in production:

- `GLOBAL_DAILY_LIMIT_MICRO_USD`;
- `VISITOR_DAILY_LIMIT_MICRO_USD`;
- `VISITOR_MAX_CONCURRENCY`;
- short-window rate and burst limits;
- input-token, output-token, image, per-tool, total-tool, and timeout limits;
- reservation recovery deadline;
- active price-catalogue version;
- provider project/monthly cap confirmation.

Production startup fails closed when configuration is absent, invalid, unsafe,
or violates the one-twentieth invariant. Development may use explicit local
defaults that cannot be selected in a production environment.

## Metrics and privacy

Expose content-free aggregates for admitted, throttled, quota-rejected,
breaker-rejected, pending, recovered, settled, and invariant-breach requests;
reserved/charged cost; estimated-versus-actual error; tokens; tool calls;
latency; and utilization by budget window.

Use bounded categorical labels. Visitor hashes, request IDs, URLs, model input,
and model output must not appear as metrics labels.

## Verification required before closing AUD-P1-004

1. Unit tests cover integer rounding and every billable dimension.
2. Configuration tests enforce required values and the one-twentieth invariant.
3. Transaction tests prove atomic visitor/global admission.
4. A concurrent load test proves no oversubscription at the final boundary.
5. Crash tests cover every point between reservation and settlement.
6. Timeout, streaming disconnect, retry, storage outage, and price-mismatch tests
   produce the specified conservative charge and breaker behavior.
7. WP-03 supplies measured request caps and monetary limits.
8. The selected deployment datastore passes the same conformance suite.
9. The provider project monthly cap is verified in release evidence.

## Consequences

### Positive

- Different models, tools, images, and token classes share one enforceable unit.
- Concurrent requests cannot spend the same remaining budget.
- Unknown provider outcomes are accounted conservatively.
- The ten-visitor requirement becomes a precise monetary invariant.
- Prices and estimates are auditable and versioned.

### Negative

- Worst-case reservation can reject a request whose eventual cost would have
  fitted the remaining budget.
- Conservative settlement of ambiguous failures may consume budget without a
  user-visible answer.
- The ledger and recovery worker are more complex than request counters.
- Exact limits still require representative measurements in WP-03.

## Alternatives rejected

### Request-count quota

Rejected because requests with images, long output, or retrieval tools can have
materially different cost.

### Check before and charge after

Rejected because concurrent calls can all pass the same non-atomic check.

### Floating-point currency

Rejected because rounding differences can break authorization invariants.

### In-memory counters or append-only logs

Rejected because restarts, multiple processes, and non-atomic updates can lose
or oversubscribe budget.

## References

- [OpenAI Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)
- [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- [OpenAI spend limits](https://developers.openai.com/api/docs/guides/spend-limits)
