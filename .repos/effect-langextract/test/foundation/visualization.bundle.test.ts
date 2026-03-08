import { describe, expect, it } from "@effect/vitest"

import {
  FRONTEND_BUNDLE,
  FRONTEND_BUNDLE_BYTES
} from "../../src/visualization/frontendBundle.generated.js"

describe("visualization frontend bundle", () => {
  it("stays within the inline bundle budget", () => {
    expect(FRONTEND_BUNDLE_BYTES).toBeLessThanOrEqual(300 * 1024)
  })

  it("contains bootstrap wiring", () => {
    expect(FRONTEND_BUNDLE).toContain("__effectLangExtractVisualizationBootstrap")
  })
})
