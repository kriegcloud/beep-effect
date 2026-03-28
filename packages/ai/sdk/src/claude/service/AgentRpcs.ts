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
import { AgentServerAccessError } from "./AgentServerAccess.js";
import { SessionServiceError } from "./SessionErrors.js";

/**
 * @since 0.0.0
 * @category Integration
 */
export const AgentServiceError = S.Union([AgentSdkError, AgentServerAccessError]).pipe(
  S.annotate({ identifier: "AgentServiceError" })
);

/**
 * @since 0.0.0
 * @category Integration
 */
export type AgentServiceError = typeof AgentServiceError.Type;
/**
 * @since 0.0.0
 * @category Integration
 */
export type AgentServiceErrorEncoded = typeof AgentServiceError.Encoded;

type SdkMessage = typeof SdkSchema.SDKMessage.Type;
type SdkMessageEncoded = typeof SdkSchema.SDKMessage.Encoded;

const ModelInfoList = S.Array(SdkSchema.ModelInfo);
const SlashCommandList = S.Array(SdkSchema.SlashCommand);
const SessionInfoList = S.Array(SessionInfo);
const SdkMessage: S.Codec<SdkMessage, SdkMessageEncoded> = SdkSchema.SDKMessage;

const QueryStreamRpc = Rpc.make("QueryStream", {
  payload: QueryInput,
  success: SdkMessage,
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
  error: AgentServiceError,
});

const InterruptAllRpc = Rpc.make("InterruptAll", {
  success: S.Void,
  error: AgentServiceError,
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
  success: SdkMessage,
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

const AgentRpcMembers: readonly [
  typeof QueryStreamRpc,
  typeof QueryResultRpc,
  typeof StatsRpc,
  typeof InterruptAllRpc,
  typeof SupportedModelsRpc,
  typeof SupportedCommandsRpc,
  typeof AccountInfoRpc,
  typeof CreateSessionRpc,
  typeof ResumeSessionRpc,
  typeof SendSessionRpc,
  typeof SessionStreamRpc,
  typeof CloseSessionRpc,
  typeof ListSessionsByTenantRpc,
  typeof ListSessionsRpc,
] = [
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
  ListSessionsRpc,
];

const AgentRpcsValue: RpcGroup.RpcGroup<(typeof AgentRpcMembers)[number]> = RpcGroup.make(...AgentRpcMembers);

/**
 * @since 0.0.0
 * @category Integration
 */
export const AgentRpcs: typeof AgentRpcsValue = AgentRpcsValue;
