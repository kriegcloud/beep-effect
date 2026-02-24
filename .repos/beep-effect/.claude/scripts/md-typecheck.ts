#!/usr/bin/env bun
import { Command, CommandExecutor, FileSystem, Path } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { PlatformError } from "@effect/platform/Error"
import { Array, Console, Data, Effect, pipe } from "effect"

// ============================================================================
// Data Types
// ============================================================================

class CodeBlock extends Data.TaggedClass("CodeBlock")<{
  sourceFile: string
  sourceLine: number
  language: "ts" | "tsx"
  content: string
  index: number
  nocheck: boolean
}> {}

interface CodeBlockLocation {
  sourceFile: string
  sourceLine: number
  tempFile: string
}

interface TypeError {
  sourceFile: string
  sourceLine: number
  sourceCol: number
  message: string
}

// ============================================================================
// Constants
// ============================================================================

// Create tsconfig content (extends path will be computed at runtime)
const createTsConfig = (tsconfigBasePath: string, projectRoot: string) => ({
  extends: tsconfigBasePath,
  compilerOptions: {
    noEmit: true,
    skipLibCheck: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    strict: true,
    baseUrl: projectRoot,
    paths: {
      "effect": [
        `${projectRoot}/.claude/node_modules/effect`,
        `${projectRoot}/node_modules/effect`,
      ],
      "effect/*": [
        `${projectRoot}/.claude/node_modules/effect/*`,
        `${projectRoot}/node_modules/effect/*`,
      ],
      "@effect/*": [
        `${projectRoot}/.claude/node_modules/@effect/*`,
        `${projectRoot}/node_modules/@effect/*`,
      ],
      "@effect-atom/*": [
        `${projectRoot}/.claude/node_modules/@effect-atom/*`,
        `${projectRoot}/node_modules/@effect-atom/*`,
      ],
      "@/*": [`${projectRoot}/src/*`],
    },
    typeRoots: [
      `${projectRoot}/node_modules/@types`,
      `${projectRoot}/.claude/node_modules/@types`,
    ],
  },
  include: ["./**/*.ts", "./**/*.tsx"],
})

// Directories to skip when crawling for markdown files
const SKIP_DIRECTORIES = new Set(["node_modules", "dist-types", ".git", "dist", "build"])

// ============================================================================
// File System Operations
// ============================================================================

const crawlMarkdownFiles = (
  dir: string
): Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const crawl = (currentDir: string): Effect.Effect<ReadonlyArray<string>, PlatformError> =>
      fs.readDirectory(currentDir).pipe(
        Effect.flatMap((entries) =>
          Effect.forEach(
            entries,
            (entry) =>
              Effect.gen(function* () {
                if (SKIP_DIRECTORIES.has(entry)) {
                  return []
                }
                const fullPath = path.join(currentDir, entry)
                const stat = yield* fs.stat(fullPath).pipe(Effect.orDie)
                if (stat.type === "Directory") {
                  return yield* Effect.suspend(() => crawl(fullPath))
                } else if (entry.endsWith(".md")) {
                  return [fullPath]
                }
                return []
              }),
            { concurrency: 100 }
          )
        ),
        Effect.map(Array.flatten)
      )

    return yield* crawl(dir)
  })

// ============================================================================
// Code Block Extraction
// ============================================================================

const extractCodeBlocks = (file: string, content: string): ReadonlyArray<CodeBlock> => {
  // Match code fences: ```typescript, ```ts, ```tsx with optional nocheck modifier
  const regex = /^```(typescript|ts|tsx)(?:\s+(nocheck))?\n([\s\S]*?)^```/gm
  const blocks: Array<CodeBlock> = []
  let match: RegExpExecArray | null
  let index = 0

  while ((match = regex.exec(content)) !== null) {
    const langTag = match[1]
    const modifier = match[2]
    const code = match[3]
    const language = langTag === "tsx" ? ("tsx" as const) : ("ts" as const)
    const nocheck = modifier === "nocheck"
    const sourceLine = content.substring(0, match.index).split("\n").length

    blocks.push(
      new CodeBlock({
        sourceFile: file,
        sourceLine,
        language,
        content: code,
        index: index++,
        nocheck,
      })
    )
  }

  return blocks
}

const extractAllCodeBlocks = (
  files: ReadonlyArray<string>
): Effect.Effect<ReadonlyArray<CodeBlock>, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const allBlocks = yield* Effect.forEach(
      files,
      (file) =>
        Effect.gen(function* () {
          const content = yield* fs.readFileString(file).pipe(Effect.orDie)
          return extractCodeBlocks(file, content)
        }),
      { concurrency: "unbounded" }
    )

    return Array.flatten(allBlocks)
  })

// ============================================================================
// Output File Generation
// ============================================================================

const generateOutputFileName = (block: CodeBlock, path: Path.Path): string => {
  const basename = path.basename(block.sourceFile, ".md")
  const parts = block.sourceFile.split(path.sep)
  const relevantParts = parts.slice(-3, -1).join("_")
  const indexStr = String(block.index).padStart(4, "0")
  const ext = block.language === "tsx" ? ".tsx" : ".ts"
  return `block_${indexStr}_${relevantParts}_${basename}${ext}`
}

const writeCodeBlocksToOutput = (
  outputDir: string,
  tsconfigBasePath: string,
  projectRoot: string,
  blocks: ReadonlyArray<CodeBlock>
): Effect.Effect<ReadonlyArray<CodeBlockLocation>, never, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    // Ensure output directory exists
    yield* fs.makeDirectory(outputDir, { recursive: true }).pipe(Effect.orDie)

    // Write tsconfig.json that extends the project's root config
    const tsconfig = createTsConfig(tsconfigBasePath, projectRoot)
    yield* fs
      .writeFileString(path.join(outputDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2))
      .pipe(Effect.orDie)

    // Write code blocks AS-IS - users must provide valid TypeScript with all imports
    const locations = yield* Effect.forEach(
      blocks,
      (block) =>
        Effect.gen(function* () {
          const outputFileName = generateOutputFileName(block, path)
          const outputFilePath = path.join(outputDir, outputFileName)
          yield* fs.writeFileString(outputFilePath, block.content).pipe(Effect.orDie)

          return {
            sourceFile: block.sourceFile,
            sourceLine: block.sourceLine,
            tempFile: outputFileName,
          } satisfies CodeBlockLocation
        }),
      { concurrency: "unbounded" }
    )

    return locations
  })

// ============================================================================
// TypeScript Type Checking
// ============================================================================

const runTypeCheck = (
  outputDir: string
): Effect.Effect<string, never, CommandExecutor.CommandExecutor> =>
  Effect.gen(function* () {
    const command = pipe(
      Command.make("bunx", "tsc", "--project", "tsconfig.json", "--noEmit", "--pretty", "false"),
      Command.workingDirectory(outputDir)
    )

    // tsc returns non-zero exit code on type errors, but we still need the output
    const result = yield* pipe(
      Command.string(command),
      Effect.catchAll(() =>
        pipe(
          Command.make("bunx", "tsc", "--project", "tsconfig.json", "--noEmit", "--pretty", "false"),
          Command.workingDirectory(outputDir),
          Command.lines,
          Effect.map(Array.join("\n")),
          Effect.catchAll(() => Effect.succeed(""))
        )
      )
    )

    return result
  })

// ============================================================================
// Error Parsing and Mapping
// ============================================================================

const parseTypeScriptError = (
  line: string,
  locations: ReadonlyArray<CodeBlockLocation>
): TypeError | null => {
  // Parse: file.ts(line,col): error TSxxxx: message
  const match = /^(.+?)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)$/.exec(line)
  if (!match) return null

  const [, tempFile, lineStr, colStr, message] = match
  const tempFileName = tempFile.split("/").pop() || tempFile
  const errorLine = parseInt(lineStr, 10)
  const errorCol = parseInt(colStr, 10)

  // Find the corresponding source location
  const location = locations.find((loc) => loc.tempFile === tempFileName)
  if (!location) return null

  // Map back to original line (add sourceLine offset for the code fence)
  const originalLine = errorLine + location.sourceLine

  return {
    sourceFile: location.sourceFile,
    sourceLine: originalLine,
    sourceCol: errorCol,
    message,
  }
}

const parseTypeScriptErrors = (
  output: string,
  locations: ReadonlyArray<CodeBlockLocation>
): ReadonlyArray<TypeError> => {
  const lines = output.split("\n")
  const errors: Array<TypeError> = []

  for (const line of lines) {
    const error = parseTypeScriptError(line, locations)
    if (error) {
      errors.push(error)
    }
  }

  return errors
}

// ============================================================================
// Main Program
// ============================================================================

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  // Step 1: Find all markdown files
  // Find .claude directory - either cwd is .claude/ or we need to look for it
  const cwd = process.cwd()
  const claudeDir = cwd.endsWith(".claude") ? cwd : path.join(cwd, ".claude")

  yield* Console.log(`Scanning ${claudeDir} for markdown files...`)
  const markdownFiles = yield* crawlMarkdownFiles(claudeDir)
  yield* Console.log(`Found ${markdownFiles.length} markdown files`)

  if (markdownFiles.length === 0) {
    yield* Console.log("No markdown files found")
    return 0
  }

  // Step 2: Extract all code blocks
  const allCodeBlocks = yield* extractAllCodeBlocks(markdownFiles)

  // Filter out nocheck blocks
  const nocheckCount = allCodeBlocks.filter((b) => b.nocheck).length
  const codeBlocks = allCodeBlocks.filter((b) => !b.nocheck)

  yield* Console.log(
    `Extracted ${allCodeBlocks.length} TypeScript code blocks (${nocheckCount} skipped with nocheck)`
  )

  if (codeBlocks.length === 0) {
    yield* Console.log("No TypeScript code blocks to check")
    return 0
  }

  // Step 3: Create temporary directory and write files
  const outputDir = yield* fs.makeTempDirectory({ prefix: "md-typecheck-" })
  const projectRoot = claudeDir.replace("/.claude", "")
  const tsconfigBasePath = path.join(projectRoot, "tsconfig.base.json")

  yield* Console.log(`Writing code blocks to ${outputDir}...`)
  const locations = yield* writeCodeBlocksToOutput(outputDir, tsconfigBasePath, projectRoot, codeBlocks)

  // Step 4: Run type check using project's configuration
  yield* Console.log("Running TypeScript type-check...")
  const output = yield* runTypeCheck(outputDir)
  const result = parseTypeScriptErrors(output, locations)

  // Step 5: Report results
  yield* Console.log("")
  if (result.length === 0) {
    yield* Console.log(`✓ All ${codeBlocks.length} code blocks type-check successfully`)
    return 0
  }

  // Calculate statistics
  const errorsByFile = new Map<string, number>()

  for (const error of result) {
    const relPath = error.sourceFile.replace(claudeDir + "/", "").replace(claudeDir.replace("/.claude", "") + "/", "")
    errorsByFile.set(relPath, (errorsByFile.get(relPath) || 0) + 1)
  }

  // Sort by count descending
  const fileStats = [...errorsByFile.entries()].sort((a, b) => b[1] - a[1])

  // Print summary
  yield* Console.log(`✗ Found ${result.length} type errors in ${codeBlocks.length} code blocks`)
  yield* Console.log("")

  // Print errors by file
  yield* Console.log("═══════════════════════════════════════════════════════════════")
  yield* Console.log("  ERRORS BY FILE")
  yield* Console.log("═══════════════════════════════════════════════════════════════")
  yield* Console.log("")
  for (const [file, count] of fileStats) {
    const bar = "█".repeat(Math.min(Math.ceil(count / 2), 30))
    yield* Console.log(`  ${String(count).padStart(4)}  ${bar} ${file}`)
  }
  yield* Console.log("")

  // Print detailed errors (optional, controlled by flag)
  const showDetails = process.argv.includes("--details") || process.argv.includes("-d")
  if (showDetails) {
    yield* Console.log("═══════════════════════════════════════════════════════════════")
    yield* Console.log("  DETAILED ERRORS")
    yield* Console.log("═══════════════════════════════════════════════════════════════")
    yield* Console.log("")
    for (const error of result) {
      const relPath = error.sourceFile.replace(claudeDir + "/", "").replace(claudeDir.replace("/.claude", "") + "/", "")
      yield* Console.log(`  ${relPath}:${error.sourceLine}:${error.sourceCol}`)
      yield* Console.log(`    ${error.message}`)
    }
  } else {
    yield* Console.log("  (use --details or -d to see individual errors)")
  }

  return 1
})

// ============================================================================
// Entry Point
// ============================================================================

pipe(
  program,
  Effect.flatMap((exitCode) => Effect.sync(() => process.exit(exitCode))),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)
