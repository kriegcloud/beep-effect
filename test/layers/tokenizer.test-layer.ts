import { Layer } from "effect"

import type { TokenizerService } from "../../src/Tokenizer.js"
import { Tokenizer } from "../../src/Tokenizer.js"

export const makeTokenizerTestLayer = (
  service: TokenizerService
): Layer.Layer<Tokenizer> => Tokenizer.testLayer(service)

export const TokenizerContractTestLayer: Layer.Layer<Tokenizer> = Tokenizer.Test
