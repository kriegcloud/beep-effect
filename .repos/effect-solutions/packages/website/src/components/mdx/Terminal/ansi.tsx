import type React from "react"

// =============================================================================
// ANSI Parser
// =============================================================================

interface AnsiSpan {
  text: string
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
  color?: string
}

const ANSI_COLORS: Record<number, string> = {
  30: "#1a1a1a", // black
  31: "#ef4444", // red
  32: "#22c55e", // green
  33: "#eab308", // yellow
  34: "#3b82f6", // blue
  35: "#a855f7", // magenta
  36: "#06b6d4", // cyan
  37: "#e5e5e5", // white
  90: "#737373", // bright black (gray)
  91: "#fca5a5", // bright red
  92: "#86efac", // bright green
  93: "#fde047", // bright yellow
  94: "#93c5fd", // bright blue
  95: "#d8b4fe", // bright magenta
  96: "#67e8f9", // bright cyan
  97: "#ffffff", // bright white
}

function parseAnsi(text: string): AnsiSpan[] {
  const spans: AnsiSpan[] = []
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes
  const regex = /\x1b\[([0-9;]*)m/g

  let lastIndex = 0
  let currentStyle: Omit<AnsiSpan, "text"> = {}
  let match: RegExpExecArray | null

  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec pattern
  while ((match = regex.exec(text)) !== null) {
    // Add text before this escape sequence
    if (match.index > lastIndex) {
      spans.push({ text: text.slice(lastIndex, match.index), ...currentStyle })
    }

    // Parse the escape codes
    const codes = match[1]?.split(";").map(Number) ?? [0]
    for (const code of codes) {
      if (code === 0) {
        // Reset
        currentStyle = {}
      } else if (code === 1) {
        currentStyle.bold = true
      } else if (code === 2) {
        currentStyle.dim = true
      } else if (code === 3) {
        currentStyle.italic = true
      } else if (code === 4) {
        currentStyle.underline = true
      } else if (code === 22) {
        currentStyle.bold = false
        currentStyle.dim = false
      } else if (code === 23) {
        currentStyle.italic = false
      } else if (code === 24) {
        currentStyle.underline = false
      } else if (code >= 30 && code <= 37) {
        const c = ANSI_COLORS[code]
        if (c) currentStyle.color = c
      } else if (code >= 90 && code <= 97) {
        const c = ANSI_COLORS[code]
        if (c) currentStyle.color = c
      } else if (code === 39) {
        delete currentStyle.color
      }
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    spans.push({ text: text.slice(lastIndex), ...currentStyle })
  }

  return spans
}

export function AnsiText({ text }: { text: string }) {
  const spans = parseAnsi(text)

  return (
    <>
      {spans.map((span, i) => {
        const style: React.CSSProperties = {}
        if (span.bold) style.fontWeight = "bold"
        if (span.dim) style.opacity = 0.6
        if (span.italic) style.fontStyle = "italic"
        if (span.underline) style.textDecoration = "underline"
        if (span.color) style.color = span.color

        return Object.keys(style).length > 0 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          <span key={i} style={style}>
            {span.text}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          <span key={i}>{span.text}</span>
        )
      })}
    </>
  )
}
