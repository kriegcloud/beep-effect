import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { Tokenizer } from "../../src/Tokenizer.js"
import { TokenizerContractTestLayer } from "../layers/tokenizer.test-layer.js"

describe("@effect/vitest smoke", () => {
  it.effect("runs Effect test with provided test layer", () =>
    Effect.gen(function* () {
      const tokenizer = yield* Tokenizer
      const tokenized = tokenizer.tokenize("alpha beta gamma")
      expect(tokenized.tokens.length).toBe(3)
    }).pipe(Effect.provide(TokenizerContractTestLayer))
  )
})
