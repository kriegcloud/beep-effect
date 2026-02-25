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

import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Console, Effect, FileSystem, HashSet, Order, Path, pipe, Terminal } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess } from "effect/unstable/process";

const LenientUserPromptInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String.pipe(S.withDecodingDefault(() => "")),
  cwd: S.String,
  permission_mode: S.String.pipe(S.withDecodingDefault(() => "default")),
  hook_event_name: S.Literal("UserPromptSubmit"),
  prompt: S.String.pipe(S.withDecodingDefault(() => "")),
  user_prompt: S.String.pipe(S.withDecodingDefault(() => "")),
});

export interface SkillMetadata {
  readonly name: string;
  readonly keywords: ReadonlyArray<string>;
}

interface HookState {
  readonly lastCallMs: number | null;
}

const readHookState = (cwd: string): HookState => {
  try {
    const statePath = `${cwd}/.claude/.hook-state.json`;
    const content = fs.readFileSync(statePath, "utf-8");
    const parsed = JSON.parse(content);
    return { lastCallMs: typeof parsed.lastCallMs === "number" ? parsed.lastCallMs : null };
  } catch {
    return { lastCallMs: null };
  }
};

const writeHookState = (cwd: string, state: HookState): void => {
  try {
    const statePath = `${cwd}/.claude/.hook-state.json`;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
  } catch {}
};

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
    if (lowered.includes(keyword)) return true;
  }
  return false;
};

const fetchMiseTasks = (cwd: string) =>
  Effect.gen(function* () {
    const result = yield* pipe(
      ChildProcess.make({ cwd })`mise tasks --json`,
      ChildProcess.string,
      Effect.flatMap((s) => S.decodeUnknownEffect(S.fromJsonString(MiseTasks))(s)),
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

const OutputSchema = S.Struct({
  hookSpecificOutput: S.Struct({
    hookEventName: S.Literal("UserPromptSubmit"),
    additionalContext: S.String,
  }),
});

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
    (n) => n * NAME_MATCH_BOOST
  );

  const keywordScore = pipe(
    skill.keywords,
    A.filter((keyword) => matchesWordBoundary(prompt, keyword)),
    A.length,
    (n) => n * KEYWORD_MATCH_SCORE
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
      ChildProcess.make("bun", [".claude/scripts/context-crawler.ts", "--search", pattern], { cwd }),
      ChildProcess.string,
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
  readonly score: number;
  readonly provenance: string;
}

interface KgContextRelationship {
  readonly type: string;
  readonly from: string;
  readonly to: string;
  readonly score: number;
  readonly provenance: string;
}

const readLatestSnapshotFile = (cwd: string): O.Option<string> => {
  try {
    const snapshotRoot = `${cwd}/tooling/ast-kg/.cache/snapshots`;
    const entries = fs.readdirSync(snapshotRoot).filter((entry) => entry.endsWith(".jsonl"));
    if (entries.length === 0) {
      return O.none();
    }

    const latest = entries
      .map((entry) => {
        const fullPath = `${snapshotRoot}/${entry}`;
        const stat = fs.statSync(fullPath);
        return {
          fullPath,
          mtime: stat.mtimeMs,
        };
      })
      .sort((left, right) => right.mtime - left.mtime)
      .at(0);

    return latest === undefined ? O.none() : O.some(latest.fullPath);
  } catch {
    return O.none();
  }
};

const scoreSnapshotRecord = (promptKeywords: ReadonlyArray<string>, file: string): number => {
  const lowered = Str.toLowerCase(file);
  let score = 0;
  for (const keyword of promptKeywords) {
    if (keyword.length > 0 && lowered.includes(keyword)) {
      score += 1;
    }
  }
  return score;
};

export const buildKgContextBlock = (cwd: string, prompt: string): O.Option<string> => {
  try {
    const snapshotFile = readLatestSnapshotFile(cwd);
    if (O.isNone(snapshotFile)) {
      return O.none();
    }

    const content = fs.readFileSync(snapshotFile.value, "utf8");
    const lines = Str.split(content, "\n")
      .map((line) => Str.trim(line))
      .filter((line) => line.length > 0);
    if (lines.length === 0) {
      return O.none();
    }

    const promptKeywords = extractKeywords(prompt);
    const scored = lines
      .map((line) => {
        try {
          const parsed = JSON.parse(line) as {
            readonly file?: string;
            readonly nodeCount?: number;
            readonly edgeCount?: number;
          };
          const file = parsed.file ?? "";
          return {
            file,
            nodeCount: parsed.nodeCount ?? 0,
            edgeCount: parsed.edgeCount ?? 0,
            score: scoreSnapshotRecord(promptKeywords, file),
          };
        } catch {
          return {
            file: "",
            nodeCount: 0,
            edgeCount: 0,
            score: 0,
          };
        }
      })
      .filter((entry) => entry.file.length > 0 && entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 8);

    if (scored.length === 0) {
      return O.none();
    }

    const symbols: ReadonlyArray<KgContextSymbol> = scored.map((entry) => ({
      id: `beep-effect3::${entry.file}::module:${entry.file}::module::${sha256(entry.file)}`,
      kind: "module",
      score: Math.min(0.99, 0.5 + entry.score * 0.1),
      provenance: "ast",
    }));

    const relationships: ReadonlyArray<KgContextRelationship> = scored.slice(0, 7).map((entry, index) => ({
      type: "CONTAINS",
      from: symbols[index]?.id ?? "",
      to: `${entry.file}#nodes:${String(entry.nodeCount)}#edges:${String(entry.edgeCount)}`,
      score: Math.min(0.95, 0.45 + entry.score * 0.1),
      provenance: "ast",
    }));

    const symbolXml = symbols
      .map(
        (symbol) =>
          `<symbol id="${symbol.id}" kind="${symbol.kind}" score="${symbol.score.toFixed(2)}" provenance="${symbol.provenance}" />`
      )
      .join("\n");
    const relationshipXml = relationships
      .filter((relationship) => relationship.from.length > 0)
      .slice(0, 14)
      .map(
        (relationship) =>
          `<relationship type="${relationship.type}" from="${relationship.from}" to="${relationship.to}" score="${relationship.score.toFixed(2)}" provenance="${relationship.provenance}" />`
      )
      .join("\n");

    const block = [
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
    ].join("\n");

    return block.length > 6000 ? O.none() : O.some(block);
  } catch {
    return O.none();
  }
};

const sha256 = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal;

  const stdin = yield* terminal.readLine;
  const raw = yield* S.decodeEffect(S.fromJsonString(LenientUserPromptInput))(stdin);
  const prompt = raw.prompt || raw.user_prompt || "";
  const input = { ...raw, prompt };

  const previousState = readHookState(input.cwd);
  const currentCallMs = Date.now();
  writeHookState(input.cwd, { lastCallMs: currentCallMs });

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
    parts.push(`<skills>${matchingSkills.join(", ")}</skills>`);
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

  const kgHookEnabled = process.env.BEEP_KG_HOOK_ENABLED !== "false";
  if (kgHookEnabled) {
    const kgContext = buildKgContextBlock(input.cwd, input.prompt);
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
    ChildProcess.make("bun", ["-e", "console.log(require('./package.json').version)"], { cwd: input.cwd }),
    ChildProcess.string,
    Effect.map((v) => Str.trim(v)),
    Effect.catch(() => Effect.succeed("unknown"))
  );
  parts.push(`<version>${version}</version>`);

  // Only output if we have content
  if (parts.length > 0) {
    const context = `<system-hints>\n${parts.join("\n")}\n</system-hints>`;
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
