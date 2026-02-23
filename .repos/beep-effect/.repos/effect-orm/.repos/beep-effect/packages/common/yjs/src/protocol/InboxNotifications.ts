import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { MentionData } from "./MentionData";

const $I = $YjsId.create("protocol/InboxNotifications");

// ===========================
// Activity Data Types
// ===========================

/**
 * Activity data is a generic record type for custom activity payloads.
 * Each key can be a string, boolean, number, or undefined.
 */
export class ActivityData extends S.Record({
  key: S.String,
  value: S.Union(S.String, S.Boolean, S.Number, S.Undefined),
}).annotations(
  $I.annotations("ActivityData", {
    description: "Activity data record for inbox notifications",
  })
) {}

export declare namespace ActivityData {
  export type Type = S.Schema.Type<typeof ActivityData>;
  export type Encoded = S.Schema.Encoded<typeof ActivityData>;
}

/**
 * Generic schema constructor for InboxNotificationActivity.
 *
 * Represents a single activity within a custom inbox notification.
 *
 * @param activityDataSchema - Schema for the activity data payload
 */
export const InboxNotificationActivity = <A extends S.Schema.Any>(activityDataSchema: A) => {
  return S.Struct({
    id: S.String,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    data: activityDataSchema,
  }).annotations(
    $I.annotations("InboxNotificationActivity", {
      description: "A single activity within a custom inbox notification",
    })
  );
};

// ===========================
// Inbox Notification Types
// ===========================

/**
 * Thread-based inbox notification.
 * Notifies a user about a thread they're subscribed to.
 */
export class InboxNotificationThreadData extends S.Class<InboxNotificationThreadData>($I`InboxNotificationThreadData`)(
  {
    kind: S.tag("thread"),
    id: S.String,
    roomId: S.String,
    threadId: S.String,
    notifiedAt: BS.DateTimeUtcFromAllAcceptable,
    readAt: S.NullOr(BS.DateTimeUtcFromAllAcceptable),
  },
  $I.annotations("InboxNotificationThreadData", {
    description: "Thread-based inbox notification for Yjs protocol",
  })
) {}

/**
 * Text mention inbox notification.
 * Notifies a user when they are mentioned in text.
 */
export class InboxNotificationTextMentionData extends S.Class<InboxNotificationTextMentionData>(
  $I`InboxNotificationTextMentionData`
)(
  {
    kind: S.tag("textMention"),
    id: S.String,
    roomId: S.String,
    notifiedAt: BS.DateTimeUtcFromAllAcceptable,
    readAt: S.NullOr(BS.DateTimeUtcFromAllAcceptable),
    createdBy: S.String,
    mentionId: S.String,
    mention: MentionData,
  },
  $I.annotations("InboxNotificationTextMentionData", {
    description: "Text mention inbox notification for Yjs protocol",
  })
) {}

/**
 * Generic schema constructor for InboxNotificationCustomData.
 *
 * Represents a custom inbox notification with a kind discriminator
 * and a list of activities.
 *
 * @param kind - The kind/type of custom notification (used as discriminator)
 * @param activityDataSchema - Schema for the activity data payload
 */
export const InboxNotificationCustomData = <A extends S.Schema.Any>(kind: string, activityDataSchema: A) => {
  return S.Struct({
    kind: S.Literal(kind),
    id: S.String,
    roomId: S.optional(S.String),
    subjectId: S.String,
    notifiedAt: BS.DateTimeUtcFromAllAcceptable,
    readAt: S.NullOr(BS.DateTimeUtcFromAllAcceptable),
    activities: S.Array(InboxNotificationActivity(activityDataSchema)),
  }).annotations(
    $I.annotations("InboxNotificationCustomData", {
      description: `Custom inbox notification of kind '${kind}' for Yjs protocol`,
    })
  );
};

/**
 * Generic schema constructor for InboxNotificationData union.
 *
 * Combines thread, text mention, and custom notifications into a discriminated union.
 *
 * @param customNotificationSchemas - Array of custom notification schemas to include in the union
 */
export const InboxNotificationData = <CustomSchemas extends ReadonlyArray<S.Schema.Any> = []>(
  ...customNotificationSchemas: CustomSchemas
) => {
  const baseSchemas = [InboxNotificationThreadData, InboxNotificationTextMentionData] as const;

  if (customNotificationSchemas.length === 0) {
    return S.Union(...baseSchemas).annotations(
      $I.annotations("InboxNotificationData", {
        description: "Union of inbox notification types for Yjs protocol",
      })
    );
  }

  return S.Union(...baseSchemas, ...customNotificationSchemas).annotations(
    $I.annotations("InboxNotificationData", {
      description: "Union of inbox notification types for Yjs protocol",
    })
  );
};

/**
 * Default inbox notification data type with no custom notifications.
 */
export const DefaultInboxNotificationData = InboxNotificationData();

export declare namespace DefaultInboxNotificationData {
  export type Type = S.Schema.Type<typeof DefaultInboxNotificationData>;
  export type Encoded = S.Schema.Encoded<typeof DefaultInboxNotificationData>;
}

// ===========================
// Inbox Notification Delete Info
// ===========================

/**
 * Inbox notification deletion info.
 * Sent when an inbox notification is deleted.
 */
export class InboxNotificationDeleteInfo extends S.Class<InboxNotificationDeleteInfo>($I`InboxNotificationDeleteInfo`)(
  {
    type: S.tag("deletedInboxNotification"),
    id: S.String,
    roomId: S.String,
    deletedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("InboxNotificationDeleteInfo", {
    description: "Deletion information for an inbox notification",
  })
) {}

// ===========================
// Exports
// ===========================

/**
 * Re-export commonly used schemas as namespace types.
 */
export declare namespace InboxNotificationThreadData {
  export type Type = InstanceType<typeof InboxNotificationThreadData>;
  export type Encoded = S.Schema.Encoded<typeof InboxNotificationThreadData>;
}

export declare namespace InboxNotificationTextMentionData {
  export type Type = InstanceType<typeof InboxNotificationTextMentionData>;
  export type Encoded = S.Schema.Encoded<typeof InboxNotificationTextMentionData>;
}

export declare namespace InboxNotificationDeleteInfo {
  export type Type = InstanceType<typeof InboxNotificationDeleteInfo>;
  export type Encoded = S.Schema.Encoded<typeof InboxNotificationDeleteInfo>;
}
