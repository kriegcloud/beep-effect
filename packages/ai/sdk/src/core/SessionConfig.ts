import { Config, Effect, Layer, Redacted, ServiceMap } from "effect";
import type * as Duration from "effect/Duration";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { layerConfigFromEnv } from "./internal/config.js";
import { missingCredentialsError } from "./internal/credentials.js";
import { defaultSessionLifecyclePolicy } from "./internal/lifecyclePolicy.js";
import type { SDKSessionOptions } from "./Schema/Session.js";
import { SessionPermissionMode } from "./Schema/Session.js";

/**
 * @since 0.0.0
 */
export type SessionDefaults = Omit<SDKSessionOptions, "model">;

/**
 * @since 0.0.0
 */
export type SessionRuntimeSettings = {
  readonly closeDrainTimeout: Duration.Input;
  readonly turnSendTimeout?: Duration.Input;
  readonly turnResultTimeout?: Duration.Input;
};

/**
 * @since 0.0.0
 */
export const resolveTurnTimeouts = (
  runtime: SessionRuntimeSettings
):
  | {
      readonly turnSendTimeout?: Duration.Input;
      readonly turnResultTimeout?: Duration.Input;
    }
  | undefined =>
  runtime.turnSendTimeout !== undefined || runtime.turnResultTimeout !== undefined
    ? {
        ...(runtime.turnSendTimeout !== undefined ? { turnSendTimeout: runtime.turnSendTimeout } : {}),
        ...(runtime.turnResultTimeout !== undefined ? { turnResultTimeout: runtime.turnResultTimeout } : {}),
      }
    : undefined;

/**
 * @since 0.0.0
 */
export type SessionConfigSettings = {
  readonly defaults: SessionDefaults;
  readonly runtime: SessionRuntimeSettings;
};

const normalizeRedacted = (value: O.Option<Redacted.Redacted>) =>
  O.flatMap(value, (redacted) => {
    const normalized = Redacted.value(redacted).trim();
    return normalized.length > 0 ? O.some(redacted) : O.none();
  });

const parseList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const parseOptionalList = (value: O.Option<string>) =>
  O.flatMap(value, (raw) => {
    const entries = parseList(raw);
    return entries.length > 0 ? O.some(entries) : O.none();
  });

const makeSessionConfig = Effect.gen(function* () {
  const apiKey = normalizeRedacted(yield* Config.option(Config.redacted("ANTHROPIC_API_KEY")));
  const apiKeyFallback = normalizeRedacted(yield* Config.option(Config.redacted("API_KEY")));
  const sessionAccessToken = normalizeRedacted(
    yield* Config.option(Config.redacted("CLAUDE_CODE_SESSION_ACCESS_TOKEN"))
  );

  const executable = yield* Config.option(Config.schema(S.Literals(["bun", "node"]), "EXECUTABLE"));
  const pathToClaudeCodeExecutable = yield* Config.option(Config.string("PATH_TO_CLAUDE_CODE_EXECUTABLE"));
  const executableArgsValue = yield* Config.option(Config.string("EXECUTABLE_ARGS"));
  const permissionMode = yield* Config.option(Config.schema(SessionPermissionMode, "PERMISSION_MODE"));
  const allowedToolsValue = yield* Config.option(Config.string("ALLOWED_TOOLS"));
  const disallowedToolsValue = yield* Config.option(Config.string("DISALLOWED_TOOLS"));

  const closeDrainTimeout = yield* Config.option(Config.duration("CLOSE_DRAIN_TIMEOUT"));
  const turnSendTimeout = yield* Config.option(Config.duration("TURN_SEND_TIMEOUT"));
  const turnResultTimeout = yield* Config.option(Config.duration("TURN_RESULT_TIMEOUT"));

  const executableArgs = parseOptionalList(executableArgsValue);
  const allowedTools = parseOptionalList(allowedToolsValue);
  const disallowedTools = parseOptionalList(disallowedToolsValue);

  const processEnv = yield* Effect.sync(() => process.env);
  const resolvedApiKey = O.isSome(apiKey) ? apiKey : apiKeyFallback;
  const authEnvOverrides = {
    ...(O.isSome(resolvedApiKey) ? { ANTHROPIC_API_KEY: Redacted.value(resolvedApiKey.value) } : {}),
    ...(O.isSome(sessionAccessToken)
      ? {
          CLAUDE_CODE_SESSION_ACCESS_TOKEN: Redacted.value(sessionAccessToken.value),
        }
      : {}),
  };
  const env = Object.keys(authEnvOverrides).length > 0 ? { ...processEnv, ...authEnvOverrides } : undefined;

  if (!O.isSome(resolvedApiKey) && !O.isSome(sessionAccessToken)) {
    return yield* missingCredentialsError();
  }

  const defaults: SessionDefaults = {
    executable: O.getOrUndefined(executable),
    pathToClaudeCodeExecutable: O.getOrUndefined(pathToClaudeCodeExecutable),
    permissionMode: O.getOrUndefined(permissionMode),
    ...(O.isSome(executableArgs) ? { executableArgs: executableArgs.value } : {}),
    ...(O.isSome(allowedTools) ? { allowedTools: allowedTools.value } : {}),
    ...(O.isSome(disallowedTools) ? { disallowedTools: disallowedTools.value } : {}),
    ...(env !== undefined ? { env } : {}),
  };

  const runtime: SessionRuntimeSettings = {
    closeDrainTimeout: O.isSome(closeDrainTimeout)
      ? closeDrainTimeout.value
      : defaultSessionLifecyclePolicy.closeDrainTimeout,
    ...(O.isSome(turnSendTimeout) ? { turnSendTimeout: turnSendTimeout.value } : {}),
    ...(O.isSome(turnResultTimeout) ? { turnResultTimeout: turnResultTimeout.value } : {}),
  };

  return { defaults, runtime } satisfies SessionConfigSettings;
});

/**
 * @since 0.0.0
 */
export class SessionConfig extends ServiceMap.Service<SessionConfig, SessionConfigSettings>()(
  "@effect/claude-agent-sdk/SessionConfig"
) {
  static readonly layer = Layer.effect(SessionConfig, makeSessionConfig);

  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    SessionConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));
}
