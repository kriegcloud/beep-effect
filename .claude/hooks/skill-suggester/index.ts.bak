#!/usr/bin/env bun
/**
 * UserPromptSubmit Hook - Lightweight Context Hints
 *
 * Provides minimal, non-redundant context on each prompt:
 * - hook_state: Timing info for debugging
 * - skills: Matched skills based on prompt keywords (when found)
 * - relevant-modules: Module search results (when found)
 * - available-scripts: Mise tasks (when script execution detected)
 * - version: Current package version
 *
 * NOTE: Rule reminders (critical_thinking, delegation, gates, etc.) are
 * intentionally NOT included here - they are already injected by SessionStart
 * and CLAUDE.md. Repeating them wastes tokens.
 *
 * @category Hooks
 * @since 2.0.0
 */

import { Effect, Console, pipe, Array, Record, Option, String } from "effect"
import { Terminal, FileSystem, Path, Command, CommandExecutor } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { UserPromptInput } from "../schemas"
import * as Schema from "effect/Schema"
import * as fs from "fs"

interface SkillMetadata {
  readonly name: string
  readonly keywords: ReadonlyArray<string>
}

interface HookState {
  readonly lastCallMs: number | null
}

const readHookState = (): HookState => {
  try {
    const content = fs.readFileSync(".claude/.hook-state.json", "utf-8")
    const parsed = JSON.parse(content)
    return { lastCallMs: typeof parsed.lastCallMs === "number" ? parsed.lastCallMs : null }
  } catch {
    return { lastCallMs: null }
  }
}

const writeHookState = (state: HookState): void => {
  try {
    fs.writeFileSync(".claude/.hook-state.json", JSON.stringify(state, null, 2), "utf-8")
  } catch (error) {
    // Silently fail if we can't write state
  }
}

const MiseTask = Schema.Struct({
  name: Schema.String,
  aliases: Schema.Array(Schema.String),
  description: Schema.String,
})

const MiseTasks = Schema.Array(MiseTask)

const formatMiseTasks = (tasks: typeof MiseTasks.Type): string =>
  Array.map(tasks, t => {
    const aliases = t.aliases.length > 0 ? ` (${t.aliases.join(", ")})` : ""
    return `${t.name}${aliases}: ${t.description}`
  }).join("\n")

const SCRIPT_TRIGGER_KEYWORDS = new Set([
  "run", "test", "build", "typecheck", "type check", "check", "dev",
  "start", "lint", "format", "ci", "mise", "script", "npm", "bun",
  "execute", "clean", "reset", "sync", "deploy", "preview", "commit"
])

const shouldShowMiseTasks = (prompt: string): boolean => {
  const lowered = prompt.toLowerCase()
  for (const keyword of SCRIPT_TRIGGER_KEYWORDS) {
    if (lowered.includes(keyword)) return true
  }
  return false
}

const fetchMiseTasks = (cwd: string) =>
  Effect.gen(function* () {
    const commandExecutor = yield* CommandExecutor.CommandExecutor

    const result = yield* pipe(
      Command.make("mise", "tasks", "--json"),
      Command.workingDirectory(cwd),
      Command.string,
      Effect.flatMap(s => Schema.decodeUnknown(Schema.parseJson(MiseTasks))(s)),
      Effect.map(formatMiseTasks),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    )

    return String.isNonEmpty(result) ? Option.some(result) : Option.none()
  })

const parseFrontmatter = (content: string): Record.ReadonlyRecord<string, string> => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)
  if (!match) return Record.empty()

  const frontmatter = match[1]
  const lines = String.split(frontmatter, "\n")

  const entries = Array.filterMap(lines, (line) =>
    pipe(
      line,
      String.indexOf(":"),
      Option.flatMap(colonIndex => {
        const key = pipe(line, String.slice(0, colonIndex), String.trim)
        const value = pipe(line, String.slice(colonIndex + 1), String.trim)
        return String.isNonEmpty(key) && String.isNonEmpty(value)
          ? Option.some([key, value] as const)
          : Option.none()
      })
    )
  )

  return Record.fromEntries(entries)
}

const extractKeywords = (text: string): ReadonlyArray<string> => {
  const commonWords = new Set([
    "the", "and", "for", "with", "using", "that", "this", "from",
    "are", "can", "will", "use", "used", "make", "makes", "create", "run"
  ])

  const lowercased = String.toLowerCase(text)
  const words = String.split(lowercased, /[\s,.-]+/)

  return Array.filter(words, word =>
    String.length(word) >= 3 && !commonWords.has(word)
  )
}

const OutputSchema = Schema.Struct({
  hookSpecificOutput: Schema.Struct({
    hookEventName: Schema.Literal("UserPromptSubmit"),
    additionalContext: Schema.String,
  }),
})

const readSkillFile = (skillPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const content = yield* fs.readFileString(skillPath)
    const frontmatter = parseFrontmatter(content)
    const name = frontmatter.name || path.basename(path.dirname(skillPath))
    const description = frontmatter.description || ""

    const nameKeywords = extractKeywords(name)
    const descKeywords = extractKeywords(description)
    const keywords = Array.dedupe(Array.appendAll(nameKeywords, descKeywords))

    return { name, keywords }
  })

const loadSkills = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const skillsDir = path.join(".claude", "skills")
  const exists = yield* fs.exists(skillsDir)

  if (!exists) return Array.empty<SkillMetadata>()

  const entries = yield* fs.readDirectory(skillsDir)
  const skillEffects = Array.map(entries, entry =>
    Effect.option(readSkillFile(path.join(skillsDir, entry, "SKILL.md")))
  )

  const skillOptions = yield* Effect.all(skillEffects, { concurrency: "unbounded" })
  return Array.getSomes(skillOptions)
})

const matchesKeyword = (prompt: string, keyword: string): boolean =>
  pipe(String.toLowerCase(prompt), String.includes(String.toLowerCase(keyword)))

const findMatchingSkills = (
  prompt: string,
  skills: ReadonlyArray<SkillMetadata>
): ReadonlyArray<string> =>
  Array.filterMap(skills, skill =>
    Array.some(skill.keywords, keyword => matchesKeyword(prompt, keyword))
      ? Option.some(skill.name)
      : Option.none()
  )

const searchModules = (prompt: string, cwd: string) =>
  Effect.gen(function* () {
    const commandExecutor = yield* CommandExecutor.CommandExecutor

    // Extract significant words from prompt for search
    const words = pipe(
      prompt,
      String.toLowerCase,
      String.split(/\s+/),
      Array.filter(w => String.length(w) >= 4)
    )

    if (!Array.isNonEmptyReadonlyArray(words)) return Option.none<string>()

    // Use first significant word as search pattern
    const pattern = words[0]

    const result = yield* pipe(
      Command.make("bun", ".claude/scripts/context-crawler.ts", "--search", pattern),
      Command.workingDirectory(cwd),
      Command.string,
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    )

    // Parse count from output
    const countMatch = result.match(/count="(\d+)"/)
    const count = countMatch ? parseInt(countMatch[1], 10) : 0

    if (count === 0) return Option.none<string>()

    return Option.some(result.trim())
  })

const formatOutput = (context: string) =>
  pipe(
    {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit" as const,
        additionalContext: context,
      },
    },
    Schema.encode(Schema.parseJson(OutputSchema))
  )

const program = Effect.gen(function* () {
  // File-based state tracking for debouncing
  const previousState = readHookState()
  const currentCallMs = Date.now()

  writeHookState({ lastCallMs: currentCallMs })

  const skills = yield* loadSkills
  const terminal = yield* Terminal.Terminal

  const stdin = yield* terminal.readLine
  const input = yield* Schema.decode(Schema.parseJson(UserPromptInput))(stdin)

  const matchingSkills = findMatchingSkills(input.prompt, skills)

  // Search for matching modules based on user input
  const moduleSearchResult = yield* searchModules(input.prompt, input.cwd)

  // Fetch mise tasks if prompt indicates script execution intent
  const miseTasksResult = shouldShowMiseTasks(input.prompt)
    ? yield* fetchMiseTasks(input.cwd)
    : Option.none<string>()

  // Build context parts
  const parts: string[] = []

  // Add hook state tracking
  const elapsedMs = previousState.lastCallMs ? currentCallMs - previousState.lastCallMs : 'n/a'
  parts.push(`<hook_state>
previous_call: ${previousState.lastCallMs ?? 'none'}
current_call: ${currentCallMs}
elapsed_ms: ${elapsedMs}
</hook_state>`)

  // Always show matched skills if any
  if (Array.isNonEmptyReadonlyArray(matchingSkills)) {
    parts.push(`<skills>${matchingSkills.join(", ")}</skills>`)
  }

  // Always show matching modules if found
  if (Option.isSome(moduleSearchResult)) {
    parts.push(`<relevant-modules>\n${moduleSearchResult.value}\n</relevant-modules>`)
  }

  // Show mise tasks when user indicates script execution intent
  if (Option.isSome(miseTasksResult)) {
    parts.push(`<available-scripts>
Run these with: mise run <task-name>
${miseTasksResult.value}
</available-scripts>`)
  }

  // Always: Show version
  const commandExecutor = yield* CommandExecutor.CommandExecutor
  const version = yield* pipe(
    Command.make("bun", "-e", "console.log(require('./package.json').version)"),
    Command.workingDirectory(input.cwd),
    Command.string,
    Effect.map(v => v.trim()),
    Effect.catchAll(() => Effect.succeed("unknown")),
    Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
  )
  parts.push(`<version>${version}</version>`)

  // Only output if we have content
  if (parts.length > 0) {
    const context = `<system-hints>\n${parts.join("\n")}\n</system-hints>`
    const formatted = yield* formatOutput(context)
    yield* Console.log(formatted)
  }
})

const runnable = pipe(
  program,
  Effect.provide(BunContext.layer),
  Effect.catchAll(() => Effect.void)
)

BunRuntime.runMain(runnable)
