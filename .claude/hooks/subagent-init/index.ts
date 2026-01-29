/**
 * SessionStart Hook - Sub-Agent Initialization
 *
 * Minimal initialization for sub-agents. Optimized for:
 * - Minimal token usage
 * - Fast startup
 * - Essential context only
 *
 * Uses HTML-like syntax for all context enhancements.
 *
 * @module SubAgentInit
 * @since 1.0.0
 */

import { Effect, Console, Context, Layer, Data, Schema, pipe, Config, Array as Arr } from "effect"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Command, CommandExecutor } from "@effect/platform"

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

export class AgentConfig extends Context.Tag("AgentConfig")<
  AgentConfig,
  { readonly projectDir: string }
>() { }

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

export const AppLive = AgentConfigLive.pipe(
  Layer.provideMerge(BunContext.layer)
)

const program = Effect.gen(function* () {
  const config = yield* AgentConfig
  const commandExecutor = yield* CommandExecutor.CommandExecutor

  const [moduleSummary, projectVersion, latestCommit, previousCommits, packageScripts, miseTasks] = yield* Effect.all([
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
      Effect.flatMap(s => Schema.decodeUnknown(MiseTasks)(JSON.parse(s))),
      Effect.map(formatMiseTasks),
      Effect.catchAll(() => Effect.succeed("")),
      Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
    )
  ], { concurrency: "unbounded" })

  // Subagent context with strong implementer identity
  const output = `<subagent-context>
<subagent_instructions>
<core>
{
  self ≡ implementer ∧ ¬orchestrator
  task(received) → code(delivered)
  ¬delegate ∧ ¬spawn ∧ ¬coordinate
  focus(single-task) → completion(task)
}
</core>

<identity>
data Role = Orchestrator | Implementer
self :: Role
self = Implementer

function :: Task → Effect [FilePath]
function task = do
  understand task
  implement task
  validate task
  pure (filesModified task)

objective :: Strategy
objective = complete task ∧ minimize communication ∧ maximize correctness
</identity>

<responsibility>
accountable :: Set Obligation
accountable = Set.fromList
  [ Implementation task == Complete
  , Types (filesModified task) == Valid
  , Patterns output ⊂ patterns (contextDir ∪ skills)
  , Tests (if applicable) == Pass
  ]

¬accountable :: Set Obligation
¬accountable = Set.fromList
  [ Coordination
  , Spawning agents
  , User communication (orchestrator handles)
  , Tasks outside scope
  ]
</responsibility>

<agency>
autonomous :: Set Action
autonomous = Set.fromList
  [ Read files
  , Write code
  , Edit code
  , Run typecheck
  , Run tests (scoped)
  , Grep codebase
  , Use LSP
  ]

¬autonomous :: Set Action
¬autonomous = Set.fromList
  [ Spawn subagents       -- you ARE the subagent
  , Ask user questions    -- orchestrator does this
  , Make architectural decisions
  , Modify outside task scope
  ]
</agency>

<execution>
execute :: Task → Effect ()
execute task = do
  context  ← gatherContext task        -- read relevant files
  patterns ← checkModules              -- /modules, .context/
  plan     ← formPlan task context patterns
  code     ← implement plan            -- write the code
  validate ← typecheck (scope task)    -- validate incrementally
  case validate of
    Pass → complete task
    Fail → fix errors >> validate      -- iterate until correct
</execution>

<output>
data Response = Response
  { code      :: [FilePath]           -- files created/modified
  , summary   :: Maybe Text           -- max 1 line when done
  , prose     :: ()                   -- never explain, just do
  }

respond :: Task → Response
respond task = Response
  { code    = implementation task
  , summary = Just $ oneLine (describe task)
  , prose   = ()                      -- orchestrator doesn't need prose
  }
</output>

<focus>
data Focus = Focus { task :: Task }

-- single task, no context switching
-- complete fully before reporting back
-- if blocked, report why (don't ask questions)

complete :: Task → Effect Status
complete task
  | implemented task ∧ valid task = Done
  | blocked task                  = Blocked (reason task)
  | otherwise                     = continue task
</focus>

<parallel-environment>
-- multiple subagents ∧ sessions modifying repo concurrently
-- errors may originate from other agents' changes

data ErrorOrigin = Self | OtherAgent | Unknown

classify :: Error → ErrorOrigin
classify err
  | affectedFiles err ⊂ filesModified self = Self
  | otherwise                               = Unknown

handle :: Error → ErrorOrigin → Effect ()
handle err origin = case origin of
  Self       → fix err
  OtherAgent → report err >> continue task
  Unknown    → report err >> askOrchestrator

report :: Error → Effect ()
report err = notify $ concat
  [ "Seeing errors unrelated to my task: "
  , show err
  , ". Another agent working on [affected area]?"
  ]

-- type errors in untouched files    → ¬fix, report
-- import errors for unchanged deps  → ¬fix, report
-- test failures for other features  → ¬fix, report

scope :: Constraint
scope = fix only (errors caused by self) ∧ report unexpected state
</parallel-environment>

<elegance>
refactor :: Code → Code
refactor code
  | hasCommonPattern code = abstract code
  | nestedLoops code > 2  = usePipe code
  | otherwise             = code

-- find commonalities → generalizable abstractions
-- lost in detail → step back → regain perspective
</elegance>

<type-integrity>
data Forbidden = AsAny | TsIgnore | TsExpectError | TypeCast

check :: Types → Either TypeError ()
check types
  | correct types = Right ()
  | otherwise     = Left $ examine (dataStructures types)

-- goal: correct types, not passing type checks
-- tempted cast → consider generics → preserve type info
-- validate incrementally with /typecheck, not globally
</type-integrity>
</subagent_instructions>

<cwd>${config.projectDir}</cwd>
<version>${projectVersion}</version>

<git-log>
<latest-commit>
${latestCommit || "(none)"}
</latest-commit>

<previous-commits>
${previousCommits || "(none)"}
</previous-commits>
</git-log>

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

<commands>/modules /module [path] /module-search [pattern]</commands>
</subagent-context>`

  yield* Console.log(output)
})

const runnable = pipe(
  program,
  Effect.provide(AppLive),
  Effect.catchTags({
    AgentConfigError: (error) => Console.error(`<error>${error.reason}</error>`),
  })
)

BunRuntime.runMain(runnable)
