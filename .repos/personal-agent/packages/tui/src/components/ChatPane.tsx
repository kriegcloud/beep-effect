// packages/tui/src/components/ChatPane.tsx
import { useAtomValue } from "@effect/atom-react"
import { messagesAtom, toolEventsAtom } from "../atoms/session.js"
import { useTheme } from "../hooks/useTheme.js"
import type { ToolEvent } from "../types.js"
import { MessageBubble } from "./MessageBubble.js"
import { ToolCallInline } from "./ToolCallInline.js"

const groupToolsByTurn = (tools: ReadonlyArray<ToolEvent>): Map<string, ReadonlyArray<ToolEvent>> => {
  const grouped = new Map<string, Array<ToolEvent>>()
  for (const tool of tools) {
    const existing = grouped.get(tool.turnId)
    if (existing) {
      existing.push(tool)
    } else {
      grouped.set(tool.turnId, [tool])
    }
  }
  return grouped
}

export function ChatPane() {
  const theme = useTheme()
  const messages = useAtomValue(messagesAtom)
  const toolEvents = useAtomValue(toolEventsAtom)
  const toolsByTurn = groupToolsByTurn(toolEvents)

  return (
    <box
      flexDirection="column"
      flexGrow={4}
      flexBasis={0}
      border={["top", "bottom", "left"]}
      borderStyle="single"
      borderColor={theme.border}
      padding={1}
    >
      <scrollbox flexGrow={1} stickyScroll={true} stickyStart="bottom">
        {messages.length === 0 ? (
          <text content="No messages yet. Type below to start." fg={theme.textMuted} />
        ) : (
          messages.map((msg, i) => {
            const turnTools = msg.role === "assistant" ? (toolsByTurn.get(msg.turnId) ?? []) : []
            return (
              <box key={`${msg.turnId}-${i}`} flexDirection="column" marginTop={i > 0 ? 1 : 0}>
                <MessageBubble message={msg} />
                {turnTools.length > 0 ? <ToolCallInline tools={turnTools} /> : null}
              </box>
            )
          })
        )}
      </scrollbox>
    </box>
  )
}
