---
name: dsl-relations-implementation
version: 4
created: 2025-01-06T12:00:00Z
iterations: 3
---

# DSL Relations Implementation - Refined Prompt

## Overview

This prompt orchestrates the implementation of an entity relationship metadata system for the DSL module using a **phased approach** with sub-agent deployment.

### Implementation Phases

| Phase | Name             | Description                                                 | Agent Pattern                |
|-------|------------------|-------------------------------------------------------------|------------------------------|
| **1** | Boilerplating    | Create files, stubs, types & schemas (no implementations)   | Parallel sub-agents per file |
| **2** | Type-Level Tests | Validate all types & schemas work correctly at compile-time | test-writer agents           |
| **3** | Implementation   | Fill in commented stubs with working code                   | effect-code-writer agents    |
| **4** | Runtime Tests    | Add runtime tests for all functionality                     | test-writer agents           |

**CRITICAL**: Phase 1 stubs must be **commented out** to ensure type-level tests drive the design in Phase 2.

---

## Context

You are implementing an entity relationship metadata system for the DSL module in a production Effect-first TypeScript monorepo (`beep-effect`). The DSL provides a type-safe layer for defining database models with Effect Schema integration and Drizzle ORM output.

### Codebase Structure

**Target Module**: `packages/common/schema/src/integrations/sql/dsl/`
```
├── Field.ts           # MODIFY: Extend to handle references config
├── Model.ts           # MODIFY: Extend to accept relations in config
├── types.ts           # MODIFY: Add relation types, extend FieldConfig
├── combinators.ts     # MODIFY: Add relation combinators (optional)
├── relations.ts       # EXISTS (empty) → IMPLEMENT: Core relation primitives
├── literals.ts        # ColumnType, ModelVariant literal kits (no changes)
├── nullability.ts     # AST-based nullable detection (no changes)
├── foreign-keys.ts    # NEW: FK extraction and generation utilities
├── adapters/
│   ├── drizzle.ts                  # MODIFY: Add FK generation option
│   ├── drizzle-to-effect-schema.ts # EXISTS: Schema conversion (no changes)
│   └── drizzle-relations.ts        # NEW: Drizzle defineRelations generation
└── index.ts           # MODIFY: Export new APIs
```

**File Organization Rationale:**
- `relations.ts` - Relation constructors (`Relation.one`, `Relation.many`, etc.)
- `foreign-keys.ts` - FK extraction logic (separate from relations for single responsibility)
- `adapters/drizzle-relations.ts` - Drizzle-specific relation output (parallel to `drizzle.ts`)

### Existing Patterns (MUST Follow)

1. **Symbol-based metadata**: `Symbol.for($I\`name\`)` via `$SchemaId` for cross-module consistency
2. **Dual storage**: Attach metadata via AST annotations AND direct symbol property
3. **Curried APIs**: `Field(schema)(config)` pattern for composability
4. **Type-safe extraction**: Conditional types with tuple wrapping `[T] extends [X]`
5. **Lazy references**: Thunks `() => Model` for circular dependency handling
6. **Variant filtering**: `ShouldIncludeField<V, F>` pattern for multi-variant models

### Current API Signatures

```typescript
// Field.ts - to extend with references
export function Field<A, I, R>(schema: S.Schema<A, I, R>): SchemaConfigurator<A, I, R>;
interface FieldConfig<C extends Partial<ColumnDef>> {
  readonly column?: C;
  // ADD: readonly references?: FieldReference;
}

// Model.ts - to extend with relations config
export const Model = <Self>(identifier: string) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
    // CHANGE: config?: { relations?: Relations; annotations?: ... }
  ): ModelClassWithVariants<...>

// types.ts - ModelStatics to extend
interface ModelStatics<...> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
  readonly _fields: Fields;
  // ADD: readonly relations: Relations;
}
```

### Prerequisites

The research phase produced findings in `.specs/dsl-relations-and-foriegn-keys/research/`. Before implementation, review these research files for recommended patterns:
- `research/03-data-structures.md` - Optimal relation metadata structures
- `research/06-type-safety.md` - Type-level validation techniques
- `research/01-field-level-syntax.md` - Field reference API options
- `research/02-model-level-syntax.md` - Model relations API options

After research is synthesized, a `research-results.md` file will be created in the spec root directory.

---

## Objective

Implement a complete entity relationship metadata system that:

1. **Enables Field-level relation declarations** via `references` config property
2. **Enables Model-level relation declarations** via `relations` config object
3. **Generates Drizzle foreign key constraints** from field references
4. **Generates Drizzle `defineRelations` output** from model relations
5. **Provides compile-time validation** for field existence and type compatibility
6. **Supports all relation cardinalities**: one-to-one, one-to-many, many-to-many

### Success Criteria

- [ ] `Field(UserId)({ column: {...}, references: { target: () => User, field: "id" } })` compiles and attaches metadata
- [ ] `Model<Post>("Post")({ ... }, { relations: { author: Relation.one(() => User, {...}) } })` compiles
- [ ] `Post.relations.author` returns typed `OneRelation<User, "authorId", "id">`
- [ ] `toDrizzle(Post, { includeForeignKeys: true })` generates FK constraints
- [ ] `toDrizzleRelations([User, Post])` generates valid Drizzle relation config
- [ ] Invalid field references produce compile-time errors with helpful messages
- [ ] Type mismatches between FK and PK produce compile-time errors
- [ ] Circular dependencies work via lazy `() => Model` references
- [ ] All existing tests continue to pass
- [ ] No TypeScript errors in codebase after implementation

---

## Role

You are an expert Effect TypeScript developer with deep knowledge of:
- Effect Schema annotations and AST manipulation
- Advanced TypeScript type-level programming (conditional types, mapped types, template literals)
- Drizzle ORM relations and foreign key APIs
- Functional programming patterns (pipe, composition, discriminated unions)

You write production-quality code that follows established patterns exactly, provides comprehensive type safety, and includes thorough test coverage.

---

## Constraints

### FORBIDDEN Patterns (Zero Tolerance)

```typescript
// ❌ NEVER use these - will cause PR rejection
items.map(x => x.name)           // Use: F.pipe(items, A.map(x => x.name))
items.filter(x => x.active)      // Use: F.pipe(items, A.filter(x => x.active))
Object.keys(obj)                 // Use: F.pipe(obj, Struct.keys)
Object.values(obj)               // Use: F.pipe(obj, R.values)
new Map(), new Set()             // Use: HashMap.empty(), HashSet.empty()
switch (x._tag) { ... }          // Use: Match.value(x).pipe(Match.tag(...), Match.exhaustive)
typeof x === "string"            // Use: P.isString(x)
async/await                      // Use: Effect.gen, Effect.tryPromise
new Date()                       // Use: DateTime.unsafeNow()
str.split(" ")                   // Use: F.pipe(str, Str.split(" "))
```

### REQUIRED Patterns

```typescript
// ✅ ALWAYS use Effect utilities
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as Struct from "effect/Struct";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

// Symbol registration pattern
const $I = $SchemaId.create("integrations/sql/dsl/types");
export const RelationMetaSymbol: unique symbol = Symbol.for($I`relation-meta`);

// Metadata attachment pattern (dual storage)
const annotated = schema.annotations({ [RelationMetaSymbol]: relationDef });
return Object.assign(annotated, { [RelationMetaSymbol]: relationDef });

// Type-level validation pattern
type ValidateFieldExists<M extends ModelClass, F extends string> =
  F extends keyof ModelFields<M> ? F : FieldNotFoundError<M, F>;

// Discriminated union handling
Match.value(relation).pipe(
  Match.tag("one", handleOne),
  Match.tag("many", handleMany),
  Match.tag("manyToMany", handleManyToMany),
  Match.exhaustive
)
```

### Schema Package Rules

- Keep schemas pure: NO network, DB, filesystem, timers, or logging
- SQL helpers emit only column builders/annotations, NEVER execute queries
- No cross-slice imports outside `packages/shared/*` or `packages/common/*`
- Use rich annotations: `identifier`, `title`, `description`

### Type Safety Rules

- No `any`, `@ts-ignore`, or unchecked casts
- Use `import type` for type-only imports
- Validate all external data with schemas
- Provide helpful compile-time error messages via branded error types

---

## Resources

### Files to Read Before Implementation

**Core DSL (understand existing patterns):**
- `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Curried field factory
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Model class factory
- `packages/common/schema/src/integrations/sql/dsl/types.ts` - Type definitions, validation patterns
- `packages/common/schema/src/integrations/sql/dsl/combinators.ts` - Combinator pattern

**Drizzle Integration:**
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` - toDrizzle implementation

**Existing Relation Examples:**
- `packages/iam/tables/src/relations.ts` - Drizzle relations usage
- `packages/documents/tables/src/relations.ts` - More relation examples

**Test Patterns:**
- `packages/common/schema/test/integrations/sql/dsl/poc.test.ts`
- `packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts`

### Documentation to Consult

- Effect Schema annotations: Use `mcp__effect_docs__effect_docs_search` for "Schema annotations AST"
- Drizzle relations v2: https://orm.drizzle.team/docs/relations-v2

---

## Output Specification

---

# PHASE 1: BOILERPLATING

**Goal**: Create all files with types, interfaces, and commented-out stubs. NO implementations.

**Orchestration**: Deploy parallel sub-agents to create/modify files simultaneously.

## Phase 1 Agent Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (You)                           │
│  Deploy these sub-agents IN PARALLEL:                           │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Agent 1  │   │ Agent 2  │   │ Agent 3  │   │ Agent 4  │
  │ types.ts │   │relations │   │foreign-  │   │drizzle-  │
  │          │   │   .ts    │   │ keys.ts  │   │relations │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
  ┌──────────────────────────────────────────────────────────────┐
  │             SYNC POINT: All stubs created                     │
  └──────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Agent 5  │   │ Agent 6  │   │ Agent 7  │
  │ Field.ts │   │ Model.ts │   │ combina- │
  │          │   │          │   │  tors.ts │
  └──────────┘   └──────────┘   └──────────┘
```

## Phase 1.1: Core Types & Schemas (types.ts)

**Agent 1 Task**: Add relation types to `types.ts`

```typescript
// ============================================================================
// Relation Types (Phase 1 - Boilerplate)
// ============================================================================

// Relation cardinality discriminant
export type RelationType = "one" | "many" | "manyToMany";

// Foreign key action literals
export type ForeignKeyAction = "cascade" | "restrict" | "no action" | "set null" | "set default";

// Foreign key configuration
export interface ForeignKeyConfig {
  readonly onDelete?: ForeignKeyAction;
  readonly onUpdate?: ForeignKeyAction;
  readonly name?: string;
}

// Field-level reference (for FK columns)
export interface FieldReference<
  Target extends ModelClass = ModelClass,
  TargetField extends string = string,
> {
  readonly target: () => Target;
  readonly field: TargetField;
  readonly foreignKey?: ForeignKeyConfig;
}

// EXTEND existing FieldConfig - add references property
export interface FieldConfig<C extends Partial<ColumnDef> = Partial<ColumnDef>> {
  readonly column?: C;
  readonly references?: FieldReference;  // NEW
}

// Junction table configuration for many-to-many
export interface JunctionConfig<
  Junction extends ModelClass = ModelClass,
  FromField extends string = string,
  ToField extends string = string,
> {
  readonly through: () => Junction;
  readonly fromField: FromField;
  readonly toField: ToField;
}

// Base relation metadata
export interface RelationMeta<
  Type extends RelationType = RelationType,
  Target extends ModelClass = ModelClass,
  FromField extends string = string,
  ToField extends string = string,
> {
  readonly _tag: Type;
  readonly target: () => Target;
  readonly fromField: FromField;
  readonly toField: ToField;
  readonly optional: boolean;
  readonly foreignKey?: ForeignKeyConfig;
}

// Specific relation types (discriminated by _tag)
export interface OneRelation<
  Target extends ModelClass = ModelClass,
  FromField extends string = string,
  ToField extends string = string,
> extends RelationMeta<"one", Target, FromField, ToField> {}

export interface ManyRelation<
  Target extends ModelClass = ModelClass,
  FromField extends string = string,
  ToField extends string = string,
> extends RelationMeta<"many", Target, FromField, ToField> {}

export interface ManyToManyRelation<
  Target extends ModelClass = ModelClass,
  FromField extends string = string,
  ToField extends string = string,
  Junction extends ModelClass = ModelClass,
> extends RelationMeta<"manyToMany", Target, FromField, ToField> {
  readonly junction: JunctionConfig<Junction>;
}

// Union type for any relation
export type AnyRelation = OneRelation | ManyRelation | ManyToManyRelation;

// Relations config map
export type RelationsConfig = {
  readonly [name: string]: AnyRelation;
};

// Symbols for metadata attachment
export const RelationMetaSymbol: unique symbol = Symbol.for($I`relation-meta`);
export const ForeignKeySymbol: unique symbol = Symbol.for($I`foreign-key`);

// ============================================================================
// Type-Level Validation (Phase 1 - Boilerplate)
// ============================================================================

// Error types with helpful messages
export interface FieldNotFoundError<M, F extends string> {
  readonly _tag: "FieldNotFoundError";
  readonly _brand: unique symbol;
  readonly _message: `Field '${F}' does not exist on model`;
  readonly _model: M;
}

export interface TypeMismatchError<From, FromField extends string, To, ToField extends string> {
  readonly _tag: "TypeMismatchError";
  readonly _brand: unique symbol;
  readonly _message: `Type of '${FromField}' does not match type of '${ToField}'`;
  readonly _from: From;
  readonly _to: To;
}

// Field existence validation
export type ValidateFieldExists<M extends ModelClass, F extends string> =
  F extends keyof M["_fields"] ? F : FieldNotFoundError<M, F>;

// Type compatibility validation
export type ValidateForeignKeyTypes<
  From extends ModelClass,
  FromField extends string,
  To extends ModelClass,
  ToField extends string,
> = ExtractEncodedType<From["_fields"][FromField & keyof From["_fields"]]> extends
  ExtractEncodedType<To["_fields"][ToField & keyof To["_fields"]]>
    ? true
    : TypeMismatchError<From, FromField, To, ToField>;

// ============================================================================
// Extended ModelStatics (Phase 1 - Boilerplate)
// ============================================================================

export interface ModelStatics<
  TName extends string = string,
  Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
  PK extends readonly string[] = readonly string[],
  Id extends string = string,
  Fields extends DSL.Fields = DSL.Fields,
  Relations extends RelationsConfig = RelationsConfig,  // NEW
> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
  readonly _fields: Fields;
  readonly relations: Relations;  // NEW
}
```

## Phase 1.2: Relation Constructors (relations.ts)

**Agent 2 Task**: Create `relations.ts` with COMMENTED OUT stubs

```typescript
/**
 * @fileoverview Relation constructors for DSL models.
 * @module integrations/sql/dsl/relations
 */

import type {
  ForeignKeyConfig,
  JunctionConfig,
  ManyRelation,
  ManyToManyRelation,
  ModelClass,
  OneRelation,
} from "./types";

// ============================================================================
// Relation Constructors (STUBS - Uncomment in Phase 3)
// ============================================================================

/**
 * Relation constructors for defining model relationships.
 *
 * @example
 * ```ts
 * relations: {
 *   author: Relation.one(() => User, { from: "authorId", to: "id" }),
 *   comments: Relation.many(() => Comment, { from: "id", to: "postId" }),
 * }
 * ```
 */
export const Relation = {
  /**
   * Creates a one-to-one or one-to-many (from FK side) relation.
   *
   * @param target - Thunk returning the target model (lazy for circular deps)
   * @param config - Relation configuration
   * @returns OneRelation metadata
   */
  // one: <Target, FromField extends string, ToField extends string>(
  //   target: () => ModelClass<Target>,
  //   config: {
  //     readonly from: FromField;
  //     readonly to: ToField;
  //     readonly optional?: boolean;
  //     readonly foreignKey?: ForeignKeyConfig;
  //   }
  // ): OneRelation<ModelClass<Target>, FromField, ToField> => {
  //   // TODO: Implement in Phase 3
  //   throw new Error("Not implemented");
  // },

  /**
   * Creates a one-to-many (from PK side) relation.
   *
   * @param target - Thunk returning the target model
   * @param config - Relation configuration
   * @returns ManyRelation metadata
   */
  // many: <Target, FromField extends string, ToField extends string>(
  //   target: () => ModelClass<Target>,
  //   config: {
  //     readonly from: FromField;
  //     readonly to: ToField;
  //   }
  // ): ManyRelation<ModelClass<Target>, FromField, ToField> => {
  //   // TODO: Implement in Phase 3
  //   throw new Error("Not implemented");
  // },

  /**
   * Creates a many-to-many relation through a junction table.
   *
   * @param target - Thunk returning the target model
   * @param config - Junction table configuration
   * @returns ManyToManyRelation metadata
   */
  // manyToMany: <Target, Junction, FromField extends string, ToField extends string>(
  //   target: () => ModelClass<Target>,
  //   config: {
  //     readonly through: () => ModelClass<Junction>;
  //     readonly fromField: FromField;
  //     readonly toField: ToField;
  //   }
  // ): ManyToManyRelation<ModelClass<Target>, FromField, ToField, ModelClass<Junction>> => {
  //   // TODO: Implement in Phase 3
  //   throw new Error("Not implemented");
  // },
};
```

## Phase 1.3: Foreign Key Utilities (foreign-keys.ts)

**Agent 3 Task**: Create `foreign-keys.ts` with COMMENTED OUT stubs

```typescript
/**
 * @fileoverview Foreign key extraction and generation utilities.
 * @module integrations/sql/dsl/foreign-keys
 */

import type { ForeignKeyAction, ForeignKeyConfig, ModelClass } from "./types";

// ============================================================================
// Foreign Key Definitions
// ============================================================================

/**
 * Extracted foreign key definition from model field references.
 */
export interface ForeignKeyDef {
  readonly name: string;
  readonly columns: readonly string[];
  readonly foreignTable: string;
  readonly foreignColumns: readonly string[];
  readonly onDelete?: ForeignKeyAction;
  readonly onUpdate?: ForeignKeyAction;
}

// ============================================================================
// Foreign Key Extraction (STUBS - Uncomment in Phase 3)
// ============================================================================

/**
 * Extracts foreign key definitions from a model's field references.
 *
 * @param model - The DSL model to extract FKs from
 * @returns Array of ForeignKeyDef
 *
 * @example
 * ```ts
 * const fks = extractForeignKeys(Post);
 * // [{ name: "posts_author_id_fk", columns: ["authorId"], ... }]
 * ```
 */
// export const extractForeignKeys = <M extends ModelClass>(
//   model: M
// ): readonly ForeignKeyDef[] => {
//   // TODO: Implement in Phase 3
//   // 1. Iterate model._fields
//   // 2. Check each field for ForeignKeySymbol
//   // 3. Build ForeignKeyDef from FieldReference
//   throw new Error("Not implemented");
// };

/**
 * Generates a foreign key constraint name following convention.
 *
 * @param tableName - Source table name
 * @param columnName - Source column name
 * @returns Formatted FK constraint name
 */
// export const generateForeignKeyName = (
//   tableName: string,
//   columnName: string
// ): string => {
//   // TODO: Implement in Phase 3
//   // Convention: `${tableName}_${columnName}_fk`
//   throw new Error("Not implemented");
// };
```

## Phase 1.4: Drizzle Relations Adapter (adapters/drizzle-relations.ts)

**Agent 4 Task**: Create `adapters/drizzle-relations.ts` with COMMENTED OUT stubs

```typescript
/**
 * @fileoverview Drizzle ORM relation generation from DSL models.
 * @module integrations/sql/dsl/adapters/drizzle-relations
 */

import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { ModelClass, RelationsConfig } from "../types";

// ============================================================================
// Drizzle Relations Generation (STUBS - Uncomment in Phase 3)
// ============================================================================

/**
 * Generates Drizzle `defineRelations` configuration from DSL models.
 *
 * @param models - Array of DSL models with relations defined
 * @param drizzleTables - Map of table names to Drizzle table objects
 * @returns Drizzle relation configuration for use with defineRelations
 *
 * @example
 * ```ts
 * const users = toDrizzle(User);
 * const posts = toDrizzle(Post);
 *
 * const relations = toDrizzleRelations(
 *   [User, Post],
 *   { users, posts }
 * );
 *
 * const db = drizzle(connection, {
 *   schema: { users, posts, ...relations }
 * });
 * ```
 */
// export const toDrizzleRelations = <
//   Models extends readonly ModelClass[],
//   Tables extends Record<string, PgTableWithColumns<any>>
// >(
//   models: Models,
//   drizzleTables: Tables
// ): unknown => {
//   // TODO: Implement in Phase 3
//   // 1. Import defineRelations from drizzle-orm
//   // 2. Aggregate relations from all models
//   // 3. Map DSL relations to Drizzle r.one/r.many calls
//   throw new Error("Not implemented");
// };

/**
 * Aggregates relations from multiple models into a relation graph.
 *
 * @internal
 */
// export interface RelationGraph {
//   readonly models: Map<string, ModelClass>;
//   readonly relations: Map<string, readonly RelationMeta[]>;
// }

// export const aggregateRelations = (
//   models: readonly ModelClass[]
// ): RelationGraph => {
//   // TODO: Implement in Phase 3
//   throw new Error("Not implemented");
// };
```

## Phase 1.5: Field.ts Extensions

**Agent 5 Task**: Extend `Field.ts` with references handling (COMMENTED OUT)

```typescript
// Add to Field.ts - after existing column handling

// ============================================================================
// Field Reference Handling (STUB - Uncomment in Phase 3)
// ============================================================================

// In the configurator function, add after column metadata attachment:

// // NEW: Handle references config for foreign keys
// if (config?.references) {
//   // Attach FK metadata via symbol (dual storage pattern)
//   result[ForeignKeySymbol] = config.references;
// }
```

## Phase 1.6: Model.ts Extensions

**Agent 6 Task**: Extend `Model.ts` with relations support (COMMENTED OUT)

```typescript
// Modify Model signature and implementation

// ============================================================================
// Model Relations Support (STUB - Uncomment in Phase 3)
// ============================================================================

// Change signature from:
//   (fields: Fields, annotations?: S.Annotations.Schema<Self>)
// To:
//   (fields: Fields, config?: { relations?: Relations; annotations?: ... })

// In BaseClass definition, add:
//   static readonly relations = config?.relations ?? {} as Relations;
```

## Phase 1.7: Combinators Extensions

**Agent 7 Task**: Extend `combinators.ts` with reference combinator (COMMENTED OUT)

```typescript
// Add to combinators.ts

// ============================================================================
// Reference Combinator (STUB - Uncomment in Phase 3)
// ============================================================================

/**
 * Marks a field as referencing another model's field (foreign key).
 * Pipe-friendly combinator for use with DSL.uuid, DSL.string, etc.
 *
 * @example
 * ```ts
 * const authorIdField = UserId.pipe(
 *   DSL.uuid,
 *   DSL.references(() => User, "id", { onDelete: "cascade" })
 * );
 * ```
 */
// export const references = <Target extends ModelClass, TargetField extends string>(
//   target: () => Target,
//   field: TargetField,
//   foreignKey?: ForeignKeyConfig
// ) => <A, I, R, C extends ColumnDef = never>(
//   self: S.Schema<A, I, R> | DSLField<A, I, R, C>
// ): DSLField<A, I, R, ResolveColumnDef<C>> & {
//   readonly [ForeignKeySymbol]: FieldReference<Target, TargetField>;
// } => {
//   // TODO: Implement in Phase 3
//   throw new Error("Not implemented");
// };
```

---

# PHASE 2: TYPE-LEVEL TESTS

**Goal**: Create type-level tests that validate the types & schemas from Phase 1 BEFORE implementation.

**Orchestration**: Deploy test-writer agents to create type tests.

## Phase 2 Agent Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (You)                           │
│  Deploy test-writer agents:                                     │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
  ┌──────────────────┐          ┌──────────────────┐
  │ Test Agent 1     │          │ Test Agent 2     │
  │ relation-types   │          │ model-relations  │
  │   .test.ts       │          │   .test.ts       │
  └──────────────────┘          └──────────────────┘
```

## Phase 2.1: Relation Type Tests

**Test File**: `test/integrations/sql/dsl/relation-types.test.ts`

```typescript
import { describe, it, expectTypeOf } from "vitest";
import type {
  AnyRelation,
  FieldNotFoundError,
  FieldReference,
  ForeignKeyConfig,
  ManyRelation,
  ManyToManyRelation,
  OneRelation,
  RelationType,
  RelationsConfig,
  TypeMismatchError,
  ValidateFieldExists,
  ValidateForeignKeyTypes,
} from "@beep/schema/integrations/sql/dsl/types";

describe("Relation Types - Type Level Tests", () => {
  describe("RelationType", () => {
    it("should be a union of relation cardinalities", () => {
      expectTypeOf<RelationType>().toEqualTypeOf<"one" | "many" | "manyToMany">();
    });
  });

  describe("ForeignKeyConfig", () => {
    it("should accept valid FK actions", () => {
      const config: ForeignKeyConfig = {
        onDelete: "cascade",
        onUpdate: "no action",
        name: "custom_fk_name",
      };
      expectTypeOf(config.onDelete).toEqualTypeOf<"cascade" | "restrict" | "no action" | "set null" | "set default" | undefined>();
    });

    it("should allow partial config", () => {
      const config: ForeignKeyConfig = {};
      expectTypeOf(config).toMatchTypeOf<ForeignKeyConfig>();
    });
  });

  describe("FieldReference", () => {
    it("should require target thunk and field", () => {
      // Assuming User model exists for test
      type TestRef = FieldReference<{ identifier: "User" }, "id">;
      expectTypeOf<TestRef["target"]>().toBeFunction();
      expectTypeOf<TestRef["field"]>().toEqualTypeOf<"id">();
    });
  });

  describe("OneRelation", () => {
    it("should have _tag of 'one'", () => {
      expectTypeOf<OneRelation["_tag"]>().toEqualTypeOf<"one">();
    });

    it("should include optional flag", () => {
      expectTypeOf<OneRelation["optional"]>().toEqualTypeOf<boolean>();
    });
  });

  describe("ManyRelation", () => {
    it("should have _tag of 'many'", () => {
      expectTypeOf<ManyRelation["_tag"]>().toEqualTypeOf<"many">();
    });
  });

  describe("ManyToManyRelation", () => {
    it("should have _tag of 'manyToMany'", () => {
      expectTypeOf<ManyToManyRelation["_tag"]>().toEqualTypeOf<"manyToMany">();
    });

    it("should include junction config", () => {
      expectTypeOf<ManyToManyRelation["junction"]>().toHaveProperty("through");
    });
  });

  describe("AnyRelation", () => {
    it("should be a union of all relation types", () => {
      expectTypeOf<AnyRelation>().toMatchTypeOf<OneRelation | ManyRelation | ManyToManyRelation>();
    });
  });

  describe("RelationsConfig", () => {
    it("should be a record of string to AnyRelation", () => {
      type TestConfig = { author: OneRelation; comments: ManyRelation };
      expectTypeOf<TestConfig>().toMatchTypeOf<RelationsConfig>();
    });
  });

  describe("ValidateFieldExists", () => {
    it("should return field name when field exists", () => {
      type MockModel = { _fields: { id: unknown; name: unknown } };
      expectTypeOf<ValidateFieldExists<MockModel, "id">>().toEqualTypeOf<"id">();
    });

    it("should return FieldNotFoundError when field does not exist", () => {
      type MockModel = { _fields: { id: unknown } };
      expectTypeOf<ValidateFieldExists<MockModel, "nonexistent">>().toMatchTypeOf<FieldNotFoundError<MockModel, "nonexistent">>();
    });
  });

  describe("ValidateForeignKeyTypes", () => {
    // Type compatibility tests will be added when full implementation exists
  });
});
```

## Phase 2.2: Model Relations Type Tests

**Test File**: `test/integrations/sql/dsl/model-relations.test.ts`

```typescript
import { describe, it, expectTypeOf } from "vitest";
import type { ModelStatics, RelationsConfig } from "@beep/schema/integrations/sql/dsl/types";

describe("Model Relations - Type Level Tests", () => {
  describe("ModelStatics with Relations", () => {
    it("should include relations property", () => {
      type TestStatics = ModelStatics<"users", {}, [], "User", {}, { posts: any }>;
      expectTypeOf<TestStatics["relations"]>().toMatchTypeOf<RelationsConfig>();
    });

    it("should allow empty relations", () => {
      type TestStatics = ModelStatics<"users", {}, [], "User", {}, {}>;
      expectTypeOf<TestStatics["relations"]>().toEqualTypeOf<{}>();
    });
  });

  // Additional type tests for Model factory will be added
});
```

---

# PHASE 3: IMPLEMENTATION

**Goal**: Uncomment and implement all stubs from Phase 1.

**Orchestration**: Deploy effect-code-writer agents sequentially (some depend on others).

## Phase 3 Agent Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (You)                           │
│  Deploy effect-code-writer agents:                              │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────┐
  │ Agent 1          │  ← types.ts is already complete (no stubs)
  │ relations.ts     │
  └──────────────────┘
         │
         ▼
  ┌──────────────────┐   ┌──────────────────┐
  │ Agent 2          │   │ Agent 3          │  ← Can run in parallel
  │ foreign-keys.ts  │   │ drizzle-rels.ts  │
  └──────────────────┘   └──────────────────┘
         │                       │
         ▼                       ▼
  ┌─────────────────────────────────────────┐
  │              SYNC POINT                  │
  └─────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │ Agent 4          │   │ Agent 5          │   │ Agent 6          │
  │ Field.ts         │   │ Model.ts         │   │ combinators.ts   │
  └──────────────────┘   └──────────────────┘   └──────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                    index.ts exports                              │
  └─────────────────────────────────────────────────────────────────┘
```

## Phase 3.1: Implement relations.ts

**Agent Task**: Uncomment and implement all stubs

```typescript
// IMPLEMENTATION - Replace commented stubs with:

export const Relation = {
  one: <Target, FromField extends string, ToField extends string>(
    target: () => ModelClass<Target>,
    config: {
      readonly from: FromField;
      readonly to: ToField;
      readonly optional?: boolean;
      readonly foreignKey?: ForeignKeyConfig;
    }
  ): OneRelation<ModelClass<Target>, FromField, ToField> => ({
    _tag: "one" as const,
    target,
    fromField: config.from,
    toField: config.to,
    optional: config.optional ?? true,
    foreignKey: config.foreignKey,
  }),

  many: <Target, FromField extends string, ToField extends string>(
    target: () => ModelClass<Target>,
    config: {
      readonly from: FromField;
      readonly to: ToField;
    }
  ): ManyRelation<ModelClass<Target>, FromField, ToField> => ({
    _tag: "many" as const,
    target,
    fromField: config.from,
    toField: config.to,
    optional: true,
  }),

  manyToMany: <Target, Junction, FromField extends string, ToField extends string>(
    target: () => ModelClass<Target>,
    config: {
      readonly through: () => ModelClass<Junction>;
      readonly fromField: FromField;
      readonly toField: ToField;
    }
  ): ManyToManyRelation<ModelClass<Target>, FromField, ToField, ModelClass<Junction>> => ({
    _tag: "manyToMany" as const,
    target,
    fromField: config.fromField,
    toField: config.toField,
    optional: true,
    junction: {
      through: config.through,
      fromField: config.fromField,
      toField: config.toField,
    },
  }),
};
```

## Phase 3.2-3.6: Continue Implementations

Each agent follows the same pattern: uncomment stubs, implement according to spec.

---

# PHASE 4: RUNTIME TESTS

**Goal**: Add comprehensive runtime tests for all implemented functionality.

**Orchestration**: Deploy test-writer agents.

## Phase 4 Agent Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (You)                           │
│  Deploy test-writer agents IN PARALLEL:                         │
└─────────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ relations    │ │ foreign-keys │ │ drizzle-rels │
  │   .test.ts   │ │   .test.ts   │ │   .test.ts   │
  └──────────────┘ └──────────────┘ └──────────────┘
```

## Phase 4.1: Relation Constructor Tests

**Test File**: `test/integrations/sql/dsl/relations.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { Relation } from "@beep/schema/integrations/sql/dsl/relations";

describe("Relation Constructors", () => {
  describe("Relation.one", () => {
    it("should create a OneRelation with correct _tag", () => {
      const rel = Relation.one(() => MockUser, { from: "authorId", to: "id" });
      expect(rel._tag).toBe("one");
    });

    it("should default optional to true", () => {
      const rel = Relation.one(() => MockUser, { from: "authorId", to: "id" });
      expect(rel.optional).toBe(true);
    });

    it("should respect optional: false", () => {
      const rel = Relation.one(() => MockUser, { from: "authorId", to: "id", optional: false });
      expect(rel.optional).toBe(false);
    });

    it("should store foreignKey config", () => {
      const rel = Relation.one(() => MockUser, {
        from: "authorId",
        to: "id",
        foreignKey: { onDelete: "cascade" },
      });
      expect(rel.foreignKey?.onDelete).toBe("cascade");
    });
  });

  describe("Relation.many", () => {
    it("should create a ManyRelation with correct _tag", () => {
      const rel = Relation.many(() => MockPost, { from: "id", to: "authorId" });
      expect(rel._tag).toBe("many");
    });
  });

  describe("Relation.manyToMany", () => {
    it("should create a ManyToManyRelation with junction config", () => {
      const rel = Relation.manyToMany(() => MockGroup, {
        through: () => MockUserGroup,
        fromField: "userId",
        toField: "groupId",
      });
      expect(rel._tag).toBe("manyToMany");
      expect(rel.junction.fromField).toBe("userId");
    });
  });
});
```

## Phase 4.2: Foreign Key Extraction Tests

**Test File**: `test/integrations/sql/dsl/foreign-keys.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { extractForeignKeys, generateForeignKeyName } from "@beep/schema/integrations/sql/dsl/foreign-keys";

describe("Foreign Key Utilities", () => {
  describe("generateForeignKeyName", () => {
    it("should generate conventional FK name", () => {
      const name = generateForeignKeyName("posts", "author_id");
      expect(name).toBe("posts_author_id_fk");
    });
  });

  describe("extractForeignKeys", () => {
    it("should extract FKs from model with references", () => {
      const fks = extractForeignKeys(PostWithReferences);
      expect(fks).toHaveLength(1);
      expect(fks[0].columns).toEqual(["authorId"]);
    });

    it("should return empty array for model without references", () => {
      const fks = extractForeignKeys(ModelWithoutReferences);
      expect(fks).toHaveLength(0);
    });
  });
});
```

## Phase 4.3: Drizzle Relations Generation Tests

**Test File**: `test/integrations/sql/dsl/drizzle-relations.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { toDrizzleRelations, aggregateRelations } from "@beep/schema/integrations/sql/dsl/adapters/drizzle-relations";

describe("Drizzle Relations Generation", () => {
  describe("aggregateRelations", () => {
    it("should aggregate relations from multiple models", () => {
      const graph = aggregateRelations([User, Post, Comment]);
      expect(graph.models.size).toBe(3);
    });
  });

  describe("toDrizzleRelations", () => {
    it("should generate Drizzle-compatible relation config", () => {
      const relations = toDrizzleRelations([User, Post], { users, posts });
      expect(relations).toBeDefined();
      // Additional assertions based on Drizzle API
    });
  });
});
```

---

## Examples

### Field-Level Reference Usage

```typescript
class User extends Model<User>("User")({
  id: Field(UserId)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } }),
}) {}

class Post extends Model<Post>("Post")({
  id: Field(PostId)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(UserId)({
    column: { type: "uuid" },
    references: {
      target: () => User,
      field: "id",
      foreignKey: { onDelete: "cascade" },
    },
  }),
  title: Field(S.String)({ column: { type: "string" } }),
}) {}
```

### Model-Level Relation Usage

```typescript
class Post extends Model<Post>("Post")({
  id: Field(PostId)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(UserId)({ column: { type: "uuid" } }),
  title: Field(S.String)({ column: { type: "string" } }),
}, {
  relations: {
    author: Relation.one(() => User, {
      from: "authorId",
      to: "id",
      optional: false,
    }),
    comments: Relation.many(() => Comment, {
      from: "id",
      to: "postId",
    }),
  },
}) {}

// Type-safe access
Post.relations.author   // OneRelation<User, "authorId", "id">
Post.relations.comments // ManyRelation<Comment, "id", "postId">
```

### Drizzle Generation Usage

```typescript
// Generate tables with foreign keys
const users = toDrizzle(User);
const posts = toDrizzle(Post, { includeForeignKeys: true });

// Generate relations
const relations = toDrizzleRelations(
  [User, Post, Comment],
  { users, posts, comments }
);

// Use in Drizzle client
const db = drizzle(connection, {
  schema: { users, posts, comments, ...relations }
});
```

### Edge Case: Circular Dependencies

```typescript
// User references Post, Post references User - handled via lazy thunks
class User extends Model<User>("User")({
  id: Field(UserId)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
}, {
  relations: {
    posts: Relation.many(() => Post, { from: "id", to: "authorId" }),
    // The () => Post thunk breaks the circular reference
  },
}) {}

class Post extends Model<Post>("Post")({
  id: Field(PostId)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(UserId)({ column: { type: "uuid" } }),
}, {
  relations: {
    author: Relation.one(() => User, { from: "authorId", to: "id" }),
  },
}) {}
```

### Edge Case: Self-Referential Relations

```typescript
// Document with parent-child hierarchy
class Document extends Model<Document>("Document")({
  id: Field(DocumentId)({ column: { type: "uuid", primaryKey: true } }),
  parentId: Field(S.NullOr(DocumentId))({
    column: { type: "uuid" },
    references: {
      target: () => Document,  // Self-reference
      field: "id",
      foreignKey: { onDelete: "cascade" },
    },
  }),
  title: Field(S.String)({ column: { type: "string" } }),
}, {
  relations: {
    parent: Relation.one(() => Document, {
      from: "parentId",
      to: "id",
      optional: true,  // Parent is nullable
    }),
    children: Relation.many(() => Document, {
      from: "id",
      to: "parentId",
    }),
  },
}) {}
```

### Edge Case: Many-to-Many with Junction Table

```typescript
// Users belong to many Groups, Groups have many Users
class User extends Model<User>("User")({
  id: Field(UserId)({ column: { type: "uuid", primaryKey: true } }),
}) {}

class Group extends Model<Group>("Group")({
  id: Field(GroupId)({ column: { type: "uuid", primaryKey: true } }),
}) {}

// Junction table
class UserGroup extends Model<UserGroup>("UserGroup")({
  userId: Field(UserId)({
    column: { type: "uuid", primaryKey: true },
    references: { target: () => User, field: "id", foreignKey: { onDelete: "cascade" } },
  }),
  groupId: Field(GroupId)({
    column: { type: "uuid", primaryKey: true },
    references: { target: () => Group, field: "id", foreignKey: { onDelete: "cascade" } },
  }),
}, {
  relations: {
    user: Relation.one(() => User, { from: "userId", to: "id", optional: false }),
    group: Relation.one(() => Group, { from: "groupId", to: "id", optional: false }),
  },
}) {}

// Many-to-many on User model (through junction)
class UserWithGroups extends Model<UserWithGroups>("User")({
  id: Field(UserId)({ column: { type: "uuid", primaryKey: true } }),
}, {
  relations: {
    groups: Relation.manyToMany(() => Group, {
      through: () => UserGroup,
      fromField: "userId",
      toField: "groupId",
    }),
  },
}) {}
```

### Compile-Time Error Example

```typescript
// ❌ This should produce a compile-time error
class BadPost extends Model<BadPost>("BadPost")({
  authorId: Field(UserId)({ column: { type: "uuid" } }),
}, {
  relations: {
    author: Relation.one(() => User, {
      from: "nonExistentField", // Error: Field 'nonExistentField' does not exist on model 'BadPost'
      to: "id",
    }),
  },
}) {}

// ❌ Type mismatch error
class BadReference extends Model<BadReference>("BadReference")({
  count: Field(S.Int)({ column: { type: "integer" } }),  // number type
}, {
  relations: {
    user: Relation.one(() => User, {
      from: "count",  // number
      to: "id",       // string (UserId) - TYPE MISMATCH ERROR
    }),
  },
}) {}
```

---

## Verification Checklist

### Phase 1: Boilerplating ✓
- [ ] `types.ts` - All relation types, interfaces, symbols added
- [ ] `relations.ts` - Relation constructor stubs (commented out)
- [ ] `foreign-keys.ts` - FK extraction stubs (commented out)
- [ ] `adapters/drizzle-relations.ts` - Drizzle relation stubs (commented out)
- [ ] `Field.ts` - References handling stub (commented out)
- [ ] `Model.ts` - Relations config stub (commented out)
- [ ] `combinators.ts` - References combinator stub (commented out)
- [ ] All stubs are properly commented out with `// TODO: Implement in Phase 3`

### Phase 2: Type-Level Tests ✓
- [ ] `relation-types.test.ts` - Validates all relation type structures
- [ ] `model-relations.test.ts` - Validates ModelStatics with Relations
- [ ] `ValidateFieldExists` type produces correct error types
- [ ] `ValidateForeignKeyTypes` type validates compatibility
- [ ] All type tests pass with `bun run test`

### Phase 3: Implementation ✓
- [ ] `Relation.one()`, `Relation.many()`, `Relation.manyToMany()` implemented
- [ ] `extractForeignKeys()` and `generateForeignKeyName()` implemented
- [ ] `toDrizzleRelations()` and `aggregateRelations()` implemented
- [ ] `Field.ts` handles `references` config with dual storage
- [ ] `Model.ts` accepts `config.relations` and attaches to class
- [ ] `combinators.ts` `references()` combinator implemented
- [ ] `index.ts` exports all new APIs
- [ ] No `any` types in implementation
- [ ] All Effect utility patterns used (no native Array/Object methods)

### Phase 4: Runtime Tests ✓
- [ ] `relations.test.ts` - Tests all relation constructors
- [ ] `foreign-keys.test.ts` - Tests FK extraction and naming
- [ ] `drizzle-relations.test.ts` - Tests Drizzle generation
- [ ] Edge cases covered: circular deps, self-referential, many-to-many
- [ ] All existing tests still pass

### Final CI Validation
- [ ] `bun run check --filter=@beep/schema` passes
- [ ] `bun run test --filter=@beep/schema` passes
- [ ] `bun run lint --filter=@beep/schema` passes

---

## Metadata

### Research Sources
- **Files Explored:**
  - `packages/common/schema/src/integrations/sql/dsl/Field.ts`
  - `packages/common/schema/src/integrations/sql/dsl/Model.ts`
  - `packages/common/schema/src/integrations/sql/dsl/types.ts`
  - `packages/common/schema/src/integrations/sql/dsl/combinators.ts`
  - `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
  - `packages/iam/tables/src/relations.ts`
  - `packages/documents/tables/src/relations.ts`

- **AGENTS.md Consulted:**
  - Root `AGENTS.md` - Global conventions
  - `packages/common/schema/AGENTS.md` - Schema-specific rules
  - `packages/common/types/AGENTS.md` - Type idioms

- **Documentation Referenced:**
  - Drizzle Relations v2: https://orm.drizzle.team/docs/relations-v2
  - Effect Schema annotations (MCP search)

### Refinement History
| Iteration | Issues Found                                                                                                                                                                | Fixes Applied                                                                                                                                                                                                                                                                                        |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0         | Initial                                                                                                                                                                     | N/A                                                                                                                                                                                                                                                                                                  |
| 1         | HIGH: Research file path incorrect; MEDIUM: FieldConfig redefinition conflict, drizzle-relations.ts unclear, edge cases missing; LOW: Phase 2-3 vague, thunk import missing | Fixed research path to reference research/ directory; Showed FieldConfig as extension with line numbers; Clarified file structure with rationale; Added 4 edge case examples (circular deps, self-ref, many-to-many, type mismatch); Expanded Phase 2-3 with code templates; Added thunk import note |
| 2         | User feedback: Remove backward compatibility (POC phase)                                                                                                                    | Removed backward compatibility section                                                                                                                                                                                                                                                               |
| 3         | User feedback: Restructure into 4 distinct phases                                                                                                                           | Restructured into: (1) Boilerplating with commented-out stubs, (2) Type-level tests pre-implementation, (3) Implementation, (4) Runtime tests. Added agent deployment diagrams for each phase.                                                                                                       |
