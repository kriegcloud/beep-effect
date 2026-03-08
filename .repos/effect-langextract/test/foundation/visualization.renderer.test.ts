import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import {
  AnnotatedDocument,
  CharInterval,
  Extraction,
  Visualizer
} from "../../src/index.js"

const countMarks = (html: string): number => [...html.matchAll(/<mark\b/g)].length

const legendColorMap = (html: string): ReadonlyMap<string, string> => {
  const map = new Map<string, string>()
  const pattern =
    /<li><span class="lx-dot" style="background:([^"]+)"><\/span>([^<]+) \((\d+)\)<\/li>/g

  for (const match of html.matchAll(pattern)) {
    const color = match[1]
    const extractionClass = match[2]
    map.set(extractionClass, color)
  }

  return map
}

describe("Visualizer renderer", () => {
  it.effect("renders interactive payload and controls", () =>
    Effect.gen(function* () {
      const visualizer = yield* Visualizer
      const html = yield* visualizer.visualize(
        new AnnotatedDocument({
          text: "Alice visited Paris.",
          extractions: [
            new Extraction({
              extractionClass: "person",
              extractionText: "Alice",
              alignmentStatus: "match_exact",
              charInterval: new CharInterval({ startPos: 0, endPos: 5 })
            })
          ]
        })
      )

      expect(html).toContain("id=\"lx-visualization-payload\"")
      expect(html).toContain("id=\"lx-play-toggle\"")
      expect(html).toContain("id=\"lx-slider\"")
      expect(html).toContain("__effectLangExtractVisualizationBootstrap")
      expect(html).toContain("data-idx=\"0\"")
      expect(countMarks(html)).toBe(1)
    }).pipe(Effect.provide(Visualizer.Test))
  )

  it.effect("renders nested overlapping highlights instead of dropping overlaps", () =>
    Effect.gen(function* () {
      const visualizer = yield* Visualizer
      const html = yield* visualizer.visualize(
        new AnnotatedDocument({
          text: "Alice visited Paris.",
          extractions: [
            new Extraction({
              extractionClass: "person",
              extractionText: "Alice",
              alignmentStatus: "match_exact",
              charInterval: new CharInterval({ startPos: 0, endPos: 5 })
            }),
            new Extraction({
              extractionClass: "action",
              extractionText: "Alice visited",
              alignmentStatus: "match_exact",
              charInterval: new CharInterval({ startPos: 0, endPos: 13 })
            })
          ]
        })
      )

      expect(countMarks(html)).toBe(2)
      expect(html).toContain("data-idx=\"0\"")
      expect(html).toContain("data-idx=\"1\"")
    }).pipe(Effect.provide(Visualizer.Test))
  )

  it.effect("assigns deterministic class colors and legend order", () =>
    Effect.gen(function* () {
      const visualizer = yield* Visualizer

      const firstOrder = yield* visualizer.visualize(
        new AnnotatedDocument({
          text: "Alice met Bob in Paris.",
          extractions: [
            new Extraction({
              extractionClass: "person",
              extractionText: "Alice",
              alignmentStatus: "match_exact",
              charInterval: new CharInterval({ startPos: 0, endPos: 5 })
            }),
            new Extraction({
              extractionClass: "location",
              extractionText: "Paris",
              alignmentStatus: "match_exact",
              charInterval: new CharInterval({ startPos: 17, endPos: 22 })
            })
          ]
        })
      )

      const secondOrder = yield* visualizer.visualize(
        new AnnotatedDocument({
          text: "Alice met Bob in Paris.",
          extractions: [
            new Extraction({
              extractionClass: "location",
              extractionText: "Paris",
              alignmentStatus: "match_exact",
              charInterval: new CharInterval({ startPos: 17, endPos: 22 })
            }),
            new Extraction({
              extractionClass: "person",
              extractionText: "Alice",
              alignmentStatus: "match_exact",
              charInterval: new CharInterval({ startPos: 0, endPos: 5 })
            })
          ]
        })
      )

      expect(legendColorMap(firstOrder)).toEqual(legendColorMap(secondOrder))

      const locationPos = firstOrder.indexOf("location (1)")
      const personPos = firstOrder.indexOf("person (1)")
      expect(locationPos).toBeGreaterThan(-1)
      expect(personPos).toBeGreaterThan(-1)
      expect(locationPos).toBeLessThan(personPos)
    }).pipe(Effect.provide(Visualizer.Test))
  )

  it.effect("can hide legend while preserving payload flags", () =>
    Effect.gen(function* () {
      const visualizer = yield* Visualizer
      const html = yield* visualizer.visualize(
        new AnnotatedDocument({ text: "No extractions", extractions: [] }),
        { showLegend: false, animationSpeed: 0.75 }
      )

      expect(html).not.toContain("<ul class=\"lx-legend\"")
      expect(html).toContain('"showLegend":false')
      expect(html).toContain('"animationSpeed":0.75')
    }).pipe(Effect.provide(Visualizer.Test))
  )
})
