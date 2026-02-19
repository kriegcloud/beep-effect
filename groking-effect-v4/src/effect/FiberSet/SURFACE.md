# effect/FiberSet Surface

Total exports: 14

| Export | Kind | Overview |
|---|---|---|
| `add` | `const` | Add a fiber to the FiberSet. When the fiber completes, it will be removed. |
| `addUnsafe` | `const` | Add a fiber to the FiberSet. When the fiber completes, it will be removed. This is the unsafe version that doesn't return an Effect. |
| `awaitEmpty` | `const` | Wait until the fiber set is empty. |
| `clear` | `const` | Interrupt all fibers in the FiberSet and clear the set. |
| `FiberSet` | `interface` | A FiberSet is a collection of fibers that can be managed together. When the associated Scope is closed, all fibers in the set will be interrupted. |
| `isFiberSet` | `const` | Checks if a value is a FiberSet. |
| `join` | `const` | Join all fibers in the FiberSet. If any of the Fiber's in the set terminate with a failure, the returned Effect will terminate with the first failure that occurred. |
| `make` | `const` | A FiberSet can be used to store a collection of fibers. When the associated Scope is closed, all fibers in the set will be interrupted. |
| `makeRuntime` | `const` | Create an Effect run function that is backed by a FiberSet. |
| `makeRuntimePromise` | `const` | Create an Effect run function that is backed by a FiberSet. The returned run function will return Promise's. |
| `run` | `const` | Fork an Effect and add the forked fiber to the FiberSet. When the fiber completes, it will be removed from the FiberSet. |
| `runtime` | `const` | Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet. |
| `runtimePromise` | `const` | Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet. |
| `size` | `const` | Get the number of fibers currently in the FiberSet. |
