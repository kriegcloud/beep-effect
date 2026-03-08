import * as React from "react"
import { formatToolInput, formatToolOutput } from "../formatters/toolSummary.js"
import { useTheme } from "../hooks/useTheme.js"
import type { Theme } from "../theme.js"
import type { ToolEvent } from "../types.js"

const statusIcon = (tool: ToolEvent): string =>
  tool.status === "called" ? "\u23F3" : tool.isError ? "\u274C" : "\u2713"

const statusColor = (tool: ToolEvent, theme: Theme): string =>
  tool.isError ? theme.error : tool.status === "called" ? theme.streaming : theme.statusConnected

const ToolCallInlineRow = React.memo(function ToolCallInlineRow({ tool }: { readonly tool: ToolEvent }) {
  const theme = useTheme()
  const inputSummary = formatToolInput(tool.toolName, tool.inputJson)
  const outputSummary = formatToolOutput(tool.toolName, tool.outputJson, tool.isError)
  const header = inputSummary.length > 0
    ? `  ${statusIcon(tool)} ${tool.toolName} ${inputSummary}`
    : `  ${statusIcon(tool)} ${tool.toolName}`

  return (
    <box flexDirection="column">
      <text content={header} fg={statusColor(tool, theme)} />
      {outputSummary.length > 0 ? (
        <text content={`    \u2192 ${outputSummary}`} fg={tool.isError ? theme.error : theme.textMuted} />
      ) : null}
    </box>
  )
})

export const ToolCallInline = React.memo(function ToolCallInline({
  tools
}: {
  readonly tools: ReadonlyArray<ToolEvent>
}) {
  if (tools.length === 0) return null
  return (
    <box flexDirection="column">
      {tools.map((tool) => (
        <ToolCallInlineRow key={tool.toolCallId} tool={tool} />
      ))}
    </box>
  )
})
