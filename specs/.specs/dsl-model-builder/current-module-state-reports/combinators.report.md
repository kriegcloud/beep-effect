# Combinators Module Analysis Report

**Date**: 2025-12-30
**Module**: `packages/common/schema/src/integrations/sql/dsl/combinators.ts`
**Purpose**: Pipe-friendly DSL for building SQL column definitions

---

## Executive Summary

The combinators module provides a pipe-friendly API for building SQL column definitions. It enables composable transformation of Effect Schemas into DSLFields with column metadata, following Effect's pipe-first style.

---

## 1. Available Combinators

### Type Setters (8 total)

| Combinator | Column Type | Notes |
|------------|-------------|-------|
| `DSL.uuid` | `"uuid"` | PostgreSQL UUID |
| `DSL.string` | `"string"` | PostgreSQL TEXT |
| `DSL.integer` | `"integer"` | PostgreSQL INTEGER |
| `DSL.number` | `"number"` | PostgreSQL DOUBLE PRECISION |
| `DSL.boolean` | `"boolean"` | PostgreSQL BOOLEAN |
| `DSL.json` | `"json"` | PostgreSQL JSONB |
| `DSL.datetime` | `"datetime"` | PostgreSQL TIMESTAMP |
| `DSL.bigint` | `"bigint"` | PostgreSQL BIGINT |

### Constraint Setters (3 total)

- `DSL.primaryKey` - Marks column as primary key
- `DSL.unique` - Adds UNIQUE constraint
- `DSL.autoIncrement` - Marks as auto-incrementing (only valid for integer/bigint)

### Value Setters

- `DSL.defaultValue(value)` - Sets default value (static or function)
- `DSL.references(target, field, foreignKey?)` - Foreign key reference

---

## 2. Field Merging & Composition

### How Merging Works

**Type Level** (`MergeColumnDef<Existing, New>`):
- Merges existing column definition with new properties
- New properties override existing ones
- Defaults resolved hierarchically: New > Existing > Fallback

**Runtime Level** (`attachColumnDef` helper):
```typescript
attachColumnDef(self, partial):
  1. Extract existing metadata from self if present
  2. Merge: { type, primaryKey, unique, autoIncrement, defaultValue }
  3. Attach via annotations API
  4. Store as direct property for easy access
```

**Dual Storage Pattern**:
- Via Effect Schema annotations
- Via direct property on the object

### Merging Properties Hierarchy

For each property, new values override existing:
- **type**: `partial.type ?? existingDef?.type ?? deriveColumnType(schema)`
- **primaryKey**: `partial.primaryKey ?? existingDef?.primaryKey ?? false`
- **unique**: `partial.unique ?? existingDef?.unique ?? false`
- **autoIncrement**: `partial.autoIncrement ?? existingDef?.autoIncrement ?? false`
- **defaultValue**: `partial.defaultValue ?? existingDef?.defaultValue ?? undefined`

---

## 3. Field Composition Patterns

### Pattern 1: Sequential Type/Constraint Application

```typescript
S.String
  .pipe(DSL.uuid)           // Type: "uuid"
  .pipe(DSL.primaryKey)      // Add primaryKey: true
  .pipe(DSL.unique)          // Add unique: true
```

Result: `{ type: "uuid", primaryKey: true, unique: true, ... }`

### Pattern 2: Reordering (Last Wins)

```typescript
S.String
  .pipe(DSL.uuid)
  .pipe(DSL.primaryKey)
  .pipe(DSL.string)          // Type changes from "uuid" to "string"
```

Result: `{ type: "string", primaryKey: true, ... }`

### Pattern 3: Complex Chains

```typescript
S.Int
  .pipe(DSL.integer)
  .pipe(DSL.primaryKey)
  .pipe(DSL.autoIncrement)   // Only valid for integer/bigint
  .pipe(DSL.unique)
  .pipe(DSL.defaultValue("0"))
```

---

## 4. Type Information Preservation

### Type Threading

Each combinator:
1. Accepts input `C` (existing column def or `never`)
2. Resolves to `DerivedDefaultColumnDef<Schema>` if `C is never`
3. Merges with new properties using `MergeColumnDef`
4. Returns refined `DSLField<A, I, R, MergeColumnDef<...>>`

### Validation Types

- `ValidateSchemaColumn<SchemaEncoded, ColType, ResultType>`: Compile-time validation
- `IsSchemaColumnCompatible<SchemaEncoded, ColType>`: Exhaustive validation
- Returns helpful error type if incompatible

---

## 5. No Dedicated Grouping API

The combinators module does NOT provide:
- Field collection/grouping utilities
- Field set builders
- Batch field creation

Instead, rely on:
1. Model Definition for natural grouping
2. Object spread for field reuse

---

## 6. Patterns for ModelFactory Implementation

### Key Insights

1. **Field merging is already solved**:
   - `attachColumnDef()` handles all merging logic
   - Hierarchical override: new > existing > defaults

2. **Default field creation**:
   - Use `deriveColumnType()` for auto-derivation
   - Fallback chain: explicit > derived > "string"

3. **Composition over inheritance**:
   - Combinators work through pipe, not inheritance
   - No direct field modification needed

4. **Type thread pattern**:
   - Each operation returns new `DSLField<A, I, R, NewColumnDef>`
   - `MergeColumnDef` is the core merging type

5. **No built-in grouping**:
   - Implement field grouping at ModelBuilder level
   - Use object spread or helper functions
