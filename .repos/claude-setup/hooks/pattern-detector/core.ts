import { Effect, pipe, Array, Option, Config } from "effect"
import { FileSystem, Path } from "@effect/platform"
import * as Schema from "effect/Schema"
import picomatch from "picomatch"
import { PatternFrontmatter, type PatternDefinition } from "../../patterns/schema"

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

export const loadPatterns = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  // For tests running from .claude, detect and use parent as project root
  const configDir = yield* Config.string("CLAUDE_PROJECT_DIR").pipe(Config.withDefault("."))
  const cwd = process.cwd()
  const projectDir = cwd.endsWith(".claude") ? path.join(cwd, "..") : configDir
  const root = path.join(projectDir, ".claude", "patterns")

  if (!(yield* fs.exists(root))) return [] as PatternDefinition[]

  const walk = (dir: string): Effect.Effect<PatternDefinition[], never, FileSystem.FileSystem> =>
    Effect.gen(function* () {
      const entries = yield* fs.readDirectory(dir).pipe(Effect.orElseSucceed(() => []))

      const processEntry = (entry: string) =>
        Effect.gen(function* () {
          const full = path.join(dir, entry)
          const stat = yield* fs.stat(full).pipe(Effect.option)
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
