/**
 * Lint policy command suite.
 *
 * @since 0.0.0
 * @module
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { $RepoCliId } from "@beep/identity/packages";
import { Console, Effect, String as Str } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";
import madge from "madge";

const $I = $RepoCliId.create("commands/Lint");

const TOOLING_ROOT = "tooling/cli/src";
const ALLOWED_NON_PASCAL_FILENAMES = new Set(["index", "bin"]);
const REQUIRED_TAGGED_UNIONS = [
  "GenerationAction",
  "TsMorphMutation",
  "TsMorphMutationOutcome",
  "DocsSection",
  "TsconfigSyncRunOptions",
  "TsconfigSyncChange",
  "PlannedFileChange",
  "TsconfigSyncResult",
  "VersionCategoryReport",
  "VersionSyncOptions",
] as const;

/**
 * Lint violation report row.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class LintViolation extends S.Class<LintViolation>($I`LintViolation`)(
  {
    file: S.String,
    line: S.Number,
    kind: S.String,
    detail: S.String,
  },
  $I.annote("LintViolation", {
    description: "Lint violation report row.",
  })
) {}

class LintCircularAnalysisError extends S.TaggedErrorClass<LintCircularAnalysisError>($I`LintCircularAnalysisError`)(
  "LintCircularAnalysisError",
  {
    message: S.String,
  },
  $I.annote("LintCircularAnalysisError", {
    description: "Circular dependency analysis failed for a target directory.",
  })
) {}

const lineNumberAt = (content: string, offset: number): number => content.slice(0, offset).split("\n").length;

const runRgFiles = (root: string): Effect.Effect<ReadonlyArray<string>, never> =>
  Effect.sync(() => {
    const result = spawnSync("rg", ["--files", root], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    if (result.error) {
      console.error("[lint] failed to execute ripgrep.");
      console.error(result.error.message);
      process.exitCode = 2;
      return A.empty<string>();
    }

    if (result.status !== 0) {
      console.error("[lint] failed to enumerate files.");
      if (Str.isNonEmpty(Str.trim(result.stderr))) {
        console.error(Str.trim(result.stderr));
      }
      process.exitCode = result.status ?? 2;
      return A.empty<string>();
    }

    return result.stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith(".ts"));
  });

const runLintToolingTaggedErrors = Effect.fn(function* () {
  const result = spawnSync(
    "rg",
    ["--line-number", "--glob", "tooling/*/src/**/*.ts", "\\bnew Error\\(|\\bthrow new Error\\(", "."],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    }
  );

  if (result.error) {
    yield* Console.error("[check-tooling-tagged-errors] failed to execute ripgrep.");
    yield* Console.error(result.error.message);
    process.exitCode = 2;
    return;
  }

  if (result.status === 1) {
    yield* Console.log("[check-tooling-tagged-errors] OK: no native Error usage found in tooling/*/src.");
    return;
  }

  if (result.status === 0) {
    yield* Console.error(
      "[check-tooling-tagged-errors] native Error usage detected in tooling/*/src. Use S.TaggedErrorClass errors."
    );
    if (Str.trim(result.stdout).length > 0) {
      yield* Console.error(Str.trim(result.stdout));
    }
    process.exitCode = 1;
    return;
  }

  yield* Console.error("[check-tooling-tagged-errors] ripgrep exited unexpectedly.");
  if (Str.trim(result.stderr).length > 0) {
    yield* Console.error(Str.trim(result.stderr));
  }
  process.exitCode = result.status ?? 2;
});

const runLintToolingSchemaFirst = Effect.fn(function* () {
  const files = yield* runRgFiles(TOOLING_ROOT);
  const violations = [] as Array<LintViolation>;

  for (const file of files) {
    const absolute = path.join(process.cwd(), file);
    const content = readFileSync(absolute, "utf8");

    const pushViolation = (kind: string, detail: string, offset = 0): void => {
      violations.push(
        new LintViolation({
          file,
          line: lineNumberAt(content, offset),
          kind,
          detail,
        })
      );
    };

    const basename = path.basename(file, ".ts");
    if (!ALLOWED_NON_PASCAL_FILENAMES.has(basename) && !/^[A-Z][A-Za-z0-9]*$/.test(basename)) {
      pushViolation(
        "pascal-case-file",
        "Tooling CLI TypeScript files must use PascalCase names (except index.ts and bin.ts)."
      );
    }

    if (/\bexport\s+interface\b/.test(content)) {
      pushViolation("export-interface", "Use schema classes or type aliases instead of exported interfaces.");
    }

    if (/\bData\.taggedEnum\b|\bData\.TaggedEnum\b/.test(content)) {
      pushViolation("data-tagged-enum", "Use Schema tagged unions via LiteralKit + mapMembers + Tuple.evolve.");
    }

    const serviceLinePattern = /ServiceMap\.Service</g;
    for (const match of content.matchAll(serviceLinePattern)) {
      const start = match.index ?? 0;
      const nearby = content.slice(start, start + 320);
      if (!/\(\)\(\s*\$I`/.test(nearby)) {
        pushViolation("service-id", "ServiceMap.Service tag must use $I`ServiceName` identity.", start);
      }
    }

    const classPattern = /S\.Class<[^>]+>\(\$I`[^`]+`\)\(/g;
    for (const match of content.matchAll(classPattern)) {
      const start = match.index ?? 0;
      const nearby = content.slice(start, start + 560);
      if (!/\$I\.annote\(/.test(nearby)) {
        pushViolation("schema-annotation", "S.Class schema is missing $I.annote(...) metadata.", start);
      }
    }
  }

  for (const schemaName of REQUIRED_TAGGED_UNIONS) {
    const declarationPattern = new RegExp(`(?:export\\s+)?const\\s+${schemaName}\\s*=`);
    let found = false;

    for (const file of files) {
      const absolute = path.join(process.cwd(), file);
      const content = readFileSync(absolute, "utf8");
      const match = declarationPattern.exec(content);

      if (match === null) {
        continue;
      }

      found = true;
      const snippet = content.slice(match.index, match.index + 1400);
      if (!/\.mapMembers\(/.test(snippet) || !/Tuple\.evolve\(/.test(snippet) || !/\.pipe\(S\.toTaggedUnion\(/.test(snippet)) {
        violations.push(
          new LintViolation({
            file,
            line: lineNumberAt(content, match.index),
            kind: "tagged-union-pattern",
            detail: `${schemaName} must use LiteralKit + mapMembers + Tuple.evolve + S.toTaggedUnion.`,
          })
        );
      }
      break;
    }

    if (!found) {
      violations.push(
        new LintViolation({
          file: TOOLING_ROOT,
          line: 1,
          kind: "missing-schema",
          detail: `Expected tagged union schema '${schemaName}' was not found.`,
        })
      );
    }
  }

  if (A.length(violations) > 0) {
    yield* Console.error(`[check-tooling-schema-first] found ${String(A.length(violations))} violation(s).`);
    for (const violation of violations) {
      yield* Console.error(`${violation.file}:${String(violation.line)} [${violation.kind}] ${violation.detail}`);
    }
    process.exitCode = 1;
    return;
  }

  yield* Console.log("[check-tooling-schema-first] OK: tooling/cli schema-first checks passed.");
});

const runLintCircular = Effect.fn(function* () {
  const dirs = ["tooling/cli/src", "tooling/repo-utils/src", "tooling/codebase-search/src"];
  let hasCircular = false;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      yield* Console.warn(`Skipping missing directory: ${dir}`);
      continue;
    }

    const result = yield* Effect.tryPromise({
      try: () =>
        madge(dir, {
          fileExtensions: ["ts"],
          tsConfig: "tsconfig.json",
          detectiveOptions: { ts: { skipTypeImports: true } },
        }),
      catch: (cause) =>
        new LintCircularAnalysisError({
          message: `Failed to analyze circular deps in ${dir}: ${String(cause)}`,
        }),
    });

    const circular = result.circular();
    yield* A.match(circular, {
      onEmpty: () => Effect.void,
      onNonEmpty: (cycles) =>
        Effect.gen(function* () {
          hasCircular = true;
          yield* Console.error(`Circular dependencies in ${dir}:`);
          for (const cycle of cycles) {
            yield* Console.error(`  ${cycle.join(" -> ")}`);
          }
        }),
    });
  }

  if (hasCircular) {
    process.exitCode = 1;
    return;
  }

  yield* Console.log("No circular dependencies found.");
});

/**
 * Lint command for circular dependency checks.
 *
 * @since 0.0.0
 * @category UseCase
 */
const lintCircularCommand = Command.make("circular", {}, runLintCircular).pipe(
  Command.withDescription("Detect circular dependencies in tooling source directories")
);

/**
 * Lint command for enforcing tagged error usage.
 *
 * @since 0.0.0
 * @category UseCase
 */
const lintToolingTaggedErrorsCommand = Command.make("tooling-tagged-errors", {}, runLintToolingTaggedErrors).pipe(
  Command.withDescription("Check tooling source for native Error usage")
);

/**
 * Lint command for schema-first CLI conventions.
 *
 * @since 0.0.0
 * @category UseCase
 */
const lintToolingSchemaFirstCommand = Command.make("tooling-schema-first", {}, runLintToolingSchemaFirst).pipe(
  Command.withDescription("Check tooling/cli source for schema-first conventions")
);

/**
 * Lint command group.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const lintCommand = Command.make(
  "lint",
  {},
  Effect.fn(function* () {
    yield* Console.log("Lint commands:");
    yield* Console.log("- bun run beep lint circular");
    yield* Console.log("- bun run beep lint tooling-tagged-errors");
    yield* Console.log("- bun run beep lint tooling-schema-first");
  })
).pipe(
  Command.withDescription("Repository lint policy checks"),
  Command.withSubcommands([lintCircularCommand, lintToolingTaggedErrorsCommand, lintToolingSchemaFirstCommand])
);
