# db-repo-standardization Quick Start

> 5-minute guide to executing this spec.

---

## When This Spec Applies

- [x] Need to standardize repo method signatures (object-in/object-out)?
- [x] Cross-slice refactor affecting 6+ packages?
- [x] Want `S.Class`-compatible Payload/Success types for base CRUD?

If YES to all -> This spec applies. If NO -> Check `specs/README.md` for alternatives.

---

## 1) Understand the Change

Two files define the DbRepo factory:
- **Types**: `packages/shared/domain/src/factories/db-repo.ts` — `BaseRepo` interface
- **Runtime**: `packages/shared/server/src/factories/db-repo.ts` — `makeBaseRepo` function

We are changing:
- All inputs to be objects (e.g., `findById({ id })` instead of `findById(id)`)
- All non-void outputs to wrap results in `{ readonly data: T }`

## 2) Phase-by-Phase Execution

| Phase | What to Do | Time | Handoff Required |
|-------|-----------|------|------------------|
| P1 | Run inventory + research agents | ~15 min | HANDOFF_P2 + P2_ORCHESTRATOR_PROMPT |
| P2 | Design type changes | ~10 min | HANDOFF_P3 + P3_ORCHESTRATOR_PROMPT |
| P3 | Create implementation plan | ~10 min | HANDOFF_P4 + P4_ORCHESTRATOR_PROMPT |
| P4 | Update 2 core factory files, build | ~15 min | HANDOFF_P5 + P5_ORCHESTRATOR_PROMPT |
| P5 | Migrate all consumers (bulk of work) | ~30-60 min | HANDOFF_P6 + P6_ORCHESTRATOR_PROMPT |
| P6 | Run build/check/test/lint | ~10 min | Final REFLECTION_LOG entry |

**CRITICAL**: Each phase MUST produce BOTH handoff documents for the next phase. The phase is NOT complete until they exist. Handoffs MUST include valuable learnings from REFLECTION_LOG.

## 3) Start Execution

Option A: **Sequential** — Follow `MASTER_ORCHESTRATION.md` phase by phase.

Option B: **Handoff-based** — Use `handoffs/P1_ORCHESTRATOR_PROMPT.md` to launch Phase 1.

## 4) Key Commands

```bash
# Build shared packages after core refactor
bun run build --filter @beep/shared-domain
bun run build --filter @beep/shared-server

# Check specific slice
bun run check --filter @beep/iam-server
bun run check --filter @beep/documents-server

# Full verification
bun run build && bun run check && bun run test && bun run lint:fix && bun run lint
```

## 5) Common Gotchas

- `findById` returns `Option<{ data: T }>` — callers using `O.map(opt, model => model.name)` must change to `O.map(opt, ({ data }) => data.name)`
- `flow(baseRepo.insert, ...)` patterns break because return type changed — rewrite as explicit functions
- `insertManyVoid` takes `{ items }` not a bare array
- Turborepo cascading: upstream errors in shared packages cause downstream check failures — fix shared first

## 6) Reference Implementation

`packages/documents/server/src/db/repos/Comment.repo.ts` is the most complex consumer:
- Uses base CRUD via spread (`...baseRepo`)
- Uses `flow(baseRepo.insert, ...)` which will need rewriting
- Has custom methods calling `baseRepo.findById` and `baseRepo.delete`
- Uses `DbRepo.Method` for type-level custom method signatures
