# JSDoc Analysis Report: @beep/errors

> **Generated**: 2025-12-06T05:34:55.260Z
> **Package**: packages/common/errors
> **Status**: 133 exports need documentation

---

## Instructions for Agent

You are tasked with adding missing JSDoc documentation to this package. Follow these rules:

1. **Required Tags**: Every public export must have:
   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")
   - `@example` - Working TypeScript code example with imports
   - `@since` - Version when added (use `0.1.0` for new items)

2. **Example Format**:
   ```typescript
   /**
    * Brief description of what this does.
    *
    * @example
    * ```typescript
    * import { MyThing } from "@beep/errors"
    *
    * const result = MyThing.make({ field: "value" })
    * console.log(result)
    * // => { field: "value" }
    * ```
    *
    * @category Constructors
    * @since 0.1.0
    */
   ```

3. **Workflow**:
   - Work through the checklist below in order
   - Mark items complete by changing `[ ]` to `[x]`
   - After completing all items, delete this file

---

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/client.ts:13` — **BeepError** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **BeepError** (const)
  - Missing: @category, @example, @since

- [ ] `src/server.ts:13` — **BeepError** (const)
  - Missing: @category, @example, @since

- [ ] `src/shared.ts:13` — **BeepError** (const)
  - Missing: @category, @example, @since

### Medium Priority (Missing some tags)

- [ ] `src/client.ts:47` — **withEnvLogging** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Client-safe noop for env-driven logging hooks.

- [ ] `src/client.ts:55` — **accumulateEffectsAndReport** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Accumulate successes/errors with client-safe reporting.

- [ ] `src/client.ts:81` — **colorForLevel** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Colorizes log levels when enabled.

- [ ] `src/client.ts:98` — **formatMessage** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Normalizes messages into strings for logging.

- [ ] `src/client.ts:114` — **formatAnnotations** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Renders annotations into a log-friendly string.

- [ ] `src/client.ts:130` — **formatSpans** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Formats spans relative to a timestamp.

- [ ] `src/client.ts:142` — **shouldPrintCause** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Determines whether to print a cause alongside a log line.

- [ ] `src/client.ts:158` — **formatCausePretty** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty-prints a cause with optional color.

- [ ] `src/client.ts:171` — **extractPrimaryError** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Extracts the primary error/value from a cause.

- [ ] `src/client.ts:43` — **PrettyLoggerConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty, colored console logger helpers + small telemetry helpers for Effect (shared/client-safe core).

- [ ] `src/client.ts:63` — **defaultConfig** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Default pretty logger configuration.

- [ ] `src/client.ts:194` — **CauseHeadingOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Formatting options for rendered cause headings.

- [ ] `src/client.ts:217` — **withLogContext** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to annotate logs with a stable set of fields for a component/service.

- [ ] `src/client.ts:228` — **withRootSpan** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to add a root span around an operation.

- [ ] `src/client.ts:239` — **SpanMetricsConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Metrics configuration for span instrumentation.

- [ ] `src/client.ts:253` — **withSpanAndMetrics** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Instrument an effect with span, optional annotations, and optional metrics.

- [ ] `src/client.ts:293` — **logCausePretty** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Convenience: log a cause pretty-printed (independent helper).

- [ ] `src/client.ts:308` — **parseLevel** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Parse a log level literal into a LogLevel value.

- [ ] `src/client.ts:332` — **AccumulateResult** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Aggregated successes/errors from a batch of effects.

- [ ] `src/client.ts:343` — **AccumulateOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Options for concurrent accumulation helpers.

- [ ] `src/client.ts:356` — **accumulateEffects** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Partition a collection of effects into successes and errors.

- [ ] `src/errors.ts:23` — **Es5Error** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: ES5-compatible error wrapper.

- [ ] `src/errors.ts:35` — **UnrecoverableError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Fatal error marker for unrecoverable failures.

- [ ] `src/errors.ts:42` — **UnrecoverableError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:59` — **NotFoundError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Resource-not-found error.

- [ ] `src/errors.ts:66` — **NotFoundError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:82` — **UniqueViolationError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Conflict error when a unique field already exists.

- [ ] `src/errors.ts:89` — **UniqueViolationError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:106` — **DatabaseError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Database failure wrapper with optional cause.

- [ ] `src/errors.ts:113` — **DatabaseError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:129` — **TransactionError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Transaction failure wrapper.

- [ ] `src/errors.ts:136` — **TransactionError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:152` — **ConnectionError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Connection-channel failure wrapper.

- [ ] `src/errors.ts:159` — **ConnectionError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:175` — **ParseError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Payload/decoding failure wrapper.

- [ ] `src/errors.ts:182` — **ParseError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:198` — **Unauthorized** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Unauthorized error for missing auth.

- [ ] `src/errors.ts:210` — **Unauthorized** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:226` — **Forbidden** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Forbidden error when auth present but action denied.

- [ ] `src/errors.ts:238` — **Forbidden** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/errors.ts:254` — **UnknownError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Generic unknown error wrapper with optional custom message.

- [ ] `src/index.ts:47` — **withEnvLogging** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Client-safe noop for env-driven logging hooks.

- [ ] `src/index.ts:55` — **accumulateEffectsAndReport** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Accumulate successes/errors with client-safe reporting.

- [ ] `src/index.ts:81` — **colorForLevel** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Colorizes log levels when enabled.

- [ ] `src/index.ts:98` — **formatMessage** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Normalizes messages into strings for logging.

- [ ] `src/index.ts:114` — **formatAnnotations** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Renders annotations into a log-friendly string.

- [ ] `src/index.ts:130` — **formatSpans** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Formats spans relative to a timestamp.

- [ ] `src/index.ts:142` — **shouldPrintCause** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Determines whether to print a cause alongside a log line.

- [ ] `src/index.ts:158` — **formatCausePretty** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty-prints a cause with optional color.

- [ ] `src/index.ts:171` — **extractPrimaryError** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Extracts the primary error/value from a cause.

- [ ] `src/index.ts:43` — **PrettyLoggerConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty, colored console logger helpers + small telemetry helpers for Effect (shared/client-safe core).

- [ ] `src/index.ts:63` — **defaultConfig** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Default pretty logger configuration.

- [ ] `src/index.ts:194` — **CauseHeadingOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Formatting options for rendered cause headings.

- [ ] `src/index.ts:217` — **withLogContext** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to annotate logs with a stable set of fields for a component/service.

- [ ] `src/index.ts:228` — **withRootSpan** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to add a root span around an operation.

- [ ] `src/index.ts:239` — **SpanMetricsConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Metrics configuration for span instrumentation.

- [ ] `src/index.ts:253` — **withSpanAndMetrics** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Instrument an effect with span, optional annotations, and optional metrics.

- [ ] `src/index.ts:293` — **logCausePretty** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Convenience: log a cause pretty-printed (independent helper).

- [ ] `src/index.ts:308` — **parseLevel** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Parse a log level literal into a LogLevel value.

- [ ] `src/index.ts:332` — **AccumulateResult** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Aggregated successes/errors from a batch of effects.

- [ ] `src/index.ts:343` — **AccumulateOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Options for concurrent accumulation helpers.

- [ ] `src/index.ts:356` — **accumulateEffects** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Partition a collection of effects into successes and errors.

- [ ] `src/index.ts:23` — **Es5Error** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: ES5-compatible error wrapper.

- [ ] `src/index.ts:35` — **UnrecoverableError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Fatal error marker for unrecoverable failures.

- [ ] `src/index.ts:42` — **UnrecoverableError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:59` — **NotFoundError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Resource-not-found error.

- [ ] `src/index.ts:66` — **NotFoundError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:82` — **UniqueViolationError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Conflict error when a unique field already exists.

- [ ] `src/index.ts:89` — **UniqueViolationError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:106` — **DatabaseError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Database failure wrapper with optional cause.

- [ ] `src/index.ts:113` — **DatabaseError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:129` — **TransactionError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Transaction failure wrapper.

- [ ] `src/index.ts:136` — **TransactionError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:152` — **ConnectionError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Connection-channel failure wrapper.

- [ ] `src/index.ts:159` — **ConnectionError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:175` — **ParseError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Payload/decoding failure wrapper.

- [ ] `src/index.ts:182` — **ParseError** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:198` — **Unauthorized** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Unauthorized error for missing auth.

- [ ] `src/index.ts:210` — **Unauthorized** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:226` — **Forbidden** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Forbidden error when auth present but action denied.

- [ ] `src/index.ts:238` — **Forbidden** (namespace)
  - Missing: @example
  - Has: @since, @category

- [ ] `src/index.ts:254` — **UnknownError** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Generic unknown error wrapper with optional custom message.

- [ ] `src/server.ts:83` — **makePrettyConsoleLoggerLayer** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Build a pretty console logger Layer (server-only).

- [ ] `src/server.ts:94` — **withPrettyLogging** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Wrap an Effect with pretty logging and minimum log level (server-only).

- [ ] `src/server.ts:222` — **formatCauseHeading** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Render a formatted heading for a Cause (optionally with code frames).

- [ ] `src/server.ts:282` — **makePrettyConsoleLogger** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Build a pretty console logger instance (server-only).

- [ ] `src/server.ts:61` — **CauseHeadingOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Formatting options for pretty cause headings (server-only).

- [ ] `src/server.ts:108` — **runWithPrettyLogsExit** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Run an Effect with pretty logging and return Exit (server-only convenience).

- [ ] `src/server.ts:364` — **readEnvLoggerConfig** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Reads APP_LOG_FORMAT and APP_LOG_LEVEL with env-sensitive defaults.

- [ ] `src/server.ts:403` — **makeEnvLoggerLayerFromEnv** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Build a logger layer from environment variables.

- [ ] `src/server.ts:416` — **withEnvLogging** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Apply the environment-derived logger and minimum level to an Effect.

- [ ] `src/server.ts:435` — **accumulateEffectsAndReport** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Accumulate effects and log/report errors (server variant).

- [ ] `src/server.ts:81` — **colorForLevel** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Colorizes log levels when enabled.

- [ ] `src/server.ts:98` — **formatMessage** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Normalizes messages into strings for logging.

- [ ] `src/server.ts:114` — **formatAnnotations** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Renders annotations into a log-friendly string.

- [ ] `src/server.ts:130` — **formatSpans** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Formats spans relative to a timestamp.

- [ ] `src/server.ts:142` — **shouldPrintCause** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Determines whether to print a cause alongside a log line.

- [ ] `src/server.ts:158` — **formatCausePretty** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty-prints a cause with optional color.

- [ ] `src/server.ts:171` — **extractPrimaryError** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Extracts the primary error/value from a cause.

- [ ] `src/server.ts:43` — **PrettyLoggerConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty, colored console logger helpers + small telemetry helpers for Effect (shared/client-safe core).

- [ ] `src/server.ts:63` — **defaultConfig** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Default pretty logger configuration.

- [ ] `src/server.ts:217` — **withLogContext** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to annotate logs with a stable set of fields for a component/service.

- [ ] `src/server.ts:228` — **withRootSpan** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to add a root span around an operation.

- [ ] `src/server.ts:239` — **SpanMetricsConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Metrics configuration for span instrumentation.

- [ ] `src/server.ts:253` — **withSpanAndMetrics** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Instrument an effect with span, optional annotations, and optional metrics.

- [ ] `src/server.ts:293` — **logCausePretty** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Convenience: log a cause pretty-printed (independent helper).

- [ ] `src/server.ts:308` — **parseLevel** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Parse a log level literal into a LogLevel value.

- [ ] `src/server.ts:332` — **AccumulateResult** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Aggregated successes/errors from a batch of effects.

- [ ] `src/server.ts:343` — **AccumulateOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Options for concurrent accumulation helpers.

- [ ] `src/server.ts:356` — **accumulateEffects** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Partition a collection of effects into successes and errors.

- [ ] `src/shared.ts:81` — **colorForLevel** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Colorizes log levels when enabled.

- [ ] `src/shared.ts:98` — **formatMessage** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Normalizes messages into strings for logging.

- [ ] `src/shared.ts:114` — **formatAnnotations** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Renders annotations into a log-friendly string.

- [ ] `src/shared.ts:130` — **formatSpans** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Formats spans relative to a timestamp.

- [ ] `src/shared.ts:142` — **shouldPrintCause** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Determines whether to print a cause alongside a log line.

- [ ] `src/shared.ts:158` — **formatCausePretty** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty-prints a cause with optional color.

- [ ] `src/shared.ts:171` — **extractPrimaryError** (function)
  - Missing: @example
  - Has: @category, @since
  - Context: Extracts the primary error/value from a cause.

- [ ] `src/shared.ts:43` — **PrettyLoggerConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Pretty, colored console logger helpers + small telemetry helpers for Effect (shared/client-safe core).

- [ ] `src/shared.ts:63` — **defaultConfig** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Default pretty logger configuration.

- [ ] `src/shared.ts:194` — **CauseHeadingOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Formatting options for rendered cause headings.

- [ ] `src/shared.ts:217` — **withLogContext** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to annotate logs with a stable set of fields for a component/service.

- [ ] `src/shared.ts:228` — **withRootSpan** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Helper to add a root span around an operation.

- [ ] `src/shared.ts:239` — **SpanMetricsConfig** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Metrics configuration for span instrumentation.

- [ ] `src/shared.ts:253` — **withSpanAndMetrics** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Instrument an effect with span, optional annotations, and optional metrics.

- [ ] `src/shared.ts:293` — **logCausePretty** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Convenience: log a cause pretty-printed (independent helper).

- [ ] `src/shared.ts:308` — **parseLevel** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Parse a log level literal into a LogLevel value.

- [ ] `src/shared.ts:332` — **AccumulateResult** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Aggregated successes/errors from a batch of effects.

- [ ] `src/shared.ts:343` — **AccumulateOptions** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Options for concurrent accumulation helpers.

- [ ] `src/shared.ts:356` — **accumulateEffects** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Partition a collection of effects into successes and errors.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 133 |
| Fully Documented | 0 |
| Missing Documentation | 133 |
| Missing @category | 4 |
| Missing @example | 133 |
| Missing @since | 4 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/errors
```

If successful, delete this file. If issues remain, the checklist will be regenerated.