# effect/Pool Surface

Total exports: 11

| Export | Kind | Overview |
|---|---|---|
| `Config` | `interface` | No summary found in JSDoc. |
| `get` | `const` | Retrieves an item from the pool in a scoped effect. Note that if acquisition fails, then the returned effect will fail for that same reason. Retrying a failed acquisition attemp... |
| `invalidate` | `const` | Invalidates the specified item. This will cause the pool to eventually reallocate the item, although this reallocation may occur lazily rather than eagerly. |
| `isPool` | `const` | Returns `true` if the specified value is a `Pool`, `false` otherwise. |
| `make` | `const` | Makes a new pool of the specified fixed size. The pool is returned in a `Scope`, which governs the lifetime of the pool. When the pool is shutdown because the `Scope` is closed,... |
| `makeWithStrategy` | `const` | No summary found in JSDoc. |
| `makeWithTTL` | `const` | Makes a new pool with the specified minimum and maximum sizes and time to live before a pool whose excess items are not being used will be shrunk down to the minimum size. The p... |
| `Pool` | `interface` | A `Pool<A, E>` is a pool of items of type `A`, each of which may be associated with the acquisition and release of resources. An attempt to get an item `A` from a pool may fail ... |
| `PoolItem` | `interface` | No summary found in JSDoc. |
| `State` | `interface` | No summary found in JSDoc. |
| `Strategy` | `interface` | No summary found in JSDoc. |
