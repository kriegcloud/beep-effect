# @beep/documents-sdk

Client-facing SDK layer for the documents slice, providing Effect-first wrappers for document management, knowledge pages, discussions, and file operations.

## Purpose

The SDK package bridges client applications (web, CLI, mobile) with the documents infrastructure layer, exposing type-safe Effect-based contracts that eliminate direct dependency on raw HTTP endpoints or RPC internals. This ensures consumers work with validated domain models and benefit from structured error handling aligned with Effect patterns.

## Current Status

**Placeholder Stage**: The package currently exports a stub (`beep`) while the infra layer and HTTP/RPC API stabilize.

**Available Contracts in Domain**:
- `@beep/documents-domain/DomainApi` — HTTP API with `KnowledgePage.Contract` (get endpoint)
- `@beep/documents-domain/entities/Document` — RPC contracts for full document CRUD (12 operations)
- `@beep/documents-domain/entities/Discussion` — RPC contracts for discussions
- `@beep/documents-domain/entities/Comment` — RPC contracts for comments

Once `@beep/documents-infra` finalizes route implementations and these contracts are wired into the server runtime, this package will host the official client wrappers for both HTTP and RPC endpoints.

## Architecture Fit

- **Vertical Slice Layering**: SDK sits between `domain` (entities/value objects) and `ui` (React components), consuming contracts defined in domain and exposing them to client runtimes
- **Effect-First**: All client methods return Effect types, no async/await or bare Promises
- **Dependency Injection**: Configuration (base URLs, auth tokens, HTTP clients) provided via Layers for testability and runtime flexibility
- **Platform Agnostic**: Supports Bun, browsers, Node, and test environments through injectable network concerns

## Planned Features

When implemented, the SDK will provide client wrappers for:

| Feature Area | Description | Domain Contract Status |
|-------------|-------------|------------------------|
| **Documents** | CRUD operations for documents, versioning, metadata management | ✅ RPC contracts defined (12 operations) |
| **Knowledge Pages** | Page creation, updates, block management, status transitions | ✅ HTTP contract defined (get endpoint) |
| **Knowledge Spaces** | Space organization, hierarchy, permissions | ⏳ Pending |
| **Discussions** | Thread creation, replies, resolution workflows | ✅ RPC contracts defined |
| **Comments** | Inline comments, mentions, reactions | ✅ RPC contracts defined |
| **File Operations** | Upload initiation, signed URLs, progress tracking, metadata extraction | ⏳ Pending |

## Expected API Shape

### HTTP Client (for Knowledge Pages)

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as HttpClient from "@effect/platform/HttpClient";
import { DomainApi, KnowledgePage } from "@beep/documents-domain";

// HTTP client for Knowledge Pages using DomainApi
export class KnowledgePageClient extends Effect.Service<KnowledgePageClient>()(
  "@beep/documents-sdk/KnowledgePageClient",
  {
    effect: Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;

      const getPage = (id: string) =>
        Effect.gen(function* () {
          // Use DomainApi.KnowledgePage.Contract.get endpoint
          // Returns Effect<KnowledgePage, KnowledgePageNotFoundError>
        });

      return { getPage };
    }),
    dependencies: [HttpClient.layer]
  }
) {}
```

### RPC Client (for Documents, Discussions, Comments)

```typescript
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcResolver from "@effect/rpc/RpcResolver";
import * as Effect from "effect/Effect";
import { Document } from "@beep/documents-domain";

// RPC client for Document operations using Document.Rpcs
export class DocumentClient extends Effect.Service<DocumentClient>()(
  "@beep/documents-sdk/DocumentClient",
  {
    effect: Effect.gen(function* () {
      const resolver = yield* RpcResolver.RpcResolver;

      // Example: get document
      const get = (id: string) =>
        Effect.gen(function* () {
          // Use Document.Rpcs.get
          const result = yield* resolver(Document.Rpcs.get({ id }));
          return result;
        });

      // Example: create document
      const create = (data: Document.CreatePayload) =>
        Effect.gen(function* () {
          // Use Document.Rpcs.create
          const document = yield* resolver(Document.Rpcs.create(data));
          return document;
        });

      // Example: list documents (streaming)
      const list = (params: Document.ListPayload) =>
        Effect.gen(function* () {
          // Use Document.Rpcs.list (streaming RPC)
          const stream = yield* resolver(Document.Rpcs.list(params));
          return stream;
        });

      return {
        get,
        create,
        list,
        // ... all 12 Document RPC operations
      };
    }),
    dependencies: [RpcResolver.layer]
  }
) {}
```

## Usage Examples

### HTTP Client Setup (Knowledge Pages)

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClient from "@effect/platform/HttpClient";
import { KnowledgePageClient } from "@beep/documents-sdk";

// Use HTTP client for Knowledge Pages
const program = Effect.gen(function* () {
  const client = yield* KnowledgePageClient;
  const page = yield* client.getPage("page-id");
  return page;
});

// Provide HTTP client layer
const runnable = program.pipe(
  Effect.provide(KnowledgePageClient.Default)
);
```

### RPC Client Setup (Documents)

```typescript
import * as Effect from "effect/Effect";
import * as RpcResolver from "@effect/rpc/RpcResolver";
import { DocumentClient } from "@beep/documents-sdk";

// Use RPC client for Documents
const program = Effect.gen(function* () {
  const client = yield* DocumentClient;

  const document = yield* client.create({
    organizationId: "org-123",
    title: "New Document",
    content: "Document content"
  });

  return document;
});

// Provide RPC resolver layer
const runnable = program.pipe(
  Effect.provide(DocumentClient.Default)
);
```

### Document Operations with RPC

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Stream from "effect/Stream";
import * as A from "effect/Array";
import { DocumentClient } from "@beep/documents-sdk";

const listAndArchiveOldDocuments = (organizationId: string) =>
  Effect.gen(function* () {
    const client = yield* DocumentClient;

    // List all documents (streaming RPC)
    const documentsStream = yield* client.list({ organizationId });

    // Collect stream into array
    const documents = yield* Stream.runCollect(documentsStream);

    // Archive old documents
    const archived = yield* F.pipe(
      documents,
      A.filter((doc) => doc.lastModified < oldThreshold),
      A.map((doc) => client.archive({ id: doc.id })),
      Effect.all
    );

    return archived;
  });
```

### Document Search with Streaming

```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as F from "effect/Function";
import { DocumentClient } from "@beep/documents-sdk";

const searchDocuments = (query: string, organizationId: string) =>
  Effect.gen(function* () {
    const client = yield* DocumentClient;

    // Search documents (streaming RPC)
    const searchStream = yield* client.search({
      query,
      organizationId,
      limit: 50
    });

    // Process results as they arrive
    const results = yield* F.pipe(
      searchStream,
      Stream.take(10), // Take first 10 results
      Stream.runCollect
    );

    return results;
  });
```

## Development

```bash
# Type check
bun run --filter @beep/documents-sdk check

# Lint
bun run --filter @beep/documents-sdk lint
bun run --filter @beep/documents-sdk lint:fix

# Build
bun run --filter @beep/documents-sdk build

# Test
bun run --filter @beep/documents-sdk test
bun run --filter @beep/documents-sdk coverage

# Circular dependency check
bun run --filter @beep/documents-sdk lint:circular
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

Validate all external data using domain schemas:

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as HttpClient from "@effect/platform/HttpClient";
import { KnowledgePage } from "@beep/documents-domain";

const fetchPage = (id: string) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const response = yield* httpClient.get(`/api/v1/documents/knowledgePage/get/${id}`);
    const json = yield* response.json;

    // Always decode with domain schemas
    const page = yield* S.decodeUnknown(KnowledgePage.Model)(json);

    return page;
  });
```

### Error Handling

Use tagged errors from domain layer:

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import {
  DocumentNotFoundError,
  KnowledgePageNotFoundError
} from "@beep/documents-domain";

// Error handling with catchTag
const handleDocumentOperation = (id: string) =>
  F.pipe(
    DocumentClient.get(id),
    Effect.catchTag("DocumentNotFoundError", (error) =>
      Effect.fail({ _tag: "NotFound", message: error.message } as const)
    ),
    Effect.catchAll((error) =>
      Effect.fail({ _tag: "UnknownError", cause: error } as const)
    )
  );
```

### Dependency Injection

Use Effect services with proper Layer composition:

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClient from "@effect/platform/HttpClient";
import * as RpcResolver from "@effect/rpc/RpcResolver";

// ✅ REQUIRED - Compose layers
const AppLayer = Layer.mergeAll(
  HttpClient.layer,
  RpcResolver.layer
);

// Use in program
const program = Effect.gen(function* () {
  const httpClient = yield* HttpClient.HttpClient;
  const rpcResolver = yield* RpcResolver.RpcResolver;
  // ... use clients
});

const runnable = program.pipe(Effect.provide(AppLayer));

// ❌ FORBIDDEN - Direct global access
const client = new HttpClient();  // No global clients
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime, Schema, and utilities |
| `@effect/platform` | HTTP client for HttpApi endpoints |
| `@effect/rpc` | RPC client and resolver for RPC contracts |
| `@beep/documents-domain` | Entity models, DomainApi (HTTP), RPC contracts |
| `@beep/documents-infra` | Infrastructure implementations (peer dependency) |
| `@beep/schema` | Shared schema primitives and EntityId |
| `@beep/shared-sdk` | Cross-slice SDK utilities |
| `@beep/shared-domain` | Shared entities (User, Organization) |
| `@beep/errors` | Error logging and telemetry |
| `@beep/utils` | Pure runtime helpers |

## What Belongs Here

- **HTTP client wrappers** for HttpApi endpoints (DomainApi.KnowledgePage.Contract)
- **RPC client wrappers** for RPC contracts (Document.Rpcs, Discussion.Rpcs, Comment.Rpcs)
- **Type-safe request builders** with schema validation
- **Effect-based error handling** aligned with domain error types
- **Layer-based configuration** for HTTP/RPC clients, auth, retry policies
- **Client-side utilities** for streaming, caching, optimistic updates
- **React integration** via atoms and hooks (following `@beep/iam-sdk` pattern)

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

- [ ] **Phase 1**: Define HTTP and RPC client service interfaces and Layer structure
- [ ] **Phase 2**: Implement HTTP client for Knowledge Pages (DomainApi.KnowledgePage.Contract)
- [ ] **Phase 3**: Implement RPC client for Documents (Document.Rpcs - 12 operations)
- [ ] **Phase 4**: Implement RPC clients for Discussions and Comments
- [ ] **Phase 5**: Add streaming support for list/search operations
- [ ] **Phase 6**: React integration with atoms and hooks (following @beep/iam-sdk pattern)
- [ ] **Phase 7**: Error handling, retry policies, and logging
- [ ] **Phase 8**: Optimistic updates and caching layers
- [ ] **Phase 9**: Integration tests with mock HTTP/RPC resolvers

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
