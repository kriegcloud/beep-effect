import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { resolveExtractCommandConfig } from "../../src/Cli.js"

describe("CLI config precedence", () => {
  it.effect("applies CLI flags over environment values", () =>
    Effect.gen(function* () {
      const config = yield* resolveExtractCommandConfig(
        {
          provider: "gemini",
          modelId: "gemini-2.5-flash",
          prompt: "CLI prompt"
        },
        {
          LANGEXTRACT_PROVIDER: "openai",
          MODEL_ID: "gpt-4o-mini",
          PROMPT_DESCRIPTION: "ENV prompt"
        }
      )

      expect(config.provider).toBe("gemini")
      expect(config.modelId).toBe("gemini-2.5-flash")
      expect(config.prompt).toBe("CLI prompt")
    })
  )

  it.effect("applies env values when CLI options are absent", () =>
    Effect.gen(function* () {
      const config = yield* resolveExtractCommandConfig(
        {},
        {
          LANGEXTRACT_PROVIDER: "ollama",
          MODEL_ID: "llama3.2:latest",
          OLLAMA_BASE_URL: "http://localhost:11435"
        }
      )

      expect(config.provider).toBe("ollama")
      expect(config.modelId).toBe("llama3.2:latest")
      expect(config.ollamaBaseUrl).toBe("http://localhost:11435")
    })
  )

  it.effect("falls back to defaults when CLI and env are absent", () =>
    Effect.gen(function* () {
      const config = yield* resolveExtractCommandConfig({}, {})

      expect(config.provider).toBe("gemini")
      expect(config.modelId).toBe("gemini-2.5-flash")
      expect(config.output).toBe("json")
    })
  )

  it.effect("fails with typed config error when env value is invalid", () =>
    resolveExtractCommandConfig(
      {},
      {
        MAX_CHAR_BUFFER: "not-a-number"
      }
    ).pipe(
      Effect.flip,
      Effect.tap((error) =>
        Effect.sync(() => {
          expect(error.message).toContain("MAX_CHAR_BUFFER")
        })
      ),
      Effect.asVoid
    )
  )

  it.effect("preserves CLI precedence for provider-specific credentials", () =>
    Effect.gen(function* () {
      const config = yield* resolveExtractCommandConfig(
        {
          provider: "openai",
          modelId: "gpt-4o-mini",
          openAiApiKey: "cli-key"
        },
        {
          OPENAI_API_KEY: "env-key"
        }
      )

      expect(config.openAiApiKey).toBe("cli-key")
    })
  )
})
