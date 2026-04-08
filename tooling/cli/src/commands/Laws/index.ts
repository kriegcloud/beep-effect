/**
 * Effect law command suite.
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
import { runTerseEffectRules, TerseEffectRulesOptions } from "./TerseEffect.js";

const $I = $RepoCliId.create("commands/Laws");

/**
 * CLI options for effect import law command.
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
    description: "CLI options for effect import law command.",
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
    yield* Console.log(`[effect-laws-fix-imports] mode=${mode}`);
    yield* Console.log(`[effect-laws-fix-imports] touched_files=${summary.touchedFiles}`);
    yield* Console.log(`[effect-laws-fix-imports] alias_renamed=${summary.aliasRenamed}`);
    yield* Console.log(`[effect-laws-fix-imports] stable_converted=${summary.stableConverted}`);

    if (!options.write) {
      yield* Console.log("[effect-laws-fix-imports] Run with --write to persist changes.");
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
    yield* Console.log(`[effect-laws-terse-effect] mode=${mode}`);
    yield* Console.log(`[effect-laws-terse-effect] touched_files=${summary.touchedFiles}`);
    yield* Console.log(`[effect-laws-terse-effect] helpers_simplified=${summary.helpersSimplified}`);

    if (!options.write) {
      yield* Console.log("[effect-laws-terse-effect] Run with --write to persist changes.");
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
 * CLI command for validating effect laws allowlist integrity.
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
).pipe(Command.withDescription("Validate standards/effect-laws.allowlist.jsonc"));

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
    yield* Console.log("Laws commands:");
    yield* Console.log("- bun run beep laws effect-imports --check");
    yield* Console.log("- bun run beep laws effect-imports --write");
    yield* Console.log("- bun run beep laws terse-effect --check");
    yield* Console.log("- bun run beep laws terse-effect --write");
    yield* Console.log("- bun run beep laws allowlist-check");
  })
).pipe(
  Command.withDescription("Effect law validation and migration commands"),
  Command.withSubcommands([lawsEffectImportsCommand, lawsTerseEffectCommand, lawsAllowlistCheckCommand])
);
