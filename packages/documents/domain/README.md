# @beep/documents-domain

Domain layer for the documents feature slice. Provides pure business entities, value objects, and HTTP API contracts for document management, knowledge bases, discussions, and file versioning.

## Architecture

This package follows vertical slice architecture as the **domain layer**:
- Pure domain models using `@effect/sql/Model`
- Value objects for domain-specific types
- Tagged errors for domain violations
- HTTP API contracts via `@effect/platform`
- No infrastructure concerns (no database, storage, or external APIs)

## Contents

### Entities

Each entity is structured with Effect Schema models and supporting artifacts:

- **Comment** — Individual comments within discussions (plain text and rich content)
- **Discussion** — Discussion threads attached to documents
- **Document** — Rich-text documents with Yjs snapshots for real-time collaboration
- **DocumentFile** — File attachments linked to documents
- **DocumentVersion** — Version history tracking for documents
- **KnowledgeBlock** — Content blocks for knowledge pages (paragraphs, headings, code, images, embeds)
- **KnowledgePage** — Pages within knowledge spaces with hierarchical organization
- **KnowledgeSpace** — Top-level organizational containers for knowledge pages
- **PageLink** — Links between knowledge pages for relationship mapping

Access via namespace imports:
```typescript
import * as S from "effect/Schema";
import { Entities } from "@beep/documents-domain";

// Entity models
const page: typeof Entities.KnowledgePage.Model.Type = /* ... */;
const block: typeof Entities.KnowledgeBlock.Model.Type = /* ... */;

// Entity contracts
const contract = Entities.KnowledgePage.Contract;

// Entity errors
const error = new Entities.KnowledgePage.KnowledgePageNotFoundError({ id: "..." });
```

### Value Objects

Schema-backed enums for domain-specific types:

- **BlockType** — Content block types: `paragraph`, `heading`, `code`, `image`, `file_embed`
- **ImageAlignment** — Image alignment options
- **LinkType** — Types of links between pages
- **PageStatus** — Page lifecycle states: `draft`, `published`, `archived`
- **TextStyle** — Text styling options for documents

```typescript
import { PageStatus, BlockType } from "@beep/documents-domain";

const status: typeof PageStatus.Type = "draft";
const blockType: typeof BlockType.Type = "heading";
```

### Domain API

Unified HTTP API aggregating all entity contracts:

```typescript
import { DomainApi } from "@beep/documents-domain";

// DomainApi extends HttpApi with:
// - KnowledgePage.Contract
// - Prefix: /api/v1/documents
```

### Errors

Tagged errors for domain-level failures:

- **MetadataParseError** — Metadata parsing failures (file type, size, phase tracking)
- **FileReadError** — File reading failures with diagnostic context

```typescript
import * as Effect from "effect/Effect";
import { MetadataParseError, FileReadError } from "@beep/documents-domain/errors";

const program = Effect.gen(function* () {
  // Domain operations that may fail with tagged errors
}).pipe(
  Effect.catchTags({
    MetadataParseError: (error) => Effect.logError(error.message),
    FileReadError: (error) => Effect.logError(error.message),
  })
);
```

## Entity Model Patterns

All entities follow consistent Effect SQL Model patterns:

```typescript
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Model extends M.Class<Model>(`KnowledgePageModel`)(
  makeFields(DocumentsEntityIds.KnowledgePageId, {
    spaceId: DocumentsEntityIds.KnowledgeSpaceId,
    organizationId: SharedEntityIds.OrganizationId,
    parentPageId: BS.FieldOptionOmittable(DocumentsEntityIds.KnowledgePageId),
    title: F.pipe(S.String, S.maxLength(500)),
    slug: S.String,
    status: PageStatus,
    order: BS.toOptionalWithDefault(S.Int)(0),
    lastEditedAt: BS.DateTimeUtcFromAllAcceptable,
  })
) {
  static readonly utils = modelKit(Model);
}
```

### Key Features
- **makeFields** — Standardized field construction with audit fields (createdAt, updatedAt)
- **modelKit** — Utility factory for common model operations
- **BS helpers** — `FieldOptionOmittable`, `toOptionalWithDefault` for nullable/default fields
- **Entity IDs** — Branded types from `@beep/shared-domain` for type safety

## HTTP API Contracts

Some entities define typed HTTP endpoints with Effect Platform. Currently, only `KnowledgePage` has a contract:

```typescript
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { AuthContextHttpMiddleware } from "@beep/shared-domain/Policy";

export class Contract extends HttpApiGroup.make("knowledgePage")
  .middleware(AuthContextHttpMiddleware)
  .add(
    HttpApiEndpoint.get("get", "/get/:id")
      .setUrlParams(DocumentsEntityIds.KnowledgePageId)
      .addError(KnowledgePageNotFoundError)
      .addSuccess(Model)
  ) {}
```

Entities with RPC schemas instead of HTTP contracts include: `Comment`, `Discussion`, and `Document`.

## Usage Examples

### Working with Entity Namespaces

```typescript
import { Entities } from "@beep/documents-domain";
import * as Effect from "effect/Effect";

// Access entity model
const pageModel = Entities.KnowledgePage.Model;

// Access entity contract
const pageContract = Entities.KnowledgePage.Contract;

// Access entity errors
const notFoundError = new Entities.KnowledgePage.KnowledgePageNotFoundError({
  id: "page_123",
});

// Access RPC definitions (where available)
const documentRpcs = Entities.Document.DocumentRpcs;
```

### Value Object Validation

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import { PageStatus, BlockType } from "@beep/documents-domain";

const program = Effect.gen(function* () {
  const status = yield* S.decodeUnknown(PageStatus)("draft"); // Type: "draft" | "published" | "archived"
  const blockType = yield* S.decodeUnknown(BlockType)("paragraph");

  return { status, blockType };
});
```

### Document Creation Pattern

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Entities, TextStyle } from "@beep/documents-domain";

const createDocument = (input: {
  title: string;
  organizationId: string;
  userId: string;
}) =>
  Effect.gen(function* () {
    // Decode and validate using the model schema
    const document = yield* S.decodeUnknown(Entities.Document.Model)({
      title: input.title,
      organizationId: input.organizationId,
      userId: input.userId,
      textStyle: "default" as const,
      isPublished: false,
      isArchived: false,
      toc: true,
    });

    return document;
  });
```

## Development

### Type Checking
```bash
bun run --filter @beep/documents-domain check
```

### Linting
```bash
bun run --filter @beep/documents-domain lint
bun run --filter @beep/documents-domain lint:fix
```

### Testing
```bash
bun run --filter @beep/documents-domain test
bun run --filter @beep/documents-domain coverage
```

### Circular Dependency Check
```bash
bun run --filter @beep/documents-domain lint:circular
```

## Import Guidelines

### Workspace Alias Usage
```typescript
// ✅ Correct - workspace alias
import { Entities, PageStatus } from "@beep/documents-domain";
import { DomainApi } from "@beep/documents-domain";

// ✅ Correct - sub-path exports
import { BlockType } from "@beep/documents-domain/value-objects";

// ❌ Incorrect - relative imports
import { Entities } from "../../../documents/domain";
```

### Effect Import Conventions
```typescript
// ✅ Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";

// ✅ Named imports for specific utilities
import { pipe } from "effect/Function";
```

## Dependencies

### Peer Dependencies
- `effect` — Core Effect library
- `@effect/sql` — SQL modeling utilities
- `@beep/shared-domain` — Cross-slice entities and factories
- `@beep/schema` — Schema utilities and helpers
- `@beep/invariant` — Assertion contracts
- `@beep/utils` — Pure runtime helpers
- `@beep/constants` — Schema-backed enums
- `@beep/identity` — Package identity

## Layer Boundaries

### What Belongs Here
- Pure domain models (entities, value objects)
- Business logic that doesn't require side effects
- HTTP API contract definitions
- Domain-specific tagged errors
- Entity ID type definitions

### What Doesn't Belong Here
- Database queries or migrations (use `@beep/documents-infra`)
- API route handlers (use `@beep/documents-sdk`)
- React components (use `@beep/documents-ui`)
- External service integrations (use `@beep/documents-infra`)
- Storage operations (use `@beep/documents-infra`)

## Related Packages

- `@beep/documents-tables` — Drizzle schema definitions
- `@beep/documents-infra` — Repository implementations, database adapters, S3 storage
- `@beep/documents-sdk` — Client-side contracts and RPC handlers
- `@beep/documents-ui` — React components for documents
- `@beep/shared-domain` — Cross-slice domain primitives
- `@beep/shared-infra` — Shared infrastructure layers

## Notes

- Keep all code Effect-first (use namespace imports, avoid native array/string methods)
- Use `@beep/schema` helpers (`BS.FieldOptionOmittable`, `BS.toOptionalWithDefault`) for schema construction
- Add new entities following the established pattern: Model, Contract, Errors, RPC (optional)
- Export all entity artifacts through namespace modules for clean imports
- Use `modelKit` from `@beep/shared-domain/factories` for model utilities
- Document all models with JSDoc comments explaining their purpose
- Maintain entity ID references from `@beep/shared-domain` for consistency
