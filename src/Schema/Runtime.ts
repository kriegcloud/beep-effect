import * as Schema from "effect/Schema"

export type AbortControllerLike = {
  signal: unknown
}

export const AbortController = Schema.declare(
  (_: unknown): _ is AbortControllerLike => typeof _ === "object" && _ !== null && "signal" in _
).pipe(Schema.annotations({ identifier: "AbortController", jsonSchema: {} }))

export type AbortController = typeof AbortController.Type
export type AbortControllerEncoded = typeof AbortController.Encoded

export const StderrCallback = Schema.declare(
  (_: unknown): _ is ((data: string) => void) => true
).pipe(Schema.annotations({ identifier: "StderrCallback", jsonSchema: {} }))

export type StderrCallback = typeof StderrCallback.Type
export type StderrCallbackEncoded = typeof StderrCallback.Encoded

export const SpawnedProcess = Schema.declare((_: unknown): _ is unknown => true).pipe(
  Schema.annotations({ identifier: "SpawnedProcess", jsonSchema: {} })
)

export type SpawnedProcess = typeof SpawnedProcess.Type
export type SpawnedProcessEncoded = typeof SpawnedProcess.Encoded

export const SpawnClaudeCodeProcess = Schema.declare(
  (_: unknown): _ is ((options: unknown) => SpawnedProcess) => true
).pipe(Schema.annotations({ identifier: "SpawnClaudeCodeProcess", jsonSchema: {} }))

export type SpawnClaudeCodeProcess = typeof SpawnClaudeCodeProcess.Type
export type SpawnClaudeCodeProcessEncoded = typeof SpawnClaudeCodeProcess.Encoded
