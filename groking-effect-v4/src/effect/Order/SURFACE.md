# effect/Order Surface

Total exports: 25

| Export | Kind | Overview |
|---|---|---|
| `alwaysEqual` | `function` | Creates an `Order` that considers all values as equal. |
| `Array` | `function` | Creates an `Order` for arrays by applying the given `Order` to each element, then comparing by length if all elements are equal. |
| `BigInt` | `const` | An `Order` instance for bigints that compares them numerically. |
| `Boolean` | `const` | An `Order` instance for booleans where `false` is considered less than `true`. |
| `clamp` | `const` | Clamps a value between a minimum and a maximum according to the given order. |
| `combine` | `const` | Combines two `Order` instances to create a new `Order` that first compares using the first `Order`, and if the values are equal, then compares using the second `Order`. |
| `combineAll` | `function` | Combines all `Order` instances in the provided collection into a single `Order`. The resulting `Order` compares using each `Order` in sequence until a non-zero result is found. |
| `Date` | `const` | An `Order` instance for `Date` objects that compares them chronologically by their timestamp. |
| `flip` | `function` | Creates a new `Order` that reverses the comparison order of the input `Order`. |
| `isBetween` | `const` | Tests whether a value is between a minimum and a maximum (inclusive) according to the given order. |
| `isGreaterThan` | `const` | Tests whether one value is strictly greater than another according to the given order. |
| `isGreaterThanOrEqualTo` | `const` | Tests whether one value is greater than or equal to another according to the given order. |
| `isLessThan` | `const` | Tests whether one value is strictly less than another according to the given order. |
| `isLessThanOrEqualTo` | `const` | Tests whether one value is less than or equal to another according to the given order. |
| `make` | `function` | Creates a new `Order` instance from a comparison function. |
| `makeReducer` | `function` | Creates a `Reducer` for combining `Order` instances, useful for aggregating orders in collections. |
| `mapInput` | `const` | Transforms an `Order` on type `A` into an `Order` on type `B` by providing a function that maps values of type `B` to values of type `A`. |
| `max` | `const` | Returns the maximum of two values according to the given order. If they are equal, returns the first argument. |
| `min` | `const` | Returns the minimum of two values according to the given order. If they are equal, returns the first argument. |
| `Number` | `const` | An `Order` instance for numbers that compares them numerically. |
| `Order` | `interface` | Represents a total ordering for values of type `A`. |
| `OrderTypeLambda` | `interface` | Type lambda for the `Order` type class, used internally for higher-kinded type operations. |
| `String` | `const` | An `Order` instance for strings that compares them lexicographically using JavaScript's `<` operator. |
| `Struct` | `function` | Creates an `Order` for structs by applying the given `Order`s to each property in sequence. |
| `Tuple` | `function` | Creates an `Order` for a tuple type based on orders for each element. |
