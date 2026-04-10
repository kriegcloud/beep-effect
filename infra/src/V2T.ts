/**
 * Local workstation automation for the V2T desktop application.
 *
 * @module @beep/infra/V2T
 * @since 0.0.0
 */
import { fileURLToPath } from "node:url";
import { $InfraId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { local, types } from "@pulumi/command";
import * as pulumi from "@pulumi/pulumi";
import * as S from "effect/Schema";

const $I = $InfraId.create("V2T");

const defaultRepoRoot = fileURLToPath(new URL("../..", import.meta.url));
const defaultLocalBackendDir = `${defaultRepoRoot}/.pulumi-local/v2t-workstation`;
const defaultTargetUser = process.env.USER;
const defaultTargetHomeDir = process.env.HOME;
const defaultQwenModelId = "Qwen/Qwen2-Audio-7B-Instruct";
const defaultQwenBaseUrl = "http://127.0.0.1:8011";
const defaultGraphitiProxyUrl = "http://127.0.0.1:8123";
const defaultGraphitiModelName = "gpt-4o-mini";
const defaultQwenServiceName = "beep-v2t-qwen.service";
const defaultGraphitiProxyServiceName = "beep-graphiti-proxy.service";
const defaultInstallerScriptPath = fileURLToPath(new URL("../scripts/v2t-workstation.sh", import.meta.url));
const defaultQwenServerScriptPath = fileURLToPath(new URL("../scripts/qwen_audio_server.py", import.meta.url));
const V2TManagedStateRelativeDir = ".local/share/beep/v2t-workstation";

const resolveInstallerScriptPath = () => process.env.BEEP_INFRA_V2T_INSTALLER_SCRIPT_PATH ?? defaultInstallerScriptPath;

const resolveQwenServerScriptPath = () =>
  process.env.BEEP_INFRA_V2T_QWEN_SERVER_SCRIPT_PATH ?? defaultQwenServerScriptPath;

const makeManagedStateDir = (targetHomeDir: string, name: "graphiti" | "qwen") =>
  `${targetHomeDir}/${V2TManagedStateRelativeDir}/${name}`;

type TriggerAsset = pulumi.asset.Asset | pulumi.asset.Archive;

const makeTriggerPath = (rootPath: string, relativePath: string): string =>
  relativePath.length === 0 ? rootPath : `${rootPath}/${relativePath}`;

const makeSourceArchiveTrigger = (
  rootPath: string,
  directories: ReadonlyArray<string>,
  files: ReadonlyArray<string>
): pulumi.asset.AssetArchive =>
  new pulumi.asset.AssetArchive({
    ...Object.fromEntries(
      directories.map(
        (relativePath) =>
          [relativePath, new pulumi.asset.FileArchive(makeTriggerPath(rootPath, relativePath))] satisfies readonly [
            string,
            TriggerAsset,
          ]
      )
    ),
    ...Object.fromEntries(
      files.map(
        (relativePath) =>
          [relativePath, new pulumi.asset.FileAsset(makeTriggerPath(rootPath, relativePath))] satisfies readonly [
            string,
            TriggerAsset,
          ]
      )
    ),
  });

type V2TNormalizationOptions = {
  readonly graphitiSecretPresent?: boolean;
};

/**
 * Error raised when the V2T workstation config cannot be decoded.
 *
 * @since 0.0.0
 * @category Errors
 */
export class V2TWorkstationConfigError extends TaggedErrorClass<V2TWorkstationConfigError>(
  $I`V2TWorkstationConfigError`
)(
  "V2TWorkstationConfigError",
  {
    message: S.String,
    cause: S.DefectWithStack,
  },
  $I.annote("V2TWorkstationConfigError", {
    description: "Raised when the V2T workstation config cannot be decoded from plain input.",
  })
) {}

/**
 * Error raised when Graphiti is enabled without the required API key.
 *
 * @since 0.0.0
 * @category Errors
 */
export class V2TGraphitiSecretError extends TaggedErrorClass<V2TGraphitiSecretError>($I`V2TGraphitiSecretError`)(
  "V2TGraphitiSecretError",
  {
    message: S.String,
  },
  $I.annote("V2TGraphitiSecretError", {
    description: "Raised when Graphiti provisioning is enabled without the required LLM API key.",
  })
) {}

class V2TWorkstationConfigDefect extends TaggedErrorClass<V2TWorkstationConfigDefect>($I`V2TWorkstationConfigDefect`)(
  "V2TWorkstationConfigDefect",
  {
    message: S.String,
  },
  $I.annote("V2TWorkstationConfigDefect", {
    description: "Internal defect used as the cause when default workstation config resolution fails.",
  })
) {}

const makeV2TWorkstationConfigDefect = (message: string): V2TWorkstationConfigDefect =>
  new V2TWorkstationConfigDefect({
    message,
  });

/**
 * Resolved configuration for the V2T workstation installer.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class V2TWorkstationConfig extends S.Class<V2TWorkstationConfig>($I`V2TWorkstationConfig`)(
  {
    repoRoot: S.String,
    targetUser: S.String,
    targetHomeDir: S.String,
    localBackendDir: S.String,
    qwenModelId: S.String,
    qwenBaseUrl: S.String,
    graphitiEnabled: S.Boolean,
    graphitiModelName: S.String,
  },
  $I.annote("V2TWorkstationConfig", {
    description: "Decoded, non-secret workstation installer config for the V2T Pulumi component.",
  })
) {}

const decodeV2TWorkstationConfig = S.decodeUnknownSync(V2TWorkstationConfig);

/**
 * Pulumi-facing args for the V2T workstation component.
 *
 * This is a Pulumi boundary type, so `Input` wrappers stay outside the schema-first
 * domain model used for resolved config.
 *
 * @since 0.0.0
 */
type V2TWorkstationArgsShape = {
  readonly config?: Partial<V2TWorkstationConfig>;
  readonly graphitiOpenAiApiKey?: pulumi.Input<string>;
  readonly huggingFaceHubToken?: pulumi.Input<string>;
};

/**
 * Pulumi-facing args for the V2T workstation component.
 *
 * @since 0.0.0
 */
export type V2TWorkstationArgs = V2TWorkstationArgsShape;

type MutableV2TWorkstationConfigInput = {
  repoRoot?: string;
  targetUser?: string;
  targetHomeDir?: string;
  localBackendDir?: string;
  qwenModelId?: string;
  qwenBaseUrl?: string;
  graphitiEnabled?: boolean;
  graphitiModelName?: string;
};

const resolveTargetUser = (inputTargetUser?: string) => {
  if (inputTargetUser !== undefined) {
    return inputTargetUser;
  }

  if (defaultTargetUser !== undefined) {
    return defaultTargetUser;
  }

  throw new V2TWorkstationConfigError({
    message: "Failed to resolve the default target user. Set config.targetUser explicitly.",
    cause: makeV2TWorkstationConfigDefect("Missing USER environment variable."),
  });
};

const resolveTargetHomeDir = (targetUser: string, inputTargetHomeDir?: string) => {
  if (inputTargetHomeDir !== undefined) {
    return inputTargetHomeDir;
  }

  if (defaultTargetUser === undefined || defaultTargetHomeDir === undefined) {
    throw new V2TWorkstationConfigError({
      message: "Failed to resolve the default target home directory. Set config.targetHomeDir explicitly.",
      cause: makeV2TWorkstationConfigDefect("Missing USER or HOME environment variable."),
    });
  }

  if (targetUser !== defaultTargetUser) {
    throw new V2TWorkstationConfigError({
      message: `config.targetHomeDir is required when targetUser differs from the current user (${defaultTargetUser}).`,
      cause: makeV2TWorkstationConfigDefect("Missing targetHomeDir for non-default targetUser."),
    });
  }

  return defaultTargetHomeDir;
};

/**
 * Normalize a partial config object into the installer defaults.
 *
 * @param input Partial workstation config values.
 * @returns The decoded config with repo defaults applied.
 *
 * @example
 * ```ts
 * import { normalizeV2TWorkstationConfig } from "@beep/infra/V2T"
 *
 * const config = normalizeV2TWorkstationConfig({
 *   repoRoot: "/workspace/beep-effect",
 *   graphitiEnabled: false,
 * })
 *
 * console.log(config.qwenBaseUrl)
 * // "http://127.0.0.1:8011"
 * ```
 *
 * @since 0.0.0
 * @category Constructors
 */
export const normalizeV2TWorkstationConfig = (
  input?: undefined | Partial<V2TWorkstationConfig>,
  _options?: undefined | V2TNormalizationOptions
): V2TWorkstationConfig => {
  try {
    const targetUser = resolveTargetUser(input?.targetUser);
    const targetHomeDir = resolveTargetHomeDir(targetUser, input?.targetHomeDir);

    const resolvedConfig = decodeV2TWorkstationConfig({
      repoRoot: input?.repoRoot ?? defaultRepoRoot,
      targetUser,
      targetHomeDir,
      localBackendDir: input?.localBackendDir ?? defaultLocalBackendDir,
      qwenModelId: input?.qwenModelId ?? defaultQwenModelId,
      qwenBaseUrl: input?.qwenBaseUrl ?? defaultQwenBaseUrl,
      graphitiEnabled: input?.graphitiEnabled ?? false,
      graphitiModelName: input?.graphitiModelName ?? defaultGraphitiModelName,
    });

    parseUrl(resolvedConfig.qwenBaseUrl);
    return resolvedConfig;
  } catch (cause) {
    if (S.is(V2TWorkstationConfigError)(cause)) {
      throw cause;
    }

    throw new V2TWorkstationConfigError({
      message: "Failed to decode the V2T workstation config.",
      cause,
    });
  }
};

/**
 * Validate whether the resolved config is compatible with the provided secrets.
 *
 * @param config Resolved workstation config.
 * @param args Pulumi-facing args, including optional secrets.
 * @returns The same config when validation succeeds.
 *
 * @since 0.0.0
 * @category Guards
 */
export const validateV2TWorkstationConfig = (
  config: V2TWorkstationConfig,
  args?: undefined | Pick<V2TWorkstationArgs, "graphitiOpenAiApiKey">
): V2TWorkstationConfig => {
  if (config.graphitiEnabled && args?.graphitiOpenAiApiKey === undefined) {
    throw new V2TGraphitiSecretError({
      message: "Graphiti provisioning is enabled, but no graphitiOpenAiApiKey secret was provided.",
    });
  }

  return config;
};

const parseUrl = (value: string) => new URL(value);

const makeInstallerCommand = (action: string, installerScriptPath: string) => pulumi.interpolate`set -euo pipefail
bash "${installerScriptPath}" ${action}`;

/**
 * Load the default stack args for the local V2T workstation stack.
 *
 * The stack namespace is `v2t`.
 *
 * @returns Decoded stack args plus optional secret references.
 *
 * @example
 * ```ts
 * import { loadV2TWorkstationStackArgs } from "@beep/infra/V2T"
 *
 * const args = loadV2TWorkstationStackArgs()
 * console.log(args.config.targetUser)
 * ```
 *
 * @since 0.0.0
 * @category Constructors
 */
export const loadV2TWorkstationStackArgs = (): V2TWorkstationArgs & { readonly config: V2TWorkstationConfig } => {
  const config = new pulumi.Config("v2t");
  const partialConfig: MutableV2TWorkstationConfigInput = {};
  const repoRoot = config.get("repoRoot");
  const targetUser = config.get("targetUser");
  const targetHomeDir = config.get("targetHomeDir");
  const localBackendDir = config.get("localBackendDir");
  const qwenModelId = config.get("qwenModelId");
  const qwenBaseUrl = config.get("qwenBaseUrl");
  const graphitiEnabled = config.getObject<boolean>("graphitiEnabled");
  const graphitiModelName = config.get("graphitiModelName");
  const graphitiOpenAiApiKey = config.getSecret("graphitiOpenAiApiKey");
  const huggingFaceHubToken = config.getSecret("huggingFaceHubToken");

  if (repoRoot !== undefined) {
    partialConfig.repoRoot = repoRoot;
  }

  if (targetUser !== undefined) {
    partialConfig.targetUser = targetUser;
  }

  if (targetHomeDir !== undefined) {
    partialConfig.targetHomeDir = targetHomeDir;
  }

  if (localBackendDir !== undefined) {
    partialConfig.localBackendDir = localBackendDir;
  }

  if (qwenModelId !== undefined) {
    partialConfig.qwenModelId = qwenModelId;
  }

  if (qwenBaseUrl !== undefined) {
    partialConfig.qwenBaseUrl = qwenBaseUrl;
  }

  if (graphitiEnabled !== undefined) {
    partialConfig.graphitiEnabled = graphitiEnabled;
  }

  if (graphitiModelName !== undefined) {
    partialConfig.graphitiModelName = graphitiModelName;
  }

  const resolvedConfig = normalizeV2TWorkstationConfig(partialConfig, {
    graphitiSecretPresent: graphitiOpenAiApiKey !== undefined,
  });
  const graphitiSecretConfig = graphitiOpenAiApiKey === undefined ? undefined : { graphitiOpenAiApiKey };

  return {
    config: validateV2TWorkstationConfig(resolvedConfig, graphitiSecretConfig ?? {}),
    ...(graphitiOpenAiApiKey === undefined ? {} : { graphitiOpenAiApiKey }),
    ...(huggingFaceHubToken === undefined ? {} : { huggingFaceHubToken }),
  };
};

/**
 * Pulumi component that reconciles a local workstation for the V2T app.
 *
 * @since 0.0.0
 * @category Resources
 */
export class V2TWorkstation extends pulumi.ComponentResource {
  readonly installedPackageName: pulumi.Output<string>;
  readonly graphitiProxyUrl: pulumi.Output<undefined | string>;
  readonly qwenBaseUrl: pulumi.Output<string>;
  readonly localBackendUrl: pulumi.Output<string>;
  readonly graphitiStateDir: pulumi.Output<undefined | string>;
  readonly qwenStateDir: pulumi.Output<string>;
  readonly qwenServiceName: pulumi.Output<string>;
  readonly graphitiProxyServiceName: pulumi.Output<undefined | string>;

  constructor(name: string, args?: V2TWorkstationArgs, opts?: pulumi.ComponentResourceOptions) {
    super("beep:infra:V2TWorkstation", name, undefined, opts);

    const installerScriptPath = resolveInstallerScriptPath();
    const qwenServerScriptPath = resolveQwenServerScriptPath();
    const resolvedConfig = validateV2TWorkstationConfig(
      normalizeV2TWorkstationConfig(args?.config, {
        graphitiSecretPresent: args?.graphitiOpenAiApiKey !== undefined,
      }),
      args
    );
    const graphitiOpenAiApiKey = args?.graphitiOpenAiApiKey;
    const qwenBaseUrl = parseUrl(resolvedConfig.qwenBaseUrl);
    const qwenStateDir = makeManagedStateDir(resolvedConfig.targetHomeDir, "qwen");
    const graphitiStateDir = makeManagedStateDir(resolvedConfig.targetHomeDir, "graphiti");
    const baseEnvironment = {
      V2T_REPO_ROOT: resolvedConfig.repoRoot,
      V2T_TARGET_USER: resolvedConfig.targetUser,
      V2T_QWEN_MODEL_ID: resolvedConfig.qwenModelId,
      V2T_QWEN_HOST: qwenBaseUrl.hostname,
      V2T_QWEN_PORT: qwenBaseUrl.port === "" ? "8011" : qwenBaseUrl.port,
      V2T_QWEN_STATE_DIR: qwenStateDir,
      V2T_QWEN_SERVICE_NAME: defaultQwenServiceName,
      V2T_GRAPHITI_ENABLED: String(resolvedConfig.graphitiEnabled),
      V2T_GRAPHITI_MODEL_NAME: resolvedConfig.graphitiModelName,
      V2T_GRAPHITI_STATE_DIR: graphitiStateDir,
      V2T_GRAPHITI_PROXY_SERVICE_NAME: defaultGraphitiProxyServiceName,
    } satisfies Record<string, pulumi.Input<string>>;

    const commandOptions = {
      parent: this,
    } satisfies pulumi.CustomResourceOptions;

    const baseTriggers = [
      resolvedConfig.repoRoot,
      resolvedConfig.targetUser,
      resolvedConfig.qwenModelId,
      resolvedConfig.qwenBaseUrl,
      resolvedConfig.graphitiEnabled,
      resolvedConfig.graphitiModelName,
      resolvedConfig.targetHomeDir,
      new pulumi.asset.FileAsset(installerScriptPath),
      new pulumi.asset.FileAsset(qwenServerScriptPath),
    ];
    const appBuildSourceTriggers = [
      makeSourceArchiveTrigger(
        resolvedConfig.repoRoot,
        [],
        [".npmrc", "bun.lock", "bunfig.toml", "package.json", "tsconfig.base.json"]
      ),
      makeSourceArchiveTrigger(
        `${resolvedConfig.repoRoot}/apps/V2T`,
        ["scripts", "src", "src-tauri/capabilities", "src-tauri/icons", "src-tauri/src"],
        [
          "components.json",
          "index.html",
          "package.json",
          "postcss.config.mjs",
          "src-tauri/Cargo.toml",
          "src-tauri/build.rs",
          "src-tauri/tauri.conf.json",
          "tsconfig.build.json",
          "tsconfig.json",
          "turbo.json",
          "vite.config.ts",
        ]
      ),
      makeSourceArchiveTrigger(
        `${resolvedConfig.repoRoot}/packages/VT2`,
        ["src"],
        ["package.json", "tsconfig.json", "turbo.json"]
      ),
    ];

    const preflight = new local.Command(
      `${name}-preflight`,
      {
        create: makeInstallerCommand("preflight", installerScriptPath),
        update: makeInstallerCommand("preflight", installerScriptPath),
        dir: resolvedConfig.repoRoot,
        environment: baseEnvironment,
        interpreter: ["/usr/bin/env", "bash", "-c"],
        triggers: baseTriggers,
      },
      commandOptions
    );

    const installSystem = new local.Command(
      `${name}-system`,
      {
        create: makeInstallerCommand("install-system", installerScriptPath),
        update: makeInstallerCommand("install-system", installerScriptPath),
        dir: resolvedConfig.repoRoot,
        environment: baseEnvironment,
        interpreter: ["/usr/bin/env", "bash", "-c"],
        triggers: baseTriggers,
      },
      {
        ...commandOptions,
        dependsOn: [preflight],
      }
    );

    const installQwen = new local.Command(
      `${name}-qwen`,
      {
        create: makeInstallerCommand("install-qwen", installerScriptPath),
        update: makeInstallerCommand("install-qwen", installerScriptPath),
        delete: makeInstallerCommand("uninstall-qwen", installerScriptPath),
        dir: resolvedConfig.repoRoot,
        environment: {
          ...baseEnvironment,
          ...(args?.huggingFaceHubToken === undefined
            ? {}
            : {
                V2T_HUGGING_FACE_HUB_TOKEN: args.huggingFaceHubToken,
              }),
        },
        interpreter: ["/usr/bin/env", "bash", "-c"],
        logging: types.enums.local.Logging.None,
        triggers: [...baseTriggers, args?.huggingFaceHubToken ?? "no-hf-token"],
      },
      {
        ...commandOptions,
        additionalSecretOutputs: ["stdout", "stderr"],
        dependsOn: [installSystem],
      }
    );

    const installGraphiti =
      resolvedConfig.graphitiEnabled && graphitiOpenAiApiKey !== undefined
        ? new local.Command(
            `${name}-graphiti`,
            {
              create: makeInstallerCommand("install-graphiti", installerScriptPath),
              update: makeInstallerCommand("install-graphiti", installerScriptPath),
              delete: makeInstallerCommand("uninstall-graphiti", installerScriptPath),
              dir: resolvedConfig.repoRoot,
              environment: {
                ...baseEnvironment,
                V2T_GRAPHITI_OPENAI_API_KEY: graphitiOpenAiApiKey,
              },
              interpreter: ["/usr/bin/env", "bash", "-c"],
              logging: types.enums.local.Logging.None,
              triggers: [...baseTriggers, graphitiOpenAiApiKey],
            },
            {
              ...commandOptions,
              additionalSecretOutputs: ["stdout", "stderr"],
              dependsOn: [installSystem],
            }
          )
        : undefined;

    const appBuild = new local.Command(
      `${name}-app`,
      {
        create: makeInstallerCommand("build-app", installerScriptPath),
        update: makeInstallerCommand("build-app", installerScriptPath),
        delete: makeInstallerCommand("uninstall-app", installerScriptPath),
        dir: resolvedConfig.repoRoot,
        environment: baseEnvironment,
        interpreter: ["/usr/bin/env", "bash", "-c"],
        triggers: [...baseTriggers, ...appBuildSourceTriggers],
      },
      {
        ...commandOptions,
        dependsOn: installGraphiti === undefined ? [installQwen] : [installQwen, installGraphiti],
      }
    );

    this.installedPackageName = appBuild.stdout.apply((value) => value.trim());
    this.graphitiProxyUrl = pulumi.output(resolvedConfig.graphitiEnabled ? defaultGraphitiProxyUrl : undefined);
    this.qwenBaseUrl = pulumi.output(resolvedConfig.qwenBaseUrl);
    this.localBackendUrl = pulumi.output(`file://${resolvedConfig.localBackendDir}`);
    this.graphitiStateDir = pulumi.output(resolvedConfig.graphitiEnabled ? graphitiStateDir : undefined);
    this.qwenStateDir = pulumi.output(qwenStateDir);
    this.qwenServiceName = pulumi.output(defaultQwenServiceName);
    this.graphitiProxyServiceName = pulumi.output(
      resolvedConfig.graphitiEnabled ? defaultGraphitiProxyServiceName : undefined
    );

    this.registerOutputs({
      installedPackageName: this.installedPackageName,
      graphitiProxyUrl: this.graphitiProxyUrl,
      qwenBaseUrl: this.qwenBaseUrl,
      localBackendUrl: this.localBackendUrl,
      graphitiStateDir: this.graphitiStateDir,
      qwenStateDir: this.qwenStateDir,
      qwenServiceName: this.qwenServiceName,
      graphitiProxyServiceName: this.graphitiProxyServiceName,
    });
  }
}
