# effect/TxChunk Surface

Total exports: 22

| Export | Kind | Overview |
|---|---|---|
| `append` | `const` | Appends an element to the end of the `TxChunk`. |
| `appendAll` | `const` | Concatenates another chunk to the end of the `TxChunk`. |
| `concat` | `const` | Concatenates another `TxChunk` to the end of this `TxChunk`. |
| `drop` | `const` | Drops the first `n` elements from the `TxChunk`. |
| `empty` | `const` | Creates a new empty `TxChunk`. |
| `filter` | `const` | Filters the `TxChunk` keeping only elements that satisfy the predicate. |
| `fromIterable` | `const` | Creates a new `TxChunk` from an iterable. |
| `get` | `const` | Reads the current chunk from the `TxChunk`. |
| `isEmpty` | `const` | Checks if the `TxChunk` is empty. |
| `isNonEmpty` | `const` | Checks if the `TxChunk` is non-empty. |
| `make` | `const` | Creates a new `TxChunk` with the specified initial chunk. |
| `makeUnsafe` | `const` | Creates a new `TxChunk` with the specified TxRef. |
| `map` | `const` | Maps each element of the `TxChunk` using the provided function. Note: This only works when the mapped type B is assignable to A. |
| `modify` | `const` | Modifies the value of the `TxChunk` using the provided function. |
| `prepend` | `const` | Prepends an element to the beginning of the `TxChunk`. |
| `prependAll` | `const` | Concatenates another chunk to the beginning of the `TxChunk`. |
| `set` | `const` | Sets the value of the `TxChunk`. |
| `size` | `const` | Gets the size of the `TxChunk`. |
| `slice` | `const` | Takes a slice of the `TxChunk` from `start` to `end` (exclusive). |
| `take` | `const` | Takes the first `n` elements from the `TxChunk`. |
| `TxChunk` | `interface` | TxChunk is a transactional chunk data structure that provides Software Transactional Memory (STM) semantics for chunk operations. |
| `update` | `const` | Updates the value of the `TxChunk` using the provided function. |
