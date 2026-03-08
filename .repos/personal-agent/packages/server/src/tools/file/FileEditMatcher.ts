export interface FileEditRange {
  readonly start: number
  readonly end: number
  readonly line: number
}

export interface FileEditMatchResult {
  readonly strategy: "exact" | "normalized"
  readonly ranges: ReadonlyArray<FileEditRange>
}

interface NormalizedIndex {
  readonly text: string
  readonly startMap: ReadonlyArray<number>
  readonly endMap: ReadonlyArray<number>
}

const isWhitespace = (char: string): boolean =>
  char === " "
  || char === "\t"
  || char === "\n"
  || char === "\r"
  || char === "\f"
  || char === "\v"

const normalizeForSearch = (input: string): NormalizedIndex => {
  let text = ""
  const startMap: Array<number> = []
  const endMap: Array<number> = []
  let index = 0

  while (index < input.length) {
    const char = input[index]!

    if (index === 0 && char === "\uFEFF") {
      index += 1
      continue
    }

    if (isWhitespace(char)) {
      const start = index
      while (index < input.length && isWhitespace(input[index]!)) {
        if (input[index] === "\r" && input[index + 1] === "\n") {
          index += 2
          continue
        }
        index += 1
      }
      text += " "
      startMap.push(start)
      endMap.push(index)
      continue
    }

    text += char
    startMap.push(index)
    endMap.push(index + 1)
    index += 1
  }

  return {
    text,
    startMap,
    endMap
  }
}

const findAllOccurrences = (
  haystack: string,
  needle: string
): ReadonlyArray<number> => {
  if (needle.length === 0) {
    return []
  }

  const indexes: Array<number> = []
  let cursor = 0
  while (cursor <= haystack.length - needle.length) {
    const index = haystack.indexOf(needle, cursor)
    if (index === -1) {
      break
    }
    indexes.push(index)
    cursor = index + 1
  }
  return indexes
}

export const lineNumberAtOffset = (
  content: string,
  offset: number
): number => {
  let line = 1
  for (let index = 0; index < Math.min(offset, content.length); index += 1) {
    if (content[index] === "\n") {
      line += 1
    }
  }
  return line
}

export const findEditCandidates = (
  content: string,
  oldString: string
): FileEditMatchResult => {
  const exactMatches = findAllOccurrences(content, oldString)
  if (exactMatches.length > 0) {
    return {
      strategy: "exact",
      ranges: exactMatches.map((start) => ({
        start,
        end: start + oldString.length,
        line: lineNumberAtOffset(content, start)
      }))
    }
  }

  const normalizedContent = normalizeForSearch(content)
  const normalizedOld = normalizeForSearch(oldString).text
  if (normalizedOld.length === 0) {
    return {
      strategy: "normalized",
      ranges: []
    }
  }

  const normalizedMatches = findAllOccurrences(
    normalizedContent.text,
    normalizedOld
  )
  const deduped = new Map<string, FileEditRange>()

  for (const normalizedStart of normalizedMatches) {
    const normalizedEnd = normalizedStart + normalizedOld.length - 1
    const start = normalizedContent.startMap[normalizedStart]
    const end = normalizedContent.endMap[normalizedEnd]
    if (start === undefined || end === undefined || end <= start) {
      continue
    }
    const key = `${start}:${end}`
    if (!deduped.has(key)) {
      deduped.set(key, {
        start,
        end,
        line: lineNumberAtOffset(content, start)
      })
    }
  }

  return {
    strategy: "normalized",
    ranges: Array.from(deduped.values())
  }
}

export const applyEditRange = (
  content: string,
  range: FileEditRange,
  replacement: string
): string => `${content.slice(0, range.start)}${replacement}${content.slice(range.end)}`

const splitLines = (input: string): Array<string> => {
  const lines = input.split("\n")
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop()
  }
  return lines
}

export const generateUnifiedDiff = (params: {
  readonly oldContent: string
  readonly newContent: string
  readonly path?: string
}): string => {
  const filePath = params.path ?? "file"
  if (params.oldContent === params.newContent) {
    return `--- a/${filePath}\n+++ b/${filePath}\n`
  }

  const oldLines = splitLines(params.oldContent)
  const newLines = splitLines(params.newContent)

  let prefix = 0
  while (
    prefix < oldLines.length
    && prefix < newLines.length
    && oldLines[prefix] === newLines[prefix]
  ) {
    prefix += 1
  }

  let suffix = 0
  while (
    suffix < oldLines.length - prefix
    && suffix < newLines.length - prefix
    && oldLines[oldLines.length - 1 - suffix] === newLines[newLines.length - 1 - suffix]
  ) {
    suffix += 1
  }

  const oldChanged = oldLines.slice(prefix, oldLines.length - suffix)
  const newChanged = newLines.slice(prefix, newLines.length - suffix)
  const oldStart = prefix + 1
  const newStart = prefix + 1
  const oldCount = Math.max(oldChanged.length, 1)
  const newCount = Math.max(newChanged.length, 1)

  const lines = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`,
    ...oldChanged.map((line) => `-${line}`),
    ...newChanged.map((line) => `+${line}`)
  ]

  return `${lines.join("\n")}\n`
}
