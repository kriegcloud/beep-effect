#!/usr/bin/env bun

/**
 * Context Crawler CLI
 *
 * Crawls the codebase to find all ai-context.md files and outputs a structured index.
 *
 * @category UseCase
 * @since 0.0.0
 */

import { thunkEmptyStr } from "@beep/utils";
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Console, Effect, FileSystem, HashSet, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type { PlatformError } from "effect/PlatformError";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";
import { provideLayerScoped } from "../internal/runtime.ts";

/**
 * Module context metadata
 */
interface ModuleContext {
  readonly content: string;
  readonly path: string;
  readonly source: ModuleSource;
  readonly summary: string;
}

/**
 * Parse TOML frontmatter from markdown content
 * Extracts content between --- markers
 */
const parseFrontmatter = (content: string): O.Option<string> => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = O.getOrNull(Str.match(frontmatterRegex)(content));
  return match === null ? O.none() : O.some(match[1]);
};

/**
 * Extract message from TOML [[docs]] section
 * Looks for: message = "..."
 */
const extractTomlMessage = (toml: string): O.Option<string> => {
  const messageRegex = /message\s*=\s*"([^"]*)"/;
  const match = O.getOrNull(Str.match(messageRegex)(toml));
  return match === null ? O.none() : O.some(match[1]);
};

/**
 * Extract first paragraph from markdown body (after frontmatter)
 */
const extractFirstParagraph = (content: string): O.Option<string> => {
  // Remove frontmatter
  const withoutFrontmatter = Str.replace(/^---\n[\s\S]*?\n---\n/, "")(content);

  // Split into lines and find first non-empty, non-heading line
  const lines = Str.split(withoutFrontmatter, "\n");

  return pipe(
    lines,
    A.findFirst((line) => {
      const trimmed = Str.trim(line);
      return Str.isNonEmpty(trimmed) && !Str.startsWith("#")(trimmed);
    }),
    O.map(Str.trim)
  );
};

/**
 * Extract Purpose section from markdown
 * Looks for: ## Purpose
 */
const extractPurposeSection = (content: string): O.Option<string> => {
  const purposeRegex = /## Purpose\n([^\n]+)/;
  const match = O.getOrNull(Str.match(purposeRegex)(content));
  return match === null ? O.none() : O.some(Str.trim(match[1]));
};

/**
 * Extract summary from ai-context.md content
 * Priority: TOML message > ## Purpose > first paragraph > fallback
 */
const extractSummary = (content: string, fallback: string): string => {
  return pipe(
    parseFrontmatter(content),
    O.flatMap(extractTomlMessage),
    O.orElse(() => extractPurposeSection(content)),
    O.orElse(() => extractFirstParagraph(content)),
    O.getOrElse(() => fallback)
  );
};

/**
 * Module source type
 */
type ModuleSource = "internal" | "external";

/**
 * Convert absolute file path to module path
 * /path/to/repo/apps/editor/ai-context.md -> apps/editor
 */
const toModulePath = (absolutePath: string, repoRoot: string): string => {
  const relative = Str.replace(`${repoRoot}/`, "")(absolutePath);
  return Str.replace("ai-context.md", ".")(Str.replace("/ai-context.md", "")(relative));
};

/**
 * Parse .gitmodules to get submodule paths
 */
const parseGitmodules = (content: string): ReadonlyArray<string> => {
  const pathRegex = /path\s*=\s*(.+)/g;
  const paths = A.empty<string>();
  let match: RegExpExecArray | null;
  while ((match = pathRegex.exec(content)) !== null) {
    paths.push(Str.trim(match[1]));
  }
  return paths;
};

/**
 * Load submodule paths from .gitmodules
 */
const loadSubmodulePaths = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  const exists = yield* fs.exists(".gitmodules");
  if (!exists) return A.empty<string>();

  const content = yield* Effect.orElseSucceed(fs.readFileString(".gitmodules"), thunkEmptyStr);

  return parseGitmodules(content);
});

/**
 * Determine if module is internal or external (submodule = external)
 */
const getModuleSource = (modulePath: string, submodulePaths: ReadonlyArray<string>): ModuleSource => {
  const isSubmodule = submodulePaths.some((subPath) => modulePath === subPath || modulePath.startsWith(`${subPath}/`));
  return isSubmodule ? "external" : "internal";
};

/**
 * Find all ai-context.md files recursively
 * Excludes node_modules, .git, dist directories
 */
const findContextFiles = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const repoRoot = process.cwd();
  const excludeDirs = HashSet.fromIterable(["node_modules", ".git", "dist", ".turbo", "build"]);

  const searchDir: (dir: string) => Effect.Effect<Array<string>, PlatformError, FileSystem.FileSystem | Path.Path> =
    Effect.fn("searchDir")(function* (dir: string) {
      const entries = yield* Effect.orElseSucceed(fs.readDirectory(dir), A.empty<string>);

      return yield* pipe(
        entries,
        A.map((entry) => {
          const fullPath = path.join(dir, entry);

          if (entry === "ai-context.md") {
            return Effect.succeed([fullPath]);
          }

          return fs.stat(fullPath).pipe(
            Effect.flatMap((stat) =>
              stat.type === "Directory" && !HashSet.has(excludeDirs, entry)
                ? Effect.suspend(() => searchDir(fullPath))
                : Effect.succeed(A.empty<string>())
            ),
            Effect.orElseSucceed(A.empty<string>)
          );
        }),
        Effect.all,
        Effect.map(A.flatten)
      );
    });

  return yield* searchDir(repoRoot);
});

/**
 * Read and parse a single context file
 */
const readContextFile = Effect.fn("readContextFile")(function* (
  filePath: string,
  submodulePaths: ReadonlyArray<string>
) {
  const fs = yield* FileSystem.FileSystem;

  const content = yield* fs.readFileString(filePath);
  const repoRoot = process.cwd();
  const modulePath = toModulePath(filePath, repoRoot);
  const summary = extractSummary(content, modulePath);
  const source = getModuleSource(modulePath, submodulePaths);

  return {
    path: modulePath,
    summary,
    content,
    source,
  } satisfies ModuleContext;
});

/**
 * Load all context files
 */
const loadAllContexts = Effect.gen(function* () {
  const files = yield* findContextFiles;
  const submodulePaths = yield* loadSubmodulePaths;

  return yield* pipe(
    files,
    A.map((file) => Effect.option(readContextFile(file, submodulePaths))),
    Effect.all,
    Effect.map(A.getSomes)
  );
});

/**
 * Summary mode - compact one-line-per-module, grouped by source
 * External submodules are listed even without ai-context.md
 */
const summaryMode = Effect.gen(function* () {
  const contexts = yield* loadAllContexts;
  const submodulePaths = yield* loadSubmodulePaths;

  const internal = A.filter(contexts, (ctx) => ctx.source === "internal");
  const externalWithContext = A.filter(contexts, (ctx) => ctx.source === "external");

  // Get submodule paths that don't have ai-context.md (no summary)
  const externalPaths = HashSet.fromIterable(externalWithContext.map((ctx) => ctx.path));
  const externalWithoutContext = pipe(
    submodulePaths,
    A.filter((path) => !HashSet.has(externalPaths, path))
  );

  const totalExternal = A.length(externalWithContext) + A.length(externalWithoutContext);
  const count = A.length(internal) + totalExternal;

  yield* Console.log(`<modules count="${count}">`);

  if (!A.isArrayEmpty(internal)) {
    yield* Console.log(`<internal count="${A.length(internal)}">`);
    yield* pipe(
      internal,
      A.map((ctx) => Console.log(`${ctx.path}: ${ctx.summary}`)),
      Effect.all,
      Effect.asVoid
    );
    yield* Console.log("</internal>");
  }

  if (totalExternal > 0) {
    yield* Console.log(`<external count="${totalExternal}">`);
    // External with ai-context.md (have summaries)
    yield* pipe(
      externalWithContext,
      A.map((ctx) => Console.log(`${ctx.path}: ${ctx.summary}`)),
      Effect.all,
      Effect.asVoid
    );
    // External submodules without ai-context.md (just paths, for grepping)
    yield* pipe(
      externalWithoutContext,
      A.map((path) => Console.log(`${path}: (grep for implementation details)`)),
      Effect.all,
      Effect.asVoid
    );
    yield* Console.log("</external>");
  }

  yield* Console.log("</modules>");
});

/**
 * List mode - module paths only
 */
const listMode = Effect.gen(function* () {
  const contexts = yield* loadAllContexts;

  yield* pipe(
    contexts,
    A.map((ctx) => Console.log(ctx.path)),
    Effect.all,
    Effect.asVoid
  );
});

/**
 * Module mode - full content of specific module (without frontmatter)
 */
const renderModule = Effect.fn("renderModule")(function* (ctx: ModuleContext) {
  const body = Str.replace(/^---\n[\s\S]*?\n---\n?/, "")(ctx.content);
  yield* Console.log(`<module path="${ctx.path}">`);
  yield* Console.log(Str.trim(body));
  yield* Console.log("</module>");
});

const moduleMode = Effect.fn("moduleMode")(function* (modulePath: string) {
  const contexts = yield* loadAllContexts;

  const context = pipe(
    contexts,
    A.findFirst((ctx) => ctx.path === modulePath)
  );

  yield* pipe(
    context,
    O.match({
      onNone: () => Console.error(`Module not found: ${modulePath}`),
      onSome: renderModule,
    })
  );
});

/**
 * Search mode - find modules matching a glob pattern
 */
const searchMode = Effect.fn("searchMode")(function* (pattern: string) {
  const contexts = yield* loadAllContexts;

  // Convert glob-like pattern to regex
  const regexPattern = Str.replace(/\?/g, ".")(Str.replace(/\*/g, ".*")(pattern));
  const regex = new RegExp(regexPattern, "i");

  const matches = pipe(
    contexts,
    A.filter((ctx) => regex.test(ctx.path) || regex.test(ctx.summary) || regex.test(ctx.content))
  );

  const count = A.length(matches);
  yield* Console.log(`<modules-search pattern="${pattern}" count="${count}">`);

  yield* pipe(
    matches,
    A.map((ctx) => Console.log(`[${ctx.source}] ${ctx.path}: ${ctx.summary}`)),
    Effect.all,
    Effect.asVoid
  );

  yield* Console.log("</modules-search>");
});

/**
 * CLI Command Definition
 */
const contextCrawler = Command.make(
  "context-crawler",
  {
    summary: Flag.boolean("summary").pipe(Flag.withDescription("Show compact one-line-per-module summary (default)")),
    list: Flag.boolean("list").pipe(Flag.withDescription("List all module paths only")),
    module: Flag.string("module").pipe(
      Flag.withDescription("Show full content of specific module (without frontmatter)"),
      Flag.optional
    ),
    search: Flag.string("search").pipe(
      Flag.withDescription("Search modules by pattern (glob-like, matches path/summary/content)"),
      Flag.optional
    ),
  },
  Effect.fn(function* ({ list, module, search }) {
    // Module mode takes precedence
    if (O.isSome(module)) {
      yield* moduleMode(module.value);
      return;
    }

    // Search mode
    if (O.isSome(search)) {
      yield* searchMode(search.value);
      return;
    }

    // List mode
    if (list) {
      yield* listMode;
      return;
    }

    // Summary mode (default)
    yield* summaryMode;
  })
);

/**
 * Main CLI runner
 */
const cli = Command.run(contextCrawler, {
  version: "1.0.0",
});

/**
 * Execute with graceful error handling
 * Exit code 0 even on errors
 */
const runnable = pipe(
  Effect.scoped(provideLayerScoped(cli, BunServices.layer)),
  Effect.catch((error) => Console.error(`Context crawler error: ${error}`).pipe(Effect.asVoid))
);

BunRuntime.runMain(runnable);
