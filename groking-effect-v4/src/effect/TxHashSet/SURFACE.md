# effect/TxHashSet Surface

Total exports: 22

| Export | Kind | Overview |
|---|---|---|
| `add` | `const` | Adds a value to the TxHashSet. If the value already exists, the operation has no effect. |
| `clear` | `const` | Removes all values from the TxHashSet. |
| `difference` | `const` | Creates the difference of two TxHashSets (elements in the first set that are not in the second), returning a new TxHashSet. |
| `empty` | `const` | Creates an empty TxHashSet. |
| `every` | `const` | Tests whether all values in the TxHashSet satisfy the predicate. |
| `filter` | `const` | Filters the TxHashSet keeping only values that satisfy the predicate, returning a new TxHashSet. |
| `fromHashSet` | `const` | Creates a TxHashSet from an existing HashSet. |
| `fromIterable` | `const` | Creates a TxHashSet from an iterable collection of values. |
| `has` | `const` | Checks if the TxHashSet contains the specified value. |
| `intersection` | `const` | Creates the intersection of two TxHashSets, returning a new TxHashSet. |
| `isEmpty` | `const` | Checks if the TxHashSet is empty. |
| `isSubset` | `const` | Checks if a TxHashSet is a subset of another TxHashSet. |
| `isTxHashSet` | `const` | Checks if a value is a TxHashSet. |
| `make` | `const` | Creates a TxHashSet from a variable number of values. |
| `map` | `const` | Maps each value in the TxHashSet using the provided function, returning a new TxHashSet. |
| `reduce` | `const` | Reduces the TxHashSet to a single value by iterating through the values and applying an accumulator function. |
| `remove` | `const` | Removes a value from the TxHashSet. |
| `size` | `const` | Returns the number of values in the TxHashSet. |
| `some` | `const` | Tests whether at least one value in the TxHashSet satisfies the predicate. |
| `toHashSet` | `const` | Converts the TxHashSet to an immutable HashSet snapshot. |
| `TxHashSet` | `interface` | A TxHashSet is a transactional hash set data structure that provides atomic operations on unique values within Effect transactions. It uses an immutable HashSet internally with ... |
| `union` | `const` | Creates the union of two TxHashSets, returning a new TxHashSet. |
