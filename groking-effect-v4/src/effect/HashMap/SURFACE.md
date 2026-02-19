# effect/HashMap Surface

Total exports: 39

| Export | Kind | Overview |
|---|---|---|
| `beginMutation` | `const` | Marks the `HashMap` as mutable for performance optimization during batch operations. |
| `compact` | `const` | Filters out `None` values from a `HashMap` of `Options`s. |
| `empty` | `const` | Creates a new empty `HashMap`. |
| `endMutation` | `const` | Marks the `HashMap` as immutable, completing the mutation cycle. |
| `entries` | `const` | Returns an `IterableIterator` of the entries within the `HashMap`. |
| `every` | `const` | Checks if all entries in a hashmap meets a specific condition. |
| `filter` | `const` | Filters entries out of a `HashMap` using the specified predicate. |
| `filterMap` | `const` | Maps over the entries of the `HashMap` using the specified partial function and filters out `None` values. |
| `findFirst` | `const` | Returns the first element that satisfies the specified predicate, or `None` if no such element exists. |
| `flatMap` | `const` | Chains over the entries of the `HashMap` using the specified function. |
| `forEach` | `const` | Applies the specified function to the entries of the `HashMap`. |
| `fromIterable` | `const` | Creates a new `HashMap` from an iterable collection of key/value pairs. |
| `get` | `const` | Safely lookup the value for the specified key in the `HashMap` using the internal hashing function. |
| `getHash` | `const` | Lookup the value for the specified key in the `HashMap` using a custom hash. |
| `getUnsafe` | `const` | Unsafely lookup the value for the specified key in the `HashMap` using the internal hashing function. |
| `has` | `const` | Checks if the specified key has an entry in the `HashMap`. |
| `hasBy` | `const` | Checks if an element matching the given predicate exists in the given `HashMap`. |
| `hasHash` | `const` | Checks if the specified key has an entry in the `HashMap` using a custom hash. |
| `HashMap` | `interface` | A HashMap is an immutable key-value data structure that provides efficient lookup, insertion, and deletion operations. It uses a Hash Array Mapped Trie (HAMT) internally for str... |
| `isEmpty` | `const` | Checks if the `HashMap` contains any entries. |
| `isHashMap` | `const` | Checks if a value is a HashMap. |
| `keys` | `const` | Returns an `IterableIterator` of the keys within the `HashMap`. |
| `make` | `const` | Constructs a new `HashMap` from an array of key/value pairs. |
| `map` | `const` | Maps over the entries of the `HashMap` using the specified function. |
| `modify` | `const` | Updates the value of the specified key within the `HashMap` if it exists. |
| `modifyAt` | `const` | Set or remove the specified key in the `HashMap` using the specified update function. The value of the specified key will be computed using the provided hash. |
| `modifyHash` | `const` | Alter the value of the specified key in the `HashMap` using the specified update function. The value of the specified key will be computed using the provided hash. |
| `mutate` | `const` | Mutates the `HashMap` within the context of the provided function. |
| `reduce` | `const` | Reduces the specified state over the entries of the `HashMap`. |
| `remove` | `const` | Remove the entry for the specified key in the `HashMap` using the internal hashing function. |
| `removeMany` | `const` | Removes all entries in the `HashMap` which have the specified keys. |
| `set` | `const` | Sets the specified key to the specified value using the internal hashing function. |
| `setMany` | `const` | Sets multiple key-value pairs in the `HashMap`. |
| `size` | `const` | Returns the number of entries within the `HashMap`. |
| `some` | `const` | Checks if any entry in a hashmap meets a specific condition. |
| `toEntries` | `const` | Returns an `Array<[K, V]>` of the entries within the `HashMap`. |
| `toValues` | `const` | Returns an `Array` of the values within the `HashMap`. |
| `union` | `const` | Performs a union of this `HashMap` and that `HashMap`. |
| `values` | `const` | Returns an `IterableIterator` of the values within the `HashMap`. |
