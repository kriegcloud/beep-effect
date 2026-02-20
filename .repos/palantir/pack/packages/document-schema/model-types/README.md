# @palantir/pack.document-schema.model-types

Minimal runtime types and interfaces supporting generated [PACK](https://github.com/palantir/pack) schemas, providing the foundational types for schema-generated models.

## Overview

This package contains the core runtime type definitions that generated schemas depend on. It provides minimal, lightweight interfaces for document schemas, models, and metadata that are used by generated code and runtime validation.

## Key Exports

### Core Types

- `Model<M, Z>` - Interface for schema-generated models with Zod validation
- `ModelData<M>` - Utility type to extract data type from a Model
- `ModelMetadata` - Metadata interface for models (name, documentation, etc.)

### Document Schema Types

- `DocumentSchema` - Interface for complete document schema definitions
- `DocumentSchemaMetadata` - Metadata for document schemas
- `DocumentState` - Runtime state information for documents

## Usage

This package is primarily used by generated code and other PACK packages. It's not typically imported directly by application code.

```typescript
import type {
  Model,
  ModelData,
} from "@palantir/pack.document-schema.model-types";
import { getMetadata } from "@palantir/pack.document-schema.model-types";

// Example of how generated schemas use these types
interface UserModel extends Model<UserData, ZodUserSchema> {
  readonly __type: UserData;
  readonly zodSchema: ZodUserSchema;
  readonly [Metadata]: {
    name: "User";
    // other metadata
  };
}

// Extract the data type from a model
type UserData = ModelData<GeneratedUserModel>;

getMetadata(UserModel).name; // -> "User"
```

## Dependencies

- `zod@v4` - For runtime schema inspection & validation
