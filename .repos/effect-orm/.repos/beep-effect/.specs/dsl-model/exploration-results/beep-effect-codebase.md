# Beep-Effect Codebase Exploration Report: DSL & Schema Alignment Patterns

---

## Alignment Notes (Design Specification Review)

**Reference**: `.specs/dsl-model/dsl-model.original.md`

### How This Research Aligns with DSL.Model Goals

This document provides essential context about **existing codebase patterns** that DSL.Model must integrate with. Key alignment points:

1. **VariantSchema.Class** - DSL.Model extends this (Section 1.1) to inherit 6-variant support
2. **EntityId static properties** - Pattern for exposing `.tableName`, `.create()` etc. (Section 3.1)
3. **Field combinators** - `M.Generated`, `M.Sensitive` patterns from `@effect/sql/Model` (Section 1.2)
4. **Table factories** - `Table.make(entityId)` pattern (Section 4.1) - DSL.toDrizzle() will output compatible tables

### Patterns to ADOPT from Existing Codebase

| Pattern | Location | DSL.Model Application |
|---------|----------|----------------------|
| `M.Class<Self>(identifier)(fields)` | Model.ts | DSL.Model uses same curried factory pattern |
| 6 variants (select/insert/update/json/jsonCreate/jsonUpdate) | VariantSchema.ts | DSL.Model inherits all 6 variants |
| `makeFields()` helper | common.ts | Can wrap DSL.Field for audit columns |
| EntityId branding | entity-id.ts | DSL.Field works with branded EntityId schemas |
| `modelKit(Model)` | model-kit.ts | Can be used with DSL.Model instances |

### Patterns to IGNORE / Not Relevant

| Pattern | Why Not Relevant |
|---------|-----------------|
| Manual better-auth field declarations (Section 5.1) | **REPLACED** by `DSL.toBetterAuth(Model)` adapter |
| Separate Table definitions from Models (Section 4.1) | **REPLACED** by `DSL.toDrizzle(Model)` adapter |
| Manual drizzleColumn specifications | DSL.Model infers columns from generic `ColumnDef` |

### Corrections Needed in This Document

1. **Section 5.1** describes manual better-auth field declarations as the current state. DSL.Model's `toBetterAuth()` adapter will **eliminate this duplication**.

2. **Section 9.1** ("Model -> Table Alignment Gap") correctly identifies the problem. DSL.Model solves this with **generic static properties** that adapters transform to driver-specific outputs.

3. **Section 3.1** (Entity ID Schema) is **exemplary** - DSL.Model follows the same pattern for static property exposure.

### Outdated Assumptions (from Earlier Exploration)

- ~~DSL needs parser/validator to convert DSL -> types~~ → DSL.Field returns **annotated Effect Schemas**, no parsing needed
- ~~Codegen pipeline (DSL -> Model.Class)~~ → DSL.Model **IS** a Model.Class, no codegen
- ~~Driver-specific column metadata in DSL~~ → DSL uses **generic ColumnDef**, adapters handle drivers

### Key Integration Points

DSL.Model will:
1. **Extend** `VariantSchema.Class` (already in codebase)
2. **Use** EntityId schemas from `SharedEntityIds.*`
3. **Replace** manual Table.make() calls with `DSL.toDrizzle(Model)`
4. **Replace** manual better-auth additionalFields with `DSL.toBetterAuth(Model)`
5. **Preserve** existing `modelKit()` utility compatibility

---

## Overview

The beep-effect codebase implements a sophisticated, variant-aware schema system that bridges Effect Schema's validation layer with SQL database operations and API transformations. The system uses a multi-variant approach enabling single schema definitions to generate different views for database selects, inserts, updates, and JSON APIs.

---

## 1. Core Components

### 1.1 VariantSchema.ts

**Location**: `/packages/common/schema/src/core/VariantSchema.ts`

**Purpose**: Foundation for multi-variant schema definitions (copied from `@effect/experimental`)

**Key Types & Patterns**:

- **`Struct<Fields>`**: Container for variant-aware field definitions
  - Stores field configurations indexed by variant names
  - Caches extracted schemas for performance
  - Symbol-based TypeId tracking

- **`Field<Config>`**: Variant-specific field configurations
  - Stores schemas keyed by variant (e.g., `{ select: S.String, insert: S.String }`)
  - Allows field-level control over which variants expose which schemas

- **`Class<Self, Fields, SchemaFields, A, I, R, C>`**: Schema class factory
  - Extends `S.Schema` with variant extraction capabilities
  - Generates variant-specific schemas as static properties (`.select`, `.insert`, `.update`)
  - Supports constructor validation

**Variant System**:
```typescript
const { Class, Field, extract, fieldEvolve, fieldFromKey } = make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
});
```

**Key Operations**:
- `extract(struct, variant)`: Extract schema for specific variant
- `fieldEvolve(f)`: Transform field configurations across variants
- `fieldFromKey(mapping)`: Rename keys in variant schemas
- `Field()`: Create variant-aware fields
- `Class(identifier)`: Create schema classes

---

### 1.2 Model.ts

**Location**: `/packages/common/schema/src/integrations/sql/Model.ts`

**Purpose**: SQL-specific schema extensions for database models (copied from `@effect/sql`)

**Variants Defined**:
```typescript
["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"]
// Default: "select"
```

**Pre-built Field Combinators**:

1. **`Generated<S>`**: Database-generated fields
   - Available: `select`, `update`, `json`
   - Omitted: `insert`
   - Use case: IDs, auto-increment fields

2. **`GeneratedByApp<S>`**: Application-generated fields
   - Available: `select`, `insert`, `update`, `json`
   - Useful for server-side computations

3. **`Sensitive<S>`**: Security-sensitive fields
   - Available: `select`, `insert`, `update`
   - Omitted: `json` (never exposed to API)
   - Use case: Passwords, secrets

4. **`FieldOption<S>`**: Optional nullable fields
   - Database variants: `OptionFromNullOr<S>`
   - JSON variants: `optionalWith<S, { as: "Option" }>`
   - Handles null encoding/decoding

5. **Date/Time Fields**:
   - `DateTimeInsert`: Current timestamp on insert
   - `DateTimeUpdate`: Current timestamp on insert/update
   - `DateWithNow`: Date-only with auto-generation
   - Support for `Date`, `String`, and `number` serialization

6. **UUID Fields**:
   - `UuidV4Insert<Brand>`: Auto-generated UUID with branding
   - Uses `Overrideable` pattern for effects-based generation

7. **Utility Fields**:
   - `JsonFromString<S>`: JSON stored as text in database
   - `BooleanFromNumber`: 0/1 encoding for databases

**Transformation Pattern** (`Overrideable`):
```typescript
Overrideable(
  from: Schema<From>,
  to: Schema<To>,
  {
    generate: (option: Option<To>) => Effect<From>,
    decode?: Schema<To, From>,
    constructorDefault?: () => To
  }
)
```

---

### 1.3 DSL Type Definitions

**Location**: `/packages/common/schema/src/integrations/sql/dsl/dsl.ts`

**Purpose**: Type system for DSL specifications

**Key Schema Classes**:

1. **`DBFieldType`**: Field type literals
   - Primitives: `"string"`, `"number"`, `"boolean"`, `"date"`, `"json"`
   - Arrays: `"string[]"`, `"number[]"`
   - Complex: `S.Array(LiteralString)` for custom types

2. **`DBPrimitive`**: Runtime values
   - `string`, `number`, `boolean`, `Date`, `null`, `undefined`
   - `string[]`, `number[]`
   - Objects/Records, Unknowns

3. **`OnDeleteCascadeOption`**: Referential integrity
   - `"no action"`, `"restrict"`, `"cascade"`, `"set null"`, `"set default"`

4. **`DBFieldAttributeConfig`**: Field configuration
   ```typescript
   {
     required: boolean;           // default: true
     returned: boolean;           // default: true
     input: boolean;              // default: true
     defaultValue?: DBPrimitive | DBPrimitiveThunk;
     onUpdate?: DBPrimitiveThunk;
     transform?: DBFieldAttributeConfigTransform;
     references?: DBFieldAttributeConfigReference;
     unique: boolean;             // default: false
     bigint: boolean;             // default: false
     validator?: StandardSchemaValidator;
     fieldName?: string;
     sortable: boolean;           // default: false
     index: boolean;              // default: false
   }
   ```

5. **`DBFieldAttributeConfigReference`**: Foreign key definition
   ```typescript
   {
     model: string;
     field: string;
     onDelete?: OnDeleteCascadeOption; // default: "cascade"
   }
   ```

6. **`StandardSchemaValidator`**: Custom validation
   - Input/output standard schema validators

---

## 2. Domain Entity Models

### 2.1 User Entity Example

**Location**: `/packages/shared/domain/src/entities/User/User.model.ts`

**Pattern**:
```typescript
export class Model extends M.Class<Model>($I`UserModel`)(
  makeFields(SharedEntityIds.UserId, {
    name: S.NonEmptyString,
    email: BS.Email,
    emailVerified: BS.BoolWithDefault(false),
    image: BS.FieldOptionOmittable(S.String),
    // ... more fields
  })
) {
  static readonly utils = modelKit(Model);
}
```

**Key Characteristics**:
- Extends `M.Class<Model>` with self-reference
- Uses `makeFields()` helper to inject standard columns
- Fields use `BS` (Beep Schema) combinators for variant-aware definitions
- Generates 6 variant schemas automatically:
  - `Model` (default: select)
  - `Model.select`
  - `Model.insert`
  - `Model.update`
  - `Model.json`
  - `Model.jsonCreate`
  - `Model.jsonUpdate`

**Field Types Used**:
- `BS.Email`: Email with validation
- `BS.BoolWithDefault(false)`: Boolean with default
- `BS.FieldOptionOmittable(S.String)`: Optional field
- `BS.DateTimeUtcFromAllAcceptable`: Flexible DateTime input
- `BS.Phone`: Phone number validation
- `BS.Json`: Flexible JSON storage

---

### 2.2 Organization Entity Example

**Location**: `/packages/shared/domain/src/entities/Organization/Organization.model.ts`

**Pattern**:
```typescript
export class Model extends M.Class<Model>($I`OrganizationModel`)(
  makeFields(SharedEntityIds.OrganizationId, {
    name: S.NonEmptyString,
    slug: Slug.pipe(S.pattern(...), S.minLength(2), S.maxLength(50)),
    logo: BS.FieldOptionOmittable(Url),
    metadata: BS.FieldOptionOmittable(S.String),
    type: BS.toOptionalWithDefault(OrganizationType)(OrganizationTypeEnum.individual),
    ownerUserId: SharedEntityIds.UserId,
    isPersonal: BS.BoolFalse,
    maxMembers: BS.FieldOptionOmittable(S.NonNegativeInt),
    features: BS.FieldOptionOmittable(BS.Json),
    settings: BS.FieldOptionOmittable(BS.Json),
    subscriptionTier: BS.toOptionalWithDefault(SubscriptionTier)(SubscriptionTier.Enum.free),
    subscriptionStatus: BS.toOptionalWithDefault(SubscriptionStatus)(SubscriptionStatus.Enum.active),
  })
) {
  static readonly utils = modelKit(Model);
}
```

**Key Patterns**:
- Enum field handling with defaults
- JSON metadata fields
- Foreign key references (ownerUserId)
- Subscription state management

---

### 2.3 Common Helper Functions

**Location**: `/packages/shared/domain/src/common.ts`

**`makeFields()` Helper**:
Injects standard columns into domain models:
```typescript
{
  id: optionalWith(entityId, { default: () => entityId.create() }),
  _rowId: M.Generated(entityId.modelRowIdSchema),
  ...globalColumns(entityId),
  ...customFields
}
```

**`globalColumns()` Helper**:
Provides audit/tracking infrastructure:
```typescript
{
  createdAt: M.Generated(DateTimeUtcFromAllAcceptable),
  updatedAt: M.Generated(DateTimeUtcFromAllAcceptable),
  deletedAt: FieldOptionOmittable(DateTimeUtcFromAllAcceptable),
  createdBy: FieldOmittableWithDefault(NullOr(String))(() => "app"),
  updatedBy: FieldOmittableWithDefault(NullOr(String))(() => "app"),
  deletedBy: FieldOptionOmittable(String),
  version: M.Generated(Int.pipe(greaterThanOrEqualTo(1))),
  source: FieldOptionOmittable(String),
}
```

**`auditColumns()`**: Timestamps + soft delete
**`userTrackingColumns()`**: Created/updated/deleted by tracking

---

## 3. Entity ID System

### 3.1 Entity ID Schema

**Location**: `/packages/common/schema/src/identity/entity-id/entity-id.ts`

**Schema Structure**:
```typescript
export interface SchemaInstance<TableName, Brand>
  extends S.AnnotableClass<SchemaInstance<TableName, Brand>, Type<TableName>> {
  readonly create: () => Type<TableName>;           // Generate new ID
  readonly tableName: SnakeTag.Literal<TableName>; // Lowercase snake_case
  readonly brand: Brand;
  readonly is: (u: unknown) => u is Type<TableName>;
  readonly publicId: () => PublicId<TableName>;    // Drizzle column
  readonly privateId: () => PrivateId<Brand>;      // Drizzle column
  readonly privateSchema: S.brand<S.refine<number>, Brand>;
  readonly modelIdSchema: S.optionalWith<DataTypeSchema<TableName>, {...}>;
  readonly modelRowIdSchema: S.brand<S.refine<number>, Brand>;
  readonly make: (input: string) => Type<TableName>;
  readonly makePrivateId: (input: number) => Branded<number, Brand>;
}
```

**Type Format**:
```
${tableName}__${uuid}
// Example: "user__550e8400-e29b-41d4-a716-446655440000"
```

---

### 3.2 Entity ID Factories

**Location**: `/packages/shared/domain/src/entity-ids/`

**Pattern** (Shared entities):
```typescript
export const UserId = EntityId.make({
  tableName: "user",
  brand: "UserId"
});

export const OrganizationId = EntityId.make({
  tableName: "organization",
  brand: "OrganizationId"
});
```

**Usage in Models**:
```typescript
makeFields(SharedEntityIds.UserId, { ... })
```

---

## 4. Table Construction Patterns

### 4.1 Table Factory

**Location**: `/packages/shared/tables/src/Table/Table.ts`

**Pattern**:
```typescript
export const make = <TableName extends string, Brand extends string>(
  entityId: EntityId.SchemaInstance<TableName, Brand>
) => {
  return <TColumnsMap extends ...>(
    columns: TColumnsMap,
    extraConfig?: (self: BuildExtraConfigColumns<...>) => PgTableExtraConfigValue[]
  ) => {
    return pg.pgTable(
      entityId.tableName,
      { ...defaultColumns, ...columns },
      extraConfig
    );
  };
};
```

**Default Columns Injected**:
- `id`: Public UUID column with default
- `_rowId`: Private serial primary key
- Audit columns (createdAt, updatedAt, deletedAt, version, source)
- User tracking (createdBy, updatedBy, deletedBy)

**Example Usage** (User table):
```typescript
export const user = Table.make(SharedEntityIds.UserId)(
  {
    name: pg.text("name").notNull(),
    email: pg.text("email").notNull().unique(),
    emailVerified: pg.boolean("email_verified").default(false).notNull(),
    // ... more fields
  },
  (t) => [
    pg.index("user_email_idx").on(t.email),
    // ... more indexes
  ]
);
```

### 4.2 Organization-Aware Table Factory

**Location**: `/packages/shared/tables/src/OrgTable/OrgTable.ts`

**Pattern**:
```typescript
export const make = <TableName extends string, Brand extends string>(
  entityId: EntityId.SchemaInstance<TableName, Brand>
) => {
  const defaultColumns: OrgTableDefaultColumns<...> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    organizationId: pg.text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    ...globalColumns,
  };
  // ... returns configured table
};
```

**Key Differences**:
- Injects `organizationId` foreign key
- Enforces cascading deletes
- Multi-tenant data isolation

---

## 5. Better-Auth Integration

### 5.1 BetterAuth Options Configuration

**Location**: `/packages/iam/server/src/adapters/better-auth/Options.ts`

**Pattern**:
- Integrates Drizzle adapter with existing schema
- Maps Model variants to auth field definitions
- Manually declares additional fields not in schema

**Field Mapping Strategy**:
```typescript
const additionalFieldsCommon = {
  _rowId: { type: "number", required: false },
  deletedAt: { type: "date", required: false },
  updatedAt: { type: "date", required: false },
  createdAt: { type: "date", required: false },
  createdBy: { type: "string", required: false },
  updatedBy: { type: "string", required: false },
  deletedBy: { type: "string", required: false },
  version: { type: "number", required: false },
  source: { type: "string", required: false },
};

// In user configuration:
user: {
  additionalFields: {
    uploadLimit: { type: "number", required: false },
    stripeCustomerId: { type: "string", required: false },
    lastLoginMethod: { type: "string", required: false },
    role: { type: "string", required: false },
    isAnonymous: { type: "boolean", required: false },
    twoFactorEnabled: { type: "boolean", required: false },
    phoneNumberVerified: { type: "boolean", required: false },
    banned: { type: "boolean", required: false },
    banExpires: { type: "date", required: false },
    ...additionalFieldsCommon,
  },
}
```

**Issues Identified**:
- Manual field declarations duplicate schema information
- No bidirectional synchronization with Model variant schemas
- Risk of divergence between schema and auth config

---

## 6. Transformation & Alignment Patterns

### 6.1 Common Schema Helpers

**Location**: `/packages/common/schema/src/integrations/sql/common.ts`

**Variant-Aware Field Helpers**:
```typescript
// Using VariantSchema Field
const { Field } = make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});

// Example: DateTimeFromDate wrapper
export const DateTimeFromDate = (annotations?: Annotations) => {
  return M.DateTimeFromDate.annotations(...);
};

// Nullable variant handling
export const DateTimeAllEncoded = S.Union(
  S.DateFromString,
  S.DateFromSelf,
  S.Date,
  // ... more encodings
);

// Optional field variants
export const FieldOptionOmittable = (schema: S.Schema.All) =>
  Field({
    select: S.OptionFromNullOr(schema),
    insert: S.OptionFromNullOr(schema),
    update: S.OptionFromNullOr(schema),
    json: S.optionalWith(schema, { as: "Option" }),
    jsonCreate: S.optionalWith(schema, { as: "Option", nullable: true }),
    jsonUpdate: S.optionalWith(schema, { as: "Option", nullable: true }),
  });
```

### 6.2 Model Construction Kit

**Location**: `/packages/shared/domain/src/factories/model-kit.ts`

**Pattern**:
```typescript
export const modelKit = <const Model extends M.Any>(model: Model) => ({
  keys: ModelUtils.modelFieldKeys(model),
  keyEnum: { /* key enum object */ },
  keySchema: S.Literal(...keys),
  KeyType: keySchema.Type,
});
```

**Usage**:
```typescript
export class Model extends M.Class<Model>(...) { ... }
{
  static readonly utils = modelKit(Model);
}
```

**Benefits**:
- Extracts field metadata from runtime model
- Generates type-safe key enums
- Supports introspection

---

## 7. Existing DSL Specification (Incomplete)

### 7.1 What Exists

The DSL type definitions form the skeleton:
- **`DBFieldType`**: Describes field types
- **`DBPrimitive`**: Runtime values
- **`DBFieldAttributeConfig`**: Field configuration
- **`DBFieldAttributeConfigReference`**: Foreign key specs

### 7.2 What's Missing

**Parser/Validator**: No mechanism to:
- Parse DSL into validated config objects
- Generate Model classes from DSL specs
- Validate referential integrity

**Transformer**: No mechanism to:
- Convert DSL → Model.Class definitions
- Generate Table factories from Model schemas
- Sync with better-auth field declarations

**Codegen**: No mechanism to:
- Generate model files from DSL
- Generate migration SQL
- Generate API contracts

---

## 8. Key Architectural Decisions

### 8.1 Variant-Aware Schemas

**Pattern**: Single model definition generates 6 variant schemas automatically
```typescript
Model              // Resolves to Model.select
Model.select       // Database SELECT schema
Model.insert       // Database INSERT schema
Model.update       // Database UPDATE schema
Model.json         // JSON API response
Model.jsonCreate   // JSON create request
Model.jsonUpdate   // JSON update request
```

**Benefits**:
- Type safety across all data flows
- Single source of truth
- Automatic variant extraction

**Gaps**:
- Better-auth config manually redeclares fields
- No automatic sync mechanism
- DSL doesn't express variant constraints

### 8.2 Entity ID Branding

**Pattern**: Compile-time type safety with template literals
```typescript
type UserId = `user__${string}-${string}-${string}-${string}-${string}`;
// Runtime: "user__550e8400-e29b-41d4-a716-446655440000"
```

**Benefits**:
- Prevents ID misuse at compile time
- Self-documenting format
- Table name embedded in type

### 8.3 Factory-Based Table Construction

**Pattern**: Compose tables with dependency injection
```typescript
Table.make(SharedEntityIds.UserId)({
  // Custom columns
  name: pg.text("name"),
  // ...
});
```

**Benefits**:
- Default columns injected automatically
- Type safety with Entity ID schema
- Extensible through inheritance

---

## 9. Alignment Gaps & DSL Opportunities

### 9.1 Model → Table Alignment Gap

**Current State**:
- Models define schemas
- Tables manually specify Drizzle columns
- No verification they match

**DSL Opportunity**:
Express field-level table metadata:
```typescript
type DBField = {
  type: DBFieldType;
  config: DBFieldAttributeConfig;
  variants: VariantMapping;
  drizzleColumn: () => PgColumn;
};
```

### 9.2 Model → Better-Auth Alignment Gap

**Current State**:
- Models define 6 variant schemas
- Better-auth gets manual field declarations
- No sync when model changes

**DSL Opportunity**:
Auto-generate better-auth field declarations from Model:
```typescript
export const userAdditionalFields = generateBetterAuthFields(User.Model, {
  select: ["uploadLimit", "role", "stripeCustomerId"],
  insert: ["uploadLimit"],
  update: ["uploadLimit", "stripeCustomerId"],
});
```

### 9.3 Missing Variant Constraints

**Current State**:
- Variants are free-form schemas
- No enforcement of constraints
- Field availability implicit

**DSL Opportunity**:
Declare variant requirements:
```typescript
type VariantConstraints = {
  select: { required: string[] };
  insert: { required: string[], omitted: string[] };
  update: { required?: string[], omitted: string[] };
};
```

---

## 10. File Location Summary

| File | Purpose |
|------|---------|
| `/packages/common/schema/src/core/VariantSchema.ts` | Multi-variant schema foundation |
| `/packages/common/schema/src/integrations/sql/Model.ts` | SQL-specific field combinators |
| `/packages/common/schema/src/integrations/sql/dsl/dsl.ts` | DSL type specifications |
| `/packages/common/schema/src/integrations/sql/common.ts` | Common SQL helpers |
| `/packages/common/schema/src/identity/entity-id/entity-id.ts` | Entity ID schema system |
| `/packages/shared/domain/src/common.ts` | Model field helpers (audit, tracking) |
| `/packages/shared/domain/src/entities/**/*.model.ts` | Domain entity definitions |
| `/packages/shared/domain/src/entity-ids/` | Entity ID factories |
| `/packages/shared/tables/src/Table/Table.ts` | Standard table factory |
| `/packages/shared/tables/src/OrgTable/OrgTable.ts` | Organization-aware table factory |
| `/packages/shared/domain/src/factories/model-kit.ts` | Model introspection kit |
| `/packages/iam/server/src/adapters/better-auth/Options.ts` | Better-auth configuration |

---

## Conclusion

The beep-effect codebase implements a mature, variant-aware schema system with clear patterns for:

1. **Multi-variant schemas** (select/insert/update/json variants)
2. **Entity ID branding** (compile-time type safety)
3. **Factory-based construction** (tables, models, utilities)
4. **Audit/tracking infrastructure** (createdAt, updatedAt, version, etc.)

The DSL framework exists structurally but lacks:
- **Parser/validator** to convert DSL → types
- **Bidirectional synchronization** (Model ↔ Table ↔ Better-Auth)
- **Variant constraint system** (which fields required/omitted per variant)
- **Codegen pipeline** (DSL → Model.Class → Table → Better-Auth fields)

This represents a significant opportunity to unify the three currently-manual synchronization points (Model definitions, Table definitions, Better-auth configuration) through a comprehensive DSL implementation.
