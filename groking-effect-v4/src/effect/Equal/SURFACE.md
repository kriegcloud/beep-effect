# effect/Equal Surface

Total exports: 9

| Export | Kind | Overview |
|---|---|---|
| `asEquivalence` | `const` | Creates an `Equivalence` instance using the `equals` function. This allows the equality logic to be used with APIs that expect an `Equivalence`. |
| `byReference` | `const` | Creates a proxy of an object that uses reference equality instead of structural equality. |
| `byReferenceUnsafe` | `const` | Marks an object to use reference equality instead of structural equality, without creating a proxy. |
| `Equal` | `interface` | An interface defining objects that can determine equality with other `Equal` objects. Objects implementing this interface must also implement `Hash` for consistency. |
| `equals` | `function` | Compares two values for structural equality. Returns `true` if the values are structurally equal, `false` otherwise. |
| `isEqual` | `const` | Determines if a value implements the `Equal` interface. |
| `makeCompareMap` | `function` | No summary found in JSDoc. |
| `makeCompareSet` | `function` | No summary found in JSDoc. |
| `symbol` | `const` | The unique identifier used to identify objects that implement the `Equal` interface. |
