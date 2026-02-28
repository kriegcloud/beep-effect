import * as Schema from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import { QuerySupervisorStatsSchema } from "../QuerySupervisor.js";
import * as SdkSchema from "../Schema/index.js";
import {
  QueryInput,
  QueryResultOutput,
  SessionCreateInput,
  SessionCreateOutput,
  SessionInfo,
  SessionSendInput,
  Tenant,
} from "../Schema/Service.js";
import { AgentServiceError } from "./AgentRpcs.js";
import { SessionServiceError } from "./SessionErrors.js";

class AgentHttpGroup extends HttpApiGroup.make("agent", { topLevel: true })
  .add(
    HttpApiEndpoint.post("query", "/query", {
      payload: HttpApiSchema.asJson({ contentType: "application/json" })(QueryInput),
      success: QueryResultOutput,
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("stats", "/stats", {
      success: QuerySupervisorStatsSchema,
    })
  )
  .add(
    HttpApiEndpoint.post("interruptAll", "/interrupt-all", {
      success: HttpApiSchema.NoContent,
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("models", "/models", {
      success: Schema.Array(SdkSchema.ModelInfo),
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("commands", "/commands", {
      success: Schema.Array(SdkSchema.SlashCommand),
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("account", "/account", {
      success: SdkSchema.AccountInfo,
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("stream", "/stream", {
      query: Schema.Struct({ prompt: Schema.String }),
      success: Schema.String,
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("streamPost", "/stream", {
      payload: QueryInput,
      success: Schema.String,
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("createSession", "/sessions", {
      payload: SessionCreateInput,
      success: SessionCreateOutput,
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("listSessions", "/sessions", {
      query: Schema.Struct({ tenant: Schema.optional(Tenant) }),
      success: Schema.Array(SessionInfo),
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("getSession", "/sessions/:id", {
      params: Schema.Struct({ id: Schema.String }),
      query: Schema.Struct({ tenant: Schema.optional(Tenant) }),
      success: SessionInfo,
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("sendSession", "/sessions/:id/send", {
      params: Schema.Struct({ id: Schema.String }),
      payload: SessionSendInput,
      success: HttpApiSchema.NoContent,
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("streamSession", "/sessions/:id/stream", {
      params: Schema.Struct({ id: Schema.String }),
      query: Schema.Struct({ tenant: Schema.optional(Tenant) }),
      success: Schema.String,
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.delete("closeSession", "/sessions/:id", {
      params: Schema.Struct({ id: Schema.String }),
      query: Schema.Struct({ tenant: Schema.optional(Tenant) }),
      success: HttpApiSchema.NoContent,
      error: SessionServiceError,
    })
  ) {}

/**
 * @since 0.0.0
 */
export class AgentHttpApi extends HttpApi.make("agent").add(AgentHttpGroup) {}
