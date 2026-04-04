/**
 * Shared sandbox configuration schemas for `@beep/clawhole`.
 *
 * This module ports the reusable OpenClaw sandbox setting groups into the
 * repository's schema-first conventions while preserving the documented config
 * surface from `types.sandbox.ts`.
 *
 * Only the shared setting groups live here:
 * - Docker sandbox runtime settings
 * - Browser sandbox settings
 * - Sandbox auto-prune settings
 * - SSH sandbox settings
 *
 * Agent-level sandbox wrapper config stays outside this module.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option";
 * import * as S from "effect/Schema";
 * import { SandboxDockerSettings } from "@beep/clawhole/config/Sandbox";
 *
 * const docker = S.decodeUnknownSync(SandboxDockerSettings)({
 *   image: "ghcr.io/openclaw/sandbox:latest",
 *   workdir: "/workspace",
 *   network: "bridge",
 *   pidsLimit: 256,
 *   binds: ["/tmp/cache:/cache:rw"]
 * });
 *
 * console.log(O.isSome(docker.workdir)); // true
 * ```
 *
 * @module @beep/clawhole/config/Sandbox
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { FilePath, LiteralKit, NonEmptyTrimmedStr, NonNegativeInt } from "@beep/schema";
import { pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SecretInput } from "./Secrets.ts";

const $I = $ClawholeId.create("config/Sandbox");

const strictParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const NonNegativeFiniteNumber = S.Number.check(
  S.makeFilterGroup([S.isFinite({ description: "A finite number." }), S.isGreaterThanOrEqualTo(0)], {
    identifier: $I`NonNegativeFiniteNumberChecks`,
    title: "Non-Negative Finite Number",
    description: "A finite number greater than or equal to 0.",
  })
).pipe(
  $I.annoteSchema("NonNegativeFiniteNumber", {
    description: "A finite number greater than or equal to 0.",
  })
);

const PositiveFiniteNumber = S.Number.check(
  S.makeFilterGroup([S.isFinite({ description: "A finite number." }), S.isGreaterThan(0)], {
    identifier: $I`PositiveFiniteNumberChecks`,
    title: "Positive Finite Number",
    description: "A finite number greater than 0.",
  })
).pipe(
  $I.annoteSchema("PositiveFiniteNumber", {
    description: "A finite number greater than 0.",
  })
);

const SandboxPort = S.Int.check(
  S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(65535)], {
    identifier: $I`SandboxPortChecks`,
    title: "Sandbox Port",
    description: "A sandbox port integer between 1 and 65535 inclusive.",
  })
).pipe(
  $I.annoteSchema("SandboxPort", {
    description: "A sandbox port integer between 1 and 65535 inclusive.",
  })
);

const SandboxTimeoutMs = S.Int.check(S.isGreaterThan(0)).pipe(
  $I.annoteSchema("SandboxTimeoutMs", {
    description: "A positive sandbox timeout expressed in milliseconds.",
  })
);

const SandboxAbsolutePosixPath = FilePath.check(
  S.makeFilter(Str.startsWith("/"), {
    identifier: $I`SandboxAbsolutePosixPathCheck`,
    title: "Sandbox Absolute POSIX Path",
    description: "A file path rooted at `/` using POSIX absolute path semantics.",
    message: "Sandbox paths must be absolute POSIX paths",
  })
).pipe(
  $I.annoteSchema("SandboxAbsolutePosixPath", {
    description: "A file path rooted at `/` using POSIX absolute path semantics.",
  })
);

const isSandboxAbsolutePosixPath = S.is(SandboxAbsolutePosixPath);

const SandboxHostNetworkMode = S.Literal("host").pipe(
  $I.annoteSchema("SandboxHostNetworkMode", {
    description: 'The blocked sandbox network mode literal `"host"`.',
  })
);

const isSandboxHostNetworkMode = S.is(SandboxHostNetworkMode);

const SandboxUnconfinedSecurityProfile = S.Literal("unconfined").pipe(
  $I.annoteSchema("SandboxUnconfinedSecurityProfile", {
    description: 'The blocked security profile literal `"unconfined"`.',
  })
);

const isSandboxUnconfinedSecurityProfile = S.is(SandboxUnconfinedSecurityProfile);

const SandboxBlockedNetworkModeReason = LiteralKit(["host", "container_namespace_join"] as const).pipe(
  $I.annoteSchema("SandboxBlockedNetworkModeReason", {
    description: "Reasons a sandbox network mode is blocked by the local sandbox security policy.",
  })
);

type SandboxBlockedNetworkModeReason = typeof SandboxBlockedNetworkModeReason.Type;

const SandboxDockerMemoryLimit = S.Union([S.String, NonNegativeFiniteNumber]).pipe(
  $I.annoteSchema("SandboxDockerMemoryLimit", {
    description:
      "A Docker memory-limit input accepted as either a non-negative number of bytes or a Docker size string.",
  })
);

const SandboxDockerCpuLimit = PositiveFiniteNumber.pipe(
  $I.annoteSchema("SandboxDockerCpuLimit", {
    description: "A positive finite CPU limit for Docker sandbox containers.",
  })
);

const SandboxDockerPidsLimit = NonNegativeInt.pipe(
  $I.annoteSchema("SandboxDockerPidsLimit", {
    description: "A non-negative integer PID limit for Docker sandbox containers.",
  })
);

const SandboxDockerEnvironment = S.Record(S.String, S.String).pipe(
  $I.annoteSchema("SandboxDockerEnvironment", {
    description: "Environment variables passed to sandbox Docker executions.",
  })
);

const SandboxDockerTmpfsList = S.Array(S.String).pipe(
  $I.annoteSchema("SandboxDockerTmpfsList", {
    description: "Extra tmpfs mount specifications applied to sandbox Docker containers.",
  })
);

const SandboxDockerCapabilityDropList = S.Array(S.String).pipe(
  $I.annoteSchema("SandboxDockerCapabilityDropList", {
    description: "Linux capability names dropped from sandbox Docker containers.",
  })
);

const SandboxDockerDnsServers = S.Array(S.String).pipe(
  $I.annoteSchema("SandboxDockerDnsServers", {
    description: "DNS server entries used by sandbox Docker containers.",
  })
);

const SandboxDockerExtraHosts = S.Array(S.String).pipe(
  $I.annoteSchema("SandboxDockerExtraHosts", {
    description: "Additional host mappings passed to sandbox Docker containers.",
  })
);

const SandboxDockerSetupCommand = S.String.pipe(
  $I.annoteSchema("SandboxDockerSetupCommand", {
    description: "A setup command string run once after sandbox container creation.",
  })
);

class SandboxDockerUlimitRangeData extends S.Class<SandboxDockerUlimitRangeData>($I`SandboxDockerUlimitRange`)(
  {
    soft: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Optional soft ulimit value.",
    }),
    hard: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Optional hard ulimit value.",
    }),
  },
  $I.annote("SandboxDockerUlimitRange", {
    description: "Soft and hard ulimit values keyed under one Docker ulimit entry.",
    parseOptions: strictParseOptions,
  })
) {}

const SandboxDockerUlimitNumber = NonNegativeFiniteNumber.pipe(
  $I.annoteSchema("SandboxDockerUlimitNumber", {
    description: "A non-negative numeric Docker ulimit value.",
  })
);

const SandboxDockerUlimitValue = S.Union([S.String, SandboxDockerUlimitNumber, SandboxDockerUlimitRangeData]).pipe(
  $I.annoteSchema("SandboxDockerUlimitValue", {
    description:
      'A Docker ulimit value expressed as `"soft:hard"`, a number, or an object with optional soft/hard keys.',
  })
);

const SandboxDockerUlimits = S.Record(S.String, SandboxDockerUlimitValue).pipe(
  $I.annoteSchema("SandboxDockerUlimits", {
    description: "Docker ulimit settings keyed by ulimit name.",
  })
);

const extractSandboxBindSource = (bind: string): string =>
  pipe(
    bind,
    Str.indexOf(":"),
    O.match({
      onNone: () => bind,
      onSome: (index) => pipe(bind, Str.slice(0, index)),
    }),
    Str.trim
  );

const SandboxDockerBindSpec = NonEmptyTrimmedStr.check(
  S.makeFilter((value) => isSandboxAbsolutePosixPath(extractSandboxBindSource(value)), {
    identifier: $I`SandboxDockerBindSpecCheck`,
    title: "Sandbox Docker Bind Spec",
    description: "A Docker bind specification whose source path is a non-empty absolute POSIX path.",
    message: "Sandbox security: bind mount sources must be non-empty absolute POSIX paths.",
  })
).pipe(
  $I.annoteSchema("SandboxDockerBindSpec", {
    description: "A Docker bind specification using the `host:container[:mode]` shape with an absolute POSIX source.",
  })
);

const SandboxDockerBindList = S.Array(SandboxDockerBindSpec).pipe(
  $I.annoteSchema("SandboxDockerBindList", {
    description: "Bind mount specifications applied to sandbox Docker containers.",
  })
);

const SandboxBrowserBindList = S.Array(SandboxDockerBindSpec).pipe(
  $I.annoteSchema("SandboxBrowserBindList", {
    description: "Bind mount specifications applied only to sandbox browser containers.",
  })
);

const SandboxSshTarget = NonEmptyTrimmedStr.pipe(
  $I.annoteSchema("SandboxSshTarget", {
    description: "A non-empty SSH target string in `user@host[:port]` form.",
  })
);

const SandboxSshCommand = NonEmptyTrimmedStr.pipe(
  $I.annoteSchema("SandboxSshCommand", {
    description: "A non-empty SSH client command.",
  })
);

const SandboxSshHostFilePath = FilePath.pipe(
  $I.annoteSchema("SandboxSshHostFilePath", {
    description: "A filesystem path on the host used for SSH materials such as keys, certificates, or known_hosts.",
  })
);

const SandboxSshSecretMaterial = SecretInput.pipe(
  $I.annoteSchema("SandboxSshSecretMaterial", {
    description: "Inline or SecretRef-backed SSH secret material.",
  })
);

const normalizeSandboxOptionalString = (value: O.Option<string>): string | undefined =>
  pipe(value, O.map(Str.trim), O.map(Str.toLowerCase), O.filter(Str.isNonEmpty), O.getOrUndefined);

const hasBlockedSandboxHostNetworkMode = (value: O.Option<string>): boolean => {
  const normalized = normalizeSandboxOptionalString(value);
  return normalized !== undefined && isSandboxHostNetworkMode(normalized);
};

const hasSandboxContainerNamespaceJoin = (value: string): boolean => pipe(value, Str.startsWith("container:"));

const getSandboxBlockedNetworkModeReason = (params: {
  readonly network: O.Option<string>;
  readonly allowContainerNamespaceJoin?: boolean;
}): O.Option<SandboxBlockedNetworkModeReason> => {
  const normalized = normalizeSandboxOptionalString(params.network);

  if (normalized === undefined) {
    return O.none();
  }

  if (isSandboxHostNetworkMode(normalized)) {
    return O.some("host");
  }

  if (hasSandboxContainerNamespaceJoin(normalized) && params.allowContainerNamespaceJoin !== true) {
    return O.some("container_namespace_join");
  }

  return O.none();
};

const hasBlockedSandboxContainerNamespaceJoin = (params: {
  readonly network: O.Option<string>;
  readonly allowContainerNamespaceJoin?: boolean;
}): boolean =>
  pipe(
    getSandboxBlockedNetworkModeReason(params),
    O.match({
      onNone: () => false,
      onSome: (reason) => reason === SandboxBlockedNetworkModeReason.Enum.container_namespace_join,
    })
  );

const hasUnconfinedSandboxSecurityProfile = (value: O.Option<string>): boolean =>
  pipe(
    value,
    O.map(Str.trim),
    O.map(Str.toLowerCase),
    O.filter(Str.isNonEmpty),
    O.match({
      onNone: () => false,
      onSome: isSandboxUnconfinedSecurityProfile,
    })
  );

const SandboxDockerSettingsChecks = S.makeFilterGroup(
  [
    S.makeFilter(
      (value: {
        readonly network: O.Option<string>;
        readonly dangerouslyAllowContainerNamespaceJoin: O.Option<boolean>;
        readonly seccompProfile: O.Option<string>;
        readonly apparmorProfile: O.Option<string>;
      }) => !hasBlockedSandboxHostNetworkMode(value.network),
      {
        identifier: $I`SandboxDockerSettingsHostNetworkCheck`,
        title: "Sandbox Docker Host Network",
        description: 'Checks that sandbox Docker network mode does not use the blocked `"host"` setting.',
        message: 'Sandbox security: network mode "host" is blocked. Use "bridge" or "none" instead.',
      }
    ),
    S.makeFilter(
      (value: {
        readonly network: O.Option<string>;
        readonly dangerouslyAllowContainerNamespaceJoin: O.Option<boolean>;
        readonly seccompProfile: O.Option<string>;
        readonly apparmorProfile: O.Option<string>;
      }) =>
        !hasBlockedSandboxContainerNamespaceJoin({
          network: value.network,
          allowContainerNamespaceJoin: pipe(
            value.dangerouslyAllowContainerNamespaceJoin,
            O.getOrElse(() => false)
          ),
        }),
      {
        identifier: $I`SandboxDockerSettingsContainerNamespaceJoinCheck`,
        title: "Sandbox Docker Container Namespace Join",
        description: 'Checks that sandbox Docker network mode does not use `"container:*"` unless explicitly allowed.',
        message:
          'Sandbox security: network mode "container:*" is blocked by default. Use a custom bridge network, or set dangerouslyAllowContainerNamespaceJoin=true only when you fully trust this runtime.',
      }
    ),
    S.makeFilter(
      (value: {
        readonly network: O.Option<string>;
        readonly dangerouslyAllowContainerNamespaceJoin: O.Option<boolean>;
        readonly seccompProfile: O.Option<string>;
        readonly apparmorProfile: O.Option<string>;
      }) => !hasUnconfinedSandboxSecurityProfile(value.seccompProfile),
      {
        identifier: $I`SandboxDockerSettingsSeccompProfileCheck`,
        title: "Sandbox Docker Seccomp Profile",
        description: 'Checks that sandbox Docker seccompProfile does not use the blocked `"unconfined"` value.',
        message:
          'Sandbox security: seccomp profile "unconfined" is blocked. Use a custom seccomp profile file or omit this setting.',
      }
    ),
    S.makeFilter(
      (value: {
        readonly network: O.Option<string>;
        readonly dangerouslyAllowContainerNamespaceJoin: O.Option<boolean>;
        readonly seccompProfile: O.Option<string>;
        readonly apparmorProfile: O.Option<string>;
      }) => !hasUnconfinedSandboxSecurityProfile(value.apparmorProfile),
      {
        identifier: $I`SandboxDockerSettingsApparmorProfileCheck`,
        title: "Sandbox Docker AppArmor Profile",
        description: 'Checks that sandbox Docker apparmorProfile does not use the blocked `"unconfined"` value.',
        message:
          'Sandbox security: apparmor profile "unconfined" is blocked. Use a named AppArmor profile or omit this setting.',
      }
    ),
  ],
  {
    identifier: $I`SandboxDockerSettingsChecks`,
    title: "Sandbox Docker Settings",
    description: "Cross-field sandbox Docker security checks for network and profile settings.",
  }
);

const SandboxBrowserSettingsChecks = S.makeFilterGroup(
  [
    S.makeFilter((value: { readonly network: O.Option<string> }) => !hasBlockedSandboxHostNetworkMode(value.network), {
      identifier: $I`SandboxBrowserSettingsHostNetworkCheck`,
      title: "Sandbox Browser Host Network",
      description: 'Checks that sandbox browser network mode does not use the blocked `"host"` setting.',
      message:
        'Sandbox security: browser network mode "host" is blocked. Use "bridge" or a custom bridge network instead.',
    }),
  ],
  {
    identifier: $I`SandboxBrowserSettingsChecks`,
    title: "Sandbox Browser Settings",
    description: "Cross-field sandbox browser security checks.",
  }
);

class SandboxDockerSettingsData extends S.Class<SandboxDockerSettingsData>($I`SandboxDockerSettings`)(
  {
    image: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Docker image used for sandbox containers.",
    }),
    containerPrefix: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Prefix applied to sandbox container names.",
    }),
    workdir: S.OptionFromOptionalKey(SandboxAbsolutePosixPath).annotateKey({
      description: "Container workdir mount path inside the sandbox container. Default runtime value: `/workspace`.",
    }),
    readOnlyRoot: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the container root filesystem is mounted read-only.",
    }),
    tmpfs: S.OptionFromOptionalKey(SandboxDockerTmpfsList).annotateKey({
      description: "Extra tmpfs mounts applied when using read-only sandbox containers.",
    }),
    network: S.OptionFromOptionalKey(S.String).annotateKey({
      description:
        'Docker network mode for sandbox containers, such as `"bridge"`, `"none"`, or a custom network name.',
    }),
    user: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Container user string in `uid:gid` form.",
    }),
    capDrop: S.OptionFromOptionalKey(SandboxDockerCapabilityDropList).annotateKey({
      description: "Linux capabilities dropped from sandbox containers.",
    }),
    env: S.OptionFromOptionalKey(SandboxDockerEnvironment).annotateKey({
      description: "Additional environment variables passed to sandbox executions.",
    }),
    setupCommand: S.OptionFromOptionalKey(SandboxDockerSetupCommand).annotateKey({
      description: "Optional setup command run once after sandbox container creation.",
    }),
    pidsLimit: S.OptionFromOptionalKey(SandboxDockerPidsLimit).annotateKey({
      description: "PID limit for the sandbox container. `0` preserves Docker's default behavior.",
    }),
    memory: S.OptionFromOptionalKey(SandboxDockerMemoryLimit).annotateKey({
      description: "Container memory limit, expressed as a byte count number or Docker size string.",
    }),
    memorySwap: S.OptionFromOptionalKey(SandboxDockerMemoryLimit).annotateKey({
      description: "Container memory-swap limit, expressed as a byte count number or Docker size string.",
    }),
    cpus: S.OptionFromOptionalKey(SandboxDockerCpuLimit).annotateKey({
      description: "CPU limit for the sandbox container, expressed as a positive finite number.",
    }),
    ulimits: S.OptionFromOptionalKey(SandboxDockerUlimits).annotateKey({
      description: "Per-name Docker ulimit values applied to the sandbox container.",
    }),
    seccompProfile: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Seccomp profile path or profile name used for the sandbox container.",
    }),
    apparmorProfile: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "AppArmor profile name used for the sandbox container.",
    }),
    dns: S.OptionFromOptionalKey(SandboxDockerDnsServers).annotateKey({
      description: "DNS servers used by sandbox containers.",
    }),
    extraHosts: S.OptionFromOptionalKey(SandboxDockerExtraHosts).annotateKey({
      description: "Additional host mappings in `host:ip` form.",
    }),
    binds: S.OptionFromOptionalKey(SandboxDockerBindList).annotateKey({
      description: "Additional bind mounts in `host:container[:mode]` form.",
    }),
    dangerouslyAllowReservedContainerTargets: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Dangerous override allowing bind mounts that target reserved container paths such as `/workspace`.",
    }),
    dangerouslyAllowExternalBindSources: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Dangerous override allowing bind mount sources outside the runtime allowlisted roots.",
    }),
    dangerouslyAllowContainerNamespaceJoin: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: 'Dangerous override allowing Docker `network: "container:<id>"` namespace joins.',
    }),
  },
  $I.annote("SandboxDockerSettings", {
    description: "Shared Docker sandbox runtime settings.",
    parseOptions: strictParseOptions,
  })
) {}

class SandboxBrowserSettingsData extends S.Class<SandboxBrowserSettingsData>($I`SandboxBrowserSettings`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether sandbox browser support is enabled.",
    }),
    image: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Docker image used for sandbox browser containers.",
    }),
    containerPrefix: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Prefix applied to sandbox browser container names.",
    }),
    network: S.OptionFromOptionalKey(S.String).annotateKey({
      description:
        'Docker network for sandbox browser containers. Default runtime value: `"openclaw-sandbox-browser"`.',
    }),
    cdpPort: S.OptionFromOptionalKey(SandboxPort).annotateKey({
      description: "CDP port exposed for browser automation.",
    }),
    cdpSourceRange: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional CIDR allowlist used for CDP ingress at the container edge.",
    }),
    vncPort: S.OptionFromOptionalKey(SandboxPort).annotateKey({
      description: "VNC port exposed for sandbox browser inspection.",
    }),
    noVncPort: S.OptionFromOptionalKey(SandboxPort).annotateKey({
      description: "noVNC port exposed for sandbox browser inspection in a web client.",
    }),
    headless: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether sandbox browser sessions run headless.",
    }),
    enableNoVnc: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the noVNC sidecar is enabled for sandbox browser containers.",
    }),
    allowHostControl: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether sandboxed sessions may target the host browser control server.",
    }),
    autoStart: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether sandbox browser control auto-starts or reattaches the browser container when needed.",
    }),
    autoStartTimeoutMs: S.OptionFromOptionalKey(SandboxTimeoutMs).annotateKey({
      description: "Maximum time to wait for CDP reachability after browser auto-start, in milliseconds.",
    }),
    binds: S.OptionFromOptionalKey(SandboxBrowserBindList).annotateKey({
      description:
        "Browser-container-only bind mounts. When set, these replace the docker-level binds for the browser container.",
    }),
  },
  $I.annote("SandboxBrowserSettings", {
    description: "Shared sandbox browser settings.",
    parseOptions: strictParseOptions,
  })
) {}

/**
 * Shared Docker sandbox runtime settings.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SandboxDockerSettings = SandboxDockerSettingsData.check(SandboxDockerSettingsChecks);

/**
 * Type of {@link SandboxDockerSettings}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SandboxDockerSettings = typeof SandboxDockerSettings.Type;

/**
 * Shared sandbox browser settings.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SandboxBrowserSettings = SandboxBrowserSettingsData.check(SandboxBrowserSettingsChecks);

/**
 * Type of {@link SandboxBrowserSettings}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SandboxBrowserSettings = typeof SandboxBrowserSettings.Type;

/**
 * Auto-prune settings for sandbox workspaces or containers.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SandboxPruneSettings extends S.Class<SandboxPruneSettings>($I`SandboxPruneSettings`)(
  {
    idleHours: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Prune the sandbox when it has been idle for more than this many hours. `0` disables idle pruning.",
    }),
    maxAgeDays: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Prune the sandbox when it is older than this many days. `0` disables age-based pruning.",
    }),
  },
  $I.annote("SandboxPruneSettings", {
    description: "Auto-prune settings for sandbox workspaces or containers.",
    parseOptions: strictParseOptions,
  })
) {}

/**
 * SSH-backed sandbox runtime settings.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SandboxSshSettings extends S.Class<SandboxSshSettings>($I`SandboxSshSettings`)(
  {
    target: S.OptionFromOptionalKey(SandboxSshTarget).annotateKey({
      description: "SSH target in `user@host[:port]` form.",
    }),
    command: S.OptionFromOptionalKey(SandboxSshCommand).annotateKey({
      description: 'SSH client command used to connect to the target. Default runtime value: `"ssh"`.',
    }),
    workspaceRoot: S.OptionFromOptionalKey(SandboxAbsolutePosixPath).annotateKey({
      description: "Absolute remote root directory used for per-scope sandbox workspaces.",
    }),
    strictHostKeyChecking: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether host-key verification is enforced. Default runtime value: `true`.",
    }),
    updateHostKeys: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether OpenSSH host-key updates are allowed. Default runtime value: `true`.",
    }),
    identityFile: S.OptionFromOptionalKey(SandboxSshHostFilePath).annotateKey({
      description: "Path to an existing private key on the host.",
    }),
    certificateFile: S.OptionFromOptionalKey(SandboxSshHostFilePath).annotateKey({
      description: "Path to an existing SSH certificate on the host.",
    }),
    knownHostsFile: S.OptionFromOptionalKey(SandboxSshHostFilePath).annotateKey({
      description: "Path to an existing known_hosts file on the host.",
    }),
    identityData: S.OptionFromOptionalKey(SandboxSshSecretMaterial).annotateKey({
      description: "Inline or SecretRef-backed private key contents.",
    }),
    certificateData: S.OptionFromOptionalKey(SandboxSshSecretMaterial).annotateKey({
      description: "Inline or SecretRef-backed SSH certificate contents.",
    }),
    knownHostsData: S.OptionFromOptionalKey(SandboxSshSecretMaterial).annotateKey({
      description: "Inline or SecretRef-backed known_hosts contents.",
    }),
  },
  $I.annote("SandboxSshSettings", {
    description: "SSH-backed sandbox runtime settings.",
    parseOptions: strictParseOptions,
  })
) {}
