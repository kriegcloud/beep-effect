import { Schema } from "effect"

export const HttpMethodSchema = Schema.Literals([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
])
export type HttpMethod = typeof HttpMethodSchema.Type

export const RetryPolicySchema = Schema.Struct({
  timeoutMs: Schema.Number,
  intervalMs: Schema.Number
})
export type RetryPolicy = typeof RetryPolicySchema.Type

export const RequestExpectationSchema = Schema.Struct({
  status: Schema.optionalKey(Schema.Number),
  textIncludes: Schema.optionalKey(Schema.Array(Schema.String)),
  jsonExists: Schema.optionalKey(Schema.Array(Schema.String)),
  jsonEquals: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
  jsonLengthAtLeast: Schema.optionalKey(Schema.Record(Schema.String, Schema.Number)),
  sseEventTypesInclude: Schema.optionalKey(Schema.Array(Schema.String)),
  sseDataIncludes: Schema.optionalKey(Schema.Array(Schema.String))
})
export type RequestExpectation = typeof RequestExpectationSchema.Type

export const SqlExpectationSchema = Schema.Struct({
  rowCount: Schema.optionalKey(Schema.Number),
  rowCountAtLeast: Schema.optionalKey(Schema.Number),
  firstRowEquals: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
  firstRowNumberAtLeast: Schema.optionalKey(Schema.Record(Schema.String, Schema.Number))
})
export type SqlExpectation = typeof SqlExpectationSchema.Type

export const SetVarsStepSchema = Schema.Struct({
  kind: Schema.Literal("set"),
  name: Schema.optionalKey(Schema.String),
  values: Schema.Record(Schema.String, Schema.Unknown)
})
export type SetVarsStep = typeof SetVarsStepSchema.Type

export const SleepStepSchema = Schema.Struct({
  kind: Schema.Literal("sleep"),
  name: Schema.optionalKey(Schema.String),
  ms: Schema.Number
})
export type SleepStep = typeof SleepStepSchema.Type

export const RequestStepSchema = Schema.Struct({
  kind: Schema.Literal("request"),
  name: Schema.optionalKey(Schema.String),
  method: HttpMethodSchema,
  path: Schema.String,
  headers: Schema.optionalKey(Schema.Record(Schema.String, Schema.String)),
  body: Schema.optionalKey(Schema.Unknown),
  responseType: Schema.optionalKey(Schema.Literals(["json", "text", "sse"])),
  expect: Schema.optionalKey(RequestExpectationSchema),
  capture: Schema.optionalKey(Schema.Record(Schema.String, Schema.String)),
  retry: Schema.optionalKey(RetryPolicySchema)
})
export type RequestStep = typeof RequestStepSchema.Type

export const SqlStepSchema = Schema.Struct({
  kind: Schema.Literal("sql"),
  name: Schema.optionalKey(Schema.String),
  query: Schema.String,
  expect: Schema.optionalKey(SqlExpectationSchema),
  capture: Schema.optionalKey(Schema.Record(Schema.String, Schema.String)),
  retry: Schema.optionalKey(RetryPolicySchema)
})
export type SqlStep = typeof SqlStepSchema.Type

export const FileExistsStepSchema = Schema.Struct({
  kind: Schema.Literal("file_exists"),
  name: Schema.optionalKey(Schema.String),
  path: Schema.String,
  expectExists: Schema.optionalKey(Schema.Boolean),
  retry: Schema.optionalKey(RetryPolicySchema)
})
export type FileExistsStep = typeof FileExistsStepSchema.Type

export type FixtureStep =
  | SetVarsStep
  | SleepStep
  | RequestStep
  | SqlStep
  | FileExistsStep
  | RepeatStep

export interface RepeatStep {
  readonly kind: "repeat"
  readonly name?: string
  readonly times: number
  readonly step: FixtureStep
}

const RepeatStepSchema: Schema.Schema<RepeatStep> = Schema.Struct({
  kind: Schema.Literal("repeat"),
  name: Schema.optionalKey(Schema.String),
  times: Schema.Number,
  step: Schema.suspend((): Schema.Schema<FixtureStep> => FixtureStepSchema)
}) as Schema.Schema<RepeatStep>

export const FixtureStepSchema: Schema.Schema<FixtureStep> = Schema.suspend(() =>
  Schema.Union([
    SetVarsStepSchema,
    SleepStepSchema,
    RequestStepSchema,
    SqlStepSchema,
    FileExistsStepSchema,
    RepeatStepSchema
  ])
) as Schema.Schema<FixtureStep>

export const FixtureFileSchema = Schema.Struct({
  version: Schema.Literal(1),
  name: Schema.String,
  description: Schema.optionalKey(Schema.String),
  initialVars: Schema.optionalKey(Schema.Record(Schema.String, Schema.Unknown)),
  steps: Schema.Array(FixtureStepSchema)
})
export type FixtureFile = typeof FixtureFileSchema.Type

export interface FixtureRunOptions {
  readonly fixturePath: string
  readonly baseUrl: string
  readonly dbPath: string | null
  readonly initialVars?: Record<string, unknown>
}

export interface FixtureRunStepResult {
  readonly index: number
  readonly name: string
  readonly kind: FixtureStep["kind"]
  readonly durationMs: number
}

export interface FixtureRunResult {
  readonly fixturePath: string
  readonly fixtureName: string
  readonly steps: ReadonlyArray<FixtureRunStepResult>
  readonly durationMs: number
  readonly finalVars: Readonly<Record<string, unknown>>
}
