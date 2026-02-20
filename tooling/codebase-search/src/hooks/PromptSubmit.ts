/**
 * UserPromptSubmit hook for Claude Code integration. Receives the user's
 * prompt, performs a BM25 keyword search against the codebase index, and
 * returns relevant context formatted as a system-reminder block.
 *
 * Designed to complete within 5000ms and never throw.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { Effect, FileSystem, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

import { Bm25Writer, Bm25WriterLive } from "../indexer/index.js";
import { HOOK_SIGNATURE_MAX_LENGTH, truncateSignature } from "../mcp/formatters.js";
import { INDEX_DIR } from "./SessionStart.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Minimum prompt length to trigger a codebase search.
 * Prompts shorter than this are assumed to be too vague.
 *
 * @since 0.0.0
 * @category constants
 */
export const MIN_PROMPT_LENGTH = 15;

/**
 * Maximum length of the constructed search query after stripping prefixes.
 *
 * @since 0.0.0
 * @category constants
 */
export const MAX_QUERY_LENGTH = 200;

/**
 * Minimum BM25 score threshold for including a result.
 *
 * @since 0.0.0
 * @category constants
 */
export const MIN_SCORE = 0.35;

/**
 * Maximum number of search results to return.
 *
 * @since 0.0.0
 * @category constants
 */
export const MAX_RESULTS = 5;

/**
 * File name for the BM25 index JSON file.
 *
 * @since 0.0.0
 * @category constants
 */
export const BM25_INDEX_FILE = "bm25-index.json" as const;

// ---------------------------------------------------------------------------
// PromptSubmitInput Schema
// ---------------------------------------------------------------------------

/**
 * Input received from Claude Code on user prompt submission via stdin.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PromptSubmitInput = S.Struct({
  prompt: S.String,
  cwd: S.String,
  sessionId: S.String,
}).annotate({
  identifier: "@beep/codebase-search/hooks/PromptSubmit/PromptSubmitInput",
  title: "Prompt Submit Input",
  description: "Input received from Claude Code on user prompt submission via stdin.",
});

/**
 * TypeScript type derived from the PromptSubmitInput schema.
 *
 * @since 0.0.0
 * @category types
 */
export type PromptSubmitInput = typeof PromptSubmitInput.Type;

// ---------------------------------------------------------------------------
// SearchResultForHook
// ---------------------------------------------------------------------------

/**
 * Lightweight search result shape used for formatting hook output.
 * Contains only the fields needed for the system-reminder block.
 *
 * @since 0.0.0
 * @category types
 */
export interface SearchResultForHook {
  readonly name: string;
  readonly kind: string;
  readonly filePath: string;
  readonly startLine: number;
  readonly description: string;
  readonly signature: string;
}

// ---------------------------------------------------------------------------
// shouldSkipSearch
// ---------------------------------------------------------------------------

/** @internal Slash command pattern: starts with / */
const SLASH_CMD_RE = /^\//;

/** @internal Conversational responses */
const CONVERSATIONAL_RE = /^(yes|no|ok|thanks|sure|got it|sounds good)\b/i;

/** @internal Questions about Claude / general knowledge */
const KNOWLEDGE_RE = /^(what is|who is|when did|how does claude)\b/i;

/** @internal Git operations */
const GIT_OPS_RE = /^(commit|push|pull|merge|rebase|checkout|branch)\b/i;

/** @internal Build/run commands (followed by space or end of string) */
const BUILD_CMD_RE = /^(run|test|build|lint|format)(\s|$)/i;

/**
 * @param re re parameter value.
 * @param str str parameter value.
 * @internal Helper: test a regex against a string, returning boolean
 * @returns Returns the computed value.
 */
const testRegex = (re: RegExp, str: string): boolean => O.isSome(pipe(Str.match(re)(str), O.fromNullishOr));

/**
 * Determines if a prompt should skip search. Returns `true` when the
 * prompt is too short, is a slash command, conversational response,
 * general knowledge question, git operation, or build command.
 *
 * @param prompt prompt parameter value.
 * @since 0.0.0
 * @category filters
 * @returns Returns the computed value.
 */
export const shouldSkipSearch = (prompt: string): boolean => {
  const trimmed = Str.trim(prompt);

  // 1. Too short
  if (Str.length(trimmed) < MIN_PROMPT_LENGTH) {
    return true;
  }

  // 2. Slash command
  if (testRegex(SLASH_CMD_RE, trimmed)) {
    return true;
  }

  // 3. Conversational response
  if (testRegex(CONVERSATIONAL_RE, trimmed)) {
    return true;
  }

  // 4. General knowledge question
  if (testRegex(KNOWLEDGE_RE, trimmed)) {
    return true;
  }

  // 5. Git operation
  // 6. Build/run command
  return testRegex(GIT_OPS_RE, trimmed) || testRegex(BUILD_CMD_RE, trimmed);
};

// ---------------------------------------------------------------------------
// constructSearchQuery
// ---------------------------------------------------------------------------

/** @internal Polite prefix patterns to strip */
const POLITE_PREFIXES_RE = /^(please\s+|can you\s+|i need to\s+|help me\s+|let's\s+)/i;

/** @internal Action verb prefixes to strip (with optional article) */
const ACTION_PREFIXES_RE = /^(create|add|implement|build|write|make)\s+(a\s+|an\s+|the\s+)?/i;

/**
 * Strips polite and action prefixes from a prompt and truncates the
 * result to a maximum of 200 characters. If the stripped query exceeds
 * 200 characters, extracts the first sentence (up to the first period
 * followed by a space) or slices to 200 characters.
 *
 * @param prompt prompt parameter value.
 * @since 0.0.0
 * @category builders
 * @returns Returns the computed value.
 */
export const constructSearchQuery = (prompt: string): string => {
  // 1. Trim first so anchored regexes work on leading content
  let query = Str.trim(prompt);

  // 2. Strip polite prefixes
  query = query.replace(POLITE_PREFIXES_RE, "");

  // 3. Strip action verb prefixes
  query = query.replace(ACTION_PREFIXES_RE, "");

  // 4. Trim again after stripping
  query = Str.trim(query);

  // 5. Truncate
  if (Str.length(query) > MAX_QUERY_LENGTH) {
    // Try to extract the first sentence
    const firstSentenceOpt = pipe(
      Str.match(/^[^.]+\.\s/)(query),
      O.fromNullishOr,
      O.flatMap((m) => A.get(A.fromIterable(m), 0)),
      O.filter((s) => Str.length(s) > 0 && Str.length(s) <= MAX_QUERY_LENGTH)
    );
    if (O.isSome(firstSentenceOpt)) {
      return Str.trim(firstSentenceOpt.value);
    }
    return query.slice(0, MAX_QUERY_LENGTH);
  }

  return query;
};

// ---------------------------------------------------------------------------
// formatContextInjection
// ---------------------------------------------------------------------------

/** @internal Maximum signature length uses the shared constant from formatters. */
const MAX_SIGNATURE_LENGTH = HOOK_SIGNATURE_MAX_LENGTH;

/**
 * Formats search results as a system-reminder block suitable for
 * injection into the Claude Code context. Returns an empty string
 * when no results are provided.
 *
 * @param results results parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const formatContextInjection = (results: ReadonlyArray<SearchResultForHook>): string => {
  if (A.length(results) === 0) {
    return "";
  }

  const formattedResults = pipe(
    results,
    A.map((r) => {
      const truncatedSig = truncateSignature(r.signature, MAX_SIGNATURE_LENGTH);
      const sigLine = Str.length(truncatedSig) > 0 ? `\n    \`${truncatedSig}\`` : "";
      return `- **${r.name}** (${r.kind}) in \`${r.filePath}:${String(r.startLine)}\`\n    ${r.description}${sigLine}`;
    }),
    A.join("\n")
  );

  return pipe(
    A.make(
      "<system-reminder>",
      "## Relevant Existing Code (auto-discovered)",
      "",
      formattedResults,
      "",
      "Consider reusing or extending these before creating new implementations.",
      "Use `search_codebase` MCP tool for more detailed results.",
      "</system-reminder>"
    ),
    A.join("\n")
  );
};

// ---------------------------------------------------------------------------
// formatSymbolIdResults
// ---------------------------------------------------------------------------

/**
 * Formats BM25 search results (symbolId + score) into a system-reminder
 * block. The symbolId format `{pkg}/{module}/{name}` is informative
 * enough to guide the agent without requiring full metadata lookups.
 *
 * @param results results parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const formatSymbolIdResults = (
  results: ReadonlyArray<{ readonly symbolId: string; readonly score: number }>
): string => {
  if (A.length(results) === 0) {
    return "";
  }

  const formattedResults = pipe(
    results,
    A.map((r) => {
      // symbolId format: @pkg/module/Name — extract parts
      const parts = A.fromIterable(r.symbolId.split("/"));
      const name = pipe(
        A.get(parts, A.length(parts) - 1),
        O.getOrElse(() => r.symbolId)
      );
      // Reconstruct a readable path: everything except the last part is the module path
      const modulePath = pipe(parts, A.take(A.length(parts) - 1), A.join("/"));
      return `- **${name}** in \`${modulePath}\` (score: ${r.score.toFixed(2)})`;
    }),
    A.join("\n")
  );

  return pipe(
    A.make(
      "<system-reminder>",
      "## Relevant Existing Code (auto-discovered)",
      "",
      formattedResults,
      "",
      "Consider reusing or extending these before creating new implementations.",
      "Use `search_codebase` MCP tool for more detailed results.",
      "</system-reminder>"
    ),
    A.join("\n")
  );
};

// ---------------------------------------------------------------------------
// promptSubmitHook
// ---------------------------------------------------------------------------

/**
 * The main hook Effect that receives the user's prompt, executes a BM25
 * keyword search against the codebase index, and returns formatted
 * context as a system-reminder block. Never fails -- all errors are
 * caught and result in an empty string.
 *
 * @since 0.0.0
 * @category hooks
 */
export const promptSubmitHook: (
  cwd: string,
  prompt: string
) => Effect.Effect<string, never, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (
  cwd: string,
  prompt: string
) {
  // 1. Check if we should skip
  if (shouldSkipSearch(prompt)) {
    return "";
  }

  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // 2. Build path to .code-index/
  const indexDir = path.join(cwd, INDEX_DIR);
  const bm25Path = path.join(indexDir, BM25_INDEX_FILE);

  // 3. Check if BM25 index exists
  const indexExists = yield* fs.exists(bm25Path).pipe(Effect.orElseSucceed(() => false));

  if (!indexExists) {
    return "";
  }

  // 4. Construct search query
  const query = constructSearchQuery(prompt);

  if (Str.isEmpty(Str.trim(query))) {
    return "";
  }

  // 5. Load BM25 index and search
  const searchResult = yield* Effect.gen(function* () {
    const bm25 = yield* Bm25Writer;
    yield* bm25.load();
    return yield* bm25.search(query, MAX_RESULTS);
  }).pipe(
    Effect.provide(Bm25WriterLive(indexDir)),
    Effect.map(O.some),
    Effect.orElseSucceed(O.none<ReadonlyArray<{ readonly symbolId: string; readonly score: number }>>)
  );

  if (O.isNone(searchResult)) {
    return "";
  }

  // 6. Filter by minimum score
  const filtered = A.filter(searchResult.value, (r) => r.score >= MIN_SCORE);

  // 7. Format output
  return formatSymbolIdResults(filtered);
});
