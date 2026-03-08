# Codex Task: Surface Context File Metadata in RLM Prompts

## Objective

When the RLM system receives a context file (via `--context-file`), the model currently knows only the character count and a 200-char preview. It has no idea whether the data is NDJSON, plain text, CSV, JSON, etc. This causes wasted first iterations where the model explores data format instead of immediately starting analysis.

Surface file metadata (name, format, structure hints) into the prompt so the model can begin productive work on iteration 1.

## Approach: Multi-Agent Sub-Agent Review

Use parallel sub-agents to research, implement, and review:

1. **Research Agent**: Read all relevant source files, understand how context flows from CLI through to the prompt, understand Effect patterns used, and identify all touch points.
2. **Implementation Agent**: Build the `ContextMetadata` module and wire it through the pipeline.
3. **Review Agent**: Verify correctness, test coverage, and that metadata doesn't break existing behavior.

---

## Context: How the System Works

### Architecture

The RLM is an inference-time strategy that loops: generate code -> execute in sandbox -> observe output -> repeat until SUBMIT(). Context files are loaded at CLI time, stored as a raw string in `__vars.context`, and described to the model via a brief hint in the user message.

### Current Context Flow

```
CLI (--context-file ./foo.ndjson)
  → src/cli/Run.ts: reads file with Bun.file(contextFile).text()
  → passes raw string as `context` to rlm.stream({ query, context, tools })
  → src/Rlm.ts: forwards to runScheduler({ query, context, ... })
  → src/Scheduler.ts: stores in CallContext, injects into __vars.context
  → src/Scheduler.ts (GenerateStep): builds prompt with buildReplPrompt({
      contextLength: callState.context.length,
      contextPreview: callState.context.slice(0, 200),
      ...
    })
  → src/RlmPrompt.ts: user message says:
    "[Context available in __vars.context (3800000 chars). Preview: first200chars...]"
```

The model sees the character count and a raw preview. It does NOT see:
- The file name or extension
- The detected format (NDJSON, JSON, CSV, plain text, etc.)
- For structured data: record count, field names, a sample record
- Line count

### What the Model Does Today (Wasted Iteration)

```
Iteration 1: "Let me explore the data..."
  print(typeof __vars.context)     // "string"
  print(__vars.context.length)     // 3800000
  print(__vars.context.slice(0, 500))  // raw peek
  // Model now realizes it's NDJSON, plans chunking strategy

Iteration 2: Actually starts working
```

### What We Want

```
[Context available in __vars.context]
  Source: arsenal-feed.ndjson
  Format: NDJSON (newline-delimited JSON)
  Size: 3,800,000 chars, 11,001 lines
  Fields: author, text, createdAt, authorProfile.displayName, hashtags, embed.external.uri
  Sample record: {"author":"did:plc:abc","text":"Arsenal win 3-0...","createdAt":"2024-11-02T15:30:00Z",...}

The model can now skip format exploration and immediately plan a chunking strategy.
```

### Key Files

| File | Role |
|------|------|
| `src/cli/Run.ts` | Loads context file, passes raw string to Rlm (PRIMARY: add metadata extraction here) |
| `src/cli/Normalize.ts` | CLI argument normalization |
| `src/CliLayer.ts` | CLI args type definition (`CliArgs`), layer construction |
| `src/Rlm.ts` | `RlmService` interface — `complete()` and `stream()` accept `CompleteOptionsBase` |
| `src/Scheduler.ts` | `RunSchedulerOptions` — stores context, builds prompts |
| `src/RlmPrompt.ts` | `BuildReplPromptOptions` — builds user message with context hint |
| `src/SystemPrompt.ts` | System prompt builder (Variable Space section references `__vars.context`) |
| `src/VariableSpace.ts` | Injects variables into sandbox |
| `src/CallContext.ts` | `CallContext` type — stores query, context, etc. per call |

---

## Research Phase (Sub-Agent 1)

### Questions to Answer

1. **What types do context-related options flow through?** Trace `context` from `CliArgs` → `CompleteOptionsBase` → `RunSchedulerOptions` → `CallContext` → `buildReplPrompt`. Identify every type that needs a new `contextMetadata` field.

2. **What metadata is useful per format?** Define what to extract for each:
   - `.ndjson` / `.jsonl`: line count, parsed field names from first record, sample first record (truncated)
   - `.json`: top-level type (array vs object), array length if array, field names, sample element
   - `.csv` / `.tsv`: header row (column names), row count, delimiter
   - `.txt` / `.md` / other: line count, whether it looks like prose vs structured data
   - Unknown: just file name and line count

3. **How should metadata be computed?** It should be fast, synchronous-friendly, and bounded:
   - Parse only the first N bytes (e.g., 4KB) to detect format and extract field names
   - Count lines with a simple loop (fast for even multi-MB files)
   - Don't parse the entire file — just enough to infer structure

4. **Where should metadata be injected into the prompt?** Currently `buildReplPrompt` gets `contextLength` and `contextPreview`. Replace/augment these with a `contextMetadata` object that produces a richer hint string.

5. **Should metadata also be injected into `__vars`?** Consider injecting `__vars.contextMeta` alongside `__vars.context` so the model can programmatically access field names, line count, etc. without parsing.

6. **How does this interact with non-file context?** When `--context "inline text"` is used instead of `--context-file`, there's no filename. Metadata should gracefully degrade to just character count + format sniffing.

7. **How does this interact with `buildExtractPrompt`?** The extract prompt also references context. Its metadata hint should match.

8. **How does this interact with `buildOneShotPrompt`?** One-shot sub-calls receive context too — should they get metadata? Probably not (context is typically a chunk, not a file).

---

## Implementation Phase (Sub-Agent 2)

### Step 1: Create `src/ContextMetadata.ts`

New module that analyzes context and produces metadata. Should be a pure function, no Effect services needed.

```typescript
export interface ContextMetadata {
  readonly fileName?: string        // e.g., "arsenal-feed.ndjson"
  readonly format: ContextFormat    // detected format
  readonly chars: number            // total character count
  readonly lines: number            // total line count
  readonly fields?: ReadonlyArray<string>  // top-level field names (for structured data)
  readonly recordCount?: number     // number of records (for NDJSON/JSON arrays/CSV)
  readonly sampleRecord?: string    // first record as string (truncated)
}

export type ContextFormat =
  | "ndjson"
  | "json"
  | "json-array"
  | "csv"
  | "tsv"
  | "plain-text"
  | "markdown"
  | "xml"
  | "unknown"

export const analyzeContext = (
  content: string,
  fileName?: string
): ContextMetadata => { ... }

export const formatContextHint = (meta: ContextMetadata): string => { ... }
```

#### Format Detection Logic

1. If `fileName` has a known extension, use it as primary signal:
   - `.ndjson`, `.jsonl` → NDJSON
   - `.json` → JSON
   - `.csv` → CSV
   - `.tsv` → TSV
   - `.txt` → plain text
   - `.md` → markdown
   - `.xml` → XML

2. If no extension or unknown, sniff content:
   - First line parses as JSON + second line parses as JSON → NDJSON
   - First non-whitespace char is `[` or `{` and valid JSON → JSON
   - First line contains commas and looks like a header → CSV
   - First line contains tabs → TSV
   - Otherwise → plain text

3. For NDJSON:
   - Count lines (fast: iterate and count `\n`)
   - Parse first line to extract field names (`Object.keys(JSON.parse(firstLine))`)
   - For nested fields, show dot-paths for one level (e.g., `authorProfile.displayName`)
   - Store first line as `sampleRecord` (truncated to ~200 chars)

4. For JSON:
   - If array: `recordCount` = array length, `fields` from first element
   - If object: `fields` from top-level keys

5. For CSV/TSV:
   - Parse header row for field names
   - Count lines for record count (minus 1 for header)

6. For plain text:
   - Count lines
   - No fields or records

#### `formatContextHint` Output

```
[Context available in __vars.context]
  Source: arsenal-feed.ndjson
  Format: NDJSON (newline-delimited JSON)
  Size: 3,800,000 chars, 11,001 lines
  Fields: author, text, createdAt, authorProfile.displayName, hashtags, embed.external.uri
  Sample: {"author":"did:plc:abc","text":"Arsenal win...","createdAt":"2024-11-02T15:30:00Z"}
```

For plain text:
```
[Context available in __vars.context]
  Source: frankenstein.txt
  Format: Plain text
  Size: 446,000 chars, 7,737 lines
```

For inline context (no file):
```
[Context available in __vars.context (45,000 chars, 200 lines, detected: NDJSON)]
```

### Step 2: Wire Metadata Through the Pipeline

#### 2a. Update `src/cli/Run.ts`

After loading the file, compute metadata:

```typescript
import { analyzeContext } from "../ContextMetadata"
import * as path from "node:path"

const contextFile = cliArgs.contextFile
const context = contextFile
  ? yield* Effect.promise(() => Bun.file(contextFile).text())
  : cliArgs.context

const contextMetadata = analyzeContext(
  context,
  contextFile ? path.basename(contextFile) : undefined
)
```

Pass `contextMetadata` to `rlm.stream()` / `rlm.complete()`.

#### 2b. Update `CompleteOptionsBase` in `src/Rlm.ts`

```typescript
import type { ContextMetadata } from "./ContextMetadata"

export interface CompleteOptionsBase {
  readonly query: string
  readonly context: string
  readonly contextMetadata?: ContextMetadata  // NEW
  readonly depth?: number
  readonly tools?: ReadonlyArray<RlmToolAny>
}
```

#### 2c. Update `RunSchedulerOptions` in `src/Scheduler.ts`

```typescript
export interface RunSchedulerOptions {
  readonly query: string
  readonly context: string
  readonly contextMetadata?: ContextMetadata  // NEW
  // ... rest unchanged
}
```

Thread through `toSchedulerOptions` in `Rlm.ts`.

#### 2d. Update `CallContext` in `src/CallContext.ts`

Add `contextMetadata?: ContextMetadata` to the call context so it's available when building prompts.

#### 2e. Update `BuildReplPromptOptions` in `src/RlmPrompt.ts`

Replace `contextLength` + `contextPreview` with `contextMetadata`:

```typescript
export interface BuildReplPromptOptions {
  readonly systemPrompt: string
  readonly query: string
  readonly contextMetadata?: ContextMetadata  // replaces contextLength + contextPreview
  readonly transcript: ReadonlyArray<TranscriptEntry>
  readonly enablePromptCaching?: boolean
}
```

Update `buildReplPrompt` to use `formatContextHint(options.contextMetadata)` for the user message context hint.

Similarly update `BuildExtractPromptOptions`.

**Important**: Keep backward compatibility — if `contextMetadata` is undefined (programmatic API without file), fall back to basic `${context.length} chars` hint.

#### 2f. Update `Scheduler.ts` GenerateStep

Replace:
```typescript
contextLength: callState.context.length,
contextPreview: callState.context.slice(0, CONTEXT_PREVIEW_CHARS),
```

With:
```typescript
contextMetadata: callState.contextMetadata,
```

If `contextMetadata` is not on `CallContext` (e.g., sub-calls from bridge), auto-generate minimal metadata:
```typescript
contextMetadata: callState.contextMetadata ?? analyzeContext(callState.context)
```

#### 2g. Optionally inject `__vars.contextMeta` into sandbox

In `handleStartCall`, after `vars.injectAll({ context, query })`:

```typescript
if (callState.contextMetadata) {
  yield* vars.inject("contextMeta", {
    fileName: callState.contextMetadata.fileName,
    format: callState.contextMetadata.format,
    lines: callState.contextMetadata.lines,
    fields: callState.contextMetadata.fields,
    recordCount: callState.contextMetadata.recordCount,
  })
}
```

Then update the Variable Space section in `SystemPrompt.ts`:
```
Your query is in `__vars.query`, context in `__vars.context`, and file metadata in `__vars.contextMeta`.
```

### Step 3: Update System Prompt

#### 3a. Variable Space section in `src/SystemPrompt.ts`

Update the example block to reference `__vars.contextMeta`:

```typescript
lines.push("## Variable Space")
lines.push("Your query is in `__vars.query` and any context is in `__vars.context`.")
lines.push("If a context file was provided, `__vars.contextMeta` contains metadata (format, fields, lines, recordCount).")
lines.push("Access these via code — do NOT guess at content. Example:")
lines.push("```js")
lines.push("print(JSON.stringify(__vars.contextMeta))  // file metadata")
lines.push("print(__vars.context.length)               // raw size")
lines.push("print(__vars.context.slice(0, 500))        // peek at the start")
lines.push("```")
```

### Step 4: Update the First-Iteration Safeguard

Currently in `buildReplPrompt`:
```typescript
const safeguard = isFirstIteration && options.contextLength > 0
  ? "You have not seen the context yet. Explore it with code first..."
  : ""
```

Update to use metadata:
```typescript
const hasContext = options.contextMetadata !== undefined && options.contextMetadata.chars > 0
const safeguard = isFirstIteration && hasContext
  ? "You have not seen the full context yet. Use __vars.contextMeta to understand the data shape, then start processing.\n\n"
  : ""
```

---

## Review Phase (Sub-Agent 3)

### Verification Checklist

- [ ] `bun run typecheck` passes
- [ ] `bun test` passes (all existing tests)
- [ ] New tests in `test/ContextMetadata.test.ts`:
  - NDJSON detection by extension
  - NDJSON detection by content sniffing (no extension)
  - JSON array detection
  - JSON object detection
  - CSV detection
  - TSV detection
  - Plain text detection
  - Markdown detection
  - Field extraction from NDJSON (including one-level nested dot-paths)
  - Field extraction from CSV header
  - Line counting accuracy
  - Record count accuracy
  - Sample record truncation
  - `formatContextHint` output format for each type
  - Graceful handling of empty content
  - Graceful handling of malformed first line
  - Performance: metadata extraction on 4MB file completes in < 100ms
- [ ] Updated tests in `test/RlmPrompt.test.ts`:
  - Prompt includes metadata hint when `contextMetadata` is provided
  - Prompt falls back gracefully when `contextMetadata` is undefined
  - Extract prompt includes metadata hint
- [ ] Updated tests in `test/SystemPrompt.test.ts`:
  - Variable Space section mentions `__vars.contextMeta`
- [ ] Integration test: run with NDJSON fixture and verify model's first iteration uses metadata
- [ ] Non-regression: run with plain string context (no file) and verify no errors

### Key Risks

1. **Performance**: Counting lines in a 4MB file should be fast (< 10ms), but verify. Don't parse entire NDJSON — only first line.
2. **Nested field paths**: Going one level deep (`authorProfile.displayName`) is useful; going deeper clutters the hint. Limit to one level.
3. **Malformed files**: First line might not be valid JSON even in a `.ndjson` file. Handle gracefully — fall back to "unknown" format.
4. **Large sample records**: Truncate to ~200 chars to avoid bloating the prompt.
5. **Breaking existing tests**: Many tests construct `buildReplPrompt` with `contextLength` and `contextPreview`. Either keep backward compat or update all test call sites.
6. **Sub-call context**: When `llm_query(query, context)` passes context to a sub-call, the context is typically a chunk (not a file). Don't generate misleading metadata for these — either skip or auto-detect.

---

## Expected Impact

- **Iteration savings**: Models skip the "explore data format" step on iteration 1, saving 1 iteration per run
- **Better chunking decisions**: Model knows the record count and can immediately compute chunk sizes
- **Fewer parse errors**: Model knows the format upfront, reducing `JSON.parse` failures on non-JSON data
- **Improved structured data handling**: Field names in the prompt enable more targeted queries

---

## Files to Read First

```
src/ContextMetadata.ts               — NEW FILE (create this)
src/cli/Run.ts                       — where context file is loaded (wire metadata here)
src/Rlm.ts                           — CompleteOptionsBase type
src/Scheduler.ts                     — RunSchedulerOptions, handleStartCall, handleGenerateStep
src/RlmPrompt.ts                     — BuildReplPromptOptions, buildReplPrompt
src/SystemPrompt.ts                  — Variable Space section
src/CallContext.ts                    — CallContext type
src/VariableSpace.ts                 — variable injection
src/CliLayer.ts                      — CliArgs type
test/ContextMetadata.test.ts         — NEW FILE (create this)
test/RlmPrompt.test.ts              — existing prompt tests (update)
test/SystemPrompt.test.ts           — existing system prompt tests (update)
```

## Running Tests

```bash
bun run typecheck
bun test
```

## Running a Live Test

```bash
# NDJSON context file — should show metadata in prompt
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 5 --context-file ./test/fixtures/arsenal-feed.ndjson \
  "How many unique authors posted in this feed?"

# Plain text context file — should show plain text metadata
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 5 --context-file ./test/fixtures/frankenstein.txt \
  "List all named characters in this novel"

# Inline context (no file) — should degrade gracefully
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 3 --context "Hello world, this is a test" \
  "What does this text say?"
```
