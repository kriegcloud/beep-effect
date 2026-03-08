import { Schema } from "effect"

// --- Host → Worker Messages ---

export class ExecRequest extends Schema.TaggedStruct("ExecRequest", {
  requestId: Schema.String,
  code: Schema.String
}) {}

export class SetVar extends Schema.TaggedStruct("SetVar", {
  requestId: Schema.String,
  name: Schema.String,
  value: Schema.Unknown
}) {}

export class GetVarRequest extends Schema.TaggedStruct("GetVarRequest", {
  requestId: Schema.String,
  name: Schema.String
}) {}

export class ListVarsRequest extends Schema.TaggedStruct("ListVarsRequest", {
  requestId: Schema.String
}) {}

export class BridgeResult extends Schema.TaggedStruct("BridgeResult", {
  requestId: Schema.String,
  result: Schema.Unknown
}) {}

export class BridgeFailed extends Schema.TaggedStruct("BridgeFailed", {
  requestId: Schema.String,
  message: Schema.String
}) {}

export class Init extends Schema.TaggedStruct("Init", {
  callId: Schema.String,
  depth: Schema.Number,
  sandboxMode: Schema.optional(Schema.Literal("permissive", "strict")),
  hasMediaAttachments: Schema.optional(Schema.Boolean),
  maxFrameBytes: Schema.optional(Schema.Number.pipe(
    Schema.int(),
    Schema.positive(),
    Schema.lessThanOrEqualTo(64 * 1024 * 1024)
  )),
  tools: Schema.optional(Schema.Array(Schema.Struct({
    name: Schema.String,
    parameterNames: Schema.Array(Schema.String),
    description: Schema.String
  })))
}) {}

export class Shutdown extends Schema.TaggedStruct("Shutdown", {}) {}

// --- Worker → Host Messages ---

export class ExecResult extends Schema.TaggedStruct("ExecResult", {
  requestId: Schema.String,
  output: Schema.String
}) {}

export class ExecError extends Schema.TaggedStruct("ExecError", {
  requestId: Schema.String,
  message: Schema.String,
  stack: Schema.optional(Schema.String)
}) {}

export class SetVarAck extends Schema.TaggedStruct("SetVarAck", {
  requestId: Schema.String
}) {}

export class SetVarError extends Schema.TaggedStruct("SetVarError", {
  requestId: Schema.String,
  message: Schema.String
}) {}

export class GetVarResult extends Schema.TaggedStruct("GetVarResult", {
  requestId: Schema.String,
  value: Schema.Unknown
}) {}

export class ListVarsResult extends Schema.TaggedStruct("ListVarsResult", {
  requestId: Schema.String,
  variables: Schema.Array(Schema.Struct({
    name: Schema.String,
    type: Schema.String,
    size: Schema.optional(Schema.Number),
    preview: Schema.String
  }))
}) {}

export class BridgeCall extends Schema.TaggedStruct("BridgeCall", {
  requestId: Schema.String,
  method: Schema.String,
  args: Schema.Array(Schema.Unknown)
}) {}

export class WorkerLog extends Schema.TaggedStruct("WorkerLog", {
  level: Schema.Literal("debug", "info", "warn", "error"),
  message: Schema.String
}) {}

// --- Union types ---

export const HostToWorker = Schema.Union(
  ExecRequest,
  SetVar,
  GetVarRequest,
  ListVarsRequest,
  BridgeResult,
  BridgeFailed,
  Init,
  Shutdown
)
export type HostToWorker = typeof HostToWorker.Type

export const WorkerToHost = Schema.Union(
  ExecResult,
  ExecError,
  SetVarAck,
  SetVarError,
  GetVarResult,
  ListVarsResult,
  BridgeCall,
  WorkerLog
)
export type WorkerToHost = typeof WorkerToHost.Type

export const decodeWorkerToHost = Schema.decodeUnknownSync(WorkerToHost)

// --- Frame size check (byte count) ---

export const checkFrameSize = (message: unknown, maxBytes: number): boolean => {
  try {
    return new TextEncoder().encode(JSON.stringify(message)).byteLength <= maxBytes
  } catch {
    // Non-serializable (BigInt, circular ref, etc.) — frame cannot be sent
    return false
  }
}
