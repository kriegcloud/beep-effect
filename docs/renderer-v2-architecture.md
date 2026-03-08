# Renderer v2: Composable Tree-Based Rendering with @effect/printer

## Purpose

Replace the current flat-indentation renderer with a composable 5-layer Doc algebra pipeline that makes the RLM's execution structure — recursive calls, code execution, bridge calls, variable state — visually explicit through tree connectors, call boundaries, and structured content display.

## Readiness Status (2026-02-08)

Current status: **not implementation-ready**.

The design is directionally correct but must close several high-risk details before coding:

1. Width-safe iteration header composition must avoid `Doc.hsep` overflow behavior.
2. `RenderOptions` semantics must match block implementations (`maxCodeLines`, `maxOutputLines`, `outputTruncateLimit`).
3. Tree-guide semantics must be consistent for call boundaries (`CallStarted` depth handling).
4. Variable rendering depends on a concrete `VariablesUpdated` event contract.
5. DOT/Graphviz output needs explicit scope and constraints (escaping, IDs, attributes, backend).

### Exit Criteria To Start Implementation

1. All renderer snippets in this document reflect one coherent behavior model and line-width strategy.
2. Event contracts needed by renderer (`VariablesUpdated`) are specified.
3. Test plan includes regression coverage for width/layout, error/warning paths, and color/no-color parity.
4. DOT track is explicitly marked as in-scope phase or deferred.

## Current Problems (13 Information Gaps)

| # | Gap | Current Behavior |
|---|-----|------------------|
| 1 | CallStarted invisible | Returns `Doc.empty` |
| 2 | Code content discarded | Shows `▶ Executing...` only |
| 3 | Token breakdown lost | Shows `(42 tok)` total only |
| 4 | Call tree invisible | `Doc.indent(doc, depth * 2)` gives no structural cues |
| 5 | callId never shown | Events carry callId but it's never rendered |
| 6 | Bridge call arguments invisible | Only shows method name |
| 7 | No cumulative stats | No running totals across iterations |
| 8 | Variable state invisible | REPL variables never displayed |
| 9 | Error cause chains truncated | `Cause.pretty` capped at 10 lines, no interactive expansion |
| 10 | Iteration transitions unmarked | Budget badge exists but no visual separation |
| 11 | Extract vs normal mode invisible | No indicator when budget-exhaustion extract kicks in |
| 12 | Depth transitions lost | No entry/exit markers for recursive sub-calls |
| 13 | Output multiline handling | Long outputs rendered as single truncated line |

---

## Architecture: 5 Composable Layers

### Layer 1: Annotation Expansion

Expand from 10 to 16 semantic annotations:

```typescript
type Annotation =
  | "iteration"      // iteration header, counter
  | "model"          // model response text (gray)
  | "code"           // code execution markers
  | "code-content"   // actual code lines (distinct from markers)
  | "output"         // execution output
  | "error"          // error header and primary message
  | "error-detail"   // secondary error info (cause, structured fields)
  | "final"          // final answer
  | "bridge"         // bridge call markers
  | "warning"        // scheduler warnings
  | "dim"            // secondary text (budget, token counts)
  | "label"          // structural labels ("Iteration", "Output", "Bridge")
  | "coord"          // call coordinates [depth:iteration]
  | "call-border"    // box-drawing characters for call boundaries
  | "variable"       // variable metadata display
  | "budget"         // budget badge
```

New annotations enable distinct theming for structural elements:

```typescript
const theme = (annotation: Annotation): Ansi.Ansi => {
  switch (annotation) {
    case "iteration":    return Ansi.cyan
    case "model":        return Ansi.blackBright
    case "code":         return Ansi.yellow
    case "code-content": return Ansi.white
    case "output":       return Ansi.green
    case "error":        return Ansi.red
    case "error-detail": return Ansi.blackBright
    case "final":        return Ansi.combine(Ansi.bold, Ansi.green)
    case "bridge":       return Ansi.magenta
    case "warning":      return Ansi.yellow
    case "dim":          return Ansi.blackBright
    case "label":        return Ansi.bold
    case "coord":        return Ansi.cyan
    case "call-border":  return Ansi.blackBright
    case "variable":     return Ansi.blue
    case "budget":       return Ansi.blackBright
  }
}
```

---

### Layer 2: Micro-Primitives

Small pure functions returning `Doc<Annotation>`:

#### `coord(depth, iteration)` — Call Coordinates Badge

```typescript
const coord = (depth: number, iteration: number): Doc.Doc<Annotation> =>
  styled("coord", `[${depth}:${iteration}]`)
```

Renders: `[0:3]` — depth 0, iteration 3.

#### `budgetBadge(budget)` — Budget Remaining

```typescript
const budgetBadgeText = (budget: BudgetState): string => {
  const parts: Array<string> = [
    `${budget.iterationsRemaining}i`,
    `${budget.llmCallsRemaining}c`
  ]
  if (Option.isSome(budget.tokenBudgetRemaining)) {
    parts.push(`${budget.tokenBudgetRemaining.value}tok`)
  }
  return `(${parts.join(" ")})`
}

const budgetBadge = (budget: BudgetState): Doc.Doc<Annotation> =>
  styled("budget", budgetBadgeText(budget))
```

Renders: `(7i 46c)` or `(7i 46c 815tok)`.

#### `usageBadge(usage)` — Token Breakdown

```typescript
const usageBadge = (usage?: {
  readonly inputTokens?: number | undefined
  readonly outputTokens?: number | undefined
  readonly totalTokens?: number | undefined
  readonly reasoningTokens?: number | undefined
  readonly cachedInputTokens?: number | undefined
}): Doc.Doc<Annotation> => {
  if (!usage) return Doc.empty
  const parts: Array<string> = []
  if (usage.inputTokens !== undefined && usage.inputTokens > 0) {
    parts.push(`in:${usage.inputTokens}`)
  }
  if (usage.outputTokens !== undefined && usage.outputTokens > 0) {
    parts.push(`out:${usage.outputTokens}`)
  }
  if (usage.reasoningTokens !== undefined && usage.reasoningTokens > 0) {
    parts.push(`reason:${usage.reasoningTokens}`)
  }
  if (usage.cachedInputTokens !== undefined && usage.cachedInputTokens > 0) {
    parts.push(`cached:${usage.cachedInputTokens}`)
  }
  const total = usage.totalTokens !== undefined && usage.totalTokens > 0
    ? usage.totalTokens
    : (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
  if (total > 0) parts.push(`= ${total}`)
  if (parts.length === 0) return Doc.empty
  return styled("dim", `[${parts.join(" ")}]`)
}
```

Renders: `[in:342 out:128 = 470]` or `[in:200 out:142 cached:180 = 342]`.

#### `hr(label?)` — Standalone Horizontal Rule

```typescript
const hr = (label?: string): Doc.Doc<Annotation> =>
  Doc.pageWidth((width) => {
    const w = typeof width === "number" ? width : 80
    if (label) {
      const dashes = Math.max(0, w - label.length - 4)
      return styled("dim", `── ${label} ${"─".repeat(dashes)}`)
    }
    return styled("dim", "─".repeat(w))
  })
```

Use this for standalone separators only, not inline `hsep` rows.

Renders terminal-width-adaptive rules: `── Iteration ──────────────────`.

#### `iterationDivider(depth, coordText, budgetText)` — Width-Safe Inline Rule

```typescript
const iterationDivider = (
  depth: number,
  coordText: string,
  budgetText: string,
  label = "Iteration"
): Doc.Doc<Annotation> =>
  Doc.pageWidth((width) => {
    const lineWidth = typeof width === "number" ? width : 80
    const guideCols = depth * 2
    const fixedCols = guideCols + coordText.length + budgetText.length + 2
    const available = Math.max(1, lineWidth - fixedCols)
    const head = `── ${label} `
    if (available <= head.length) {
      return styled("label", "─")
    }
    return styled("label", `${head}${"─".repeat(available - head.length)}`)
  })
```

Unlike `Doc.hsep` + full-width `hr`, this divider computes available columns after tree guides and side badges.

---

### Layer 3: Tree Prefix System

Replaces plain `Doc.indent(doc, depth * 2)` with structural tree connectors.

#### `treeGuide(depth)` — Vertical Continuation Guide

```typescript
const treeGuide = (depth: number): Doc.Doc<Annotation> => {
  if (depth === 0) return Doc.empty
  const guides = Array.from({ length: depth }, () =>
    styled("call-border", "│ ")
  )
  return Doc.cats(guides)
}
```

Renders: `│ │ ` for depth 2 — one `│ ` per ancestor level.

#### `withGuide(depth, doc)` — Wrap Single Line

```typescript
const withGuide = (depth: number, doc: Doc.Doc<Annotation>): Doc.Doc<Annotation> =>
  depth > 0 ? Doc.cat(treeGuide(depth), doc) : doc
```

Renders: `│ │ ▶ Executing...` at depth 2.

#### `withGuidedLines(depth, lines)` — Wrap Multi-line Block

```typescript
const withGuidedLines = (
  depth: number,
  lines: ReadonlyArray<Doc.Doc<Annotation>>
): Doc.Doc<Annotation> =>
  Doc.vsep(lines.map((line) => withGuide(depth, line)))
```

Each line gets its own tree guide prefix, preserving visual continuity down the tree.

---

### Layer 4: Composite Blocks

Each event type composes micro-primitives + tree guides into a complete rendered block.

#### `iterationBlock` — Iteration Start

```typescript
const iterationBlock = (
  e: Extract<RlmEvent, { _tag: "IterationStarted" }>
): Doc.Doc<Annotation> => {
  const coordText = `[${e.depth}:${e.iteration}]`
  const budgetText = budgetBadgeText(e.budget)
  return withGuide(
    e.depth,
    Doc.group(
      Doc.fillSep([
        styled("coord", coordText),
        iterationDivider(e.depth, coordText, budgetText),
        styled("budget", budgetText)
      ])
    )
  )
}
```

Renders: `│ [0:3] ── Iteration ──────────────── (7i 46c)`

#### `modelBlock` — Model Response

```typescript
const modelBlock = (
  e: Extract<RlmEvent, { _tag: "ModelResponse" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  const limit = opts.modelTruncateLimit ?? DEFAULT_MODEL_TRUNCATE
  const text = styled("model", truncate(e.text, limit))
  const usage = usageBadge(e.usage)
  return withGuide(e.depth, Doc.cat(text, Doc.isEmpty(usage) ? Doc.empty : Doc.cat(Doc.text("  "), usage)))
}
```

Renders: `│ The model says something...  [in:200 out:142 = 342]`

#### `codeBlock` — Code Content Display

Shows actual code, not just "Executing...":

```typescript
const DEFAULT_MAX_CODE_LINES = 12

const codeBlock = (
  e: Extract<RlmEvent, { _tag: "CodeExecutionStarted" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  if (!opts.showCode) return Doc.empty
  const maxCodeLines = opts.maxCodeLines ?? DEFAULT_MAX_CODE_LINES
  const header = withGuide(e.depth, styled("code", "▶ Code:"))
  const codeLines = e.code.split("\n")
  const displayLines = codeLines.length > maxCodeLines
    ? [...codeLines.slice(0, maxCodeLines), `... (${codeLines.length - maxCodeLines} more lines)`]
    : codeLines
  const codeDocs = displayLines.map((line) =>
    withGuide(e.depth, Doc.cat(styled("code", "│ "), styled("code-content", line)))
  )
  return Doc.vsep([header, ...codeDocs])
}
```

Renders:
```
│ ▶ Code:
│ │ themes = {}
│ │ for post in data:
│ │     theme = classify(post)
│ │     themes[theme] = themes.get(theme, 0) + 1
```

#### `outputBlock` — Execution Output Display

```typescript
const DEFAULT_MAX_OUTPUT_LINES = 20
const DEFAULT_OUTPUT_TRUNCATE = 500

const outputBlock = (
  e: Extract<RlmEvent, { _tag: "CodeExecutionCompleted" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  if (!opts.showOutput) return Doc.empty
  const maxOutputLines = opts.maxOutputLines ?? DEFAULT_MAX_OUTPUT_LINES
  const outputCharLimit = opts.outputTruncateLimit ?? DEFAULT_OUTPUT_TRUNCATE
  const rawOutput = truncate(e.output, outputCharLimit)
  const outputLines = rawOutput.split("\n")
  const displayLines = outputLines.length > maxOutputLines
    ? [...outputLines.slice(0, maxOutputLines), `... (${outputLines.length - maxOutputLines} more lines)`]
    : outputLines
  if (displayLines.length === 1) {
    return withGuide(e.depth, styled("output", `◀ ${displayLines[0]}`))
  }
  const header = withGuide(e.depth, styled("output", "◀ Output:"))
  const outputDocs = displayLines.map((line) =>
    withGuide(e.depth, Doc.cat(styled("output", "│ "), styled("output", line)))
  )
  return Doc.vsep([header, ...outputDocs])
}
```

Single line: `│ ◀ 42`
Multi-line:
```
│ ◀ Output:
│ │ {'technology': 12, 'science': 8, 'politics': 5}
│ │ Total posts classified: 25
```

#### `callStartBlock` — Call Boundary (Box Drawing)

```typescript
const callStartBlock = (
  e: Extract<RlmEvent, { _tag: "CallStarted" }>
): Doc.Doc<Annotation> =>
  Doc.pageWidth((width) => {
    const w = typeof width === "number" ? width : 80
    const label = `Call [depth=${e.depth}]`
    const innerWidth = Math.max(0, w - (e.depth * 2) - 4)
    const top = `╭─ ${label} ${"─".repeat(Math.max(0, innerWidth - label.length - 2))}╮`
    return withGuide(e.depth, styled("call-border", top))
  })
```

Renders: `│ ╭─ Call [depth=1] ────────────────────────────────────╮`

#### `bridgeBlock` — Bridge Call

```typescript
const bridgeBlock = (
  e: Extract<RlmEvent, { _tag: "BridgeCallReceived" }>
): Doc.Doc<Annotation> =>
  withGuide(e.depth, styled("bridge", `├─ ↗ Bridge: ${e.method}`))
```

Renders: `│ ├─ ↗ Bridge: llm_query`

#### `finalBlock` — Final Answer

```typescript
const finalBlock = (
  e: Extract<RlmEvent, { _tag: "CallFinalized" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  const limit = opts.finalTruncateLimit ?? DEFAULT_FINAL_TRUNCATE
  return withGuide(e.depth, styled("final", `✓ FINAL: ${truncate(e.answer, limit)}`))
}
```

Renders: `│ ✓ FINAL: The answer is 42`

#### `variablesBlock` — Variable State (Future)

For use after `VariablesUpdated` event is added (Phase 1 of SUBMIT architecture):

```typescript
const variablesBlock = (
  depth: number,
  variables: ReadonlyArray<{ name: string; type: string; sizeBytes: number }>
): Doc.Doc<Annotation> => {
  if (variables.length === 0) return Doc.empty
  const varDocs = variables.map((v) => {
    const sizeLabel = v.sizeBytes > 1024
      ? `${Math.round(v.sizeBytes / 1024)}k`
      : `${v.sizeBytes}`
    return styled("variable", `${v.name}(${v.type},${sizeLabel})`)
  })
  return withGuide(depth, Doc.cat(
    styled("label", "vars: "),
    Doc.group(Doc.fillSep(varDocs))
  ))
}
```

Renders: `│ vars: themes(str,247) context(str,430k) results(list,12k)`

Variable rendering depends on this event contract:

```typescript
type VariableSnapshot = {
  readonly name: string
  readonly type: string
  readonly sizeBytes: number
}

type VariablesUpdated = {
  readonly completionId: string
  readonly callId: CallId
  readonly depth: number
  readonly iteration: number
  readonly source: "python-submit" | "python-exec" | "tool-result"
  readonly snapshotVersion: number
  readonly variables: ReadonlyArray<VariableSnapshot>
}
```

Rendering invariants:

1. Only render the latest `VariablesUpdated` per `(callId, iteration)`.
2. If multiple events arrive in the same iteration, higher `snapshotVersion` wins.
3. Suppress duplicate rows when `variables` is byte-identical to the last rendered snapshot.

---

### Layer 5: Rendering Pipeline

#### `buildEventDoc` — Dispatch to Blocks

```typescript
export const buildEventDoc = (event: RlmEvent, options?: RenderOptions): Doc.Doc<Annotation> => {
  const opts: RenderOptions = {
    quiet: false,
    showCode: true,
    showOutput: true,
    noColor: false,
    maxCodeLines: DEFAULT_MAX_CODE_LINES,
    maxOutputLines: DEFAULT_MAX_OUTPUT_LINES,
    outputTruncateLimit: DEFAULT_OUTPUT_TRUNCATE,
    ...options
  }

  return Match.value(event).pipe(
    Match.tagsExhaustive({
      CallStarted: (e) => callStartBlock(e),
      IterationStarted: (e) => opts.quiet ? Doc.empty : iterationBlock(e),
      ModelResponse: (e) => opts.quiet ? Doc.empty : modelBlock(e, opts),
      CodeExecutionStarted: (e) => opts.quiet ? Doc.empty : codeBlock(e, opts),
      CodeExecutionCompleted: (e) => opts.quiet ? Doc.empty : outputBlock(e, opts),
      BridgeCallReceived: (e) => opts.quiet ? Doc.empty : bridgeBlock(e),
      CallFinalized: (e) => finalBlock(e, opts),
      CallFailed: (e) => withGuide(e.depth, formatError(e.error)),
      SchedulerWarning: (e) => schedulerWarningDoc(e, opts)
    })
  )
}
```

#### `formatEvent` — Doc → String

Unchanged from current implementation:

```typescript
export const formatEvent = (event: RlmEvent, options?: RenderOptions): string => {
  const doc = buildEventDoc(event, options)
  if (Doc.isEmpty(doc)) return ""
  const lineWidth = options?.lineWidth ?? 120
  if (options?.noColor) {
    return Doc.render(Doc.unAnnotate(doc), { style: "pretty", options: { lineWidth } }) + "\n"
  }
  return AnsiDoc.render(Doc.reAnnotate(doc, theme), { style: "pretty", options: { lineWidth } }) + "\n"
}
```

---

## Example Output

A recursive call with depth=0 spawning a depth=1 sub-call via bridge:

```
[0:1] ── Iteration ──────────────────────────── (9i 49c)
Let me analyze the data by classifying posts...  [in:342 out:128 = 470]
▶ Code:
│ themes = {}
│ for post in data[:5]:
│     theme = llm_query(f"Classify: {post}")
│     themes[theme] = themes.get(theme, 0) + 1
├─ ↗ Bridge: llm_query
│ ╭─ Call [depth=1] ──────────────────────────────────╮
│ │ [1:1] ── Iteration ──────────────── (9i 48c)
│ │ This post is about technology...  [in:55 out:12 = 67]
│ │ ✓ FINAL: technology
◀ Output:
│ {'technology': 3, 'science': 2}
[0:2] ── Iteration ──────────────────────────── (8i 45c)
Now let me process the remaining posts...  [in:580 out:95 = 675]
▶ Code:
│ result = json.dumps(themes, indent=2)
│ print(result)
◀ Output:
│ {
│   "technology": 12,
│   "science": 8,
│   "politics": 5
│ }
✓ FINAL: {"technology": 12, "science": 8, "politics": 5}
```

---

## RenderOptions Extension

```typescript
export interface RenderOptions {
  readonly quiet?: boolean
  readonly showCode?: boolean         // default true — show code content in codeBlock
  readonly showOutput?: boolean       // default true — show execution output
  readonly noColor?: boolean
  readonly lineWidth?: number         // default 120
  readonly modelTruncateLimit?: number   // default 200
  readonly outputTruncateLimit?: number  // default 500
  readonly finalTruncateLimit?: number   // default 200
  readonly maxCodeLines?: number         // default 12
  readonly maxOutputLines?: number       // default 20
}
```

Precedence and behavior:

1. `outputTruncateLimit` is applied first (character safety cap on raw output).
2. Result is then split by newline and capped by `maxOutputLines`.
3. `maxCodeLines` caps code lines after newline split.
4. All three options are renderer-level guarantees and must not be bypassed by hardcoded constants in block logic.

---

## DOT / Graphviz Track (Phase 2, Deferred)

DOT output is **not part of phase-1 CLI renderer implementation**. It is explicitly deferred until the terminal renderer is stable.

When phase 2 starts, these decisions are mandatory:

1. Stable node IDs:
`nodeId = "${callId}:${eventSeq}"` (do not use depth/iteration alone).
2. Escaping:
escape `\`, `"`, `{`, `}`, and normalize newlines to `\n` before label emission.
3. Clusters:
nested call boundaries map to `subgraph cluster_<callId>` blocks.
4. Attributes:
if we need annotation-driven color/style, add a wrapper over `Graph.toGraphViz` because current `GraphVizOptions` only supports label/name hooks.
5. Determinism:
sort nodes/edges by `(callDepth, eventSeq)` before DOT string emission for stable snapshots.
6. Backend:
primary target is `dot -Tsvg`; CI snapshot tests assert SVG generation does not fail for representative transcripts.

---

## Files Changed

| File | Change |
|------|--------|
| `src/RlmRenderer.ts` | Full rewrite — 5-layer composable pipeline |
| `src/cli.ts` | No changes needed (same `formatEvent` API) |
| `test/RlmRenderer.test.ts` | Update assertions + new tests for tree guides, code content, token breakdown |

---

## Test Plan

### Width and layout invariants
- `iterationBlock` must never exceed `lineWidth` for typical coordinate/budget lengths.
- Narrow widths must gracefully degrade divider text, not corrupt tree structure.
- Multi-line blocks must keep guide prefixes on every rendered line.

### Tree and call-boundary semantics
- depth=0: no guide prefix.
- depth=1: `│ ` prefix.
- depth=2: `│ │ ` prefix.
- `CallStarted` uses `withGuide(e.depth, ...)` and visually aligns with sample output.

### Code/output truncation semantics
- `maxCodeLines` is honored (no hardcoded 12 in block logic).
- `outputTruncateLimit` applies before newline split.
- `maxOutputLines` is honored after split.
- `showCode` and `showOutput` still suppress their respective blocks.

### Error/warning regression tests
- `CallFailed` preserves tree guides and structured details.
- `SchedulerWarning` behavior is verified under normal and `quiet` mode.
- `noColor` path preserves structure with no ANSI escapes.

### Usage and badges
- All token badge variants remain correct (`in`, `out`, `reason`, `cached`, `= total`).
- Missing/zero fields remain omitted.

### VariablesUpdated (future, after event lands)
- Latest snapshot per `(callId, iteration)` wins.
- Duplicate snapshot suppression works.
- `snapshotVersion` ordering is honored.

### Backward compatibility
- `formatEvent` API unchanged.
- `renderEvent` wrapper unchanged.
- Existing caller integrations require no signature changes.

### DOT phase-2 tests (deferred)
- Label escaping snapshot tests.
- Deterministic node/edge ordering snapshot tests.
- Cluster rendering snapshot tests.
- Backend smoke test: DOT -> SVG generation succeeds.

---

## Dependencies

- `@effect/printer` (already installed)
- `@effect/printer-ansi` (already installed)
- `effect` Cause, Match (already used)

## Relationship to SUBMIT Tool Architecture

The `variablesBlock` in Layer 4 consumes `VariableSnapshot` data from the `VariableSpace` service designed in `docs/submit-tool-architecture.md` Phase 1. Implementation of variable display should follow the `VariablesUpdated` event addition and use the event contract defined in this document (`depth`, `iteration`, `source`, `snapshotVersion`, `variables`).

---

## Implementation Order

### Gate 0: Design Closure (required before code)

1. Confirm width strategy: `Doc.fillSep` + computed `iterationDivider`.
2. Confirm call-boundary guide rule: `withGuide(e.depth, ...)`.
3. Confirm `VariablesUpdated` event contract and dedupe semantics.
4. Keep DOT in deferred phase-2 scope.

### Gate 1: Renderer Rewrite

1. Expand `Annotation` type + theme mapping.
2. Add micro-primitives (`coord`, `budgetBadgeText`, `budgetBadge`, `usageBadge`, `hr`, `iterationDivider`).
3. Add tree prefix system (`treeGuide`, `withGuide`, `withGuidedLines`).
4. Rewrite composite blocks to use tree guides + content display with option-driven truncation.
5. Update `buildEventDoc` defaults and dispatch.

### Gate 2: Validation

1. Implement the expanded test plan sections above.
2. Run `bun run typecheck && bun test`.
3. Run visual verification with a live `bun run rlm` recursive call trace.

### Gate 3: DOT Phase 2 (separate PR)

1. Add DOT adapter with stable IDs and escaping rules.
2. Add deterministic ordering and cluster support.
3. Add DOT snapshot + SVG smoke tests.
