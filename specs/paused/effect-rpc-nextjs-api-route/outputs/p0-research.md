# P0 Research: Effect RPC + Next.js Route Setup

## Status
PENDING EXECUTION

## Objective

Document source-backed findings for:
- handler conversion APIs
- RPC construction APIs
- serialization/framing behavior
- Next.js route export conventions

## Research Questions

1. What are the exact type/runtime contracts of `HttpEffect.toWebHandler` and `HttpEffect.toWebHandlerWith`?
2. How is `RpcServer.toHttpEffect` expected to be composed with handlers and serialization layers?
3. What are the practical differences between `RpcSerialization.layerJsonRpc` and `RpcSerialization.layerNdJsonRpc`?
4. What route export patterns are currently used in `apps/web` Next route files?

## Findings (To Be Filled During P0)

### Handler APIs

- Source:
- Verified signature:
- Practical usage notes:

### RPC Construction APIs

- Source:
- Verified signature:
- Practical usage notes:

### Serialization Behavior

- Source:
- Verified behavior:
- Framing implications:

### Next.js Route Shape

- Source:
- Verified pattern:
- Required adaptation for RPC routes:

## Confirmed Constraints

- [ ] `basic` route will use `HttpEffect.toWebHandler`.
- [ ] `stream` route will use `HttpEffect.toWebHandlerWith`.
- [ ] Basic route serialization is JSON-RPC.
- [ ] Stream route serialization is NDJSON-RPC.
- [ ] Module-level singleton handlers are required in route files.

## Open Questions

Record only blockers that cannot be resolved from local source.

## Phase Exit Evidence

List exact source files and line ranges used to close each research question.
