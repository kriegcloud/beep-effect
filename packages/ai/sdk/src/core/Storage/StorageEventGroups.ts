import * as S from "effect/Schema";
import * as EventGroup from "effect/unstable/eventlog/EventGroup";
import * as EventLog from "effect/unstable/eventlog/EventLog";
import { ArtifactRecord, ChatEvent } from "../Schema/Storage.js";
import { StorageError } from "./StorageError.js";

/**
 * @since 0.0.0
 */
export const ChatEventTag = "chat_event" as const;
/**
 * @since 0.0.0
 */
export const ArtifactEventTag = "artifact_record" as const;
/**
 * @since 0.0.0
 */
export const ArtifactDeleteTag = "artifact_deleted" as const;

/**
 * @since 0.0.0
 */
export const ArtifactDelete = S.Struct({
  id: S.String,
  sessionId: S.String,
  deletedAt: S.DateTimeUtcFromMillis,
});
/**
 * @since 0.0.0
 */
export type ArtifactDelete = typeof ArtifactDelete.Type;
/**
 * @since 0.0.0
 */
export type ArtifactDeleteEncoded = typeof ArtifactDelete.Encoded;

/**
 * @since 0.0.0
 */
export const ChatEventGroup = EventGroup.empty.add({
  tag: ChatEventTag,
  payload: ChatEvent,
  error: StorageError,
  primaryKey: (payload) => `${payload.sessionId}:${payload.sequence}`,
});

/**
 * @since 0.0.0
 */
export const ArtifactEventGroup = EventGroup.empty
  .add({
    tag: ArtifactEventTag,
    payload: ArtifactRecord,
    error: StorageError,
    primaryKey: (payload) => `${payload.sessionId}:${payload.id}`,
  })
  .add({
    tag: ArtifactDeleteTag,
    payload: ArtifactDelete,
    error: StorageError,
    primaryKey: (payload) => `${payload.sessionId}:${payload.id}`,
  });

/**
 * @since 0.0.0
 */
export const ChatEventSchema = EventLog.schema(ChatEventGroup);
/**
 * @since 0.0.0
 */
export const ArtifactEventSchema = EventLog.schema(ArtifactEventGroup);
