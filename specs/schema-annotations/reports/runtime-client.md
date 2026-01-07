# Schema Annotations Audit: @beep/runtime-client

## Summary
- Total Schemas Found: 6
- Annotated: 3
- Missing Annotations: 3

## Annotationless Schemas Checklist

- [ ] `src/workers/image-compression-rpc.ts:5` - `ImageCompressionRpc` - RpcGroup.make
- [ ] `src/workers/worker-rpc.ts:12` - `WorkerRpc` - RpcGroup.make
- [ ] `src/services/unsafe-http-api-client.ts:46` - `HttpBodyFromSelf` - S.declare

## Annotated Schemas (Reference)

The following schemas are properly annotated via the `$I` identity pattern:

- `src/workers/worker-rpc.ts:8` - `FilterError` - S.TaggedError (uses `$I`)
- `src/services/network-monitor.ts:9` - `NetworkMonitor` - Effect.Service (uses `$I`)
- `src/workers/worker-client.ts:26` - `WorkerClient` - Effect.Service (uses `$I`)

## Notes

1. **RpcGroup classes**: `ImageCompressionRpc` and `WorkerRpc` are `RpcGroup.make` definitions that do not have schema annotations. These define RPC method contracts but lack metadata annotations.

2. **S.declare schema**: `HttpBodyFromSelf` is a declared schema using `S.declare(HttpBody.isHttpBody)` without annotations. This is an internal utility schema used for HTTP body handling.

3. **Effect.Service classes**: `NetworkMonitor` and `WorkerClient` properly use the `$I` identity pattern which provides annotations via `$RuntimeClientId.create()`.

4. **FilterError**: Uses the `$I` tagged error pattern with proper identity-based annotations.
