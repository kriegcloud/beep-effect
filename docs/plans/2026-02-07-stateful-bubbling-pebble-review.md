# Review: stateful-bubbling-pebble RLM plan

## Scope

Reviewed:

- `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md`
- `/Users/pooks/Dev/recursive-llm/docs/research-synthesis.md`
- `/Users/pooks/Dev/recursive-llm/docs/rlm_research.md`
- `/Users/pooks/Dev/recursive-llm/docs/bookmarks-rlm.md`
- `/Users/pooks/Dev/recursive-llm/isaac-miller-dspy-rlm.md`
- Effect source and APIs under `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/**`
- Local Effect guidance via `effect-solutions`

## Findings (ordered by severity)

1. P0: Request-scoped resources are modeled as global layer services.
   - The plan says budget is created once per root completion and shared only with recursive descendants, but the composition graph wires `BudgetService.Default` and `SandboxBunLive` directly into `RlmLive`.
   - Risk: budget/sandbox state can leak across unrelated top-level completions.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:174`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:299`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:300`.

2. P0: Budget checks are not enforced before LLM calls and are underspecified for recursive bridge calls.
   - Root loop calls `chat.generateText` before `useLlmCall`.
   - Recursion section does not explicitly reserve/consume budget per sub-call path.
   - Risk: overrun `max_llm_calls` under concurrency and recursion.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:220`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:221`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:253`.

3. P0: Sandbox isolation claims are stronger than the design currently guarantees.
   - The plan states no network access permissions, but no enforceable isolation mechanism is specified.
   - Risk: generated code can still access ambient runtime/network/filesystem unless explicitly constrained.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:144`.

4. P1: IPC protocol lacks explicit robustness controls.
   - Protocol does not define frame schema validation, per-request timeout, backpressure, or terminal cleanup semantics.
   - Risk: deadlocks, orphaned calls, or mixed outputs under `Promise.all` bridge activity.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:131`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:132`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:267`.

5. P1: Worker execution model likely does not provide true REPL persistence as written.
   - Executing snippets via `Function` constructor does not automatically persist lexical bindings across invocations.
   - Risk: LLM observes inconsistent variable behavior between iterations.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:149`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:150`.

6. P1: Timeout/finalizer usage is non-idiomatic for current Effect API and loses cause fidelity.
   - `timeoutFail("30 seconds")` is not the documented shape; `timeoutFail` expects `{ duration, onTimeout }`.
   - `acquireRelease` finalizer should use the `Exit` to preserve failure/interrupt context.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:140`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:142`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Effect.ts:5453`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Effect.ts:7158`.

7. P2: `RLM_MAX_OUTPUT_TOKENS` is specified as tokens but truncation logic is string-based in pseudocode.
   - Risk: budget semantics become inconsistent and misleading.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:74`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:242`.

8. P2: Verification matrix is too light for concurrency/sandbox failure modes.
   - Missing explicit stress, fuzz/property, and fault-injection coverage for IPC and budgets.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:355`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:356`, `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:358`.

9. P3: Dependency section is stale.
   - Dependencies are now installed in `package.json`, and include `@effect/ai-google` beyond the plan list.
   - Refs: `/Users/pooks/.claude/plans/stateful-bubbling-pebble.md:347`, `/Users/pooks/Dev/recursive-llm/package.json:18`, `/Users/pooks/Dev/recursive-llm/package.json:20`.

## Refined architecture delta

1. Make request scope explicit.
   - Keep `RlmLive` stateless except factories.
   - Create per-root `RlmRuntime` inside `Rlm.complete` containing:
     - `budgetRef: Ref<Budget>`
     - `llmSemaphore: Semaphore`
     - `events: Queue/PubSub`
     - `completionId`
   - Pass runtime to all recursive calls.

2. Split `Sandbox` into factory + instance.
   - `SandboxFactory.create(): Effect<Sandbox, SandboxError, Scope.Scope>`
   - Each root/sub-call allocates one sandbox via `Effect.scoped`.
   - No sandbox instance shared through a global layer singleton.

3. Harden budget semantics.
   - `consumeIteration` before model generation for every loop turn.
   - `reserveLlmCall` before each LLM request (root and sub-call).
   - `recordUsage` after response using atomic `Ref.modify`.
   - Wrap every LLM call path with shared `Semaphore.withPermits(1)`.

4. Define IPC contract with safety rails.
   - Use typed message schema for every inbound/outbound frame.
   - Include `requestId`, `kind`, `deadlineMs`, `payload`.
   - Add host-side per-request timeout and mandatory completion cleanup.
   - Add max frame size and output truncation before transcript append.

5. Correct timeout/finalizer patterns.
   - Use `Effect.timeoutFail({ duration, onTimeout })` or `timeoutFailCause`.
   - In `acquireRelease`, use finalizer signature `(resource, exit)` and map `exit` into `SandboxError.cause` before kill.

6. Treat security as explicit acceptance criteria, not assumption.
   - Document exactly what is and is not isolated in Bun subprocess mode.
   - If network/fs cannot be fully blocked, state this in API docs and use a stronger sandbox mode for untrusted inputs.

7. Clarify output budgeting.
   - Either rename setting to `RLM_MAX_OUTPUT_CHARS`.
   - Or integrate tokenizer-based truncation and keep token semantics true.

8. Expand observability.
   - Include `completionId`, `parentCallId`, `depth`, `iteration`, and budget snapshot in each event.
   - Emit dedicated events for bridge timeout, parse failure, and child termination reason.

## Evented runtime blueprint (Queue / Mailbox / Stream)

This workload should run as an event-driven state machine, not a recursive call graph with implicit control flow.

### Control-plane primitives

1. Scheduler queue (`Queue.bounded`)
   - `Queue.bounded` suspends producers on overflow and gives deterministic backpressure behavior.
   - Use as the single command ingress for root + sub-call work items.
   - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Queue.ts:424`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Queue.ts:598`.

2. Bridge mailbox per sandbox (`Mailbox.make`)
   - Mailbox supports explicit `end` / `fail` semantics, which cleanly model worker lifecycle and stream termination.
   - Use for sandbox stdout/bridge frame ingestion and controlled shutdown propagation.
   - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Mailbox.ts:61`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Mailbox.ts:101`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Mailbox.ts:245`.

3. Event fanout (`PubSub.bounded`)
   - Publish runtime events once; subscribers consume independently.
   - Keep bounded capacity + explicit strategy to avoid unbounded memory growth.
   - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/PubSub.ts:40`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/PubSub.ts:157`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/PubSub.ts:182`.

4. Public API surface (`Stream`)
   - Primary API should be streaming-first: `Rlm.stream(...)` emits lifecycle + partial answer events.
   - `Rlm.complete(...)` becomes a fold over the stream.
   - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/ai/ai/src/LanguageModel.ts:982`.

### Runtime topology

1. One request-scoped runtime per root call:
   - `commands: Queue.Queue<RlmCommand>` (bounded, backpressure)
   - `events: PubSub.PubSub<RlmEvent>` (bounded)
   - `budget: Ref<Budget>`
   - `llmPermits: Semaphore`
   - `inflight: Map<RequestId, Deferred<Result>>` for bridge correlation

2. A single scheduler fiber pulls `commands` and dispatches:
   - `GenerateStep`
   - `ExecuteCode`
   - `BridgeCall`
   - `SubCall`
   - `Finalize`
   - This enforces deterministic ordering and keeps state transitions centralized.

3. Sandbox worker IO is normalized into mailbox events:
   - Host reader fiber parses worker frames into `Mailbox<BridgeFrame, SandboxError>`.
   - Scheduler consumes parsed frames only (never raw stdout parsing inside business logic).

4. Sub-call orchestration is message-based:
   - `llm_query` enqueues `SubCall` command.
   - Result/timeout/error completes matching `Deferred` and emits event.
   - Parent execution resumes only when matching result arrives.

### Backpressure policy (explicit)

1. Commands queue: `Queue.bounded(1024)` with suspend semantics.
2. Events pubsub: `PubSub.bounded({ capacity: 4096, replay: 0 })`.
3. Mailbox strategy: start with `suspend`; use `dropping` only for non-critical telemetry streams.
4. If queue pressure persists, fail fast with typed overload error rather than silently dropping control-plane work.

### Predictability guarantees

1. Every LLM call must originate from one scheduler command, and must:
   - reserve budget first,
   - acquire semaphore permit,
   - emit start/end event with correlation id.

2. Every bridge request has one terminal outcome:
   - success frame,
   - timeout,
   - worker-failed,
   - runtime-interrupted.

3. Runtime shutdown must:
   - close scheduler intake,
   - fail outstanding deferred bridge requests,
   - end/fail mailboxes,
   - shutdown pubsub/queues.

### Notes

- `Mailbox` is currently marked `@experimental` in Effect, so if you want maximum API stability, keep `Queue` as the default control-plane primitive and confine `Mailbox` usage to clearly isolated stream boundaries.
- The `@effect/ai` internals already use mailbox-driven stream handling in language-model streaming paths, so this architecture aligns with patterns in the local source snapshot.
  - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/ai/ai/src/LanguageModel.ts:849`.

## Refined implementation order

1. Pre-implementation hardening spec.
   - IPC schema, timeout policy, cleanup policy, and sandbox capability statement.

2. Core types and config.
   - Errors, config, prompt builder, extractor.

3. Request runtime.
   - `RlmRuntime` creation and budget primitives.

4. Sandbox factory/instance.
   - Worker lifecycle with finalizer semantics and structured IPC.

5. Event scheduler + bridge command handlers.
   - Introduce command ADT and scheduler fiber.
   - Normalize worker frames into typed mailbox/queue events.

6. REPL loop behavior on top of scheduler.
   - Budget reservation order fixed.
   - Recursive model path explicitly uses shared runtime.

7. Observability.
   - Event payloads and span annotations.

8. Test matrix.
   - Unit tests (extractor/prompt/budget transitions).
   - Scheduler determinism tests (same command trace => same final state).
   - Concurrency stress tests (`Promise.all` subcalls).
   - IPC malformed-frame and timeout fault-injection tests.
   - Integration tests with real provider behind feature flag.

## Immediate edits to make in the original plan

1. Replace global `BudgetService.Default` and `SandboxBunLive` in the composition graph with request-scoped creation wording.
2. Change timeout pseudocode to the current Effect API signature.
3. Add a short threat-model section with explicit sandbox guarantees/limitations.
4. Add a BridgeHandler execution contract (reserve budget, acquire permit, timeout, cleanup).
5. Add an explicit Queue/Mailbox/Stream runtime section with capacities + overflow policy.
6. Update Dependencies section from “to install” to “installed (verified in package.json)”.

## Notes on Effect idioms used for this review

- `Chat` history behavior and internal serialization lock are consistent with this design approach.
  - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/ai/ai/src/Chat.ts:327`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/ai/ai/src/Chat.ts:370`.

- Prefer request-scoped resources with `Effect.acquireRelease` and finalizer `Exit` handling.
  - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Effect.ts:5453`.

- Prefer atomic budget updates via `Ref.modify` and concurrency control via `Semaphore.withPermits`.
  - Ref: `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Ref.ts:108`, `/Users/pooks/Dev/recursive-llm/.reference/effect/packages/effect/src/Effect.ts:11789`.
