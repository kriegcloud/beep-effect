import { RegistryContext } from "@effect/atom-react"
import type { ChatClient } from "@template/client/ChatClient"
import {
  toTurnFailureCodeFromUnknown,
  toTurnFailureDisplayMessage,
  toTurnFailureMessageFromUnknown
} from "@template/domain/turnFailure"
import type { ServiceMap } from "effect"
import { Effect, Stream } from "effect"
import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry"
import * as React from "react"
import {
  channelIdAtom,
  connectionStatusAtom,
  inputHistoryAtom,
  isStreamingAtom,
  messagesAtom
} from "../atoms/session.js"
import { dispatchTurnStreamEvent, markLatestStreamingMessageFailed } from "../state/turnStream.js"
import type { ChatMessage } from "../types.js"

type ChatClientShape = ServiceMap.Service.Shape<typeof ChatClient>

const toFailureDisplayMessage = toTurnFailureDisplayMessage

export function useSendMessage(client: ChatClientShape) {
  const registry: AtomRegistry.AtomRegistry = React.useContext(RegistryContext)

  return React.useCallback(
    (content: string) => {
      const chId = registry.get(channelIdAtom)
      if (!chId || !content.trim()) return

      // Append user message immediately
      const turnId = `turn:${crypto.randomUUID()}`
      const userMsg: ChatMessage = {
        role: "user",
        content,
        turnId,
        status: "complete"
      }
      registry.update(messagesAtom, (msgs) => [...msgs, userMsg])
      registry.update(inputHistoryAtom, (history) => [...history, content])
      registry.set(isStreamingAtom, true)
      registry.set(connectionStatusAtom, "connecting")

      const program = Effect.gen(function*() {
        const eventStream = yield* client.sendMessage(chId, content)
        yield* eventStream.pipe(
          Stream.tap((event) => Effect.sync(() => dispatchTurnStreamEvent(registry, event))),
          Stream.runDrain
        )
      }).pipe(
        Effect.scoped,
        Effect.catch((error) =>
          Effect.sync(() => {
            const message = toTurnFailureMessageFromUnknown(error, "Turn processing failed unexpectedly")
            const errorCode = toTurnFailureCodeFromUnknown(error, message)
            markLatestStreamingMessageFailed(registry, toFailureDisplayMessage(errorCode, message))
            registry.set(connectionStatusAtom, "error")
          })
        ),
        Effect.ensuring(
          Effect.sync(() => {
            registry.set(isStreamingAtom, false)
            registry.update(connectionStatusAtom, (status) =>
              status === "error" ? status : "connected")
          })
        )
      )

      Effect.runFork(program)
    },
    [registry, client]
  )
}

/** @internal — exported for testing */
export const _test = {
  toFailureDisplayMessage
}
