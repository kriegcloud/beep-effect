# P1 Design: Effect RPC Demo in `apps/web`

## Status
PENDING EXECUTION

## Objective

Define a decision-complete design for implementing:
- `/api/rpc/basic`
- `/api/rpc/stream`

with required handler and serialization differences.

## Module Layout (Planned)

### New Route Files

- `apps/web/src/app/api/rpc/basic/route.ts`
- `apps/web/src/app/api/rpc/stream/route.ts`

### New Library Files

- `apps/web/src/lib/effect/rpc-demo/rpcs.ts`
- `apps/web/src/lib/effect/rpc-demo/handlers.ts`
- `apps/web/src/lib/effect/rpc-demo/server-basic.ts`
- `apps/web/src/lib/effect/rpc-demo/server-stream.ts`

### New Tests

- `apps/web/test/effect/rpc-basic-route.test.ts`
- `apps/web/test/effect/rpc-stream-route.test.ts`

## RPC Contract Design

### `Echo` (non-stream)

- Payload schema: `{ message: string }`
- Success schema: `string`
- Stream flag: `false`

### `CountStream` (stream)

- Payload schema: `{ from: int }`
- Success chunk schema: `int`
- Stream flag: `true`

## Route Design

### `/api/rpc/basic`

- Handler conversion: `HttpEffect.toWebHandler`
- Serialization layer: `RpcSerialization.layerJsonRpc`
- Purpose: canonical non-stream RPC example

### `/api/rpc/stream`

- Handler conversion: `HttpEffect.toWebHandlerWith`
- Serialization layer: `RpcSerialization.layerNdJsonRpc`
- Purpose: canonical stream RPC example with injected service behavior proof

## Service Injection Proof Strategy

Demonstrate `toWebHandlerWith` by injecting a service used to add/derive a response header on the stream route.

## Test Harness Design

Use `RpcClient.layerProtocolHttp` with a custom fetch adapter bound to route handlers so tests run without external network setup.

## Decision Closure Checklist

- [ ] File layout is final.
- [ ] Contracts are final.
- [ ] Handler selection is final.
- [ ] Serialization pairing is final.
- [ ] Test strategy is final.

## Open Decisions

None allowed at phase exit.
