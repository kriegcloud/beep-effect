import * as Config from "effect/Config";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as ServiceMap from "effect/ServiceMap";
import { layerConfigFromEnv } from "./internal/config.js";
import { missingCredentialsError } from "./internal/credentials.js";
import { defaultSessionLifecyclePolicy } from "./internal/lifecyclePolicy.js";
import type { SDKSessionOptions } from "./Schema/Session.js";
import { SessionPermissionMode } from "./Schema/Session.js";

export type SessionDefaults = Omit<SDKSessionOptions, "model">;

export type SessionRuntimeSettings = {
  readonly closeDrainTimeout: Duration.Input;
  readonly turnSendTimeout?: Duration.Input;
  readonly turnResultTimeout?: Duration.Input;
};

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

export type SessionConfigSettings = {
  readonly defaults: SessionDefaults;
  readonly runtime: SessionRuntimeSettings;
};

const normalizeRedacted = (value: Option.Option<Redacted.Redacted>) =>
  Option.flatMap(value, (redacted) => {
    const normalized = Redacted.value(redacted).trim();
    return normalized.length > 0 ? Option.some(redacted) : Option.none();
  });

const parseList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const parseOptionalList = (value: Option.Option<string>) =>
  Option.flatMap(value, (raw) => {
    const entries = parseList(raw);
    return entries.length > 0 ? Option.some(entries) : Option.none();
  });

const makeSessionConfig = Effect.gen(function* () {
  const apiKey = normalizeRedacted(yield* Config.option(Config.redacted("ANTHROPIC_API_KEY")));
  const apiKeyFallback = normalizeRedacted(yield* Config.option(Config.redacted("API_KEY")));
  const sessionAccessToken = normalizeRedacted(
    yield* Config.option(Config.redacted("CLAUDE_CODE_SESSION_ACCESS_TOKEN"))
  );

  const executable = yield* Config.option(Config.schema(Schema.Literals(["bun", "node"]), "EXECUTABLE"));
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
  const resolvedApiKey = Option.isSome(apiKey) ? apiKey : apiKeyFallback;
  const authEnvOverrides = {
    ...(Option.isSome(resolvedApiKey) ? { ANTHROPIC_API_KEY: Redacted.value(resolvedApiKey.value) } : {}),
    ...(Option.isSome(sessionAccessToken)
      ? {
          CLAUDE_CODE_SESSION_ACCESS_TOKEN: Redacted.value(sessionAccessToken.value),
        }
      : {}),
  };
  const env = Object.keys(authEnvOverrides).length > 0 ? { ...processEnv, ...authEnvOverrides } : undefined;

  if (!Option.isSome(resolvedApiKey) && !Option.isSome(sessionAccessToken)) {
    return yield* missingCredentialsError();
  }

  const defaults: SessionDefaults = {
    executable: Option.getOrUndefined(executable),
    pathToClaudeCodeExecutable: Option.getOrUndefined(pathToClaudeCodeExecutable),
    permissionMode: Option.getOrUndefined(permissionMode),
    ...(Option.isSome(executableArgs) ? { executableArgs: executableArgs.value } : {}),
    ...(Option.isSome(allowedTools) ? { allowedTools: allowedTools.value } : {}),
    ...(Option.isSome(disallowedTools) ? { disallowedTools: disallowedTools.value } : {}),
    ...(env !== undefined ? { env } : {}),
  };

  const runtime: SessionRuntimeSettings = {
    closeDrainTimeout: Option.isSome(closeDrainTimeout)
      ? closeDrainTimeout.value
      : defaultSessionLifecyclePolicy.closeDrainTimeout,
    ...(Option.isSome(turnSendTimeout) ? { turnSendTimeout: turnSendTimeout.value } : {}),
    ...(Option.isSome(turnResultTimeout) ? { turnResultTimeout: turnResultTimeout.value } : {}),
  };

  return { defaults, runtime } satisfies SessionConfigSettings;
});

export class SessionConfig extends ServiceMap.Service<SessionConfig, SessionConfigSettings>()(
  "@effect/claude-agent-sdk/SessionConfig"
) {
  static readonly layer = Layer.effect(SessionConfig, makeSessionConfig);

  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    SessionConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));
}
