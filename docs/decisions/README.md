# Architecture decision records

Important implementation choices will be recorded here as short Architecture
Decision Records (ADRs).

| ADR | Status | Decision |
| --- | --- | --- |
| [ADR-0001](0001-conversation-state-and-retention.md) | Accepted | Use client-carried conversation state and stateless OpenAI requests |
| [ADR-0002](0002-atomic-cost-and-quota-accounting.md) | Accepted | Reserve worst-case provider cost atomically in integer micro-US-dollars |
| [ADR-0003](0003-anonymous-access-and-abuse-controls.md) | Accepted | Use layered, privacy-minimized controls for anonymous access and abuse |
| [ADR-0004](0004-administrative-request-signing.md) | Accepted design | Use a narrow, versioned Ed25519 protocol with atomic replay protection for administrative statistics |

The SSR framework, deployment topology, and matching persistent usage store
should be evaluated together in a later ADR.
