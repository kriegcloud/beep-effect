# @beep/documents-client

**Status: STUB PACKAGE** - Currently exports only `beep` placeholder. Awaiting documents server infrastructure completion.

## Purpose

SDK layer for the documents slice, providing Effect-first client wrappers for document management, knowledge pages, discussions, and file operations. Will bridge client applications (web, CLI) with documents server infrastructure using type-safe Effect-based contracts while maintaining layering boundaries.

Implementation will follow the `@beep/iam-client` pattern once `@beep/documents-server` infrastructure is finalized.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/documents-client": "workspace:*"
```

## Current Exports

```typescript
export const beep = "beep";
```

## Planned Exports

| Export | Description |
|--------|-------------|
| `DocumentService` | Effect Service for document operations |
| `KnowledgePageService` | Effect Service for knowledge page operations |
| `DiscussionService` | Effect Service for discussion operations |
| `FileUploadService` | Effect Service for file upload operations |
| Reactive Atoms | Runtime-backed atoms for React integration (`signInEmailAtom` pattern) |
| Form Helpers | Schema-backed form utilities with validation |

## Implementation Blockers

Before this package can be fully implemented:

1. **Domain Contracts**: Finalize schemas and error types in `@beep/documents-domain`
2. **Server Infrastructure**: Complete server-side routes and handlers in `@beep/documents-server`
3. **Client Adapters**: Implement HTTP/RPC client adapters following `@beep/iam-client` patterns
4. **Service Layer**: Create Effect Services with Layer-based dependency injection
5. **Testing Infrastructure**: Add contract validation tests and integration test fixtures

## Architecture

- **Layer**: SDK layer between domain and UI in the vertical slice pattern
- **Effect-First**: All operations return Effect types with proper error handling
- **Service-Oriented**: Uses Effect Services with Layer-based dependency injection
- **Platform Agnostic**: Works in Bun, browsers, and Node via Effect Platform

## Planned Features

| Feature Area | Operations |
|-------------|-----------|
| **Documents** | CRUD, versioning, metadata management |
| **Knowledge Pages** | Page creation, updates, block management, status transitions |
| **Discussions** | Thread creation, replies, resolution workflows |
| **Comments** | Inline comments, mentions, reactions |
| **File Operations** | Upload initiation, signed URLs, progress tracking, EXIF extraction |
| **React Integration** | Runtime-backed atoms and hooks for optimistic updates |

## Expected API Pattern

Following `@beep/iam-client`, this package will implement:

### Runtime-Backed Atoms

```typescript
"use client";
import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { withToast } from "@beep/ui/common";
import * as F from "effect/Function";
import * as O from "effect/Option";

const documentRuntime = makeAtomRuntime(DocumentService.Live);

const createDocumentToastOptions = {
  onWaiting: "Creating document...",
  onSuccess: "Document created successfully",
  onFailure: O.match({
    onNone: () => "Failed with unknown error.",
    onSome: (err) => err.message
  }),
} as const;

export const createDocumentAtom = documentRuntime.fn(
  F.flow(DocumentService.CreateDocument, withToast(createDocumentToastOptions))
);
```

### React Hooks

```typescript
"use client";
import { useAtomSet } from "@effect-atom/atom-react";

export const useDocuments = () => {
  const createDocument = useAtomSet(createDocumentAtom);
  const getDocument = useAtomSet(getDocumentAtom);

  return {
    createDocument,
    getDocument,
  };
};
```

## Usage

### In React Components

```typescript
"use client";
import { useDocuments } from "@beep/documents-client";

export function CreateDocumentButton() {
  const { createDocument } = useDocuments();

  const handleCreate = () => {
    createDocument({
      organizationId: "org-123",
      title: "New Document",
      content: "",
    });
  };

  return (
    <button onClick={handleCreate}>
      Create Document
    </button>
  );
}
```

### In Server-Side Effects

```typescript
import * as Effect from "effect/Effect";
import { DocumentService } from "@beep/documents-client";

const program = Effect.gen(function* () {
  const service = yield* DocumentService;

  const document = yield* service.CreateDocument({
    organizationId: "org-123",
    title: "Server Document",
    content: "Created from server",
  });

  return document;
}).pipe(Effect.provide(DocumentService.Live));
```

### Error Handling

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { DocumentService } from "@beep/documents-client";

const safeGetDocument = (id: string) =>
  F.pipe(
    Effect.gen(function* () {
      const service = yield* DocumentService;
      return yield* service.GetDocument({ id });
    }),
    Effect.catchTag("DocumentNotFoundError", () =>
      Effect.succeed(null)
    ),
    Effect.provide(DocumentService.Live)
  );
```

## Development

```bash
# Type check
bun run --filter @beep/documents-client check

# Lint and format
bun run --filter @beep/documents-client lint
bun run --filter @beep/documents-client lint:fix

# Build (ESM + CJS with annotations)
bun run --filter @beep/documents-client build

# Test
bun run --filter @beep/documents-client test
bun run --filter @beep/documents-client coverage

# Circular dependency check
bun run --filter @beep/documents-client lint:circular
```

## Implementation Guidelines

When implementing this package:

### Follow IAM Client Pattern

Study `@beep/iam-client` for the authoritative implementation pattern:
- Contract definitions in `*.contracts.ts` files
- Handlers in `*.implementations.ts` files
- Services in `*.service.ts` files
- Atoms in `*.atoms.ts` files
- Forms in `*.forms.ts` files (if needed)

### Effect Patterns Required

```typescript
// ✅ REQUIRED - Namespace imports and Effect utilities
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as O from "effect/Option";

// Use pipe for transformations
const names = F.pipe(items, A.map((item) => item.name));
const upper = F.pipe(str, Str.toUpperCase);

// ❌ FORBIDDEN - Native methods
const badNames = items.map(item => item.name);  // Wrong!
const badUpper = str.toUpperCase();             // Wrong!
```

### Contract Structure

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as BS from "@beep/schema";
import { Contract } from "@beep/shared-domain";

// 1. Payload class with default form values
export class CreateDocumentPayload extends S.Class<CreateDocumentPayload>("CreateDocumentPayload")({
  title: S.String,
  content: S.String,
}, [
  { [BS.DefaultFormValuesAnnotationId]: { title: "", content: "" } }
]) {}

// 2. Contract definition
export const CreateDocumentContract = Contract.make("CreateDocument", {
  description: "Creates a new document",
  failure: DocumentsClientError,
  success: Document.Model,
}).setPayload(CreateDocumentPayload);

// 3. Handler implementation
export const CreateDocumentHandler = CreateDocumentContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const encoded = yield* CreateDocumentContract.encodePayload(payload);
    const result = yield* continuation.run((handlers) =>
      client.documents.create({ ...encoded, fetchOptions: withFetchOptions(handlers) })
    );
    yield* continuation.raiseResult(result);
  })
);
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime, Schema, and utilities |
| `@beep/documents-domain` | Entity models, value objects, domain errors |
| `@beep/documents-server` | Server infrastructure (peer dependency) |
| `@beep/shared-domain` | Shared entities (User, Organization, Policy) |
| `@beep/shared-client` | Cross-slice CLIENT utilities (atoms, toast wrappers) |
| `@beep/shared-env` | Environment configuration |
| `@beep/schema` | Shared schema primitives and EntityId |
| `@beep/errors` | Error logging and telemetry |
| `@beep/utils` | Pure runtime helpers (noOp, nullOp, etc.) |
| `@beep/constants` | Schema-backed enums and constants |
| `@beep/identity` | Package identity utilities |
| `@beep/invariant` | Assertion contracts |

## Module Structure

Following `@beep/iam-client`, organize by feature area:

```
src/
├── adapters/              # Better-auth or other client adapters
│   └── index.ts
├── clients/
│   ├── document/
│   │   ├── document.contracts.ts
│   │   ├── document.implementations.ts
│   │   ├── document.service.ts
│   │   ├── document.atoms.ts
│   │   ├── document.forms.ts
│   │   └── index.ts
│   ├── knowledge-page/    # Similar structure
│   ├── discussion/        # Similar structure
│   ├── file-upload/       # Similar structure
│   └── _internal/         # Shared helpers (withFetchOptions, etc.)
├── errors.ts              # DocumentsClientError
└── index.ts               # Public API surface
```

## Boundaries

**Belongs Here**:
- Contract definitions and implementations
- Effect Services with Layer-based DI
- Runtime-backed atoms for React
- Form helpers with schema validation
- HTTP/RPC client adapters

**Does NOT Belong Here**:
- Server infrastructure (`@beep/documents-server`)
- UI components (`@beep/documents-ui`)
- Business logic (`@beep/documents-domain`)
- Database schemas (`@beep/documents-tables`)

## Related Packages

- **`@beep/iam-client`** - Reference implementation for SDK layer patterns
- **`@beep/documents-domain`** - Entity models, value objects, domain errors
- **`@beep/documents-server`** - Server-side infrastructure
- **`@beep/documents-ui`** - React UI components
- **Root AGENTS.md** - Effect patterns and monorepo conventions

## Notes

- This package currently only exports a placeholder (`beep`)
- Study `@beep/iam-client` structure before adding new features
- All client operations must go through Effect Services and Layers
- Atoms must use `makeAtomRuntime` from `@beep/runtime-client`
- Follow the continuation pattern in contract implementations (see IAM client examples)
