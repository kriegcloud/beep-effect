# @beep/shared-client — AGENTS Guide

## Purpose & Fit

- Provides shared CLIENT (client-server glue) infrastructure for cross-cutting concerns consumed by applications and feature slices.
- Houses RPC client infrastructure, file management state (Jotai atoms), ReCaptcha integration, and browser utilities that span multiple domains.
- Maintains clean separation between slice-specific CLIENTs (`@beep/iam-client`, `@beep/documents-client`) and shared client infrastructure.
- Bridges server contracts (from `@beep/shared-domain`) with browser-based state management and Effect runtime.

## Surface Map

### RPC Infrastructure (`src/constructors/`)
- **`RpcClient.ts`** — WebSocket-based Effect RPC client with error logging, retry policies, and connection management
- Exports `addRpcErrorLogging` (higher-order function) and `RpcConfigLive` (Layer)

### File Management State (`src/atom/files/`)
- **`atoms/files.atom.ts`** — Writable atom managing files/folders cache with optimistic updates
- **`atoms/selectedFiles.atom.ts`** — Selected file/folder IDs tracking
- **`atoms/activeUploads.atom.ts`** — In-progress upload state with progress tracking
- **`atoms/startUpload.atom.ts`** — Write-only atom to initiate file uploads
- **`atoms/cancelUpload.atom.ts`** — Write-only atom to cancel uploads
- **`atoms/deleteFiles.atom.ts`** — Write-only atom to delete files/folders
- **`atoms/moveFiles.atom.ts`** — Write-only atom to move files between folders
- **`atoms/createFolderAtom.ts`** — Create new folders
- **`atoms/filesEventStream.atom.ts`** — Atom managing SSE connection for file events
- **`atoms/toggleFileSelection.atom.ts`** — Toggle individual file selection
- **`atoms/toggleFolderSelection.atom.ts`** — Toggle folder selection with children
- **`atoms/clearSelection.atom.ts`** — Clear all selections
- **`atoms/event-stream.atom.tsx`** — Low-level event stream connection management
- **`atoms/upload.atom.ts`** — Upload processing and state management
- **`types.ts`** — Shared type definitions for file operations
- **`runtime.ts`** — Atom runtime configuration for Effect execution
- **`errors.ts`** — File operation error definitions
- **`constants.ts`** — Constants for file operations
- **`services/`** — File-specific services (FileCompletionSignals, FileSync, FilePicker)

### Client Services (`src/atom/services/`)
- **`FilesApi.service.ts`** — Effect service wrapping shared files RPC methods (list, upload, delete, create, move)
- **`FilesRpcClient.service.ts`** — Low-level RPC client for shared file operations
- **`FilesEventStream.service.ts`** — Server-sent events stream for file change notifications
- **`ImageCompressionClient.service.ts`** — Client-side image compression service
- **`Upload/`** — Upload service, errors, and utilities

### ReCaptcha Integration (`src/services/react-recaptcha-v3/`)
- **`ReCaptchaService.ts`** — Effect-based ReCaptcha v3 service with proper dependency injection
- **`recaptcha.atoms.ts`** — Jotai atoms for ReCaptcha state management
- **`useReCaptchaAtom.ts`** — React hooks for ReCaptcha integration
- **`ReCaptcha.tsx`** — React component for ReCaptcha rendering
- **`schemas.ts`** — ReCaptcha configuration schemas
- **`errors.ts`** — ReCaptcha error definitions
- **`guards.ts`** — Type guards and window globals management
- **`manager.ts`** — Effect-first ReCaptcha manager functions
- **`utils.ts`** — Utility functions for script loading and random generation

### Browser Utilities (`src/atom/`)
- **`location.atom.ts`** — Jotai atom tracking URL hash changes (`Option<string>`)
- **`captcha.atom.ts`** — Captcha-related atom (placeholder)

### Core (`src/`)
- **`client.ts`** — Client-side SDK utilities documentation
- **`index.ts`** — Barrel export (currently empty, relies on subpath exports)

## Package Status

This package has evolved beyond its initial placeholder status and now provides production-ready client infrastructure:

**Implemented**:
- WebSocket-based RPC client with error logging and retry policies
- File management state (Jotai atoms) with optimistic updates
- Client services for files API, image compression, and uploads
- Browser utilities (location tracking)
- SSE event stream integration
- ReCaptcha v3 integration with Effect-based service and React hooks

**Future additions** may include:
- Shared query/mutation hooks for TanStack Query
- Additional cross-slice client observability utilities
- Client-side caching strategies

## Usage Patterns

### RPC Client Configuration

```typescript
import { RpcConfigLive, addRpcErrorLogging } from "@beep/shared-client/constructors";
import { SharedRpcs } from "@beep/shared-domain";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const program = Effect.gen(function* () {
  const rpc = F.pipe(
    SharedRpcs.V1.Rpcs,
    RpcClient.make,
    addRpcErrorLogging
  );

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

  return files;
});
```

### File Management with Jotai Atoms

```typescript
import { filesAtom, startUpload, deleteFiles } from "@beep/shared-client/atom/files";
import { useAtom, useSetAtom } from "@effect-atom/atom-react";
import * as Match from "effect/Match";

function FileManager() {
  const [filesResult] = useAtom(filesAtom);
  const startUploadFn = useSetAtom(startUpload.atom);
  const deleteFilesFn = useSetAtom(deleteFiles.atom);

  return Match.value(filesResult).pipe(
    Match.tag("Loading", () => <div>Loading...</div>),
    Match.tag("Success", (result) => (
      <div>
        <button onClick={() => startUploadFn({ files: [] })}>Upload</button>
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
import { useAtomValue } from "@effect-atom/atom-react";
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

### ReCaptcha Integration

```typescript
import { useReCaptchaAtom } from "@beep/shared-client/services/react-recaptcha-v3";
import * as Effect from "effect/Effect";

function LoginForm() {
  const { executeRecaptcha, isReady } = useReCaptchaAtom({
    reCaptchaKey: "your-site-key",
  });

  const handleSubmit = () => {
    if (!isReady) return;

    Effect.gen(function* () {
      const token = yield* Effect.promise(() => executeRecaptcha("login"));
      // Use token for verification
    }).pipe(Effect.runPromise);
  };

  return <button onClick={handleSubmit} disabled={!isReady}>Login</button>;
}
```

## Integration Points

### With Feature Slices
- `@beep/iam-client` — IAM-specific contracts remain in `packages/iam/client`
- `@beep/documents-client` — Documents-specific contracts remain in `packages/documents/client`
- This package is for cross-slice client infrastructure only

### With Runtime
- `@beep/runtime-client` — Client ManagedRuntime for browser Effect execution
- Jotai atoms integrate with client runtime for reactive state management
- Services use client runtime layers for dependency injection

### With Applications
- `apps/web` — Consumes file management atoms and client services
- React components use Jotai hooks to access file state and trigger operations

## Dependencies

**Official peer dependencies** (from `package.json`):

| Package | Purpose |
|---------|---------|
| `@beep/shared-domain` | Shared entity models (File, Folder) and SharedRpcs contract definitions |
| `@beep/runtime-client` | Client ManagedRuntime for Effect execution in browser |
| `@beep/schema` | Effect Schema utilities and EntityId factories |
| `@beep/utils` | Pure runtime helpers (thunk, predicates) |
| `@beep/identity` | Package identity for service tagging |
| `@beep/shared-env` | Client environment configuration (API URLs, WebSocket endpoints) |
| `effect` | Effect runtime |

**Additional dependencies used in code** (not in package.json):
- `@beep/errors` — Used for `BeepError` in `src/atom/files/atoms/upload.atom.ts`
- `@effect/rpc` — RPC client infrastructure
- `@effect/platform-browser` — Browser-specific platform services
- `@effect-atom/atom-react` — Jotai integration with Effect

**Note**: Some imports like `@beep/errors` are used but not declared as peer dependencies, which may indicate missing dependency declarations or reliance on workspace dependency hoisting.

## Authoring Guardrails

- **CRITICAL: Effect-first imports**: ALWAYS use namespace imports (`import * as Effect from "effect/Effect"`, `import * as A from "effect/Array"`, etc.). NEVER use native array/string methods—route ALL operations through Effect utilities.
- **PascalCase Schema constructors**: ALWAYS use `S.Struct`, `S.Array`, `S.String`, `S.Number` (NOT lowercase `S.struct`, `S.array`).
- Only add truly cross-cutting client concerns to this package (not slice-specific features)
- Keep slice-specific CLIENT contracts in their respective packages (`@beep/iam-client`, `@beep/documents-client`)
- Follow Effect-first patterns (no async/await in contracts)
- Use `Effect.Service` for client service definitions
- Export Layers for dependency injection
- Maintain browser-safe dependencies (no Node.js-only imports)
- Jotai atoms should integrate with `@beep/runtime-client` for Effect execution
- Use `effect/Match` for pattern matching instead of switch statements
- Use `effect/Predicate` for type guards instead of typeof/instanceof
- Use `effect/DateTime` instead of native Date objects

## Verifications

- `bun run check --filter @beep/shared-client` — Type check
- `bun run lint --filter @beep/shared-client` — Biome lint
- `bun run test --filter @beep/shared-client` — Bun test suite
- `bun run build --filter @beep/shared-client` — Build ESM/CJS artifacts

## Gotchas

### Cross-Cutting vs Slice-Specific Boundary
- **Symptom**: Functionality duplicated between this package and slice-specific clients (`@beep/iam-client`, `@beep/documents-client`).
- **Root Cause**: Unclear whether a concern is truly cross-cutting or belongs in a vertical slice.
- **Solution**: A concern belongs here ONLY if it is used by 2+ slices AND does not depend on slice-specific domain types. Authentication helpers belong in `@beep/iam-client`; document-specific clients belong in `@beep/documents-client`.

### Browser-Only Dependencies Leaking to Server
- **Symptom**: Build errors or runtime crashes when importing this package on server side.
- **Root Cause**: Package contains browser-only APIs (DOM, IndexedDB, localStorage) that server bundles try to include.
- **Solution**: Use `"use client"` directive on React-specific exports. For Effect services, provide mock/no-op implementations via conditional layers. Test imports in both browser and Node contexts.

### Circular Dependencies with Slice Clients
- **Symptom**: Import errors or undefined exports when slice clients import from shared-client or vice versa.
- **Root Cause**: Shared client depends on slice types, and slice clients depend on shared infrastructure.
- **Solution**: Shared-client MUST NOT import from slice clients. If shared functionality needs slice types, define interfaces in `@beep/shared-domain` and implement in slices. Run `bun run lint:circular` to detect.

### Layer Composition Order
- **Symptom**: Runtime errors about missing services when composing shared client layers with slice layers.
- **Root Cause**: Layer dependencies not provided in correct order; shared layers may depend on slice layers or vice versa.
- **Solution**: Document layer dependency order explicitly. Shared client layers should be "lower" in the stack (provided first). Use `Layer.provideMerge` for composition and test layer construction in isolation.

### TanStack Query Key Collisions
- **Symptom**: Stale data or unexpected cache invalidation when multiple slices use shared query utilities.
- **Root Cause**: Query keys from different slices collide in the shared query cache.
- **Solution**: Shared query utilities MUST namespace query keys with slice identifiers. Use factory functions that prepend slice names to keys (e.g., `["shared", "iam", "session"]` vs `["shared", "documents", "list"]`).

### ReCaptcha Script Loading Race Conditions
- **Symptom**: ReCaptcha execution fails with "not found" or "not ready" errors intermittently.
- **Root Cause**: Multiple components try to initialize ReCaptcha simultaneously, or script hasn't fully loaded before execution attempt.
- **Solution**: Use the `ReCaptchaService` singleton pattern or the `useReCaptchaAtom` hook which handles initialization and ready state internally. Always check `isReady` before calling `executeRecaptcha`.

## Contributor Checklist

- [ ] Verify new additions are truly cross-cutting (not slice-specific)
- [ ] Keep browser-safe dependencies (check for Node.js-only imports)
- [ ] Use Effect namespace imports and collection/string helpers (no native methods)
- [ ] Follow `effect/Schema` uppercase constructors: `S.Struct`, `S.Array`, `S.String`
- [ ] Follow Effect Service pattern for client services
- [ ] Export Layers for runtime composition
- [ ] Add tests under `test/` using `@beep/testkit`
- [ ] Update this AGENTS.md when adding significant functionality
- [ ] Coordinate with slice CLIENT maintainers to avoid duplication
- [ ] Ensure atoms handle SSR gracefully (return `Option.none()` when server-rendered)
- [ ] Verify RPC methods have proper error logging via `addRpcErrorLogging`
- [ ] Run `bun run lint:fix` before committing
- [ ] Run `bun run check` and `bun run test` to verify changes

## Known Issues

- `@beep/errors` is imported in `src/atom/files/atoms/upload.atom.ts` but not declared in `package.json` peer dependencies
- This may cause build issues if not resolved via workspace dependency hoisting
