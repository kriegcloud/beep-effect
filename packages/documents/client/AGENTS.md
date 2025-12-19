# AGENTS.md — `@beep/documents-client`

## Purpose & Fit
- Host Effect-first client helpers for the documents slice so apps and CLIs do not talk to infra endpoints directly.
- Provide a thin layer over `@beep/documents-domain` entities and HTTP contracts exported by server runtimes.
- Keep network concerns injectable (fetch or RPC clients passed in) to support Bun, browsers, and tests.

## Current State
- Package is a stub; only `beep` is exported (`src/index.ts`).
- Treat this as the staging area for the first real client once infra routes and HTTP handlers are finalized.
- Once HTTP API implementation is complete in `@beep/documents-server`, this package will expose client-side wrappers.

## Planned Architecture
When the SDK is implemented, it should provide:
- Client wrappers for the `DomainApi` defined in `@beep/documents-domain/DomainApi.ts`.
- Type-safe HTTP clients for document CRUD, knowledge page operations, discussions, and comments.
- Effect-based error handling aligned with domain error types.
- Configuration injection via Layers for base URLs, authentication tokens, etc.

## Authoring Guardrails
- Import Effect modules by namespace (`Effect`, `Layer`, `F`, `A`, `Str`) and avoid new native array/string/object helpers.
- Keep functions pure and data-oriented; accept configuration (base URLs, tokens) via parameters or Layers rather than reading globals.
- Validate all external data with schemas from `@beep/schema` or `@beep/documents-domain` before exposing to callers.
- Mirror server contract names when adding RPC/HTTP clients so runtime wiring in `packages/runtime/client` can compose them predictably.
- Provide accessors and Layers where possible to keep dependency injection consistent with other slices.

## Suggested Shape (future)
```ts
// Example future API
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { DomainApi } from "@beep/documents-domain";

export class DocumentsClient extends Effect.Service<DocumentsClient>()("@beep/documents-client/DocumentsClient", {
  effect: Effect.gen(function* () {
    // HTTP client implementation
    const getPage = (pageId: string) => Effect.gen(function* () {
      // Fetch and decode knowledge page
    });

    const createDocument = (data: unknown) => Effect.gen(function* () {
      // Create document via API
    });

    return { getPage, createDocument };
  }),
  dependencies: [/* HttpClient, Config, etc */]
}) {}
```

## Verifications
- `bun run check --filter=@beep/documents-client`
- `bun run lint --filter=@beep/documents-client`
- `bun run test --filter=@beep/documents-client` (add focused tests as soon as real code lands).

## Contributor Checklist
- [ ] No new native array/string helpers; rely on Effect utilities.
- [ ] Any network responses are decoded through schemas before returning data.
- [ ] Exposed surface aligns with infra/server contract names and is documented in this file once shipped.
- [ ] Added or updated tests under `packages/documents/client/test/`.
- [ ] Client service provides proper Layer-based dependency injection.
