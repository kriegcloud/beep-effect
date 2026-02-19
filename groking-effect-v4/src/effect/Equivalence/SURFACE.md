# effect/Equivalence Surface

Total exports: 16

| Export | Kind | Overview |
|---|---|---|
| `Array` | `function` | Creates an equivalence for arrays where all elements are compared using the same equivalence. |
| `BigInt` | `const` | An `Equivalence` instance for bigints using strict equality (`===`). |
| `Boolean` | `const` | An `Equivalence` instance for booleans using strict equality (`===`). |
| `combine` | `const` | Combines two equivalence relations using logical AND. |
| `combineAll` | `const` | Combines multiple equivalence relations into a single equivalence using logical AND. |
| `Equivalence` | `type` | Represents an equivalence relation over type `A`. |
| `EquivalenceTypeLambda` | `interface` | Type lambda for `Equivalence`, used for higher-kinded type operations. |
| `make` | `const` | Creates a custom equivalence relation with an optimized reference equality check. |
| `makeReducer` | `function` | Creates a `Reducer` for combining `Equivalence` instances, useful for aggregating equivalences in collections. |
| `mapInput` | `const` | Transforms an equivalence relation by mapping the input values before comparison. |
| `Number` | `const` | An `Equivalence` instance for numbers. |
| `Record` | `function` | Creates an equivalence for objects by comparing all properties using the same equivalence. |
| `strictEqual` | `const` | Creates an equivalence relation that uses strict equality (`===`) to compare values. |
| `String` | `const` | An `Equivalence` instance for strings using strict equality (`===`). |
| `Struct` | `function` | Creates an equivalence for objects by comparing their properties using provided equivalences. |
| `Tuple` | `function` | Creates an equivalence for tuples with heterogeneous element types. |
