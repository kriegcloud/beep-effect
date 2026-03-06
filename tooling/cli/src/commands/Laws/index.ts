/**
 * Effect law command suite.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { thunkEmptyStr } from "@beep/utils";
import { Console, Effect, FileSystem, Path, pipe, Result, SchemaIssue, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { parse } from "jsonc-parser";
import { EffectImportRulesOptions, runEffectImportRules } from "./EffectImports.js";
import { runTerseEffectRules, TerseEffectRulesOptions } from "./TerseEffect.js";

const $I = $RepoCliId.create("commands/Laws");
const ALLOWLIST_PATH = "standards/effect-laws.allowlist.jsonc";

const NonEmptyString = S.String.check(
  S.makeFilter((value) => value.length > 0 || "Expected non-empty string.")
).annotate(
  $I.annote("NonEmptyString", {
    description: "Non-empty string value used for effect-laws allowlist fields.",
  })
);

const DateYmdString = S.String.check(
  S.makeFilter((value) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || "Expected YYYY-MM-DD date string format.")
).annotate(
  $I.annote("DateYmdString", {
    description: "Calendar date string in YYYY-MM-DD format for allowlist expiration.",
  })
);

class EffectLawsAllowlistEntry extends S.Class<EffectLawsAllowlistEntry>($I`EffectLawsAllowlistEntry`)(
  {
    rule: NonEmptyString,
    file: NonEmptyString,
    kind: NonEmptyString,
    reason: NonEmptyString,
    owner: NonEmptyString,
    issue: NonEmptyString,
    expiresOn: S.optionalKey(S.UndefinedOr(DateYmdString)),
  },
  $I.annote("EffectLawsAllowlistEntry", {
    description: "Single allowlist entry describing a temporary exception for an Effect law.",
  })
) {}

class EffectLawsAllowlistDocument extends S.Class<EffectLawsAllowlistDocument>($I`EffectLawsAllowlistDocument`)(
  {
    version: S.Literal(1),
    entries: S.Array(EffectLawsAllowlistEntry).pipe(
      S.withConstructorDefault(() => O.some(A.empty<EffectLawsAllowlistEntry>())),
      S.withDecodingDefault(A.empty<EffectLawsAllowlistEntry>)
    ),
  },
  $I.annote("EffectLawsAllowlistDocument", {
    description: "Schema-backed allowlist document for custom Effect law exceptions.",
  })
) {}

const decodeEffectLawsAllowlist = S.decodeUnknownEffect(EffectLawsAllowlistDocument);

/**
 * CLI options for effect import law command.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class EffectImportsCommandOptions extends S.Class<EffectImportsCommandOptions>($I`EffectImportsCommandOptions`)(
  {
    write: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefault(() => false)
    ),
    check: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefault(() => false)
    ),
    exclude: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
  },
  $I.annote("EffectImportsCommandOptions", {
    description: "CLI options for effect import law command.",
  })
) {}

/**
 * CLI options for terse Effect style command.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class TerseEffectCommandOptions extends S.Class<TerseEffectCommandOptions>($I`TerseEffectCommandOptions`)(
  {
    write: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefault(() => false)
    ),
    check: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefault(() => false)
    ),
    exclude: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
  },
  $I.annote("TerseEffectCommandOptions", {
    description: "CLI options for terse Effect style command.",
  })
) {}

const parseExcludePaths = (excludeValue: string): ReadonlyArray<string> =>
  pipe(Str.split(",")(excludeValue), A.map(Str.trim), A.filter(Str.isNonEmpty));

/**
 * CLI command for effect import style migration/check.
 *
 * @since 0.0.0
 * @category UseCase
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
 * @since 0.0.0
 * @category UseCase
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
 * @since 0.0.0
 * @category UseCase
 */
const lawsAllowlistCheckCommand = Command.make(
  "allowlist-check",
  {},
  Effect.fn(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const absolutePath = path.resolve(process.cwd(), ALLOWLIST_PATH);

    const exists = yield* fs.exists(absolutePath);
    if (!exists) {
      yield* Console.error(`[laws-allowlist] missing file: ${ALLOWLIST_PATH}`);
      process.exitCode = 1;
      return;
    }

    const text = yield* fs.readFileString(absolutePath);
    const parseErrors = A.empty<{ error: number; offset: number; length: number }>();
    const parsed = parse(text, parseErrors, {
      allowTrailingComma: true,
      disallowComments: false,
    });

    if (A.length(parseErrors) > 0) {
      yield* Console.error("[laws-allowlist] JSONC parse errors detected:");
      for (const parseError of parseErrors) {
        yield* Console.error(`- parse error at offset ${parseError.offset}`);
      }
      process.exitCode = 1;
      return;
    }

    const decoded = yield* decodeEffectLawsAllowlist(parsed).pipe(
      Effect.map(() => Result.succeed<void>(undefined)),
      Effect.catch((error) =>
        Effect.succeed(Result.fail(SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues))
      )
    );

    if (Result.isFailure(decoded)) {
      yield* Console.error(`[laws-allowlist] found ${A.length(decoded.failure)} issue(s):`);
      for (const diagnostic of decoded.failure) {
        if (diagnostic.path) {
          const pathLabel =
            A.length(diagnostic.path) === 0 ? "<root>" : pipe(diagnostic.path, A.map(String), A.join("."));
          yield* Console.error(`- ${pathLabel}: ${diagnostic.message}`);
        }
      }
      process.exitCode = 1;
      return;
    }

    yield* Console.log("[laws-allowlist] OK");
  })
).pipe(Command.withDescription("Validate standards/effect-laws.allowlist.jsonc"));

/**
 * Laws command group.
 *
 * @since 0.0.0
 * @category UseCase
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
