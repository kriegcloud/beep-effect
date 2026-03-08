import { useAtomValue } from "@effect/atom-react"
import {
  channelIdAtom,
  connectionStatusAtom,
  messageCountAtom,
  pendingCheckpointAtom
} from "../atoms/session.js"
import { connectionDot } from "../formatters/connectionDot.js"
import { useTheme } from "../hooks/useTheme.js"

export function StatusBar({ compact = false }: { readonly compact?: boolean }) {
  const theme = useTheme()
  const channelId = useAtomValue(channelIdAtom)
  const status = useAtomValue(connectionStatusAtom)
  const count = useAtomValue(messageCountAtom)
  const checkpoint = useAtomValue(pendingCheckpointAtom)
  const { dot, color: dotColor } = connectionDot(status, theme)

  const shortId = channelId.startsWith("channel:") ? channelId.slice(8, 16) : channelId.slice(0, 8)

  const shortcuts = compact
    ? checkpoint ? "Y/N/D" : "S/M/K"
    : checkpoint
      ? "^Y approve  ^N reject  ^D defer"
      : "^S sessions  ^M memory  ^K cmd"

  return (
    <box backgroundColor={theme.surface} flexDirection="row">
      <text content={` ${shortId} `} fg={theme.textMuted} />
      {!compact && <text content="\u2502" fg={theme.border} />}
      <text content={` ${dot} ${status} `} fg={dotColor} />
      {!compact && <text content="\u2502" fg={theme.border} />}
      <text content={` ${count} msgs `} fg={theme.textMuted} />
      {!compact && <text content="\u2502" fg={theme.border} />}
      <box flexGrow={1} justifyContent="flex-end">
        <text content={`${shortcuts} `} fg={checkpoint ? theme.statusPending : theme.textMuted} />
      </box>
    </box>
  )
}
