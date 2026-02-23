# DbRepo Standardization: Phase 2 Design

> Comprehensive type and implementation design for the BaseRepo interface refactoring.
> All method inputs become objects, all non-void outputs wrap results in `{ readonly data: T }`.

---

## 1. Finalized BaseRepo Interface

```typescript
/**
 * Return type for the base repository operations.
 *
 * Changes from current interface:
 * - insert/insertVoid/update/updateVoid: parameter renamed from method-specific name to `payload`
 * - insert/update: return type wrapped in `{ readonly data: Model["Type"] }`
 * - findById: input changed from bare scalar to `{ readonly id: ScalarType }`,
 *   return type changed from `Option<Model["Type"]>` to `Option<{ readonly data: Model["Type"] }>`
 * - delete: input changed from bare scalar to `{ readonly id: ScalarType }`
 * - insertManyVoid: input changed from bare array to `{ readonly items: NonEmptyArray<...> }`
 *
 * @since 0.1.0
 * @category Repo
 */
export interface BaseRepo<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> {
  // --- Write methods (returning data) ---

  readonly insert: (
    payload: Model["insert"]["Type"]                       // renamed from `insert`
  ) => Effect.Effect<
    { readonly data: Model["Type"] },                      // wrapped output
    DatabaseError,
    Model["Context"] | Model["insert"]["Context"]
  >;

  readonly update: (
    payload: Model["update"]["Type"]                       // renamed from `update`
  ) => Effect.Effect<
    { readonly data: Model["Type"] },                      // wrapped output
    DatabaseError,
    Model["Context"] | Model["update"]["Context"]
  >;

  // --- Write methods (void) ---

  readonly insertVoid: (
    payload: Model["insert"]["Type"]                       // renamed from `insert`
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;

  readonly updateVoid: (
    payload: Model["update"]["Type"]                       // renamed from `update`
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]>;

  readonly insertManyVoid: (
    payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }  // object input
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;

  // --- Read methods ---

  readonly findById: (
    payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }  // object input
  ) => Effect.Effect<
    O.Option<{ readonly data: Model["Type"] }>,            // wrapped inside Option
    DatabaseError,
    Model["Context"] | S.Schema.Context<Model["fields"][Id]>
  >;

  // --- Delete methods ---

  readonly delete: (
    payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }  // object input
  ) => Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>>;
}
```

### Unchanged Types

The following types remain identical and require no modifications:

- `DbRepoSuccess<Model, TExtra>` -- composition of `BaseRepo<Model, "id"> & TExtra` (auto-updates)
- `DbRepo<Model, SE, SR, TExtra>` -- the Effect wrapping `DbRepoSuccess` (auto-updates)
- `MethodSpec` -- specification interface for custom methods
- `MethodError<Spec>` -- error channel derivation
- `MethodContext<Spec>` -- context derivation
- `Method<Spec>` -- method signature derivation (see Section 2)

---

## 2. DbRepo.Method Analysis: No Changes Required

```typescript
export type Method<Spec extends MethodSpec> = (
  payload: S.Schema.Type<Spec["payload"]>
) => Effect.Effect<S.Schema.Type<Spec["success"]>, MethodError<Spec>, MethodContext<Spec>>;
```

`Method` derives its return type from `Spec["success"]`, which is defined by consumer contracts (e.g., `typeof ListByDiscussion.Success`). The method return type is `S.Schema.Type<Spec["success"]>`, which resolves to whatever the consumer's Success schema declares.

This is independent of `BaseRepo` changes because:

1. `Method` is used for **custom** repo methods (e.g., `listByDiscussion`, `updateContent`, `hardDelete`), not base CRUD.
2. Base CRUD methods are typed directly by `BaseRepo`, not by `Method`.
3. When contract Success schemas eventually adopt `{ data: ... }` patterns (out of scope), `Method` will auto-adapt.

The `DbRepoSuccess` type composes `BaseRepo<Model, "id"> & TExtra`, so the base CRUD portion of `RepoShape` (used in domain repo contracts like `Comment.repo.ts`) updates automatically when `BaseRepo` changes. The `TExtra` portion (custom methods typed via `Method`) is unaffected.

---

## 3. Runtime makeBaseRepo Implementation Strategy

### 3.1 insert

**Current:**
```typescript
const insert = (
  insert: Model["insert"]["Type"]
): Effect.Effect<Model["Type"], DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertSchema(insert).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.insert`, {
      captureStackTrace: false,
      attributes: summarizeWritePayload("insert", insert),
    })
  );
```

**After:**
```typescript
const insert = (
  payload: Model["insert"]["Type"]
): Effect.Effect<{ readonly data: Model["Type"] }, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertSchema(payload).pipe(
    Effect.map((data) => ({ data }) as const),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.insert`, {
      captureStackTrace: false,
      attributes: summarizeWritePayload("insert", payload),
    })
  );
```

**Changes:** (1) Rename parameter `insert` to `payload`. (2) Add `Effect.map((data) => ({ data }) as const)` after `insertSchema` call. (3) Update return type annotation.

### 3.2 insertVoid

**Current:**
```typescript
const insertVoid = (
  insert: Model["insert"]["Type"]
): Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertVoidSchema(insert).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.insertVoid`, {
      captureStackTrace: false,
      attributes: summarizeWritePayload("insertVoid", insert),
    })
  );
```

**After:**
```typescript
const insertVoid = (
  payload: Model["insert"]["Type"]
): Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertVoidSchema(payload).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.insertVoid`, {
      captureStackTrace: false,
      attributes: summarizeWritePayload("insertVoid", payload),
    })
  );
```

**Changes:** (1) Rename parameter `insert` to `payload`. No output change (void).

### 3.3 update

**Current:**
```typescript
const update = (
  update: Model["update"]["Type"]
): Effect.Effect<Model["Type"], DatabaseError, Model["Context"] | Model["update"]["Context"]> =>
  updateSchema(update).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.update`, {
      captureStackTrace: false,
      attributes: {
        id: isRecord(update) ? toSpanScalar(update[idColumn]) : undefined,
        ...summarizeWritePayload("update", update),
      },
    })
  );
```

**After:**
```typescript
const update = (
  payload: Model["update"]["Type"]
): Effect.Effect<{ readonly data: Model["Type"] }, DatabaseError, Model["Context"] | Model["update"]["Context"]> =>
  updateSchema(payload).pipe(
    Effect.map((data) => ({ data }) as const),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.update`, {
      captureStackTrace: false,
      attributes: {
        id: isRecord(payload) ? toSpanScalar(payload[idColumn]) : undefined,
        ...summarizeWritePayload("update", payload),
      },
    })
  );
```

**Changes:** (1) Rename parameter `update` to `payload`. (2) Add `Effect.map`. (3) Update return type.

### 3.4 updateVoid

**Current:**
```typescript
const updateVoid = (
  update: Model["update"]["Type"]
): Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]> =>
  updateVoidSchema(update).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.updateVoid`, {
      captureStackTrace: false,
      attributes: {
        id: isRecord(update) ? toSpanScalar(update[idColumn]) : undefined,
        ...summarizeWritePayload("updateVoid", update),
      },
    })
  );
```

**After:**
```typescript
const updateVoid = (
  payload: Model["update"]["Type"]
): Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]> =>
  updateVoidSchema(payload).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.updateVoid`, {
      captureStackTrace: false,
      attributes: {
        id: isRecord(payload) ? toSpanScalar(payload[idColumn]) : undefined,
        ...summarizeWritePayload("updateVoid", payload),
      },
    })
  );
```

**Changes:** (1) Rename parameter `update` to `payload`. No output change (void).

### 3.5 findById

**Current:**
```typescript
const findById = (
  id: S.Schema.Type<Model["fields"][Id]>
): Effect.Effect<
  O.Option<Model["Type"]>,
  DatabaseError,
  Model["Context"] | S.Schema.Context<Model["fields"][Id]>
> =>
  findByIdSchema(id).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.findById`, {
      captureStackTrace: false,
      attributes: { id },
    })
  );
```

**After:**
```typescript
const findById = (
  payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
): Effect.Effect<
  O.Option<{ readonly data: Model["Type"] }>,
  DatabaseError,
  Model["Context"] | S.Schema.Context<Model["fields"][Id]>
> =>
  findByIdSchema(payload.id).pipe(
    Effect.map(O.map((data) => ({ data }) as const)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.findById`, {
      captureStackTrace: false,
      attributes: { id: payload.id },
    })
  );
```

**Changes:** (1) Parameter becomes object `{ readonly id }`. (2) Pass `payload.id` to `findByIdSchema`. (3) Add `Effect.map(O.map(...))` for Option wrapping. (4) Span attributes reference `payload.id`. (5) Update return type.

### 3.6 delete

**Current:**
```typescript
const delete_ = (
  id: S.Schema.Type<Model["fields"][Id]>
): Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>> =>
  deleteSchema(id).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.delete`, {
      captureStackTrace: false,
      attributes: { id },
    })
  );
```

**After:**
```typescript
const delete_ = (
  payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
): Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>> =>
  deleteSchema(payload.id).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.delete`, {
      captureStackTrace: false,
      attributes: { id: payload.id },
    })
  );
```

**Changes:** (1) Parameter becomes object `{ readonly id }`. (2) Pass `payload.id` to `deleteSchema`. (3) Span attributes reference `payload.id`. No output change (void).

### 3.7 insertManyVoid

**Current:**
```typescript
const insertManyVoid = (
  insert: A.NonEmptyReadonlyArray<Model["insert"]["Type"]>
): Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertManyVoidSchema(insert).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.insertManyVoid`, {
      captureStackTrace: false,
      attributes: summarizeWritePayload("insertMany", insert),
    })
  );
```

**After:**
```typescript
const insertManyVoid = (
  payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }
): Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertManyVoidSchema(payload.items).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.insertManyVoid`, {
      captureStackTrace: false,
      attributes: summarizeWritePayload("insertMany", payload.items),
    })
  );
```

**Changes:** (1) Parameter becomes object `{ readonly items }`. (2) Pass `payload.items` to `insertManyVoidSchema`. (3) Pass `payload.items` to `summarizeWritePayload`. No output change (void).

### 3.8 MakeBaseRepoEffect Type Alias

The type alias must also update:

```typescript
// BEFORE
type MakeBaseRepoEffect<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> = Effect.Effect<DbRepoTypes.BaseRepo<Model, Id>, never, SqlClient.SqlClient>;
```

No change needed here -- `DbRepoTypes.BaseRepo<Model, Id>` references the domain type which is being updated in place. The alias resolves correctly.

### 3.9 Pipe Chain Ordering

The insertion point for `Effect.map` is **between** the `SqlSchema` call and `Effect.mapError`:

```
SqlSchema.call(payload) -> Effect.map (wrap) -> Effect.mapError -> Effect.withSpan
```

This is the same position in all methods. The `Effect.withSpan` wraps the entire chain, so map/mapError ordering within the pipe is flexible but this ordering is the cleanest: transform success first, then errors, then instrument.

---

## 4. Span Attribute Analysis

### 4.1 insert / insertVoid / update / updateVoid

**Current:** `summarizeWritePayload("insert", insert)` where `insert` is the model data directly.

**After:** `summarizeWritePayload("insert", payload)` where `payload` IS the model data directly.

The parameter is renamed but structurally identical. `summarizeWritePayload` receives the same value shape. No behavioral change.

### 4.2 update / updateVoid (id extraction)

**Current:** `isRecord(update) ? toSpanScalar(update[idColumn]) : undefined`

**After:** `isRecord(payload) ? toSpanScalar(payload[idColumn]) : undefined`

Same value, renamed parameter. No behavioral change.

### 4.3 insertManyVoid

**Current:** `summarizeWritePayload("insertMany", insert)` where `insert` is the `NonEmptyArray`.

**After:** `summarizeWritePayload("insertMany", payload.items)` where `payload.items` is the `NonEmptyArray`.

Must destructure `payload.items` -- passing `payload` directly would create incorrect span attributes because `summarizeWritePayload` would see `{ items: [...] }` as a record with a single key `items`, not the array itself.

### 4.4 findById / delete

**Current:** `{ id }` (bare destructured parameter).

**After:** `{ id: payload.id }` (explicit extraction from object).

Same value in the span attribute. No behavioral change.

---

## 5. Context Propagation Verification

### 5.1 Effect.map introduces no new R

`Effect.map` has signature:
```typescript
Effect.map<A, B>(self: Effect<A, E, R>, f: (a: A) => B): Effect<B, E, R>
```

The `R` (context) channel passes through unchanged. The wrapping function `(data) => ({ data }) as const` is a pure value-level transform with no effectful dependencies.

### 5.2 O.map introduces no new R

`O.map` is a pure function:
```typescript
O.map<A, B>(self: Option<A>, f: (a: A) => B): Option<B>
```

Used inside `Effect.map(O.map(...))`, it adds no context requirements.

### 5.3 Verification

Every method's `R` (context/requirements) channel is unchanged:

| Method | R Before | R After | Change |
|--------|----------|---------|--------|
| insert | `Model["Context"] \| Model["insert"]["Context"]` | Same | None |
| insertVoid | `Model["Context"] \| Model["insert"]["Context"]` | Same | None |
| update | `Model["Context"] \| Model["update"]["Context"]` | Same | None |
| updateVoid | `Model["Context"] \| Model["update"]["Context"]` | Same | None |
| findById | `Model["Context"] \| S.Schema.Context<Model["fields"][Id]>` | Same | None |
| delete | `S.Schema.Context<Model["fields"][Id]>` | Same | None |
| insertManyVoid | `Model["Context"] \| Model["insert"]["Context"]` | Same | None |

No new context requirements are introduced by this refactoring.

---

## 6. Consumer Migration Patterns

### Pattern A: findById + O.match (findByIdOrFail)

**Affected files:** `Comment.repo.ts`, `Document.repo.ts`, `Discussion.repo.ts`, `DocumentFile.repo.ts`, `DocumentVersion.repo.ts`, `SplitService.ts`

**Before:**
```typescript
const findByIdOrFail = (id: EntityId.Type) =>
  baseRepo.findById(id).pipe(
    Effect.flatMap(
      O.match({
        onNone: () => Effect.fail(new NotFoundError({ id })),
        onSome: Effect.succeed,
      })
    )
  );
```

**After:**
```typescript
const findByIdOrFail = (id: EntityId.Type) =>
  baseRepo.findById({ id }).pipe(
    Effect.flatMap(
      O.match({
        onNone: () => Effect.fail(new NotFoundError({ id })),
        onSome: ({ data }) => Effect.succeed(data),
      })
    )
  );
```

**Changes:** (1) `baseRepo.findById(id)` becomes `baseRepo.findById({ id })`. (2) `onSome: Effect.succeed` becomes `onSome: ({ data }) => Effect.succeed(data)`.

**Return type of findByIdOrFail:** Unchanged -- still returns `Effect<Model["Type"], NotFoundError | DatabaseError>`. The unwrap happens inside.

### Pattern B: flow(baseRepo.insert, ...) (create methods)

**Affected files:** `Comment.repo.ts`, `Discussion.repo.ts`

**Before:**
```typescript
const create = flow(baseRepo.insert, Effect.withSpan("CommentRepo.create"));
```

**After (recommended):**
```typescript
const create = flow(baseRepo.insert, Effect.withSpan("CommentRepo.create"));
```

The `flow` composition is unchanged. The return type of `create` **silently shifts** from `Model["Type"]` to `{ readonly data: Model["Type"] }`. This is the designed behavior. All callers of `create` must be audited.

**Callers of `create` that access `.id` on the result:**

In `Discussion.handlers.ts`:
```typescript
// BEFORE
const result = yield* discussionRepo.create(insertData);
return { id: result.id };

// AFTER
const { data: result } = yield* discussionRepo.create(insertData);
return { id: result.id };
```

In `Comment.handlers.ts`:
```typescript
// BEFORE
return yield* repo.create(insertData);

// AFTER -- if handler expects Model["Type"], must unwrap:
const { data } = yield* repo.create(insertData);
return data;
// OR if handler can accept { data: Model["Type"] }, no change needed.
```

**Decision:** The `create` method in `Comment.repo.ts` wraps `baseRepo.insert` via `flow`. Its return type will be `{ readonly data: Model["Type"] }`. The handler `Comment.handlers.ts` returns the result of `repo.create(insertData)` directly. The RPC layer expects `Comment.Model.Type` (the raw model) as the success type. Therefore, handlers must unwrap.

### Pattern C: baseRepo.insert with yield* (direct insert call sites)

**Affected files:** `Document.handlers.ts`, `SplitService.ts`, `CrossBatchEntityResolver.ts`, `MergeHistoryLive.ts`, `create-folder.ts`, `generate.ts (meetingprep)`, `DocumentFile.repo.ts`, `DocumentVersion.repo.ts`

**Before:**
```typescript
const result = yield* entityRepo.insert({ ... });
```

**After:**
```typescript
const { data: result } = yield* entityRepo.insert({ ... });
```

Or when the result is used directly:
```typescript
// BEFORE
return yield* repo.insert(insertData);

// AFTER
const { data } = yield* repo.insert(insertData);
return data;
```

**Specific call sites:**

| File | Current | After |
|------|---------|-------|
| `SplitService.ts:97` | `const newEntity = yield* entityRepo.insert({...})` | `const { data: newEntity } = yield* entityRepo.insert({...})` |
| `SplitService.ts:196` | `yield* entityRepo.insert({...})` | `yield* entityRepo.insert({...})` (return value unused, no change needed) |
| `MergeHistoryLive.ts:28` | `return yield* repo.insert({...})` | `const { data } = yield* repo.insert({...}); return data;` |
| `CrossBatchEntityResolver.ts:106` | `yield* entityRepo.insert({...})` | `yield* entityRepo.insert({...})` (return value unused, no change needed) |
| `create-folder.ts:16` | `return yield* folderRepo.insert({...})` | `const { data } = yield* folderRepo.insert({...}); return data;` |
| `generate.ts:64` | `const bullet = yield* bulletRepo.insert(bulletInsert)` | `const { data: bullet } = yield* bulletRepo.insert(bulletInsert)` |
| `DocumentFile.repo.ts:109` | `return yield* baseRepo.insert(input)` | `return yield* baseRepo.insert(input)` (returns `{ data }`, callers adjust) |
| `DocumentVersion.repo.ts:130` | `return yield* baseRepo.insert(input)` | `return yield* baseRepo.insert(input)` (returns `{ data }`, callers adjust) |

### Pattern D: baseRepo.update with yield* (internal update calls)

**Affected files:** `Document.repo.ts` (6 calls), `Discussion.repo.ts` (2 calls), `Comment.repo.ts` (1 call)

**Before:**
```typescript
return yield* baseRepo.update({ ...doc, isArchived: true });
```

**After:**
```typescript
const { data } = yield* baseRepo.update({ ...doc, isArchived: true });
return data;
```

**Document.repo.ts specific methods (archive, restore, publish, unpublish, lock, unlock):**

All 6 methods follow the same pattern: `findByIdOrFail(id)` then `baseRepo.update({...})`. The `baseRepo.update` return type changes from `Model["Type"]` to `{ readonly data: Model["Type"] }`. Each must destructure.

**Discussion.repo.ts (resolve, unresolve):** Same pattern as Document.repo.ts.

**Comment.repo.ts (updateContent):**
```typescript
// BEFORE
const updateContent = flow(
  (input: typeof Entities.Comment.Model.update.Type) => baseRepo.update({ ...input, isEdited: true }),
  Effect.withSpan("CommentRepo.updateContent")
);

// AFTER -- return type shifts to { data: Model["Type"] }
// Callers that expect raw Model["Type"] must unwrap
```

### Pattern E: baseRepo.delete with bare scalar

**Affected files:** `Comment.repo.ts`, `Document.repo.ts`, `Discussion.repo.ts`, `DocumentFile.repo.ts`, `DocumentVersion.repo.ts`

**Before:**
```typescript
baseRepo.delete(id).pipe(Effect.withSpan("CommentRepo.hardDelete", { attributes: { id } }));
```

**After:**
```typescript
baseRepo.delete({ id }).pipe(Effect.withSpan("CommentRepo.hardDelete", { attributes: { id } }));
```

Single-character change: `(id)` becomes `({ id })`.

### Pattern F: insertVoid (no output change)

**Affected files:** `EmbeddingService.ts`, `generate.ts (meetingprep)`

**Before:**
```typescript
repo.insertVoid({ ... });
```

**After:**
```typescript
repo.insertVoid({ ... });
```

No change needed. The parameter is renamed at the interface level (`insert` to `payload`), but call sites pass the value positionally, not by name. The value type is unchanged.

### Pattern G: insertManyVoid

No current call sites were found in the inventory that call `insertManyVoid` directly (it is defined but not invoked outside tests). Test files will need the object wrapping.

**Before:**
```typescript
repo.insertManyVoid(items);
```

**After:**
```typescript
repo.insertManyVoid({ items });
```

### Pattern H: SplitService O.match on findById

**Affected files:** `SplitService.ts`

The SplitService uses a non-standard pattern for findById error handling:

```typescript
// BEFORE (SplitService.ts:50-58)
const maybeEntity = yield* entityRepo.findById(params.entityId);
const originalEntity = yield* maybeEntity.pipe(
  Effect.mapError(() => new SplitError({ ... }))
);
```

This treats the `Option` as an `Effect` (via `O.match` implicit conversion or `Effect.mapError` on `Option` -- actually this is using `Option` as an Effect since `Option.None` maps to `Effect.fail`). After refactoring:

```typescript
// AFTER
const maybeEntity = yield* entityRepo.findById({ id: params.entityId });
const originalEntity = yield* O.match(maybeEntity, {
  onNone: () => Effect.fail(new SplitError({ ... })),
  onSome: ({ data }) => Effect.succeed(data),
});
```

Wait -- examining the code more carefully: `yield* maybeEntity.pipe(Effect.mapError(...))` only works if `maybeEntity` is an `Effect`, not an `Option`. The `findById` currently returns `Effect<Option<T>, DatabaseError, R>`, so `yield*` resolves the Effect, yielding `Option<T>`. Then `.pipe(Effect.mapError(...))` on an `Option` does not type-check.

Actually, looking again at the actual code:
```typescript
const maybeEntity = yield* entityRepo.findById(params.entityId);
const originalEntity = yield* maybeEntity.pipe(
  Effect.mapError(...)
);
```

The `yield*` on line 50 resolves the Effect and assigns `Option<T>` to `maybeEntity`. Then `maybeEntity.pipe(Effect.mapError(...))` -- since `Option` implements the `Pipeable` protocol, this may work if `Option` is being used as an Effect (Option.some -> Effect.succeed, Option.none -> Effect.fail(NoSuchElementException)). In Effect, `Option` values can be yielded directly in generators where they act as effects.

After the refactoring, `maybeEntity` is `Option<{ readonly data: Model["Type"] }>`. The `.pipe(Effect.mapError(...))` chain needs to unwrap `data`:

```typescript
// AFTER
const maybeEntity = yield* entityRepo.findById({ id: params.entityId });
const originalEntity = yield* maybeEntity.pipe(
  O.map(({ data }) => data),
  Effect.mapError(() => new SplitError({ ... }))
);
```

The same pattern applies for `SplitService.ts:171`:
```typescript
// BEFORE
const sourceEntityExists = yield* entityRepo.findById(historyRecord.sourceEntityId).pipe(Effect.map(O.isSome));

// AFTER
const sourceEntityExists = yield* entityRepo.findById({ id: historyRecord.sourceEntityId }).pipe(Effect.map(O.isSome));
```

Here `O.isSome` only checks presence, so the `{ data }` wrapper inside the Option does not matter. No unwrapping needed.

And for `SplitService.ts:182-189`:
```typescript
// BEFORE
const maybeTargetEntity = yield* entityRepo.findById(historyRecord.targetEntityId);
const targetEntity = yield* O.match(maybeTargetEntity, {
  onNone: () => new SplitError({ ... }),
  onSome: Effect.succeed,
});

// AFTER
const maybeTargetEntity = yield* entityRepo.findById({ id: historyRecord.targetEntityId });
const targetEntity = yield* O.match(maybeTargetEntity, {
  onNone: () => new SplitError({ ... }),
  onSome: ({ data }) => Effect.succeed(data),
});
```

### Pattern I: Test mock stubs

**Affected files:** `CrossBatchEntityResolver.test.ts`

Mock stubs implementing `BaseRepo` interface must match the new signatures. Each stub method must:

1. Accept object inputs for `findById`, `delete`, `insertManyVoid`
2. Return `{ readonly data: ... }` wrappers for `insert`, `update`
3. Return `Option<{ readonly data: ... }>` for `findById`

```typescript
// Mock stub template (after)
const mockBaseRepo = {
  insert: (payload) => Effect.succeed({ data: { id: "mock", ...payload } }),
  insertVoid: (payload) => Effect.void,
  update: (payload) => Effect.succeed({ data: { id: "mock", ...payload } }),
  updateVoid: (payload) => Effect.void,
  findById: (payload) => Effect.succeed(O.some({ data: mockEntity })),
  delete: (payload) => Effect.void,
  insertManyVoid: (payload) => Effect.void,
};
```

### Pattern J: Handler return value propagation

**Critical interaction:** Handlers that return repo results directly to the RPC layer.

**Document.handlers.ts Create handler:**
```typescript
// BEFORE
return yield* repo.insert(insertData);
// Returns Model["Type"] to RPC layer

// AFTER -- repo.insert now returns { data: Model["Type"] }
// Must unwrap before returning to RPC layer
const { data } = yield* repo.insert(insertData);
return data;
```

**Document.handlers.ts Update handler:**
```typescript
// BEFORE
repo.update(payload).pipe(...)
// Returns Model["Type"]

// AFTER
repo.update(payload).pipe(
  Effect.map(({ data }) => data),
  ...
)
```

Note: `repo.update` here is called on `DocumentRepo` which spreads `baseRepo`. The `update` method on `DocumentRepo` IS `baseRepo.update` (no custom wrapper). So its return type changes.

**Document.handlers.ts archive/restore/publish/unpublish/lock/unlock:**

These call `repo.archive(payload.id)`, etc., which are custom methods that call `baseRepo.update` internally. The custom methods `archive`, `restore`, etc. must be updated to unwrap internally (Pattern D), so their return type to handlers stays as `Model["Type"]`.

---

## 7. Migration Order

### Phase 4: Core Refactor (Atomic)

Steps 1-2 MUST be done atomically. After these steps, the codebase will NOT compile -- this is expected.

**Step 1: Update domain types**
- File: `packages/shared/domain/src/factories/db-repo.ts`
- Change: Update `BaseRepo` interface only (lines 32-57)
- No other types in this file change

**Step 2: Update runtime implementation**
- File: `packages/shared/server/src/factories/db-repo.ts`
- Change: Update `makeBaseRepo` function (lines 152-326)
- Apply all 7 method changes from Section 3

### Phase 5: Consumer Migration (Parallelizable by Slice)

After Steps 1-2, compilation breaks everywhere. The following steps repair consumers. Steps 3-8 can be parallelized by slice since no cross-slice dependencies exist between them.

**Step 3: Documents server repos** (5 files)

| File | Changes |
|------|---------|
| `Comment.repo.ts` | `findById(id)` -> `findById({ id })`, `onSome: Effect.succeed` -> `onSome: ({ data }) => Effect.succeed(data)`, `delete(id)` -> `delete({ id })`, `create` return type shifts (no code change, `flow` still works) |
| `Document.repo.ts` | `findById(id)` -> `findById({ id })`, `onSome: Effect.succeed` -> `onSome: ({ data }) => Effect.succeed(data)`, `delete(id)` -> `delete({ id })`, 6x `baseRepo.update({...})` unwrap results |
| `Discussion.repo.ts` | `findById(id)` -> `findById({ id })`, `onSome: Effect.succeed` -> `onSome: ({ data }) => Effect.succeed(data)`, `delete(id)` -> `delete({ id })`, 2x `baseRepo.update({...})` unwrap results, `create` return type shifts |
| `DocumentFile.repo.ts` | `findById(id)` -> `findById({ id })`, `onSome: Effect.succeed` -> `onSome: ({ data }) => Effect.succeed(data)`, `delete(id)` -> `delete({ id })`, `create` unwrap or propagate |
| `DocumentVersion.repo.ts` | `findById(id)` -> `findById({ id })`, `onSome: Effect.succeed` -> `onSome: ({ data }) => Effect.succeed(data)`, `delete(id)` -> `delete({ id })`, `createSnapshot` unwrap or propagate |

**Step 4: Documents handlers** (3 files)

| File | Changes |
|------|---------|
| `Comment.handlers.ts` | Unwrap `repo.create(insertData)` result; `repo.updateContent` result depends on Step 3 |
| `Document.handlers.ts` | Unwrap `repo.insert(insertData)` result; `repo.update(payload)` unwrap; archive/restore/etc. depend on Step 3 internal unwrapping |
| `Discussion.handlers.ts` | Unwrap `discussionRepo.create(insertData)` result (`.id` access); unwrap `commentRepo.create(commentInsertData)` if return used |

**Step 5: Knowledge service call sites** (5 files)

| File | Changes |
|------|---------|
| `SplitService.ts` | 3x `findById(id)` -> `findById({ id })` with data unwrapping; 2x `insert({...})` unwrap; `O.match` patterns update |
| `MergeHistoryLive.ts` | `repo.insert({...})` unwrap result |
| `CrossBatchEntityResolver.ts` | `entityRepo.insert({...})` -- return unused, no unwrap needed |
| `EmbeddingService.ts` | `repo.insertVoid({...})` -- void, no change needed |
| `generate.ts (meetingprep)` | `bulletRepo.insert(bulletInsert)` unwrap result; `evidenceRepo.insertVoid(evidenceInsert)` -- void, no change |

**Step 6: Shared server handlers** (1 file)

| File | Changes |
|------|---------|
| `create-folder.ts` | `folderRepo.insert({...})` unwrap result |

**Step 7: Test files** (3 files)

| File | Scope | Strategy |
|------|-------|----------|
| `AccountRepo.test.ts` | 100+ direct CRUD calls | Bulk mechanical: `findById(id)` -> `findById({ id })`, `delete(id)` -> `delete({ id })`, all `insert`/`update` result access needs `{ data }` destructuring |
| `CrossBatchEntityResolver.test.ts` | Mock stubs implementing `BaseRepo` | Update all mock method signatures per Pattern I |
| `DatabaseError.test.ts` | ~15 `insert` calls testing constraint violations | `insert` result access needs `{ data }` destructuring |

**Step 8: Tooling template** (1 file)

| File | Changes |
|------|---------|
| `file-generator.ts` | Update template string containing `DbRepo.make` boilerplate to reflect new patterns |

### Phase 6: Verification (Gate)

**Step 9: Quality gates**

Run sequentially:
1. `bun run lint:fix` -- auto-fix formatting
2. `bun run check` -- TypeScript compilation across all packages
3. `bun run test` -- all test suites
4. `bun run lint` -- final lint pass

If Step 2 fails, errors indicate missed consumer migrations. Fix in dependency order (upstream packages first).

---

## 8. Risk Assessment

### Low Risk

| Risk | Mitigation |
|------|------------|
| `Effect.map` wrapping is incorrect | Verified in effect-research.md with type signatures |
| Object input destructuring breaks | TypeScript catches all mismatches at compile time |
| Span attributes break | Same values, renamed references -- no behavioral change |
| Context propagation breaks | `Effect.map` and `O.map` are pure, add no R requirements |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| `flow(baseRepo.insert, ...)` silently changes return type | Callers of `CommentRepo.create`, `DiscussionRepo.create`, `DocumentFile.create`, `DocumentVersion.createSnapshot` receive `{ data }` wrapper where they previously received raw model | Audit ALL callers. Handlers that pass result to RPC layer must unwrap. The `flow` itself does NOT need changing -- only its callers. |
| `Document.repo.ts` has 6 `baseRepo.update` calls | Each must destructure result | Mechanical but repetitive -- use find-and-replace |
| `SplitService.ts` uses `Option`-as-`Effect` yield pattern | Need careful refactoring of the `O.map(({data}) => data)` insertion point | Verify with isolated type-check after change |
| `AccountRepo.test.ts` has 100+ calls | Large file, many changes | Mechanical -- search-and-replace patterns. Run test file in isolation after changes. |
| `MergeHistoryLive.ts` uses `repo.insert` result in error mapping chain | Return value feeds into `Effect.mapError` -- must unwrap before error mapping | Straightforward: destructure before the `.pipe` chain |

### Mitigated by Design

| Risk | How Mitigated |
|------|---------------|
| Contract schemas break | Contracts are NOT being changed (explicitly out of scope). RPC/HTTP/Tool definitions remain stable. |
| 38 auto-updating repos break | These use `...baseRepo` spread and expose base CRUD unmodified. New signatures flow through automatically. No code changes needed in these files. |
| Missing a call site | TypeScript compiler catches ALL type mismatches. `bun run check` is the definitive gate. |
| Runtime errors from wrong wrapping | The `as const` assertion on `{ data }` ensures readonly, matching the interface. Structural compatibility is guaranteed. |

### Known Pre-Existing Issues (Not Related to This Refactor)

Per `outputs/pre-existing-failures.md` and agent memory:
- 32 failures in PromptTemplates tests (knowledge-server)
- 2 type errors in TestLayers.ts and GmailExtractionAdapter.test.ts
- These are pre-existing and unrelated to db-repo-standardization

---

## 9. Decision Log

### D-01: Effect.map over Schema Transform

**Decision:** Use `Effect.map((data) => ({ data }) as const)` for output wrapping, not a Schema transform.

**Rationale:** SqlSchema already decodes the result fully. Adding a Schema layer for a structural wrapper adds complexity and context requirements with zero benefit. See `effect-research.md` Section 5.2.

### D-02: `as const` assertion on wrapper

**Decision:** Use `({ data }) as const` to ensure the wrapper is `{ readonly data: T }`.

**Rationale:** Without `as const`, TypeScript infers `{ data: T }` (mutable). The interface specifies `{ readonly data: T }`. The `as const` assertion satisfies the readonly constraint without any runtime cost.

### D-03: Let `flow` patterns propagate wrapper

**Decision:** Do NOT modify `flow(baseRepo.insert, Effect.withSpan(...))` patterns. Let the `{ data }` wrapper propagate to callers.

**Rationale:** The `flow` composition is clean and correct. Adding an unwrap step inside `flow` would create a second pattern for the same operation. Instead, callers that need the raw model destructure `{ data }`. This keeps the repo layer consistent (all non-void methods return wrapped) while callers handle unwrapping at their boundary.

### D-04: Handler unwrapping strategy

**Decision:** Handlers that return repo results to the RPC layer MUST unwrap `{ data }` before returning.

**Rationale:** Contract Success schemas are unchanged (out of scope). They expect `Model["Type"]` (or `Model.json.Type`), not `{ data: Model["Type"] }`. The handler is the boundary between repo and RPC layers, so it handles the shape translation.

### D-05: SplitService Option-as-Effect pattern

**Decision:** Refactor `SplitService.ts` to use explicit `O.match` with data destructuring rather than relying on the implicit `Option`-as-`Effect` yield pattern.

**Rationale:** The implicit pattern is fragile and non-obvious. Explicit `O.match` with `({ data }) => Effect.succeed(data)` is idiomatic, readable, and compatible with the `{ data }` wrapper.

### D-06: DocumentFile.create / DocumentVersion.createSnapshot propagation

**Decision:** These methods (`DocumentFile.repo.ts:create`, `DocumentVersion.repo.ts:createSnapshot`) will propagate the `{ data }` wrapper to their callers rather than unwrapping internally.

**Rationale:** Consistency with D-03. These methods are thin wrappers around `baseRepo.insert`. Their callers (handlers) are the natural unwrap point.
