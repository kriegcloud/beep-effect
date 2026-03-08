import { RegistryContext } from "@effect/atom-react"
import { CheckpointDecisionError, type ChatClient } from "@template/client/ChatClient"
import {
  toTurnFailureCodeFromUnknown,
  toTurnFailureDisplayMessage,
  toTurnFailureMessageFromUnknown
} from "@template/domain/turnFailure"
import type { ServiceMap } from "effect"
import { Effect, Stream } from "effect"
import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry"
import * as React from "react"
import { connectionStatusAtom, isStreamingAtom, messagesAtom } from "../atoms/session.js"
import {
  applyCheckpointDecisionAck,
  dispatchTurnStreamEvent,
  markLatestCheckpointOrStreamingMessageFailed
} from "../state/turnStream.js"
import type { CheckpointDecision } from "../types.js"

type ChatClientShape = ServiceMap.Service.Shape<typeof ChatClient>

const toDecisionErrorMessage = (error: unknown): string => {
  if (error instanceof CheckpointDecisionError) {
    if (error.errorCode !== null) {
      return toTurnFailureDisplayMessage(error.errorCode, error.message)
    }
    return error.message
  }
  const message = toTurnFailureMessageFromUnknown(error, "Checkpoint decision failed")
  const errorCode = toTurnFailureCodeFromUnknown(error, message)
  return toTurnFailureDisplayMessage(errorCode, message)
}

export const runCheckpointDecision = (
  registry: AtomRegistry.AtomRegistry,
  client: ChatClientShape,
  checkpointId: string,
  decision: CheckpointDecision
) =>
  Effect.gen(function*() {
    registry.set(isStreamingAtom, true)
    registry.set(connectionStatusAtom, "connecting")

    const result = yield* client.decideCheckpoint(checkpointId, decision)

    if (result.kind === "stream") {
      yield* result.stream.pipe(
        Stream.tap((event) => Effect.sync(() => dispatchTurnStreamEvent(registry, event))),
        Stream.runDrain
      )
    } else if (decision !== "Approved") {
      applyCheckpointDecisionAck(registry, decision)
    } else {
      registry.update(messagesAtom, (msgs) => {
        if (msgs.length === 0) return msgs
        const last = msgs[msgs.length - 1]!
        if (last.status !== "checkpoint_required") return msgs
        return [...msgs.slice(0, -1), { ...last, status: "complete" as const }]
      })
    }

    registry.set(connectionStatusAtom, "connected")
  }).pipe(
    Effect.scoped,
    Effect.catch((error) =>
      Effect.sync(() => {
        markLatestCheckpointOrStreamingMessageFailed(registry, toDecisionErrorMessage(error))
        registry.set(connectionStatusAtom, "error")
      })
    ),
    Effect.ensuring(Effect.sync(() => registry.set(isStreamingAtom, false)))
  )

export function useDecideCheckpoint(client: ChatClientShape) {
  const registry: AtomRegistry.AtomRegistry = React.useContext(RegistryContext)

  return React.useCallback(
    (checkpointId: string, decision: CheckpointDecision) => {
      Effect.runFork(
        runCheckpointDecision(registry, client, checkpointId, decision)
      )
    },
    [registry, client]
  )
}

/** @internal — exported for testing */
export const _test = {
  toDecisionErrorMessage
}
