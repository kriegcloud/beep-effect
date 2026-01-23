# AGENTS.md — `@beep/documents-client`

## Purpose & Fit
- Host Effect-first client helpers for the documents slice so apps and CLIs do not talk to server endpoints directly.
- Provide a thin layer over `@beep/documents-domain` entities and HTTP contracts exported by server runtimes.
- Keep network concerns injectable (fetch or RPC clients passed in) to support Bun, browsers, and tests.

## Current State
- Package is a stub; only `beep` is exported (`src/index.ts`).
- Treat this as the staging area for the first real client once server routes and HTTP handlers are finalized.
- Once HTTP API implementation is complete in `@beep/documents-server`, this package will expose client-side wrappers.

## Planned Architecture
When the CLIENT is implemented, it should provide:
- Client wrappers for domain entities and RPC contracts from `@beep/documents-domain`.
- Type-safe HTTP clients for document CRUD, knowledge page operations, discussions, and comments.
- Effect-based error handling aligned with domain error types from `@beep/documents-domain/errors`.
- Configuration injection via Layers for base URLs, authentication tokens, etc.

## Authoring Guardrails
- ALWAYS import Effect modules by namespace (`Effect`, `Layer`, `F`, `A`, `Str`) and NEVER use native array/string/object helpers.
- Keep functions pure and data-oriented; ALWAYS accept configuration (base URLs, tokens) via parameters or Layers rather than reading globals.
- ALWAYS validate all external data with schemas from `@beep/schema` or `@beep/documents-domain` before exposing to callers.
- Mirror server contract names when adding RPC/HTTP clients so runtime wiring in `packages/runtime/client` can compose them predictably.
- Provide accessors and Layers where possible to keep dependency injection consistent with other slices.

## Suggested Shape (future)
```ts
// Example future API
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClient from "@effect/platform/HttpClient";
import { Document, Comment, Discussion } from "@beep/documents-domain/entities";

export class DocumentsClient extends Effect.Service<DocumentsClient>()("@beep/documents-client/DocumentsClient", {
  effect: Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;

    // HTTP client implementation
    const getDocument = (documentId: string) => Effect.gen(function* () {
      // Fetch and decode document
    });

    const createDocument = (data: unknown) => Effect.gen(function* () {
      // Create document via API
    });

    return { getDocument, createDocument };
  }),
  dependencies: [HttpClient.HttpClient.Default]
}) {}
```

## Verifications
- `bun run check --filter=@beep/documents-client`
- `bun run lint --filter=@beep/documents-client`
- `bun run test --filter=@beep/documents-client` (add focused tests as soon as real code lands).

## Gotchas

### Contract Names Must Mirror Server Exports
- **Symptom**: RPC calls fail at runtime with "contract not found" or type mismatches between client and server.
- **Root Cause**: Client contract names diverge from server-side handler names in `@beep/documents-server`.
- **Solution**: When implementing contracts, ALWAYS verify the contract name matches the server's exported handler identifier exactly. Use the same domain/method annotations.

### Schema Version Drift Between Domain and Client
- **Symptom**: Decode errors when client receives responses from server; fields missing or wrong types.
- **Root Cause**: `@beep/documents-domain` schema was updated but client contracts still reference old schema versions.
- **Solution**: Client contracts MUST import schemas from `@beep/documents-domain` directly rather than duplicating definitions. When domain schemas change, client contracts automatically align.

### Layer Dependencies for HTTP Client
- **Symptom**: Effect fails with "service not found" when executing document client operations.
- **Root Cause**: `DocumentsClient` service depends on `HttpClient` and configuration layers that weren't provided.
- **Solution**: When using `DocumentsClient`, ensure the consuming runtime provides: `HttpClient.layer`, base URL config layer, and any auth token layers. See `@beep/runtime-client` for composition patterns.

### Effect.Service vs Direct Function Exports
- **Symptom**: Confusion about whether to import the service class or individual functions.
- **Root Cause**: Package may export both `DocumentsClient` (service pattern) and loose implementation functions.
- **Solution**: PREFER the `Effect.Service` pattern for runtime composition. Direct function exports are for testing or cases where full runtime is unavailable. Document which pattern is primary.

### Pagination and Cursor Handling
- **Symptom**: Client receives truncated results or infinite loops when fetching large datasets.
- **Root Cause**: Pagination cursors from server must be passed correctly in subsequent requests.
- **Solution**: Document list contracts MUST handle pagination. NEVER fetch unbounded lists. Client implementations should expose cursor-based iteration helpers.

### Error Type Alignment with Domain
- **Symptom**: Caught errors don't match expected domain error types; generic `UnknownError` appears.
- **Root Cause**: Server returns domain-specific errors that client doesn't map correctly.
- **Solution**: Use `Effect.mapError` or `Effect.catchTag` to map server error responses to `@beep/documents-domain/errors` types. Keep error mapping in sync with server error taxonomy and use tagged error unions for precise error handling.

## Contributor Checklist
- [ ] NEVER use native array/string helpers; ALWAYS rely on Effect utilities.
- [ ] All network responses MUST be decoded through schemas before returning data.
- [ ] Exposed surface aligns with server/server contract names and is documented in this file once shipped.
- [ ] Added or updated tests under `packages/documents/client/test/`.
- [ ] Client service MUST provide proper Layer-based dependency injection.
