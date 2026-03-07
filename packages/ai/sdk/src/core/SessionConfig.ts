import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import { Config, type Duration, Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import {
  buildAuthEnv,
  normalizeRedactedOption,
  parseOptionalCommaSeparatedList,
  preferFirstOption,
  readProcessEnv,
} from "./internal/ConfigTransforms.js";
import { layerConfigFromEnv } from "./internal/config.js";
import { missingCredentialsError } from "./internal/credentials.js";
import { defaultSessionLifecyclePolicy } from "./internal/lifecyclePolicy.js";
import type { SDKSessionOptions } from "./Schema/Session.js";
import { SessionPermissionMode } from "./Schema/Session.js";

const $I = $AiSdkId.create("core/SessionConfig");

/**
 * @since 0.0.0
 */
export type SessionDefaults = Omit<SDKSessionOptions, "model">;

/**
 * @since 0.0.0
 */
export type SessionRuntimeSettings = Readonly<{
  readonly closeDrainTimeout: Duration.Input;
  readonly turnSendTimeout?: Duration.Input;
  readonly turnResultTimeout?: Duration.Input;
}>;

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
export type SessionConfigSettings = Readonly<{
  readonly defaults: SessionDefaults;
  readonly runtime: SessionRuntimeSettings;
}>;

/**
 * @since 0.0.0
 */
export interface SessionConfigShape extends SessionConfigSettings {}

const makeSessionConfig = Effect.gen(function* () {
  const apiKey = normalizeRedactedOption(yield* Config.option(Config.redacted("ANTHROPIC_API_KEY")));
  const apiKeyFallback = normalizeRedactedOption(yield* Config.option(Config.redacted("API_KEY")));
  const sessionAccessToken = normalizeRedactedOption(
    yield* Config.option(Config.redacted("CLAUDE_CODE_SESSION_ACCESS_TOKEN"))
  );

  const executable = yield* Config.option(Config.schema(LiteralKit(["bun", "node"]), "EXECUTABLE"));
  const pathToClaudeCodeExecutable = yield* Config.option(Config.schema(FilePath, "PATH_TO_CLAUDE_CODE_EXECUTABLE"));
  const executableArgsValue = yield* Config.option(Config.string("EXECUTABLE_ARGS"));
  const permissionMode = yield* Config.option(Config.schema(SessionPermissionMode, "PERMISSION_MODE"));
  const allowedToolsValue = yield* Config.option(Config.string("ALLOWED_TOOLS"));
  const disallowedToolsValue = yield* Config.option(Config.string("DISALLOWED_TOOLS"));

  const closeDrainTimeout = yield* Config.option(Config.duration("CLOSE_DRAIN_TIMEOUT"));
  const turnSendTimeout = yield* Config.option(Config.duration("TURN_SEND_TIMEOUT"));
  const turnResultTimeout = yield* Config.option(Config.duration("TURN_RESULT_TIMEOUT"));

  const executableArgs = parseOptionalCommaSeparatedList(executableArgsValue);
  const allowedTools = parseOptionalCommaSeparatedList(allowedToolsValue);
  const disallowedTools = parseOptionalCommaSeparatedList(disallowedToolsValue);

  const processEnv = yield* readProcessEnv;
  const resolvedApiKey = preferFirstOption(apiKey, apiKeyFallback);
  const env = buildAuthEnv(processEnv, resolvedApiKey, sessionAccessToken);

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
export class SessionConfig extends ServiceMap.Service<SessionConfig, SessionConfigShape>()($I`SessionConfig`) {
  static readonly layer = Layer.effect(SessionConfig, makeSessionConfig);

  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    SessionConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));
}
