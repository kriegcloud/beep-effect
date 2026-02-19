# effect/Option Surface

Total exports: 66

| Export | Kind | Overview |
|---|---|---|
| `all` | `const` | Combines a structure of `Option`s (tuple, struct, or iterable) into a single `Option` containing the unwrapped structure. |
| `andThen` | `const` | Chains a second computation onto an `Option`. The second value can be a plain value, an `Option`, or a function returning either. |
| `as` | `const` | Replaces the value inside a `Some` with a constant, leaving `None` unchanged. |
| `asVoid` | `const` | Replaces the value inside a `Some` with `void` (`undefined`), leaving `None` unchanged. |
| `bind` | `const` | Adds an `Option` value to the do notation record under a given name. If the `Option` is `None`, the whole pipeline short-circuits to `None`. |
| `bindTo` | `const` | Gives a name to the value of an `Option`, creating a single-key record inside `Some`. Starting point for the do notation pipeline. |
| `composeK` | `const` | Composes two `Option`-returning functions into a single function that chains them together. |
| `contains` | `const` | Checks if an `Option` contains a value equal to the given one, using default structural equality. |
| `containsWith` | `const` | Checks if an `Option` contains a value equivalent to the given one, using a custom `Equivalence`. |
| `Do` | `const` | An `Option` containing an empty record `{}`, used as the starting point for do notation chains. |
| `exists` | `const` | Tests if the value in a `Some` satisfies a predicate or refinement. |
| `filter` | `const` | Filters an `Option` using a predicate. Returns `None` if the predicate is not satisfied or the input is `None`. |
| `filterMap` | `const` | Alias of {@link flatMap}. Applies a function returning `Option` to the value inside a `Some`, flattening the result. |
| `firstSomeOf` | `const` | Returns the first `Some` found in an iterable of `Option`s, or `None` if all are `None`. |
| `flatMap` | `const` | Applies a function that returns an `Option` to the value of a `Some`, flattening the result. Returns `None` if the input is `None`. |
| `flatMapNullishOr` | `const` | Combines {@link flatMap} with {@link fromNullishOr}: applies a function that may return `null`/`undefined` to the value of a `Some`. |
| `flatten` | `const` | Flattens a nested `Option<Option<A>>` into `Option<A>`. |
| `fromIterable` | `const` | Wraps the first element of an `Iterable` in a `Some`, or returns `None` if the iterable is empty. |
| `fromNullishOr` | `const` | Converts a nullable value (`null` or `undefined`) into an `Option`. |
| `fromNullOr` | `const` | Converts a possibly `null` value into an `Option`, leaving `undefined` as a valid `Some`. |
| `fromUndefinedOr` | `const` | Converts a possibly `undefined` value into an `Option`, leaving `null` as a valid `Some`. |
| `gen` | `const` | Generator-based syntax for `Option`, similar to `async`/`await` but for optional values. Yielding a `None` short-circuits the generator to `None`. |
| `getFailure` | `const` | Converts a `Result` into an `Option`, keeping only the error value. |
| `getOrElse` | `const` | Extracts the value from a `Some`, or evaluates a fallback thunk on `None`. |
| `getOrNull` | `const` | Extracts the value from a `Some`, or returns `null` for `None`. |
| `getOrThrow` | `const` | Extracts the value from a `Some`, or throws a default `Error` for `None`. |
| `getOrThrowWith` | `const` | Extracts the value from a `Some`, or throws a custom error for `None`. |
| `getOrUndefined` | `const` | Extracts the value from a `Some`, or returns `undefined` for `None`. |
| `getSuccess` | `const` | Converts a `Result` into an `Option`, keeping only the success value. |
| `isNone` | `const` | Checks whether an `Option` is `None` (absent). |
| `isOption` | `const` | Determines whether the given value is an `Option`. |
| `isSome` | `const` | Checks whether an `Option` contains a value (`Some`). |
| `let` | `const` | No summary found in JSDoc. |
| `lift2` | `const` | Lifts a binary function to operate on two `Option` values. |
| `liftNullishOr` | `const` | Lifts a function that may return `null` or `undefined` into one that returns an `Option`. |
| `liftPredicate` | `const` | Lifts a `Predicate` or `Refinement` into the `Option` context: returns `Some(value)` when the predicate holds, `None` otherwise. |
| `liftThrowable` | `const` | Lifts a function that may throw into one that returns an `Option`. |
| `makeCombinerFailFast` | `function` | Creates a `Combiner` for `Option<A>` with fail-fast semantics: returns `None` if either operand is `None`. |
| `makeEquivalence` | `const` | Creates an `Equivalence` for `Option<A>` from an `Equivalence` for `A`. |
| `makeOrder` | `const` | Creates an `Order` for `Option<A>` from an `Order` for `A`. |
| `makeReducer` | `function` | Creates a `Reducer` for `Option<A>` that prioritizes the first non-`None` value and combines values when both are `Some`. |
| `makeReducerFailFast` | `function` | Creates a `Reducer` for `Option<A>` by lifting an existing `Reducer` with fail-fast semantics. |
| `map` | `const` | Transforms the value inside a `Some` using the provided function, leaving `None` unchanged. |
| `match` | `const` | Pattern-matches on an `Option`, handling both `None` and `Some` cases. |
| `none` | `const` | Creates an `Option` representing the absence of a value. |
| `None` | `interface` | Represents the absence of a value within an {@link Option}. |
| `Option` | `type` | The `Option` data type represents optional values. An `Option<A>` is either `Some<A>`, containing a value of type `A`, or `None`, representing absence. |
| `OptionTypeLambda` | `interface` | Type lambda interface for higher-kinded type encodings with `Option`. |
| `OptionUnify` | `interface` | Internal unification interface for `Option` types. Used by the Effect library's type system for type-level operations. |
| `OptionUnifyIgnore` | `interface` | Internal interface for type unification ignore behavior. |
| `orElse` | `const` | Returns the fallback `Option` if `self` is `None`; otherwise returns `self`. |
| `orElseResult` | `const` | Like {@link orElse}, but wraps the result in a `Result` to indicate the source of the value. |
| `orElseSome` | `const` | Returns `Some` of the fallback value if `self` is `None`; otherwise returns `self`. |
| `partitionMap` | `const` | Splits an `Option` into two `Option`s using a function that returns a `Result`. |
| `product` | `const` | Combines two `Option`s into a `Some` containing a tuple `[A, B]` if both are `Some`. |
| `productMany` | `const` | Combines a primary `Option` with an iterable of `Option`s into a tuple if all are `Some`. |
| `reduceCompact` | `const` | Reduces an iterable of `Option`s to a single value, skipping `None` entries. |
| `some` | `const` | Wraps the given value into an `Option` to represent its presence. |
| `Some` | `interface` | Represents the presence of a value within an {@link Option}. |
| `tap` | `const` | Runs a side-effecting `Option`-returning function on the value of a `Some`, returning the original `Option` if the function returns `Some`, or `None` if it returns `None`. |
| `toArray` | `const` | Converts an `Option` into an `Array`. |
| `toRefinement` | `const` | Converts an `Option`-returning function into a type guard (refinement). |
| `void` | `const` | No summary found in JSDoc. |
| `zipLeft` | `const` | Sequences two `Option`s, keeping the value from the first if both are `Some`. |
| `zipRight` | `const` | Sequences two `Option`s, keeping the value from the second if both are `Some`. |
| `zipWith` | `const` | Combines two `Option`s using a provided function. |
