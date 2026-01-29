#!/usr/bin/env bun
/**
 * Context Crawler CLI
 *
 * Crawls the codebase to find all ai-context.md files and outputs a structured index.
 *
 * @category Scripts
 * @since 1.0.0
 */

import { Args, Command, Options } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { FileSystem, Path } from "@effect/platform"
import type { PlatformError } from "@effect/platform/Error"
import { Array, Console, Effect, Option, pipe, String } from "effect"

/**
 * Module context metadata
 */
interface ModuleContext {
  readonly path: string
  readonly summary: string
  readonly content: string
  readonly source: ModuleSource
}

/**
 * Parse TOML frontmatter from markdown content
 * Extracts content between --- markers
 */
const parseFrontmatter = (content: string): Option.Option<string> => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)
  return match ? Option.some(match[1]) : Option.none()
}

/**
 * Extract message from TOML [[docs]] section
 * Looks for: message = "..."
 */
const extractTomlMessage = (toml: string): Option.Option<string> => {
  const messageRegex = /message\s*=\s*"([^"]*)"/
  const match = toml.match(messageRegex)
  return match ? Option.some(match[1]) : Option.none()
}

/**
 * Extract first paragraph from markdown body (after frontmatter)
 */
const extractFirstParagraph = (content: string): Option.Option<string> => {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, "")

  // Split into lines and find first non-empty, non-heading line
  const lines = String.split(withoutFrontmatter, "\n")

  return pipe(
    lines,
    Array.findFirst(line => {
      const trimmed = String.trim(line)
      return String.isNonEmpty(trimmed) && !String.startsWith("#")(trimmed)
    }),
    Option.map(String.trim)
  )
}

/**
 * Extract Purpose section from markdown
 * Looks for: ## Purpose
 */
const extractPurposeSection = (content: string): Option.Option<string> => {
  const purposeRegex = /## Purpose\n([^\n]+)/
  const match = content.match(purposeRegex)
  return match ? Option.some(String.trim(match[1])) : Option.none()
}

/**
 * Extract summary from ai-context.md content
 * Priority: TOML message > ## Purpose > first paragraph > fallback
 */
const extractSummary = (content: string, fallback: string): string => {
  return pipe(
    parseFrontmatter(content),
    Option.flatMap(extractTomlMessage),
    Option.orElse(() => extractPurposeSection(content)),
    Option.orElse(() => extractFirstParagraph(content)),
    Option.getOrElse(() => fallback)
  )
}

/**
 * Module source type
 */
type ModuleSource = "internal" | "external"

/**
 * Convert absolute file path to module path
 * /path/to/repo/apps/editor/ai-context.md -> apps/editor
 */
const toModulePath = (absolutePath: string, repoRoot: string): string => {
  const relative = absolutePath.replace(repoRoot + "/", "")
  return relative.replace("/ai-context.md", "").replace("ai-context.md", ".")
}

/**
 * Parse .gitmodules to get submodule paths
 */
const parseGitmodules = (content: string): ReadonlyArray<string> => {
  const pathRegex = /path\s*=\s*(.+)/g
  const paths: string[] = []
  let match
  while ((match = pathRegex.exec(content)) !== null) {
    paths.push(match[1].trim())
  }
  return paths
}

/**
 * Load submodule paths from .gitmodules
 */
const loadSubmodulePaths = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  const exists = yield* fs.exists(".gitmodules")
  if (!exists) return Array.empty<string>()

  const content = yield* Effect.orElseSucceed(
    fs.readFileString(".gitmodules"),
    () => ""
  )

  return parseGitmodules(content)
})

/**
 * Determine if module is internal or external (submodule = external)
 */
const getModuleSource = (modulePath: string, submodulePaths: ReadonlyArray<string>): ModuleSource => {
  const isSubmodule = submodulePaths.some(subPath =>
    modulePath === subPath || modulePath.startsWith(subPath + "/")
  )
  return isSubmodule ? "external" : "internal"
}

/**
 * Find all ai-context.md files recursively
 * Excludes node_modules, .git, dist directories
 */
const findContextFiles = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const repoRoot = process.cwd()
  const excludeDirs = new Set(["node_modules", ".git", "dist", ".turbo", "build"])

  const searchDir: (dir: string) => Effect.Effect<
    Array<string>,
    PlatformError,
    FileSystem.FileSystem | Path.Path
  > = (dir) =>
    Effect.gen(function* () {
      const entries = yield* Effect.orElseSucceed(
        fs.readDirectory(dir),
        () => Array.empty<string>()
      )

      return yield* pipe(
        entries,
        Array.map(entry => {
          const fullPath = path.join(dir, entry)

          if (entry === "ai-context.md") {
            return Effect.succeed([fullPath])
          }

          return fs.stat(fullPath).pipe(
            Effect.flatMap(stat =>
              stat.type === "Directory" && !excludeDirs.has(entry)
                ? Effect.suspend(() => searchDir(fullPath))
                : Effect.succeed(Array.empty<string>())
            ),
            Effect.orElseSucceed(() => Array.empty<string>())
          )
        }),
        Effect.all,
        Effect.map(Array.flatten)
      )
    })

  return yield* searchDir(repoRoot)
})

/**
 * Read and parse a single context file
 */
const readContextFile = (filePath: string, submodulePaths: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* fs.readFileString(filePath)
    const repoRoot = process.cwd()
    const modulePath = toModulePath(filePath, repoRoot)
    const summary = extractSummary(content, modulePath)
    const source = getModuleSource(modulePath, submodulePaths)

    return {
      path: modulePath,
      summary,
      content,
      source
    } satisfies ModuleContext
  })

/**
 * Load all context files
 */
const loadAllContexts = Effect.gen(function* () {
  const files = yield* findContextFiles
  const submodulePaths = yield* loadSubmodulePaths

  const contexts = yield* pipe(
    files,
    Array.map(file => Effect.option(readContextFile(file, submodulePaths))),
    Effect.all,
    Effect.map(Array.getSomes)
  )

  return contexts
})

/**
 * Summary mode - compact one-line-per-module, grouped by source
 * External submodules are listed even without ai-context.md
 */
const summaryMode = Effect.gen(function* () {
  const contexts = yield* loadAllContexts
  const submodulePaths = yield* loadSubmodulePaths

  const internal = Array.filter(contexts, ctx => ctx.source === "internal")
  const externalWithContext = Array.filter(contexts, ctx => ctx.source === "external")

  // Get submodule paths that don't have ai-context.md (no summary)
  const externalPaths = new Set(externalWithContext.map(ctx => ctx.path))
  const externalWithoutContext = pipe(
    submodulePaths,
    Array.filter(path => !externalPaths.has(path))
  )

  const totalExternal = Array.length(externalWithContext) + Array.length(externalWithoutContext)
  const count = Array.length(internal) + totalExternal

  yield* Console.log(`<modules count="${count}">`)

  if (Array.isNonEmptyReadonlyArray(internal)) {
    yield* Console.log(`<internal count="${Array.length(internal)}">`)
    yield* pipe(
      internal,
      Array.map(ctx => Console.log(`${ctx.path}: ${ctx.summary}`)),
      Effect.all,
      Effect.asVoid
    )
    yield* Console.log("</internal>")
  }

  if (totalExternal > 0) {
    yield* Console.log(`<external count="${totalExternal}">`)
    // External with ai-context.md (have summaries)
    yield* pipe(
      externalWithContext,
      Array.map(ctx => Console.log(`${ctx.path}: ${ctx.summary}`)),
      Effect.all,
      Effect.asVoid
    )
    // External submodules without ai-context.md (just paths, for grepping)
    yield* pipe(
      externalWithoutContext,
      Array.map(path => Console.log(`${path}: (grep for implementation details)`)),
      Effect.all,
      Effect.asVoid
    )
    yield* Console.log("</external>")
  }

  yield* Console.log("</modules>")
})

/**
 * List mode - module paths only
 */
const listMode = Effect.gen(function* () {
  const contexts = yield* loadAllContexts

  yield* pipe(
    contexts,
    Array.map(ctx => Console.log(ctx.path)),
    Effect.all,
    Effect.asVoid
  )
})

/**
 * Module mode - full content of specific module (without frontmatter)
 */
const moduleMode = (modulePath: string) =>
  Effect.gen(function* () {
    const contexts = yield* loadAllContexts

    const context = pipe(
      contexts,
      Array.findFirst(ctx => ctx.path === modulePath)
    )

    yield* pipe(
      context,
      Option.match({
        onNone: () => Console.error(`Module not found: ${modulePath}`),
        onSome: ctx => Effect.gen(function* () {
          // Output just the content without frontmatter
          const body = ctx.content.replace(/^---\n[\s\S]*?\n---\n?/, "")
          yield* Console.log(`<module path="${ctx.path}">`)
          yield* Console.log(body.trim())
          yield* Console.log("</module>")
        })
      })
    )
  })

/**
 * Search mode - find modules matching a glob pattern
 */
const searchMode = (pattern: string) =>
  Effect.gen(function* () {
    const contexts = yield* loadAllContexts

    // Convert glob-like pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".")
    const regex = new RegExp(regexPattern, "i")

    const matches = pipe(
      contexts,
      Array.filter(ctx =>
        regex.test(ctx.path) ||
        regex.test(ctx.summary) ||
        regex.test(ctx.content)
      )
    )

    const count = Array.length(matches)
    yield* Console.log(`<modules-search pattern="${pattern}" count="${count}">`)

    yield* pipe(
      matches,
      Array.map(ctx => Console.log(`[${ctx.source}] ${ctx.path}: ${ctx.summary}`)),
      Effect.all,
      Effect.asVoid
    )

    yield* Console.log("</modules-search>")
  })

/**
 * CLI Command Definition
 */
const contextCrawler = Command.make(
  "context-crawler",
  {
    summary: Options.boolean("summary").pipe(
      Options.withDescription("Show compact one-line-per-module summary (default)")
    ),
    list: Options.boolean("list").pipe(
      Options.withDescription("List all module paths only")
    ),
    module: Options.text("module").pipe(
      Options.withDescription("Show full content of specific module (without frontmatter)"),
      Options.optional
    ),
    search: Options.text("search").pipe(
      Options.withDescription("Search modules by pattern (glob-like, matches path/summary/content)"),
      Options.optional
    )
  },
  ({ summary, list, module, search }) =>
    Effect.gen(function* () {
      // Module mode takes precedence
      if (Option.isSome(module)) {
        yield* moduleMode(module.value)
        return
      }

      // Search mode
      if (Option.isSome(search)) {
        yield* searchMode(search.value)
        return
      }

      // List mode
      if (list) {
        yield* listMode
        return
      }

      // Summary mode (default)
      yield* summaryMode
    })
)

/**
 * Main CLI runner
 */
const cli = Command.run(contextCrawler, {
  name: "context-crawler",
  version: "1.0.0"
})

/**
 * Execute with graceful error handling
 * Exit code 0 even on errors
 */
const runnable = pipe(
  cli(process.argv),
  Effect.provide(BunContext.layer),
  Effect.catchAll(error =>
    Console.error(`Context crawler error: ${error}`).pipe(
      Effect.map(() => void 0)
    )
  )
)

BunRuntime.runMain(runnable)
