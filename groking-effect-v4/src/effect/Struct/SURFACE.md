# effect/Struct Surface

Total exports: 22

| Export | Kind | Overview |
|---|---|---|
| `Apply` | `type` | Applies a {@link Lambda} type-level function to a value type `V`, producing the output type. |
| `assign` | `const` | Merges two structs into a new struct. When both structs share a key, the value from `that` (the second struct) wins. |
| `Assign` | `type` | Merges two object types with properties from `U` taking precedence over `T` on overlapping keys (like `Object.assign` at the type level). |
| `evolve` | `const` | Selectively transforms values of a struct using per-key functions. Keys without a corresponding function are copied unchanged. |
| `evolveEntries` | `const` | Selectively transforms both keys and values of a struct. Each per-key function receives `(key, value)` and must return a `[newKey, newValue]` tuple. Keys without a corresponding... |
| `evolveKeys` | `const` | Selectively transforms keys of a struct using per-key functions. Keys without a corresponding function are copied unchanged. |
| `get` | `const` | Retrieves the value at `key` from a struct. |
| `keys` | `const` | Returns the string keys of a struct as a properly typed `Array<keyof S & string>`. |
| `lambda` | `const` | Wraps a plain function as a {@link Lambda} value so it can be used with {@link map}, {@link mapPick}, and {@link mapOmit}. |
| `Lambda` | `interface` | Interface for type-level functions used by {@link map}, {@link mapPick}, and {@link mapOmit}. |
| `makeCombiner` | `function` | Creates a `Combiner` for a struct shape by providing a `Combiner` for each property. When two structs are combined, each property is merged using its corresponding combiner. |
| `makeEquivalence` | `const` | Creates an `Equivalence` for a struct by providing an `Equivalence` for each property. Two structs are equivalent when all their corresponding properties are equivalent. |
| `makeOrder` | `const` | Creates an `Order` for a struct by providing an `Order` for each property. Properties are compared in the order they appear in the fields object; the first non-zero comparison d... |
| `makeReducer` | `function` | Creates a `Reducer` for a struct shape by providing a `Reducer` for each property. The initial value is derived from each property's `Reducer.initialValue`. When reducing a coll... |
| `map` | `const` | Applies a {@link Lambda} transformation to every value in a struct. |
| `mapOmit` | `const` | Applies a {@link Lambda} transformation to all keys except the specified ones; the excluded keys are copied unchanged. |
| `mapPick` | `const` | Applies a {@link Lambda} transformation only to the specified keys; all other keys are copied unchanged. |
| `Mutable` | `type` | Removes `readonly` modifiers from all properties of an object type. |
| `omit` | `const` | Creates a new struct with the specified keys removed. |
| `pick` | `const` | Creates a new struct containing only the specified keys. |
| `renameKeys` | `const` | Renames keys in a struct using a static `{ oldKey: newKey }` mapping. Keys not mentioned in the mapping are copied unchanged. |
| `Simplify` | `type` | Flattens intersection types into a single object type for readability. |
