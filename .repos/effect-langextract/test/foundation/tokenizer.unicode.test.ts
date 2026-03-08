import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { Tokenizer, UnicodeTokenizerLive } from "../../src/index.js"

describe("Unicode tokenizer layer", () => {
  it.effect("segments non-ASCII words and scripts", () =>
    Effect.gen(function* () {
      const tokenizer = yield* Tokenizer
      const tokenized = tokenizer.tokenize("naive cafe 東京で会いましょう。")
      const tokenTexts = tokenized.tokens.map((token) => token.text)

      expect(tokenTexts.some((token) => token.includes("東京"))).toBe(true)
      expect(tokenTexts.some((token) => token === "naive")).toBe(true)
      expect(tokenTexts.some((token) => token === "cafe")).toBe(true)
    }).pipe(Effect.provide(UnicodeTokenizerLive))
  )

  it.effect("preserves firstTokenAfterNewline markers", () =>
    Effect.gen(function* () {
      const tokenizer = yield* Tokenizer
      const tokenized = tokenizer.tokenize("Hello\nこんにちは\nWorld")

      const newlineFollower = tokenized.tokens.find(
        (token) => token.text.includes("こんにちは")
      )
      expect(newlineFollower?.firstTokenAfterNewline).toBe(true)
    }).pipe(Effect.provide(UnicodeTokenizerLive))
  )
})
