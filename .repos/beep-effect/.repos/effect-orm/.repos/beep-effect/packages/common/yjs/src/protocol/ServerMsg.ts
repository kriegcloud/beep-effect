import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IUserInfo } from "./BaseUserMeta";
import { Op } from "./Op";
import { IdTuple, SerializedCrdt } from "./SerializedCrdt";

const $I = $YjsId.create("protocol/ServerMsg");
export class ServerMsgCode extends BS.MappedLiteralKit(
  // For Presence
  ["UPDATE_PRESENCE", 100],
  ["USER_JOINED", 101],
  ["USER_LEFT", 102],
  ["BROADCASTED_EVENT", 103],
  ["ROOM_STATE", 104],

  // For Storage
  ["INITIAL_STORAGE_STATE", 200],
  ["UPDATE_STORAGE", 201],

  // For Yjs Docs
  ["UPDATE_YDOC", 300],

  // For Comments
  ["THREAD_CREATED", 400],
  ["THREAD_DELETED", 407],
  ["THREAD_METADATA_UPDATED", 401],
  ["THREAD_UPDATED", 408],
  ["COMMENT_CREATED", 402],
  ["COMMENT_EDITED", 403],
  ["COMMENT_DELETED", 404],
  ["COMMENT_REACTION_ADDED", 405],
  ["COMMENT_REACTION_REMOVED", 406],

  // Error codes
  ["REJECT_STORAGE_UP", 299] // Sent if a mutation was not allowed on the server (i.e. due to permissions, limit exceeded, etc)
).annotations(
  $YjsId.annotations("ServerMsgCode", {
    description: "Server message code for Yjs protocol",
  })
) {}

export declare namespace ServerMsgCode {
  export type Type = typeof ServerMsgCode.Type;
  export type Encoded = typeof ServerMsgCode.Encoded;
}

export class ThreadCreatedEvent extends S.Class<ThreadCreatedEvent>($I`ThreadCreatedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.THREAD_CREATED),
    threadId: S.String,
  },
  $I.annotations("ThreadCreatedEvent", {
    description: "Thread created event for Yjs protocol",
  })
) {}

export class ThreadDeletedEvent extends S.Class<ThreadDeletedEvent>($I`ThreadDeletedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.THREAD_DELETED),
    threadId: S.String,
  },
  $I.annotations("ThreadDeletedEvent", {
    description: "Thread deleted event for Yjs protocol",
  })
) {}

export class ThreadMetadataUpdatedEvent extends S.Class<ThreadMetadataUpdatedEvent>($I`ThreadMetadataUpdatedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.THREAD_METADATA_UPDATED),
    threadId: S.String,
  },
  $I.annotations("ThreadMetadataUpdatedEvent", {
    description: "Thread metadata updated event for Yjs protocol",
  })
) {}

export class ThreadUpdatedEvent extends S.Class<ThreadUpdatedEvent>($I`ThreadUpdatedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.THREAD_UPDATED),
    threadId: S.String,
  },
  $I.annotations("ThreadUpdatedEvent", {
    description: "Thread updated event for Yjs protocol",
  })
) {}

export class CommentCreatedEvent extends S.Class<CommentCreatedEvent>($I`CommentCreatedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.COMMENT_CREATED),
    threadId: S.String,
    commentId: S.String,
  },
  $I.annotations("CommentCreatedEvent", {
    description: "Comment created event for Yjs protocol",
  })
) {}

export class CommentEditedEvent extends S.Class<CommentEditedEvent>($I`CommentEditedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.COMMENT_EDITED),
    threadId: S.String,
    commentId: S.String,
  },
  $I.annotations("CommentEditedEvent", {
    description: "Comment edited event for Yjs protocol",
  })
) {}

export class CommentDeletedEvent extends S.Class<CommentDeletedEvent>($I`CommentDeletedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.COMMENT_DELETED),
    threadId: S.String,
    commentId: S.String,
  },
  $I.annotations("CommentDeletedEvent", {
    description: "Comment deleted event for Yjs protocol",
  })
) {}

export class CommentReactionAddedEvent extends S.Class<CommentReactionAddedEvent>($I`CommentReactionAddedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.COMMENT_REACTION_ADDED),
    threadId: S.String,
    commentId: S.String,
    emoji: S.String,
  },
  $I.annotations("CommentReactionAddedEvent", {
    description: "Comment reaction added event for Yjs protocol",
  })
) {}

export class CommentReactionRemovedEvent extends S.Class<CommentReactionRemovedEvent>($I`CommentReactionRemovedEvent`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.COMMENT_REACTION_REMOVED),
    threadId: S.String,
    commentId: S.String,
    emoji: S.String,
  },
  $I.annotations("CommentReactionRemovedEvent", {
    description: "Comment reaction removed event for Yjs protocol",
  })
) {}

/**
 * Sent by the WebSocket server to a single client in response to the client
 * joining the Room, to provide the initial Storage state of the Room. The
 * payload includes the entire Storage document.
 */
export class InitialDocumentStateServerMsg extends S.Class<InitialDocumentStateServerMsg>(
  $I`InitialDocumentStateServerMsg`
)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.INITIAL_STORAGE_STATE),
    items: S.Array(IdTuple(SerializedCrdt)),
  },
  $I.annotations("InitialDocumentStateServerMsg", {
    description: "Initial document state server message for Yjs protocol",
    documentation:
      "Sent by the WebSocket server to a single client in response to the client\njoining the Room, to provide the initial Storage state of the Room. The\npayload includes the entire Storage document.",
  })
) {}

/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a change occurred in the Storage document.
 *
 * The payload of this message contains a list of Ops (aka incremental
 * mutations to make to the initially loaded document).
 */
export class UpdateStorageServerMsg extends S.Class<UpdateStorageServerMsg>($I`UpdateStorageServerMsg`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.UPDATE_STORAGE),
    ops: S.Array(Op),
  },
  $I.annotations("UpdateStorageServerMsg", {
    description: "Update storage server message for Yjs protocol",
    documentation:
      "Sent by the WebSocket server and broadcasted to all clients to announce that\n a change occurred in the Storage document.\n\nThe payload of this message contains a list of Ops (aka incremental\nmutations to make to the initially loaded document).",
  })
) {}

/**
 * Sent by the WebSocket server to the client to indicate that certain opIds
 * have been rejected, possibly due to lack of permissions or exceeding
 * a limit.
 */
export class RejectedStorageOpServerMsg extends S.Class<RejectedStorageOpServerMsg>($I`RejectedStorageOpServerMsg`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.REJECT_STORAGE_UP),
    opIds: S.Array(S.String),
    reason: S.String,
  },
  $I.annotations("RejectedStorageOpServerMsg", {
    description: "Rejected storage operation server message for Yjs protocol",
    documentation:
      "Sent by the WebSocket server to the client to indicate that certain opIds\nhave been rejected, possibly due to lack of permissions or exceeding\na limit.",
  })
) {}

/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a User updated their presence. For example, when a user moves their cursor.
 *
 * In most cases, the data payload will only include the fields from the
 * Presence that have been changed since the last announcement. However, after
 * a new user joins a room, a "full presence" will be announced so the newly
 * connected user will get each other's user full presence at least once. In
 * those cases, the `targetActor` field indicates the newly connected client,
 * so all other existing clients can ignore this broadcasted message.
 */
export class UserLeftServerMsg extends S.Class<UserLeftServerMsg>($I`UserLeftServerMsg`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.USER_LEFT),
    actor: S.Number,
  },
  $I.annotations("UserLeftServerMsg", {
    description: "User left server message for Yjs protocol",
    documentation:
      "Sent by the WebSocket server and broadcasted to all clients to announce that\na User has left the room.",
  })
) {}

/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a Y.Doc update occurred.
 */
export class YDocUpdateServerMsg extends S.Class<YDocUpdateServerMsg>($I`YDocUpdateServerMsg`)(
  {
    type: S.Literal(ServerMsgCode.DecodedEnum.UPDATE_YDOC),
    update: S.String,
    isSync: S.Boolean,
    stateVector: S.NullOr(S.String),
    guid: S.optional(S.String),
    v2: S.optional(S.Boolean),
    remoteSnapshotHash: S.String,
  },
  $I.annotations("YDocUpdateServerMsg", {
    description: "Y.Doc update server message for Yjs protocol",
    documentation:
      "Sent by the WebSocket server and broadcasted to all clients to announce that\na Y.Doc update occurred.",
  })
) {}

/**
 * Generic schema constructor for UpdatePresenceServerMsg.
 *
 * Creates a discriminated union representing presence updates:
 * - Targeted updates (full presence to specific actor)
 * - Broadcast updates (partial presence to all)
 */
export const UpdatePresenceServerMsg = <P extends S.Schema.Any>(presenceSchema: P) => {
  // Targeted update with full presence data
  const Targeted = S.Struct({
    type: S.Literal(ServerMsgCode.DecodedEnum.UPDATE_PRESENCE),
    actor: S.Number,
    targetActor: S.Number,
    data: presenceSchema,
  });

  // Broadcast update with partial presence data
  const Broadcast = S.Struct({
    type: S.Literal(ServerMsgCode.DecodedEnum.UPDATE_PRESENCE),
    actor: S.Number,
    targetActor: S.optional(S.Undefined),
    data: S.partial(S.typeSchema(presenceSchema)),
  });

  return S.Union(Targeted, Broadcast).annotations(
    $I.annotations("UpdatePresenceServerMsg", {
      description: "Update presence server message for Yjs protocol",
      documentation:
        'Sent by the WebSocket server and broadcasted to all clients to announce that\na User updated their presence. For example, when a user moves their cursor.\n\nIn most cases, the data payload will only include the fields from the\nPresence that have been changed since the last announcement. However, after\na new user joins a room, a "full presence" will be announced so the newly\nconnected user will get each other\'s user full presence at least once. In\nthose cases, the `targetActor` field indicates the newly connected client,\nso all other existing clients can ignore this broadcasted message.',
    })
  );
};

/**
 * User joined server message for Yjs protocol.
 *
 * Sent when a user joins the room with their metadata.
 *
 * Note: In the original Liveblocks protocol, this message type is generic over the UserMeta type.
 * However, the actual fields sent are always just `id` and `info` from BaseUserMeta.
 * The generic parameter is preserved here for API compatibility but not used in the schema.
 */
export const UserJoinServerMsg = <U extends S.Schema.Any>(_userMetaSchema?: undefined | U) => {
  return S.Struct({
    type: S.Literal(ServerMsgCode.DecodedEnum.USER_JOINED),
    actor: S.Number,
    id: S.optional(S.String).annotations({ description: "User ID from the user metadata" }),
    info: S.optional(IUserInfo).annotations({ description: "User info from the user metadata" }),
    scopes: S.Array(S.String),
  }).annotations(
    $I.annotations("UserJoinServerMsg", {
      description: "User joined server message for Yjs protocol",
      documentation:
        "Sent by the WebSocket server and broadcasted to all clients to announce that\na new User has joined the room.",
    })
  );
};

/**
 * Generic schema constructor for BroadcastedEventServerMsg.
 *
 * Sent when a user broadcasts a custom event.
 */
export const BroadcastedEventServerMsg = <E extends S.Schema.Any>(eventSchema: E) => {
  return S.Struct({
    type: S.Literal(ServerMsgCode.DecodedEnum.BROADCASTED_EVENT),
    actor: S.Number,
    event: eventSchema,
  }).annotations(
    $I.annotations("BroadcastedEventServerMsg", {
      description: "Broadcasted event server message for Yjs protocol",
      documentation:
        "Sent by the WebSocket server and broadcasted to all clients to announce that\na User broadcasted a custom event.",
    })
  );
};

/**
 * Generic schema constructor for RoomStateServerMsg.
 *
 * Sent to a newly connected client with the current room state.
 */
export const RoomStateServerMsg = <U extends S.Schema.Any>(userMetaSchema: U) => {
  // Create a schema for a user with scopes
  const UserWithScopes = S.extend(
    userMetaSchema,
    S.Struct({
      scopes: S.Array(S.String),
    })
  );

  return S.Struct({
    type: S.Literal(ServerMsgCode.DecodedEnum.ROOM_STATE),
    actor: S.Number,
    nonce: S.String,
    scopes: S.Array(S.String),
    users: S.Record({ key: S.Number, value: UserWithScopes }),
    meta: BS.JsonObject,
  }).annotations(
    $I.annotations("RoomStateServerMsg", {
      description: "Room state server message for Yjs protocol",
      documentation:
        "Sent by the WebSocket server to a newly connected client to provide\nthe current state of the room, including all connected users.",
    })
  );
};

/**
 * Union of all comment-related events.
 */
export const CommentsEventServerMsg = S.Union(
  ThreadCreatedEvent,
  ThreadDeletedEvent,
  ThreadMetadataUpdatedEvent,
  ThreadUpdatedEvent,
  CommentCreatedEvent,
  CommentEditedEvent,
  CommentDeletedEvent,
  CommentReactionAddedEvent,
  CommentReactionRemovedEvent
).annotations(
  $I.annotations("CommentsEventServerMsg", {
    description: "Union of all comment-related server events for Yjs protocol",
  })
);

/**
 * Generic schema constructor for the complete ServerMsg union.
 *
 * Combines all server message types with generic presence, user meta, and event schemas.
 *
 * @param presenceSchema - Schema for presence data
 * @param userMetaSchema - Schema for user metadata (must extend BaseUserMeta)
 * @param eventSchema - Schema for custom events
 */
export const ServerMsg = <P extends S.Schema.Any, U extends S.Schema.Any, E extends S.Schema.Any>(
  presenceSchema: P,
  userMetaSchema: U,
  eventSchema: E
) => {
  return S.Union(
    // Presence messages
    UpdatePresenceServerMsg(presenceSchema),
    UserJoinServerMsg(userMetaSchema),
    UserLeftServerMsg,
    BroadcastedEventServerMsg(eventSchema),
    RoomStateServerMsg(userMetaSchema),

    // Storage messages
    InitialDocumentStateServerMsg,
    UpdateStorageServerMsg,
    RejectedStorageOpServerMsg,

    // Y.Doc messages
    YDocUpdateServerMsg,

    // Comment events
    CommentsEventServerMsg
  ).annotations(
    $I.annotations("ServerMsg", {
      description: "Complete union of all server message types for Yjs protocol",
    })
  );
};
