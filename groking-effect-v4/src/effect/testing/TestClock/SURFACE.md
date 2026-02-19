# effect/testing/TestClock Surface

Total exports: 7

| Export | Kind | Overview |
|---|---|---|
| `adjust` | `const` | Accesses a `TestClock` instance in the context and increments the time by the specified duration, running any actions scheduled for on or before the new time in order. |
| `layer` | `const` | Creates a `Layer` which constructs a `TestClock`. |
| `make` | `const` | Creates a `TestClock` with optional configuration. |
| `setTime` | `const` | Sets the current clock time to the specified `timestamp`. Any effects that were scheduled to occur on or before the new time will be run in order. |
| `TestClock` | `interface` | A `TestClock` simplifies deterministically and efficiently testing effects which involve the passage of time. |
| `testClockWith` | `const` | Retrieves the `TestClock` service for this test and uses it to run the specified workflow. |
| `withLive` | `const` | Executes the specified effect with the live `Clock` instead of the `TestClock`. |
