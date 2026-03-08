import { describe, expect, test } from "bun:test"
import { extractCodeBlock } from "../src/CodeExtractor"

describe("extractCodeBlock", () => {
  test("js fence", () => {
    expect(extractCodeBlock("```js\ncode\n```")).toBe("code")
  })

  test("python fence", () => {
    expect(extractCodeBlock("```python\ncode\n```")).toBe("code")
  })

  test("no language fence", () => {
    expect(extractCodeBlock("```\ncode\n```")).toBe("code")
  })

  test("no code block returns null", () => {
    expect(extractCodeBlock("just text")).toBeNull()
  })

  test("multiple blocks returns first", () => {
    expect(extractCodeBlock("```js\nfirst\n```\n```js\nsecond\n```")).toBe("first")
  })

  test("empty block", () => {
    expect(extractCodeBlock("```js\n\n```")).toBe("")
  })

  test("trims whitespace", () => {
    expect(extractCodeBlock("```js\n  code  \n```")).toBe("code")
  })
})
