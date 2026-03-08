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
export class AgentRpcs extends RpcGroup.make(
  Rpc.make("QueryStream", {
    payload: QueryInput,
    success: SdkSchema.SDKMessage,
    error: AgentServiceError,
    stream: true,
  }),
  Rpc.make("QueryResult", {
    payload: QueryInput,
    success: QueryResultOutput,
    error: AgentServiceError,
  }),
  Rpc.make("Stats", {
    success: QuerySupervisorStats,
  }),
  Rpc.make("InterruptAll", {
    success: S.Void,
    error: AgentSdkError,
  }),
  Rpc.make("SupportedModels", {
    success: S.Array(SdkSchema.ModelInfo),
    error: AgentServiceError,
  }),
  Rpc.make("SupportedCommands", {
    success: S.Array(SdkSchema.SlashCommand),
    error: AgentServiceError,
  }),
  Rpc.make("AccountInfo", {
    success: SdkSchema.AccountInfo,
    error: AgentServiceError,
  }),
  Rpc.make("CreateSession", {
    payload: SessionCreateInput,
    success: SessionCreateOutput,
    error: SessionServiceError,
  }),
  Rpc.make("ResumeSession", {
    payload: ResumeSessionInput,
    success: SessionCreateOutput,
    error: SessionServiceError,
  }),
  Rpc.make("SendSession", {
    payload: SessionSendRequest,
    success: S.Void,
    error: SessionServiceError,
  }),
  Rpc.make("SessionStream", {
    payload: SessionSelection,
    success: SdkSchema.SDKMessage,
    error: SessionServiceError,
    stream: true,
  }),
  Rpc.make("CloseSession", {
    payload: SessionSelection,
    success: S.Void,
    error: SessionServiceError,
  }),
  Rpc.make("ListSessionsByTenant", {
    payload: SessionTenantScope,
    success: S.Array(SessionInfo),
    error: SessionServiceError,
  }),
  Rpc.make("ListSessions", {
    success: S.Array(SessionInfo),
    error: SessionServiceError,
  })
) {}
