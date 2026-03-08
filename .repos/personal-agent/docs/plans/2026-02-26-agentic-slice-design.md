# Full Agentic Slice Design (Revised)

**Updated:** February 27, 2026  
**Goal:** Enable safe, scalable agentic behavior for the single-agent slice: memory tools + multi-iteration tool loop + loop controls + observability, without breaking governance or replay safety.

---

## 0. Current Status

### Built today
- Single `chat.generateText()` call per turn in [`TurnProcessingWorkflow.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/turn/TurnProcessingWorkflow.ts).
- Safe tool set in [`ToolRegistry.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ai/ToolRegistry.ts): `time_now`, `math_calculate`, `echo_text`.
- Memory persistence/search primitives in [`MemoryPortSqlite.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/MemoryPortSqlite.ts).
- Memory governance wrapper in [`MemoryEntity.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/entities/MemoryEntity.ts).

### Gaps this slice closes
- No recursive tool loop (`finishReason: "tool-calls"` ends the turn today).
- No memory tools exposed via toolkit.
- No max loop depth control in `AgentState`.
- No loop-level stream metadata.

### Pre-existing risk that must be addressed in this slice
- Channel path currently sends `inputTokens: 0` in [`ChannelCore.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ChannelCore.ts), weakening budget enforcement.

---

## 1. Scope and Non-Goals

### In scope (this slice)
1. Add memory tools (`store_memory`, `retrieve_memories`, `forget_memories`) to `SafeToolkit`.
2. Replace single-call model execution with recursive `Effect.suspend` loop.
3. Add loop caps and loop metadata (`iterationsUsed`, `toolCallsTotal`).
4. Add loop observability event(s) that are consistent with current runtime shape.

### Not in scope (next slice)
1. Sub-agent orchestration (`pao:SubAgent`).
2. Task ontology + delegation graph (`pao:Task`, `pao:Goal`).
3. Parallel child-agent fan-out.

Those remain separate because architecture review still marks multi-agent orchestration as low-readiness and not yet modeled.

---

## 2. Memory Tools (Canonical Contracts)

Memory tools must align with current memory storage contracts in [`ports.ts`](/Users/pooks/Dev/personal-agent/packages/domain/src/ports.ts) and [`MemoryPortSqlite.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/MemoryPortSqlite.ts).

### `store_memory`
- **Parameters:**
  - `content: string`
  - `tags?: string[]`
  - `scope?: "SessionScope" | "GlobalScope"` (default `GlobalScope`)
- **Success:** `{ memoryId: string, stored: true }`
- **Mapping:**
  - `tier = "SemanticMemory"`
  - `source = "AgentSource"`
  - `metadataJson = JSON.stringify({ tags })` when tags provided

### `retrieve_memories`
- **Parameters:** `{ query: string, limit?: number }`
- **Success:**
  - `{ memories: Array<{ memoryId, content, metadataJson, createdAt }> }`
- **Notes:**
  - Do not promise `similarity` in v1; current retrieve API does not expose a stable similarity field.

### `forget_memories`
- **Parameters:** `{ memoryIds: string[] }`
- **Success:** `{ forgotten: number }`
- **Important:** handler/backend must support deletion-by-itemIds explicitly (current cutoff-only `MemoryPort` contract needs extension).

### Governance boundary
Tool invocation governance remains in `runGovernedTool` (`InvokeTool`).  
Memory read/write policy governance remains in memory layer (`ReadMemory` / `WriteMemory`) via the memory governance path.

**Design rule:** do not bypass memory governance checks when adding toolkit handlers.

---

## 3. Recursive Tool Loop

### 3.1 Loop pattern

Use stack-safe recursion with `Effect.suspend`:

```ts
interface ToolLoopResult {
  readonly finalResponse: LanguageModel.GenerateTextResponse<any>
  readonly allContentParts: ReadonlyArray<Response.Part.Any>
  readonly iterationsUsed: number
  readonly toolCallsTotal: number
}

const processWithToolLoop = (
  chat: Chat.Chat,
  toolkitBundle: { readonly toolkit: any; readonly handlerLayer: Layer.Layer<any> },
  userPrompt: Prompt.RawInput,
  maxIterations: number
): Effect.Effect<ToolLoopResult, TurnProcessingError> =>
  Effect.suspend(function loop(
    iteration = 0,
    toolCallsTotal = 0,
    allParts: ReadonlyArray<Response.Part.Any> = []
  ): Effect.Effect<ToolLoopResult, TurnProcessingError> {
    if (iteration >= maxIterations) {
      return Effect.succeed(makeMaxIterationsResult(iteration, toolCallsTotal, allParts))
    }

    return chat.generateText({
      prompt: iteration === 0 ? userPrompt : Prompt.empty,
      toolkit: toolkitBundle.toolkit
    }).pipe(
      Effect.provide(toolkitBundle.handlerLayer),
      Effect.flatMap((response) => {
        const mergedParts = [...allParts, ...response.content]
        const callsThisIteration = response.content.filter((p) => p.type === "tool-call").length
        const nextCallsTotal = toolCallsTotal + callsThisIteration

        if (response.finishReason === "tool-calls") {
          return loop(iteration + 1, nextCallsTotal, mergedParts)
        }

        return Effect.succeed({
          finalResponse: response,
          allContentParts: mergedParts,
          iterationsUsed: iteration + 1,
          toolCallsTotal: nextCallsTotal
        })
      })
    )
  })
```

### 3.2 Important correctness rules
- First call must pass actual user prompt (not `undefined`).
- Subsequent calls use `Prompt.empty`; chat history already holds prior exchange.
- Persist/stream should use accumulated `allContentParts`, not only final iteration response.

---

## 4. Replay Safety and Idempotency

Previous assumption that replay is safe due to deterministic LLM behavior is incorrect.

### Required safety model
1. Assume LLM output is non-deterministic between retries.
2. Treat side-effecting tools as at-least-once unless explicit dedupe exists.
3. Add tool idempotency key for side-effecting writes:
   - `idempotencyKey = hash(turnId + iteration + toolName + canonicalInputJson)`
4. Persist and enforce unique key at invocation storage boundary.
5. On duplicate key, return prior output without re-executing side effect.

This is required before enabling recursive loop in production.

---

## 5. Loop Control, Budgets, and Quotas

### Max iterations
- New `AgentState.maxToolIterations` (default `10`).
- Hard cap enforced at loop entry each iteration.

### Token governance
- Fix channel input token estimation bug first (`inputTokens: 0` -> estimated token count).
- Existing pre-loop budget check remains.
- Add per-turn usage accounting from model usage totals in final result (minimum).
- Prefer per-iteration accounting in follow-up hardening if provider usage can be trusted per call.

### Tool quotas
- Keep `checkToolQuota` in `runGovernedTool` before execution.

### Timeout protection
- Add loop wall-clock timeout per turn (e.g., 10-15s default, configurable).

---

## 6. Stream Observability

### 6.1 V1 (this slice, compatible with current runtime)
- Add `iteration.completed` event.
- Add `iterationsUsed` and `toolCallsTotal` to `turn.completed`.
- Runtime can emit these after workflow completion (current post-hoc streaming model).

### 6.2 V2 (future, real-time loop tracing)
- `tool.calls.started` and per-call result events require runtime/workflow streaming refactor.
- Also requires downstream consumer updates (`client`, `tui`, `cli`) and fixture updates.

---

## 7. Integration Surface (Revised)

### Domain / contracts
- [`packages/domain/src/ports.ts`](/Users/pooks/Dev/personal-agent/packages/domain/src/ports.ts): add `maxToolIterations`; extend memory forget contract for item-id deletion.
- [`packages/domain/src/events.ts`](/Users/pooks/Dev/personal-agent/packages/domain/src/events.ts): add loop event and completion metadata.

### Server
- [`packages/server/src/ai/ToolRegistry.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ai/ToolRegistry.ts): memory tools + idempotency-aware execution path.
- [`packages/server/src/turn/TurnProcessingWorkflow.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/turn/TurnProcessingWorkflow.ts): recursive loop + accumulation + metadata.
- [`packages/server/src/turn/TurnProcessingRuntime.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/turn/TurnProcessingRuntime.ts): emit new events.
- [`packages/server/src/persistence/DomainMigrator.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/persistence/DomainMigrator.ts): migrations for `max_tool_iterations`, memory tool definitions, invocation idempotency key.
- [`packages/server/src/entities/AgentEntity.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/entities/AgentEntity.ts): schema parity with `AgentState`.
- [`packages/server/src/ChannelCore.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ChannelCore.ts): token estimation fix.

### Client/UI
- [`packages/client/src/ChatClient.ts`](/Users/pooks/Dev/personal-agent/packages/client/src/ChatClient.ts)
- [`packages/tui/src/hooks/useSendMessage.ts`](/Users/pooks/Dev/personal-agent/packages/tui/src/hooks/useSendMessage.ts)
- [`packages/cli/src/Cli.ts`](/Users/pooks/Dev/personal-agent/packages/cli/src/Cli.ts)

### Tests (minimum)
- Tool registry tests (memory tools + policy outcomes + dedupe).
- Workflow e2e (multi-iteration loop, max iterations, replay dedupe).
- Event consumers/fixtures updates for new event schema.

---

## 8. Product Rollout Recommendation

1. **Phase 0:** Baseline hardening (token accounting + idempotency + schema parity).
2. **Phase 1:** Agentic loop v1 behind feature flag.
3. **Phase 2:** Sub-agent control plane (`SubAgent`, `Task`) as separate milestone.

This keeps the current slice focused and production-safe while preserving a clean path to actor-based sub-agents.
