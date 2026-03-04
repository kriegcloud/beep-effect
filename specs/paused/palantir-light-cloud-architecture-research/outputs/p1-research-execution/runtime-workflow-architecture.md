# Runtime and Workflow Architecture

## Objective

Define runtime composition for RPC/HTTP/MCP services and durable interruptible workflows with replay-safe behavior and auditable execution boundaries [CIT-002][CIT-012][CIT-013][CIT-014].

## Runtime Components

| Component | Responsibility | Evidence |
|---|---|---|
| RPC service runtime | Stream-oriented request handling, resumable sessions, and backpressure-aware handlers | CIT-014, CIT-028 |
| HTTP API runtime | Typed API handling, authz checks, and telemetry emission | CIT-020, CIT-028, CIT-010 |
| MCP runtime | Governed tool-serving endpoint with policy gate and provenance hooks | CIT-008, CIT-014, CIT-010 |
| Workflow engine | Durable state transitions, retries, human/agent interrupts, and resumable execution | CIT-012, CIT-013 |

## Execution Model

1. Ingress request enters HTTP or WebSocket channel.
2. Policy pre-check runs before tool execution or sensitive data access.
3. Runtime dispatches to synchronous handler or Step Functions workflow.
4. Each workflow stage emits provenance + audit markers.
5. Completion or interrupt state is returned with resumable correlation token.

## Failure Handling

- Retry policy: exponential backoff for transient workflow task failures, bounded by per-step retry budget [CIT-012][CIT-013].
- Idempotency strategy: all external side-effecting steps require idempotency keys and dedupe checks at task boundaries [CIT-002][CIT-012].
- Resume token strategy: correlation token binds workflow execution ID + authorization context snapshot + policy model version.

## Streaming Continuity Guarantees

| Guarantee | Mechanism | Evidence |
|---|---|---|
| Reconnect continuity | WebSocket session correlation and workflow execution lookup | CIT-014, CIT-012 |
| Duplicate suppression | Idempotency keys + replay fence on side-effecting steps | CIT-012, CIT-013 |
| Audit linkage | Session and workflow IDs propagated into audit/provenance envelopes | CIT-018, CIT-020 |

## Integration Boundaries

1. Runtime must consume policy-plane precedence model and log decision IDs on every privileged execution path.
2. Workflow engine must persist checkpoint metadata needed for recovery and forensic replay.
3. Collaboration and observability subsystems must receive standardized event envelopes, not ad-hoc payloads.

## Residual Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Cross-runtime state consistency under partial failures | high | Use workflow state as control-plane source of truth for recoverable operations. |
| Long-lived streaming sessions can outlive auth context | high | Enforce periodic authorization revalidation and session lease expiry. |
| Tool execution latency spikes impact user-facing continuity | medium | Separate interactive and background workflow classes with different timeout/retry envelopes. |

## Inference Notes

1. Inference: WebSocket channels are used for continuity semantics; production RPC transport can evolve if it preserves correlation and resume contracts.
2. Inference: durable workflow engine ownership belongs to platform layer even when invocation originates in app-layer services.
