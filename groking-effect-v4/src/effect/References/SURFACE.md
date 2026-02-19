# effect/References Surface

Total exports: 18

| Export | Kind | Overview |
|---|---|---|
| `CurrentConcurrency` | `const` | Reference for controlling the current concurrency limit. Can be set to "unbounded" for unlimited concurrency or a specific number to limit concurrent operations. |
| `CurrentLogAnnotations` | `const` | Reference for managing log annotations that are automatically added to all log entries. These annotations provide contextual metadata that appears in every log message. |
| `CurrentLogLevel` | `const` | Reference for controlling the current log level for dynamic filtering. |
| `CurrentLogSpans` | `const` | Reference for managing log spans that track the duration and hierarchy of operations. Each span represents a labeled time period for performance analysis and debugging. |
| `CurrentStackFrame` | `const` | No summary found in JSDoc. |
| `CurrentTraceLevel` | `const` | Reference for controlling the current trace level for dynamic filtering. |
| `DisablePropagation` | `const` | No summary found in JSDoc. |
| `MaxOpsBeforeYield` | `const` | A service reference that controls the maximum number of operations a fiber can perform before yielding control back to the scheduler. This helps prevent long-running fibers from... |
| `MinimumLogLevel` | `const` | Reference for setting the minimum log level threshold. Log entries below this level will be filtered out completely. |
| `MinimumTraceLevel` | `const` | Reference for setting the minimum trace level threshold. Spans and their descendants below this level will have their sampling decision forced to false, preventing them from bei... |
| `Scheduler` | `interface` | A scheduler manages the execution of Effects by controlling when and how tasks are scheduled and executed. It determines the execution mode (synchronous or asynchronous) and han... |
| `StackFrame` | `interface` | No summary found in JSDoc. |
| `Tracer` | `interface` | No summary found in JSDoc. |
| `TracerEnabled` | `const` | Reference for controlling whether tracing is enabled globally. When set to false, spans will not be registered with the tracer and tracing overhead is minimized. |
| `TracerSpanAnnotations` | `const` | Reference for managing span annotations that are automatically added to all new spans. These annotations provide context and metadata that applies across multiple spans. |
| `TracerSpanLinks` | `const` | Reference for managing span links that are automatically added to all new spans. Span links connect related spans that are not in a parent-child relationship. |
| `TracerTimingEnabled` | `const` | Reference for controlling whether trace timing is enabled globally. When set to false, spans will not contain timing information (trace time will always be set to zero). |
| `UnhandledLogLevel` | `const` | The log level for unhandled errors. This reference allows you to set the log level for unhandled errors that occur during Effect execution. |
