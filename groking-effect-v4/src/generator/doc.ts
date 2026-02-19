export const extractClosestJsDocBlock = (sourceText: string, fullStart: number, start: number): string | undefined => {
  const leadingText = sourceText.slice(fullStart, start)
  const matches = leadingText.match(/\/\*\*[\s\S]*?\*\//g)
  if (matches === null || matches.length === 0) {
    return undefined
  }
  return matches[matches.length - 1]
}

export const cleanJsDocBlock = (jsDocBlock: string): string => {
  const withoutFrame = jsDocBlock
    .replace(/^\/\*\*\s*/, "")
    .replace(/\s*\*\/$/, "")
  return withoutFrame
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").replace(/\s+$/, ""))
    .join("\n")
    .trim()
}

export const extractSummary = (cleanJsDoc: string): string | undefined => {
  const lines = cleanJsDoc
    .split("\n")
    .map((line) => line.trim())

  const summaryLines: Array<string> = []
  for (const line of lines) {
    if (line.length === 0) {
      if (summaryLines.length > 0) {
        break
      }
      continue
    }
    if (line.startsWith("@")) {
      if (summaryLines.length > 0) {
        break
      }
      continue
    }
    if (line.startsWith("```")) {
      break
    }
    if (line.startsWith("**Example**")) {
      break
    }
    summaryLines.push(line)
  }

  if (summaryLines.length === 0) {
    return undefined
  }

  return summaryLines.join(" ")
}

export const extractFirstExampleCodeBlock = (cleanJsDoc: string): string | undefined => {
  const typedMatch = cleanJsDoc.match(/```(?:ts|typescript)\s*\n([\s\S]*?)```/i)
  if (typedMatch !== null) {
    const code = typedMatch[1]
    if (code !== undefined) {
      return code.trim()
    }
  }

  const plainMatch = cleanJsDoc.match(/```\s*\n([\s\S]*?)```/)
  if (plainMatch !== null) {
    const code = plainMatch[1]
    if (code !== undefined) {
      return code.trim()
    }
  }

  return undefined
}

export const extractModuleJsDoc = (sourceText: string): string | undefined => {
  const match = sourceText.match(/^\s*\/\*\*[\s\S]*?\*\//)
  if (match === null) {
    return undefined
  }
  return cleanJsDocBlock(match[0])
}
