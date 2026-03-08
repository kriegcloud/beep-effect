import { describe, expect, it } from "@effect/vitest"
import { toTurnFailureCode } from "../src/turn/TurnFailureMapping.js"

describe("TurnFailureMapping", () => {
  it("maps checkpoint tool replay failures to tool_execution_error", () => {
    const code = toTurnFailureCode(
      {
        _tag: "TurnModelFailure",
        reason: "checkpoint_tool_replay_failed:shell_execute"
      },
      "fallback"
    )
    expect(code).toBe("tool_execution_error")
  })

  it("maps consumed-transition failures to checkpoint_transition_failed", () => {
    const code = toTurnFailureCode(
      {
        _tag: "TurnModelFailure",
        reason: "checkpoint_consumed_transition_failed:Consumed"
      },
      "fallback"
    )
    expect(code).toBe("checkpoint_transition_failed")
  })

  it("maps unknown_tool_definition to unknown_tool_definition", () => {
    const code = toTurnFailureCode(
      { reason: "unknown_tool_definition" },
      "fallback"
    )
    expect(code).toBe("unknown_tool_definition")
  })
})
