# effect/MutableList Surface

Total exports: 18

| Export | Kind | Overview |
|---|---|---|
| `append` | `const` | Appends an element to the end of the MutableList. This operation is optimized for high-frequency usage. |
| `appendAll` | `const` | Appends all elements from an iterable to the end of the MutableList. Returns the number of elements added. |
| `appendAllUnsafe` | `const` | Appends all elements from a ReadonlyArray to the end of the MutableList. This is an optimized version that can reuse the array when mutable=true. Returns the number of elements ... |
| `clear` | `const` | Removes all elements from the MutableList, resetting it to an empty state. This operation is highly optimized and releases all internal memory. |
| `Empty` | `const` | A unique symbol used to represent an empty result when taking elements from a MutableList. This symbol is returned by `take` when the list is empty, allowing for safe type check... |
| `filter` | `const` | Filters the MutableList in place, keeping only elements that satisfy the predicate. This operation modifies the list and rebuilds its internal structure for efficiency. |
| `make` | `const` | Creates an empty MutableList. |
| `MutableList` | `interface` | A mutable linked list data structure optimized for high-throughput operations. MutableList provides efficient append/prepend operations and is ideal for producer-consumer patter... |
| `prepend` | `const` | Prepends an element to the beginning of the MutableList. This operation is optimized for high-frequency usage. |
| `prependAll` | `const` | Prepends all elements from an iterable to the beginning of the MutableList. The elements are added in order, so the first element in the iterable becomes the new head of the list. |
| `prependAllUnsafe` | `const` | Prepends all elements from a ReadonlyArray to the beginning of the MutableList. This is an optimized version that can reuse the array when mutable=true. |
| `remove` | `const` | Removes all occurrences of a specific value from the MutableList. This operation modifies the list in place. |
| `take` | `const` | Takes a single element from the beginning of the MutableList. Returns the element if available, or the Empty symbol if the list is empty. The taken element is removed from the l... |
| `takeAll` | `const` | Takes all elements from the MutableList and returns them as an array. The list becomes empty after this operation. This is equivalent to takeN(list, list.length). |
| `takeN` | `const` | Takes up to N elements from the beginning of the MutableList and returns them as an array. The taken elements are removed from the list. This operation is optimized for performa... |
| `takeNVoid` | `const` | No summary found in JSDoc. |
| `toArray` | `const` | No summary found in JSDoc. |
| `toArrayN` | `const` | No summary found in JSDoc. |
