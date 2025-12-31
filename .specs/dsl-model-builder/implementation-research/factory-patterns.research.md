# Factory Patterns Research - Effect Ecosystem

## Executive Summary

This document analyzes proven factory patterns from the Effect ecosystem and beep-effect codebase to inform the implementation of `ModelBuilder.create()`. The research reveals four distinct factory pattern archetypes, each optimizing for different use cases: curried configuration (`Table.make`, `makeFields`), class-based encapsulation (`Data.TaggedClass`, `Schema.Class`), service registration (`Effect.Service`), and error constructors (`Schema.TaggedError`). The ModelBuilder pattern most closely aligns with the **curried configuration** archetype, emphasizing type safety with defaults through progressive refinement.

## Research Sources

- **Effect Core Modules**:
  - `/node_modules/effect/src/Data.ts` - TaggedClass, TaggedError patterns
  - `/node_modules/effect/src/Schema.ts` - Schema.Class factory pattern
  - `/node_modules/effect/src/Effect.ts` - Effect.Service factory pattern

- **beep-effect Codebase Patterns**:
  - `/packages/shared/tables/src/Table/Table.ts` - Table.make factory
  - `/packages/shared/tables/src/OrgTable/OrgTable.ts` - OrgTable.make extension
  - `/packages/shared/domain/src/common.ts` - makeFields factory
  - `/packages/common/schema/src/integrations/sql/dsl/Model.ts` - Model factory
  - `/packages/common/schema/src/integrations/sql/dsl/errors.ts` - Schema.TaggedError usage

## Factory Pattern Archetypes

### 1. Curried Configuration Pattern

**Exemplars**: `Table.make`, `OrgTable.make`, `makeFields`

#### Pattern Structure

```typescript
// Table.make - The canonical example
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) => {
  // Step 1: Compute default columns from entityId
  const defaultColumns: DefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    ...globalColumns,
  };

  // Step 2: Return inner function that merges user columns with defaults
  const maker =
    (defaultColumns: DefaultColumns<TableName, Brand>) =>
    <TColumnsMap extends Omit<Record<string, pg.PgColumnBuilderBase>, keyof DefaultColumns>>(
      columns: TColumnsMap,
      extraConfig?: (self: BuildExtraConfigColumns<TableName, TColumnsMap & DefaultColumns, "pg">) => PgTableExtraConfigValue[]
    ) => {
      const cols = {
        ...defaultColumns,  // Defaults first
        ...columns,         // User overrides second
      };
      return pg.pgTable<TableName, TColumnsMap & DefaultColumns>(
        entityId.tableName,
        cols,
        extraConfig
      );
    };

  return maker(defaultColumns);
};
```

#### Key Characteristics

1. **Two-stage currying**: Outer function captures configuration context (entityId), inner function accepts user input
2. **Spread-based merging**: `{ ...defaults, ...userInput }` achieves override semantics
3. **Type-level constraints**: `Omit<..., keyof DefaultColumns>` prevents users from accidentally shadowing defaults
4. **Closure-captured defaults**: Inner function closes over computed defaults for efficiency
5. **Progressive type refinement**: Each stage narrows types further (brand → columns → extraConfig)

#### Extension Pattern (OrgTable.make)

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
      .references(() => organization.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<SharedEntityIds.OrganizationId.Type>(),
    ...globalColumns,
  };

  // Same maker pattern as Table.make, but with extended defaults
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

**Extension Insight**: OrgTable demonstrates how to **extend** defaults by:
1. Defining a wider `OrgTableDefaultColumns` type that includes `DefaultColumns`
2. Adding additional default fields (`organizationId`)
3. Preserving the same maker pattern signature
4. Type system automatically prevents conflicts via `Omit<..., keyof OrgTableDefaultColumns>`

#### makeFields Pattern

```typescript
export const makeFields = <const TableName extends string, const Brand extends string, const A extends Fields>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>,
  a: A
) => {
  // Compute default fields (id, _rowId, audit columns)
  const idFields = {
    id: S.optionalWith(entityId, { default: () => entityId.create() }),
    _rowId: M.Generated(entityId.modelRowIdSchema),
  } as const;

  const defaultFields = {
    ...idFields,
    ...globalColumns(entityId),  // Spreads audit columns
  } as const;

  // Merge user fields with defaults
  return {
    ...defaultFields,
    ...a,  // User fields override defaults
  } as const;
};
```

**Insight**: Unlike Table.make, `makeFields` uses **single-stage** currying because:
- All configuration is available upfront (entityId + user fields)
- No need for progressive refinement
- Simpler mental model for Schema field definitions

**Trade-off**: Less flexibility (can't defer field definitions), but simpler API.

---

### 2. Class Factory Pattern

**Exemplars**: `Data.TaggedClass`, `Schema.Class`, `Model`

#### Data.TaggedClass Pattern

```typescript
export const TaggedClass = <Tag extends string>(
  tag: Tag
): new<A extends Record<string, any> = {}>(
  args: Types.Equals<A, {}> extends true ? void
    : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] }
) => Readonly<A> & { readonly _tag: Tag } => {
  class Base extends Class<any> {
    readonly _tag = tag
  }
  return Base as any
}
```

**Key Characteristics**:
1. **Tag injection**: `_tag` is automatically added to instances
2. **Args filtering**: Type system excludes `_tag` from constructor args (user can't override)
3. **Structural equality**: Inherits from `Data.Class`, which implements `Equal` interface
4. **Zero runtime overhead**: Tag assignment happens once in prototype

**Usage Example**:
```typescript
class Person extends Data.TaggedClass("Person")<{ readonly name: string }> {}

const mike1 = new Person({ name: "Mike" })
const mike2 = new Person({ name: "Mike" })

Equal.equals(mike1, mike2) // true
mike1._tag // "Person" (readonly)
```

#### Schema.Class Pattern

```typescript
export function make<A, I = A, R = never>(ast: AST.AST): SchemaClass<A, I, R> {
  return class SchemaClass {
    [TypeId] = variance
    static ast = ast
    static annotations(annotations: Annotations.GenericSchema<A>) {
      return make<A, I, R>(mergeSchemaAnnotations(this.ast, annotations))
    }
    static pipe() { return pipeArguments(this, arguments) }
    static toString() { return String(ast) }
    static Type: A
    static Encoded: I
    static Context: R
    static [TypeId] = variance
  }
}

// S.Class is shorthand for extending a schema-backed class
class User extends Schema.Class<User>("User")({
  name: S.String,
  age: S.Number
}) {}
```

**Key Characteristics**:
1. **Schema as structure**: Fields define both runtime behavior and type
2. **Static metadata**: `ast`, `annotations`, `pipe` are class statics
3. **Type-level branding**: `Type`, `Encoded`, `Context` are compile-time markers
4. **Annotation chaining**: `.annotations()` returns new class with merged metadata
5. **Self-referential generic**: `Schema.Class<User>` enables recursive type inference

**Trade-off**: Classes are heavier than plain factories (prototype chain, `new` keyword), but enable:
- Instanceof checks
- Method inheritance
- Better IDE autocomplete for instance methods

#### Model Pattern (DSL)

```typescript
export const Model =
  <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${typeof identifier}")`>
    : ModelClassWithVariants<Self, Fields, ...> => {

    const columns = extractColumns(fields);
    validateModelInvariants(identifier, fields, columns);
    const primaryKey = derivePrimaryKey(columns);
    const tableName = toSnakeCase(identifier);

    const VS = createModelVariantSchema();
    const variantFields = toVariantFields(fields, VS);
    const vsStruct = VS.Struct(variantFields);
    const selectSchema = VS.extract(vsStruct, "select");

    // Create base class with Schema.Class pattern
    class BaseClass extends S.Class<UnsafeAny>(identifier)(selectSchema.fields, annotations) {
      static readonly tableName = tableName;
      static readonly columns = columns;
      static readonly primaryKey = primaryKey;
      static override readonly identifier = identifier;
      static readonly _fields = fields;
    }

    // Add variant accessors (select, insert, update, json, etc.)
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

    return BaseClass;
  };
```

**Key Characteristics**:
1. **Three-stage factory**: `Model<Self>(identifier)(fields, annotations?)`
2. **Validation upfront**: `validateModelInvariants()` throws before class creation
3. **Lazy variant extraction**: Getters with internal cache for `select`, `insert`, etc.
4. **Static metadata**: `tableName`, `columns`, `primaryKey` attached as statics
5. **Schema.Class inheritance**: Delegates field handling to Effect's Schema system
6. **Missing generic guard**: `[Self] extends [never] ? MissingSelfGeneric : ...` enforces usage pattern

**Trade-off Analysis**:
- **Pro**: Rich static metadata (columns, primaryKey, variants)
- **Pro**: Validation happens at definition time (fail-fast)
- **Con**: Three-stage currying is complex (but TypeScript enforces correct usage)
- **Con**: Class-based approach requires `new` keyword for instances

---

### 3. Service Registration Pattern

**Exemplar**: `Effect.Service`

#### Effect.Service Pattern

```typescript
export const Service: <Self = never>() => [Self] extends [never] ? MissingSelfGeneric : {
  <
    const Key extends string,
    const Make extends
      | { readonly effect: Effect<...>, readonly dependencies?: ..., readonly accessors?: boolean }
      | { readonly scoped: Effect<...>, ... }
      | { readonly sync: LazyArg<...>, ... }
      | { readonly succeed: ..., ... }
  >(
    key: Key,
    make: Make
  ): Service.Class<Self, Key, Make>
}
```

**Key Characteristics**:
1. **Tag creation**: Automatically creates a `Context.Tag` for dependency injection
2. **Layer generation**: `.Default` and `.DefaultWithoutDependencies` layers auto-generated
3. **Dependency wiring**: `dependencies` array automatically composed via `Layer.provide`
4. **Accessor proxy**: `accessors: true` generates proxy for direct method access
5. **Four factory modes**: `effect`, `scoped`, `sync`, `succeed` determine lifecycle
6. **Type-safe context**: Return type encodes `R` (required context) from dependencies

**Usage Example**:
```typescript
class UserService extends Effect.Service<UserService>()("@beep/iam/UserService", {
  dependencies: [DatabaseLayer, LoggerLayer],
  accessors: true,
  effect: Effect.gen(function*() {
    const db = yield* Database
    const logger = yield* Logger
    return {
      findUser: (id: string) => Effect.gen(function*() {
        yield* logger.info(`Finding user ${id}`)
        return yield* db.query.users.findFirst({ where: eq(users.id, id) })
      })
    }
  })
}) {
  static readonly Live = UserService.Default.pipe(Layer.provide(userLayer));
}

// Usage
const program = Effect.gen(function*() {
  const { findUser } = yield* UserService  // Accessor proxy
  const user = yield* findUser("123")
  return user
})
```

**Pattern Insight**: Effect.Service is optimized for **service-oriented architecture**:
- Services are singletons (one instance per Layer scope)
- Dependencies are explicit and type-checked
- Layers compose via `Layer.provide` for testability
- Accessor mode eliminates boilerplate `yield* Service.pipe(S.andThen(s => s.method()))`

**Why Not for ModelBuilder**:
- Models are **data definitions**, not runtime services
- Models need static metadata (columns, primaryKey), not dependency injection
- Models are instantiated many times (every query result), not singletons
- Service pattern optimizes for **Effect execution**, Model pattern for **type generation**

---

### 4. Error Constructor Pattern

**Exemplar**: `Schema.TaggedError`

#### Schema.TaggedError Pattern

```typescript
// Effect implementation (simplified)
export const TaggedError = <Tag extends string>(tag: Tag): new<A extends Record<string, any> = {}>(
  args: Types.Equals<A, {}> extends true ? void
    : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] }
) => Cause.YieldableError & { readonly _tag: Tag } & Readonly<A> => {
  const O = {
    BaseEffectError: class extends Error<{}> {
      readonly _tag = tag
    }
  }
  ;(O.BaseEffectError.prototype as any).name = tag
  return O.BaseEffectError as any
}
```

**Usage in beep-effect**:
```typescript
// From packages/common/schema/src/integrations/sql/dsl/errors.ts
const commonErrorFields = {
  message: S.String,
  code: S.String,
  severity: ErrorSeverity,
  path: S.Array(S.String),
  expected: S.optional(S.String),
  received: S.optional(S.String),
  suggestion: S.optional(S.String),
} as const;

export class NullablePrimaryKeyError extends S.TaggedError<NullablePrimaryKeyError>()(
  "NullablePrimaryKeyError",
  {
    ...commonErrorFields,
    fieldName: S.String,
  }
) {}

export class ModelValidationAggregateError extends S.TaggedError<ModelValidationAggregateError>()(
  "ModelValidationAggregateError",
  {
    ...commonErrorFields,
    modelName: S.String,
    errorCount: S.Number,
    errors: S.Array(S.Unknown),
  }
) {}
```

**Key Characteristics**:
1. **YieldableError inheritance**: Errors are yieldable in Effect.gen (`yield* new MyError(...)`)
2. **Tag injection**: `_tag` discriminator for Match.exhaustive
3. **Schema fields**: Error data is validated via Effect Schema
4. **Common fields pattern**: Spread `commonErrorFields` for consistency
5. **Self-referential generic**: `TaggedError<NullablePrimaryKeyError>()` for type inference

**Pattern Insight**:
- **Spread pattern for common fields**: The `{ ...commonErrorFields, fieldName: S.String }` pattern is analogous to `{ ...defaultColumns, ...userColumns }` in Table.make
- **Two-stage invocation**: `TaggedError<Self>()(tag, fields)` mirrors `Model<Self>(identifier)(fields)`
- **Type-level exclusion**: `as P extends "_tag" ? never : P` prevents tag shadowing (like `Omit<..., keyof Defaults>`)

**Applicability to ModelBuilder**:
- The **spread pattern** for defaults is directly applicable
- The **two-stage generic pattern** (`Schema.TaggedError<Self>()(...)`) maps to `ModelBuilder<Self>()(config)`
- The **self-referential generic** technique ensures correct type inference

---

## Comparative Analysis

| Pattern | Stages | Defaults Mechanism | Type Safety | Use Case |
|---------|--------|-------------------|-------------|----------|
| **Table.make** | 2 (entityId → columns) | Spread merge `{ ...defaults, ...user }` | `Omit<..., keyof Defaults>` | Configuration with defaults |
| **makeFields** | 1 (all args) | Spread merge | Implicit (TS checks duplicates) | Simple merging |
| **Schema.Class** | 2 (identifier → fields) | No defaults (pure user input) | Schema validation | Data classes |
| **Model** | 2 (identifier → fields) | Computed from entityId, spread merge | Validation + Omit | Rich models |
| **Effect.Service** | 2 (key → maker) | Dependency injection | Layer types | Services |
| **Schema.TaggedError** | 2 (tag → fields) | Common field spreads | Schema + Tag exclusion | Errors |

### Key Insights for ModelBuilder

1. **Curried configuration is the dominant pattern** for factories with defaults:
   - Stage 1: Capture context (entityId, identifier)
   - Stage 2: Accept user input and merge with computed defaults

2. **Spread-based merging achieves override semantics**:
   - `{ ...defaults, ...userInput }` is idiomatic JavaScript
   - TypeScript's `Omit<UserInput, keyof Defaults>` prevents accidental shadowing
   - Compile-time safety without runtime overhead

3. **Validation timing varies by use case**:
   - Table.make: No validation (delegated to Drizzle)
   - Model: Upfront validation (`validateModelInvariants()`) for fail-fast
   - Schema.Class: Lazy validation (at Schema.decode time)

4. **Static metadata via class statics**:
   - Model attaches `tableName`, `columns`, `primaryKey` as static properties
   - Schema.Class attaches `ast`, `identifier`, `annotations`
   - This pattern enables both runtime introspection and type-level inference

5. **Self-referential generics enforce usage patterns**:
   - `Model<Self>(identifier)(fields)` requires `class MyModel extends Model<MyModel>()(...)`
   - `[Self] extends [never] ? MissingSelfGeneric : ...` provides helpful compile error
   - Prevents accidental misuse (e.g., `const m = Model("User")(...)` without generic)

---

## Recommended Approach for ModelBuilder.create()

Based on the analysis, **ModelBuilder should adopt the curried configuration pattern** from Table.make/OrgTable.make, with enhancements from Model's validation and static metadata:

### Pattern Structure

```typescript
export const create = <Self = never>(identifier: string) => {
  // Stage 1: Validate identifier, compute defaults
  validateIdentifier(identifier);
  const tableName = toSnakeCase(identifier);

  // Stage 2: Return factory that accepts user config
  return <const Config extends ModelConfig>(
    config: Config
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${identifier}")`>
    : ModelBuilderClass<Self, Config> => {

    // Merge user config with computed defaults
    const fields = {
      ...deriveDefaultFields(identifier),
      ...config.fields,
    };

    // Validate merged config
    validateModelInvariants(identifier, fields, config);

    // Create class with static metadata
    class BaseClass extends S.Class<Self>(identifier)(fields) {
      static readonly tableName = tableName;
      static readonly identifier = identifier;
      static readonly config = config;
      // ... other static metadata
    }

    return BaseClass;
  };
};
```

### Why This Pattern

1. **Proven in beep-effect**: Table.make, OrgTable.make, Model all use variants of this pattern
2. **Type-safe defaults**: `Omit<Config["fields"], keyof DefaultFields>` prevents shadowing
3. **Progressive refinement**: Identifier validated first, then fields, enabling better error messages
4. **Extensible**: Can add more stages (e.g., `create(id)(fields)(relations)`) without breaking changes
5. **Static metadata**: Class statics enable introspection (critical for codegen, migrations)

### Differences from Table.make

1. **Validation upfront**: ModelBuilder should validate immediately (like Model), not defer to ORM
2. **No inner `maker` closure**: Simpler single-return pattern since we don't need to defer computation
3. **Schema-backed fields**: Fields are `S.Schema.All` not Drizzle column builders
4. **Variant support**: Add lazy getters for `select`, `insert`, etc. (like Model)

### Differences from Model

1. **Simpler generic pattern**: ModelBuilder can use two-stage (`create<Self>(id)(config)`) instead of three
2. **No VariantSchema dependency**: ModelBuilder can directly use Schema.Class as base
3. **Explicit config object**: `config: { fields, relations?, indexes? }` is clearer than positional args

---

## Type Safety Mechanisms

### 1. Omit Pattern (Table.make)

```typescript
// User can't accidentally define 'id' or '_rowId' (compile error)
<TColumnsMap extends Omit<Record<string, pg.PgColumnBuilderBase>, keyof DefaultColumns>>(
  columns: TColumnsMap,
  ...
) => { ... }
```

**Insight**: TypeScript's `Omit` creates a compile error if user input overlaps with defaults.

**Limitation**: User *can* still override via object spread at runtime:
```typescript
const table = Table.make(entityId)({
  id: myCustomId,  // Compiles if TColumnsMap doesn't extend Omit properly
});
```

**Solution**: Combine with runtime assertion:
```typescript
const forbiddenKeys = Object.keys(defaultColumns);
const userKeys = Object.keys(columns);
const overlaps = userKeys.filter(k => forbiddenKeys.includes(k));
if (overlaps.length > 0) {
  throw new Error(`Cannot override default columns: ${overlaps.join(", ")}`);
}
```

**Trade-off**: Runtime check adds overhead. For ModelBuilder, **compile-time Omit is sufficient** since:
- Developers using the DSL are TypeScript users (runtime JS usage is unsupported)
- Schema validation at parse time will catch mismatches anyway

### 2. Tag Exclusion Pattern (Schema.TaggedError)

```typescript
args: Types.Equals<A, {}> extends true ? void
  : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] }
```

**Insight**: Mapped type with conditional filtering (`P extends "_tag" ? never : P`) excludes reserved keys from user input.

**Application to ModelBuilder**:
```typescript
// Prevent user from defining fields named 'tableName', 'identifier', etc.
type UserFields<F> = {
  readonly [K in keyof F as K extends "tableName" | "identifier" | "config" ? never : K]: F[K]
}
```

### 3. Self-Referential Generic Guard (Model, Effect.Service)

```typescript
[Self] extends [never]
  ? MissingSelfGeneric<`("${identifier}")`>
  : ModelClass<Self, ...>
```

**Insight**: Conditional type checks if generic was provided. If `Self` is inferred as `never`, it means user forgot to pass it.

**User Experience**:
```typescript
// ❌ Compile error: "Missing `Self` generic - use `class Self extends Model<Self>()({ ... })`"
const BadModel = Model("User")({ ... });

// ✅ Correct usage
class User extends Model<User>("User")({ ... }) {}
```

**Implementation**:
```typescript
type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ModelBuilder<Self>()${Params}({ ... })\``;
```

---

## Default Computation Strategies

### 1. Closure-Captured Defaults (Table.make)

```typescript
const make = (entityId) => {
  const defaultColumns = { id: entityId.publicId(), ... };  // Computed once

  const maker = (defaultColumns) => (columns) => {
    return { ...defaultColumns, ...columns };  // Reused across calls
  };

  return maker(defaultColumns);
};
```

**Pros**:
- Efficient: Defaults computed once, reused for all invocations
- Pure: No side effects, referentially transparent

**Cons**:
- Memory: Closure holds reference to `defaultColumns` for each entityId
- Complexity: Extra indirection via inner function

### 2. Inline Computation (makeFields)

```typescript
const makeFields = (entityId, a) => {
  const idFields = { id: S.optionalWith(entityId, ...), ... };  // Computed per call
  const defaultFields = { ...idFields, ...globalColumns(entityId) };
  return { ...defaultFields, ...a };
};
```

**Pros**:
- Simple: No closures, single function
- Flexible: Can compute defaults based on user input `a`

**Cons**:
- Redundant computation: Defaults recomputed on every call
- Not suitable if defaults are expensive to compute

### 3. Lazy Getters (Model variants)

```typescript
const variantCache: Record<string, S.Schema.All> = {};
for (const variant of ModelVariant.Options) {
  Object.defineProperty(BaseClass, variant, {
    get: () => {
      if (variantCache[variant] === undefined) {
        variantCache[variant] = VS.extract(vsStruct, variant).annotations({ ... });
      }
      return variantCache[variant];
    },
  });
}
```

**Pros**:
- Lazy: Variants only computed when accessed
- Cached: Subsequent accesses are O(1)

**Cons**:
- Non-enumerable by default (need `enumerable: true`)
- Harder to debug (getter stack traces)

**When to Use**:
- **Closure-captured**: Defaults are cheap to compute, invoked many times (Table.make)
- **Inline**: Single invocation or defaults depend on user input (makeFields)
- **Lazy getters**: Defaults are expensive, may not be accessed (Model variants)

**For ModelBuilder**: **Inline computation** is appropriate because:
- `create()` is invoked once per model definition (at module load time)
- Defaults are cheap to compute (identifier transformation, field generation)
- Simplicity trumps micro-optimization in definition-time code

---

## Integration with beep-effect Patterns

### EntityId Integration (Table.make, makeFields)

Both Table.make and makeFields accept an `EntityId.EntityId.SchemaInstance<TableName, Brand>` as the primary configuration:

```typescript
const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) => { ... }
```

**Insight**: EntityId encapsulates:
- `tableName`: Derived via snake_case transformation
- `publicId()`: Returns Drizzle column builder for public UUID
- `privateId()`: Returns Drizzle column builder for internal bigserial
- `create()`: Generates new branded IDs

**For ModelBuilder**: EntityId should be **derived from identifier** string:
```typescript
const create = <Self = never>(identifier: string) => {
  const entityId = EntityId.make(identifier);  // Derive from string
  const tableName = entityId.tableName;
  const defaultFields = {
    id: S.optionalWith(entityId, { default: () => entityId.create() }),
    _rowId: M.Generated(entityId.modelRowIdSchema),
  };
  // ...
};
```

**Trade-off**: If ModelBuilder requires EntityId parameter (`create(entityId)`), it gains:
- **Pro**: Access to all EntityId features (branded types, generators)
- **Con**: More verbose API (user must import and construct EntityId)

**Recommendation**: **Accept string identifier**, derive EntityId internally. Matches Model pattern.

### Global Columns Pattern (makeFields)

```typescript
export const globalColumns = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) =>
  ({
    ...userTrackingColumns(entityId),
    ...auditColumns(entityId),
    version: M.Generated(S.Int.pipe(S.greaterThanOrEqualTo(1))),
    source: BS.FieldOptionOmittable(S.String),
  }) as const;
```

**Insight**: `globalColumns` is a **factory function** that returns a const object of fields. The function accepts entityId to customize descriptions:
```typescript
createdAt: M.Generated(
  BS.DateTimeUtcFromAllAcceptable.annotations({
    description: `When the ${entityId.tableName} was created.`
  })
)
```

**For ModelBuilder**: Use the **same pattern** for default fields:
```typescript
const deriveDefaultFields = (identifier: string) => {
  const entityId = EntityId.make(identifier);
  return {
    id: S.optionalWith(entityId, {
      default: () => entityId.create(),
      description: `Public ID for ${identifier}`,
    }),
    _rowId: M.Generated(entityId.modelRowIdSchema.annotations({
      description: `Internal row ID for ${identifier}`,
    })),
    ...globalColumns(entityId),
  } as const;
};
```

### Validation Pattern (Model)

```typescript
const validateModelInvariants = (identifier, fields, columns): void => {
  const errors: DSLValidationError[] = [];

  // INV-MODEL-ID-001: Identifier not empty
  if (F.pipe(identifier, Str.isEmpty)) {
    errors.push(new EmptyModelIdentifierError({ ... }));
  }

  // INV-SQL-ID-001: Identifier length
  const identifierLength = F.pipe(identifier, Str.length);
  if (identifierLength > POSTGRES_MAX_IDENTIFIER_LENGTH) {
    errors.push(new IdentifierTooLongError({ ... }));
  }

  // ... more validations

  // Throw aggregated error if any failed
  if (A.isNonEmptyArray(errors)) {
    throw new ModelValidationAggregateError({ errors, ... });
  }
};
```

**Insight**: Model validates **before** class construction, using an **error accumulation** pattern:
1. Collect all errors in an array
2. Throw a single `ModelValidationAggregateError` with all errors attached
3. User gets comprehensive feedback in one compile cycle

**For ModelBuilder**: **Adopt the same pattern** because:
- Fail-fast is better than silent bugs
- Accumulated errors improve DX (see all issues at once)
- `Schema.TaggedError` integrates with Effect's error handling

**Enhancement**: Add Effect variant for validation:
```typescript
const validateModelInvariantsE = (identifier, fields, columns): Effect.Effect<void, DSLValidationError[]> => {
  const errors: DSLValidationError[] = [];
  // ... collect errors
  return A.isNonEmptyArray(errors)
    ? Effect.fail(errors)
    : Effect.void;
};
```

This enables:
- Effect-based workflows (testing, codegen) to handle errors functionally
- Synchronous usage via `Effect.runSync(validateModelInvariantsE(...))`

---

## Recommendations for ModelBuilder.create()

### 1. Adopt Curried Configuration Pattern

**Structure**:
```typescript
export const create =
  <Self = never>(identifier: string) =>
  <const Config extends ModelBuilderConfig>(
    config: Config
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${identifier}")`>
    : ModelBuilderClass<Self, Config> => {
    // Implementation
  };
```

**Rationale**:
- Proven pattern in Table.make, OrgTable.make, Model
- Enables progressive type refinement (identifier → config)
- Supports future extensibility (e.g., add third stage for relations)

### 2. Use Spread-Based Merging for Defaults

**Implementation**:
```typescript
const defaultFields = deriveDefaultFields(identifier);
const fields = {
  ...defaultFields,
  ...config.fields,  // User fields override defaults
} as const;
```

**Type Safety**:
```typescript
type UserFields<F> = Omit<F, keyof DefaultFields>;
```

**Rationale**:
- Idiomatic JavaScript pattern
- Compile-time safety via `Omit`
- Runtime safety via Schema validation (decode catches type mismatches)

### 3. Validate Upfront with Error Accumulation

**Implementation**:
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
- Matches Model's validation pattern
- Better DX (see all errors at once)
- Schema.TaggedError enables Effect integration

### 4. Attach Static Metadata via Class Statics

**Implementation**:
```typescript
class BaseClass extends S.Class<Self>(identifier)(fields, annotations) {
  static readonly tableName = toSnakeCase(identifier);
  static readonly identifier = identifier;
  static readonly config = config;
  static readonly columns = extractColumns(fields);
  static readonly primaryKey = derivePrimaryKey(columns);
}
```

**Rationale**:
- Enables introspection (codegen, migration tools)
- Matches Model pattern
- Type-safe access via `typeof ModelClass`

### 5. Use Lazy Getters for Variants (Optional)

**Implementation** (if ModelBuilder supports variants like Model):
```typescript
const variantCache: Record<string, S.Schema.All> = {};
for (const variant of ["select", "insert", "update"] as const) {
  Object.defineProperty(BaseClass, variant, {
    get: () => {
      if (variantCache[variant] === undefined) {
        variantCache[variant] = deriveVariant(fields, variant);
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

**Trade-off**: Only add if ModelBuilder **needs** variants. If it's purely for static analysis (not runtime query building), skip this complexity.

### 6. Self-Referential Generic Guard

**Implementation**:
```typescript
[Self] extends [never]
  ? MissingSelfGeneric<`("${identifier}")`>
  : ModelBuilderClass<Self, Config>
```

**Error Message**:
```typescript
type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ModelBuilder.create<Self>()${Params}({ ... })\``;
```

**Rationale**:
- Enforces correct usage pattern (`class User extends ModelBuilder.create<User>()(...)`)
- Helpful compile error prevents runtime bugs
- Matches Model and Effect.Service patterns

---

## Trade-offs and Considerations

### Curried vs. Single-Stage

**Curried (Recommended)**:
```typescript
ModelBuilder.create<User>("User")({ fields: { ... } })
```

**Single-Stage**:
```typescript
ModelBuilder.create<User>({ identifier: "User", fields: { ... } })
```

**Comparison**:
| Aspect | Curried | Single-Stage |
|--------|---------|--------------|
| **Type Refinement** | Progressive (identifier → config) | All-at-once |
| **Extensibility** | Easy to add stages | Requires config object changes |
| **DX** | Matches Table.make, Model | More concise |
| **Validation** | Can validate identifier first | Must validate all together |

**Recommendation**: **Curried** for consistency with existing patterns and extensibility.

### Validation Timing

**Upfront (Recommended)**:
- Throw during class construction
- Pro: Fail-fast, no invalid models exist
- Con: Can't defer validation to Effect runtime

**Lazy**:
- Validate when model is first used (e.g., `.select` accessor)
- Pro: Defers errors to Effect pipeline
- Con: Invalid models can exist temporarily

**Recommendation**: **Upfront** for definition-time errors (identifier, field conflicts). **Lazy** for runtime errors (database constraints).

### Defaults via Spread vs. Merge Function

**Spread (Recommended)**:
```typescript
const fields = { ...defaultFields, ...config.fields };
```

**Merge Function**:
```typescript
const fields = mergeFields(defaultFields, config.fields);
```

**Comparison**:
| Aspect | Spread | Merge Function |
|--------|--------|----------------|
| **Simplicity** | One-liner | Requires helper |
| **Override semantics** | Last-write-wins | Can customize (e.g., reject duplicates) |
| **Type safety** | Via `Omit` | Via function signature |
| **Performance** | Native JS | Function call overhead |

**Recommendation**: **Spread** for simplicity. Use `Omit` type constraint to prevent accidental overrides.

### Class-Based vs. Plain Object

**Class (Recommended)**:
```typescript
class User extends ModelBuilder.create<User>("User")({ ... }) {}
```

**Plain Object**:
```typescript
const User = ModelBuilder.create({ identifier: "User", fields: { ... } });
```

**Comparison**:
| Aspect | Class | Plain Object |
|--------|-------|--------------|
| **Static metadata** | Class statics (`User.tableName`) | Object properties (`User.tableName`) |
| **Instances** | `new User({ ... })` | N/A (schema only) |
| **Inheritance** | Can extend, override | No inheritance |
| **DX** | Better IDE autocomplete | Simpler |

**Recommendation**: **Class** because ModelBuilder needs:
- Static metadata (`tableName`, `columns`)
- Instances (query results decoded to model instances)
- Alignment with Model pattern

---

## Conclusion

The **curried configuration pattern** from Table.make/OrgTable.make, enhanced with **validation** (from Model) and **static metadata** (from Schema.Class), provides the optimal foundation for ModelBuilder.create():

1. **Two-stage currying**: `create<Self>(identifier)(config)` enables progressive type refinement
2. **Spread-based defaults**: `{ ...defaultFields, ...config.fields }` achieves override semantics
3. **Upfront validation**: Fail-fast with accumulated errors for better DX
4. **Static metadata**: Class statics for introspection and codegen
5. **Self-referential generic guard**: Enforce correct usage pattern via helpful compile errors

This approach balances **type safety** (Omit, validation), **developer experience** (error messages, autocomplete), and **architectural alignment** (matches Table.make, Model, Schema.Class patterns).

### Next Steps

1. **Prototype implementation**: Implement `ModelBuilder.create()` using the recommended pattern
2. **Test type inference**: Verify that TypeScript correctly infers field types, variants, and statics
3. **Validation refinement**: Add comprehensive invariant checks (identifier, fields, relations)
4. **Documentation**: Document usage patterns, migration path from Model to ModelBuilder
5. **Integration testing**: Ensure compatibility with existing DSL components (Field, relations, indexes)

---

## References

- Effect Source Code:
  - `/node_modules/effect/src/Data.ts` - TaggedClass, TaggedError
  - `/node_modules/effect/src/Schema.ts` - Schema.Class
  - `/node_modules/effect/src/Effect.ts` - Effect.Service

- beep-effect Codebase:
  - `/packages/shared/tables/src/Table/Table.ts` - Table.make
  - `/packages/shared/tables/src/OrgTable/OrgTable.ts` - OrgTable.make
  - `/packages/shared/domain/src/common.ts` - makeFields, globalColumns
  - `/packages/common/schema/src/integrations/sql/dsl/Model.ts` - Model factory
  - `/packages/common/schema/src/integrations/sql/dsl/errors.ts` - Schema.TaggedError usage

- Documentation:
  - `/documentation/patterns/effect-Schema.md` - Schema.Class usage
  - `/documentation/effect-atom/BASIC_USAGE.md` - Effect.Service examples
  - `/.claude/agents/effect-researcher.md` - Effect patterns guide
