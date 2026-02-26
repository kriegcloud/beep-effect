import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema
} from "@effect/platform"
import * as Schema from "effect/Schema"
import { QuerySupervisorStatsSchema } from "../QuerySupervisor.js"
import * as SdkSchema from "../Schema/index.js"
import {
  QueryInput,
  QueryResultOutput,
  SessionCreateInput,
  SessionCreateOutput,
  SessionInfo,
  SessionSendInput,
  Tenant
} from "../Schema/Service.js"
import { AgentServiceError } from "./AgentRpcs.js"
import { SessionServiceError } from "./SessionErrors.js"

class AgentHttpGroup extends HttpApiGroup.make("agent", { topLevel: true })
  .add(
    HttpApiEndpoint.post("query", "/query")
      .setPayload(QueryInput)
      .addSuccess(QueryResultOutput)
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("stats", "/stats")
      .addSuccess(QuerySupervisorStatsSchema)
  )
  .add(
    HttpApiEndpoint.post("interruptAll", "/interrupt-all")
      .addSuccess(HttpApiSchema.NoContent)
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("models", "/models")
      .addSuccess(Schema.Array(SdkSchema.ModelInfo))
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("commands", "/commands")
      .addSuccess(Schema.Array(SdkSchema.SlashCommand))
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("account", "/account")
      .addSuccess(SdkSchema.AccountInfo)
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.get("stream", "/stream")
      .setUrlParams(Schema.Struct({ prompt: Schema.String }))
      .addSuccess(Schema.String)
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.post("streamPost", "/stream")
      .setPayload(QueryInput)
      .addSuccess(Schema.String)
      .addError(AgentServiceError)
  )
  .add(
    HttpApiEndpoint.post("createSession", "/sessions")
      .setPayload(SessionCreateInput)
      .addSuccess(SessionCreateOutput)
      .addError(SessionServiceError)
  )
  .add(
    HttpApiEndpoint.get("listSessions", "/sessions")
      .setUrlParams(Schema.Struct({ tenant: Schema.optional(Tenant) }))
      .addSuccess(Schema.Array(SessionInfo))
      .addError(SessionServiceError)
  )
  .add(
    HttpApiEndpoint.get("getSession", "/sessions/:id")
      .setUrlParams(Schema.Struct({ id: Schema.String, tenant: Schema.optional(Tenant) }))
      .addSuccess(SessionInfo)
      .addError(SessionServiceError)
  )
  .add(
    HttpApiEndpoint.post("sendSession", "/sessions/:id/send")
      .setUrlParams(Schema.Struct({ id: Schema.String }))
      .setPayload(SessionSendInput)
      .addSuccess(HttpApiSchema.NoContent)
      .addError(SessionServiceError)
  )
  .add(
    HttpApiEndpoint.get("streamSession", "/sessions/:id/stream")
      .setUrlParams(Schema.Struct({ id: Schema.String, tenant: Schema.optional(Tenant) }))
      .addSuccess(Schema.String)
      .addError(SessionServiceError)
  )
  .add(
    HttpApiEndpoint.del("closeSession", "/sessions/:id")
      .setUrlParams(Schema.Struct({ id: Schema.String, tenant: Schema.optional(Tenant) }))
      .addSuccess(HttpApiSchema.NoContent)
      .addError(SessionServiceError)
  )
{}

export class AgentHttpApi extends HttpApi.make("agent") // top-level routes
  .add(AgentHttpGroup)
{}
