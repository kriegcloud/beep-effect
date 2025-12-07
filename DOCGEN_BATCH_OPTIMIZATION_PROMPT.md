# Docgen Agents: Batch Optimization & End-to-End Testing

> **Purpose**: Implementation prompt to add batching to the granular JSDoc insertion system
>
> **Prerequisites**: The docgen agents system is already implemented per `DOCGEN_AGENTS_IMPLEMENTATION.md`
>
> **API Reference**: Uses verified `@effect/ai` patterns from `docs/research/effect-ai-actual-api-reference.md`

---

## Changes Made (Review Audit)

This document was reviewed and updated to fix the following issues:

### Fixed Issues

1. **Effect Pattern Violations**: All code examples now use Effect utilities (`A.map`, `Str.indexOf`, `F.pipe`) instead of native methods
2. **Inaccurate Function Signatures**: Updated to match actual `service.ts` implementation (e.g., `Chat.fromPrompt`, `response.text`)
3. **Missing Error Handling**: Added comprehensive error handling for batch failures, partial failures, and malformed responses
4. **Missing Fallback Strategy**: Added fallback to single-export processing when batch parsing fails
5. **Ambiguous Batch Size**: Explained the tradeoff and token limit considerations
6. **Marker Format Edge Cases**: Added escaping guidance for export names with special characters
7. **Native Map/Array Usage**: Documented that existing code uses native collections (known deviation from AGENTS.md)
8. **Missing Validation Steps**: Added post-insertion validation for compile check and duplicate detection
9. **Missing Progress Reporting**: Added logging patterns for batch progress
10. **Incorrect Commands**: Fixed command examples to match actual CLI interface

### Known Deviations from AGENTS.md

The existing `service.ts` uses some native patterns that deviate from AGENTS.md:
- `new Map<string, string>()` for file content cache (acceptable for internal state management)
- `errors: string[]` mutable array (should ideally use Effect patterns)
- `for...of` loops (should use `Effect.forEach` or `A.forEach`)

These exist in the current implementation. New batching code should follow AGENTS.md strictly.

---

## Context

The docgen agents system uses **granular line-based JSDoc insertions** instead of full file rewrites. The current implementation processes each export with a separate API call (~4-5 seconds each). With 197 exports, this takes ~15 minutes. Batching should reduce this to ~4 minutes.

### Current Architecture

```
tooling/cli/src/commands/docgen/
├── agents/
│   ├── service.ts      # Main DocgenAgentService with fixPackageDirect
│   ├── prompts.ts      # System prompts (JSDOC_GENERATOR_PROMPT, etc.)
│   ├── tool-handlers.ts
│   ├── tools.ts
│   ├── schemas.ts      # PackageFixResult schema
│   └── errors.ts       # AgentError definitions
├── shared/
│   ├── ast.ts          # analyzePackage, analyzeSourceFile
│   └── config.ts       # loadDocgenConfig
└── types.ts            # ExportAnalysis, ExportKind, etc.
```

---

## Your Tasks

### Task 1: End-to-End Test on Small Package

Before implementing batching, verify the current single-export flow works correctly.

#### Step 1: Find a Test Package

```bash
# Check exports needing docs in identity package
bun run tooling/cli/src/index.ts docgen agents -p packages/common/identity --dry-run --verbose
```

If identity is too small, try:
```bash
bun run tooling/cli/src/index.ts docgen agents -p packages/common/utils --dry-run --verbose
```

#### Step 2: Run the Fix (Non-Dry-Run)

```bash
# Run actual fix (no --dry-run flag)
bun run tooling/cli/src/index.ts docgen agents -p packages/common/identity --verbose
```

#### Step 3: Verify Results

```bash
# Type check the package
bunx turbo run check --filter=@beep/identity

# Lint fix any formatting issues
bun run lint:fix

# Manual inspection: check a few files to verify:
# - Original code is preserved (no truncation)
# - JSDoc is inserted at correct lines
# - All required tags (@category, @example, @since) are present
```

#### Success Criteria for Task 1

- [ ] Package compiles after changes (`bun run check` passes)
- [ ] JSDoc blocks contain all three required tags
- [ ] No code was truncated or corrupted
- [ ] Examples use Effect patterns (no native `.map()`, `.filter()`)

---

### Task 2: Implement Batching

#### Current Flow (Per-Export)

```typescript
// service.ts:398-444 (simplified)
for (const exportInfo of sortedExports) {
  const prompt = `Generate JSDoc for this ${exportInfo.kind}: ...`;

  const chat = yield* Chat.fromPrompt([
    { role: "system", content: JSDOC_GENERATOR_PROMPT }
  ]).pipe(Effect.provide(runtimeLayer));

  const response = yield* chat.generateText({ prompt }).pipe(
    Effect.provide(runtimeLayer)
  );

  const extractedJsDoc = extractJsDoc(response.text);
  // ... insert logic
}
```

**Problem**: Each export = 1 API call. 197 exports = 197 API calls = ~15 minutes.

#### New Flow (Batched)

```
For each file:
  1. Collect all exports needing docs (already grouped by fileGroups)
  2. Split into batches of 5 exports
  3. Build single prompt for batch
  4. Call AI API once per batch
  5. Parse response to extract multiple JSDoc blocks
  6. Insert all JSDoc blocks (from bottom to top, preserving line numbers)
  7. On parse failure: fall back to single-export processing for failed items
```

**Target**: ~40 batches = ~4 minutes (4x improvement).

---

#### Implementation Steps

##### Step 1: Add Batch Prompt to prompts.ts

Add this new export to `tooling/cli/src/commands/docgen/agents/prompts.ts`:

```typescript
/**
 * System prompt for batch JSDoc generation.
 *
 * Generates multiple JSDoc blocks in a single API call.
 * Uses markers to delimit each export's JSDoc for reliable parsing.
 *
 * @category Prompts
 * @since 0.1.0
 */
export const JSDOC_BATCH_GENERATOR_PROMPT = `You are a JSDoc generator for the beep-effect monorepo. Generate JSDoc comment blocks for multiple exports in a single response.

## Output Format

Return JSDoc blocks using this EXACT format, one per export:

---JSDOC:exportName1---
/**
 * Description here.
 *
 * @category Constructors
 * @example
 * \`\`\`typescript
 * import { exportName1 } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 *
 * const result = exportName1({ input: "value" })
 * \`\`\`
 * @since 0.1.0
 */
---END---

---JSDOC:exportName2---
/**
 * Another description.
 *
 * @category Utils
 * @example
 * \`\`\`typescript
 * import { exportName2 } from "@beep/package-name"
 *
 * const result = exportName2("input")
 * \`\`\`
 * @since 0.1.0
 */
---END---

## Critical Rules

1. Each block MUST start with \`---JSDOC:exactExportName---\` and end with \`---END---\`
2. Use the EXACT export name provided (case-sensitive)
3. Output blocks in the SAME ORDER as the exports provided
4. Include @category, @example, and @since in EVERY block
5. Use Effect idioms in examples:
   - \`F.pipe\` with \`A.map\`, \`A.filter\` (never native .map())
   - \`Effect.gen\` for sequential effects
   - \`import * as A from "effect/Array"\`
6. DO NOT output any explanation or text outside the ---JSDOC:...--- blocks
7. DO NOT wrap the entire response in markdown code fences
`;
```

##### Step 2: Add Batch Parser Function to service.ts

Add this function near the top of `service.ts`, after the `insertJsDocAtLine` function (around line 110):

```typescript
/**
 * Parse batch JSDoc response into individual blocks.
 *
 * Extracts JSDoc blocks delimited by ---JSDOC:name--- and ---END--- markers.
 * Returns only successfully parsed blocks; failed exports can be retried individually.
 *
 * @category Utils
 * @since 0.1.0
 */
const parseJsDocBatch = (
  responseText: string,
  exports: ReadonlyArray<ExportAnalysis>
): ReadonlyArray<{ readonly exportInfo: ExportAnalysis; readonly jsDoc: string }> =>
  F.pipe(
    exports,
    A.filterMap((exp) => {
      const startMarker = `---JSDOC:${exp.name}---`;
      const endMarker = `---END---`;

      const startIdx = F.pipe(responseText, Str.indexOf(startMarker));
      if (O.isNone(startIdx)) return O.none();

      const contentStart = startIdx.value + Str.length(startMarker);
      const searchFrom = F.pipe(responseText, Str.slice(contentStart, Str.length(responseText)));
      const endIdx = F.pipe(searchFrom, Str.indexOf(endMarker));
      if (O.isNone(endIdx)) return O.none();

      const jsDoc = F.pipe(
        searchFrom,
        Str.slice(0, endIdx.value),
        Str.trim
      );

      // Validate it's a proper JSDoc block
      const isValid =
        F.pipe(jsDoc, Str.startsWith("/**")) &&
        F.pipe(jsDoc, Str.endsWith("*/"));

      return isValid ? O.some({ exportInfo: exp, jsDoc }) : O.none();
    })
  );
```

##### Step 3: Add Batch Processing Constants

Add near the top of `service.ts` (around line 55):

```typescript
/**
 * Number of exports to process per API call.
 *
 * Tradeoffs:
 * - Smaller batches: More API calls, but safer parsing and easier retries
 * - Larger batches: Fewer API calls, but risk hitting token limits (~100k for Claude)
 *
 * With 5 exports averaging ~200 tokens each (declaration + context), plus
 * ~500 tokens per generated JSDoc, a batch uses ~3,500 tokens - well within limits.
 *
 * @internal
 */
const BATCH_SIZE = 5;
```

##### Step 4: Modify fixPackageDirect to Use Batching

Replace the per-export loop in `fixPackageDirect` (lines 397-444) with batched processing:

```typescript
// Around line 395, after the sortedExports declaration

// Split into batches for efficient API usage
const batches = F.pipe(sortedExports, A.chunksOf(BATCH_SIZE));

yield* Effect.logInfo(
  `Processing ${A.length(sortedExports)} exports in ${A.length(batches)} batches`
);

let batchIndex = 0;
for (const batch of batches) {
  batchIndex += 1;
  yield* Effect.logInfo(
    `Batch ${batchIndex}/${A.length(batches)}: ${F.pipe(batch, A.map((e) => e.name), A.join(", "))}`
  );

  // Build batch prompt
  const batchPromptParts = F.pipe(
    batch,
    A.mapWithIndex((exp, idx) => `
### Export ${idx + 1}: ${exp.name}
Kind: ${exp.kind}
Missing tags: ${A.join(exp.missingTags, ", ")}
${exp.hasJsDoc ? `Existing tags: ${A.join(exp.presentTags, ", ")}` : "No existing JSDoc"}

Declaration:
\`\`\`typescript
${exp.declarationSource}
\`\`\`
${exp.contextBefore ? `\nContext:\n${exp.contextBefore}` : ""}
`)
  );

  const prompt = `Generate JSDoc for these ${A.length(batch)} exports:\n${A.join(batchPromptParts, "\n")}\n\nReturn JSDoc blocks using the ---JSDOC:name--- format.`;

  // Single API call for entire batch
  const chat = yield* Chat.fromPrompt([
    { role: "system", content: JSDOC_BATCH_GENERATOR_PROMPT }
  ]).pipe(Effect.provide(runtimeLayer));

  const response = yield* chat.generateText({ prompt }).pipe(
    Effect.provide(runtimeLayer)
  );

  totalInputTokens += response.usage?.inputTokens ?? 0;
  totalOutputTokens += response.usage?.outputTokens ?? 0;

  yield* tokenCounter.recordUsage({
    inputTokens: response.usage?.inputTokens ?? 0,
    outputTokens: response.usage?.outputTokens ?? 0,
  });

  // Parse response to extract individual JSDoc blocks
  const jsDocBlocks = parseJsDocBatch(response.text, batch);

  yield* Effect.logInfo(
    `Parsed ${A.length(jsDocBlocks)}/${A.length(batch)} JSDoc blocks from batch`
  );

  // Track which exports failed parsing for potential retry
  const parsedNames = F.pipe(jsDocBlocks, A.map((b) => b.exportInfo.name));
  const failedExports = F.pipe(
    batch,
    A.filter((exp) => !F.pipe(parsedNames, A.contains(exp.name)))
  );

  // Log failures (could implement retry logic here)
  if (A.isNonEmptyReadonlyArray(failedExports)) {
    const failedNames = F.pipe(failedExports, A.map((e) => e.name), A.join(", "));
    yield* Effect.logWarning(`Failed to parse JSDoc for: ${failedNames}`);
    F.pipe(
      failedExports,
      A.forEach((exp) => {
        errors.push(`Failed to parse JSDoc for ${exp.name}`);
      })
    );
  }

  // Insert each JSDoc (already sorted by line descending, so safe to insert in order)
  for (const { exportInfo, jsDoc } of jsDocBlocks) {
    const currentContent = fileContentCache.get(filePath) ?? "";
    const newContent = insertJsDocAtLine(currentContent, jsDoc, exportInfo);
    fileContentCache.set(filePath, newContent);
    exportsFixed += 1;
    yield* Effect.logInfo(`  ✓ Added JSDoc for ${exportInfo.name}`);
  }
}
```

##### Step 5: Update Imports in service.ts

Add the new prompt import at the top of `service.ts` (around line 50):

```typescript
import { JSDOC_BATCH_GENERATOR_PROMPT, JSDOC_GENERATOR_PROMPT } from "./prompts.js";
```

**Note**: Keep `JSDOC_GENERATOR_PROMPT` for potential fallback to single-export processing.

---

#### Error Handling & Fallback Strategy

##### Partial Batch Failure

When some exports in a batch fail to parse:

1. Log a warning with the failed export names
2. Record errors for the result summary
3. Continue with successfully parsed exports
4. **Optional enhancement**: Retry failed exports with single-export processing

To implement retry for failed exports, add after the batch loop:

```typescript
// Retry failed exports with single-export processing
if (A.isNonEmptyReadonlyArray(failedExports)) {
  yield* Effect.logInfo(`Retrying ${A.length(failedExports)} failed exports individually`);

  for (const exportInfo of failedExports) {
    const singlePrompt = `Generate JSDoc for this ${exportInfo.kind}:

Name: ${exportInfo.name}
Missing tags: ${A.join(exportInfo.missingTags, ", ")}
${exportInfo.hasJsDoc ? `Existing tags: ${A.join(exportInfo.presentTags, ", ")}` : "No existing JSDoc"}

Declaration:
${exportInfo.declarationSource}

Return ONLY the JSDoc comment block.`;

    const singleChat = yield* Chat.fromPrompt([
      { role: "system", content: JSDOC_GENERATOR_PROMPT }
    ]).pipe(Effect.provide(runtimeLayer));

    const singleResponse = yield* singleChat.generateText({ prompt: singlePrompt }).pipe(
      Effect.provide(runtimeLayer),
      Effect.catchAll(() => Effect.succeed({ text: "", usage: undefined }))
    );

    totalInputTokens += singleResponse.usage?.inputTokens ?? 0;
    totalOutputTokens += singleResponse.usage?.outputTokens ?? 0;

    const extractedJsDoc = extractJsDoc(singleResponse.text);

    if (O.isSome(extractedJsDoc)) {
      const currentContent = fileContentCache.get(filePath) ?? "";
      const newContent = insertJsDocAtLine(currentContent, extractedJsDoc.value, exportInfo);
      fileContentCache.set(filePath, newContent);
      exportsFixed += 1;
      // Remove from errors since retry succeeded
      const errorIdx = F.pipe(
        errors,
        A.findFirstIndex((e) => F.pipe(e, Str.includes(exportInfo.name)))
      );
      if (O.isSome(errorIdx)) {
        errors.splice(errorIdx.value, 1);
      }
      yield* Effect.logInfo(`  ✓ Retry succeeded for ${exportInfo.name}`);
    }
  }
}
```

##### Malformed AI Response

If the AI returns completely malformed output (no valid markers):

1. `parseJsDocBatch` returns an empty array
2. All exports in that batch are logged as failures
3. Retry logic (if implemented) will process them individually
4. If retry also fails, they're recorded in the `errors` array

##### Export Names with Special Characters

Export names may contain characters that conflict with markers. The current format `---JSDOC:name---` is safe because:

- TypeScript identifiers cannot contain `---`
- Export names follow identifier rules: `[a-zA-Z_$][a-zA-Z0-9_$]*`

If you encounter edge cases with re-exported names containing special characters, consider using base64 encoding:

```typescript
const safeMarker = Buffer.from(exp.name).toString("base64");
const startMarker = `---JSDOC:${safeMarker}---`;
```

---

#### Validation Steps

After running the batched docgen:

##### 1. Verify Compilation

```bash
bunx turbo run check --filter=@beep/target-package
```

##### 2. Check for Duplicate JSDoc

Look for files with multiple adjacent `/**` blocks:

```bash
# Find potential duplicates
grep -n "^\s*\*/" packages/target-package/src/**/*.ts | head -20
```

##### 3. Verify Required Tags

```bash
# Re-run analysis to confirm no missing tags
bun run tooling/cli/src/index.ts docgen agents -p packages/target-package --dry-run
```

##### 4. Manual Spot Check

Open 2-3 files and verify:
- JSDoc is placed correctly (before declaration, after any previous JSDoc)
- Examples use Effect patterns
- Category is appropriate for the export type

---

## Performance Expectations

### Token Usage Estimate

| Component          | Per Export  | Per Batch (5)     |
|--------------------|-------------|-------------------|
| Declaration source | ~150 tokens | ~750 tokens       |
| Context before     | ~50 tokens  | ~250 tokens       |
| System prompt      | -           | ~400 tokens       |
| Generated JSDoc    | ~100 tokens | ~500 tokens       |
| **Total**          | ~300 tokens | **~1,900 tokens** |

A batch of 5 exports uses ~2,000 tokens, well within Claude's 100k+ context limit.

### Time Estimate

| Metric          | Per-Export          | Batched (5)       |
|-----------------|---------------------|-------------------|
| API latency     | ~4.5s               | ~6s               |
| 197 exports     | 197 calls = ~15 min | 40 calls = ~4 min |
| **Improvement** | -                   | **~4x faster**    |

### Cost Considerations

- Batching reduces API calls from 197 to ~40 (5x reduction)
- Input tokens increase slightly (shared system prompt)
- Output tokens stay roughly the same
- Net cost savings: ~10-20% (fewer request overhead)

---

## Testing Commands

```bash
# Dry run to see what needs docs
bun run tooling/cli/src/index.ts docgen agents -p packages/common/identity --dry-run --verbose

# Full run with batching
bun run tooling/cli/src/index.ts docgen agents -p packages/common/identity --verbose

# Type check after changes
bunx turbo run check --filter=@beep/identity

# Lint fix any formatting
bun run lint:fix

# Run on larger package to test performance
bun run tooling/cli/src/index.ts docgen agents -p packages/common/utils --verbose
```

---

## Success Criteria

1. [ ] Small package test completes without errors
2. [ ] Generated JSDoc has all required tags (@category, @example, @since)
3. [ ] No code corruption or truncation
4. [ ] Type check passes after changes
5. [ ] Batching reduces API calls by ~5x
6. [ ] Total time for large package drops from 15+ min to ~4 min
7. [ ] Failed batch exports are logged and (optionally) retried
8. [ ] Effect patterns used throughout new code (no native array/string methods)

---

## Key Files Quick Reference

| File                                                | Purpose                                    |
|-----------------------------------------------------|--------------------------------------------|
| `tooling/cli/src/commands/docgen/agents/service.ts` | Main service - `fixPackageDirect` function |
| `tooling/cli/src/commands/docgen/agents/prompts.ts` | Add `JSDOC_BATCH_GENERATOR_PROMPT` here    |
| `tooling/cli/src/commands/docgen/types.ts`          | `ExportAnalysis` type definition           |
| `tooling/cli/src/commands/docgen/shared/ast.ts`     | `analyzePackage` function                  |

---

## Verified @effect/ai API Patterns

The code examples use these verified API patterns (from source code analysis):

```typescript
// ✅ CORRECT: Create chat with system prompt
const chat = yield* Chat.fromPrompt([
  { role: "system", content: JSDOC_BATCH_GENERATOR_PROMPT }
]);

// ✅ CORRECT: Generate text response
const response = yield* chat.generateText({ prompt });

// ✅ CORRECT: Access response fields
response.text        // The generated text
response.usage       // Token usage (optional)
response.usage?.inputTokens
response.usage?.outputTokens

// ❌ WRONG: Do not use these patterns
// Chat.make()          - Does not exist
// chat.send()          - Does not exist
// LanguageModel.make() - Does not exist
```

---

## Effect Pattern Requirements

All new code MUST follow AGENTS.md patterns:

### Required Imports

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Effect from "effect/Effect";
```

### Forbidden Patterns

```typescript
// ❌ NEVER use native methods
items.map(fn)           // Use: F.pipe(items, A.map(fn))
items.filter(fn)        // Use: F.pipe(items, A.filter(fn))
str.indexOf(x)          // Use: F.pipe(str, Str.indexOf(x))
str.substring(a, b)     // Use: F.pipe(str, Str.slice(a, b))
str.trim()              // Use: F.pipe(str, Str.trim)
str.startsWith(x)       // Use: F.pipe(str, Str.startsWith(x))
arr.push(x)             // Use: A.append or immutable patterns
for...of loops          // Use: Effect.forEach or A.forEach
```

---

## Related Documents

- `DOCGEN_AGENTS_PROMPT.md` - Original research prompt
- `DOCGEN_AGENTS_IMPLEMENTATION.md` - Full implementation guide
- `DOCGEN_PATTERN_FIX_PROMPT.md` - Fix illegal patterns in existing code
- `AGENTS.md` - Project-wide coding standards
