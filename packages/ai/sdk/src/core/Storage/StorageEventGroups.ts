import * as EventGroup from "@effect/experimental/EventGroup"
import * as EventLog from "@effect/experimental/EventLog"
import * as Schema from "effect/Schema"
import { ArtifactRecord, ChatEvent } from "../Schema/Storage.js"
import { StorageError } from "./StorageError.js"

export const ChatEventTag = "chat_event" as const
export const ArtifactEventTag = "artifact_record" as const
export const ArtifactDeleteTag = "artifact_deleted" as const

export const ArtifactDelete = Schema.Struct({
  id: Schema.String,
  sessionId: Schema.String,
  deletedAt: Schema.Number
})
export type ArtifactDelete = typeof ArtifactDelete.Type
export type ArtifactDeleteEncoded = typeof ArtifactDelete.Encoded

export const ChatEventGroup = EventGroup.empty.add({
  tag: ChatEventTag,
  payload: ChatEvent,
  error: StorageError,
  primaryKey: (payload) => `${payload.sessionId}:${payload.sequence}`
})

export const ArtifactEventGroup = EventGroup.empty.add({
  tag: ArtifactEventTag,
  payload: ArtifactRecord,
  error: StorageError,
  primaryKey: (payload) => `${payload.sessionId}:${payload.id}`
}).add({
  tag: ArtifactDeleteTag,
  payload: ArtifactDelete,
  error: StorageError,
  primaryKey: (payload) => `${payload.sessionId}:${payload.id}`
})

export const ChatEventSchema = EventLog.schema(ChatEventGroup)
export const ArtifactEventSchema = EventLog.schema(ArtifactEventGroup)
