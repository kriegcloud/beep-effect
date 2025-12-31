# DSL Model Relations Redesign Plan

## Problem Statement

When defining relations inline in `ModelConfig`, TypeScript produces circular reference errors because the type is evaluated during class inheritance resolution:

```typescript
// TS2506: Comment is referenced directly or indirectly in its own base expression.
class Comment extends Model<Comment>("Comment")("comment", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  postId: S.String.pipe(DSL.uuid),
}, {
  relations: {
    // TS2740: Type typeof Post is missing properties from AnyModelClass
    post: Relation.one(() => Post, { from: "postId", to: "id" }),
  }
}) {}
```

**Root Cause**: Even though `() => Post` is a thunk, TypeScript still resolves the return type of `Relation.one()` during class inheritance. This creates a circular dependency where:
1. `Comment` needs `Post` to resolve its relations type
2. `Post` needs `User` to resolve its relations type
3. `User` needs `Post` to resolve its relations type (circular!)

**Current Workaround**: Using `static override readonly relations: RelationsConfig` breaks the cycle but loses type safety.

---

## Proposed Solution: `defineRelations()` Function

Following Drizzle's proven pattern (see `drizzle-orm/relations.d.ts:173-175`), we implement a separate `defineRelations()` function that accepts a callback:

```typescript
// Drizzle's pattern:
export declare function relations<TTableName, TRelations>(
  table: AnyTable<{ name: TTableName }>,
  relations: (helpers: TableRelationsHelpers<TTableName>) => TRelations
): Relations<TTableName, TRelations>;
```

### New API Design

```typescript
// Step 1: Define models WITHOUT relations (no circular reference)
class User extends Model<User>("User")("user", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  email: S.String.pipe(DSL.string, DSL.unique),
  name: S.String.pipe(DSL.string),
}) {}

class Post extends Model<Post>("Post")("post", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  authorId: S.String.pipe(DSL.uuid),
  title: S.String.pipe(DSL.string),
}) {}

class Comment extends Model<Comment>("Comment")("comment", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  postId: S.String.pipe(DSL.uuid),
  content: S.String.pipe(DSL.string),
}) {}

// Step 2: Define relations AFTER all models exist (callback defers type evaluation)
const commentRelations = defineRelations(Comment, (fields) => ({
  post: Relation.one(() => Post, { from: fields.postId, to: "id" }),
}));

const postRelations = defineRelations(Post, (fields) => ({
  author: Relation.one(() => User, { from: fields.authorId, to: "id" }),
  comments: Relation.many(() => Comment, { from: fields.id, to: "postId" }),
}));

const userRelations = defineRelations(User, (fields) => ({
  posts: Relation.many(() => Post, { from: fields.id, to: "authorId" }),
}));

// Step 3: Use in Drizzle schema generation
const tables = { user: toDrizzle(User), post: toDrizzle(Post), comment: toDrizzle(Comment) };
const relations = toDrizzleRelations([commentRelations, postRelations, userRelations], tables);
```

### Why This Works

1. **Models defined first**: `User`, `Post`, `Comment` are fully resolved before relations
2. **Callback defers evaluation**: The `(fields) => ({ ... })` callback is not evaluated during `defineRelations` call - only its return type signature matters
3. **Thunks for targets**: `() => Post` is only resolved at runtime when iterating relations
4. **Typed field references**: `fields.postId` provides compile-time validation that the field exists

---

## Implementation Plan

### Phase 1: Type Definitions (types.ts)

Add new types for the `defineRelations` pattern:

```typescript
/**
 * Field references for a model - maps field names to typed string literals.
 * Used in defineRelations callback for compile-time field validation.
 */
export type ModelFieldRefs<M extends AnyModelClass> = {
  readonly [K in keyof M["_fields"] & string]: K;
};

/**
 * Result of defineRelations - bundles model with its relations config.
 */
export interface ModelRelationsDefinition<
  M extends AnyModelClass = AnyModelClass,
  R extends RelationsConfig = RelationsConfig
> {
  readonly _tag: "ModelRelationsDefinition";
  readonly model: M;
  readonly relations: R;
}

/**
 * Union type for inputs to toDrizzleRelations.
 * Accepts either raw models (with static relations) or ModelRelationsDefinition.
 */
export type RelationsInput = AnyModelClass | ModelRelationsDefinition;
```

### Phase 2: `defineRelations()` Function (relations.ts)

```typescript
/**
 * Defines relations for a model using a callback pattern.
 *
 * This pattern breaks circular type dependencies by:
 * 1. Requiring the model to be fully defined first
 * 2. Deferring relation type evaluation via callback
 * 3. Providing typed field references for compile-time validation
 *
 * @param model - The fully-defined DSL model class
 * @param config - Callback receiving typed field refs, returning relations config
 * @returns ModelRelationsDefinition bundling model with relations
 *
 * @example
 * ```ts
 * const postRelations = defineRelations(Post, (fields) => ({
 *   author: Relation.one(() => User, { from: fields.authorId, to: "id" }),
 *   comments: Relation.many(() => Comment, { from: fields.id, to: "postId" }),
 * }));
 * ```
 */
export const defineRelations = <
  M extends AnyModelClass,
  R extends RelationsConfig,
>(
  model: M,
  config: (fields: ModelFieldRefs<M>) => R
): ModelRelationsDefinition<M, R> => {
  // Build field refs object - just maps field names to themselves
  const fieldRefs = {} as Record<string, string>;
  for (const key of Object.keys(model._fields)) {
    fieldRefs[key] = key;
  }

  // Evaluate the config callback with field refs
  const relations = config(fieldRefs as ModelFieldRefs<M>);

  return {
    _tag: "ModelRelationsDefinition",
    model,
    relations,
  };
};
```

### Phase 3: Update `aggregateRelations()` (drizzle-relations.ts)

Modify to accept both raw models and `ModelRelationsDefinition`:

```typescript
/**
 * Type guard for ModelRelationsDefinition
 */
const isModelRelationsDefinition = (
  input: RelationsInput
): input is ModelRelationsDefinition =>
  input !== null &&
  typeof input === "object" &&
  "_tag" in input &&
  input._tag === "ModelRelationsDefinition";

/**
 * Aggregates relations from models and/or ModelRelationsDefinitions.
 */
export const aggregateRelations = <Inputs extends ReadonlyArray<RelationsInput>>(
  ...inputs: Inputs
): RelationGraph</* computed type */> => {
  const modelRecord: Record<string, AnyModelClass> = {};
  const relationsRecord: Record<string, readonly AnyRelation[]> = {};

  for (const input of inputs) {
    if (isModelRelationsDefinition(input)) {
      // New pattern: ModelRelationsDefinition
      const model = input.model;
      modelRecord[model.identifier] = model;
      relationsRecord[model.identifier] = Object.values(input.relations);
    } else {
      // Legacy pattern: model with static relations property
      const model = input;
      modelRecord[model.identifier] = model;
      const rels = model.relations ? Object.values(model.relations) : [];
      relationsRecord[model.identifier] = rels;
    }
  }

  return { models: modelRecord, relations: relationsRecord } as any;
};
```

### Phase 4: Update `toDrizzleRelations()` (drizzle-relations.ts)

Similar update to accept `ModelRelationsDefinition`:

```typescript
export const toDrizzleRelations = <
  Inputs extends readonly RelationsInput[],
  Tables extends Record<string, PgTableWithColumns<any>>,
>(
  inputs: Inputs,
  drizzleTables: Tables
): { /* return type */ } => {
  // ... implementation that handles both patterns
};
```

### Phase 5: Update Tests

Convert test models to use new pattern:

```typescript
// BEFORE (broken with inline relations):
class Comment extends Model<Comment>("Comment")("comment", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  postId: S.String.pipe(DSL.uuid),
}, {
  relations: { post: Relation.one(() => Post, { from: "postId", to: "id" }) }
}) {}

// AFTER (works with defineRelations):
class Comment extends Model<Comment>("Comment")("comment", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  postId: S.String.pipe(DSL.uuid),
}) {}

const commentRelations = defineRelations(Comment, (fields) => ({
  post: Relation.one(() => Post, { from: fields.postId, to: "id" }),
}));
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Add `ModelFieldRefs`, `ModelRelationsDefinition`, `RelationsInput` types |
| `packages/common/schema/src/integrations/sql/dsl/relations.ts` | Add `defineRelations()` function |
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle-relations.ts` | Update `aggregateRelations()` and `toDrizzleRelations()` to accept new pattern |
| `packages/common/schema/src/integrations/sql/dsl/index.ts` | Export `defineRelations`, `ModelRelationsDefinition` |
| `packages/common/schema/test/integrations/sql/dsl/drizzle-relations.test.ts` | Convert models to use `defineRelations()` pattern |

---

## Migration Strategy

### Backward Compatibility

The existing `ModelConfig.relations` pattern will continue to work for:
- Models without circular dependencies
- Self-contained relation definitions

The `static override readonly relations` workaround remains valid but discouraged.

### Recommended Pattern

For any model with relations that reference other models:
1. Define all models without relations first
2. Use `defineRelations()` for each model
3. Pass `ModelRelationsDefinition` objects to `aggregateRelations()` and `toDrizzleRelations()`

---

## Verification Checklist

- [ ] `defineRelations()` compiles without errors
- [ ] Circular model relations (User → Post → Comment → Post) work
- [ ] Self-referential relations (Employee → Employee) work
- [ ] `fields.fieldName` provides autocomplete and type errors for invalid fields
- [ ] `toDrizzleRelations()` generates correct Drizzle relations
- [ ] All existing tests pass
- [ ] New tests cover `defineRelations()` pattern
- [ ] `bunx turbo run check --filter=@beep/schema` passes with 0 errors

---

## Commands

```bash
# Type check
bunx turbo run check --filter=@beep/schema

# Run DSL tests
bun test packages/common/schema/test/integrations/sql/dsl/

# Run specific test file
bun test packages/common/schema/test/integrations/sql/dsl/drizzle-relations.test.ts
```

---

## Decision Points

### Resolved

1. **Approach**: Separate `defineRelations()` function (mirrors Drizzle, non-breaking, type-safe)

### Open Questions

1. **Should `ModelConfig.relations` be deprecated?**
   - Recommend: Keep for simple cases, document `defineRelations()` as preferred for circular deps

2. **Should we add a fluent API on the model class?**
   - Example: `User.defineRelations((fields) => ({ ... }))`
   - Adds convenience but increases API surface

3. **Should field refs support nested access for future composite keys?**
   - Example: `fields.id` vs `fields["id"]` vs `fields.get("id")`
   - Start simple, extend if needed
