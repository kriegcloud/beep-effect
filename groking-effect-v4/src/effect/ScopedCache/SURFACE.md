# effect/ScopedCache Surface

Total exports: 18

| Export | Kind | Overview |
|---|---|---|
| `entries` | `const` | Retrieves all key-value pairs from the cache as an iterable. This function only returns entries with successfully resolved values, filtering out any failed lookups or expired en... |
| `Entry` | `interface` | Represents a cache entry containing a deferred value and optional expiration time. This is used internally by the cache implementation to track cached values and their lifetimes. |
| `get` | `const` | No summary found in JSDoc. |
| `getOption` | `const` | No summary found in JSDoc. |
| `getSuccess` | `const` | Retrieves the value associated with the specified key from the cache, only if it contains a resolved successful value. |
| `has` | `const` | Checks if the cache contains an entry for the specified key. |
| `invalidate` | `const` | Invalidates the entry associated with the specified key in the cache. |
| `invalidateAll` | `const` | Invalidates all entries in the cache. |
| `invalidateWhen` | `const` | Conditionally invalidates the entry associated with the specified key in the cache if the predicate returns true for the cached value. |
| `keys` | `const` | Retrieves all active keys from the cache, automatically filtering out expired entries. |
| `make` | `const` | No summary found in JSDoc. |
| `makeWith` | `const` | No summary found in JSDoc. |
| `refresh` | `const` | Forces a refresh of the value associated with the specified key in the cache. |
| `ScopedCache` | `interface` | No summary found in JSDoc. |
| `set` | `const` | Sets the value associated with the specified key in the cache. This will overwrite any existing value for that key, skipping the lookup function. |
| `size` | `const` | Retrieves the approximate number of entries in the cache. |
| `State` | `type` | No summary found in JSDoc. |
| `values` | `const` | Retrieves all successfully cached values from the cache, excluding failed lookups and expired entries. |
