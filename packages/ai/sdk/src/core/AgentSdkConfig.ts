import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Struct, Text } from "@beep/utils";
import { Config, ConfigProvider, Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { ConfigError } from "./Errors.js";
import {
  buildAuthEnv,
  normalizeRedactedOption,
  parseOptionalCommaSeparatedList,
  preferFirstOption,
} from "./internal/ConfigTransforms.js";
import { defaultSettingSources, layerConfigFromEnv } from "./internal/config.js";
import { missingCredentialsError } from "./internal/credentials.js";
import { PermissionMode } from "./Schema/index.js";
import { type Options, SettingSource } from "./Schema/Options.js";
import { SandboxIgnoreViolations } from "./Schema/Sandbox.js";

const $I = $AiSdkId.create("core/AgentSdkConfig");

const SettingSourcesSchema = S.Array(SettingSource);
const SandboxProviderSchema = LiteralKit(["local", "cloudflare"]);
const StorageBackendSchema = LiteralKit(["bun", "filesystem", "r2", "kv"]);
const StorageModeSchema = LiteralKit(["standard", "journaled"]);

const parseSettingSources = (value: string) =>
  S.decodeUnknownEffect(SettingSourcesSchema)(Text.splitCommaSeparatedTrimmed(value)).pipe(
    Effect.mapError((cause) =>
      ConfigError.make({
        message: "Invalid settingSources",
        cause,
      })
    )
  );

const SandboxIgnoreViolationsSchema = S.fromJsonString(SandboxIgnoreViolations);

const parseSandboxIgnoreViolations = (value: string) =>
  S.decodeUnknownEffect(SandboxIgnoreViolationsSchema)(value).pipe(
    Effect.mapError((cause) =>
      ConfigError.make({
        message: "Invalid sandbox ignore violations",
        cause,
      })
    )
  );

const readProcessEnv = Effect.sync(() => process.env);
const readProcessCwd = Effect.sync(() => process.cwd());

const makeAgentSdkConfig = Effect.gen(function* () {
  const apiKey = normalizeRedactedOption(yield* Config.option(Config.redacted("ANTHROPIC_API_KEY")));
  const apiKeyFallback = normalizeRedactedOption(yield* Config.option(Config.redacted("API_KEY")));
  const sessionAccessToken = normalizeRedactedOption(
    yield* Config.option(Config.redacted("CLAUDE_CODE_SESSION_ACCESS_TOKEN"))
  );
  const model = yield* Config.option(Config.string("MODEL"));
  const cwd = yield* Config.option(Config.string("CWD"));
  const executable = yield* Config.option(Config.schema(LiteralKit(["bun", "deno", "node"]), "EXECUTABLE"));
  const allowDangerouslySkipPermissions = yield* Config.option(Config.boolean("ALLOW_DANGEROUSLY_SKIP_PERMISSIONS"));
  const permissionMode = yield* Config.option(Config.schema(PermissionMode, "PERMISSION_MODE"));
  const settingSourcesValue = yield* Config.option(Config.string("SETTING_SOURCES"));
  const sandboxEnabled = yield* Config.option(Config.boolean("SANDBOX_ENABLED"));
  const sandboxAutoAllowBashIfSandboxed = yield* Config.option(Config.boolean("SANDBOX_AUTO_ALLOW_BASH_IF_SANDBOXED"));
  const sandboxAllowUnsandboxedCommands = yield* Config.option(Config.boolean("SANDBOX_ALLOW_UNSANDBOXED_COMMANDS"));
  const sandboxEnableWeakerNestedSandbox = yield* Config.option(Config.boolean("SANDBOX_ENABLE_WEAKER_NESTED_SANDBOX"));
  const sandboxExcludedCommandsValue = yield* Config.option(Config.string("SANDBOX_EXCLUDED_COMMANDS"));
  const sandboxIgnoreViolationsValue = yield* Config.option(Config.string("SANDBOX_IGNORE_VIOLATIONS"));
  const sandboxNetworkAllowedDomainsValue = yield* Config.option(Config.string("SANDBOX_NETWORK_ALLOWED_DOMAINS"));
  const sandboxNetworkAllowUnixSocketsValue = yield* Config.option(Config.string("SANDBOX_NETWORK_ALLOW_UNIX_SOCKETS"));
  const sandboxNetworkAllowAllUnixSockets = yield* Config.option(
    Config.boolean("SANDBOX_NETWORK_ALLOW_ALL_UNIX_SOCKETS")
  );
  const sandboxNetworkAllowLocalBinding = yield* Config.option(Config.boolean("SANDBOX_NETWORK_ALLOW_LOCAL_BINDING"));
  const sandboxNetworkHttpProxyPort = yield* Config.option(Config.int("SANDBOX_NETWORK_HTTP_PROXY_PORT"));
  const sandboxNetworkSocksProxyPort = yield* Config.option(Config.int("SANDBOX_NETWORK_SOCKS_PROXY_PORT"));
  const sandboxRipgrepCommand = yield* Config.option(Config.string("SANDBOX_RIPGREP_COMMAND"));
  const sandboxRipgrepArgsValue = yield* Config.option(Config.string("SANDBOX_RIPGREP_ARGS"));
  const sandboxProviderValue = yield* Config.option(Config.schema(SandboxProviderSchema, "SANDBOX_PROVIDER"));
  const sandboxId = yield* Config.option(Config.string("SANDBOX_ID"));
  const sandboxSleepAfter = yield* Config.option(Config.string("SANDBOX_SLEEP_AFTER"));
  const storageBackendValue = yield* Config.option(Config.schema(StorageBackendSchema, "STORAGE_BACKEND"));
  const storageModeValue = yield* Config.option(Config.schema(StorageModeSchema, "STORAGE_MODE"));
  const r2BucketBindingValue = yield* Config.option(Config.string("R2_BUCKET_BINDING"));
  const kvNamespaceBindingValue = yield* Config.option(Config.string("KV_NAMESPACE_BINDING"));
  const settingSources = O.isSome(settingSourcesValue)
    ? yield* parseSettingSources(settingSourcesValue.value)
    : defaultSettingSources;
  const processEnv = yield* readProcessEnv;
  const resolvedApiKey = preferFirstOption(apiKey, apiKeyFallback);
  const env = buildAuthEnv(processEnv, resolvedApiKey, sessionAccessToken);
  const cwdDefault = yield* readProcessCwd;

  if (!O.isSome(resolvedApiKey) && !O.isSome(sessionAccessToken)) {
    return yield* missingCredentialsError();
  }

  const resolvedPermissionMode = O.getOrUndefined(permissionMode);
  const allowDangerously = O.getOrElse(allowDangerouslySkipPermissions, () => false);
  if (resolvedPermissionMode === "bypassPermissions" && !allowDangerously) {
    yield* Effect.logError("PERMISSION_MODE=bypassPermissions requires ALLOW_DANGEROUSLY_SKIP_PERMISSIONS=true.");
  }

  const sandboxExcludedCommands = parseOptionalCommaSeparatedList(sandboxExcludedCommandsValue);
  const sandboxNetworkAllowedDomains = parseOptionalCommaSeparatedList(sandboxNetworkAllowedDomainsValue);
  const sandboxNetworkAllowUnixSockets = parseOptionalCommaSeparatedList(sandboxNetworkAllowUnixSocketsValue);
  const sandboxRipgrepArgs = parseOptionalCommaSeparatedList(sandboxRipgrepArgsValue);
  const sandboxIgnoreViolations = O.isSome(sandboxIgnoreViolationsValue)
    ? O.some(yield* parseSandboxIgnoreViolations(sandboxIgnoreViolationsValue.value))
    : O.none();

  if (O.isNone(sandboxRipgrepCommand) && O.isSome(sandboxRipgrepArgs)) {
    yield* Effect.logError("SANDBOX_RIPGREP_ARGS requires SANDBOX_RIPGREP_COMMAND.");
  }

  const sandboxNetwork =
    O.isSome(sandboxNetworkAllowedDomains) ||
    O.isSome(sandboxNetworkAllowUnixSockets) ||
    O.isSome(sandboxNetworkAllowAllUnixSockets) ||
    O.isSome(sandboxNetworkAllowLocalBinding) ||
    O.isSome(sandboxNetworkHttpProxyPort) ||
    O.isSome(sandboxNetworkSocksProxyPort)
      ? {
          ...(O.isSome(sandboxNetworkAllowedDomains) ? { allowedDomains: sandboxNetworkAllowedDomains.value } : {}),
          ...(O.isSome(sandboxNetworkAllowUnixSockets)
            ? { allowUnixSockets: sandboxNetworkAllowUnixSockets.value }
            : {}),
          ...(O.isSome(sandboxNetworkAllowAllUnixSockets)
            ? { allowAllUnixSockets: sandboxNetworkAllowAllUnixSockets.value }
            : {}),
          ...(O.isSome(sandboxNetworkAllowLocalBinding)
            ? { allowLocalBinding: sandboxNetworkAllowLocalBinding.value }
            : {}),
          ...(O.isSome(sandboxNetworkHttpProxyPort) ? { httpProxyPort: sandboxNetworkHttpProxyPort.value } : {}),
          ...(O.isSome(sandboxNetworkSocksProxyPort) ? { socksProxyPort: sandboxNetworkSocksProxyPort.value } : {}),
        }
      : undefined;

  const sandboxRipgrep = O.isSome(sandboxRipgrepCommand)
    ? {
        command: sandboxRipgrepCommand.value,
        ...(O.isSome(sandboxRipgrepArgs) ? { args: sandboxRipgrepArgs.value } : {}),
      }
    : undefined;

  const sandbox =
    O.isSome(sandboxEnabled) ||
    O.isSome(sandboxAutoAllowBashIfSandboxed) ||
    O.isSome(sandboxAllowUnsandboxedCommands) ||
    O.isSome(sandboxEnableWeakerNestedSandbox) ||
    O.isSome(sandboxExcludedCommands) ||
    O.isSome(sandboxIgnoreViolations) ||
    sandboxNetwork !== undefined ||
    sandboxRipgrep !== undefined
      ? {
          ...(O.isSome(sandboxEnabled) ? { enabled: sandboxEnabled.value } : {}),
          ...(O.isSome(sandboxAutoAllowBashIfSandboxed)
            ? { autoAllowBashIfSandboxed: sandboxAutoAllowBashIfSandboxed.value }
            : {}),
          ...(O.isSome(sandboxAllowUnsandboxedCommands)
            ? {
                allowUnsandboxedCommands: sandboxAllowUnsandboxedCommands.value,
              }
            : {}),
          ...(sandboxNetwork ? { network: sandboxNetwork } : {}),
          ...(O.isSome(sandboxIgnoreViolations) ? { ignoreViolations: sandboxIgnoreViolations.value } : {}),
          ...(O.isSome(sandboxEnableWeakerNestedSandbox)
            ? {
                enableWeakerNestedSandbox: sandboxEnableWeakerNestedSandbox.value,
              }
            : {}),
          ...(O.isSome(sandboxExcludedCommands) ? { excludedCommands: sandboxExcludedCommands.value } : {}),
          ...(sandboxRipgrep ? { ripgrep: sandboxRipgrep } : {}),
        }
      : undefined;

  const options: Options = {
    executable: O.getOrUndefined(executable) ?? "bun",
    cwd: O.getOrUndefined(cwd) ?? cwdDefault,
    model: O.getOrUndefined(model),
    allowDangerouslySkipPermissions: O.getOrUndefined(allowDangerouslySkipPermissions),
    permissionMode: O.getOrUndefined(permissionMode),
    settingSources,
    env,
    ...(sandbox ? { sandbox } : {}),
  };

  const sandboxProvider = O.isSome(sandboxProviderValue) ? sandboxProviderValue : O.some("local");
  const storageBackend = O.isSome(storageBackendValue) ? storageBackendValue : O.some("bun");
  const storageMode = O.isSome(storageModeValue) ? storageModeValue : O.some("standard");
  const r2BucketBinding = O.isSome(r2BucketBindingValue) ? r2BucketBindingValue : O.some("BUCKET");
  const kvNamespaceBinding = O.isSome(kvNamespaceBindingValue) ? kvNamespaceBindingValue : O.some("KV");

  return {
    options,
    sandboxProvider,
    sandboxId,
    sandboxSleepAfter,
    storageBackend,
    storageMode,
    r2BucketBinding,
    kvNamespaceBinding,
  };
});

/**
 * @since 0.0.0
 */
export interface AgentSdkConfigShape extends Effect.Success<typeof makeAgentSdkConfig> {}

/**
 * @since 0.0.0
 */
export class AgentSdkConfig extends ServiceMap.Service<AgentSdkConfig, AgentSdkConfigShape>()($I`AgentSdkConfig`) {
  /**
   * Build AgentSdkConfig with explicit overrides layered on top of environment config.
   */
  static readonly layerWithOverrides = (overrides: { readonly apiKey?: string; readonly model?: string }) => {
    const entries: Array<[string, string]> = [];
    if (overrides.apiKey) {
      entries.push(["ANTHROPIC_API_KEY", overrides.apiKey]);
    }
    if (overrides.model) {
      entries.push(["MODEL", overrides.model]);
    }
    if (entries.length === 0) {
      return AgentSdkConfig.layer;
    }
    const provider = ConfigProvider.orElse(
      ConfigProvider.fromUnknown(Struct.fromEntries(entries)),
      ConfigProvider.fromEnv()
    );
    return AgentSdkConfig.layer.pipe(Layer.provide(ConfigProvider.layerAdd(provider)));
  };
  /**
   * Build AgentSdkConfig by reading configuration from environment variables.
   * Use this when wiring AgentSdk in production.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    AgentSdkConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));

  /**
   * Default configuration layer. Falls back to process defaults when unset.
   */
  static readonly layer = Layer.effect(AgentSdkConfig, makeAgentSdkConfig);
}
