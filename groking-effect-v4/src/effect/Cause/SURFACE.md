# effect/Cause Surface

Total exports: 62

| Export | Kind | Overview |
|---|---|---|
| `annotate` | `const` | Attaches metadata to every reason in a {@link Cause}. |
| `annotations` | `const` | Reads the merged annotations from all reasons in a {@link Cause}. |
| `Cause` | `interface` | A structured representation of how an Effect failed. |
| `combine` | `const` | Merges two causes into a single cause whose `reasons` array is the union of both inputs (de-duplicated by value equality). |
| `die` | `const` | Creates a {@link Cause} containing a single {@link Die} reason with the given defect. |
| `Die` | `interface` | An untyped defect — typically a programming error or an uncaught exception. |
| `done` | `const` | Creates an Effect that fails with a {@link Done} error. Shorthand for `Effect.fail(Cause.Done(value))`. |
| `Done` | `interface` | A graceful completion signal for queues and streams. |
| `DoneTypeId` | `const` | Unique brand for {@link Done} values. |
| `empty` | `const` | A {@link Cause} with an empty `reasons` array. |
| `ExceededCapacityError` | `interface` | An error indicating that a bounded resource (queue, pool, semaphore, etc.) has exceeded its capacity. |
| `ExceededCapacityErrorTypeId` | `const` | Unique brand for {@link ExceededCapacityError}. |
| `fail` | `const` | Creates a {@link Cause} containing a single {@link Fail} reason with the given typed error. |
| `Fail` | `interface` | A typed, expected error produced by `Effect.fail`. |
| `filterInterruptors` | `const` | Extracts the set of interrupting fiber IDs from a cause. Returns `Filter.fail` with the original cause when no {@link Interrupt} reason is found. |
| `findDefect` | `const` | Returns the first defect value (`unknown`) from a cause. Returns `Filter.fail` with the original cause when no {@link Die} reason is found. |
| `findDie` | `const` | Returns the first {@link Die} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Die` is found. |
| `findError` | `const` | Returns the first typed error value `E` from a cause. Returns `Filter.fail` with the remaining cause when no `Fail` is found. |
| `findErrorOption` | `const` | Returns the first typed error value `E` from a cause wrapped in `Option.some`, or `Option.none` if no {@link Fail} reason exists. |
| `findFail` | `const` | Returns the first {@link Fail} reason from a cause, including its annotations. Returns `Filter.fail` with the remaining cause when no `Fail` is found. |
| `findInterrupt` | `const` | Returns the first {@link Interrupt} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Interrupt` is found. |
| `fromReasons` | `const` | Creates a {@link Cause} from an array of {@link Reason} values. |
| `hasDies` | `const` | Returns `true` if the cause contains at least one {@link Die} reason. |
| `hasFails` | `const` | Returns `true` if the cause contains at least one {@link Fail} reason. |
| `hasInterrupts` | `const` | Returns `true` if the cause contains at least one {@link Interrupt} reason. |
| `hasInterruptsOnly` | `const` | Returns `true` if every reason in the cause is an {@link Interrupt} (and there is at least one reason). |
| `IllegalArgumentError` | `interface` | An error indicating that a function received an argument that violates its contract (e.g. negative where positive was expected). |
| `IllegalArgumentErrorTypeId` | `const` | Unique brand for {@link IllegalArgumentError}. |
| `interrupt` | `const` | Creates a {@link Cause} containing a single {@link Interrupt} reason, optionally carrying the interrupting fiber's ID. |
| `Interrupt` | `interface` | A fiber interruption signal, optionally carrying the ID of the fiber that initiated the interruption. |
| `interruptors` | `const` | Collects the fiber IDs of all {@link Interrupt} reasons in the cause into a `ReadonlySet`. Returns an empty set when the cause has no interrupts. |
| `InterruptorStackTrace` | `class` | `ServiceMap` key for the stack frame captured at the point of interruption. |
| `isCause` | `const` | Tests if an arbitrary value is a {@link Cause}. |
| `isDieReason` | `const` | Narrows a {@link Reason} to {@link Die}. |
| `isDone` | `const` | Tests if an arbitrary value is a {@link Done} signal. |
| `isExceededCapacityError` | `const` | Tests if an arbitrary value is an {@link ExceededCapacityError}. |
| `isFailReason` | `const` | Narrows a {@link Reason} to {@link Fail}. |
| `isIllegalArgumentError` | `const` | Tests if an arbitrary value is an {@link IllegalArgumentError}. |
| `isInterruptReason` | `const` | Narrows a {@link Reason} to {@link Interrupt}. |
| `isNoSuchElementError` | `const` | Tests if an arbitrary value is a {@link NoSuchElementError}. |
| `isReason` | `const` | Tests if an arbitrary value is a {@link Reason} (`Fail`, `Die`, or `Interrupt`). |
| `isTimeoutError` | `const` | Tests if an arbitrary value is a {@link TimeoutError}. |
| `isUnknownError` | `const` | Tests if an arbitrary value is an {@link UnknownError}. |
| `makeDieReason` | `const` | Creates a standalone {@link Die} reason (not wrapped in a {@link Cause}). |
| `makeFailReason` | `const` | Creates a standalone {@link Fail} reason (not wrapped in a {@link Cause}). |
| `makeInterruptReason` | `const` | Creates a standalone {@link Interrupt} reason (not wrapped in a {@link Cause}), optionally carrying the interrupting fiber's ID. |
| `map` | `const` | Transforms the typed error values inside a {@link Cause} using the provided function. Only {@link Fail} reasons are affected; {@link Die} and {@link Interrupt} reasons pass thro... |
| `NoSuchElementError` | `interface` | An error indicating that a requested element does not exist. |
| `NoSuchElementErrorTypeId` | `const` | Unique brand for {@link NoSuchElementError}. |
| `pretty` | `const` | Renders a {@link Cause} as a human-readable string for logging or debugging. |
| `prettyErrors` | `const` | Converts a {@link Cause} into an `Array<Error>` suitable for logging or rethrowing. |
| `Reason` | `type` | A single entry inside a {@link Cause}'s `reasons` array. |
| `reasonAnnotations` | `const` | Reads the annotations from a single {@link Reason} as a `ServiceMap`. |
| `ReasonTypeId` | `const` | Unique brand for `Reason` values, used for runtime type checks via {@link isReason}. |
| `squash` | `const` | Collapses a {@link Cause} into a single `unknown` value, picking the "most important" failure in this order: |
| `StackTrace` | `class` | `ServiceMap` key for the stack frame captured at the point of failure. |
| `TimeoutError` | `interface` | An error indicating that an operation exceeded its time limit. |
| `TimeoutErrorTypeId` | `const` | Unique brand for {@link TimeoutError}. |
| `TypeId` | `const` | Unique brand for `Cause` values, used for runtime type checks via {@link isCause}. |
| `UnknownError` | `interface` | A wrapper for errors whose type is not statically known. |
| `UnknownErrorTypeId` | `const` | Unique brand for {@link UnknownError}. |
| `YieldableError` | `interface` | Base interface for error classes that can be yielded directly inside `Effect.gen` (via `Symbol.iterator`) or converted to a failing Effect via `.asEffect()`. |
