# Hook Integration Design

> P2 Design Document — Defines Claude Code hook integration for transparent auto-injection of relevant codebase context.

## Overview

Two hooks provide transparent context injection without requiring the user to explicitly invoke MCP tools:

1. **SessionStart** — Injects project overview when a new Claude Code session begins
2. **UserPromptSubmit** — Searches the index on every user message and injects relevant context

Both hooks run as Node.js scripts that communicate with the LanceDB index directly (no MCP server needed — they read the index files on disk).

---

## Hook Configuration

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "node ./tooling/codebase-search/dist/hooks/session-start.js",
        "timeout": 5000
      }
    ],
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "node ./tooling/codebase-search/dist/hooks/prompt-submit.js",
        "timeout": 5000
      }
    ]
  }
}
```

Location: `.claude/settings.json` (project-level)

---

## Hook 1: SessionStart

### Purpose

Inject a compact project overview into Claude's context at session start. Gives Claude awareness of what packages exist, how many symbols are indexed, and what search tools are available.

### Trigger Condition

Fires once when a new Claude Code session begins. Does NOT fire on conversation clear or context compression.

### Input

The hook receives a JSON object on stdin:

```typescript
interface SessionStartInput {
  /** Current working directory */
  readonly cwd: string
  /** Session identifier */
  readonly sessionId: string
}
```

### Processing Logic

```typescript
const sessionStart = async (input: SessionStartInput): Promise<string> => {
  const indexPath = path.join(input.cwd, ".code-index")

  // 1. Check if index exists
  if (!existsSync(indexPath)) {
    return [
      "## Codebase Search Available",
      "",
      "No index found. Run `reindex` MCP tool with mode='full' to build the initial index.",
      "After indexing, use `search_codebase` to find existing patterns before writing new code.",
    ].join("\n")
  }

  // 2. Open LanceDB and compute stats
  const db = await lancedb.connect(indexPath)
  const table = await db.openTable("symbols")
  const count = await table.countRows()

  // 3. Compute per-package, per-kind breakdown
  const packageStats = await table
    .search()
    .select(["package", "kind"])
    .limit(count)
    .toArray()

  const packages = groupBy(packageStats, "package")
  const kinds = groupBy(packageStats, "kind")

  // 4. Check index freshness
  const indexAge = await getIndexAge(indexPath)
  const staleWarning = indexAge > 3600_000
    ? "\n⚠️ Index is over 1 hour old. Consider running `reindex` for fresh results."
    : ""

  // 5. Format overview
  return [
    "## Codebase Index Overview",
    "",
    `**${count} symbols** indexed across **${Object.keys(packages).length} packages**:`,
    "",
    ...Object.entries(packages).map(([pkg, symbols]) =>
      `- **${pkg}**: ${symbols.length} symbols (${summarizeKinds(symbols)})`
    ),
    "",
    "**Available MCP tools:**",
    "- `search_codebase` — Semantic search for existing code patterns",
    "- `find_related` — Navigate symbol relationships",
    "- `browse_symbols` — Explore package/module structure",
    "- `reindex` — Refresh the search index",
    "",
    "Always search for existing patterns before creating new schemas, services, or utilities.",
    staleWarning,
  ].join("\n")
}
```

### Output Format

```markdown
## Codebase Index Overview

**127 symbols** indexed across **2 packages**:

- **@beep/repo-utils**: 89 symbols (24 schemas, 8 services, 6 layers, 5 errors, 31 functions, 12 types, 3 constants)
- **@beep/repo-cli**: 38 symbols (2 schemas, 4 commands, 18 functions, 8 types, 6 constants)

**Available MCP tools:**
- `search_codebase` — Semantic search for existing code patterns
- `find_related` — Navigate symbol relationships
- `browse_symbols` — Explore package/module structure
- `reindex` — Refresh the search index

Always search for existing patterns before creating new schemas, services, or utilities.
```

### Token Budget: ~200-400 tokens

### Timeout: 5,000ms (index stats are fast local reads)

---

## Hook 2: UserPromptSubmit

### Purpose

Automatically search the index when the user sends a message, injecting relevant codebase context that Claude can use without explicit tool calls. This is the primary mechanism for preventing duplicate code.

### Trigger Condition

Fires on every user message submission. The hook internally decides whether to inject context based on relevance scoring.

### Input

```typescript
interface UserPromptSubmitInput {
  /** The user's prompt text */
  readonly prompt: string
  /** Current working directory */
  readonly cwd: string
  /** Session identifier */
  readonly sessionId: string
}
```

### Processing Logic

```typescript
const promptSubmit = async (input: UserPromptSubmitInput): Promise<string> => {
  const indexPath = path.join(input.cwd, ".code-index")

  // 1. Skip if no index
  if (!existsSync(indexPath)) return ""

  // 2. Skip non-code prompts (short messages, questions about Claude Code itself)
  if (shouldSkipSearch(input.prompt)) return ""

  // 3. Construct search query from user prompt
  const query = constructSearchQuery(input.prompt)

  // 4. Execute hybrid search (vector + BM25)
  const results = await hybridSearch(indexPath, query, { limit: 5, minScore: 0.35 })

  // 5. Skip if no relevant results
  if (results.length === 0) return ""

  // 6. Format and return context injection
  return formatContextInjection(results)
}
```

### Query Construction

```typescript
/**
 * Transforms a user prompt into a search query.
 *
 * Strategy:
 * 1. If prompt mentions specific symbol names → use as-is (BM25 will match)
 * 2. If prompt describes behavior → extract action phrases
 * 3. If prompt asks to create/add → extract the target concept
 * 4. Truncate to 200 chars (embedding model context)
 */
const constructSearchQuery = (prompt: string): string => {
  // Remove common prefixes that don't help search
  let query = prompt
    .replace(/^(please |can you |i need to |help me |let's )/i, "")
    .replace(/^(create|add|implement|build|write|make)\s+(a |an |the )?/i, "")
    .trim()

  // If prompt is very long, extract the first sentence or clause
  if (query.length > 200) {
    const firstSentence = query.match(/^[^.!?\n]+[.!?]?/)
    query = firstSentence ? firstSentence[0] : query.slice(0, 200)
  }

  return query
}

/**
 * Determines if a prompt is unlikely to benefit from codebase search.
 */
const shouldSkipSearch = (prompt: string): boolean => {
  // Too short to be meaningful
  if (prompt.length < 15) return true

  // Conversational / meta-prompts
  const skipPatterns = [
    /^(yes|no|ok|thanks|thank you|got it|sure|sounds good)/i,
    /^(what is|who is|when did|how does claude)/i,
    /^\/\w+/,  // Slash commands
    /^(commit|push|pull|merge|rebase|checkout|branch)/i,  // Git operations
    /^(run|test|build|lint|format)\s/i,  // Build commands
  ]

  return skipPatterns.some((p) => p.test(prompt.trim()))
}
```

### Relevance Threshold

```typescript
/**
 * Minimum score thresholds for context injection.
 *
 * Below these thresholds, results are not injected — they would
 * add noise without value. Users can always use search_codebase
 * MCP tool explicitly for lower-confidence searches.
 */
const RELEVANCE_THRESHOLDS = {
  /** Minimum RRF score to include a result (0-1 scale) */
  minScore: 0.35,

  /** Minimum number of results to bother injecting */
  minResults: 1,

  /** Maximum results to inject (keep context compact) */
  maxResults: 5,

  /** Maximum total tokens for injection (~800 tokens) */
  maxTokens: 800,
} as const
```

### Output Format

```typescript
const formatContextInjection = (results: ReadonlyArray<SearchResult>): string => {
  if (results.length === 0) return ""

  const items = results.map((r) =>
    [
      `- **${r.name}** (${r.kind}) in \`${r.filePath}:${r.startLine}\``,
      `  ${r.description}`,
      r.signature.length <= 120 ? `  \`${r.signature}\`` : "",
    ].filter(Boolean).join("\n")
  )

  return [
    "<system-reminder>",
    "## Relevant Existing Code (auto-discovered)",
    "",
    ...items,
    "",
    "Consider reusing or extending these before creating new implementations.",
    "Use `search_codebase` MCP tool for more detailed results.",
    "</system-reminder>",
  ].join("\n")
}
```

### Example Injection

User types: "Create a schema for validating workspace configuration"

Hook injects:

```markdown
<system-reminder>
## Relevant Existing Code (auto-discovered)

- **PackageJsonSchema** (schema) in `tooling/repo-utils/src/schemas/PackageJson.ts:15`
  Validates and brands npm package.json manifest fields with comprehensive field-level annotations.
  `S.Struct({ name: PackageName, version: PackageVersion, ... })`

- **WorkspaceResolver** (service) in `tooling/repo-utils/src/services/WorkspaceResolver.ts:8`
  Discovers and resolves workspace packages in a monorepo by walking the filesystem.

- **readPackageJson** (function) in `tooling/repo-utils/src/constructors/readPackageJson.ts:12`
  Reads and validates a package.json file at the given path through the PackageJson schema.

Consider reusing or extending these before creating new implementations.
Use `search_codebase` MCP tool for more detailed results.
</system-reminder>
```

### Token Budget: ~300-800 tokens per injection (depends on result count)

### Timeout: 5,000ms total budget

```typescript
/**
 * Performance budget breakdown:
 *
 * - Index open (warm): ~5ms (LanceDB memory-mapped)
 * - Index open (cold): ~50ms
 * - Query embedding: ~100-200ms (ONNX inference)
 * - Vector search: ~20-50ms (LanceDB IVF)
 * - BM25 search: ~10-30ms
 * - RRF fusion: ~1ms
 * - Formatting: ~1ms
 *
 * Total (warm): ~150-300ms
 * Total (cold): ~200-350ms
 * Budget: 5,000ms (generous margin for model loading)
 *
 * If embedding model is not loaded:
 * - First query: ~2-3s (model load + inference)
 * - Subsequent: ~150-300ms
 */
```

---

## Caching Strategy

### Embedding Model Cache

The ONNX embedding model (~521MB) is loaded once and kept in memory by the MCP server process. The hooks, running as separate Node.js processes, would need to reload the model each time — this is too slow.

**Solution: Shared index with pre-computed embeddings.**

Hooks do NOT embed the query themselves. Instead:

```typescript
/**
 * Hook search strategy (no model loading required):
 *
 * 1. Tokenize the query for BM25 keyword search
 * 2. Execute BM25 search only (fast, no model needed)
 * 3. If BM25 returns high-confidence results (score > 0.5), use them
 * 4. Otherwise, fall through to empty (user can use MCP tool for full hybrid search)
 *
 * This means hooks use keyword-only search, while MCP tools use full hybrid.
 * Keyword search is sufficient for transparent auto-injection because:
 * - Users mention specific concepts (package, schema, service) that match keywords
 * - BM25 catches exact name matches that vector search might rank lower
 * - The MCP tool provides full semantic search when the user explicitly needs it
 */
```

Alternative: Run a persistent daemon that keeps the model warm.

```typescript
/**
 * Daemon approach (if keyword-only is insufficient):
 *
 * 1. SessionStart hook launches a background process holding the model
 * 2. UserPromptSubmit hook sends query to daemon via Unix socket
 * 3. Daemon embeds query and searches LanceDB
 * 4. Returns results to hook process via socket
 *
 * Socket path: /tmp/codebase-search-{cwd-hash}.sock
 * Daemon auto-exits after 30 minutes of inactivity.
 */
```

Recommendation: **Start with BM25-only hooks.** If precision is too low, upgrade to daemon approach in P5.

---

## Error Handling

Hooks MUST NOT crash or block the user experience:

```typescript
const safeExecute = async (fn: () => Promise<string>): Promise<string> => {
  try {
    return await fn()
  } catch (error) {
    // Log error for debugging but return empty string
    // (no injection is better than crashing the hook)
    if (process.env.DEBUG === "1") {
      console.error(`[codebase-search] Hook error: ${error}`)
    }
    return ""
  }
}
```

Rules:
1. **Never throw** — return empty string on any error
2. **Never exceed timeout** — process.exit after 4.5s safety margin
3. **Never block** — all I/O is async
4. **Degrade gracefully** — if index is stale/missing, skip silently

---

## Testing Strategy

```typescript
// Hook unit tests use the standard vitest + Effect pattern
import { describe, it, expect } from "vitest"

describe("constructSearchQuery", () => {
  it("strips 'please create a' prefix", () => {
    expect(constructSearchQuery("please create a schema for users"))
      .toBe("schema for users")
  })

  it("truncates to 200 chars", () => {
    const long = "a".repeat(300)
    expect(constructSearchQuery(long).length).toBeLessThanOrEqual(200)
  })
})

describe("shouldSkipSearch", () => {
  it("skips short messages", () => {
    expect(shouldSkipSearch("yes")).toBe(true)
  })

  it("skips slash commands", () => {
    expect(shouldSkipSearch("/commit")).toBe(true)
  })

  it("does not skip creation prompts", () => {
    expect(shouldSkipSearch("create a new schema for workspace configuration")).toBe(false)
  })
})

describe("formatContextInjection", () => {
  it("returns empty for no results", () => {
    expect(formatContextInjection([])).toBe("")
  })

  it("wraps in system-reminder tags", () => {
    const result = formatContextInjection([mockSearchResult])
    expect(result).toContain("<system-reminder>")
    expect(result).toContain("</system-reminder>")
  })
})
```
