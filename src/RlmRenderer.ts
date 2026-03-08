import * as Doc from "@effect/printer/Doc"
import type { PageWidth } from "@effect/printer/PageWidth"
import * as Ansi from "@effect/printer-ansi/Ansi"
import * as AnsiDoc from "@effect/printer-ansi/AnsiDoc"
import { Cause, Match, Option } from "effect"
import type { RlmError } from "./RlmError"
import type { BudgetState, RlmEvent } from "./RlmTypes"

// ---------------------------------------------------------------------------
// Layer 1: Annotation type (16 semantic annotations)
// ---------------------------------------------------------------------------

type Annotation =
  | "iteration"
  | "model"
  | "code"
  | "code-content"
  | "output"
  | "error"
  | "error-detail"
  | "final"
  | "bridge"
  | "warning"
  | "dim"
  | "label"
  | "coord"
  | "call-border"
  | "variable"
  | "budget"

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

const theme = (annotation: Annotation): Ansi.Ansi => {
  switch (annotation) {
    case "iteration": return Ansi.cyan
    case "model": return Ansi.blackBright
    case "code": return Ansi.yellow
    case "code-content": return Ansi.white
    case "output": return Ansi.green
    case "error": return Ansi.red
    case "error-detail": return Ansi.blackBright
    case "final": return Ansi.combine(Ansi.bold, Ansi.green)
    case "bridge": return Ansi.magenta
    case "warning": return Ansi.yellow
    case "dim": return Ansi.blackBright
    case "label": return Ansi.bold
    case "coord": return Ansi.cyan
    case "call-border": return Ansi.blackBright
    case "variable": return Ansi.blue
    case "budget": return Ansi.blackBright
  }
}

// ---------------------------------------------------------------------------
// RenderOptions
// ---------------------------------------------------------------------------

export interface RenderOptions {
  readonly quiet?: boolean
  readonly showCode?: boolean
  readonly showOutput?: boolean
  readonly noColor?: boolean
  readonly lineWidth?: number
  readonly modelTruncateLimit?: number
  readonly outputTruncateLimit?: number
  readonly finalTruncateLimit?: number
  readonly maxCodeLines?: number
  readonly maxOutputLines?: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MODEL_TRUNCATE = 200
const DEFAULT_OUTPUT_TRUNCATE = 500
const DEFAULT_FINAL_TRUNCATE = 2000
const DEFAULT_MAX_CODE_LINES = 12
const DEFAULT_MAX_OUTPUT_LINES = 20

// ---------------------------------------------------------------------------
// Layer 2: Micro-Primitives
// ---------------------------------------------------------------------------

const truncate = (s: string, limit: number): string =>
  s.length > limit ? s.slice(0, limit) + "..." : s

const styled = (ann: Annotation, content: string): Doc.Doc<Annotation> =>
  Doc.annotate(Doc.text(content), ann)

const lineWidthFromPageWidth = (width: PageWidth): number =>
  width._tag === "AvailablePerLine" ? width.lineWidth : 80

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

const usageBadge = (usage?: {
  readonly inputTokens?: number | undefined
  readonly outputTokens?: number | undefined
  readonly totalTokens?: number | undefined
  readonly reasoningTokens?: number | undefined
  readonly cachedInputTokens?: number | undefined
}): Doc.Doc<Annotation> => {
  if (!usage) return Doc.empty as Doc.Doc<Annotation>
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
    parts.push(`cache:${usage.cachedInputTokens}`)
  }
  const total = usage.totalTokens !== undefined && usage.totalTokens > 0
    ? usage.totalTokens
    : (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
  if (total > 0) parts.push(`= ${total}`)
  if (parts.length === 0) return Doc.empty as Doc.Doc<Annotation>
  return styled("dim", `[${parts.join(" ")}]`)
}

const iterationDivider = (
  depth: number,
  coordText: string,
  budgetText: string,
  label = "Iteration"
): Doc.Doc<Annotation> =>
  Doc.pageWidth((width) => {
    const lineWidth = lineWidthFromPageWidth(width)
    const guideCols = depth * 2
    const fixedCols = guideCols + coordText.length + budgetText.length + 2
    const available = Math.max(1, lineWidth - fixedCols)
    const head = `── ${label} `
    if (available <= head.length) {
      return styled("label", "─")
    }
    return styled("label", `${head}${"─".repeat(available - head.length)}`)
  })

// ---------------------------------------------------------------------------
// Layer 3: Tree Prefix System
// ---------------------------------------------------------------------------

const treeGuide = (depth: number): Doc.Doc<Annotation> => {
  if (depth === 0) return Doc.empty as Doc.Doc<Annotation>
  const guides = Array.from({ length: depth }, () =>
    styled("call-border", "│ ")
  )
  return Doc.cats(guides)
}

const withGuide = (depth: number, doc: Doc.Doc<Annotation>): Doc.Doc<Annotation> =>
  depth > 0 ? Doc.cat(treeGuide(depth), doc) : doc

// ---------------------------------------------------------------------------
// Layer 4: Composite Blocks
// ---------------------------------------------------------------------------

const iterationBlock = (
  e: Extract<RlmEvent, { _tag: "IterationStarted" }>
): Doc.Doc<Annotation> => {
  const coordText = `[${e.depth}:${e.iteration}]`
  const budText = budgetBadgeText(e.budget)
  return withGuide(
    e.depth,
    Doc.group(
      Doc.fillSep([
        styled("coord", coordText),
        iterationDivider(e.depth, coordText, budText),
        styled("budget", budText)
      ])
    )
  )
}

const modelBlock = (
  e: Extract<RlmEvent, { _tag: "ModelResponse" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  const limit = opts.modelTruncateLimit ?? DEFAULT_MODEL_TRUNCATE
  const text = styled("model", truncate(e.text, limit))
  const usage = usageBadge(e.usage)
  return withGuide(
    e.depth,
    Doc.isEmpty(usage)
      ? text
      : Doc.cat(text, Doc.cat(Doc.text("  ") as Doc.Doc<Annotation>, usage))
  )
}

const codeBlock = (
  e: Extract<RlmEvent, { _tag: "CodeExecutionStarted" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  if (!opts.showCode) return Doc.empty as Doc.Doc<Annotation>
  const maxLines = opts.maxCodeLines ?? DEFAULT_MAX_CODE_LINES
  const header = withGuide(e.depth, styled("code", "▶ Code:"))
  const codeLines = e.code.split("\n")
  const displayLines = codeLines.length > maxLines
    ? [...codeLines.slice(0, maxLines), `... (${codeLines.length - maxLines} more lines)`]
    : codeLines
  const codeDocs = displayLines.map((line) =>
    withGuide(e.depth, Doc.cat(styled("code", "│ "), styled("code-content", line)))
  )
  return Doc.vsep([header, ...codeDocs])
}

const outputBlock = (
  e: Extract<RlmEvent, { _tag: "CodeExecutionCompleted" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  if (!opts.showOutput) return Doc.empty as Doc.Doc<Annotation>
  const maxLines = opts.maxOutputLines ?? DEFAULT_MAX_OUTPUT_LINES
  const charLimit = opts.outputTruncateLimit ?? DEFAULT_OUTPUT_TRUNCATE
  const rawOutput = truncate(e.output, charLimit)
  const outputLines = rawOutput.split("\n")
  const displayLines = outputLines.length > maxLines
    ? [...outputLines.slice(0, maxLines), `... (${outputLines.length - maxLines} more lines)`]
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

const callStartBlock = (
  e: Extract<RlmEvent, { _tag: "CallStarted" }>
): Doc.Doc<Annotation> =>
  Doc.pageWidth((width) => {
    const w = lineWidthFromPageWidth(width)
    const label = `Call [depth=${e.depth}]`
    const innerWidth = Math.max(0, w - (e.depth * 2) - 4)
    const top = `╭─ ${label} ${"─".repeat(Math.max(0, innerWidth - label.length - 2))}╮`
    return withGuide(e.depth, styled("call-border", top))
  })

const bridgeBlock = (
  e: Extract<RlmEvent, { _tag: "BridgeCallReceived" }>
): Doc.Doc<Annotation> =>
  withGuide(e.depth, styled("bridge", `├─ ↗ Bridge: ${e.method}`))

const cacheBlock = (
  e: Extract<RlmEvent, { _tag: "CacheHit" | "CacheMiss" }>
): Doc.Doc<Annotation> => {
  const status = e._tag === "CacheHit" ? "hit" : "miss"
  const shortKey = e.cacheKey.length > 24 ? `${e.cacheKey.slice(0, 24)}...` : e.cacheKey
  return withGuide(e.depth, styled("bridge", `├─ ↺ Cache ${status} (${e.kind}): ${shortKey}`))
}

const finalBlock = (
  e: Extract<RlmEvent, { _tag: "CallFinalized" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  const limit = opts.finalTruncateLimit ?? DEFAULT_FINAL_TRUNCATE
  return withGuide(e.depth, styled("final", `✓ FINAL: ${truncate(e.answer, limit)}`))
}

// ---------------------------------------------------------------------------
// Structured error rendering
// ---------------------------------------------------------------------------

const formatError = (err: RlmError): Array<Doc.Doc<Annotation>> => {
  const header = styled("error", `✗ FAILED: ${err._tag}`)

  const details: Array<string> = []
  switch (err._tag) {
    case "BudgetExhaustedError":
      details.push(`resource=${err.resource}, remaining=${err.remaining}`)
      break
    case "NoFinalAnswerError":
      details.push(`maxIterations=${err.maxIterations}`)
      break
    case "SandboxError":
      if (err.message) details.push(err.message)
      break
    case "UnknownRlmError":
      if (err.message) details.push(err.message)
      break
    case "OutputValidationError":
      if (err.message) details.push(err.message)
      details.push(`raw=${truncate(err.raw, 100)}`)
      break
    case "CallStateMissingError":
      details.push(`callId=${err.callId}`)
      break
  }

  const detailDoc = details.length > 0
    ? Doc.cat(styled("error", ": "), styled("error", details.join(", ")))
    : Doc.empty as Doc.Doc<Annotation>

  const lines = [Doc.cats([header, detailDoc])]

  if ("cause" in err && err.cause != null) {
    const causeText = Cause.isCause(err.cause)
      ? Cause.pretty(err.cause)
      : String(err.cause)
    const causeLines = causeText.split("\n")
    const truncatedLines = causeLines.length > 10
      ? [...causeLines.slice(0, 10), `... (${causeLines.length - 10} more lines)`]
      : causeLines
    lines.push(...truncatedLines.map((line) => styled("error-detail", `  ${line}`)))
  }

  return lines
}

// ---------------------------------------------------------------------------
// Scheduler warning
// ---------------------------------------------------------------------------

const schedulerWarningDoc = (
  e: Extract<RlmEvent, { _tag: "SchedulerWarning" }>,
  opts: RenderOptions
): Doc.Doc<Annotation> => {
  if (opts.quiet) return Doc.empty as Doc.Doc<Annotation>
  const meta: Array<string> = []
  if (e.callId !== undefined) meta.push(`call=${e.callId}`)
  if (e.commandTag !== undefined) meta.push(`cmd=${e.commandTag}`)
  const suffix = meta.length > 0 ? ` [${meta.join(", ")}]` : ""
  return styled("warning", `⚠ ${e.code}: ${e.message}${suffix}`)
}

// ---------------------------------------------------------------------------
// Layer 5: Rendering Pipeline
// ---------------------------------------------------------------------------

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
      CallStarted: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : callStartBlock(e),
      IterationStarted: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : iterationBlock(e),
      ModelResponse: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : modelBlock(e, opts),
      CodeExecutionStarted: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : codeBlock(e, opts),
      CodeExecutionCompleted: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : outputBlock(e, opts),
      BridgeCallReceived: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : bridgeBlock(e),
      CacheHit: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : cacheBlock(e),
      CacheMiss: (e) => opts.quiet ? Doc.empty as Doc.Doc<Annotation> : cacheBlock(e),
      CallFinalized: (e) => finalBlock(e, opts),
      CallFailed: (e) => Doc.vsep(formatError(e.error).map((line) => withGuide(e.depth, line))),
      SchedulerWarning: (e) => schedulerWarningDoc(e, opts)
    })
  )
}

export const formatEvent = (event: RlmEvent, options?: RenderOptions): string => {
  const doc = buildEventDoc(event, options)
  if (Doc.isEmpty(doc)) return ""
  const lineWidth = options?.lineWidth ?? 120
  if (options?.noColor) {
    return Doc.render(Doc.unAnnotate(doc), { style: "pretty", options: { lineWidth } }) + "\n"
  }
  return AnsiDoc.render(Doc.reAnnotate(doc, theme), { style: "pretty", options: { lineWidth } }) + "\n"
}

// ---------------------------------------------------------------------------
// Backward-compatible wrapper
// ---------------------------------------------------------------------------

export const renderEvent = (
  event: RlmEvent,
  out: { write: (s: string) => void },
  options?: RenderOptions
): void => {
  const formatted = formatEvent(event, options)
  if (formatted) out.write(formatted)
}
