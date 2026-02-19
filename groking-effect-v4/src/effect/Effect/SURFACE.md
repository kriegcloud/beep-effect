# effect/Effect Surface

Total exports: 229

| Export | Kind | Overview |
|---|---|---|
| `acquireRelease` | `const` | This function constructs a scoped resource from an `acquire` and `release` `Effect` value. |
| `acquireUseRelease` | `const` | This function is used to ensure that an `Effect` value that represents the acquisition of a resource (for example, opening a file, launching a thread, etc.) will not be interrup... |
| `addFinalizer` | `const` | This function adds a finalizer to the scope of the calling `Effect` value. The finalizer is guaranteed to be run when the scope is closed, and it may depend on the `Exit` value ... |
| `all` | `const` | Combines multiple effects into one, returning results based on the input structure. |
| `All` | `namespace` | Namespace containing type utilities for the `Effect.all` function, which handles collecting multiple effects into various output structures. |
| `andThen` | `const` | Chains two actions, where the second action can depend on the result of the first. |
| `annotateCurrentSpan` | `const` | Adds an annotation to the current span if available. |
| `annotateLogs` | `const` | Adds an annotation to each log line in this effect. |
| `annotateSpans` | `const` | Adds an annotation to each span in this effect. |
| `as` | `const` | Replaces the value inside an effect with a constant value. |
| `asSome` | `const` | This function maps the success value of an `Effect` value to a `Some` value in an `Option` value. If the original `Effect` value fails, the returned `Effect` value will also fail. |
| `asVoid` | `const` | This function maps the success value of an `Effect` value to `void`. If the original `Effect` value succeeds, the returned `Effect` value will also succeed. If the original `Eff... |
| `atomic` | `const` | Defines a transaction. Transactions are "all or nothing" with respect to changes made to transactional values (i.e. TxRef) that occur within the transaction body. |
| `atomicWith` | `const` | Executes a function within a transaction context, providing access to the transaction state. |
| `awaitAllChildren` | `const` | Waits for all child fibers forked by this effect to complete before this effect completes. |
| `cached` | `const` | Returns an effect that lazily computes a result and caches it for subsequent evaluations. |
| `cachedInvalidateWithTTL` | `const` | Caches an effect's result for a specified duration and allows manual invalidation before expiration. |
| `cachedWithTTL` | `const` | Returns an effect that caches its result for a specified `Duration`, known as "timeToLive" (TTL). |
| `callback` | `const` | Creates an `Effect` from a callback-based asynchronous function. |
| `catch` | `const` | No summary found in JSDoc. |
| `catchCause` | `const` | Handles both recoverable and unrecoverable errors by providing a recovery effect. |
| `catchCauseIf` | `const` | Recovers from specific failures based on a predicate. |
| `catchDefect` | `const` | Recovers from all defects using a provided recovery function. |
| `catchEager` | `const` | An optimized version of `catch` that checks if an effect is already resolved and applies the catch function eagerly when possible. |
| `catchIf` | `const` | Recovers from specific errors using a `Filter`, `Predicate`, or `Refinement`. |
| `catchNoSuchElement` | `const` | Catches `NoSuchElementError` failures and converts them to `Option.none`. |
| `catchReason` | `const` | Catches a specific reason within a tagged error. |
| `catchReasons` | `const` | Catches multiple reasons within a tagged error using an object of handlers. |
| `catchTag` | `const` | Catches and handles specific errors by their `_tag` field, which is used as a discriminator. |
| `catchTags` | `const` | Handles multiple errors in a single block of code using their `_tag` field. |
| `clockWith` | `const` | Retrieves the `Clock` service from the context and provides it to the specified effectful function. |
| `currentParentSpan` | `const` | Returns the current parent span from the context. |
| `currentSpan` | `const` | Returns the current span from the context. |
| `delay` | `const` | Returns an effect that is delayed from this effect by the specified `Duration`. |
| `die` | `const` | Creates an effect that terminates a fiber with a specified error. |
| `Effect` | `interface` | The `Effect` interface defines a value that lazily describes a workflow or job. The workflow requires some context `R`, and may fail with an error of type `E`, or succeed with a... |
| `effectify` | `const` | Converts a callback-based function to a function that returns an `Effect`. |
| `Effectify` | `namespace` | No summary found in JSDoc. |
| `EffectIterator` | `interface` | Iterator interface for Effect generators, enabling Effect values to work with generator functions. |
| `EffectTypeLambda` | `interface` | No summary found in JSDoc. |
| `EffectUnify` | `interface` | No summary found in JSDoc. |
| `EffectUnifyIgnore` | `interface` | No summary found in JSDoc. |
| `ensuring` | `const` | Returns an effect that, if this effect _starts_ execution, then the specified `finalizer` is guaranteed to be executed, whether this effect succeeds, fails, or is interrupted. |
| `Error` | `type` | No summary found in JSDoc. |
| `eventually` | `const` | Retries an effect until it succeeds, discarding failures. |
| `exit` | `const` | Transforms an effect to encapsulate both failure and success using the `Exit` data type. |
| `fail` | `const` | Creates an `Effect` that represents a recoverable error. |
| `failCause` | `const` | Creates an `Effect` that represents a failure with a specific `Cause`. |
| `failCauseSync` | `const` | Creates an `Effect` that represents a failure with a `Cause` computed lazily. |
| `failSync` | `const` | Creates an `Effect` that represents a recoverable error using a lazy evaluation. |
| `fiber` | `const` | Access the fiber currently executing the effect. |
| `fiberId` | `const` | Access the current fiber id executing the effect. |
| `filter` | `const` | Filters elements of an iterable using a predicate, refinement, effectful predicate, or `Filter.FilterEffect`. |
| `filterOrElse` | `const` | Filters an effect, providing an alternative effect if the predicate fails. |
| `filterOrFail` | `const` | Filters an effect, failing with a custom error if the predicate fails. |
| `flatMap` | `const` | Chains effects to produce new `Effect` instances, useful for combining operations that depend on previous results. |
| `flatMapEager` | `const` | An optimized version of `flatMap` that checks if an effect is already resolved and applies the flatMap function eagerly when possible. |
| `flatten` | `const` | Flattens an `Effect` that produces another `Effect` into a single effect. |
| `flip` | `const` | The `flip` function swaps the success and error channels of an effect, so that the success becomes the error, and the error becomes the success. |
| `fn` | `namespace` | Type helpers for functions built with `Effect.fn` and `Effect.fnUntraced`. |
| `fnUntraced` | `const` | Creates an Effect-returning function without tracing. |
| `fnUntracedEager` | `const` | Creates untraced function effects with eager evaluation optimization. |
| `forEach` | `const` | Executes an effectful operation for each element in an `Iterable`. |
| `forever` | `const` | Repeats this effect forever (until the first error). |
| `forkChild` | `const` | Returns an effect that forks this effect into its own separate fiber, returning the fiber immediately, without waiting for it to begin executing the effect. |
| `forkDetach` | `const` | Forks the effect into a new fiber attached to the global scope. Because the new fiber is attached to the global scope, when the fiber executing the returned effect terminates, t... |
| `forkIn` | `const` | Forks the effect in the specified scope. The fiber will be interrupted when the scope is closed. |
| `forkScoped` | `const` | Forks the fiber in a `Scope`, interrupting it when the scope is closed. |
| `fromNullishOr` | `const` | Converts a nullable value to an `Effect`, failing with a `NoSuchElementError` when the value is `null` or `undefined`. |
| `fromOption` | `const` | Converts an `Option` to an `Effect`. |
| `fromResult` | `const` | Converts a `Result` to an `Effect`. |
| `fromYieldable` | `const` | Converts a yieldable value to an Effect. |
| `gen` | `const` | Provides a way to write effectful code using generator functions, simplifying control flow and error handling. |
| `ignore` | `const` | Discards both the success and failure values of an effect. |
| `ignoreCause` | `const` | Ignores the effect's failure cause, including defects and interruptions. |
| `interrupt` | `const` | Returns an effect that is immediately interrupted. |
| `interruptible` | `const` | Returns a new effect that allows the effect to be interruptible. |
| `interruptibleMask` | `const` | This function behaves like {@link interruptible}, but it also provides a `restore` function. This function can be used to restore the interruptibility of any specific region of ... |
| `isEffect` | `const` | Tests if a value is an `Effect`. |
| `isFailure` | `const` | Determines whether an effect fails. |
| `isSuccess` | `const` | Returns whether an effect completes successfully. |
| `Latch` | `interface` | No summary found in JSDoc. |
| `linkSpans` | `const` | For all spans in this effect, add a link with the provided span. |
| `log` | `const` | Logs one or more messages using the default log level. |
| `logDebug` | `const` | Logs one or more messages at the DEBUG level. |
| `logError` | `const` | Logs one or more messages at the ERROR level. |
| `logFatal` | `const` | Logs one or more messages at the FATAL level. |
| `logInfo` | `const` | Logs one or more messages at the INFO level. |
| `logTrace` | `const` | Logs one or more messages at the TRACE level. |
| `logWarning` | `const` | Logs one or more messages at the WARNING level. |
| `logWithLevel` | `const` | Creates a logger function that logs at the specified level. |
| `makeLatch` | `const` | Creates a new Latch. |
| `makeLatchUnsafe` | `const` | Creates a new Latch. |
| `makeSemaphore` | `const` | Creates a new Semaphore. |
| `makeSemaphoreUnsafe` | `const` | Unsafely creates a new Semaphore. |
| `makeSpan` | `const` | Create a new span for tracing. |
| `makeSpanScoped` | `const` | Create a new span for tracing, and automatically close it when the Scope finalizes. |
| `map` | `const` | Transforms the value inside an effect by applying a function to it. |
| `mapBoth` | `const` | Applies transformations to both the success and error channels of an effect. |
| `mapBothEager` | `const` | An optimized version of `mapBoth` that checks if an effect is already resolved and applies the appropriate mapping function eagerly when possible. |
| `mapEager` | `const` | An optimized version of `map` that checks if an effect is already resolved and applies the mapping function eagerly when possible. |
| `mapError` | `const` | The `mapError` function is used to transform or modify the error produced by an effect, without affecting its success value. |
| `mapErrorEager` | `const` | An optimized version of `mapError` that checks if an effect is already resolved and applies the error mapping function eagerly when possible. |
| `match` | `const` | Handles both success and failure cases of an effect without performing side effects. |
| `matchCause` | `const` | Handles failures by matching the cause of failure. |
| `matchCauseEager` | `const` | Handles failures by matching the cause of failure with eager evaluation. |
| `matchCauseEffect` | `const` | Handles failures with access to the cause and allows performing side effects. |
| `matchCauseEffectEager` | `const` | Eagerly handles success or failure with effectful handlers when the effect is already resolved. |
| `matchEager` | `const` | Handles both success and failure cases of an effect without performing side effects, with eager evaluation for resolved effects. |
| `matchEffect` | `const` | Handles both success and failure cases of an effect, allowing for additional side effects. |
| `never` | `const` | Returns an effect that will never produce anything. The moral equivalent of `while(true) {}`, only without the wasted CPU cycles. |
| `onError` | `const` | Runs the specified effect if this effect fails, providing the error to the effect if it exists. The provided effect will not be interrupted. |
| `onErrorIf` | `const` | Runs the finalizer only when this effect fails and the `Cause` matches the filter, passing the filtered failure and the original cause. |
| `onExit` | `const` | Ensures that a cleanup functions runs, whether this effect succeeds, fails, or is interrupted. |
| `onExitIf` | `const` | Runs the cleanup effect only when the `Exit` passes the provided filter. |
| `onExitPrimitive` | `const` | The low level primitive that powers `onExit`. function is used to run a finalizer when the effect exits, regardless of the exit status. |
| `onInterrupt` | `const` | Runs the specified finalizer effect if this effect is interrupted. |
| `option` | `const` | Convert success to `Option.some` and failure to `Option.none`. |
| `orDie` | `const` | Converts an effect's failure into a fiber termination, removing the error from the effect's type. |
| `orElseSucceed` | `const` | Replaces the original failure with a success value, ensuring the effect cannot fail. |
| `partition` | `const` | Applies an effectful function to each element and partitions failures and successes. |
| `promise` | `const` | Creates an `Effect` that represents an asynchronous computation guaranteed to succeed. |
| `provide` | `const` | Provides dependencies to an effect using layers or a context. Use `options.local` to build the layer every time; by default, layers are shared between provide calls. |
| `provideService` | `const` | The `provideService` function is used to provide an actual implementation for a service in the context of an effect. |
| `provideServiceEffect` | `const` | Provides the effect with the single service it requires. If the effect requires more than one service use `provide` instead. |
| `provideServices` | `const` | Provides a service map to an effect, fulfilling its service requirements. |
| `race` | `const` | Races two effects and returns the first successful result. |
| `raceAll` | `const` | Races multiple effects and returns the first successful result. |
| `raceAllFirst` | `const` | Races multiple effects and returns the first successful result. |
| `raceFirst` | `const` | Races two effects and returns the result of the first one to complete, whether it succeeds or fails. |
| `repeat` | `const` | Repeats an effect based on a specified schedule or until the first failure. |
| `Repeat` | `namespace` | No summary found in JSDoc. |
| `repeatOrElse` | `const` | Repeats an effect with a schedule, handling failures using a custom handler. |
| `replicate` | `const` | Returns an array of `n` identical effects. |
| `replicateEffect` | `const` | Performs this effect `n` times and collects results with `Effect.all` semantics. |
| `request` | `const` | Executes a request using the provided resolver. |
| `requestUnsafe` | `const` | Low-level entry point that registers a request with a resolver and delivers the exit value via `onExit`. Use this when you already have a `ServiceMap` and need to enqueue a requ... |
| `result` | `const` | Encapsulates both success and failure of an `Effect` into a `Result` type. |
| `retry` | `const` | Retries a failing effect based on a defined retry policy. |
| `Retry` | `namespace` | No summary found in JSDoc. |
| `retryOrElse` | `const` | Retries a failing effect and runs a fallback effect if retries are exhausted. |
| `retryTransaction` | `const` | Signals that the current transaction needs to be retried. |
| `runCallback` | `const` | Runs an effect asynchronously, registering `onExit` as a fiber observer and returning an interruptor. |
| `runCallbackWith` | `const` | Forks an effect with the provided services, registers `onExit` as a fiber observer, and returns an interruptor. |
| `runFork` | `const` | The foundational function for running effects, returning a "fiber" that can be observed or interrupted. |
| `runForkWith` | `const` | Runs an effect in the background with the provided services. |
| `RunOptions` | `interface` | Configuration options for running Effect programs, providing control over interruption and scheduling behavior. |
| `runPromise` | `const` | Executes an effect and returns the result as a `Promise`. |
| `runPromiseExit` | `const` | Runs an effect and returns a `Promise` that resolves to an `Exit`, which represents the outcome (success or failure) of the effect. |
| `runPromiseExitWith` | `const` | Runs an effect and returns a Promise of Exit with provided services. |
| `runPromiseWith` | `const` | Executes an effect as a Promise with the provided services. |
| `runSync` | `const` | Executes an effect synchronously, running it immediately and returning the result. |
| `runSyncExit` | `const` | Runs an effect synchronously and returns the result as an `Exit` type, which represents the outcome (success or failure) of the effect. |
| `runSyncExitWith` | `const` | Runs an effect synchronously with provided services, returning an Exit result. |
| `runSyncWith` | `const` | Executes an effect synchronously with provided services. |
| `sandbox` | `const` | The `sandbox` function transforms an effect by exposing the full cause of any error, defect, or fiber interruption that might occur during its execution. It changes the error ch... |
| `satisfiesErrorType` | `const` | Ensures that an effect's error type extends a given type `E`. |
| `satisfiesServicesType` | `const` | Ensures that an effect's requirements type extends a given type `R`. |
| `satisfiesSuccessType` | `const` | Ensures that an effect's success type extends a given type `A`. |
| `schedule` | `const` | Repeats an effect based on a specified schedule. |
| `scheduleFrom` | `const` | Runs an effect repeatedly according to a schedule, starting from a specified initial input value. |
| `scope` | `const` | Returns the current scope for resource management. |
| `scoped` | `const` | Scopes all resources used in this workflow to the lifetime of the workflow, ensuring that their finalizers are run as soon as this workflow completes execution, whether by succe... |
| `scopedWith` | `const` | Creates a scoped effect by providing access to the scope. |
| `Semaphore` | `interface` | No summary found in JSDoc. |
| `service` | `const` | Accesses a service from the context. |
| `serviceOption` | `const` | Optionally accesses a service from the environment. |
| `services` | `const` | Returns the complete service map from the current context. |
| `Services` | `type` | No summary found in JSDoc. |
| `servicesWith` | `const` | Transforms the current service map using the provided function. |
| `sleep` | `const` | Returns an effect that suspends for the specified duration. This method is asynchronous, and does not actually block the fiber executing the effect. |
| `spanAnnotations` | `const` | Returns the annotations of the current span. |
| `spanLinks` | `const` | Retrieves the span links associated with the current span. |
| `succeed` | `const` | Creates an `Effect` that always succeeds with a given value. |
| `succeedNone` | `const` | Returns an effect which succeeds with `None`. |
| `succeedSome` | `const` | Returns an effect which succeeds with the value wrapped in a `Some`. |
| `Success` | `type` | No summary found in JSDoc. |
| `suspend` | `const` | Delays the creation of an `Effect` until it is actually needed. |
| `sync` | `const` | Creates an `Effect` that represents a synchronous side-effectful computation. |
| `TagsWithReason` | `type` | Type helper that keeps only error tags whose tagged error contains a tagged `reason` field. |
| `tap` | `const` | Runs a side effect with the result of an effect without changing the original value. |
| `tapCause` | `const` | The `tapCause` function allows you to inspect the complete cause of an error, including failures and defects. |
| `tapCauseIf` | `const` | Conditionally executes a side effect based on the cause of a failed effect. |
| `tapDefect` | `const` | Inspect severe errors or defects (non-recoverable failures) in an effect. |
| `tapError` | `const` | The `tapError` function executes an effectful operation to inspect the failure of an effect without modifying it. |
| `tapErrorTag` | `const` | Runs an effectful handler when a failure's `_tag` matches. |
| `timed` | `const` | Measures the runtime of an effect and returns the duration with its result. |
| `timeout` | `const` | Adds a time limit to an effect, triggering a timeout if the effect exceeds the duration. |
| `timeoutOption` | `const` | Handles timeouts by returning an `Option` that represents either the result or a timeout. |
| `timeoutOrElse` | `const` | Applies a timeout to an effect, with a fallback effect executed if the timeout is reached. |
| `tracer` | `const` | Returns the current tracer from the context. |
| `track` | `const` | Updates the `Metric` every time the `Effect` is executed. |
| `trackDefects` | `const` | Updates the provided `Metric` every time the wrapped `Effect` fails with an **unexpected** error (i.e. a defect). |
| `trackDuration` | `const` | Updates the provided `Metric` with the `Duration` of time (in nanoseconds) that the wrapped `Effect` took to complete. |
| `trackErrors` | `const` | Updates the provided `Metric` every time the wrapped `Effect` fails with an **expected** error. |
| `trackSuccesses` | `const` | Updates the provided `Metric` every time the wrapped `Effect` succeeds with a value. |
| `transaction` | `const` | Creates an isolated transaction that never composes with parent transactions. |
| `Transaction` | `class` | Service that holds the current transaction state, it includes |
| `transactionWith` | `const` | Executes a function within an isolated transaction context, providing access to the transaction state. |
| `try` | `const` | No summary found in JSDoc. |
| `tryPromise` | `const` | Creates an `Effect` that represents an asynchronous computation that might fail. |
| `undefined` | `const` | No summary found in JSDoc. |
| `uninterruptible` | `const` | Returns a new effect that disables interruption for the given effect. |
| `uninterruptibleMask` | `const` | Disables interruption and provides a restore function to restore the interruptible state within the effect. |
| `unwrapReason` | `const` | Promotes nested reason errors into the Effect error channel, replacing the parent error. |
| `updateService` | `const` | Updates the service with the required service entry. |
| `updateServices` | `const` | Provides part of the required context while leaving the rest unchanged. |
| `useSpan` | `const` | Create a new span for tracing, and automatically close it when the effect completes. |
| `Variance` | `interface` | Variance interface for Effect, encoding the type parameters' variance. |
| `void` | `const` | No summary found in JSDoc. |
| `when` | `const` | Conditionally executes an effect based on a boolean condition. |
| `whileLoop` | `const` | Executes a body effect repeatedly while a condition holds true. |
| `withConcurrency` | `const` | Sets the concurrency level for parallel operations within an effect. |
| `withExecutionPlan` | `const` | Apply an `ExecutionPlan` to an effect, retrying with step-provided resources until it succeeds or the plan is exhausted. |
| `withFiber` | `const` | Provides access to the current fiber within an effect computation. |
| `withLogger` | `const` | Adds a logger to the set of loggers which will output logs for this effect. |
| `withLogSpan` | `const` | Adds a span to each log line in this effect. |
| `withParentSpan` | `const` | Adds the provided span to the current span stack. |
| `withSpan` | `const` | Wraps the effect with a new span for tracing. |
| `withSpanScoped` | `const` | Wraps the effect with a new span for tracing. |
| `withTracer` | `const` | Provides a tracer to an effect. |
| `withTracerEnabled` | `const` | Disable the tracer for the given Effect. |
| `withTracerTiming` | `const` | Enables or disables tracer timing for the given Effect. |
| `Yieldable` | `interface` | A type that can be yielded in an Effect generator function. |
| `YieldableClass` | `class` | No summary found in JSDoc. |
| `yieldNow` | `const` | Yields control back to the Effect runtime, allowing other fibers to execute. |
| `yieldNowWith` | `const` | Yields control back to the Effect runtime with a specified priority, allowing other fibers to execute. |
| `zip` | `const` | Combines two effects into a single effect, producing a tuple with the results of both effects. |
| `zipWith` | `const` | Combines two effects sequentially and applies a function to their results to produce a single value. |
