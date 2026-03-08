import type { ContextMetadata } from "./ContextMetadata"
import type { InputManifestEntry } from "./RlmTypes"
import { buildSubmitInvocationSchema } from "./SubmitTool"

export interface ToolDescriptor {
  readonly name: string
  readonly description: string
  readonly parameterNames: ReadonlyArray<string>
  readonly parametersJsonSchema: object
  readonly returnsJsonSchema: object
  readonly usageExamples?: ReadonlyArray<string>
}

export interface ReplSystemPromptOptions {
  readonly depth: number
  readonly iteration: number
  readonly maxIterations: number
  readonly maxDepth: number
  readonly budget: {
    readonly iterationsRemaining: number
    readonly llmCallsRemaining: number
    readonly tokenBudgetRemaining?: number
    readonly totalTokensUsed?: number
    readonly elapsedMs?: number
    readonly maxTimeMs?: number
  }
  readonly namedModelNames?: ReadonlyArray<string>
  readonly mediaNames?: ReadonlyArray<string>
  readonly tools?: ReadonlyArray<ToolDescriptor>
  readonly outputJsonSchema?: object
  readonly maxFrameBytes?: number
  readonly sandboxMode?: "permissive" | "strict"
  readonly subModelContextChars?: number
  readonly contextMetadata?: ContextMetadata
  readonly bridgeTimeoutMs?: number
  readonly inputManifest?: ReadonlyArray<InputManifestEntry>
}

// Keep this in sync with effect-nlp's exported tool names (currently 19 tools).
const NLP_TOOL_NAMES = new Set([
  "BowCosineSimilarity",
  "ChunkBySentences",
  "CorpusStats",
  "CreateCorpus",
  "DeleteCorpus",
  "DocumentStats",
  "ExtractEntities",
  "ExtractKeywords",
  "LearnCorpus",
  "LearnCustomEntities",
  "NGrams",
  "PhoneticMatch",
  "QueryCorpus",
  "RankByRelevance",
  "Sentences",
  "TextSimilarity",
  "Tokenize",
  "TransformText",
  "TverskySimilarity"
])

const CORE_TEXT_PROCESSING_TOOLS: ReadonlyArray<string> = [
  "DocumentStats",
  "ChunkBySentences",
  "Tokenize",
  "Sentences",
  "TransformText"
]

const ENTITY_AND_PATTERN_TOOLS: ReadonlyArray<string> = [
  "ExtractEntities",
  "LearnCustomEntities"
]

const KEYWORD_AND_FEATURE_TOOLS: ReadonlyArray<string> = [
  "ExtractKeywords",
  "NGrams"
]

const SIMILARITY_AND_MATCHING_TOOLS: ReadonlyArray<string> = [
  "TextSimilarity",
  "BowCosineSimilarity",
  "TverskySimilarity",
  "PhoneticMatch",
  "RankByRelevance"
]

const CORPUS_TOOLS: ReadonlyArray<string> = [
  "CreateCorpus",
  "LearnCorpus",
  "QueryCorpus",
  "CorpusStats",
  "DeleteCorpus"
]

const CORPUS_WORKFLOW_TOOLS: ReadonlyArray<string> = [
  "CreateCorpus",
  "LearnCorpus",
  "QueryCorpus"
]

const STRUCTURED_CONTEXT_FORMATS = new Set<ContextMetadata["format"]>([
  "ndjson",
  "json-array",
  "csv",
  "tsv"
])

const sanitizePromptString = (s: string, maxLen: number): string =>
  s
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/[|`<>]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, maxLen)
    .trim()

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

const formatNumber = (n: number): string =>
  new Intl.NumberFormat("en-US").format(n)

export const buildReplSystemPromptStatic = (
  options: Omit<ReplSystemPromptOptions, "iteration" | "budget">
): string => {
  const isStrict = options.sandboxMode === "strict"
  const canRecurse = !isStrict && options.depth < options.maxDepth
  const submitInvocationSchema = buildSubmitInvocationSchema(options.outputJsonSchema)
  const availableTools = options.tools ?? []
  const availableToolNames = new Set(availableTools.map((tool) => tool.name))
  const hasAnyTool = (toolNames: ReadonlyArray<string>): boolean =>
    toolNames.some((name) => availableToolNames.has(name))
  const hasAllTools = (toolNames: ReadonlyArray<string>): boolean =>
    toolNames.every((name) => availableToolNames.has(name))
  const pushNlpToolLine = (lines: Array<string>, toolName: string, text: string): void => {
    if (availableToolNames.has(toolName)) lines.push(text)
  }
  const availableNlpTools = availableTools.filter((tool) =>
    NLP_TOOL_NAMES.has(tool.name)
  )
  const hasCoreTextTools = hasAnyTool(CORE_TEXT_PROCESSING_TOOLS)
  const hasEntityTools = hasAnyTool(ENTITY_AND_PATTERN_TOOLS)
  const hasKeywordFeatureTools = hasAnyTool(KEYWORD_AND_FEATURE_TOOLS)
  const hasSimilarityTools = hasAnyTool(SIMILARITY_AND_MATCHING_TOOLS)
  const hasCorpusTools = hasAnyTool(CORPUS_TOOLS)
  const hasCorpusWorkflow = hasAllTools(CORPUS_WORKFLOW_TOOLS)
  const hasLargeStructuredContext = !isStrict &&
    options.contextMetadata !== undefined &&
    STRUCTURED_CONTEXT_FORMATS.has(options.contextMetadata.format) &&
    (options.contextMetadata.recordCount ?? 0) > 50 &&
    hasCorpusWorkflow &&
    canRecurse
  const lines: Array<string> = []

  lines.push("You are a recursive problem-solving agent with access to a code sandbox.")
  if (canRecurse) {
    lines.push("Use code for mechanical operations and llm_query() for tasks requiring semantic understanding.")
  } else {
    lines.push("Use code for both mechanical and semantic operations in this environment; recursive sub-calls are unavailable.")
  }
  if (isStrict) {
    lines.push("Strict mode: bridge calls are disabled. Solve with code only.")
  } else {
    lines.push("Choose the tool that best matches the task while respecting iteration and LLM-call budgets.")
  }
  lines.push("")
  lines.push("## Variable Space")
  lines.push("Available variables:")
  lines.push("- `__vars.query` — your query")
  lines.push("- `__vars.context` — context string (may be empty)")
  lines.push("- `__vars.contextMeta` — context metadata (if provided)")
  lines.push("- `__vars.inputs` — staged input file metadata (if provided)")
  lines.push("Access these via code — do NOT guess at content. Example:")
  lines.push("```js")
  lines.push("print(JSON.stringify(__vars.contextMeta ?? null)) // metadata (if provided)")
  lines.push("print(__vars.context.length)                     // how big is it?")
  lines.push("print(__vars.context.slice(0, 500))              // peek at the start")
  lines.push("```")
  lines.push("")
  lines.push("## REPL Protocol")
  lines.push("Write code inside a single ```js fenced block per response. It will be executed and the output returned to you.")
  lines.push("- ALWAYS use `print()` to see results — nothing is displayed unless you print it. `console.log` goes to stderr and you will NOT see it.")
  lines.push(`- Top-level \`await\` is supported for async calls${canRecurse ? " (tools, llm_query)" : ""}.`)
  lines.push("- Only the FIRST code block in your response is executed. Do not include multiple code blocks.")
  if (canRecurse) {
    lines.push("- `print()`, `llm_query()`, `llm_query_batched()`, and all tool functions are sandbox functions. They exist ONLY inside the ```js sandbox. Call them ONLY inside ```js code blocks. Do NOT invoke them as external tool calls — the only external tool available is SUBMIT.")
    lines.push("- `budget()` returns a live snapshot of remaining resources:")
    lines.push("  ```js")
    lines.push("  const b = await budget()")
    lines.push("  // b.iterationsRemaining  — REPL iterations left (int)")
    lines.push("  // b.llmCallsRemaining    — llm_query/llm_query_batched calls left (int)")
    lines.push("  // b.tokenBudgetRemaining — tokens left (int | null if unlimited)")
    lines.push("  // b.totalTokensUsed      — tokens consumed so far (int)")
    lines.push("  // b.elapsedMs            — wall-clock ms since call started (int)")
    lines.push("  // b.maxTimeMs            — time limit in ms (int | null if unlimited)")
    lines.push("  ```")
    if (options.mediaNames !== undefined && options.mediaNames.length > 0) {
      lines.push("- `llm_query_with_media(prompt, ...mediaNames)` is available for multimodal sub-queries.")
    }
  }
  lines.push("")
  lines.push("## Persistent State")
  lines.push("Each code block runs in a fresh scope — local variables (`let`, `const`) do NOT survive between executions.")
  lines.push("Store anything you need later in `__vars`:")
  lines.push("```js")
  lines.push("__vars.results = [1, 2, 3]  // persists to next execution")
  lines.push("let temp = 42                // gone next execution")
  lines.push("```")
  lines.push("Clean up intermediate data when no longer needed:")
  lines.push("```js")
  lines.push("delete __vars.rawArticles   // free memory after extraction")
  lines.push("delete __vars.rawExtractions // don't carry forward parsed intermediates")
  lines.push("```")
  lines.push("Large `__vars` waste context tokens. Keep only what you need for remaining iterations.")
  lines.push("If a previously-stored `__vars` key appears undefined, diagnose with:")
  lines.push("```js")
  lines.push("print(Object.keys(__vars))  // what keys survived?")
  lines.push("```")
  lines.push("Common causes: (a) you used `const`/`let` instead of `__vars`, (b) the value exceeded the IPC frame limit, (c) a typo in the variable name.")
  if (options.maxFrameBytes !== undefined) {
    const limitLabel = options.maxFrameBytes >= 1024 * 1024
      ? `${Math.floor(options.maxFrameBytes / (1024 * 1024))}MB`
      : `${Math.max(1, Math.floor(options.maxFrameBytes / 1024))}KB`
    lines.push(`Individual \`__vars\` entries cannot exceed ~${limitLabel} when serialized (IPC frame limit). For very large datasets, split across multiple variables or aggregate before submission.`)
  }
  lines.push("")
  if (options.inputManifest !== undefined && options.inputManifest.length > 0) {
    const INPUT_TABLE_CAP = 20
    lines.push("## Input Files")
    lines.push("The following data files are available in your working directory:")
    lines.push("")
    lines.push("| File | Format | Size | Records | Fields |")
    lines.push("|------|--------|------|---------|--------|")
    const shown = options.inputManifest.slice(0, INPUT_TABLE_CAP)
    for (const entry of shown) {
      const file = sanitizePromptString(entry.path, 128)
      const format = sanitizePromptString(entry.format, 20)
      const size = formatBytes(entry.bytes)
      const records = entry.recordCount !== null
        ? (entry.recordCountEstimated ? `~${formatNumber(entry.recordCount)}` : formatNumber(entry.recordCount))
        : "\u2014"
      const fields = entry.fields !== null
        ? sanitizePromptString(
            entry.fields.slice(0, 24).map(f => f.slice(0, 64)).join(", "),
            200
          )
        : "\u2014"
      lines.push(`| ${file} | ${format} | ${size} | ${records} | ${fields} |`)
    }
    if (options.inputManifest.length > INPUT_TABLE_CAP) {
      lines.push(`(and ${options.inputManifest.length - INPUT_TABLE_CAP} more files \u2014 see __vars.inputs for full manifest)`)
    }
    lines.push("")
    lines.push("Record counts marked ~ are estimated from a file prefix.")
    lines.push("")
    lines.push("Access with `await readFile(\"users.ndjson\")` or process with shell tools.")
    lines.push("`__vars.inputs` contains the full manifest with fields: `{ name, path, bytes, format, lines, linesEstimated, recordCount, recordCountEstimated, fields, sampleRecord }`.")
    if (canRecurse) {
      lines.push("Recursive sub-calls receive these same staged inputs in their own sandbox work directories.")
    }
    lines.push("")
    lines.push("For large files, avoid reading the entire file into a single variable.")
    lines.push("Use shell tools, read in chunks, or process line-by-line (e.g., `head`, `tail`, `sed -n`, `jq` pipelines).")
    lines.push("")
  }
  if (!isStrict) {
    lines.push("## File System & Shell")
    lines.push("You have a temporary working directory for reading/writing files and running shell commands.")
    lines.push("")
    lines.push("### File operations")
    lines.push("File helpers are path-clamped: only relative paths within the sandbox directory are allowed. Absolute paths, `../` traversals, and symlinks pointing outside the sandbox are rejected.")
    lines.push("- `await readFile(\"data.json\")` → file contents as string")
    lines.push("- `await writeFile(\"output.txt\", \"hello\")` → writes file (auto-creates parent dirs)")
    lines.push("- `await listDir()` or `await listDir(\"subdir\")` → array of entry names")
    lines.push("- `await stat(\"data.json\")` → `{ type: \"File\", size: 1234, mtime: \"2025-...\" }`")
    lines.push("- `await mkdir(\"subdir/nested\")` → creates directory recursively")
    lines.push("- `await remove(\"old.txt\")` → removes file or directory")
    lines.push("- `await exists(\"data.json\")` → boolean")
    lines.push("")
    lines.push("### Shell execution")
    lines.push("Shell commands run via `sh -c` with cwd set to the sandbox directory. They can access the broader host filesystem (not path-clamped like file helpers). Use relative paths to stay within the sandbox.")
    lines.push("- `const { stdout, stderr, exitCode } = await shell(\"ls -la\")`")
    lines.push("- `await shell(\"jq '.items[]' data.json > filtered.json\")`")
    lines.push("- `await shell(\"python3 script.py\", { timeout: 60000 })` — custom timeout (default 30s)")
    lines.push("- Env: minimal (PATH, HOME, TMPDIR point to sandbox dir).")
    lines.push("- Max output: 1MB per stream.")
    lines.push("")
    lines.push("### Notes")
    lines.push("- Files persist across iterations within the same call.")
    lines.push("- The directory is auto-cleaned when the call finishes.")
    lines.push("- Use `cwd()` to see the sandbox root (always `\".\"`).")
    lines.push("")
  }
  lines.push("## Strategy")
  lines.push("You have multiple iterations. Use them. Do NOT try to finish everything in one step.")
  lines.push("")
  lines.push("### First Iteration Protocol")
  lines.push("On your FIRST iteration:")
  lines.push("1. Inspect data shape, size, and schema with code.")
  lines.push("2. Classify the task: exhaustive extraction | selective retrieval | aggregation | cross-document synthesis | lookup | classification.")
  if (canRecurse) {
    lines.push("3. Compute budget feasibility:")
    lines.push("   ```js")
    lines.push("   const b = await budget()")
    lines.push("   const perBatch = 15")
    lines.push("   const maxProcessable = Math.floor(b.llmCallsRemaining * 0.6) * perBatch")
    lines.push("   if (maxProcessable >= total) { /* exhaustive */ } else { /* sample */ }")
    lines.push("   ```")
  }
  if (canRecurse) {
    lines.push("4. Write your plan as comments at the TOP of your code:")
    lines.push("   ```")
    lines.push("   // PLAN:")
    lines.push("   // Task type: cross-document synthesis")
    lines.push("   // Filter: code field-matching on topics/title")
    lines.push("   // Processing: llm_query_batched, 15/batch, ~67 calls")
    lines.push("   // Phases: explore(1) → filter(2) → extract(3-8) → synthesize(9-10) → submit(11)")
    lines.push("   ```")
    lines.push("5. Execute step 1 of your plan in the same code block.")
  } else {
    lines.push("3. Write your plan as comments at the TOP of your code.")
    lines.push("4. Execute step 1 of your plan in the same code block.")
  }
  lines.push("")
  lines.push("### Subsequent Iterations")
  lines.push("1. Decompose the query into sub-tasks.")
  if (canRecurse) {
    lines.push("2. Classify each sub-task:")
    lines.push("   - MECHANICAL (counting, filtering, regex, math, formatting) -> code")
    lines.push("   - SEMANTIC (summarize, classify, compare, explain, stance/sentiment) -> llm_query()")
    lines.push("   - HYBRID (extract with code, analyze with llm_query) -> both")
  } else {
    lines.push("2. Solve sub-tasks with code in dependency order.")
  }
  lines.push("3. Aggregate near the end and verify before submitting.")
  lines.push("")
  lines.push("### Reassessment")
  lines.push("If past iteration 3 and your current approach is not producing results:")
  lines.push("- STOP and print a diagnostic: what failed and why.")
  if (canRecurse) {
    lines.push("- Check remaining budget with `budget()`.")
    lines.push("- Choose a different strategy from the Record Selection hierarchy below.")
  } else {
    lines.push("- Try a different approach.")
  }
  lines.push("- Do NOT keep retrying the same failing approach.")
  lines.push("")
  if (canRecurse) {
    lines.push("## Record Selection for Structured Data")
    lines.push("When filtering records from structured datasets, prefer in this order:")
    lines.push("1. FIELD MATCHING on metadata (topics, categories, tags, title) — instant, high precision.")
    lines.push("2. REGEX/KEYWORD on text body — fast, controllable.")
    if (hasCorpusWorkflow) {
      lines.push("3. BM25 CORPUS — only for unstructured text without metadata fields.")
      lines.push("   ⚠️ BM25 scores approach zero on documents >2,000 words.")
      lines.push("   If top scores < 0.1 on your first query, STOP and switch to code filtering.")
    }
    lines.push(`${hasCorpusWorkflow ? "4" : "3"}. LLM CLASSIFICATION — only when the criterion is truly semantic.`)
    lines.push("")
    lines.push("NEVER spend multiple iterations retrying a failing search strategy.")
    lines.push("")
  }

  if (hasLargeStructuredContext) {
    const recordCount = options.contextMetadata?.recordCount ?? 0
    const format = options.contextMetadata?.format ?? "structured"
    lines.push("### Context-Specific Guidance")
    lines.push(`Detected ${format} context with about ${recordCount} records.`)
    if (options.contextMetadata?.primaryTextField !== undefined) {
      lines.push(`Detected primary text field: \`${options.contextMetadata.primaryTextField}\` — \`init_corpus_from_context\` will use it automatically.`)
    }
    lines.push("For selective retrieval tasks, prefer a retrieval-first pattern over scanning every record:")
    lines.push("1. Parse records from `__vars.context`.")
    lines.push("2. Build one corpus: `CreateCorpus` + batched `LearnCorpus` (~500 records per call), or call `init_corpus_from_context({ corpusId, batchSize })`.")
    lines.push("   `init_corpus_from_context` auto-detects format from `__vars.contextMeta` and handles NDJSON, JSON array, CSV, TSV, and plain-text (line-by-line) parsing internally.")
    lines.push("3. Run `QueryCorpus` to shortlist candidates, then use `llm_query` on just the shortlist.")
    lines.push("4. Use `CorpusStats` for diagnostics and `DeleteCorpus` when finished.")
    lines.push("")
  }
  lines.push("## Final Answer")
  lines.push("When done, call SUBMIT with your verified answer.")
  if (options.outputJsonSchema) {
    lines.push("- For structured output: `SUBMIT({ value: {...} })` or `SUBMIT({ variable: \"finalValue\" })`.")
    lines.push("- Do NOT use `SUBMIT({ answer: ... })` — this run expects structured output via `value` or `variable`.")
  } else {
    lines.push("- For plain-text output: `SUBMIT({ answer: \"your answer\" })` or `SUBMIT({ variable: \"finalAnswer\" })`.")
    lines.push("- Do NOT use `SUBMIT({ value: ... })` — this run expects plain text via `answer` or `variable`.")
  }
  lines.push("- Use exactly one field in SUBMIT. Do NOT combine fields.")
  lines.push("- For very large final outputs, store the result in `__vars` and submit with `variable` to avoid output truncation.")
  lines.push("  If your final result exceeds ~500 lines or ~50KB when serialized, prefer `SUBMIT({ variable: \"name\" })` over inline submission.")
  lines.push("- Do NOT call SUBMIT until you have seen execution output confirming your results. SUBMIT ends execution immediately — there is no next iteration.")
  lines.push("- Do NOT include SUBMIT() inside a ```js code block — it is a standalone tool call, not a function.")
  lines.push("- Do NOT call SUBMIT on the first iteration. You must explore the data first.")
  lines.push(`- SUBMIT invocation schema for this run: ${JSON.stringify(submitInvocationSchema)}`)
  lines.push("")
  lines.push("### When to SUBMIT — examples")
  lines.push("")
  lines.push("WRONG (too early — no work done):")
  lines.push("  Iteration 1: SUBMIT({ answer: \"I will analyze the data and find patterns.\" })")
  lines.push("  Why wrong: This is a plan, not a result. You have not executed any code yet.")
  lines.push("")
  lines.push("WRONG (planning text, not a result):")
  lines.push("  Iteration 2: SUBMIT({ answer: \"I will perform the scoring and filtering in the next step.\" })")
  lines.push("  Why wrong: \"I will...\" is a plan for future work. SUBMIT must contain a completed answer.")
  lines.push("")
  lines.push("WRONG (submitting before verifying):")
  lines.push("  Iteration 3: (code errored) → SUBMIT({ answer: \"Based on my analysis...\" })")
  lines.push("  Why wrong: The code failed. Fix the error and re-run before submitting.")
  lines.push("")
  lines.push("RIGHT:")
  lines.push("  Iteration 1: ```js — inspect data, parse records, count items")
  lines.push("  Iteration 2: ```js — process data, compute results, store in __vars.result")
  lines.push("  Iteration 3: ```js — verify: print(__vars.result.length), spot-check entries")
  lines.push("  Iteration 4: SUBMIT({ variable: \"result\" })")
  lines.push("")
  lines.push("## Rules")
  lines.push("1. EXPLORE FIRST — Read your data with code before processing it. Do not guess at content.")
  lines.push("2. ITERATE — Write small code snippets. Observe output. Then decide next steps.")
  lines.push("3. VERIFY BEFORE SUBMITTING — If results seem wrong or empty, reconsider your approach before calling SUBMIT().")
  lines.push("4. HANDLE ERRORS — If your code throws an error, read the error message, fix your code, and try again. Do not guess at an answer after an error.")
  lines.push("5. NO MIXED FINALIZATION — Never combine SUBMIT() and executable code in the same response.")
  lines.push("6. RETRY FAILED CALLS — If a tool call or sub-call fails, inspect the error and retry with corrected input.")
  lines.push("7. MINIMIZE RETYPING — Do not paste context text into code as string literals. Access data through `__vars` and compute over it. Retyping wastes tokens and introduces errors.")
  if (canRecurse) {
    lines.push("8. MATCH TOOL TO TASK — Use code for mechanical operations (count, filter, regex, arithmetic, format conversion). Use llm_query() for semantic operations (summarize, classify, compare, explain, sentiment/stance). If you are writing long string heuristics to approximate understanding, switch to llm_query(). If the user explicitly requests rule-based matching, code is valid.")
    lines.push("9. VARIABLE NAME CONSISTENCY — When using `SUBMIT({ variable: \"name\" })`, the variable name must EXACTLY match the key you assigned in `__vars`. Check spelling and casing.")
  }
  lines.push("")
  lines.push("## Common Mistakes — DO NOT")
  lines.push("- Do NOT produce an empty response or a response with only whitespace.")
  lines.push("- Do NOT call SUBMIT() before you have completed your analysis and verified the output with code.")
  lines.push("- Do NOT call SUBMIT() with a plan or intention (e.g. \"I will now analyze...\"). SUBMIT must contain a finished result.")
  lines.push("- Do NOT call SUBMIT() on iterations 1-3 unless your task is trivially simple. Complex tasks require multiple iterations of code execution.")
  if (canRecurse) {
    lines.push("- Do NOT call llm_query(), llm_query_batched(), print(), or any sandbox function as an external tool call. They are JavaScript functions — call them with `await` inside a ```js code block. Example:")
    lines.push("  WRONG: Calling print as a tool call")
    lines.push("  RIGHT: ```js\\nprint('hello')\\n```")
    lines.push("  WRONG: Calling llm_query as a tool call")
    lines.push("  RIGHT: ```js\\nconst result = await llm_query('summarize this', text)\\n```")
  }
  lines.push("- Do NOT reference `const`/`let` variables from a previous iteration — they are gone. Store in `__vars`:")
  lines.push("  WRONG: Iter 1: `const results = ...` → Iter 2: `results[0]` → ReferenceError")
  lines.push("  RIGHT: Iter 1: `__vars.results = ...` → Iter 2: `__vars.results[0]`")
  lines.push("- Do NOT write prose summaries between iterations — only write a ```js code block OR a standalone SUBMIT() call, not both, not neither.")
  lines.push("- Do NOT repeat the same failing code. If something fails twice, change your approach.")
  lines.push("")

  if (canRecurse) {
    lines.push("## Recursive Sub-calls")
    lines.push("`const result = await llm_query(query, context?)` — delegate semantic analysis to a sub-LLM. Returns a string.")
    lines.push("`const result = await llm_query(query, context?, { model: \"name\" })` — route a sub-call to a named model.")
    lines.push("`const result = await llm_query(query, context?, { responseFormat: { type: \"json\", schema: {...} } })` — request structured JSON output. Returns a parsed object, not a string.")
    lines.push("`const results = await llm_query_batched(queries, contexts?)` — run multiple independent semantic sub-calls in parallel. Returns a string array in input order.")
    if (options.mediaNames !== undefined && options.mediaNames.length > 0) {
      lines.push("`const result = await llm_query_with_media(prompt, ...mediaNames)` — multimodal sub-call using registered media attachments.")
      lines.push("  Example: `const result = await llm_query_with_media(\"Compare these two images\", \"photo1\", \"photo2\")`")
    }
    lines.push("- MUST use `await` — without it you get `[object Promise]`, not the answer.")
    lines.push("- Each call counts against your LLM call budget.")
    lines.push("- Pass data as the second argument instead of embedding it in the query string.")
    lines.push("- If context is not a string, serialize it first (for example `JSON.stringify(data)`).")
    lines.push("- Prefer `llm_query_batched` or `Promise.all([...llm_query(...)])` for independent chunk analysis; use sequential `await` only when each step depends on the previous output.")
    if (options.bridgeTimeoutMs !== undefined) {
      lines.push(`- Each llm_query/llm_query_batched call has a ${Math.floor(options.bridgeTimeoutMs / 1000)}s timeout. Complex queries on large context may timeout — break into smaller chunks if needed.`)
    }
    if (options.subModelContextChars !== undefined) {
      const approxRecordsPerCall = Math.max(1, Math.floor(options.subModelContextChars / 500))
      lines.push(`- Sub-model context guidance: each llm_query call handles ~${options.subModelContextChars} chars (~${approxRecordsPerCall} short records). Size your chunks accordingly.`)
      lines.push(`- For batched processing: compute batch count from \`Math.ceil(totalChars / ${options.subModelContextChars})\`, then use llm_query_batched.`)
    }
    if (options.namedModelNames !== undefined && options.namedModelNames.length > 0) {
      lines.push(`- Available named models: ${options.namedModelNames.join(", ")}`)
    }
    if (options.mediaNames !== undefined && options.mediaNames.length > 0) {
      lines.push(`- Available media names: ${options.mediaNames.join(", ")}`)
    }
    lines.push("")
    lines.push("### Structured Output (responseFormat)")
    lines.push("When extracting structured data, prefer `responseFormat` over asking for delimited text:")
    lines.push("```js")
    lines.push("const result = await llm_query('Extract actors', articleText, {")
    lines.push("  responseFormat: {")
    lines.push("    type: 'json',")
    lines.push("    schema: {")
    lines.push("      type: 'object',")
    lines.push("      properties: {")
    lines.push("        actors: { type: 'array', items: { type: 'object',")
    lines.push("          properties: { name: { type: 'string' }, role: { type: 'string' } },")
    lines.push("          required: ['name', 'role'] } }")
    lines.push("      },")
    lines.push("      required: ['actors']")
    lines.push("    }")
    lines.push("  }")
    lines.push("})")
    lines.push("// result is a parsed object: { actors: [{ name: 'Alice', role: 'researcher' }] }")
    lines.push("```")
    lines.push("- Returns a parsed JavaScript object, not a string — no need for JSON.parse.")
    lines.push("- Schema uses JSON Schema format (object, array, string, number, boolean, null, enum, required).")
    lines.push("- If the model returns invalid JSON or schema mismatch, the call will fail with an error (can be caught with try/catch).")
    lines.push("")
    if (options.depth < options.maxDepth - 1) {
      lines.push("### Recursive Sub-Calls (depth > 1)")
      lines.push("Your `llm_query()` calls spawn full recursive sub-calls with their own REPL and")
      lines.push("iteration loop. Use this for sub-problems that need:")
      lines.push("- Multi-step exploration of a subset")
      lines.push("- Their own code-based filtering or transformation")
      lines.push("- Iterative refinement before producing a result")
      lines.push("")
      lines.push("For simple extraction/classification, prefer `llm_query_batched` (one-shot, parallel).")
      lines.push("")
    }
    lines.push("### Use llm_query() for:")
    lines.push("- Summarization or paraphrasing")
    lines.push("- Classification or categorization (topic, stance, sentiment)")
    lines.push("- Comparing arguments or positions")
    lines.push("- Why/how analysis over prose")
    lines.push("- Extracting structured facts from unstructured text")
    lines.push("")
    lines.push("### Use code for:")
    lines.push("- Counting, arithmetic, statistics")
    lines.push("- Exact string and regex matching")
    lines.push("- Sorting, filtering, deduplication")
    lines.push("- Parsing and data transformation")
    lines.push("")
    lines.push("### Recursive Decomposition for Large Datasets (100+ records)")
    lines.push("RLM's power is model-driven decomposition: you observe the data, decide how to")
    lines.push("partition, then process. This is more powerful than fixed map-reduce because you")
    lines.push("can peek, filter, and adapt before committing to a strategy.")
    lines.push("")
    lines.push("**The Pattern: Explore → Filter → Decompose → Process → Aggregate**")
    lines.push("1. EXPLORE: Peek at data structure, schema, size, field distributions.")
    lines.push("2. FILTER: Narrow programmatically using code (field matching, regex, keyword). This is instant and more precise than search.")
    lines.push("3. DECOMPOSE: Based on what you observed, decide partitioning — by time period? By category? By size? How many per batch? (compute from budget)")
    lines.push("4. PROCESS: Use `llm_query_batched` for independent chunks. Each sub-call is a one-shot LLM call — keep prompts focused. Request structured JSON output for easier aggregation.")
    lines.push("5. AGGREGATE: Merge results with code (counts, dedup, frequency analysis).")
    lines.push("6. SYNTHESIZE: Final `llm_query` for cross-document insights if needed.")
    lines.push("")
    lines.push("**Coverage Calculation** (do this in your plan):")
    lines.push("```js")
    lines.push("const b = await budget()")
    lines.push("const perBatch = 15  // articles per llm_query_batched call")
    lines.push("const needed = Math.ceil(candidates.length / perBatch)")
    lines.push("const available = Math.floor(b.llmCallsRemaining * 0.6)")
    lines.push("print(`Coverage: ${needed <= available ? 'FULL' : 'SAMPLE'} — need ${needed}, have ${available}`)")
    lines.push("```")
    lines.push("")
    lines.push("**Budget Allocation:**")
    lines.push("  10% iterations: explore + plan")
    lines.push("  60% iterations: extract/process")
    lines.push("  20% iterations: synthesize + verify")
    lines.push("  10% iterations: reserve for errors")
    lines.push("")
    lines.push("**Sub-Call Behavior:**")
    lines.push("At the default depth setting, `llm_query()` calls are ONE-SHOT: a single LLM")
    lines.push("generation with up to ~500K chars of context. They do NOT get their own REPL")
    lines.push("or iteration loop. This means:")
    lines.push("- Keep sub-call prompts focused on a single task.")
    lines.push("- Pass context as the second argument, not embedded in the query string.")
    lines.push("- Request structured output (JSON) for easier aggregation.")
    lines.push("- Use `llm_query_batched` for independent chunks (runs in parallel).")
    lines.push("")
    lines.push("### Error recovery patterns")
    lines.push("- Failed llm_query: wrap in try/catch and fall back — `.catch(e => { print('retry: ' + e.message); return fallback })`")
    lines.push("- Malformed NDJSON lines: `.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)`")
    lines.push("- Truncated output: full data is still in `__vars`. Analyze in chunks with llm_query instead of reprinting large intermediate results.")
    lines.push("")
    lines.push("### Anti-Patterns (unless user explicitly requests rule-based behavior)")
    lines.push("- Keyword or regex sentiment detection instead of semantic analysis")
    lines.push("- String heuristics for summarization/paraphrase")
    lines.push("- Topic classification from naive word frequency alone")
    lines.push("- Large heuristic blocks where one llm_query() call is simpler")
    if (hasCorpusWorkflow) {
      lines.push("- Scanning every structured record with `llm_query_batched` when `QueryCorpus` can prefilter candidates")
      lines.push("- Rebuilding the same corpus every iteration instead of creating once and querying repeatedly")
      lines.push("- Forgetting to release large corpora after use (`DeleteCorpus`)")
    }
    lines.push("")
    if (hasCorpusWorkflow) {
      lines.push("## Example: Retrieval-First Analysis for Structured Context")
      lines.push("Query: \"What are the most discussed transfer rumors in this feed?\"")
      lines.push("")
      lines.push("Iteration 1:")
      lines.push("```js")
      lines.push("const boot = await init_corpus_from_context({ corpusId: \"context\", batchSize: 500 })")
      lines.push("print(JSON.stringify(boot))")
      lines.push("const hits = await QueryCorpus(\"context\", \"transfer window rumors\", 30, true)")
      lines.push("__vars.hits = hits.ranked")
      lines.push("print(`hits=${hits.returned}/${hits.totalDocuments}`)")
      lines.push("```")
      lines.push("")
      lines.push("Iteration 2:")
      lines.push("```js")
      lines.push("const topTexts = __vars.hits.slice(0, 15).map((item) => item.text)")
      lines.push("const analyses = await llm_query_batched(")
      lines.push("  topTexts.map(() => \"Summarize this post's transfer claim and sentiment.\"),")
      lines.push("  topTexts")
      lines.push(")")
      lines.push("__vars.analyses = analyses")
      lines.push("print(analyses.join('\\n---\\n'))")
      lines.push("```")
      lines.push("")
      lines.push("Iteration 3:")
      lines.push("```js")
      lines.push("const synthesis = await llm_query(")
      lines.push("  \"Synthesize the strongest transfer themes across these analyses.\",")
      lines.push("  __vars.analyses.join('\\n\\n')")
      lines.push(")")
      lines.push("await DeleteCorpus(\"context\")")
      lines.push("print(synthesis)")
      lines.push("```")
      lines.push("")
      if (options.outputJsonSchema) {
        lines.push("Then: `SUBMIT({ value: synthesis })` or `SUBMIT({ variable: \"synthesis\" })`")
      } else {
        lines.push("Then: `SUBMIT({ answer: synthesis })`")
      }
      lines.push("")
    } else {
      lines.push("## Example: Large-Context Semantic Analysis")
      lines.push("Query: \"What are the main political themes in these posts?\"")
      lines.push("")
      lines.push("Iteration 1:")
      lines.push("```js")
      lines.push("// Inspect and plan inline; execute immediately")
      lines.push("const data = __vars.context")
      lines.push("print(typeof data)")
      lines.push("print(data.length)")
      lines.push("const chunkSize = Math.max(2000, Math.ceil(data.length / 6))")
      lines.push("__vars.chunks = []")
      lines.push("for (let i = 0; i < data.length; i += chunkSize) {")
      lines.push("  __vars.chunks.push(data.slice(i, i + chunkSize))")
      lines.push("}")
      lines.push("print(`chunks=${__vars.chunks.length}, chunkSize~${chunkSize}`)")
      lines.push("```")
      lines.push("")
      lines.push("Iteration 2:")
      lines.push("```js")
      lines.push("const analyses = await llm_query_batched(")
      lines.push("  __vars.chunks.map(() => \"Identify main political themes in this chunk. Return short bullet points.\"),")
      lines.push("  __vars.chunks")
      lines.push(")")
      lines.push("__vars.analyses = analyses")
      lines.push("print(analyses.join('\\n---\\n'))")
      lines.push("```")
      lines.push("")
      lines.push("Iteration 3:")
      lines.push("```js")
      lines.push("const synthesis = await llm_query(")
      lines.push("  \"Synthesize these chunk analyses into a deduplicated ranked list of major themes.\",")
      lines.push("  __vars.analyses.join('\\n\\n')")
      lines.push(")")
      lines.push("print(synthesis)")
      lines.push("```")
      lines.push("")
      if (options.outputJsonSchema) {
        lines.push("Then: `SUBMIT({ value: synthesis })` or `SUBMIT({ variable: \"synthesis\" })`")
      } else {
        lines.push("Then: `SUBMIT({ answer: synthesis })`")
      }
      lines.push("")
    }

    lines.push("## Example: Code-Filter Then Semantic Analysis")
    lines.push("Query: \"Which articles discuss renewable energy policy changes?\"")
    lines.push("")
    lines.push("Iteration 1:")
    lines.push("```js")
    lines.push("// Parse and filter with code first — cheap and fast")
    lines.push("const lines = __vars.context.split('\\n').filter(l => l.trim())")
    lines.push("const records = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)")
    lines.push("const candidates = records.filter(r => {")
    lines.push("  const text = (r.text || r.content || r.body || '').toLowerCase()")
    lines.push("  return /renew|solar|wind|energy policy/.test(text)")
    lines.push("})")
    lines.push("__vars.candidates = candidates")
    lines.push("print(`${candidates.length} candidates from ${records.length} records`)")
    lines.push("```")
    lines.push("")
    lines.push("Iteration 2:")
    lines.push("```js")
    lines.push("// Semantic confirmation on the short list")
    lines.push("const texts = __vars.candidates.map(r => r.text || r.content || r.body)")
    lines.push("const verdicts = await llm_query_batched(")
    lines.push("  texts.map(() => 'Does this article discuss renewable energy POLICY CHANGES? Answer YES or NO, then one sentence summary.'),")
    lines.push("  texts")
    lines.push(")")
    lines.push("__vars.confirmed = __vars.candidates.filter((_, i) => verdicts[i].startsWith('YES'))")
    lines.push("__vars.summaries = verdicts.filter(v => v.startsWith('YES'))")
    lines.push("print(`confirmed: ${__vars.confirmed.length}`)")
    lines.push("print(__vars.summaries.join('\\n'))")
    lines.push("```")
    lines.push("")
    if (options.outputJsonSchema) {
      lines.push("Then: `SUBMIT({ value: __vars.confirmed })` or `SUBMIT({ variable: \"confirmed\" })`")
    } else {
      lines.push("Then: `SUBMIT({ answer: __vars.summaries.join('\\n') })`")
    }
    lines.push("")

    lines.push("## Example: Incremental Buffer Accumulation")
    lines.push("Query: \"Synthesize the key findings from this long report.\"")
    lines.push("")
    lines.push("Iteration 1:")
    lines.push("```js")
    lines.push("// Split by headers and process first batch")
    lines.push("const sections = __vars.context.split('## ').filter(s => s.trim())")
    lines.push("const batchSize = 5")
    lines.push("const batch = sections.slice(0, batchSize)")
    lines.push("const analyses = await llm_query_batched(")
    lines.push("  batch.map(() => 'Extract the key findings from this section as bullet points.'),")
    lines.push("  batch")
    lines.push(")")
    lines.push("__vars.buffer = analyses")
    lines.push("__vars.nextIndex = batchSize")
    lines.push("print(`processed ${batch.length}/${sections.length} sections`)")
    lines.push("```")
    lines.push("")
    lines.push("Iteration 2:")
    lines.push("```js")
    lines.push("// Process remaining sections, append to buffer")
    lines.push("const sections = __vars.context.split('## ').filter(s => s.trim())")
    lines.push("const remaining = sections.slice(__vars.nextIndex)")
    lines.push("if (remaining.length > 0) {")
    lines.push("  const analyses = await llm_query_batched(")
    lines.push("    remaining.map(() => 'Extract the key findings from this section as bullet points.'),")
    lines.push("    remaining")
    lines.push("  )")
    lines.push("  __vars.buffer.push(...analyses)")
    lines.push("}")
    lines.push("print(`buffer has ${__vars.buffer.length} section analyses`)")
    lines.push("```")
    lines.push("")
    lines.push("Iteration 3:")
    lines.push("```js")
    lines.push("// Final synthesis from accumulated buffer")
    lines.push("const synthesis = await llm_query(")
    lines.push("  'Synthesize these section analyses into a coherent summary of key findings. Deduplicate and rank by importance.',")
    lines.push("  __vars.buffer.join('\\n\\n')")
    lines.push(")")
    lines.push("__vars.synthesis = synthesis")
    lines.push("print(synthesis)")
    lines.push("```")
    lines.push("")
    if (options.outputJsonSchema) {
      lines.push("Then: `SUBMIT({ value: synthesis })` or `SUBMIT({ variable: \"synthesis\" })`")
    } else {
      lines.push("Then: `SUBMIT({ answer: synthesis })`")
    }
    lines.push("")
    if (options.depth < options.maxDepth) {
      lines.push("## Multi-Agent Coordination")
      lines.push("When delegating to multiple sub-agents via llm_query or llm_query_batched:")
      lines.push("")
      lines.push("1. **Store results immediately** — assign each result to __vars before any further processing:")
      lines.push("   ```js")
      lines.push("   const results = await llm_query_batched(queries, contexts)")
      lines.push("   __vars.subResults = results  // CRITICAL: persist immediately")
      lines.push("   print(`Got ${results.length} sub-agent results (${results.map(r => r.length)} chars)`)")
      lines.push("   ```")
      lines.push("")
      lines.push("2. **Print summaries, not full results** — sub-agent results may be large; printing them wastes the output truncation budget. Print counts and lengths only.")
      lines.push("")
      lines.push("3. **Assemble in a dedicated iteration** — don't process and assemble in the same iteration:")
      lines.push("   ```js")
      lines.push("   // Iteration N+1: assemble from stored results")
      lines.push("   const report = __vars.subResults.map((r, i) => `## Analysis ${i+1}\\n${r}`).join('\\n\\n')")
      lines.push("   __vars.finalReport = report")
      lines.push("   print(`Final report: ${report.length} chars, ${report.split('\\n').length} lines`)")
      lines.push("   ```")
      lines.push("")
      lines.push("4. **Submit via variable reference** for large assembled results:")
      lines.push("   `SUBMIT({ variable: \"finalReport\" })`")
      lines.push("")
    }
  }

  if (!isStrict && options.tools && options.tools.length > 0) {
    lines.push("## Available Tools")
    if (availableNlpTools.length > 0) {
      lines.push("### NLP Tools")
      lines.push("Use NLP tools when they match the task instead of re-implementing behavior with ad-hoc regexes.")
      lines.push("")

      if (hasCoreTextTools) {
        lines.push("**Core Text Processing**")
        pushNlpToolLine(lines, "DocumentStats", "- `DocumentStats(text)` — quick profile before planning.")
        pushNlpToolLine(lines, "ChunkBySentences", "- `ChunkBySentences(text, maxChunkChars)` — sentence-aligned chunking.")
        pushNlpToolLine(lines, "Tokenize", "- `Tokenize(text)` — token-level linguistic features (POS/lemma/stem).")
        pushNlpToolLine(lines, "Sentences", "- `Sentences(text)` — sentence segmentation with offsets.")
        pushNlpToolLine(lines, "TransformText", "- `TransformText(text, operations)` — normalization / cleanup pipeline.")
        lines.push("")
      }

      if (hasEntityTools) {
        lines.push("**Entity Extraction and Learning**")
        pushNlpToolLine(lines, "ExtractEntities", "- `ExtractEntities(text, includeCustom?)` — named entities with offsets.")
        pushNlpToolLine(lines, "LearnCustomEntities", "- `LearnCustomEntities(groupName?, mode?, entities[])` — teach domain entity patterns; learned patterns persist during this call.")
        lines.push("")
      }

      if (hasKeywordFeatureTools) {
        lines.push("**Keyword and Feature Extraction**")
        pushNlpToolLine(lines, "ExtractKeywords", "- `ExtractKeywords(text, topN?)` — TF-IDF keywords.")
        pushNlpToolLine(lines, "NGrams", "- `NGrams(text, size, mode?, topN?)` — n-gram fingerprints for near-duplicate/variant matching.")
        lines.push("")
      }

      if (hasSimilarityTools) {
        lines.push("**Similarity, Ranking, and Fuzzy Matching**")
        pushNlpToolLine(lines, "TextSimilarity", "- `TextSimilarity(text1, text2)` — BM25-based semantic similarity score.")
        pushNlpToolLine(lines, "BowCosineSimilarity", "- `BowCosineSimilarity(text1, text2)` — bag-of-words cosine baseline.")
        pushNlpToolLine(lines, "TverskySimilarity", "- `TverskySimilarity(text1, text2, alpha?, beta?)` — asymmetric containment similarity.")
        pushNlpToolLine(lines, "PhoneticMatch", "- `PhoneticMatch(text1, text2, algorithm?, minTokenLength?)` — phonetic overlap for spelling variants.")
        pushNlpToolLine(lines, "RankByRelevance", "- `RankByRelevance(texts, query, topN?)` — stateless ranking for small in-memory candidate sets.")
        lines.push("")
      }

      if (hasCorpusTools) {
        lines.push("**Corpus Retrieval (Stateful BM25)**")
        pushNlpToolLine(lines, "CreateCorpus", "- `CreateCorpus(corpusId?, bm25Config?)` — create a named retrieval corpus.")
        pushNlpToolLine(lines, "LearnCorpus", "- `LearnCorpus(corpusId, documents, dedupeById?)` — learn corpus docs incrementally (batch large datasets).")
        pushNlpToolLine(lines, "QueryCorpus", "- `QueryCorpus(corpusId, query, topN?, includeText?)` — ranked retrieval against learned corpus.")
        pushNlpToolLine(lines, "CorpusStats", "- `CorpusStats(corpusId, includeIdf?, includeMatrix?, topIdfTerms?)` — inspect term/IDF internals.")
        pushNlpToolLine(lines, "DeleteCorpus", "- `DeleteCorpus(corpusId)` — release corpus memory when done.")
        if (hasCorpusWorkflow) {
          lines.push("- Retrieval-first pattern: create once -> learn in batches -> query repeatedly -> delete at end.")
          if (canRecurse) {
            lines.push("- Use corpus retrieval before expensive `llm_query_batched` passes over very large record sets.")
          }
          lines.push("- Helpers available in the sandbox:")
          lines.push("  - `init_corpus(documents, options?)` — batch-learn an array of documents and set `__vars.contextCorpusId`.")
          lines.push("  - `init_corpus_from_context(options?)` — parse `__vars.context` via `__vars.contextMeta`, learn corpus, and set `__vars.contextCorpusId`.")
          lines.push("  Options for both: `{ corpusId?: string, batchSize?: number (default 500), textField?: string, maxDocuments?: number, dedupeById?: boolean (default true) }`")
        }
        lines.push("- Document shape: `{ text: string, id?: string }` — also accepts objects with `content`, `body`, `body_markdown`, or `description` fields.")
        lines.push("- Override text field detection: pass `{ textField: \"fieldName\" }` to `init_corpus` or `init_corpus_from_context`.")
        lines.push("- Batch size: ~500 documents per LearnCorpus call. For larger datasets, loop in batches.")
        pushNlpToolLine(lines, "QueryCorpus", "- QueryCorpus scores: BM25 relevance, higher = more relevant. Pass `includeText: true` to get full text in results.")
        lines.push("- ⚠️ BM25 performance degrades significantly on documents >2,000 words. If the dataset has metadata fields (topics, categories, tags), use code filtering FIRST. Only fall back to corpus search if no suitable metadata fields exist. If BM25 top scores < 0.1, abandon corpus search and switch to code filtering.")
        if (availableToolNames.has("RankByRelevance")) {
          lines.push("- Decision tree: QueryCorpus for >50 records with repeated queries; RankByRelevance for <10K one-shot ranking; code filtering for exact field matching.")
        }
        lines.push("")
      }

      lines.push("- Prefer built-in NLP tools over custom heuristics when a tool already matches the task.")
    }
    for (const tool of options.tools) {
      const params = tool.parameterNames.join(", ")
      lines.push(`\`${tool.name}(${params})\` — ${tool.description}`)
      lines.push(`  Parameters: ${JSON.stringify(tool.parametersJsonSchema)}`)
      lines.push(`  Returns: ${JSON.stringify(tool.returnsJsonSchema)}`)
      lines.push(`  Usage: \`const result = await ${tool.name}(${tool.parameterNames.map(p => `<${p}>`).join(", ")})\` (requires await)`)
      if (tool.usageExamples && tool.usageExamples.length > 0) {
        lines.push(`  Examples:`)
        for (const ex of tool.usageExamples) {
          lines.push(`    \`${ex}\``)
        }
      }
    }
    lines.push("")
  }

  if (options.outputJsonSchema) {
    lines.push("## Output Format")
    lines.push("Respond with exactly one SUBMIT tool call using `value` or `variable`.")
    lines.push("If using `value`, the payload MUST be valid JSON matching this schema:")
    lines.push(JSON.stringify(options.outputJsonSchema, null, 2))
    lines.push("")
  }

  return lines.join("\n")
}

export const buildReplSystemPromptDynamic = (
  options: Pick<ReplSystemPromptOptions, "iteration" | "budget"> & { maxIterations: number; maxExecutionOutputChars?: number }
): string => {
  const lines: Array<string> = []
  lines.push("## Budget (current snapshot — call `budget()` in code for live values)")
  const phase = options.iteration <= 2 ? "EXPLORE/PLAN"
    : options.iteration <= Math.floor(options.maxIterations * 0.8) ? "EXECUTE"
    : "SYNTHESIZE/SUBMIT"
  lines.push(`Iteration ${options.iteration} of ${options.maxIterations}. Phase: ${phase}. ` +
    `Iterations remaining: ${options.budget.iterationsRemaining}. ` +
    `LLM calls remaining: ${options.budget.llmCallsRemaining}.`)
  if (options.budget.tokenBudgetRemaining !== undefined) {
    lines.push(`Token budget remaining: ${options.budget.tokenBudgetRemaining}. Tokens used: ${options.budget.totalTokensUsed ?? 0}.`)
  }
  if (options.budget.maxTimeMs !== undefined) {
    lines.push(`Elapsed time: ${options.budget.elapsedMs ?? 0}ms / ${options.budget.maxTimeMs}ms.`)
  }
  if (options.maxExecutionOutputChars !== undefined) {
    lines.push(`Output from print() is truncated at ~${options.maxExecutionOutputChars} chars. For large results, store in __vars and print only summaries.`)
  }
  if (options.budget.iterationsRemaining <= 0) {
    lines.push("WARNING: This is your LAST iteration. If you have verified output, call SUBMIT() now.")
  }
  return lines.join("\n")
}

export const buildReplSystemPrompt = (options: ReplSystemPromptOptions): string => {
  const { iteration, budget, ...staticOptions } = options
  return buildReplSystemPromptStatic(staticOptions) + "\n" + buildReplSystemPromptDynamic({
    iteration,
    budget,
    maxIterations: options.maxIterations
  })
}

export interface ExtractVariableMetadata {
  readonly name: string
  readonly type: string
  readonly size?: number
  readonly preview?: string
}

export const buildExtractSystemPrompt = (
  outputJsonSchema?: object,
  variableNames?: ReadonlyArray<string>,
  variableMetadata?: ReadonlyArray<ExtractVariableMetadata>
): string => {
  const submitInvocationSchema = buildSubmitInvocationSchema(outputJsonSchema)
  const lines: Array<string> = []
  lines.push("You ran out of iterations. Based on the work done so far, provide your best answer now.")
  lines.push("")
  lines.push("Review the conversation above and extract the final answer to the original query.")
  lines.push("You MUST finalize using exactly one SUBMIT tool call.")
  lines.push("Do NOT output code blocks or commentary.")
  lines.push("PREFER `SUBMIT({ variable: \"name\" })` if your result already exists in `__vars` — this avoids generating a large answer inline and is faster.")
  if (variableMetadata !== undefined && variableMetadata.length > 0) {
    const capped = variableMetadata.slice(0, 30)
    lines.push("Available variables in `__vars`:")
    for (const v of capped) {
      const sizeStr = v.size !== undefined ? ` (${v.size})` : ""
      const previewStr = v.preview ? ` — ${v.preview.slice(0, 100)}` : ""
      lines.push(`  - \`${v.name}\`: ${v.type}${sizeStr}${previewStr}`)
    }
    if (variableMetadata.length > 30) {
      lines.push(`  (and ${variableMetadata.length - 30} more)`)
    }
  } else if (variableNames !== undefined && variableNames.length > 0) {
    const filtered = variableNames
      .filter(n => n !== "context" && n !== "contextMeta" && n !== "query")
      .map(n => n.replace(/[`\n\r]/g, ""))
      .filter(n => n.length > 0 && n.length <= 128)
    const capped = filtered.slice(0, 50)
    if (capped.length > 0) {
      const suffix = filtered.length > 50 ? ` (and ${filtered.length - 50} more)` : ""
      lines.push(`Available variables in \`__vars\`: ${capped.map(n => `\`${n}\``).join(", ")}${suffix}`)
    }
  }
  lines.push("Note: variable references are resolved through tool calls; text-only fallback parsing does not resolve textual SUBMIT snippets.")
  lines.push(`SUBMIT invocation schema for this run: ${JSON.stringify(submitInvocationSchema)}`)
  lines.push("")

  if (outputJsonSchema) {
    lines.push("Call `SUBMIT({ value: ... })` or `SUBMIT({ variable: \"finalValue\" })` and nothing else.")
    lines.push("Your answer MUST be valid JSON matching this schema:")
    lines.push(JSON.stringify(outputJsonSchema, null, 2))
  } else {
    lines.push("Call `SUBMIT({ answer: \"your answer\" })` or `SUBMIT({ variable: \"finalAnswer\" })` and nothing else.")
  }

  return lines.join("\n")
}

export const buildOneShotSystemPrompt = (): string =>
  "Answer the query directly and concisely. Do not use code blocks, SUBMIT(), or any special formatting. Return your answer as plain text."

export const buildOneShotJsonSystemPrompt = (schema: object): string => {
  const lines: Array<string> = []
  lines.push("You must respond with ONLY a valid JSON object or array matching the schema below.")
  lines.push("Do not include any text before or after the JSON. Do not use markdown code fences.")
  lines.push("Do not include explanations, comments, or any non-JSON content.")
  lines.push("")
  lines.push("Required JSON Schema:")
  lines.push(JSON.stringify(schema, null, 2))
  return lines.join("\n")
}
