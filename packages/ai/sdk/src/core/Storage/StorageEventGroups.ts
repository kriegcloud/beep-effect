import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as EventGroup from "effect/unstable/eventlog/EventGroup";
import * as EventLog from "effect/unstable/eventlog/EventLog";
import { ArtifactRecord, ChatEvent } from "../Schema/Storage.js";
import { StorageError } from "./StorageError.js";

const $I = $AiSdkId.create("core/Storage/StorageEventGroups");

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
export class ArtifactDelete extends S.Class<ArtifactDelete>($I`ArtifactDelete`)(
  {
    id: S.String,
    sessionId: S.String,
    deletedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("ArtifactDelete", {
    description: "Tombstone payload emitted when an artifact is removed from session storage.",
  })
) {}
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
export const ChatEventLog = EventLog.schema(ChatEventGroup);
/**
 * @since 0.0.0
 */
export const ArtifactEventLog = EventLog.schema(ArtifactEventGroup);
