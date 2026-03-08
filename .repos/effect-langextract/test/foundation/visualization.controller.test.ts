import { describe, expect, it } from "@effect/vitest"

import { createVisualizationController } from "../../src/visualization/frontend/controller.js"
import type { VisualizationPayload } from "../../src/visualization/shared.js"

const payload: VisualizationPayload = {
  animationSpeed: 0.4,
  showLegend: true,
  extractions: [
    {
      index: 0,
      extractionClass: "person",
      extractionText: "Alice",
      status: "match_exact",
      start: 0,
      end: 5,
      color: "#D2E3FC",
      attributes: { team: "Everton" }
    },
    {
      index: 1,
      extractionClass: "action",
      extractionText: "visited",
      status: "match_exact",
      start: 6,
      end: 13,
      color: "#C8E6C9",
      attributes: {}
    },
    {
      index: 2,
      extractionClass: "location",
      extractionText: "Paris",
      status: "match_exact",
      start: 14,
      end: 19,
      color: "#FEF0C3",
      attributes: { country: "France" }
    }
  ]
}

describe("visualization frontend controller", () => {
  it("handles next/prev/jump with wraparound", () => {
    const controller = createVisualizationController(payload)

    expect(controller.getCurrentIndex()).toBe(0)

    controller.next()
    expect(controller.getCurrentIndex()).toBe(1)

    controller.next()
    expect(controller.getCurrentIndex()).toBe(2)

    controller.next()
    expect(controller.getCurrentIndex()).toBe(0)

    controller.prev()
    expect(controller.getCurrentIndex()).toBe(2)

    controller.jumpTo(7)
    expect(controller.getCurrentIndex()).toBe(1)

    controller.dispose()
  })

  it("updates play label and scroll behavior when playback state changes", () => {
    const controller = createVisualizationController(payload)

    const labels: Array<string> = []
    const behaviors: Array<string> = []

    const cancelLabel = controller.subscribePlayButtonLabel((label) => {
      labels.push(label)
    })

    const cancelScroll = controller.subscribeScrollTarget((target) => {
      if (target !== undefined) {
        behaviors.push(target.behavior)
      }
    })

    controller.togglePlay()
    controller.setPlaying(false)

    expect(labels[0]).toBe("Play")
    expect(labels).toContain("Pause")
    expect(labels[labels.length - 1]).toBe("Play")

    expect(behaviors[0]).toBe("auto")
    expect(behaviors).toContain("smooth")

    cancelLabel()
    cancelScroll()
    controller.dispose()
  })

  it("emits status text for current extraction", () => {
    const controller = createVisualizationController(payload)
    const statuses: Array<string> = []

    const cancel = controller.subscribeStatusText((status) => {
      statuses.push(status)
    })

    controller.next()
    controller.next()

    expect(statuses[0]).toContain("Entity 1/3")
    expect(statuses[statuses.length - 1]).toContain("Pos [14-19]")

    cancel()
    controller.dispose()
  })
})
