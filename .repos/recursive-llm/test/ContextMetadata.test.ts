import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as nodeFs from "node:fs"
import * as nodePath from "node:path"
import * as os from "node:os"
import {
  analyzeContext,
  analyzeFilePrefix,
  detectPrimaryTextField,
  formatContextHint,
  MAX_JSON_METADATA_PARSE_CHARS
} from "../src/ContextMetadata"

describe("ContextMetadata.analyzeContext", () => {
  test("detects NDJSON by extension and extracts nested fields", () => {
    const content = "{\"author\":\"did:1\",\"text\":\"hello\",\"authorProfile\":{\"displayName\":\"A\"}}\n{\"author\":\"did:2\",\"text\":\"world\"}"
    const meta = analyzeContext(content, "feed.ndjson")

    expect(meta.fileName).toBe("feed.ndjson")
    expect(meta.format).toBe("ndjson")
    expect(meta.recordCount).toBe(2)
    expect(meta.lines).toBe(2)
    expect(meta.fields).toBeDefined()
    expect(meta.fields).toContain("author")
    expect(meta.fields).toContain("text")
    expect(meta.fields).toContain("authorProfile.displayName")
  })

  test("detects NDJSON by content sniffing without extension", () => {
    const content = "{\"id\":1}\n{\"id\":2}"
    const meta = analyzeContext(content)

    expect(meta.fileName).toBeUndefined()
    expect(meta.format).toBe("ndjson")
    expect(meta.recordCount).toBe(2)
    expect(meta.fields).toContain("id")
  })

  test("detects JSON array and extracts record count and fields", () => {
    const content = "[{\"id\":1,\"name\":\"A\"},{\"id\":2,\"name\":\"B\"}]"
    const meta = analyzeContext(content, "rows.json")

    expect(meta.format).toBe("json-array")
    expect(meta.recordCount).toBe(2)
    expect(meta.fields).toContain("id")
    expect(meta.fields).toContain("name")
    expect(meta.sampleRecord).toContain("\"id\":1")
  })

  test("detects JSON object and extracts top-level and one-level nested fields", () => {
    const content = "{\"query\":\"x\",\"settings\":{\"mode\":\"fast\"}}"
    const meta = analyzeContext(content, "config.json")

    expect(meta.format).toBe("json")
    expect(meta.fields).toContain("query")
    expect(meta.fields).toContain("settings")
    expect(meta.fields).toContain("settings.mode")
    expect(meta.recordCount).toBeUndefined()
  })

  test("detects CSV and extracts header fields", () => {
    const content = "id,name\n1,Alice\n2,Bob"
    const meta = analyzeContext(content, "people.csv")

    expect(meta.format).toBe("csv")
    expect(meta.fields).toEqual(["id", "name"])
    expect(meta.recordCount).toBe(2)
    expect(meta.sampleRecord).toBe("1,Alice")
  })

  test("detects TSV and extracts header fields", () => {
    const content = "id\tname\n1\tAlice\n2\tBob"
    const meta = analyzeContext(content, "people.tsv")

    expect(meta.format).toBe("tsv")
    expect(meta.fields).toEqual(["id", "name"])
    expect(meta.recordCount).toBe(2)
  })

  test("detects plain text and counts lines", () => {
    const content = "alpha\nbeta\ngamma"
    const meta = analyzeContext(content, "notes.txt")

    expect(meta.format).toBe("plain-text")
    expect(meta.lines).toBe(3)
    expect(meta.recordCount).toBeUndefined()
    expect(meta.fields).toBeUndefined()
  })

  test("detects markdown by extension", () => {
    const content = "# Heading\n\nBody"
    const meta = analyzeContext(content, "README.md")

    expect(meta.format).toBe("markdown")
    expect(meta.lines).toBe(3)
  })

  test("handles malformed NDJSON first line gracefully", () => {
    const content = "{bad json}\n{\"ok\":true}"
    const meta = analyzeContext(content, "broken.ndjson")

    expect(meta.format).toBe("ndjson")
    expect(meta.recordCount).toBe(2)
    expect(meta.fields).toBeUndefined()
    expect(meta.sampleRecord).toContain("{bad json}")
  })

  test("truncates long sample records", () => {
    const longValue = "x".repeat(500)
    const content = `[{"text":"${longValue}"}]`
    const meta = analyzeContext(content, "long.json")

    expect(meta.sampleRecord).toBeDefined()
    expect(meta.sampleRecord!.length).toBeLessThanOrEqual(223)
    expect(meta.sampleRecord!.endsWith("...")).toBe(true)
  })

  test("skips full JSON metadata parse for very large JSON arrays", () => {
    const row = "{\"id\":1,\"name\":\"A\"}"
    const targetChars = MAX_JSON_METADATA_PARSE_CHARS + 10_000
    const repeatCount = Math.ceil(targetChars / (row.length + 1))
    const content = `[${Array.from({ length: repeatCount }, () => row).join(",")}]`
    const meta = analyzeContext(content, "huge.json")

    expect(content.length).toBeGreaterThan(MAX_JSON_METADATA_PARSE_CHARS)
    expect(meta.format).toBe("json-array")
    // Large payloads should avoid full parse-based enrichment.
    expect(meta.recordCount).toBeUndefined()
    expect(meta.fields).toBeUndefined()
    expect(meta.sampleRecord).toBeUndefined()
  })

  test("keeps JSON format for very large malformed .json payloads", () => {
    const repeatedPair = "\"id\":1,"
    const repeatCount = Math.ceil((MAX_JSON_METADATA_PARSE_CHARS + 10_000) / repeatedPair.length)
    const content = `{${repeatedPair.repeat(repeatCount)}`
    const meta = analyzeContext(content, "broken-large.json")

    expect(content.length).toBeGreaterThan(MAX_JSON_METADATA_PARSE_CHARS)
    expect(meta.format).toBe("json")
    expect(meta.fields).toBeUndefined()
    expect(meta.sampleRecord).toBeUndefined()
  })
})

describe("ContextMetadata.detectPrimaryTextField", () => {
  test("picks body_markdown over url for BTI-shaped record", () => {
    const record = {
      url: "https://example.com/article/123",
      title: "Short Title",
      body_markdown: "A".repeat(200)
    }
    expect(detectPrimaryTextField(record)).toBe("body_markdown")
  })

  test("picks text over description when text is longer", () => {
    const record = {
      text: "B".repeat(100),
      description: "C".repeat(80)
    }
    expect(detectPrimaryTextField(record)).toBe("text")
  })

  test("name-prior tiebreaks when lengths are similar", () => {
    // "content" has prior 8, "message" has prior 5 — content wins even at equal length
    const record = {
      content: "D".repeat(100),
      message: "E".repeat(100)
    }
    expect(detectPrimaryTextField(record)).toBe("content")
  })

  test("returns undefined when all strings are too short", () => {
    const record = {
      id: "abc",
      name: "short",
      url: "https://example.com"
    }
    expect(detectPrimaryTextField(record)).toBeUndefined()
  })

  test("blocklisted fields (url, id, slug, path) are skipped", () => {
    const record = {
      url: "A".repeat(500),
      id: "B".repeat(500),
      slug: "C".repeat(500),
      path: "D".repeat(500),
      body: "E".repeat(60)
    }
    expect(detectPrimaryTextField(record)).toBe("body")
  })

  test("returns undefined for non-record input", () => {
    expect(detectPrimaryTextField("hello")).toBeUndefined()
    expect(detectPrimaryTextField(null)).toBeUndefined()
    expect(detectPrimaryTextField(42)).toBeUndefined()
  })

  test("body_html beats unknown field names via prior", () => {
    const record = {
      custom_data: "F".repeat(200),
      body_html: "G".repeat(200)
    }
    expect(detectPrimaryTextField(record)).toBe("body_html")
  })
})

describe("ContextMetadata.analyzeContext primaryTextField", () => {
  test("NDJSON with body_markdown detects primaryTextField", () => {
    const record = { url: "https://example.com", body_markdown: "A".repeat(200) }
    const content = JSON.stringify(record) + "\n" + JSON.stringify({ url: "https://other.com", body_markdown: "B".repeat(100) })
    const meta = analyzeContext(content, "articles.ndjson")

    expect(meta.primaryTextField).toBe("body_markdown")
  })

  test("JSON array with body detects primaryTextField", () => {
    const content = JSON.stringify([
      { id: 1, body: "X".repeat(100) },
      { id: 2, body: "Y".repeat(100) }
    ])
    const meta = analyzeContext(content, "data.json")

    expect(meta.primaryTextField).toBe("body")
  })

  test("NDJSON with only short fields has no primaryTextField", () => {
    const content = "{\"id\":1,\"name\":\"A\"}\n{\"id\":2,\"name\":\"B\"}"
    const meta = analyzeContext(content, "short.ndjson")

    expect(meta.primaryTextField).toBeUndefined()
  })
})

describe("ContextMetadata.formatContextHint", () => {
  test("formats a detailed file-based context hint", () => {
    const meta = analyzeContext(
      "id,name\n1,Alice\n2,Bob",
      "people.csv"
    )
    const hint = formatContextHint(meta)

    expect(hint).toContain("[Context available in __vars.context]")
    expect(hint).toContain("Source: people.csv")
    expect(hint).toContain("Format: CSV")
    expect(hint).toContain("Records: 2")
    expect(hint).toContain("Fields: id, name")
  })

  test("formats an inline hint when fileName is missing", () => {
    const meta = analyzeContext("{\"id\":1}\n{\"id\":2}")
    const hint = formatContextHint(meta)

    expect(hint).toContain("detected:")
    expect(hint).toContain("NDJSON")
    expect(hint).toContain("Records: 2")
  })

  test("handles empty content", () => {
    const meta = analyzeContext("")
    const hint = formatContextHint(meta)

    expect(meta.format).toBe("plain-text")
    expect(meta.chars).toBe(0)
    expect(meta.lines).toBe(0)
    expect(hint).toContain("0 chars")
  })
})

describe("analyzeFilePrefix", () => {
  let tmpDir: string

  beforeAll(() => {
    tmpDir = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "rlm-prefix-test-"))
  })

  afterAll(() => {
    nodeFs.rmSync(tmpDir, { recursive: true })
  })

  test("analyzes small ndjson file with exact counts", async () => {
    const filePath = nodePath.join(tmpDir, "small.ndjson")
    nodeFs.writeFileSync(filePath, '{"id":1,"name":"Alice"}\n{"id":2,"name":"Bob"}\n')

    const meta = await analyzeFilePrefix(filePath)
    expect(meta.format).toBe("ndjson")
    expect(meta.fields).toEqual(["id", "name"])
    expect(meta.recordCount).toBe(2)
    expect(meta.linesEstimated).toBe(false)
    expect(meta.recordCountEstimated).toBe(false)
  })

  test("returns estimated counts for large files", async () => {
    const filePath = nodePath.join(tmpDir, "large.ndjson")
    const line = JSON.stringify({ id: 1, name: "Alice".repeat(50) }) + "\n"
    const lineCount = Math.ceil(260_000 / line.length)
    nodeFs.writeFileSync(filePath, line.repeat(lineCount))

    const meta = await analyzeFilePrefix(filePath)
    expect(meta.format).toBe("ndjson")
    expect(meta.linesEstimated).toBe(true)
    expect(meta.recordCountEstimated).toBe(true)
    expect(meta.fields).toEqual(["id", "name"])
  })

  test("analyzes csv file with exact counts", async () => {
    const filePath = nodePath.join(tmpDir, "data.csv")
    nodeFs.writeFileSync(filePath, "id,name,email\n1,Alice,alice@test.com\n2,Bob,bob@test.com\n")

    const meta = await analyzeFilePrefix(filePath)
    expect(meta.format).toBe("csv")
    expect(meta.fields).toEqual(["id", "name", "email"])
    expect(meta.recordCount).toBe(2)
    expect(meta.linesEstimated).toBe(false)
  })

  test("uses provided fileName over basename", async () => {
    const filePath = nodePath.join(tmpDir, "generic.txt")
    nodeFs.writeFileSync(filePath, '{"x":1}\n{"x":2}\n')

    const meta = await analyzeFilePrefix(filePath, "data.ndjson")
    expect(meta.format).toBe("ndjson")
    expect(meta.fileName).toBe("data.ndjson")
  })
})
