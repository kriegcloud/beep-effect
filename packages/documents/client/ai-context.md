---
path: packages/documents/client
summary: Effect-first client SDK for documents slice - HTTP/RPC wrappers (stub, planned implementation)
tags: [documents, client, effect, sdk, http, rpc]
---

# @beep/documents-client

Client SDK providing Effect-first wrappers for the documents slice. Currently a stub awaiting server API completion. Will expose type-safe HTTP clients for document CRUD, discussions, comments, and file operations with injectable network configuration.

## Architecture (Planned)

```
|-------------------|     |-------------------|     |-------------------|
|  DocumentsClient  | --> |   RPC Contracts   | --> | @beep/documents-  |
|-------------------|     |-------------------|     |     domain        |
| getDocument       |     | Document.rpc      |     |-------------------|
| createDocument    |     | Discussion.rpc    |
| listDocuments     |     | Comment.rpc       |
| updateDocument    |     |-------------------|
| deleteDocument    |
|-------------------|
        |
        v
|-------------------|
|   HttpClient      |
|   (injected)      |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/index.ts` | Stub export (placeholder) |

## Usage Patterns (Planned)

### Service-Based Client

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClient from "@effect/platform/HttpClient";
import { DocumentsClient } from "@beep/documents-client";

// Provide HTTP client layer
const program = Effect.gen(function* () {
  const client = yield* DocumentsClient;
  const doc = yield* client.getDocument("doc_123");
  return doc;
}).pipe(
  Effect.provide(DocumentsClient.Default),
  Effect.provide(HttpClient.layer)
);
```

### Layer Composition in Runtime

```typescript
import * as Layer from "effect/Layer";
import { DocumentsClient } from "@beep/documents-client";
import { ConfigLayer } from "@beep/runtime-client";

const ClientLayer = Layer.mergeAll(
  ConfigLayer,
  DocumentsClient.Default
);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect.Service pattern | Consistent DI with other slices via Layer composition |
| Schema imports from domain | Prevents drift between client and server types |
| Injectable HttpClient | Supports Bun, browser, and test environments |
| Cursor-based pagination | Prevents unbounded list fetches |

## Dependencies

**Internal**: (planned) `@beep/documents-domain`, `@beep/schema`

**External**: `effect`

## Related

- **AGENTS.md** - Detailed contributor guidance and gotchas
- **@beep/documents-domain** - Domain schemas for type-safe contracts
- **@beep/documents-server** - Server handlers this client will consume
- **@beep/runtime-client** - Runtime composition patterns
