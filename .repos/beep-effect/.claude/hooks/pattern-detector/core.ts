import { Effect, pipe, Array, Option, Config } from "effect"
import { FileSystem, Path } from "@effect/platform"
import * as Schema from "effect/Schema"
import picomatch from "picomatch"
import * as fs from "fs"
import { PatternFrontmatter, type PatternDefinition, PatternDefinition as PatternDefinitionSchema } from "../../patterns/schema"

const CACHE_TTL_MS = 30 * 60 * 1000

interface PatternCache {
  readonly loadedAt: number
  readonly directoryMtime: number
  readonly patterns: ReadonlyArray<PatternDefinition>
}

interface HookState {
  readonly lastCallMs: number
  readonly patternCache?: PatternCache
}

const STATE_PATH = ".claude/.hook-state.json"

const readHookState = (): HookState => {
  try {
    const content = fs.readFileSync(STATE_PATH, "utf-8")
    return JSON.parse(content)
  } catch {
    return { lastCallMs: Date.now() }
  }
}

const writeHookState = (state: HookState): void => {
  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8")
  } catch {
    // Silently fail if we can't write state
  }
}

const getDirectoryMtime = (dirPath: string): number => {
  try {
    const stat = fs.statSync(dirPath)
    return stat.mtimeMs
  } catch {
    return 0
  }
}

const getNewestMtimeRecursive = (dirPath: string): number => {
  let newest = getDirectoryMtime(dirPath)
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`
      if (entry.isDirectory()) {
        const subMtime = getNewestMtimeRecursive(fullPath)
        if (subMtime > newest) newest = subMtime
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const fileMtime = fs.statSync(fullPath).mtimeMs
        if (fileMtime > newest) newest = fileMtime
      }
    }
  } catch {
    // Ignore errors, use current newest
  }
  return newest
}

const validateCachedPatterns = (patterns: unknown): patterns is PatternDefinition[] => {
  if (!globalThis.Array.isArray(patterns)) return false
  return patterns.every(p =>
    typeof p === "object" && p !== null &&
    typeof p.name === "string" &&
    typeof p.pattern === "string" &&
    typeof p.body === "string"
  )
}

export const HookInput = Schema.Struct({
  hook_event_name: Schema.Literal("PreToolUse", "PostToolUse"),
  tool_name: Schema.String,
  tool_input: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
})

export type HookInput = Schema.Schema.Type<typeof HookInput>

const contentFields = ["command", "new_string", "content", "pattern", "query", "url", "prompt"] as const

export const getMatchableContent = (input: Record<string, unknown>): string =>
  pipe(
    contentFields,
    Array.findFirst((field) => typeof input[field] === "string"),
    Option.flatMap((field) => Option.fromNullable(input[field] as string)),
    Option.getOrElse(() => JSON.stringify(input)),
  )

export const getFilePath = (input: Record<string, unknown>): Option.Option<string> =>
  pipe(
    Option.fromNullable(input.file_path),
    Option.filter((v): v is string => typeof v === "string"),
  )

const parseYaml = (content: string): Record<string, unknown> => {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  return Object.fromEntries(
    match[1].split("\n")
      .map(line => line.match(/^(\w+):\s*["']?(.+?)["']?$/))
      .filter(Boolean)
      .map(m => [m![1], m![2]])
  )
}

const extractBody = (content: string): string =>
  content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim()

export const testRegex = (text: string, pattern: string): boolean => {
  try { return new globalThis.RegExp(pattern).test(text) } catch { return false }
}

export const testGlob = (filePath: string, glob: string): boolean => {
  try { return picomatch(glob)(filePath) } catch { return false }
}

const readPattern = (filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const content = yield* fs.readFileString(filePath)
    const fm = yield* Schema.decodeUnknown(PatternFrontmatter)(parseYaml(content)).pipe(Effect.option)
    return Option.map(fm, f => ({
      name: f.name,
      description: f.description,
      event: f.event,
      tool: f.tool,
      glob: f.glob,
      pattern: f.pattern,
      action: f.action,
      level: f.level,
      tag: f.tag,
      body: extractBody(content),
      filePath,
    } as PatternDefinition))
  })

const loadPatternsFromDisk = (root: string) =>
  Effect.gen(function* () {
    const fsService = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const walk = (dir: string): Effect.Effect<PatternDefinition[], never, FileSystem.FileSystem> =>
      Effect.gen(function* () {
        const entries = yield* fsService.readDirectory(dir).pipe(Effect.orElseSucceed(() => []))

        const processEntry = (entry: string) =>
          Effect.gen(function* () {
            const full = path.join(dir, entry)
            const stat = yield* fsService.stat(full).pipe(Effect.option)
            if (Option.isNone(stat)) return [] as PatternDefinition[]

            if (stat.value.type === "Directory") return yield* Effect.suspend(() => walk(full))

            if (entry.endsWith(".md")) {
              return yield* readPattern(full)
                .pipe(
                  Effect.option,
                  Effect.map(Option.flatten),
                  Effect.map(Option.match({
                    onNone: () => Array.empty<PatternDefinition>(),
                    onSome: (pattern) => [pattern],
                  }))
                )
            }

            return Array.empty<PatternDefinition>()
          })

        return yield* pipe(
          entries,
          Array.map(processEntry),
          Effect.all,
          Effect.map(Array.flatten),
        )
      })

    return yield* walk(root)
  })

const isCacheValid = (cache: PatternCache | undefined, currentMtime: number): boolean => {
  if (!cache) return false
  const now = Date.now()
  const cacheAge = now - cache.loadedAt
  if (cacheAge > CACHE_TTL_MS) return false
  if (cache.directoryMtime !== currentMtime) return false
  if (!validateCachedPatterns(cache.patterns)) return false
  return true
}

export const loadPatterns = Effect.gen(function* () {
  const fsService = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const configDir = yield* Config.string("CLAUDE_PROJECT_DIR").pipe(Config.withDefault("."))
  const cwd = process.cwd()
  const projectDir = cwd.endsWith(".claude") ? path.join(cwd, "..") : configDir
  const root = path.join(projectDir, ".claude", "patterns")

  if (!(yield* fsService.exists(root))) return [] as PatternDefinition[]

  const state = readHookState()
  const currentMtime = getNewestMtimeRecursive(root)

  if (isCacheValid(state.patternCache, currentMtime)) {
    return state.patternCache!.patterns as PatternDefinition[]
  }

  const patterns = yield* loadPatternsFromDisk(root)

  writeHookState({
    ...state,
    patternCache: {
      loadedAt: Date.now(),
      directoryMtime: currentMtime,
      patterns,
    },
  })

  return patterns
})

export const matches = (input: HookInput, p: PatternDefinition): boolean => {
  const filePath = pipe(getFilePath(input.tool_input), Option.getOrUndefined)
  const content = getMatchableContent(input.tool_input)

  return (
    p.event === input.hook_event_name &&
    testRegex(input.tool_name, p.tool) &&
    (!p.glob || !filePath || testGlob(filePath, p.glob)) &&
    testRegex(content, p.pattern)
  )
}

export const findMatches = (input: HookInput, patterns: PatternDefinition[]): PatternDefinition[] =>
  patterns.filter(p => matches(input, p))
