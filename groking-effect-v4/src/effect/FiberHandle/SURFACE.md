# effect/FiberHandle Surface

Total exports: 15

| Export | Kind | Overview |
|---|---|---|
| `awaitEmpty` | `const` | Wait for the fiber in the FiberHandle to complete. |
| `clear` | `const` | No summary found in JSDoc. |
| `FiberHandle` | `interface` | No summary found in JSDoc. |
| `get` | `function` | Retrieve the fiber from the FiberHandle. |
| `getUnsafe` | `function` | Retrieve the fiber from the FiberHandle. |
| `isFiberHandle` | `const` | No summary found in JSDoc. |
| `join` | `const` | If any of the Fiber's in the handle terminate with a failure, the returned Effect will terminate with the first failure that occurred. |
| `make` | `const` | A FiberHandle can be used to store a single fiber. When the associated Scope is closed, the contained fiber will be interrupted. |
| `makeRuntime` | `const` | Create an Effect run function that is backed by a FiberHandle. |
| `makeRuntimePromise` | `const` | Create an Effect run function that is backed by a FiberHandle. |
| `run` | `const` | Run an Effect and add the forked fiber to the FiberHandle. When the fiber completes, it will be removed from the FiberHandle. |
| `runtime` | `const` | Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle. |
| `runtimePromise` | `const` | Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle. |
| `set` | `const` | Set the fiber in the `FiberHandle`. When the fiber completes, it will be removed from the `FiberHandle`. |
| `setUnsafe` | `const` | Set the fiber in a FiberHandle. When the fiber completes, it will be removed from the FiberHandle. If a fiber is already running, it will be interrupted unless `options.onlyIfMi... |
