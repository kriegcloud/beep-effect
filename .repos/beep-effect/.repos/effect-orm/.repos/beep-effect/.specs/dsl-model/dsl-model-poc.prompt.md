---
name: dsl-model-poc
version: 3
created: 2025-12-26T16:00:00Z
refined: 2025-12-26T19:00:00Z
iterations: 1
purpose: Plan and implement a minimal POC for DSL.Model
---

# DSL.Model - Proof of Concept Implementation

## Context

### Key Codebase Patterns

**Namespace Export Pattern**: Domain entities are exported as namespaces (e.g., `User.Model`, not `UserModel`). This is done in `packages/shared/domain/src/entities/index.ts`:
```typescript
export * as User from "./User";  // Creates User namespace
export * as Organization from "./Organization";
// Access: User.Model, Organization.Model
```

**Primary Key Pattern (CRITICAL)**:
- `id` is **NOT** the primary key - it's a public UUID identifier with a default generator
- `_rowId` **IS** the PRIMARY KEY - it's a `pg.serial` (auto-increment integer) marked as `M.Generated`

See `packages/shared/domain/src/common.ts` for the canonical implementation.

### Codebase Overview

You are working in `beep-effect`, a Bun-managed Effect-first monorepo. The target implementation location is:

```
packages/common/schema/src/integrations/sql/dsl/
```

### Current State of Target Directory

Two files currently exist with foundational type definitions:
- `dsl.ts` - Better-auth type schemas (DBFieldAttribute, DBFieldAttributeConfig)
- `index.ts` - Re-exports from dsl.ts

**No Model or Field implementations exist yet** - this is greenfield development.

### Key Dependencies & Reference Implementations

| Dependency             | Location                                                              | Purpose                                                                    |
|------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------|
| VariantSchema          | `packages/common/schema/src/core/VariantSchema.ts`                    | 6-variant infrastructure (select/insert/update/json/jsonCreate/jsonUpdate) |
| EntityId               | `packages/common/schema/src/identity/entity-id/entity-id.ts`          | Anonymous class + static properties pattern                                |
| Model.ts               | `packages/common/schema/src/integrations/sql/Model.ts`                | Reference implementation for variant-aware field combinators               |
| mergeSchemaAnnotations | `packages/common/schema/src/core/annotations/built-in-annotations.ts` | Annotation merging utility                                                 |

### Established Patterns to Follow

**From VariantSchema.ts (line 495)** - Class extension pattern:
```typescript
class Base extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(schema.fields, annotations) {
  static [TypeId] = fields;
}
```

**From EntityId** - Symbol-based annotations and static properties:
```typescript
const ColumnMetaSymbol: unique symbol = Symbol.for("@beep/dsl-model/column-meta");

return class EntityIdClass extends S.make<EntityId.Type<TableName>>(defaultAST) {
  static readonly tableName = config.tableName;
  static readonly create = create;
  // ... more statics
};
```

**From Model.ts** - Field combinator pattern:
```typescript
export const Generated = <S extends S.Schema.All>(schema: S): Generated<S> =>
  Field({ select: schema, update: schema, json: schema });
```

### Design Document Reference

The comprehensive design specification at `.specs/dsl-model/DSL-MODEL-DESIGN.md` (1240 lines) contains:
- Section 1: Core type definitions
- Section 2: Interface specifications
- Section 3: Factory function signatures
- Section 4: Adapter designs (toDrizzle, toBetterAuth)
- Section 5: Research answers for implementation questions
- Section 6: Implementation pseudocode
- Section 7: 27 verification criteria

### What We're Building (End-to-End Example)

```typescript
import * as DSL from "@beep/schema/integrations/sql/dsl";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";
import { $SharedDomainId } from "@beep/identity/packages";

const $I = $SharedDomainId.create("entities/User/User.model");

// Note: Production code uses makeFields pattern from @beep/shared-domain/common
// Domain entities are exported as namespaces: User.Model
class Model extends DSL.Model<Model>($I`UserModel`)({
  // Public UUID identifier (NOT primary key)
  id: DSL.Field(SharedEntityIds.UserId, {
    column: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.UserId.create() }
  }),
  // Internal primary key (pg.serial) - uses branded modelRowIdSchema
  _rowId: DSL.Field(SharedEntityIds.UserId.modelRowIdSchema, {
    column: { type: "integer", primaryKey: true, autoIncrement: true }
  }),
  email: DSL.Field(S.String, { column: { type: "string", unique: true } }),
}, $I.annotations("UserModel", {
  description: "The domain entity model for the User"
})) {}

// Access via namespace: User.Model
User.Model.tableName;   // "user"
User.Model.primaryKey;  // ["_rowId"] - NOT ["id"]!
User.Model.columns;     // { _rowId: { type: "integer", primaryKey: true, autoIncrement: true }, id: { type: "uuid", unique: true }, ... }

// Use as Effect Schema (decode/encode)
const user = S.decodeSync(User.Model)({ id: "abc", _rowId: 1, email: "x@y.com" });

// Generate Drizzle table
const usersTable = toDrizzle(User.Model);  // pgTable("user", { _rowId: serial(...), id: uuid(...), ... })
```

---

## Objective

Deliver a working POC in 4 phases that validates the design document's approach.

### Success Criteria

| Criterion                                                                      | Verification Method                                                |
|--------------------------------------------------------------------------------|--------------------------------------------------------------------|
| `DSL.Field(S.String, { column: { type: "string" } })` returns annotated schema | `S.isSchema(field) === true` and annotation extractable            |
| `DSL.Model<Self>()("TableName", fields)` returns class with static properties  | TypeScript compiles, statics accessible                            |
| Model IS a valid Effect Schema                                                 | `S.decodeSync(Model)({ ... })` succeeds                            |
| Model has `.tableName`, `.columns`, `.primaryKey`, `.identifier` statics       | Direct property access works                                       |
| `toDrizzle(Model)` produces a valid Drizzle table definition                   | Drizzle `pgTable` structure validated                              |
| All tests pass                                                                 | `bun test packages/common/schema/src/integrations/sql/dsl` exits 0 |

### Scope Boundaries

**In Scope (POC)**:
- `DSL.Field` with column metadata annotations
- `DSL.Model` factory with static properties
- Single adapter: `toDrizzle`
- Basic tests validating core mechanics

**Explicitly Out of Scope**:
- `toBetterAuth` adapter (defer to post-POC)
- Complex index definitions (only `primaryKey` for POC)
- Edge cases: branded types, nested schemas, optional fields
- Production-quality error messages
- Full variant support (simplify to select-only for POC)

---

## Role

You are an **Effect Schema Implementation Specialist** with expertise in:
- Effect 3.x Schema API and AST internals
- Schema annotations and metadata attachment
- Factory functions returning class-based schemas
- Drizzle ORM schema generation

Your implementation approach:
1. **Minimal viable implementation** - prove the pattern works, not production-ready
2. **Fail fast** - if the design has flaws, discover them in Phase 1-2
3. **Clear boundaries** - stub what's out of scope, implement what's critical
4. **Pattern reuse** - leverage existing EntityId and VariantSchema patterns

---

## Constraints

### Effect-First Patterns (MANDATORY - Zero Exceptions)

**Required Import Style** (per CLAUDE.md requirements):
```typescript
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Match from "effect/Match";
import * as AST from "effect/SchemaAST";
import * as _Struct from "effect/Struct";
import * as P from "effect/Predicate";
```

**Forbidden Patterns** (Will fail code review):

| Forbidden                    | Required Alternative                                    |
|------------------------------|---------------------------------------------------------|
| `items.map(fn)`              | `F.pipe(items, A.map(fn))`                              |
| `items.filter(fn)`           | `F.pipe(items, A.filter(fn))`                           |
| `items.reduce(fn, init)`     | `F.pipe(items, A.reduce(init, fn))`                     |
| `str.split(" ")`             | `F.pipe(str, Str.split(" "))`                           |
| `str.toLowerCase()`          | `F.pipe(str, Str.toLowerCase)`                          |
| `Object.keys(obj)`           | `F.pipe(obj, _Struct.keys)`                             |
| `Object.entries(obj)`        | `F.pipe(obj, _Struct.entries)`                          |
| `switch (x) { case: ... }`   | `Match.value(x).pipe(Match.tag(...), Match.exhaustive)` |
| `new Date()`                 | `DateTime.unsafeNow()`                                  |
| `async function() { await }` | `Effect.gen(function*() { yield* })`                    |
| `() => null`                 | `nullOp` from `@beep/utils`                             |

**Schema Annotation Pattern** (from Effect research):
```typescript
// Define annotation symbol
const ColumnMetaSymbol: unique symbol = Symbol.for("@beep/dsl-model/column-meta");

// Apply annotation
const annotatedSchema = schema.annotations({ [ColumnMetaSymbol]: columnDef });

// Retrieve annotation
F.pipe(
  schema.ast,
  AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
  O.getOrElse(() => defaultColumnDef)
);
```

**Schema.Class AST Structure** (critical for field extraction):
```typescript
// Schema.Class creates Transformation AST
// Access the struct via .ast.from
const structAst = schema.ast._tag === "Transformation"
  ? schema.ast.from
  : schema.ast;

// Iterate property signatures
if (structAst._tag === "TypeLiteral") {
  F.pipe(
    structAst.propertySignatures,
    A.map((propSig) => ({
      key: propSig.name,
      annotations: propSig.type.annotations
    }))
  );
}
```

### POC Simplifications (Explicitly Allowed)

The following deviations from strict Effect-first patterns are permitted for this POC:

| Simplification                                             | Reason                                  | Post-POC Action                              |
|------------------------------------------------------------|-----------------------------------------|----------------------------------------------|
| Use `any` sparingly for complex type gymnastics            | Type inference complexity               | Mark with `// TODO: proper types`            |
| Hardcode snake_case with native `str.replace()`            | No Effect String regex support          | Extract to utility or use library            |
| Use `Object.entries()` for iteration                       | Simpler than pipe-based approach in POC | Use `_Struct.entries(obj)` in production     |
| Default column type to `"string"` instead of AST inference | AST inference is complex                | Implement `inferColumnType(schema)` post-POC |
| Test assertions use native `expect().toEqual()`            | Bun test runner conventions             | Acceptable in test files                     |
| Minimal error messages                                     | Focus on happy path                     | Add descriptive errors post-POC              |
| Single test file                                           | Prove concept quickly                   | Split into unit/integration tests            |
| Simplified `S.Class` instead of `VariantSchema.Class`      | Reduce complexity                       | Migrate to VariantSchema for variants        |

**Note**: The design document (Section 5, Q3) describes AST-based column type inference. This POC explicitly defers that feature, using hardcoded defaults instead. Full inference should be implemented post-POC.

### Error Handling Approach

For this POC, use defensive defaults rather than throwing errors:

| Scenario                              | Handling                                  | Rationale                                           |
|---------------------------------------|-------------------------------------------|-----------------------------------------------------|
| Missing `ColumnMetaSymbol` annotation | `O.getOrElse(() => ({ type: "string" }))` | Fields without explicit config get sensible default |
| Unknown column type in `toDrizzle`    | `Match.exhaustive` compile-time error     | All `ColumnType` values must be handled             |
| Invalid schema passed to `Field`      | Let Effect Schema throw naturally         | Don't wrap Effect's own validation                  |
| Missing `primaryKey` fields           | Return empty array `[]`                   | Valid state (some tables have no explicit PK)       |

**Post-POC**: Add tagged errors (`ModelError`, `AdapterError`) for production use cases where explicit error handling is needed.

### File Structure

```
packages/common/schema/src/integrations/sql/dsl/
├── index.ts              # Public exports
├── types.ts              # ColumnType, ColumnDef, FieldConfig, symbols
├── Field.ts              # DSL.Field implementation
├── Model.ts              # DSL.Model factory
├── adapters/
│   └── drizzle.ts        # toDrizzle implementation
└── __tests__/
    └── poc.test.ts       # Validation tests
```

---

## Resources

### Files to Read Before Implementation

| File                                                                  | Purpose                                     | Priority    |
|-----------------------------------------------------------------------|---------------------------------------------|-------------|
| `.specs/dsl-model/DSL-MODEL-DESIGN.md`                                | Authoritative design specification          | Required    |
| `packages/common/schema/src/core/VariantSchema.ts`                    | Class extension pattern, caching, TypeId    | Required    |
| `packages/common/schema/src/identity/entity-id/entity-id.ts`          | Static property pattern, annotation merging | Required    |
| `packages/common/schema/src/integrations/sql/Model.ts`                | Field combinator reference                  | Recommended |
| `packages/common/schema/src/core/annotations/built-in-annotations.ts` | mergeSchemaAnnotations utility              | Recommended |

### Effect Documentation (via MCP)

Query the Effect docs MCP for:
- `Schema.Class` - class-based schema pattern
- `SchemaAST.getAnnotation` - annotation retrieval
- `Schema.annotations` - attaching metadata

### Drizzle Types (for adapter)

```typescript
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";
import { pgTable, text, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
```

---

## Phases

### Phase 1: POC Planning

**Goal**: Create a detailed implementation plan from the design document.

**Actions**:
1. Read `.specs/dsl-model/DSL-MODEL-DESIGN.md` completely
2. Identify minimum viable type definitions
3. Map implementation order with dependencies
4. Document known simplifications vs full design
5. Draft test cases that will validate success criteria

**Deliverable**: `.specs/dsl-model/poc-plan.md` containing:
- Simplified type definitions (minimum viable)
- Implementation order with file dependencies
- Test case specifications
- Known simplifications table

---

### Phase 2: POC Boilerplating

**Goal**: Create all files with types, interfaces, and stubs (NO implementation logic).

**Deliverables**:

**types.ts**:
```typescript
import type * as AST from "effect/SchemaAST";

export type ColumnType = "string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json";

// Generic ColumnDef preserves specific literals
export interface ColumnDef<
  T extends ColumnType = ColumnType,
  PK extends boolean = boolean,
  U extends boolean = boolean,
  N extends boolean = boolean,
  AI extends boolean = boolean
> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  readonly nullable?: N;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AI;
}

// Helper to create exact ColumnDef from partial config
export type ExactColumnDef<C extends Partial<ColumnDef>> = {
  readonly type: C extends { type: infer T extends ColumnType } ? T : "string";
  readonly primaryKey: C extends { primaryKey: infer PK extends boolean } ? PK : false;
  readonly unique: C extends { unique: infer U extends boolean } ? U : false;
  readonly nullable: C extends { nullable: infer N extends boolean } ? N : false;
  readonly autoIncrement: C extends { autoIncrement: infer AI extends boolean } ? AI : false;
  readonly defaultValue: C extends { defaultValue: infer DV } ? DV : undefined;
};

export interface FieldConfig<C extends Partial<ColumnDef> = Partial<ColumnDef>> {
  readonly column?: C;
}

// Annotation symbol - use Symbol.for for cross-module consistency
export const ColumnMetaSymbol: unique symbol = Symbol.for("@beep/dsl-model/column-meta");
export type ColumnMetaSymbol = typeof ColumnMetaSymbol;
```

**Field.ts**:
```typescript
import * as S from "effect/Schema";
import type { FieldConfig, ColumnDef, ExactColumnDef } from "./types";
import { ColumnMetaSymbol } from "./types";

export interface DSLField<
  A,
  I = A,
  R = never,
  C extends ColumnDef = ColumnDef
> extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: C;
}

export const Field = <
  A,
  I,
  R,
  const C extends Partial<ColumnDef> = {}
>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig<C>
): DSLField<A, I, R, ExactColumnDef<C>> => {
  // Implementation attaches column metadata via annotation
  throw new Error("TODO: Implement Field");
};
```

**Model.ts**:
```typescript
import type * as S from "effect/Schema";
import type { ColumnDef } from "./types";
import * as Data from "effect/Data";
import { $SchemaId } from "@beep/identity/packages";
const $I = $SchemaId.create("");

export interface ModelStatics<
  TName extends string = string,
  Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
  PK extends readonly string[] = readonly string[],
  Id extends string = string
> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
}

class ImplementModelError extends Data.TaggedError("ImplementModelError")<{
  readonly messsage: string;
}> {
  constructor(messsage: string) {
    super({ messsage });
  }
}

export interface ModelSchema<
  Self,
  Fields extends S.Struct.Fields,
  TName extends string = string,
  Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
  PK extends readonly string[] = readonly string[],
  Id extends string = string
>
  extends S.Schema<Self, S.Struct.Encoded<Fields>, S.Struct.Context<Fields>>,
          ModelStatics<TName, Columns, PK, Id> {}

function Class<Self>(identifier: string) {
  return <const Fields extends S.Struct.Fields>(
    fields: Fields & Struct.Validate<Fields, Variants[number]>,
    annotations
   )
}

// export const Model: <Self>() => <const Fields extends S.Struct.Fields>(
//   identifier: string,
//   fields: Fields
// ) => ModelSchema<Self, Fields> & (new (props: S.Struct.Type<Fields>) => Self) =
//   () => (_identifier, _fields) => {
//     throw new ImplementModelError("TODO: Implement Model");
//   };
```

**adapters/drizzle.ts**:
```typescript
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { ModelStatics } from "../Model";

export const toDrizzle = <M extends ModelStatics>(
  _model: M
): PgTableWithColumns<any> => {
  throw new ImplementModelError("TODO: Implement toDrizzle");
};
```

**index.ts**:
```typescript
export * from "./types";
export { Field, type DSLField } from "./Field";
export { Model, type ModelSchema, type ModelStatics } from "./Model";
export { toDrizzle } from "./adapters/drizzle";
```

**__tests__/poc.test.ts**:
```typescript
import { describe, it, expect } from "bun:test";
import * as S from "effect/Schema";
import { Field, Model, toDrizzle, ColumnMetaSymbol } from "../index";
import * as AST from "effect/SchemaAST";
import * as O from "effect/Option";
import * as F from "effect/Function";

describe("DSL.Model POC", () => {
  describe("Field", () => {
    it("returns a valid Effect Schema", () => {
      const field = Field(S.String, { column: { type: "string" } });
      expect(S.isSchema(field)).toBe(true);
    });

    it("attaches column metadata via annotation", () => {
      const field = Field(S.String, { column: { type: "string", unique: true } });
      const meta = F.pipe(
        field.ast,
        AST.getAnnotation<{ readonly type: string; readonly unique?: undefined | boolean }>(ColumnMetaSymbol),
        O.getOrElse(() => ({ type: "unknown" }))
      );
      expect(meta.type).toBe("string");
      expect(meta.unique).toBe(true);
    });

    it("attaches autoIncrement for serial columns", () => {
      const field = Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } });
      const meta = F.pipe(
        field.ast,
        AST.getAnnotation<{ readonly type: string; readonly primaryKey?: undefined | boolean; readonly autoIncrement?: undefined | boolean }>(ColumnMetaSymbol),
        O.getOrElse(() => ({ type: "unknown" }))
      );
      expect(meta.type).toBe("integer");
      expect(meta.primaryKey).toBe(true);
      expect(meta.autoIncrement).toBe(true);
    });
  });

  describe("Model", () => {
    it("is a valid Effect Schema", () => {
      class TestModel extends Model<TestModel>()("Test", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      expect(S.isSchema(TestModel)).toBe(true);
    });

    it("exposes tableName as snake_case of identifier", () => {
      class UserProfile extends Model<UserProfile>()("UserProfile", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      expect(UserProfile.tableName).toBe("user_profile");
    });

    it("exposes identifier unchanged", () => {
      class TestModel extends Model<TestModel>()("Test", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      expect(TestModel.identifier).toBe("Test");
    });

    it("derives primaryKey from fields with primaryKey: true", () => {
      class TestModel extends Model<TestModel>()("Test", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      expect(TestModel.primaryKey).toEqual(["_rowId"]);  // NOT ["id"]
    });

    it("exposes columns record with ColumnDef for each field", () => {
      class TestModel extends Model<TestModel>()("Test", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        email: Field(S.String, { column: { type: "string", unique: true } }),
      }) {}

      // Runtime assertions
      expect(TestModel.columns._rowId.type).toBe("integer");
      expect(TestModel.columns._rowId.primaryKey).toBe(true);
      expect(TestModel.columns._rowId.autoIncrement).toBe(true);
      expect(TestModel.columns.id.type).toBe("uuid");
      expect(TestModel.columns.id.unique).toBe(true);
      expect(TestModel.columns.email.type).toBe("string");
      expect(TestModel.columns.email.unique).toBe(true);

      // Type-level assertions - these verify compile-time correctness
      // If the types are not preserved, these will cause TypeScript errors
      type IdColumn = typeof TestModel.columns.id;
      type RowIdColumn = typeof TestModel.columns._rowId;
      type EmailColumn = typeof TestModel.columns.email;

      // Assert id column type is literally "uuid" (not just ColumnType)
      type IdTypeIsUuid = IdColumn["type"] extends "uuid" ? true : false;
      const _idCheck: IdTypeIsUuid = true;

      // Assert _rowId column has primaryKey: true and autoIncrement: true
      type RowIdIsPK = RowIdColumn["primaryKey"] extends true ? true : false;
      type RowIdIsAI = RowIdColumn["autoIncrement"] extends true ? true : false;
      const _rowIdPKCheck: RowIdIsPK = true;
      const _rowIdAICheck: RowIdIsAI = true;

      // Assert email column has unique: true
      type EmailIsUnique = EmailColumn["unique"] extends true ? true : false;
      const _emailUniqueCheck: EmailIsUnique = true;

      // Assert identifier is preserved as literal type "Test"
      type IdentifierIsTest = typeof TestModel.identifier extends "Test" ? true : false;
      const _identifierCheck: IdentifierIsTest = true;
    });

    it("S.decodeSync works with Model", () => {
      class TestModel extends Model<TestModel>()("Test", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      const decode = S.decodeSync(TestModel);
      const result = decode({ id: "test-id", _rowId: 1, name: "Test Name" });

      expect(result.id).toBe("test-id");
      expect(result._rowId).toBe(1);
      expect(result.name).toBe("Test Name");
    });

    it("S.decodeSync fails on invalid input", () => {
      class TestModel extends Model<TestModel>()("Test", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      const decode = S.decodeSync(TestModel);
      expect(() => decode({ id: 123, _rowId: "not-a-number" })).toThrow();
    });
  });

  describe("toDrizzle", () => {
    it("produces a Drizzle table with correct name", () => {
      class TestModel extends Model<TestModel>()("Test", {
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      const table = toDrizzle(TestModel);
      expect(table).toBeDefined();
      // Verify the Drizzle table has the expected table name
      // Note: Drizzle stores table metadata in various ways; check the actual
      // table object structure or use Drizzle's getTableName utility if available
      expect((table as any)[Symbol.for("drizzle:Name")] ?? table._.name).toBe("test");
    });
  });
});
```

---

### Phase 3: POC Implementation

**Goal**: Implement the stubs to make all tests pass.

**Implementation Order** (dependency-aware):

1. **types.ts** - Already complete from boilerplating

2. **Field.ts** - Annotation attachment
```typescript
import * as S from "effect/Schema";
import type { FieldConfig, ColumnDef, ExactColumnDef } from "./types";
import { ColumnMetaSymbol } from "./types";
import { $SchemaId } from "@beep/identity/packages";

const $I = $SchemaId.create("path-to-module");

export const TypeId: unique symbol = Symbol.for($I`TypeId`);
export type TypeId = typeof TypeId;
const cacheSymbol = Symbol.for($I`cache`);
export interface Struct<in out A extends Field.Fields> extends Pipeable.Pipeable {
  readonly [TypeId]: A;

  [cacheSymbol]?: undefined | Record<string, S.Schema.All>;
}

export const isStruct = (u: unknown): u is Struct<any> => P.hasProperty(u, TypeId);

export declare namespace Struct {
  /**
   * @since 1.0.0
   * @category models
   */
  export type Any = { readonly [TypeId]: any };

  /**
   * @since 1.0.0
   * @category models
   */
  export type Fields = {
    readonly [key: string]: S.Schema.All | S.PropertySignature.All | Field<any> | Struct<any> | undefined;
  };

  /**
   * @since 1.0.0
   * @category models
   */
  export type Validate<A, Variant extends string> = {
    readonly [K in keyof A]: A[K] extends { readonly [TypeId]: infer _ }
      ? Validate<A[K], Variant>
      : A[K] extends Field<infer Config>
        ? [keyof Config] extends [Variant]
          ? {}
          : "field must have valid variants"
        : {};
  };
}


/**
 * @since 1.0.0
 * @category type ids
 */
export const FieldTypeId: unique symbol = Symbol.for($I`Field`);

/**
 * @since 1.0.0
 * @category type ids
 */
export type FieldTypeId = typeof FieldTypeId;
export interface AnySchema extends Pipeable {
  readonly [S.TypeId]: any;
  readonly Type: any;
  readonly Encoded: any;
  readonly Context: any;
  readonly make?: (params: any, ...rest: ReadonlyArray<any>) => any;
  readonly ast: AST.AST;
  readonly annotations: any;
}
/**
 * @since 1.0.0
 * @category models
 */
export interface DSLField<
  C extends ColumnDef = ColumnDef
> extends AnySchema {
  readonly [FieldTypeId]: FieldTypeId;
  readonly [ColumnMetaSymbol]: C;
}


export const Field = <
  Schema extends AnySchema,
  const C extends Partial<ColumnDef> = {}
>(
  schema: Schema,
  config?: FieldConfig<C>
): DSLField<ExactColumnDef<C>> => {
  const columnDef: ExactColumnDef<C> = {
    type: config?.column?.type ?? "string",
    primaryKey: config?.column?.primaryKey ?? false,
    unique: config?.column?.unique ?? false,
    nullable: config?.column?.nullable ?? false,
    autoIncrement: config?.column?.autoIncrement ?? false,
    defaultValue: config?.column?.defaultValue,
  } as ExactColumnDef<C>;

  return schema.annotations({
    [ColumnMetaSymbol]: columnDef,
  }) as DSLField<ExactColumnDef<C>>;
};
```

3. **Model.ts** - Factory with static properties
   ```typescript
   import * as S from "effect/Schema";
   import * as A from "effect/Array";
   import * as F from "effect/Function";
   import * as O from "effect/Option";
   import * as _Struct from "effect/Struct";
   import * as R from "effect/Record";
   import * as AST from "effect/SchemaAST";
   import type { ColumnDef, ExactColumnDef } from "./types";
   import { ColumnMetaSymbol, type DSLField } from "./types";

   // Snake case helper (POC: simple implementation)
   const toSnakeCase = (str: string): string =>
     str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");

   // Type-level extraction of columns from fields
   export type ExtractColumnsType<Fields extends S.Struct.Fields> = {
     readonly [K in keyof Fields]: Fields[K] extends DSLField<any, any, any, infer C>
       ? C
       : ColumnDef<"string", false, false, false, false>;
   };

   // Type-level extraction of primary key field names
   export type ExtractPrimaryKeys<Fields extends S.Struct.Fields> = {
     [K in keyof Fields]: Fields[K] extends DSLField<any, any, any, infer C>
       ? C extends { primaryKey: true }
         ? K
         : never
       : never;
   }[keyof Fields];

   // Extract column metadata from field annotations (runtime)
   const extractColumns = <Fields extends S.Struct.Fields>(
     fields: Fields
   ): ExtractColumnsType<Fields> =>
     F.pipe(
       fields,
       _Struct.keys,
       A.map((key) => {
         const field = fields[key as keyof typeof fields];
         const schema = S.isPropertySignature(field) ? field.from : field;
         const columnDef = F.pipe(
           schema.ast,
           AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
           O.getOrElse(() => ({ type: "string" as const, primaryKey: false, unique: false, nullable: false, autoIncrement: false }))
         );
         return [key, columnDef] as const;
       }),
       R.fromEntries
     ) as ExtractColumnsType<Fields>;

   // Derive primary key fields (runtime)
   const derivePrimaryKey = <Columns extends Record<string, ColumnDef>>(
     columns: Columns
   ): readonly string[] =>
     F.pipe(
       columns,
       _Struct.entries,
       A.filter(([_, def]) => def.primaryKey === true),
       A.map(([key]) => key)
     );

   export interface ModelStatics<
     TName extends string = string,
     Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
     PK extends readonly string[] = readonly string[],
     Id extends string = string
   > {
     readonly tableName: TName;
     readonly columns: Columns;
     readonly primaryKey: PK;
     readonly identifier: Id;
   }

   export const Model = <Self = never>(identifier: string) =>
    <const Fields extends Struct.Fields>(
   fields: Fields & Struct.Validate<Fields, Variants[number]>,
    annotations?: S.Annotations.Schema<Self>
     ) => {
       type Columns = ExtractColumnsType<Fields>;
       type PKFields = ExtractPrimaryKeys<Fields>;
       type TableName = string; // POC: toSnakeCase result type is string

       const columns = extractColumns(fields);
       const primaryKey = derivePrimaryKey(columns);
       const tableName = toSnakeCase(identifier);

       class ModelClass extends S.Class<Self>(identifier)(fields) {
         static readonly tableName = tableName;
         static readonly columns = columns;
         static readonly primaryKey = primaryKey;
         static readonly identifier = identifier;
       }

       return ModelClass as typeof ModelClass & ModelStatics<TableName, Columns, readonly PKFields[], Identifier>;
     };
   ```

4. **adapters/drizzle.ts** - Table generation
   ```typescript
   import { pgTable, text, integer, boolean, timestamp, uuid, jsonb, serial } from "drizzle-orm/pg-core";
   import type { PgTableWithColumns, PgColumn } from "drizzle-orm/pg-core";
   import * as A from "effect/Array";
   import * as F from "effect/Function";
   import * as R from "effect/Record";
   import * as _Struct from "effect/Struct";
   import * as Match from "effect/Match";
   import type { ModelStatics } from "../Model";
   import type { ColumnDef, ColumnType } from "../types";

   // Type-level mapping from ColumnDef to Drizzle column types
   // This allows preserving column type information in the output
   type DrizzleColumnForType<T extends ColumnType> =
     T extends "string" ? ReturnType<typeof text>
     : T extends "number" ? ReturnType<typeof integer>
     : T extends "integer" ? ReturnType<typeof integer> | ReturnType<typeof serial>
     : T extends "boolean" ? ReturnType<typeof boolean>
     : T extends "datetime" ? ReturnType<typeof timestamp>
     : T extends "uuid" ? ReturnType<typeof uuid>
     : T extends "json" ? ReturnType<typeof jsonb>
     : never;

   // Type-level transformation of columns record to Drizzle table shape
   export type DrizzleTableShape<Columns extends Record<string, ColumnDef>> = {
     [K in keyof Columns]: DrizzleColumnForType<Columns[K]["type"]>;
   };

   // Map ColumnType to Drizzle column builder
   const columnBuilder = (name: string, def: ColumnDef) => {
     const base = Match.value(def.type).pipe(
       Match.when("string", () => text(name)),
       Match.when("number", () => integer(name)),
       // Integer with autoIncrement becomes serial (pg.serial for _rowId pattern)
       Match.when("integer", () => def.autoIncrement ? serial(name) : integer(name)),
       Match.when("boolean", () => boolean(name)),
       Match.when("datetime", () => timestamp(name, { withTimezone: true })),
       Match.when("uuid", () => uuid(name)),
       Match.when("json", () => jsonb(name)),
       Match.exhaustive
     );

     let column = base;
     // Note: serial columns are implicitly NOT NULL in PostgreSQL
     // and are typically used as primary keys. We still mark primaryKey
     // explicitly for clarity in the schema definition.
     if (def.primaryKey) column = column.primaryKey();
     if (def.unique) column = column.unique();
     if (!def.nullable) column = column.notNull();

     return column;
   };

   export const toDrizzle = <
     TName extends string,
     Columns extends Record<string, ColumnDef>,
     PK extends readonly string[],
     Id extends string,
     M extends ModelStatics<TName, Columns, PK, Id>
   >(
     model: M
   ): PgTableWithColumns<{
     name: TName;
     schema: undefined;
     columns: DrizzleTableShape<Columns>;
     dialect: "pg";
   }> => {
     const columnDefs = F.pipe(
       _Struct.entries(model.columns),
       A.map(([key, def]) => [key, columnBuilder(key, def)] as const),
       R.fromEntries
     );

     return pgTable(model.tableName, columnDefs) as PgTableWithColumns<{
       name: TName;
       schema: undefined;
       columns: DrizzleTableShape<Columns>;
       dialect: "pg";
     }>;
   };
   ```

---

### Phase 4: POC Validation

**Goal**: Run tests and validate the design works.

**Validation Commands**:
```bash
# Type check
bun run check --filter=@beep/schema

# Run POC tests
bun test packages/common/schema/src/integrations/sql/dsl

# Lint
bun run lint --filter=@beep/schema
```

**Validation Checklist**:
- [ ] All tests pass (exit code 0)
- [ ] `S.decodeSync(Model)` successfully decodes valid input
- [ ] `S.decodeSync(Model)` throws on invalid input
- [ ] Static properties accessible via `Model.tableName`, `Model.columns`, etc.
- [ ] `toDrizzle` produces a pgTable with correct structure
- [ ] No TypeScript errors (`bun run check` passes)
- [ ] No lint errors (`bun run lint` passes)

**If Tests Fail**:
1. Document what failed and the error message
2. Identify if it's a design document gap or implementation bug
3. Propose fix to either design or implementation
4. Update POC and re-run validation

**Intermediate Validation Points**:
- After Phase 2: Run `bun run check --filter=@beep/schema` to verify types compile
- After Phase 3 step 2 (Field.ts): Run tests for Field only to validate annotation attachment
- After Phase 3 step 3 (Model.ts): Run full test suite to validate static properties

---

## Known Limitations (Post-POC Work)

The following capabilities are intentionally deferred from this POC:

| Limitation                              | Design Doc Reference | Post-POC Implementation                 |
|-----------------------------------------|----------------------|-----------------------------------------|
| No AST-based column type inference      | Section 5, Q3        | Implement `inferColumnType(schema.ast)` |
| No composite primary keys               | Section 1.3          | Support `primaryKey: ["col1", "col2"]`  |
| No index generation in `toDrizzle`      | Section 4.1          | Add `IndexDef` support                  |
| No `toBetterAuth` adapter               | Section 4.2          | Implement full adapter                  |
| No variant support (insert/update/json) | Section 2, 3         | Migrate to `VariantSchema.Class`        |
| No foreign key / references support     | Section 1.2          | Add `references` to `ColumnDef`         |
| No default value generation             | Section 1.2          | Add `$defaultFn` support in `toDrizzle` |
| Single table per model                  | Section 3.2          | Support table inheritance               |

These limitations are acceptable for proving the core pattern works. The full implementation should address each item.

---

## Output Specification

| Phase   | Deliverable            | Location                                           |
|---------|------------------------|----------------------------------------------------|
| Phase 1 | Planning document      | `.specs/dsl-model/poc-plan.md`                     |
| Phase 2 | Stub files (6 files)   | `packages/common/schema/src/integrations/sql/dsl/` |
| Phase 3 | Working implementation | Same location (stubs replaced)                     |
| Phase 4 | Test results + fixes   | Console output, updated files if needed            |

---

## Examples

### Field Usage

```typescript
import * as S from "effect/Schema";
import { Field } from "@beep/schema/integrations/sql/dsl";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";

// Simple string field
const nameField = Field(S.String, {
  column: { type: "string" },
});

// Field with unique constraint
const emailField = Field(S.String, {
  column: { type: "string", unique: true },
});

// Public UUID identifier (NOT the primary key)
const idField = Field(SharedEntityIds.UserId, {
  column: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.UserId.create() },
});

// Internal primary key (pg.serial - auto-increment integer)
const rowIdField = Field(S.Int, {
  column: { type: "integer", primaryKey: true, autoIncrement: true },
});

// Nullable field
const bioField = Field(S.NullOr(S.String), {
  column: { type: "string", nullable: true },
});
```

### Model Usage

```typescript
import * as DSL from "@beep/schema/integrations/sql/dsl";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { BS } from "@beep/schema";  // Required for BS.DateTimeUtcFromAllAcceptable
import * as S from "effect/Schema";
import { $SchemaId } from "@beep/identity/packages";
const $I = $SchemaId.create("path-to-module");

// Define model - exported as namespace (User.Model pattern)
// The User namespace comes from entities/index.ts doing:
//   export * as User from "./User"
// And the User module's index.ts re-exports from User.model.ts
class Model extends DSL.Model<Model>($I`"UserModel"`)({
  // Public UUID identifier (NOT primary key)
  id: DSL.Field(SharedEntityIds.UserId, {
    column: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.UserId.create() }
  }),
  // Internal primary key (pg.serial) - uses branded modelRowIdSchema
  _rowId: DSL.Field(SharedEntityIds.UserId.modelRowIdSchema, {
    column: { type: "integer", primaryKey: true, autoIncrement: true }
  }),
  email: DSL.Field(S.String, { column: { type: "string", unique: true } }),
  name: DSL.Field(S.String, { column: { type: "string" } }),
  createdAt: DSL.Field(BS.DateTimeUtcFromAllAcceptable, { column: { type: "datetime" } }),
}, $I.annotations("UserModel", {
  description: "The User domain entity."
})) {}

// Access via namespace pattern requires: export * as User from "./User" in an index file
// Use as Effect Schema
const user = S.decodeSync(User.Model)({
  id: "550e8400-e29b-41d4-a716-446655440000",
  _rowId: 1,
  email: "alice@example.com",
  name: "Alice",
  createdAt: new Date().toISOString(),
});

// Access static properties via namespace pattern
console.log(User.Model.tableName);    // "user"
console.log(User.Model.identifier);   // "UserModel"
console.log(User.Model.primaryKey);   // ["_rowId"]  // NOT ["id"]!
console.log(User.Model.columns._rowId.autoIncrement); // true
console.log(User.Model.columns.email.unique); // true

// Generate Drizzle table
const usersTable = toDrizzle(User.Model);
// usersTable is now a valid pgTable with _rowId as serial primary key
```

---

## Verification Checklist

### Phase 1 Completion
- [ ] Design document fully read and understood
- [ ] Simplified type definitions documented
- [ ] Implementation order mapped with dependencies
- [ ] Test cases drafted
- [ ] Simplifications table completed

### Phase 2 Completion
- [ ] All 6 files created at correct paths
- [ ] Types compile without errors (`bun run check`)
- [ ] All stubs throw "TODO: Implement X" errors
- [ ] Test file exists with all test cases (failing)

### Phase 3 Completion
- [ ] Field.ts annotates schemas correctly
- [ ] Model.ts exposes all static properties
- [ ] Model.ts works with S.decodeSync
- [ ] toDrizzle.ts produces valid pgTable
- [ ] No TypeScript errors
- [ ] All tests pass

### Phase 4 Completion
- [ ] `bun test` exits 0
- [ ] `bun run check` exits 0
- [ ] `bun run lint` exits 0
- [ ] Design gaps documented (if any)
- [ ] Ready for code review

---

## Metadata

### Research Sources

**Codebase Files Explored**:
- `packages/common/schema/src/core/VariantSchema.ts` - 6-variant infrastructure
- `packages/common/schema/src/identity/entity-id/entity-id.ts` - Static property pattern
- `packages/common/schema/src/integrations/sql/Model.ts` - Field combinator reference
- `packages/common/schema/src/integrations/sql/dsl/dsl.ts` - Existing type schemas
- `packages/common/schema/src/core/annotations/built-in-annotations.ts` - Annotation utilities

**AGENTS.md Guidelines Consulted**:
- `packages/common/schema/AGENTS.md` - EntityId, kits, annotations, pure schemas
- `packages/shared/tables/AGENTS.md` - Table.make, OrgTable.make patterns
- `packages/_internal/db-admin/AGENTS.md` - Migration workflow
- `packages/common/contract/AGENTS.md` - Contract patterns
- `packages/common/invariant/AGENTS.md` - Assertion contracts

**Effect Documentation Researched**:
- Schema.Class - Three-schema architecture (from/to/transformation)
- SchemaAST.getAnnotation - Annotation retrieval with type safety
- Schema.annotations - Metadata attachment pattern

### Refinement History

| Iteration | Date       | Issues Found                                      | Fixes Applied                                                                                                                                                                                                                                                                                               |
|-----------|------------|---------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0         | 2025-12-26 | Initial                                           | N/A                                                                                                                                                                                                                                                                                                         |
| 1         | 2025-12-26 | Exploration complete                              | Added codebase context, AGENTS.md constraints, Effect patterns, specific file paths, expanded test cases                                                                                                                                                                                                    |
| 2         | 2025-12-26 | Critic review: 5 issues (1 HIGH, 2 MEDIUM, 2 LOW) | (1) Added "What We're Building" example, (2) Expanded POC Simplifications table with AST inference deferral, Object.fromEntries allowance, native string methods, test assertions, (3) Added Error Handling Approach section, (4) Added Known Limitations section, (5) Added Intermediate Validation Points |
