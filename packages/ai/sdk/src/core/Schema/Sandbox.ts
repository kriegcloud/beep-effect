import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/Sandbox");

/**
 * @since 0.0.0
 */
export const SandboxNetworkConfig = S.Struct({
  allowedDomains: S.optional(S.Array(S.String)),
  allowManagedDomainsOnly: S.optional(S.Boolean),
  allowUnixSockets: S.optional(S.Array(S.String)),
  allowAllUnixSockets: S.optional(S.Boolean),
  allowLocalBinding: S.optional(S.Boolean),
  httpProxyPort: S.optional(S.Number),
  socksProxyPort: S.optional(S.Number),
}).annotate(
  $I.annote("SandboxNetworkConfig", {
    description: "Schema for SandboxNetworkConfig.",
  })
);

/**
 * @since 0.0.0
 */
export type SandboxNetworkConfig = typeof SandboxNetworkConfig.Type;
/**
 * @since 0.0.0
 */
export type SandboxNetworkConfigEncoded = typeof SandboxNetworkConfig.Encoded;

/**
 * @since 0.0.0
 */
export const SandboxIgnoreViolations = S.Record(S.String, S.Array(S.String)).annotate(
  $I.annote("SandboxIgnoreViolations", {
    description: "Schema for SandboxIgnoreViolations.",
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
export const SandboxFilesystemConfig = S.Struct({
  allowWrite: S.optional(S.Array(S.String)),
  denyWrite: S.optional(S.Array(S.String)),
  denyRead: S.optional(S.Array(S.String)),
}).annotate(
  $I.annote("SandboxFilesystemConfig", {
    description: "Schema for SandboxFilesystemConfig.",
  })
);

/**
 * @since 0.0.0
 */
export type SandboxFilesystemConfig = typeof SandboxFilesystemConfig.Type;
/**
 * @since 0.0.0
 */
export type SandboxFilesystemConfigEncoded = typeof SandboxFilesystemConfig.Encoded;

const SandboxRipgrepConfig = S.Struct({
  command: S.String,
  args: S.optional(S.Array(S.String)),
});

/**
 * @since 0.0.0
 */
export const SandboxSettings = S.Struct({
  enabled: S.optional(S.Boolean),
  autoAllowBashIfSandboxed: S.optional(S.Boolean),
  allowUnsandboxedCommands: S.optional(S.Boolean),
  network: S.optional(SandboxNetworkConfig),
  filesystem: S.optional(SandboxFilesystemConfig),
  ignoreViolations: S.optional(SandboxIgnoreViolations),
  enableWeakerNestedSandbox: S.optional(S.Boolean),
  excludedCommands: S.optional(S.Array(S.String)),
  ripgrep: S.optional(SandboxRipgrepConfig),
}).annotate(
  $I.annote("SandboxSettings", {
    description: "Schema for SandboxSettings.",
  })
);

/**
 * @since 0.0.0
 */
export type SandboxSettings = typeof SandboxSettings.Type;
/**
 * @since 0.0.0
 */
export type SandboxSettingsEncoded = typeof SandboxSettings.Encoded;
