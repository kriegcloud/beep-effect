import * as S from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import { QuerySupervisorStats } from "../QuerySupervisor.js";
import * as SdkSchema from "../Schema/index.js";
import {
  QueryInput,
  QueryResultOutput,
  QueryStreamQuery,
  SessionCreateInput,
  SessionCreateOutput,
  SessionInfo,
  SessionPathParams,
  SessionSendInput,
  SessionTenantScope,
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
      success: QuerySupervisorStats,
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
      success: S.Array(SdkSchema.ModelInfo),
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("commands", "/commands", {
      success: S.Array(SdkSchema.SlashCommand),
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
      query: QueryStreamQuery,
      success: S.String,
      error: AgentServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("streamPost", "/stream", {
      payload: QueryInput,
      success: S.String,
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
      query: SessionTenantScope,
      success: S.Array(SessionInfo),
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("getSession", "/sessions/:id", {
      params: SessionPathParams,
      query: SessionTenantScope,
      success: SessionInfo,
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.post("sendSession", "/sessions/:id/send", {
      params: SessionPathParams,
      payload: SessionSendInput,
      success: HttpApiSchema.NoContent,
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.get("streamSession", "/sessions/:id/stream", {
      params: SessionPathParams,
      query: SessionTenantScope,
      success: S.String,
      error: SessionServiceError,
    })
  )
  .add(
    HttpApiEndpoint.delete("closeSession", "/sessions/:id", {
      params: SessionPathParams,
      query: SessionTenantScope,
      success: HttpApiSchema.NoContent,
      error: SessionServiceError,
    })
  ) {}

/**
 * @since 0.0.0
 */
export class AgentHttpApi extends HttpApi.make("agent").add(AgentHttpGroup) {}
