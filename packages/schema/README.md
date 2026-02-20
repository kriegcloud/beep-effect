# @palantir/pack.schema

Programmatic API for defining schemas using TypeScript builders, providing type-safe schema definition with records, unions, and migrations.

## Overview

This package provides builder functions and types for defining document schemas programmatically in TypeScript. It offers an alternative to YAML-based schema definitions, allowing for type-safe schema construction with full IDE support.

## Key Exports

### Schema Definition Functions

- `defineRecord(name, config)` - Define record types with fields and documentation
- `defineUnion(name, variants)` - Define discriminated unions of record types
- `defineMigration(previousSchema, migrationFn)` - Define schema migrations

### Type System

- `Type` - Base type for all PACK field types
- `String`, `Double` - Primitive field types
- `Array<T>`, `Optional<T>` - Composite field types
- `Ref` - References to other defined records/unions

### Utilities

- Field validation and resolution utilities
- Schema conversion and processing functions

## Usage

```typescript
import * as P from "@palantir/pack.schema";

// Define a record type
const Position = P.defineRecord("Position", {
  docs: "A position in 2D space",
  fields: {
    x: P.Double,
    y: P.Double,
  },
});

// Define a record with optional fields and references
const Node = P.defineRecord("Node", {
  docs: "A node in the graph",
  extends: [Position],
  fields: {
    label: P.Optional(P.String),
    connections: P.Array(Ref(() => Node)), // Forward reference
  },
});

// Define a union type
const Shape = P.defineUnion("Shape", {
  circle: Circle,
  rectangle: Rectangle,
  node: Node,
});

// Define a migration
const v2Schema = P.defineMigration(v1Schema, schema => {
  // Migration logic
  return schema;
});
```

## Field Types

### Primitives

- `String` - String values
- `Double` - Numeric values
- `Unknown` - Any value type

### Composites

- `Array<T>` - Arrays of type T
- `Optional<T>` - Optional values of type T
- `Ref<T>` - References to other defined types

## Features

- **Type Safety** - Full TypeScript type checking during schema definition
- **Forward References** - Support for circular/forward references using functions
- **Schema Evolution** - Migration system for schema versioning
- **IDE Support** - IntelliSense and auto-completion for schema building
- **Validation** - Runtime validation of schema definitions
