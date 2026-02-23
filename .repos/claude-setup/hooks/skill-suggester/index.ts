#!/usr/bin/env bun
/**
 * UserPromptSubmit Hook - System Reminder
 *
 * Provides contextual reminders on each prompt:
 * - Always: Relevant skills based on prompt keywords
 * - Probabilistic: Concurrency tips, available commands
 *
 * Uses HTML-like syntax for all context enhancements.
 *
 * @category Hooks
 * @since 1.0.0
 */

import { Effect, Console, pipe, Array, Record, Option, String, Order } from "effect"
import { Terminal, FileSystem, Path, Command, CommandExecutor } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import * as Schema from "effect/Schema"
import * as fs from "fs"

const LenientUserPromptInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.optionalWith(Schema.String, { default: () => "" }),
  cwd: Schema.String,
  permission_mode: Schema.optionalWith(Schema.String, { default: () => "default" }),
  hook_event_name: Schema.Literal("UserPromptSubmit"),
  prompt: Schema.optionalWith(Schema.String, { default: () => "" }),
  user_prompt: Schema.optionalWith(Schema.String, { default: () => "" }),
})

export interface SkillMetadata {
  readonly name: string
  readonly keywords: ReadonlyArray<string>
}

interface HookState {
  readonly lastCallMs: number | null
}

const readHookState = (cwd: string): HookState => {
  try {
    const statePath = `${cwd}/.claude/.hook-state.json`
    const content = fs.readFileSync(statePath, "utf-8")
    const parsed = JSON.parse(content)
    return { lastCallMs: typeof parsed.lastCallMs === "number" ? parsed.lastCallMs : null }
  } catch {
    return { lastCallMs: null }
  }
}

const writeHookState = (cwd: string, state: HookState): void => {
  try {
    const statePath = `${cwd}/.claude/.hook-state.json`
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8")
  } catch {
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

export const STOPWORDS = new Set([
  "the", "and", "for", "with", "using", "that", "this", "from",
  "are", "can", "will", "use", "used", "make", "makes", "create", "run",
  "effect", "service", "implement", "implementation", "design", "pattern", "patterns",
  "when", "working", "code", "type", "types", "build", "handle", "handling",
  "write", "writing", "module", "modules", "define", "defining"
])

export const extractKeywords = (text: string): ReadonlyArray<string> => {
  const lowercased = String.toLowerCase(text)
  const words = String.split(lowercased, /[\s,.-]+/)

  return Array.filter(words, word =>
    String.length(word) >= 3 && !STOPWORDS.has(word)
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

const loadSkills = (cwd: string) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const skillsDir = path.join(cwd, ".claude", "skills")
  const exists = yield* fs.exists(skillsDir)

  if (!exists) return Array.empty<SkillMetadata>()

  const entries = yield* fs.readDirectory(skillsDir)
  const skillEffects = Array.map(entries, entry =>
    Effect.option(readSkillFile(path.join(skillsDir, entry, "SKILL.md")))
  )

  const skillOptions = yield* Effect.all(skillEffects, { concurrency: "unbounded" })
  return Array.getSomes(skillOptions)
})

export const matchesWordBoundary = (prompt: string, word: string): boolean => {
  const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
  return pattern.test(prompt)
}

export const MAX_SUGGESTIONS = 5
export const MIN_SCORE = 2
export const NAME_MATCH_BOOST = 3
export const KEYWORD_MATCH_SCORE = 1

export const scoreSkill = (
  prompt: string,
  skill: SkillMetadata
): number => {
  const nameSegments = pipe(
    String.toLowerCase(skill.name),
    String.split(/-/)
  )

  const nameScore = pipe(
    nameSegments,
    Array.filter(seg => String.length(seg) >= 3),
    Array.filter(seg => matchesWordBoundary(prompt, seg)),
    Array.length,
    n => n * NAME_MATCH_BOOST
  )

  const keywordScore = pipe(
    skill.keywords,
    Array.filter(keyword => matchesWordBoundary(prompt, keyword)),
    Array.length,
    n => n * KEYWORD_MATCH_SCORE
  )

  return nameScore + keywordScore
}

export const findMatchingSkills = (
  prompt: string,
  skills: ReadonlyArray<SkillMetadata>
): ReadonlyArray<string> =>
  pipe(
    skills,
    Array.map(skill => ({ skill, score: scoreSkill(prompt, skill) })),
    Array.filter(({ score }) => score >= MIN_SCORE),
    Array.sort(Order.mapInput(Order.reverse(Order.number), (entry: { skill: SkillMetadata; score: number }) => entry.score)),
    Array.take(MAX_SUGGESTIONS),
    Array.map(({ skill }) => skill.name)
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
  const terminal = yield* Terminal.Terminal

  const stdin = yield* terminal.readLine
  const raw = yield* Schema.decode(Schema.parseJson(LenientUserPromptInput))(stdin)
  const prompt = raw.prompt || raw.user_prompt || ""
  const input = { ...raw, prompt }

  const previousState = readHookState(input.cwd)
  const currentCallMs = Date.now()
  writeHookState(input.cwd, { lastCallMs: currentCallMs })

  const skills = yield* loadSkills(input.cwd)
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

  // Thoughtful pushback when there's genuine signal
  parts.push(`<critical_thinking>
-- Genuine pushback (when there's signal)
pushBack :: Request → Maybe Concern
pushBack req
  | hasRisk req           = Just $ identifyRisk req
  | overEngineered req    = Just $ proposeSimpler req
  | unclear req           = Just $ askClarification req
  | betterWayKnown req    = Just $ suggestAlternative req
  | otherwise             = Nothing  -- proceed, don't manufacture objections

-- Root cause analysis (for bugs/fixes)
diagnose :: Problem → Effect Solution
diagnose problem = do
  symptoms ← observe problem
  rootCause ← analyze symptoms   -- type errors often mask deeper issues
  -- Don't jump to "layer issue" or "missing dependency"
  -- Understand the actual problem first

  when (stuckInLoop attempts) $ do
    log "Step back - multiple failed attempts suggest treating symptoms, not cause"
    reassess problem

-- Trust the type system (when not bypassed)
redundantConcern :: Concern → Bool
redundantConcern concern =
  caughtByTypeSystem concern || caughtByLinter concern

-- The compiler is a better bug-finder than speculation
-- Trust: tsc, eslint, Effect's typed errors
-- Don't: predict runtime bugs that would fail at compile time
-- Don't: suggest fixes for issues the types will catch anyway

-- UNLESS type safety was bypassed:
typeSystemBypassed :: Code → Bool
typeSystemBypassed code = any code
  [ "as any"
  , "as unknown"
  , "@ts-ignore"
  , "@ts-expect-error"
  , "// @ts-nocheck"
  ]
-- When escape hatches present → skepticism warranted
-- Question the cast, not the type system
</critical_thinking>`)

  // Forbidden tools reminder
  parts.push(`<FORBIDDEN_TOOLS>
NEVER USE BACKGROUND AGENTS IF YOU READ THEM:
- Background + wait → insane context waste (full output in context)
- Regular Parallel Agents → context efficient
- Background + other works → you cna use background agents if you genuinenly perform other work and dont sit and wait for output.

NEVER USE DIRECTLY:
- Read   → spawn agent to read
- Edit   → spawn agent to edit
- Write  → spawn agent to write
- Glob   → spawn agent to search
- Grep   → spawn agent to search

ALLOWED:
- Task (spawn agents) ← YOUR PRIMARY TOOL
- AskUserQuestion ← clarify with human
- TodoWrite ← track delegated work
- Bash ← gates (typecheck/test) - DELEGATE from orchestrators, run from implementation agents
</FORBIDDEN_TOOLS>`)

  // Fix loop detection
  parts.push(`<fix_loops>
-- Fix loops indicate symptom-chasing, not root cause understanding
inFixLoop :: [Attempt] → Bool
inFixLoop attempts = length attempts > 2 ∧ ¬progressing attempts

-- When in fix loop: step back, reassess, don't try harder
</fix_loops>`)

  // Delegation enforcement
  parts.push(`<DELEGATION_RULES>
handle :: Task → Effect ()
handle task = spawn agent task  -- ALWAYS. NO EXCEPTIONS.

-- "It's just one small edit" → NO. Delegate.
-- "I'll quickly check this" → NO. Delegate.
-- "This is trivial" → NO. Delegate.

minimum_agents :: NonTrivialTask → Int
minimum_agents _ = 3  -- If fewer, decompose more
</DELEGATION_RULES>`)

  // Gates (delegation rules)
  parts.push(`<GATES>
-- Implementation agents: run gates directly via Bash
-- Orchestrating agents: DELEGATE gates to implementation agents

typecheck :: Scope → Effect Result
typecheck scope = Bash "mise run typecheck:pkg"

test :: Package → Effect Result
test pkg = Bash "mise run test:pkg"

-- Report success ONLY when both pass
</GATES>`)

  parts.push(`<TODO_ENFORCEMENT>
-- Todos are MANDATORY infrastructure, not optional

createTodos :: Task → [Todo] ++ gateTodos
gateTodos = ["Run typecheck gate", "Run test gate"]

-- Every non-trivial task MUST have:
-- 1. Decomposed subtask todos
-- 2. Gate todos (typecheck + test)

-- No todos = No visibility = Violation
</TODO_ENFORCEMENT>`)

  parts.push(`<code-field>
¬code     ← ¬assumptions
¬correct  ← ¬verified
¬happy    ← ¬edges
correct   := conditions(works)?
</code-field>`)

  parts.push(`<SUBAGENT_PROMPTING>
-- Agents start fresh - context not passed explicitly is LOST

priorResearch :: [AgentResult] → SpawnNew → MUST include <contextualization>

<contextualization>
  [thorough findings from prior agents]
  [file paths, patterns, code snippets discovered]
  [decisions made, trade-offs considered]
</contextualization>

-- When spawning after research/aggregation:
-- Pass ALL learnings, not summaries
-- Better verbose than information loss
-- The receiving agent cannot access prior conversation

contextRule :: Spawn → Context
contextRule spawn
  | afterDeepResearch spawn = thoroughContextualization  -- MANDATORY
  | aggregatingAgents spawn = thoroughContextualization  -- MANDATORY
  | otherwise = standardPrompt
</SUBAGENT_PROMPTING>`)

  parts.push(`<memory-and-modules>
Manage memories via /memory-management, discover modules via /module.
These tools condense knowledge in a memory-efficient manner.
Prefer these over manual exploration and memory management.

- /memory-management: Query, store, search persistent knowledge across sessions
- /modules: List all ai-context modules with summaries
- /module [path]: Get full context for specific module
- /module-search [pattern]: Find modules by keyword
</memory-and-modules>`)

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
