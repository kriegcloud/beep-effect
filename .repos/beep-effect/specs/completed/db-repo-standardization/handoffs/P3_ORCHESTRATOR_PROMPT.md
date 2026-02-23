# Phase 3: Implementation Planning — Orchestrator Prompt

> Copy-paste this prompt to launch Phase 3.

---

## Prompt

You are implementing Phase 3 of the `db-repo-standardization` spec. This phase produces an implementation plan — NO code changes.

### Context

Phase 2 produced a comprehensive design document at `outputs/design.md`. The design is finalized with 6 documented decisions (D-01 through D-06), 10 consumer migration patterns (A through J), and a 9-step migration order.

Key design decisions:
- `Effect.map((data) => ({ data }) as const)` for wrapping non-void returns
- `Effect.map(O.map((data) => ({ data }) as const))` for findById Option wrapping
- `flow(baseRepo.insert, ...)` patterns propagate `{ data }` wrapper to callers (D-03)
- Handlers unwrap `{ data }` before returning to RPC layer (D-04)
- SplitService uses explicit `O.match` with destructuring (D-05)
- `DbRepo.Method` does NOT change

Migration scope: 38/46 repos auto-update. Only 17 files need manual changes.

### Your Mission

**Task: Create Implementation Plan** — Produce `outputs/implementation-plan.md`.

The plan should organize work into discrete Work Units (WUs) that can be assigned to agents:

#### Phase 4 Work Units (Atomic — single effect-code-writer agent)

**WU-1: Update domain types**
- File: `packages/shared/domain/src/factories/db-repo.ts`
- Change: Replace `BaseRepo` interface (lines 32-57) with finalized interface from design Section 1
- Agent: `effect-code-writer`
- Verify: `tsc --noEmit -p packages/shared/domain/tsconfig.json` (will fail — expected, types don't match runtime yet)

**WU-2: Update runtime implementation**
- File: `packages/shared/server/src/factories/db-repo.ts`
- Change: Update `makeBaseRepo` function (lines 152-326) per design Section 3
- Agent: `effect-code-writer`
- Verify: `bun run check --filter @beep/shared-server` (may have downstream failures)

WU-1 and WU-2 MUST execute atomically before any consumer migration.

#### Phase 5 Work Units (Parallelizable — multiple effect-code-writer agents)

**WU-3: Documents server repos** (5 files)
- `Comment.repo.ts`, `Document.repo.ts`, `Discussion.repo.ts`, `DocumentFile.repo.ts`, `DocumentVersion.repo.ts`
- Patterns: A (findById+O.match), B (flow propagation), D (update unwrap), E (delete object input)
- Agent: `effect-code-writer`
- Verify: `bun run check --filter @beep/documents-server`

**WU-4: Documents handlers** (3 files, depends on WU-3)
- `Comment.handlers.ts`, `Document.handlers.ts`, `Discussion.handlers.ts`
- Patterns: C (insert unwrap), J (handler return value unwrapping)
- Agent: `effect-code-writer`
- Verify: `bun run check --filter @beep/documents-server`

**WU-5: Knowledge service call sites** (5 files)
- `SplitService.ts`, `MergeHistoryLive.ts`, `CrossBatchEntityResolver.ts`, `EmbeddingService.ts`, `generate.ts`
- Patterns: A (findById), C (insert unwrap), F (insertVoid), H (SplitService Option-as-Effect)
- Agent: `effect-code-writer`
- Verify: `bun run check --filter @beep/knowledge-server`

**WU-6: Shared server handler** (1 file)
- `create-folder.ts`
- Pattern: C (insert unwrap)
- Agent: `effect-code-writer`
- Verify: `bun run check --filter @beep/shared-server`

**WU-7: Test files** (3 files)
- `AccountRepo.test.ts` (~100+ calls), `CrossBatchEntityResolver.test.ts` (mock stubs), `DatabaseError.test.ts` (~15 calls)
- Patterns: A (findById), C (insert unwrap), E (delete), I (mock stubs)
- Agent: `effect-code-writer`
- Verify: `bun run test --filter @beep/db-admin && bun run test --filter @beep/knowledge-server`

**WU-8: Tooling template** (1 file)
- `tooling/cli/src/commands/create-slice/utils/file-generator.ts`
- Change: Update template string for new patterns
- Agent: `effect-code-writer`
- Verify: `bun run check --filter @beep/cli`

#### Phase 6 Work Unit (Gate)

**WU-9: Full verification**
- `bun run lint:fix && bun run check && bun run test && bun run lint`
- Agent: `package-error-fixer` (for any remaining issues)

### Dependency Graph

```
WU-1 → WU-2 → [WU-3, WU-5, WU-6, WU-7, WU-8] (parallel)
                WU-3 → WU-4
                All → WU-9
```

### For Each Work Unit, Include:

1. **Files** — exact paths
2. **Changes** — which patterns from design Section 6 apply
3. **Agent type** — which agent handles it
4. **Verification** — isolated check command
5. **Estimated complexity** — number of change sites
6. **Gotchas** — from design risk assessment and reflection log

### Reference Files

- Design: `specs/pending/db-repo-standardization/outputs/design.md`
- Inventory: `specs/pending/db-repo-standardization/outputs/inventory.md`
- Reflection log: `specs/pending/db-repo-standardization/REFLECTION_LOG.md`
- Agent prompts: `specs/pending/db-repo-standardization/AGENT_PROMPTS.md` (Phase 4/5 prompts)

### Success Criteria

- [ ] `outputs/implementation-plan.md` — ordered work units with all details
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` created (include WU-1 and WU-2 agent prompts)
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt for Phase 4)

### CRITICAL: Phase Completion

Phase 3 is NOT complete until BOTH Phase 4 handoff files exist:
- `handoffs/HANDOFF_P4.md` — include work unit details and agent prompts for core refactor
- `handoffs/P4_ORCHESTRATOR_PROMPT.md` — include design summary and exact file changes

### Handoff Document

Read full context in: `specs/pending/db-repo-standardization/handoffs/HANDOFF_P3.md`
