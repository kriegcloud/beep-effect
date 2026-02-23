# Drizzle Relation Mapping for DSL Module - Research Report

## Executive Summary

This research explores how to generate Drizzle ORM `relations()` definitions from DSL Model metadata. The investigation reveals that Drizzle uses **per-table relation definitions** rather than a single aggregated `defineRelations()` call. Each table gets its own `relations(table, callback)` invocation that defines relationships to other tables. The DSL module should provide a `toDrizzleRelations()` function that generates individual relation definitions from Model metadata, following Effect-TS functional patterns.

**Key Finding**: The Drizzle v2 relations API uses `relations(table, callback)` per table, **not** a centralized `defineRelations()` aggregator. The documentation mentions `defineRelations()` conceptually, but the actual implementation exports individual `relations()` definitions.

## Problem Statement

The DSL module at `packages/common/schema/src/integrations/sql/dsl` needs to generate Drizzle relation definitions from Model metadata. Currently, it has:

1. **Model definitions** with foreign key metadata (when implemented)
2. **`toDrizzle()`** function that converts Models to typed Drizzle tables
3. **No relation generation** - users must manually write `relations()` definitions

The goal is to automatically generate type-safe, bidirectional Drizzle relations from DSL Model metadata.

## Research Sources

### Effect Documentation
- N/A - This research focuses on Drizzle ORM integration patterns

### Source Code Analysis
**Drizzle ORM** (`node_modules/drizzle-orm/`):
- `relations.d.ts` - Core relation type definitions
- Key types: `Relations`, `One`, `Many`, `TableRelationsHelpers`

**beep-effect Codebase**:
- `packages/shared/tables/src/relations.ts` - Multi-entity relation patterns
- `packages/documents/tables/src/relations.ts` - Hierarchical relations, many-to-one
- `packages/iam/tables/src/relations.ts` - Self-referential relations, multiple relations to same table
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` - Current table conversion

### Ecosystem Libraries
- Drizzle ORM v0.36+ (v2 relations API)

## Drizzle Relations API Overview

### Actual API Pattern

Drizzle's relations API works on a **per-table basis**, not through centralized aggregation:

```typescript
import { relations } from "drizzle-orm";

// Each table gets its own relations definition
export const usersRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
  profile: one(profile, {
    fields: [users.profileId],
    references: [profile.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));
```

### Type Signatures (from `relations.d.ts`)

```typescript
// Primary function
export declare function relations<TTableName extends string, TRelations extends Record<string, Relation<any>>>(
  table: AnyTable<{ name: TTableName }>,
  relations: (helpers: TableRelationsHelpers<TTableName>) => TRelations
): Relations<TTableName, TRelations>;

// Helper types
export interface TableRelationsHelpers<TTableName extends string> {
  one: <TForeignTable extends Table, TColumns extends [AnyColumn<{tableName: TTableName}>, ...]>(
    table: TForeignTable,
    config?: RelationConfig<TTableName, TForeignTable["_"]["name"], TColumns>
  ) => One<TForeignTable["_"]["name"], Equal<TColumns[number]["_"]["notNull"], true>>;

  many: <TForeignTable extends Table>(
    referencedTable: TForeignTable,
    config?: { relationName: string }
  ) => Many<TForeignTable["_"]["name"]>;
}

export interface RelationConfig<TTableName extends string, TForeignTableName extends string, TColumns extends AnyColumn[]> {
  relationName?: string;
  fields: TColumns;
  references: ColumnsWithTable<TTableName, TForeignTableName, TColumns>;
}
```

### Key Observations

1. **No `defineRelations()` in implementation** - Documentation uses this term conceptually, but the actual API is `relations(table, callback)`
2. **Helpers pattern** - Callback receives `{ one, many }` helpers scoped to the source table
3. **Bidirectional definitions** - Each side of a relationship needs its own `relations()` call
4. **Optional config** - `one()` requires `fields`/`references` for foreign keys; `many()` can infer from the inverse `one()`
5. **`relationName` disambiguation** - Required when multiple relations exist between the same tables

## Pattern Analysis: Relation Types

### One-to-One Relations

```typescript
// users table has profileId column
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.profileId],      // Foreign key column(s)
    references: [profiles.id],       // Referenced primary key(s)
  }),
}));

// Inverse side (optional if you don't query from this direction)
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],       // If profiles has userId FK
    references: [users.id],
  }),
}));
```

**Pattern**: Both sides use `one()`, each specifies their own `fields` and `references`.

### One-to-Many Relations

```typescript
// posts table has authorId column (many posts per user)
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),  // No config needed - inferred from inverse
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

**Pattern**:
- **"Many" side**: Just references the table, no config (Drizzle infers from the `one()` side)
- **"One" side**: Specifies `fields`/`references` for the foreign key

### Many-to-Many (Junction Tables)

```typescript
// users <-> groups through usersToGroups junction
export const usersRelations = relations(users, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  // Can also expose direct access (requires manual through config in queries)
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  usersToGroups: many(usersToGroups),
}));
```

**Pattern**: Junction table uses two `one()` relations; entity tables use `many()` to junction.

### Self-Referential Relations

```typescript
// documents table with parentDocumentId
export const documentRelations = relations(document, ({ one, many }) => ({
  parentDocument: one(document, {
    fields: [document.parentDocumentId],
    references: [document.id],
    relationName: "documentHierarchy",  // REQUIRED for disambiguation
  }),
  childDocuments: many(document, {
    relationName: "documentHierarchy",   // MUST match the one() relationName
  }),
}));
```

**Pattern**: `relationName` is **mandatory** to distinguish parent vs. child relations.

### Multiple Relations to Same Table

```typescript
// file table with userId and uploadedByUserId
export const fileRelations = relations(file, ({ one }) => ({
  userId: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  uploadedByUserId: one(user, {
    fields: [file.uploadedByUserId],
    references: [user.id],
    relationName: "uploadedByUser",  // Disambiguates multiple user relations
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  files: many(file),
  uploadedFiles: many(file, {
    relationName: "uploadedByUser",  // Matches the inverse relation
  }),
}));
```

**Pattern**: Use `relationName` when table has multiple foreign keys to the same target table.

## Schema Aggregation Patterns

Since Drizzle doesn't use centralized `defineRelations()`, aggregation means **collecting all per-table relation exports**:

```typescript
// Generated output pattern
export const schema = {
  // Tables
  users,
  posts,
  comments,

  // Relations (one export per table)
  usersRelations,
  postsRelations,
  commentsRelations,
};

// Pass to drizzle() for relational query support
const db = drizzle(pool, { schema });
```

### Aggregation Strategy for DSL

**Option 1: Generate Individual Exports (Recommended)**

```typescript
// toDrizzleRelations returns an object with all relation definitions
const relationsSchema = toDrizzleRelations([User, Post, Comment]);

// Output:
{
  usersRelations: Relations<"users", {...}>,
  postsRelations: Relations<"posts", {...}>,
  commentsRelations: Relations<"comments", {...}>,
}
```

**Option 2: Generate Source Code Strings**

For codegen workflows (e.g., Drizzle Kit integration):

```typescript
const code = generateDrizzleRelationsCode([User, Post, Comment]);
// Returns TypeScript source code string
```

## Where Predicate Support

Drizzle relations **do not support `where` in the relation definition**. Filtering happens at **query time**:

```typescript
// ❌ NOT SUPPORTED - No where in relation definition
export const usersRelations = relations(users, ({ many }) => ({
  activePosts: many(posts, {
    where: { status: 'active' },  // This doesn't exist
  }),
}));

// ✅ CORRECT - Filter in the query
const result = await db.query.users.findMany({
  with: {
    posts: {
      where: (posts, { eq }) => eq(posts.status, 'active'),
    },
  },
});
```

**Implication for DSL**: Don't try to encode `where` predicates in relation metadata. Users apply filters in queries.

## Integration with beep-effect DSL

### Current State

**What exists**:
- `Model<Self>()(fields)` - Defines models with column metadata
- `Field(schema, { column: {...} })` - Attaches column config to schemas
- `toDrizzle(Model)` - Generates typed Drizzle tables
- Column metadata: `type`, `primaryKey`, `unique`, `autoIncrement`

**What's missing**:
- Foreign key metadata in `ColumnDef`
- Relation metadata extraction
- `toDrizzleRelations()` function

### Proposed Metadata Structure

Extend `ColumnDef` to include foreign key information:

```typescript
export interface ColumnDef<
  T extends ColumnType.Type = ColumnType.Type,
  PK extends boolean = boolean,
  U extends boolean = boolean,
  AI extends boolean = boolean,
> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  readonly defaultValue?: string | (() => string);
  readonly autoIncrement?: AI;

  // NEW: Foreign key metadata
  readonly foreignKey?: {
    readonly table: string;          // Target table name (e.g., "users")
    readonly column: string;          // Target column name (e.g., "id")
    readonly relationName?: string;   // Optional disambiguation
  };
}
```

**Alternative**: Separate relation metadata at Model level:

```typescript
interface ModelStatics {
  // ... existing properties
  readonly relations?: ReadonlyArray<{
    readonly fieldName: string;       // Local field (e.g., "authorId")
    readonly type: "one" | "many";
    readonly targetTable: string;     // Target table name
    readonly targetColumn: string;    // Target column
    readonly relationName?: string;   // Disambiguation
  }>;
}
```

### Type-Safe Relation Generation

Challenge: Generating relations requires **references to other tables**, but Models are defined independently.

**Solution**: Multi-phase approach

1. **Phase 1: Define Models**
   ```typescript
   class User extends Model<User>("User")({ id: Field(S.String, {...}) }) {}
   class Post extends Model<Post>("Post")({
     id: Field(S.String, {...}),
     authorId: Field(S.String, { column: { type: "uuid", foreignKey: { table: "users", column: "id" } } })
   }) {}
   ```

2. **Phase 2: Generate Tables**
   ```typescript
   const users = toDrizzle(User);
   const posts = toDrizzle(Post);
   ```

3. **Phase 3: Generate Relations**
   ```typescript
   const tableMap = { users, posts };
   const relations = toDrizzleRelations([User, Post], tableMap);
   ```

### Helper Functions

**`extractRelationMetadata()`**

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";

interface RelationMeta {
  readonly sourceTable: string;
  readonly sourceField: string;
  readonly targetTable: string;
  readonly targetColumn: string;
  readonly relationType: "one" | "many";
  readonly relationName: O.Option<string>;
}

const extractRelationMetadata = <M extends ModelStatics>(
  model: M
): ReadonlyArray<RelationMeta> =>
  F.pipe(
    model.columns,
    R.toEntries,
    A.filterMap(([fieldName, def]) =>
      def.foreignKey == null
        ? O.none()
        : O.some({
            sourceTable: model.tableName,
            sourceField: fieldName,
            targetTable: def.foreignKey.table,
            targetColumn: def.foreignKey.column,
            relationType: "one" as const,
            relationName: O.fromNullable(def.foreignKey.relationName),
          })
    )
  );
```

**`inferInverseRelations()`**

For each `one()` relation, infer the inverse `many()`:

```typescript
const inferInverseRelations = (
  relations: ReadonlyArray<RelationMeta>
): ReadonlyArray<RelationMeta> =>
  F.pipe(
    relations,
    A.filter(r => r.relationType === "one"),
    A.map(r => ({
      sourceTable: r.targetTable,
      sourceField: `${r.sourceTable}s`,  // Pluralize (naive)
      targetTable: r.sourceTable,
      targetColumn: r.sourceField,
      relationType: "many" as const,
      relationName: r.relationName,
    }))
  );
```

**`buildRelationDefinition()`**

Generate a single table's relation definition:

```typescript
import { type AnyTable, type Relations, relations } from "drizzle-orm";

const buildRelationDefinition = <TTableName extends string>(
  tableName: TTableName,
  table: AnyTable<{ name: TTableName }>,
  relationMetas: ReadonlyArray<RelationMeta>,
  tableMap: Record<string, AnyTable>
): Relations<TTableName, Record<string, Relation>> => {
  const relevantRelations = F.pipe(
    relationMetas,
    A.filter(r => r.sourceTable === tableName)
  );

  return relations(table, ({ one, many }) =>
    F.pipe(
      relevantRelations,
      A.reduce({} as Record<string, Relation>, (acc, rel) => {
        const targetTable = tableMap[rel.targetTable];
        if (targetTable == null) return acc;

        if (rel.relationType === "one") {
          return {
            ...acc,
            [rel.sourceField]: one(targetTable, {
              fields: [table[rel.sourceField]],
              references: [targetTable[rel.targetColumn]],
              ...(O.isSome(rel.relationName) ? { relationName: rel.relationName.value } : {}),
            }),
          };
        } else {
          return {
            ...acc,
            [rel.sourceField]: many(targetTable,
              O.isSome(rel.relationName) ? { relationName: rel.relationName.value } : undefined
            ),
          };
        }
      })
    )
  );
};
```

## Recommended Approach

### High-Level Architecture

```typescript
/**
 * Generates Drizzle relations from DSL Models.
 *
 * @param models - Array of DSL Model classes with foreign key metadata
 * @param tableMap - Map of table names to Drizzle table instances (from toDrizzle)
 * @returns Object with relation definitions keyed by "{tableName}Relations"
 */
const toDrizzleRelations = <Models extends ReadonlyArray<ModelStatics>>(
  models: Models,
  tableMap: Record<string, AnyTable>
): Record<string, Relations> => {
  // 1. Extract foreign key metadata from all models
  const allRelations = F.pipe(
    models,
    A.flatMap(extractRelationMetadata)
  );

  // 2. Infer inverse relations (many side from one side)
  const inverseRelations = inferInverseRelations(allRelations);
  const completeRelations = A.appendAll(allRelations, inverseRelations);

  // 3. Build relation definitions for each table
  return F.pipe(
    models,
    A.map(model => {
      const table = tableMap[model.tableName];
      if (table == null) {
        throw new Error(`Table ${model.tableName} not found in tableMap`);
      }

      const relationDef = buildRelationDefinition(
        model.tableName,
        table,
        completeRelations,
        tableMap
      );

      return [`${model.tableName}Relations`, relationDef] as const;
    }),
    A.reduce({} as Record<string, Relations>, (acc, [key, def]) => ({
      ...acc,
      [key]: def,
    }))
  );
};
```

### Usage Pattern

```typescript
// 1. Define models with foreign key metadata
class User extends Model<User>("User")({
  id: Field(S.UUID, { column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String, { column: { type: "string" } }),
}) {}

class Post extends Model<Post>("Post")({
  id: Field(S.UUID, { column: { type: "uuid", primaryKey: true } }),
  title: Field(S.String, { column: { type: "string" } }),
  authorId: Field(S.UUID, {
    column: {
      type: "uuid",
      foreignKey: { table: "users", column: "id" }
    }
  }),
}) {}

// 2. Generate tables
const users = toDrizzle(User);
const posts = toDrizzle(Post);

// 3. Generate relations
const tableMap = { users, posts };
const relations = toDrizzleRelations([User, Post], tableMap);

// 4. Create schema
export const schema = {
  users,
  posts,
  ...relations,  // usersRelations, postsRelations
};

// 5. Use with drizzle
const db = drizzle(pool, { schema });

// 6. Relational queries
const result = await db.query.users.findMany({
  with: { posts: true },
});
```

### Type Safety Considerations

**Challenge**: TypeScript can't statically verify table name strings in `foreignKey.table`.

**Mitigation 1**: Runtime validation

```typescript
const validateForeignKeys = (models: ReadonlyArray<ModelStatics>): Effect.Effect<void, ValidationError> => {
  const tableNames = F.pipe(models, A.map(m => m.tableName), A.toSet);

  return F.pipe(
    models,
    A.forEach(model =>
      F.pipe(
        extractRelationMetadata(model),
        A.forEach(rel =>
          HashSet.has(tableNames, rel.targetTable)
            ? Effect.void
            : Effect.fail(new ValidationError({
                message: `Foreign key in ${rel.sourceTable}.${rel.sourceField} references unknown table: ${rel.targetTable}`
              }))
        )
      )
    ),
    Effect.asVoid
  );
};
```

**Mitigation 2**: Branded table name types

```typescript
// In DSL literals
export interface TableName extends S.brand<string> {
  readonly TableName: unique symbol;
}
export const TableName = S.String.pipe(S.brand("TableName"));

// Register at module level
const tableRegistry = new Set<string>();

export const registerTable = (name: string): Effect.Effect<void, RegistrationError> => {
  if (tableRegistry.has(name)) {
    return Effect.fail(new RegistrationError({ message: `Table ${name} already registered` }));
  }
  tableRegistry.add(name);
  return Effect.void;
};
```

### Bidirectional Relation Generation

**Key insight**: The DSL should auto-generate **both sides** of relations when possible.

**Algorithm**:
1. Scan all models for foreign keys → creates `one()` relations
2. For each `one()` relation, synthesize the inverse `many()` relation
3. Handle conflicts (multiple FKs to same table) with `relationName`
4. Allow manual override for custom relation names

**Auto-naming strategy**:
```typescript
const inferManyFieldName = (sourceTable: string): string =>
  F.pipe(
    sourceTable,
    Str.endsWith("s")
      ? F.identity  // "users" → "users"
      : (s) => `${s}s`  // "post" → "posts"
  );
```

## Trade-offs

### Approach 1: Foreign Key in ColumnDef (Recommended)

**Pros**:
- Collocated with column definition
- Simple to extract
- Aligns with Drizzle table definitions

**Cons**:
- Only supports foreign keys on single columns
- Multi-column foreign keys require separate metadata

### Approach 2: Relations at Model Level

**Pros**:
- Supports composite foreign keys
- Can define relations without foreign key constraints
- More flexible for many-to-many

**Cons**:
- Separation from column definition
- Duplicate type information (field name + target)

### Approach 3: Hybrid (Best for Complex Cases)

Use `foreignKey` in `ColumnDef` for simple cases, plus optional `Model.relations` for:
- Many-to-many relations
- Composite foreign keys
- Custom relation logic

## Alternative Approaches Considered

### Code Generation (Drizzle Kit Style)

Generate `.ts` files with relation definitions:

```typescript
// Auto-generated: schema/relations.ts
import { relations } from "drizzle-orm";
import { users, posts } from "./tables";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

**Pros**: Explicit, inspectable, no runtime overhead
**Cons**: Two-step workflow, manual regeneration, drift risk

### Schema Builder API

Fluent API for defining relations:

```typescript
const schema = SchemaBuilder()
  .model(User)
  .hasMany(Post, { foreignKey: "authorId" })
  .model(Post)
  .belongsTo(User, { foreignKey: "authorId" })
  .build();
```

**Pros**: Ruby on Rails/ActiveRecord familiarity
**Cons**: Departs from Effect/Drizzle style, hidden magic

## Migration Path

### Phase 1: Foreign Key Metadata (MVP)

1. Extend `ColumnDef` with `foreignKey` field
2. Update `Field()` to accept FK metadata
3. Implement `extractRelationMetadata()`

### Phase 2: Relation Generation

1. Implement `toDrizzleRelations()` core logic
2. Add bidirectional inference
3. Handle `relationName` disambiguation

### Phase 3: Validation & Safety

1. Runtime FK validation
2. Circular dependency detection
3. Multi-column FK support (if needed)

### Phase 4: Developer Experience

1. Code generation CLI
2. Type-safe table reference system
3. Integration with Drizzle Kit

## References

### Drizzle ORM Documentation
- [Drizzle Relations v2](https://orm.drizzle.team/docs/relations-v2)
- [Relations v1 to v2 Migration](https://orm.drizzle.team/docs/relations-v1-v2)
- [Relational Query Builder v2](https://orm.drizzle.team/docs/rqb-v2)

### beep-effect Codebase
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/sql/dsl/Model.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/tables/src/relations.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/tables/src/relations.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/tables/src/relations.ts`

### Drizzle ORM Source
- `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/drizzle-orm/relations.d.ts`

---

## Final Recommendation

**Implement `toDrizzleRelations()` with foreign key metadata in `ColumnDef`**, following this architecture:

1. **Extend `ColumnDef`** with optional `foreignKey: { table, column, relationName? }`
2. **Extract metadata** from all models using `A.flatMap` over columns
3. **Infer inverse relations** automatically (one → many)
4. **Generate per-table `relations()` calls** using Drizzle's builder pattern
5. **Return aggregated object** with `{tableName}Relations` keys
6. **Validate at runtime** that all referenced tables exist

**Rationale**:
- **Aligns with Drizzle's actual API** (per-table `relations()`, not centralized `defineRelations()`)
- **Leverages existing DSL infrastructure** (Model, Field, ColumnDef)
- **Follows Effect patterns** (functional composition, Option for nullable, validation Effects)
- **Enables type-safe relational queries** while maintaining manual override capability
- **Minimizes user boilerplate** - relations auto-generated from FK metadata

This approach balances automation with flexibility, allowing developers to:
- Define relations implicitly via foreign keys (80% case)
- Override or supplement with manual `relations()` exports (20% case)
- Maintain full type safety through Drizzle's typed APIs
