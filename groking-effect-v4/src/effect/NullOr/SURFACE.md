# effect/NullOr Surface

Total exports: 8

| Export | Kind | Overview |
|---|---|---|
| `getOrThrow` | `const` | No summary found in JSDoc. |
| `getOrThrowWith` | `const` | No summary found in JSDoc. |
| `liftThrowable` | `const` | No summary found in JSDoc. |
| `makeCombinerFailFast` | `function` | Creates a `Combiner` for `NullOr<A>` that only combines values when both operands are not `null`, failing fast if either is `null`. |
| `makeReducer` | `function` | Creates a `Reducer` for `NullOr<A>` that prioritizes the first non-`null` value and combines values when both operands are present. |
| `makeReducerFailFast` | `function` | Creates a `Reducer` for `NullOr<A>` by wrapping an existing `Reducer` with fail-fast semantics for `NullOr` values. |
| `map` | `const` | No summary found in JSDoc. |
| `match` | `const` | No summary found in JSDoc. |
