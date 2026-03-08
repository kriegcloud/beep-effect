import { Effect, Layer, Schema } from "effect"
import YAML from "yaml"

import { EXTRACTIONS_KEY } from "./Data.js"
import { Extraction } from "./Data.js"
import { FormatParseError } from "./Errors.js"
import { FormatType } from "./FormatType.js"
import { errorMessage } from "./internal/errorMessage.js"
import { asRecord } from "./internal/records.js"

export class FormatHandlerConfig extends Schema.Class<FormatHandlerConfig>("FormatHandlerConfig")({
  formatType: Schema.optionalWith(FormatType, {
    default: () => "json" as const
  }),
  useWrapper: Schema.optionalWith(Schema.Boolean, { default: () => true }),
  wrapperKey: Schema.optionalWith(Schema.String, { exact: true }),
  useFences: Schema.optionalWith(Schema.Boolean, { default: () => true }),
  attributeSuffix: Schema.optionalWith(Schema.String, {
    default: () => "_attributes"
  }),
  strictFences: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  allowTopLevelList: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  })
}) {}

export interface FormatHandlerService {
  readonly formatExtractionExample: (extractions: ReadonlyArray<Extraction>) => string
  readonly parseOutput: (
    text: string,
    options?: { strict?: boolean }
  ) => Effect.Effect<ReadonlyArray<Record<string, unknown>>, FormatParseError>
  readonly config: FormatHandlerConfig
}

const JsonString = Schema.parseJson()

type SupportedFormat = "json" | "yaml"

const FencePattern = /```(?:(json|yaml|yml))?\s*([\s\S]*?)```/gi

const toFormatParseError = (message: string): FormatParseError =>
  new FormatParseError({ message })

const parseJsonCandidate = (
  text: string
): Effect.Effect<unknown, FormatParseError> =>
  Schema.decodeUnknown(JsonString)(text).pipe(
    Effect.mapError(
      (error) =>
        toFormatParseError(`Failed parsing JSON output: ${String(error)}`)
    )
  )

const parseYamlCandidate = (
  text: string
): Effect.Effect<unknown, FormatParseError> =>
  Effect.try({
    try: () => YAML.parse(text),
    catch: (error) =>
      toFormatParseError(`Failed parsing YAML output: ${String(error)}`)
  })

const parseWithFormat = (
  text: string,
  format: SupportedFormat
): Effect.Effect<unknown, FormatParseError> =>
  format === "json" ? parseJsonCandidate(text) : parseYamlCandidate(text)

const selectFencedCandidate = (
  text: string,
  format: SupportedFormat
): string | undefined => {
  const matches = [...text.matchAll(FencePattern)].map((match) => ({
    language:
      match[1]?.toLowerCase() === "yml"
        ? "yaml"
        : (match[1]?.toLowerCase() as SupportedFormat | undefined),
    body: (match[2] ?? "").trim()
  }))

  const sameFormat = matches.find((match) => match.language === format)
  if (sameFormat?.body.length) {
    return sameFormat.body
  }

  const unlabeled = matches.find(
    (match) => match.language === undefined && match.body.length > 0
  )
  if (unlabeled?.body.length) {
    return unlabeled.body
  }

  const fallback = matches.find((match) => match.body.length > 0)
  return fallback?.body
}

const toStringArray = (value: unknown): ReadonlyArray<string> | undefined => {
  if (!Array.isArray(value)) {
    return undefined
  }
  const mapped = value
    .map((entry) => (typeof entry === "string" ? entry : String(entry)))
    .filter((entry) => entry.length > 0)
  return mapped.length > 0 ? mapped : undefined
}

const toAttributeValue = (
  value: unknown
): string | ReadonlyArray<string> | undefined => {
  if (typeof value === "string") {
    return value
  }
  const asArray = toStringArray(value)
  if (asArray !== undefined) {
    return asArray
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value)
  }
  return undefined
}

const normalizeRecordAttributes = (
  record: Record<string, unknown>,
  attributeSuffix: string
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {}
  const attributes: Record<string, string | ReadonlyArray<string>> = {}

  const existingAttributes = asRecord(record.attributes)
  if (existingAttributes !== undefined) {
    for (const [key, value] of Object.entries(existingAttributes)) {
      const coerced = toAttributeValue(value)
      if (coerced !== undefined) {
        attributes[key] = coerced
      }
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (key === "attributes") {
      continue
    }

    if (key.endsWith(attributeSuffix)) {
      const nested = asRecord(value)
      if (nested !== undefined) {
        for (const [attrKey, attrValue] of Object.entries(nested)) {
          const coerced = toAttributeValue(attrValue)
          if (coerced !== undefined) {
            attributes[attrKey] = coerced
          }
        }
      }
      continue
    }

    normalized[key] = value
  }

  if (Object.keys(attributes).length > 0) {
    normalized.attributes = attributes
  }

  return normalized
}

const normalizeRecordArray = (
  parsed: unknown,
  config: FormatHandlerConfig
): Effect.Effect<ReadonlyArray<Record<string, unknown>>, FormatParseError> =>
  Effect.gen(function* () {
    if (Array.isArray(parsed)) {
      if (!config.allowTopLevelList) {
        return yield* toFormatParseError(
          "Top-level list output is disabled by allowTopLevelList=false."
        )
      }
      return parsed
        .map(asRecord)
        .filter((item): item is Record<string, unknown> => item !== undefined)
        .map((item) => normalizeRecordAttributes(item, config.attributeSuffix))
    }

    const parsedRecord = asRecord(parsed)
    if (parsedRecord === undefined) {
      return yield* toFormatParseError(
        "Model output did not decode into an object or array."
      )
    }

    if (config.useWrapper) {
      const keys = [config.wrapperKey, EXTRACTIONS_KEY].filter(
        (key): key is string => key !== undefined && key.length > 0
      )

      for (const key of keys) {
        const value = parsedRecord[key]
        if (value === undefined) {
          continue
        }
        if (!Array.isArray(value)) {
          return yield* toFormatParseError(
            `Wrapper key '${key}' must contain an array when useWrapper=true.`
          )
        }
        return value
          .map(asRecord)
          .filter((item): item is Record<string, unknown> => item !== undefined)
          .map((item) => normalizeRecordAttributes(item, config.attributeSuffix))
      }
    }

    return [normalizeRecordAttributes(parsedRecord, config.attributeSuffix)]
  })

const parseOutputStrict = (
  text: string,
  config: FormatHandlerConfig,
  strict: boolean
): Effect.Effect<ReadonlyArray<Record<string, unknown>>, FormatParseError> =>
  Effect.gen(function* () {
    const primaryFormat = config.formatType as SupportedFormat
    const fallbackFormat: SupportedFormat =
      primaryFormat === "json" ? "yaml" : "json"

    const candidate = config.useFences
      ? selectFencedCandidate(text, primaryFormat)
      : undefined

    if (config.useFences && strict && candidate === undefined) {
      return yield* toFormatParseError(
        "Expected fenced model output but did not find a fenced block."
      )
    }

    const source = (candidate ?? text).trim()
    if (source.length === 0) {
      return []
    }

    const parsed = yield* parseWithFormat(source, primaryFormat).pipe(
      Effect.catchAll((primaryError) =>
        strict
          ? Effect.fail(primaryError)
          : parseWithFormat(source, fallbackFormat)
      )
    )

    return yield* normalizeRecordArray(parsed, config)
  })

const parseOutputImpl = (
  text: string,
  config: FormatHandlerConfig,
  options?: { strict?: boolean }
): Effect.Effect<ReadonlyArray<Record<string, unknown>>, FormatParseError> => {
  const strict = options?.strict ?? config.strictFences

  return parseOutputStrict(text, config, strict).pipe(
    Effect.tapError(() =>
      Effect.logDebug("langextract.format.parse_failed").pipe(
        Effect.annotateLogs({
          formatType: config.formatType,
          strict,
          useFences: config.useFences,
          strictFences: config.strictFences,
          allowTopLevelList: config.allowTopLevelList
        })
      )
    ),
    Effect.catchAll((error) =>
      strict ? Effect.fail(error) : Effect.succeed([])
    )
  )
}

const encodeExtractionExample = (extractions: ReadonlyArray<Extraction>): string => {
  try {
    return Schema.encodeSync(JsonString)(extractions)
  } catch (error) {
    Effect.runSync(
      Effect.logWarning("langextract.format.encode_failed").pipe(
        Effect.annotateLogs({ error: errorMessage(error), fallback: "[]" })
      )
    )
    return "[]"
  }
}

export const makeFormatHandler = (config: FormatHandlerConfig): FormatHandlerService => ({
  config,
  formatExtractionExample: encodeExtractionExample,
  parseOutput: (text, options) => parseOutputImpl(text, config, options)
})

export class FormatHandler extends Effect.Service<FormatHandler>()(
  "@effect-langextract/FormatHandler",
  {
    sync: () => makeFormatHandler(new FormatHandlerConfig({}))
  }
) {
  static readonly Test: Layer.Layer<FormatHandler> = FormatHandler.Default

  static testLayer = (
    config?: FormatHandlerConfig
  ): Layer.Layer<FormatHandler> =>
    makeFormatHandlerLayer(config ?? new FormatHandlerConfig({}))
}

export const makeFormatHandlerLayer = (
  config: FormatHandlerConfig
): Layer.Layer<FormatHandler> =>
  Layer.succeed(FormatHandler, FormatHandler.make(makeFormatHandler(config)))

export const FormatHandlerLive: Layer.Layer<FormatHandler> = FormatHandler.Default

export const FormatHandlerTest: Layer.Layer<FormatHandler> = FormatHandler.Test
