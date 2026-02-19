# Foreign Key Generation Research - DSL Module

## Executive Summary

This research establishes patterns for generating valid Drizzle foreign key definitions from relation metadata in the DSL module. Based on analysis of Drizzle ORM's API, existing codebase patterns, and PostgreSQL semantics, this document provides complete specifications for implementing foreign key generation with full type safety and migration compatibility.

**Key Findings:**
1. Drizzle supports two foreign key syntaxes: inline `.references()` and dedicated `foreignKey()` operator
2. Five foreign key actions must be supported: `cascade`, `restrict`, `no action`, `set null`, `set default`
3. Composite foreign keys require array-based column/foreignColumns configuration
4. Self-referential foreign keys need explicit type annotations or `foreignKey()` operator
5. Foreign key naming follows pattern: `{table}_{column}_fk` or custom via `name` property

---

## Problem Statement

The DSL module needs to generate Drizzle foreign key constraints from relation metadata defined at the Field or Model level. This generation must:

1. Support all PostgreSQL foreign key actions (`ON DELETE`, `ON UPDATE`)
2. Handle single and composite foreign keys
3. Generate migration-compatible SQL
4. Validate type compatibility between referencing and referenced columns
5. Support self-referential foreign keys
6. Allow custom foreign key naming

---

## Research Sources

### Drizzle ORM Documentation
- [Drizzle Indexes & Constraints](https://orm.drizzle.team/docs/indexes-constraints)
- [Drizzle Relations Guide](https://orm.drizzle.team/docs/relations)
- Source: `/node_modules/drizzle-orm/pg-core/foreign-keys.d.ts`

### Codebase Analysis
- `/packages/shared/tables/src/tables/file.table.ts` - Inline `.references()` usage
- `/packages/iam/tables/src/tables/teamMember.table.ts` - Composite foreign keys with cascade
- `/packages/documents/tables/src/tables/document.table.ts` - Self-referential foreign keys
- `/packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` - Existing Drizzle adapter

### External Resources
- [Drizzle ORM PostgreSQL Best Practices (2025)](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717)
- [Self-Referencing Foreign Keys in Drizzle ORM](https://gebna.gg/blog/self-referencing-foreign-key-typescript-drizzle-orm)

---

## Foreign Key API Analysis

### 1. Drizzle `UpdateDeleteAction` Type

```typescript
// From drizzle-orm/pg-core/foreign-keys.d.ts
type UpdateDeleteAction = 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
```

**Action Semantics:**

| Action | ON DELETE Behavior | ON UPDATE Behavior | Use Case |
|--------|-------------------|-------------------|----------|
| `cascade` | Delete child rows when parent deleted | Update child FK when parent PK updated | Strong parent-child ownership (e.g., orders → order_items) |
| `restrict` | Block parent deletion if children exist | Block parent PK update if children exist | Prevent orphaned references, explicit cleanup required |
| `no action` | Same as `restrict` (default) | Same as `restrict` (default) | PostgreSQL default, compatible with SQL standard |
| `set null` | Set child FK to NULL when parent deleted | Set child FK to NULL when parent PK updated | Optional relationships (requires nullable FK column) |
| `set default` | Set child FK to default when parent deleted | Set child FK to default when parent PK updated | Fallback to default parent (requires DEFAULT clause) |

**Critical Insight:** `restrict` and `no action` are functionally identical in PostgreSQL. `no action` is the SQL standard default and is included for compatibility.

### 2. Inline `.references()` Syntax

Used for single-column foreign keys defined directly on the column:

```typescript
import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: integer('id').primaryKey(),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});
```

**Characteristics:**
- Concise, pipe-friendly syntax
- Foreign key name auto-generated: `{table}_{column}_fk`
- Single column only (no composite keys)
- Lazy reference via `() => table.column` for circular dependencies

**Generated SQL:**
```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id TEXT NOT NULL,
  CONSTRAINT posts_author_id_fk FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
```

### 3. Dedicated `foreignKey()` Operator Syntax

Used for composite foreign keys, custom naming, or self-referential keys:

```typescript
import { pgTable, foreignKey, text, integer } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: integer('id').primaryKey(),
  authorId: text('author_id').notNull(),
}, (table) => [
  foreignKey({
    name: "posts_author_fk",
    columns: [table.authorId],
    foreignColumns: [users.id],
  })
    .onDelete('cascade')
    .onUpdate('cascade')
]);
```

**Characteristics:**
- Supports composite foreign keys (multiple columns)
- Explicit naming via `name` parameter
- Required for self-referential foreign keys (TypeScript limitation)
- Builder pattern with `.onDelete()` and `.onUpdate()` methods

**Generated SQL:**
```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id TEXT NOT NULL,
  CONSTRAINT posts_author_fk FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
```

### 4. Composite Foreign Key Example

```typescript
import { pgTable, foreignKey, text, primaryKey } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  firstName: text('first_name'),
  lastName: text('last_name'),
}, (table) => [
  primaryKey({ columns: [table.firstName, table.lastName] })
]);

export const profile = pgTable('profile', {
  id: text('id').primaryKey(),
  userFirstName: text('user_first_name'),
  userLastName: text('user_last_name'),
}, (table) => [
  foreignKey({
    columns: [table.userFirstName, table.userLastName],
    foreignColumns: [user.firstName, user.lastName],
    name: 'profile_user_fk'
  })
    .onDelete('cascade')
]);
```

**Generated SQL:**
```sql
CREATE TABLE profile (
  id TEXT PRIMARY KEY,
  user_first_name TEXT,
  user_last_name TEXT,
  CONSTRAINT profile_user_fk FOREIGN KEY (user_first_name, user_last_name)
    REFERENCES user(first_name, last_name) ON DELETE CASCADE
);
```

### 5. Self-Referential Foreign Key Example

```typescript
import { pgTable, serial, text, integer, AnyPgColumn } from 'drizzle-orm/pg-core';

// Approach 1: Explicit type annotation
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  name: text('name'),
  parentId: integer('parent_id').references((): AnyPgColumn => user.id),
});

// Approach 2: foreignKey operator (preferred for DSL)
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  name: text('name'),
  parentId: integer('parent_id'),
}, (table) => [
  foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
    name: 'user_parent_fk'
  })
]);
```

**Generated SQL:**
```sql
CREATE TABLE user (
  id SERIAL PRIMARY KEY,
  name TEXT,
  parent_id INTEGER,
  CONSTRAINT user_parent_fk FOREIGN KEY (parent_id) REFERENCES user(id)
);
```

---

## DSL Integration Pattern

### Current DSL Architecture

Based on analysis of existing DSL code:

1. **Column Metadata Storage** - Uses `ColumnMetaSymbol` with annotations API
2. **Type-Safe Extraction** - Conditional types validate schema/column compatibility
3. **Combinator Style** - Pipe-friendly transformers (e.g., `DSL.uuid`, `DSL.primaryKey`)
4. **Lazy References** - Thunks `() => Model` for circular dependencies
5. **Drizzle Adapter** - `toDrizzle()` converts DSL Models to Drizzle tables

### Proposed Foreign Key Metadata Structure

```typescript
// Foreign key configuration (DSL layer)
export interface ForeignKeyConfig {
  readonly onDelete?: ForeignKeyAction;
  readonly onUpdate?: ForeignKeyAction;
  readonly name?: string;
}

export type ForeignKeyAction = 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';

// Field-level reference metadata
export interface FieldReference<
  Target extends ModelClass = ModelClass,
  TargetField extends string = string,
> {
  readonly target: () => Target;
  readonly field: TargetField;
  readonly foreignKey?: ForeignKeyConfig;
}

// Symbol for attaching reference metadata
export const ReferenceMetaSymbol: unique symbol = Symbol.for($I`reference-meta`);
```

### Extended Field Configuration

```typescript
// Extend existing FieldConfig with references
export interface FieldConfig<C extends Partial<ColumnDef> = Partial<ColumnDef>> {
  readonly column?: C;
  readonly references?: FieldReference; // NEW
}

// DSLField with reference metadata
export interface DSLFieldWithRef<A, I, R, C extends ColumnDef, Target, TargetField>
  extends DSLField<A, I, R, C> {
  readonly [ReferenceMetaSymbol]: FieldReference<Target, TargetField>;
}
```

### Foreign Key Combinator

```typescript
/**
 * Attaches foreign key reference metadata to a DSLField.
 * Uses lazy target reference to support circular dependencies.
 *
 * @example
 * ```ts
 * import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
 *
 * const authorIdField = UserId.pipe(
 *   DSL.uuid,
 *   DSL.references(() => User, "id", { onDelete: "cascade" })
 * );
 * ```
 */
export const references = <Target extends ModelClass, TargetField extends string>(
  target: () => Target,
  field: TargetField,
  foreignKey?: ForeignKeyConfig
) => <A, I, R, C extends ColumnDef>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): DSLFieldWithRef<A, I, R, C, Target, TargetField> => {
  const refMeta: FieldReference<Target, TargetField> = {
    target,
    field,
    foreignKey,
  };

  // Attach via annotations API
  const annotated = self.annotations({
    [ReferenceMetaSymbol]: refMeta,
  });

  // Also attach as direct property for runtime access
  return Object.assign(annotated, {
    [ReferenceMetaSymbol]: refMeta,
  }) as DSLFieldWithRef<A, I, R, C, Target, TargetField>;
};
```

---

## Foreign Key Generation Algorithm

### 1. Extract Foreign Keys from Model

```typescript
/**
 * Extracts foreign key metadata from a DSL Model's fields.
 * Returns array of ForeignKeyDef for Drizzle generation.
 */
export const extractForeignKeys = <M extends ModelStatics>(
  model: M
): readonly ForeignKeyDef[] =>
  F.pipe(
    model._fields,
    Struct.entries,
    A.filterMap(([fieldName, field]) => {
      // Check for ReferenceMetaSymbol
      if (field == null || typeof field !== "object") return O.none();

      const refMeta = (field as any)[ReferenceMetaSymbol] as FieldReference | undefined;
      if (refMeta === undefined) return O.none();

      // Resolve target model
      const targetModel = refMeta.target();
      const targetTableName = targetModel.tableName;

      // Build ForeignKeyDef
      const fkDef: ForeignKeyDef = {
        name: refMeta.foreignKey?.name ?? `${model.tableName}_${fieldName}_fk`,
        columns: [fieldName],
        foreignTable: targetTableName,
        foreignColumns: [refMeta.field],
        onDelete: refMeta.foreignKey?.onDelete,
        onUpdate: refMeta.foreignKey?.onUpdate,
      };

      return O.some(fkDef);
    })
  );

export interface ForeignKeyDef {
  readonly name: string;
  readonly columns: readonly string[];
  readonly foreignTable: string;
  readonly foreignColumns: readonly string[];
  readonly onDelete?: ForeignKeyAction;
  readonly onUpdate?: ForeignKeyAction;
}
```

### 2. Generate Drizzle Foreign Key Constraints

```typescript
/**
 * Converts ForeignKeyDef array to Drizzle foreignKey() builders.
 * Returns array of constraint callbacks for pgTable's second argument.
 */
export const toDrizzleForeignKeys = <M extends ModelStatics>(
  model: M,
  tableRef: PgTableWithColumns<any>,
  schemaRef: Record<string, PgTableWithColumns<any>>
): readonly ForeignKeyBuilder[] =>
  F.pipe(
    extractForeignKeys(model),
    A.map((fkDef) => {
      // Resolve foreign table reference
      const foreignTable = schemaRef[fkDef.foreignTable];
      if (foreignTable === undefined) {
        throw new Error(
          `Foreign table '${fkDef.foreignTable}' not found in schema registry. ` +
          `Available tables: ${Object.keys(schemaRef).join(", ")}`
        );
      }

      // Map column names to table column references
      const columns = F.pipe(
        fkDef.columns,
        A.map((colName) => {
          const col = tableRef[colName as keyof typeof tableRef];
          if (col === undefined) {
            throw new Error(`Column '${colName}' not found on table '${model.tableName}'`);
          }
          return col as PgColumn;
        })
      );

      const foreignColumns = F.pipe(
        fkDef.foreignColumns,
        A.map((colName) => {
          const col = foreignTable[colName as keyof typeof foreignTable];
          if (col === undefined) {
            throw new Error(
              `Foreign column '${colName}' not found on table '${fkDef.foreignTable}'`
            );
          }
          return col as PgColumn;
        })
      );

      // Build foreignKey with actions
      let builder = pg.foreignKey({
        name: fkDef.name,
        columns,
        foreignColumns,
      });

      if (fkDef.onDelete !== undefined) {
        builder = builder.onDelete(fkDef.onDelete);
      }

      if (fkDef.onUpdate !== undefined) {
        builder = builder.onUpdate(fkDef.onUpdate);
      }

      return builder;
    })
  );
```

### 3. Integrate with `toDrizzle()`

```typescript
/**
 * Extended toDrizzle with foreign key generation support.
 * Requires schema registry for resolving foreign table references.
 */
export const toDrizzle = <M extends ModelStatics>(
  model: M,
  options?: {
    schemaRegistry?: Record<string, PgTableWithColumns<any>>;
  }
): PgTableWithColumns<...> => {
  // Generate column definitions (existing logic)
  const columnDefs = F.pipe(
    model.columns,
    Struct.entries,
    A.map(([key, def]) => {
      const field = model._fields[key];
      return [key, columnBuilder(key, def, field)] as const;
    }),
    A.reduce({} as any, (acc, [k, v]) => ({ ...acc, [k]: v }))
  );

  // Generate table with optional foreign keys
  if (options?.schemaRegistry !== undefined) {
    return pg.pgTable(
      model.tableName,
      columnDefs,
      (table) => toDrizzleForeignKeys(model, table, options.schemaRegistry)
    );
  }

  // No foreign keys (backward compatible)
  return pg.pgTable(model.tableName, columnDefs);
};
```

---

## Foreign Key Naming Convention

### Default Naming Pattern

```typescript
const generateForeignKeyName = (
  tableName: string,
  columnName: string
): string => `${tableName}_${columnName}_fk`;
```

**Examples:**
- `posts.authorId` → `posts_author_id_fk`
- `comments.postId` → `comments_post_id_fk`
- `team_members.userId` → `team_members_user_id_fk`

### Composite Foreign Key Naming

```typescript
const generateCompositeFKName = (
  tableName: string,
  columnNames: readonly string[]
): string => {
  const columnsStr = F.pipe(columnNames, A.join("_"));
  return `${tableName}_${columnsStr}_fk`;
};
```

**Examples:**
- `profile.[userFirstName, userLastName]` → `profile_user_first_name_user_last_name_fk`
- `order_items.[orderId, productId]` → `order_items_order_id_product_id_fk`

### Custom Naming

Allow override via `ForeignKeyConfig.name`:

```typescript
const authorIdField = UserId.pipe(
  DSL.uuid,
  DSL.references(() => User, "id", {
    name: "custom_author_fk",
    onDelete: "cascade"
  })
);
```

---

## Validation Requirements

### 1. Field Existence Validation (Compile-Time)

```typescript
/**
 * Validates that target field exists on target model.
 * Produces compile error with helpful message if field missing.
 */
type ValidateFieldExists<
  Target extends ModelClass,
  Field extends string
> = Field extends keyof ExtractFields<Target>
  ? Field
  : FieldNotFoundError<Target, Field>;

interface FieldNotFoundError<M extends ModelClass, F extends string> {
  readonly _tag: "FieldNotFoundError";
  readonly message: `Field '${F}' does not exist on model '${M["identifier"]}'. Available fields: ${keyof ExtractFields<M> & string}`;
}
```

### 2. Type Compatibility Validation (Compile-Time)

```typescript
/**
 * Validates that FK column type matches PK column type.
 * Ensures referential integrity at type level.
 */
type ValidateForeignKeyTypes<
  FromModel extends ModelClass,
  FromField extends string,
  ToModel extends ModelClass,
  ToField extends string
> = ExtractEncodedType<FromModel["_fields"][FromField]> extends ExtractEncodedType<ToModel["_fields"][ToField]>
  ? true
  : TypeMismatchError<FromModel, FromField, ToModel, ToField>;

interface TypeMismatchError<FM, FF, TM, TF> {
  readonly _tag: "TypeMismatchError";
  readonly message: `Foreign key type mismatch: ${FM["tableName"]}.${FF & string} (${PrettyPrintType<ExtractEncodedType<FM["_fields"][FF]>>}) does not match ${TM["tableName"]}.${TF & string} (${PrettyPrintType<ExtractEncodedType<TM["_fields"][TF]>>})`;
}
```

### 3. Nullability Validation (Compile-Time)

```typescript
/**
 * Validates that SET NULL action is only used with nullable columns.
 * Prevents runtime constraint violations.
 */
type ValidateSetNullAction<
  Field extends DSL.Fields[string],
  Action extends ForeignKeyAction | undefined
> = Action extends "set null"
  ? IsFieldNullable<Field> extends true
    ? true
    : SetNullRequiresNullableError<Field>
  : true;

interface SetNullRequiresNullableError<F> {
  readonly _tag: "SetNullRequiresNullableError";
  readonly message: "ON DELETE SET NULL or ON UPDATE SET NULL requires a nullable foreign key column. Use S.NullOr(), S.UndefinedOr(), or S.NullishOr() to make the column nullable.";
}
```

### 4. Schema Registry Validation (Runtime)

```typescript
/**
 * Validates that all foreign tables exist in schema registry.
 * Throws descriptive error with available tables if missing.
 */
const validateSchemaRegistry = (
  foreignKeys: readonly ForeignKeyDef[],
  schemaRegistry: Record<string, PgTableWithColumns<any>>
): void => {
  F.pipe(
    foreignKeys,
    A.forEach((fk) => {
      if (schemaRegistry[fk.foreignTable] === undefined) {
        const available = F.pipe(Struct.keys(schemaRegistry), A.join(", "));
        throw new Error(
          `Foreign table '${fk.foreignTable}' not found in schema registry.\n` +
          `Available tables: ${available}\n` +
          `Hint: Ensure all models are converted to Drizzle tables before calling toDrizzle() with schemaRegistry.`
        );
      }
    })
  );
};
```

---

## Composite Foreign Key Support

### DSL Representation

For composite foreign keys, extend the reference metadata to support multiple columns:

```typescript
export interface CompositeFieldReference<
  Target extends ModelClass = ModelClass,
  TargetFields extends readonly string[] = readonly string[],
> {
  readonly target: () => Target;
  readonly fields: TargetFields;
  readonly localFields: readonly string[];
  readonly foreignKey?: ForeignKeyConfig;
}

// Combinator for composite references
export const referencesComposite = <
  Target extends ModelClass,
  LocalFields extends readonly string[],
  TargetFields extends readonly string[]
>(
  target: () => Target,
  localFields: LocalFields,
  targetFields: TargetFields,
  foreignKey?: ForeignKeyConfig
) => <M extends ModelStatics>(
  model: M
): CompositeFieldReference<Target, TargetFields> => ({
  target,
  fields: targetFields,
  localFields,
  foreignKey,
});
```

### Usage Example

```typescript
class Profile extends Model<Profile>("Profile")({
  id: Field(ProfileId)({ column: { type: "uuid", primaryKey: true } }),
  userFirstName: Field(S.String)({ column: { type: "string" } }),
  userLastName: Field(S.String)({ column: { type: "string" } }),
}, {
  compositeReferences: {
    user: DSL.referencesComposite(
      () => User,
      ["userFirstName", "userLastName"],
      ["firstName", "lastName"],
      { onDelete: "cascade", name: "profile_user_fk" }
    ),
  },
}) {}
```

**Note:** Composite foreign keys are less common in practice. Recommendation is to implement single-column foreign keys first, then add composite support if needed.

---

## Self-Referential Foreign Key Handling

### Challenge

TypeScript circular reference limitations require special handling for self-referential foreign keys.

### Solution 1: Lazy Target Resolution (Preferred)

Use thunk `() => Model` everywhere, including self-references:

```typescript
class Category extends Model<Category>("Category")({
  id: Field(CategoryId)({ column: { type: "uuid", primaryKey: true } }),
  parentId: Field(CategoryId)({
    column: { type: "uuid" },
    references: {
      target: () => Category, // Lazy self-reference
      field: "id",
      foreignKey: { onDelete: "cascade" }
    }
  }),
  name: Field(S.String)({ column: { type: "string" } }),
}) {}
```

### Solution 2: Model-Level Relations (Alternative)

Define self-referential relationships at model level instead of field level:

```typescript
class Category extends Model<Category>("Category")({
  id: Field(CategoryId)({ column: { type: "uuid", primaryKey: true } }),
  parentId: Field(CategoryId)({ column: { type: "uuid" } }),
  name: Field(S.String)({ column: { type: "string" } }),
}, {
  relations: {
    parent: Relation.one(() => Category, {
      from: "parentId",
      to: "id",
      optional: true, // Nullable FK
      foreignKey: { onDelete: "cascade" }
    }),
    children: Relation.many(() => Category, {
      from: "id",
      to: "parentId",
    }),
  },
}) {}
```

**Recommendation:** Use Solution 1 (lazy target resolution) for consistency with existing DSL patterns.

---

## Migration Compatibility

### Generated SQL Correctness

Foreign keys generated by `toDrizzle()` must produce valid SQL for Drizzle Kit migrations:

```typescript
// DSL Model
class Post extends Model<Post>("Post")({
  id: Field(PostId)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(UserId)({
    column: { type: "uuid" },
    references: {
      target: () => User,
      field: "id",
      foreignKey: { onDelete: "cascade", onUpdate: "no action" }
    }
  }),
}) {}

// Generated Drizzle Table
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().$type<PostId>(),
  author_id: uuid('author_id').notNull().$type<UserId>(),
}, (table) => [
  foreignKey({
    name: 'posts_author_id_fk',
    columns: [table.authorId],
    foreignColumns: [users.id],
  })
    .onDelete('cascade')
    .onUpdate('no action')
]);

// Generated SQL (via drizzle-kit generate)
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID NOT NULL,
  CONSTRAINT posts_author_id_fk FOREIGN KEY (author_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);
```

### Index Generation for Foreign Keys

Foreign keys benefit from indexes on the referencing columns for join performance:

```typescript
export const toDrizzle = <M extends ModelStatics>(
  model: M,
  options?: {
    schemaRegistry?: Record<string, PgTableWithColumns<any>>;
    autoIndexForeignKeys?: boolean; // NEW option
  }
): PgTableWithColumns<...> => {
  // ... existing logic ...

  if (options?.autoIndexForeignKeys === true) {
    const fkIndexes = F.pipe(
      extractForeignKeys(model),
      A.map((fk) =>
        pg.index(`${model.tableName}_${fk.columns[0]}_idx`).on(table[fk.columns[0]])
      )
    );

    return pg.pgTable(
      model.tableName,
      columnDefs,
      (table) => [
        ...toDrizzleForeignKeys(model, table, options.schemaRegistry),
        ...fkIndexes
      ]
    );
  }

  // ... rest of logic ...
};
```

**Recommendation:** Make `autoIndexForeignKeys` opt-in to avoid unexpected index generation.

---

## Code Examples

### Complete Generation Pipeline

```typescript
import * as DSL from "@beep/schema/integrations/sql/dsl";
import { UserId, PostId } from "@beep/shared-domain";

// 1. Define Models with foreign key references
class User extends DSL.Model<User>("User")({
  id: DSL.Field(UserId)({
    column: { type: "uuid", primaryKey: true }
  }),
  email: DSL.Field(S.String)({
    column: { type: "string", unique: true }
  }),
}) {}

class Post extends DSL.Model<Post>("Post")({
  id: DSL.Field(PostId)({
    column: { type: "uuid", primaryKey: true }
  }),
  authorId: DSL.Field(UserId)({
    column: { type: "uuid" },
    references: {
      target: () => User,
      field: "id",
      foreignKey: {
        onDelete: "cascade",
        onUpdate: "cascade",
        name: "posts_author_fk"
      }
    }
  }),
  title: DSL.Field(S.String)({
    column: { type: "string" }
  }),
}) {}

// 2. Convert to Drizzle tables (without foreign keys first)
const users = DSL.toDrizzle(User);
const posts = DSL.toDrizzle(Post);

// 3. Register schema
const schemaRegistry = { users, posts };

// 4. Regenerate with foreign keys
const postsWithFK = DSL.toDrizzle(Post, { schemaRegistry });

// 5. Use in Drizzle client
const db = drizzle(connection, {
  schema: {
    users,
    posts: postsWithFK,
  }
});
```

### Using Pipe-Friendly Combinator

```typescript
import * as S from "effect/Schema";
import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";

// Combinator-style foreign key definition
const authorIdField = UserId.pipe(
  DSL.uuid,
  DSL.references(() => User, "id", {
    onDelete: "cascade",
    onUpdate: "no action"
  })
);

class Post extends DSL.Model<Post>("Post")({
  id: PostId.pipe(DSL.uuid, DSL.primaryKey),
  authorId: authorIdField,
  title: S.String.pipe(DSL.string),
}) {}
```

### Self-Referential Example

```typescript
class Category extends DSL.Model<Category>("Category")({
  id: CategoryId.pipe(DSL.uuid, DSL.primaryKey),
  parentId: S.NullOr(CategoryId).pipe(
    DSL.uuid,
    DSL.references(() => Category, "id", {
      onDelete: "set null", // Requires nullable column
      name: "category_parent_fk"
    })
  ),
  name: S.String.pipe(DSL.string),
}) {}

// Generated Drizzle
const categories = pgTable('categories', {
  id: uuid('id').primaryKey().$type<CategoryId>(),
  parent_id: uuid('parent_id').$type<CategoryId | null>(), // Nullable
  name: text('name').notNull(),
}, (table) => [
  foreignKey({
    name: 'category_parent_fk',
    columns: [table.parentId],
    foreignColumns: [table.id],
  }).onDelete('set null')
]);
```

---

## Implementation Recommendation

### Phase 1: Core Infrastructure (Priority: High)

**Files to Create/Modify:**
- `types.ts` - Add `ForeignKeyAction`, `ForeignKeyConfig`, `FieldReference`, `ReferenceMetaSymbol`
- `combinators.ts` - Add `references()` combinator

**Rationale:** Establishes foundation for attaching foreign key metadata to fields.

### Phase 2: Extraction & Generation (Priority: High)

**Files to Create:**
- `foreign-keys.ts` - Implement `extractForeignKeys()` and `toDrizzleForeignKeys()`

**Rationale:** Core logic for converting DSL metadata to Drizzle foreign keys.

### Phase 3: Integration (Priority: High)

**Files to Modify:**
- `adapters/drizzle.ts` - Extend `toDrizzle()` with `schemaRegistry` option

**Rationale:** Complete the generation pipeline.

### Phase 4: Validation (Priority: Medium)

**Files to Modify:**
- `types.ts` - Add compile-time validation types (`ValidateFieldExists`, `ValidateForeignKeyTypes`, `ValidateSetNullAction`)

**Rationale:** Catch errors at compile time instead of runtime.

### Phase 5: Composite Foreign Keys (Priority: Low)

**Files to Modify:**
- `types.ts` - Add `CompositeFieldReference`
- `combinators.ts` - Add `referencesComposite()`
- `foreign-keys.ts` - Extend extraction logic

**Rationale:** Composite foreign keys are rare. Implement only if needed.

### Recommended Implementation Order

1. **Start with inline reference approach** (field-level metadata)
2. **Use `foreignKey()` operator for generation** (more flexible, handles all cases)
3. **Add compile-time validation incrementally** (start with field existence)
4. **Defer composite foreign keys** (wait for real-world use case)

### Schema Registry Pattern

**Two-Pass Conversion:**
```typescript
// Pass 1: Convert models to Drizzle tables (no foreign keys)
const users = DSL.toDrizzle(User);
const posts = DSL.toDrizzle(Post);

// Pass 2: Regenerate with foreign keys
const schemaRegistry = { users, posts };
const postsWithFK = DSL.toDrizzle(Post, { schemaRegistry });

// Final schema
const schema = {
  users,
  posts: postsWithFK,
};
```

**Rationale:** Avoids circular dependency issues when resolving foreign table references.

---

## Trade-Offs Analysis

### Approach 1: Inline `.references()` Only

**Pros:**
- Concise syntax
- Follows existing beep-effect patterns (see `file.table.ts`)
- No need for schema registry

**Cons:**
- Cannot handle composite foreign keys
- Auto-generated FK names (less control)
- Harder to extract for relation generation

**Verdict:** ❌ Insufficient for full DSL feature set

### Approach 2: `foreignKey()` Operator Only

**Pros:**
- Supports composite foreign keys
- Explicit naming
- Easier to extract metadata
- Handles self-referential keys

**Cons:**
- Requires schema registry
- More verbose generation code
- Two-pass conversion needed

**Verdict:** ✅ **Recommended** - More flexible, handles all cases

### Approach 3: Hybrid (Both Syntaxes)

**Pros:**
- Use inline for simple cases, `foreignKey()` for complex
- Backward compatible with existing tables

**Cons:**
- Complexity in choosing which to use
- Inconsistent code style

**Verdict:** ⚠️ Possible future optimization, but start with `foreignKey()` only

---

## Testing Strategy

### Unit Tests

```typescript
describe("Foreign Key Extraction", () => {
  it("should extract single-column foreign key with actions", () => {
    class Post extends Model<Post>("Post")({
      authorId: UserId.pipe(
        DSL.uuid,
        DSL.references(() => User, "id", {
          onDelete: "cascade",
          onUpdate: "no action"
        })
      ),
    }) {}

    const fks = extractForeignKeys(Post);

    expect(fks).toHaveLength(1);
    expect(fks[0]).toMatchObject({
      name: "posts_author_id_fk",
      columns: ["authorId"],
      foreignTable: "users",
      foreignColumns: ["id"],
      onDelete: "cascade",
      onUpdate: "no action",
    });
  });

  it("should use custom foreign key name when provided", () => {
    class Post extends Model<Post>("Post")({
      authorId: UserId.pipe(
        DSL.uuid,
        DSL.references(() => User, "id", {
          name: "custom_fk",
          onDelete: "cascade"
        })
      ),
    }) {}

    const fks = extractForeignKeys(Post);
    expect(fks[0].name).toBe("custom_fk");
  });

  it("should handle self-referential foreign keys", () => {
    class Category extends Model<Category>("Category")({
      id: CategoryId.pipe(DSL.uuid, DSL.primaryKey),
      parentId: S.NullOr(CategoryId).pipe(
        DSL.uuid,
        DSL.references(() => Category, "id", { onDelete: "set null" })
      ),
    }) {}

    const fks = extractForeignKeys(Category);

    expect(fks[0]).toMatchObject({
      foreignTable: "categories",
      foreignColumns: ["id"],
      onDelete: "set null",
    });
  });
});

describe("Drizzle Foreign Key Generation", () => {
  it("should generate valid Drizzle foreignKey builder", () => {
    const users = DSL.toDrizzle(User);
    const posts = DSL.toDrizzle(Post);
    const schemaRegistry = { users, posts };

    const postsTable = DSL.toDrizzle(Post, { schemaRegistry });

    // Verify foreign key constraint exists
    // (Integration test - check generated SQL)
  });

  it("should throw error if foreign table not in registry", () => {
    const posts = DSL.toDrizzle(Post);

    expect(() => {
      DSL.toDrizzle(Post, { schemaRegistry: { posts } }); // Missing 'users'
    }).toThrow(/Foreign table 'users' not found in schema registry/);
  });
});
```

### Type Tests

```typescript
// Type test: Field existence validation
class User extends Model<User>("User")({
  id: UserId.pipe(DSL.uuid, DSL.primaryKey),
}) {}

class Post extends Model<Post>("Post")({
  authorId: UserId.pipe(
    DSL.uuid,
    // @ts-expect-error - field 'nonexistent' does not exist on User
    DSL.references(() => User, "nonexistent")
  ),
}) {}

// Type test: Type compatibility validation
class Post extends Model<Post>("Post")({
  // @ts-expect-error - authorId (number) incompatible with User.id (string)
  authorId: S.Int.pipe(
    DSL.integer,
    DSL.references(() => User, "id")
  ),
}) {}

// Type test: SET NULL requires nullable column
class Post extends Model<Post>("Post")({
  // @ts-expect-error - onDelete: "set null" requires nullable column
  authorId: UserId.pipe(
    DSL.uuid,
    DSL.references(() => User, "id", { onDelete: "set null" })
  ),
}) {}

// ✅ Correct - nullable column with SET NULL
class Post extends Model<Post>("Post")({
  authorId: S.NullOr(UserId).pipe(
    DSL.uuid,
    DSL.references(() => User, "id", { onDelete: "set null" })
  ),
}) {}
```

### Integration Tests

```typescript
describe("Foreign Key Integration", () => {
  it("should generate correct SQL via drizzle-kit", async () => {
    // Define models with foreign keys
    // Convert to Drizzle tables
    // Run drizzle-kit generate
    // Verify generated SQL contains:
    // - CONSTRAINT clause
    // - ON DELETE/ON UPDATE actions
    // - Correct column/table references
  });

  it("should enforce foreign key constraints in database", async () => {
    // Insert parent record
    // Insert child record with valid FK
    // Attempt to delete parent (should cascade delete child)
    // Verify child record deleted
  });
});
```

---

## References

### Drizzle ORM Documentation
- [Indexes & Constraints](https://orm.drizzle.team/docs/indexes-constraints)
- [Relations Guide](https://orm.drizzle.team/docs/relations)
- [PostgreSQL Best Practices (2025)](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717)

### Codebase Files
- `/packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- `/packages/common/schema/src/integrations/sql/dsl/Model.ts`
- `/packages/common/schema/src/integrations/sql/dsl/types.ts`
- `/packages/common/schema/src/integrations/sql/dsl/combinators.ts`
- `/packages/shared/tables/src/tables/file.table.ts`
- `/packages/iam/tables/src/tables/teamMember.table.ts`
- `/node_modules/drizzle-orm/pg-core/foreign-keys.d.ts`

### External Resources
- [Self-Referencing Foreign Keys in Drizzle ORM](https://gebna.gg/blog/self-referencing-foreign-key-typescript-drizzle-orm)
- [Drizzle ORM PR #1636 - Add actions to foreignKey](https://github.com/drizzle-team/drizzle-orm/pull/1636)

---

## Appendix: Complete Type Definitions

```typescript
// ============================================================================
// Foreign Key Types
// ============================================================================

/**
 * PostgreSQL foreign key actions for ON DELETE and ON UPDATE.
 * @since 1.0.0
 */
export type ForeignKeyAction =
  | 'cascade'
  | 'restrict'
  | 'no action'
  | 'set null'
  | 'set default';

/**
 * Foreign key configuration for DSL fields.
 * @since 1.0.0
 */
export interface ForeignKeyConfig {
  /** Action when referenced row is deleted */
  readonly onDelete?: ForeignKeyAction;
  /** Action when referenced row's PK is updated */
  readonly onUpdate?: ForeignKeyAction;
  /** Custom constraint name (default: {table}_{column}_fk) */
  readonly name?: string;
}

/**
 * Field-level reference metadata.
 * @since 1.0.0
 */
export interface FieldReference<
  Target extends ModelClass = ModelClass,
  TargetField extends string = string,
> {
  /** Lazy target model reference (supports circular dependencies) */
  readonly target: () => Target;
  /** Target field name (usually primary key) */
  readonly field: TargetField;
  /** Foreign key actions configuration */
  readonly foreignKey?: ForeignKeyConfig;
}

/**
 * Symbol for attaching reference metadata to DSLFields.
 * @since 1.0.0
 */
export const ReferenceMetaSymbol: unique symbol = Symbol.for($I`reference-meta`);

/**
 * DSLField with reference metadata attached.
 * @since 1.0.0
 */
export interface DSLFieldWithRef<A, I, R, C extends ColumnDef, Target, TargetField>
  extends DSLField<A, I, R, C> {
  readonly [ReferenceMetaSymbol]: FieldReference<Target, TargetField>;
}

/**
 * Foreign key definition extracted from model metadata.
 * Used for Drizzle generation.
 * @since 1.0.0
 */
export interface ForeignKeyDef {
  /** Constraint name */
  readonly name: string;
  /** Local column names */
  readonly columns: readonly string[];
  /** Foreign table name */
  readonly foreignTable: string;
  /** Foreign column names */
  readonly foreignColumns: readonly string[];
  /** ON DELETE action */
  readonly onDelete?: ForeignKeyAction;
  /** ON UPDATE action */
  readonly onUpdate?: ForeignKeyAction;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validates that a field exists on a model.
 * @since 1.0.0
 */
type ValidateFieldExists<
  Target extends ModelClass,
  Field extends string
> = Field extends keyof ExtractFields<Target>
  ? Field
  : FieldNotFoundError<Target, Field>;

interface FieldNotFoundError<M extends ModelClass, F extends string> {
  readonly _tag: "FieldNotFoundError";
  readonly message: `Field '${F}' does not exist on model '${M["identifier"]}'. Available fields: ${keyof ExtractFields<M> & string}`;
}

/**
 * Validates that FK and PK types are compatible.
 * @since 1.0.0
 */
type ValidateForeignKeyTypes<
  FromModel extends ModelClass,
  FromField extends string,
  ToModel extends ModelClass,
  ToField extends string
> = ExtractEncodedType<FromModel["_fields"][FromField]> extends ExtractEncodedType<ToModel["_fields"][ToField]>
  ? true
  : TypeMismatchError<FromModel, FromField, ToModel, ToField>;

interface TypeMismatchError<FM, FF, TM, TF> {
  readonly _tag: "TypeMismatchError";
  readonly message: `Foreign key type mismatch: ${FM["tableName"]}.${FF & string} does not match ${TM["tableName"]}.${TF & string}`;
}

/**
 * Validates that SET NULL action is only used with nullable columns.
 * @since 1.0.0
 */
type ValidateSetNullAction<
  Field extends DSL.Fields[string],
  Action extends ForeignKeyAction | undefined
> = Action extends "set null"
  ? IsFieldNullable<Field> extends true
    ? true
    : SetNullRequiresNullableError<Field>
  : true;

interface SetNullRequiresNullableError<F> {
  readonly _tag: "SetNullRequiresNullableError";
  readonly message: "ON DELETE SET NULL or ON UPDATE SET NULL requires a nullable foreign key column.";
}
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-28
**Author:** Effect-TS Research Agent
**Status:** Complete - Ready for Implementation
