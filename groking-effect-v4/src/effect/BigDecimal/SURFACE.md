# effect/BigDecimal Surface

Total exports: 46

| Export | Kind | Overview |
|---|---|---|
| `abs` | `const` | Determines the absolute value of a given `BigDecimal`. |
| `between` | `const` | Checks if a `BigDecimal` is between a `minimum` and `maximum` value (inclusive). |
| `BigDecimal` | `interface` | Represents an arbitrary precision decimal number. |
| `ceil` | `const` | Calculate the ceiling of a `BigDecimal` at the given scale. |
| `clamp` | `const` | Restricts the given `BigDecimal` to be within the range specified by the `minimum` and `maximum` values. |
| `digitAt` | `const` | Internal function used by `round` for `half-even` and `half-odd` rounding modes. |
| `divide` | `const` | Provides a division operation on `BigDecimal`s. |
| `divideUnsafe` | `const` | Provides an unsafe division operation on `BigDecimal`s. |
| `equals` | `const` | Checks if two `BigDecimal`s are equal. |
| `Equivalence` | `const` | Provides an `Equivalence` instance for `BigDecimal` that determines equality between BigDecimal values. |
| `floor` | `const` | Calculate the floor of a `BigDecimal` at the given scale. |
| `format` | `const` | Formats a given `BigDecimal` as a `string`. |
| `fromBigInt` | `const` | Creates a `BigDecimal` from a `bigint` value. |
| `fromNumber` | `const` | Creates a `BigDecimal` from a `number` value. |
| `fromNumberUnsafe` | `const` | Creates a `BigDecimal` from a `number` value. |
| `fromString` | `const` | Parses a numerical `string` into a `BigDecimal`. |
| `fromStringUnsafe` | `const` | Parses a numerical `string` into a `BigDecimal`. |
| `isBigDecimal` | `const` | Checks if a given value is a `BigDecimal`. |
| `isGreaterThan` | `const` | Returns `true` if the first argument is greater than the second, otherwise `false`. |
| `isGreaterThanOrEqualTo` | `const` | Checks if a given `BigDecimal` is greater than or equal to the provided one. |
| `isInteger` | `const` | Checks if a given `BigDecimal` is an integer. |
| `isLessThan` | `const` | Returns `true` if the first argument is less than the second, otherwise `false`. |
| `isLessThanOrEqualTo` | `const` | Checks if a given `BigDecimal` is less than or equal to the provided one. |
| `isNegative` | `const` | Checks if a given `BigDecimal` is negative. |
| `isPositive` | `const` | Checks if a given `BigDecimal` is positive. |
| `isZero` | `const` | Checks if a given `BigDecimal` is `0`. |
| `make` | `const` | Creates a `BigDecimal` from a `bigint` value and a scale. |
| `makeNormalizedUnsafe` | `const` | Internal function used to create pre-normalized `BigDecimal`s. |
| `max` | `const` | Returns the maximum between two `BigDecimal`s. |
| `min` | `const` | Returns the minimum between two `BigDecimal`s. |
| `multiply` | `const` | Provides a multiplication operation on `BigDecimal`s. |
| `negate` | `const` | Provides a negate operation on `BigDecimal`s. |
| `normalize` | `const` | Normalizes a given `BigDecimal` by removing trailing zeros. |
| `Order` | `const` | Provides an `Order` instance for `BigDecimal` that allows comparing and sorting BigDecimal values. |
| `remainder` | `const` | Returns the remainder left over when one operand is divided by a second operand. |
| `remainderUnsafe` | `const` | Returns the remainder left over when one operand is divided by a second operand. |
| `round` | `const` | Rounds a `BigDecimal` at the given scale with the specified rounding mode. |
| `RoundingMode` | `type` | Rounding modes for `BigDecimal`. |
| `roundTerminal` | `const` | Internal function used for rounding. |
| `scale` | `const` | Scales a given `BigDecimal` to the specified scale. |
| `sign` | `const` | Determines the sign of a given `BigDecimal`. |
| `subtract` | `const` | Provides a subtraction operation on `BigDecimal`s. |
| `sum` | `const` | Provides an addition operation on `BigDecimal`s. |
| `toExponential` | `const` | Formats a given `BigDecimal` as a `string` in scientific notation. |
| `toNumberUnsafe` | `const` | Converts a `BigDecimal` to a `number`. |
| `truncate` | `const` | Truncate a `BigDecimal` at the given scale. This is the same operation as rounding away from zero. |
