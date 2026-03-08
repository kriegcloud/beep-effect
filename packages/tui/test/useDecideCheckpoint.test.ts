import { Effect, Stream } from "effect"
import { AtomRegistry } from "effect/unstable/reactivity"
import { describe, expect, it } from "vitest"
import { connectionStatusAtom, isStreamingAtom, messagesAtom } from "../src/atoms/session.js"
import { runCheckpointDecision } from "../src/hooks/useDecideCheckpoint.js"
import type { ChatMessage } from "../src/types.js"

const checkpointMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  role: "assistant",
  content: "",
  turnId: "turn:checkpoint",
  status: "checkpoint_required",
  checkpointId: "checkpoint:test",
  checkpointAction: "InvokeTool",
  checkpointReason: "approval required",
  ...overrides
})

describe("useDecideCheckpoint", () => {
  it("ack Rejected updates message state and leaves connection connected", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () => Effect.succeed({ kind: "ack" as const })
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Rejected")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("checkpoint_rejected")
    expect(registry.get(connectionStatusAtom)).toBe("connected")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })

  it("ack Deferred updates message state and leaves connection connected", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () => Effect.succeed({ kind: "ack" as const })
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Deferred")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("checkpoint_deferred")
    expect(registry.get(connectionStatusAtom)).toBe("connected")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })

  it("stream success dispatches events and ends connected", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () =>
        Effect.succeed({
          kind: "stream" as const,
          stream: Stream.make(
            {
              type: "turn.started" as const,
              sequence: 1,
              turnId: "turn:replay",
              sessionId: "session:test",
              createdAt: new Date().toISOString()
            },
            {
              type: "assistant.delta" as const,
              sequence: 2,
              turnId: "turn:replay",
              sessionId: "session:test",
              delta: "done"
            },
            {
              type: "turn.completed" as const,
              sequence: 3,
              turnId: "turn:replay",
              sessionId: "session:test",
              accepted: true,
              auditReasonCode: "turn_processing_accepted",
              iterationsUsed: 1,
              toolCallsTotal: 0,
              modelFinishReason: "stop",
              modelUsageJson: "{}"
            }
          )
        })
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Approved")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("complete")
    expect(last?.content).toContain("done")
    expect(registry.get(connectionStatusAtom)).toBe("connected")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })

  it("stream failure after turn.started marks latest streaming message failed", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () =>
        Effect.succeed({
          kind: "stream" as const,
          stream: Stream.concat(
            Stream.make({
              type: "turn.started" as const,
              sequence: 1,
              turnId: "turn:replay",
              sessionId: "session:test",
              createdAt: new Date().toISOString()
            }),
            Stream.fail(new Error("checkpoint_transition_failed:Consumed"))
          )
        })
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Approved")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("failed")
    expect(last?.errorMessage).toContain("could not be finalized")
    expect(registry.get(connectionStatusAtom)).toBe("error")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })

  it("connection error path marks checkpoint message failed", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () => Effect.fail("checkpoint_payload_invalid")
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Approved")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("failed")
    expect(last?.errorMessage).toContain("invalid or stale")
    expect(registry.get(connectionStatusAtom)).toBe("error")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })

  it("connection error with { errorCode, message } uses mapped checkpoint messaging", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () =>
        Effect.fail({
          errorCode: "checkpoint_payload_mismatch",
          message: "payload hash mismatch"
        })
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Approved")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("failed")
    expect(last?.errorMessage).toContain("checkpoint_payload_mismatch")
    expect(last?.errorMessage).toContain("payload hash mismatch")
    expect(registry.get(connectionStatusAtom)).toBe("error")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })

  it("connection error with { reason } maps to actionable checkpoint text", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () =>
        Effect.fail({
          reason: "checkpoint_payload_invalid"
        })
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Approved")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("failed")
    expect(last?.errorMessage).toContain("invalid or stale")
    expect(registry.get(connectionStatusAtom)).toBe("error")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })

  it("stream failure before turn.started still marks checkpoint message failed", async () => {
    const registry = AtomRegistry.make()
    registry.set(messagesAtom, [checkpointMessage()])
    registry.set(connectionStatusAtom, "disconnected")

    const client = {
      decideCheckpoint: () =>
        Effect.succeed({
          kind: "stream" as const,
          stream: Stream.fail({
            reason: "checkpoint_payload_invalid"
          })
        })
    } as any

    await Effect.runPromise(
      runCheckpointDecision(registry, client, "checkpoint:test", "Approved")
    )

    const last = registry.get(messagesAtom).at(-1)
    expect(last?.status).toBe("failed")
    expect(last?.errorMessage).toContain("invalid or stale")
    expect(registry.get(connectionStatusAtom)).toBe("error")
    expect(registry.get(isStreamingAtom)).toBe(false)
  })
})
