# effect/Logger Surface

Total exports: 22

| Export | Kind | Overview |
|---|---|---|
| `batched` | `const` | Returns a new `Logger` which will aggregate logs output by the specified `Logger` over the provided `window`. After the `window` has elapsed, the provided `flush` function will ... |
| `consoleJson` | `const` | A `Logger` which outputs logs using a structured format serialized as JSON on a single line and writes them to the console. |
| `consoleLogFmt` | `const` | A `Logger` which outputs logs using the [logfmt](https://brandur.org/logfmt) style and writes them to the console. |
| `consolePretty` | `const` | A `Logger` which outputs logs in a "pretty" format and writes them to the console. |
| `consoleStructured` | `const` | A `Logger` which outputs logs using a strctured format and writes them to the console. |
| `CurrentLoggers` | `const` | No summary found in JSDoc. |
| `defaultLogger` | `const` | The default logging implementation used by the Effect runtime. |
| `formatJson` | `const` | A `Logger` which outputs logs using a structured format serialized as JSON on a single line. |
| `formatLogFmt` | `const` | A `Logger` which outputs logs using the [logfmt](https://brandur.org/logfmt) style. |
| `formatSimple` | `const` | A `Logger` which outputs logs as a string. |
| `formatStructured` | `const` | A `Logger` which outputs logs using a structured format. |
| `isLogger` | `const` | Returns `true` if the specified value is a `Logger`, otherwise returns `false`. |
| `layer` | `const` | Creates a `Layer` which will overwrite the current set of loggers with the specified array of `loggers`. |
| `Logger` | `interface` | No summary found in JSDoc. |
| `LogToStderr` | `const` | No summary found in JSDoc. |
| `make` | `const` | Creates a new `Logger` from a log function. |
| `map` | `const` | Transforms the output of a `Logger` using the provided function. |
| `toFile` | `const` | Create a Logger from another string Logger that writes to the specified file. |
| `tracerLogger` | `const` | A `Logger` which includes log messages as tracer span events. |
| `withConsoleError` | `const` | Returns a new `Logger` that writes all output of the specified `Logger` to the console using `console.error`. |
| `withConsoleLog` | `const` | Returns a new `Logger` that writes all output of the specified `Logger` to the console using `console.log`. |
| `withLeveledConsole` | `const` | Returns a new `Logger` that writes all output of the specified `Logger` to the console. |
