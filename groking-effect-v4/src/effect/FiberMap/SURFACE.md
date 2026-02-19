# effect/FiberMap Surface

Total exports: 19

| Export | Kind | Overview |
|---|---|---|
| `awaitEmpty` | `const` | Wait for the FiberMap to be empty. This will wait for all currently running fibers to complete. |
| `clear` | `const` | Remove all fibers from the FiberMap, interrupting them. |
| `FiberMap` | `interface` | A FiberMap is a collection of fibers, indexed by a key. When the associated Scope is closed, all fibers in the map will be interrupted. Fibers are automatically removed from the... |
| `get` | `const` | Retrieve a fiber from the FiberMap. |
| `getUnsafe` | `const` | Retrieve a fiber from the FiberMap. |
| `has` | `const` | Check if a key exists in the FiberMap. This is the Effect-wrapped version of `hasUnsafe`. |
| `hasUnsafe` | `const` | Check if a key exists in the FiberMap. |
| `isFiberMap` | `const` | No summary found in JSDoc. |
| `join` | `const` | Join all fibers in the FiberMap. If any of the Fiber's in the map terminate with a failure, the returned Effect will terminate with the first failure that occurred. |
| `make` | `const` | A FiberMap can be used to store a collection of fibers, indexed by some key. When the associated Scope is closed, all fibers in the map will be interrupted. |
| `makeRuntime` | `const` | Create an Effect run function that is backed by a FiberMap. |
| `makeRuntimePromise` | `const` | Create an Effect run function that is backed by a FiberMap. Returns a Promise instead of a Fiber for more convenient use with async/await. |
| `remove` | `const` | Remove a fiber from the FiberMap, interrupting it if it exists. |
| `run` | `const` | Run an Effect and add the forked fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap. |
| `runtime` | `const` | Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap. |
| `runtimePromise` | `const` | Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap. Returns a Promise instead of a Fiber for convenience. |
| `set` | `const` | Add a fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap. If the key already exists in the FiberMap, the previous fiber will be interrupted. T... |
| `setUnsafe` | `const` | Add a fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap. If the key already exists in the FiberMap, the previous fiber will be interrupted. |
| `size` | `const` | Get the number of fibers currently in the FiberMap. |
