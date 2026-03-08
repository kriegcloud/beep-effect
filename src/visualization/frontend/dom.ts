import type { SerializedExtraction } from "../shared.js"
import type {
  ScrollTarget,
  VisualizationController
} from "./controller.js"

export interface VisualizationDomAdapter {
  readonly setPlayButtonLabel: (label: string) => void
  readonly setStatusText: (value: string) => void
  readonly setSlider: (value: number, max: number) => void
  readonly setAttributesHtml: (value: string) => void
  readonly setActiveHighlight: (target: ScrollTarget | undefined) => void
  readonly onPlayPause: (handler: () => void) => () => void
  readonly onPrev: (handler: () => void) => () => void
  readonly onNext: (handler: () => void) => () => void
  readonly onSlider: (handler: (value: number) => void) => () => void
  readonly dispose: () => void
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;")

const formatAttributeValue = (value: string | ReadonlyArray<string>): string =>
  typeof value === "string" ? value : value.join(", ")

export const renderAttributesHtml = (
  extraction: SerializedExtraction | undefined
): string => {
  if (extraction === undefined) {
    return `<div class="lx-attr-empty">No extraction selected.</div>`
  }

  const entries = Object.entries(extraction.attributes)
  const attributes =
    entries.length === 0
      ? `<div class="lx-attr-empty">No attributes</div>`
      : entries
          .map(
            ([key, value]) =>
              `<div class="lx-attr-row"><span class="lx-attr-key">${escapeHtml(key)}</span><span class="lx-attr-value">${escapeHtml(formatAttributeValue(value))}</span></div>`
          )
          .join("")

  return `<div class="lx-attr-row"><span class="lx-attr-key">Class</span><span class="lx-attr-value">${escapeHtml(extraction.extractionClass)}</span></div><div class="lx-attr-row"><span class="lx-attr-key">Status</span><span class="lx-attr-value">${escapeHtml(extraction.status)}</span></div><div class="lx-attr-row"><span class="lx-attr-key">Text</span><span class="lx-attr-value">${escapeHtml(extraction.extractionText)}</span></div><div class="lx-attr-row"><span class="lx-attr-key">Span</span><span class="lx-attr-value">${extraction.start}\u2013${extraction.end}</span></div>${attributes}`
}

export const bindVisualizationDom = (
  controller: VisualizationController,
  dom: VisualizationDomAdapter
): (() => void) => {
  const cleanups: Array<() => void> = []
  const maxIndex = Math.max(0, controller.total - 1)

  dom.setSlider(controller.getCurrentIndex(), maxIndex)

  cleanups.push(dom.onPlayPause(() => controller.togglePlay()))
  cleanups.push(dom.onPrev(() => controller.prev()))
  cleanups.push(dom.onNext(() => controller.next()))
  cleanups.push(dom.onSlider((value) => controller.jumpTo(value)))

  cleanups.push(
    controller.subscribePlayButtonLabel((label) => {
      dom.setPlayButtonLabel(label)
    })
  )

  cleanups.push(
    controller.subscribeStatusText((status) => {
      dom.setStatusText(status)
    })
  )

  cleanups.push(
    controller.subscribeCurrentIndex((index) => {
      dom.setSlider(index, maxIndex)
    })
  )

  cleanups.push(
    controller.subscribeCurrentExtraction((current) => {
      dom.setAttributesHtml(renderAttributesHtml(current))
    })
  )

  cleanups.push(
    controller.subscribeScrollTarget((target) => {
      dom.setActiveHighlight(target)
    })
  )

  return () => {
    dom.dispose()
    for (let index = cleanups.length - 1; index >= 0; index--) {
      const cleanup = cleanups[index]
      if (cleanup !== undefined) {
        cleanup()
      }
    }
  }
}

const lookupElement = <T extends HTMLElement>(
  doc: Document,
  id: string
): T | undefined => {
  const element = doc.getElementById(id)
  if (element === null) {
    return undefined
  }
  return element as T
}

const addListener = (
  element: HTMLElement,
  event: string,
  handler: () => void
): (() => void) => {
  const listener = () => {
    handler()
  }
  element.addEventListener(event, listener)
  return () => {
    element.removeEventListener(event, listener)
  }
}

const TOOLTIP_GAP = 8

const positionTooltip = (
  tooltip: HTMLElement,
  anchor: HTMLElement
): void => {
  const rect = anchor.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = rect.top - tooltipRect.height - TOOLTIP_GAP
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2

  if (top < 4) {
    top = rect.bottom + TOOLTIP_GAP
  }

  if (top + tooltipRect.height > viewportHeight - 4) {
    top = viewportHeight - tooltipRect.height - 4
  }

  if (left < 4) {
    left = 4
  } else if (left + tooltipRect.width > viewportWidth - 4) {
    left = viewportWidth - tooltipRect.width - 4
  }

  tooltip.style.top = `${top}px`
  tooltip.style.left = `${left}px`
}

const buildTooltipHtml = (mark: HTMLElement): string => {
  const cls = mark.dataset.class ?? "unknown"
  const status = mark.dataset.status ?? "unknown"
  const idx = mark.dataset.idx ?? "?"
  return `<div><strong>Class:</strong> ${escapeHtml(cls)}</div><div><strong>Status:</strong> ${escapeHtml(status)}</div><div><strong>Index:</strong> ${escapeHtml(idx)}</div>`
}

const setupTooltipPortal = (
  textWindow: HTMLElement,
  tooltip: HTMLElement
): (() => void) => {
  let activeAnchor: HTMLElement | null = null

  const showTooltip = (event: Event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }

    const mark = target.closest(".lx-highlight")
    if (!(mark instanceof HTMLElement)) {
      return
    }

    activeAnchor = mark
    tooltip.innerHTML = buildTooltipHtml(mark)
    tooltip.classList.add("lx-tooltip-visible")
    positionTooltip(tooltip, mark)
  }

  const hideTooltip = (event: Event) => {
    const related = (event as MouseEvent).relatedTarget
    if (related instanceof Node && textWindow.contains(related)) {
      const mark = (related as HTMLElement).closest?.(".lx-highlight")
      if (mark instanceof HTMLElement) {
        return
      }
    }
    activeAnchor = null
    tooltip.classList.remove("lx-tooltip-visible")
  }

  const onScroll = () => {
    if (activeAnchor !== null) {
      positionTooltip(tooltip, activeAnchor)
    }
  }

  textWindow.addEventListener("mouseenter", showTooltip, true)
  textWindow.addEventListener("mouseover", showTooltip, true)
  textWindow.addEventListener("mouseout", hideTooltip, true)
  textWindow.addEventListener("mouseleave", hideTooltip)
  textWindow.addEventListener("scroll", onScroll, { passive: true })

  return () => {
    textWindow.removeEventListener("mouseenter", showTooltip, true)
    textWindow.removeEventListener("mouseover", showTooltip, true)
    textWindow.removeEventListener("mouseout", hideTooltip, true)
    textWindow.removeEventListener("mouseleave", hideTooltip)
    textWindow.removeEventListener("scroll", onScroll)
    tooltip.classList.remove("lx-tooltip-visible")
  }
}

export const createBrowserDom = (
  doc: Document = document
): VisualizationDomAdapter | undefined => {
  const playButton = lookupElement<HTMLButtonElement>(doc, "lx-play-toggle")
  const prevButton = lookupElement<HTMLButtonElement>(doc, "lx-prev")
  const nextButton = lookupElement<HTMLButtonElement>(doc, "lx-next")
  const slider = lookupElement<HTMLInputElement>(doc, "lx-slider")
  const status = lookupElement<HTMLElement>(doc, "lx-status")
  const attributes = lookupElement<HTMLElement>(doc, "lx-attributes")
  const textWindow = lookupElement<HTMLElement>(doc, "lx-text-window")
  const tooltip = lookupElement<HTMLElement>(doc, "lx-tooltip")

  if (
    playButton === undefined ||
    prevButton === undefined ||
    nextButton === undefined ||
    slider === undefined ||
    status === undefined ||
    attributes === undefined ||
    textWindow === undefined
  ) {
    return undefined
  }

  const cleanupTooltip = tooltip !== undefined
    ? setupTooltipPortal(textWindow, tooltip)
    : () => {}

  const setActiveHighlight = (target: ScrollTarget | undefined) => {
    const previous = textWindow.querySelectorAll(".lx-highlight.lx-current-highlight")
    previous.forEach((element) => {
      element.classList.remove("lx-current-highlight")
    })

    if (target === undefined) {
      return
    }

    const selector = `.lx-highlight[data-idx="${target.index}"]`
    const current = textWindow.querySelector(selector)
    if (!(current instanceof HTMLElement)) {
      return
    }

    current.classList.add("lx-current-highlight")
    if (typeof current.scrollIntoView === "function") {
      current.scrollIntoView({ block: "center", behavior: target.behavior })
    }
  }

  const onSlider = (handler: (value: number) => void): (() => void) => {
    const listener = () => {
      const parsed = Number.parseInt(slider.value, 10)
      handler(Number.isFinite(parsed) ? parsed : 0)
    }
    slider.addEventListener("input", listener)
    return () => {
      slider.removeEventListener("input", listener)
    }
  }

  return {
    setPlayButtonLabel: (label) => {
      playButton.textContent = label
    },
    setStatusText: (value) => {
      status.textContent = value
    },
    setSlider: (value, max) => {
      const boundedMax = Math.max(0, max)
      slider.max = String(boundedMax)
      const normalized = value < 0 ? 0 : Math.min(boundedMax, Math.max(0, value))
      slider.value = String(normalized)
      slider.disabled = boundedMax <= 0
    },
    setAttributesHtml: (value) => {
      attributes.innerHTML = value
    },
    setActiveHighlight,
    onPlayPause: (handler) => addListener(playButton, "click", handler),
    onPrev: (handler) => addListener(prevButton, "click", handler),
    onNext: (handler) => addListener(nextButton, "click", handler),
    onSlider,
    dispose: cleanupTooltip
  }
}
