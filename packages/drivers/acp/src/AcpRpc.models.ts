/**
 * ACP RPC definitions for the technical driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as Rpc from "effect/unstable/rpc/Rpc";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";
import { AGENT_METHODS, CLIENT_METHODS } from "./_generated/meta.gen.ts";
import * as AcpSchema from "./_generated/schema.gen.ts";

/**
 * RPC definition for `InitializeRpc`.
 *
 * @example
 * ```ts
 * import { InitializeRpc } from "@beep/acp/rpc"
 *
 * const method = InitializeRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const InitializeRpc = Rpc.make(AGENT_METHODS.initialize, {
  payload: AcpSchema.InitializeRequest,
  success: AcpSchema.InitializeResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `AuthenticateRpc`.
 *
 * @example
 * ```ts
 * import { AuthenticateRpc } from "@beep/acp/rpc"
 *
 * const method = AuthenticateRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const AuthenticateRpc = Rpc.make(AGENT_METHODS.authenticate, {
  payload: AcpSchema.AuthenticateRequest,
  success: AcpSchema.AuthenticateResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `LogoutRpc`.
 *
 * @example
 * ```ts
 * import { LogoutRpc } from "@beep/acp/rpc"
 *
 * const method = LogoutRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const LogoutRpc = Rpc.make(AGENT_METHODS.logout, {
  payload: AcpSchema.LogoutRequest,
  success: AcpSchema.LogoutResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `NewSessionRpc`.
 *
 * @example
 * ```ts
 * import { NewSessionRpc } from "@beep/acp/rpc"
 *
 * const method = NewSessionRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const NewSessionRpc = Rpc.make(AGENT_METHODS.session_new, {
  payload: AcpSchema.NewSessionRequest,
  success: AcpSchema.NewSessionResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `LoadSessionRpc`.
 *
 * @example
 * ```ts
 * import { LoadSessionRpc } from "@beep/acp/rpc"
 *
 * const method = LoadSessionRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const LoadSessionRpc = Rpc.make(AGENT_METHODS.session_load, {
  payload: AcpSchema.LoadSessionRequest,
  success: AcpSchema.LoadSessionResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `ListSessionsRpc`.
 *
 * @example
 * ```ts
 * import { ListSessionsRpc } from "@beep/acp/rpc"
 *
 * const method = ListSessionsRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ListSessionsRpc = Rpc.make(AGENT_METHODS.session_list, {
  payload: AcpSchema.ListSessionsRequest,
  success: AcpSchema.ListSessionsResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `ForkSessionRpc`.
 *
 * @example
 * ```ts
 * import { ForkSessionRpc } from "@beep/acp/rpc"
 *
 * const method = ForkSessionRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ForkSessionRpc = Rpc.make(AGENT_METHODS.session_fork, {
  payload: AcpSchema.ForkSessionRequest,
  success: AcpSchema.ForkSessionResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `ResumeSessionRpc`.
 *
 * @example
 * ```ts
 * import { ResumeSessionRpc } from "@beep/acp/rpc"
 *
 * const method = ResumeSessionRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ResumeSessionRpc = Rpc.make(AGENT_METHODS.session_resume, {
  payload: AcpSchema.ResumeSessionRequest,
  success: AcpSchema.ResumeSessionResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `CloseSessionRpc`.
 *
 * @example
 * ```ts
 * import { CloseSessionRpc } from "@beep/acp/rpc"
 *
 * const method = CloseSessionRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const CloseSessionRpc = Rpc.make(AGENT_METHODS.session_close, {
  payload: AcpSchema.CloseSessionRequest,
  success: AcpSchema.CloseSessionResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `PromptRpc`.
 *
 * @example
 * ```ts
 * import { PromptRpc } from "@beep/acp/rpc"
 *
 * const method = PromptRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const PromptRpc = Rpc.make(AGENT_METHODS.session_prompt, {
  payload: AcpSchema.PromptRequest,
  success: AcpSchema.PromptResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `SetSessionModelRpc`.
 *
 * @example
 * ```ts
 * import { SetSessionModelRpc } from "@beep/acp/rpc"
 *
 * const method = SetSessionModelRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const SetSessionModelRpc = Rpc.make(AGENT_METHODS.session_set_model, {
  payload: AcpSchema.SetSessionModelRequest,
  success: AcpSchema.SetSessionModelResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `SetSessionConfigOptionRpc`.
 *
 * @example
 * ```ts
 * import { SetSessionConfigOptionRpc } from "@beep/acp/rpc"
 *
 * const method = SetSessionConfigOptionRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const SetSessionConfigOptionRpc = Rpc.make(AGENT_METHODS.session_set_config_option, {
  payload: AcpSchema.SetSessionConfigOptionRequest,
  success: AcpSchema.SetSessionConfigOptionResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `ReadTextFileRpc`.
 *
 * @example
 * ```ts
 * import { ReadTextFileRpc } from "@beep/acp/rpc"
 *
 * const method = ReadTextFileRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ReadTextFileRpc = Rpc.make(CLIENT_METHODS.fs_read_text_file, {
  payload: AcpSchema.ReadTextFileRequest,
  success: AcpSchema.ReadTextFileResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `WriteTextFileRpc`.
 *
 * @example
 * ```ts
 * import { WriteTextFileRpc } from "@beep/acp/rpc"
 *
 * const method = WriteTextFileRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const WriteTextFileRpc = Rpc.make(CLIENT_METHODS.fs_write_text_file, {
  payload: AcpSchema.WriteTextFileRequest,
  success: AcpSchema.WriteTextFileResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `RequestPermissionRpc`.
 *
 * @example
 * ```ts
 * import { RequestPermissionRpc } from "@beep/acp/rpc"
 *
 * const method = RequestPermissionRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const RequestPermissionRpc = Rpc.make(CLIENT_METHODS.session_request_permission, {
  payload: AcpSchema.RequestPermissionRequest,
  success: AcpSchema.RequestPermissionResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `ElicitationRpc`.
 *
 * @example
 * ```ts
 * import { ElicitationRpc } from "@beep/acp/rpc"
 *
 * const method = ElicitationRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ElicitationRpc = Rpc.make(CLIENT_METHODS.session_elicitation, {
  payload: AcpSchema.ElicitationRequest,
  success: AcpSchema.ElicitationResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `CreateTerminalRpc`.
 *
 * @example
 * ```ts
 * import { CreateTerminalRpc } from "@beep/acp/rpc"
 *
 * const method = CreateTerminalRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const CreateTerminalRpc = Rpc.make(CLIENT_METHODS.terminal_create, {
  payload: AcpSchema.CreateTerminalRequest,
  success: AcpSchema.CreateTerminalResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `TerminalOutputRpc`.
 *
 * @example
 * ```ts
 * import { TerminalOutputRpc } from "@beep/acp/rpc"
 *
 * const method = TerminalOutputRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const TerminalOutputRpc = Rpc.make(CLIENT_METHODS.terminal_output, {
  payload: AcpSchema.TerminalOutputRequest,
  success: AcpSchema.TerminalOutputResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `ReleaseTerminalRpc`.
 *
 * @example
 * ```ts
 * import { ReleaseTerminalRpc } from "@beep/acp/rpc"
 *
 * const method = ReleaseTerminalRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ReleaseTerminalRpc = Rpc.make(CLIENT_METHODS.terminal_release, {
  payload: AcpSchema.ReleaseTerminalRequest,
  success: AcpSchema.ReleaseTerminalResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `WaitForTerminalExitRpc`.
 *
 * @example
 * ```ts
 * import { WaitForTerminalExitRpc } from "@beep/acp/rpc"
 *
 * const method = WaitForTerminalExitRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const WaitForTerminalExitRpc = Rpc.make(CLIENT_METHODS.terminal_wait_for_exit, {
  payload: AcpSchema.WaitForTerminalExitRequest,
  success: AcpSchema.WaitForTerminalExitResponse,
  error: AcpSchema.Error,
});

/**
 * RPC definition for `KillTerminalRpc`.
 *
 * @example
 * ```ts
 * import { KillTerminalRpc } from "@beep/acp/rpc"
 *
 * const method = KillTerminalRpc.key
 * console.log(method)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const KillTerminalRpc = Rpc.make(CLIENT_METHODS.terminal_kill, {
  payload: AcpSchema.KillTerminalRequest,
  success: AcpSchema.KillTerminalResponse,
  error: AcpSchema.Error,
});

/**
 * RPC group served by ACP agents.
 *
 * @example
 * ```ts
 * import { AgentRpcs } from "@beep/acp/rpc"
 *
 * const firstMethod = AgentRpcs.requests.keys().next().value
 * console.log(firstMethod)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const AgentRpcs = RpcGroup.make(
  InitializeRpc,
  AuthenticateRpc,
  LogoutRpc,
  NewSessionRpc,
  LoadSessionRpc,
  ListSessionsRpc,
  ForkSessionRpc,
  ResumeSessionRpc,
  CloseSessionRpc,
  PromptRpc,
  SetSessionModelRpc,
  SetSessionConfigOptionRpc
);

/**
 * RPC group served by ACP clients.
 *
 * @example
 * ```ts
 * import { ClientRpcs } from "@beep/acp/rpc"
 *
 * const firstMethod = ClientRpcs.requests.keys().next().value
 * console.log(firstMethod)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ClientRpcs = RpcGroup.make(
  ReadTextFileRpc,
  WriteTextFileRpc,
  RequestPermissionRpc,
  ElicitationRpc,
  CreateTerminalRpc,
  TerminalOutputRpc,
  ReleaseTerminalRpc,
  WaitForTerminalExitRpc,
  KillTerminalRpc
);
