/**
 * Pulumi orchestration surface for the repo AI metrics stack.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $InfraId } from "@beep/identity/packages";
import {
  AiMetricsDeployTarget,
  AiMetricsInstallInput,
  type AiMetricsInstallSpec,
  type AiMetricsOtlpEndpointSpec,
  type AiMetricsServiceSpec,
  AiMetricsTool,
  makeAiMetricsInstallSpec,
} from "@beep/repo-ai-metrics";
import { A, O, Str, Struct } from "@beep/utils";
import * as command from "@pulumi/command";
import * as pulumi from "@pulumi/pulumi";
import { Effect, pipe, Result } from "effect";
import * as S from "effect/Schema";

const $I = $InfraId.create("AIMetrics");
const defaultPhoenixImage = "arizephoenix/phoenix:latest";
const defaultPhoenixTailnetHttpsPort = 8447;
const defaultRemoteConfigRoot = "/home/elpresidank/ai-metrics";
const defaultSshHost = "dankserver";
const defaultSshUser = "elpresidank";
const defaultTailnetFqdn = "dankserver.tailc7c348.ts.net";
const remotePhoenixServiceName = "ai-metrics-phoenix.service";
const remotePhoenixComposeFile = "phoenix.compose.yaml";

const schemaIssueToPulumiConfigError =
  (key: string, value: string) =>
  (cause: S.SchemaError["issue"]): pulumi.RunError =>
    new pulumi.RunError(`Invalid aiMetrics:${key} Pulumi config value "${value}": ${new S.SchemaError(cause).message}`);

const decodeAiMetricsDeployTarget = S.decodeUnknownResult(AiMetricsDeployTarget);
const decodeAiMetricsTool = S.decodeUnknownResult(AiMetricsTool);

const targetFromPulumiConfig = (value: string | undefined): AiMetricsDeployTarget =>
  value === undefined
    ? AiMetricsDeployTarget.Enum.local
    : Result.getOrThrowWith(decodeAiMetricsDeployTarget(value), schemaIssueToPulumiConfigError("target", value));

const toolFromPulumiConfig = (value: string | undefined): AiMetricsTool =>
  value === undefined
    ? AiMetricsTool.Enum.phoenix
    : Result.getOrThrowWith(decodeAiMetricsTool(value), schemaIssueToPulumiConfigError("defaultTool", value));

const defaultServiceForSpec = (spec: AiMetricsInstallSpec): AiMetricsServiceSpec =>
  pipe(
    spec.services,
    A.findFirst((service) => service.enabledByDefault),
    O.getOrThrowWith(() => new pulumi.RunError("AI metrics install spec does not contain an enabled backend service."))
  );

const remotePhoenixDefaultService = (service: AiMetricsServiceSpec): AiMetricsServiceSpec =>
  pipe(
    O.some(service),
    O.filter((candidate) => candidate.tool === AiMetricsTool.Enum.phoenix),
    O.getOrThrowWith(
      () => new pulumi.RunError("P5b AI metrics remote apply only supports Phoenix as the default backend service.")
    )
  );

const shellQuote = (value: string): string => `'${pipe(value, Str.replace(/'/gu, `'"'"'`))}'`;

const remotePhoenixComposePath = (remoteConfigRoot: string): string =>
  `${remoteConfigRoot}/${remotePhoenixComposeFile}`;

const remoteSshConnection = (remote: AIMetricsRemoteDeploymentConfig): command.types.input.remote.ConnectionArgs => ({
  host: remote.ssh.host,
  ...(remote.ssh.agentSocketPath === undefined ? {} : { agentSocketPath: remote.ssh.agentSocketPath }),
  user: remote.ssh.user,
});

const renderRemotePhoenixCompose = (service: AiMetricsServiceSpec): string => `name: beep-ai-metrics-dankserver
services:
  ${service.composeServiceName}:
    container_name: beep-ai-metrics-phoenix
    environment:
      PHOENIX_WORKING_DIR: /data
    image: ${service.image}
    ports:
      - 127.0.0.1:6006:6006
    restart: unless-stopped
    volumes:
      - phoenix_data:/data
volumes:
  phoenix_data: {}
`;

const renderRemotePhoenixSystemdService = (remoteConfigRoot: string): string => `[Unit]
Description=Beep AI Metrics Phoenix backend
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${remoteConfigRoot}
ExecStart=/usr/bin/sg docker -c '/usr/bin/docker compose -f ${remotePhoenixComposePath(
  remoteConfigRoot
)} up -d --remove-orphans'
ExecStop=/usr/bin/sg docker -c '/usr/bin/docker compose -f ${remotePhoenixComposePath(remoteConfigRoot)} down'
TimeoutStartSec=0

[Install]
WantedBy=default.target
`;

// cspell:ignore DBUS
const userSystemdEnvironment = [
  'export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"',
  'export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=${XDG_RUNTIME_DIR}/bus}"',
].join("\n");

const renderRemotePreflightCommand = (remote: AIMetricsRemoteDeploymentConfig): string =>
  `/bin/bash -lc ${shellQuote(
    [
      "set -euo pipefail",
      "command -v docker >/dev/null",
      "command -v sg >/dev/null",
      "command -v systemctl >/dev/null",
      "command -v tailscale >/dev/null",
      "command -v curl >/dev/null",
      "docker compose version >/dev/null",
      "systemctl --user --version >/dev/null",
      "tailscale status --json >/dev/null",
      `printf 'AI metrics Phoenix preflight passed for ${remote.tailnetFqdn}:${remote.phoenixTailnetHttpsPort}\\n'`,
    ].join("\n")
  )}`;

const renderRemoteApplyCommand = (remote: AIMetricsRemoteDeploymentConfig, service: AiMetricsServiceSpec): string =>
  `/bin/bash -lc ${shellQuote(
    [
      "set -euo pipefail",
      userSystemdEnvironment,
      `remote_root=${shellQuote(remote.remoteConfigRoot)}`,
      `compose_path="\${remote_root}/${remotePhoenixComposeFile}"`,
      `unit_path="\${HOME}/.config/systemd/user/${remotePhoenixServiceName}"`,
      'install -d -m 0755 "${remote_root}"',
      'install -d -m 0755 "${HOME}/.config/systemd/user"',
      "cat > \"${compose_path}\" <<'BEEP_AI_METRICS_PHOENIX_COMPOSE'",
      renderRemotePhoenixCompose(service),
      "BEEP_AI_METRICS_PHOENIX_COMPOSE",
      "cat > \"${unit_path}\" <<'BEEP_AI_METRICS_PHOENIX_SYSTEMD'",
      renderRemotePhoenixSystemdService(remote.remoteConfigRoot),
      "BEEP_AI_METRICS_PHOENIX_SYSTEMD",
      "systemctl --user daemon-reload",
      `systemctl --user enable ${remotePhoenixServiceName} >/dev/null`,
      `systemctl --user restart ${remotePhoenixServiceName}`,
      `tailscale serve --yes --bg --https=${remote.phoenixTailnetHttpsPort} http://127.0.0.1:6006`,
      `printf 'AI metrics Phoenix remote apply completed at ${service.publicUrl}\\n'`,
    ].join("\n")
  )}`;

const renderRemoteHealthCommand = (remote: AIMetricsRemoteDeploymentConfig, service: AiMetricsServiceSpec): string =>
  `/bin/bash -lc ${shellQuote(
    [
      "set -euo pipefail",
      userSystemdEnvironment,
      `systemctl --user is-active --quiet ${remotePhoenixServiceName}`,
      "for attempt in $(seq 1 24); do",
      "  if curl -fsS http://127.0.0.1:6006 >/dev/null; then",
      "    break",
      "  fi",
      '  if [ "${attempt}" -eq 24 ]; then',
      "    docker logs beep-ai-metrics-phoenix --tail 80 || true",
      "    exit 1",
      "  fi",
      "  sleep 5",
      "done",
      `tailscale serve status --json | grep -F ${shellQuote("127.0.0.1:6006")} >/dev/null`,
      `curl -fsS ${shellQuote(service.publicUrl)} >/dev/null`,
      `printf 'AI metrics Phoenix health check passed for ${service.publicUrl}\\n'`,
    ].join("\n")
  )}`;

type AIMetricsPulumiConfigValues = {
  readonly dataRoot?: string | undefined;
  readonly defaultTool?: string | undefined;
  readonly hashSaltSecretRef?: string | undefined;
  readonly phoenixImage?: string | undefined;
  readonly phoenixTailnetHttpsPort?: number | undefined;
  readonly publicBaseUrl?: string | undefined;
  readonly rawArchiveKeySecretRef?: string | undefined;
  readonly remoteConfigRoot?: string | undefined;
  readonly sshAgentSocketPath?: string | undefined;
  readonly sshHost?: string | undefined;
  readonly sshUser?: string | undefined;
  readonly tailnetFqdn?: string | undefined;
  readonly target?: string | undefined;
};

/**
 * Raw optional Pulumi config values before target-aware defaults are applied.
 *
 * @example
 * ```ts
 * import { AIMetricsPulumiConfigValues } from "@beep/infra"
 *
 * console.log(AIMetricsPulumiConfigValues)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AIMetricsPulumiConfigValues = S.Class<AIMetricsPulumiConfigValues>($I`AIMetricsPulumiConfigValues`)(
  {
    dataRoot: S.String,
    defaultTool: S.String,
    hashSaltSecretRef: S.String,
    phoenixImage: S.String,
    phoenixTailnetHttpsPort: S.Int,
    publicBaseUrl: S.String,
    rawArchiveKeySecretRef: S.String,
    remoteConfigRoot: S.String,
    sshAgentSocketPath: S.String,
    sshHost: S.String,
    sshUser: S.String,
    tailnetFqdn: S.String,
    target: S.String,
  },
  $I.annote("AIMetricsPulumiConfigValues", { description: "Configuration values for AIMetrics Pulumi resources" })
).mapFields(Struct.map(S.optionalKey));

/**
 * SSH connection inputs for native Pulumi command resources.
 *
 * @example
 * ```ts
 * import { AIMetricsRemoteSshConfig } from "@beep/infra"
 *
 * console.log(new AIMetricsRemoteSshConfig({}).host)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AIMetricsRemoteSshConfig extends S.Class<AIMetricsRemoteSshConfig>($I`AIMetricsRemoteSshConfig`)(
  {
    agentSocketPath: S.optionalKey(S.String),
    host: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultSshHost)),
      S.withDecodingDefaultKey(Effect.succeed(defaultSshHost))
    ),
    user: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultSshUser)),
      S.withDecodingDefaultKey(Effect.succeed(defaultSshUser))
    ),
  },
  $I.annote("AIMetricsRemoteSshConfig", {
    description: "Pulumi SSH connection inputs for deploying the AI metrics Phoenix backend with the local SSH agent.",
  })
) {}

/**
 * Remote deployment inputs for the dankserver AI metrics Phoenix backend.
 *
 * @example
 * ```ts
 * import { AIMetricsRemoteDeploymentConfig } from "@beep/infra"
 *
 * console.log(new AIMetricsRemoteDeploymentConfig({}).phoenixTailnetHttpsPort)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AIMetricsRemoteDeploymentConfig extends S.Class<AIMetricsRemoteDeploymentConfig>(
  $I`AIMetricsRemoteDeploymentConfig`
)(
  {
    phoenixTailnetHttpsPort: S.Int.pipe(
      S.withConstructorDefault(Effect.succeed(defaultPhoenixTailnetHttpsPort)),
      S.withDecodingDefaultKey(Effect.succeed(defaultPhoenixTailnetHttpsPort))
    ),
    remoteConfigRoot: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultRemoteConfigRoot)),
      S.withDecodingDefaultKey(Effect.succeed(defaultRemoteConfigRoot))
    ),
    ssh: AIMetricsRemoteSshConfig.pipe(
      S.withConstructorDefault(Effect.succeed(new AIMetricsRemoteSshConfig({}))),
      S.withDecodingDefaultKey(Effect.succeed(new AIMetricsRemoteSshConfig({})))
    ),
    tailnetFqdn: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultTailnetFqdn)),
      S.withDecodingDefaultKey(Effect.succeed(defaultTailnetFqdn))
    ),
  },
  $I.annote("AIMetricsRemoteDeploymentConfig", {
    description: "Remote host, systemd, and Tailscale Serve settings for the AI metrics Phoenix backend.",
  })
) {}

/**
 * Pulumi-facing args for the AI metrics component.
 *
 * @example
 * ```ts
 * import { AIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(AIMetricsStackArgs)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AIMetricsStackArgs extends S.Class<AIMetricsStackArgs>($I`AIMetricsStackArgs`)(
  {
    install: AiMetricsInstallInput,
    remote: AIMetricsRemoteDeploymentConfig.pipe(
      S.withConstructorDefault(Effect.succeed(new AIMetricsRemoteDeploymentConfig({}))),
      S.withDecodingDefaultKey(Effect.succeed(new AIMetricsRemoteDeploymentConfig({})))
    ),
  },
  $I.annote("AIMetricsStackArgs", {
    description: "Pulumi-facing AI metrics install arguments resolved before component construction.",
  })
) {}

/**
 * Build Pulumi component args from a schema-first install input.
 *
 * @example
 * ```ts
 * import { makeAIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(makeAIMetricsStackArgs().install.target)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeAIMetricsStackArgs = (
  install: AiMetricsInstallInput = new AiMetricsInstallInput({}),
  remote: AIMetricsRemoteDeploymentConfig = new AIMetricsRemoteDeploymentConfig({})
): AIMetricsStackArgs =>
  new AIMetricsStackArgs({
    install,
    remote,
  });

/**
 * Build AI metrics stack args from decoded Pulumi config values.
 *
 * @example
 * ```ts
 * import { makeAIMetricsStackArgsFromConfigValues } from "@beep/infra"
 *
 * console.log(makeAIMetricsStackArgsFromConfigValues({ target: "local" }).install.target)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeAIMetricsStackArgsFromConfigValues = ({
  dataRoot,
  defaultTool,
  hashSaltSecretRef,
  phoenixImage,
  phoenixTailnetHttpsPort,
  publicBaseUrl,
  rawArchiveKeySecretRef,
  remoteConfigRoot,
  sshAgentSocketPath,
  sshHost,
  sshUser,
  tailnetFqdn,
  target,
}: AIMetricsPulumiConfigValues = {}): AIMetricsStackArgs => {
  const resolvedTarget = targetFromPulumiConfig(target);
  const remote = new AIMetricsRemoteDeploymentConfig({
    ...(phoenixTailnetHttpsPort === undefined ? {} : { phoenixTailnetHttpsPort }),
    ...(remoteConfigRoot === undefined ? {} : { remoteConfigRoot }),
    ssh: new AIMetricsRemoteSshConfig({
      ...(sshAgentSocketPath === undefined ? {} : { agentSocketPath: sshAgentSocketPath }),
      ...(sshHost === undefined ? {} : { host: sshHost }),
      ...(sshUser === undefined ? {} : { user: sshUser }),
    }),
    ...(tailnetFqdn === undefined ? {} : { tailnetFqdn }),
  });
  const resolvedPublicBaseUrl =
    publicBaseUrl ??
    (resolvedTarget === AiMetricsDeployTarget.Enum.dankserver
      ? `https://${remote.tailnetFqdn}:${remote.phoenixTailnetHttpsPort}`
      : undefined);

  return makeAIMetricsStackArgs(
    new AiMetricsInstallInput({
      defaultTool: toolFromPulumiConfig(defaultTool),
      ...(dataRoot === undefined ? {} : { dataRoot }),
      ...(hashSaltSecretRef === undefined ? {} : { hashSaltSecretRef }),
      ...(phoenixImage === undefined ? {} : { phoenixImage }),
      ...(resolvedPublicBaseUrl === undefined ? {} : { publicBaseUrl: resolvedPublicBaseUrl }),
      ...(rawArchiveKeySecretRef === undefined ? {} : { rawArchiveKeySecretRef }),
      target: resolvedTarget,
    }),
    remote
  );
};

/**
 * Load AI metrics args from Pulumi config.
 *
 * @example
 * ```ts
 * import { loadAIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(loadAIMetricsStackArgs)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadAIMetricsStackArgs = (): AIMetricsStackArgs => {
  const config = new pulumi.Config("aiMetrics");

  return makeAIMetricsStackArgsFromConfigValues({
    dataRoot: config.get("dataRoot"),
    defaultTool: config.get("defaultTool"),
    hashSaltSecretRef: config.get("hashSaltSecretRef"),
    phoenixImage: config.get("phoenixImage"),
    phoenixTailnetHttpsPort: config.getNumber("phoenixTailnetHttpsPort"),
    publicBaseUrl: config.get("publicBaseUrl"),
    rawArchiveKeySecretRef: config.get("rawArchiveKeySecretRef"),
    remoteConfigRoot: config.get("remoteConfigRoot"),
    sshAgentSocketPath: config.get("sshAgentSocketPath"),
    sshHost: config.get("sshHost"),
    sshUser: config.get("sshUser"),
    tailnetFqdn: config.get("tailnetFqdn"),
    target: config.get("target"),
  });
};

/**
 * Import-safe Pulumi component for the AI metrics target contract.
 *
 * @example
 * ```ts
 * import { AIMetricsStack, makeAIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(AIMetricsStack)
 * console.log(makeAIMetricsStackArgs)
 * ```
 *
 * @category resources
 * @since 0.0.0
 */
export class AIMetricsStack extends pulumi.ComponentResource {
  /**
   * Resolved install spec as a Pulumi output.
   *
   * @since 0.0.0
   */
  public readonly installSpec: pulumi.Output<AiMetricsInstallSpec>;

  /**
   * Raw transcript archive root.
   *
   * @since 0.0.0
   */
  public readonly rawArchiveDir: pulumi.Output<string>;

  /**
   * Derived DuckDB database path.
   *
   * @since 0.0.0
   */
  public readonly duckDbPath: pulumi.Output<string>;

  /**
   * Resolved stack name.
   *
   * @since 0.0.0
   */
  public readonly stackName: pulumi.Output<string>;

  /**
   * Backend service specs planned for the selected target.
   *
   * @since 0.0.0
   */
  public readonly services: pulumi.Output<ReadonlyArray<AiMetricsServiceSpec>>;

  /**
   * Default backend service planned for the selected target.
   *
   * @since 0.0.0
   */
  public readonly defaultService: pulumi.Output<AiMetricsServiceSpec>;

  /**
   * Default trace-only OTLP endpoint planned for the selected target.
   *
   * @since 0.0.0
   */
  public readonly otlpEndpoint: pulumi.Output<AiMetricsOtlpEndpointSpec>;

  /**
   * Default trace-only OTLP HTTP endpoint URL.
   *
   * @since 0.0.0
   */
  public readonly otlpTraceUrl: pulumi.Output<string>;

  /**
   * Public Phoenix UI and OTLP base URL for the selected target.
   *
   * @since 0.0.0
   */
  public readonly phoenixPublicUrl: pulumi.Output<string>;

  /**
   * Dedicated Tailscale Serve HTTPS port used for the remote Phoenix endpoint.
   *
   * @since 0.0.0
   */
  public readonly phoenixTailnetHttpsPort: pulumi.Output<number>;

  /**
   * Remote root containing the managed compose and systemd unit artifacts.
   *
   * @since 0.0.0
   */
  public readonly remoteConfigRoot: pulumi.Output<string>;

  /**
   * Captured stdout from the remote Phoenix preflight command.
   *
   * @since 0.0.0
   */
  public readonly remotePreflightStdout: pulumi.Output<string>;

  /**
   * Captured stdout from the remote Phoenix apply command.
   *
   * @since 0.0.0
   */
  public readonly remoteApplyStdout: pulumi.Output<string>;

  /**
   * Captured stdout from the remote Phoenix health command.
   *
   * @since 0.0.0
   */
  public readonly remoteHealthStdout: pulumi.Output<string>;

  public constructor(
    name: string,
    args: AIMetricsStackArgs = makeAIMetricsStackArgs(),
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("beep:infra:AIMetricsStack", name, {}, opts);

    const spec = Effect.runSync(makeAiMetricsInstallSpec(args.install));
    const defaultService = defaultServiceForSpec(spec);
    const remoteResources =
      spec.target === AiMetricsDeployTarget.Enum.dankserver
        ? (() => {
            const remoteDefaultService = remotePhoenixDefaultService(defaultService);
            const connection = remoteSshConnection(args.remote);
            const preflight = new command.remote.Command(
              `${name}-phoenix-preflight`,
              {
                connection,
                create: renderRemotePreflightCommand(args.remote),
                logging: command.types.enums.remote.Logging.StdoutAndStderr,
                triggers: [
                  args.remote.ssh.host,
                  args.remote.ssh.user,
                  args.remote.ssh.agentSocketPath ?? "",
                  args.remote.remoteConfigRoot,
                  args.remote.tailnetFqdn,
                  args.remote.phoenixTailnetHttpsPort,
                ],
                update: renderRemotePreflightCommand(args.remote),
              },
              { parent: this }
            );
            const apply = new command.remote.Command(
              `${name}-phoenix-apply`,
              {
                connection,
                create: renderRemoteApplyCommand(args.remote, remoteDefaultService),
                logging: command.types.enums.remote.Logging.StdoutAndStderr,
                triggers: [
                  remoteDefaultService.image,
                  remoteDefaultService.publicUrl,
                  renderRemotePhoenixCompose(remoteDefaultService),
                  renderRemotePhoenixSystemdService(args.remote.remoteConfigRoot),
                ],
                update: renderRemoteApplyCommand(args.remote, remoteDefaultService),
              },
              {
                dependsOn: preflight,
                parent: this,
              }
            );
            const health = new command.remote.Command(
              `${name}-phoenix-health`,
              {
                connection,
                create: renderRemoteHealthCommand(args.remote, remoteDefaultService),
                logging: command.types.enums.remote.Logging.StdoutAndStderr,
                triggers: [remoteDefaultService.publicUrl, args.remote.phoenixTailnetHttpsPort],
                update: renderRemoteHealthCommand(args.remote, remoteDefaultService),
              },
              {
                dependsOn: apply,
                parent: this,
              }
            );

            return {
              apply,
              health,
              preflight,
            };
          })()
        : undefined;

    this.installSpec = pulumi.output(spec);
    this.rawArchiveDir = pulumi.output(spec.storage.rawArchiveDir);
    this.duckDbPath = pulumi.output(spec.storage.duckDbPath);
    this.stackName = pulumi.output(spec.stackName);
    this.services = pulumi.output(spec.services);
    this.defaultService = pulumi.output(defaultService);
    this.otlpEndpoint = pulumi.output(defaultService.otlp);
    this.otlpTraceUrl = pulumi.output(defaultService.otlp.traceUrl);
    this.phoenixPublicUrl = pulumi.output(defaultService.publicUrl);
    this.phoenixTailnetHttpsPort = pulumi.output(args.remote.phoenixTailnetHttpsPort);
    this.remoteConfigRoot = pulumi.output(args.remote.remoteConfigRoot);
    this.remotePreflightStdout = remoteResources?.preflight.stdout ?? pulumi.output("");
    this.remoteApplyStdout = remoteResources?.apply.stdout ?? pulumi.output("");
    this.remoteHealthStdout = remoteResources?.health.stdout ?? pulumi.output("");

    this.registerOutputs({
      defaultService: this.defaultService,
      duckDbPath: this.duckDbPath,
      installSpec: this.installSpec,
      otlpEndpoint: this.otlpEndpoint,
      otlpTraceUrl: this.otlpTraceUrl,
      phoenixPublicUrl: this.phoenixPublicUrl,
      phoenixTailnetHttpsPort: this.phoenixTailnetHttpsPort,
      rawArchiveDir: this.rawArchiveDir,
      remoteApplyStdout: this.remoteApplyStdout,
      remoteConfigRoot: this.remoteConfigRoot,
      remoteHealthStdout: this.remoteHealthStdout,
      remotePreflightStdout: this.remotePreflightStdout,
      services: this.services,
      stackName: this.stackName,
    });
  }
}
