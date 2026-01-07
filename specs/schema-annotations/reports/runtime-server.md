# Schema Annotations Audit: @beep/runtime-server

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Annotationless Schemas Checklist

_No schemas found in this package._

## Notes

This package (`packages/runtime/server`) is a runtime composition layer that:

1. **Composes Effect Layers** for server infrastructure (Authentication, Persistence, DataAccess, Email, etc.)
2. **Provides ManagedRuntime** configuration for the Effect server runtime
3. **Configures HTTP routing** via HttpLayerRouter and middleware
4. **Integrates OpenTelemetry** tracing and logging
5. **Wires RPC handlers** via @effect/rpc

The package contains no Effect Schema declarations:
- No `S.Class` definitions
- No `S.TaggedError` definitions
- No `M.Class` (Model) definitions
- No named schema exports (`export const SomeSchema = S.xxx`)

All schemas used in this package are imported from other packages:
- `User.Model`, `Session.Model`, `Organization.Model` from `@beep/shared-domain/entities`
- Inline anonymous schemas in `S.decodeUnknown` calls (not named exports)

The `RpcLogger` class in `Rpc.layer.ts` extends `RpcMiddleware.Tag`, which is an RPC middleware tag pattern, not an Effect Schema.
