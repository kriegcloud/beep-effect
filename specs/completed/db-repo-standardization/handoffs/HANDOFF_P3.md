# Phase 3 Handoff: Implementation Planning

**Date**: 2026-02-10
**From**: Phase 2 (Design)
**To**: Phase 3 (Implementation Planning)
**Status**: Ready for execution

---

## Phase 2 Summary

Phase 2 produced a comprehensive design document at `outputs/design.md` covering the complete BaseRepo interface refactoring. All design decisions are finalized with rationale documented in a Decision Log (D-01 through D-06).

### Key Design Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| D-01 | `Effect.map` over Schema transforms | SqlSchema already decodes fully; no schema overhead needed |
| D-02 | `as const` on `{ data }` wrapper | Required for `readonly data` in interface |
| D-03 | Let `flow` patterns propagate wrapper | Keeps repo layer consistent; callers unwrap at boundary |
| D-04 | Handlers unwrap before returning to RPC | Contracts unchanged; handler is the boundary |
| D-05 | SplitService: explicit `O.match` with destructuring | Replaces fragile implicit Option-as-Effect pattern |
| D-06 | DocumentFile.create / DocumentVersion.createSnapshot propagate wrapper | Consistency with D-03 |

### Finalized BaseRepo Interface (Summary)

| Method | Input Change | Output Change |
|--------|-------------|---------------|
| `insert` | param renamed to `payload` | `Model["Type"]` -> `{ readonly data: Model["Type"] }` |
| `insertVoid` | param renamed to `payload` | no change (void) |
| `update` | param renamed to `payload` | `Model["Type"]` -> `{ readonly data: Model["Type"] }` |
| `updateVoid` | param renamed to `payload` | no change (void) |
| `findById` | `id: scalar` -> `payload: { readonly id: scalar }` | `Option<T>` -> `Option<{ readonly data: T }>` |
| `delete` | `id: scalar` -> `payload: { readonly id: scalar }` | no change (void) |
| `insertManyVoid` | `items: array` -> `payload: { readonly items: array }` | no change (void) |

### Migration Scope (from Inventory)

- **Auto-update (no code changes)**: 38 repos (IAM 20, Knowledge 14, Calendar 1, Customization 1, Comms 1, Shared 1)
- **Manual update required**: 17 files total
  - 5 Documents server repos with internal `baseRepo.*` calls
  - 3 Documents handler files
  - 5 Knowledge service files
  - 1 Shared server handler
  - 3 test files (AccountRepo.test.ts ~100+ calls, CrossBatchEntityResolver.test.ts mock stubs, DatabaseError.test.ts ~15 calls)
  - 1 tooling template

---

## Context for Phase 3

### Working Context

- **Current task**: Create an ordered implementation plan with file-level granularity
- **Success criteria**: `outputs/implementation-plan.md` exists with ordered steps, file lists, and verification commands
- **Blocking issues**: None

### Episodic Context

- Phase 2 design defines 9 migration steps; Steps 1-2 are atomic (core types + runtime), Steps 3-8 parallelizable by slice
- 10 consumer migration patterns (A-J) documented in design with before/after code
- SplitService.ts requires careful handling (Pattern H) — most complex single file

### Semantic Context

- Bun + Effect monorepo, strict `check`/`test`/`lint` gates
- `bun run check --filter @beep/pkg` cascades through dependencies
- For isolated checks: `tsc --noEmit -p tsconfig.json`

### Procedural Context

- Design document: `specs/pending/db-repo-standardization/outputs/design.md`
- Inventory: `specs/pending/db-repo-standardization/outputs/inventory.md`
- Research: `specs/pending/db-repo-standardization/outputs/effect-research.md`
- Reflection log: `specs/pending/db-repo-standardization/REFLECTION_LOG.md`

---

## Execution Instructions

### Task 3.1: Create Implementation Plan

The implementation plan should:

1. **Define work units** — Each work unit is a set of files that can be changed atomically (all changes within a unit must be applied together for compilation to succeed)
2. **Order work units** — Based on dependency order and the 9-step migration from design Section 7
3. **Assign agent types** — Which agent type handles each work unit
4. **Include verification commands** — How to verify each work unit in isolation
5. **Estimate scope** — Number of changes per work unit

### Work Unit Structure (from Design)

```
Phase 4 (Atomic — single agent):
  WU-1: Domain types (1 file, 1 interface change)
  WU-2: Runtime implementation (1 file, 7 method changes)

Phase 5 (Parallelizable — multiple agents):
  WU-3: Documents server repos (5 files)
  WU-4: Documents handlers (3 files)
  WU-5: Knowledge service call sites (5 files)
  WU-6: Shared server handler (1 file)
  WU-7: Test files (3 files)
  WU-8: Tooling template (1 file)

Phase 6 (Gate):
  WU-9: Verification (bun run lint:fix, check, test, lint)
```

### Key Constraints

- WU-1 and WU-2 must execute before all others (they establish the new interface)
- WU-4 depends on WU-3 (handlers depend on repo method return types)
- WU-3 through WU-8 are otherwise parallelizable
- Each work unit should include its own isolated verification step

### Consumer Migration Patterns Reference

The design documents 10 patterns (A through J). Key patterns for Phase 3 planning:

- **Pattern A**: findById + O.match — affects 6 files
- **Pattern B**: flow(baseRepo.insert, ...) — affects 2 files, return type shifts silently
- **Pattern C**: yield* repo.insert — affects 8 files
- **Pattern D**: yield* baseRepo.update — affects 9 calls across 3 files
- **Pattern E**: baseRepo.delete(id) -> baseRepo.delete({ id }) — affects 5 files
- **Pattern H**: SplitService Option-as-Effect yield — most complex, 1 file
- **Pattern I**: Test mock stubs — 1 file
- **Pattern J**: Handler return value unwrapping — 3 files

---

## Phase Completion Requirements

Phase 3 is complete when ALL of:
- [ ] `outputs/implementation-plan.md` exists with ordered work units
- [ ] Each work unit specifies: files, changes, agent type, verification command
- [ ] Dependencies between work units are explicit
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` created
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

### Context Compression Strategy for P4 Handoff

When creating HANDOFF_P4.md, compress Phase 3 findings:
- Include the ordered work unit list with file counts only
- Link to `outputs/implementation-plan.md` for full details
- Include the exact agent prompts for Phase 4 work units (WU-1, WU-2)
