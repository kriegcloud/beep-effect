---
path: packages/shared/client
summary: Cross-slice client infrastructure - RPC client, file state atoms, ReCaptcha, browser utilities
tags: [client, rpc, jotai, atoms, recaptcha, files, browser, effect]
---

# @beep/shared-client

Cross-slice client-side infrastructure bridging server contracts with browser state management. Provides WebSocket RPC client, file management atoms with optimistic updates, ReCaptcha v3 integration, and browser utilities for Effect-based applications.

## Architecture

```
|------------------------|     |------------------------|
|   apps/* (React)       | --> |  @beep/shared-client   |
|------------------------|     |------------------------|
                                       |
         |---------------|-------------|---------------|
         v               v             v               v
|---------------|  |-----------|  |----------|  |--------------|
| RPC Client    |  | File Atoms|  | ReCaptcha|  | Browser Utils|
| (WebSocket)   |  | (Jotai)   |  | (Effect) |  | (Location)   |
|---------------|  |-----------|  |----------|  |--------------|
         |               |
         v               v
|------------------------|     |------------------------|
| @beep/shared-domain    |     | @beep/runtime-client   |
| (RPC contracts)        |     | (ManagedRuntime)       |
|------------------------|     |------------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/constructors/RpcClient.ts` | WebSocket RPC client with error logging, retry policies, NDJSON serialization |
| `src/atom/files/` | Jotai atoms for file/folder state with optimistic updates, selection, uploads |
| `src/atom/services/FilesApi.service.ts` | Effect service wrapping file RPC methods (list, upload, delete, move) |
| `src/atom/services/FilesRpcClient.service.ts` | Low-level RPC client for file operations |
| `src/atom/services/FilesEventStream.service.ts` | SSE stream for real-time file change notifications |
| `src/atom/services/ImageCompressionClient.service.ts` | Client-side image compression before upload |
| `src/services/react-recaptcha-v3/` | Effect-based ReCaptcha v3 with React hooks and state management |
| `src/atom/location.atom.ts` | URL hash tracking atom returning `Option<string>` |

## Usage Patterns

### RPC Client with Error Logging

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as RpcClient from "@effect/rpc/RpcClient";
import { RpcConfigLive, addRpcErrorLogging } from "@beep/shared-client/constructors";
import { SharedRpcs } from "@beep/shared-domain";

const program = Effect.gen(function* () {
  const rpc = F.pipe(
    SharedRpcs.V1.Rpcs,
    RpcClient.make,
    addRpcErrorLogging
  );
  const files = yield* rpc.files_list();
  return files;
}).pipe(Effect.provide(RpcConfigLive));
```

### File Management Atoms

```typescript
import * as Match from "effect/Match";
import { useAtom, useSetAtom } from "@effect-atom/atom-react";
import { filesAtom, startUpload, deleteFiles } from "@beep/shared-client/atom/files";

function FileManager() {
  const [filesResult] = useAtom(filesAtom);
  const startUploadFn = useSetAtom(startUpload.atom);
  const deleteFilesFn = useSetAtom(deleteFiles.atom);

  return Match.value(filesResult).pipe(
    Match.tag("Loading", () => <div>Loading...</div>),
    Match.tag("Success", ({ value }) => (
      <ul>
        {value.rootFiles.map((file) => (
          <li key={file.id}>{file.fileName}</li>
        ))}
      </ul>
    )),
    Match.tag("Error", ({ message }) => <div>Error: {message}</div>),
    Match.exhaustive
  );
}
```

### Effect Service Pattern

```typescript
import * as Effect from "effect/Effect";
import { FilesApi } from "@beep/shared-client/atom/services";

const program = Effect.gen(function* () {
  const api = yield* FilesApi.Service;
  const files = yield* api.list();
  yield* api.CreateFolder({ name: "New Folder", parentId: null });
  return files;
});
```

### ReCaptcha Integration

```typescript
import * as Effect from "effect/Effect";
import { useReCaptchaAtom } from "@beep/shared-client/services/react-recaptcha-v3";

function LoginForm() {
  const { executeRecaptcha, isReady } = useReCaptchaAtom({
    reCaptchaKey: "your-site-key",
  });

  const handleSubmit = () => {
    if (!isReady) return;
    Effect.gen(function* () {
      const token = yield* Effect.promise(() => executeRecaptcha("login"));
      // Use token for server verification
    }).pipe(Effect.runPromise);
  };

  return <button onClick={handleSubmit} disabled={!isReady}>Login</button>;
}
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| WebSocket RPC over HTTP | Persistent connection enables streaming, lower latency, automatic reconnection |
| Jotai atoms for file state | Reactive updates, optimistic UI, integrates with Effect runtime |
| Cross-slice boundary | Only infrastructure used by 2+ slices; slice-specific logic stays in slice clients |
| Browser-only guards | Atoms return `Option.none()` during SSR to prevent hydration mismatches |
| Effect services over raw RPC | Dependency injection, testability, composable error handling |
| ReCaptcha as Effect service | Proper lifecycle management, type-safe errors, browser callback handling |

## Dependencies

**Internal**:
- `@beep/shared-domain` - RPC contracts, File/Folder entity models
- `@beep/runtime-client` - ManagedRuntime for browser Effect execution
- `@beep/shared-env` - API URLs, WebSocket endpoints
- `@beep/schema` - Effect Schema utilities
- `@beep/utils` - Thunk helpers
- `@beep/identity` - Service tagging
- `@beep/errors` - Error base types

**External**:
- `effect` - Effect runtime
- `@effect/rpc` - RPC client infrastructure
- `@effect/platform-browser` - Browser socket, platform services
- `@effect-atom/atom-react` - Jotai/Effect integration

## Related

- **AGENTS.md** - Detailed contributor guidance including gotchas and checklist
- `@beep/iam-client` - IAM-specific client (auth flows)
- `@beep/documents-client` - Documents-specific client
- `@beep/runtime-client` - Browser ManagedRuntime provider
