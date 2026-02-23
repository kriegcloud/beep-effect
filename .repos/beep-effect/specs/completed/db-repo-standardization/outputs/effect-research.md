# Effect API Research: db-repo-standardization

> Research output for Phase 1 of the db-repo-standardization spec.
> Generated: 2026-02-10

---

## 1. SqlSchema API Signatures and Return Types

Source: `.repos/effect/packages/sql/src/SqlSchema.ts`

### 1.1 `SqlSchema.findAll`

```typescript
export const findAll = <IR, II, IA, AR, AI, A, R, E>(
  options: {
    readonly Request: Schema.Schema<IA, II, IR>
    readonly Result: Schema.Schema<A, AI, AR>
    readonly execute: (request: II) => Effect.Effect<ReadonlyArray<unknown>, E, R>
  }
) => {
  // Returns:
  return (request: IA): Effect.Effect<ReadonlyArray<A>, E | ParseError, R | IR | AR> => ...
}
```

**Key observations:**
- Encodes `request` using `Request` schema (IA -> II)
- Decodes results using `Schema.Array(Result)` (unknown[] -> A[])
- Return type: `Effect<ReadonlyArray<A>, E | ParseError, R | IR | AR>`
- The `A` is `Schema.Type<Result>` -- the **decoded** (Type) side of the Result schema

### 1.2 `SqlSchema.findOne`

```typescript
export const findOne = <IR, II, IA, AR, AI, A, R, E>(
  options: {
    readonly Request: Schema.Schema<IA, II, IR>
    readonly Result: Schema.Schema<A, AI, AR>
    readonly execute: (request: II) => Effect.Effect<ReadonlyArray<unknown>, E, R>
  }
) => {
  return (request: IA): Effect.Effect<Option.Option<A>, E | ParseError, R | IR | AR> => ...
}
```

**Key observations:**
- Same encoding/decoding as `findAll`, but returns first result
- Empty results -> `Effect.succeedNone` (Option.none())
- Non-empty -> `Effect.asSome(decode(arr[0]))` (Option.some(decoded))
- Return type: `Effect<Option<A>, E | ParseError, R | IR | AR>`

### 1.3 `SqlSchema.single`

```typescript
export const single = <IR, II, IA, AR, AI, A, R, E>(
  options: {
    readonly Request: Schema.Schema<IA, II, IR>
    readonly Result: Schema.Schema<A, AI, AR>
    readonly execute: (request: II) => Effect.Effect<ReadonlyArray<unknown>, E, R>
  }
) => {
  return (request: IA): Effect.Effect<A, E | ParseError | Cause.NoSuchElementException, R | IR | AR> => ...
}
```

**Key observations:**
- Same as `findOne` but fails instead of returning None
- Empty results -> `Effect.fail(new Cause.NoSuchElementException())`
- Non-empty -> `decode(arr[0])`
- Return type: `Effect<A, E | ParseError | NoSuchElementException, R | IR | AR>`

### 1.4 `SqlSchema.void`

```typescript
const void_ = <IR, II, IA, R, E>(
  options: {
    readonly Request: Schema.Schema<IA, II, IR>
    readonly execute: (request: II) => Effect.Effect<unknown, E, R>
  }
) => {
  return (request: IA): Effect.Effect<void, E | ParseError, R | IR> => ...
}
```

**Key observations:**
- No `Result` schema -- discards output via `Effect.asVoid`
- Return type: `Effect<void, E | ParseError, R | IR>`

### 1.5 Critical Finding: SqlSchema returns decoded Schema.Type

All SqlSchema functions return the **decoded (Type)** side of the Result schema. When `Result` is a `Model` (which itself is a `Schema<ModelType, ModelEncoded, ModelContext>`), the returned `A` resolves to `Model["Type"]`.

**This means wrapping the output does NOT require a schema transform.** `Effect.map` is sufficient because SqlSchema already handles all decoding. The result is already a plain runtime value of type `A` (i.e., `Model["Type"]`), and wrapping it in `{ data: value }` is a pure value-level operation.

---

## 2. Model Type Accessor Analysis

Source: `.repos/effect/packages/sql/src/Model.ts`

### 2.1 `M.Any` Type

```typescript
export type Any = Schema.Schema.Any & {
  readonly fields: Schema.Struct.Fields
  readonly insert: Schema.Schema.Any
  readonly update: Schema.Schema.Any
  readonly json: Schema.Schema.Any
  readonly jsonCreate: Schema.Schema.Any
  readonly jsonUpdate: Schema.Schema.Any
}
```

### 2.2 `M.AnyNoContext` Type

```typescript
export type AnyNoContext = Schema.Schema.AnyNoContext & {
  readonly fields: Schema.Struct.Fields
  readonly insert: Schema.Schema.AnyNoContext
  readonly update: Schema.Schema.AnyNoContext
  readonly json: Schema.Schema.AnyNoContext
  readonly jsonCreate: Schema.Schema.AnyNoContext
  readonly jsonUpdate: Schema.Schema.AnyNoContext
}
```

### 2.3 Key Type Accessors

Given `Model extends M.Any`:

| Accessor | Resolves To | Notes |
|----------|-------------|-------|
| `Model` (itself) | `Schema<ModelType, ModelEncoded, ModelContext>` | The "select" variant |
| `Model["Type"]` | Decoded runtime type (e.g., `{ id: string, name: string, ... }`) | The `A` in `Schema<A, I, R>` |
| `Model["Encoded"]` | Wire/DB representation | The `I` in `Schema<A, I, R>` |
| `Model["Context"]` | Schema context requirements | The `R` in `Schema<A, I, R>` -- typically `never` for domain models |
| `Model["fields"]` | `Schema.Struct.Fields` | Raw field definitions |
| `Model["insert"]` | `Schema.Schema.Any` | Insert variant (may omit Generated fields) |
| `Model["insert"]["Type"]` | Insert payload type | Fields required for insertion |
| `Model["insert"]["Context"]` | Insert context requirements | Typically `never` |
| `Model["update"]` | `Schema.Schema.Any` | Update variant |
| `Model["update"]["Type"]` | Update payload type | Fields for updates |
| `Model["json"]` | `Schema.Schema.Any` | JSON API variant |
| `Model["json"]["Type"]` | JSON representation type | For API responses |

### 2.4 `makeRepository` Return Type (Reference)

The official `Model.makeRepository` returns:

```typescript
{
  readonly insert: (insert: S["insert"]["Type"]) => Effect.Effect<S["Type"], never, S["Context"] | S["insert"]["Context"]>
  readonly insertVoid: (insert: S["insert"]["Type"]) => Effect.Effect<void, never, S["Context"] | S["insert"]["Context"]>
  readonly update: (update: S["update"]["Type"]) => Effect.Effect<S["Type"], never, S["Context"] | S["update"]["Context"]>
  readonly updateVoid: (update: S["update"]["Type"]) => Effect.Effect<void, never, S["Context"] | S["update"]["Context"]>
  readonly findById: (id: Schema.Schema.Type<S["fields"][Id]>) => Effect.Effect<Option.Option<S["Type"]>, never, S["Context"] | Schema.Schema.Context<S["fields"][Id]>>
  readonly delete: (id: Schema.Schema.Type<S["fields"][Id]>) => Effect.Effect<void, never, Schema.Schema.Context<S["fields"][Id]>>
}
```

Note: The official `makeRepository` uses `Effect.orDie` to wipe out `ParseError | NoSuchElementException`, reducing the error channel to `never`. Our `makeBaseRepo` uses `Effect.mapError(DatabaseError.$match)` instead, which maps to `DatabaseError`.

---

## 3. Schema.Struct.Context Resolution Analysis

Source: `.repos/effect/packages/effect/src/Schema.ts`, line 2641

### 3.1 Definition

```typescript
export declare namespace Struct {
  // ...
  export type Context<F extends Fields> = Schema.Context<F[keyof F]>
}
```

And `Schema.Context`:

```typescript
export declare namespace Schema {
  export type Context<S> = S extends Schema.Variance<infer _A, infer _I, infer R> ? R : never
}
```

### 3.2 Analysis: `S.Struct.Context<{ readonly data: Model["Type"] }>`

This is the **critical question**. Let's trace the types:

1. `Model["Type"]` is NOT a schema -- it's a plain TypeScript type (the decoded value type). For example, `{ id: string, name: string, createdAt: DateTime.Utc }`.

2. `S.Struct.Context<Fields>` requires `Fields extends Struct.Fields`, where `Struct.Fields = { readonly [x: PropertyKey]: Field }` and `Field = Schema.All | PropertySignature.All`.

3. **If you write `S.Struct({ data: Model })` (passing the Model schema itself):**
   - `Fields = { data: typeof Model }` where `typeof Model` is `Schema<ModelType, ModelEncoded, ModelContext>`
   - `S.Struct.Context<{ data: typeof Model }>` = `Schema.Context<typeof Model>` = `ModelContext`
   - This PRESERVES the model's context.

4. **If you write `S.Struct({ data: S.Unknown })` or try to represent `{ readonly data: Model["Type"] }` as a schema:**
   - You need a schema that decodes to `Model["Type"]`. The model itself IS that schema.
   - Using `Model` (the schema) as the field preserves all context, encoding, and type information.

### 3.3 Critical Finding

**`S.Struct.Context<{ readonly data: Model["Type"] }>` is a TYPE ERROR.** `Model["Type"]` is a plain TypeScript type, not a `Struct.Field`. You cannot use runtime types as struct fields.

To create a schema that wraps the result in `{ data: ... }`:

```typescript
// CORRECT: Use the Model schema as the field value
const WrappedResult = S.Struct({ data: Model })
// Type: Schema<{ data: ModelType }, { data: ModelEncoded }, ModelContext>
// Context is preserved correctly.

// INCORRECT: Model["Type"] is not a schema
const Bad = S.Struct({ data: Model["Type"] }) // TYPE ERROR
```

### 3.4 Context Preservation Summary

| Pattern | Context Resolution | Correct? |
|---------|-------------------|----------|
| `S.Struct({ data: Model })` | `Model["Context"]` (preserved) | Yes |
| `S.Struct({ data: Model.json })` | `Model["json"]["Context"]` (preserved) | Yes |
| `Effect.map(result, data => ({ data }))` | N/A (no schema needed) | Yes -- simplest |
| `S.Class("X")({ data: Model })` | `Model["Context"]` (preserved) | Yes |
| `S.Class("X")({ data: Model.json })` | `Model["json"]["Context"]` (preserved) | Yes |

---

## 4. S.Class Composition Patterns

Source: `.repos/effect/packages/effect/src/Schema.ts`, lines 8713-8734

### 4.1 S.Class Signature

```typescript
export const Class = <Self = never>(identifier: string) =>
  <Fields extends Struct.Fields>(
    fieldsOr: Fields | HasFields<Fields>,
    annotations?: ClassAnnotations<Self, Simplify<Struct.Type<Fields>>>
  ): Class<Self, Fields, Struct.Encoded<Fields>, Struct.Context<Fields>, Struct.Constructor<Fields>, {}, {}>
```

Key: `S.Class` produces a `Schema<Self, Struct.Encoded<Fields>, Struct.Context<Fields>>`. The context of the class schema equals the union of contexts of all its fields.

### 4.2 Existing Pattern: Success Classes Wrapping Model.json

The codebase already uses `S.Class` with `Model.json` fields:

```typescript
// From Create.contract.ts
export class Success extends S.Class<Success>($I`Success`)(
  Comment.Model.json,   // <-- HasFields pattern: passes a schema with .fields
  $I.annotations("Success", { ... })
) {}
```

Here `Comment.Model.json` is passed as `HasFields<Fields>` (it has a `.fields` property). The class inherits all fields from the JSON variant of the model.

### 4.3 Can S.Class Wrap `{ data: Model["Type"] }`?

**Not directly with the runtime type**, but yes with the schema:

```typescript
// Pattern A: S.Class with inline data field wrapping a Model schema
export class Success extends S.Class<Success>($I`Success`)({
  data: Comment.Model          // data field typed as Model["Type"]
}) {}
// Success.Type = { data: Comment.Model.Type }
// Success.Encoded = { data: Comment.Model.Encoded }
// Success.Context = Comment.Model.Context
```

```typescript
// Pattern B: S.Class with inline data field wrapping Model.json
export class Success extends S.Class<Success>($I`Success`)({
  data: Comment.Model.json     // data field typed as Model.json.Type
}) {}
// Success.Type = { data: Comment.Model.json.Type }
// Success.Context = Comment.Model.json.Context
```

### 4.4 Compatibility with DbRepo.Method

`DbRepo.Method<Spec>` derives:
```typescript
type Method<Spec extends MethodSpec> = (
  payload: S.Schema.Type<Spec["payload"]>
) => Effect.Effect<S.Schema.Type<Spec["success"]>, MethodError<Spec>, MethodContext<Spec>>
```

So if `Success` is an `S.Class` with `{ data: Model }`, then:
- `S.Schema.Type<typeof Success>` = `Success` (the class instance type, which has `{ data: Model["Type"] }`)
- The method returns `Effect<Success, ...>` where `Success` is the opaque class type

This works, but the **repo implementation** must actually return instances of the `Success` class (or structurally compatible objects). Since `S.Class` instances are created via `new Success({ data: model })`, the repo would need to construct these.

**This is an important design consideration**: If the base repo wraps with `{ data: model }` using plain `Effect.map`, the result is a plain object `{ data: Model["Type"] }`, NOT an instance of `Success`. For `DbRepo.Method`, `S.Schema.Type<typeof Success>` expects the class instance type, which is structurally equivalent but nominally different.

In practice, TypeScript's structural typing means `{ data: Model["Type"] }` IS assignable to `Success` if the shapes match. But if `Success` has custom methods or brand checks, this could fail.

---

## 5. Recommended Wrapping Approach

### 5.1 Effect.map vs Schema Transform

| Approach | Pros | Cons |
|----------|------|------|
| **`Effect.map(result, data => ({ data }))`** | Simple, no schema overhead, no encoding/decoding cost | No schema validation on wrapper, purely runtime |
| **Schema transform** | Full schema round-trip, integrates with schema ecosystem | Unnecessary overhead -- SqlSchema already decoded the result |
| **`Effect.map` + S.Class construction** | Produces proper class instances | Overhead of `new Success(...)`, coupling to specific contract class |

### 5.2 Recommendation: Effect.map (Plain Object Wrapping)

**Use `Effect.map` for all wrapping in `makeBaseRepo`.** The reasons:

1. **SqlSchema already handles decoding.** The result from `SqlSchema.single` / `SqlSchema.findOne` is already the fully decoded `Model["Type"]`. There is no benefit to running another schema decode on a value that is already decoded.

2. **The `{ data: T }` wrapper is a pure structural addition.** It carries no validation, transformation, or context requirements of its own. Adding a schema layer for this would be unnecessary complexity.

3. **Type compatibility.** The plain object `{ readonly data: Model["Type"] }` is structurally compatible with any `S.Class` that defines `{ data: Model }` as its fields, thanks to TypeScript's structural typing. This means contract Success schemas can define `data: Model` or `data: Model.json` fields and repo results will be assignable.

4. **No new context requirements.** `Effect.map` does not introduce any new `R` requirements, unlike `S.decode(wrappedSchema)` which would add `S.Struct.Context<{ data: Model }>`.

### 5.3 Implementation Patterns

#### insert / update (single result wrapping)

```typescript
// BEFORE
const insert = (
  insert: Model["insert"]["Type"]
): Effect.Effect<Model["Type"], DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertSchema(insert).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(...)
  );

// AFTER
const insert = (
  payload: Model["insert"]["Type"]
): Effect.Effect<{ readonly data: Model["Type"] }, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
  insertSchema(payload).pipe(
    Effect.map((data) => ({ data }) as const),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(...)
  );
```

#### findById (Option wrapping)

```typescript
// BEFORE
const findById = (
  id: S.Schema.Type<Model["fields"][Id]>
): Effect.Effect<O.Option<Model["Type"]>, DatabaseError, ...> =>
  findByIdSchema(id).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(...)
  );

// AFTER
const findById = (
  payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
): Effect.Effect<O.Option<{ readonly data: Model["Type"] }>, DatabaseError, ...> =>
  findByIdSchema(payload.id).pipe(
    Effect.map(O.map((data) => ({ data }) as const)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(...)
  );
```

#### delete (object input, void output)

```typescript
// BEFORE
const delete_ = (
  id: S.Schema.Type<Model["fields"][Id]>
): Effect.Effect<void, DatabaseError, ...> =>
  deleteSchema(id).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(...)
  );

// AFTER
const delete_ = (
  payload: { readonly id: S.Schema.Type<Model["fields"][Id]> }
): Effect.Effect<void, DatabaseError, ...> =>
  deleteSchema(payload.id).pipe(
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(...)
  );
```

#### insertManyVoid (object input, void output)

```typescript
// BEFORE
const insertManyVoid = (
  insert: A.NonEmptyReadonlyArray<Model["insert"]["Type"]>
): Effect.Effect<void, DatabaseError, ...> =>
  insertManyVoidSchema(insert).pipe(...);

// AFTER
const insertManyVoid = (
  payload: { readonly items: A.NonEmptyReadonlyArray<Model["insert"]["Type"]> }
): Effect.Effect<void, DatabaseError, ...> =>
  insertManyVoidSchema(payload.items).pipe(...);
```

### 5.4 Option.map Verification

`O.map(option, data => ({ data }))` is correct:

- `O.map` has signature: `<A, B>(self: Option<A>, f: (a: A) => B) => Option<B>`
- Given `Option<Model["Type"]>`, applying `data => ({ data })` produces `Option<{ data: Model["Type"] }>`
- Combined with `Effect.map`: `Effect.map(effect, O.map(data => ({ data })))` correctly transforms `Effect<Option<A>, E, R>` to `Effect<Option<{ data: A }>, E, R>`

The dual form also works: `Effect.map(O.map(data => ({ data } as const)))` when piped.

---

## 6. Contract Schema Compatibility

### 6.1 Current Contract Pattern

Contracts currently define `Success` as wrapping `Model.json` fields directly:

```typescript
export class Success extends S.Class<Success>($I`Success`)(
  Comment.Model.json,
  // ...
) {}
// Success.Type = Comment.Model.json.Type (flat fields, no data wrapper)
```

### 6.2 After Refactor: Contract Success with Data Wrapper

To align contracts with the new `{ data: ... }` wrapped repo output:

```typescript
// Option A: Wrap Model.json in data field
export class Success extends S.Class<Success>($I`Success`)(
  { data: Comment.Model.json },
  // ...
) {}
// Success.Type = { data: Comment.Model.json.Type }

// Option B: Keep contracts as-is, unwrap at boundary
// This avoids changing contracts (which is explicitly out of scope)
```

### 6.3 Important: Contracts Are OUT OF SCOPE

Per the spec README:

> **NOT modifying contract schemas** -- these are the _target_ consumers, not things being changed

This means contract Success schemas remain unchanged. The `{ data: ... }` wrapper exists at the repo level. Services that bridge repo output to contract responses will need to:

1. Call repo method (gets `{ data: Model["Type"] }`)
2. Extract `.data` from the wrapper
3. Construct contract Success (e.g., `new Success(result.data)`)

Or, if the service currently passes the repo result directly to an RPC handler, the handler will need to unwrap `.data`.

### 6.4 Future Alignment (Post-Refactor)

In a future phase, contract Success schemas could be updated to use `{ data: Model.json }` fields:

```typescript
export class Success extends S.Class<Success>($I`Success`)(
  { data: Comment.Model.json },
) {}
```

Then `DbRepo.Method<{ success: typeof Success }>` would expect `{ data: Model.json.Type }` as the return type, aligning perfectly with the repo's wrapped output. But this is out of scope for the current refactor.

---

## 7. Call-Site Impact Analysis

### 7.1 Pattern: `baseRepo.findById(id)` -> `O.match`

Current consumer pattern (from `Comment.repo.ts`):

```typescript
const findByIdOrFail = (id: CommentId.Type) =>
  baseRepo.findById(id).pipe(
    Effect.flatMap(
      O.match({
        onNone: () => Effect.fail(new CommentNotFoundError({ id })),
        onSome: Effect.succeed,
      })
    )
  );
```

After refactor:

```typescript
const findByIdOrFail = (id: CommentId.Type) =>
  baseRepo.findById({ id }).pipe(       // <-- object input
    Effect.flatMap(
      O.match({
        onNone: () => Effect.fail(new CommentNotFoundError({ id })),
        onSome: ({ data }) => Effect.succeed(data),   // <-- unwrap data
      })
    )
  );
```

### 7.2 Pattern: `baseRepo.insert` via `flow`

Current:

```typescript
const create = flow(baseRepo.insert, Effect.withSpan("CommentRepo.create"));
```

After refactor:

```typescript
// insert signature unchanged for input (still Model["insert"]["Type"])
// but output is now { data: Model["Type"] }
const create = flow(baseRepo.insert, Effect.withSpan("CommentRepo.create"));
// Callers of create now get { data: Model["Type"] } -- need to unwrap if needed
```

### 7.3 Pattern: `baseRepo.delete(id)` bare scalar

Current:

```typescript
const hardDelete = (id: CommentId.Type) =>
  baseRepo.delete(id).pipe(Effect.withSpan("CommentRepo.hardDelete", { attributes: { id } }));
```

After refactor:

```typescript
const hardDelete = (id: CommentId.Type) =>
  baseRepo.delete({ id }).pipe(Effect.withSpan("CommentRepo.hardDelete", { attributes: { id } }));
```

---

## 8. Summary of Answers to Key Questions

### Q1: Does wrapping SqlSchema.single output in `{ data: ... }` require a schema transform?

**No.** `Effect.map(result, data => ({ data }))` is sufficient and recommended. SqlSchema already performs full decode of the Result schema. The output is a plain runtime value. Wrapping it in an object is a pure value-level operation with no schema involvement needed.

### Q2: What does `S.Struct.Context<{ readonly data: Model["Type"] }>` resolve to?

**It is a type error.** `Model["Type"]` is a plain TypeScript type, not a `Struct.Field` (which must be `Schema.All | PropertySignature.All`). To get valid context resolution, use the schema: `S.Struct.Context<{ readonly data: typeof Model }>` resolves to `Model["Context"]`, correctly preserving the model's context requirements.

### Q3: What patterns exist in the Effect ecosystem for result wrappers?

The Effect ecosystem does not have a built-in "result wrapper" abstraction. The `Model.makeRepository` in `@effect/sql/Model` returns unwrapped types directly. Wrapping is an application-level concern. The simplest correct approach is `Effect.map` at the repo factory level.

### Q4: For `findById` returning `Option<{ data: Model["Type"] }>`, is `Effect.map(result, O.map(data => ({ data })))` correct?

**Yes.** This is the correct composition:
- `Effect.map` transforms the Effect's success channel
- `O.map` transforms the Option's inner value
- `data => ({ data })` wraps the model in the data envelope
- Result type: `Effect<Option<{ readonly data: Model["Type"] }>, E, R>`

---

## 9. Type-Level Code Examples

### 9.1 Updated BaseRepo Interface

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

### 9.2 Updated makeBaseRepo Implementation (Core Changes Only)

```typescript
// insert: add Effect.map for wrapping
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

// update: add Effect.map for wrapping
const update = (
  payload: Model["update"]["Type"]
): Effect.Effect<{ readonly data: Model["Type"] }, DatabaseError, Model["Context"] | Model["update"]["Context"]> =>
  updateSchema(payload).pipe(
    Effect.map((data) => ({ data }) as const),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(`${spanPrefix}.update`, {
      captureStackTrace: false,
      attributes: {
        id: isRecord(payload) ? toSpanScalar((payload as Record<string, unknown>)[idColumn]) : undefined,
        ...summarizeWritePayload("update", payload),
      },
    })
  );

// findById: object input + Option wrapping
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

// delete: object input
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

// insertManyVoid: object input
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

### 9.3 Span Attribute Ordering Note

In the current implementation, `Effect.withSpan` is the outermost pipe stage. After adding `Effect.map` for wrapping, the order should be:

```
SqlSchema.call -> Effect.map (wrap) -> Effect.mapError -> Effect.withSpan
```

This ensures the span captures the full operation including wrapping, and errors are mapped before span recording. However, note that `Effect.withSpan` wraps the entire chain, so the ordering of `map` vs `mapError` within the pipe is flexible -- both happen within the span's scope.

---

## 10. Risk Assessment

### Low Risk
- `Effect.map` wrapping is a trivial, well-understood operation
- Object input for `findById`/`delete` is a straightforward destructuring change
- TypeScript structural typing ensures `{ data: Model["Type"] }` is compatible with `S.Class` definitions

### Medium Risk
- **Call-site migration scope**: Every consumer of `baseRepo.findById`, `baseRepo.delete`, `baseRepo.insert`, and `baseRepo.update` must be updated
- **Spread operator patterns**: Code like `const create = flow(baseRepo.insert, ...)` will change return type silently -- callers must be audited
- **`O.match` callbacks**: All `onSome: Effect.succeed` patterns for findById must become `onSome: ({ data }) => Effect.succeed(data)` (or propagate the wrapper)

### Mitigated by Spec
- Contract schemas are NOT being changed (out of scope), so RPC/HTTP/Tool definitions remain stable
- Only repo implementations and their direct consumers change
- TypeScript compiler will catch all mismatches at `bun run check` time
