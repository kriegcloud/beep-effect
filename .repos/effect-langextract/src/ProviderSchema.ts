import { Schema } from "effect"

import { FormatType } from "./FormatType.js"

export class BaseSchema extends Schema.Class<BaseSchema>("BaseSchema")({
  formatType: Schema.optionalWith(FormatType, {
    default: () => "json" as const
  })
}) {}

export class FormatModeSchema extends Schema.Class<FormatModeSchema>("FormatModeSchema")({
  formatType: FormatType,
  useFences: Schema.optionalWith(Schema.Boolean, {
    default: () => false
  })
}) {}

export type ProviderSchema = BaseSchema | FormatModeSchema
