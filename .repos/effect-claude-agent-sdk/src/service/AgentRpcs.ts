import { Rpc, RpcGroup } from "@effect/rpc"
import * as Schema from "effect/Schema"
import { AgentSdkError } from "../Errors.js"
import { QuerySupervisorError, QuerySupervisorStatsSchema } from "../QuerySupervisor.js"
import * as SdkSchema from "../Schema/index.js"
import { QueryInput, QueryResultOutput } from "../Schema/Service.js"

export const AgentServiceError = Schema.Union(
  AgentSdkError,
  QuerySupervisorError
).pipe(Schema.annotations({ identifier: "AgentServiceError" }))

export type AgentServiceError = typeof AgentServiceError.Type
export type AgentServiceErrorEncoded = typeof AgentServiceError.Encoded

export class AgentRpcs extends RpcGroup.make(
  Rpc.make("QueryStream", {
    payload: QueryInput,
    success: SdkSchema.SDKMessage,
    error: AgentServiceError,
    stream: true
  }),
  Rpc.make("QueryResult", {
    payload: QueryInput,
    success: QueryResultOutput,
    error: AgentServiceError
  }),
  Rpc.make("Stats", {
    success: QuerySupervisorStatsSchema
  }),
  Rpc.make("InterruptAll", {
    success: Schema.Void,
    error: AgentSdkError
  }),
  Rpc.make("SupportedModels", {
    success: Schema.Array(SdkSchema.ModelInfo),
    error: AgentServiceError
  }),
  Rpc.make("SupportedCommands", {
    success: Schema.Array(SdkSchema.SlashCommand),
    error: AgentServiceError
  }),
  Rpc.make("AccountInfo", {
    success: SdkSchema.AccountInfo,
    error: AgentServiceError
  })
) {}
