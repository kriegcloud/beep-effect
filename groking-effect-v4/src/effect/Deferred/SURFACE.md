# effect/Deferred Surface

Total exports: 22

| Export | Kind | Overview |
|---|---|---|
| `await` | `const` | No summary found in JSDoc. |
| `complete` | `const` | Completes the deferred with the result of the specified effect. If the deferred has already been completed, the method will produce false. |
| `completeWith` | `const` | Completes the deferred with the result of the specified effect. If the deferred has already been completed, the method will produce false. |
| `Deferred` | `interface` | A `Deferred` represents an asynchronous variable that can be set exactly once, with the ability for an arbitrary number of fibers to suspend (by calling `Deferred.await`) and au... |
| `die` | `const` | Kills the `Deferred` with the specified defect, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `dieSync` | `const` | Kills the `Deferred` with the specified defect, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `done` | `const` | Exits the `Deferred` with the specified `Exit` value, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `doneUnsafe` | `const` | Unsafely exits the `Deferred` with the specified `Exit` value, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `fail` | `const` | Fails the `Deferred` with the specified error, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `failCause` | `const` | Fails the `Deferred` with the specified `Cause`, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `failCauseSync` | `const` | Fails the `Deferred` with the specified `Cause`, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `failSync` | `const` | Fails the `Deferred` with the specified error, which will be propagated to all fibers waiting on the value of the `Deferred`. |
| `interrupt` | `const` | Completes the `Deferred` with interruption. This will interrupt all fibers waiting on the value of the `Deferred` with the `FiberId` of the fiber calling this method. |
| `interruptWith` | `const` | Completes the `Deferred` with interruption. This will interrupt all fibers waiting on the value of the `Deferred` with the specified `FiberId`. |
| `into` | `const` | Converts an `Effect` into an operation that completes a `Deferred` with its result. |
| `isDone` | `const` | Returns `true` if this `Deferred` has already been completed with a value or an error, `false` otherwise. |
| `isDoneUnsafe` | `const` | Returns `true` if this `Deferred` has already been completed with a value or an error, `false` otherwise. |
| `make` | `const` | Creates a new `Deferred`. |
| `makeUnsafe` | `const` | Unsafely creates a new `Deferred` |
| `poll` | `function` | Returns a `Effect<A, E, R>` from the `Deferred` if this `Deferred` has already been completed, `undefined` otherwise. |
| `succeed` | `const` | Completes the `Deferred` with the specified value. |
| `sync` | `const` | Completes the `Deferred` with the specified lazily evaluated value. |
