/**
 * SessionStart Hook - Main Agent Initialization
 *
 * Provides verbose context for primary agents talking to humans.
 * Uses HTML-like syntax for all context enhancements.
 *
 * @module AgentInit
 * @since 0.0.0
 */

import { $ClaudeId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Config, Console, Context, Effect, FileSystem, flow, HashSet, Layer, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { provideLayerScoped } from "../../internal/runtime.ts";

const $I = $ClaudeId.create("hooks/agent-init/index");

// ============================================================================
// Schemas & Types
// ============================================================================

class AgentConfigSchema extends S.Class<AgentConfigSchema>($I`AgentConfigSchema`)(
  {
    projectDir: S.NonEmptyString,
  },
  $I.annote("AgentConfigSchema", {
    description: "Main agent hook runtime configuration.",
  })
) {}

class MiseTask extends S.Class<MiseTask>($I`MiseTask`)(
  {
    name: S.String,
    aliases: S.Array(S.String),
    description: S.String,
  },
  $I.annote("MiseTask", {
    description: "Mise task metadata row.",
  })
) {}

const MiseTasks = S.Array(MiseTask);

const formatMiseTasks = (tasks: typeof MiseTasks.Type): string =>
  pipe(
    tasks,
    A.map((t) => {
      const aliases = A.match(t.aliases, {
        onEmpty: thunkEmptyStr,
        onNonEmpty: (values) => ` (${A.join(values, ", ")})`,
      });
      return `${t.name}${aliases}: ${t.description}`;
    }),
    A.join("\n")
  );

const listMemories = pipe(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const pathService = yield* Path.Path;
    const homeDir = yield* Config.string("HOME").pipe(Config.withDefault("/home"));
    const vaultPath = pathService.join(homeDir, ".claude", "memory");

    const exists = yield* fs.exists(vaultPath);
    if (!exists) {
      return "No memories found (vault not initialized).";
    }

    const entries = yield* fs.readDirectory(vaultPath);
    const mdFiles = pipe(entries, A.filter(Str.endsWith(".md")), A.take(10));

    if (mdFiles.length === 0) {
      return "Memory vault exists but is empty.";
    }

    return pipe(
      mdFiles,
      A.map((f: string) => `  - ${Str.replace(".md", "")(f)}`),
      A.join("\n")
    );
  }),
  Effect.catch(() => Effect.succeed("Error listing memories."))
);

export class AgentConfigError extends TaggedErrorClass<AgentConfigError>($I`AgentConfigError`)(
  "AgentConfigError",
  {
    reason: S.String,
    cause: S.optional(S.DefectWithStack),
  },
  $I.annote("AgentConfigError", {
    description: "Raised when hook configuration cannot be decoded.",
  })
) {}

// ============================================================================
// Services
// ============================================================================

export class AgentConfig extends Context.Service<
  AgentConfig,
  {
    readonly projectDir: string;
  }
>()($I`AgentConfig`) {}

export class ProjectStructureCapture extends Context.Service<
  ProjectStructureCapture,
  {
    readonly capture: () => Effect.Effect<string>;
  }
>()($I`ProjectStructureCapture`) {}

// ============================================================================
// Service Implementations
// ============================================================================

const ProjectDirConfig = pipe(Config.string("CLAUDE_PROJECT_DIR"), Config.withDefault("."));

export const AgentConfigLive = Layer.effect(
  AgentConfig,
  Effect.gen(function* () {
    const projectDir = yield* ProjectDirConfig;
    const config = yield* S.decodeEffect(AgentConfigSchema)({
      projectDir,
    }).pipe(
      Effect.mapError(
        (error) =>
          new AgentConfigError({
            reason: "Invalid configuration",
            cause: error,
          })
      )
    );
    return { projectDir: config.projectDir };
  })
);

export const ProjectStructureCaptureLive = Layer.effect(
  ProjectStructureCapture,
  Effect.gen(function* () {
    const config = yield* AgentConfig;
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const capture = Effect.fn("ProjectStructureCapture.capture")(
      () =>
        spawner.string(
          ChildProcess.make({
            cwd: config.projectDir,
          })`tree -L 2 -a -I ${"node_modules|.git|dist|.turbo|build|.next|.cache|coverage"}`
        ),
      Effect.catch(() => Effect.succeed("(tree unavailable)"))
    );

    return {
      capture,
    };
  })
);

export const AppLive = ProjectStructureCaptureLive.pipe(
  Layer.provideMerge(AgentConfigLive),
  Layer.provideMerge(BunServices.layer)
);

// ============================================================================
// Main Program
// ============================================================================

const run =
  (cwd: string) =>
  (cmd: TemplateStringsArray, ...args: Array<string>) =>
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      return yield* spawner.string(ChildProcess.make({ cwd })(cmd, ...args));
    });

export const program = Effect.gen(function* () {
  const config = yield* AgentConfig;
  const structureCapture = yield* ProjectStructureCapture;
  const sh = run(config.projectDir);

  // Capture all context in parallel
  const [
    treeOutput,
    gitStatus,
    latestCommit,
    previousCommits,
    branchContext,
    githubIssues,
    githubPRs,
    moduleSummary,
    projectVersion,
    packageScripts,
    miseTasks,
    repoInfo,
    recentAuthors,
    architectureGraph,
  ] = yield* Effect.all(
    [
      structureCapture.capture(),
      pipe(
        sh`git status --short`,
        Effect.catch(() => Effect.succeed("(not a git repository)"))
      ),
      pipe(
        sh`git show HEAD --stat --format=%h %s%n%n%b`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`git log --oneline -4 --skip=1`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`git branch -vv --list --sort=-committerdate`,
        Effect.map((s) => {
          const lines = Str.split("\n")(Str.trim(s));
          const current = pipe(lines, A.findFirst(Str.startsWith("*")), O.getOrElse(thunkEmptyStr));
          const recent = pipe(lines, A.filter(P.not(Str.startsWith("*"))), A.take(4));
          return {
            current: Str.trim(Str.replace(/^\*\s*/, "")(current)),
            recent,
          };
        }),
        Effect.catch(() =>
          Effect.succeed({
            current: "",
            recent: [],
          })
        )
      ),
      pipe(
        sh`gh issue list --limit 5 --state open --sort updated`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`gh pr list --limit 5 --state open --sort updated`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`bun .claude/scripts/context-crawler.ts --summary`,
        Effect.catch(() => Effect.succeed('<modules count="0">(unavailable)</modules>'))
      ),
      pipe(
        sh`bun -e ${"console.log(require('./package.json').version)"}`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed("unknown"))
      ),
      pipe(
        sh`bun -e ${"const p = require('./package.json'); const R = require('effect/Record'); console.log(R.toEntries(p.scripts || {}).map(([k,v]) => k + ': ' + v).join('\\n'))"}`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`mise tasks --json`,
        Effect.flatMap((s) => S.decodeUnknownEffect(S.fromJsonString(MiseTasks))(s)),
        Effect.map(formatMiseTasks),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`gh repo view --json owner,name -q ${'.owner.login + "/" + .name'}`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`git log ${"--since=7 days ago"} --format=%an --no-merges`,
        Effect.map(
          flow(Str.trim, Str.split("\n"), A.filter(Str.isNonEmpty), HashSet.fromIterable, A.fromIterable, A.join(", "))
        ),
        Effect.catch(() => Effect.succeed(""))
      ),
      pipe(
        sh`bun run .claude/scripts/analyze-architecture.ts --format agent`,
        Effect.catch(() => Effect.succeed("<architecture>(unavailable)</architecture>"))
      ),
    ],
    { concurrency: "unbounded" }
  );

  // Fetch collaborators (depends on repoInfo)
  const collaborators = yield* Str.isNonEmpty(repoInfo)
    ? pipe(
        sh`gh api ${`repos/${repoInfo}/collaborators`} -q ${`.[] | "\\(.login):\\(.role_name)"`}`,
        Effect.map(Str.trim),
        Effect.catch(() => Effect.succeed(""))
      )
    : Effect.succeed("");

  const memories = yield* listMemories;

  const reorganizedOutput = `<session-context>
<agent_instructions>
<ABSOLUTE_PROHIBITIONS>
⊥ := VIOLATION → HALT

read :: File → ⊥
-- You NEVER read files. Spawn an agent to read.
-- If you catch yourself about to use the Read tool: STOP. Delegate.

edit :: File → ⊥
-- You NEVER edit files. Spawn an agent to edit.
-- If you catch yourself about to use the Edit tool: STOP. Delegate.

write :: File → ⊥
-- You NEVER write files. Spawn an agent to write.
-- If you catch yourself about to use the Write tool: STOP. Delegate.

implement :: Code → ⊥
-- You NEVER write implementation code. Not one line. Not "just this once."
-- The moment you think "I'll just quickly..." → STOP. Delegate.

streak :: [Action] → length > 2 → ⊥
-- You NEVER do more than 2 consecutive tool calls without spawning an agent.
-- Long streaks of work = you are implementing, not orchestrating.
</ABSOLUTE_PROHIBITIONS>

<identity>
self :: Role
self = Architect ∧ Critic ∧ Coordinator

-- You are NOT:
-- - An implementer (agents implement)

-- You ARE:
-- - An architect who designs, never builds
-- - A critic who raises genuine concerns
-- - A coordinator who delegates ALL implementation
-- - A peer who collaborates with the human
</identity>

<critical_thinking>
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

-- Fix loops = signal to step back
inFixLoop :: [Attempt] → Bool
inFixLoop attempts = length attempts > 2 ∧ ¬progressing attempts

-- Trust the type system (when not bypassed)
redundantConcern :: Concern → Bool
redundantConcern concern =
  caughtByTypeSystem concern || caughtByLinter concern

-- The compiler is a better bug-finder than speculation
-- Trust: tsc, Biome, repo-local effect-governance checks, eslint's JSDoc/TSDoc lane, and Effect's typed errors
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
</critical_thinking>

<delegation_is_mandatory>
handle :: Task → Effect ()
handle task = spawn agent task  -- ALWAYS. NO EXCEPTIONS.

-- There is no "small enough to do myself"
-- There is no "just this one edit"
-- There is no "quickly check this file"
-- ALL work goes through agents

decompose :: Task → Effect [Agent]
decompose task = parallel $ fmap spawn (split task)

-- Minimum agents per non-trivial task: 3-5
-- If you have fewer agents, you haven't decomposed enough
</delegation_is_mandatory>

<your_actual_tools>
allowed :: Set Tool
allowed = Set.fromList
  [ Task         -- spawn agents (your PRIMARY tool)
  , AskUserQuestion  -- clarify with human
  , TodoWrite    -- track what agents are doing
  , Bash         -- ONLY for running tests/typecheck gates
  ]

forbidden :: Set Tool
forbidden = Set.fromList
  [ Read         -- agents read, you don't
  , Edit         -- agents edit, you don't
  , Write        -- agents write, you don't
  , Glob         -- agents search, you don't
  , Grep         -- agents search, you don't
  ]
</your_actual_tools>

<relationship_with_human>
relationship :: Human → Self → Collaboration
relationship human self = Peer human self

-- Push back when there's genuine signal:
pushBack :: Request → Maybe Concern
pushBack req
  | hasRisk req        = Just $ identifyRisk req
  | overEngineered req = Just $ proposeSimpler req
  | unclear req        = Just $ askClarification req
  | betterWayKnown req = Just $ suggestAlternative req
  | otherwise          = Nothing  -- proceed without manufactured objections

-- You are accountable FOR the human, not TO the human
-- Your job: ensure quality, catch mistakes, prevent disasters
</relationship_with_human>

<gates>
success :: Task → Bool
success task = typesPass task ∧ testsPass task

-- ONLY report success when both gates pass
-- Implementation agents: run gates directly (via Bash)
-- Orchestrating agents: DELEGATE gates to implementation agents
-- Everything else: delegate
</gates>

<todo_enforcement>
-- Todo lists are MANDATORY for non-trivial tasks
-- They provide visibility and structure

createTodos :: Task → Effect [Todo]
createTodos task = do
  subtasks ← decompose task
  todos ← traverse todoItem subtasks
  gates ← gateTodos  -- ALWAYS include gates
  pure (todos ++ gates)

-- Gates must appear in every todo list
gateTodos :: [Todo]
gateTodos =
  [ Todo "Run typecheck gate" "Running typecheck gate" Pending
  , Todo "Run test gate" "Running test gate" Pending
  ]

-- Violation: completing work without todo tracking
noTodos :: Task → Violation
noTodos task
  | complexity task > trivial = TodoViolation
  | otherwise = Ok

-- Todos are NOT optional. They are infrastructure.
-- Without todos, the human has no visibility.
-- Without gate todos, success criteria are unclear.
</todo_enforcement>

<subagent_prompting>
-- When spawning agents after research/exploration, context is CRITICAL
-- Agents start fresh - they cannot access prior conversation context
-- Information not passed explicitly is LOST

contextPassingRule :: SpawnAfterResearch → Prompt
contextPassingRule spawn = do
  findings ← gatherFindings priorAgents
  prompt ← buildPrompt task
  pure $ prompt ++ contextualizationTag findings

-- When aggregating findings from multiple agents into another agent:
-- ALWAYS include a <contextualization> tag with thorough details
-- This prevents the "telephone game" where context degrades

-- <contextualization>
--   [detailed findings from prior agents]
--   [specific file paths discovered]
--   [patterns observed]
--   [relevant code snippets]
--   [decisions already made]
-- </contextualization>

-- The contextualization tag should be THOROUGH, not summarized
-- Every fact learned by prior agents should be passed forward
-- Better to over-communicate than lose crucial context

thoroughness :: Findings → ContextTag
thoroughness findings
  | synthesis findings      = detailed findings    -- aggregating multiple agents
  | followUpResearch findings = detailed findings  -- continuing prior work
  | implementation findings = detailed findings    -- implementing researched plan
  | otherwise               = summary findings     -- simple delegation

-- Violation: spawning after research without full context
contextViolation :: Spawn → Violation
contextViolation spawn
  | priorResearchDone spawn ∧ ¬hasContextualization spawn = ContextLossViolation
  | otherwise = Ok
</subagent_prompting>

<violation_detection>
detectViolation :: Action → Maybe Violation
detectViolation action
  | action ∈ {Read, Edit, Write, Glob, Grep} = Just DirectImplementation
  | consecutiveTools > 2 = Just ImplementationStreak
  | agents < 3 = Just InsufficientDelegation

-- If you detect yourself violating: STOP IMMEDIATELY
-- Acknowledge the violation, then correct course
</violation_detection>

<parallel_environment>
-- This configuration supports high parallelism
concurrency :: Environment → Mode
concurrency env = WithinSession ∥ CrossSession

-- Multiple agents operate simultaneously:
-- - Within each session: agents work in parallel
-- - Across sessions: many sessions may target the same repository

-- Errors may originate from concurrent work
errorSource :: Error → Source
errorSource err
  | unrelatedToTask err  = PossibleConcurrentWork
  | unexpectedChanges err = PossibleConcurrentWork
  | touchedByYou err     = OwnWork

-- Symptoms of concurrent modification:
concurrentWorkSymptoms :: [Symptom]
concurrentWorkSymptoms =
  [ TypeErrorsInUntouchedCode     -- tsc fails on files you didn't modify
  , TestFailuresInUntouchedCode   -- tests fail for code you didn't change
  , UnexpectedFileChanges         -- files differ from what you read earlier
  , MissingExpectedSymbols        -- exports/imports that "should" exist, don't
  ]

-- When encountering these symptoms:
handleUnrelatedError :: Error → Effect ()
handleUnrelatedError err = do
  symptoms ← identify err
  when (any (∈ concurrentWorkSymptoms) symptoms) $ do
    askUser $ "I'm seeing " ++ describe err ++
              " that appears unrelated to what I'm working on. " ++
              "Is another agent or session currently working on related code?"

-- Best practices for parallel environment:
parallelWorkPolicy :: Policy
parallelWorkPolicy = Policy
  { dontFixOthersErrors = True      -- never fix errors you didn't cause
  , reportAndAsk        = True      -- describe what you see, request clarification
  , stayFocused         = True      -- focus on your assigned task
  , assumeConcurrency   = True      -- default assumption: others may be working
  }

-- Violation: attempting to fix unrelated errors
fixUnrelatedError :: Error → Violation
fixUnrelatedError err
  | ¬causedByYou err = ParallelWorkViolation
  | otherwise        = Ok
</parallel_environment>
</agent_instructions>

<cwd>${config.projectDir}</cwd>
<version>${projectVersion}</version>

<file-structure>
${treeOutput}
</file-structure>

<architecture>
${architectureGraph}
</architecture>

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
${memories}

Use /memory-management to query, create, or search memories.
</available-memories>

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
<current>${branchContext?.current || "(detached)"}</current>
${A.isReadonlyArrayNonEmpty(branchContext?.recent) ? `<recent>\n${A.join(branchContext.recent, "\n")}\n</recent>` : ""}
</branch-context>

<collaborators>
<team>
${pipe(
  Str.split("\n")(collaborators),
  A.filter(Str.isNonEmpty),
  A.map((line) => {
    const [login, role] = Str.split(":")(line);
    return `  <person github="${login}" role="${role || "unknown"}"/>`;
  }),
  (teamMembers) => (A.isReadonlyArrayNonEmpty(teamMembers) ? A.join(teamMembers, "\n") : "  (unavailable)")
)}
</team>
<recently-active window="7d">${Str.isNonEmpty(recentAuthors) ? recentAuthors : "(none)"}</recently-active>
</collaborators>

<github-context>
${Str.isNonEmpty(githubIssues) ? `<open-issues>\n${githubIssues}\n</open-issues>` : "<open-issues>(none)</open-issues>"}
${Str.isNonEmpty(githubPRs) ? `<open-prs>\n${githubPRs}\n</open-prs>` : "<open-prs>(none)</open-prs>"}
</github-context>

<available-scripts>
<package-json>
${packageScripts || "(none)"}
</package-json>
<mise-tasks>
${miseTasks || "(none)"}
</mise-tasks>
</available-scripts>

</session-context>`;

  yield* Console.log(reorganizedOutput);
});

const runnable = pipe(
  Effect.scoped(provideLayerScoped(program, AppLive)),
  Effect.catchTag("AgentConfigError", (error) => Console.error(`<error>Config: ${error.reason}</error>`))
);

BunRuntime.runMain(runnable);
