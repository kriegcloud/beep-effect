import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"

export const SandboxNetworkConfig = withIdentifier(
  Schema.Struct({
    allowedDomains: Schema.optional(Schema.Array(Schema.String)),
    allowUnixSockets: Schema.optional(Schema.Array(Schema.String)),
    allowAllUnixSockets: Schema.optional(Schema.Boolean),
    allowLocalBinding: Schema.optional(Schema.Boolean),
    httpProxyPort: Schema.optional(Schema.Number),
    socksProxyPort: Schema.optional(Schema.Number)
  }),
  "SandboxNetworkConfig"
)

export type SandboxNetworkConfig = typeof SandboxNetworkConfig.Type
export type SandboxNetworkConfigEncoded = typeof SandboxNetworkConfig.Encoded

export const SandboxIgnoreViolations = withIdentifier(
  Schema.Record({ key: Schema.String, value: Schema.Array(Schema.String) }),
  "SandboxIgnoreViolations"
)

export type SandboxIgnoreViolations = typeof SandboxIgnoreViolations.Type
export type SandboxIgnoreViolationsEncoded = typeof SandboxIgnoreViolations.Encoded

const SandboxRipgrepConfig = Schema.Struct({
  command: Schema.String,
  args: Schema.optional(Schema.Array(Schema.String))
})

export const SandboxSettings = withIdentifier(
  Schema.Struct({
    enabled: Schema.optional(Schema.Boolean),
    autoAllowBashIfSandboxed: Schema.optional(Schema.Boolean),
    allowUnsandboxedCommands: Schema.optional(Schema.Boolean),
    network: Schema.optional(SandboxNetworkConfig),
    ignoreViolations: Schema.optional(SandboxIgnoreViolations),
    enableWeakerNestedSandbox: Schema.optional(Schema.Boolean),
    excludedCommands: Schema.optional(Schema.Array(Schema.String)),
    ripgrep: Schema.optional(SandboxRipgrepConfig)
  }),
  "SandboxSettings"
)

export type SandboxSettings = typeof SandboxSettings.Type
export type SandboxSettingsEncoded = typeof SandboxSettings.Encoded
