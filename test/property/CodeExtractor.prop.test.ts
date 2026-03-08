import { describe, test } from "bun:test"
import * as FC from "effect/FastCheck"
import { extractCodeBlock } from "../../src/CodeExtractor"
import { assertProperty } from "./helpers/property"

const withoutToken = (token: string) =>
  FC.string().filter((s) => !s.includes(token))

describe("CodeExtractor properties", () => {
  test("prop: extractCodeBlock trims payload for fenced code", () => {
    assertProperty(
      FC.property(
        withoutToken("```"),
        FC.constantFrom("js", "python", "ts", ""),
        (body, language) => {
          const fence = language === "" ? "```" : `\`\`\`${language}`
          return extractCodeBlock(`${fence}\n${body}\n\`\`\``) === body.trim()
        }
      )
    )
  })

  test("prop: extractCodeBlock returns first code block only", () => {
    assertProperty(
      FC.property(
        withoutToken("```"),
        withoutToken("```"),
        (first, second) =>
          extractCodeBlock(`\`\`\`js\n${first}\n\`\`\`\n\`\`\`js\n${second}\n\`\`\``) === first.trim()
      )
    )
  })
})
