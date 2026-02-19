# effect/Tuple Surface

Total exports: 17

| Export | Kind | Overview |
|---|---|---|
| `appendElement` | `const` | Appends a single element to the end of a tuple. |
| `appendElements` | `const` | Concatenates two tuples into a single tuple. |
| `evolve` | `const` | Transforms elements of a tuple by providing an array of transform functions. Each function applies to the element at the same position. Positions beyond the array's length are c... |
| `get` | `const` | Retrieves the element at the specified index from a tuple. |
| `isTupleOf` | `const` | Checks whether a readonly array has exactly `n` elements. |
| `isTupleOfAtLeast` | `const` | Checks whether a readonly array has at least `n` elements. |
| `make` | `const` | Creates a tuple from the provided arguments. |
| `makeCombiner` | `function` | Creates a `Combiner` for a tuple shape by providing a `Combiner` for each position. When two tuples are combined, each element is merged using its corresponding combiner. |
| `makeEquivalence` | `const` | Creates an `Equivalence` for tuples by comparing corresponding elements using the provided per-position `Equivalence`s. Two tuples are equivalent when all their corresponding el... |
| `makeOrder` | `const` | Creates an `Order` for tuples by comparing corresponding elements using the provided per-position `Order`s. Elements are compared left-to-right; the first non-zero comparison de... |
| `makeReducer` | `function` | Creates a `Reducer` for a tuple shape by providing a `Reducer` for each position. The initial value is derived from each position's `Reducer.initialValue`. When reducing a colle... |
| `map` | `const` | Applies a `Struct.Lambda` transformation to every element in a tuple. |
| `mapOmit` | `const` | Applies a `Struct.Lambda` transformation to all elements except those at the specified indices; the excluded elements are copied unchanged. |
| `mapPick` | `const` | Applies a `Struct.Lambda` transformation only to the elements at the specified indices; all other elements are copied unchanged. |
| `omit` | `const` | Creates a new tuple with the elements at the specified indices removed. |
| `pick` | `const` | Creates a new tuple containing only the elements at the specified indices. |
| `renameIndices` | `const` | Rearranges elements of a tuple by providing an array of stringified source indices. Each position in the array specifies which index to read from (e.g., `["2", "1", "0"]` revers... |
