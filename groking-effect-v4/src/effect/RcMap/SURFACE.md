# effect/RcMap Surface

Total exports: 8

| Export | Kind | Overview |
|---|---|---|
| `get` | `const` | Retrieves a value from the RcMap by key. If the resource doesn't exist, it will be acquired using the lookup function. The resource is reference counted and will be released whe... |
| `has` | `const` | No summary found in JSDoc. |
| `invalidate` | `const` | Invalidates and removes a specific key from the RcMap. If the resource is not currently in use (reference count is 0), it will be immediately released. |
| `keys` | `const` | Returns an array of all keys currently stored in the RcMap. |
| `make` | `const` | An `RcMap` can contain multiple reference counted resources that can be indexed by a key. The resources are lazily acquired on the first call to `get` and released when the last... |
| `RcMap` | `interface` | An `RcMap` is a reference-counted map data structure that manages the lifecycle of resources indexed by keys. Resources are lazily acquired and automatically released when no lo... |
| `State` | `type` | Represents the internal state of an RcMap, which can be either Open (active) or Closed (shutdown and no longer accepting operations). |
| `touch` | `const` | Extends the idle time for a resource in the RcMap. If the RcMap has an `idleTimeToLive` configured, calling `touch` will reset the expiration timer for the specified key. |
