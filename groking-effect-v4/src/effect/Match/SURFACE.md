# effect/Match Surface

Total exports: 45

| Export | Kind | Overview |
|---|---|---|
| `any` | `const` | Matches any value without restrictions. |
| `bigint` | `const` | Matches values of type `bigint`. |
| `boolean` | `const` | Matches values of type `boolean`. |
| `Case` | `type` | Represents a single pattern matching case. |
| `date` | `const` | Matches values that are instances of `Date`. |
| `defined` | `const` | Matches any defined (non-null and non-undefined) value. |
| `discriminator` | `const` | Matches values based on a specified discriminant field. |
| `discriminators` | `const` | Matches values based on a field that serves as a discriminator, mapping each possible value to a corresponding handler. |
| `discriminatorsExhaustive` | `const` | Matches values based on a discriminator field and **ensures all cases are handled**. |
| `discriminatorStartsWith` | `const` | Matches values where a specified field starts with a given prefix. |
| `exhaustive` | `const` | The `Match.exhaustive` method finalizes the pattern matching process by ensuring that all possible cases are accounted for. If any case is missing, TypeScript will produce a typ... |
| `instanceOf` | `const` | Matches instances of a given class. |
| `instanceOfUnsafe` | `const` | Unsafe variant of `instanceOf` that allows matching without type narrowing. |
| `is` | `const` | Matches a specific set of literal values (e.g., `Match.is("a", 42, true)`). |
| `Matcher` | `type` | Pattern matching follows a structured process: |
| `nonEmptyString` | `const` | Matches non-empty strings. |
| `not` | `const` | Excludes a specific value from matching while allowing all others. |
| `Not` | `interface` | Represents a negative pattern matching case. |
| `null` | `const` | No summary found in JSDoc. |
| `number` | `const` | Matches values of type `number`. |
| `option` | `const` | Wraps the match result in an `Option`, representing an optional match. |
| `orElse` | `const` | Provides a fallback value when no patterns match. |
| `orElseAbsurd` | `const` | Throws an error if no pattern matches. |
| `record` | `const` | Matches objects where keys are `string` or `symbol` and values are `unknown`. |
| `result` | `const` | Wraps the match result in a `Result`, distinguishing matched and unmatched cases. |
| `SafeRefinement` | `interface` | A safe refinement that narrows types without runtime errors. |
| `string` | `const` | Matches values of type `string`. |
| `symbol` | `const` | Matches values of type `symbol`. |
| `tag` | `const` | The `Match.tag` function allows pattern matching based on the `_tag` field in a [Discriminated Union](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.h... |
| `tags` | `const` | Matches values based on their `_tag` field, mapping each tag to a corresponding handler. |
| `tagsExhaustive` | `const` | Matches values based on their `_tag` field and requires handling of all possible cases. |
| `tagStartsWith` | `const` | Matches values where the `_tag` field starts with a given prefix. |
| `type` | `const` | Creates a matcher for a specific type. |
| `TypeMatcher` | `interface` | Represents a pattern matcher that operates on types rather than specific values. |
| `Types` | `namespace` | A namespace containing utility types for Match operations. |
| `typeTags` | `const` | Creates a type-safe match function for discriminated unions based on `_tag` field. |
| `undefined` | `const` | No summary found in JSDoc. |
| `value` | `const` | Creates a matcher from a specific value. |
| `ValueMatcher` | `interface` | Represents a pattern matcher that operates on a specific provided value. |
| `valueTags` | `const` | Creates a match function for a specific value with discriminated union handling. |
| `when` | `const` | Defines a condition for matching values. |
| `When` | `interface` | Represents a positive pattern matching case. |
| `whenAnd` | `const` | Matches a value that satisfies all provided patterns. |
| `whenOr` | `const` | Matches one of multiple patterns in a single condition. |
| `withReturnType` | `const` | Ensures that all branches of a matcher return a specific type. |
