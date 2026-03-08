import { Option, Schema } from "effect"

const JsonRecord = Schema.fromJsonString(Schema.Record(Schema.String, Schema.Unknown))

const decodeJsonRecord = Schema.decodeOption(JsonRecord)
const encodeJsonValue = Schema.encodeSync(Schema.fromJsonString(Schema.Unknown))

const tryParse = (json: string): Record<string, unknown> | null =>
  Option.getOrNull(decodeJsonRecord(json))

const truncate = (s: string, max: number): string =>
  s.length <= max ? s : s.slice(0, max - 1) + "\u2026"

const defaultKvSummary = (obj: Record<string, unknown>, max: number): string => {
  const pairs: Array<string> = []
  for (const [key, value] of Object.entries(obj)) {
    if (pairs.length >= 2) break
    const v = typeof value === "string" ? value : encodeJsonValue(value)
    pairs.push(`${key}=${v}`)
  }
  return truncate(pairs.join(" "), max)
}

export const formatToolInput = (toolName: string, inputJson: string): string => {
  const obj = tryParse(inputJson)
  if (obj === null) return truncate(inputJson, 50)

  switch (toolName) {
    case "time_now":
      return ""
    case "math_calculate":
      return String(obj.expression ?? "")
    case "file_read":
    case "file_write":
    case "file_edit":
      return String(obj.path ?? "")
    case "file_ls":
      return String(obj.path ?? ".")
    case "file_find":
      return `${String(obj.pattern ?? "")} in ${String(obj.path ?? ".")}`
    case "file_grep":
      return `${String(obj.pattern ?? "")} in ${String(obj.path ?? ".")}`
    case "shell_execute":
      return truncate(String(obj.command ?? ""), 50)
    case "store_memory":
      return truncate(String(obj.content ?? ""), 40)
    case "retrieve_memories":
      return String(obj.query ?? "")
    case "forget_memories": {
      const items = Array.isArray(obj.itemIds) ? obj.itemIds : []
      return `${items.length} items`
    }
    case "send_notification":
      return String(obj.recipient ?? "")
    default:
      return defaultKvSummary(obj, 60)
  }
}

export const formatToolOutput = (toolName: string, outputJson: string | null, isError: boolean): string => {
  if (outputJson === null) return ""

  if (isError) {
    const obj = tryParse(outputJson)
    if (obj !== null) {
      const code = obj.errorCode ?? obj.error_code ?? obj.code ?? ""
      const message = obj.message ?? obj.error ?? ""
      const parts = [code, message].filter((p) => String(p).length > 0).map(String)
      return truncate(`ERR: ${parts.join(": ")}`, 70)
    }
    return truncate(`ERR: ${outputJson}`, 70)
  }

  const obj = tryParse(outputJson)
  if (obj === null) return truncate(outputJson, 80)

  switch (toolName) {
    case "time_now":
      return String(obj.nowIso ?? obj.now ?? outputJson)
    case "math_calculate":
      return `= ${String(obj.result ?? "")}`
    case "file_read":
      return `${String(obj.content ?? "").length} chars`
    case "file_write":
      return `wrote ${String(obj.bytesWritten ?? "?")}B`
    case "file_edit":
      return `edited ${String(obj.path ?? "")}`
    case "file_ls":
      return `${Array.isArray(obj.entries) ? obj.entries.length : "?"} entries`
    case "file_find":
      return `${Array.isArray(obj.matches) ? obj.matches.length : "?"} matches`
    case "file_grep":
      return `${Array.isArray(obj.matches) ? obj.matches.length : "?"} matches`
    case "shell_execute": {
      const exit = `exit ${String(obj.exitCode ?? "?")}`;
      const stdout = String(obj.stdout ?? "")
      const firstLine = stdout.split("\n")[0] ?? ""
      return firstLine.length > 0 && firstLine.length <= 40
        ? `${exit} ${firstLine}`
        : exit
    }
    case "store_memory":
      return `stored ${String(obj.memoryId ?? obj.id ?? "")}`
    case "retrieve_memories":
      return `${Array.isArray(obj.memories) ? obj.memories.length : "?"} memories`
    case "forget_memories":
      return `forgot ${String(obj.forgotten ?? obj.count ?? "?")}`
    case "send_notification":
      return String((obj.delivered ?? (obj.status === "delivered")) ? "delivered" : "sent")
    default:
      return defaultKvSummary(obj, 60)
  }
}
