/**
 * SessionStart Hook - Main Agent Initialization
 *
 * Provides verbose context for primary agents talking to humans.
 * Uses HTML-like syntax for all context enhancements.
 *
 * @module AgentInit
 * @since 1.0.0
 */

import { Effect, Console, Context, Layer, Data, Schema, pipe, Config, Array as Arr } from "effect"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Command, CommandExecutor } from "@effect/platform"

// ============================================================================
// Schemas & Types
// ============================================================================

const AgentConfigSchema = Schema.Struct({
  projectDir: Schema.String.pipe(Schema.nonEmptyString()),
})

type AgentConfigData = Schema.Schema.Type<typeof AgentConfigSchema>

const MiseTask = Schema.Struct({
  name: Schema.String,
  aliases: Schema.Array(Schema.String),
  description: Schema.String,
})

const MiseTasks = Schema.Array(MiseTask)

const formatMiseTasks = (tasks: typeof MiseTasks.Type): string =>
  Arr.map(tasks, t => {
    const aliases = t.aliases.length > 0 ? ` (${t.aliases.join(", ")})` : ""
    return `${t.name}${aliases}: ${t.description}`
  }).join("\n")

export class AgentConfigError extends Data.TaggedError("AgentConfigError")<{
  readonly reason: string
  readonly cause?: unknown
}> { }

// ============================================================================
// Services
// ============================================================================

export class AgentConfig extends Context.Tag("AgentConfig")<
  AgentConfig,
  { readonly projectDir: string }
>() { }

export class ProjectStructureCapture extends Context.Tag("ProjectStructureCapture")<
  ProjectStructureCapture,
  { readonly capture: () => Effect.Effect<string> }
>() { }

// ============================================================================
// Service Implementations
// ============================================================================

const ProjectDirConfig = pipe(
  Config.string("CLAUDE_PROJECT_DIR"),
  Config.withDefault(".")
)

export const AgentConfigLive = Layer.effect(
  AgentConfig,
  Effect.gen(function* () {
    const projectDir = yield* ProjectDirConfig
    const config: AgentConfigData = yield* Schema.decode(AgentConfigSchema)({
      projectDir,
    }).pipe(
      Effect.mapError((error) =>
        new AgentConfigError({ reason: "Invalid configuration", cause: error })
      )
    )
    return AgentConfig.of({ projectDir: config.projectDir })
  })
)

export const ProjectStructureCaptureLive = Layer.effect(
  ProjectStructureCapture,
  Effect.gen(function* () {
    const config = yield* AgentConfig
    const commandExecutor = yield* CommandExecutor.CommandExecutor

    return ProjectStructureCapture.of({
      capture: () =>
        pipe(
          Command.make("tree", "-L", "2", "-a", "-I", "node_modules|.git|dist|.turbo|build|.next|.cache|coverage"),
          Command.workingDirectory(config.projectDir),
          Command.string,
          Effect.catchAll(() => Effect.succeed("(tree unavailable)")),
          Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
        )
    })
  })
)

export const AppLive = ProjectStructureCaptureLive.pipe(
  Layer.provideMerge(AgentConfigLive),
  Layer.provideMerge(BunContext.layer)
)

// ============================================================================
// Main Program
// ============================================================================

export const program = Effect.gen(function* () {
  const config = yield* AgentConfig
  const commandExecutor = yield* CommandExecutor.CommandExecutor
  const structureCapture = yield* ProjectStructureCapture

  // Capture all context in parallel
  const [treeOutput, gitStatus, latestCommit, previousCommits, branchContext, githubIssues, githubPRs, moduleSummary, projectVersion, packageScripts, miseTasks, repoInfo, recentAuthors] = yield* Effect.all([
    structureCapture.capture(),
    pipe(
      Command.make("git", "status", "--short"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.catchAll(() => Effect.succeed("(not a git repository)")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("git", "show", "HEAD", "--stat", "--format=%h %s%n%n%b"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(s => s.trim()),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("git", "log", "--oneline", "-4", "--skip=1"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(s => s.trim()),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("git", "branch", "-vv", "--list", "--sort=-committerdate"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(s => {
        const lines = s.trim().split("\n")
        const current = lines.find(l => l.startsWith("*")) || ""
        const recent = lines.filter(l => !l.startsWith("*")).slice(0, 4)
        return { current: current.replace(/^\*\s*/, "").trim(), recent }
      }),
      Effect.catchAll((): Effect.Effect<{ current: string; recent: string[] }> =>
        Effect.succeed({ current: "", recent: [] })
      ),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("gh", "issue", "list", "--limit", "5", "--state", "open", "--sort", "updated"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(s => s.trim()),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("gh", "pr", "list", "--limit", "5", "--state", "open", "--sort", "updated"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(s => s.trim()),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("bun", ".claude/scripts/context-crawler.ts", "--summary"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.catchAll(() => Effect.succeed("<modules count=\"0\">(unavailable)</modules>")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("bun", "-e", "console.log(require('./package.json').version)"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(v => v.trim()),
      Effect.catchAll(() => Effect.succeed("unknown")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("bun", "-e", "const p = require('./package.json'); console.log(Object.entries(p.scripts || {}).map(([k,v]) => k + ': ' + v).join('\\n'))"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(s => s.trim()),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("mise", "tasks", "--json"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.flatMap(s => Schema.decodeUnknown(Schema.parseJson(MiseTasks))(s)),
      Effect.map(formatMiseTasks),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("gh", "repo", "view", "--json", "owner,name", "-q", ".owner.login + \"/\" + .name"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(s => s.trim()),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    ),
    pipe(
      Command.make("git", "log", "--since=7 days ago", "--format=%an", "--no-merges"),
      Command.workingDirectory(config.projectDir),
      Command.string,
      Effect.map(out => [...new Set(out.trim().split("\n").filter(Boolean))].join(", ")),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    )
  ], { concurrency: "unbounded" })

  // Fetch collaborators (depends on repoInfo)
  const collaborators = yield* pipe(
    repoInfo
      ? pipe(
        Command.make("gh", "api", `repos/${repoInfo}/collaborators`, "-q", `.[] | "\\(.login):\\(.role_name)"`),
        Command.workingDirectory(config.projectDir),
        Command.string,
        Effect.map(s => s.trim()),
        Effect.catchAll(() => Effect.succeed("")),
        Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
      )
      : Effect.succeed("")
  )

  // Build context output with mathematical notation
  const output = `<session-context>
<agent_instructions>
<DELEGATION_THRESHOLDS>
-- Orchestrators coordinate; substantive work is delegated to sub-agents.
-- These thresholds guide when to delegate vs execute directly.

small_task := |files| <= 3 ∧ |tool_calls| <= 5
-- Small tasks: orchestrator MAY execute directly

large_task := |files| > 3 ∨ |tool_calls| > 5 ∨ requires_deep_exploration
-- Large tasks: MUST delegate to specialized agents

-- Trigger delegation when ANY of:
--   • Reading more than 3 files
--   • More than 5 sequential tool calls
--   • Generating source code (always delegate)
--   • Generating test code (always delegate)
--   • Broad codebase search

-- Orchestrator MAY directly:
--   • Read 1-3 small files for quick context
--   • Make 1-5 tool calls for coordination
--   • Synthesize sub-agent outputs
--   • Create handoff documents
--   • Update REFLECTION_LOG.md
</DELEGATION_THRESHOLDS>

<identity>
self := Architect ∧ Critic ∧ Coordinator

-- You ARE:
--   • An architect who designs and coordinates
--   • A critic who raises genuine concerns
--   • A coordinator who delegates substantive implementation
--   • A peer who collaborates with the human

-- You MAY handle small coordination tasks directly
-- You MUST delegate large or complex implementation work
</identity>

<critical_thinking>
-- Genuine pushback (when there's signal)
pushBack req
  | hasRisk req           → identifyRisk req
  | overEngineered req    → proposeSimpler req
  | unclear req           → askClarification req
  | betterWayKnown req    → suggestAlternative req
  | otherwise             → proceed  -- don't manufacture objections

-- Root cause analysis (for bugs/fixes)
diagnose problem:
  1. observe symptoms
  2. analyze root cause (type errors often mask deeper issues)
  3. if stuck in loop (>2 failed attempts) → step back and reassess

-- Trust the type system unless bypassed ("as any", "@ts-ignore", etc.)
</critical_thinking>

<delegation_guidelines>
-- Delegate when task exceeds thresholds
handle task
  | large_task task → spawn agent(s) with full context
  | small_task task → may execute directly

-- For complex tasks, decompose and parallelize
decompose task = parallel [spawn agent subtask | subtask ← split task]

-- Number of agents = f(task_complexity), not a fixed minimum
-- Simple tasks may need 0-1 agents; complex tasks may need many
</delegation_guidelines>

<orchestrator_tools>
-- Primary tools for orchestration
primary := [Task, AskUserQuestion, TodoWrite]

-- Permitted for small tasks (within thresholds)
permitted_limited := [Read, Glob, Grep]  -- up to 3 files / 5 calls

-- Always delegate
always_delegate := [Edit, Write]  -- for source code changes

-- Bash: permitted for running gates (typecheck, test)
</orchestrator_tools>

<gates>
-- Success requires both gates pass
success task := typesPass ∧ testsPass

-- Gates run via Bash (bun run check, bun run test)
-- For significant changes: invoke /legal-review before finalizing
</gates>

<todo_tracking>
-- Todo lists provide visibility for non-trivial tasks
-- Include gate todos: typecheck, test
</todo_tracking>

<context_passing>
-- When spawning agents after research, pass full context
-- Agents start fresh; information not passed is LOST

-- Include <contextualization> tag with:
--   • Findings from prior agents
--   • Specific file paths discovered
--   • Patterns observed
--   • Decisions already made
</context_passing>

<parallel_environment>
-- Multiple agents may operate simultaneously
-- Errors in untouched code may indicate concurrent work

-- Symptoms: type errors in files you didn't modify,
--           unexpected file changes, missing symbols

-- Policy: don't fix others' errors; report and ask
</parallel_environment>
</agent_instructions>

<cwd>${config.projectDir}</cwd>
<version>${projectVersion}</version>

<file-structure>
${treeOutput}
</file-structure>

<git-status>
${gitStatus || "(clean)"}
</git-status>

<git-log>
<latest-commit>
${latestCommit || "(none)"}
</latest-commit>

<previous-commits>
${previousCommits || "(none)"}
</previous-commits>
</git-log>

<branch-context>
<current>${branchContext.current || "(detached)"}</current>
${branchContext.recent.length > 0 ? `<recent>\n${branchContext.recent.join("\n")}\n</recent>` : ""}
</branch-context>

<collaborators>
<team>
${collaborators.split("\n").filter(Boolean).map(line => {
    const [login, role] = line.split(":")
    return `  <person github="${login}" role="${role || "unknown"}"/>`
  }).join("\n") || "  (unavailable)"}
</team>
<recently-active window="7d">${recentAuthors || "(none)"}</recently-active>
</collaborators>

<github-context>
${githubIssues ? `<open-issues>\n${githubIssues}\n</open-issues>` : "<open-issues>(none)</open-issues>"}
${githubPRs ? `<open-prs>\n${githubPRs}\n</open-prs>` : "<open-prs>(none)</open-prs>"}
</github-context>

${moduleSummary}
<module-discovery>
Run /module [path] to get full context for any module listed above.
Run /module-search [pattern] to find modules by keyword.
</module-discovery>

<available-scripts>
<package-json>
${packageScripts || "(none)"}
</package-json>
<mise-tasks>
${miseTasks || "(none)"}
</mise-tasks>
</available-scripts>

</session-context>`

  yield* Console.log(output)
})

const runnable = pipe(
  program,
  Effect.provide(AppLive),
  Effect.catchTags({
    AgentConfigError: (error) => Console.error(`<error>Config: ${error.reason}</error>`),
  })
)

BunRuntime.runMain(runnable)
