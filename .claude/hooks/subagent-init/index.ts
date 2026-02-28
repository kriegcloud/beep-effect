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

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { $ClaudeId } from "@beep/identity/packages";
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Config, Console, Effect, Layer, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const $I = $ClaudeId.create("hooks/subagent-init/index");

const AgentConfigSchema = S.Struct({
  projectDir: S.NonEmptyString,
});

const MiseTask = S.Struct({
  name: S.String,
  aliases: S.Array(S.String),
  description: S.String,
});

const MiseTasks = S.Array(MiseTask);

const formatMiseTasks = (tasks: typeof MiseTasks.Type): string =>
  A.map(tasks, (t) => {
    const aliases = t.aliases.length > 0 ? ` (${t.aliases.join(", ")})` : "";
    return `${t.name}${aliases}: ${t.description}`;
  }).join("\n");

export class AgentConfigError extends S.TaggedErrorClass<AgentConfigError>($I`AgentConfigError`)(
  "AgentConfigError",
  { reason: S.String, cause: S.optional(S.Defect) },
  $I.annote("AgentConfigError", {
    description: "Raised when subagent hook configuration cannot be decoded.",
  })
) {}

export class AgentConfig extends ServiceMap.Service<AgentConfig, { readonly projectDir: string }>()($I`AgentConfig`) {}

const ProjectDirConfig = pipe(Config.string("CLAUDE_PROJECT_DIR"), Config.withDefault("."));

export const AgentConfigLive = Layer.effect(
  AgentConfig,
  Effect.gen(function* () {
    const projectDir = yield* ProjectDirConfig;
    const config = yield* S.decodeEffect(AgentConfigSchema)({
      projectDir,
    }).pipe(Effect.mapError((error) => new AgentConfigError({ reason: "Invalid configuration", cause: error })));
    return { projectDir: config.projectDir };
  })
);

export const AppLive = AgentConfigLive.pipe(Layer.provideMerge(BunServices.layer));

function listMemories(): string {
  const vaultPath = path.join(os.homedir(), ".claude", "memory");

  try {
    if (!fs.existsSync(vaultPath)) {
      return "No memories found (vault not initialized).";
    }

    const files = fs
      .readdirSync(vaultPath)
      .filter((f) => f.endsWith(".md"))
      .slice(0, 10);

    if (files.length === 0) {
      return "Memory vault exists but is empty.";
    }

    return files.map((f) => `  - ${Str.replace(".md", "")(f)}`).join("\n");
  } catch {
    return "Error listing memories.";
  }
}

const run =
  (cwd: string) =>
  (cmd: TemplateStringsArray, ...args: Array<string>) =>
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      return yield* spawner.string(ChildProcess.make({ cwd })(cmd, ...args));
    });

const program = Effect.gen(function* () {
  const config = yield* AgentConfig;
  const sh = run(config.projectDir);

  const [moduleSummary, projectVersion, latestCommit, previousCommits, packageScripts, miseTasks] = yield* Effect.all(
    [
      pipe(
        sh`bun .claude/scripts/context-crawler.ts --summary`,
        Effect.catch(() => Effect.succeed('<modules count="0">(unavailable)</modules>'))
      ),
      pipe(
        sh`bun -e ${"console.log(require('./package.json').version)"}`,
        Effect.map((v) => Str.trim(v)),
        Effect.catch(() => Effect.succeed("unknown"))
      ),
      pipe(
        sh`git show HEAD --stat --format=%h %s%n%n%b`,
        Effect.map((s) => Str.trim(s)),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`git log --oneline -4 --skip=1`,
        Effect.map((s) => Str.trim(s)),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`bun -e ${"const p = require('./package.json'); const R = require('effect/Record'); console.log(R.toEntries(p.scripts || {}).map(([k,v]) => k + ': ' + v).join('\\n'))"}`,
        Effect.map((s) => Str.trim(s)),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`mise tasks --json`,
        Effect.flatMap((s) => S.decodeUnknownEffect(S.fromJsonString(MiseTasks))(s)),
        Effect.map(formatMiseTasks),
        Effect.catch(() => Effect.succeed(""))
      ),
    ],
    { concurrency: "unbounded" }
  );

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
HIGHLY RECOMMENDED: Explore available modules - they contain distilled knowledge about the codebase.
- /modules - See what knowledge modules exist
- /module [path] - Get comprehensive context for a specific module
- /module-search [pattern] - Find relevant modules by keyword

Module context files save you from re-discovering architecture, patterns, and domain knowledge.
Use them proactively before diving into code.

Consider using /memory-management to query past decisions, store new learnings, and search across sessions.
</module-discovery>

<available-memories>
Recent memories in vault:
${listMemories()}

Use /memory-management to query, create, or search memories.
</available-memories>

<available-scripts>
<package-json>
${packageScripts || "(none)"}
</package-json>
<mise-tasks>
${miseTasks || "(none)"}
</mise-tasks>
</available-scripts>

<commands>/modules /module [path] /module-search [pattern]</commands>
</subagent-context>`;

  yield* Console.log(output);
});

const runnable = pipe(
  program,
  Effect.provide(AppLive),
  Effect.catchTag("AgentConfigError", (error) => Console.error(`<error>${error.reason}</error>`))
);

BunRuntime.runMain(runnable);
