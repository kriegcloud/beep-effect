/**
 * Lint policy command suite.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Console, Effect, FileSystem, HashSet, Inspectable, Path, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import madge from "madge";

const $I = $RepoCliId.create("commands/Lint");

const TOOLING_ROOT = "tooling/cli/src";
const RUNTIME_SCHEMA_FIRST_ROOTS = [TOOLING_ROOT, "packages/ai/sdk/src/core", ".claude/hooks"] as const;
const FOCUS_RUNTIME_FILES = HashSet.fromIterable([
  "packages/ai/sdk/src/core/AgentSdkConfig.ts",
  "packages/ai/sdk/src/core/SessionConfig.ts",
  "packages/ai/sdk/src/core/Diagnose.ts",
  "packages/ai/sdk/src/core/Storage/SessionIndexStore.ts",
  ".claude/hooks/schemas/index.ts",
  ".claude/hooks/skill-suggester/index.ts",
  ".claude/hooks/subagent-init/index.ts",
  ".claude/hooks/agent-init/index.ts",
  ".claude/hooks/pattern-detector/core.ts",
]);
const ALLOWED_NON_PASCAL_FILENAMES = HashSet.fromIterable(["index", "bin"]);
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

const lineNumberAt = (content: string, offset: number): number =>
  pipe(content, Str.slice(0, offset), Str.split("\n"), A.length);

const runRgFiles = (
  root: string
): Effect.Effect<ReadonlyArray<string>, never, ChildProcessSpawner.ChildProcessSpawner> =>
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const output = yield* spawner.string(ChildProcess.make("rg", ["--files", root], { cwd: process.cwd() })).pipe(
      Effect.catch(() =>
        Effect.gen(function* () {
          process.exitCode = 2;
          yield* Console.error("[lint] failed to enumerate files with ripgrep.");
          return "";
        })
      )
    );
    return pipe(output, Str.split("\n"), A.map(Str.trim), A.filter(Str.endsWith(".ts")));
  }).pipe(Effect.orElseSucceed(() => A.empty<string>()));

const runLintToolingTaggedErrors = Effect.fn(function* () {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const output = yield* spawner
    .string(
      ChildProcess.make(
        "rg",
        ["--line-number", "--glob", "tooling/*/src/**/*.ts", "\\bnew Error\\(|\\bthrow new Error\\(", "."],
        {
          cwd: process.cwd(),
        }
      )
    )
    .pipe(
      Effect.catch(() =>
        Effect.gen(function* () {
          process.exitCode = 2;
          yield* Console.error("[check-tooling-tagged-errors] failed to execute ripgrep.");
          return "";
        })
      )
    );

  if (Str.isNonEmpty(Str.trim(output))) {
    yield* Console.error(
      "[check-tooling-tagged-errors] native Error usage detected in tooling/*/src. Use S.TaggedErrorClass errors."
    );
    yield* Console.error(Str.trim(output));
    process.exitCode = 1;
    return;
  }

  yield* Console.log("[check-tooling-tagged-errors] OK: no native Error usage found in tooling/*/src.");
});

const runLintToolingSchemaFirst = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const filesByRoot = yield* Effect.forEach(RUNTIME_SCHEMA_FIRST_ROOTS, (root) => runRgFiles(root), {
    concurrency: "unbounded",
  });
  const files = pipe(filesByRoot, A.flatten, A.dedupe);
  const toolingFiles = A.filter(files, (file) => Str.startsWith(`${TOOLING_ROOT}/`)(file));
  const violations = A.empty<LintViolation>()

  for (const file of files) {
    const isToolingFile = Str.startsWith(`${TOOLING_ROOT}/`)(file);
    const isRuntimeFocusFile = HashSet.has(FOCUS_RUNTIME_FILES, file);
    if (!isToolingFile && !isRuntimeFocusFile) {
      continue;
    }

    const absolute = path.join(process.cwd(), file);
    const content = yield* fs.readFileString(absolute).pipe(Effect.orElseSucceed(() => ""));

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
    if (
      isToolingFile &&
      !HashSet.has(ALLOWED_NON_PASCAL_FILENAMES, basename) &&
      !/^[A-Z][A-Za-z0-9]*$/.test(basename)
    ) {
      pushViolation(
        "pascal-case-file",
        "Tooling CLI TypeScript files must use PascalCase names (except index.ts and bin.ts)."
      );
    }

    if (isToolingFile && /\bexport\s+interface\b/.test(content)) {
      pushViolation("export-interface", "Use schema classes or type aliases instead of exported interfaces.");
    }

    if (isToolingFile && /\bData\.taggedEnum\b|\bData\.TaggedEnum\b/.test(content)) {
      pushViolation("data-tagged-enum", "Use Schema tagged unions via LiteralKit + mapMembers + Tuple.evolve.");
    }

    if (/from\s+["']node:path["']/.test(content) || /require\(["']node:path["']\)/.test(content)) {
      pushViolation("node-path-import", "Use effect/Path service (`yield* Path.Path`) instead of node:path.");
    }

    if (/\bawait\s+fetch\s*\(|\breturn\s+fetch\s*\(|=\s*fetch\s*\(|\bglobalThis\.fetch\s*\(/.test(content)) {
      pushViolation(
        "native-fetch",
        "Use effect/unstable/http HttpClient and provide @effect/platform-bun/BunHttpClient.layer instead of native fetch."
      );
    }

    if (isToolingFile) {
      const serviceLinePattern = /ServiceMap\.Service</g;
      for (const match of content.matchAll(serviceLinePattern)) {
        const start = match.index ?? 0;
        const nearby = Str.slice(start, start + 320)(content);
        if (!/\(\)\(\s*\$I`/.test(nearby)) {
          pushViolation("service-id", "ServiceMap.Service tag must use $I`ServiceName` identity.", start);
        }
      }

      const classPattern = /S\.Class<[^>]+>\(\$I`[^`]+`\)\(/g;
      for (const match of content.matchAll(classPattern)) {
        const start = match.index ?? 0;
        const nearby = Str.slice(start, start + 2400)(content);
        if (!/\$I\.annote\(/.test(nearby)) {
          pushViolation("schema-annotation", "S.Class schema is missing $I.annote(...) metadata.", start);
        }
      }
    }
  }

  for (const schemaName of REQUIRED_TAGGED_UNIONS) {
    const declarationPattern = new RegExp(`(?:export\\s+)?const\\s+${schemaName}\\s*=`);
    let found = false;

    for (const file of toolingFiles) {
      const absolute = path.join(process.cwd(), file);
      const content = yield* fs.readFileString(absolute).pipe(Effect.orElseSucceed(() => ""));
      const match = declarationPattern.exec(content);

      if (match === null) {
        continue;
      }

      found = true;
      const snippet = Str.slice(match.index, match.index + 1400)(content);
      if (
        !/\.mapMembers\(/.test(snippet) ||
        !/Tuple\.evolve\(/.test(snippet) ||
        !/\.pipe\(S\.toTaggedUnion\(/.test(snippet)
      ) {
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
    yield* Console.error(`[check-tooling-schema-first] found ${A.length(violations)} violation(s).`);
    for (const violation of violations) {
      yield* Console.error(`${violation.file}:${violation.line} [${violation.kind}] ${violation.detail}`);
    }
    process.exitCode = 1;
    return;
  }

  yield* Console.log("[check-tooling-schema-first] OK: tooling/cli schema-first checks passed.");
});

const runLintCircular = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const dirs = ["tooling/cli/src", "tooling/repo-utils/src", "tooling/codebase-search/src"];
  let hasCircular = false;

  for (const dir of dirs) {
    if (!(yield* fs.exists(dir))) {
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
          message: `Failed to analyze circular deps in ${dir}: ${Inspectable.toStringUnknown(cause, 0)}`,
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
            yield* Console.error(`  ${A.join(cycle, " -> ")}`);
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
