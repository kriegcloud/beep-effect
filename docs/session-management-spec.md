# Session Management (Effect-native)

Status: Draft
Date: 2026-01-22

## Summary
Provide a first-class, Effect-native session management surface around the v2
Claude Agent SDK sessions. Sessions are scoped resources, expose their session
ID via Effect, and can be composed via Layers and Context services. Session
creation requires a per-session model (no global model default).

## Goals
- Effect-native session API with scoped lifecycle, typed errors, and streaming.
- Surface session ID and status as Effect values.
- Allow multiple concurrent sessions via Layer scoping.
- Preserve SDK session semantics and backpressure.

## Non-goals
- Reimplement Claude Code transport or protocol.
- Background pumping of streams by default.
- Session pooling or registry in v1 (optional Phase 2).

## Key Decisions
- **Per-session model only:** the model must be provided at session creation.
- **No session registry by default:** keep the base API minimal. Registry/event
  stream is optional Phase 2.
- **No background pump:** sessionId resolves only after the init message is
  consumed, matching SDK semantics.

## Current Baseline
- `src/Session.ts` already wraps `SDKSession` with `SessionHandle` using
  `Deferred`, `SynchronizedRef`, and `Stream.fromAsyncIterable`.
- Session ID resolves when a `system:init` message is observed by the stream.
- Streams are single-consumer; sends are serialized with a semaphore.

## Proposed API Surface

### SessionConfig (defaults only, no model)
```ts
export class SessionConfig extends Context.Tag("@effect/claude-agent-sdk/SessionConfig")<
  SessionConfig,
  {
    readonly defaults: Omit<SDKSessionOptions, "model">
  }
>() {
  static readonly layer: Layer.Layer<SessionConfig, ConfigError>
  static readonly layerFromEnv: (prefix?: string) => Layer.Layer<SessionConfig, ConfigError>
}
```

Notes:
- Defaults include `executable: "bun"`, `pathToClaudeCodeExecutable`,
  `executableArgs`, `env` (including auth), `permissionMode`, `allowedTools`,
  and `disallowedTools`.
- `model` is **excluded** to enforce per-session selection.

Environment keys (via `SessionConfig.layerFromEnv`):
- `ANTHROPIC_API_KEY` / `API_KEY`
- `CLAUDE_CODE_SESSION_ACCESS_TOKEN`
- `EXECUTABLE`
- `PATH_TO_CLAUDE_CODE_EXECUTABLE`
- `EXECUTABLE_ARGS` (comma-separated)
- `PERMISSION_MODE`
- `ALLOWED_TOOLS` (comma-separated)
- `DISALLOWED_TOOLS` (comma-separated)

### SessionManager (resource factory)
```ts
export class SessionManager extends Context.Tag("@effect/claude-agent-sdk/SessionManager")<
  SessionManager,
  {
    readonly create: (options: SDKSessionOptions) =>
      Effect.Effect<SessionHandle, SessionError, Scope.Scope>

    readonly resume: (sessionId: SessionId, options: SDKSessionOptions) =>
      Effect.Effect<SessionHandle, SessionError, Scope.Scope>

    readonly prompt: (message: string, options: SDKSessionOptions) =>
      Effect.Effect<SDKResultMessage, TransportError>

    readonly withSession: <A, E, R>(
      options: SDKSessionOptions,
      use: Effect.Effect<A, E, R & Session>
    ) => Effect.Effect<A, E | SessionError, R>
  }
>() {
  static readonly layer: Layer.Layer<SessionManager, SessionError, SessionConfig>
  static readonly layerDefault: Layer.Layer<SessionManager, SessionError>
}
```

### Session service (scoped, current session)
```ts
export class SessionService extends Context.Tag("@effect/claude-agent-sdk/SessionService")<
  SessionService,
  {
    readonly handle: SessionHandle
    readonly info: Effect.Effect<SessionInfo, SessionError>
    readonly sessionId: Effect.Effect<SessionId, SessionError>
    readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>
    readonly stream: Stream.Stream<SDKMessage, SessionError>
    readonly close: Effect.Effect<void, SessionError>
  }
>() {
  static readonly layer: (options: SDKSessionOptions) =>
    Layer.Layer<SessionService, SessionError, SessionManager>
}
```

### SessionInfo
```ts
export const SessionStatus = Schema.Literal(
  "opening",
  "ready",
  "streaming",
  "idle",
  "closing",
  "closed",
  "failed"
)

export const SessionInfo = Schema.Struct({
  sessionId: Schema.optional(SessionId),
  status: SessionStatus,
  createdAt: Schema.Number,
  lastActivityAt: Schema.optional(Schema.Number),
  model: Schema.String,
  resumeFrom: Schema.optional(SessionId),
  options: SDKSessionOptions
})
```

## Lifecycle Semantics
- `SessionManager.create` requires `model` in options; fails fast if missing.
- `Session.sessionId` resolves after the init message is observed (default).
- `stream` is single-consumer and returns after the next `result` message.
- `close` waits for in-flight sends/streams before closing SDK session.
- Session ID resolves only after the init message is observed; no background
  pumping is performed by default.

## Observability
- Annotate logs with `session_id` once resolved using
  `Effect.annotateLogsScoped` around `send`, `stream`, and `close`.
- Track metrics (optional): active sessions, session duration, failures.

## Optional Phase 2: SessionRegistry
- Add a lightweight registry service with `PubSub` for session events:
  `SessionCreated`, `SessionIdResolved`, `SessionClosed`, `SessionFailed`.
- Keep it out of the base layer to avoid overhead for simple usage.

## Implementation Plan
1) **Config**: add `src/SessionConfig.ts` and export from `src/index.ts`.
2) **Manager**: add `src/SessionManager.ts` using `SessionConfig` defaults.
3) **Session service**: add `src/SessionService.ts` or embed in `SessionManager`.
4) **Info tracking**: add `SessionInfo` schema + update on stream/send/close.
5) **Docs**: add README section and examples for per-session model usage.
6) **Tests**:
   - Model-required failure
   - `sessionId` resolution
   - `close` behavior
   - optional eager session ID behavior

## Open Questions
- Should `SessionManager` compose `AgentSdkConfig` for auth/env, or keep a
  separate config for sessions?
- Do we want `withSession` to install log annotations automatically?
