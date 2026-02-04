import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"
import { layerConfigFromEnv } from "./internal/config.js"
import type { SDKSessionOptions } from "./Schema/Session.js"
import { SessionPermissionMode } from "./Schema/Session.js"

export type SessionDefaults = Omit<SDKSessionOptions, "model">

export type SessionConfigSettings = {
  readonly defaults: SessionDefaults
}

const normalizeRedacted = (value: Option.Option<Redacted.Redacted>) =>
  Option.flatMap(value, (redacted) =>
    Redacted.value(redacted).trim().length > 0 ? Option.some(redacted) : Option.none()
  )

const parseList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

const parseOptionalList = (value: Option.Option<string>) =>
  Option.flatMap(value, (raw) => {
    const entries = parseList(raw)
    return entries.length > 0 ? Option.some(entries) : Option.none()
  })

export class SessionConfig extends Context.Tag("@effect/claude-agent-sdk/SessionConfig")<
  SessionConfig,
  SessionConfigSettings
>() {
  /**
   * Build SessionConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    SessionConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)))

  /**
   * Default configuration layer for sessions (model must be supplied per session).
   */
  static readonly layer = Layer.effect(
    SessionConfig,
    Effect.gen(function*() {
      const apiKey = normalizeRedacted(
        yield* Config.option(Config.redacted("ANTHROPIC_API_KEY"))
      )
      const apiKeyFallback = normalizeRedacted(
        yield* Config.option(Config.redacted("API_KEY"))
      )
      const sessionAccessToken = normalizeRedacted(
        yield* Config.option(Config.redacted("CLAUDE_CODE_SESSION_ACCESS_TOKEN"))
      )

      const executable = yield* Config.option(
        Schema.Config("EXECUTABLE", Schema.Literal("bun", "node"))
      )
      const pathToClaudeCodeExecutable = yield* Config.option(
        Config.string("PATH_TO_CLAUDE_CODE_EXECUTABLE")
      )
      const executableArgsValue = yield* Config.option(Config.string("EXECUTABLE_ARGS"))
      const permissionMode = yield* Config.option(
        Schema.Config("PERMISSION_MODE", SessionPermissionMode)
      )
      const allowedToolsValue = yield* Config.option(Config.string("ALLOWED_TOOLS"))
      const disallowedToolsValue = yield* Config.option(Config.string("DISALLOWED_TOOLS"))
      const executableArgs = parseOptionalList(executableArgsValue)
      const allowedTools = parseOptionalList(allowedToolsValue)
      const disallowedTools = parseOptionalList(disallowedToolsValue)

      const processEnv = yield* Effect.sync(() => process.env)
      const resolvedApiKey = Option.isSome(apiKey) ? apiKey : apiKeyFallback
      const authEnvOverrides = {
        ...(Option.isSome(resolvedApiKey)
          ? { ANTHROPIC_API_KEY: Redacted.value(resolvedApiKey.value) }
          : {}),
        ...(Option.isSome(sessionAccessToken)
          ? {
              CLAUDE_CODE_SESSION_ACCESS_TOKEN: Redacted.value(sessionAccessToken.value)
            }
          : {})
      }
      const env =
        Object.keys(authEnvOverrides).length > 0
          ? { ...processEnv, ...authEnvOverrides }
          : undefined

      if (!Option.isSome(resolvedApiKey) && !Option.isSome(sessionAccessToken)) {
        yield* Effect.logError(
          "Missing credentials: set ANTHROPIC_API_KEY (or API_KEY) or CLAUDE_CODE_SESSION_ACCESS_TOKEN, or sign in via Claude Code settings."
        )
      }

      const defaults: SessionDefaults = {
        executable: Option.getOrUndefined(executable) ?? "bun",
        pathToClaudeCodeExecutable: Option.getOrUndefined(pathToClaudeCodeExecutable),
        ...(Option.isSome(executableArgs) ? { executableArgs: executableArgs.value } : {}),
        permissionMode: Option.getOrUndefined(permissionMode),
        ...(Option.isSome(allowedTools) ? { allowedTools: allowedTools.value } : {}),
        ...(Option.isSome(disallowedTools) ? { disallowedTools: disallowedTools.value } : {}),
        ...(env ? { env } : {})
      }

      return SessionConfig.of({
        defaults
      })
    })
  )
}
