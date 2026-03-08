import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { FormatParseError } from "../../src/Errors.js"
import {
  FormatHandlerConfig,
  makeFormatHandler
} from "../../src/FormatHandler.js"

const parse = (
  raw: string,
  config: FormatHandlerConfig,
  strict?: boolean
): Effect.Effect<ReadonlyArray<Record<string, unknown>>, FormatParseError> =>
  makeFormatHandler(config).parseOutput(raw, strict !== undefined ? { strict } : undefined)

describe("FormatHandler parser parity", () => {
  it.effect("parses fenced JSON wrapper payload", () =>
    Effect.gen(function* () {
      const config = new FormatHandlerConfig({
        formatType: "json",
        useFences: true,
        useWrapper: true
      })

      const parsed = yield* parse(
        "```json\n{\"extractions\":[{\"extractionClass\":\"person\",\"extractionText\":\"Alice\"}]}\n```",
        config
      )

      expect(parsed.length).toBe(1)
      expect(parsed[0]?.extractionClass).toBe("person")
      expect(parsed[0]?.extractionText).toBe("Alice")
    })
  )

  it.effect("parses YAML payload and maps *_attributes into attributes", () =>
    Effect.gen(function* () {
      const config = new FormatHandlerConfig({
        formatType: "yaml",
        useWrapper: false,
        attributeSuffix: "_attributes"
      })

      const parsed = yield* parse(
        [
          "extractionClass: person",
          "extractionText: Alice",
          "person_attributes:",
          "  role: scientist",
          "  aliases:",
          "    - Dr. Alice"
        ].join("\n"),
        config
      )

      expect(parsed.length).toBe(1)
      expect(parsed[0]?.extractionClass).toBe("person")
      const attributes = parsed[0]?.attributes as
        | Record<string, string | ReadonlyArray<string>>
        | undefined
      expect(attributes?.role).toBe("scientist")
      expect(Array.isArray(attributes?.aliases)).toBe(true)
    })
  )

  it.effect("falls back to alternate parser in non-strict mode", () =>
    Effect.gen(function* () {
      const config = new FormatHandlerConfig({
        formatType: "yaml",
        useFences: false,
        useWrapper: false
      })

      const parsed = yield* parse(
        "{\"extractionClass\":\"location\",\"extractionText\":\"Paris\"}",
        config,
        false
      )

      expect(parsed.length).toBe(1)
      expect(parsed[0]?.extractionClass).toBe("location")
    })
  )

  it.effect("fails when strict fences are required but missing", () =>
    parse(
      "{\"extractionClass\":\"person\",\"extractionText\":\"Alice\"}",
      new FormatHandlerConfig({
        formatType: "json",
        useFences: true,
        strictFences: true
      }),
      true
    ).pipe(
      Effect.flip,
      Effect.tap((error) =>
        Effect.sync(() => {
          expect(error.message).toContain("Expected fenced model output")
        })
      ),
      Effect.asVoid
    )
  )

  it.effect("rejects top-level arrays when allowTopLevelList=false", () =>
    parse(
      '[{"extractionClass":"person","extractionText":"Alice"}]',
      new FormatHandlerConfig({
        formatType: "json",
        useFences: false,
        allowTopLevelList: false,
        useWrapper: false
      }),
      true
    ).pipe(
      Effect.flip,
      Effect.tap((error) =>
        Effect.sync(() => {
          expect(error.message).toContain("Top-level list output is disabled")
        })
      ),
      Effect.asVoid
    )
  )
})
