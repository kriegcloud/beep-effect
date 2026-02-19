# effect/Cache Surface

Total exports: 17

| Export | Kind | Overview |
|---|---|---|
| `Cache` | `interface` | A cache interface that provides a mutable key-value store with automatic TTL management, capacity limits, and lookup functions for cache misses. |
| `entries` | `const` | Retrieves all key-value pairs from the cache as an iterable. This function only returns entries with successfully resolved values, filtering out any failed lookups or expired en... |
| `Entry` | `interface` | Represents a cache entry containing a deferred value and optional expiration time. This is used internally by the cache implementation to track cached values and their lifetimes. |
| `get` | `const` | Retrieves the value associated with the specified key from the cache. |
| `getOption` | `const` | Retrieves the value associated with the specified key from the cache, returning an `Option` that is `Some` if the key exists and has not expired, or `None` if the key does not e... |
| `getSuccess` | `const` | Retrieves the value associated with the specified key from the cache, only if it contains a resolved successful value. |
| `has` | `const` | Checks if the cache contains an entry for the specified key. |
| `invalidate` | `const` | Invalidates the entry associated with the specified key in the cache. |
| `invalidateAll` | `const` | Invalidates all entries in the cache. |
| `invalidateWhen` | `const` | Conditionally invalidates the entry associated with the specified key in the cache if the predicate returns true for the cached value. |
| `keys` | `const` | Retrieves all active keys from the cache, automatically filtering out expired entries. |
| `make` | `const` | Creates a cache with a fixed time-to-live for all entries. |
| `makeWith` | `const` | Creates a cache with dynamic time-to-live based on the result and key. |
| `refresh` | `const` | Forces a refresh of the value associated with the specified key in the cache. |
| `set` | `const` | Sets the value associated with the specified key in the cache. This will overwrite any existing value for that key, skipping the lookup function. |
| `size` | `const` | Retrieves the approximate number of entries in the cache. |
| `values` | `const` | Retrieves all successfully cached values from the cache, excluding failed lookups and expired entries. |
