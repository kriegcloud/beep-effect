/**
 * Schema-first plugin configuration models for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw plugin config surface into the
 * repository's Effect schema conventions while preserving the documented wire
 * shape and optional-field semantics.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option";
 * import * as S from "effect/Schema";
 * import { PluginsConfig } from "@beep/clawhole/domain/Plugins";
 *
 * const decodePluginsConfig = S.decodeUnknownSync(PluginsConfig);
 *
 * const plugins = decodePluginsConfig({
 *   entries: {
 *     "voice-call": {
 *       hooks: {
 *         allowPromptInjection: false,
 *       },
 *     },
 *   },
 * });
 *
 * console.log(O.isSome(plugins.entries)); // true
 * ```
 *
 * @module @beep/clawhole/domain/Plugins
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("domain/Plugins");

const PluginIdList = S.Array(S.String).pipe(
  $I.annoteSchema("PluginIdList", {
    description: "An ordered list of plugin identifiers.",
  })
);

const PluginLoadPathList = S.Array(S.String).pipe(
  $I.annoteSchema("PluginLoadPathList", {
    description: "An ordered list of filesystem paths scanned for plugin bundles or extensions.",
  })
);

const PluginAllowedModelList = S.Array(S.String).pipe(
  $I.annoteSchema("PluginAllowedModelList", {
    description:
      'Allowed provider/model override targets for a trusted plugin subagent run, including the literal `"*"` when any model is intentionally allowed.',
  })
);

const PluginConfigRecord = S.Record(S.String, S.Unknown).pipe(
  $I.annoteSchema("PluginConfigRecord", {
    description: "A freeform plugin-defined configuration payload keyed by field name.",
  })
);

/**
 * Supported plugin install source identifiers.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const PluginInstallSource = LiteralKit(["npm", "archive", "path", "clawhub", "marketplace"]).pipe(
  $I.annoteSchema("PluginInstallSource", {
    description:
      "Supported plugin install source identifiers, including CLI-managed npm/archive/path/clawhub installs and marketplace-backed installs.",
  })
);

/**
 * Type of {@link PluginInstallSource}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type PluginInstallSource = typeof PluginInstallSource.Type;

/**
 * Supported ClawHub package family values recorded on plugin install metadata.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const PluginInstallClawhubFamily = LiteralKit(["code-plugin", "bundle-plugin"]).pipe(
  $I.annoteSchema("PluginInstallClawhubFamily", {
    description: "Supported ClawHub package family values recorded on plugin install metadata.",
  })
);

/**
 * Type of {@link PluginInstallClawhubFamily}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type PluginInstallClawhubFamily = typeof PluginInstallClawhubFamily.Type;

/**
 * Supported ClawHub package channel values recorded on plugin install metadata.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const PluginInstallClawhubChannel = LiteralKit(["official", "community", "private"]).pipe(
  $I.annoteSchema("PluginInstallClawhubChannel", {
    description: "Supported ClawHub package channel values recorded on plugin install metadata.",
  })
);

/**
 * Type of {@link PluginInstallClawhubChannel}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type PluginInstallClawhubChannel = typeof PluginInstallClawhubChannel.Type;

/**
 * Per-plugin typed hook policy controls.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class PluginHooksConfig extends S.Class<PluginHooksConfig>($I`PluginHooksConfig`)(
  {
    allowPromptInjection: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description:
        "Controls whether this plugin may mutate prompts through typed hooks. Set false to block `before_prompt_build` and ignore prompt-mutating fields from legacy `before_agent_start`, while preserving legacy model/provider override behavior.",
    }),
  },
  $I.annote("PluginHooksConfig", {
    description: "Per-plugin typed hook policy controls for core-enforced safety gates.",
  })
) {}

/**
 * Per-plugin subagent runtime controls for trusted model override behavior.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class PluginSubagentConfig extends S.Class<PluginSubagentConfig>($I`PluginSubagentConfig`)(
  {
    allowModelOverride: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description:
        "Explicitly allows this plugin to request provider/model overrides in background subagent runs. Keep false unless the plugin is trusted to steer model selection.",
    }),
    allowedModels: S.OptionFromOptionalKey(PluginAllowedModelList).annotateKey({
      description:
        'Allowed override targets for trusted plugin subagent runs as canonical `provider/model` refs. Use `"*"` only when you intentionally allow any model.',
    }),
  },
  $I.annote("PluginSubagentConfig", {
    description: "Per-plugin subagent runtime controls for model override trust and allowlists.",
  })
) {}

/**
 * Per-plugin configuration entry keyed by plugin identifier.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class PluginEntryConfig extends S.Class<PluginEntryConfig>($I`PluginEntryConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Per-plugin enablement override for a specific entry, applied on top of global plugin policy.",
    }),
    hooks: S.OptionFromOptionalKey(PluginHooksConfig).annotateKey({
      description: "Per-plugin typed hook policy controls for core-enforced safety gates.",
    }),
    subagent: S.OptionFromOptionalKey(PluginSubagentConfig).annotateKey({
      description: "Per-plugin subagent runtime controls for model override trust and allowlists.",
    }),
    config: S.OptionFromOptionalKey(PluginConfigRecord).annotateKey({
      description: "Plugin-defined configuration payload interpreted by that plugin's own schema and validation rules.",
    }),
  },
  $I.annote("PluginEntryConfig", {
    description:
      "Per-plugin settings keyed by plugin id, including enablement, typed safety controls, and plugin-defined config.",
  })
) {}

/**
 * Exclusive runtime slot ownership for plugins.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class PluginSlotsConfig extends S.Class<PluginSlotsConfig>($I`PluginSlotsConfig`)(
  {
    memory: S.OptionFromOptionalKey(S.String).annotateKey({
      description: 'Select the active memory plugin by id, or `"none"` to disable memory plugins.',
    }),
    contextEngine: S.OptionFromOptionalKey(S.String).annotateKey({
      description:
        "Selects the active context engine plugin by id so one plugin provides context orchestration behavior.",
    }),
  },
  $I.annote("PluginSlotsConfig", {
    description: "Selects which plugins own exclusive runtime slots so only one plugin provides each capability.",
  })
) {}

/**
 * Additional plugin loader paths beyond the built-in defaults.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class PluginsLoadConfig extends S.Class<PluginsLoadConfig>($I`PluginsLoadConfig`)(
  {
    paths: S.OptionFromOptionalKey(PluginLoadPathList).annotateKey({
      description: "Additional plugin files or directories scanned by the loader beyond built-in defaults.",
    }),
  },
  $I.annote("PluginsLoadConfig", {
    description: "Plugin loader configuration group for specifying filesystem paths where plugins are discovered.",
  })
) {}

/**
 * CLI-managed plugin install metadata keyed by plugin identifier.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class PluginInstallRecord extends S.Class<PluginInstallRecord>($I`PluginInstallRecord`)(
  {
    source: PluginInstallSource.annotateKey({
      description:
        'Install source identifier for this plugin record, such as `"npm"`, `"archive"`, `"path"`, `"clawhub"`, or `"marketplace"`.',
    }),
    spec: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Original npm spec used for install (if source is npm).",
    }),
    sourcePath: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Original archive/path used for install (if any).",
    }),
    installPath: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved install directory for the installed plugin bundle.",
    }),
    version: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Version recorded at install time (if available).",
    }),
    resolvedName: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved npm package name from the fetched artifact.",
    }),
    resolvedVersion: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved npm package version from the fetched artifact (useful for non-pinned specs).",
    }),
    resolvedSpec: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved exact npm spec (`<name>@<version>`) from the fetched artifact.",
    }),
    integrity: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved npm dist integrity hash for the fetched artifact (if reported by npm).",
    }),
    shasum: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved npm dist shasum for the fetched artifact (if reported by npm).",
    }),
    resolvedAt: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "ISO timestamp when npm package metadata was last resolved for this install record.",
    }),
    installedAt: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "ISO timestamp of last install or update.",
    }),
    clawhubUrl: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved ClawHub package URL recorded for a clawhub-backed install.",
    }),
    clawhubPackage: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Resolved ClawHub package identifier recorded for a clawhub-backed install.",
    }),
    clawhubFamily: S.OptionFromOptionalKey(PluginInstallClawhubFamily).annotateKey({
      description: "Recorded ClawHub package family for a clawhub-backed install.",
    }),
    clawhubChannel: S.OptionFromOptionalKey(PluginInstallClawhubChannel).annotateKey({
      description: "Recorded ClawHub release channel for a clawhub-backed install.",
    }),
    marketplaceName: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Marketplace display name recorded for marketplace-backed plugin installs (if available).",
    }),
    marketplaceSource: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Original marketplace source used to resolve the install (for example a repo path or Git URL).",
    }),
    marketplacePlugin: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Plugin entry name inside the source marketplace, used for later updates.",
    }),
  },
  $I.annote("PluginInstallRecord", {
    description:
      "CLI-managed install metadata used to locate and update plugin installs across npm, filesystem, ClawHub, and marketplace sources.",
  })
) {}

/**
 * Per-plugin configuration entries keyed by plugin identifier.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const PluginEntriesRecord = S.Record(S.String, PluginEntryConfig).pipe(
  $I.annoteSchema("PluginEntriesRecord", {
    description: "Per-plugin configuration entries keyed by plugin identifier.",
  })
);

/**
 * Type of {@link PluginEntriesRecord}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type PluginEntriesRecord = typeof PluginEntriesRecord.Type;

/**
 * Plugin install metadata records keyed by plugin identifier.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const PluginInstallsRecord = S.Record(S.String, PluginInstallRecord).pipe(
  $I.annoteSchema("PluginInstallsRecord", {
    description: "Plugin install metadata records keyed by plugin identifier.",
  })
);

/**
 * Type of {@link PluginInstallsRecord}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type PluginInstallsRecord = typeof PluginInstallsRecord.Type;

/**
 * Top-level plugin configuration for loader policy, plugin entries, and install metadata.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class PluginsConfig extends S.Class<PluginsConfig>($I`PluginsConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Enable or disable plugin or extension loading globally during startup and config reload.",
    }),
    allow: S.OptionFromOptionalKey(PluginIdList).annotateKey({
      description: "Optional allowlist of plugin ids; when set, only listed plugins are eligible to load.",
    }),
    deny: S.OptionFromOptionalKey(PluginIdList).annotateKey({
      description: "Optional denylist of plugin ids that are blocked even if allowlists or loader paths include them.",
    }),
    load: S.OptionFromOptionalKey(PluginsLoadConfig).annotateKey({
      description: "Plugin loader configuration group for specifying filesystem paths where plugins are discovered.",
    }),
    slots: S.OptionFromOptionalKey(PluginSlotsConfig).annotateKey({
      description: "Selects which plugins own exclusive runtime slots such as memory and context-engine behavior.",
    }),
    entries: S.OptionFromOptionalKey(PluginEntriesRecord).annotateKey({
      description:
        "Per-plugin settings keyed by plugin id, including enablement and plugin-specific runtime configuration payloads.",
    }),
    installs: S.OptionFromOptionalKey(PluginInstallsRecord).annotateKey({
      description: "CLI-managed install metadata used by plugin update flows to locate install sources.",
    }),
  },
  $I.annote("PluginsConfig", {
    description:
      "Top-level plugin configuration for enablement, discovery paths, slot ownership, per-plugin settings, and install metadata.",
  })
) {}
