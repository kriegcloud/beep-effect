# @beep/workspaces-domain

Domain layer for the documents feature slice providing pure business entities, value objects, and RPC schemas for document management, discussions, comments, and file versioning.

## Purpose

This package defines the core domain models for document-centric features in the beep-effect monorepo. It provides strongly-typed entities for collaborative document editing, discussion threads, file attachments, and version control. The domain layer remains pure and infrastructure-agnostic, delegating persistence and infrastructure concerns to `@beep/workspaces-server` and table schemas to `@beep/workspaces-tables`. All entities use `@effect/sql/Model` for consistency with the repository layer.

**Current Entity Set**: Document, DocumentVersion, DocumentFile, Discussion, Comment
**Current Value Objects**: TextStyle, LinkType

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/workspaces-domain": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `Entities.Document` | Rich-text documents with Yjs snapshots for real-time collaboration, includes Model and RPC schemas |
| `Entities.DocumentVersion` | Version history tracking for documents, includes Model |
| `Entities.DocumentFile` | File attachments linked to documents, includes Model |
| `Entities.Discussion` | Discussion threads attached to documents, includes Model and RPC schemas |
| `Entities.Comment` | Individual comments within discussions, includes Model and RPC schemas |
| `TextStyle` | Text styling value object: `"default"`, `"serif"`, `"mono"` |
| `LinkType` | Link type value object: `"explicit"`, `"inline-reference"`, `"block_embed"` |
| `MetadataParseError` | Tagged error for metadata parsing failures with diagnostic context |
| `FileReadError` | Tagged error for file reading failures with diagnostic context |

## Entities

All entities are built using `@effect/sql/Model` and follow consistent patterns with Effect Schema validation. Each entity namespace exports:
- `Model` — Effect SQL Model class with schema validation
- `*Rpcs` — RPC schema definitions for remote operations (available for Document, Discussion, Comment)

### Document

Rich-text document entity supporting collaborative editing with Yjs snapshots, rich content storage, and various display options.

```typescript
import { Entities } from "@beep/workspaces-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Access the model
const DocumentModel = Entities.Document.Model;

// Access RPC definitions
const DocumentRpcs = Entities.Document.DocumentRpcs;
```

**Model Fields:**
- `organizationId` — Organization owner
- `userId` — Document creator
- `templateId` — Optional template reference
- `parentDocumentId` — Optional parent document for hierarchies
- `title` — Document title (max 500 chars)
- `content` — Plain text content
- `contentRich` — Rich content structure
- `yjsSnapshot` — Yjs CRDT snapshot for collaboration
- `coverImage`, `icon` — Visual metadata
- `isPublished`, `isArchived` — Publication state
- `textStyle` — Text style (`default`, `serif`, `mono`)
- `smallText`, `fullWidth`, `lockPage`, `toc` — Display options

### Discussion

Discussion thread entity for attaching conversations to documents with RPC support for remote operations.

```typescript
import { Entities } from "@beep/workspaces-domain";
import * as Effect from "effect/Effect";

const DiscussionModel = Entities.Discussion.Model;
const DiscussionRpcs = Entities.Discussion.DiscussionRpcs;
```

### Comment

Individual comment entity within discussion threads with RPC support for remote operations.

```typescript
import { Entities } from "@beep/workspaces-domain";
import * as Effect from "effect/Effect";

const CommentModel = Entities.Comment.Model;
const CommentRpcs = Entities.Comment.CommentRpcs;
```

### DocumentFile

File attachment entity linking files to documents.

```typescript
import { Entities } from "@beep/workspaces-domain";

const DocumentFileModel = Entities.DocumentFile.Model;
```

### DocumentVersion

Version history entity tracking document changes over time for audit and rollback capabilities.

```typescript
import { Entities } from "@beep/workspaces-domain";

const DocumentVersionModel = Entities.DocumentVersion.Model;
```

## Value Objects

Schema-backed value objects for domain-specific types built with `BS.StringLiteralKit` from `@beep/schema`.

### TextStyle

Text styling schema for document content display preferences.

```typescript
import { TextStyle } from "@beep/workspaces-domain";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Type: "default" | "serif" | "mono"
const style: TextStyle.Type = "serif";

// Validate at runtime
const validated = F.pipe("mono", S.decodeUnknown(TextStyle));
```

### LinkType

Link type schema defining relationships between content elements.

```typescript
import { LinkType } from "@beep/workspaces-domain";
import * as S from "effect/Schema";
import * as F from "effect/Function";

// Type: "explicit" | "inline-reference" | "block_embed"
const linkType: LinkType.Type = "inline-reference";

// Validate at runtime
const validated = F.pipe("block_embed", S.decodeUnknown(LinkType));
```

## Errors

Domain-level tagged errors for handling failures using `Data.TaggedError` from Effect.

```typescript
import { MetadataParseError, FileReadError } from "@beep/workspaces-domain/errors";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const program = Effect.gen(function* () {
  // Domain operations that may fail with tagged errors
}).pipe(
  Effect.catchTags({
    MetadataParseError: (error) =>
      F.pipe(
        Effect.logError(`Metadata parse error: ${error.message}`),
        Effect.flatMap(() => Effect.fail(error))
      ),
    FileReadError: (error) =>
      F.pipe(
        Effect.logError(`File read error: ${error.message}`),
        Effect.flatMap(() => Effect.fail(error))
      ),
  })
);
```

**MetadataParseError** — Occurs during metadata parsing with diagnostic context:
- `message` — Error description
- `cause` — Underlying error cause
- `fileName`, `fileType`, `fileSize` — File metadata for debugging
- `phase` — Failure phase: `read`, `parse`, or `decode`

**FileReadError** — Occurs during file reading operations with similar diagnostic context for troubleshooting file access issues.

## Usage

### Working with Entity Namespaces

```typescript
import { Entities } from "@beep/workspaces-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// Access entity model
const DocumentModel = Entities.Document.Model;

// Access RPC definitions for entities that support them
const DocumentRpcs = Entities.Document.DocumentRpcs;
const DiscussionRpcs = Entities.Discussion.DiscussionRpcs;
const CommentRpcs = Entities.Comment.CommentRpcs;
```

### Document Creation Pattern

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Entities, TextStyle } from "@beep/workspaces-domain";
import * as F from "effect/Function";

const createDocument = (input: {
  title: string;
  organizationId: string;
  userId: string;
}) =>
  Effect.gen(function* () {
    // Decode and validate using the model schema
    const document = yield* F.pipe(
      {
        title: input.title,
        organizationId: input.organizationId,
        userId: input.userId,
        textStyle: "default" as const,
        isPublished: false,
        isArchived: false,
        toc: true,
      },
      S.decodeUnknown(Entities.Document.Model)
    );

    return document;
  });
```

### Value Object Validation

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { TextStyle, LinkType } from "@beep/workspaces-domain";

const program = Effect.gen(function* () {
  const style = yield* F.pipe(
    "serif",
    S.decodeUnknown(TextStyle)
  );
  const linkType = yield* F.pipe(
    "inline-reference",
    S.decodeUnknown(LinkType)
  );

  return { style, linkType };
});
```

### Error Handling with Tagged Errors

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { MetadataParseError, FileReadError } from "@beep/workspaces-domain/errors";

const parseMetadata = (file: { name: string; type: string; size: number }) =>
  Effect.gen(function* () {
    // Parsing logic that may fail
    yield* Effect.fail(
      new MetadataParseError({
        message: "Failed to parse file metadata",
        cause: new Error("Invalid format"),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        phase: "parse",
      })
    );
  }).pipe(
    Effect.catchTag("MetadataParseError", (error) =>
      F.pipe(
        Effect.logError(error.message),
        Effect.flatMap(() => Effect.fail(error))
      )
    )
  );
```

## Entity Model Patterns

All entities follow consistent Effect SQL Model patterns using shared infrastructure from `@beep/shared-domain`:

```typescript
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Model extends M.Class<Model>(`DocumentModel`)(
  makeFields(DocumentsEntityIds.DocumentId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    title: F.pipe(S.String, S.maxLength(500)),
    textStyle: TextStyle,
    isPublished: S.Boolean,
    isArchived: S.Boolean,
    // ... other fields
  })
) {
  static readonly utils = modelKit(Model);
}
```

### Key Pattern Features
- **makeFields** — Standardized field construction with audit fields (`id`, `createdAt`, `updatedAt`) automatically included
- **modelKit** — Utility factory providing common model operations (decode, encode, insert, update helpers)
- **BS helpers** — `FieldOptionOmittable`, `BoolWithDefault` for nullable fields with defaults
- **Entity IDs** — Branded types from `@beep/shared-domain` for compile-time type safety and runtime validation
- **Effect SQL Model** — Seamless integration with repository layer using `@effect/sql`

## Development

```bash
# Type check
bun run --filter @beep/workspaces-domain check

# Lint
bun run --filter @beep/workspaces-domain lint
bun run --filter @beep/workspaces-domain lint:fix

# Test
bun run --filter @beep/workspaces-domain test
bun run --filter @beep/workspaces-domain coverage

# Build
bun run --filter @beep/workspaces-domain build

# Check for circular dependencies
bun run --filter @beep/workspaces-domain lint:circular

# Regenerate Effect indices after adding modules
bunx effect generate --cwd packages/workspaces/domain
```

## Import Guidelines

### Workspace Alias Usage
```typescript
// ✅ REQUIRED - workspace alias
import { Entities, TextStyle, LinkType } from "@beep/workspaces-domain";

// ✅ REQUIRED - sub-path exports
import { MetadataParseError, FileReadError } from "@beep/workspaces-domain/errors";

// ❌ FORBIDDEN - relative imports
import { Entities } from "../../../documents/domain";
```

### Effect Import Conventions
```typescript
// ✅ REQUIRED - namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as R from "effect/Record";

// ✅ REQUIRED - Use pipe for all transformations
F.pipe(items, A.map((item) => item.name));
F.pipe(str, Str.split(","), A.filter(Str.isNonEmpty));
F.pipe(obj, R.map((value) => value.toString()));

// ❌ FORBIDDEN - native array/string/object methods
items.map((item) => item.name);
str.split(",").filter((s) => s !== "");
Object.keys(obj).map((key) => obj[key]);
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect library for functional effects and schemas |
| `@effect/sql` | SQL modeling utilities and Model base class |
| `@beep/shared-domain` | Cross-slice entities, entity IDs, and model factories (`makeFields`, `modelKit`) |
| `@beep/schema` | Schema utilities and helpers (BS namespace for `StringLiteralKit`, `FieldOptionOmittable`) |
| `@beep/identity` | Package identity utilities (`$DocumentsDomainId`) |

## Architecture

### Layer Position
This package is the **domain layer** in the documents vertical slice, sitting at the foundation of the architecture. It defines pure business models consumed by all other layers.

### What Belongs Here
- Pure domain models (entities, value objects) using Effect Schema and SQL Model
- Business logic that doesn't require side effects or infrastructure
- RPC schema definitions for remote operations between client and server
- Domain-specific tagged errors with diagnostic context
- Entity ID type definitions and branding

### What Doesn't Belong Here
- Database queries, repositories, or migrations → use `@beep/workspaces-server`
- Drizzle table schemas → use `@beep/workspaces-tables`
- API route handlers or client contracts → use `@beep/workspaces-client`
- React components or UI logic → use `@beep/workspaces-ui`
- External service integrations (S3, email) → use `@beep/workspaces-server`
- Storage operations or file handling → use `@beep/workspaces-server`

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/workspaces-tables` | Drizzle schema definitions for documents domain |
| `@beep/workspaces-server` | Repository implementations, database adapters, S3 storage |
| `@beep/workspaces-client` | Client-side contracts and RPC handlers |
| `@beep/workspaces-ui` | React components for documents |
| `@beep/shared-domain` | Cross-slice domain primitives |
| `@beep/shared-server` | Shared infrastructure layers |

## Notes

### Effect-First Development
- **ALWAYS** use namespace imports for Effect modules (`import * as Effect from "effect/Effect"`)
- **NEVER** use native array methods → use `effect/Array` (`A.map`, `A.filter`, etc.)
- **NEVER** use native string methods → use `effect/String` (`Str.split`, `Str.trim`, etc.)
- **NEVER** use `Object.keys/values/entries` → use `effect/Record` and `effect/Struct`
- **ALWAYS** use `F.pipe` for transformations and composition

### Entity Patterns
- Add new entities following the established pattern: Model, RPC schema (optional)
- Export all entity artifacts through namespace modules for clean imports (`export * as Entity from "./Entity"`)
- Use `makeFields` from `@beep/shared-domain/common` for consistent field construction with audit fields
- Use `modelKit` from `@beep/shared-domain/factories` for standard model utilities
- Use `@beep/schema` helpers (`BS.FieldOptionOmittable`, `BS.BoolWithDefault`, `BS.StringLiteralKit`) for schemas
- Document all models with JSDoc comments explaining their purpose and usage

### Type Safety
- Maintain entity ID references from `@beep/shared-domain` for cross-slice consistency
- Use branded types for entity IDs to prevent mixing different ID types
- Validate all external data with Effect Schema before creating domain models
- Use tagged errors for domain-specific failures with diagnostic context
