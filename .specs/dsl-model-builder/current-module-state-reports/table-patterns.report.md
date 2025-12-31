# Table Patterns Analysis Report

**Date**: 2025-12-30
**Files**: Table.ts, OrgTable.ts, common.ts (domain), model-kit.ts
**Purpose**: Existing factory patterns to inform ModelFactory design

---

## Executive Summary

The codebase implements a sophisticated "drizzle-first" approach to building database tables with sensible defaults. The `Table.make` and `OrgTable.make` patterns provide composable default columns, establishing patterns for the new "schema-first" `ModelFactory` abstraction.

Key insight: **Two-level composition** - builders that merge default columns with user-provided columns while preserving type safety through TypeScript's generic constraints.

---

## 1. Core Table Factory Pattern

### How `Table.make` Works

```typescript
export const make = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) => {
  // Step 1: Define default columns
  const defaultColumns: DefaultColumns<TableName, Brand> = {
    id: entityId.publicId(),
    _rowId: entityId.privateId(),
    ...globalColumns,
  };

  // Step 2: Return a maker function (currying pattern)
  const maker = (defaultColumns) =>
    <TColumnsMap extends Omit<..., keyof DefaultColumns<...>>>(columns, extraConfig?) => {
      const cols = {
        ...defaultColumns,  // Defaults first
        ...columns,         // User columns override defaults
      };
      return pg.pgTable(entityId.tableName, cols, extraConfig);
    };

  return maker(defaultColumns);
};
```

**Key Design Patterns:**

1. **Currying with Partial Application**: Returns `maker(defaultColumns)`
2. **Type Constraint via Omit**: Prevents users from overriding default columns
3. **Column Merging Strategy**: Spreads defaults first, then user columns
4. **EntityId-Driven**: Provides table name and ID column definitions

### Default Columns Included

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `id` | Text | Generated | Public-facing unique identifier |
| `_rowId` | Text | Generated | Internal database primary key |
| `createdAt` | Timestamp | Now | Immutable creation timestamp |
| `updatedAt` | Timestamp | Now | Updated on every insert/update |
| `deletedAt` | Timestamp | NULL | Soft delete support |
| `createdBy` | Text | "app" | Actor who created record |
| `updatedBy` | Text | "app" | Actor who last updated |
| `deletedBy` | Text | NULL | Actor who soft-deleted |
| `version` | Integer | 1 | Optimistic locking |
| `source` | Text | NULL | Origin tracking |

---

## 2. Multi-Tenant Extension: OrgTable.make

### Pattern Inheritance

```typescript
type OrgTableDefaultColumns<TableName, Brand> =
  DefaultColumns<TableName, Brand> & {
    organizationId: $Type<NotNull<PgTextBuilderInitial<...>>, OrganizationId.Type>;
  };
```

**Key Differences from `Table.make`:**
1. Intersection Type: Combines `DefaultColumns` with `organizationId`
2. Foreign Key Constraint: References `organization` table with cascade
3. Type Annotation: Uses `.$type<>()` to maintain type safety
4. Preserved Omit Constraint: Still prevents overriding the organization ID

---

## 3. Schema-First Pattern: makeFields

### Parallel Structure to Table.make

```typescript
export const makeFields = <TableName, Brand, A extends Fields>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>,
  a: A
) => {
  const idFields = {
    id: S.optionalWith(entityId, { default: () => entityId.create() }),
    _rowId: M.Generated(entityId.modelRowIdSchema),
  };

  const defaultFields = {
    ...idFields,
    ...globalColumns(entityId),
  };

  return { ...defaultFields, ...a } as const;
};
```

| Aspect | Table.make (Drizzle) | makeFields (Schema) |
|--------|----------------------|---------------------|
| **Default Identity** | `publicId()` + `privateId()` | `S.optionalWith()` + `M.Generated()` |
| **Audit Columns** | `createdAt`, `updatedAt`, `deletedAt` | `M.Generated(BS.DateTimeUtc)` + `BS.FieldOptionOmittable()` |
| **User Tracking** | `createdBy`, `updatedBy`, `deletedBy` | `BS.FieldOmittableWithDefault()` |
| **Merging Strategy** | Spread defaults, then user | Spread defaults, then user |
| **Type Safety** | Omit constraint | Implicit (object spread) |

---

## 4. ModelKit: Utility Factory

After model definition, `modelKit` extracts metadata:

```typescript
export const modelKit = <const Model extends M.Any>(model: Model) => ({
  keys: ModelUtils.modelFieldKeys(model),
  keyEnum: { id: "id", name: "name", ... },
  keySchema: S.Literal("id", "name", ...),
  KeyType: ... as keyof Model["fields"] & string,
});
```

Usage:
```typescript
export class Model extends M.Class<Model>(...) {
  static readonly utils = modelKit(Model);
}
```

---

## 5. Type Safety Mechanisms

### Column Override Prevention

```typescript
<TColumnsMap extends Omit<Record<string, pg.PgColumnBuilderBase>, keyof DefaultColumns<...>>>
```

Prevents:
```typescript
// COMPILE ERROR
OrgTable.make(SomeId)({
  id: pg.text("custom_id"),  // Cannot override!
})
```

### Type Preservation with .$type

```typescript
userId: pg.text("user_id")
  .$type<SharedEntityIds.UserId.Type>()
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
```

### Generated Field Marking

```typescript
_rowId: M.Generated(entityId.modelRowIdSchema)
```

Affects:
- Encoding: Not required in insert payloads
- Decoding: Expected from database responses
- Updates: Cannot be modified

---

## 6. Key Insights for ModelFactory Design

### 1. Composition Over Inheritance
- Use currying pattern from `Table.make`
- Return a builder function that accepts user fields

### 2. Type Safety First
- Use `Omit<>` to prevent field name collisions
- Preserve branded/entity types throughout

### 3. Parallel Default Fields
- Schema defaults should mirror drizzle defaults
- Both should reference the same `entityId`

### 4. Currying for Ergonomics
```typescript
ModelFactory.make(entityId)(userFields)(extraConfig)
```

### 5. Metadata Attachment
- Use static factories (`modelKit`) to extract field metadata
- Attach utilities to models for runtime field introspection

---

## 7. Files Summary

| File | Purpose | Key Insight |
|------|---------|-------------|
| `Table.ts` | Drizzle table factory | Currying + Omit constraint |
| `OrgTable.ts` | Multi-tenant extension | Type intersection composition |
| `Columns.ts` | Default column types | Comprehensive audit/tracking |
| `common.ts` (domain) | Schema field definitions | `makeFields` mirrors table defaults |
| `model-kit.ts` | Model utilities | Field metadata extraction |
