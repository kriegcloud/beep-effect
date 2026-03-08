import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry"
import { messagesAtom, toolEventsAtom } from "../atoms/session.js"
import type { ChatMessage, ToolEvent } from "../types.js"

export interface RestoredHistory {
  readonly messages: ReadonlyArray<ChatMessage>
  readonly toolEvents: ReadonlyArray<ToolEvent>
}

interface RawContentBlock {
  readonly contentBlockType?: string
  readonly text?: string
  readonly toolCallId?: string
  readonly toolName?: string
  readonly inputJson?: string
  readonly outputJson?: string
  readonly isError?: boolean
}

const getContentBlocks = (entry: Record<string, unknown>): ReadonlyArray<RawContentBlock> => {
  const message = entry.message as Record<string, unknown> | undefined
  if (message === undefined || message === null) return []
  const blocks = message.contentBlocks ?? message.content_blocks
  return Array.isArray(blocks) ? (blocks as ReadonlyArray<RawContentBlock>) : []
}

const getTextContent = (entry: Record<string, unknown>): string => {
  const blocks = getContentBlocks(entry)
  const textParts: Array<string> = []
  for (const block of blocks) {
    if (block.contentBlockType === "TextBlock" && typeof block.text === "string") {
      textParts.push(block.text)
    }
  }
  if (textParts.length > 0) return textParts.join("\n")

  const message = entry.message as Record<string, unknown> | undefined
  if (message !== undefined && message !== null) {
    const content = message.content
    if (typeof content === "string") return content
  }

  const fallback = entry.message_content
  if (typeof fallback === "string") return fallback

  return ""
}

export const restoreHistory = (raw: unknown): RestoredHistory => {
  if (!Array.isArray(raw)) {
    return { messages: [], toolEvents: [] }
  }

  const messages: Array<ChatMessage> = []
  const toolEventMap = new Map<string, ToolEvent>()
  const toolEventOrder: Array<string> = []

  for (const entry of raw as Array<Record<string, unknown>>) {
    const participantRole = String(entry?.participantRole ?? "")
    const turnId = String(entry?.turnId ?? entry?.turn_id ?? "")

    if (turnId.length === 0) continue

    const blocks = getContentBlocks(entry)

    if (participantRole === "UserRole") {
      messages.push({
        role: "user",
        content: getTextContent(entry),
        turnId,
        status: "complete"
      })
      continue
    }

    if (participantRole === "AssistantRole") {
      messages.push({
        role: "assistant",
        content: getTextContent(entry),
        turnId,
        status: "complete"
      })

      for (const block of blocks) {
        if (
          block.contentBlockType === "ToolUseBlock"
          && typeof block.toolCallId === "string"
          && typeof block.toolName === "string"
        ) {
          const toolCallId = block.toolCallId
          if (!toolEventMap.has(toolCallId)) {
            toolEventOrder.push(toolCallId)
          }
          toolEventMap.set(toolCallId, {
            turnId,
            toolCallId,
            toolName: block.toolName,
            inputJson: typeof block.inputJson === "string" ? block.inputJson : "",
            outputJson: null,
            isError: false,
            status: "called"
          })
        }
      }
      continue
    }

    if (participantRole === "ToolRole") {
      for (const block of blocks) {
        if (
          block.contentBlockType === "ToolResultBlock"
          && typeof block.toolCallId === "string"
        ) {
          const toolCallId = block.toolCallId
          const existing = toolEventMap.get(toolCallId)
          const toolEvent: ToolEvent = {
            turnId: existing?.turnId ?? turnId,
            toolCallId,
            toolName: existing?.toolName ?? (typeof block.toolName === "string" ? block.toolName : "unknown"),
            inputJson: existing?.inputJson ?? "",
            outputJson: typeof block.outputJson === "string" ? block.outputJson : null,
            isError: block.isError === true,
            status: "completed"
          }
          if (!toolEventMap.has(toolCallId)) {
            toolEventOrder.push(toolCallId)
          }
          toolEventMap.set(toolCallId, toolEvent)
        }
      }
      // ToolRole does NOT produce a ChatMessage
      continue
    }
  }

  const toolEvents = toolEventOrder
    .map((id) => toolEventMap.get(id))
    .filter((event): event is ToolEvent => event !== undefined)

  return { messages, toolEvents }
}

export const applyRestoredHistory = (
  registry: AtomRegistry.AtomRegistry,
  history: RestoredHistory
): void => {
  registry.set(messagesAtom, history.messages)
  registry.set(toolEventsAtom, history.toolEvents)
}
