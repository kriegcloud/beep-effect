# ModelFactory/ModelBuilder Implementation Specification

## Objective

Implement `ModelBuilder.create()` - a factory function that creates custom model builders with pre-applied default Fields in the DSL module. This enables defining organization-specific model conventions (audit timestamps, tenant columns, naming strategies) that are automatically applied to all models created with the builder.

## Target API

```typescript
// Stage 1: Create a builder with defaults
const makeModel = ModelBuilder.create({
  defaultFields: {
    id: Field(BS.EntityId)({ column: { type: "uuid", primaryKey: true } }),
    createdAt: Field(BS.DateTimeUtcFromAllAcceptable)({ column: { type: "timestamp", defaultFn: () => DateTime.unsafeNow() } }),
    updatedAt: Field(BS.DateTimeUtcFromAllAcceptable)({ column: { type: "timestamp", onUpdateFn: () => DateTime.unsafeNow() } }),
  },
  tableNameFn: (name) => `org__${name}` as const,
});

// Stage 2 & 3: Use the builder to define models
class Entity extends makeModel<Entity>("entity")({
  name: Field(S.String)({ column: { type: "string" } }),
  status: Field(S.String)({ column: { type: "string" } }),
}) {}

// Result: Entity has id, createdAt, updatedAt (from defaults) + name, status (user-defined)
Entity.tableName   // "org__entity"
Entity.columns.id  // { type: "uuid", primaryKey: true }
Entity.columns.createdAt  // { type: "timestamp", ... }
Entity.select      // Schema for SELECT queries
Entity.insert      // Schema for INSERT (excludes Generated fields)
Entity.json        // Schema for JSON output (excludes Sensitive fields)
```

## Implementation Location

- **Primary file**: `packages/common/schema/src/integrations/sql/dsl/ModelBuilder.ts`
- **Export from**: `packages/common/schema/src/integrations/sql/dsl/index.ts`
- **Re-export namespace**: Add to `DSL` namespace alongside existing exports

## Architecture: Three-Stage Curried Factory

The implementation must follow the three-stage curried factory pattern, consistent with existing patterns in `Table.make`, `Model`, and `S.Class`:

```
Stage 1: Configuration Capture
  ModelBuilder.create(config) =>

Stage 2: Identifier Capture (with Self generic)
  <Self = never>(identifier: string) =>

Stage 3: Fields Processing and Class Construction
  <const Fields extends DSL.Fields>(fields, annotations?) =>
    ModelClassWithVariants<Self, MergedFields>
```

### Stage 1: Configuration Capture

```typescript
export interface ModelBuilderConfig {
  readonly defaultFields: Record<string, DSLField<any, any, any, any> | DSLVariantField<any, any>>;
  readonly tableNameFn?: (identifier: string) => string;
}

export const create = <const Config extends ModelBuilderConfig>(config: Config) =>
```

**Responsibilities**:
- Accept builder configuration (default fields, table naming strategy)
- Validate configuration upfront (e.g., no duplicate field names with conflicting types)
- Capture `Config` type parameter with `const` modifier for literal preservation
- Return the identifier-accepting function

### Stage 2: Identifier Capture

```typescript
<Self = never>(identifier: string) =>
```

**Responsibilities**:
- Accept model identifier string
- Validate identifier (non-empty, length <= 63 chars, valid SQL identifier characters)
- Apply `tableNameFn` from config to derive `tableName`
- Return the fields-accepting function

### Stage 3: Fields Processing and Class Construction

```typescript
<const Fields extends DSL.Fields>(
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
): [Self] extends [never]
  ? MissingSelfGeneric<`("${typeof identifier}")`>
  : ModelClassWithVariants<Self, MergedFields>
```

**Responsibilities**:
- Merge `config.defaultFields` with user `fields` using `Record.union` with right-bias
- Extract column metadata from all merged fields
- Derive primary key(s) from columns
- Create VariantSchema structure for 6 variants
- Construct base class using `S.Class`
- Attach static properties (`tableName`, `columns`, `primaryKey`, `identifier`, `_fields`, `config`)
- Attach lazy variant accessors (`select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`)

## Field Merging Strategy

Use Effect's `Record.union` with right-bias semantics for field merging:

```typescript
import * as R from "effect/Record";

const mergeFields = <
  Defaults extends Record<string, DSLField<any, any, any, any>>,
  User extends Record<string, DSLField<any, any, any, any>>
>(
  defaults: Defaults,
  user: User
): Defaults & User => {
  return R.union(defaults, user, (_, right) => right) as Defaults & User;
};
```

**Merge Semantics**:
| Key Exists In | Result |
|--------------|--------|
| `defaults` only | Include `defaults[key]` |
| `user` only | Include `user[key]` |
| Both | Use `user[key]` (user overrides default) |

## Type-Level Requirements

### 1. Literal Type Preservation with `const`

```typescript
<const Config extends ModelBuilderConfig>
<const Fields extends DSL.Fields>
```

This ensures column types like `"uuid"`, `"timestamp"` are preserved as literals, not widened to `string`.

### 2. Self-Referential Generic Guard

```typescript
type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends ModelBuilder.create<Self>()${Params}({ ... })\``;

// In return type:
[Self] extends [never]
  ? MissingSelfGeneric<`("${identifier}")`>
  : ModelClassWithVariants<Self, ...>
```

### 3. Merged Fields Type

```typescript
type MergedFields<
  Config extends ModelBuilderConfig,
  Fields extends DSL.Fields
> = Config["defaultFields"] & Fields;
```

### 4. Static Properties Type

```typescript
interface ModelClassWithVariants<Self, Fields extends DSL.Fields, ...> {
  readonly tableName: string;
  readonly columns: ExtractColumnsType<Fields>;
  readonly primaryKey: readonly string[];
  readonly identifier: string;
  readonly _fields: Fields;

  // Variant accessors
  readonly select: S.Schema<Self, ...>;
  readonly insert: S.Schema<InsertType<Self>, ...>;
  readonly update: S.Schema<UpdateType<Self>, ...>;
  readonly json: S.Schema<JsonType<Self>, ...>;
  readonly jsonCreate: S.Schema<JsonCreateType<Self>, ...>;
  readonly jsonUpdate: S.Schema<JsonUpdateType<Self>, ...>;
}
```

## Lazy Variant Accessors

Variants must be lazily computed and cached:

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

## Validation Requirements

Validate model invariants with error accumulation:

```typescript
const errors: DSLValidationError[] = [];

// INV-MODEL-ID-001: Model identifier cannot be empty
if (Str.isEmpty(identifier)) {
  errors.push(new EmptyModelIdentifierError({ modelName: identifier }));
}

// INV-SQL-ID-001: Identifier length <= 63 characters
if (Str.length(identifier) > 63) {
  errors.push(new IdentifierTooLongError({ modelName: identifier, length: Str.length(identifier) }));
}

// INV-MODEL-AI-001: At most one autoIncrement field
const autoIncrementFields = F.pipe(
  columns,
  R.filter((col) => col.autoIncrement === true),
  Struct.keys
);
if (A.length(autoIncrementFields) > 1) {
  errors.push(new MultipleAutoIncrementError({ modelName: identifier, fields: autoIncrementFields }));
}

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

## Integration with Existing DSL

### Column Metadata Extraction

Use `getColumnDef()` from existing DSL:

```typescript
import { getColumnDef } from "./Field";

const columns = F.pipe(
  mergedFields,
  Struct.entries,
  A.map(([key, field]) => [key, getColumnDef(field)] as const),
  R.fromEntries
) as ExtractColumnsType<MergedFields>;
```

### Variant Schema Integration

Use existing `VariantSchema` from `@effect/experimental`:

```typescript
import * as VS from "@effect/experimental/VariantSchema";

const toVariantField = (field: DSLField | DSLVariantField, VS: typeof VariantSchema) => {
  if (isDSLVariantField(field)) {
    return field; // Already a variant field
  }
  return VS.Field(field.schema); // Wrap plain field
};
```

### Drizzle Adapter Compatibility

The resulting model must work with existing `toDrizzleTable()`:

```typescript
import { toDrizzleTable } from "./adapters/drizzle";

const MyModel = makeModel<MyModel>("MyModel")({ ... });
const myTable = toDrizzleTable(MyModel);
```

## Required Imports

```typescript
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as A from "effect/Array";
import * as Struct from "effect/Struct";
import * as Str from "effect/String";
import * as VS from "@effect/experimental/VariantSchema";

import { type DSLField, type DSLVariantField, getColumnDef, isDSLVariantField } from "./Field";
import { type ColumnDef, type ColumnType, ColumnMetaSymbol } from "./types";
import { ModelVariant } from "./Model";
```

## Test Cases

### Basic Usage

```typescript
describe("ModelBuilder.create", () => {
  const makeModel = ModelBuilder.create({
    defaultFields: {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      createdAt: Field(BS.DateTimeUtcFromAllAcceptable)({ column: { type: "timestamp" } }),
    },
  });

  class User extends makeModel<User>("User")({
    email: Field(S.String)({ column: { type: "string", unique: true } }),
  }) {}

  it("should merge default fields with user fields", () => {
    expect(User.columns.id).toEqual({ type: "uuid", primaryKey: true, ... });
    expect(User.columns.createdAt).toEqual({ type: "timestamp", ... });
    expect(User.columns.email).toEqual({ type: "string", unique: true, ... });
  });

  it("should apply tableNameFn", () => {
    const orgModel = ModelBuilder.create({
      defaultFields: {},
      tableNameFn: (name) => `org__${name}`,
    });
    class Org extends orgModel<Org>("Entity")({}) {}
    expect(Org.tableName).toBe("org__Entity");
  });
});
```

### Field Override

```typescript
it("should allow user fields to override defaults", () => {
  const makeModel = ModelBuilder.create({
    defaultFields: {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
    },
  });

  class Custom extends makeModel<Custom>("Custom")({
    // Override id with different type
    id: Field(S.Number)({ column: { type: "integer", primaryKey: true, autoIncrement: true } }),
  }) {}

  expect(Custom.columns.id.type).toBe("integer");
  expect(Custom.columns.id.autoIncrement).toBe(true);
});
```

### Variant Access

```typescript
it("should provide variant schemas", () => {
  class User extends makeModel<User>("User")({
    email: Field(S.String)({ column: { type: "string" } }),
  }) {}

  expect(User.select).toBeDefined();
  expect(User.insert).toBeDefined();
  expect(User.update).toBeDefined();
  expect(User.json).toBeDefined();
  expect(User.jsonCreate).toBeDefined();
  expect(User.jsonUpdate).toBeDefined();
});
```

### Validation Errors

```typescript
it("should throw on empty identifier", () => {
  const makeModel = ModelBuilder.create({ defaultFields: {} });
  expect(() => {
    class Bad extends makeModel<Bad>("")({}) {}
  }).toThrow(EmptyModelIdentifierError);
});

it("should throw on multiple autoIncrement fields", () => {
  const makeModel = ModelBuilder.create({
    defaultFields: {
      id: Field(S.Number)({ column: { type: "integer", autoIncrement: true } }),
    },
  });
  expect(() => {
    class Bad extends makeModel<Bad>("Bad")({
      otherId: Field(S.Number)({ column: { type: "integer", autoIncrement: true } }),
    }) {}
  }).toThrow(MultipleAutoIncrementError);
});
```

## References

### DSL Module Files
- `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Field factory
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Model factory
- `packages/common/schema/src/integrations/sql/dsl/types.ts` - Type definitions
- `packages/common/schema/src/integrations/sql/dsl/combinators.ts` - DSL combinators

### Related Patterns
- `packages/shared/tables/src/Table/Table.ts` - Table.make factory pattern
- `packages/shared/tables/src/Table/OrgTable.ts` - OrgTable.make extension pattern
- `effect/src/Schema.ts` - S.Class implementation

### Research Documents
- `.specs/dsl-model-builder/current-module-state-report.md` - DSL module architecture
- `.specs/dsl-model-builder/implementation-research-report.md` - Implementation patterns
