import { Effect, Layer } from "effect"

import { AnnotatedDocument } from "./Data.js"
import { VisualizationError } from "./Errors.js"
import { FRONTEND_BUNDLE } from "./visualization/frontendBundle.generated.js"
import type {
  SerializedExtraction,
  VisualizationPayload
} from "./visualization/shared.js"

export interface VisualizerService {
  readonly visualize: (
    doc: AnnotatedDocument,
    options?: {
      animationSpeed?: number
      showLegend?: boolean
    }
  ) => Effect.Effect<string, VisualizationError>
}

const Palette = [
  "#D2E3FC",
  "#C8E6C9",
  "#FEF0C3",
  "#F9DEDC",
  "#FFDDBE",
  "#EADDFF",
  "#C4E9E4",
  "#FCE4EC",
  "#E8EAED",
  "#DDE8E8"
] as const

type TagType = "start" | "end"

type SpanPoint = {
  readonly position: number
  readonly tagType: TagType
  readonly spanLength: number
  readonly extraction: SerializedExtraction
}

type NormalizedExtraction = Omit<SerializedExtraction, "index" | "color">

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;")

const escapeJsonForScriptTag = (value: string): string =>
  value.replaceAll("<", "\\u003c")

const escapeInlineScript = (value: string): string =>
  value.replaceAll("</script", "<\\/script")

const normalizeAnimationSpeed = (value: number | undefined): number => {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return 1
  }
  return Math.min(Math.max(value, 0.05), 30)
}

const normalizeAttributes = (
  attributes: Readonly<Record<string, string | ReadonlyArray<string>>> | undefined
): Readonly<Record<string, string | ReadonlyArray<string>>> => {
  if (attributes === undefined) {
    return {}
  }

  const normalized: Record<string, string | ReadonlyArray<string>> = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string") {
      normalized[key] = value
      continue
    }
    if (Array.isArray(value)) {
      normalized[key] = value.map((item) => String(item))
    }
  }
  return normalized
}

const compareNormalizedExtractions = (
  left: NormalizedExtraction,
  right: NormalizedExtraction
): number => {
  if (left.start !== right.start) {
    return left.start - right.start
  }

  const leftLength = left.end - left.start
  const rightLength = right.end - right.start
  if (leftLength !== rightLength) {
    return rightLength - leftLength
  }

  const byClass = left.extractionClass.localeCompare(right.extractionClass)
  if (byClass !== 0) {
    return byClass
  }

  return left.extractionText.localeCompare(right.extractionText)
}

const makeColorMap = (
  extractions: ReadonlyArray<NormalizedExtraction>
): ReadonlyMap<string, string> => {
  const classes = [...new Set(extractions.map((item) => item.extractionClass))].sort(
    (left, right) => left.localeCompare(right)
  )

  return new Map(
    classes.map((extractionClass, index) => [
      extractionClass,
      Palette[index % Palette.length] ?? Palette[0]
    ])
  )
}

const collectSerializableExtractions = (
  doc: AnnotatedDocument
): ReadonlyArray<SerializedExtraction> => {
  const sourceLength = doc.text.length
  const normalized: Array<NormalizedExtraction> = []

  for (const extraction of doc.extractions) {
    const start = extraction.charInterval?.startPos
    const end = extraction.charInterval?.endPos
    if (
      start === undefined ||
      end === undefined ||
      start < 0 ||
      end <= start ||
      start >= sourceLength
    ) {
      continue
    }

    normalized.push({
      extractionClass: extraction.extractionClass,
      extractionText: extraction.extractionText,
      status: extraction.alignmentStatus ?? "unknown",
      start,
      end: Math.min(sourceLength, end),
      attributes: normalizeAttributes(extraction.attributes)
    })
  }

  normalized.sort(compareNormalizedExtractions)

  const colorMap = makeColorMap(normalized)

  return normalized.map((extraction, index) => ({
    ...extraction,
    index,
    color: colorMap.get(extraction.extractionClass) ?? Palette[0]
  }))
}

const buildLegend = (
  extractions: ReadonlyArray<SerializedExtraction>
): string => {
  if (extractions.length === 0) {
    return `<div class="lx-empty">No aligned extractions found.</div>`
  }

  const counts = new Map<string, number>()
  const colors = new Map<string, string>()

  for (const extraction of extractions) {
    counts.set(
      extraction.extractionClass,
      (counts.get(extraction.extractionClass) ?? 0) + 1
    )
    colors.set(extraction.extractionClass, extraction.color)
  }

  const classes = [...counts.keys()].sort((left, right) =>
    left.localeCompare(right)
  )

  return `<section class="lx-card"><h2 class="lx-subtitle">Legend</h2><ul class="lx-legend">${classes
    .map((extractionClass) => {
      const count = counts.get(extractionClass) ?? 0
      const color = colors.get(extractionClass) ?? Palette[0]
      return `<li><span class="lx-dot" style="background:${color}"></span>${escapeHtml(extractionClass)} (${count})</li>`
    })
    .join("")}</ul></section>`
}

const formatAttributeValue = (value: string | ReadonlyArray<string>): string =>
  typeof value === "string" ? value : value.join(", ")

const renderAttributesPanelContent = (
  extraction: SerializedExtraction | undefined
): string => {
  if (extraction === undefined) {
    return `<div class="lx-attr-empty">No extraction selected.</div>`
  }

  const attributes = Object.entries(extraction.attributes)
  const attributeRows =
    attributes.length === 0
      ? `<div class="lx-attr-empty">No attributes</div>`
      : attributes
          .map(
            ([key, value]) =>
              `<div class="lx-attr-row"><span class="lx-attr-key">${escapeHtml(key)}</span><span class="lx-attr-value">${escapeHtml(formatAttributeValue(value))}</span></div>`
          )
          .join("")

  return `<div class="lx-attr-row"><span class="lx-attr-key">Class</span><span class="lx-attr-value">${escapeHtml(extraction.extractionClass)}</span></div><div class="lx-attr-row"><span class="lx-attr-key">Status</span><span class="lx-attr-value">${escapeHtml(extraction.status)}</span></div><div class="lx-attr-row"><span class="lx-attr-key">Text</span><span class="lx-attr-value">${escapeHtml(extraction.extractionText)}</span></div><div class="lx-attr-row"><span class="lx-attr-key">Span</span><span class="lx-attr-value">${extraction.start}-${extraction.end}</span></div>${attributeRows}`
}

const compareSpanPoints = (left: SpanPoint, right: SpanPoint): number => {
  if (left.position !== right.position) {
    return left.position - right.position
  }

  if (left.tagType !== right.tagType) {
    return left.tagType === "end" ? -1 : 1
  }

  if (left.tagType === "end") {
    return left.spanLength - right.spanLength
  }

  return right.spanLength - left.spanLength
}

const buildSpanPoints = (
  extractions: ReadonlyArray<SerializedExtraction>
): Array<SpanPoint> => {
  const points: Array<SpanPoint> = []

  for (const extraction of extractions) {
    const spanLength = extraction.end - extraction.start
    points.push({
      position: extraction.start,
      tagType: "start",
      spanLength,
      extraction
    })
    points.push({
      position: extraction.end,
      tagType: "end",
      spanLength,
      extraction
    })
  }

  points.sort(compareSpanPoints)
  return points
}

const buildHighlightedText = (
  text: string,
  extractions: ReadonlyArray<SerializedExtraction>
): string => {
  if (extractions.length === 0) {
    return escapeHtml(text)
  }

  const points = buildSpanPoints(extractions)
  const parts: Array<string> = []
  let cursor = 0

  for (const point of points) {
    if (point.position > cursor) {
      parts.push(escapeHtml(text.slice(cursor, point.position)))
    }

    if (point.tagType === "start") {
      parts.push(
        `<mark class="lx-highlight" style="--lx-color:${point.extraction.color}" data-idx="${point.extraction.index}" data-class="${escapeHtml(point.extraction.extractionClass)}" data-status="${escapeHtml(point.extraction.status)}">`
      )
    } else {
      parts.push(`</mark>`)
    }

    cursor = point.position
  }

  if (cursor < text.length) {
    parts.push(escapeHtml(text.slice(cursor)))
  }

  return parts.join("")
}

const makeStatusText = (
  extraction: SerializedExtraction | undefined,
  total: number
): string => {
  if (extraction === undefined || total <= 0) {
    return "Entity 0/0 | Pos [-]"
  }
  return `Entity ${extraction.index + 1}/${total} | Pos [${extraction.start}-${extraction.end}]`
}

const renderHtml = (
  doc: AnnotatedDocument,
  options?: {
    animationSpeed?: number
    showLegend?: boolean
  }
): string => {
  const extractions = collectSerializableExtractions(doc)
  const animationSpeed = normalizeAnimationSpeed(options?.animationSpeed)
  const showLegend = options?.showLegend ?? true

  const payload: VisualizationPayload = {
    animationSpeed,
    showLegend,
    extractions
  }

  const payloadJson = escapeJsonForScriptTag(JSON.stringify(payload))
  const highlightedText = buildHighlightedText(doc.text, extractions)
  const legend = showLegend ? buildLegend(extractions) : ""
  const initialExtraction = extractions[0]
  const initialAttributes = renderAttributesPanelContent(initialExtraction)
  const sliderMax = Math.max(0, extractions.length - 1)
  const initialStatus = makeStatusText(initialExtraction, extractions.length)
  const runtimeScript = escapeInlineScript(FRONTEND_BUNDLE)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>effect-langextract visualization</title>
    <style>
      :root { --lx-speed: ${animationSpeed}s; --lx-radius: 10px; --lx-border: #d9e2ec; --lx-muted: #64748b; }
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; background: #f5f7f8; color: #1f2933; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 15px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
      .lx-shell { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }
      .lx-title { margin: 0 0 16px; font-size: 1.15rem; font-weight: 600; letter-spacing: -0.01em; }
      .lx-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: start; }
      .lx-stack { display: grid; gap: 14px; position: sticky; top: 20px; }
      .lx-card { background: #fff; border: 1px solid var(--lx-border); border-radius: var(--lx-radius); padding: 16px; }
      .lx-subtitle { margin: 0 0 12px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--lx-muted); }
      .lx-text { white-space: pre-wrap; line-height: 1.7; font-size: 0.92rem; max-height: 560px; overflow-y: auto; padding: 2px 4px 2px 0; scroll-behavior: smooth; }
      .lx-highlight { position: relative; border-radius: 3px; padding: 1px 3px; background: var(--lx-color); cursor: default; }
      .lx-highlight.lx-current-highlight { box-shadow: 0 0 0 2px #0f766e; border-radius: 3px; }
      .lx-tooltip-portal { display: none; position: fixed; z-index: 9999; background: #111827; color: #f1f5f9; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; line-height: 1.45; max-width: 280px; width: max-content; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3); pointer-events: none; }
      .lx-tooltip-portal.lx-tooltip-visible { display: block; }
      .lx-tooltip-portal strong { color: #e2e8f0; }
      .lx-controls { display: grid; gap: 12px; }
      .lx-button-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .lx-control-btn { border: 1px solid var(--lx-border); background: #fff; border-radius: 7px; padding: 7px 0; font-size: 0.8rem; font-weight: 500; cursor: pointer; text-align: center; transition: background-color 0.15s ease, border-color 0.15s ease; }
      .lx-control-btn:hover { background: #f1f5f9; border-color: #94a3b8; }
      .lx-control-btn:focus-visible { outline: 2px solid #0f766e; outline-offset: 2px; }
      .lx-control-btn:disabled { cursor: default; opacity: 0.5; }
      .lx-slider { width: 100%; accent-color: #0f766e; height: 6px; cursor: pointer; }
      .lx-slider:focus-visible { outline: 2px solid #0f766e; outline-offset: 4px; }
      .lx-status { margin: 0; font-size: 0.78rem; color: var(--lx-muted); font-variant-numeric: tabular-nums; }
      .lx-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
      .lx-legend li { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
      .lx-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1px solid rgba(15, 23, 42, 0.12); }
      .lx-legend-count { color: var(--lx-muted); font-variant-numeric: tabular-nums; }
      .lx-empty { font-size: 0.85rem; color: var(--lx-muted); }
      .lx-attributes { display: grid; gap: 8px; font-size: 0.8rem; }
      .lx-attr-row { display: grid; grid-template-columns: 80px 1fr; gap: 8px; }
      .lx-attr-key { font-weight: 600; color: #0f172a; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; }
      .lx-attr-value { color: #334155; word-break: break-word; }
      .lx-attr-empty { color: var(--lx-muted); }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
      }
      @media (max-width: 920px) {
        .lx-layout { grid-template-columns: 1fr; }
        .lx-stack { position: static; }
      }
      @media (max-width: 640px) {
        .lx-shell { padding: 14px; }
        .lx-card { padding: 12px; }
      }
    </style>
  </head>
  <body>
    <div id="lx-tooltip" class="lx-tooltip-portal" role="tooltip"></div>
    <main class="lx-shell">
      <h1 class="lx-title">effect-langextract visualization</h1>
      <section class="lx-layout">
        <aside class="lx-stack">
          ${legend}
          <section class="lx-card lx-controls">
            <h2 class="lx-subtitle">Playback</h2>
            <div class="lx-button-row">
              <button id="lx-play-toggle" class="lx-control-btn" type="button" aria-label="Play or pause extraction playback">Play</button>
              <button id="lx-prev" class="lx-control-btn" type="button" aria-label="Previous extraction">Prev</button>
              <button id="lx-next" class="lx-control-btn" type="button" aria-label="Next extraction">Next</button>
            </div>
            <input id="lx-slider" class="lx-slider" type="range" min="0" max="${sliderMax}" value="0" aria-label="Extraction index" />
            <p id="lx-status" class="lx-status" aria-live="polite">${escapeHtml(initialStatus)}</p>
          </section>
          <section class="lx-card">
            <h2 class="lx-subtitle">Current Extraction</h2>
            <div id="lx-attributes" class="lx-attributes">${initialAttributes}</div>
          </section>
        </aside>
        <section class="lx-card">
          <div id="lx-text-window" class="lx-text">${highlightedText}</div>
        </section>
      </section>
    </main>
    <script id="lx-visualization-payload" type="application/json">${payloadJson}</script>
    <script>${runtimeScript}</script>
    <script>globalThis.__effectLangExtractVisualizationBootstrap?.()</script>
  </body>
</html>`
}

const visualizeImpl = (
  doc: AnnotatedDocument,
  options?: {
    animationSpeed?: number
    showLegend?: boolean
  }
): Effect.Effect<string, VisualizationError> =>
  Effect.try({
    try: () => renderHtml(doc, options),
    catch: (error) =>
      new VisualizationError({
        message: `Failed to render visualization HTML: ${String(error)}`
      })
  })

export class Visualizer extends Effect.Service<Visualizer>()(
  "@effect-langextract/Visualizer",
  {
    sync: () => ({
      visualize: visualizeImpl
    } satisfies VisualizerService)
  }
) {
  static readonly Test: Layer.Layer<Visualizer> = Visualizer.Default

  static testLayer = (
    service?: VisualizerService
  ): Layer.Layer<Visualizer> =>
    Layer.succeed(
      Visualizer,
      Visualizer.make(
        service ?? {
          visualize: visualizeImpl
        }
      )
    )
}

export const VisualizerLive: Layer.Layer<Visualizer> = Visualizer.Default

export const VisualizerTest: Layer.Layer<Visualizer> = Visualizer.Test
