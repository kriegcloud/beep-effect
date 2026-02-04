# Agent Workflow Extension - Feasibility Deep Dive

Status: Draft

## Purpose
Evaluate how `@effect/workflow` can power durable agent orchestration for the
Claude Agent SDK wrapper, and outline practical patterns + constraints.

## Source References
- `docs/effect-ecosystem-extensions.md` (AgentWorkflow section)
- `.reference/effect/packages/workflow/README.md`
- `.reference/effect/packages/workflow/src/{Workflow,Activity,DurableQueue,DurableDeferred,DurableClock,WorkflowEngine}.ts`

## Workflow Primer (Key APIs)
- `Workflow.make`: defines a durable workflow with schemas + idempotency key.
- `Workflow.execute / poll / interrupt / resume`: run + manage executions.
- `Activity.make`: encapsulates non-deterministic effects (IO, SDK calls).
  - Activities are executed once (unless retried) and their results are
    recorded by the engine.
  - `Activity.CurrentAttempt` is available for retries.
- `DurableDeferred`: durable wait points for external signals. Supports tokens.
- `DurableQueue`: durable input queue + worker model with `PersistedQueue`.
- `DurableClock.sleep`: durable sleep without resource usage.
- `WorkflowEngine.layerMemory`: in-memory engine for dev/tests.
- `ClusterWorkflowEngine.layer` (from `@effect/cluster`): durable, distributed engine.
- `WorkflowProxy` / `WorkflowProxyServer`: derive RPC/HTTP endpoints.

## Core Semantics to Respect
- Workflow code must be deterministic. Non-deterministic work must be wrapped
  in `Activity`.
- Suspension is explicit: a workflow can pause awaiting `DurableDeferred` or
  `DurableClock`.
- `Workflow.scope` is only closed after workflow completion (not per-activity).
- Activities have their own retry + interrupt handling (see `Activity.retry`).

## Mapping to Agent Orchestration

### 1) Query Execution
**Pattern:** wrap `AgentSdk.query` in an `Activity`.

Why: LLM calls are inherently non-deterministic and must be isolated from
workflow replay.

Possible activity outputs:
- Final `SDKResultSuccess` or normalized result summary.
- Session id / metadata for follow-up steps.

### 2) Streaming Output
Workflow activities return a value, not a stream. For streaming output:
- **Option A:** write stream events into a `DurableQueue` or `EventLog` (external).
  - Workflow activity drains `QueryHandle.stream` and publishes events.
  - Consumers read from the queue/log outside the workflow.
- **Option B:** store stream chunks in durable storage (costly, careful with size).

### 3) Human-in-the-loop / User Input
**Pattern:** use `DurableDeferred` or `DurableQueue`.

Examples:
- Await approval, wait for user prompt, or continue a session based on external input.
- Use `DurableDeferred.token` to allow external services to resume the workflow.

### 4) Multi-step Orchestration
Use workflow control flow to sequence:
- "Plan step" -> "Run agent query (Activity)" -> "Wait for human input" -> "Resume".
- Durable sleeps for cool-downs or budget windows.

### 5) Service Surface Area
- `WorkflowProxy.toRpcGroup` and `toHttpApiGroup` can expose `AgentWorkflow`
  endpoints (execute/discard/resume).

## Feasibility Assessment

### ✅ Practical and High-value
- Durable orchestration across long-running agent sessions.
- Human approval gates and external signals via `DurableDeferred`.
- Deterministic replay of orchestration logic.
- Reusable `Activity` wrappers for `AgentSdk.query` and tool calls.
- Structured observability using workflow spans + logs.

### ⚠️ Constraints / Risks
- **Streaming outputs** are not first-class in workflows; must be externalized.
- **Bun runtime**: `@effect/workflow` is runtime-agnostic, but
  `@effect/cluster` likely leans on Node platform layers (example uses Node
  cluster + Postgres). For Bun-first production:
  - Use `WorkflowEngine.layerMemory` for local/dev.
  - Investigate `WorkflowEngine.makeUnsafe` for a Bun-native engine backed by
    `@effect/sql` or `bun:sqlite`.
  - Or run workflow workers in Node and expose endpoints to Bun services.
- **Large payloads**: avoid storing verbose agent traces inside workflow state.
  Persist in external stores and keep workflow state small.
- **Session management**: workflows should own session lifecycle; make sure
  any long-lived handles are cleaned via `Workflow.scope`.

## Recommended Design Direction

### A) AgentWorkflow Module (Experimental)
Provide helpers to build durable workflows around the SDK:
- `AgentActivity.query`: wraps `AgentSdk.query` inside an `Activity`.
- `AgentWorkflow.runStep`: executes an activity and publishes stream events to
  a `DurableQueue` or `EventLog`.
- `AgentWorkflow.awaitUserInput`: backed by `DurableDeferred` or `DurableQueue`.

### B) Output Streaming Strategy
Pick one of:
1. `DurableQueue` for reliable, backpressured output delivery.
2. `EventLog` for long-lived audit + replay (not necessarily low-latency).
3. Dual-path: `EventLog` for persistence, `PubSub` for low-latency.

### C) Workflow Engine Options
- **Local/dev:** `WorkflowEngine.layerMemory`.
- **Durable:** `ClusterWorkflowEngine.layer` with SQL storage.
- **Bun-first:** evaluate custom engine via `WorkflowEngine.makeUnsafe` if
  cluster transport is Node-only.

## Minimal MVP Outline
1) Add `AgentActivity.query` helper (Activity + AgentSdk query).
2) Add `AgentWorkflow` example: query -> await approval -> query.
3) Provide durable output channel (`DurableQueue`).
4) Document Bun/runtime constraints and recommended deployment patterns.

## Open Questions
- Can we run `@effect/cluster` + `WorkflowProxyServer` reliably on Bun?
- Preferred durable store: Postgres via `@effect/sql`, or `bun:sqlite`?
- Best output streaming channel for production: queue vs event log?
- How do we model session state across workflow steps (SDK session v2 vs v1)?

## Practical Recommendation
Implement an experimental AgentWorkflow with:
- `WorkflowEngine.layerMemory` for first integration.
- Activity-based query execution.
- Durable queues for outputs + deferreds for user input.
Then validate production feasibility with a Node-based workflow worker or a
custom Bun-native engine.
