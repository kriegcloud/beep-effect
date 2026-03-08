import { Schema } from "effect"

export const FormatType = Schema.Literal("json", "yaml")
export type FormatType = typeof FormatType.Type

export const CacheStatus = Schema.Literal("miss", "hit")
export type CacheStatus = typeof CacheStatus.Type

export class ScoredOutput extends Schema.Class<ScoredOutput>("ScoredOutput")({
  score: Schema.optionalWith(Schema.Number, { exact: true }),
  output: Schema.optionalWith(Schema.String, { exact: true }),
  provider: Schema.optionalWith(Schema.String, { exact: true }),
  cacheStatus: Schema.optionalWith(CacheStatus, { exact: true }),
  cacheKey: Schema.optionalWith(Schema.String, { exact: true })
}) {}
