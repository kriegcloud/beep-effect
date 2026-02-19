# effect/BigInt Surface

Total exports: 35

| Export | Kind | Overview |
|---|---|---|
| `abs` | `const` | Determines the absolute value of a given `bigint`. |
| `between` | `const` | Checks if a `bigint` is between a `minimum` and `maximum` value (inclusive). |
| `BigInt` | `const` | Reference to the global BigInt constructor. |
| `clamp` | `const` | Restricts the given `bigint` to be within the range specified by the `minimum` and `maximum` values. |
| `CombinerMax` | `const` | A `Combiner` that returns the maximum `bigint`. |
| `CombinerMin` | `const` | A `Combiner` that returns the minimum `bigint`. |
| `decrement` | `const` | Decrements a number by `1n`. |
| `divide` | `const` | Provides a division operation on `bigint`s. |
| `divideUnsafe` | `const` | Provides a division operation on `bigint`s. |
| `Equivalence` | `const` | An `Equivalence` instance for bigints using strict equality (`===`). |
| `fromNumber` | `function` | Converts a number to a `bigint`. |
| `fromString` | `const` | Converts a string to a `bigint`. |
| `gcd` | `const` | Determines the greatest common divisor of two `bigint`s. |
| `increment` | `const` | Returns the result of adding `1n` to a given number. |
| `isBigInt` | `const` | Tests if a value is a `bigint`. |
| `isGreaterThan` | `const` | Returns `true` if the first argument is greater than the second, otherwise `false`. |
| `isGreaterThanOrEqualTo` | `const` | Returns a function that checks if a given `bigint` is greater than or equal to the provided one. |
| `isLessThan` | `const` | Returns `true` if the first argument is less than the second, otherwise `false`. |
| `isLessThanOrEqualTo` | `const` | Returns a function that checks if a given `bigint` is less than or equal to the provided one. |
| `lcm` | `const` | Determines the least common multiple of two `bigint`s. |
| `max` | `const` | Returns the maximum between two `bigint`s. |
| `min` | `const` | Returns the minimum between two `bigint`s. |
| `multiply` | `const` | Provides a multiplication operation on `bigint`s. |
| `multiplyAll` | `const` | Takes an `Iterable` of `bigint`s and returns their multiplication as a single `number`. |
| `Order` | `const` | Provides an `Order` instance for `bigint` that allows comparing and sorting BigInt values. |
| `ReducerMultiply` | `const` | A `Reducer` for combining `bigint`s using multiplication. |
| `ReducerSum` | `const` | A `Reducer` for combining `bigint`s using addition. |
| `remainder` | `const` | Returns the remainder of dividing the first `bigint` by the second `bigint`. |
| `sign` | `const` | Determines the sign of a given `bigint`. |
| `sqrt` | `const` | Determines the square root of a given `bigint` safely. Returns `undefined` if the given `bigint` is negative. |
| `sqrtUnsafe` | `const` | Determines the square root of a given `bigint` unsafely. Throws if the given `bigint` is negative. |
| `subtract` | `const` | Provides a subtraction operation on `bigint`s. |
| `sum` | `const` | Provides an addition operation on `bigint`s. |
| `sumAll` | `const` | Takes an `Iterable` of `bigint`s and returns their sum as a single `bigint |
| `toNumber` | `const` | Converts a `bigint` to a `number`. |
