# effect/Sink Surface

Total exports: 75

| Export | Kind | Overview |
|---|---|---|
| `as` | `const` | Set the sink's result to a constant value. |
| `catch` | `const` | No summary found in JSDoc. |
| `catchCause` | `const` | No summary found in JSDoc. |
| `collect` | `const` | Accumulates incoming elements into an array. |
| `count` | `const` | A sink that counts the number of elements fed to it. |
| `die` | `const` | Creates a sink halting with a specified defect. |
| `drain` | `const` | Drains elements from the stream by ignoring all inputs. |
| `End` | `type` | No summary found in JSDoc. |
| `ensuring` | `const` | No summary found in JSDoc. |
| `every` | `const` | A sink that returns whether all elements satisfy the specified predicate. |
| `fail` | `const` | A sink that always fails with the specified error. |
| `failCause` | `const` | Creates a sink halting with a specified `Cause`. |
| `failCauseSync` | `const` | Creates a sink halting with a specified lazily evaluated `Cause`. |
| `failSync` | `const` | A sink that always fails with the specified lazily evaluated error. |
| `find` | `const` | Creates a sink containing the first matching value. |
| `findEffect` | `const` | Creates a sink containing the first matching value. |
| `flatMap` | `const` | Runs this sink until it yields a result, then uses that result to create another sink from the provided function which will continue to run until it yields a result. |
| `fold` | `const` | A sink that folds its inputs with the provided function, termination predicate and initial state. |
| `foldArray` | `const` | No summary found in JSDoc. |
| `foldUntil` | `const` | No summary found in JSDoc. |
| `forEach` | `const` | A sink that executes the provided effectful function for every item fed to it. |
| `forEachArray` | `const` | A sink that executes the provided effectful function for every Chunk fed to it. |
| `forEachWhile` | `const` | No summary found in JSDoc. |
| `forEachWhileArray` | `const` | No summary found in JSDoc. |
| `fromChannel` | `const` | Creates a sink from a `Channel`. |
| `fromEffect` | `const` | No summary found in JSDoc. |
| `fromEffectEnd` | `const` | No summary found in JSDoc. |
| `fromPubSub` | `const` | No summary found in JSDoc. |
| `fromQueue` | `const` | No summary found in JSDoc. |
| `fromTransform` | `const` | No summary found in JSDoc. |
| `head` | `const` | Creates a sink containing the first value. |
| `ignoreLeftover` | `const` | Drains the remaining elements from the stream after the sink finishes |
| `isSink` | `const` | Checks if a value is a Sink. |
| `last` | `const` | Creates a sink containing the last value. |
| `make` | `const` | No summary found in JSDoc. |
| `map` | `const` | Transforms this sink's result. |
| `mapEffect` | `const` | Effectfully transforms this sink's result. |
| `mapEffectEnd` | `const` | Effectfully transforms this sink's result. |
| `mapEnd` | `const` | Transforms this sink's result. |
| `mapError` | `const` | Transforms the errors emitted by this sink using `f`. |
| `mapInput` | `const` | Transforms this sink's input elements. |
| `mapInputArray` | `const` | Transforms this sink's input elements. |
| `mapInputArrayEffect` | `const` | Effectfully transforms this sink's input elements. |
| `mapInputEffect` | `const` | Effectfully transforms this sink's input elements. |
| `mapLeftover` | `const` | Transforms the leftovers emitted by this sink using `f`. |
| `never` | `const` | A sink that never completes. |
| `onExit` | `const` | No summary found in JSDoc. |
| `orElse` | `const` | No summary found in JSDoc. |
| `provideService` | `const` | No summary found in JSDoc. |
| `provideServices` | `const` | No summary found in JSDoc. |
| `reduce` | `const` | A sink that reduces its inputs using the provided function `f` starting from the provided `initial` state. |
| `reduceArray` | `const` | A sink that reduces its inputs using the provided function `f` starting from the specified `initial` state. |
| `reduceEffect` | `const` | A sink that reduces its inputs using the provided effectful function `f` starting from the specified `initial` state. |
| `reduceWhile` | `const` | A sink that reduces its inputs using the provided function `f` starting from the provided `initial` state while the specified `predicate` returns `true`. |
| `reduceWhileArray` | `const` | A sink that reduces its inputs using the provided function `f` starting from the provided `initial` state while the specified `predicate` returns `true`. |
| `reduceWhileArrayEffect` | `const` | A sink that reduces its inputs using the provided effectful function `f` starting from the provided `initial` state while the specified `predicate` returns `true`. |
| `reduceWhileEffect` | `const` | A sink that reduces its inputs using the provided effectful function `f` starting from the provided `initial` state while the specified `predicate` returns `true`. |
| `Sink` | `interface` | A `Sink<A, In, L, E, R>` is used to consume elements produced by a `Stream`. You can think of a sink as a function that will consume a variable amount of `In` elements (could be... |
| `SinkUnify` | `interface` | Interface for Sink unification, used internally by the Effect type system to provide proper type inference when using Sink with other Effect types. |
| `SinkUnifyIgnore` | `interface` | Interface used to ignore certain types during Sink unification. Part of the internal type system machinery. |
| `some` | `const` | A sink that returns whether an element satisfies the specified predicate. |
| `succeed` | `const` | A sink that immediately ends with the specified value. |
| `sum` | `const` | Creates a sink which sums up its inputs. |
| `summarized` | `const` | Summarize a sink by running an effect when the sink starts and again when it completes. |
| `suspend` | `const` | A sink that is created from a lazily evaluated sink. |
| `sync` | `const` | A sink that immediately ends with the specified lazily evaluated value. |
| `take` | `const` | No summary found in JSDoc. |
| `takeUntil` | `const` | No summary found in JSDoc. |
| `takeUntilEffect` | `const` | No summary found in JSDoc. |
| `takeWhile` | `const` | No summary found in JSDoc. |
| `takeWhileEffect` | `const` | No summary found in JSDoc. |
| `timed` | `const` | No summary found in JSDoc. |
| `toChannel` | `const` | Creates a `Channel` from a Sink. |
| `unwrap` | `const` | Creates a sink produced from a scoped effect. |
| `withDuration` | `const` | Returns the sink that executes this one and times its execution. |
