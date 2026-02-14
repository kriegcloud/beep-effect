import * as Schema from "effect/Schema"

export const toolInputParseOptions = {
  onExcessProperty: "error" as const,
  exact: true as const
}

export const sdkMessageParseOptions = {
  onExcessProperty: "preserve" as const
}

export const withIdentifier = <S extends Schema.Schema.Any>(
  schema: S,
  identifier: string
): S =>
  schema.pipe(
    Schema.annotations({
      identifier
    })
  ) as S

// Strict tool input decode: reject unknown fields unless schema allows them.
export const withToolInput = <S extends Schema.Schema.Any>(
  schema: S,
  identifier: string
): S =>
  schema.pipe(
    Schema.annotations({
      identifier,
      parseOptions: toolInputParseOptions
    })
  ) as S

export const withSdkMessage = <S extends Schema.Schema.Any>(
  schema: S,
  identifier: string
): S =>
  schema.pipe(
    Schema.annotations({
      identifier,
      parseOptions: sdkMessageParseOptions
    })
  ) as S
