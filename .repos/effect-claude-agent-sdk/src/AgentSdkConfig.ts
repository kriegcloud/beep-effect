import * as Config from "effect/Config"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"
import { ConfigError } from "./Errors.js"
import { missingCredentialsError } from "./internal/credentials.js"
import { defaultSettingSources, layerConfigFromEnv } from "./internal/config.js"
import { Options, SettingSource } from "./Schema/Options.js"
import { PermissionMode } from "./Schema/Permission.js"
import { SandboxIgnoreViolations } from "./Schema/Sandbox.js"

const SettingSourcesSchema = Schema.Array(SettingSource)
const SandboxProviderSchema = Schema.Literal("local", "cloudflare")
const StorageBackendSchema = Schema.Literal("bun", "filesystem", "r2", "kv")
const StorageModeSchema = Schema.Literal("standard", "journaled")

const parseSettingSources = (value: string) =>
  Schema.decodeUnknown(SettingSourcesSchema)(
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  ).pipe(
    Effect.mapError((cause) =>
      ConfigError.make({
        message: "Invalid settingSources",
        cause
      })
    )
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

const SandboxIgnoreViolationsSchema = Schema.parseJson(SandboxIgnoreViolations)

const parseSandboxIgnoreViolations = (value: string) =>
  Schema.decodeUnknown(SandboxIgnoreViolationsSchema)(value).pipe(
    Effect.mapError((cause) =>
      ConfigError.make({
        message: "Invalid sandbox ignore violations",
        cause
      })
    )
  )

const normalizeRedacted = (value: Option.Option<Redacted.Redacted>) =>
  Option.flatMap(value, (redacted) =>
    Redacted.value(redacted).trim().length > 0 ? Option.some(redacted) : Option.none()
  )

const makeAgentSdkConfig = Effect.gen(function*() {
  const apiKey = normalizeRedacted(
    yield* Config.option(Config.redacted("ANTHROPIC_API_KEY"))
  )
  const apiKeyFallback = normalizeRedacted(
    yield* Config.option(Config.redacted("API_KEY"))
  )
  const sessionAccessToken = normalizeRedacted(
    yield* Config.option(Config.redacted("CLAUDE_CODE_SESSION_ACCESS_TOKEN"))
  )
  const model = yield* Config.option(Config.string("MODEL"))
  const cwd = yield* Config.option(Config.string("CWD"))
  const executable = yield* Config.option(
    Schema.Config("EXECUTABLE", Schema.Literal("bun", "deno", "node"))
  )
  const allowDangerouslySkipPermissions = yield* Config.option(
    Config.boolean("ALLOW_DANGEROUSLY_SKIP_PERMISSIONS")
  )
  const permissionMode = yield* Config.option(
    Schema.Config("PERMISSION_MODE", PermissionMode)
  )
  const settingSourcesValue = yield* Config.option(Config.string("SETTING_SOURCES"))
  const sandboxEnabled = yield* Config.option(Config.boolean("SANDBOX_ENABLED"))
  const sandboxAutoAllowBashIfSandboxed = yield* Config.option(
    Config.boolean("SANDBOX_AUTO_ALLOW_BASH_IF_SANDBOXED")
  )
  const sandboxAllowUnsandboxedCommands = yield* Config.option(
    Config.boolean("SANDBOX_ALLOW_UNSANDBOXED_COMMANDS")
  )
  const sandboxEnableWeakerNestedSandbox = yield* Config.option(
    Config.boolean("SANDBOX_ENABLE_WEAKER_NESTED_SANDBOX")
  )
  const sandboxExcludedCommandsValue = yield* Config.option(
    Config.string("SANDBOX_EXCLUDED_COMMANDS")
  )
  const sandboxIgnoreViolationsValue = yield* Config.option(
    Config.string("SANDBOX_IGNORE_VIOLATIONS")
  )
  const sandboxNetworkAllowedDomainsValue = yield* Config.option(
    Config.string("SANDBOX_NETWORK_ALLOWED_DOMAINS")
  )
  const sandboxNetworkAllowUnixSocketsValue = yield* Config.option(
    Config.string("SANDBOX_NETWORK_ALLOW_UNIX_SOCKETS")
  )
  const sandboxNetworkAllowAllUnixSockets = yield* Config.option(
    Config.boolean("SANDBOX_NETWORK_ALLOW_ALL_UNIX_SOCKETS")
  )
  const sandboxNetworkAllowLocalBinding = yield* Config.option(
    Config.boolean("SANDBOX_NETWORK_ALLOW_LOCAL_BINDING")
  )
  const sandboxNetworkHttpProxyPort = yield* Config.option(
    Config.integer("SANDBOX_NETWORK_HTTP_PROXY_PORT")
  )
  const sandboxNetworkSocksProxyPort = yield* Config.option(
    Config.integer("SANDBOX_NETWORK_SOCKS_PROXY_PORT")
  )
  const sandboxRipgrepCommand = yield* Config.option(
    Config.string("SANDBOX_RIPGREP_COMMAND")
  )
  const sandboxRipgrepArgsValue = yield* Config.option(
    Config.string("SANDBOX_RIPGREP_ARGS")
  )
  const sandboxProviderValue = yield* Config.option(
    Schema.Config("SANDBOX_PROVIDER", SandboxProviderSchema)
  )
  const sandboxId = yield* Config.option(Config.string("SANDBOX_ID"))
  const sandboxSleepAfter = yield* Config.option(Config.string("SANDBOX_SLEEP_AFTER"))
  const storageBackendValue = yield* Config.option(
    Schema.Config("STORAGE_BACKEND", StorageBackendSchema)
  )
  const storageModeValue = yield* Config.option(
    Schema.Config("STORAGE_MODE", StorageModeSchema)
  )
  const r2BucketBindingValue = yield* Config.option(Config.string("R2_BUCKET_BINDING"))
  const kvNamespaceBindingValue = yield* Config.option(Config.string("KV_NAMESPACE_BINDING"))
  const settingSources = Option.isSome(settingSourcesValue)
    ? yield* parseSettingSources(settingSourcesValue.value)
    : defaultSettingSources
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
  const cwdDefault = yield* Effect.sync(() => process.cwd())

  if (!Option.isSome(resolvedApiKey) && !Option.isSome(sessionAccessToken)) {
    return yield* missingCredentialsError()
  }

  const resolvedPermissionMode = Option.getOrUndefined(permissionMode)
  const allowDangerously = Option.getOrElse(allowDangerouslySkipPermissions, () => false)
  if (resolvedPermissionMode === "bypassPermissions" && !allowDangerously) {
    yield* Effect.logError(
      "PERMISSION_MODE=bypassPermissions requires ALLOW_DANGEROUSLY_SKIP_PERMISSIONS=true."
    )
  }

  const sandboxExcludedCommands = parseOptionalList(sandboxExcludedCommandsValue)
  const sandboxNetworkAllowedDomains = parseOptionalList(sandboxNetworkAllowedDomainsValue)
  const sandboxNetworkAllowUnixSockets = parseOptionalList(
    sandboxNetworkAllowUnixSocketsValue
  )
  const sandboxRipgrepArgs = parseOptionalList(sandboxRipgrepArgsValue)
  const sandboxIgnoreViolations = Option.isSome(sandboxIgnoreViolationsValue)
    ? Option.some(
        yield* parseSandboxIgnoreViolations(sandboxIgnoreViolationsValue.value)
      )
    : Option.none()

  if (Option.isNone(sandboxRipgrepCommand) && Option.isSome(sandboxRipgrepArgs)) {
    yield* Effect.logError(
      "SANDBOX_RIPGREP_ARGS requires SANDBOX_RIPGREP_COMMAND."
    )
  }

  const sandboxNetwork =
    Option.isSome(sandboxNetworkAllowedDomains) ||
    Option.isSome(sandboxNetworkAllowUnixSockets) ||
    Option.isSome(sandboxNetworkAllowAllUnixSockets) ||
    Option.isSome(sandboxNetworkAllowLocalBinding) ||
    Option.isSome(sandboxNetworkHttpProxyPort) ||
    Option.isSome(sandboxNetworkSocksProxyPort)
      ? {
          ...(Option.isSome(sandboxNetworkAllowedDomains)
            ? { allowedDomains: sandboxNetworkAllowedDomains.value }
            : {}),
          ...(Option.isSome(sandboxNetworkAllowUnixSockets)
            ? { allowUnixSockets: sandboxNetworkAllowUnixSockets.value }
            : {}),
          ...(Option.isSome(sandboxNetworkAllowAllUnixSockets)
            ? { allowAllUnixSockets: sandboxNetworkAllowAllUnixSockets.value }
            : {}),
          ...(Option.isSome(sandboxNetworkAllowLocalBinding)
            ? { allowLocalBinding: sandboxNetworkAllowLocalBinding.value }
            : {}),
          ...(Option.isSome(sandboxNetworkHttpProxyPort)
            ? { httpProxyPort: sandboxNetworkHttpProxyPort.value }
            : {}),
          ...(Option.isSome(sandboxNetworkSocksProxyPort)
            ? { socksProxyPort: sandboxNetworkSocksProxyPort.value }
            : {})
        }
      : undefined

  const sandboxRipgrep = Option.isSome(sandboxRipgrepCommand)
    ? {
        command: sandboxRipgrepCommand.value,
        ...(Option.isSome(sandboxRipgrepArgs)
          ? { args: sandboxRipgrepArgs.value }
          : {})
      }
    : undefined

  const sandbox =
    Option.isSome(sandboxEnabled) ||
    Option.isSome(sandboxAutoAllowBashIfSandboxed) ||
    Option.isSome(sandboxAllowUnsandboxedCommands) ||
    Option.isSome(sandboxEnableWeakerNestedSandbox) ||
    Option.isSome(sandboxExcludedCommands) ||
    Option.isSome(sandboxIgnoreViolations) ||
    sandboxNetwork !== undefined ||
    sandboxRipgrep !== undefined
      ? {
          ...(Option.isSome(sandboxEnabled)
            ? { enabled: sandboxEnabled.value }
            : {}),
          ...(Option.isSome(sandboxAutoAllowBashIfSandboxed)
            ? { autoAllowBashIfSandboxed: sandboxAutoAllowBashIfSandboxed.value }
            : {}),
          ...(Option.isSome(sandboxAllowUnsandboxedCommands)
            ? {
                allowUnsandboxedCommands: sandboxAllowUnsandboxedCommands.value
              }
            : {}),
          ...(sandboxNetwork ? { network: sandboxNetwork } : {}),
          ...(Option.isSome(sandboxIgnoreViolations)
            ? { ignoreViolations: sandboxIgnoreViolations.value }
            : {}),
          ...(Option.isSome(sandboxEnableWeakerNestedSandbox)
            ? {
                enableWeakerNestedSandbox: sandboxEnableWeakerNestedSandbox.value
              }
            : {}),
          ...(Option.isSome(sandboxExcludedCommands)
            ? { excludedCommands: sandboxExcludedCommands.value }
            : {}),
          ...(sandboxRipgrep ? { ripgrep: sandboxRipgrep } : {})
        }
      : undefined

  const options: Options = {
    executable: Option.getOrUndefined(executable) ?? "bun",
    cwd: Option.getOrUndefined(cwd) ?? cwdDefault,
    model: Option.getOrUndefined(model),
    allowDangerouslySkipPermissions: Option.getOrUndefined(allowDangerouslySkipPermissions),
    permissionMode: Option.getOrUndefined(permissionMode),
    settingSources,
    env,
    ...(sandbox ? { sandbox } : {})
  }

  const sandboxProvider = Option.isSome(sandboxProviderValue)
    ? sandboxProviderValue
    : Option.some("local")
  const storageBackend = Option.isSome(storageBackendValue)
    ? storageBackendValue
    : Option.some("bun")
  const storageMode = Option.isSome(storageModeValue)
    ? storageModeValue
    : Option.some("standard")
  const r2BucketBinding = Option.isSome(r2BucketBindingValue)
    ? r2BucketBindingValue
    : Option.some("BUCKET")
  const kvNamespaceBinding = Option.isSome(kvNamespaceBindingValue)
    ? kvNamespaceBindingValue
    : Option.some("KV")

  return {
    options,
    sandboxProvider,
    sandboxId,
    sandboxSleepAfter,
    storageBackend,
    storageMode,
    r2BucketBinding,
    kvNamespaceBinding
  }
})

export class AgentSdkConfig extends Effect.Service<AgentSdkConfig>()(
  "@effect/claude-agent-sdk/AgentSdkConfig",
  {
    effect: makeAgentSdkConfig
  }
) {
  /**
   * Build AgentSdkConfig with explicit overrides layered on top of environment config.
   */
  static readonly layerWithOverrides = (overrides: {
    readonly apiKey?: string
    readonly model?: string
  }) => {
    const entries: Array<[string, string]> = []
    if (overrides.apiKey) {
      entries.push(["ANTHROPIC_API_KEY", overrides.apiKey])
    }
    if (overrides.model) {
      entries.push(["MODEL", overrides.model])
    }
    if (entries.length === 0) {
      return AgentSdkConfig.layer
    }
    const provider = ConfigProvider.orElse(
      ConfigProvider.fromMap(new Map(entries)),
      () => ConfigProvider.fromEnv()
    )
    return AgentSdkConfig.layer.pipe(
      Layer.provide(Layer.setConfigProvider(provider))
    )
  }
  /**
   * Build AgentSdkConfig by reading configuration from environment variables.
   * Use this when wiring AgentSdk in production.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    AgentSdkConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)))

  /**
   * Default configuration layer. Falls back to process defaults when unset.
   */
  static readonly layer = AgentSdkConfig.Default
}
