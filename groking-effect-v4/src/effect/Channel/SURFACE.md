# effect/Channel Surface

Total exports: 146

| Export | Kind | Overview |
|---|---|---|
| `acquireRelease` | `const` | Creates a `Channel` with resource management using acquire-release pattern. |
| `acquireUseRelease` | `const` | Creates a `Channel` with resource management using acquire-use-release pattern. |
| `bind` | `const` | No summary found in JSDoc. |
| `bindTo` | `const` | No summary found in JSDoc. |
| `buffer` | `const` | Allows a faster producer to progress independently of a slower consumer by buffering up to `capacity` elements in a queue. |
| `bufferArray` | `const` | Allows a faster producer to progress independently of a slower consumer by buffering up to `capacity` elements in a queue. |
| `callback` | `const` | Creates a `Channel` that interacts with a callback function using a queue. |
| `callbackArray` | `const` | Creates a `Channel` that interacts with a callback function using a queue, emitting arrays. |
| `catch` | `const` | No summary found in JSDoc. |
| `catchCause` | `const` | Catches any cause of failure from the channel and allows recovery by creating a new channel based on the caught cause. |
| `catchCauseIf` | `const` | Catches causes of failure that match a specific filter, allowing conditional error recovery based on the type of failure. |
| `catchIf` | `const` | No summary found in JSDoc. |
| `catchReason` | `const` | Catches a specific reason within a tagged error. |
| `catchReasons` | `const` | Catches multiple reasons within a tagged error using an object of handlers. |
| `catchTag` | `const` | No summary found in JSDoc. |
| `Channel` | `interface` | A `Channel` is a nexus of I/O operations, which supports both reading and writing. A channel may read values of type `InElem` and write values of type `OutElem`. When the channe... |
| `ChannelUnify` | `interface` | No summary found in JSDoc. |
| `ChannelUnifyIgnore` | `interface` | No summary found in JSDoc. |
| `combine` | `const` | Combines the elements from this channel and the specified channel by repeatedly applying the function `f` to extract an element using both sides and conceptually "offer" it to t... |
| `concat` | `const` | Concatenates this channel with another channel, so that the second channel starts emitting values after the first channel has completed. |
| `concatWith` | `const` | Concatenates this channel with another channel created from the terminal value of this channel. The new channel is created using the provided function. |
| `decodeText` | `const` | No summary found in JSDoc. |
| `DefaultChunkSize` | `const` | The default chunk size used by channels for batching operations. |
| `die` | `const` | Constructs a channel that fails immediately with the specified defect. |
| `Do` | `const` | No summary found in JSDoc. |
| `drain` | `const` | Creates a new channel that consumes all output from the source channel but emits nothing, preserving only the completion value. |
| `embedInput` | `const` | Returns a new channel which embeds the given input handler into a Channel. |
| `empty` | `const` | Represents an Channel that emits no elements |
| `encodeText` | `const` | No summary found in JSDoc. |
| `end` | `const` | Creates a `Channel` that immediately ends with the specified value. |
| `endSync` | `const` | Creates a `Channel` that immediately ends with the lazily evaluated value. |
| `ensuring` | `const` | Returns a new channel with an attached finalizer. The finalizer is guaranteed to be executed so long as the channel begins execution (and regardless of whether or not it complet... |
| `fail` | `const` | Constructs a channel that fails immediately with the specified error. |
| `failCause` | `const` | Constructs a channel that fails immediately with the specified `Cause`. |
| `failCauseSync` | `const` | Constructs a channel that fails immediately with the specified lazily evaluated `Cause`. |
| `failSync` | `const` | Constructs a channel that fails immediately with the specified lazily evaluated error. |
| `filter` | `const` | Filters the output elements of a channel using a predicate function. Elements that don't match the predicate are discarded. |
| `filterArray` | `const` | Filters arrays of elements emitted by a channel, applying the filter to each element within the arrays and only emitting non-empty filtered arrays. |
| `filterArrayEffect` | `const` | No summary found in JSDoc. |
| `filterEffect` | `const` | No summary found in JSDoc. |
| `flatMap` | `const` | Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this c... |
| `flatten` | `const` | Flatten a channel of channels. |
| `flattenArray` | `const` | Flattens a channel that outputs arrays into a channel that outputs individual elements. |
| `flattenTake` | `const` | No summary found in JSDoc. |
| `forever` | `const` | Repeats this channel forever. |
| `fromArray` | `const` | Creates a `Channel` that emits all elements from an array. |
| `fromAsyncIterable` | `const` | Creates a Channel from a AsyncIterable. |
| `fromAsyncIterableArray` | `const` | Creates a Channel from a AsyncIterable that emits arrays of elements. |
| `fromChunk` | `const` | Creates a `Channel` that emits all elements from a chunk. |
| `fromEffect` | `const` | Use an effect to write a single value to the channel. |
| `fromEffectDone` | `const` | No summary found in JSDoc. |
| `fromEffectDrain` | `const` | Use an effect and discard its result. |
| `fromEffectTake` | `const` | No summary found in JSDoc. |
| `fromIterable` | `const` | Creates a `Channel` that emits all elements from an iterable. |
| `fromIterableArray` | `const` | Creates a `Channel` that emits arrays of elements from an iterable. |
| `fromIterator` | `const` | Creates a `Channel` from an iterator. |
| `fromIteratorArray` | `const` | Creates a `Channel` from an iterator that emits arrays of elements. |
| `fromPubSub` | `const` | Create a channel from a PubSub that outputs individual values. |
| `fromPubSubArray` | `const` | Create a channel from a PubSub that outputs arrays of values. |
| `fromPubSubTake` | `const` | No summary found in JSDoc. |
| `fromPull` | `const` | Creates a `Channel` from an `Effect` that produces a `Pull`. |
| `fromQueue` | `const` | Create a channel from a queue |
| `fromQueueArray` | `const` | Create a channel from a queue that emits arrays of elements |
| `fromSchedule` | `const` | Creates a Channel from a Schedule. |
| `fromSubscription` | `const` | Create a channel from a PubSub subscription |
| `fromSubscriptionArray` | `const` | Create a channel from a PubSub subscription that outputs arrays of values. |
| `fromTransform` | `const` | Creates a `Channel` from a transformation function that operates on upstream pulls. |
| `fromTransformBracket` | `const` | Creates a `Channel` from a transformation function that operates on upstream pulls, but also provides a forked scope that closes when the resulting Channel completes. |
| `HaltStrategy` | `type` | Represents strategies for halting merged channels when one completes or fails. |
| `haltWhen` | `const` | No summary found in JSDoc. |
| `identity` | `const` | No summary found in JSDoc. |
| `ignore` | `const` | Ignores all errors in the channel, converting them to an empty channel. |
| `ignoreCause` | `const` | Ignores all errors in the channel including defects, converting them to an empty channel. |
| `interruptWhen` | `const` | Returns a new channel, which is the same as this one, except it will be interrupted when the specified effect completes. If the effect completes successfully before the underlyi... |
| `isChannel` | `const` | Tests if a value is a `Channel`. |
| `let` | `const` | No summary found in JSDoc. |
| `map` | `const` | Maps the output of this channel using the specified function. |
| `mapAccum` | `const` | Statefully maps over a channel with an accumulator, where each element can produce multiple output values. |
| `mapDone` | `const` | Maps the done value of this channel using the specified function. |
| `mapDoneEffect` | `const` | Maps the done value of this channel using the specified effectful function. |
| `mapEffect` | `const` | Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this c... |
| `mapError` | `const` | Returns a new channel, which is the same as this one, except the failure value of the returned channel is created by applying the specified function to the failure value of this... |
| `mapInput` | `const` | Returns a new channel which is the same as this one but applies the given function to the input channel’s input elements. |
| `mapInputError` | `const` | Returns a new channel which is the same as this one but applies the given function to the input errors. |
| `merge` | `const` | Returns a new channel, which is the merge of this channel and the specified channel. |
| `mergeAll` | `const` | Merges multiple channels with specified concurrency and buffering options. |
| `mergeEffect` | `const` | No summary found in JSDoc. |
| `never` | `const` | Represents an Channel that never completes |
| `onEnd` | `const` | No summary found in JSDoc. |
| `onError` | `const` | No summary found in JSDoc. |
| `onExit` | `const` | Returns a new channel with an attached finalizer. The finalizer is guaranteed to be executed so long as the channel begins execution (and regardless of whether or not it complet... |
| `onFirst` | `const` | No summary found in JSDoc. |
| `onStart` | `const` | No summary found in JSDoc. |
| `orDie` | `const` | Converts all errors in the channel to defects (unrecoverable failures). This is useful when you want to treat errors as programming errors. |
| `orElseIfEmpty` | `const` | No summary found in JSDoc. |
| `pipeTo` | `const` | Returns a new channel that pipes the output of this channel into the specified channel. The returned channel has the input type of this channel, and the output type of the speci... |
| `pipeToOrFail` | `const` | Returns a new channel that pipes the output of this channel into the specified channel and preserves this channel's failures without providing them to the other channel for obse... |
| `provide` | `const` | No summary found in JSDoc. |
| `provideService` | `const` | No summary found in JSDoc. |
| `provideServiceEffect` | `const` | No summary found in JSDoc. |
| `provideServices` | `const` | Provides a layer or service map to the channel, removing the corresponding service requirements. Use `options.local` to build the layer every time; by default, layers are shared... |
| `repeat` | `const` | Repeats this channel according to the provided schedule. |
| `retry` | `const` | Returns a new channel that retries this channel according to the specified schedule whenever it fails. |
| `runCollect` | `const` | Runs a channel and collects all output elements into an array. |
| `runCount` | `const` | Runs a channel and counts the number of elements it outputs. |
| `runDone` | `const` | Runs a channel and outputs the done value. |
| `runDrain` | `const` | Runs a channel and discards all output elements, returning only the final result. |
| `runFold` | `const` | Runs a channel and folds over all output elements with an accumulator. |
| `runFoldEffect` | `const` | No summary found in JSDoc. |
| `runForEach` | `const` | Runs a channel and applies an effect to each output element. |
| `runForEachWhile` | `const` | No summary found in JSDoc. |
| `runHead` | `const` | No summary found in JSDoc. |
| `runIntoPubSub` | `const` | No summary found in JSDoc. |
| `runIntoPubSubArray` | `const` | No summary found in JSDoc. |
| `runIntoQueue` | `const` | No summary found in JSDoc. |
| `runIntoQueueArray` | `const` | No summary found in JSDoc. |
| `runLast` | `const` | No summary found in JSDoc. |
| `scan` | `const` | Statefully transforms a channel by scanning over its output with an accumulator function. Emits the intermediate results of the scan operation. |
| `scanEffect` | `const` | Statefully transforms a channel by scanning over its output with an effectful accumulator function. Emits the intermediate results of the scan operation. |
| `schedule` | `const` | No summary found in JSDoc. |
| `scoped` | `const` | No summary found in JSDoc. |
| `servicesWith` | `const` | Create a channel from the specified services. |
| `splitLines` | `const` | No summary found in JSDoc. |
| `succeed` | `const` | Creates a `Channel` that emits a single value and then ends. |
| `suspend` | `const` | Creates a `Channel` that lazily evaluates to another channel. |
| `switchMap` | `const` | Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this c... |
| `sync` | `const` | Creates a `Channel` that emits a single value computed by a lazy evaluation. |
| `tap` | `const` | Applies a side effect function to each output element of the channel, returning a new channel that emits the same elements. |
| `tapCause` | `const` | No summary found in JSDoc. |
| `tapError` | `const` | No summary found in JSDoc. |
| `toPubSub` | `const` | Converts a channel to a PubSub for concurrent consumption. |
| `toPubSubArray` | `const` | Converts a channel to a PubSub for concurrent consumption. |
| `toPubSubTake` | `const` | Converts a channel to a PubSub for concurrent consumption. |
| `toPull` | `const` | Converts a channel to a Pull data structure for low-level consumption. |
| `toPullScoped` | `const` | Converts a channel to a Pull within an existing scope. |
| `toQueue` | `const` | Converts a channel to a queue for concurrent consumption. |
| `toQueueArray` | `const` | No summary found in JSDoc. |
| `toTransform` | `const` | Converts a `Channel` back to its underlying transformation function. |
| `transformPull` | `const` | Transforms a Channel by applying a function to its Pull implementation. |
| `unwrap` | `const` | Constructs a `Channel` from a scoped effect that will result in a `Channel` if successful. |
| `unwrapReason` | `const` | Promotes nested reason errors into the channel error, replacing the parent error. |
| `updateService` | `const` | No summary found in JSDoc. |
| `updateServices` | `const` | No summary found in JSDoc. |
| `Variance` | `interface` | No summary found in JSDoc. |
| `VarianceStruct` | `interface` | No summary found in JSDoc. |
| `withSpan` | `const` | No summary found in JSDoc. |
