import { AtomRegistry } from "effect/unstable/reactivity"
import { describe, expect, it } from "vitest"
import { messagesAtom, pendingCheckpointAtom } from "../src/atoms/session.js"
import type { ChatMessage } from "../src/types.js"

describe("pendingCheckpointAtom", () => {
  function makeRegistry() {
    return AtomRegistry.make()
  }

  it("returns null when no messages", () => {
    const registry = makeRegistry()
    expect(registry.get(pendingCheckpointAtom)).toBeNull()
  })

  it("returns null when last message is complete", () => {
    const registry = makeRegistry()
    const msg: ChatMessage = {
      role: "assistant",
      content: "Hello",
      turnId: "t1",
      status: "complete"
    }
    registry.set(messagesAtom, [msg])
    expect(registry.get(pendingCheckpointAtom)).toBeNull()
  })

  it("returns null when last message is streaming", () => {
    const registry = makeRegistry()
    const msg: ChatMessage = {
      role: "assistant",
      content: "",
      turnId: "t1",
      status: "streaming"
    }
    registry.set(messagesAtom, [msg])
    expect(registry.get(pendingCheckpointAtom)).toBeNull()
  })

  it("returns checkpoint info when last message is checkpoint_required", () => {
    const registry = makeRegistry()
    const msg: ChatMessage = {
      role: "assistant",
      content: "Let me run that command",
      turnId: "t1",
      status: "checkpoint_required",
      checkpointId: "cp-42",
      checkpointAction: "InvokeTool",
      checkpointReason: "Destructive operation detected"
    }
    registry.set(messagesAtom, [msg])

    expect(registry.get(pendingCheckpointAtom)).toEqual({
      checkpointId: "cp-42",
      action: "InvokeTool",
      reason: "Destructive operation detected"
    })
  })

  it("returns null when checkpoint_required but no checkpointId", () => {
    const registry = makeRegistry()
    const msg: ChatMessage = {
      role: "assistant",
      content: "",
      turnId: "t1",
      status: "checkpoint_required"
    }
    registry.set(messagesAtom, [msg])
    expect(registry.get(pendingCheckpointAtom)).toBeNull()
  })

  it("returns null when checkpoint_required but action is missing", () => {
    const registry = makeRegistry()
    const msg: ChatMessage = {
      role: "assistant",
      content: "",
      turnId: "t1",
      status: "checkpoint_required",
      checkpointId: "cp-99"
    }
    registry.set(messagesAtom, [msg])
    expect(registry.get(pendingCheckpointAtom)).toBeNull()
  })
})
