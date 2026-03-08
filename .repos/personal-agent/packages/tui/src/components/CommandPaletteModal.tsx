import * as React from "react"
import { useKeyboard } from "@opentui/react"
import { useTheme } from "../hooks/useTheme.js"
import { fuzzyMatch } from "../utils/fuzzyMatch.js"
import { ModalBox } from "./ModalBox.js"

export interface PaletteCommand {
  readonly id: string
  readonly label: string
  readonly shortcut?: string
  readonly action: () => void
}

interface FuzzyResult {
  readonly command: PaletteCommand
  readonly score: number
  readonly matchedIndices: ReadonlyArray<number>
}

export function CommandPaletteModal({
  commands,
  onClose
}: {
  readonly commands: ReadonlyArray<PaletteCommand>
  readonly onClose: () => void
}) {
  const theme = useTheme()
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const filtered: ReadonlyArray<FuzzyResult> = React.useMemo(() => {
    if (query.trim().length === 0) {
      return commands.map((command) => ({ command, score: 0, matchedIndices: [] as ReadonlyArray<number> }))
    }
    const results: Array<FuzzyResult> = []
    for (const command of commands) {
      const match = fuzzyMatch(query, command.label)
      if (match !== null) {
        results.push({ command, score: match.score, matchedIndices: match.matchedIndices })
      }
    }
    results.sort((a, b) => b.score - a.score)
    return results
  }, [commands, query])

  // Clamp selected index when filtered list shrinks
  React.useEffect(() => {
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, selectedIndex])

  useKeyboard((key) => {
    if (key.name === "escape") {
      onClose()
      return
    }
    if (key.name === "up") {
      setSelectedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1))
      return
    }
    if (key.name === "down") {
      setSelectedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0))
      return
    }
    if (key.name === "return") {
      const selected = filtered[selectedIndex]
      if (selected) {
        selected.command.action()
        onClose()
      }
      return
    }
  })

  return (
    <ModalBox title="Command Palette" width="70%" height="50%">
      <box flexDirection="column" flexGrow={1}>
        <box
          border={true}
          borderStyle="single"
          borderColor={theme.border}
          marginBottom={1}
        >
          <text content=" > " fg={theme.accent} />
          <input
            placeholder="Type to search commands..."
            focused={true}
            value={query}
            onInput={(val: string) => {
              setQuery(val)
              setSelectedIndex(0)
            }}
            flexGrow={1}
            cursorColor={theme.accent}
            textColor={theme.text}
            placeholderColor={theme.textMuted}
          />
        </box>
        <scrollbox flexGrow={1}>
          {filtered.length === 0 ? (
            <text content="  No matching commands." fg={theme.textMuted} />
          ) : (
            filtered.map((result, i) => {
              const isSelected = i === selectedIndex
              const label = result.command.label
              const shortcut = result.command.shortcut

              return (
                <box
                  key={result.command.id}
                  flexDirection="row"
                  backgroundColor={isSelected ? theme.surface : undefined}
                >
                  <text
                    content={isSelected ? " \u25B6 " : "   "}
                    fg={isSelected ? theme.accent : theme.textMuted}
                  />
                  <text
                    content={label}
                    fg={isSelected ? theme.accent : theme.text}
                    bold={isSelected}
                    flexGrow={1}
                  />
                  {shortcut && (
                    <text content={` ${shortcut} `} fg={theme.textMuted} />
                  )}
                </box>
              )
            })
          )}
        </scrollbox>
        <box marginTop={1}>
          <text content=" \u2191/\u2193 navigate  Enter select  Esc close" fg={theme.textMuted} />
        </box>
      </box>
    </ModalBox>
  )
}
