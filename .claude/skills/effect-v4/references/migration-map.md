# Effect v3 -> v4 Migration Map

Ground truth sources:
- `effect-smol/MIGRATION.md`
- `effect-smol/migration/*.md`
- `effect-smol/packages/effect/src/*.ts`

## Package And Module Layout

| Area | v3 | v4 |
|---|---|---|
| Versioning | Independent package versions | Unified version across Effect ecosystem |
| Main package surface | Split across `effect`, `@effect/platform`, `@effect/rpc`, etc. | Large consolidation into `effect` |
| Experimental APIs | Mixed conventions | Explicit `effect/unstable/*` namespace |

## Services And Context

| v3 | v4 |
|---|---|
| `Context.Tag`, `Context.GenericTag` | `Context.Service` |
| `Effect.Tag` accessor style | `Context.Service` + `yield* Service` or `Service.use` |
| `Effect.Service` with `dependencies` and auto `.Default` | `Context.Service` + `{ make }`, then explicit `Layer.effect` + `Layer.provide` |
| v3 `FiberRef`-style runtime-local defaults | `Context.Reference` / `References.*` |
| `Context.make/get/add/mergeAll` | `Context.make/get/add/mergeAll` |

## Error Handling Renames

| v3 | v4 |
|---|---|
| `Effect.catchAll` | `Effect.catch` |
| `Effect.catchAllCause` | `Effect.catchCause` |
| `Effect.catchAllDefect` | `Effect.catchDefect` |
| `Effect.catchSome` | `Effect.catchFilter` |
| `Effect.catchSomeCause` | `Effect.catchCauseFilter` |
| `Effect.catchSomeDefect` | Removed |
| n/a | `Effect.catchReason`, `Effect.catchReasons`, `Effect.catchEager` |

## Forking / Concurrency

| v3 | v4 |
|---|---|
| `Effect.fork` | `Effect.forkChild` |
| `Effect.forkDaemon` | `Effect.forkDetach` |
| `Effect.forkScoped` | `Effect.forkScoped` (kept) |
| `Effect.forkIn` | `Effect.forkIn` (kept) |
| `Effect.forkAll` | Removed |
| `Effect.forkWithErrorHandler` | Removed |

Fork APIs now accept options:
- `startImmediately?: boolean`
- `uninterruptible?: boolean | "inherit"`

## Yieldable And Subtyping

| v3 | v4 |
|---|---|
| Many values structurally subtype `Effect` | Values implement `Yieldable` where appropriate |
| `Ref` / `Deferred` / `Fiber` usable as effects | Use `Ref.get`, `Deferred.await`, `Fiber.join` |
| Implicit combinator acceptance | Explicit `.asEffect()` for combinators when needed |

## Cause Model

| v3 | v4 |
|---|---|
| Recursive cause tree (`Sequential`, `Parallel`, `Empty`) | Flat `Cause` with `reasons: ReadonlyArray<Reason<E>>` |
| `sequential` / `parallel` constructors | `Cause.combine` |
| Tree-pattern matching | Iterate/filter `cause.reasons` |

Reason variants in v4:
- `Fail`
- `Die`
- `Interrupt`

## FiberRef And Runtime References

| v3 | v4 |
|---|---|
| `FiberRef.*` | `References.*` (`Context.Reference`) |
| `Effect.locally` + `FiberRef` | `Effect.provideService(References.*, value)` |

Examples:
- `FiberRef.currentLogLevel` -> `References.CurrentLogLevel`
- `FiberRef.currentConcurrency` -> `References.CurrentConcurrency`

## Scope

| v3 | v4 |
|---|---|
| `Scope.extend` | `Scope.provide` |

## Runtime

| v3 | v4 |
|---|---|
| `Runtime<R>` data type | Removed |
| Runtime module broad surface | Lifecycle-focused (`Teardown`, `defaultTeardown`, `makeRunMain`) |

## Equality

| v3 | v4 |
|---|---|
| Structural equality often required region opt-in | Structural equality default for plain objects/arrays/maps/sets/dates/regex |
| `Equal.equivalence` | `Equal.asEquivalence` |
| n/a | `Equal.byReference`, `Equal.byReferenceUnsafe` |
| `Equal.equals(NaN, NaN) === false` | `Equal.equals(NaN, NaN) === true` |

## Behavioral Changes To Call Out During Migration

1. `Effect.provide` memoization is shared across calls by default.
2. Use `{ local: true }` or `Layer.fresh` when isolation is required.
3. Core runtime now has internal keep-alive for suspended async fibers.
4. Prefer platform `runMain` for signal handling and exit behavior.

## Quick Grep For Legacy API Residue

```bash
rg -n "Context\.Tag|Context\.GenericTag|Effect\.Tag\(|Effect\.Service\(|FiberRef\.|catchAll|catchSome|forkDaemon|Scope\.extend|Equal\.equivalence" .
```

## Migration Completion Criteria

1. No v3 API symbols remain.
2. Build/typecheck passes.
3. Behavior-sensitive areas have tests (memoization, forking, error recovery).
4. Any `unstable/*` usage is explicitly acknowledged as unstable.
