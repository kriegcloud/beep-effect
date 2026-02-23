# db-repo-standardization: Agent Prompts

> Pre-configured prompts for each phase agent delegation.

---

## Reference Implementations

Before delegating, point agents to these representative files:

| File | What It Shows |
|------|---------------|
| `packages/shared/domain/src/factories/db-repo.ts` | Current BaseRepo interface (lines 32-57) |
| `packages/shared/server/src/factories/db-repo.ts` | Current makeBaseRepo (lines 152-326), make factory (lines 333-356) |
| `packages/documents/domain/src/entities/Comment/Comment.repo.ts` | Domain repo contract using `DbRepo.Method` + `DbRepoSuccess` |
| `packages/documents/server/src/db/repos/Comment.repo.ts` | Server repo with base CRUD + custom methods, `flow(baseRepo.insert, ...)` pattern |
| `packages/documents/domain/src/entities/Comment/contracts/ListByDiscussion.contract.ts` | Contract using `S.Class` for Payload/Success (target pattern) |

---

## Phase 1: Inventory & Research

### Prompt 1.1: codebase-researcher — Build Dependency Inventory

```
You are building a complete dependency inventory for the db-repo-standardization refactor.

## Context

The DbRepo factory in `@beep/shared-domain/factories/db-repo` defines a `BaseRepo` interface
with CRUD methods. The runtime implementation lives in `@beep/shared-server/factories/db-repo`.
We are refactoring ALL method signatures:
- Inputs: bare scalar params (findById, delete) become object params `{ id }`
- Outputs: non-void returns get wrapped in `{ readonly data: T }`

## Your Task

Find ALL files affected by this change. Search systematically for:

1. Files importing from `@beep/shared-domain/factories/db-repo` or `@beep/shared-domain/factories`
2. Files importing from `@beep/shared-server/factories/db-repo` or `@beep/shared-server/factories`
3. Files importing `DbRepo` from any path
4. Files calling `.findById(`, `.delete(`, `.insert(`, `.update(`, `.insertVoid(`,
   `.updateVoid(`, `.insertManyVoid(` on repo instances
5. Files referencing `DbRepo.Method`, `DbRepoSuccess`, `BaseRepo` types

For each file, record:
- Full path
- Which repo methods are called/referenced
- Whether it's type-only or runtime
- Vertical slice (shared/iam/documents/calendar/knowledge/comms/customization)

## Output

Write findings to `specs/pending/db-repo-standardization/outputs/inventory.md` with sections:
1. Core Factory Files (the 2 files being modified)
2. Domain Repo Contracts (*.repo.ts in domain packages)
3. Server Repo Implementations (*.repo.ts in server packages)
4. Service/Handler Call Sites
5. Test Files
6. Summary Statistics (total files per category)
```

### Prompt 1.2: mcp-researcher — Effect API Research

```
You are researching Effect APIs needed for the db-repo-standardization refactor.

## Context

We need to understand how wrapping SqlSchema results affects types and encoding.

Current implementation uses:
- `SqlSchema.single({ Request, Result, execute })` — returns `Effect<Model["Type"], ...>`
- `SqlSchema.findOne({ Request, Result, execute })` — returns `Effect<Option<Model["Type"]>, ...>`
- `SqlSchema.void({ Request, execute })` — returns `Effect<void, ...>`

We want to wrap non-void returns in `{ readonly data: T }`.

## Research Tasks

1. Look up `@effect/sql/SqlSchema` — `single`, `findOne`, `void`, `findAll` signatures
   - Use effect_docs MCP tool to search for SqlSchema documentation
   - Also explore `.repos/effect/packages/sql/src/SqlSchema.ts`

2. Look up `@effect/sql/Model` — `M.Any` type, model type accessors
   - Explore `.repos/effect/packages/sql/src/Model.ts`

3. Look up `effect/Schema` — `S.Struct.Context` type behavior
   - Use effect_docs to search for Schema.Struct.Context
   - Question: What does `S.Struct.Context<{ readonly data: Model["Type"] }>` resolve to?

4. Look up `S.Class` usage patterns
   - How to define opaque Payload/Success classes
   - How they compose with repo method signatures

5. Check if `Option.map` preserves the wrapper correctly:
   - `O.map(option, model => ({ data: model }))` — is this the right approach?

## Output

Write findings to `specs/pending/db-repo-standardization/outputs/effect-research.md` with:
1. SqlSchema API signatures and return types
2. Model type accessor analysis
3. Schema.Struct.Context resolution
4. S.Class composition patterns
5. Recommended wrapping approach (Effect.map vs schema transform)
6. Code examples for each pattern
```

---

## Phase 2: Design

### Prompt 2.1: effect-expert — Design Type Changes

```
You are designing the type changes for the db-repo-standardization refactor.

## Context

Read these files for full context:
- `specs/pending/db-repo-standardization/README.md` — problem statement and target signatures
- `specs/pending/db-repo-standardization/outputs/inventory.md` — all affected files
- `specs/pending/db-repo-standardization/outputs/effect-research.md` — Effect API research
- `packages/shared/domain/src/factories/db-repo.ts` — current domain types
- `packages/shared/server/src/factories/db-repo.ts` — current runtime implementation

## Your Task

Design the complete set of type changes:

1. **Finalized `BaseRepo` interface** — write the exact TypeScript interface
2. **`Method` type analysis** — does `DbRepo.Method` need changes? It returns `S.Schema.Type<Spec["success"]>`.
   If a contract's Success already includes `{ data }`, Method auto-adapts. Confirm this.
3. **Runtime `makeBaseRepo` changes** — write the implementation approach:
   - How to wrap `SqlSchema.single` results: `Effect.map(result, data => ({ data }))`
   - How to wrap `SqlSchema.findOne` results: `Effect.map(result, O.map(data => ({ data })))`
   - How to unwrap `findById`/`delete` inputs: destructure `{ id }` then pass `id` to schema
   - How to unwrap `insertManyVoid` inputs: destructure `{ items }` then pass `items` to schema
4. **Context propagation** — analyze what `S.Struct.Context<{ readonly data: Model["Type"] }>` resolves to
5. **Migration order** — list changes in order to minimize intermediate breakage

## Design Constraints

- `insert`/`update`/`insertVoid`/`updateVoid`: parameter renamed to `payload`, same type
- `findById`: input becomes `payload: { readonly id: ScalarType }`
- `delete`: input becomes `payload: { readonly id: ScalarType }`
- `insertManyVoid`: input becomes `payload: { readonly items: NonEmptyArray<InsertType> }`
- Non-void returns wrap in `{ readonly data: T }`
- `findById` returns `Option<{ readonly data: T }>`, NOT `{ data: Option<T> }`

## Output

Write design to `specs/pending/db-repo-standardization/outputs/design.md` with:
1. Final BaseRepo interface (full TypeScript)
2. Method type analysis (change or no-change with rationale)
3. makeBaseRepo implementation strategy
4. Context propagation analysis
5. Ordered migration steps
```

---

## Phase 4: Core Refactor

### Prompt 4.1: effect-code-writer — Update Domain Types

```
You are implementing the core type changes for the db-repo-standardization refactor.

## Context

Read these files:
- `specs/pending/db-repo-standardization/outputs/design.md` — finalized design
- `packages/shared/domain/src/factories/db-repo.ts` — file to modify

## Your Task

Update `packages/shared/domain/src/factories/db-repo.ts` with the new `BaseRepo` interface
as specified in the design document.

Key changes:
1. Rename all method parameters to `payload`
2. `findById` input: `payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }`
3. `delete` input: `payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }`
4. `insertManyVoid` input: `payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }`
5. `insert` output: `{ readonly data: Model["Type"] }`
6. `update` output: `{ readonly data: Model["Type"] }`
7. `findById` output: `O.Option<{ readonly data: Model["Type"] }>`

Preserve all JSDoc comments and module-level documentation.
Do NOT change `Method`, `MethodSpec`, `MethodError`, `MethodContext`, `DbRepoSuccess`, or `DbRepo` types unless required by the design.
```

### Prompt 4.2: effect-code-writer — Update Runtime Implementation

```
You are implementing the runtime changes for the db-repo-standardization refactor.

## Context

Read these files:
- `specs/pending/db-repo-standardization/outputs/design.md` — finalized design
- `packages/shared/server/src/factories/db-repo.ts` — file to modify
- `packages/shared/domain/src/factories/db-repo.ts` — updated interface (already modified)

## Your Task

Update `packages/shared/server/src/factories/db-repo.ts` to match the new `BaseRepo` interface.

Changes to `makeBaseRepo`:

1. **insert**: Rename param to `payload`, wrap result:
   ```ts
   const insert = (payload: Model["insert"]["Type"]) =>
     insertSchema(payload).pipe(
       Effect.map(data => ({ data })),
       Effect.mapError(DatabaseError.$match),
       Effect.withSpan(...)
     );
   ```

2. **insertVoid**: Rename param to `payload`

3. **update**: Rename param to `payload`, wrap result:
   ```ts
   const update = (payload: Model["update"]["Type"]) =>
     updateSchema(payload).pipe(
       Effect.map(data => ({ data })),
       ...
     );
   ```

4. **updateVoid**: Rename param to `payload`

5. **findById**: Accept `{ id }`, wrap option:
   ```ts
   const findById = (payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }) =>
     findByIdSchema(payload.id).pipe(
       Effect.map(O.map(data => ({ data }))),
       Effect.mapError(DatabaseError.$match),
       Effect.withSpan(..., { attributes: { id: payload.id } })
     );
   ```

6. **delete**: Accept `{ id }`, destructure:
   ```ts
   const delete_ = (payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }) =>
     deleteSchema(payload.id).pipe(
       Effect.mapError(DatabaseError.$match),
       Effect.withSpan(..., { attributes: { id: payload.id } })
     );
   ```

7. **insertManyVoid**: Accept `{ items }`, pass items to schema:
   ```ts
   const insertManyVoid = (payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }) =>
     insertManyVoidSchema(payload.items).pipe(
       ...
     );
   ```

Update span attributes to use new parameter shapes. Preserve all error mapping.
```

---

## Phase 5: Consumer Migration

### Prompt 5.x: effect-code-writer — Update Slice Repos

```
You are migrating repository consumers for the db-repo-standardization refactor.

## Context

Read:
- `specs/pending/db-repo-standardization/outputs/inventory.md` — file inventory
- `specs/pending/db-repo-standardization/outputs/implementation-plan.md` — ordered plan
- The current state of `packages/shared/domain/src/factories/db-repo.ts` (updated interface)

## Changes Summary

The `BaseRepo` interface changed:
- `findById(id)` -> `findById({ id })` — returns `Option<{ data }>` instead of `Option<Model>`
- `delete(id)` -> `delete({ id })`
- `insert(insert)` -> returns `{ data }` instead of bare model
- `update(update)` -> returns `{ data }` instead of bare model
- `insertManyVoid(items)` -> `insertManyVoid({ items })`
- All params renamed to `payload`

## Your Task

For the [SLICE_NAME] vertical slice, update all files listed in the inventory.

Common patterns to update:

1. `baseRepo.findById(someId)` -> `baseRepo.findById({ id: someId })`
2. `baseRepo.delete(someId)` -> `baseRepo.delete({ id: someId })`
3. `const result = yield* repo.insert(data)` -> `const { data: result } = yield* repo.insert(data)` or `const { data } = yield* repo.insert(data)`
4. `const result = yield* repo.update(data)` -> `const { data: result } = yield* repo.update(data)`
5. `baseRepo.insertManyVoid(items)` -> `baseRepo.insertManyVoid({ items })`
6. `O.map(option, model => ...)` on findById results -> `O.map(option, ({ data }) => ...)` or `O.map(option, wrapped => wrapped.data)`
7. `flow(baseRepo.insert, ...)` patterns need adjustment for the new return shape

After updating each file, verify with:
```bash
bun run check --filter @beep/[slice]-server
```
```
