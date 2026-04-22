/**
 * Lint policy command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { normalizePath, TaggedErrorClass } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import { Console, Effect, FileSystem, HashSet, Inspectable, MutableHashSet, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command } from "effect/unstable/cli";
import madge from "madge";
import { isExcludedTypeScriptSourcePath } from "../Shared/TypeScriptSourceExclusions.ts";
import { lintSchemaFirstCommand } from "./SchemaFirst.ts";

const $I = $RepoCliId.create("commands/Lint");

const TOOLING_ROOT = "tooling/cli/src";
const RUNTIME_SCHEMA_FIRST_ROOTS = [TOOLING_ROOT, ".claude/hooks"] as const;
const FOCUS_RUNTIME_FILES = HashSet.fromIterable([
  "tooling/cli/src/commands/DocsAggregate.ts",
  "tooling/cli/src/commands/Lint/index.ts",
  "tooling/cli/src/commands/Laws/index.ts",
  "tooling/cli/src/commands/Laws/EffectImports.ts",
  "tooling/cli/src/commands/Laws/TerseEffect.ts",
  "tooling/cli/src/commands/Graphiti/internal/ProxyConfig.ts",
  "tooling/cli/src/commands/Graphiti/internal/ProxyServices.ts",
  "tooling/cli/src/commands/Graphiti/internal/ProxyRuntime.ts",
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
 * @example
 * ```ts
 * console.log("docgen metadata")
 * ```
 * @category models
 * @since 0.0.0
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

class LintCircularAnalysisError extends TaggedErrorClass<LintCircularAnalysisError>($I`LintCircularAnalysisError`)(
  "LintCircularAnalysisError",
  {
    message: S.String,
  },
  $I.annote("LintCircularAnalysisError", {
    description: "Circular dependency analysis failed for a target directory.",
  })
) {}

class LintFileDiscoveryError extends TaggedErrorClass<LintFileDiscoveryError>($I`LintFileDiscoveryError`)(
  "LintFileDiscoveryError",
  {
    message: S.String,
    root: S.String,
    path: S.String,
  },
  $I.annote("LintFileDiscoveryError", {
    description: "TypeScript file discovery failed for a lint root.",
  })
) {}

const lineNumberAt = (content: string, offset: number): number =>
  pipe(content, Str.slice(0, offset), Str.split("\n"), A.length);

const toLintFileDiscoveryError =
  (root: string, currentPath: string, action: string) =>
  (cause: unknown): LintFileDiscoveryError =>
    new LintFileDiscoveryError({
      message: `${action} "${currentPath}" while collecting TypeScript files under "${root}": ${Inspectable.toStringUnknown(
        cause,
        0
      )}`,
      root,
      path: currentPath,
    });

const isContainedLintPath = (path: Path.Path, root: string, candidate: string): boolean => {
  const relativeFromRoot = normalizePath(path.relative(root, candidate));

  return (
    relativeFromRoot === "" ||
    relativeFromRoot === "." ||
    (!path.isAbsolute(relativeFromRoot) && relativeFromRoot !== ".." && !Str.startsWith("../")(relativeFromRoot))
  );
};

/**
 * Collect TypeScript source files under a lint root without following symlink escapes.
 *
 * @param root - Root directory to scan for TypeScript sources.
 * @returns Sorted list of TypeScript source files under the lint root.
 * @example
 * ```ts
 * console.log("collectTypeScriptFiles")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const collectTypeScriptFiles = Effect.fn("Lint.collectTypeScriptFiles")(function* (
  root: string
): Effect.fn.Return<ReadonlyArray<string>, LintFileDiscoveryError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const exists = yield* fs
    .exists(root)
    .pipe(Effect.mapError(toLintFileDiscoveryError(root, root, "Failed to check directory")));

  if (!exists) {
    return A.empty<string>();
  }

  const rootResolvedPath = path.resolve(root);
  const canonicalRoot = yield* fs
    .realPath(root)
    .pipe(Effect.mapError(toLintFileDiscoveryError(root, root, "Failed to resolve canonical root path")));

  if (rootResolvedPath !== canonicalRoot) {
    return A.empty<string>();
  }

  const visitedCanonicalDirs = MutableHashSet.empty<string>();

  const walk = Effect.fn("Lint.collectTypeScriptFiles.walk")(function* (
    currentPath: string
  ): Effect.fn.Return<ReadonlyArray<string>, LintFileDiscoveryError, FileSystem.FileSystem | Path.Path> {
    const canonicalCurrentPath = yield* fs
      .realPath(currentPath)
      .pipe(Effect.mapError(toLintFileDiscoveryError(root, currentPath, "Failed to resolve canonical path")));

    if (!isContainedLintPath(path, canonicalRoot, canonicalCurrentPath)) {
      return A.empty<string>();
    }

    if (currentPath !== root && path.resolve(currentPath) !== canonicalCurrentPath) {
      return A.empty<string>();
    }

    if (MutableHashSet.has(visitedCanonicalDirs, canonicalCurrentPath)) {
      return A.empty<string>();
    }

    MutableHashSet.add(visitedCanonicalDirs, canonicalCurrentPath);

    const entries = yield* fs
      .readDirectory(currentPath)
      .pipe(Effect.mapError(toLintFileDiscoveryError(root, currentPath, "Failed to read directory")));

    let results = A.empty<string>();

    for (const entry of entries) {
      const candidate = path.join(currentPath, entry);
      const canonicalCandidate = yield* fs
        .realPath(candidate)
        .pipe(Effect.mapError(toLintFileDiscoveryError(root, candidate, "Failed to resolve canonical path")));
      const stat = yield* fs
        .stat(candidate)
        .pipe(Effect.mapError(toLintFileDiscoveryError(root, candidate, "Failed to stat path")));

      if (!isContainedLintPath(path, canonicalRoot, canonicalCandidate)) {
        continue;
      }

      const isSymlinkPath = path.resolve(candidate) !== canonicalCandidate;

      if (stat.type === "Directory") {
        if (isSymlinkPath) {
          continue;
        }
        if (isExcludedTypeScriptSourcePath(`${candidate}/`)) {
          continue;
        }
        results = A.appendAll(results, yield* walk(candidate));
        continue;
      }

      if (!isSymlinkPath && Str.endsWith(".ts")(entry) && !isExcludedTypeScriptSourcePath(candidate)) {
        results = A.append(results, candidate);
      }
    }

    return results;
  });

  return A.sort(yield* walk(root), Order.String);
});

const collectToolingSourceRoots = Effect.fn("Lint.collectToolingSourceRoots")(function* (): Effect.fn.Return<
  ReadonlyArray<string>,
  LintFileDiscoveryError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const toolingRoot = "tooling";
  const exists = yield* fs
    .exists(toolingRoot)
    .pipe(Effect.mapError(toLintFileDiscoveryError(toolingRoot, toolingRoot, "Failed to check directory")));

  if (!exists) {
    return A.empty<string>();
  }

  const entries = yield* fs
    .readDirectory(toolingRoot)
    .pipe(Effect.mapError(toLintFileDiscoveryError(toolingRoot, toolingRoot, "Failed to read directory")));

  let roots = A.empty<string>();

  for (const entry of entries) {
    const sourceRoot = path.join(toolingRoot, entry, "src");
    const sourceRootExists = yield* fs
      .exists(sourceRoot)
      .pipe(Effect.mapError(toLintFileDiscoveryError(toolingRoot, sourceRoot, "Failed to check directory")));

    if (sourceRootExists) {
      roots = A.append(roots, sourceRoot);
    }
  }

  return A.sort(roots, Order.String);
});

const recoverLintFileDiscovery = <A>(checkName: string, fallback: A) =>
  Effect.fn(function* (error: LintFileDiscoveryError): Effect.fn.Return<A, never, never> {
    process.exitCode = 2;
    yield* Console.error(`[${checkName}] ${error.message}`);
    return fallback;
  });

const runLintToolingTaggedErrors = Effect.fn("runLintToolingTaggedErrors")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const sourceRoots = yield* collectToolingSourceRoots().pipe(
    Effect.catchTag(
      "LintFileDiscoveryError",
      recoverLintFileDiscovery("check-tooling-tagged-errors", A.empty<string>())
    )
  );

  if (process.exitCode === 2) {
    return;
  }

  const filesByRoot = yield* Effect.forEach(sourceRoots, collectTypeScriptFiles, { concurrency: "unbounded" }).pipe(
    Effect.catchTag(
      "LintFileDiscoveryError",
      recoverLintFileDiscovery("check-tooling-tagged-errors", A.empty<ReadonlyArray<string>>())
    )
  );

  if (process.exitCode === 2) {
    return;
  }

  let violations = A.empty<string>();

  for (const file of pipe(filesByRoot, A.flatten, A.sort(Order.String))) {
    const content = yield* fs
      .readFileString(file)
      .pipe(
        Effect.mapError(toLintFileDiscoveryError(file, file, "Failed to read file")),
        Effect.catchTag("LintFileDiscoveryError", recoverLintFileDiscovery("check-tooling-tagged-errors", ""))
      );

    if (process.exitCode === 2) {
      return;
    }

    for (const match of content.matchAll(/\bnew Error\(/g)) {
      const line = lineNumberAt(content, match.index ?? 0);
      const lineText = pipe(Str.split("\n")(content), A.get(line - 1), O.getOrElse(thunkEmptyStr), Str.trim);
      violations = A.append(violations, `${file}:${line}:${lineText}`);
    }
  }

  if (A.isReadonlyArrayNonEmpty(violations)) {
    yield* Console.error(
      "[check-tooling-tagged-errors] native Error usage detected in tooling/*/src. Use TaggedErrorClass from @beep/schema."
    );
    yield* Console.error(A.join(violations, "\n"));
    process.exitCode = 1;
    return;
  }

  yield* Console.log("[check-tooling-tagged-errors] OK: no native Error usage found in tooling/*/src.");
});

const runLintToolingSchemaFirst = Effect.fn("runLintToolingSchemaFirst")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const filesByRoot = yield* Effect.forEach(RUNTIME_SCHEMA_FIRST_ROOTS, collectTypeScriptFiles, {
    concurrency: "unbounded",
  }).pipe(
    Effect.catchTag(
      "LintFileDiscoveryError",
      recoverLintFileDiscovery("check-tooling-schema-first", A.empty<ReadonlyArray<string>>())
    )
  );

  if (process.exitCode === 2) {
    return;
  }

  const files = pipe(filesByRoot, A.flatten, A.dedupe);
  const toolingFiles = A.filter(files, (file) => Str.startsWith(`${TOOLING_ROOT}/`)(file));
  let violations = A.empty<LintViolation>();

  for (const file of files) {
    const isToolingFile = Str.startsWith(`${TOOLING_ROOT}/`)(file);
    const isRuntimeFocusFile = HashSet.has(FOCUS_RUNTIME_FILES, file);
    if (!isToolingFile && !isRuntimeFocusFile) {
      continue;
    }

    const absolute = path.join(process.cwd(), file);
    const content = yield* fs.readFileString(absolute).pipe(Effect.orElseSucceed(thunkEmptyStr));

    const pushViolation = (kind: string, detail: string, offset = 0): void => {
      violations = A.append(
        violations,
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

    if (isRuntimeFocusFile) {
      if (
        /from\s+["']node:(?:fs|path|child_process)["']/.test(content) ||
        /require\(["']node:(?:fs|path|child_process)["']\)/.test(content)
      ) {
        pushViolation(
          "node-runtime-import",
          "Use Effect runtime services (FileSystem/Path/process) instead of node:* runtime imports in hotspot files."
        );
      }

      if (/\bawait\s+fetch\s*\(|\breturn\s+fetch\s*\(|=\s*fetch\s*\(|\bglobalThis\.fetch\s*\(/.test(content)) {
        pushViolation(
          "native-fetch",
          "Use effect/unstable/http HttpClient and provide @effect/platform-bun/BunHttpClient.layer instead of native fetch."
        );
      }

      const sortPattern = /\b([A-Za-z_$][\w$]*)\.sort\s*\(/g;
      for (const match of content.matchAll(sortPattern)) {
        const receiver = match[1];
        if (receiver !== "A") {
          pushViolation("native-sort", "Use A.sort with an explicit Order in hotspot runtime files.", match.index ?? 0);
        }
      }

      const stringMethodPattern = /\b([A-Za-z_$][\w$]*)\.(split|trim|startsWith|endsWith)\s*\(/g;
      for (const match of content.matchAll(stringMethodPattern)) {
        const receiver = match[1];
        const method = match[2];
        if (receiver !== "Str") {
          pushViolation(
            "string-method",
            `Use effect/String helpers or shared schema transforms instead of native .${method}(...) in hotspot files.`,
            match.index ?? 0
          );
        }
      }
    }

    if (isToolingFile) {
      const serviceLinePattern = /Context\.Service</g;
      for (const match of content.matchAll(serviceLinePattern)) {
        const start = match.index ?? 0;
        const nearby = Str.slice(start, start + 320)(content);
        if (!/\(\)\(\s*\$I`/.test(nearby)) {
          pushViolation("service-id", "Context.Service tag must use $I`ServiceName` identity.", start);
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
      const content = yield* fs.readFileString(absolute).pipe(Effect.orElseSucceed(thunkEmptyStr));
      const match = declarationPattern.exec(content);

      if (match === null) {
        continue;
      }

      found = true;
      const snippet = Str.slice(match.index, match.index + 1400)(content);
      const usesLiteralKitPattern =
        !/\.mapMembers\(/.test(snippet) ||
        !/Tuple\.evolve\(/.test(snippet) ||
        !/\.pipe\(S\.toTaggedUnion\(/.test(snippet);
      const usesTaggedUnionFallback =
        schemaName === "GenerationAction" && /S\.Union\(/.test(snippet) && /\.pipe\(S\.toTaggedUnion\(/.test(snippet);

      if (usesLiteralKitPattern && !usesTaggedUnionFallback) {
        violations = A.append(
          violations,
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
      violations = A.append(
        violations,
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

const runLintCircular = Effect.fn("runLintCircular")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const dirs = ["tooling/cli/src", "tooling/repo-utils/src"];
  let hasCircular = false;

  for (const dir of dirs) {
    if (!(yield* fs.exists(dir))) {
      yield* Console.log(`Skipping missing directory: ${dir}`);
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
      onNonEmpty: Effect.fn("Lint.circular.onNonEmpty")(function* (cycles) {
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
 * @example
 * ```ts
 * console.log("docgen metadata")
 * ```
 * @category utilities
 * @since 0.0.0
 */
const lintCircularCommand = Command.make("circular", {}, runLintCircular).pipe(
  Command.withDescription("Detect circular dependencies in tooling source directories")
);

/**
 * Lint command for enforcing tagged error usage.
 *
 * @example
 * ```ts
 * console.log("docgen metadata")
 * ```
 * @category utilities
 * @since 0.0.0
 */
const lintToolingTaggedErrorsCommand = Command.make("tooling-tagged-errors", {}, runLintToolingTaggedErrors).pipe(
  Command.withDescription("Check tooling source for native Error usage")
);

/**
 * Lint command for schema-first CLI conventions.
 *
 * @example
 * ```ts
 * console.log("docgen metadata")
 * ```
 * @category utilities
 * @since 0.0.0
 */
const lintToolingSchemaFirstCommand = Command.make("tooling-schema-first", {}, runLintToolingSchemaFirst).pipe(
  Command.withDescription("Check tooling/cli source for schema-first conventions")
);

/**
 * Lint command group.
 *
 * @example
 * ```ts
 * console.log("lintCommand")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const lintCommand = Command.make(
  "lint",
  {},
  Effect.fn(function* () {
    yield* Console.log("Lint commands:");
    yield* Console.log("- bun run beep lint circular");
    yield* Console.log("- bun run beep lint schema-first");
    yield* Console.log("- bun run beep lint tooling-tagged-errors");
    yield* Console.log("- bun run beep lint tooling-schema-first");
  })
).pipe(
  Command.withDescription("Repository lint policy checks"),
  Command.withSubcommands([
    lintCircularCommand,
    lintSchemaFirstCommand,
    lintToolingTaggedErrorsCommand,
    lintToolingSchemaFirstCommand,
  ])
);
