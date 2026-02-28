import * as S from "effect/Schema";
import { HookEvent } from "./Hooks.js";
import { SDKMessage } from "./Message.js";

/**
 * @since 0.0.0
 */
export const ChatEventSource = S.Literals(["sdk", "replay", "external"]);
/**
 * @since 0.0.0
 */
export type ChatEventSource = typeof ChatEventSource.Type;
/**
 * @since 0.0.0
 */
export type ChatEventSourceEncoded = typeof ChatEventSource.Encoded;

/**
 * @since 0.0.0
 */
export class ChatEvent extends S.Class<ChatEvent>("ChatEvent")({
  sessionId: S.String,
  sequence: S.Number,
  timestamp: S.Number,
  source: ChatEventSource,
  message: SDKMessage,
}) {
  static readonly make = (params: ChatEvent) => new ChatEvent(params);
}

/**
 * @since 0.0.0
 */
export type ChatEventEncoded = typeof ChatEvent.Encoded;

/**
 * @since 0.0.0
 */
export class SessionMeta extends S.Class<SessionMeta>("SessionMeta")({
  sessionId: S.String,
  createdAt: S.Number,
  updatedAt: S.Number,
}) {
  static readonly make = (params: SessionMeta) => new SessionMeta(params);
}

/**
 * @since 0.0.0
 */
export type SessionMetaEncoded = typeof SessionMeta.Encoded;

/**
 * @since 0.0.0
 */
export const ArtifactEncoding = S.Literals(["utf8", "base64"]);
/**
 * @since 0.0.0
 */
export type ArtifactEncoding = typeof ArtifactEncoding.Type;
/**
 * @since 0.0.0
 */
export type ArtifactEncodingEncoded = typeof ArtifactEncoding.Encoded;

/**
 * @since 0.0.0
 */
export const ArtifactKind = S.Literals(["file", "tool_result", "summary", "image", "other"]);
/**
 * @since 0.0.0
 */
export type ArtifactKind = typeof ArtifactKind.Type;
/**
 * @since 0.0.0
 */
export type ArtifactKindEncoded = typeof ArtifactKind.Encoded;

/**
 * @since 0.0.0
 */
export class ArtifactRecord extends S.Class<ArtifactRecord>("ArtifactRecord")({
  id: S.String,
  sessionId: S.String,
  kind: ArtifactKind,
  toolName: S.optional(S.String),
  toolUseId: S.optional(S.String),
  hookEvent: S.optional(HookEvent),
  contentType: S.optional(S.String),
  encoding: ArtifactEncoding,
  content: S.String,
  sizeBytes: S.optional(S.Number),
  createdAt: S.Number,
  metadata: S.optional(S.Record(S.String, S.Unknown)),
}) {
  static readonly make = (params: ArtifactRecord) => new ArtifactRecord(params);
}

/**
 * @since 0.0.0
 */
export type ArtifactRecordEncoded = typeof ArtifactRecord.Encoded;
