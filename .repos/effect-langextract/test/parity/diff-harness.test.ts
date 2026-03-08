import path from "node:path"

import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import {
  findFirstDiffPath,
  runParityHarness
} from "../../scripts/parity/extract-diff-harness.js"

describe("Parity diff harness", () => {
  it("finds nested mismatch paths deterministically", () => {
    const expected = {
      text: "Alice visited Paris.",
      extractions: [
        {
          extractionClass: "event",
          extractionText: "Alice visited Paris"
        }
      ]
    }

    const actual = {
      text: "Alice visited Paris.",
      extractions: [
        {
          extractionClass: "event",
          extractionText: "Alice visited"
        }
      ]
    }

    expect(findFirstDiffPath(expected, actual)).toBe("$.extractions[0].extractionText")
  })

  it.effect("passes parity fixtures against committed baselines", () =>
    Effect.gen(function* () {
      const report = yield* runParityHarness({
        fixturesPath: path.join(process.cwd(), "test/fixtures/parity/cases.json"),
        baselinesPath: path.join(process.cwd(), "test/fixtures/parity/baselines.json"),
        outputDir: path.join(process.cwd(), ".cache/parity/test"),
        writeBaselines: false
      })

      expect(report.cases).toBeGreaterThan(0)
      expect(report.failed).toBe(0)
      expect(report.passed).toBe(report.cases)
    })
  )
})
