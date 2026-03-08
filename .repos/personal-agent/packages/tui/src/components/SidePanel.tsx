import { useAtomValue } from "@effect/atom-react"
import {
  channelIdAtom,
  connectionStatusAtom,
  messageCountAtom,
  toolEventsAtom
} from "../atoms/session.js"
import { connectionDot } from "../formatters/connectionDot.js"
import { useTheme } from "../hooks/useTheme.js"
import { ContextBar } from "./ContextBar.js"

export function SidePanel({ compact = false }: { readonly compact?: boolean }) {
  const theme = useTheme()
  const channelId = useAtomValue(channelIdAtom)
  const status = useAtomValue(connectionStatusAtom)
  const msgCount = useAtomValue(messageCountAtom)
  const toolEvents = useAtomValue(toolEventsAtom)
  const { dot, color: dotColor } = connectionDot(status, theme)
  const shortId = channelId.startsWith("channel:") ? channelId.slice(8, 16) : channelId.slice(0, 8)

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      flexBasis={0}
      maxWidth={compact ? "25%" : "20%"}
      border={["top", "left", "bottom"]}
      borderStyle="single"
      borderColor={theme.border}
      paddingLeft={1}
      paddingRight={1}
    >
      {/* Session */}
      <text content=" Session" fg={theme.accent} />
      <text content={`  ${shortId}`} fg={theme.textMuted} />
      <text content={`  ${dot} ${status}`} fg={dotColor} />
      <text content={`  ${msgCount} msgs`} fg={theme.textMuted} />

      {/* Tools */}
      <box marginTop={1} flexDirection="column" flexGrow={1}>
        <text content=" Tools" fg={theme.accent} />
        {toolEvents.length === 0 ? (
          <text content="  (none)" fg={theme.textMuted} />
        ) : (
          <scrollbox flexGrow={1} stickyScroll={true} stickyStart="bottom">
            {toolEvents.map((tool) => (
              <text
                key={tool.toolCallId}
                content={`  ${tool.status === "called" ? "\u23F3" : tool.isError ? "\u274C" : "\u2713"} ${tool.toolName}`}
                fg={tool.isError ? theme.error : tool.status === "called" ? theme.streaming : theme.statusConnected}
              />
            ))}
          </scrollbox>
        )}
      </box>

      {/* Context */}
      {!compact && (
        <box marginTop={1} flexDirection="column">
          <ContextBar />
        </box>
      )}
    </box>
  )
}
