import { describe, expect, it } from "vitest"
import { formatToolInput, formatToolOutput } from "../src/formatters/toolSummary.js"

describe("formatToolInput", () => {
  it("time_now returns empty", () => {
    expect(formatToolInput("time_now", "{}")).toBe("")
  })

  it("math_calculate returns expression", () => {
    expect(formatToolInput("math_calculate", JSON.stringify({ expression: "2+2" }))).toBe("2+2")
  })

  it("file_read returns path", () => {
    expect(formatToolInput("file_read", JSON.stringify({ path: "/tmp/foo.txt" }))).toBe("/tmp/foo.txt")
  })

  it("file_write returns path", () => {
    expect(formatToolInput("file_write", JSON.stringify({ path: "/tmp/out.txt", content: "hello" }))).toBe("/tmp/out.txt")
  })

  it("file_edit returns path", () => {
    expect(formatToolInput("file_edit", JSON.stringify({ path: "/tmp/edit.txt" }))).toBe("/tmp/edit.txt")
  })

  it("file_ls returns path or dot", () => {
    expect(formatToolInput("file_ls", JSON.stringify({ path: "/home" }))).toBe("/home")
    expect(formatToolInput("file_ls", JSON.stringify({}))).toBe(".")
  })

  it("file_find returns pattern in path", () => {
    expect(formatToolInput("file_find", JSON.stringify({ pattern: "*.ts", path: "/src" }))).toBe("*.ts in /src")
  })

  it("file_grep returns pattern in path", () => {
    expect(formatToolInput("file_grep", JSON.stringify({ pattern: "TODO", path: "/src" }))).toBe("TODO in /src")
  })

  it("shell_execute returns command truncated to 50", () => {
    expect(formatToolInput("shell_execute", JSON.stringify({ command: "ls -la" }))).toBe("ls -la")
    const longCmd = "a".repeat(60)
    const result = formatToolInput("shell_execute", JSON.stringify({ command: longCmd }))
    expect(result.length).toBe(50)
  })

  it("store_memory returns content truncated to 40", () => {
    expect(formatToolInput("store_memory", JSON.stringify({ content: "remember this" }))).toBe("remember this")
    const longContent = "x".repeat(50)
    const result = formatToolInput("store_memory", JSON.stringify({ content: longContent }))
    expect(result.length).toBe(40)
  })

  it("retrieve_memories returns query", () => {
    expect(formatToolInput("retrieve_memories", JSON.stringify({ query: "project setup" }))).toBe("project setup")
  })

  it("forget_memories returns item count", () => {
    expect(formatToolInput("forget_memories", JSON.stringify({ itemIds: ["a", "b", "c"] }))).toBe("3 items")
  })

  it("send_notification returns recipient", () => {
    expect(formatToolInput("send_notification", JSON.stringify({ recipient: "user@example.com" }))).toBe("user@example.com")
  })

  it("unknown tool returns first 2 key=value pairs", () => {
    const result = formatToolInput("custom_tool", JSON.stringify({ foo: "bar", baz: 42, extra: true }))
    expect(result).toBe("foo=bar baz=42")
  })

  it("malformed JSON returns truncated raw input", () => {
    expect(formatToolInput("file_read", "not json")).toBe("not json")
  })
})

describe("formatToolOutput", () => {
  it("null outputJson returns empty", () => {
    expect(formatToolOutput("file_read", null, false)).toBe("")
  })

  describe("error formatting", () => {
    it("parses errorCode and message", () => {
      const json = JSON.stringify({ errorCode: "NOT_FOUND", message: "File not found" })
      expect(formatToolOutput("file_read", json, true)).toBe("ERR: NOT_FOUND: File not found")
    })

    it("falls back to raw on parse failure", () => {
      expect(formatToolOutput("file_read", "raw error text", true)).toBe("ERR: raw error text")
    })

    it("truncates long error messages", () => {
      const json = JSON.stringify({ errorCode: "ERR", message: "x".repeat(100) })
      const result = formatToolOutput("file_read", json, true)
      expect(result.length).toBeLessThanOrEqual(70)
    })
  })

  describe("success formatting", () => {
    it("time_now returns nowIso", () => {
      expect(formatToolOutput("time_now", JSON.stringify({ nowIso: "2025-01-01T00:00:00Z" }), false))
        .toBe("2025-01-01T00:00:00Z")
    })

    it("math_calculate returns result", () => {
      expect(formatToolOutput("math_calculate", JSON.stringify({ result: 4 }), false)).toBe("= 4")
    })

    it("file_read returns char count", () => {
      expect(formatToolOutput("file_read", JSON.stringify({ content: "hello world" }), false)).toBe("11 chars")
    })

    it("file_write returns bytes written", () => {
      expect(formatToolOutput("file_write", JSON.stringify({ bytesWritten: 256 }), false)).toBe("wrote 256B")
    })

    it("file_edit returns edited path", () => {
      expect(formatToolOutput("file_edit", JSON.stringify({ path: "/tmp/f.txt" }), false)).toBe("edited /tmp/f.txt")
    })

    it("file_ls returns entry count", () => {
      expect(formatToolOutput("file_ls", JSON.stringify({ entries: ["a", "b"] }), false)).toBe("2 entries")
    })

    it("file_find returns match count", () => {
      expect(formatToolOutput("file_find", JSON.stringify({ matches: ["a.ts"] }), false)).toBe("1 matches")
    })

    it("file_grep returns match count", () => {
      expect(formatToolOutput("file_grep", JSON.stringify({ matches: [] }), false)).toBe("0 matches")
    })

    it("shell_execute returns exit code with stdout", () => {
      expect(formatToolOutput("shell_execute", JSON.stringify({ exitCode: 0, stdout: "OK" }), false))
        .toBe("exit 0 OK")
    })

    it("shell_execute omits long stdout", () => {
      expect(formatToolOutput("shell_execute", JSON.stringify({ exitCode: 0, stdout: "x".repeat(50) }), false))
        .toBe("exit 0")
    })

    it("store_memory returns memoryId", () => {
      expect(formatToolOutput("store_memory", JSON.stringify({ memoryId: "mem_123" }), false)).toBe("stored mem_123")
    })

    it("retrieve_memories returns count", () => {
      expect(formatToolOutput("retrieve_memories", JSON.stringify({ memories: [1, 2, 3] }), false)).toBe("3 memories")
    })

    it("forget_memories returns forgotten count", () => {
      expect(formatToolOutput("forget_memories", JSON.stringify({ forgotten: 5 }), false)).toBe("forgot 5")
    })

    it("send_notification returns delivered", () => {
      expect(formatToolOutput("send_notification", JSON.stringify({ delivered: true }), false)).toBe("delivered")
    })

    it("unknown tool returns key=value pairs", () => {
      const result = formatToolOutput("custom_tool", JSON.stringify({ status: "ok", count: 3 }), false)
      expect(result).toBe("status=ok count=3")
    })

    it("malformed JSON returns truncated raw output", () => {
      expect(formatToolOutput("file_read", "not json", false)).toBe("not json")
    })
  })
})
