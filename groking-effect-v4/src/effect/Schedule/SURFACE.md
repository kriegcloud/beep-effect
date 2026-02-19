# effect/Schedule Surface

Total exports: 51

| Export | Kind | Overview |
|---|---|---|
| `addDelay` | `const` | Returns a new `Schedule` that adds the delay computed by the specified effectful function to the the next recurrence of the schedule. |
| `andThen` | `const` | Returns a new `Schedule` that will first execute the left (i.e. `self`) schedule to completion. Once the left schedule is complete, the right (i.e. `other`) schedule will be exe... |
| `andThenResult` | `const` | Returns a new `Schedule` that will first execute the left (i.e. `self`) schedule to completion. Once the left schedule is complete, the right (i.e. `other`) schedule will be exe... |
| `both` | `const` | Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting a tuple of the output... |
| `bothLeft` | `const` | Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting the result of the lef... |
| `bothRight` | `const` | Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting the result of the rig... |
| `bothWith` | `const` | Combines two `Schedule`s by recurring if both of the two schedules want to recur, using the maximum of the two durations between recurrences and outputting the result of the com... |
| `collectInputs` | `const` | Returns a new `Schedule` that always recurs, collecting all inputs of the schedule into an array. |
| `collectOutputs` | `const` | Returns a new `Schedule` that always recurs, collecting all outputs of the schedule into an array. |
| `collectWhile` | `const` | Returns a new `Schedule` that recurs as long as the specified `predicate` returns `true`, collecting all outputs of the schedule into an array. |
| `compose` | `const` | Returns a new `Schedule` that combines two schedules by running them sequentially. First the current schedule runs to completion, then the other schedule runs to completion. The... |
| `cron` | `const` | Returns a new `Schedule` that recurs on the specified `Cron` schedule and outputs the duration between recurrences. |
| `CurrentMetadata` | `const` | No summary found in JSDoc. |
| `delays` | `const` | Returns a new schedule that outputs the delay between each occurence. |
| `duration` | `const` | Returns a schedule that recurs once after the specified duration. |
| `during` | `const` | Returns a new `Schedule` that will always recur, but only during the specified `duration` of time. |
| `either` | `const` | Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting a tuple of the out... |
| `eitherLeft` | `const` | Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting the result of the ... |
| `eitherRight` | `const` | Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting the result of the ... |
| `eitherWith` | `const` | Combines two `Schedule`s by recurring if either of the two schedules wants to recur, using the minimum of the two durations between recurrences and outputting the result of the ... |
| `elapsed` | `const` | A schedule that always recurs and returns the total elapsed duration since the first recurrence. |
| `exponential` | `const` | A schedule that always recurs, but will wait a certain amount between repetitions, given by `base * factor.pow(n)`, where `n` is the number of repetitions so far. Returns the cu... |
| `fibonacci` | `const` | A schedule that always recurs, increasing delays by summing the preceding two delays (similar to the fibonacci sequence). Returns the current duration between recurrences. |
| `fixed` | `const` | Returns a `Schedule` that recurs on the specified fixed `interval` and outputs the number of repetitions of the schedule so far. |
| `forever` | `const` | Returns a new `Schedule` that will recur forever. |
| `fromStep` | `const` | Creates a Schedule from a step function that returns a Pull. |
| `fromStepWithMetadata` | `const` | Creates a Schedule from a step function that receives metadata about the schedule's execution. |
| `identity` | `const` | No summary found in JSDoc. |
| `InputMetadata` | `interface` | Metadata provided to schedule functions containing timing and input information. |
| `isSchedule` | `const` | Type guard that checks if a value is a Schedule. |
| `map` | `const` | Returns a new `Schedule` that maps the output of this schedule using the specified function. |
| `Metadata` | `interface` | Extended metadata that includes both input metadata and the output value from the schedule. |
| `modifyDelay` | `const` | Returns a new `Schedule` that modifies the delay of the next recurrence of the schedule using the specified effectual function. |
| `passthrough` | `const` | Returns a new `Schedule` that outputs the inputs of the specified schedule. |
| `recurs` | `const` | Returns a `Schedule` which can only be stepped the specified number of `times` before it terminates. |
| `reduce` | `const` | Returns a new `Schedule` that combines the outputs of the provided schedule using the specified effectful `combine` function and starting from the specified `initial` state. |
| `satisfiesErrorType` | `const` | Ensures that the provided schedule respects a specified error type. |
| `satisfiesInputType` | `const` | Ensures that the provided schedule respects a specified input type. |
| `satisfiesOutputType` | `const` | Ensures that the provided schedule respects a specified output type. |
| `satisfiesServicesType` | `const` | Ensures that the provided schedule respects a specified context type. |
| `Schedule` | `interface` | A Schedule defines a strategy for repeating or retrying effects based on some policy. |
| `spaced` | `const` | Returns a schedule that recurs continuously, each repetition spaced the specified duration from the last run. |
| `take` | `const` | Returns a new `Schedule` that takes at most the specified number of outputs from the schedule. Once the specified number of outputs is reached, the schedule will stop. |
| `tapInput` | `const` | Returns a new `Schedule` that allows execution of an effectful function for every input to the schedule, but does not alter the inputs and outputs of the schedule. |
| `tapOutput` | `const` | Returns a new `Schedule` that allows execution of an effectful function for every output of the schedule, but does not alter the inputs and outputs of the schedule. |
| `toStep` | `const` | Extracts the step function from a Schedule. |
| `toStepWithMetadata` | `const` | Extracts a step function from a Schedule that provides metadata about each execution. It will also handle sleeping for the computed delay. |
| `toStepWithSleep` | `const` | Extracts a step function from a Schedule that automatically handles sleep delays. |
| `unfold` | `const` | Creates a schedule that unfolds a state by repeatedly applying a function, outputting the current state and computing the next state. |
| `while` | `const` | No summary found in JSDoc. |
| `windowed` | `const` | A schedule that divides the timeline to `interval`-long windows, and sleeps until the nearest window boundary every time it recurs. |
