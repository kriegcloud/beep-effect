# effect/TxHashMap Surface

Total exports: 37

| Export | Kind | Overview |
|---|---|---|
| `clear` | `const` | Removes all entries from the TxHashMap. |
| `compact` | `const` | Removes all None values from a TxHashMap containing Option values. |
| `empty` | `const` | Creates an empty TxHashMap. |
| `entries` | `const` | Returns an array of all key-value pairs in the TxHashMap. |
| `every` | `const` | Checks if all entries in the TxHashMap satisfy the given predicate. |
| `filter` | `const` | Filters the TxHashMap to keep only entries that satisfy the provided predicate. |
| `filterMap` | `const` | Combines filtering and mapping in a single operation. Applies a function that returns an Option to each entry, keeping only the Some values and transforming them. |
| `findFirst` | `const` | Finds the first entry in the TxHashMap that matches the given predicate. Returns the key-value pair as a tuple wrapped in an Option. |
| `flatMap` | `const` | Transforms the TxHashMap by applying a function that returns a TxHashMap to each entry, then flattening the results. Useful for complex transformations that require creating new... |
| `forEach` | `const` | Executes a side-effect function for each entry in the TxHashMap. The function receives the value and key as parameters and can perform effects. |
| `fromIterable` | `const` | Creates a TxHashMap from an iterable of key-value pairs. |
| `get` | `const` | Safely lookup the value for the specified key in the TxHashMap. |
| `getHash` | `const` | Lookup the value for the specified key in the TxHashMap using a custom hash. This can provide performance benefits when the hash is precomputed. |
| `has` | `const` | Checks if the specified key exists in the TxHashMap. |
| `hasBy` | `const` | Checks if any entry in the TxHashMap matches the given predicate. |
| `hasHash` | `const` | Checks if the specified key has an entry in the TxHashMap using a custom hash. This can provide performance benefits when the hash is precomputed. |
| `isEmpty` | `const` | Checks if the TxHashMap is empty. |
| `isNonEmpty` | `const` | Checks if the TxHashMap is non-empty. |
| `isTxHashMap` | `const` | Returns `true` if the specified value is a `TxHashMap`, `false` otherwise. |
| `keys` | `const` | Returns an array of all keys in the TxHashMap. |
| `make` | `const` | Creates a TxHashMap from the provided key-value pairs. |
| `map` | `const` | Transforms all values in the TxHashMap using the provided function, preserving keys. |
| `modify` | `const` | Updates the value for the specified key if it exists. |
| `modifyAt` | `const` | Updates the value for the specified key using an Option-based update function. |
| `reduce` | `const` | Reduces the TxHashMap entries to a single value by applying a reducer function. Iterates over all key-value pairs and accumulates them into a final result. |
| `remove` | `const` | Removes the specified key from the TxHashMap. |
| `removeMany` | `const` | Removes multiple keys from the TxHashMap. |
| `set` | `const` | Sets the value for the specified key in the TxHashMap. |
| `setMany` | `const` | Sets multiple key-value pairs in the TxHashMap. |
| `size` | `const` | Returns the number of entries in the TxHashMap. |
| `snapshot` | `const` | Returns an immutable snapshot of the current TxHashMap state. |
| `some` | `const` | Checks if at least one entry in the TxHashMap satisfies the given predicate. |
| `toEntries` | `const` | Returns an array of all key-value pairs in the TxHashMap. This is an alias for the `entries` function, providing API consistency with HashMap. |
| `toValues` | `const` | Returns an array of all values in the TxHashMap. This is an alias for the `values` function, providing API consistency with HashMap. |
| `TxHashMap` | `interface` | A TxHashMap is a transactional hash map data structure that provides atomic operations on key-value pairs within Effect transactions. It uses an immutable HashMap internally wit... |
| `union` | `const` | Merges another HashMap into this TxHashMap. If both maps contain the same key, the value from the other map will be used. |
| `values` | `const` | Returns an array of all values in the TxHashMap. |
