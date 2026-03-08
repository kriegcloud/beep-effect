import { AtomRegistry } from "effect/unstable/reactivity"
import { describe, expect, it } from "vitest"
import { messagesAtom, toolEventsAtom } from "../src/atoms/session.js"
import { _test } from "../src/hooks/useSendMessage.js"
import { dispatchTurnStreamEvent } from "../src/state/turnStream.js"

describe("dispatchEvent", () => {
  function makeRegistry() {
    return AtomRegistry.make()
  }

  it("turn.started appends empty streaming assistant message", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)

    const msgs = registry.get(messagesAtom)
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toMatchObject({
      role: "assistant",
      content: "",
      turnId: "t1",
      status: "streaming"
    })
  })

  it("assistant.delta appends text to last message", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "assistant.delta",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      delta: "Hello"
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "assistant.delta",
      sequence: 2,
      turnId: "t1",
      sessionId: "s1",
      delta: " world"
    } as any)

    const msgs = registry.get(messagesAtom)
    expect(msgs[0]!.content).toBe("Hello world")
  })

  it("assistant.delta creates a streaming assistant message when turn.started is missing", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "assistant.delta",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      delta: "Hello"
    } as any)

    const msgs = registry.get(messagesAtom)
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toMatchObject({
      role: "assistant",
      turnId: "t1",
      content: "Hello",
      status: "streaming"
    })
  })

  it("turn.completed marks last message complete", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "turn.completed",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      accepted: true,
      auditReasonCode: "",
      modelFinishReason: null,
      modelUsageJson: null
    } as any)

    expect(registry.get(messagesAtom)[0]!.status).toBe("complete")
  })

  it("turn.completed only updates the matching turn", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 1,
      turnId: "t2",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "turn.completed",
      sequence: 2,
      turnId: "t1",
      sessionId: "s1",
      accepted: true,
      auditReasonCode: "turn_processing_accepted",
      modelFinishReason: null,
      modelUsageJson: null
    } as any)

    const msgs = registry.get(messagesAtom)
    const first = msgs.find((msg) => msg.turnId === "t1")
    const second = msgs.find((msg) => msg.turnId === "t2")
    expect(first?.status).toBe("complete")
    expect(second?.status).toBe("streaming")
  })

  it("checkpoint_required is preserved on terminal completed checkpoint event", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "turn.checkpoint_required",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      checkpointId: "cp-1",
      action: "InvokeTool",
      reason: "approval needed"
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "turn.completed",
      sequence: 2,
      turnId: "t1",
      sessionId: "s1",
      accepted: false,
      auditReasonCode: "turn_processing_checkpoint_required",
      iterationsUsed: 0,
      toolCallsTotal: 0,
      modelFinishReason: null,
      modelUsageJson: null
    } as any)

    const last = registry.get(messagesAtom)[0]!
    expect(last.status).toBe("checkpoint_required")
    expect(last.checkpointId).toBe("cp-1")
  })

  it("turn.failed marks last message with error", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "turn.failed",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      errorCode: "PROVIDER_ERROR",
      message: "Rate limited"
    } as any)

    const last = registry.get(messagesAtom)[0]!
    expect(last.status).toBe("failed")
    expect(last.errorMessage).toBe("PROVIDER_ERROR: Rate limited")
  })

  it("maps checkpoint_payload_invalid failures to actionable UI text", () => {
    expect(_test.toFailureDisplayMessage("checkpoint_payload_invalid", "raw")).toContain(
      "Checkpoint payload is invalid or stale"
    )
  })

  it("maps checkpoint_transition_failed failures to actionable UI text", () => {
    expect(_test.toFailureDisplayMessage("checkpoint_transition_failed", "raw")).toContain(
      "replay could not be finalized"
    )
  })

  it("tool.call appends tool event", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "tool.call",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      toolCallId: "tc1",
      toolName: "search",
      inputJson: "{}"
    } as any)

    const tools = registry.get(toolEventsAtom)
    expect(tools).toHaveLength(1)
    expect(tools[0]).toMatchObject({
      turnId: "t1",
      toolCallId: "tc1",
      toolName: "search",
      status: "called"
    })
  })

  it("turn.checkpoint_required stores action and reason", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "turn.checkpoint_required",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      checkpointId: "cp-1",
      action: "shell_execute",
      reason: "Running rm -rf /"
    } as any)

    const last = registry.get(messagesAtom)[0]!
    expect(last.status).toBe("checkpoint_required")
    expect(last.checkpointId).toBe("cp-1")
    expect(last.checkpointAction).toBe("shell_execute")
    expect(last.checkpointReason).toBe("Running rm -rf /")
  })

  it("turn.checkpoint_required creates a checkpoint message when turn.started is missing", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.checkpoint_required",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      checkpointId: "cp-1",
      action: "shell_execute",
      reason: "approval required"
    } as any)

    const last = registry.get(messagesAtom)[0]!
    expect(last.status).toBe("checkpoint_required")
    expect(last.checkpointId).toBe("cp-1")
    expect(last.checkpointAction).toBe("shell_execute")
    expect(last.checkpointReason).toBe("approval required")
  })

  it("tool.result updates matching tool event", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "tool.call",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      toolCallId: "tc1",
      toolName: "search",
      inputJson: "{}"
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "tool.result",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      toolCallId: "tc1",
      toolName: "search",
      outputJson: "{\"result\": \"found\"}",
      isError: false
    } as any)

    const tools = registry.get(toolEventsAtom)
    expect(tools[0]).toMatchObject({
      status: "completed",
      outputJson: "{\"result\": \"found\"}",
      isError: false,
      inputJson: "{}"
    })
  })

  it("tool.error updates matching tool event as failed output", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "tool.call",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      toolCallId: "tc1",
      toolName: "search",
      inputJson: "{}"
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "tool.error",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      toolCallId: "tc1",
      toolName: "search",
      outputJson: "{\"error\": \"boom\"}"
    } as any)

    const tools = registry.get(toolEventsAtom)
    expect(tools[0]).toMatchObject({
      status: "completed",
      outputJson: "{\"error\": \"boom\"}",
      isError: true,
      inputJson: "{}"
    })
  })

  it("iteration.completed stores latest iteration summary on the assistant message", () => {
    const registry = makeRegistry()
    dispatchTurnStreamEvent(registry, {
      type: "turn.started",
      sequence: 0,
      turnId: "t1",
      sessionId: "s1",
      createdAt: new Date().toISOString()
    } as any)
    dispatchTurnStreamEvent(registry, {
      type: "iteration.completed",
      sequence: 1,
      turnId: "t1",
      sessionId: "s1",
      iteration: 2,
      finishReason: "stop",
      toolCallsThisIteration: 1,
      toolCallsTotal: 3
    } as any)

    const message = registry.get(messagesAtom)[0]!
    expect(message.iteration).toBe(2)
    expect(message.iterationFinishReason).toBe("stop")
    expect(message.toolCallsThisIteration).toBe(1)
    expect(message.toolCallsTotal).toBe(3)
  })
})
