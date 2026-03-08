import { Schema } from "effect"
import {
  BridgeCall,
  ExecError,
  ExecResult,
  GetVarResult,
  ListVarsResult,
  SetVarAck,
  SetVarError,
  WorkerLog
} from "./SandboxProtocol"

const ToolDescriptorSchema = Schema.Struct({
  name: Schema.String,
  parameterNames: Schema.Array(Schema.String),
  description: Schema.String
})

const InitPayloadSchema = {
  callId: Schema.String,
  depth: Schema.Number,
  sandboxMode: Schema.optional(Schema.Literal("permissive", "strict")),
  hasMediaAttachments: Schema.optional(Schema.Boolean),
  maxFrameBytes: Schema.optional(Schema.Number.pipe(
    Schema.int(),
    Schema.positive(),
    Schema.lessThanOrEqualTo(64 * 1024 * 1024)
  )),
  tools: Schema.optional(Schema.Array(ToolDescriptorSchema)),
  sandboxWorkDir: Schema.optional(Schema.String)
}

export const RunnerWorkerFrame = Schema.Union(
  ExecResult,
  ExecError,
  SetVarAck,
  SetVarError,
  GetVarResult,
  ListVarsResult,
  BridgeCall,
  WorkerLog
)
export type RunnerWorkerFrame = typeof RunnerWorkerFrame.Type

export class RunnerInitRequest extends Schema.TaggedRequest<RunnerInitRequest>()("Init", {
  failure: Schema.String,
  success: Schema.Void,
  payload: InitPayloadSchema
}) {}

export class RunnerExecRequest extends Schema.TaggedRequest<RunnerExecRequest>()("ExecRequest", {
  failure: Schema.String,
  success: RunnerWorkerFrame,
  payload: {
    requestId: Schema.String,
    code: Schema.String
  }
}) {}

export class RunnerSetVarRequest extends Schema.TaggedRequest<RunnerSetVarRequest>()("SetVar", {
  failure: Schema.String,
  success: Schema.Union(SetVarAck, SetVarError),
  payload: {
    requestId: Schema.String,
    name: Schema.String,
    value: Schema.Unknown
  }
}) {}

export class RunnerGetVarRequest extends Schema.TaggedRequest<RunnerGetVarRequest>()("GetVarRequest", {
  failure: Schema.String,
  success: GetVarResult,
  payload: {
    requestId: Schema.String,
    name: Schema.String
  }
}) {}

export class RunnerListVarsRequest extends Schema.TaggedRequest<RunnerListVarsRequest>()("ListVarsRequest", {
  failure: Schema.String,
  success: ListVarsResult,
  payload: {
    requestId: Schema.String
  }
}) {}

export class RunnerBridgeResultRequest extends Schema.TaggedRequest<RunnerBridgeResultRequest>()("BridgeResult", {
  failure: Schema.String,
  success: Schema.Void,
  payload: {
    requestId: Schema.String,
    result: Schema.Unknown
  }
}) {}

export class RunnerBridgeFailedRequest extends Schema.TaggedRequest<RunnerBridgeFailedRequest>()("BridgeFailed", {
  failure: Schema.String,
  success: Schema.Void,
  payload: {
    requestId: Schema.String,
    message: Schema.String
  }
}) {}

export class RunnerShutdownRequest extends Schema.TaggedRequest<RunnerShutdownRequest>()("Shutdown", {
  failure: Schema.String,
  success: Schema.Void,
  payload: {}
}) {}

export const SandboxWorkerRunnerRequest = Schema.Union(
  RunnerInitRequest,
  RunnerExecRequest,
  RunnerSetVarRequest,
  RunnerGetVarRequest,
  RunnerListVarsRequest,
  RunnerBridgeResultRequest,
  RunnerBridgeFailedRequest,
  RunnerShutdownRequest
)
export type SandboxWorkerRunnerRequest = typeof SandboxWorkerRunnerRequest.Type
