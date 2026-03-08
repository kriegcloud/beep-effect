import { describe, expect, it } from "@effect/vitest"

import { createVisualizationController } from "../../src/visualization/frontend/controller.js"
import {
  bindVisualizationDom,
  renderAttributesHtml,
  type VisualizationDomAdapter
} from "../../src/visualization/frontend/dom.js"
import type { VisualizationPayload } from "../../src/visualization/shared.js"

const payload: VisualizationPayload = {
  animationSpeed: 0.3,
  showLegend: true,
  extractions: [
    {
      index: 0,
      extractionClass: "player",
      extractionText: "Dwight McNeil",
      status: "match_exact",
      start: 0,
      end: 13,
      color: "#D2E3FC",
      attributes: { from: "Everton" }
    },
    {
      index: 1,
      extractionClass: "club",
      extractionText: "Liverpool",
      status: "match_exact",
      start: 21,
      end: 30,
      color: "#C8E6C9",
      attributes: {}
    }
  ]
}

describe("visualization dom bindings", () => {
  it("binds controller state to dom adapter and wires controls", () => {
    const controller = createVisualizationController(payload)

    const state = {
      playLabel: "",
      status: "",
      sliderValue: -1,
      sliderMax: -1,
      attributes: "",
      activeTargets: [] as Array<number>,
      playHandler: undefined as (() => void) | undefined,
      prevHandler: undefined as (() => void) | undefined,
      nextHandler: undefined as (() => void) | undefined,
      sliderHandler: undefined as ((value: number) => void) | undefined
    }

    const dom: VisualizationDomAdapter = {
      setPlayButtonLabel: (label) => {
        state.playLabel = label
      },
      setStatusText: (value) => {
        state.status = value
      },
      setSlider: (value, max) => {
        state.sliderValue = value
        state.sliderMax = max
      },
      setAttributesHtml: (value) => {
        state.attributes = value
      },
      setActiveHighlight: (target) => {
        if (target !== undefined) {
          state.activeTargets.push(target.index)
        }
      },
      onPlayPause: (handler) => {
        state.playHandler = handler
        return () => {
          state.playHandler = undefined
        }
      },
      onPrev: (handler) => {
        state.prevHandler = handler
        return () => {
          state.prevHandler = undefined
        }
      },
      onNext: (handler) => {
        state.nextHandler = handler
        return () => {
          state.nextHandler = undefined
        }
      },
      onSlider: (handler) => {
        state.sliderHandler = handler
        return () => {
          state.sliderHandler = undefined
        }
      },
      dispose: () => {}
    }

    const cleanup = bindVisualizationDom(controller, dom)

    expect(state.playLabel).toBe("Play")
    expect(state.sliderMax).toBe(1)
    expect(state.sliderValue).toBe(0)
    expect(state.status).toContain("Entity 1/2")
    expect(state.attributes).toContain("Dwight McNeil")

    state.nextHandler?.()
    expect(state.sliderValue).toBe(1)
    expect(state.status).toContain("Entity 2/2")

    state.sliderHandler?.(0)
    expect(state.sliderValue).toBe(0)

    state.playHandler?.()
    expect(state.playLabel).toBe("Pause")

    expect(state.activeTargets).toContain(0)
    expect(state.activeTargets).toContain(1)

    cleanup()
    controller.dispose()
  })

  it("renders fallback attributes content when extraction is missing", () => {
    const html = renderAttributesHtml(undefined)
    expect(html).toContain("No extraction selected")
  })
})
