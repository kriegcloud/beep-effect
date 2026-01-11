# @beep/shared-client

Client-facing CLIENT layer for cross-cutting concerns, providing RPC infrastructure, file management state, and browser utilities.

## Purpose

`@beep/shared-client` provides Effect-first client infrastructure that spans multiple slices, enabling typed communication between frontend clients and backend services. This package bridges server contracts with browser-based state management.

Key responsibilities:
- **RPC Client Infrastructure**: WebSocket-based Effect RPC client with error logging, retry policies, and connection management
- **File Management State**: Jotai atoms for file/folder operations, uploads, and selection state
- **Client Services**: Effect services for files API, image compression, and upload coordination
- **Browser Utilities**: Location/hash atoms for URL-based routing and navigation

Unlike slice-specific CLIENTs (`@beep/iam-client`, `@beep/documents-client`), this package houses cross-cutting client infrastructure used by multiple domains.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-client": "workspace:*"
```

## Key Exports

### RPC Infrastructure

| Export | Description |
|--------|-------------|
| `addRpcErrorLogging` | Higher-order function that wraps RPC clients with Effect error logging |
| `RpcConfigLive` | Layer providing WebSocket RPC client with retry policies |

### Client Services

| Export | Description |
|--------|-------------|
| `FilesApi.Service` | Effect service wrapping shared files RPC methods (list, upload, delete, create, move) |
| `FilesRpcClient.Service` | Low-level RPC client for shared file operations |
| `FilesEventStream.Service` | Server-sent events stream for file change notifications |
| `ImageCompressionClient.Service` | Client-side image compression service |
| `Upload.*` | Upload service, errors, and utilities |

### File Management Atoms (Jotai)

| Export | Description |
|--------|-------------|
| `filesAtom` | Writable atom managing files and folders cache with optimistic updates |
| `selectedFiles.atom` | Atom tracking selected file/folder IDs |
| `activeUploads.atom` | Atom tracking in-progress uploads with progress state |
| `startUpload.atom` | Write-only atom to initiate file uploads |
| `cancelUpload.atom` | Write-only atom to cancel uploads |
| `deleteFiles.atom` | Write-only atom to delete files/folders |
| `moveFiles.atom` | Write-only atom to move files between folders |
| `createFolderAtom` | Write-only atom to create folders |
| `toggleFileSelection.atom` | Write-only atom to toggle file selection |
| `toggleFolderSelection.atom` | Write-only atom to toggle folder selection |
| `clearSelection.atom` | Write-only atom to clear all selections |
| `filesEventStream.atom` | Atom managing SSE connection for file events |

### Browser Utilities

| Export | Description |
|--------|-------------|
| `hashAtom` | Jotai atom tracking URL hash changes (`Option<string>`) |

### When to Use This Package

Use `@beep/shared-client` when:
- Building RPC clients for cross-slice operations
- Managing file/folder state in browser applications
- Implementing upload workflows with progress tracking
- Subscribing to server-sent file change events
- Tracking browser location state with Effect types

Do NOT use for:
- Slice-specific contracts (use `@beep/iam-client`, `@beep/documents-client`, etc.)
- Server-side utilities (use `@beep/shared-server` instead)
- UI components (use `@beep/shared-ui` instead)
- Non-shared file operations (use slice-specific packages)

## Usage

### RPC Client Configuration

```typescript
import { RpcConfigLive, addRpcErrorLogging } from "@beep/shared-client/constructors";
import { SharedRpcs } from "@beep/shared-domain";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as F from "effect/Function";

// Create RPC client with error logging
const program = Effect.gen(function* () {
  const rpc = F.pipe(
    SharedRpcs.V1.Rpcs,
    RpcClient.make,
    addRpcErrorLogging
  );

  // Use RPC methods
  const result = yield* rpc.files_list();
  return result;
}).pipe(Effect.provide(RpcConfigLive));
```

### Using Client Services

```typescript
import { FilesApi } from "@beep/shared-client/atom/services";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const api = yield* FilesApi.Service;

  // List files
  const files = yield* api.list();

  // Create folder
  yield* api.createFolder({ name: "My Folder", parentId: null });

  // Upload file
  const upload = yield* api.initiateUpload({
    fileName: "document.pdf",
    fileSize: 1024000,
    folderId: null,
  });

  return upload;
});
```

### File Management with Jotai Atoms

```typescript
import { filesAtom, startUpload, deleteFiles } from "@beep/shared-client/atom/files";
import { useAtom, useSetAtom }from "@effect-atom/atom-react";
import * as Match from "effect/Match";

function FileManager() {
  const [filesResult] = useAtom(filesAtom);
  const startUploadFn = useSetAtom(startUpload.atom);
  const deleteFilesFn = useSetAtom(deleteFiles.atom);

  return Match.value(filesResult).pipe(
    Match.tag("Loading", () => <div>Loading...</div>),
    Match.tag("Success", (result) => (
      <div>
        <button onClick={() => startUploadFn({ files: [] })}>
          Upload Files
        </button>
        <ul>
          {result.value.rootFiles.map((file) => (
            <li key={file.id}>
              {file.fileName}
              <button onClick={() => deleteFilesFn({ fileIds: [file.id] })}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    )),
    Match.tag("Error", (error) => <div>Error: {error.message}</div>),
    Match.exhaustive
  );
}
```

### Browser Location Tracking

```typescript
import { hashAtom } from "@beep/shared-client/atom";
import { useAtomValue }from "@effect-atom/atom-react";
import * as O from "effect/Option";
import * as F from "effect/Function";

function LocationTracker() {
  const hash = useAtomValue(hashAtom);

  return F.pipe(
    hash,
    O.match({
      onNone: () => <div>No hash</div>,
      onSome: (h) => <div>Current hash: {h}</div>,
    })
  );
}
```

### Effect Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as Context from "effect/Context";

// Single-letter aliases for frequently used modules
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Match from "effect/Match";
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-domain` | Cross-slice entities (File, Folder) and SharedRpcs contract definitions |
| `@beep/shared-env` | Client environment configuration (API URLs, WebSocket endpoints) |
| `@beep/runtime-client` | Client ManagedRuntime for Effect execution in browser |
| `@beep/schema` | EntityId factories and schema utilities |
| `@beep/utils` | Pure runtime helpers (thunk, predicates) |
| `@beep/identity` | Package identity for service tagging |
| `@beep/errors` | Error types (BeepError) for file operations |
| `effect` | Core Effect runtime |
| `@effect/rpc` | RPC client infrastructure |
| `@effect/platform-browser` | Browser-specific platform services (WebSocket) |
| `@effect-atom/atom-react` | Jotai integration with Effect for reactive state |

## Integration

### With Feature Slices
- `@beep/iam-client` — IAM-specific contracts and state management
- `@beep/documents-client` — Documents-specific contracts and state management
- This package provides shared file operations used across slices

### With Shared Packages
- `@beep/shared-domain` — Consumes SharedRpcs contract definitions for RPC communication
- `@beep/shared-env` — Uses ClientEnv for API URL configuration
- `@beep/shared-server` — Communicates with server RPCs via WebSocket

### With Runtime
- `@beep/runtime-client` — Executes Effect programs in browser context
- Jotai atoms integrate with client runtime for reactive state management
- Services use client runtime layers for dependency injection

### With Applications
- `apps/web` — Consumes file management atoms and client services
- React components use Jotai hooks to access file state and trigger operations

## Development

```bash
# Type check
bun run --filter @beep/shared-client check

# Lint
bun run --filter @beep/shared-client lint
bun run --filter @beep/shared-client lint:fix

# Build
bun run --filter @beep/shared-client build

# Test
bun run --filter @beep/shared-client test
bun run --filter @beep/shared-client coverage

# Circular dependency check
bun run --filter @beep/shared-client lint:circular
```

## Notes

### Architecture Patterns

**RPC Error Logging**
- `addRpcErrorLogging` wraps all RPC methods and streams with error telemetry
- Automatically logs RPC failures with method path (e.g., `[RPC]: files.list failed`)
- Preserves Effect and Stream semantics while adding observability

**Jotai Atom Design**
- File atoms use optimistic updates for immediate UI feedback
- Write-only atoms trigger side effects (uploads, deletes) and update cache
- Remote atoms stream data from server via Effect RPCs
- Atoms mount event stream subscriptions for real-time file changes

**Service Composition**
- Services use `Effect.Service` pattern for dependency injection
- Layers compose RPC client, HTTP client, and configuration
- Thunked services prevent re-initialization on repeated access

### Development Guidelines

When extending this package:
- Keep all APIs Effect-first (no async/await)
- Use Effect collection utilities (`A.map`, `A.filter`) instead of native array methods
- Use Effect string utilities (`Str.split`, `Str.trim`) instead of native string methods
- Use `effect/Match` for pattern matching instead of switch statements
- Use `effect/Predicate` for type guards instead of typeof/instanceof
- Use `effect/DateTime` instead of native Date objects
- Jotai atoms should integrate with `@beep/runtime-client` for Effect execution
- Add tests under `packages/shared/client/test/` using `@beep/testkit`
- Document new utilities in both README and AGENTS.md

### Type Safety
- No `any`, `@ts-ignore`, or unchecked casts
- Validate external data with `effect/Schema`
- Use branded types from `@beep/schema` for identifiers (FileId, FolderId)
- Use `Option<T>` for nullable values (hash, folderId)
- Use `Result<T>` from `@effect-atom/atom-react` for async state

### Observability
- Use `Effect.log*` with structured objects for logging
- RPC errors automatically logged via `addRpcErrorLogging`
- Add span annotations for tracing via `@effect/opentelemetry`
- Include method path in all RPC error logs

### Browser Compatibility
- Maintain browser-safe dependencies (no Node.js-only imports)
- Use `@effect/platform-browser` for browser-specific services
- Check for `window` and `location` availability before accessing
- Handle SSR gracefully (atoms return `Option.none()` when server-rendered)

### State Management
- File cache managed via `filesAtom` with optimistic updates
- Event stream syncs server changes to local cache
- Selection state isolated in `selectedFiles.atom`
- Upload state tracked separately in `activeUploads.atom`

### Contributor Checklist
- [ ] Verify new additions are truly cross-cutting (not slice-specific)
- [ ] Keep browser-safe dependencies (check for Node.js-only imports)
- [ ] Use Effect namespace imports and collection/string helpers
- [ ] Follow `effect/Schema` uppercase constructors: `S.Struct`, `S.Array`, `S.String`
- [ ] Add tests for all new utilities using `@beep/testkit`
- [ ] Document new exports and patterns in this README
- [ ] Run lint + check before commits; run build/tests when modifying exports
- [ ] Update AGENTS.md for package-specific authoring guardrails
- [ ] Coordinate with slice CLIENT maintainers to avoid duplication
- [ ] Ensure atoms handle SSR gracefully
- [ ] Verify RPC methods have proper error logging
