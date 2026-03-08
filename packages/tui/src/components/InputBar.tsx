import { useAtomValue } from "@effect/atom-react"
import { useKeyboard } from "@opentui/react"
import * as React from "react"
import { inputHistoryAtom, isStreamingAtom, pendingCheckpointAtom } from "../atoms/session.js"
import { useTheme } from "../hooks/useTheme.js"
import type { CheckpointDecision } from "../types.js"

export function InputBar({
  onSubmit,
  onDecision,
  focused,
  inputRef
}: {
  readonly onSubmit: (content: string) => void
  readonly onDecision?: (checkpointId: string, decision: CheckpointDecision) => void
  readonly focused: boolean
  readonly inputRef?: React.RefObject<unknown>
}) {
  const theme = useTheme()
  const isStreaming = useAtomValue(isStreamingAtom)
  const inputHistory = useAtomValue(inputHistoryAtom)
  const checkpoint = useAtomValue(pendingCheckpointAtom)
  const [inputValue, setInputValue] = React.useState("")
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  const [stashedInput, setStashedInput] = React.useState("")

  const handleSubmit = React.useCallback(
    (value: string) => {
      if (isStreaming || checkpoint || !value.trim()) return
      onSubmit(value.trim())
      setInputValue("")
      setHistoryIndex(-1)
      setStashedInput("")
    },
    [onSubmit, isStreaming, checkpoint]
  )

  // Checkpoint decision keyboard handler
  useKeyboard(
    (key) => {
      if (!focused || !checkpoint || !onDecision) return
      switch (key.name.toLowerCase()) {
        case "y":
          onDecision(checkpoint.checkpointId, "Approved")
          break
        case "n":
          onDecision(checkpoint.checkpointId, "Rejected")
          break
        case "d":
          onDecision(checkpoint.checkpointId, "Deferred")
          break
      }
    },
    { active: checkpoint !== null && focused }
  )

  // History navigation — disabled during checkpoint
  useKeyboard(
    (key) => {
      if (!focused || isStreaming) return
      if (inputHistory.length === 0) return

      const historyAt = (i: number) => inputHistory[inputHistory.length - 1 - i] ?? ""

      if (key.name === "up") {
        if (historyIndex === -1) {
          setStashedInput(inputValue)
          setHistoryIndex(0)
          setInputValue(historyAt(0))
        } else if (historyIndex < inputHistory.length - 1) {
          const newIndex = historyIndex + 1
          setHistoryIndex(newIndex)
          setInputValue(historyAt(newIndex))
        }
      }

      if (key.name === "down") {
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setInputValue(historyAt(newIndex))
        } else if (historyIndex === 0) {
          setHistoryIndex(-1)
          setInputValue(stashedInput)
        }
      }
    },
    { active: checkpoint === null }
  )

  if (checkpoint) {
    return (
      <box
        border={true}
        borderStyle="single"
        borderColor={theme.statusPending}
        padding={0}
        flexDirection="row"
      >
        <text
          content={` [checkpoint] \u26A0 ${checkpoint.action}: ${checkpoint.reason} `}
          fg={theme.statusPending}
          truncate={true}
          flexGrow={1}
        />
      </box>
    )
  }

  const isFocused = focused && !isStreaming

  return (
    <box
      border={true}
      borderStyle="single"
      borderColor={theme.border}
      focusedBorderColor={theme.borderFocus}
      padding={0}
    >
      <text
        content={isStreaming ? " \u23F3 " : " > "}
        fg={isStreaming ? theme.streaming : theme.textMuted}
      />
      <input
        ref={inputRef}
        placeholder="Type a message..."
        focused={isFocused}
        value={inputValue}
        onInput={setInputValue}
        onSubmit={handleSubmit}
        flexGrow={1}
        cursorColor={theme.accent}
        textColor={theme.text}
        placeholderColor={theme.textMuted}
      />
    </box>
  )
}
