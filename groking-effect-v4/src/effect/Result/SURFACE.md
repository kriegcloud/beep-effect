# effect/Result Surface

Total exports: 46

| Export | Kind | Overview |
|---|---|---|
| `all` | `const` | Collects a structure of `Result`s into a single `Result` of collected values. |
| `andThen` | `const` | A flexible variant of {@link flatMap} that accepts multiple input shapes. |
| `bind` | `const` | Adds a named field to the do-notation accumulator by running a `Result`-producing function that receives the current accumulated object. |
| `bindTo` | `const` | Wraps the success value of a `Result` into a named field, producing a `Result<Record<N, A>>`. This is typically used to start a do-notation chain from an existing `Result`. |
| `Do` | `const` | Starting point for the "do notation" simulation with `Result`. |
| `fail` | `const` | Creates a `Result` holding a `Failure` value. |
| `Failure` | `interface` | The failure variant of {@link Result}. Wraps an error of type `E`. |
| `failVoid` | `const` | A pre-built `Result<void>` holding `undefined` as its failure value. |
| `filterOrFail` | `const` | Validates the success value of a `Result` using a predicate, failing with a custom error if the predicate returns `false`. |
| `flatMap` | `const` | Chains a function that returns a `Result` onto a successful value. |
| `flip` | `const` | Swaps the success and failure channels of a `Result`. |
| `fromNullishOr` | `const` | Converts a possibly `null` or `undefined` value into a `Result`. |
| `fromOption` | `const` | Converts an `Option<A>` into a `Result<A, E>`. |
| `gen` | `const` | Generator-based syntax for composing `Result` values sequentially. |
| `getFailure` | `const` | Extracts the failure value as an `Option`, discarding the success. |
| `getOrElse` | `const` | Extracts the success value, or computes a fallback from the error. |
| `getOrNull` | `const` | Extracts the success value, or returns `null` on failure. |
| `getOrThrow` | `const` | Extracts the success value or throws the raw failure value `E`. |
| `getOrThrowWith` | `const` | Extracts the success value or throws a custom error derived from the failure. |
| `getOrUndefined` | `const` | Extracts the success value, or returns `undefined` on failure. |
| `getSuccess` | `const` | Extracts the success value as an `Option`, discarding the failure. |
| `isFailure` | `const` | Checks whether a `Result` is a `Failure`. |
| `isResult` | `const` | Tests whether a value is a `Result` (either `Success` or `Failure`). |
| `isSuccess` | `const` | Checks whether a `Result` is a `Success`. |
| `let` | `const` | No summary found in JSDoc. |
| `liftPredicate` | `const` | Lifts a value into a `Result` based on a predicate or refinement. |
| `makeEquivalence` | `const` | Creates an `Equivalence` for comparing two `Result` values. |
| `map` | `const` | Transforms the success channel of a `Result`, leaving the failure channel unchanged. |
| `mapBoth` | `const` | Transforms both the success and failure channels of a `Result`. |
| `mapError` | `const` | Transforms the failure channel of a `Result`, leaving the success channel unchanged. |
| `match` | `const` | Folds a `Result` into a single value by applying one of two functions. |
| `merge` | `const` | Unwraps a `Result` into `A \| E` by returning the inner value regardless of whether it is a success or failure. |
| `orElse` | `const` | Returns the original `Result` if it is a `Success`, otherwise applies `that` to the error and returns the resulting `Result`. |
| `Result` | `type` | A value that is either `Success<A, E>` or `Failure<A, E>`. |
| `ResultTypeLambda` | `interface` | Higher-kinded type representation for `Result`. |
| `ResultUnify` | `interface` | Type-level utility for unifying `Result` types in generic contexts. |
| `ResultUnifyIgnore` | `interface` | Marker interface for ignoring unification in `Result` types. |
| `succeed` | `const` | Creates a `Result` holding a `Success` value. |
| `succeedNone` | `const` | A pre-built `Result<Option<never>>` that succeeds with `None`. |
| `succeedSome` | `const` | Creates a `Result<Option<A>>` that succeeds with `Some(a)`. |
| `Success` | `interface` | The success variant of {@link Result}. Wraps a value of type `A`. |
| `tap` | `const` | Runs a side-effect on the success value without altering the `Result`. |
| `transposeMapOption` | `const` | Maps an `Option` value with a `Result`-producing function, then transposes the structure from `Option<Result<B, E>>` to `Result<Option<B>, E>`. |
| `transposeOption` | `const` | Transforms `Option<Result<A, E>>` into `Result<Option<A>, E>`. |
| `try` | `const` | No summary found in JSDoc. |
| `void` | `const` | No summary found in JSDoc. |
