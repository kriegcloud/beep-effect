import * as S from "effect/Schema";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AgentSdkError } from "../Errors.js";
import { QuerySupervisorStats } from "../QuerySupervisor.js";
import * as SdkSchema from "../Schema/index.js";
import {
  QueryInput,
  QueryResultOutput,
  ResumeSessionInput,
  SessionCreateInput,
  SessionCreateOutput,
  SessionInfo,
  SessionSelection,
  SessionSendRequest,
  SessionTenantScope,
} from "../Schema/Service.js";
import { SessionServiceError } from "./SessionErrors.js";

/**
 * @since 0.0.0
 */
export const AgentServiceError = AgentSdkError.pipe(S.annotate({ identifier: "AgentServiceError" }));

/**
 * @since 0.0.0
 */
export type AgentServiceError = typeof AgentServiceError.Type;
/**
 * @since 0.0.0
 */
export type AgentServiceErrorEncoded = typeof AgentServiceError.Encoded;

/**
 * @since 0.0.0
 */
const ModelInfoList = S.Array(SdkSchema.ModelInfo);
const SlashCommandList = S.Array(SdkSchema.SlashCommand);
const SessionInfoList = S.Array(SessionInfo);
const SdkMessageSchema = SdkSchema.SDKMessage as S.Codec<SdkSchema.SDKMessage, SdkSchema.SDKMessageEncoded>;

const QueryStreamRpc = Rpc.make("QueryStream", {
  payload: QueryInput,
  success: SdkMessageSchema,
  error: AgentServiceError,
  stream: true,
});

const QueryResultRpc = Rpc.make("QueryResult", {
  payload: QueryInput,
  success: QueryResultOutput,
  error: AgentServiceError,
});

const StatsRpc = Rpc.make("Stats", {
  success: QuerySupervisorStats,
});

const InterruptAllRpc = Rpc.make("InterruptAll", {
  success: S.Void,
  error: AgentSdkError,
});

const SupportedModelsRpc = Rpc.make("SupportedModels", {
  success: ModelInfoList,
  error: AgentServiceError,
});

const SupportedCommandsRpc = Rpc.make("SupportedCommands", {
  success: SlashCommandList,
  error: AgentServiceError,
});

const AccountInfoRpc = Rpc.make("AccountInfo", {
  success: SdkSchema.AccountInfo,
  error: AgentServiceError,
});

const CreateSessionRpc = Rpc.make("CreateSession", {
  payload: SessionCreateInput,
  success: SessionCreateOutput,
  error: SessionServiceError,
});

const ResumeSessionRpc = Rpc.make("ResumeSession", {
  payload: ResumeSessionInput,
  success: SessionCreateOutput,
  error: SessionServiceError,
});

const SendSessionRpc = Rpc.make("SendSession", {
  payload: SessionSendRequest,
  success: S.Void,
  error: SessionServiceError,
});

const SessionStreamRpc = Rpc.make("SessionStream", {
  payload: SessionSelection,
  success: SdkMessageSchema,
  error: SessionServiceError,
  stream: true,
});

const CloseSessionRpc = Rpc.make("CloseSession", {
  payload: SessionSelection,
  success: S.Void,
  error: SessionServiceError,
});

const ListSessionsByTenantRpc = Rpc.make("ListSessionsByTenant", {
  payload: SessionTenantScope,
  success: SessionInfoList,
  error: SessionServiceError,
});

const ListSessionsRpc = Rpc.make("ListSessions", {
  success: SessionInfoList,
  error: SessionServiceError,
});

const AgentRpcsValue = RpcGroup.make(
  QueryStreamRpc,
  QueryResultRpc,
  StatsRpc,
  InterruptAllRpc,
  SupportedModelsRpc,
  SupportedCommandsRpc,
  AccountInfoRpc,
  CreateSessionRpc,
  ResumeSessionRpc,
  SendSessionRpc,
  SessionStreamRpc,
  CloseSessionRpc,
  ListSessionsByTenantRpc,
  ListSessionsRpc
);

export const AgentRpcs: typeof AgentRpcsValue = AgentRpcsValue;
