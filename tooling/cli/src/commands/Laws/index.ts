/**
 * Effect law command suite.
 *
 * @since 0.0.0
 * @module
 */

import path from "node:path";
import { parse } from "jsonc-parser";
import { $RepoCliId } from "@beep/identity/packages";
import { Console, Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { FileSystem } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { EffectImportRulesOptions, runEffectImportRules } from "./EffectImports.js";

const $I = $RepoCliId.create("commands/Laws");
const ALLOWLIST_PATH = "standards/effect-laws.allowlist.jsonc";

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
      S.withDecodingDefault(() => "")
    ),
  },
  $I.annote("EffectImportsCommandOptions", {
    description: "CLI options for effect import law command.",
  })
) {}

const parseExcludePaths = (excludeValue: string): ReadonlyArray<string> =>
  pipe(
    excludeValue.split(","),
    A.map((value) => value.trim()),
    A.filter((value) => value.length > 0)
  );

const validateAllowlist = (raw: unknown): ReadonlyArray<string> => {
  const diagnostics = [] as Array<string>;

  if (raw === null || typeof raw !== "object") {
    diagnostics.push("Allowlist root must be an object.");
    return diagnostics;
  }

  const maybeVersion = (raw as { version?: unknown }).version;
  if (!Number.isInteger(maybeVersion) || maybeVersion !== 1) {
    diagnostics.push("Allowlist version must be integer 1.");
  }

  const maybeEntries = (raw as { entries?: unknown }).entries;
  if (!A.isArray(maybeEntries)) {
    diagnostics.push("Allowlist entries must be an array.");
    return diagnostics;
  }

  for (let index = 0; index < maybeEntries.length; index += 1) {
    const entry = maybeEntries[index];
    const prefix = `entries[${String(index)}]`;

    if (entry === null || typeof entry !== "object") {
      diagnostics.push(`${prefix} must be an object.`);
      continue;
    }

    const value = entry as {
      rule?: unknown;
      file?: unknown;
      kind?: unknown;
      reason?: unknown;
      owner?: unknown;
      issue?: unknown;
      expiresOn?: unknown;
    };

    if (typeof value.rule !== "string" || value.rule.length === 0) {
      diagnostics.push(`${prefix}.rule must be a non-empty string.`);
    }
    if (typeof value.file !== "string" || value.file.length === 0) {
      diagnostics.push(`${prefix}.file must be a non-empty string.`);
    }
    if (typeof value.kind !== "string" || value.kind.length === 0) {
      diagnostics.push(`${prefix}.kind must be a non-empty string.`);
    }
    if (typeof value.reason !== "string" || value.reason.length === 0) {
      diagnostics.push(`${prefix}.reason must be a non-empty string.`);
    }
    if (typeof value.owner !== "string" || value.owner.length === 0) {
      diagnostics.push(`${prefix}.owner must be a non-empty string.`);
    }
    if (typeof value.issue !== "string" || value.issue.length === 0) {
      diagnostics.push(`${prefix}.issue must be a non-empty string.`);
    }

    if (value.expiresOn !== undefined) {
      const isDateString = typeof value.expiresOn === "string" && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value.expiresOn);
      if (!isDateString) {
        diagnostics.push(`${prefix}.expiresOn must be YYYY-MM-DD when provided.`);
      }
    }
  }

  return diagnostics;
};

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
    yield* Console.log(`[effect-laws-fix-imports] touched_files=${String(summary.touchedFiles)}`);
    yield* Console.log(`[effect-laws-fix-imports] alias_renamed=${String(summary.aliasRenamed)}`);
    yield* Console.log(`[effect-laws-fix-imports] stable_converted=${String(summary.stableConverted)}`);

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
    const absolutePath = path.resolve(process.cwd(), ALLOWLIST_PATH);

    const exists = yield* fs.exists(absolutePath);
    if (!exists) {
      yield* Console.error(`[laws-allowlist] missing file: ${ALLOWLIST_PATH}`);
      process.exitCode = 1;
      return;
    }

    const text = yield* fs.readFileString(absolutePath);
    const parseErrors = [] as Array<{ error: number; offset: number; length: number }>;
    const parsed = parse(text, parseErrors, {
      allowTrailingComma: true,
      disallowComments: false,
    });

    if (A.length(parseErrors) > 0) {
      yield* Console.error("[laws-allowlist] JSONC parse errors detected:");
      for (const parseError of parseErrors) {
        yield* Console.error(`- parse error at offset ${String(parseError.offset)}`);
      }
      process.exitCode = 1;
      return;
    }

    const diagnostics = validateAllowlist(parsed);
    if (A.length(diagnostics) > 0) {
      yield* Console.error(`[laws-allowlist] found ${String(A.length(diagnostics))} issue(s):`);
      for (const diagnostic of diagnostics) {
        yield* Console.error(`- ${diagnostic}`);
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
    yield* Console.log("- bun run beep laws allowlist-check");
  })
).pipe(
  Command.withDescription("Effect law validation and migration commands"),
  Command.withSubcommands([lawsEffectImportsCommand, lawsAllowlistCheckCommand])
);
