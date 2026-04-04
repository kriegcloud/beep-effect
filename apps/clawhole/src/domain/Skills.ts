/**
 * Skills configuration schemas for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw skills config surface into the
 * repository's schema-first conventions while preserving the original optional
 * field semantics and upstream validation bounds.
 *
 * @module @beep/clawhole/config/Skills
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { ArrayOfStrings, LiteralKit, NonNegativeInt, PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import { SecretInput } from "./Secrets.ts";

const $I = $ClawholeId.create("config/Skills");

const strictParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const SkillEnvironmentRecord = S.Record(S.String, S.String).pipe(
  $I.annoteSchema("SkillEnvironmentRecord", {
    description: "Environment variable overrides applied while loading or executing an individual skill entry.",
  })
);

const SkillArbitraryConfigRecord = S.Record(S.String, S.Unknown).pipe(
  $I.annoteSchema("SkillArbitraryConfigRecord", {
    description: "Arbitrary skill-specific configuration values keyed by setting name.",
  })
);

const SkillsAllowBundledList = ArrayOfStrings.pipe(
  $I.annoteSchema("SkillsAllowBundledList", {
    description: "Optional allowlist of bundled skill ids that remain enabled for loading.",
  })
);

const SkillsExtraDirs = ArrayOfStrings.pipe(
  $I.annoteSchema("SkillsExtraDirs", {
    description: "Additional filesystem directories scanned for workspace or managed skills.",
  })
);

const SkillsWatchDebounceMs = NonNegativeInt.pipe(
  $I.annoteSchema("SkillsWatchDebounceMs", {
    description: "Debounce window in milliseconds used when coalescing rapid skill file changes.",
  })
);

const SkillsMaxCandidatesPerRoot = PosInt.pipe(
  $I.annoteSchema("SkillsMaxCandidatesPerRoot", {
    description: "Positive limit for how many immediate child skill candidates may be considered under one root.",
  })
);

const SkillsMaxSkillsLoadedPerSource = PosInt.pipe(
  $I.annoteSchema("SkillsMaxSkillsLoadedPerSource", {
    description: "Positive limit for how many skills may be loaded from one source category.",
  })
);

const SkillsMaxSkillsInPrompt = NonNegativeInt.pipe(
  $I.annoteSchema("SkillsMaxSkillsInPrompt", {
    description: "Maximum number of skills that may be included in the model-facing skills prompt.",
  })
);

const SkillsMaxSkillsPromptChars = NonNegativeInt.pipe(
  $I.annoteSchema("SkillsMaxSkillsPromptChars", {
    description: "Maximum character budget allocated to the model-facing skills prompt block.",
  })
);

const SkillsMaxSkillFileBytes = NonNegativeInt.pipe(
  $I.annoteSchema("SkillsMaxSkillFileBytes", {
    description: "Maximum file size in bytes allowed for a `SKILL.md` definition to be considered loadable.",
  })
);

/**
 * Per-skill overrides for enablement, secret inputs, and provider-specific
 * configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SkillConfig extends S.Class<SkillConfig>($I`SkillConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the named skill entry is explicitly enabled or disabled.",
    }),
    apiKey: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Optional secret input used by the skill entry for provider authentication.",
    }),
    env: S.OptionFromOptionalKey(SkillEnvironmentRecord).annotateKey({
      description: "Optional environment variable overrides applied for the named skill entry.",
    }),
    config: S.OptionFromOptionalKey(SkillArbitraryConfigRecord).annotateKey({
      description: "Optional arbitrary configuration object passed through to the named skill entry.",
    }),
  },
  $I.annote("SkillConfig", {
    description:
      "Per-skill overrides for enablement, secret inputs, environment variables, and arbitrary configuration.",
    parseOptions: strictParseOptions,
  })
) {}

const SkillsEntriesRecord = S.Record(S.String, SkillConfig).pipe(
  $I.annoteSchema("SkillsEntriesRecord", {
    description: "Skill-entry overrides keyed by skill id.",
  })
);

/**
 * Loader controls for discovery and filesystem watching of skills.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SkillsLoadConfig extends S.Class<SkillsLoadConfig>($I`SkillsLoadConfig`)(
  {
    extraDirs: S.OptionFromOptionalKey(SkillsExtraDirs).annotateKey({
      description: "Additional skill directories to scan with lowest precedence during skills discovery.",
    }),
    watch: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether skill directories should be watched for changes and refreshed automatically.",
    }),
    watchDebounceMs: S.OptionFromOptionalKey(SkillsWatchDebounceMs).annotateKey({
      description: "Debounce window in milliseconds applied before reacting to rapid skill file changes.",
    }),
  },
  $I.annote("SkillsLoadConfig", {
    description: "Loader controls for extra skill directories and filesystem watch behavior.",
    parseOptions: strictParseOptions,
  })
) {}

/**
 * Supported package managers used when installing skills or their
 * dependencies.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SkillsNodeManager = LiteralKit(["npm", "pnpm", "yarn", "bun"] as const).pipe(
  $I.annoteSchema("SkillsNodeManager", {
    description: "Supported package managers used for skills installation workflows.",
  })
);

/**
 * Type of {@link SkillsNodeManager}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SkillsNodeManager = typeof SkillsNodeManager.Type;

/**
 * Installation preferences for managed skills.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SkillsInstallConfig extends S.Class<SkillsInstallConfig>($I`SkillsInstallConfig`)(
  {
    preferBrew: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether Homebrew should be preferred when resolving supported skill dependencies.",
    }),
    nodeManager: S.OptionFromOptionalKey(SkillsNodeManager).annotateKey({
      description: "Preferred JavaScript package manager used by skills installation workflows.",
    }),
  },
  $I.annote("SkillsInstallConfig", {
    description: "Installation preferences for managed skills and their dependencies.",
    parseOptions: strictParseOptions,
  })
) {}

/**
 * Safety and prompt-size limits for skills discovery and loading.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SkillsLimitsConfig extends S.Class<SkillsLimitsConfig>($I`SkillsLimitsConfig`)(
  {
    maxCandidatesPerRoot: S.OptionFromOptionalKey(SkillsMaxCandidatesPerRoot).annotateKey({
      description:
        "Maximum number of immediate child directories considered under one skills root before it is treated as suspicious.",
    }),
    maxSkillsLoadedPerSource: S.OptionFromOptionalKey(SkillsMaxSkillsLoadedPerSource).annotateKey({
      description: "Maximum number of skills that may be loaded from a single source category.",
    }),
    maxSkillsInPrompt: S.OptionFromOptionalKey(SkillsMaxSkillsInPrompt).annotateKey({
      description: "Maximum number of loaded skills that may be surfaced in the model-facing prompt.",
    }),
    maxSkillsPromptChars: S.OptionFromOptionalKey(SkillsMaxSkillsPromptChars).annotateKey({
      description: "Maximum approximate character count allocated to the model-facing skills prompt block.",
    }),
    maxSkillFileBytes: S.OptionFromOptionalKey(SkillsMaxSkillFileBytes).annotateKey({
      description: "Maximum allowed size in bytes for an individual `SKILL.md` definition.",
    }),
  },
  $I.annote("SkillsLimitsConfig", {
    description: "Safety and prompt-size limits for skills discovery, loading, and prompt generation.",
    parseOptions: strictParseOptions,
  })
) {}

/**
 * Top-level skills configuration for discovery, installation, limits, and
 * per-skill overrides.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { SkillsConfig } from "@beep/clawhole/config/Skills"
 *
 * const skills = S.decodeUnknownSync(SkillsConfig)({
 *   load: {
 *     watch: true,
 *     watchDebounceMs: 250
 *   },
 *   install: {
 *     nodeManager: "pnpm"
 *   },
 *   entries: {
 *     "repo-skill": {
 *       enabled: true,
 *       env: {
 *         OPENAI_BASE_URL: "https://api.openai.com/v1"
 *       }
 *     }
 *   }
 * })
 *
 * console.log(O.isSome(skills.load)) // true
 * console.log(O.isSome(skills.entries)) // true
 * ```
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SkillsConfig extends S.Class<SkillsConfig>($I`SkillsConfig`)(
  {
    allowBundled: S.OptionFromOptionalKey(SkillsAllowBundledList).annotateKey({
      description: "Optional allowlist restricting which bundled skills remain enabled for loading.",
    }),
    load: S.OptionFromOptionalKey(SkillsLoadConfig).annotateKey({
      description: "Loader controls for extra skill directories and filesystem watch behavior.",
    }),
    install: S.OptionFromOptionalKey(SkillsInstallConfig).annotateKey({
      description: "Installation preferences for managed skills and their dependencies.",
    }),
    limits: S.OptionFromOptionalKey(SkillsLimitsConfig).annotateKey({
      description: "Safety and prompt-size limits for skills discovery, loading, and prompt generation.",
    }),
    entries: S.OptionFromOptionalKey(SkillsEntriesRecord).annotateKey({
      description: "Per-skill overrides keyed by skill id.",
    }),
  },
  $I.annote("SkillsConfig", {
    description:
      "Top-level skills configuration for bundled allowlists, discovery, installation preferences, limits, and per-skill overrides.",
    parseOptions: strictParseOptions,
  })
) {}
