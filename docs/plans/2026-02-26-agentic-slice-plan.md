# Full Agentic Slice Implementation Plan (Revised)

**Updated:** February 27, 2026  
**Goal:** Deliver a production-safe single-agent tool loop with memory tools, strong governance boundaries, and observability, while preparing cleanly for sub-agent orchestration in the next slice.

---

## 0. Delivery Strategy

Implement in two phases:

1. **Phase 0: Hardening prerequisites (must pass first)**
- Fix token accounting correctness.
- Add tool invocation idempotency for replay safety.
- Add `maxToolIterations` contract parity across all agent state surfaces.

2. **Phase 1: Agentic loop + memory tools**
- Add memory tools.
- Add recursive loop.
- Add loop metadata events.

**Out of scope:** `SubAgent` and `Task` entities (separate plan).

---

## 1. Task A — Baseline Hardening (Blocker Removal)

### A1. Fix channel input token accounting

**Why:** Current channel path sets `inputTokens: 0`, which weakens budget controls before loop execution.

**Files**
- Modify: [`packages/server/src/ChannelCore.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ChannelCore.ts)
- Test: channel/turn flow tests that depend on budget behavior.

**Implementation**
- Replace hard-coded `inputTokens: 0` with a deterministic estimator over message content + content blocks.
- Keep estimator cheap and deterministic (no model call required).

**Acceptance**
- Budget denial paths trigger when expected for large prompts.

### A2. Add tool invocation idempotency key

**Why:** Recursive loops + workflow retry can duplicate side effects without dedupe.

**Files**
- Modify: [`packages/server/src/ai/ToolRegistry.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ai/ToolRegistry.ts)
- Modify: [`packages/server/src/persistence/DomainMigrator.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/persistence/DomainMigrator.ts)
- Modify: governance persistence path(s) for tool invocation lookup by key.
- Test: tool invocation persistence + replay behavior.

**Implementation**
- Add `idempotency_key` column to `tool_invocations` with unique index.
- Compute key from stable tuple: `(turnId, iteration, toolName, canonicalInputJson)`.
- On duplicate key, return stored output and skip side effect.

**Acceptance**
- Forced replay test shows one durable side effect for repeated invocation attempts.

### A3. Add `maxToolIterations` across all agent state boundaries

**Why:** Contract changes must stay schema-consistent.

**Files**
- Modify: [`packages/domain/src/ports.ts`](/Users/pooks/Dev/personal-agent/packages/domain/src/ports.ts)
- Modify: [`packages/server/src/AgentStatePortSqlite.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/AgentStatePortSqlite.ts)
- Modify: [`packages/server/src/AgentStatePortMemory.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/AgentStatePortMemory.ts) (type parity)
- Modify: [`packages/server/src/entities/AgentEntity.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/entities/AgentEntity.ts)
- Modify: [`packages/server/src/persistence/DomainMigrator.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/persistence/DomainMigrator.ts) (migration)
- Modify: all `makeAgentState` helpers and typed fixtures.

**Implementation notes**
- Add migration: `ALTER TABLE agents ADD COLUMN max_tool_iterations INTEGER NOT NULL DEFAULT 10`.
- Ensure decode/encode and RPC payload schemas include field.
- Update all helper constructors in tests (`ToolRegistry`, `GovernanceRoutes`, `TurnProcessingWorkflow`, `ChatFlow`, `AgentStatePortSqlite`, `AgentEntity`, and any others found by search).

**Acceptance**
- `bun run check` clean after this task alone.

---

## 2. Task B — Memory Tools (Schema + Governance Correctness)

### B1. Add memory tool definitions with canonical output contracts

**Files**
- Modify: [`packages/server/src/ai/ToolRegistry.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/ai/ToolRegistry.ts)
- Test: [`packages/server/test/ToolRegistry.test.ts`](/Users/pooks/Dev/personal-agent/packages/server/test/ToolRegistry.test.ts)

**Tool contracts**
- `store_memory({ content, tags?, scope? }) -> { memoryId, stored }`
- `retrieve_memories({ query, limit? }) -> { memories: [{ memoryId, content, metadataJson, createdAt }] }`
- `forget_memories({ memoryIds }) -> { forgotten }`

**Important**
- Do not expose `similarity` until backed by stable API field.

### B2. Ensure memory policy path is not bypassed

**Files**
- Modify toolkit handler wiring to call memory operation path that enforces `ReadMemory` / `WriteMemory` policy checks.
- Reference path today: [`packages/server/src/entities/MemoryEntity.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/entities/MemoryEntity.ts)

**Implementation options**
1. Preferred: invoke memory operations through `MemoryEntity` boundary.
2. Alternative: extract shared memory governance wrapper service and use it both in entity and toolkit.

**Acceptance**
- Deny/RequireApproval policy behavior for memory tools is test-covered.

### B3. Seed governance tool definitions for new tool names

**Files**
- Modify: [`packages/server/src/persistence/DomainMigrator.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/persistence/DomainMigrator.ts)

**Implementation**
- Add migration to seed `tool_definitions` for `store_memory`, `retrieve_memories`, `forget_memories` with `is_safe_standard = 1` (or policy-intended value).

**Acceptance**
- In Standard mode, memory tools are not rejected as `unknown_tool_definition`.

### B4. Align forget contract with deletion-by-ids behavior

**Why:** Current `MemoryPort.forget` is cutoff-based; memory tool needs id list delete.

**Files**
- Modify: [`packages/domain/src/ports.ts`](/Users/pooks/Dev/personal-agent/packages/domain/src/ports.ts)
- Modify: [`packages/server/src/MemoryPortSqlite.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/MemoryPortSqlite.ts)
- Update callers/tests.

**Implementation**
- Introduce explicit forget filter contract (e.g., `{ cutoffDate?, itemIds?, scope? }`) at port level.
- Remove ambiguous overload logic that treats non-cutoff object as `Instant`.

**Acceptance**
- `forget_memories` deletes exactly provided IDs.

---

## 3. Task C — Recursive Tool Loop

### C1. Implement loop helper with valid prompt semantics

**Files**
- Modify: [`packages/server/src/turn/TurnProcessingWorkflow.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/turn/TurnProcessingWorkflow.ts)

**Implementation**
- Add `processWithToolLoop` using `Effect.suspend`.
- First iteration: `prompt = userPrompt`.
- Later iterations: `prompt = Prompt.empty`.
- Do not use nonexistent helper patterns (`Prompt.addUserMessage`).

### C2. Preserve full multi-iteration content artifacts

**Implementation**
- Accumulate all response parts from all iterations.
- Persist assistant turn using accumulated parts, not just final iteration parts.

**Acceptance**
- e2e test confirms early-iteration `tool.call` / `tool.result` blocks are present in persisted turn and stream output.

### C3. Enforce stop conditions

**Implementation**
- Max iteration cap from `agentState.maxToolIterations` (default 10).
- Loop timeout guard (wall-clock per turn).
- Tool quota checks remain unchanged through `runGovernedTool`.

**Acceptance**
- Test: infinite `tool-calls` model halts at configured cap with graceful assistant output.

---

## 4. Task D — Events and Consumer Compatibility

### D1. Add loop metadata to domain events

**Files**
- Modify: [`packages/domain/src/events.ts`](/Users/pooks/Dev/personal-agent/packages/domain/src/events.ts)

**Changes**
- Add `IterationCompletedEvent`.
- Add `iterationsUsed` and `toolCallsTotal` to `TurnCompletedEvent`.

### D2. Emit loop metadata in runtime

**Files**
- Modify: [`packages/server/src/turn/TurnProcessingRuntime.ts`](/Users/pooks/Dev/personal-agent/packages/server/src/turn/TurnProcessingRuntime.ts)

**Implementation**
- Emit `iteration.completed` event(s) from loop metadata returned by workflow.
- Emit updated `turn.completed` payload fields.

### D3. Update typed consumers and fixtures

**Files (minimum)**
- [`packages/client/src/ChatClient.ts`](/Users/pooks/Dev/personal-agent/packages/client/src/ChatClient.ts)
- [`packages/tui/src/hooks/useSendMessage.ts`](/Users/pooks/Dev/personal-agent/packages/tui/src/hooks/useSendMessage.ts)
- [`packages/cli/src/Cli.ts`](/Users/pooks/Dev/personal-agent/packages/cli/src/Cli.ts)
- [`packages/server/test/ChannelRoutes.e2e.test.ts`](/Users/pooks/Dev/personal-agent/packages/server/test/ChannelRoutes.e2e.test.ts)
- Other test fixtures constructing `TurnStreamEvent`.

**Acceptance**
- Exhaustive switch statements compile.
- SSE fixture tests compile and pass with new required fields.

---

## 5. Task E — Tests (Must-Have Coverage)

### E1. ToolRegistry tests
- Store/retrieve/forget happy path.
- Memory policy deny path.
- Unknown tool definition regression guard.
- Idempotency replay test for side-effecting tool.

### E2. TurnProcessingWorkflow e2e
- Two-iteration loop (`tool-calls` then `stop`).
- Max iterations cap.
- Persisted assistant blocks include early iteration tool artifacts.
- Replay test does not duplicate side effects.

### E3. Runtime/stream tests
- `iteration.completed` emitted.
- `turn.completed` includes `iterationsUsed`, `toolCallsTotal`.
- Client/TUI/CLI handling remains stable.

---

## 6. Verification Checklist

Run in this order:

```bash
bun run check
bun run test -- packages/server/test/ToolRegistry.test.ts
bun run test -- packages/server/test/TurnProcessingWorkflow.e2e.test.ts
bun run test -- packages/server/test/ChannelRoutes.e2e.test.ts
bun run test
bun run lint
```

Expected:
- Zero type errors.
- No replay duplicate side effects in chaos/retry tests.
- No regressions in SSE event decoding/handling.

---

## 7. Rollout Gates (Product)

### Gate 0 (before feature flag on)
- Baseline hardening tasks A1-A3 complete.
- Crash/retry dedupe test green.

### Gate 1 (agentic loop canary)
- Feature flag enabled for small cohort.
- p95 turn latency regression (non-tool turns) < 10%.
- No policy bypass incidents.

### Gate 2 (broader rollout)
- 48h canary stability with no severe regressions.
- Cost/turn and quota metrics within expected envelope.

---

## 8. Next Slice: Sub-Agent Control Plane

After this plan lands, create dedicated plan for:
1. `SubAgent` and `Task` domain types aligned with ontology.
2. Delegation tool (`delegate_task`) with inherited governance/budgets.
3. Correlation IDs (`parentTurnId`, `delegationId`) for full traceability.
4. Bounded fan-out and aggregation semantics.

This keeps single-agent loop hardening and multi-agent orchestration decoupled, reducing release risk.
