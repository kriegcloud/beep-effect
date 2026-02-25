# Handoff P1: Design

## Objective

Produce a decision-complete design for implementing the requested RPC demo in `apps/web`.

## Inputs

- [README.md](../README.md)
- [outputs/p0-research.md](../outputs/p0-research.md)

## Required Work

1. Define module/file layout for:
   - `apps/web/src/lib/effect/rpc-demo/rpcs.ts`
   - `apps/web/src/lib/effect/rpc-demo/handlers.ts`
   - `apps/web/src/lib/effect/rpc-demo/server-basic.ts`
   - `apps/web/src/lib/effect/rpc-demo/server-stream.ts`
   - route files under `apps/web/src/app/api/rpc/*`
2. Define RPC contracts:
   - `Echo` (non-stream)
   - `CountStream` (stream)
3. Define route behavior and serialization pairing:
   - basic route + JSON-RPC
   - stream route + NDJSON-RPC
4. Define test architecture using `RpcClient.layerProtocolHttp` + custom fetch.
5. Define proof strategy for `toWebHandlerWith` injected service behavior.

## Deliverable

- [outputs/p1-design.md](../outputs/p1-design.md)

## Completion Checklist

- [ ] No design decisions are deferred.
- [ ] File-level design is explicit.
- [ ] Test strategy covers all required scenarios.
- [ ] Serialization choices and constraints are unambiguous.

## Exit Gate

P1 is complete when implementation can begin without architecture questions.
