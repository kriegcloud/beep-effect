# effect/Stream Surface

Total exports: 230

| Export | Kind | Overview |
|---|---|---|
| `accumulate` | `const` | Accumulates elements into a growing array, emitting the cumulative array for each input chunk. |
| `aggregate` | `const` | Aggregates elements using the provided sink and emits each sink result as a stream element. |
| `aggregateWithin` | `const` | Aggregates elements with a sink, emitting each result when the sink completes or the schedule triggers. |
| `bind` | `const` | Binds the result of a stream to a field in the do-notation record. |
| `bindEffect` | `const` | Binds an Effect-produced value into the do-notation record for each stream element. |
| `bindTo` | `const` | Maps each element into a record keyed by the provided name. |
| `broadcast` | `const` | Creates a PubSub-backed stream that multicasts the source to all subscribers. |
| `buffer` | `const` | Buffers up to `capacity` elements so a faster producer can progress independently of a slower consumer. |
| `bufferArray` | `const` | Allows a faster producer to progress independently of a slower consumer by buffering up to `capacity` chunks in a queue. |
| `callback` | `const` | Creates a stream from a callback that can emit values into a queue. |
| `catch` | `const` | No summary found in JSDoc. |
| `catchCause` | `const` | Switches over to the stream produced by the provided function in case this one fails. Allows recovery from all causes of failure, including interruption if the stream is uninter... |
| `catchCauseIf` | `const` | Recovers from stream failures by filtering the `Cause` and switching to a recovery stream. Non-matching causes are re-emitted as failures. |
| `catchIf` | `const` | Recovers from errors that match a filter by switching to a recovery stream. |
| `catchReason` | `const` | Catches a specific reason within a tagged error. |
| `catchReasons` | `const` | Catches multiple reasons within a tagged error using an object of handlers. |
| `catchTag` | `const` | Recovers from failures whose `_tag` matches the provided value by switching to the stream returned by `f`. |
| `catchTags` | `const` | Switches to a recovery stream based on matching `_tag` handlers. |
| `changes` | `const` | Emits only elements that differ from the previous one. |
| `changesWith` | `const` | Returns a stream that only emits elements that are not equal to the previously emitted element, as determined by the specified predicate. |
| `changesWithEffect` | `const` | Emits only elements that differ from the previous element, using an effectful equality check. |
| `chunks` | `const` | Exposes the underlying chunks as a stream of non-empty arrays. |
| `collect` | `const` | Collects all elements into an array and emits it as a single element. |
| `combine` | `const` | Combines elements from this stream and the specified stream by repeatedly applying a stateful function that can pull from either side. |
| `combineArray` | `const` | Combines the arrays (chunks) from this stream and the specified stream by repeatedly applying the function `f` to extract an array using both sides and conceptually "offer" it t... |
| `concat` | `const` | Concatenates two streams, emitting all elements from the first stream followed by all elements from the second stream. |
| `cross` | `const` | Creates the cartesian product of two streams, running the `right` stream for each element in the `left` stream. |
| `crossWith` | `const` | Creates a cartesian product of elements from two streams using a function. |
| `debounce` | `const` | Drops earlier elements within the debounce window and emits only the latest element after the pause. |
| `decodeText` | `const` | Decodes Uint8Array chunks into strings using TextDecoder with an optional encoding. |
| `DefaultChunkSize` | `const` | The default chunk size used by Stream constructors and combinators. |
| `die` | `const` | The stream that dies with the specified defect. |
| `Do` | `const` | Provides the entry point for do-notation style stream composition. |
| `drain` | `const` | Converts this stream to one that runs its effects but emits no elements. |
| `drainFork` | `const` | Runs the provided stream in the background while this stream runs, interrupting it when this stream completes and failing if the background stream fails or defects. |
| `drop` | `const` | Drops the first `n` elements from this stream. |
| `dropRight` | `const` | Drops the last specified number of elements from this stream. |
| `dropUntil` | `const` | Drops elements until the specified predicate evaluates to `true`, then drops that matching element. |
| `dropUntilEffect` | `const` | Drops all elements of the stream until the specified effectful predicate evaluates to `true`. |
| `dropWhile` | `const` | Drops elements from the stream while the specified predicate evaluates to `true`. |
| `dropWhileEffect` | `const` | Drops elements while the specified effectful predicate evaluates to `true`. |
| `empty` | `const` | Creates an empty stream. |
| `encodeText` | `const` | Encodes a stream of strings into UTF-8 `Uint8Array` chunks. |
| `ensuring` | `const` | Executes the provided finalizer after this stream's finalizers run. |
| `Error` | `type` | Extract the error type from a Stream type. |
| `EventListener` | `interface` | Interface representing an event listener target. |
| `fail` | `const` | Terminates with the specified error. |
| `failCause` | `const` | Creates a stream that fails with the specified `Cause`. |
| `failCauseSync` | `const` | The stream that always fails with the specified lazily evaluated `Cause`. |
| `failSync` | `const` | Terminates with the specified lazily evaluated error. |
| `filter` | `const` | Filters a stream to the elements that satisfy a predicate. |
| `filterEffect` | `const` | Effectfully filters and maps elements in a single pass. |
| `flatMap` | `const` | Maps each element to a stream and concatenates the results in order. |
| `flatten` | `const` | Flattens a stream of streams into a single stream by concatenating the inner streams in strict order. |
| `flattenArray` | `const` | Flattens a stream of non-empty arrays into a stream of elements. |
| `flattenEffect` | `const` | Flattens a stream of `Effect` values into a stream of their results. |
| `flattenIterable` | `const` | Submerges the iterables emitted by this stream into the stream's structure. |
| `flattenTake` | `const` | Unwraps `Take` values, emitting elements from non-empty arrays and ending or failing when the `Exit` signals completion. |
| `forever` | `const` | Repeats this stream forever. |
| `fromArray` | `const` | Creates a stream from an array of values. |
| `fromArrayEffect` | `const` | Creates a stream from an effect that produces an array of values. |
| `fromArrays` | `const` | Creates a stream from an arbitrary number of arrays. |
| `fromAsyncIterable` | `const` | Creates a stream from an AsyncIterable. |
| `fromChannel` | `const` | Creates a stream from a array-emitting `Channel`. |
| `fromEffect` | `const` | Either emits the success value of this effect or terminates the stream with the failure value of this effect. |
| `fromEffectDrain` | `const` | Creates a stream that runs the effect and emits no elements. |
| `fromEffectRepeat` | `const` | Creates a stream from an effect producing a value of type `A` which repeats forever. |
| `fromEffectSchedule` | `const` | Creates a stream from an effect producing a value of type `A`, which is repeated using the specified schedule. |
| `fromEventListener` | `const` | Creates a stream from an event listener. |
| `fromIterable` | `const` | Creates a new `Stream` from an iterable collection of values. |
| `fromIterableEffect` | `const` | Creates a stream from an effect producing an iterable of values. |
| `fromIterableEffectRepeat` | `const` | Creates a stream by repeatedly running an effect that yields an iterable of values. |
| `fromIteratorSucceed` | `const` | Creates a stream that consumes values from an iterator. |
| `fromPubSub` | `const` | Creates a stream from a subscription to a `PubSub`. |
| `fromPubSubTake` | `const` | Creates a stream from a PubSub of `Take` values. |
| `fromPull` | `const` | Creates a stream from a pull effect, such as one produced by `Stream.toPull`. |
| `fromQueue` | `const` | Creates a stream from a queue of values. |
| `fromReadableStream` | `const` | Creates a stream from a `ReadableStream`. |
| `fromSchedule` | `const` | Creates a stream that emits each output of a schedule that does not require input, for as long as the schedule continues. |
| `fromSubscription` | `const` | Creates a stream from a PubSub subscription. |
| `groupAdjacentBy` | `const` | No summary found in JSDoc. |
| `groupBy` | `const` | Groups elements into keyed substreams using an effectful classifier. |
| `groupByKey` | `const` | Groups elements by a key and emits a stream per key. |
| `grouped` | `const` | Partitions the stream into non-empty arrays of the specified size. |
| `groupedWithin` | `const` | Partitions the stream into arrays, emitting when the chunk size is reached or the duration passes. |
| `HaltStrategy` | `type` | Describes how merged streams decide when to halt. |
| `haltWhen` | `const` | Halts evaluation after the current element once the provided effect completes; the effect is forked, its success is discarded, failures fail the stream, and it does not interrup... |
| `ignore` | `const` | Ignores failures and ends the stream on error. |
| `ignoreCause` | `const` | Ignores the stream's failure cause, including defects, and ends the stream. |
| `interleave` | `const` | Interleaves this stream with the specified stream by alternating pulls from each stream; when one ends, the remaining values from the other stream are emitted. |
| `interleaveWith` | `const` | Interleaves two streams deterministically by following a boolean decider stream. |
| `interruptWhen` | `const` | Interrupts the evaluation of this stream when the provided effect completes. The given effect will be forked as part of this stream, and its success will be discarded. This comb... |
| `intersperse` | `const` | Inserts the provided element between emitted elements. |
| `intersperseAffixes` | `const` | Intersperse stream elements with a middle value, adding a start and end value. |
| `isStream` | `const` | Checks whether a value is a Stream. |
| `iterate` | `const` | Creates an infinite stream by repeatedly applying a function to a seed value. |
| `let` | `const` | No summary found in JSDoc. |
| `make` | `const` | Creates a stream from a sequence of values. |
| `map` | `const` | Transforms the elements of this stream using the supplied function. |
| `mapAccum` | `const` | Statefully maps elements, emitting zero or more outputs per input. |
| `mapAccumArray` | `const` | Statefully maps over non-empty chunk arrays, emitting zero or more values per chunk. |
| `mapAccumArrayEffect` | `const` | Statefully and effectfully maps over chunks of this stream to emit new values. |
| `mapAccumEffect` | `const` | Statefully and effectfully maps over the elements of this stream to produce new elements. |
| `mapArray` | `const` | Transforms each emitted chunk using the provided function, which receives the chunk and its index. |
| `mapArrayEffect` | `const` | Effectfully maps over non-empty array chunks emitted by the stream. |
| `mapBoth` | `const` | Maps both the failure and success channels of a stream. |
| `mapEffect` | `const` | Maps over elements of the stream with the specified effectful function. |
| `mapError` | `const` | Transforms the errors emitted by this stream using `f`. |
| `merge` | `const` | Merges two streams, emitting elements from both as they arrive. |
| `mergeAll` | `const` | Merges a collection of streams, running up to the specified number concurrently. |
| `mergeEffect` | `const` | Merges this stream with a background effect, keeping the stream's elements. |
| `mergeLeft` | `const` | Merges two streams while emitting only the values from the left stream. |
| `mergeResult` | `const` | Merges this stream and the specified stream together, tagging values from the left stream as `Result.succeed` and values from the right stream as `Result.fail`. |
| `mergeRight` | `const` | Merges this stream and the specified stream together, emitting only the values from the right stream while the left stream runs for its effects. |
| `mkString` | `const` | Concatenates all emitted strings into a single string. |
| `mkUint8Array` | `const` | Concatenates the stream's `Uint8Array` chunks into a single `Uint8Array`. |
| `never` | `const` | The stream that never produces any value or fails with any error. |
| `onEnd` | `const` | Runs the provided effect when the stream ends successfully. |
| `onError` | `const` | Runs the provided effect when the stream fails, passing the failure cause. |
| `onExit` | `const` | Runs the provided finalizer when the stream exits, passing the exit value. |
| `onFirst` | `const` | Runs the provided effect with the first element emitted by the stream. |
| `onStart` | `const` | Runs the provided effect before this stream starts. |
| `orDie` | `const` | Turns typed failures into defects, making the stream infallible. |
| `orElseIfEmpty` | `const` | Switches to a fallback stream if this stream is empty. |
| `orElseSucceed` | `const` | Returns a stream that emits a fallback value when this stream fails. |
| `paginate` | `const` | Like `Stream.unfold`, but allows the emission of values to end one step further than the unfolding of the state. This is useful for embedding paginated APIs, hence the name. |
| `partition` | `const` | Splits a stream into excluded and satisfying substreams using a predicate, refinement, or Filter. |
| `partitionEffect` | `const` | Splits a stream using an effectful filter, producing pass and fail streams. |
| `partitionQueue` | `const` | Partitions a stream using a Filter and exposes passing and failing values as queues. |
| `peel` | `const` | Runs a sink to peel off enough elements to produce a value and returns that value with the remaining stream in a scope. |
| `pipeThrough` | `const` | Pipes the stream through `Sink.toChannel`, emitting only the sink leftovers. |
| `pipeThroughChannel` | `const` | Pipes this stream through a channel that consumes and emits chunked elements. |
| `pipeThroughChannelOrFail` | `const` | Pipes values through the provided channel while preserving this stream's failures alongside any channel failures. |
| `prepend` | `const` | Prepends the values from the provided iterable before the stream's elements. |
| `provide` | `const` | Provides a layer or service map to the stream, removing the corresponding service requirements. Use `options.local` to build the layer every time; by default, layers are shared ... |
| `provideService` | `const` | Provides the stream with a single required service, eliminating that requirement from its environment. |
| `provideServiceEffect` | `const` | Provides a service to the stream using an effect, removing the requirement and adding the effect's error and environment. |
| `provideServices` | `const` | Provides multiple services to the stream using a service map. |
| `race` | `const` | Returns a stream that mirrors the first upstream to emit an item. As soon as one stream emits, the other is interrupted and failures propagate. |
| `raceAll` | `const` | Races multiple streams and emits values from the first stream to produce a value, interrupting the rest. |
| `range` | `const` | Constructs a stream from a range of integers, including both endpoints. |
| `rechunk` | `const` | Re-chunks the stream into arrays of the specified size, preserving element order. |
| `repeat` | `const` | Repeats the entire stream according to the provided schedule. |
| `repeatElements` | `const` | Repeats each element of the stream according to the provided schedule, including the original emission. |
| `result` | `const` | Lifts failures and successes into a `Result`, yielding a stream that cannot fail. |
| `retry` | `const` | When the stream fails, retry it according to the given schedule. |
| `run` | `const` | Runs a stream with a sink and returns the sink result. |
| `runCollect` | `const` | Runs the stream and collects all elements into an array. |
| `runCount` | `const` | Runs the stream and returns the number of elements emitted. |
| `runDrain` | `const` | Runs the stream for its effects, discarding emitted elements. |
| `runFold` | `const` | Runs the stream and folds elements using a pure reducer. |
| `runFoldEffect` | `const` | Runs the stream and folds elements using an effectful reducer. |
| `runForEach` | `const` | Runs the provided effectful callback for each element of the stream. |
| `runForEachArray` | `const` | Consumes the stream in chunks, passing each non-empty array to the callback. |
| `runForEachWhile` | `const` | Runs the stream, applying the effectful predicate to each element and stopping when it returns `false`. |
| `runHead` | `const` | Runs the stream and returns the first element as an `Option`. |
| `runIntoPubSub` | `const` | Runs the stream, publishing elements into the provided PubSub. |
| `runIntoQueue` | `const` | Runs the stream, offering each element to the provided queue and ending it with `Cause.Done` when the stream completes. |
| `runLast` | `const` | Runs the stream and returns the last element as an `Option`. |
| `runSum` | `const` | Runs the stream and returns the numeric sum of its elements. |
| `scan` | `const` | Accumulates state across the stream, emitting the initial state and each updated state. |
| `scanEffect` | `const` | Effectfully accumulates state and emits the initial state plus each accumulated state. |
| `schedule` | `const` | Spaces the stream's elements according to the provided `schedule`. |
| `scoped` | `const` | Runs a stream that requires `Scope` in a managed scope, ensuring its finalizers are run when the stream completes. |
| `Services` | `type` | Extract the services type from a Stream type. |
| `share` | `const` | Returns a new Stream that multicasts the original stream, subscribing when the first consumer starts. |
| `sliding` | `const` | Emits a sliding window of `n` elements. |
| `slidingSize` | `const` | Emits sliding windows of `chunkSize` elements, advancing by `stepSize`. |
| `split` | `const` | Splits the stream into non-empty groups whenever the predicate matches. |
| `splitLines` | `const` | Splits a stream of strings into lines, handling `\n`, `\r`, and `\r\n` delimiters across chunks. |
| `Stream` | `interface` | A `Stream<A, E, R>` describes a program that can emit many `A` values, fail with `E`, and require `R`. |
| `StreamTypeLambda` | `interface` | Type lambda for Stream used in higher-kinded type operations. |
| `StreamUnify` | `interface` | Type-level unification hook for Stream within the Effect type system. |
| `StreamUnifyIgnore` | `interface` | Type-level marker that excludes Stream from unification. |
| `succeed` | `const` | Creates a single-valued pure stream. |
| `Success` | `type` | Extract the success type from a Stream type. |
| `suspend` | `const` | Creates a lazily constructed stream. |
| `switchMap` | `const` | Switches to the latest stream produced by the mapping function, interrupting the previous stream when a new element arrives. |
| `sync` | `const` | Creates a stream that synchronously evaluates a function and emits the result as a single value. |
| `take` | `const` | Takes the first `n` elements from this stream, returning `Stream.empty` when `n < 1`. |
| `takeRight` | `const` | Keeps the last `n` elements from this stream. |
| `takeUntil` | `const` | Takes elements until the predicate matches. |
| `takeUntilEffect` | `const` | Effectful predicate version of `takeUntil`. |
| `takeWhile` | `const` | Takes the longest initial prefix of elements that satisfy the predicate. |
| `takeWhileEffect` | `const` | Takes elements from the stream while the effectful predicate is `true`. |
| `tap` | `const` | Runs the provided effect for each element while preserving the elements. |
| `tapBoth` | `const` | Returns a stream that effectfully "peeks" at elements and failures. |
| `tapCause` | `const` | Runs an effect when the stream fails without changing its values or error, unless the tap effect itself fails. |
| `tapError` | `const` | Effectfully peeks at errors without changing the stream unless the tap fails. |
| `tapSink` | `const` | Sends all elements emitted by this stream to the specified sink in addition to emitting them. |
| `throttle` | `const` | Delays the arrays of this stream using a token bucket and a per-array cost. Allows bursts by letting the bucket accumulate up to a `units + burst` threshold. The weight of each ... |
| `throttleEffect` | `const` | Delays the arrays of this stream according to the given bandwidth parameters using the token bucket algorithm. Allows for burst processing by allowing the bucket to accumulate t... |
| `tick` | `const` | Creates a stream that emits void values spaced by the specified duration. |
| `timeout` | `const` | Ends the stream if it does not produce a value within the specified duration. |
| `toAsyncIterable` | `const` | Converts a stream to an `AsyncIterable` for `for await...of` consumption. |
| `toAsyncIterableEffect` | `const` | Creates an effect that yields an `AsyncIterable` using the current services. |
| `toAsyncIterableWith` | `const` | Converts the stream to an `AsyncIterable` using the provided services. |
| `toChannel` | `const` | Creates a channel from a stream. |
| `toPubSub` | `const` | Converts a stream to a PubSub for concurrent consumption. |
| `toPubSubTake` | `const` | Converts a stream to a PubSub for concurrent consumption. |
| `toPull` | `const` | Returns a scoped pull for manually consuming the stream's output chunks. |
| `toQueue` | `const` | Converts a stream to a PubSub for concurrent consumption. |
| `toReadableStream` | `const` | Converts a stream to a `ReadableStream`. |
| `toReadableStreamEffect` | `const` | Creates an Effect that builds a ReadableStream from the stream. |
| `toReadableStreamWith` | `const` | Converts the stream to a `ReadableStream` using the provided services. |
| `transduce` | `const` | Applies a sink transducer to the stream and emits each sink result. |
| `transformPull` | `const` | Derive a stream by transforming its pull effect. |
| `transformPullBracket` | `const` | Transforms a stream by effectfully transforming its pull effect. |
| `unfold` | `const` | Creates a stream by peeling off successive layers of a state value. |
| `unwrap` | `const` | Creates a stream produced from an `Effect`. |
| `updateService` | `const` | Updates a single service in the stream environment by applying a function. |
| `updateServices` | `const` | Transforms the stream's required services by mapping the current service map to a new one. |
| `Variance` | `interface` | Variance markers for Stream type parameters. |
| `VarianceStruct` | `interface` | Structural encoding of Stream type parameter variance. |
| `when` | `const` | Returns the specified stream if the given condition is satisfied, otherwise returns an empty stream. |
| `withExecutionPlan` | `const` | Apply an `ExecutionPlan` to a stream, retrying with step-provided resources until it succeeds or the plan is exhausted. |
| `withSpan` | `const` | Wraps the stream with a new span for tracing. |
| `zip` | `const` | Zips this stream with another point-wise and emits tuples of elements from both streams. The new stream ends when either stream ends. |
| `zipFlatten` | `const` | Zips this stream with another point-wise and emits tuples of elements from both streams, flattening the left tuple. |
| `zipLatest` | `const` | Combines two streams by emitting each new element with the latest value from the other stream. |
| `zipLatestAll` | `const` | Zips multiple streams so that when a value is emitted by any stream, it is combined with the latest values from the other streams to produce a result. |
| `zipLatestWith` | `const` | Combines the latest values from both streams whenever either emits, using the provided function. |
| `zipLeft` | `const` | Zips this stream with another point-wise and keeps only the values from the left stream. |
| `zipRight` | `const` | Zips this stream with another point-wise, keeping only right values and ending when either stream ends. |
| `zipWith` | `const` | Zips two streams point-wise with a combining function, ending when either stream ends. |
| `zipWithArray` | `const` | Zips two streams by applying a function to non-empty arrays of elements. |
| `zipWithIndex` | `const` | Zips this stream together with the index of elements. |
| `zipWithNext` | `const` | Zips each element with the next element, pairing the final element with `Option.none()`. |
| `zipWithPrevious` | `const` | Zips each element with its previous element, starting with `None`. |
| `zipWithPreviousAndNext` | `const` | Zips each element with its previous and next values. |
