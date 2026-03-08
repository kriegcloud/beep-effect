import { useAtomValue } from "@effect/atom-react"
import { estimatedContextAtom, type ContextUsage } from "../atoms/session.js"
import { useTheme } from "../hooks/useTheme.js"
import type { Theme } from "../theme.js"

const SEGMENTS: ReadonlyArray<{ key: keyof ContextUsage & string; label: string; themeKey: keyof Theme }> = [
  { key: "system", label: "sys", themeKey: "segmentSystem" },
  { key: "persona", label: "per", themeKey: "segmentPersona" },
  { key: "memory", label: "mem", themeKey: "segmentMemory" },
  { key: "history", label: "his", themeKey: "segmentHistory" },
  { key: "tools", label: "tls", themeKey: "segmentTools" }
]

const formatTokens = (n: number): string =>
  n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)

export function ContextBar() {
  const theme = useTheme()
  const usage = useAtomValue(estimatedContextAtom)
  const totalPct = usage.system + usage.persona + usage.memory + usage.history + usage.tools
  const barWidth = 6
  const summaryFilled = Math.round((totalPct / 100) * barWidth)

  const summaryColor = (pct: number): string =>
    pct < 60 ? theme.statusConnected : pct < 85 ? theme.statusPending : theme.statusError

  return (
    <box flexDirection="column">
      <text content={` Context (${totalPct}%)`} fg={theme.accent} />
      {SEGMENTS.filter(({ key }) => (usage[key] as number) > 0).map(({ key, label, themeKey }, i, visible) => {
        const pct = usage[key] as number
        const filled = Math.round((pct / 100) * barWidth)
        const empty = barWidth - filled
        const prefix = i < visible.length - 1 ? " \u251C" : " \u2514"
        const color = theme[themeKey]
        return (
          <text key={key}>
            <span fg={theme.textMuted}>{`${prefix} ${label} `}</span>
            <span fg={color}>{"\u2588".repeat(filled)}</span>
            <span fg={theme.border}>{"\u2591".repeat(empty)}</span>
            <span fg={theme.textMuted}>{` ${pct}%`}</span>
          </text>
        )
      })}
      <text>
        <span fg={summaryColor(totalPct)}>{`  ${"\u2588".repeat(summaryFilled)}`}</span>
        <span fg={theme.border}>{"\u2591".repeat(barWidth - summaryFilled)}</span>
      </text>
      <text
        content={`  ${formatTokens(usage.totalTokens)} / ${formatTokens(usage.capacityTokens)}`}
        fg={theme.textMuted}
      />
    </box>
  )
}
