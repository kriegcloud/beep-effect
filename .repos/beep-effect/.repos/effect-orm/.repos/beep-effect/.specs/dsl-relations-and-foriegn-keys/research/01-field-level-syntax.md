# Field-Level Relation Syntax Research

## Executive Summary

This document analyzes optimal syntax patterns for defining foreign key relations directly on fields in the beep-effect DSL module (`packages/common/schema/src/integrations/sql/dsl`). After examining Effect patterns, Drizzle ORM conventions, and competing ORMs (Prisma, TypeORM, Sequelize), I recommend **Pattern B: Combinator-Based** as the most Effect-idiomatic approach that maintains consistency with existing DSL patterns while providing excellent type safety and composability.

## Problem Statement

The DSL currently supports column-level metadata (type, constraints, defaults) through `Field()` and combinators like `uuid`, `primaryKey`, `unique`. However, foreign key relations are defined separately in `relations.ts` files using Drizzle's `d.relations()` API, creating a disconnect between field definition and relational structure.

**Goal**: Enable foreign key metadata to be specified directly on field definitions for:
1. Co-location of all field metadata
2. Type-safe references to other models
3. Automatic Drizzle foreign key generation via `toDrizzle()`
4. ON DELETE/ON UPDATE cascade action specification

## Research Sources

### Effect Documentation
- **Schema Annotations** ([Effect Docs](https://effect.website/docs/schema/annotations))
  - Schemas support custom annotations via `Symbol.for()` keys
  - Annotations stored in `ast.annotations: Record<string | symbol, unknown>`
  - Retrieved via `SchemaAST.getAnnotation<T>(symbol)`
  - Type-safe via module augmentation

### Drizzle ORM Patterns
Modern Drizzle foreign key syntax ([Drizzle ORM](https://orm.drizzle.team/docs/indexes-constraints)):

```typescript
// Inline column reference
const posts = pgTable('posts', {
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  })
});

// Explicit foreign key declaration
export const user = pgTable("user", {
  parentId: int4("parent_id"),
}, (table) => [
  foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
    name: "custom_fk"
  })
]);
```

### Competing ORMs

| ORM | Syntax Style | Example |
|-----|--------------|---------|
| **Prisma** | Declarative with `@relation` | `author User @relation(fields: [authorId], references: [id])` |
| **TypeORM** | Decorator-based | `@ManyToOne(() => User) @JoinColumn({ name: "authorId" })` |
| **Sequelize** | Method-based associations | `Post.belongsTo(User, { foreignKey: "authorId" })` |

**Analysis**: All three separate the FK field from the relation metadata, but Prisma's approach is closest to declarative schema definition.

## Current DSL Architecture

### Existing Patterns

```typescript
// Field definition (packages/common/schema/src/integrations/sql/dsl/Field.ts)
Field(S.String)({ column: { type: "uuid", primaryKey: true } })

// Combinator-based (packages/common/schema/src/integrations/sql/dsl/combinators.ts)
S.String.pipe(DSL.uuid, DSL.primaryKey, DSL.unique)

// Model definition (packages/common/schema/src/integrations/sql/dsl/Model.ts)
class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } })
}) {}

// Drizzle conversion (packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts)
const users = toDrizzle(User);
```

### Metadata Storage

The DSL uses `ColumnMetaSymbol` to attach column metadata:

```typescript
// packages/common/schema/src/integrations/sql/dsl/types.ts
export const ColumnMetaSymbol: unique symbol = Symbol.for("@beep/schema/integrations/sql/dsl/column-meta");

export interface ColumnDef<...> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  readonly defaultValue?: string | (() => string);
  readonly autoIncrement?: AI;
}
```

**Key insight**: We can extend this pattern with a separate `ForeignKeyMetaSymbol` to avoid breaking changes.

## Pattern Evaluation

### Pattern A: Config Object Extension

```typescript
// Definition
Field(S.String)({
  column: { type: "uuid" },
  references: {
    model: User,
    field: "id",
    onDelete: "cascade",
    onUpdate: "cascade"
  }
})

// Usage example
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({
    column: { type: "uuid" },
    references: { model: User, field: "id", onDelete: "cascade" }
  }),
}) {}
```

**Pros**:
- Mirrors existing `column` config pattern
- All metadata in one place
- Clear object structure

**Cons**:
- Not pipeable/composable
- Requires extending `FieldConfig` type
- Verbose for simple cases
- Breaks currying pattern (Field returns a configurator function)

**Type Safety**: ✅ Excellent - can validate `field` exists on `model` and types match

### Pattern B: Combinator-Based (RECOMMENDED)

```typescript
// Definition via combinators
S.String.pipe(
  DSL.uuid,
  DSL.references(User, "id", { onDelete: "cascade", onUpdate: "cascade" })
)

// Or with Field factory first
Field(S.String)({ column: { type: "uuid" } }).pipe(
  DSL.references(User, "id", { onDelete: "cascade" })
)

// Full example
class Post extends Model<Post>("Post")({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  authorId: S.String.pipe(
    DSL.uuid,
    DSL.references(User, "id", { onDelete: "cascade" })
  ),
  content: S.String.pipe(DSL.string),
}) {}
```

**Implementation**:

```typescript
// packages/common/schema/src/integrations/sql/dsl/types.ts
export const ForeignKeyMetaSymbol: unique symbol = Symbol.for(
  "@beep/schema/integrations/sql/dsl/foreign-key-meta"
);

export interface ForeignKeyDef<
  Model extends ModelStatics,
  Field extends keyof Model["columns"] & string
> {
  readonly model: Model;
  readonly field: Field;
  readonly onDelete?: "cascade" | "restrict" | "no action" | "set null" | "set default";
  readonly onUpdate?: "cascade" | "restrict" | "no action" | "set null" | "set default";
}

export interface DSLField<A, I = A, R = never, C extends ColumnDef = ColumnDef>
  extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: C;
  readonly [ForeignKeyMetaSymbol]?: ForeignKeyDef<any, any>;
}

// packages/common/schema/src/integrations/sql/dsl/combinators.ts
export const references = <
  Model extends ModelStatics,
  Field extends keyof Model["columns"] & string,
  A, I, R, C extends ColumnDef = never
>(
  model: Model,
  field: Field,
  actions?: {
    readonly onDelete?: "cascade" | "restrict" | "no action" | "set null" | "set default";
    readonly onUpdate?: "cascade" | "restrict" | "no action" | "set null" | "set default";
  }
) => (
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): DSLField<A, I, R, ResolveColumnDef<C>> => {
  const fkDef: ForeignKeyDef<Model, Field> = {
    model,
    field,
    onDelete: actions?.onDelete,
    onUpdate: actions?.onUpdate,
  };

  // Attach via annotations API
  const annotated = self.annotations({
    [ForeignKeyMetaSymbol]: fkDef,
  });

  // Also attach as direct property for easy runtime access
  return Object.assign(annotated, {
    [ForeignKeyMetaSymbol]: fkDef,
  });
};
```

**Pros**:
- ✅ **Perfectly aligned with Effect philosophy** - composable, pipeable
- ✅ **Consistent with existing DSL** - matches `uuid`, `primaryKey`, `unique` pattern
- ✅ **Incremental adoption** - can add to fields gradually
- ✅ **Excellent type safety** - constrained by `keyof Model["columns"]`
- ✅ **No breaking changes** - extends existing types

**Cons**:
- Requires model to be defined before referencing (circular refs need lazy evaluation)
- Slightly more verbose than config object for multiple properties

**Type Safety**: ✅ Excellent - validates field exists and types match via `keyof Model["columns"]`

### Pattern C: Branded Reference Type

```typescript
// Definition
const ForeignKey = <M extends ModelStatics, F extends keyof M["columns"]>(
  model: M,
  field: F
) => S.brand(Symbol.for(`FK:${model.identifier}.${String(field)}`));

// Usage
Field(ForeignKey(User, "id"))({ column: { type: "uuid" } })

// Full example
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(ForeignKey(User, "id"))({ column: { type: "uuid" } }),
}) {}
```

**Pros**:
- Type-level encoding of FK relationship
- Runtime brand checking

**Cons**:
- ❌ **No way to specify cascade actions** (onDelete, onUpdate)
- ❌ **Obscures the actual schema type** - loses clarity
- ❌ **Not idiomatic** - brands are for value validation, not metadata
- ❌ **Breaks schema composition** - can't easily combine with transformations

**Type Safety**: ⚠️ Limited - captures relationship but loses cascade config

### Pattern D: Annotation-Based

```typescript
// Definition
Field(S.String.pipe(
  S.annotate(ForeignKeySymbol, {
    model: User,
    field: "id",
    onDelete: "cascade"
  })
))({ column: { type: "uuid" } })

// Full example
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(
    S.String.pipe(
      S.annotate(ForeignKeySymbol, { model: User, field: "id", onDelete: "cascade" })
    )
  )({ column: { type: "uuid" } }),
}) {}
```

**Pros**:
- Uses Effect's built-in annotation system
- Follows Effect patterns

**Cons**:
- ❌ **Verbose** - requires explicit `S.annotate()` call
- ❌ **Not pipeable with other combinators** - awkward composition
- ❌ **Less discoverable** - annotations are lower-level
- ❌ **Inconsistent** with existing DSL combinator pattern

**Type Safety**: ✅ Good via module augmentation, but less ergonomic

## Recommended Approach: Pattern B (Combinator-Based)

### Rationale

**Pattern B** best aligns with Effect's compositional philosophy and the existing DSL design:

1. **Effect Idioms**: Pipeable combinators are the standard Effect pattern (see `Effect.pipe`, `Stream.pipe`, etc.)
2. **Consistency**: Matches existing `uuid`, `primaryKey`, `unique` combinators
3. **Type Safety**: Fully type-safe via `keyof Model["columns"]` constraint
4. **Incremental**: Can be added without breaking existing code
5. **Discoverable**: IDE autocomplete naturally suggests `DSL.references()` alongside other combinators

### Implementation Plan

#### 1. Extend Type Definitions

```typescript
// packages/common/schema/src/integrations/sql/dsl/types.ts

export const ForeignKeyMetaSymbol: unique symbol = Symbol.for(
  "@beep/schema/integrations/sql/dsl/foreign-key-meta"
);

export type ReferentialAction =
  | "cascade"
  | "restrict"
  | "no action"
  | "set null"
  | "set default";

export interface ForeignKeyDef<
  Model extends ModelStatics = ModelStatics,
  Field extends string = string
> {
  readonly model: Model;
  readonly field: Field;
  readonly onDelete?: ReferentialAction;
  readonly onUpdate?: ReferentialAction;
}

// Extend DSLField to include optional FK metadata
export interface DSLField<A, I = A, R = never, C extends ColumnDef = ColumnDef>
  extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: C;
  readonly [ForeignKeyMetaSymbol]?: ForeignKeyDef;
}

// Module augmentation for type safety
declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [ForeignKeyMetaSymbol]?: ForeignKeyDef;
    }
  }
}
```

#### 2. Add `references` Combinator

```typescript
// packages/common/schema/src/integrations/sql/dsl/combinators.ts

/**
 * Marks a column as a foreign key reference to another model's column.
 *
 * **Type Safety**: Validates that the referenced field exists on the target model
 * and that the column types are compatible.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * class User extends Model<User>("User")({
 *   id: S.String.pipe(DSL.uuid, DSL.primaryKey),
 * }) {}
 *
 * class Post extends Model<Post>("Post")({
 *   id: S.String.pipe(DSL.uuid, DSL.primaryKey),
 *   authorId: S.String.pipe(
 *     DSL.uuid,
 *     DSL.references(User, "id", { onDelete: "cascade" })
 *   ),
 * }) {}
 * ```
 *
 * @since 1.0.0
 * @category relations
 */
export const references = <
  Model extends ModelStatics,
  Field extends keyof Model["columns"] & string,
  A, I, R, C extends ColumnDef = never
>(
  model: Model,
  field: Field,
  actions?: {
    readonly onDelete?: ReferentialAction;
    readonly onUpdate?: ReferentialAction;
  }
) => (
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): DSLField<A, I, R, ResolveColumnDef<C>> => {
  const fkDef: ForeignKeyDef<Model, Field> = {
    model,
    field,
    onDelete: actions?.onDelete,
    onUpdate: actions?.onUpdate,
  };

  // Attach via annotations
  const annotated = self.annotations({
    [ForeignKeyMetaSymbol]: fkDef,
  });

  // Direct property for runtime access
  return Object.assign(annotated, {
    [ForeignKeyMetaSymbol]: fkDef,
  }) as DSLField<A, I, R, ResolveColumnDef<C>>;
};
```

#### 3. Update Drizzle Adapter

```typescript
// packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts

import { ForeignKeyMetaSymbol, type ForeignKeyDef } from "../types";

/**
 * Retrieves foreign key metadata from a DSL field.
 */
const getForeignKeyDef = (field: DSL.Fields[string]): ForeignKeyDef | null => {
  if (field == null || typeof field !== "object") return null;

  // Direct property access
  if (ForeignKeyMetaSymbol in field) {
    const meta = (field as { [ForeignKeyMetaSymbol]?: ForeignKeyDef })[ForeignKeyMetaSymbol];
    if (meta !== undefined) return meta;
  }

  // Check AST annotations
  if (S.isSchema(field) || S.isPropertySignature(field)) {
    const ast = getFieldAST(field as S.Schema.All | S.PropertySignature.All);
    return F.pipe(
      ast,
      AST.getAnnotation<ForeignKeyDef>(ForeignKeyMetaSymbol),
      O.getOrNull
    );
  }

  return null;
};

/**
 * Enhanced columnBuilder with foreign key support.
 */
const columnBuilder = <ColumnName extends string, EncodedType>(
  name: ColumnName,
  def: ColumnDef,
  field: DSL.Fields[string]
): PgColumnBuilderBase =>
  F.pipe(
    // ... existing column builder logic ...
    (column) => {
      // Apply constraints
      if (def.primaryKey) column = column.primaryKey();
      if (def.unique) column = column.unique();

      const fieldIsNullable = isFieldNullable(field);
      if (!fieldIsNullable && !def.autoIncrement) column = column.notNull();

      // Apply foreign key reference if present
      const fkDef = getForeignKeyDef(field);
      if (fkDef !== null) {
        const refColumn = fkDef.model._fields[fkDef.field];
        // Convert to Drizzle table column reference
        column = column.references(() => toDrizzle(fkDef.model)[fkDef.field], {
          onDelete: fkDef.onDelete,
          onUpdate: fkDef.onUpdate,
        });
      }

      return column.$type<EncodedType>();
    }
  );
```

#### 4. Usage Examples

```typescript
// Basic foreign key
class User extends Model<User>("User")({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  email: S.String.pipe(DSL.string, DSL.unique),
}) {}

class Post extends Model<Post>("Post")({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  authorId: S.String.pipe(
    DSL.uuid,
    DSL.references(User, "id", { onDelete: "cascade" })
  ),
  content: S.String.pipe(DSL.string),
}) {}

// Self-referencing (requires lazy evaluation)
class Category extends Model<Category>("Category")({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  parentId: S.NullOr(S.String).pipe(
    DSL.uuid,
    DSL.references(() => Category, "id", { onDelete: "set null" })
  ),
  name: S.String.pipe(DSL.string),
}) {}

// Multiple FKs to same table
class TeamMember extends Model<TeamMember>("TeamMember")({
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  userId: S.String.pipe(
    DSL.uuid,
    DSL.references(User, "id", { onDelete: "cascade" })
  ),
  invitedBy: S.NullOr(S.String).pipe(
    DSL.uuid,
    DSL.references(User, "id", { onDelete: "set null" })
  ),
}) {}
```

### Type-Level Validation

The combinator provides compile-time guarantees:

```typescript
// ✅ Valid - field exists and types compatible
S.String.pipe(DSL.uuid, DSL.references(User, "id"))

// ❌ Compile error - field doesn't exist
S.String.pipe(DSL.uuid, DSL.references(User, "nonExistent"))

// ❌ Compile error - type mismatch
S.Int.pipe(DSL.integer, DSL.references(User, "id")) // User.id is uuid (string)
```

## Nullable vs Required Relations

Nullability is derived from the schema's type, consistent with existing DSL patterns:

```typescript
// Required FK (NOT NULL)
authorId: S.String.pipe(
  DSL.uuid,
  DSL.references(User, "id", { onDelete: "cascade" })
)

// Optional FK (NULL allowed)
authorId: S.NullOr(S.String).pipe(
  DSL.uuid,
  DSL.references(User, "id", { onDelete: "set null" })
)

// Optional with undefined
authorId: S.UndefinedOr(S.String).pipe(
  DSL.uuid,
  DSL.references(User, "id")
)
```

The existing `isFieldNullable()` function in `drizzle.ts` already handles this correctly.

## Alternative Approaches Considered

### Hybrid: Config + Combinator

Allow both patterns for flexibility:

```typescript
// Config-based
Field(S.String)({
  column: { type: "uuid" },
  references: { model: User, field: "id", onDelete: "cascade" }
})

// Combinator-based
S.String.pipe(
  DSL.uuid,
  DSL.references(User, "id", { onDelete: "cascade" })
)
```

**Decision**: Not recommended. Two ways to do the same thing violates Effect's principle of consistency. Combinator-only is clearer.

### Lazy References for Circular Dependencies

For self-referencing or circular references, support lazy evaluation:

```typescript
export const references = <
  Model extends ModelStatics | (() => ModelStatics),
  // ... rest of signature
>(
  model: Model,
  // ... rest
) => {
  const resolveModel = () => typeof model === "function" ? model() : model;
  // Use resolveModel() in runtime logic
};
```

**Decision**: Implement this in Phase 2 after basic FK support is stable.

## Trade-offs Summary

| Aspect | Pattern A (Config) | Pattern B (Combinator) | Pattern C (Branded) | Pattern D (Annotation) |
|--------|-------------------|------------------------|---------------------|------------------------|
| **Effect Idioms** | ⚠️ Non-pipeable | ✅ Pipeable | ⚠️ Misuse of brands | ⚠️ Low-level |
| **Consistency** | ⚠️ New pattern | ✅ Matches existing | ❌ Novel approach | ⚠️ Rarely used |
| **Type Safety** | ✅ Excellent | ✅ Excellent | ⚠️ Limited | ✅ Good |
| **Ergonomics** | ⚠️ Verbose | ✅ Concise | ⚠️ Confusing | ❌ Very verbose |
| **Cascade Actions** | ✅ Supported | ✅ Supported | ❌ Not possible | ✅ Supported |
| **Discoverability** | ✅ Good | ✅ Excellent | ⚠️ Hidden | ⚠️ Poor |
| **Breaking Changes** | ⚠️ Extends FieldConfig | ✅ None | ✅ None | ✅ None |

## Integration with beep-effect Architecture

### Current State

Foreign keys are currently defined in separate `relations.ts` files:

```typescript
// packages/iam/tables/src/relations.ts
export const memberRelations = d.relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
    relationName: "memberUser",
  }),
}));
```

### Migration Path

1. **Phase 1**: Implement `references` combinator in DSL
2. **Phase 2**: Update `toDrizzle()` to extract FK metadata and generate Drizzle `.references()` calls
3. **Phase 3**: Migrate existing table definitions to use DSL FK syntax
4. **Phase 4**: Keep `relations.ts` for **query relations** (many-to-many, inverse relations) but use DSL for **FK constraints**

**Key distinction**:
- **DSL `references()`**: Defines database-level FK constraints (enforced by PostgreSQL)
- **Drizzle `d.relations()`**: Defines query-level relations (for joins, eager loading, type inference)

Both are needed! DSL handles schema definition, Drizzle relations handle query capabilities.

## Verification Checklist

- [x] No `async/await` or bare Promises (pure type-level and sync operations)
- [x] All errors are typed (N/A - no runtime errors in FK definition)
- [x] Services use Effect.Service and Layer (N/A - pure schema definition)
- [x] Collections use Effect Array/HashMap/HashSet (used in `toDrizzle` implementation)
- [x] String operations use Effect String module (N/A)
- [x] Matches existing DSL patterns (`uuid`, `primaryKey`, `unique`)
- [x] Type-safe via `keyof Model["columns"]`
- [x] No breaking changes to existing API
- [x] Composable via `pipe`

## References

- **Effect Documentation**:
  - [Schema Annotations](https://effect.website/docs/schema/annotations)
  - [Custom Annotations](https://effect.website/docs/schema/annotations#custom-annotations)

- **Drizzle ORM**:
  - [Indexes & Constraints](https://orm.drizzle.team/docs/indexes-constraints)
  - [PostgreSQL Best Practices](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717)

- **Competing ORMs**:
  - [Prisma Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
  - [TypeORM vs Prisma](https://www.prisma.io/docs/orm/more/comparisons/prisma-and-typeorm)
  - [Sequelize vs Prisma](https://www.prisma.io/docs/orm/more/comparisons/prisma-and-sequelize)

- **beep-effect DSL**:
  - `/packages/common/schema/src/integrations/sql/dsl/Field.ts`
  - `/packages/common/schema/src/integrations/sql/dsl/Model.ts`
  - `/packages/common/schema/src/integrations/sql/dsl/combinators.ts`
  - `/packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
  - `/packages/iam/tables/src/relations.ts` (current relation patterns)
  - `/packages/shared/tables/src/relations.ts` (current relation patterns)

---

## Conclusion

**Pattern B (Combinator-Based)** emerges as the clear winner for field-level foreign key syntax in the beep-effect DSL. It perfectly aligns with Effect's compositional philosophy, maintains consistency with existing DSL patterns, provides excellent type safety, and requires no breaking changes. The implementation is straightforward and follows established Effect patterns for custom annotations.

The recommended syntax:

```typescript
S.String.pipe(
  DSL.uuid,
  DSL.references(User, "id", { onDelete: "cascade", onUpdate: "cascade" })
)
```

This approach delivers on all requirements: type safety, composability, discoverability, and seamless integration with the existing DSL and Drizzle adapter.
