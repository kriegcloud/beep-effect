# Layer Composition Improvements

Friction points discovered while writing v0.5.0 demo examples, with proposed fixes using Effect's managed runtime APIs.

## Resolution (v0.5.0)

All five issues were resolved in the layer composition refactor:

| Issue | Fix | Approach |
|-------|-----|----------|
| 1. Intermediate services hidden | `buildRuntimeParts` + `Layer.merge` | Extract `supervisorLayer` from `buildRuntimeParts`, merge back into `runtimeLayer()` output |
| 2. QuickConfig supervisor config | `supervisor?: Partial<QuerySupervisorSettings>` | New field on `QuickConfig`, spread into `QuerySupervisorConfig.layerWith()` |
| 3. `sandbox: "local"` no-op | `layerLocal.pipe(Layer.provide(supervisorLayer))` | Wire local sandbox in `resolveSandboxLayer`, merge into output |
| 4. ManagedRuntime for Workers | `managedRuntime()` convenience function | Wraps `runtimeLayer()` with `ManagedRuntime.make()` |
| 5. Boilerplate reduction | Simplified examples | Examples 10, 11, and cloudflare-sandbox all use `runtimeLayer()` directly |

Key design decisions:
- Used `Layer.merge` (not `Layer.provideMerge` or `Layer.passthrough`) to compose the output — extracting parts via `buildRuntimeParts` then merging them back is more explicit and easier to reason about.
- Function overloads on `runtimeLayer` and `managedRuntime` provide correct return types when `sandbox` is configured vs. not.
- `managedRuntime()` is a thin wrapper — all logic lives in `runtimeLayer()`.

---

## Key Effect APIs for Improvement

### `ManagedRuntime`
- `ManagedRuntime.make(layer)` converts a `Layer<R, E>` into a reusable runtime with `.runPromise()`, `.runSync()`, `.dispose()`
- The `ManagedRuntime` itself is an `Effect<Runtime<R>, E>` — can be yielded
- Ideal for Cloudflare Workers: build once per request, dispose when done
- Manages scope lifecycle automatically — no manual `Effect.scoped` needed at the edge

### `Layer.passthrough`
- `Layer.passthrough(layer)` returns `Layer<RIn | ROut, E, RIn>` — the output includes BOTH the layer's inputs AND outputs
- This is the key to solving Issue 1: intermediate services stay visible in the output

### `Layer.provideMerge`
- `Layer.provideMerge(that, self)` feeds `self`'s output into `that`'s input, and the result includes outputs of BOTH layers
- Type: `Layer<ROut | ROut2, E | E2, RIn | Exclude<RIn2, ROut>>`
- Unlike `Layer.provide` (which hides the feeder layer's output), `provideMerge` preserves it

### `Layer.toRuntime`
- `Layer.toRuntime(layer)` returns `Effect<Runtime<ROut>, E, Scope | RIn>`
- Scoped — the runtime is valid only within the scope
- Useful when you need to create a runtime inside an Effect.gen block

---

## Issue 1: `runtimeLayer()` doesn't expose intermediate services

`runtimeLayer()` produces `Layer<AgentRuntime>` — it internalizes `QuerySupervisor`, `AgentSdk`, and all config layers. This means:

- **`Sandbox.layerLocal` can't be composed with `runtimeLayer()`** because `layerLocal` requires `QuerySupervisor` in its context, but `runtimeLayer()` doesn't output it.
- Users who want both `AgentRuntime` and `SandboxService` available must rebuild the entire layer stack manually (see `examples/10-sandbox-local.ts`).

### Fix: Use `Layer.passthrough` inside `buildRuntimeLayer`

The internal `supervisorLayer` could use `Layer.passthrough` so its output includes both `QuerySupervisor` AND its inputs. Then `runtimeLayer()` returns `Layer<AgentRuntime | QuerySupervisor | SandboxService>` instead of just `Layer<AgentRuntime>`.

```typescript
// Before (current)
const buildRuntimeLayer = (config) => {
  const supervisorLayer = QuerySupervisor.layer.pipe(
    Layer.provide(supervisorConfigLayer),
    Layer.provide(sdkLayer)
  )
  return AgentRuntime.layer.pipe(
    Layer.provide(runtimeConfigLayer),
    Layer.provide(supervisorLayer)  // QuerySupervisor is consumed, not exposed
  )
}

// After (with passthrough)
const buildRuntimeLayer = (config) => {
  const supervisorLayer = QuerySupervisor.layer.pipe(
    Layer.provide(supervisorConfigLayer),
    Layer.provide(sdkLayer)
  )
  // Use provideMerge so QuerySupervisor remains in the output
  return AgentRuntime.layer.pipe(
    Layer.provide(runtimeConfigLayer),
    Layer.provideMerge(supervisorLayer)
  )
}
```

This way `Sandbox.layerLocal` can find `QuerySupervisor` in the output.

## Issue 2: `QuickConfig` doesn't expose all `QuerySupervisorConfig` options

`runtimeLayer()` only passes `concurrencyLimit` to `QuerySupervisorConfig.layerWith()`. No way to set `emitEvents`, `metricsEnabled`, etc.

### Fix: Extend `QuickConfig` with `supervisor` field

```typescript
export type QuickConfig = {
  // ... existing fields ...
  readonly supervisor?: Partial<QuerySupervisorSettings>
}
```

Then `runtimeLayer()` merges `{ concurrencyLimit: config.concurrency, ...config.supervisor }` into the supervisor config. This preserves backward compat (concurrency remains top-level) while exposing all supervisor knobs.

## Issue 3: `sandbox: "local"` is a no-op in `runtimeLayer()`

`resolveSandboxLayer()` returns `undefined` for `"local"` — it only wires the Cloudflare backend. Users expect `sandbox: "local"` would make `SandboxService` available.

### Fix: Wire local sandbox with `Layer.provideMerge`

```typescript
const resolveSandboxLayer = (config, supervisorLayer) => {
  if (config.sandbox === "local") {
    // layerLocal requires QuerySupervisor — use provideMerge to keep both
    return Sandbox.layerLocal.pipe(Layer.provide(supervisorLayer))
  }
  if (!config.sandbox) return undefined
  return layerCloudflare({ ... })
}

// In runtimeLayer():
const sandboxLayer = resolveSandboxLayer(resolved, supervisorLayer)
const runtimeWithSandbox = sandboxLayer
  ? Layer.provideMerge(runtime, sandboxLayer)  // AgentRuntime + SandboxService
  : runtime
```

## Issue 4: Cloudflare Worker per-request lifecycle

### Fix: `ManagedRuntime` for Workers

Instead of `Effect.runPromise(Effect.scoped(...))` in every fetch handler, use `ManagedRuntime`:

```typescript
// Current pattern (verbose, repeated per route)
export default {
  async fetch(request, env) {
    const layer = runtimeLayer({ apiKey: env.ANTHROPIC_API_KEY, ... })
    return Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const runtime = yield* AgentRuntime
          // ...
        }).pipe(Effect.provide(layer))
      )
    )
  }
}

// With ManagedRuntime (cleaner)
export default {
  async fetch(request, env) {
    const rt = ManagedRuntime.make(
      runtimeLayer({ apiKey: env.ANTHROPIC_API_KEY, ... })
    )
    try {
      return await rt.runPromise(
        Effect.gen(function*() {
          const runtime = yield* AgentRuntime
          // ...
        })
      )
    } finally {
      await rt.dispose()
    }
  }
}
```

Even better — cache the `ManagedRuntime` at module scope and reuse across requests (since Worker instances are reused). Only `dispose()` on Worker shutdown.

## Issue 5: Demo examples require too much boilerplate

The local sandbox and supervisor-events demos both need ~20 lines of layer wiring. With the fixes above, they become:

```typescript
// Sandbox demo: before fix (20 lines of layers)
// Sandbox demo: after fix (3 lines)
const layer = runtimeLayer({
  model: "sonnet",
  sandbox: "local",
  persistence: "memory"
})
// SandboxService is now available automatically

// Supervisor events demo: before fix (20 lines of layers)
// Supervisor events demo: after fix (5 lines)
const layer = runtimeLayer({
  model: "haiku",
  concurrency: 2,
  supervisor: { emitEvents: true, pendingQueueCapacity: 16 },
  persistence: "memory"
})
// events stream is now populated
```

## Priority

1. **Issue 2** (supervisor field) — smallest change, biggest ergonomic win
2. **Issue 3** (local sandbox wiring) — surprising behavior, easy fix
3. **Issue 1** (passthrough/provideMerge) — architectural, enables Issues 2+3 cleanly
4. **Issue 4** (ManagedRuntime for Workers) — mostly a demo/docs improvement
5. **Issue 5** (boilerplate reduction) — follows from fixing 1-3

## Summary Table

| API | Solves | Pattern |
|-----|--------|---------|
| `Layer.passthrough` | Issue 1 | Keep intermediate deps visible in layer output |
| `Layer.provideMerge` | Issues 1, 3 | Feed + merge so both layers' outputs are accessible |
| `QuickConfig.supervisor` | Issue 2 | Surface supervisor config through QuickConfig |
| `ManagedRuntime.make` | Issue 4 | Lifecycle-managed runtime for Workers |
| `Layer.toRuntime` | Issue 4 (alt) | Scoped runtime creation inside Effect.gen |
