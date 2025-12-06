# @beep/documents-sdk

Client-facing SDK layer for the documents slice, providing Effect-first wrappers for document management, knowledge pages, discussions, and file operations.

## Purpose

The SDK package bridges client applications (web, CLI, mobile) with the documents infrastructure layer, exposing type-safe Effect-based contracts that eliminate direct dependency on raw HTTP endpoints or RPC internals. This ensures consumers work with validated domain models and benefit from structured error handling aligned with Effect patterns.

## Current Status

**Placeholder Stage**: The package currently exports a stub (`beep`) while the infra layer and HTTP API stabilize. Once `@beep/documents-infra` finalizes route implementations and the `DomainApi` from `@beep/documents-domain` is wired into the server runtime, this package will host the official client wrappers.

## Architecture Fit

- **Vertical Slice Layering**: SDK sits between `domain` (entities/value objects) and `ui` (React components), consuming contracts defined in domain and exposing them to client runtimes
- **Effect-First**: All client methods return Effect types, no async/await or bare Promises
- **Dependency Injection**: Configuration (base URLs, auth tokens, HTTP clients) provided via Layers for testability and runtime flexibility
- **Platform Agnostic**: Supports Bun, browsers, Node, and test environments through injectable network concerns

## Planned Features

When implemented, the SDK will provide client wrappers for:

| Feature Area | Description |
|-------------|-------------|
| **Documents** | CRUD operations for documents, versioning, metadata management |
| **Knowledge Pages** | Page creation, updates, block management, status transitions |
| **Knowledge Spaces** | Space organization, hierarchy, permissions |
| **Discussions** | Thread creation, replies, resolution workflows |
| **Comments** | Inline comments, mentions, reactions |
| **File Operations** | Upload initiation, signed URLs, progress tracking, metadata extraction |

## Expected API Shape

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import { DomainApi } from "@beep/documents-domain";

// Configuration service
export class DocumentsClientConfig extends Context.Tag("@beep/documents-sdk/Config")<
  DocumentsClientConfig,
  {
    readonly baseUrl: string;
    readonly apiVersion: string;
  }
>() {}

// Main client service
export class DocumentsClient extends Effect.Service<DocumentsClient>()("@beep/documents-sdk/Client", {
  effect: Effect.gen(function* () {
    const config = yield* DocumentsClientConfig;
    const httpClient = yield* HttpClient.HttpClient;

    // Knowledge page operations
    const getPage = (pageId: string) => Effect.gen(function* () {
      // Fetch and decode knowledge page
      // Returns Effect<KnowledgePage, DocumentsError>
    });

    const createPage = (data: unknown) => Effect.gen(function* () {
      // Validate input schema
      // POST to API endpoint
      // Return decoded page
    });

    const updatePage = (pageId: string, updates: unknown) => Effect.gen(function* () {
      // Validate and send updates
      // Returns Effect<KnowledgePage, DocumentsError>
    });

    // Document operations
    const uploadDocument = (file: File, metadata: unknown) => Effect.gen(function* () {
      // Request signed upload URL
      // Upload to storage
      // Create document record
      // Returns Effect<Document, UploadError>
    });

    const getDocument = (documentId: string) => Effect.gen(function* () {
      // Fetch document with versions
      // Returns Effect<Document, DocumentsError>
    });

    // Discussion operations
    const createDiscussion = (data: unknown) => Effect.gen(function* () {
      // Create discussion thread
      // Returns Effect<Discussion, DocumentsError>
    });

    const addComment = (discussionId: string, content: unknown) => Effect.gen(function* () {
      // Add comment to discussion
      // Returns Effect<Comment, DocumentsError>
    });

    return {
      // Knowledge Pages
      getPage,
      createPage,
      updatePage,
      listPages,
      deletePage,

      // Documents
      uploadDocument,
      getDocument,
      listDocuments,
      deleteDocument,

      // Discussions & Comments
      createDiscussion,
      getDiscussion,
      addComment,
      resolveDiscussion
    };
  }),
  dependencies: [
    DocumentsClientConfig.Default,
    HttpClient.layer
  ]
}) {}

// Convenience layers
export const DocumentsClientLive = Layer.effect(
  DocumentsClient,
  Effect.gen(function* () {
    // Implementation
  })
);
```

## Usage Examples

### Basic Client Setup

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { DocumentsClient, DocumentsClientConfig } from "@beep/documents-sdk";

// Configure client
const ConfigLive = Layer.succeed(
  DocumentsClientConfig,
  {
    baseUrl: "https://api.example.com",
    apiVersion: "v1"
  }
);

// Use client
const program = Effect.gen(function* () {
  const client = yield* DocumentsClient;
  const page = yield* client.getPage("page-id");
  return page;
});

// Run with dependencies
const runnable = Effect.provide(program, Layer.merge(ConfigLive, DocumentsClientLive));
```

### Knowledge Page Operations

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { DocumentsClient } from "@beep/documents-sdk";
import { KnowledgePage } from "@beep/documents-domain";

const createAndPublishPage = (title: string, content: string) =>
  Effect.gen(function* () {
    const client = yield* DocumentsClient;

    // Create draft page
    const draft = yield* client.createPage({
      title,
      content,
      status: "draft"
    });

    // Update to published
    const published = yield* client.updatePage(draft.id, {
      status: "published"
    });

    return published;
  });
```

### File Upload with Progress

```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { DocumentsClient } from "@beep/documents-sdk";

const uploadWithProgress = (file: File) =>
  Effect.gen(function* () {
    const client = yield* DocumentsClient;

    // Initiate upload with progress tracking
    const upload = yield* client.uploadDocument(file, {
      tags: ["user-upload"],
      visibility: "private"
    });

    // Handle upload progress (future enhancement)
    // Returns document metadata after completion
    return upload;
  });
```

## Development

### Type Check
```bash
bun run check --filter=@beep/documents-sdk
```

### Lint
```bash
bun run lint --filter=@beep/documents-sdk
bun run lint:fix --filter=@beep/documents-sdk
```

### Build
```bash
bun run build --filter=@beep/documents-sdk
```

### Test
```bash
bun run test --filter=@beep/documents-sdk
bun run coverage --filter=@beep/documents-sdk
```

## Authoring Guidelines

### Effect-First Patterns

Always use Effect utilities, never native array/string/object methods:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as R from "effect/Record";

// ✅ REQUIRED - Effect utilities with pipe
F.pipe(items, A.map((item) => item.name));
F.pipe(str, Str.toUpperCase);
F.pipe(obj, R.keys);

// ❌ FORBIDDEN - Native methods
items.map(item => item.name);
str.toUpperCase();
Object.keys(obj);
```

### Schema Validation

Validate all external data before returning to callers:

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import { KnowledgePage } from "@beep/documents-domain";

const fetchPage = (id: string) =>
  Effect.gen(function* () {
    const response = yield* httpClient.get(`/pages/${id}`);

    // Always decode with domain schemas
    const page = yield* S.decodeUnknown(KnowledgePage.Schema)(response.body);

    return page;
  });
```

### Error Handling

Use tagged errors aligned with domain error types:

```typescript
import * as S from "effect/Schema";
import { DocumentsError } from "@beep/documents-domain";

class SdkError extends S.TaggedError<SdkError>()("SdkError", {
  message: S.String,
  cause: S.optional(S.Unknown)
}) {}

// Methods return Effect with proper error channel
type PageResult = Effect.Effect<KnowledgePage, DocumentsError | SdkError>;
```

### Dependency Injection

Accept configuration via Layers, not global state:

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// ✅ REQUIRED - Service with Layer
export class ApiConfig extends Context.Tag("ApiConfig")<
  ApiConfig,
  { baseUrl: string }
>() {}

export const ConfigLive = Layer.succeed(ApiConfig, {
  baseUrl: process.env.API_URL
});

// ❌ FORBIDDEN - Direct global access
const baseUrl = process.env.API_URL;
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime, Schema, and utilities |
| `@effect/platform` | HTTP client, URL handling |
| `@beep/documents-domain` | Entity models, value objects, DomainApi |
| `@beep/documents-infra` | Infrastructure contracts (type-level only) |
| `@beep/schema` | Shared schema primitives and EntityId |
| `@beep/shared-sdk` | Cross-slice SDK utilities |
| `@beep/errors` | Error logging and telemetry |
| `@beep/utils` | Pure runtime helpers |

## What Belongs Here

- **Client wrappers** for HTTP/RPC endpoints defined in `@beep/documents-domain/DomainApi`
- **Type-safe request builders** with schema validation
- **Effect-based error handling** aligned with domain error types
- **Layer-based configuration** for base URLs, auth tokens, retry policies
- **Client-side utilities** for upload progress, caching, optimistic updates
- **Contract mirrors** matching server-side route definitions

## What Must NOT Go Here

- **Server-side logic**: keep infrastructure, database, storage in `@beep/documents-infra`
- **UI components**: React/Next components belong in `@beep/documents-ui`
- **Business rules**: domain policies stay in `@beep/documents-domain`
- **Direct DB access**: SDK never touches Drizzle or SQL clients
- **Platform-specific code**: avoid Node/Bun/Deno-only APIs; use `@effect/platform` abstractions

## Testing Strategy

- **Unit tests**: Mock HTTP clients and test request/response transformations
- **Contract tests**: Verify SDK matches server-side API contracts
- **Error handling**: Test all error paths and schema validation failures
- **Layer composition**: Test that services wire correctly with test/prod configs

Tests should use `@beep/testkit` for Effect-based test utilities and live in `test/` directory.

## Implementation Roadmap

This section tracks progress as the SDK evolves from placeholder to full implementation:

- [ ] **Phase 1**: Define service interfaces and Layer structure
- [ ] **Phase 2**: Implement Knowledge Page client operations
- [ ] **Phase 3**: Add Document and File upload workflows
- [ ] **Phase 4**: Discussion and Comment operations
- [ ] **Phase 5**: Error handling and retry policies
- [ ] **Phase 6**: Optimistic updates and caching layers
- [ ] **Phase 7**: Progress tracking for uploads/downloads
- [ ] **Phase 8**: Integration tests with mock server

## See Also

- **AGENTS.md**: Authoring guardrails, integration notes, and contributor checklist
- **@beep/documents-domain**: Entity models, DomainApi, and contracts
- **@beep/documents-infra**: Server-side implementation and storage
- **@beep/iam-sdk**: Reference SDK implementation pattern
- **Root AGENTS.md**: Effect patterns and monorepo conventions

## Contributor Checklist

Before submitting changes:

- [ ] No native array/string/object methods; use Effect utilities (`A.*`, `Str.*`, `R.*`)
- [ ] All network responses decoded through domain schemas
- [ ] Services provide Layer-based dependency injection
- [ ] Error types align with `@beep/documents-domain` error hierarchy
- [ ] Added or updated tests in `test/` directory
- [ ] Updated this README if adding new public APIs
- [ ] Ran `bun run check`, `bun run lint`, `bun run test`
- [ ] Verified circular dependency check passes: `bun run lint:circular`
