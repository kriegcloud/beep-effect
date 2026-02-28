import * as Schema from "effect/Schema";
import { withIdentifier } from "./Annotations.js";

/**
 * @since 0.0.0
 */
export const SandboxNetworkConfig = withIdentifier(
  Schema.Struct({
    allowedDomains: Schema.optional(Schema.Array(Schema.String)),
    allowManagedDomainsOnly: Schema.optional(Schema.Boolean),
    allowUnixSockets: Schema.optional(Schema.Array(Schema.String)),
    allowAllUnixSockets: Schema.optional(Schema.Boolean),
    allowLocalBinding: Schema.optional(Schema.Boolean),
    httpProxyPort: Schema.optional(Schema.Number),
    socksProxyPort: Schema.optional(Schema.Number),
  }),
  "SandboxNetworkConfig"
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
export const SandboxIgnoreViolations = withIdentifier(
  Schema.Record(Schema.String, Schema.Array(Schema.String)),
  "SandboxIgnoreViolations"
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
export const SandboxFilesystemConfig = withIdentifier(
  Schema.Struct({
    allowWrite: Schema.optional(Schema.Array(Schema.String)),
    denyWrite: Schema.optional(Schema.Array(Schema.String)),
    denyRead: Schema.optional(Schema.Array(Schema.String)),
  }),
  "SandboxFilesystemConfig"
);

/**
 * @since 0.0.0
 */
export type SandboxFilesystemConfig = typeof SandboxFilesystemConfig.Type;
/**
 * @since 0.0.0
 */
export type SandboxFilesystemConfigEncoded = typeof SandboxFilesystemConfig.Encoded;

const SandboxRipgrepConfig = Schema.Struct({
  command: Schema.String,
  args: Schema.optional(Schema.Array(Schema.String)),
});

/**
 * @since 0.0.0
 */
export const SandboxSettings = withIdentifier(
  Schema.Struct({
    enabled: Schema.optional(Schema.Boolean),
    autoAllowBashIfSandboxed: Schema.optional(Schema.Boolean),
    allowUnsandboxedCommands: Schema.optional(Schema.Boolean),
    network: Schema.optional(SandboxNetworkConfig),
    filesystem: Schema.optional(SandboxFilesystemConfig),
    ignoreViolations: Schema.optional(SandboxIgnoreViolations),
    enableWeakerNestedSandbox: Schema.optional(Schema.Boolean),
    excludedCommands: Schema.optional(Schema.Array(Schema.String)),
    ripgrep: Schema.optional(SandboxRipgrepConfig),
  }),
  "SandboxSettings"
);

/**
 * @since 0.0.0
 */
export type SandboxSettings = typeof SandboxSettings.Type;
/**
 * @since 0.0.0
 */
export type SandboxSettingsEncoded = typeof SandboxSettings.Encoded;
