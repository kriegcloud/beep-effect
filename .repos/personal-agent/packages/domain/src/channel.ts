/**
 * Canonical channel message schemas.
 *
 * InboundMessage is the normalised envelope that every channel adapter
 * produces, regardless of the upstream platform (CLI, Telegram, WebChat, etc.).
 *
 * Ontology alignment:
 *   InboundMessage  → pao:Message (hasContent, hasTimestamp, belongsToChannel)
 *   InboundAttachment → pao:Attachment (hasMimeType, hasName)
 */
import { Schema } from "effect"

export class InboundAttachment extends Schema.Class<InboundAttachment>("InboundAttachment")({
  id: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  mimeType: Schema.optional(Schema.String),
  size: Schema.optional(Schema.Number),
  url: Schema.optional(Schema.String),
  kind: Schema.optional(Schema.Literals(["image", "file", "audio", "video"]))
}) {}

export class InboundMessage extends Schema.Class<InboundMessage>("InboundMessage")({
  channelId: Schema.String,
  userId: Schema.String,
  userName: Schema.optional(Schema.String),
  text: Schema.String,
  timestamp: Schema.DateTimeUtcFromString,
  threadId: Schema.optional(Schema.String),
  isGroup: Schema.Boolean,
  attachments: Schema.Array(InboundAttachment),
  metadata: Schema.Record(Schema.String, Schema.Unknown)
}) {}
