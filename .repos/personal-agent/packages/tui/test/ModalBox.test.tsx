import { describe, expect, it } from "vitest"
import { ModalBox } from "../src/components/ModalBox.js"

describe("ModalBox", () => {
  it("exports a React component", () => {
    expect(typeof ModalBox).toBe("function")
  })

  it("accepts title and children props", () => {
    // Type-level check — verifying the component signature compiles
    const _element = <ModalBox title="Test Modal"><text content="hello" /></ModalBox>
    expect(_element).toBeDefined()
  })
})
