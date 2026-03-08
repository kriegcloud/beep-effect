import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/Sandbox");

/**
 * @since 0.0.0
 */
export class SandboxNetworkConfig extends S.Class<SandboxNetworkConfig>($I`SandboxNetworkConfig`)(
  {
    allowedDomains: S.optional(S.Array(S.String)),
    allowManagedDomainsOnly: S.optional(S.Boolean),
    allowUnixSockets: S.optional(S.Array(S.String)),
    allowAllUnixSockets: S.optional(S.Boolean),
    allowLocalBinding: S.optional(S.Boolean),
    httpProxyPort: S.optional(S.Number),
    socksProxyPort: S.optional(S.Number),
  },
  $I.annote("SandboxNetworkConfig", {
    description: "Sandbox network policy settings controlling domains, sockets, and proxy ports.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SandboxNetworkConfigEncoded = typeof SandboxNetworkConfig.Encoded;

/**
 * @since 0.0.0
 */
export const SandboxIgnoreViolations = S.Record(S.String, S.Array(S.String)).annotate(
  $I.annote("SandboxIgnoreViolations", {
    description: "Per-command sandbox violations that should be ignored.",
  })
);

/**
 * @since 0.0.0
 */
export type SandboxIgnoreViolations = typeof SandboxIgnoreViolations.Type;
/**
 * @since 0.0.0
 */
export type SandboxIgnoreViolationsEncoded = typeof SandboxIgnoreViolations.Encoded;

/**
 * @since 0.0.0
 */
export class SandboxFilesystemConfig extends S.Class<SandboxFilesystemConfig>($I`SandboxFilesystemConfig`)(
  {
    allowWrite: S.optional(S.Array(S.String)),
    denyWrite: S.optional(S.Array(S.String)),
    denyRead: S.optional(S.Array(S.String)),
  },
  $I.annote("SandboxFilesystemConfig", {
    description: "Sandbox filesystem policy settings for writable and blocked paths.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SandboxFilesystemConfigEncoded = typeof SandboxFilesystemConfig.Encoded;

class SandboxRipgrepConfig extends S.Class<SandboxRipgrepConfig>($I`SandboxRipgrepConfig`)(
  {
    command: S.String,
    args: S.optional(S.Array(S.String)),
  },
  $I.annote("SandboxRipgrepConfig", {
    description: "Optional ripgrep command override used inside the sandbox.",
  })
) {}

/**
 * @since 0.0.0
 */
export class SandboxSettings extends S.Class<SandboxSettings>($I`SandboxSettings`)(
  {
    enabled: S.optional(S.Boolean),
    autoAllowBashIfSandboxed: S.optional(S.Boolean),
    allowUnsandboxedCommands: S.optional(S.Boolean),
    network: S.optional(SandboxNetworkConfig),
    filesystem: S.optional(SandboxFilesystemConfig),
    ignoreViolations: S.optional(SandboxIgnoreViolations),
    enableWeakerNestedSandbox: S.optional(S.Boolean),
    excludedCommands: S.optional(S.Array(S.String)),
    ripgrep: S.optional(SandboxRipgrepConfig),
  },
  $I.annote("SandboxSettings", {
    description: "Complete sandbox configuration applied to Claude Code sessions.",
  })
) {}
/**
 * @since 0.0.0
 */
export type SandboxSettingsEncoded = typeof SandboxSettings.Encoded;
