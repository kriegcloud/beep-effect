# ModelFactory/ModelBuilder Implementation Research Synthesis

## Executive Summary

This document synthesizes five implementation research reports to provide actionable guidance for implementing `ModelFactory`/`ModelBuilder`. The research examined Effect's core patterns (`Record.union`, `S.Class`, curried factories), TypeScript type-level techniques (`const` type parameters, `MergeColumnDef`), and battle-tested factory patterns from the beep-effect codebase.

**Key Recommendation**: Implement a three-stage curried factory that uses `Record.union` for right-biased field merging, `const` type parameters for literal preservation, and the `S.Class<Self>()()` pattern for class generation with static metadata attachment.

---

## Part 1: Field Merging with Record.union

### Core Pattern: Right-Biased Merging

The optimal approach for merging default fields with user-provided fields is `Record.union` with right-bias semantics:

```typescript
import * as R from "effect/Record";

const mergeModelFields = <
  Defaults extends DSL.Fields,
  User extends DSL.Fields
>(
  defaults: Defaults,
  user: User
): Defaults & User => {
  // Right-bias: user fields override defaults when keys conflict
  return R.union(defaults, user, (_, right) => right) as Defaults & User;
};
```

### Why Record.union?

1. **Effect-idiomatic**: Aligns with project coding standards (AGENTS.md mandates Effect utilities)
2. **Right-bias semantics**: User fields explicitly override defaults via `(_, right) => right`
3. **Type-preserving**: Returns `A & B` intersection type, capturing exact literal types
4. **Immutable**: Creates new object without mutating inputs
5. **Battle-tested**: Already implemented in beep-effect's `mergeFields` utility at `packages/common/schema/src/core/utils/merge-fields.ts`

### Merge Semantics

```typescript
R.union(defaults, user, (_, right) => right)
```

| Key Exists In | Result |
|--------------|--------|
| `defaults` only | Include `defaults[key]` |
| `user` only | Include `user[key]` |
| Both | Use `user[key]` (right-bias) |

### Integration Pattern

```typescript
// In ModelBuilder.create()
const defaultFields = {
  id: Field.uuid().primaryKey(),
  createdAt: Field.createdAt(),
  updatedAt: Field.updatedAt(),
} as const;

type DefaultFields = typeof defaultFields;

const mergedFields = R.union(defaultFields, options.fields, (_, right) => right);
```

### Column Metadata Extraction

After merging, extract column metadata using `Struct.entries`:

```typescript
import * as Struct from "effect/Struct";
import * as A from "effect/Array";
import * as R from "effect/Record";

const columns = F.pipe(
  mergedFields,
  Struct.entries,
  A.map(([key, field]) => [key, getColumnDef(field)] as const),
  R.fromEntries
) as ExtractColumnsType<Fields>;
```

---

## Part 2: Three-Stage Curried Factory Pattern

### Pattern Overview

Effect's curried factories use **closure capture** to preserve configuration context across multiple function calls:

```
Stage 1: Configuration Capture
  ModelBuilder.create(config) =>

Stage 2: Identifier Capture (with Self generic)
  <Self = never>(identifier: string) =>

Stage 3: Fields Processing and Class Construction
  <const Fields extends DSL.Fields>(fields, annotations?) =>
    ModelClassWithVariants<Self, Fields, ...>
```

### Stage 1: Configuration Capture

```typescript
export const create = <const Config extends BuilderConfig>(config: Config) =>
```

**Responsibilities**:
- Accept builder configuration (table naming strategy, column transformations)
- Validate configuration if needed
- Return the identifier-accepting function

**Type parameters captured**: `Config`

### Stage 2: Identifier Capture

```typescript
<Self = never>(identifier: string) =>
```

**Responsibilities**:
- Accept model identifier string
- Validate identifier (length, SQL compatibility)
- Apply table naming strategy from config
- Return the fields-accepting function

**Type parameters captured**: `Self` (user must provide)
**Runtime values captured**: `config`, `identifier`

### Stage 3: Fields Processing and Class Construction

```typescript
<const Fields extends DSL.Fields>(
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
): [Self] extends [never]
  ? MissingSelfGeneric<`("${typeof identifier}")`>
  : ModelClassWithVariants<Self, Fields, ...>
```

**Responsibilities**:
- Process fields into variant-compatible format
- Derive columns metadata
- Derive primary key(s)
- Compute table name from identifier + config strategy
- Construct base class using `S.Class`
- Attach static properties (tableName, columns, primaryKey)
- Attach variant accessors (select, insert, update, json, jsonCreate, jsonUpdate)

### Key Implementation Principles

#### 1. Closure Capture for Configuration Propagation

Each curried level returns a function that captures previous parameters in its closure:

```typescript
export const Class = <Self = never>(identifier: string) =>
  <Fields extends Struct.Fields>(
    fieldsOr: Fields | HasFields<Fields>,
    annotations?: ClassAnnotations<Self, Simplify<Struct.Type<Fields>>>
  ): ClassResult<Self, Fields> => {
    // 'identifier' is captured from outer scope
    return makeClass({
      kind: "Class",
      identifier,  // Closure capture
      schema: getSchemaFromFieldsOr(fieldsOr),
      fields: getFieldsFromFieldsOr(fieldsOr),
      Base: data_.Class,
      annotations
    })
  }
```

#### 2. Lazy Evaluation with Object.defineProperty

For expensive computed properties (like variant schemas), use lazy getters with caching:

```typescript
const variantCache: Record<string, S.Schema.All> = {}

for (const variant of ModelVariant.Options) {
  Object.defineProperty(BaseClass, variant, {
    get: () => {
      if (variantCache[variant] === undefined) {
        variantCache[variant] = VS.extract(vsStruct, variant).annotations({
          identifier: `${identifier}.${variant}`,
          title: `${identifier}.${variant}`
        })
      }
      return variantCache[variant]
    },
    enumerable: true,
    configurable: false
  })
}
```

**Benefits**:
- Variants only computed when accessed
- Cached for subsequent access
- No overhead if unused

---

## Part 3: Type-Level Techniques for Literal Preservation

### Pattern 1: `const` Type Parameters

The `const` modifier instructs TypeScript to infer the narrowest possible literal type:

```typescript
// Without const:
// TypeScript infers: C = { column: { type: ColumnType.Type } }  // widened!

// With const:
// TypeScript infers: C = { column: { type: "uuid" } }  // literal preserved!
```

**Usage in ModelBuilder**:

```typescript
export const create = <const Config extends BuilderConfig>(config: Config) =>
  <Self = never>(identifier: string) =>
    <const Fields extends DSL.Fields>(
      fields: Fields,
      annotations?: S.Annotations.Schema<Self>
    ): ModelClassWithVariants<...>
```

### Pattern 2: MergeColumnDef for Property-Level Override

From `combinators.ts`, `MergeColumnDef` implements property-level override strategy:

```typescript
type MergeColumnDef<
  Existing extends Partial<ColumnDef>,
  New extends Partial<ColumnDef>
> = ExactColumnDef<{
  readonly type: New extends { type: infer T }
    ? T
    : Existing extends { type: infer T }
      ? T
      : "string";
  readonly primaryKey: New extends { primaryKey: infer PK }
    ? PK
    : Existing extends { primaryKey: infer PK }
      ? PK
      : false;
  readonly unique: New extends { unique: infer U }
    ? U
    : Existing extends { unique: infer U }
      ? U
      : false;
  readonly autoIncrement: New extends { autoIncrement: infer AI }
    ? AI
    : Existing extends { autoIncrement: infer AI }
      ? AI
      : false;
  readonly defaultValue: New extends { defaultValue: infer DV }
    ? DV
    : Existing extends { defaultValue: infer DV }
      ? DV
      : undefined;
}>;
```

**Merge Semantics**:
1. Check `New` first: If property exists, use that type
2. Fall back to `Existing`: If not in `New`, check `Existing`
3. Use default: If neither has the property, apply default literal

**Example Type Flow**:

```typescript
// Starting state
type DefaultField = ColumnDef<"uuid", true, false, false>;
type UserField = Partial<ColumnDef> & { type: "timestamp" };

// After MergeColumnDef<DefaultField, UserField>
type Merged = ColumnDef<"timestamp", true, false, false>;
//                       ^^^^^^^^^^^ user override preserved
//                                   ^^^^ default preserved
```

### Pattern 3: Tuple Wrapping to Prevent Distribution

TypeScript distributes conditional types over unions by default. Use tuple wrapping to prevent this:

```typescript
// Without tuple wrapping - distributes
type Bad<T> = T extends DSLField ? "field" : "not";
type Test1 = Bad<DSLField | Schema>;
// Distributes: "field" | "not"

// With tuple wrapping - checks entire union
type Good<T> = [T] extends [DSLField] ? "field" : "not";
type Test2 = Good<DSLField | Schema>;
// No distribution: "not" (because union doesn't extend DSLField)
```

**Usage in DSL**:

```typescript
export type ShouldIncludeField<V extends string, F> =
  [F] extends [DSLVariantField<infer Config, any>]  // Tuple wrapper
    ? V extends keyof Config
      ? true
      : false
    : [F] extends [VariantSchema.Field<infer Config>]  // Tuple wrapper
      ? V extends keyof Config
        ? true
        : false
      : true;
```

### Pattern 4: Type Parameter Capture Through Currying

Currying enables capturing type information at different stages:

```typescript
// Stage 1: Capture the schema type
export function Field<Schema extends S.Schema.All>(
  schema: Schema  // Schema type parameter captured here
): SchemaConfiguratorWithSchema<Schema>

// Stage 2: Capture the config literals
type SchemaConfiguratorWithSchema<Schema> = <const C extends Partial<ColumnDef> = {}>(
  config?: FieldConfig<C>  // Config literals captured here
) => DSLField</* uses both Schema and C */>;
```

**Why Currying Matters**:

TypeScript cannot apply `const` to the first parameter while also capturing its type for the second parameter's constraints in a single-function approach.

---

## Part 4: S.Class()() Pattern

### How It Works

The `S.Class<Self>()()` pattern is mandatory for recursive type inference:

```typescript
// Self generic enables recursive type inference
class User extends S.Class<User>("User")({
  id: S.String,
  name: S.String
}) {}
```

**Why Self is Required**:

The class definition needs to reference itself before it's fully defined. Without `Self`, TypeScript cannot infer the constructor return type correctly.

### The makeClass Internal

From Effect's Schema implementation, `makeClass` is the workhorse:

```typescript
const makeClass = <Fields extends Struct.Fields>({
  Base,
  annotations,
  fields,
  identifier,
  kind,
  schema
}: MakeClassParams): any => {
  // 1. Create unique class symbol for instanceof checks
  const classSymbol = Symbol.for(`effect/Schema/${kind}/${identifier}`)

  // 2. Extract annotation layers
  const [typeAnnotations, transformationAnnotations, encodedAnnotations] =
    getClassAnnotations(annotations)

  // 3. Create surrogate schemas for different sides of transformation
  const declarationSurrogate = typeSchema(schema).annotations({
    identifier,
    ...typeAnnotations
  })

  // 4. Create the actual class extending Base
  const klass = class extends Base {
    constructor(props = {}, options = false) {
      props = { ...props }
      props = lazilyMergeDefaults(fields, props)
      if (!getDisableValidationMakeOption(options)) {
        props = ParseResult.validateSync(constructorSchema)(props)
      }
      super(props, true)
    }

    static [TypeId] = variance
    static get ast(): AST.AST { /* Lazy AST creation */ }
    static make(...args) { return new this(...args) }
    static fields = { ...fields }
    static identifier = identifier
  }

  return klass
}
```

### Missing Self Generic Guard

Use conditional types to enforce `Self` generic parameter:

```typescript
type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends Class<Self>()${Params}({ ... })\``

export const Class = <Self = never>(identifier: string) =>
  <Fields extends Struct.Fields>(
    fields: Fields,
    annotations?: Annotations<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<"Class">  // Compile error with helpful message
    : ClassResult<Self, Fields>    // Actual return type
```

---

## Part 5: Factory Archetype Patterns

### Four Factory Archetypes

| Archetype | Exemplar | Stages | Defaults Mechanism | Use Case |
|-----------|----------|--------|-------------------|----------|
| **Curried Configuration** | Table.make, makeFields | 2-3 | Spread merge | Configuration with defaults |
| **Class-Based Encapsulation** | Data.TaggedClass, Schema.Class | 2 | No defaults | Data classes |
| **Service Registration** | Effect.Service | 2 | Dependency injection | Services |
| **Error Constructor** | Schema.TaggedError | 2 | Common field spreads | Errors |

### ModelBuilder Alignment

ModelBuilder most closely aligns with the **curried configuration** archetype:

1. **Two-to-three stage currying**: Outer function captures context (config/entityId), inner function accepts user input
2. **Spread-based merging**: `{ ...defaults, ...userInput }` achieves override semantics
3. **Type-level constraints**: `Omit<..., keyof DefaultColumns>` prevents shadowing
4. **Closure-captured defaults**: Inner function closes over computed defaults

### Extension Pattern (OrgTable.make)

Demonstrates how to **extend** defaults:

```typescript
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) => {
  // Extend DefaultColumns with organization-specific field
  const defaultColumns: OrgTableDefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    organizationId: pg.text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade", onUpdate: "cascade" }),
    ...globalColumns,
  };

  const maker = (defaultColumns: OrgTableDefaultColumns<TableName, Brand>) =>
    <TColumnsMap extends Omit<Record<string, pg.PgColumnBuilderBase>, keyof OrgTableDefaultColumns>>(
      columns: TColumnsMap,
      extraConfig?: ...
    ) => {
      const cols = { ...defaultColumns, ...columns };
      return pg.pgTable<TableName, TColumnsMap & OrgTableDefaultColumns>(...);
    };

  return maker(defaultColumns);
};
```

**Extension Insight**:
1. Define wider `OrgTableDefaultColumns` type that includes base defaults
2. Add additional default fields (`organizationId`)
3. Preserve same maker pattern signature
4. Type system automatically prevents conflicts via `Omit<..., keyof OrgTableDefaultColumns>`

---

## Part 6: Implementation Recommendations

### 1. Adopt Three-Stage Curried Pattern

```typescript
export const create =
  <const Config extends ModelBuilderConfig>(config: Config) =>
  <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${identifier}")`>
    : ModelClassWithVariants<Self, Config, Fields, ...> =>
{
  // Implementation with all three parameters via closure
}
```

**Rationale**:
- Proven pattern in Table.make, Model, Schema.Class
- Enables progressive type refinement (config -> identifier -> fields)
- Supports future extensibility (e.g., add fourth stage for relations)

### 2. Use Record.union for Right-Biased Merging

```typescript
import * as R from "effect/Record";

const defaultFields = deriveDefaultFields(identifier, config);
const mergedFields = R.union(defaultFields, fields, (_, right) => right) as DefaultFields & Fields;
```

**Rationale**:
- Effect-idiomatic (mandated by AGENTS.md)
- Explicit right-bias semantics
- Type-safe intersection types
- Battle-tested in beep-effect codebase

### 3. Use `const` Type Parameters for Literal Preservation

```typescript
<const Fields extends DSL.Fields>
<const Config extends BuilderConfig>
```

**Rationale**:
- Preserves literal string types for column types ("uuid", "timestamp")
- Maintains readonly property modifiers
- Enables narrow type inference for field records

### 4. Apply MergeColumnDef Pattern for Column Override

```typescript
type MergeFields<
  Defaults extends Record<string, DSLField<any, any, any, ColumnDef>>,
  UserFields extends Record<string, DSLField<any, any, any, ColumnDef>>
> = {
  readonly [K in keyof Defaults]:
    K extends keyof UserFields
      ? MergeField<Defaults[K], UserFields[K]>
      : Defaults[K];
} & {
  readonly [K in Exclude<keyof UserFields, keyof Defaults>]: UserFields[K];
};
```

### 5. Validate Upfront with Error Accumulation

```typescript
const errors: DSLValidationError[] = [];

// Collect all validation errors
if (identifierIsInvalid) errors.push(new EmptyModelIdentifierError({ ... }));
if (hasDuplicateFields) errors.push(new DuplicateFieldError({ ... }));
// ... more validations

// Throw aggregate if any failed
if (A.isNonEmptyArray(errors)) {
  throw new ModelValidationAggregateError({
    message: `ModelBuilder validation failed with ${A.length(errors)} error(s)`,
    modelName: identifier,
    errorCount: A.length(errors),
    errors,
  });
}
```

**Rationale**:
- Fail-fast is better than silent bugs
- Accumulated errors improve DX (see all issues at once)
- Schema.TaggedError integrates with Effect's error handling

### 6. Attach Static Metadata via Class Statics

```typescript
class BaseClass extends S.Class<Self>(identifier)(selectSchema.fields, annotations) {
  static readonly tableName = tableName;
  static readonly columns = columns;
  static readonly primaryKey = primaryKey;
  static override readonly identifier = identifier;
  static readonly _fields = fields;
  static readonly config = config;
}
```

**Rationale**:
- Enables introspection (codegen, migration tools)
- Matches Model pattern
- Type-safe access via `typeof ModelClass`

### 7. Use Lazy Getters for Variant Schemas

```typescript
const variantCache: Record<string, S.Schema.All> = {};

for (const variant of ModelVariant.Options) {
  Object.defineProperty(BaseClass, variant, {
    get: () => {
      if (variantCache[variant] === undefined) {
        variantCache[variant] = VS.extract(vsStruct, variant).annotations({
          identifier: `${identifier}.${variant}`,
          title: `${identifier}.${variant}`,
        });
      }
      return variantCache[variant];
    },
    enumerable: true,
    configurable: false,
  });
}
```

**Rationale**:
- Lazy computation (only extract variants when accessed)
- Cached for performance
- Matches Model's approach

### 8. Apply Self-Referential Generic Guard

```typescript
type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ModelBuilder.create<Self>()${Params}({ ... })\``;

// In return type:
[Self] extends [never]
  ? MissingSelfGeneric<`("${identifier}")`>
  : ModelClassWithVariants<Self, Config, Fields, ...>
```

**Rationale**:
- Enforces correct usage pattern
- Helpful compile error prevents runtime bugs
- Matches Model and Effect.Service patterns

---

## Part 7: Complete Implementation Blueprint

```typescript
// ModelBuilder.ts
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as A from "effect/Array";
import * as Struct from "effect/Struct";
import * as Str from "effect/String";
import type { DSL, ModelClassWithVariants, ColumnDef, BuilderConfig } from "./types";

type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ModelBuilder.create<Self>()${Params}({ ... })\``;

const deriveDefaultFields = (identifier: string) => ({
  id: Field.uuid().primaryKey(),
  createdAt: Field.createdAt(),
  updatedAt: Field.updatedAt(),
}) as const;

type DefaultFields = ReturnType<typeof deriveDefaultFields>;

export const create = <const Config extends BuilderConfig>(config: Config) =>
  <Self = never>(identifier: string) =>
    <const Fields extends DSL.Fields>(
      fields: Fields,
      annotations?: S.Annotations.Schema<Self>
    ): [Self] extends [never]
      ? MissingSelfGeneric<`("${typeof identifier}")`>
      : ModelClassWithVariants<Self, DefaultFields & Fields, ...> =>
{
  // 1. Compute defaults
  const defaultFields = deriveDefaultFields(identifier);

  // 2. Merge with right-bias (user fields override defaults)
  const mergedFields = R.union(defaultFields, fields, (_, right) => right) as DefaultFields & Fields;

  // 3. Extract column metadata
  const columns = F.pipe(
    mergedFields,
    Struct.entries,
    A.map(([key, field]) => [key, getColumnDef(field)] as const),
    R.fromEntries
  ) as ExtractColumnsType<DefaultFields & Fields>;

  // 4. Validate invariants
  validateModelInvariants(identifier, mergedFields, columns);

  // 5. Derive primary key and table name
  const primaryKey = derivePrimaryKey(columns);
  const tableName = config.tableNaming?.(identifier) ?? toSnakeCase(identifier);

  // 6. Create VariantSchema and convert fields
  const VS = createModelVariantSchema();
  const variantFields = toVariantFields(mergedFields, VS);
  const vsStruct = VS.Struct(variantFields);
  const selectSchema = VS.extract(vsStruct, "select");

  // 7. Create base class with Schema.Class
  class BaseClass extends S.Class<Self>(identifier)(selectSchema.fields, annotations) {
    static readonly tableName = tableName;
    static readonly columns = columns;
    static readonly primaryKey = primaryKey;
    static override readonly identifier = identifier;
    static readonly _fields = mergedFields;
    static readonly config = config;
  }

  // 8. Add lazy variant accessors
  const variantCache: Record<string, S.Schema.All> = {};
  for (const variant of ModelVariant.Options) {
    Object.defineProperty(BaseClass, variant, {
      get: () => {
        if (variantCache[variant] === undefined) {
          variantCache[variant] = VS.extract(vsStruct, variant).annotations({
            identifier: `${identifier}.${variant}`,
            title: `${identifier}.${variant}`,
          });
        }
        return variantCache[variant];
      },
      enumerable: true,
      configurable: false,
    });
  }

  return BaseClass as any;
};
```

### Usage Example

```typescript
// Define a standard config
const StandardModel = ModelBuilder.create({
  tableNaming: toSnakeCase,
  addTimestamps: true
});

// Define models using the builder
class User extends StandardModel<User>("User")({
  email: Field(S.String)({ column: { type: "string", unique: true } }),
  name: Field(S.String)({ column: { type: "string" } })
}) {}

// Access static metadata
User.tableName   // "user"
User.columns.id  // { type: "uuid", primaryKey: true }
User.columns.createdAt  // { type: "datetime", ... }

// Access variants
User.select      // Schema for SELECT queries
User.insert      // Schema for INSERT operations
User.json        // Schema for JSON output
```

---

## Summary of Key Patterns

| Pattern | Source | Purpose | Application |
|---------|--------|---------|-------------|
| `Record.union` with right-bias | record-struct.research.md | Immutable field merging with override semantics | Merge defaults with user fields |
| Three-stage curried factory | curried-factory.research.md | Progressive type refinement and closure capture | ModelBuilder.create(config)(identifier)(fields) |
| `const` type parameters | type-level-generics.research.md | Literal type preservation | `<const Fields extends DSL.Fields>` |
| `MergeColumnDef` conditional types | type-level-generics.research.md | Property-level type merging | Column metadata override |
| Tuple wrapping | type-level-generics.research.md | Prevent distributive conditional types | Field type checking |
| `S.Class<Self>()()` | schema-class.research.md | Class generation with recursive type inference | Base class construction |
| Lazy getters with caching | schema-class.research.md | On-demand variant computation | Variant schema accessors |
| Self-referential generic guard | factory-patterns.research.md | Enforce correct usage patterns | Helpful compile errors |
| Upfront validation with accumulation | factory-patterns.research.md | Fail-fast with comprehensive error reporting | Model invariant validation |

---

## References

### Research Documents
1. `record-struct.research.md` - Record.union and Struct patterns for field merging
2. `curried-factory.research.md` - Multi-stage curried factory patterns
3. `type-level-generics.research.md` - TypeScript type-level techniques
4. `schema-class.research.md` - Effect Schema Class patterns
5. `factory-patterns.research.md` - Factory archetype analysis

### Key Source Files
- `effect/src/Record.ts` - Record.union implementation
- `effect/src/Schema.ts` - S.Class and makeClass
- `@effect/experimental/src/VariantSchema.ts` - VariantSchema.Class
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Current DSL Model
- `packages/common/schema/src/integrations/sql/dsl/combinators.ts` - MergeColumnDef pattern
- `packages/shared/tables/src/Table/Table.ts` - Table.make factory pattern
