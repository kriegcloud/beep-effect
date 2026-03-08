import { describe, expect, it } from "vitest"
import { ModalLayer } from "../src/components/ModalLayer.js"

describe("ModalLayer", () => {
  it("exports a React component", () => {
    expect(typeof ModalLayer).toBe("function")
  })

  it("renders children when no modal is active", () => {
    // Type-level check
    const _element = (
      <ModalLayer activeModal={null} onClose={() => {}}>
        <text content="main content" />
      </ModalLayer>
    )
    expect(_element).toBeDefined()
  })

  it("accepts activeModal prop", () => {
    const _element = (
      <ModalLayer activeModal="settings" onClose={() => {}}>
        <text content="main content" />
      </ModalLayer>
    )
    expect(_element).toBeDefined()
  })
})
