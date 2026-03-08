import { describe, expect, it } from "@effect/vitest"
import {
  classifyTurnFailureText,
  toTurnFailureCodeFromUnknown,
  toTurnFailureDisplayMessage
} from "../src/turnFailure.js"

describe("classifyTurnFailureText", () => {
  it("classifies unknown_tool_definition", () => {
    expect(classifyTurnFailureText("unknown_tool_definition")).toBe("unknown_tool_definition")
  })

  it("classifies unknown_tool_definition with surrounding text", () => {
    expect(classifyTurnFailureText("Deny: unknown_tool_definition for tool X")).toBe(
      "unknown_tool_definition"
    )
  })

  it("classifies unknown_tool_definition with case/whitespace normalization", () => {
    expect(classifyTurnFailureText("  UNKNOWN_TOOL_DEFINITION  ")).toBe("unknown_tool_definition")
  })

  it("classifies policy_denied", () => {
    expect(classifyTurnFailureText("policy_denied")).toBe("policy_denied")
  })

  it("falls back to turn_processing_error for unrelated text", () => {
    expect(classifyTurnFailureText("something completely different")).toBe("turn_processing_error")
  })
})

describe("toTurnFailureCodeFromUnknown", () => {
  it("extracts unknown_tool_definition from reason field", () => {
    const code = toTurnFailureCodeFromUnknown(
      { reason: "unknown_tool_definition" },
      "fallback"
    )
    expect(code).toBe("unknown_tool_definition")
  })

  it("extracts unknown_tool_definition from errorCode field", () => {
    const code = toTurnFailureCodeFromUnknown(
      { errorCode: "unknown_tool_definition" },
      "fallback"
    )
    expect(code).toBe("unknown_tool_definition")
  })

  it("falls back to turn_processing_error for unrelated errors", () => {
    const code = toTurnFailureCodeFromUnknown(
      { reason: "some random error" },
      "also random"
    )
    expect(code).toBe("turn_processing_error")
  })
})

describe("toTurnFailureDisplayMessage", () => {
  it("returns dedicated message for unknown_tool_definition", () => {
    const msg = toTurnFailureDisplayMessage("unknown_tool_definition", "some details")
    expect(msg).toContain("unknown_tool_definition")
    expect(msg).toContain("ToolCatalog")
  })

  it("returns generic format for unhandled codes", () => {
    const msg = toTurnFailureDisplayMessage("turn_processing_error", "oops")
    expect(msg).toBe("turn_processing_error: oops")
  })
})
