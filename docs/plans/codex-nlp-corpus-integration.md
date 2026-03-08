# Codex Task: Deep Integration of effect-nlp Corpus & Advanced Tools into RLM Pipeline

## Objective

The `effect-nlp` package has been substantially upgraded with corpus-based BM25 retrieval, custom entity learning, n-gram fingerprinting, phonetic matching, and new similarity tools. The recursive-llm system currently integrates only 9 of the now-18 available tools, and the system prompt guidance is unaware of corpus workflows, stateful entity learning, or the new retrieval-first paradigm that these tools enable.

This task integrates the full effect-nlp toolkit into the RLM pipeline with:
1. Updated system prompt guidance covering all 18 tools organized by workflow
2. Corpus-aware context preparation (auto-index large structured data for BM25 retrieval)
3. Sandbox variable injection of corpus metadata for immediate use
4. Strategy guidance that shifts the model from naive chunking toward retrieval-first patterns

## Approach: Multi-Agent Sub-Agent Review

1. **Research Agent**: Read all relevant source files in both codebases, understand the current integration surface, trace context flow, and identify every touch point.
2. **Implementation Agent**: Update system prompt, add context-to-corpus pipeline, wire metadata through the pipeline.
3. **Review Agent**: Verify correctness, run all tests, validate that existing queries still work.

---

## Context: Current State

### What effect-nlp Now Provides (18 Tools)

**Core Text Processing:**
| Tool | Purpose | Params |
|------|---------|--------|
| `Tokenize` | Linguistic tokens with POS/lemma/stem | `text` |
| `Sentences` | Sentence segmentation with offsets | `text` |
| `DocumentStats` | Fast document profiling | `text` |
| `ChunkBySentences` | Sentence-aligned chunking | `text, maxChunkChars` |
| `TransformText` | Text cleaning/normalization pipeline | `text, operations[]` |

**Entity & Pattern Tools:**
| Tool | Purpose | Params |
|------|---------|--------|
| `ExtractEntities` | Named entities (DATE, PERSON, EMAIL, URL, etc.) | `text, includeCustom?` |
| `LearnCustomEntities` | Teach domain-specific entity patterns via DSL | `groupName?, mode?, entities[]` |

**Keyword & Feature Extraction:**
| Tool | Purpose | Params |
|------|---------|--------|
| `ExtractKeywords` | TF-IDF keyword extraction | `text, topN?` |
| `NGrams` | Character n-gram fingerprinting | `text, size, mode?, topN?` |

**Similarity & Matching:**
| Tool | Purpose | Params |
|------|---------|--------|
| `TextSimilarity` | BM25 vector cosine similarity | `text1, text2` |
| `BowCosineSimilarity` | Bag-of-words cosine (no BM25 weighting) | `text1, text2` |
| `TverskySimilarity` | Asymmetric set similarity (containment) | `text1, text2, alpha?, beta?` |
| `PhoneticMatch` | Fuzzy phonetic overlap (Soundex/phonetize) | `text1, text2, algorithm?, minTokenLength?` |

**Corpus & Retrieval (NEW — stateful, session-based):**
| Tool | Purpose | Params |
|------|---------|--------|
| `CreateCorpus` | Create a named BM25 corpus session | `corpusId?, bm25Config?` |
| `LearnCorpus` | Add documents incrementally to corpus | `corpusId, documents[], dedupeById?` |
| `QueryCorpus` | BM25 vector-cosine ranked search | `corpusId, query, topN?, includeText?` |
| `CorpusStats` | Inspect corpus internals (IDF, term matrix) | `corpusId, includeIdf?, includeMatrix?, topIdfTerms?` |
| `DeleteCorpus` | Clean up corpus session | `corpusId` |

### What recursive-llm Currently Knows About (9 Tools)

The `nlpToolNames` set in `src/SystemPrompt.ts` (line 31-41):
```typescript
const nlpToolNames = new Set([
  "DocumentStats",
  "ChunkBySentences",
  "RankByRelevance",    // NOTE: doesn't exist in effect-nlp anymore
  "ExtractEntities",
  "Tokenize",
  "Sentences",
  "ExtractKeywords",
  "TextSimilarity",
  "TransformText"
])
```

**Problems:**
1. `RankByRelevance` is listed but no longer exists in effect-nlp (replaced by `QueryCorpus`)
2. 9 new tools are invisible to the system prompt guidance
3. No corpus workflow guidance — model has no idea it can create stateful retrieval indexes
4. No guidance on `LearnCustomEntities` for domain-specific extraction
5. No guidance on fuzzy matching tools (PhoneticMatch, NGrams)
6. No guidance on asymmetric similarity (TverskySimilarity)

### Current Integration Architecture

```
CLI (--nlp-tools flag)
  → src/cli/Run.ts: calls nlpTools effect
  → src/NlpTools.ts: calls effect-nlp Tools.exportTools
    → Returns ReadonlyArray<RlmToolAny> (all 18 tools)
  → Passed to rlm.stream({ tools })
  → src/Scheduler.ts: stores in CallContext.tools
  → handleStartCall: passes tool descriptors to sandbox Init message
  → sandbox-worker.ts: creates bridge functions for each tool
  → Model calls tool → BridgeCall IPC → Scheduler.handleHandleBridgeCall → tool.handle()
```

**Key insight:** The tool *registration* is already dynamic — `NlpTools.ts` imports all tools from effect-nlp automatically. The gap is in the *system prompt guidance* and *context preparation*. The model gets all 18 tools but only gets guidance for 9.

### Key Files to Read

| File | What to read for |
|------|-----------------|
| `src/SystemPrompt.ts` | NLP tool names set, guidance sections, tool rendering |
| `src/NlpTools.ts` | How tools are imported from effect-nlp |
| `src/RlmTool.ts` | RlmToolAny interface shape |
| `src/Scheduler.ts` | handleStartCall (variable injection), handleGenerateStep (prompt building) |
| `src/RlmPrompt.ts` | BuildReplPromptOptions, context hint formatting |
| `src/ContextMetadata.ts` | Format detection, metadata for NDJSON/JSON/CSV/text |
| `src/cli/Run.ts` | Where context is loaded and metadata computed |
| `src/Rlm.ts` | CompleteOptionsBase, toSchedulerOptions |
| `src/CallContext.ts` | CallContext type (stores context, tools, metadata) |
| `src/VariableSpace.ts` | How variables are injected into sandbox |
| `src/sandbox-worker.ts` | How tools appear in sandbox scope |

**effect-nlp reference (read these for API details):**
| File | What to read for |
|------|-----------------|
| `/Users/pooks/Dev/effect-nlp/src/NLP/Tools/ToolExport.ts` | ExportedTool interface, usage examples |
| `/Users/pooks/Dev/effect-nlp/src/NLP/Tools/NlpToolkit.ts` | Full toolkit definition, all tool registrations |
| `/Users/pooks/Dev/effect-nlp/src/NLP/Tools/_schemas.ts` | All AI schemas (tokens, entities, corpus, etc.) |
| `/Users/pooks/Dev/effect-nlp/src/NLP/Wink/WinkCorpusManager.ts` | Corpus manager API, lifecycle, errors |
| `/Users/pooks/Dev/effect-nlp/src/NLP/Tools/index.ts` | Exported tool names list |

---

## Research Phase (Sub-Agent 1)

### Questions to Answer

1. **Which tools are actually exported by effect-nlp today?** Read `effect-nlp/src/NLP/Tools/index.ts` and `NlpToolkit.ts` to get the authoritative list. Confirm the 18-tool count. Check if `RankByRelevance` still exists or was removed/renamed.

2. **How does `exportTools` work?** Read `ToolExport.ts` to understand how Effect AI Tool definitions are converted to `ExportedTool` format. Understand parameter mapping (structured → positional args).

3. **What usage examples does effect-nlp provide?** Read the `USAGE_EXAMPLES` constant in `ToolExport.ts`. These should be surfaced in the system prompt.

4. **How does the corpus lifecycle work?** Read `WinkCorpusManager.ts` to understand:
   - Session creation and ID management
   - Document learning (incremental, deduplication)
   - Lazy reindexing (learned → compiled → queryable)
   - Error handling (CorpusManagerError)
   - Memory implications (corpus state lives in-process)

5. **How does `LearnCustomEntities` persist state?** Does entity learning survive across tool calls within one sandbox session? (Answer: yes, learned patterns persist until the corpus is deleted or replaced.)

6. **What does `ContextMetadata` currently provide?** Read `src/ContextMetadata.ts` to understand what format information is already available. Key: for NDJSON files, we already detect format, line count, fields, and sample record.

7. **How should corpus-from-context work architecturally?** Should the host pre-build a corpus before sandbox starts? Or should the model be guided to build one itself? Consider:
   - Host-side: faster (no wasted iterations), but couples context loading to corpus API
   - Model-side: more flexible, but wastes an iteration on setup
   - Hybrid: host provides a helper that the model calls once (e.g., `__vars.corpusId` pre-created, documents pre-loaded)

8. **How does context size affect the approach?** For small contexts (<10KB), corpus is overkill. For large NDJSON (>100KB with many records), corpus-based retrieval is much more efficient than chunking+llm_query.

---

## Implementation Phase (Sub-Agent 2)

### Step 1: Update `nlpToolNames` Set in SystemPrompt.ts

Replace the hardcoded 9-tool set with all 18 current tools:

```typescript
const nlpToolNames = new Set([
  // Core text processing
  "DocumentStats",
  "ChunkBySentences",
  "Tokenize",
  "Sentences",
  "TransformText",
  // Entity & pattern
  "ExtractEntities",
  "LearnCustomEntities",
  // Keywords & features
  "ExtractKeywords",
  "NGrams",
  // Similarity & matching
  "TextSimilarity",
  "BowCosineSimilarity",
  "TverskySimilarity",
  "PhoneticMatch",
  // Corpus & retrieval
  "CreateCorpus",
  "LearnCorpus",
  "QueryCorpus",
  "CorpusStats",
  "DeleteCorpus"
])
```

Remove `RankByRelevance` (no longer exists).

### Step 2: Restructure NLP Tool Guidance in SystemPrompt.ts

Replace the current single "Use NLP tools for:" block with organized category guidance. The guidance should be conditional — only show sections for tool categories that are actually available.

#### Proposed Structure:

```typescript
if (availableNlpTools.length > 0) {
  // Check which categories are available
  const hasCorpusTools = availableNlpTools.some(t =>
    ["CreateCorpus", "LearnCorpus", "QueryCorpus"].includes(t.name))
  const hasEntityTools = availableNlpTools.some(t =>
    ["ExtractEntities", "LearnCustomEntities"].includes(t.name))
  const hasFuzzyTools = availableNlpTools.some(t =>
    ["PhoneticMatch", "NGrams", "TverskySimilarity"].includes(t.name))

  lines.push("### NLP Tools")
  lines.push("")

  // Always show core guidance
  lines.push("**Text Analysis:**")
  lines.push("- `DocumentStats(text)` — Quick document profiling before planning.")
  lines.push("- `ChunkBySentences(text, maxChunkChars)` — Sentence-aligned chunking for batch analysis.")
  lines.push("- `ExtractKeywords(text, topN?)` — TF-IDF keyword extraction.")
  lines.push("")

  if (hasCorpusTools) {
    lines.push("**Corpus Retrieval (BM25):**")
    lines.push("For datasets with many documents (NDJSON, arrays), use corpus-based retrieval instead of scanning everything:")
    lines.push("```js")
    lines.push("// 1. Create corpus once")
    lines.push("const corpus = await CreateCorpus('feed')")
    lines.push("// 2. Learn documents (chunked — ~500 docs per call)")
    lines.push("await LearnCorpus('feed', docs.map(d => ({ id: d.id, text: d.text })))")
    lines.push("// 3. Query repeatedly without relearning")
    lines.push("const hits = await QueryCorpus('feed', 'transfer rumors', 20, true)")
    lines.push("// 4. Clean up when done")
    lines.push("await DeleteCorpus('feed')")
    lines.push("```")
    lines.push("- Corpus state persists across iterations within this call.")
    lines.push("- Use `CorpusStats(corpusId)` to inspect vocabulary and IDF values.")
    lines.push("- Prefer corpus retrieval over `llm_query_batched` when you need to search many documents for a few relevant ones.")
    lines.push("")
  }

  if (hasEntityTools) {
    lines.push("**Entity Extraction:**")
    lines.push("- `ExtractEntities(text, includeCustom?)` — Named entities (PERSON, DATE, MONEY, etc.) with character offsets.")
    lines.push("- `LearnCustomEntities(groupName?, mode?, entities[])` — Teach domain patterns. Learned patterns persist across iterations.")
    lines.push("")
  }

  if (hasFuzzyTools) {
    lines.push("**Fuzzy Matching:**")
    lines.push("- `PhoneticMatch(text1, text2, algorithm?, minTokenLength?)` — Match variant spellings (e.g., 'Stephen' vs 'Steven').")
    lines.push("- `NGrams(text, size, mode?, topN?)` — Character n-gram fingerprinting for near-duplicate detection.")
    lines.push("- `TverskySimilarity(text1, text2, alpha?, beta?)` — Asymmetric containment similarity.")
    lines.push("")
  }

  lines.push("Prefer NLP tools over custom regex heuristics when the tool matches the task.")
}
```

### Step 3: Add Corpus-Aware Strategy Guidance

When the context is large structured data (NDJSON, JSON array, CSV), the strategy section should recommend corpus-based retrieval. This requires threading `contextMetadata` into the system prompt builder.

#### 3a. Add `contextMetadata` to `ReplSystemPromptOptions`

```typescript
export interface ReplSystemPromptOptions {
  // ... existing fields ...
  readonly contextMetadata?: ContextMetadata  // NEW
}
```

#### 3b. Add context-aware strategy hints

In the Strategy section of `buildReplSystemPrompt`, after step 2 ("Decompose the query"):

```typescript
// Context-specific strategy hints
if (options.contextMetadata) {
  const meta = options.contextMetadata
  const isMultiRecord = meta.format === "ndjson" || meta.format === "json-array" || meta.format === "csv"
  const isLargeDataset = isMultiRecord && (meta.recordCount ?? 0) > 50

  if (isLargeDataset && hasCorpusTools) {
    lines.push("")
    lines.push("### Context-Specific Guidance")
    lines.push(`Your context is a ${meta.format.toUpperCase()} dataset with ~${meta.recordCount} records.`)
    lines.push("For queries that need to find specific records, use corpus-based BM25 retrieval:")
    lines.push("1. Parse records from `__vars.context` (e.g., split by newlines, JSON.parse each line)")
    lines.push("2. `CreateCorpus('data')` → `LearnCorpus('data', records)` → `QueryCorpus('data', query, topN, true)`")
    lines.push("3. Then use `llm_query()` only on the top-ranked results for semantic analysis.")
    lines.push("This is much more efficient than scanning all records with `llm_query_batched`.")
  }
}
```

### Step 4: Thread `contextMetadata` to System Prompt Builder

In `Scheduler.ts`, `handleGenerateStep` already has access to `callState.contextMetadata`. Pass it through to `buildReplSystemPrompt`:

```typescript
const prompt = buildReplPrompt({
  systemPrompt: buildReplSystemPrompt({
    // ... existing fields ...
    ...(callState.contextMetadata !== undefined
      ? { contextMetadata: callState.contextMetadata }
      : {})
  }),
  // ... rest unchanged
})
```

### Step 5: Update Anti-Patterns Section

Add corpus-related anti-patterns when corpus tools are available:

```typescript
if (hasCorpusTools) {
  lines.push("### Anti-Patterns")
  lines.push("- Scanning all records with llm_query_batched when you only need a few relevant ones — use QueryCorpus instead")
  lines.push("- Creating a new corpus every iteration — create once, query many times")
  lines.push("- Not deleting corpus when done — memory is limited")
}
```

### Step 6: Update Example in System Prompt

The current "Large-Context Semantic Analysis" example uses a simple chunking pattern. When corpus tools are available, add an alternative corpus-based example:

```typescript
if (hasCorpusTools) {
  lines.push("## Example: Corpus-Based Retrieval on Structured Data")
  lines.push("Query: \"What are Arsenal fans saying about the January transfer window?\"")
  lines.push("")
  lines.push("Iteration 1:")
  lines.push("```js")
  lines.push("// Parse NDJSON records and build a searchable corpus")
  lines.push("const lines = __vars.context.trim().split('\\n')")
  lines.push("const posts = lines.map((l, i) => { try { const p = JSON.parse(l); return { id: String(i), text: p.text || '' } } catch { return null } }).filter(Boolean)")
  lines.push("print(`${posts.length} posts parsed`)")
  lines.push("await CreateCorpus('feed')")
  lines.push("// Learn in batches of 500")
  lines.push("for (let i = 0; i < posts.length; i += 500) {")
  lines.push("  await LearnCorpus('feed', posts.slice(i, i + 500))")
  lines.push("}")
  lines.push("// Search for transfer-related posts")
  lines.push("const hits = await QueryCorpus('feed', 'transfer window signing January', 30, true)")
  lines.push("__vars.hits = hits.ranked")
  lines.push("print(`Found ${hits.returned} relevant posts out of ${hits.totalDocuments}`)")
  lines.push("```")
  lines.push("")
  lines.push("Iteration 2:")
  lines.push("```js")
  lines.push("// Analyze top hits with llm_query for semantic depth")
  lines.push("const topTexts = __vars.hits.slice(0, 15).map(h => h.text)")
  lines.push("const analysis = await llm_query_batched(")
  lines.push("  topTexts.map(() => 'Summarize the key opinion and sentiment about Arsenal transfers in this post. Be specific about players/deals mentioned.'),")
  lines.push("  topTexts")
  lines.push(")")
  lines.push("__vars.analyses = analysis")
  lines.push("print(analysis.join('\\n---\\n'))")
  lines.push("```")
  lines.push("")
  lines.push("Iteration 3:")
  lines.push("```js")
  lines.push("const synthesis = await llm_query(")
  lines.push("  'Synthesize these post analyses into a summary of Arsenal fan sentiment about the January transfer window. Group by topic/player.',")
  lines.push("  __vars.analyses.join('\\n\\n')")
  lines.push(")")
  lines.push("await DeleteCorpus('feed')")
  lines.push("print(synthesis)")
  lines.push("```")
  lines.push("")
  lines.push("Then: `SUBMIT({ answer: synthesis })`")
}
```

### Step 7: Consider Auto-Corpus Preparation (Optional Enhancement)

For NDJSON contexts with many records, the host could pre-create a corpus before sandbox execution begins. This saves the model an entire iteration of parsing + learning.

**Option A: Host-side auto-corpus (recommended for structured data)**

In `Scheduler.ts`, `handleStartCall`, after injecting `__vars.context`:

```typescript
// Auto-create corpus for large structured contexts
if (
  contextMetadata !== undefined &&
  contextMetadata.recordCount !== undefined &&
  contextMetadata.recordCount > 50 &&
  (contextMetadata.format === "ndjson" || contextMetadata.format === "csv" || contextMetadata.format === "json-array") &&
  callState.tools?.some(t => t.name === "CreateCorpus")
) {
  // Create corpus and learn documents via the tool bridge
  const corpusId = `auto-${callState.callId}`
  // ... invoke CreateCorpus + LearnCorpus tools programmatically
  yield* vars.inject("contextCorpusId", corpusId)
}
```

**Caveat:** This is complex because tools are normally invoked through the bridge from inside the sandbox. Invoking them host-side requires either:
- Calling the tool's `handle()` method directly (bypasses sandbox IPC but requires the tool layer)
- Adding a pre-execution hook to the sandbox that runs setup code before the model's first iteration

**Recommendation:** Start with Step 2-6 (system prompt guidance) first. Auto-corpus preparation is a follow-up optimization that can be evaluated after seeing how well the model handles corpus creation itself. The model only needs ~5 lines of boilerplate code to create and learn a corpus, which is fast.

**If pursuing auto-corpus:** Consider a simpler approach — inject a helper function into the sandbox:

```typescript
// In sandbox-worker.ts, add a built-in helper:
__initCorpus = async (records, corpusId = 'auto') => {
  await CreateCorpus(corpusId)
  for (let i = 0; i < records.length; i += 500) {
    await LearnCorpus(corpusId, records.slice(i, i + 500))
  }
  return corpusId
}
```

Then in the system prompt, guide the model:
```
If __vars.contextMeta.format is "ndjson" and recordCount > 50, consider initializing a corpus for efficient search.
```

### Step 8: Update Tests

#### 8a. `test/SystemPrompt.test.ts`

- Verify `nlpToolNames` set includes all 18 tools
- Verify NLP guidance sections render for each category
- Verify corpus example renders when corpus tools are present
- Verify context-specific guidance renders for NDJSON metadata
- Verify no corpus guidance when corpus tools are absent

#### 8b. `test/Scheduler.test.ts`

- Verify `contextMetadata` is threaded to system prompt builder
- Verify corpus tools work through the bridge (existing tool dispatch tests should cover this)

#### 8c. `test/RlmPrompt.test.ts`

- No changes needed (metadata already tested from previous work)

---

## Review Phase (Sub-Agent 3)

### Verification Checklist

- [ ] `bun run typecheck` passes
- [ ] `bun test` passes (all existing tests)
- [ ] `nlpToolNames` set matches effect-nlp's actual exported tools exactly
- [ ] `RankByRelevance` reference is fully removed
- [ ] System prompt shows corpus workflow guidance when corpus tools are present
- [ ] System prompt shows fuzzy matching guidance when those tools are present
- [ ] System prompt omits corpus guidance when `--nlp-tools` is not used
- [ ] System prompt shows context-specific corpus hint for NDJSON with >50 records
- [ ] Existing NLP tool examples/guidance still render correctly
- [ ] Tool descriptors section still renders parameter schemas and usage examples for all tools
- [ ] `contextMetadata` is threaded from Scheduler to SystemPrompt builder
- [ ] No regressions in non-NLP queries (queries without `--nlp-tools`)

### Key Risks

1. **`nlpToolNames` stale list**: If effect-nlp adds/removes tools in the future, the set goes stale again. Consider: should the set be derived from the actual tools array instead of hardcoded? Trade-off: hardcoded gives precise category grouping; dynamic loses grouping. **Recommendation**: Keep hardcoded but add a comment noting it must stay in sync.

2. **Prompt token budget**: Adding corpus workflow examples significantly increases system prompt size. Monitor total system prompt length. The corpus example is ~20 lines; acceptable given the value.

3. **Corpus tools not always available**: The model might try to use CreateCorpus when `--nlp-tools` is not enabled. The system prompt should only show corpus guidance when those tools are actually in the tools array.

4. **Corpus memory limits**: Large NDJSON files (11K records) create significant in-memory BM25 indexes. The corpus manager handles this, but the system prompt should note memory awareness (delete when done).

5. **LearnCorpus batch size**: Learning 11K documents at once may be slow. Guide the model to batch in chunks of 500.

---

## Expected Impact

- **Better tool utilization**: Models discover and use all 18 tools instead of just the 9 they're guided about
- **Retrieval-first paradigm**: For multi-document contexts, BM25 corpus search + targeted llm_query replaces brute-force llm_query_batched over all records — fewer LLM calls, better precision
- **Domain-specific extraction**: LearnCustomEntities enables the model to teach patterns once, then extract entities across iterations without regex
- **Fuzzy matching**: PhoneticMatch and NGrams enable name deduplication and variant detection that previously required expensive llm_query calls
- **Context-aware strategy**: System prompt recommends corpus-based retrieval specifically when the context is large structured data, reducing wasted iterations

---

## Files to Modify

```
src/SystemPrompt.ts               — nlpToolNames set, NLP guidance sections, corpus example, context hints
src/Scheduler.ts                  — thread contextMetadata to buildReplSystemPrompt
test/SystemPrompt.test.ts         — updated tests for new guidance sections
```

## Files to Read First (for understanding)

```
src/SystemPrompt.ts               — current NLP guidance structure
src/Scheduler.ts                  — handleGenerateStep (where system prompt is built)
src/ContextMetadata.ts            — format detection that determines context-specific guidance
src/NlpTools.ts                   — how tools are imported (dynamic, all 18 come through)
src/sandbox-worker.ts             — how tools appear in sandbox
/Users/pooks/Dev/effect-nlp/src/NLP/Tools/ToolExport.ts  — usage examples, ExportedTool interface
/Users/pooks/Dev/effect-nlp/src/NLP/Tools/NlpToolkit.ts  — all tool registrations
/Users/pooks/Dev/effect-nlp/src/NLP/Tools/_schemas.ts    — AI schema shapes
```

## Running Tests

```bash
bun run typecheck
bun test
```

## Running a Live Test

```bash
# NDJSON corpus retrieval — should use CreateCorpus → LearnCorpus → QueryCorpus
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 8 --nlp-tools \
  --context-file ./test/fixtures/arsenal-feed.ndjson \
  "What are the most discussed transfer rumors in this feed?"

# Plain text — should use chunking, not corpus
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 5 --nlp-tools \
  --context-file ./test/fixtures/frankenstein.txt \
  "Extract all named characters and their relationships"

# Without --nlp-tools — should show no NLP guidance at all
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 5 \
  --context-file ./test/fixtures/arsenal-feed.ndjson \
  "How many unique authors posted in this feed?"
```
