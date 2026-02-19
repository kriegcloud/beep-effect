# effect/Duration Surface

Total exports: 56

| Export | Kind | Overview |
|---|---|---|
| `abs` | `const` | Returns the absolute value of the duration. |
| `between` | `const` | Checks if a `Duration` is between a `minimum` and `maximum` value. |
| `clamp` | `const` | Clamps a Duration between a minimum and maximum value. |
| `CombinerMax` | `const` | A `Combiner` that returns the maximum `Duration`. |
| `CombinerMin` | `const` | A `Combiner` that returns the minimum `Duration`. |
| `days` | `const` | Creates a Duration from days. |
| `divide` | `const` | Divides a Duration by a number, returning `undefined` if division is invalid. |
| `divideUnsafe` | `const` | Divides a Duration by a number, potentially returning infinity or zero. |
| `Duration` | `interface` | Represents a span of time with high precision, supporting operations from nanoseconds to weeks. |
| `DurationInput` | `type` | Valid input types that can be converted to a Duration. |
| `DurationValue` | `type` | The internal representation of a `Duration` value. |
| `equals` | `const` | Checks if two Durations are equal. |
| `Equivalence` | `const` | Equivalence instance for `Duration`, allowing equality comparisons. |
| `format` | `const` | Converts a `Duration` to a human readable string. |
| `fromDurationInput` | `const` | Safely decodes a `DurationInput` value into a `Duration`, returning `undefined` if decoding fails. |
| `fromDurationInputUnsafe` | `const` | Decodes a `DurationInput` into a `Duration`. |
| `hours` | `const` | Creates a Duration from hours. |
| `infinity` | `const` | A Duration representing infinite time. |
| `isDuration` | `const` | Checks if a value is a Duration. |
| `isFinite` | `const` | Checks if a Duration is finite (not infinite). |
| `isGreaterThan` | `const` | Checks if the first Duration is greater than the second. |
| `isGreaterThanOrEqualTo` | `const` | Checks if the first Duration is greater than or equal to the second. |
| `isLessThan` | `const` | Checks if the first Duration is less than the second. |
| `isLessThanOrEqualTo` | `const` | Checks if the first Duration is less than or equal to the second. |
| `isNegative` | `const` | Returns `true` if the duration is negative (strictly less than zero). |
| `isPositive` | `const` | Returns `true` if the duration is positive (strictly greater than zero). |
| `isZero` | `const` | Checks if a Duration is zero. |
| `match` | `const` | Pattern matches on a Duration, providing different handlers for millis and nanos. |
| `matchPair` | `const` | Pattern matches on two `Duration`s, providing handlers that receive both values. |
| `max` | `const` | Returns the larger of two Durations. |
| `micros` | `const` | Creates a Duration from microseconds. |
| `millis` | `const` | Creates a Duration from milliseconds. |
| `min` | `const` | Returns the smaller of two Durations. |
| `minutes` | `const` | Creates a Duration from minutes. |
| `nanos` | `const` | Creates a Duration from nanoseconds. |
| `negate` | `const` | Negates the duration. |
| `negativeInfinity` | `const` | A Duration representing negative infinite time. |
| `Order` | `const` | Order instance for `Duration`, allowing comparison operations. |
| `parts` | `const` | Converts a `Duration` to its parts. |
| `ReducerSum` | `const` | A `Reducer` for summing `Duration`s. |
| `seconds` | `const` | Creates a Duration from seconds. |
| `subtract` | `const` | Subtracts one Duration from another. The result can be negative. |
| `sum` | `const` | Adds two Durations together. |
| `times` | `const` | Multiplies a Duration by a number. |
| `toDays` | `const` | Converts a Duration to days. |
| `toHours` | `const` | Converts a Duration to hours. |
| `toHrTime` | `const` | Converts a Duration to high-resolution time format [seconds, nanoseconds]. |
| `toMillis` | `const` | Converts a Duration to milliseconds. |
| `toMinutes` | `const` | Converts a Duration to minutes. |
| `toNanos` | `const` | Get the duration in nanoseconds as a bigint. |
| `toNanosUnsafe` | `const` | Get the duration in nanoseconds as a bigint. |
| `toSeconds` | `const` | Converts a Duration to seconds. |
| `toWeeks` | `const` | Converts a Duration to weeks. |
| `Unit` | `type` | Valid time units that can be used in duration string representations. |
| `weeks` | `const` | Creates a Duration from weeks. |
| `zero` | `const` | A Duration representing zero time. |
