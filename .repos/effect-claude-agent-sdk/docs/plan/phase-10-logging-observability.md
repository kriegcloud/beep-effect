# Phase 10 - Logging + Observability (Match-first)

Status: Implemented

## Objective
Provide an Effect-native logging/observability layer for the SDK wrapper:
- Match-based utilities to classify SDK messages and events.
- Stream helpers that log to stdout/stderr in a structured way.
- Configurable logging layers (format, level, categories).

## Source Review (Effect Logging + Match)
### Logger APIs
- `Logger.Options` provides `fiberId`, `logLevel`, `message`, `cause`, `context`, `spans`, `annotations`, `date`.
- Built-in loggers: `stringLogger`, `logfmtLogger`, `prettyLogger`, `structuredLogger`, `jsonLogger`.
- Layer helpers: `Logger.replace`, `Logger.add`, `Logger.minimumLogLevel`, `Logger.json/logFmt/pretty/structured`.
- Console routing: `Logger.withLeveledConsole`, `Logger.withConsoleLog`, `Logger.withConsoleError`.
- High-volume support: `Logger.batched`.
- Spans in logs: `Logger.withSpanAnnotations`.

### Effect Logging Hooks
- `Effect.log*` (trace/debug/info/warn/error/fatal) uses fiber logging.
- `Effect.annotateLogs` / `Effect.annotateLogsScoped` for structured metadata.
- `Effect.withLogSpan` for duration tracking.
- `Effect.whenLogLevel` to gate expensive log work.
- `Effect.withUnhandledErrorLogLevel` to tune unhandled fiber logging.

### Match APIs
- `Match.type` + `Match.when` for structural matching.
- `Match.tag` for `_tag`-based discriminated unions.
- `Match.exhaustive` for total coverage.

## Proposed Architecture
### 1) Logging Config + Layers
Create a minimal config service for log format + level:
- `AgentLoggingConfig` (Context.Tag)
  - `format: "pretty" | "structured" | "json" | "logfmt" | "string"`
  - `minLevel: LogLevel.LogLevel`
  - `includeSpans: boolean`
  - `categories: { messages: boolean; queryEvents: boolean; hooks: boolean }`
- `layer` (defaults) + `layerFromEnv(prefix = "AGENTSDK")`
  - Example env: `AGENTSDK_LOG_FORMAT`, `AGENTSDK_LOG_LEVEL`, `AGENTSDK_LOG_SPANS`,
    `AGENTSDK_LOG_MESSAGES`, `AGENTSDK_LOG_QUERY_EVENTS`, `AGENTSDK_LOG_HOOKS`.
- `AgentLogging.layerDefault` wires logger + minimum level.

Implementation details:
- Use `Logger.replace` to swap `Logger.defaultLogger`.
- Pipe through `Logger.withLeveledConsole` for stdout/stderr separation.
- If `includeSpans`, wrap logger with `Logger.withSpanAnnotations`.
- Use `Logger.minimumLogLevel` for global filtering.
- Optionally gate verbose categories with `Effect.whenLogLevel`.

### 2) Match-based Message Classification
Create matchers that map SDK events to structured log entries:
- `matchSdkMessage`: `Match.type<SDKMessage>()`
  - Examples:
    - `{ type: "result", subtype: "success" }` -> Info
    - `{ type: "result", subtype: "error_*" }` -> Error
    - `{ type: "auth_status", error: Match.string }` -> Warning
    - `{ type: "tool_progress" }` -> Debug
    - `{ type: "stream_event" }` -> Trace (if enabled)
- `matchQueryEvent`: `Match.type<QueryEvent>()` + `Match.tag(...)`
  - `QueryQueued`, `QueryStarted` -> Info
  - `QueryCompleted` -> Info/Warning (based on status)
  - `QueryStartFailed` -> Error
- `matchHookInput`: `Match.type<HookInput>()` on `hook_event_name`.

Define a consistent log payload shape:
```ts
type AgentLogEvent = {
  readonly level: LogLevel.LogLevel
  readonly event: string
  readonly message: string
  readonly annotations: Record<string, unknown>
  readonly data?: Record<string, unknown>
}
```

### 3) Logging Utilities
Build utilities that log with annotations and structured payloads:
- `logSdkMessage(message: SDKMessage): Effect.Effect<void>`
  - Uses `matchSdkMessage` to decide log level + annotations.
  - Annotate `session_id`, `type`, `subtype`, `tool_name` (when present).
- `logQueryEvent(event: QueryEvent): Effect.Effect<void>`
  - Annotate `queryId`, `status`, `errorTag`.
- `logHookInput(input: HookInput): Effect.Effect<void>`
  - Annotate `session_id`, `hook_event_name`, `tool_name`.

### 4) Stream Helpers (stdout/stderr)
Expose helpers for streaming:
- `tapSdkLogs(stream: Stream<SDKMessage, E>): Stream<SDKMessage, E>`
  - `Stream.tap(logSdkMessage)` and `Stream.tapErrorCause(Effect.logError)`
- `logSdkStream(stream: Stream<SDKMessage, E>): Effect.Effect<void, E>`
  - `Stream.runDrain(tapSdkLogs(stream))`
- `tapQueryEvents(runtime.events)` to log supervisor lifecycle.

### 5) Optional Service Integration
Provide optional wrappers (no behavior change by default):
- `AgentRuntime.withLogging(runtime, options?)` to return a runtime whose
  `stream/query` are `Stream.tap`-instrumented.
- Or `AgentRuntime.layerLogged` that composes runtime with background
  fibers to consume `runtime.events` and log.

## Implementation Steps
1. Add `src/Logging/Config.ts` (config tag + env layer).
2. Add `src/Logging/Match.ts` (Match-based classification utilities).
3. Add `src/Logging/Events.ts` (log entry mapping + helpers).
4. Add `src/Logging/Stream.ts` (tap/log stream helpers).
5. Add `src/Logging/index.ts` exports + README snippet.
6. Add tests for matchers + logging helpers using `Logger.test` or `Logger.simple`.

## Test Plan
- Use `Logger.test` to verify formatted outputs from `logSdkMessage`.
- Stream test: `Stream.fromIterable([message])` + `tapSdkLogs` emits logs.
- Query event logging: `QuerySupervisor` fake events map to expected levels.
- Ensure log annotations include session/query/tool identifiers.

## Exit Criteria
- Logging layers configurable via env and default layer works with Bun.
- Match utilities cover all `SDKMessage` variants (exhaustive).
- Stream helpers provide a safe, opt-in logging path.
- Tests pass with `bun run typecheck` and `bun test`.
