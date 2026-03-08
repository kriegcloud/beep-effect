import type { ChannelSummary } from "../types.js"
import { useTheme } from "../hooks/useTheme.js"
import { ModalBox } from "./ModalBox.js"

export function SessionPickerModal({
  channels,
  activeChannelId,
  selectedIndex,
  onSelect,
  onDelete: _onDelete
}: {
  readonly channels: ReadonlyArray<ChannelSummary>
  readonly activeChannelId: string
  readonly selectedIndex: number
  readonly onSelect: (channelId: string) => void
  readonly onDelete: (channelId: string) => void
}) {
  const theme = useTheme()
  const options = channels.map((ch) => ({
    name: `${ch.channelId === activeChannelId ? "* " : "  "}${ch.channelId}`,
    description: `${ch.messageCount} msgs | ${ch.channelType} | last: ${ch.lastTurnAt ?? "no turns"}`,
    value: ch.channelId
  }))

  return (
    <ModalBox title="Sessions" width="70%" height="70%">
      {channels.length === 0 ? (
        <box flexDirection="column">
          <text content="No channels found." fg={theme.textMuted} />
          <text content="Press Esc to close." fg={theme.textMuted} />
        </box>
      ) : (
        <box flexDirection="column" flexGrow={1}>
          <text content=" \u2191/\u2193 navigate, Enter select, x delete, Esc close" fg={theme.textMuted} />
          <select
            options={options}
            selectedIndex={selectedIndex}
            focused={true}
            showDescription={true}
            wrapSelection={true}
            backgroundColor="transparent"
            textColor={theme.text}
            focusedBackgroundColor={theme.surface}
            focusedTextColor={theme.accent}
            selectedBackgroundColor={theme.surface}
            selectedTextColor={theme.accent}
            descriptionColor={theme.textMuted}
            onSelect={(_index: number, option: { value?: string } | null) => {
              if (option?.value) onSelect(option.value)
            }}
            flexGrow={1}
          />
        </box>
      )}
    </ModalBox>
  )
}
