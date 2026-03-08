# Parsing, Visualization & Error Channel Review

**Date:** 2026-02-17
**Scope:** Output parsing robustness, visualization parity, Effect error channel hygiene
**Method:** Multi-agent review (4 parallel reviewers) + Python reference parity analysis

---

## Executive Summary

A real-world extraction test (15 EPL transfer posts via Anthropic claude-sonnet-4-5) produced only partial results — many chunks returned zero extractions silently. Root cause analysis revealed a **triple-layer silent error suppression chain** (FormatHandler -> Resolver -> Annotator) that swallows parse failures into empty arrays with no diagnostics. The visualization system works but is missing the Python reference's interactive features (playback controls, tooltips, nested overlaps). Error types across the codebase carry insufficient context, and several non-Effect patterns (`console.warn`, bare `try/catch`) bypass the Effect runtime.

**20 findings total:** 4 Critical, 8 Important, 8 Suggestions

---

## Critical Findings

### C1. Triple-layer silent parse error suppression

The most impactful bug. Three independent `catchAll` layers convert parse failures into empty arrays with zero logging:

| Layer | File:Line | Behavior |
|-------|-----------|----------|
| FormatHandler | `FormatHandler.ts:277-279` | `catchAll → Effect.succeed([])` when non-strict (default) |
| Resolver | `Resolver.ts:776-778` | `catchAll → Effect.succeed([])` when `suppressParseErrors=true` |
| Annotator | `Annotator.ts:337` | Hardcodes `suppressParseErrors: true` — never configurable |

The Python reference (`resolver.py:265-271`) **always logs at exception level** even when suppressing. The Effect version logs nothing.

**Error flow:**
```
LLM returns markdown+JSON → FormatHandler fails to parse → [] (silent)
→ Resolver receives [] or catches error → [] (silent)
→ Annotator stores [] → User sees empty extractions, no warnings
```

**Fix:**
- Replace Resolver's `catchAll` with `Effect.tapError` → `Effect.logWarning` before suppressing
- Elevate FormatHandler's `logDebug` at line 267 to `logWarning`
- Make `suppressParseErrors` configurable from `AnnotateOptions`, not hardcoded
- Decouple Resolver's `strict` flag from `suppressParseErrors` (Python keeps these independent)

---

### C2. Multi-fence LLM responses lose extractions

Real-world LLM output contains multiple JSON arrays — some inside code fences, some inline with markdown headers. `selectFencedCandidate` (`FormatHandler.ts:70-96`) returns only the **first** matching fence and discards the rest.

Example real output:
```
## Transfer 1: Dwight McNeil
[{"extractionClass":"player","extractionText":"Dwight McNeil"}, ...]   ← INLINE, lost

## Transfer 2: Sandro Tonali
```json
[{"extractionClass":"player","extractionText":"Sandro Tonali"}, ...]   ← FENCED, captured
```
```

Both Python and TypeScript share this single-fence limitation, but the TypeScript version silently returns `[]` for unfenced chunks while the Python version at least raises a loggable error.

**Fix:** Add a multi-block recovery sweep that scans for all top-level JSON array literals (`[...]`) when the primary fence parse produces few/no results. Gate behind a config flag (`multiBlockRecovery: boolean`, default `true` in non-strict mode).

---

### C3. `console.warn` in synchronous code bypasses Effect runtime

Three locations use `try/catch` + `console.warn` instead of Effect error handling:

| File:Line | Function |
|-----------|----------|
| `Annotator.ts:80-88` | `encodeExtractionsForPrompt` |
| `FormatHandler.ts:283-293` | `encodeExtractionExample` |
| `Prompting.ts:27-33` | Similar encoding fallback |

All silently fall back to `"[]"`, meaning the LLM prompt contains no examples — producing garbage output that is then silently swallowed by C1.

**Fix:** Convert these to effectful functions using `Schema.encode` + `Effect.tapError` + `Effect.orElseSucceed`. Requires minor call-site changes.

---

### C4. Visualization rejects overlapping extractions instead of nesting them

`collectHighlights` (`Visualization.ts:43-77`) uses a first-wins strategy:
```typescript
const blocked = accepted.some((current) => hasOverlap(current, normalized))
if (!blocked) { accepted.push(normalized) }
```

The Python reference (`visualization.py:235-311`) supports **fully nested and overlapping spans** using a `SpanPoint`-based decomposition that emits properly-ordered open/close tags. Valid overlapping extractions are silently dropped in the TypeScript version.

**Fix:** Replace with SpanPoint-based nesting approach from the Python reference.

---

## Important Findings

### I1. Missing `<think>` tag stripping (DeepSeek-R1/QwQ models)

Python reference (`format_handler.py:46, 261-276`) strips `<think>...</think>` blocks before parsing when initial parse fails. TypeScript has no equivalent. Reasoning models that prefix JSON with `<think>` tags will silently fail.

**Fix:** Add `/<think>[\s\S]*?<\/think>\s*/gi` substitution as a fallback in `parseOutputStrict`.

---

### I2. `toLangExtractError` collapses typed errors into generic message string

`Annotator.ts:55-58` wraps all errors into `LangExtractError` with only `message: string`, losing the `_tag` discriminant. Used at 3 sites (lines 323, 340, 373). Then `Cli.ts:664-671` further collapses into `InferenceConfigError`. By the time errors reach `BunMain.ts:96`, the user sees a bare message with no indication of which subsystem failed.

**Fix:** Widen the annotator error type to a union (`AnyLangExtractError` already exists in `Errors.ts:174`). Use `Cause.pretty` in the CLI error display.

---

### I3. No interactive visualization controls

The Python reference generates JavaScript with:
- Play/Pause/Prev/Next buttons + progress slider
- Auto-scroll to current extraction
- Attributes panel showing extraction metadata
- Hover tooltips on highlights
- Status text ("Entity 3/15 | Pos [142-158]")

TypeScript generates a **static** page with a one-time CSS fade animation and no interactivity.

**Fix:** Add a `<script>` block with playback controller. Extraction data is already available at render time — serialize as embedded JSON.

---

### I4. No hover tooltips or attributes display

Extractions have `data-class` and `data-status` HTML attributes but no visible tooltip. The `Extraction.attributes` field is completely ignored by the visualization.

**Fix:** Add `<span class="lx-tooltip">` child inside each `<mark>` with CSS hover rules. Include attributes in tooltip and playback panel.

---

### I5. Color assignment not deterministic

TypeScript assigns colors by first-encounter order (`Visualization.ts:105-115`). Python sorts classes alphabetically before assigning (`visualization.py:191`). Same document can get different colors depending on extraction order.

**Fix:** Sort extraction classes before color assignment. Unify legend and highlight color mapping into a single sorted-key function.

---

### I6. Error types lack contextual fields

Almost every error type carries only `message: Schema.String`. Recommended additions:

| Error Type | Suggested Fields |
|-----------|-----------------|
| `FormatParseError` | `inputPreview`, `formatType` |
| `ResolverParsingError` | `inputPreview`, `chunkIndex` |
| `AlignmentError` | `extractionClass`, `sourcePreview` |
| `LangExtractError` | `phase`, `originalTag` |
| `InferenceOutputError` | `provider`, `modelId` |

---

### I7. `AiAdapters.ts` `generateObject` catches ALL errors for fallback

`AiAdapters.ts:271-301` catches all errors from native `generateObject` and falls back to text generation. This means auth failures, rate limits, and network errors get silently retried as text calls.

**Fix:** Narrow the catch to only "unsupported operation" errors, or at minimum log the original error.

---

### I8. `PromptValidation.ts` silently swallows alignment errors

Line 77: `Effect.catchAll(() => Effect.succeed([] as const))` — alignment engine errors get treated as "no extractions aligned" with no diagnostic.

**Fix:** Add `Effect.tapError` with warning log before the `catchAll`.

---

## Suggestions

### S1. Visualization missing max-height/scroll for long documents

No `max-height` or `overflow-y: auto` on `.lx-text`. Long documents create very tall pages. Python uses `max-height: 260px; overflow-y: auto` with monospace font.

### S2. Missing `data-idx` attribute for JS targeting

Python assigns `data-idx` to each highlight span for JavaScript playback targeting. TypeScript has no numeric index attribute — needed when interactive controls are added.

### S3. PrimedCache has 8 silent `catchAll(() => Effect.void)` sites

Cache cleanup operations never log swallowed errors. If cache storage is failing systematically (disk full, permissions), there's no diagnostic output.

### S4. Provider config layers use `Layer.orDie`

All 4 providers (`Gemini.ts:121`, `OpenAI.ts:109`, `Anthropic.ts:105`, `Ollama.ts:116`) convert `ConfigError` into `Cause.Die`. With `Cause.pretty` in the CLI error display (per I2 fix), this becomes acceptable.

### S5. No partial-success accumulator for batch processing

When some chunks fail parsing but others succeed, the user gets partial results with no indication that chunks were lost. Consider wrapping each chunk's resolve+align in `Effect.either` and accumulating diagnostics.

### S6. No test coverage for failure/recovery scenarios

Existing tests cover happy paths only. Missing coverage for:
- Multiple code fences in one response
- Inline JSON mixed with markdown
- `suppressParseErrors: true` behavior
- `<think>` tag responses
- The double/triple suppression path

### S7. Visualization test fixture palette differs from Python

TypeScript uses saturated colors lightened via `color-mix()`. Python uses light pastels directly. `color-mix` behavior varies across browsers.

### S8. Legend uses encounter-order instead of sorted-order

Legend and highlight color assignment are in separate functions using the same insertion order, but neither is deterministic across different extraction orderings.

---

## Python Parity Summary

| Feature | Python | TypeScript | Status |
|---------|--------|-----------|--------|
| Multi-fence validation | Strict mode rejects | Returns first only | Gap |
| `<think>` tag stripping | Auto-retry | Missing | Gap |
| Interactive visualization | Full JS widget | Static HTML | Gap |
| Overlap handling | Nested spans | First-wins rejection | Gap |
| Error suppression logging | `logging.exception()` | Silent `catchAll` | Gap |
| Token normalization (stemming) | Lowercase + strip trailing 's' | Implemented | Parity |
| Alignment status enum | 4 levels | 4 levels | Parity |
| Color assignment | Sorted alphabetically | Encounter order | Gap |
| Hover tooltips | CSS tooltip on hover | None | Gap |
| Attributes panel | Interactive panel | None | Gap |
| Extraction playback | Play/Pause/Nav/Slider | None | Gap |
| Auto-scroll to extraction | `scrollIntoView` | None | Gap |

---

## Recommended Fix Priority

1. **C1** — Break the silent suppression chain (highest impact — directly caused the empty extraction bug)
2. **C2** — Multi-fence/inline JSON recovery (second biggest cause of lost extractions)
3. **C3** — Convert `console.warn` to Effect logging
4. **I1** — `<think>` tag stripping
5. **I2** — Preserve typed errors through the pipeline
6. **C4 + I3 + I4** — Visualization: nested overlaps + interactive controls + tooltips (can be done as a batch)
7. **I5-I8** — Error context enrichment and narrower catches
8. **S1-S8** — Polish items
