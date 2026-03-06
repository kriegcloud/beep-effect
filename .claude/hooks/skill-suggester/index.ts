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
 * @category Utility
 * @since 1.0.0
 */

import { createHash } from "node:crypto";
import { $ClaudeId } from "@beep/identity/packages";
import { thunk0, thunkEmptyStr, thunkNull, thunkUndefined } from "@beep/utils";
import { BunRuntime, BunServices } from "@effect/platform-bun";
import {
  Clock,
  Config,
  Console,
  Effect,
  FileSystem,
  HashSet,
  Order,
  Path,
  pipe,
  String as Str,
  Terminal,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const $I = $ClaudeId.create("hooks/skill-suggester/index");

class LenientUserPromptInput extends S.Class<LenientUserPromptInput>($I`LenientUserPromptInput`)(
  {
    session_id: S.String,
    transcript_path: S.String.pipe(S.withDecodingDefault(thunkEmptyStr)),
    cwd: S.String,
    permission_mode: S.String.pipe(S.withDecodingDefault(() => "default")),
    hook_event_name: S.Literal("UserPromptSubmit"),
    prompt: S.String.pipe(S.withDecodingDefault(thunkEmptyStr)),
    user_prompt: S.String.pipe(S.withDecodingDefault(thunkEmptyStr)),
  },
  $I.annote("LenientUserPromptInput", {
    description: "UserPromptSubmit hook input with lenient defaults for missing text fields.",
  })
) {}

export interface SkillMetadata {
  readonly keywords: ReadonlyArray<string>;
  readonly name: string;
}

class HookState extends S.Class<HookState>($I`HookState`)(
  {
    lastCallMs: S.NullOr(S.Number).pipe(S.withDecodingDefault(thunkNull)),
  },
  $I.annote("HookState", {
    description: "Persisted state for hook call timing.",
  })
) {}

const HookStateFromJson = S.fromJsonString(HookState);

const readHookState = (cwd: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const statePath = path.join(cwd, ".claude", ".hook-state.json");
    const exists = yield* fs.exists(statePath);
    if (!exists) {
      return new HookState({ lastCallMs: null });
    }
    const content = yield* fs.readFileString(statePath);
    return yield* S.decodeUnknownEffect(HookStateFromJson)(content).pipe(
      Effect.orElseSucceed(() => new HookState({ lastCallMs: null }))
    );
  }).pipe(Effect.catch(() => Effect.succeed(new HookState({ lastCallMs: null }))));

const writeHookState = (cwd: string, state: HookState) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const statePath = path.join(cwd, ".claude", ".hook-state.json");
    const encoded = yield* S.encodeEffect(HookStateFromJson)(state);
    yield* fs.writeFileString(statePath, encoded);
  }).pipe(Effect.orElseSucceed(thunkUndefined));

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

const SCRIPT_TRIGGER_KEYWORDS = HashSet.fromIterable([
  "run",
  "test",
  "build",
  "typecheck",
  "type check",
  "check",
  "dev",
  "start",
  "lint",
  "format",
  "ci",
  "mise",
  "script",
  "npm",
  "bun",
  "execute",
  "clean",
  "reset",
  "sync",
  "deploy",
  "preview",
  "commit",
]);

const shouldShowMiseTasks = (prompt: string): boolean => {
  const lowered = Str.toLowerCase(prompt);
  for (const keyword of SCRIPT_TRIGGER_KEYWORDS) {
    if (Str.includes(keyword)(lowered)) return true;
  }
  return false;
};

const fetchMiseTasks = (cwd: string) =>
  Effect.gen(function* () {
    const result = yield* pipe(
      Effect.gen(function* () {
        const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
        return yield* spawner.string(ChildProcess.make({ cwd })`mise tasks --json`);
      }),
      Effect.flatMap(S.decodeUnknownEffect(S.fromJsonString(MiseTasks))),
      Effect.map(formatMiseTasks),
      Effect.catch(() => Effect.succeed(""))
    );

    return Str.isNonEmpty(result) ? O.some(result) : O.none();
  });

const parseFrontmatter = (content: string): R.ReadonlyRecord<string, string> => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = O.getOrNull(O.fromNullishOr(Str.match(frontmatterRegex)(content)));
  if (!match) return R.empty();

  const frontmatter = match[1];
  const lines = Str.split(frontmatter, "\n");

  const entries = pipe(
    lines,
    A.map((line: string) =>
      pipe(
        Str.indexOf(":")(line),
        O.fromUndefinedOr,
        O.flatMap((colonIndex) => {
          const key = pipe(line, Str.slice(0, colonIndex), Str.trim);
          const value = pipe(line, Str.slice(colonIndex + 1), Str.trim);
          return Str.isNonEmpty(key) && Str.isNonEmpty(value) ? O.some([key, value] as const) : O.none();
        })
      )
    ),
    A.getSomes
  );

  return R.fromEntries(entries);
};

export const STOPWORDS = HashSet.fromIterable([
  "the",
  "and",
  "for",
  "with",
  "using",
  "that",
  "this",
  "from",
  "are",
  "can",
  "will",
  "use",
  "used",
  "make",
  "makes",
  "create",
  "run",
  "effect",
  "service",
  "implement",
  "implementation",
  "design",
  "pattern",
  "patterns",
  "when",
  "working",
  "code",
  "type",
  "types",
  "build",
  "handle",
  "handling",
  "write",
  "writing",
  "module",
  "modules",
  "define",
  "defining",
]);

export const extractKeywords = (text: string): ReadonlyArray<string> => {
  const lowercased = Str.toLowerCase(text);
  const words = Str.split(lowercased, /[\s,.-]+/);

  return A.filter(words, (word) => Str.length(word) >= 3 && !HashSet.has(STOPWORDS, word));
};

class OutputHookSpecificOutput extends S.Class<OutputHookSpecificOutput>($I`OutputHookSpecificOutput`)(
  {
    hookEventName: S.Literal("UserPromptSubmit"),
    additionalContext: S.String,
  },
  $I.annote("OutputHookSpecificOutput", {
    description: "Hook-specific output body for skill suggester responses.",
  })
) {}

class OutputSchema extends S.Class<OutputSchema>($I`OutputSchema`)(
  {
    hookSpecificOutput: OutputHookSpecificOutput,
  },
  $I.annote("OutputSchema", {
    description: "Skill suggester output payload wrapper.",
  })
) {}

const readSkillFile = (skillPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const content = yield* fs.readFileString(skillPath);
    const frontmatter = parseFrontmatter(content);
    const name = frontmatter.name || path.basename(path.dirname(skillPath));
    const description = frontmatter.description || "";

    const nameKeywords = extractKeywords(name);
    const descKeywords = extractKeywords(description);
    const keywords = A.dedupe(A.appendAll(nameKeywords, descKeywords));

    return { name, keywords };
  });

const loadSkills = (cwd: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const skillsDir = path.join(cwd, ".claude", "skills");
    const exists = yield* fs.exists(skillsDir);

    if (!exists) return A.empty<SkillMetadata>();

    const entries = yield* fs.readDirectory(skillsDir);
    const skillEffects = A.map(entries, (entry) =>
      Effect.option(readSkillFile(path.join(skillsDir, entry, "SKILL.md")))
    );

    const skillOptions = yield* Effect.all(skillEffects, { concurrency: "unbounded" });
    return A.getSomes(skillOptions);
  });

export const matchesWordBoundary = (prompt: string, word: string): boolean => {
  const pattern = new RegExp(`\\b${Str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")(word)}\\b`, "i");
  return pattern.test(prompt);
};

export const MAX_SUGGESTIONS = 5;
export const MIN_SCORE = 2;
export const NAME_MATCH_BOOST = 3;
export const KEYWORD_MATCH_SCORE = 1;

export const scoreSkill = (prompt: string, skill: SkillMetadata): number => {
  const nameSegments = pipe(Str.toLowerCase(skill.name), Str.split(/-/));

  const nameScore = pipe(
    nameSegments,
    A.filter((seg) => Str.length(seg) >= 3),
    A.filter((seg) => matchesWordBoundary(prompt, seg)),
    A.length,
    (matches) => matches * NAME_MATCH_BOOST
  );

  const keywordScore = pipe(
    skill.keywords,
    A.filter((keyword) => matchesWordBoundary(prompt, keyword)),
    A.length,
    (matches) => matches * KEYWORD_MATCH_SCORE
  );

  return nameScore + keywordScore;
};

export const findMatchingSkills = (prompt: string, skills: ReadonlyArray<SkillMetadata>): ReadonlyArray<string> =>
  pipe(
    skills,
    A.map((skill) => ({ skill, score: scoreSkill(prompt, skill) })),
    A.filter(({ score }) => score >= MIN_SCORE),
    A.sort(Order.mapInput(Order.flip(Order.Number), (entry: { skill: SkillMetadata; score: number }) => entry.score)),
    A.take(MAX_SUGGESTIONS),
    A.map(({ skill }) => skill.name)
  );

const searchModules = (prompt: string, cwd: string) =>
  Effect.gen(function* () {
    const words = pipe(
      prompt,
      Str.toLowerCase,
      Str.split(/\s+/),
      A.filter((w) => Str.length(w) >= 4)
    );

    if (!A.isReadonlyArrayNonEmpty(words)) return O.none<string>();

    const pattern = words[0];

    const result = yield* pipe(
      Effect.gen(function* () {
        const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
        return yield* spawner.string(
          ChildProcess.make("bun", [".claude/scripts/context-crawler.ts", "--search", pattern], { cwd })
        );
      }),
      Effect.catch(() => Effect.succeed(""))
    );

    const countMatch = O.getOrNull(O.fromNullishOr(Str.match(/count="(\d+)"/)(result)));
    const count = countMatch ? Number.parseInt(countMatch[1], 10) : 0;

    if (count === 0) return O.none<string>();

    return O.some(Str.trim(result));
  });

const formatOutput = (context: string) =>
  S.encodeEffect(S.fromJsonString(OutputSchema))({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit" as const,
      additionalContext: context,
    },
  });

interface KgContextSymbol {
  readonly id: string;
  readonly kind: string;
  readonly provenance: string;
  readonly score: number;
}

interface KgContextRelationship {
  readonly from: string;
  readonly provenance: string;
  readonly score: number;
  readonly to: string;
  readonly type: string;
}

class SnapshotRecord extends S.Class<SnapshotRecord>($I`SnapshotRecord`)(
  {
    file: S.optionalKey(S.UndefinedOr(S.String)),
    nodeCount: S.optionalKey(S.UndefinedOr(S.Number)),
    edgeCount: S.optionalKey(S.UndefinedOr(S.Number)),
  },
  $I.annote("SnapshotRecord", {
    description: "Ast-kg snapshot line payload used for hook context ranking.",
  })
) {}

const SnapshotRecordFromJson = S.fromJsonString(SnapshotRecord);

const readLatestSnapshotFile = (cwd: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const snapshotRoot = path.join(cwd, "tooling", "ast-kg", ".cache", "snapshots");
    const exists = yield* fs.exists(snapshotRoot);
    if (!exists) {
      return O.none<string>();
    }

    const entries = pipe(yield* fs.readDirectory(snapshotRoot), A.filter(Str.endsWith(".jsonl")));
    if (A.isReadonlyArrayEmpty(entries)) {
      return O.none<string>();
    }

    const ordered = A.sort(entries, Order.flip(Order.String));
    const latest = pipe(ordered, A.head);
    return O.map(latest, (entry) => path.join(snapshotRoot, entry));
  }).pipe(Effect.catch(() => Effect.succeed(O.none<string>())));

const scoreSnapshotRecord = (promptKeywords: ReadonlyArray<string>, file: string): number => {
  const lowered = Str.toLowerCase(file);
  let score = 0;
  for (const keyword of promptKeywords) {
    if (Str.isNonEmpty(keyword) && Str.includes(keyword)(lowered)) {
      score += 1;
    }
  }
  return score;
};

const buildKgContextBlockEffect = (cwd: string, prompt: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const snapshotFile = yield* readLatestSnapshotFile(cwd);
    if (O.isNone(snapshotFile)) {
      return O.none<string>();
    }

    const content = yield* fs.readFileString(snapshotFile.value);
    const lines = pipe(Str.split("\n")(content), A.map(Str.trim), A.filter(Str.isNonEmpty));
    if (A.isReadonlyArrayEmpty(lines)) {
      return O.none<string>();
    }

    const promptKeywords = extractKeywords(prompt);
    const scored = pipe(
      lines,
      A.map((line) =>
        pipe(
          S.decodeUnknownOption(SnapshotRecordFromJson)(line),
          O.map((parsed) => {
            const file = O.getOrElse(O.fromUndefinedOr(parsed.file), thunkEmptyStr);
            return {
              file,
              nodeCount: O.getOrElse(O.fromUndefinedOr(parsed.nodeCount), thunk0),
              edgeCount: O.getOrElse(O.fromUndefinedOr(parsed.edgeCount), thunk0),
              score: scoreSnapshotRecord(promptKeywords, file),
            };
          }),
          O.getOrElse(() => ({
            file: "",
            nodeCount: 0,
            edgeCount: 0,
            score: 0,
          }))
        )
      ),
      A.filter(
        P.Struct({
          file: Str.isNonEmpty,
          score: (score) => score > 0,
        })
      ),
      A.sort(Order.mapInput(Order.flip(Order.Number), ({ score }: { readonly score: number }) => score)),
      A.take(8)
    );

    if (A.isReadonlyArrayEmpty(scored)) {
      return O.none<string>();
    }

    const symbols = A.map(
      scored,
      (entry): KgContextSymbol => ({
        id: `beep-effect3::${entry.file}::module:${entry.file}::module::${sha256(entry.file)}`,
        kind: "module",
        score: Math.min(0.99, 0.5 + entry.score * 0.1),
        provenance: "ast",
      })
    );

    const relationships = pipe(
      scored,
      A.take(7),
      A.map(
        (entry, index): KgContextRelationship => ({
          type: "CONTAINS",
          from: symbols[index]?.id ?? "",
          to: `${entry.file}#nodes:${String(entry.nodeCount)}#edges:${String(entry.edgeCount)}`,
          score: Math.min(0.95, 0.45 + entry.score * 0.1),
          provenance: "ast",
        })
      )
    );

    const symbolXml = pipe(
      symbols,
      A.map(
        (symbol) =>
          `<symbol id="${symbol.id}" kind="${symbol.kind}" score="${symbol.score.toFixed(2)}" provenance="${symbol.provenance}" />`
      ),
      A.join("\n")
    );

    const relationshipXml = pipe(
      relationships,
      A.filter((relationship) => relationship.from.length > 0),
      A.take(14),
      A.map(
        (relationship) =>
          `<relationship type="${relationship.type}" from="${relationship.from}" to="${relationship.to}" score="${relationship.score.toFixed(2)}" provenance="${relationship.provenance}" />`
      ),
      A.join("\n")
    );

    const block = pipe(
      [
        `<kg-context version="1">`,
        `<symbols>`,
        symbolXml,
        `</symbols>`,
        `<relationships>`,
        relationshipXml,
        `</relationships>`,
        `<confidence overall="0.70" />`,
        `<provenance local-cache="true" graphiti="false" commit="snapshot" />`,
        `</kg-context>`,
      ],
      A.join("\n")
    );

    return block.length > 6000 ? O.none<string>() : O.some(block);
  }).pipe(Effect.catch(() => Effect.succeed(O.none<string>())));

export const buildKgContextBlock = (cwd: string, prompt: string): O.Option<string> =>
  Effect.runSync(
    buildKgContextBlockEffect(cwd, prompt).pipe(Effect.provide(BunServices.layer), Effect.orElseSucceed(O.none<string>))
  );

const sha256 = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal;

  const stdin = yield* terminal.readLine;
  const raw = yield* S.decodeEffect(S.fromJsonString(LenientUserPromptInput))(stdin);
  const prompt = raw.prompt || raw.user_prompt || "";
  const input = { ...raw, prompt };

  const previousState = yield* readHookState(input.cwd);
  const currentCallMs = yield* Clock.currentTimeMillis;
  yield* writeHookState(input.cwd, new HookState({ lastCallMs: currentCallMs }));

  const skills = yield* loadSkills(input.cwd);
  const matchingSkills = findMatchingSkills(input.prompt, skills);

  // Search for matching modules based on user input
  const moduleSearchResult = yield* searchModules(input.prompt, input.cwd);

  // Fetch mise tasks if prompt indicates script execution intent
  const miseTasksResult = shouldShowMiseTasks(input.prompt) ? yield* fetchMiseTasks(input.cwd) : O.none<string>();

  // Build context parts
  const parts = A.empty<string>();

  // Add hook state tracking
  const elapsedMs = previousState.lastCallMs ? currentCallMs - previousState.lastCallMs : "n/a";
  parts.push(`<hook_state>
previous_call: ${previousState.lastCallMs ?? "none"}
current_call: ${currentCallMs}
elapsed_ms: ${elapsedMs}
</hook_state>`);

  // Always show matched skills if any
  if (A.isReadonlyArrayNonEmpty(matchingSkills)) {
    parts.push(`<skills>${A.join(matchingSkills, ", ")}</skills>`);
  }

  // Always show matching modules if found
  if (O.isSome(moduleSearchResult)) {
    parts.push(`<relevant-modules>\n${moduleSearchResult.value}\n</relevant-modules>`);
  }

  // Show mise tasks when user indicates script execution intent
  if (O.isSome(miseTasksResult)) {
    parts.push(`<available-scripts>
Run these with: mise run <task-name>
${miseTasksResult.value}
</available-scripts>`);
  }

  const kgHookEnabled = yield* Config.boolean("BEEP_KG_HOOK_ENABLED").pipe(Config.withDefault(true));
  if (kgHookEnabled) {
    const kgContext = yield* buildKgContextBlockEffect(input.cwd, input.prompt);
    if (O.isSome(kgContext)) {
      parts.push(kgContext.value);
    }
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
</critical_thinking>`);

  // Forbidden tools reminder
  parts.push(`<FORBIDDEN_TOOLS>
NEVER USE BACKGROUND AGENTS IF YOU READ THEM:
- Background + wait → insane context waste (full output in context)
- Regular Parallel Agents → context efficient
- Background + other works → you can use background agents if you genuinely perform other work and don't sit and wait for output.

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
</FORBIDDEN_TOOLS>`);

  // Fix loop detection
  parts.push(`<fix_loops>
-- Fix loops indicate symptom-chasing, not root cause understanding
inFixLoop :: [Attempt] → Bool
inFixLoop attempts = length attempts > 2 ∧ ¬progressing attempts

-- When in fix loop: step back, reassess, don't try harder
</fix_loops>`);

  // Delegation enforcement
  parts.push(`<DELEGATION_RULES>
handle :: Task → Effect ()
handle task = spawn agent task  -- ALWAYS. NO EXCEPTIONS.

-- "It's just one small edit" → NO. Delegate.
-- "I'll quickly check this" → NO. Delegate.
-- "This is trivial" → NO. Delegate.

minimum_agents :: NonTrivialTask → Int
minimum_agents _ = 3  -- If fewer, decompose more
</DELEGATION_RULES>`);

  // Gates (delegation rules)
  parts.push(`<GATES>
-- Implementation agents: run gates directly via Bash
-- Orchestrating agents: DELEGATE gates to implementation agents

typecheck :: Scope → Effect Result
typecheck scope = Bash "mise run typecheck:pkg"

test :: Package → Effect Result
test pkg = Bash "mise run test:pkg"

-- Report success ONLY when both pass
</GATES>`);

  parts.push(`<TODO_ENFORCEMENT>
-- Todos are MANDATORY infrastructure, not optional

createTodos :: Task → [Todo] ++ gateTodos
gateTodos = ["Run typecheck gate", "Run test gate"]

-- Every non-trivial task MUST have:
-- 1. Decomposed subtask todos
-- 2. Gate todos (typecheck + test)

-- No todos = No visibility = Violation
</TODO_ENFORCEMENT>`);

  parts.push(`<code-field>
¬code     ← ¬assumptions
¬correct  ← ¬verified
¬happy    ← ¬edges
correct   := conditions(works)?
</code-field>`);

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
</SUBAGENT_PROMPTING>`);

  parts.push(`<memory-and-modules>
Manage memories via /memory-management, discover modules via /module.
These tools condense knowledge in a memory-efficient manner.
Prefer these over manual exploration and memory management.

- /memory-management: Query, store, search persistent knowledge across sessions
- /modules: List all ai-context modules with summaries
- /module [path]: Get full context for specific module
- /module-search [pattern]: Find modules by keyword
</memory-and-modules>`);

  const version = yield* pipe(
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      return yield* spawner.string(
        ChildProcess.make("bun", ["-e", "console.log(require('./package.json').version)"], { cwd: input.cwd })
      );
    }),
    Effect.map(Str.trim),
    Effect.catch(() => Effect.succeed("unknown"))
  );
  parts.push(`<version>${version}</version>`);

  // Only output if we have content
  if (A.isReadonlyArrayNonEmpty(parts)) {
    const context = `<system-hints>\n${A.join(parts, "\n")}\n</system-hints>`;
    const formatted = yield* formatOutput(context);
    yield* Console.log(formatted);
  }
});

const runnable = pipe(
  program,
  Effect.provide(BunServices.layer),
  Effect.catch(() => Effect.void)
);

BunRuntime.runMain(runnable);
