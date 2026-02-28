import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { HookEvent } from "./Hooks.js";
import { SDKMessage } from "./Message.js";

const $I = $AiSdkId.create("core/Schema/Storage");

/**
 * @since 0.0.0
 */
export const ChatEventSource = LiteralKit(["sdk", "replay", "external"]).annotate(
  $I.annote("ChatEventSource", {
    description: "Source category for a persisted chat event.",
  })
);
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
export class ChatEvent extends S.Class<ChatEvent>($I`ChatEvent`)(
  {
    sessionId: S.String,
    sequence: S.Number,
    timestamp: S.Number,
    source: ChatEventSource,
    message: SDKMessage,
  },
  $I.annote("ChatEvent", {
    description: "A persisted chat message event for a session timeline.",
  })
) {
  static readonly make = (params: ChatEvent) => new ChatEvent(params);
}

/**
 * @since 0.0.0
 */
export type ChatEventEncoded = typeof ChatEvent.Encoded;

/**
 * @since 0.0.0
 */
export class SessionMeta extends S.Class<SessionMeta>($I`SessionMeta`)(
  {
    sessionId: S.String,
    createdAt: S.Number,
    updatedAt: S.Number,
  },
  $I.annote("SessionMeta", {
    description: "Metadata timestamps for a session record.",
  })
) {
  static readonly make = (params: SessionMeta) => new SessionMeta(params);
}

/**
 * @since 0.0.0
 */
export type SessionMetaEncoded = typeof SessionMeta.Encoded;

/**
 * @since 0.0.0
 */
export const ArtifactEncoding = LiteralKit(["utf8", "base64"]).annotate(
  $I.annote("ArtifactEncoding", {
    description: "Encoding mode used to persist artifact content.",
  })
);
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
export const ArtifactKind = LiteralKit(["file", "tool_result", "summary", "image", "other"]).annotate(
  $I.annote("ArtifactKind", {
    description: "Logical artifact category emitted during session execution.",
  })
);
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
export class ArtifactRecord extends S.Class<ArtifactRecord>($I`ArtifactRecord`)(
  {
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
  },
  $I.annote("ArtifactRecord", {
    description: "A persisted binary or textual artifact produced by tools or system flow.",
  })
) {
  static readonly make = (params: ArtifactRecord) => new ArtifactRecord(params);
}

/**
 * @since 0.0.0
 */
export type ArtifactRecordEncoded = typeof ArtifactRecord.Encoded;
