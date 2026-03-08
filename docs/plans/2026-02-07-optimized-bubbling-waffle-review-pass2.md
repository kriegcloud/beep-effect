# Review Pass 2: optimized-bubbling-waffle

## Scope

Second review pass of:

- `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md`

Compared against:

- `docs/research-synthesis.md`
- `docs/rlm_research.md`
- Current local APIs and runtime code under `src/`

This pass reports only remaining issues after the plan's "Review Findings Addressed" updates.

## Remaining findings (ordered by severity)

1. P1: Snippet-level compile gaps remain in `Step 3` / `Step 4`.
   - `OutputValidationError` snippet uses `Data.TaggedClass` without importing `Data`.
   - `RlmToolError` snippet uses `Data.TaggedClass` without importing `Data`.
   - `JSONSchema.make(...)` is referenced but no `JSONSchema` import is shown in the `RlmTool.ts` snippet.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:159`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:214`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:216`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:246`.

2. P1: Tool timeout configurability is inconsistent in the plan.
   - Step text says timeout is configurable via `RlmToolAny.timeoutMs`.
   - `RlmToolAny` interface does not define `timeoutMs`.
   - Scheduler snippet hardcodes `"30 seconds"`.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:222`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:291`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:305`.

3. P1: Typed-output failure mapping is underspecified for JSON parse failures.
   - Plan says `JSON.parse(raw)` then decode schema and map errors to `OutputValidationError`.
   - Unless parse failures are explicitly caught, invalid JSON can escape as an untyped defect instead of `RlmError`.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:184`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:186`.

4. P2: Stream error-channel semantics still diverge from local RLM synthesis guidance.
   - Plan intentionally keeps `stream: Stream<RlmEvent, never>`.
   - Local synthesis recommends `Stream<RlmEvent, RlmError>` and `complete` as a stream fold.
   - This can be valid, but should be recorded as an explicit design deviation (or aligned).
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:23`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:180`, `docs/research-synthesis.md:166`, `docs/research-synthesis.md:171`.

5. P2: Unbounded command queue needs explicit compensating bounds statement.
   - Plan switches to `Queue.unbounded` to avoid producer/consumer deadlock risk.
   - Local research docs emphasize bounded pending work and explicit backpressure.
   - If unbounded is kept, the plan should explicitly document compensating limits (budget caps, frame queue cap, bridge concurrency cap, execution timeouts) and include stress tests proving bounded memory behavior.
   - Refs: `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:68`, `/Users/pooks/.claude/plans/optimized-bubbling-waffle.md:70`, `docs/research-synthesis.md:22`, `docs/rlm_research.md:144`.

## Targeted edits to close this pass

1. In Step 3A and Step 4A, either:
   - Add missing imports (`Data`, `JSONSchema`), or
   - Convert new errors to `Schema.TaggedError` for consistency with `src/RlmError.ts`.

2. Add `timeoutMs?: number` to `RlmToolAny` and use it in scheduler timeout logic.

3. Specify typed-output parsing as fully typed failure handling, e.g.:
   - catch parse errors and wrap as `OutputValidationError`, or
   - use `Schema.parseJson(outputSchema)` decode path and map all failures.

4. Add one explicit note in Key Design Decisions:
   - either "intentional deviation from stream error channel guidance", or
   - update API to `Stream<RlmEvent, RlmError>`.

5. Add one explicit section under Step 0A:
   - "Why unbounded queue remains safe in practice" with concrete numeric/runtime limits and required stress verification.

