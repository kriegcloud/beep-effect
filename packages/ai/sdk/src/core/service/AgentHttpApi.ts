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

const QueryPayload = HttpApiSchema.asJson({ contentType: "application/json" })(QueryInput);
const ModelInfoList = S.Array(SdkSchema.ModelInfo);
const SlashCommandList = S.Array(SdkSchema.SlashCommand);
const SessionInfoList = S.Array(SessionInfo);

const QueryEndpoint = HttpApiEndpoint.post("query", "/query", {
  payload: QueryPayload,
  success: QueryResultOutput,
  error: AgentServiceError,
});

const StatsEndpoint = HttpApiEndpoint.get("stats", "/stats", {
  success: QuerySupervisorStats,
});

const InterruptAllEndpoint = HttpApiEndpoint.post("interruptAll", "/interrupt-all", {
  success: HttpApiSchema.NoContent,
  error: AgentServiceError,
});

const ModelsEndpoint = HttpApiEndpoint.get("models", "/models", {
  success: ModelInfoList,
  error: AgentServiceError,
});

const CommandsEndpoint = HttpApiEndpoint.get("commands", "/commands", {
  success: SlashCommandList,
  error: AgentServiceError,
});

const AccountEndpoint = HttpApiEndpoint.get("account", "/account", {
  success: SdkSchema.AccountInfo,
  error: AgentServiceError,
});

const StreamEndpoint = HttpApiEndpoint.get("stream", "/stream", {
  query: QueryStreamQuery,
  success: S.String,
  error: AgentServiceError,
});

const StreamPostEndpoint = HttpApiEndpoint.post("streamPost", "/stream", {
  payload: QueryInput,
  success: S.String,
  error: AgentServiceError,
});

const CreateSessionEndpoint = HttpApiEndpoint.post("createSession", "/sessions", {
  payload: SessionCreateInput,
  success: SessionCreateOutput,
  error: SessionServiceError,
});

const ListSessionsEndpoint = HttpApiEndpoint.get("listSessions", "/sessions", {
  query: SessionTenantScope,
  success: SessionInfoList,
  error: SessionServiceError,
});

const GetSessionEndpoint = HttpApiEndpoint.get("getSession", "/sessions/:id", {
  params: SessionPathParams,
  query: SessionTenantScope,
  success: SessionInfo,
  error: SessionServiceError,
});

const SendSessionEndpoint = HttpApiEndpoint.post("sendSession", "/sessions/:id/send", {
  params: SessionPathParams,
  payload: SessionSendInput,
  success: HttpApiSchema.NoContent,
  error: SessionServiceError,
});

const StreamSessionEndpoint = HttpApiEndpoint.get("streamSession", "/sessions/:id/stream", {
  params: SessionPathParams,
  query: SessionTenantScope,
  success: S.String,
  error: SessionServiceError,
});

const CloseSessionEndpoint = HttpApiEndpoint.delete("closeSession", "/sessions/:id", {
  params: SessionPathParams,
  query: SessionTenantScope,
  success: HttpApiSchema.NoContent,
  error: SessionServiceError,
});

const AgentHttpGroupValue = HttpApiGroup.make("agent", {
  topLevel: true,
}).add(
  QueryEndpoint,
  StatsEndpoint,
  InterruptAllEndpoint,
  ModelsEndpoint,
  CommandsEndpoint,
  AccountEndpoint,
  StreamEndpoint,
  StreamPostEndpoint,
  CreateSessionEndpoint,
  ListSessionsEndpoint,
  GetSessionEndpoint,
  SendSessionEndpoint,
  StreamSessionEndpoint,
  CloseSessionEndpoint
);

const AgentHttpGroup: typeof AgentHttpGroupValue = AgentHttpGroupValue;
const AgentHttpApiValue = HttpApi.make("agent").add(AgentHttpGroup);

/**
 * @since 0.0.0
 */
export const AgentHttpApi: typeof AgentHttpApiValue = AgentHttpApiValue;
