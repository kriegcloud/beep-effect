/**
 * Effect governance command suite.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Text } from "@beep/utils";
import { Console, Effect } from "effect";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { AllowlistCheckOptions, reportAllowlistCheckSummary, runAllowlistCheck } from "./AllowlistCheck.js";
import { EffectImportRulesOptions, runEffectImportRules } from "./EffectImports.js";
import { NoNativeRuntimeRulesOptions, runNoNativeRuntimeRules } from "./NoNativeRuntime.js";
import { runTerseEffectRules, TerseEffectRulesOptions } from "./TerseEffect.js";

const $I = $RepoCliId.create("commands/Laws");

/**
 * CLI options for effect import governance command.
 *
 * @category DomainModel
 * @since 0.0.0
 */
class EffectImportsCommandOptions extends S.Class<EffectImportsCommandOptions>($I`EffectImportsCommandOptions`)(
  {
    write: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    check: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    exclude: S.String.pipe(S.withConstructorDefault(Effect.succeed("")), S.withDecodingDefault(Effect.succeed(""))),
  },
  $I.annote("EffectImportsCommandOptions", {
    description: "CLI options for effect import governance command.",
  })
) {}

/**
 * CLI options for terse Effect style command.
 *
 * @category DomainModel
 * @since 0.0.0
 */
class TerseEffectCommandOptions extends S.Class<TerseEffectCommandOptions>($I`TerseEffectCommandOptions`)(
  {
    write: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    check: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    exclude: S.String.pipe(S.withConstructorDefault(Effect.succeed("")), S.withDecodingDefault(Effect.succeed(""))),
  },
  $I.annote("TerseEffectCommandOptions", {
    description: "CLI options for terse Effect style command.",
  })
) {}

/**
 * CLI options for native runtime parity checks.
 *
 * @category DomainModel
 * @since 0.0.0
 */
class NoNativeRuntimeCommandOptions extends S.Class<NoNativeRuntimeCommandOptions>($I`NoNativeRuntimeCommandOptions`)(
  {
    check: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    exclude: S.String.pipe(S.withConstructorDefault(Effect.succeed("")), S.withDecodingDefault(Effect.succeed(""))),
  },
  $I.annote("NoNativeRuntimeCommandOptions", {
    description: "CLI options for native runtime parity checks.",
  })
) {}

const parseExcludePaths = (excludeValue: string): ReadonlyArray<string> =>
  Text.splitCommaSeparatedTrimmed(excludeValue);

/**
 * CLI command for effect import style migration/check.
 *
 * @category UseCase
 * @since 0.0.0
 */
const lawsEffectImportsCommand = Command.make(
  "effect-imports",
  {
    write: Flag.boolean("write").pipe(Flag.withDescription("Persist import rewrites to disk")),
    check: Flag.boolean("check").pipe(Flag.withDescription("Fail when any rewrite is required")),
    exclude: Flag.string("exclude").pipe(
      Flag.withDescription("Comma-separated list of file paths to exclude"),
      Flag.withDefault("")
    ),
  },
  Effect.fn(function* ({ write, check, exclude }) {
    const options = new EffectImportsCommandOptions({ write, check, exclude });
    const summary = yield* runEffectImportRules(
      new EffectImportRulesOptions({
        write: options.write,
        strictCheck: options.check,
        excludePaths: parseExcludePaths(options.exclude),
      })
    );

    const mode = options.write ? "write" : "dry-run";
    yield* Console.log(`[effect-governance-imports] mode=${mode}`);
    yield* Console.log(`[effect-governance-imports] touched_files=${summary.touchedFiles}`);
    yield* Console.log(`[effect-governance-imports] alias_renamed=${summary.aliasRenamed}`);
    yield* Console.log(`[effect-governance-imports] stable_converted=${summary.stableConverted}`);

    if (!options.write) {
      yield* Console.log("[effect-governance-imports] Run with --write to persist changes.");
    }

    for (const filePath of summary.changedFiles) {
      yield* Console.log(filePath);
    }

    if (summary.strictFailure) {
      process.exitCode = 1;
    }
  })
).pipe(Command.withDescription("Check or rewrite Effect import style rules"));

/**
 * CLI command for terse Effect style migration/check.
 *
 * @category UseCase
 * @since 0.0.0
 */
const lawsTerseEffectCommand = Command.make(
  "terse-effect",
  {
    write: Flag.boolean("write").pipe(Flag.withDescription("Persist terse Effect rewrites to disk")),
    check: Flag.boolean("check").pipe(Flag.withDescription("Fail when terse Effect rewrites are required")),
    exclude: Flag.string("exclude").pipe(
      Flag.withDescription("Comma-separated list of file paths to exclude"),
      Flag.withDefault("")
    ),
  },
  Effect.fn(function* ({ write, check, exclude }) {
    const options = new TerseEffectCommandOptions({ write, check, exclude });
    const summary = yield* runTerseEffectRules(
      new TerseEffectRulesOptions({
        write: options.write,
        strictCheck: options.check,
        excludePaths: parseExcludePaths(options.exclude),
      })
    );

    const mode = options.write ? "write" : "dry-run";
    yield* Console.log(`[effect-governance-terse-effect] mode=${mode}`);
    yield* Console.log(`[effect-governance-terse-effect] touched_files=${summary.touchedFiles}`);
    yield* Console.log(`[effect-governance-terse-effect] helper_refs_simplified=${summary.helpersSimplified}`);
    yield* Console.log(`[effect-governance-terse-effect] thunk_helpers_simplified=${summary.thunkHelpersSimplified}`);
    yield* Console.log(`[effect-governance-terse-effect] flow_candidates_detected=${summary.flowCandidatesDetected}`);
    yield* Console.log(
      `[effect-governance-terse-effect] option_object_compaction_candidates_detected=${summary.optionObjectCompactionCandidatesDetected}`
    );
    yield* Console.log(
      `[effect-governance-terse-effect] nested_option_match_candidates_detected=${summary.nestedOptionMatchCandidatesDetected}`
    );
    yield* Console.log(
      `[effect-governance-terse-effect] nested_bool_match_candidates_detected=${summary.nestedBoolMatchCandidatesDetected}`
    );
    yield* Console.log(
      `[effect-governance-terse-effect] dual_overload_candidates_detected=${summary.dualOverloadCandidatesDetected}`
    );

    if (!options.write) {
      yield* Console.log("[effect-governance-terse-effect] Run with --write to persist changes.");
    }

    for (const filePath of summary.changedFiles) {
      yield* Console.log(filePath);
    }

    if (summary.strictFailure) {
      process.exitCode = 1;
    }
  })
).pipe(Command.withDescription("Check or rewrite terse Effect helper wrappers"));

/**
 * CLI command for repo-local native runtime governance checks.
 *
 * @category UseCase
 * @since 0.0.0
 */
const lawsNativeRuntimeCommand = Command.make(
  "native-runtime",
  {
    check: Flag.boolean("check").pipe(Flag.withDescription("Fail when hotspot-scope native-runtime violations remain")),
    exclude: Flag.string("exclude").pipe(
      Flag.withDescription("Comma-separated list of file paths to exclude"),
      Flag.withDefault("")
    ),
  },
  Effect.fn(function* ({ check, exclude }) {
    const options = new NoNativeRuntimeCommandOptions({ check, exclude });
    const summary = yield* runNoNativeRuntimeRules(
      new NoNativeRuntimeRulesOptions({
        strictCheck: options.check,
        excludePaths: parseExcludePaths(options.exclude),
      })
    );

    yield* Console.log(`[effect-governance-native-runtime] mode=${options.check ? "check" : "report"}`);
    yield* Console.log(`[effect-governance-native-runtime] scanned_files=${summary.scannedFiles}`);
    yield* Console.log(`[effect-governance-native-runtime] touched_files=${summary.touchedFiles}`);
    yield* Console.log(`[effect-governance-native-runtime] warnings=${summary.warningCount}`);
    yield* Console.log(`[effect-governance-native-runtime] errors=${summary.errorCount}`);

    for (const diagnostic of summary.diagnostics) {
      yield* Console.log(
        `- [${diagnostic.severity}] ${diagnostic.file}:${diagnostic.line}:${diagnostic.column} ${diagnostic.message}`
      );
    }

    if (summary.strictFailure) {
      process.exitCode = 1;
    }
  })
).pipe(Command.withDescription("Run repo-local no-native-runtime parity checks"));

/**
 * CLI command for validating Effect governance allowlist integrity.
 *
 * @category UseCase
 * @since 0.0.0
 */
const lawsAllowlistCheckCommand = Command.make(
  "allowlist-check",
  {},
  Effect.fn(function* () {
    const summary = yield* runAllowlistCheck(
      new AllowlistCheckOptions({
        cwd: process.cwd(),
      })
    );

    yield* reportAllowlistCheckSummary(summary);

    if (!summary.ok) {
      process.exitCode = 1;
    }
  })
).pipe(Command.withDescription("Validate the Effect governance allowlist document"));

/**
 * Laws command group.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const lawsCommand = Command.make(
  "laws",
  {},
  Effect.fn(function* () {
    yield* Console.log("Effect governance commands:");
    yield* Console.log("- bun run beep laws effect-imports --check");
    yield* Console.log("- bun run beep laws effect-imports --write");
    yield* Console.log("- bun run beep laws native-runtime --check");
    yield* Console.log("- bun run beep laws terse-effect --check");
    yield* Console.log("- bun run beep laws terse-effect --write");
    yield* Console.log("- bun run beep laws allowlist-check");
  })
).pipe(
  Command.withDescription("Effect governance validation and migration commands"),
  Command.withSubcommands([
    lawsEffectImportsCommand,
    lawsNativeRuntimeCommand,
    lawsTerseEffectCommand,
    lawsAllowlistCheckCommand,
  ])
);
