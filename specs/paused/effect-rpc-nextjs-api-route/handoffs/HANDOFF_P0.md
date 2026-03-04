# Handoff P0: Research

## Objective

Produce source-backed research that removes all API ambiguity before design.

## Inputs

- [README.md](../README.md)
- [HttpEffect.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/src/unstable/http/HttpEffect.ts)
- [Rpc.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/src/unstable/rpc/Rpc.ts)
- [RpcGroup.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/src/unstable/rpc/RpcGroup.ts)
- [RpcServer.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/src/unstable/rpc/RpcServer.ts)
- [RpcClient.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/src/unstable/rpc/RpcClient.ts)
- [RpcSerialization.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/src/unstable/rpc/RpcSerialization.ts)
- [McpServer.test.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/test/unstable/ai/McpServer.test.ts)
- [HttpEffect.test.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4/packages/effect/test/unstable/http/HttpEffect.test.ts)
- [apps/web chat route](/home/elpresidank/YeeBois/projects/beep-effect3/apps/web/src/app/api/chat/route.ts)

## Required Work

1. Confirm exact function signatures used by this spec:
   - `HttpEffect.toWebHandler`
   - `HttpEffect.toWebHandlerWith`
   - `Rpc.make`
   - `RpcGroup.make`
   - `RpcServer.toHttpEffect`
2. Confirm serialization and framing behavior:
   - `RpcSerialization.layerJsonRpc`
   - `RpcSerialization.layerNdJsonRpc`
3. Confirm route export conventions for Next.js app router in this repo.
4. Capture at least one source-verified usage pattern for each critical API.

## Deliverable

- [outputs/p0-research.md](../outputs/p0-research.md)

## Completion Checklist

- [ ] Every important claim cites a source file path.
- [ ] Handler API differences are explicitly documented.
- [ ] Serialization pairing guidance is explicit and actionable.
- [ ] No unresolved API uncertainty remains.

## Exit Gate

P0 is complete when the P1 designer can proceed without guessing any API shape.
