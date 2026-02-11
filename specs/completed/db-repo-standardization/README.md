# db-repo-standardization

> Standardize DbRepo factory: all method inputs are objects, all non-void outputs wrap results in `{ readonly data: T }`.

---

## Success Criteria

### Must Have

- [ ] `BaseRepo` interface uses object inputs and `{ readonly data: T }` wrapped non-void outputs
- [ ] `makeBaseRepo` runtime implementation matches new interface exactly
- [ ] ALL consumer repositories updated (domain contracts + server implementations)
- [ ] ALL call sites updated (services, handlers, test files)
- [ ] `bun run build` passes (zero new failures)
- [ ] `bun run check` passes (zero new failures; pre-existing documented separately)
- [ ] `bun run test` passes (zero new failures; pre-existing documented separately)
- [ ] `bun run lint:fix && bun run lint` passes
- [ ] Each phase creates BOTH handoff documents for the next phase before completion

### Nice to Have

- [ ] Pre-existing test/check failures documented in `outputs/pre-existing-failures.md`
- [ ] Reflection log contains entries for every phase executed

---

## Problem Statement

The current `BaseRepo` interface in `@beep/shared-domain/factories/db-repo` has inconsistent signatures:

1. **Inputs**: `findById` and `delete` accept bare scalars (`id: S.Schema.Type<Model["fields"][Id]>`), while `insert`/`update` accept model objects. This prevents using `S.Class` schemas as Payload types for base CRUD methods.
2. **Outputs**: `insert` and `update` return bare `Model["Type"]`, while `findById` returns `Option<Model["Type"]>`. There is no uniform `{ data: T }` wrapper, making it impossible to define a single `S.Class` Success schema reusable across contracts (RPC, HTTP, AI tools).

The runtime implementation in `@beep/shared-server/factories/db-repo` mirrors these inconsistencies.

### Why This Matters

Entity contracts (`entities/<Entity>/contracts/*.contract.ts`) use `S.Class` for Payload and Success schemas. These opaque types are used as types directly (`Payload`, `Success`) without needing `typeof X.Type` or `S.Schema.Type<typeof X>`. If base repo methods had consistent object-in/object-out signatures, domain repos could reuse contract schemas directly as repo method types via `DbRepo.Method<{ payload: typeof Contract.Payload; success: typeof Contract.Success }>`.

---

## Scope

### In Scope

- Refactor `BaseRepo` interface (domain types): wrap bare scalar inputs in objects, wrap non-void outputs in `{ readonly data: T }`
- Refactor `makeBaseRepo` function (server implementation): match new signatures
- Update `DbRepo.Method` type if needed for consistency with new `BaseRepo`
- Update ALL consumer repositories across ALL vertical slices
- Update ALL call sites that invoke repo methods (services, handlers, tests)
- Ensure all quality gates pass: `build`, `check`, `test`, `lint:fix`, `lint`

### Out of Scope (Explicit Non-Goals)

- **NOT changing the `DbRepo.make` factory API** — `make(idSchema, model, maker?)` stays identical
- **NOT adding new CRUD methods** — only reshaping existing method signatures
- **NOT changing entity models or table schemas** — data layer untouched
- **NOT modifying contract schemas** — these are the _target_ consumers, not things being changed
- **NOT adding pagination, filtering, or query capabilities** to base CRUD methods
- **NOT changing error types** — `DatabaseError` remains the sole error channel for base methods

---

## Target Signatures

### BaseRepo (After)

```typescript
export interface BaseRepo<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> {
  readonly insert: (
    payload: Model["insert"]["Type"]
  ) => Effect.Effect<
    { readonly data: Model["Type"] },
    DatabaseError,
    Model["Context"] | Model["insert"]["Context"]
  >;

  readonly insertVoid: (
    payload: Model["insert"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;

  readonly update: (
    payload: Model["update"]["Type"]
  ) => Effect.Effect<
    { readonly data: Model["Type"] },
    DatabaseError,
    Model["Context"] | Model["update"]["Context"]
  >;

  readonly updateVoid: (
    payload: Model["update"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]>;

  readonly findById: (
    payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
  ) => Effect.Effect<
    O.Option<{ readonly data: Model["Type"] }>,
    DatabaseError,
    Model["Context"] | S.Schema.Context<Model["fields"][Id]>
  >;

  readonly delete: (
    payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
  ) => Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>>;

  readonly insertManyVoid: (
    payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;
}
```

### Key Changes Summary

| Method | Input Change | Output Change |
|--------|-------------|---------------|
| `insert` | parameter renamed `insert` -> `payload` (same type) | `Model["Type"]` -> `{ readonly data: Model["Type"] }` |
| `insertVoid` | parameter renamed `insert` -> `payload` (same type) | no change (void) |
| `update` | parameter renamed `update` -> `payload` (same type) | `Model["Type"]` -> `{ readonly data: Model["Type"] }` |
| `updateVoid` | parameter renamed `update` -> `payload` (same type) | no change (void) |
| `findById` | `id: ScalarType` -> `payload: { readonly id: ScalarType }` | `Option<Model["Type"]>` -> `Option<{ readonly data: Model["Type"] }>` |
| `delete` | `id: ScalarType` -> `payload: { readonly id: ScalarType }` | no change (void) |
| `insertManyVoid` | `insert: NonEmptyArray<...>` -> `payload: { readonly items: NonEmptyArray<...> }` | no change (void) |

### Source Verification

| Interface | Source File | Lines |
|-----------|------------|-------|
| `BaseRepo` (current) | `packages/shared/domain/src/factories/db-repo.ts` | 32-57 |
| `makeBaseRepo` (current) | `packages/shared/server/src/factories/db-repo.ts` | 152-326 |
| `DbRepo.Method` | `packages/shared/domain/src/factories/db-repo.ts` | 196-198 |
| `CommentRepo` (representative consumer) | `packages/documents/server/src/db/repos/Comment.repo.ts` | 19-95 |

---

## Complexity Assessment

```
Phase Count:       6 phases    x 2 = 12
Agent Diversity:   5 agents    x 3 = 15
Cross-Package:     6 slices    x 4 = 24
External Deps:     0           x 3 =  0
Uncertainty:       2 (low)     x 5 = 10
Research Required: 3 (medium)  x 2 =  6
----------------------------------------------
Total Score:                       67 -> Critical
```

**Structure**: Full orchestration with MASTER_ORCHESTRATION.md, AGENT_PROMPTS.md, RUBRICS.md, handoffs.

---

## Phase Overview

| Phase | Focus | Key Agents | Deliverable | Handoff Required |
|-------|-------|------------|-------------|------------------|
| P1 | Inventory & Research | `codebase-researcher`, `mcp-researcher` | `outputs/inventory.md`, `outputs/effect-research.md` | HANDOFF_P2.md + P2_ORCHESTRATOR_PROMPT.md |
| P2 | Design | `effect-expert` | `outputs/design.md` | HANDOFF_P3.md + P3_ORCHESTRATOR_PROMPT.md |
| P3 | Implementation Plan | orchestrator | `outputs/implementation-plan.md` | HANDOFF_P4.md + P4_ORCHESTRATOR_PROMPT.md |
| P4 | Core Refactor | `effect-code-writer` | Updated factory files | HANDOFF_P5.md + P5_ORCHESTRATOR_PROMPT.md |
| P5 | Consumer Migration | `effect-code-writer`, `package-error-fixer` | Updated repos & call sites | HANDOFF_P6.md + P6_ORCHESTRATOR_PROMPT.md |
| P6 | Verification | `package-error-fixer` | All gates green | Final REFLECTION_LOG entry |

**CRITICAL**: Each phase is NOT complete until BOTH handoff documents for the next phase exist. Handoffs MUST incorporate learnings from the REFLECTION_LOG.

---

## Entry Points

- **Start here**: Read this README, then proceed to `MASTER_ORCHESTRATION.md` for full workflow.
- **Phase-by-phase**: Use `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` to launch each phase.

---

## Key Files

| File | Role |
|------|------|
| `packages/shared/domain/src/factories/db-repo.ts` | Domain types (BaseRepo, Method, etc.) |
| `packages/shared/server/src/factories/db-repo.ts` | Runtime implementation (makeBaseRepo, make) |
| `packages/*/domain/src/entities/*/*.repo.ts` | Domain repo contracts per entity |
| `packages/*/server/src/db/repos/*.repo.ts` | Server repo implementations |

---

## Related

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
