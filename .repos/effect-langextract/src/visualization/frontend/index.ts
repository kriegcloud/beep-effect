import type { SerializedExtraction, VisualizationPayload } from "../shared.js"
import { createVisualizationController } from "./controller.js"
import { bindVisualizationDom, createBrowserDom } from "./dom.js"

const PAYLOAD_ELEMENT_ID = "lx-visualization-payload"

const asString = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback

const asNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback

const normalizeAttributes = (
  value: unknown
): Readonly<Record<string, string | ReadonlyArray<string>>> => {
  if (value === null || typeof value !== "object") {
    return {}
  }

  const entries = Object.entries(value as Record<string, unknown>)
  const normalized: Record<string, string | ReadonlyArray<string>> = {}
  for (const [key, item] of entries) {
    if (typeof item === "string") {
      normalized[key] = item
      continue
    }
    if (Array.isArray(item)) {
      normalized[key] = item.map((entry) => String(entry))
    }
  }
  return normalized
}

const parseExtraction = (
  value: unknown,
  fallbackIndex: number
): SerializedExtraction | undefined => {
  if (value === null || typeof value !== "object") {
    return undefined
  }

  const data = value as Record<string, unknown>
  const start = asNumber(data.start, Number.NaN)
  const end = asNumber(data.end, Number.NaN)

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return undefined
  }

  return {
    index: asNumber(data.index, fallbackIndex),
    extractionClass: asString(data.extractionClass, "unknown"),
    extractionText: asString(data.extractionText, ""),
    status: asString(data.status, "unknown"),
    start,
    end,
    color: asString(data.color, "#D2E3FC"),
    attributes: normalizeAttributes(data.attributes)
  }
}

const parsePayload = (doc: Document): VisualizationPayload | undefined => {
  const payloadElement = doc.getElementById(PAYLOAD_ELEMENT_ID)
  if (!(payloadElement instanceof HTMLScriptElement)) {
    return undefined
  }

  try {
    const parsed = JSON.parse(payloadElement.textContent ?? "{}")
    const root = parsed as Record<string, unknown>
    const extractions = Array.isArray(root.extractions)
      ? root.extractions
          .map((value, index) => parseExtraction(value, index))
          .filter((value): value is SerializedExtraction => value !== undefined)
      : []

    return {
      animationSpeed: asNumber(root.animationSpeed, 1),
      showLegend:
        typeof root.showLegend === "boolean" ? root.showLegend : true,
      extractions
    }
  } catch {
    return undefined
  }
}

export const bootstrapVisualization = (
  doc: Document = document
): (() => void) | undefined => {
  const payload = parsePayload(doc)
  if (payload === undefined) {
    return undefined
  }

  const dom = createBrowserDom(doc)
  if (dom === undefined) {
    return undefined
  }

  const controller = createVisualizationController(payload)
  const cleanupDom = bindVisualizationDom(controller, dom)

  let didCleanup = false
  const cleanup = () => {
    if (didCleanup) {
      return
    }
    didCleanup = true
    cleanupDom()
    controller.dispose()
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", cleanup)
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", cleanup)
  }

  return cleanup
}

declare global {
  var __effectLangExtractVisualizationBootstrap: (() => void) | undefined
}

globalThis.__effectLangExtractVisualizationBootstrap = () => {
  bootstrapVisualization()
}
