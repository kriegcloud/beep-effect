import type { TurnStreamEvent } from "@template/domain/events"
import { toTurnFailureDisplayMessage } from "@template/domain/turnFailure"
import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry"
import { messagesAtom, toolEventsAtom } from "../atoms/session.js"
import type { ChatMessage, CheckpointDecision, ToolEvent } from "../types.js"

const findAssistantMessageIndex = (messages: ReadonlyArray<ChatMessage>, turnId: string): number => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const candidate = messages[i]
    if (candidate?.role === "assistant" && candidate.turnId === turnId) {
      return i
    }
  }
  return -1
}

const updateAssistantMessageByTurn = (
  messages: ReadonlyArray<ChatMessage>,
  turnId: string,
  map: (message: ChatMessage) => ChatMessage
): ReadonlyArray<ChatMessage> => {
  const index = findAssistantMessageIndex(messages, turnId)
  if (index < 0) {
    return messages
  }

  const next = [...messages]
  next[index] = map(next[index]!)
  return next
}

const updateOrAppendToolEvent = (
  events: ReadonlyArray<ToolEvent>,
  event: ToolEvent
): ReadonlyArray<ToolEvent> => {
  const index = events.findIndex((existing) => existing.toolCallId === event.toolCallId)
  if (index < 0) {
    return [...events, event]
  }

  const previous = events[index]!
  const next = [...events]
  next[index] = {
    ...previous,
    ...event,
    inputJson: event.inputJson || previous.inputJson
  }
  return next
}

const markLatestMessageFailed = (
  registry: AtomRegistry.AtomRegistry,
  match: (message: ChatMessage) => boolean,
  errorMessage: string
): void => {
  registry.update(messagesAtom, (messages) => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const candidate = messages[i]
      if (!candidate || !match(candidate)) {
        continue
      }

      const next = [...messages]
      next[i] = {
        ...candidate,
        status: "failed" as const,
        errorMessage
      }
      return next
    }

    return messages
  })
}

export function markLatestStreamingMessageFailed(
  registry: AtomRegistry.AtomRegistry,
  errorMessage: string
): void {
  markLatestMessageFailed(registry, (message) => message.status === "streaming", errorMessage)
}

export function markLatestCheckpointOrStreamingMessageFailed(
  registry: AtomRegistry.AtomRegistry,
  errorMessage: string
): void {
  markLatestMessageFailed(
    registry,
    (message) => message.status === "checkpoint_required" || message.status === "streaming",
    errorMessage
  )
}

export function applyCheckpointDecisionAck(
  registry: AtomRegistry.AtomRegistry,
  decision: Exclude<CheckpointDecision, "Approved">
): void {
  registry.update(messagesAtom, (messages) => {
    if (messages.length === 0) return messages

    const last = messages[messages.length - 1]
    if (!last || last.status !== "checkpoint_required") {
      return messages
    }

    if (decision === "Rejected") {
      return [...messages.slice(0, -1), { ...last, status: "checkpoint_rejected" as const }]
    }

    return [...messages.slice(0, -1), { ...last, status: "checkpoint_deferred" as const }]
  })
}

export function dispatchTurnStreamEvent(
  registry: AtomRegistry.AtomRegistry,
  event: TurnStreamEvent
): void {
  switch (event.type) {
    case "turn.started": {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        turnId: event.turnId,
        status: "streaming"
      }
      registry.update(messagesAtom, (messages) => {
        const index = findAssistantMessageIndex(messages, event.turnId)
        return index >= 0 ? messages : [...messages, assistantMessage]
      })
      break
    }
    case "assistant.delta": {
      registry.update(messagesAtom, (messages) => {
        const updated = updateAssistantMessageByTurn(messages, event.turnId, (message) => ({
          ...message,
          content: message.content + event.delta
        }))

        if (updated !== messages) {
          return updated
        }

        // Keep rendering responsive when a delta arrives before turn.started.
        const fallbackMessage: ChatMessage = {
          role: "assistant",
          content: event.delta,
          turnId: event.turnId,
          status: "streaming"
        }
        return [
          ...messages,
          fallbackMessage
        ]
      })
      break
    }
    case "tool.call": {
      const nextToolEvent: ToolEvent = {
        turnId: event.turnId,
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        inputJson: event.inputJson,
        outputJson: null,
        isError: false,
        status: "called"
      }
      registry.update(toolEventsAtom, (events) => updateOrAppendToolEvent(events, nextToolEvent))
      break
    }
    case "tool.result": {
      const nextToolEvent: ToolEvent = {
        turnId: event.turnId,
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        inputJson: "",
        outputJson: event.outputJson,
        isError: event.isError,
        status: "completed"
      }
      registry.update(toolEventsAtom, (events) => updateOrAppendToolEvent(events, nextToolEvent))
      break
    }
    case "tool.error": {
      const nextToolEvent: ToolEvent = {
        turnId: event.turnId,
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        inputJson: "",
        outputJson: event.outputJson,
        isError: true,
        status: "completed"
      }
      registry.update(toolEventsAtom, (events) => updateOrAppendToolEvent(events, nextToolEvent))
      break
    }
    case "iteration.completed": {
      registry.update(messagesAtom, (messages) =>
        updateAssistantMessageByTurn(messages, event.turnId, (message) => ({
          ...message,
          iteration: event.iteration,
          iterationFinishReason: event.finishReason,
          toolCallsThisIteration: event.toolCallsThisIteration,
          toolCallsTotal: event.toolCallsTotal
        })))
      break
    }
    case "turn.checkpoint_required": {
      registry.update(messagesAtom, (messages) => {
        const updated = updateAssistantMessageByTurn(messages, event.turnId, (message) => ({
          ...message,
          status: "checkpoint_required",
          checkpointId: event.checkpointId,
          checkpointAction: event.action,
          checkpointReason: event.reason
        }))

        if (updated !== messages) {
          return updated
        }

        const fallbackMessage: ChatMessage = {
          role: "assistant",
          content: "",
          turnId: event.turnId,
          status: "checkpoint_required",
          checkpointId: event.checkpointId,
          checkpointAction: event.action,
          checkpointReason: event.reason
        }
        return [...messages, fallbackMessage]
      })
      break
    }
    case "turn.completed": {
      registry.update(messagesAtom, (messages) =>
        updateAssistantMessageByTurn(messages, event.turnId, (message) => {
          if (
            message.status === "checkpoint_required"
            && event.accepted === false
            && event.auditReasonCode === "turn_processing_checkpoint_required"
          ) {
            // Preserve pending checkpoint UI even though backend emits a terminal completed event.
            return message
          }
          return { ...message, status: "complete" }
        }))
      break
    }
    case "turn.failed": {
      registry.update(messagesAtom, (messages) => {
        const updated = updateAssistantMessageByTurn(messages, event.turnId, (message) => ({
          ...message,
          status: "failed",
          errorMessage: toTurnFailureDisplayMessage(event.errorCode, event.message)
        }))

        if (updated !== messages) {
          return updated
        }

        const fallbackMessage: ChatMessage = {
          role: "assistant",
          content: "",
          turnId: event.turnId,
          status: "failed",
          errorMessage: toTurnFailureDisplayMessage(event.errorCode, event.message)
        }
        return [
          ...messages,
          fallbackMessage
        ]
      })
      break
    }
  }
}
