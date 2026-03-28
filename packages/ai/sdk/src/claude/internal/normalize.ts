import { Effect } from "effect";
import * as S from "effect/Schema";
import { DecodeError } from "../Errors.js";
import { AccountInfo, ModelInfo, RewindFilesResult, SlashCommand } from "../Schema/Common.js";
import { SDKMessage } from "../Schema/Message.js";
import { QueryResultOutput, SessionCreateOutput, SessionInfo } from "../Schema/Service.js";

const decodeSDKMessage = S.decodeUnknownEffect(SDKMessage);
const decodeSlashCommandList = S.decodeUnknownEffect(S.Array(SlashCommand));
const decodeModelInfoList = S.decodeUnknownEffect(S.Array(ModelInfo));
const decodeAccountInfo = S.decodeUnknownEffect(AccountInfo);
const decodeRewindFilesResult = S.decodeUnknownEffect(RewindFilesResult);
const decodeQueryResultOutput = S.decodeUnknownEffect(QueryResultOutput);
const decodeSessionCreateOutput = S.decodeUnknownEffect(SessionCreateOutput);
const decodeSessionInfo = S.decodeUnknownEffect(SessionInfo);
const decodeSessionInfoList = S.decodeUnknownEffect(S.Array(SessionInfo));

const toDecodeError = (message: string, input: unknown) => (cause: unknown) =>
  DecodeError.make({
    message,
    input,
    cause,
  });

/**
 * @since 0.0.0
 */
export const normalizeSDKMessage = (input: unknown) =>
  decodeSDKMessage(input).pipe(Effect.mapError(toDecodeError("Failed to normalize SDK message", input)));

/**
 * @since 0.0.0
 */
export const normalizeSlashCommandList = (input: unknown) =>
  decodeSlashCommandList(input).pipe(Effect.mapError(toDecodeError("Failed to normalize supported commands", input)));

/**
 * @since 0.0.0
 */
export const normalizeModelInfoList = (input: unknown) =>
  decodeModelInfoList(input).pipe(Effect.mapError(toDecodeError("Failed to normalize supported models", input)));

/**
 * @since 0.0.0
 */
export const normalizeAccountInfo = (input: unknown) =>
  decodeAccountInfo(input).pipe(Effect.mapError(toDecodeError("Failed to normalize account info", input)));

/**
 * @since 0.0.0
 */
export const normalizeRewindFilesResult = (input: unknown) =>
  decodeRewindFilesResult(input).pipe(Effect.mapError(toDecodeError("Failed to normalize rewind files result", input)));

/**
 * @since 0.0.0
 */
export const normalizeQueryResultOutput = (input: unknown) =>
  decodeQueryResultOutput(input).pipe(Effect.mapError(toDecodeError("Failed to normalize query result output", input)));

/**
 * @since 0.0.0
 */
export const normalizeSessionCreateOutput = (input: unknown) =>
  decodeSessionCreateOutput(input).pipe(
    Effect.mapError(toDecodeError("Failed to normalize session create output", input))
  );

/**
 * @since 0.0.0
 */
export const normalizeSessionInfo = (input: unknown) =>
  decodeSessionInfo(input).pipe(Effect.mapError(toDecodeError("Failed to normalize session info", input)));

/**
 * @since 0.0.0
 */
export const normalizeSessionInfoList = (input: unknown) =>
  decodeSessionInfoList(input).pipe(Effect.mapError(toDecodeError("Failed to normalize session list", input)));
