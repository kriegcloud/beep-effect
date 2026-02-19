# effect/Trie Surface

Total exports: 29

| Export | Kind | Overview |
|---|---|---|
| `compact` | `const` | Filters out `None` values from a `Trie` of `Options`s. |
| `empty` | `const` | Creates an empty `Trie`. |
| `entries` | `const` | Returns an `IterableIterator` of the entries within the `Trie`. |
| `entriesWithPrefix` | `const` | Returns an `IterableIterator` of the entries within the `Trie` that have `prefix` as prefix (`prefix` included if it exists). |
| `filter` | `const` | Filters entries out of a `Trie` using the specified predicate. |
| `filterMap` | `const` | Maps over the entries of the `Trie` using the specified partial function and filters out `None` values. |
| `forEach` | `const` | Applies the specified function to the entries of the `Trie`. |
| `fromIterable` | `const` | Creates a new `Trie` from an iterable collection of key/value pairs (e.g. `Array<[string, V]>`). |
| `get` | `const` | Safely lookup the value for the specified key in the `Trie`. |
| `getUnsafe` | `const` | Unsafely lookup the value for the specified key in the `Trie`. |
| `has` | `const` | Check if the given key exists in the `Trie`. |
| `insert` | `const` | Insert a new entry in the `Trie`. |
| `insertMany` | `const` | Insert multiple entries in the `Trie` at once. |
| `isEmpty` | `const` | Checks if the `Trie` contains any entries. |
| `keys` | `const` | Returns an `IterableIterator` of the keys within the `Trie`. |
| `keysWithPrefix` | `const` | Returns an `IterableIterator` of the keys within the `Trie` that have `prefix` as prefix (`prefix` included if it exists). |
| `longestPrefixOf` | `const` | Returns the longest key/value in the `Trie` that is a prefix of that `key` if it exists, `None` otherwise. |
| `make` | `const` | Constructs a new `Trie` from the specified entries (`[string, V]`). |
| `map` | `const` | Maps over the entries of the `Trie` using the specified function. |
| `modify` | `const` | Updates the value of the specified key within the `Trie` if it exists. |
| `reduce` | `const` | Reduce a state over the entries of the `Trie`. |
| `remove` | `const` | Remove the entry for the specified key in the `Trie`. |
| `removeMany` | `const` | Removes all entries in the `Trie` which have the specified keys. |
| `size` | `const` | Returns the size of the `Trie` (number of entries in the `Trie`). |
| `toEntries` | `const` | Returns an `Array<[K, V]>` of the entries within the `Trie`. |
| `toEntriesWithPrefix` | `const` | Returns `Array<[K, V]>` of the entries within the `Trie` that have `prefix` as prefix (`prefix` included if it exists). |
| `Trie` | `interface` | No summary found in JSDoc. |
| `values` | `const` | Returns an `IterableIterator` of the values within the `Trie`. |
| `valuesWithPrefix` | `const` | Returns an `IterableIterator` of the values within the `Trie` that have `prefix` as prefix (`prefix` included if it exists). |
