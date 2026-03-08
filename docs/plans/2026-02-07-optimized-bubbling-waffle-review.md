# Review: optimized-bubbling-waffle RLM plan

## Scope

Reviewed:

- `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md`
- `docs/research-synthesis.md`
- `docs/rlm_research.md`
- `isaac-miller-dspy-rlm.md`
- Current runtime implementation in `src/` and tests in `test/`

This review also includes parallel findings from three explorer agents (semantics, infrastructure, API feasibility), then reconciles those with the current codebase.

## Findings (ordered by severity)

1. P0: Tool bridge dispatch cannot work as planned unless `BridgeHandler` is changed.
   - Plan says tool routing happens in scheduler and `BridgeHandler` remains unchanged.
   - Current `BridgeHandler` rejects any method except `llm_query`, so sandbox tool calls fail before scheduler routing.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:224`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:474`, `src/BridgeHandler.ts:23`, `src/BridgeHandler.ts:24`, `src/BridgeHandler.ts:25`.

2. P1: Bounded command queue can deadlock the scheduler under pressure.
   - Scheduler is the queue consumer and also enqueues follow-up commands.
   - With `Queue.bounded`, `Queue.offer` can suspend; if the scheduler fiber suspends while queue is full, no consumer remains to drain.
   - Plan does not address this infrastructure risk while adding more producers (tool calls + CLI usage).
   - Refs: `src/Runtime.ts:26`, `src/Scheduler.ts:48`, `src/Scheduler.ts:448`, `src/Scheduler.ts:583`, `docs/research-synthesis.md:20`, `docs/research-synthesis.md:21`, `docs/research-synthesis.md:22`.

3. P1: Two plan APIs are non-existent/incompatible and will fail at compile time.
   - `Schema.jsonSchema(...)` is not the API in installed Effect; use `JSONSchema.make(...)`.
   - `resolveBridgeDeferredWithError(...)` is used in the plan but no such helper exists in scheduler.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:197`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:235`, `node_modules/effect/src/JSONSchema.ts:264`, `src/Scheduler.ts:128`, `src/Scheduler.ts:136`.

4. P1: Tool-path lifecycle invariants are underspecified.
   - RLM guidance requires explicit backpressure, one terminal bridge outcome, and cleanup on shutdown.
   - Plan adds forked tool handlers but does not state timeout policy, bounded concurrency policy, or terminal-state guarantees for each tool request.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:224`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:240`, `docs/rlm_research.md:103`, `docs/rlm_research.md:106`, `docs/research-synthesis.md:148`, `docs/research-synthesis.md:151`, `docs/research-synthesis.md:152`.

5. P2: Stream API semantics in the plan stay weaker than local RLM design guidance.
   - Plan keeps `stream: Stream<RlmEvent, never>`.
   - Local synthesis recommends stream-first surface with typed failures (`Stream<RlmEvent, RlmError>`) and `complete` as fold over stream.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:131`, `docs/research-synthesis.md:166`, `docs/research-synthesis.md:171`.

6. P2: CLI section has configuration wiring gaps.
   - `maxIterations`/`maxDepth` are parsed but not applied to `RlmConfig`.
   - The snippet imports `RlmConfig` without using it, which violates repo `noUnusedLocals`.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:377`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:387`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:415`, `tsconfig.json:30`.

7. P2: Security posture updates are missing for public CLI + tool execution.
   - RLM docs in this repo require explicit trust-model statements.
   - Plan adds externally-invokable runtime surface (CLI + tool handlers) without explicit capability statements or operator warnings.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:366`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:488`, `docs/rlm_research.md:114`, `docs/rlm_research.md:118`, `docs/research-synthesis.md:264`.

8. P3: `FINAL(...)` contract should remain quoted-literal for compatibility.
   - Current extractor expects `FINAL(<quoted literal>)`; unquoted object syntax would not parse.
   - Plan currently uses backtick-quoted JSON, which is compatible. Keep that explicit and do not switch to `FINAL({...})`.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:147`, `src/CodeExtractor.ts:1`, `src/CodeExtractor.ts:5`.

## Required plan edits

1. Update tool architecture section so `BridgeHandler` enqueues all methods and scheduler owns method dispatch.
2. Replace `Schema.jsonSchema(...)` with `JSONSchema.make(...)` in `RlmTool` design.
3. Replace `resolveBridgeDeferredWithError(...)` references with `failBridgeDeferred(...)` (or define a real helper).
4. Add explicit tool call invariants: bounded concurrency, per-request timeout, exactly one terminal response, shutdown completion of pending deferreds.
5. Add queue/backpressure policy update for scheduler command ingress to avoid consumer self-suspension deadlock.
6. Decide and document stream contract:
   - Option A: keep `Stream<_, never>` and encode all failures as events intentionally.
   - Option B: align to `Stream<_, RlmError>` and implement `complete` as stream fold.
7. Wire CLI `--max-iterations` and `--max-depth` into a provided `RlmConfig` layer (or remove those flags).
8. Add a threat-model section in this plan (what strict/permissive sandbox guarantees and what they do not).

## Hardened implementation order

1. Correct API assumptions first.
   - BridgeHandler routing behavior.
   - JSON schema generation API.
   - Deferred failure helper references.

2. Infrastructure safety before features.
   - Queue/backpressure policy and tool concurrency bounds.
   - Tool timeout/terminal-state/shutdown guarantees.

3. Feature additions.
   - `RlmTool` module.
   - Typed output validation.
   - Prompt/tool documentation updates.

4. Operator interface.
   - Event renderer.
   - CLI with explicit config wiring.
   - Security/trust messaging in CLI docs/help.

5. Verification.
   - Compile/typecheck.
   - Unit tests for new APIs.
   - Concurrency stress (tool bursts + bridge calls).
   - Shutdown and timeout fault-injection.

