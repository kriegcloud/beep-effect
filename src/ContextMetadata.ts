export type ContextFormat =
  | "ndjson"
  | "json"
  | "json-array"
  | "csv"
  | "tsv"
  | "plain-text"
  | "markdown"
  | "xml"
  | "unknown"

export interface ContextMetadata {
  readonly fileName?: string
  readonly format: ContextFormat
  readonly chars: number
  readonly lines: number
  readonly fields?: ReadonlyArray<string>
  readonly recordCount?: number
  readonly sampleRecord?: string
  readonly primaryTextField?: string
}

const MAX_SAMPLE_RECORD_CHARS = 220
const MAX_FIELDS = 24
export const MAX_JSON_METADATA_PARSE_CHARS = 250_000
const MIN_PRIMARY_TEXT_CHARS = 50

const TEXT_FIELD_NAME_PRIORS: ReadonlyArray<readonly [RegExp, number]> = [
  [/^(body_markdown|body_text|body|body_html)$/i, 10],
  [/^(text|content|markdown)$/i, 8],
  [/^(message|description|abstract|summary)$/i, 5],
  [/^(title|subject|name)$/i, 2]
]

const TEXT_FIELD_BLOCKLIST = /^(url|uri|href|link|id|_id|slug|path|hash|image|img|icon|avatar|thumb)/i

const namePrior = (field: string): number => {
  for (const [pattern, score] of TEXT_FIELD_NAME_PRIORS) {
    if (pattern.test(field)) return score
  }
  return 1
}

export const detectPrimaryTextField = (record: unknown): string | undefined => {
  if (!isRecord(record)) return undefined

  let bestField: string | undefined
  let bestScore = 0

  for (const [key, value] of Object.entries(record)) {
    if (typeof value !== "string") continue
    if (value.length < MIN_PRIMARY_TEXT_CHARS) continue
    if (TEXT_FIELD_BLOCKLIST.test(key)) continue

    const score = namePrior(key) * Math.log2(Math.max(value.length, 1))
    if (score > bestScore) {
      bestScore = score
      bestField = key
    }
  }

  return bestField
}

const numberFormatter = new Intl.NumberFormat("en-US")

interface LineStats {
  readonly lines: number
  readonly nonEmptyLines: number
  readonly firstLine: string
  readonly firstNonEmptyLine?: string
  readonly secondNonEmptyLine?: string
}

const stripTrailingCarriageReturn = (line: string): string =>
  line.endsWith("\r") ? line.slice(0, -1) : line

const collectLineStats = (content: string): LineStats => {
  if (content.length === 0) {
    return {
      lines: 0,
      nonEmptyLines: 0,
      firstLine: ""
    }
  }

  let lines = 1
  let nonEmptyLines = 0
  let start = 0
  let firstLine = ""
  let firstNonEmptyLine: string | undefined
  let secondNonEmptyLine: string | undefined

  for (let index = 0; index <= content.length; index += 1) {
    const isTerminator = index === content.length || content.charCodeAt(index) === 10
    if (!isTerminator) continue

    const rawLine = content.slice(start, index)
    const line = stripTrailingCarriageReturn(rawLine)

    if (start === 0) {
      firstLine = line
    }

    if (line.trim().length > 0) {
      nonEmptyLines += 1
      if (firstNonEmptyLine === undefined) {
        firstNonEmptyLine = line
      } else if (secondNonEmptyLine === undefined) {
        secondNonEmptyLine = line
      }
    }

    if (index < content.length) {
      lines += 1
      start = index + 1
    }
  }

  return {
    lines,
    nonEmptyLines,
    firstLine,
    ...(firstNonEmptyLine !== undefined ? { firstNonEmptyLine } : {}),
    ...(secondNonEmptyLine !== undefined ? { secondNonEmptyLine } : {})
  }
}

const tryParseJson = (input: string): unknown | undefined => {
  try {
    return JSON.parse(input)
  } catch {
    return undefined
  }
}

const detectJsonShapeByPrefix = (trimmed: string): "json" | "json-array" | undefined => {
  if (trimmed.startsWith("[")) return "json-array"
  if (trimmed.startsWith("{")) return "json"
  return undefined
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const extractFieldPaths = (value: unknown): ReadonlyArray<string> | undefined => {
  if (!isRecord(value)) return undefined

  const fields: Array<string> = []
  const seen = new Set<string>()

  const pushField = (field: string): void => {
    if (seen.has(field)) return
    seen.add(field)
    fields.push(field)
  }

  for (const [key, nested] of Object.entries(value)) {
    pushField(key)
    if (fields.length >= MAX_FIELDS) break
    if (!isRecord(nested)) continue

    for (const nestedKey of Object.keys(nested)) {
      pushField(`${key}.${nestedKey}`)
      if (fields.length >= MAX_FIELDS) break
    }

    if (fields.length >= MAX_FIELDS) break
  }

  return fields.length > 0 ? fields : undefined
}

const normalizeDelimitedCell = (cell: string): string => {
  const trimmed = cell.trim()
  if (trimmed.length >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

const parseDelimitedHeader = (line: string, delimiter: "," | "\t"): ReadonlyArray<string> =>
  line
    .split(delimiter)
    .map(normalizeDelimitedCell)
    .filter((cell) => cell.length > 0)

const looksLikeDelimitedHeader = (line: string, delimiter: "," | "\t"): boolean => {
  if (!line.includes(delimiter)) return false
  const fields = parseDelimitedHeader(line, delimiter)
  if (fields.length < 2) return false
  return fields.some((field) => /[A-Za-z_]/.test(field))
}

const detectFormatByExtension = (fileName?: string): ContextFormat | undefined => {
  if (!fileName) return undefined
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".ndjson") || lower.endsWith(".jsonl")) return "ndjson"
  if (lower.endsWith(".json")) return "json"
  if (lower.endsWith(".csv")) return "csv"
  if (lower.endsWith(".tsv")) return "tsv"
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown"
  if (lower.endsWith(".xml")) return "xml"
  if (lower.endsWith(".txt")) return "plain-text"
  return undefined
}

const detectFormatByContent = (content: string, lineStats: LineStats): ContextFormat => {
  const trimmed = content.trim()
  if (trimmed.length === 0) return "plain-text"

  if (lineStats.firstNonEmptyLine !== undefined && lineStats.secondNonEmptyLine !== undefined) {
    const firstParsed = tryParseJson(lineStats.firstNonEmptyLine)
    const secondParsed = tryParseJson(lineStats.secondNonEmptyLine)
    if (firstParsed !== undefined && secondParsed !== undefined) {
      return "ndjson"
    }
  }

  const jsonShapeByPrefix = detectJsonShapeByPrefix(trimmed)
  if (jsonShapeByPrefix !== undefined) {
    if (trimmed.length <= MAX_JSON_METADATA_PARSE_CHARS) {
      const parsed = tryParseJson(trimmed)
      if (parsed !== undefined) {
        return Array.isArray(parsed) ? "json-array" : "json"
      }
    } else {
      // Avoid full-document parsing for very large payloads during metadata detection.
      return jsonShapeByPrefix
    }
  }

  if (looksLikeDelimitedHeader(lineStats.firstLine, "\t")) {
    return "tsv"
  }

  if (looksLikeDelimitedHeader(lineStats.firstLine, ",")) {
    return "csv"
  }

  if (trimmed.startsWith("<") && trimmed.includes(">")) {
    return "xml"
  }

  if (lineStats.firstNonEmptyLine?.trimStart().startsWith("#")) {
    return "markdown"
  }

  return "plain-text"
}

const toSampleRecord = (value: string): string =>
  value.length <= MAX_SAMPLE_RECORD_CHARS
    ? value
    : `${value.slice(0, MAX_SAMPLE_RECORD_CHARS)}...`

const toSampleFromUnknown = (value: unknown): string => {
  if (typeof value === "string") return toSampleRecord(value)
  try {
    const asJson = JSON.stringify(value)
    return toSampleRecord(asJson ?? String(value))
  } catch {
    return toSampleRecord(String(value))
  }
}

const formatDisplayName = (format: ContextFormat): string => {
  switch (format) {
    case "ndjson":
      return "NDJSON (newline-delimited JSON)"
    case "json":
      return "JSON object"
    case "json-array":
      return "JSON array"
    case "csv":
      return "CSV"
    case "tsv":
      return "TSV"
    case "markdown":
      return "Markdown"
    case "xml":
      return "XML"
    case "plain-text":
      return "Plain text"
    default:
      return "Unknown"
  }
}

const formatNumber = (value: number): string => numberFormatter.format(value)

export const analyzeContext = (content: string, fileName?: string): ContextMetadata => {
  const lineStats = collectLineStats(content)
  const extensionFormat = detectFormatByExtension(fileName)
  let format = extensionFormat ?? detectFormatByContent(content, lineStats)
  const trimmed = content.trim()
  const canParseJsonMetadata = trimmed.length > 0 && trimmed.length <= MAX_JSON_METADATA_PARSE_CHARS

  let parsedJson: unknown | undefined
  if (format === "json" || format === "json-array") {
    const jsonShapeByPrefix = detectJsonShapeByPrefix(trimmed)
    parsedJson = canParseJsonMetadata ? tryParseJson(trimmed) : undefined
    if (parsedJson !== undefined) {
      format = Array.isArray(parsedJson) ? "json-array" : "json"
    } else if (jsonShapeByPrefix !== undefined) {
      format = jsonShapeByPrefix
    } else if (canParseJsonMetadata) {
      if (extensionFormat !== undefined) {
        format = detectFormatByContent(content, lineStats)
      } else {
        format = "unknown"
      }
    }
  }

  const baseMetadata: ContextMetadata = {
    ...(fileName !== undefined ? { fileName } : {}),
    format,
    chars: content.length,
    lines: lineStats.lines
  }

  if (format === "ndjson") {
    const firstLine = lineStats.firstNonEmptyLine
    const firstRecord = firstLine !== undefined ? tryParseJson(firstLine) : undefined
    const fields = extractFieldPaths(firstRecord)
    const primaryTextField = detectPrimaryTextField(firstRecord)
    return {
      ...baseMetadata,
      recordCount: lineStats.nonEmptyLines,
      ...(fields !== undefined ? { fields } : {}),
      ...(firstLine !== undefined ? { sampleRecord: toSampleRecord(firstLine.trim()) } : {}),
      ...(primaryTextField !== undefined ? { primaryTextField } : {})
    }
  }

  if (format === "json" || format === "json-array") {
    if (parsedJson === undefined && canParseJsonMetadata) {
      parsedJson = tryParseJson(trimmed)
    }

    if (parsedJson !== undefined) {
      if (Array.isArray(parsedJson)) {
        const first = parsedJson[0]
        const fields = first !== undefined ? extractFieldPaths(first) : undefined
        const primaryTextField = detectPrimaryTextField(first)
        return {
          ...baseMetadata,
          format: "json-array",
          recordCount: parsedJson.length,
          ...(fields !== undefined ? { fields } : {}),
          ...(first !== undefined ? { sampleRecord: toSampleFromUnknown(first) } : {}),
          ...(primaryTextField !== undefined ? { primaryTextField } : {})
        }
      }

      const fields = extractFieldPaths(parsedJson)
      return {
        ...baseMetadata,
        format: "json",
        ...(fields !== undefined ? { fields } : {}),
        sampleRecord: toSampleFromUnknown(parsedJson)
      }
    }
    return baseMetadata
  }

  if (format === "csv" || format === "tsv") {
    const delimiter = format === "csv" ? "," : "\t"
    const header = lineStats.firstNonEmptyLine ?? lineStats.firstLine
    const fields = parseDelimitedHeader(header, delimiter)
    return {
      ...baseMetadata,
      ...(fields.length > 0 ? { fields } : {}),
      recordCount: Math.max(lineStats.nonEmptyLines - 1, 0),
      ...(lineStats.secondNonEmptyLine !== undefined
        ? { sampleRecord: toSampleRecord(lineStats.secondNonEmptyLine) }
        : {})
    }
  }

  return baseMetadata
}

export const PREFIX_READ_BYTES = 250_000

export interface FileMetadataResult extends ContextMetadata {
  readonly linesEstimated: boolean
  readonly recordCountEstimated: boolean
}

export const analyzeFilePrefix = async (
  filePath: string,
  fileName?: string
): Promise<FileMetadataResult> => {
  const file = Bun.file(filePath)
  const totalBytes = file.size
  const isFullRead = totalBytes <= PREFIX_READ_BYTES
  const prefix = await file.slice(0, PREFIX_READ_BYTES).text()

  const resolvedFileName = fileName ?? filePath.split("/").pop()
  const baseMeta = analyzeContext(prefix, resolvedFileName)

  if (isFullRead) {
    return {
      ...baseMeta,
      linesEstimated: false,
      recordCountEstimated: false
    }
  }

  // Estimate line and record counts from prefix ratio
  const ratio = totalBytes / prefix.length
  const estimatedLines = Math.round(baseMeta.lines * ratio)
  const estimatedRecords = baseMeta.recordCount !== undefined
    ? Math.round(baseMeta.recordCount * ratio)
    : undefined

  return {
    ...baseMeta,
    lines: estimatedLines,
    linesEstimated: true,
    ...(estimatedRecords !== undefined
      ? { recordCount: estimatedRecords, recordCountEstimated: true }
      : { recordCountEstimated: false })
  }
}

export const formatContextHint = (meta: ContextMetadata): string => {
  const formatLabel = formatDisplayName(meta.format)
  if (meta.fileName !== undefined) {
    const lines: Array<string> = [
      "[Context available in __vars.context]",
      `  Source: ${meta.fileName}`,
      `  Format: ${formatLabel}`,
      `  Size: ${formatNumber(meta.chars)} chars, ${formatNumber(meta.lines)} lines`
    ]

    if (meta.recordCount !== undefined) {
      lines.push(`  Records: ${formatNumber(meta.recordCount)}`)
    }
    if (meta.fields !== undefined && meta.fields.length > 0) {
      lines.push(`  Fields: ${meta.fields.join(", ")}`)
    }
    if (meta.sampleRecord !== undefined && meta.sampleRecord.length > 0) {
      lines.push(`  Sample: ${meta.sampleRecord}`)
    }

    return lines.join("\n")
  }

  const lines: Array<string> = [
    `[Context available in __vars.context (${formatNumber(meta.chars)} chars, ${formatNumber(meta.lines)} lines, detected: ${formatLabel})]`
  ]

  if (meta.recordCount !== undefined) {
    lines.push(`  Records: ${formatNumber(meta.recordCount)}`)
  }
  if (meta.fields !== undefined && meta.fields.length > 0) {
    lines.push(`  Fields: ${meta.fields.join(", ")}`)
  }
  if (meta.sampleRecord !== undefined && meta.sampleRecord.length > 0) {
    lines.push(`  Sample: ${meta.sampleRecord}`)
  }

  return lines.join("\n")
}
