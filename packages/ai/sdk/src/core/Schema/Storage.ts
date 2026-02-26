import * as Schema from "effect/Schema"
import { SDKMessage } from "./Message.js"
import { HookEvent } from "./Hooks.js"

export const ChatEventSource = Schema.Literal("sdk", "replay", "external")
export type ChatEventSource = typeof ChatEventSource.Type
export type ChatEventSourceEncoded = typeof ChatEventSource.Encoded

export class ChatEvent extends Schema.Class<ChatEvent>("ChatEvent")({
  sessionId: Schema.String,
  sequence: Schema.Number,
  timestamp: Schema.Number,
  source: ChatEventSource,
  message: SDKMessage
}) {}

export type ChatEventEncoded = typeof ChatEvent.Encoded

export class SessionMeta extends Schema.Class<SessionMeta>("SessionMeta")({
  sessionId: Schema.String,
  createdAt: Schema.Number,
  updatedAt: Schema.Number
}) {}

export type SessionMetaEncoded = typeof SessionMeta.Encoded

export const ArtifactEncoding = Schema.Literal("utf8", "base64")
export type ArtifactEncoding = typeof ArtifactEncoding.Type
export type ArtifactEncodingEncoded = typeof ArtifactEncoding.Encoded

export const ArtifactKind = Schema.Literal(
  "file",
  "tool_result",
  "summary",
  "image",
  "other"
)
export type ArtifactKind = typeof ArtifactKind.Type
export type ArtifactKindEncoded = typeof ArtifactKind.Encoded

export class ArtifactRecord extends Schema.Class<ArtifactRecord>("ArtifactRecord")({
  id: Schema.String,
  sessionId: Schema.String,
  kind: ArtifactKind,
  toolName: Schema.optional(Schema.String),
  toolUseId: Schema.optional(Schema.String),
  hookEvent: Schema.optional(HookEvent),
  contentType: Schema.optional(Schema.String),
  encoding: ArtifactEncoding,
  content: Schema.String,
  sizeBytes: Schema.optional(Schema.Number),
  createdAt: Schema.Number,
  metadata: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  }))
}) {}

export type ArtifactRecordEncoded = typeof ArtifactRecord.Encoded
