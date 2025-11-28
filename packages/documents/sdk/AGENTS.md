# AGENTS — `@beep/documents-sdk`

## Purpose & Fit
- Host Effect-first client helpers for the documents slice (upload flows, signed URL retrieval, metadata decoding) so apps and CLIs do not talk to infra endpoints directly.
- Provide a thin layer over `@beep/documents-domain` value objects and any RPC/HTTP contracts exported by server runtimes.
- Keep network concerns injectable (fetch or RPC clients passed in) to support Bun, browsers, and tests.

## Current State
- Package is a stub; only `beep` is exported. Treat this as the staging area for the first real client once infra routes are finalized.

## Authoring Guardrails
- Import Effect modules by namespace (`Effect`, `Layer`, `F`, `A`, `Str`) and avoid new native array/string/object helpers.
- Keep functions pure and data-oriented; accept configuration (base URLs, tokens) via parameters or Layers rather than reading globals.
- Validate all external data with schemas from `@beep/common/schema` or `@beep/documents-domain` before exposing to callers.
- Mirror server contract names when adding RPC/HTTP clients so runtime wiring in `packages/runtime/client` can compose them predictably.
- Provide accessors and Layers where possible to keep dependency injection consistent with other slices.

## Suggested Shape (future)
- `makeClient(config)` returning Effect services for `getUploadUrl`, `uploadWithValidation`, `fetchMetadata`.
- Accessor helpers (`FilesSdk` service tag) to slot into React providers or worker runtimes.

## Verifications
- `bun run check --filter=@beep/documents-sdk`
- `bun run lint --filter=@beep/documents-sdk`
- `bun run test --filter=@beep/documents-sdk` (add focused tests as soon as real code lands).

## Contributor Checklist
- [ ] No new native array/string helpers; rely on Effect utilities.
- [ ] Any network responses are decoded through schemas before returning data.
- [ ] Exposed surface aligns with infra/server contract names and is documented in this file once shipped.
- [ ] Added or updated tests under `packages/documents/sdk/test/`.
