import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { Op } from "./Op";

const $I = $YjsId.create("protocol/ClientMsg");

/**
 * Client message codes for the Yjs protocol.
 *
 * Defines all message types that can be sent from client to server.
 */
export class ClientMsgCode extends BS.MappedLiteralKit(
  // For Presence
  ["UPDATE_PRESENCE", 100],
  ["BROADCAST_EVENT", 103],

  // For Storage
  ["FETCH_STORAGE", 200],
  ["UPDATE_STORAGE", 201],

  // For Yjs support
  ["FETCH_YDOC", 300],
  ["UPDATE_YDOC", 301]
).annotations(
  $YjsId.annotations("ClientMsgCode", {
    description: "Client message code for Yjs protocol",
  })
) {}

export declare namespace ClientMsgCode {
  export type Type = typeof ClientMsgCode.Type;
  export type Encoded = typeof ClientMsgCode.Encoded;
}

/**
 * Sent by the client to request the initial Storage state of the Room.
 */
export class FetchStorageClientMsg extends S.Class<FetchStorageClientMsg>($I`FetchStorageClientMsg`)(
  {
    type: S.Literal(ClientMsgCode.DecodedEnum.FETCH_STORAGE),
  },
  $I.annotations("FetchStorageClientMsg", {
    description: "Fetch storage client message for Yjs protocol",
    documentation: "Sent by the client to request the initial Storage state of the Room.",
  })
) {}

/**
 * Sent by the client to update the Storage document.
 *
 * The payload contains a list of Ops (incremental mutations) to apply to the document.
 */
export class UpdateStorageClientMsg extends S.Class<UpdateStorageClientMsg>($I`UpdateStorageClientMsg`)(
  {
    type: S.Literal(ClientMsgCode.DecodedEnum.UPDATE_STORAGE),
    ops: S.Array(Op),
  },
  $I.annotations("UpdateStorageClientMsg", {
    description: "Update storage client message for Yjs protocol",
    documentation:
      "Sent by the client to update the Storage document.\n\nThe payload contains a list of Ops (incremental mutations) to apply to the document.",
  })
) {}

/**
 * Sent by the client to request a Y.Doc state from the server.
 */
export class FetchYDocClientMsg extends S.Class<FetchYDocClientMsg>($I`FetchYDocClientMsg`)(
  {
    type: S.Literal(ClientMsgCode.DecodedEnum.FETCH_YDOC),
    vector: S.String,
    guid: S.optional(S.String),
    v2: S.optional(S.Boolean),
  },
  $I.annotations("FetchYDocClientMsg", {
    description: "Fetch Y.Doc client message for Yjs protocol",
    documentation:
      "Sent by the client to request a Y.Doc state from the server.\n\nThe vector is a base64 encoded state vector from a Yjs doc.\nThe guid is an optional identifier for a subdoc.\nThe v2 flag indicates if it's a v2 update.",
  })
) {}

/**
 * Sent by the client to send a Y.Doc update to the server.
 */
export class UpdateYDocClientMsg extends S.Class<UpdateYDocClientMsg>($I`UpdateYDocClientMsg`)(
  {
    type: S.Literal(ClientMsgCode.DecodedEnum.UPDATE_YDOC),
    update: S.String,
    guid: S.optional(S.String),
    v2: S.optional(S.Boolean),
  },
  $I.annotations("UpdateYDocClientMsg", {
    description: "Update Y.Doc client message for Yjs protocol",
    documentation:
      "Sent by the client to send a Y.Doc update to the server.\n\nThe update is a base64 encoded update from a Yjs doc.\nThe guid is an optional identifier for a subdoc.\nThe v2 flag indicates if it's a v2 update.",
  })
) {}

/**
 * Generic schema constructor for BroadcastEventClientMsg.
 *
 * Sent by the client to broadcast a custom event to all other clients in the room.
 */
export const BroadcastEventClientMsg = <E extends S.Schema.Any>(eventSchema: E) => {
  return S.Struct({
    type: S.Literal(ClientMsgCode.DecodedEnum.BROADCAST_EVENT),
    event: eventSchema,
  }).annotations(
    $I.annotations("BroadcastEventClientMsg", {
      description: "Broadcast event client message for Yjs protocol",
      documentation: "Sent by the client to broadcast a custom event to all other clients in the room.",
    })
  );
};

/**
 * Generic schema constructor for UpdatePresenceClientMsg.
 *
 * Creates a discriminated union representing presence updates:
 * - Full presence update (with targetActor)
 * - Partial presence update (without targetActor)
 *
 * In most cases, clients send partial presence updates containing only the fields
 * that changed. However, when a targetActor is specified, the client sends the
 * full presence data to that specific actor.
 */
export const UpdatePresenceClientMsg = <P extends S.Schema.Any>(presenceSchema: P) => {
  // Full presence update with targetActor
  const FullPresence = S.Struct({
    type: S.Literal(ClientMsgCode.DecodedEnum.UPDATE_PRESENCE),
    targetActor: S.Number,
    data: presenceSchema,
  });

  // Partial presence update without targetActor
  const PartialPresence = S.Struct({
    type: S.Literal(ClientMsgCode.DecodedEnum.UPDATE_PRESENCE),
    targetActor: S.optional(S.Undefined),
    data: S.partial(S.typeSchema(presenceSchema)),
  });

  return S.Union(FullPresence, PartialPresence).annotations(
    $I.annotations("UpdatePresenceClientMsg", {
      description: "Update presence client message for Yjs protocol",
      documentation:
        "Sent by the client to update their presence in the room.\n\nIn most cases, clients send partial presence updates containing only the fields\nthat changed. However, when a targetActor is specified, the client sends the\nfull presence data to that specific actor.",
    })
  );
};

/**
 * Generic schema constructor for the complete ClientMsg union.
 *
 * Combines all client message types with generic presence and event schemas.
 *
 * @param presenceSchema - Schema for presence data
 * @param eventSchema - Schema for custom events
 */
export const ClientMsg = <P extends S.Schema.Any, E extends S.Schema.Any>(presenceSchema: P, eventSchema: E) => {
  return S.Union(
    // Presence messages
    BroadcastEventClientMsg(eventSchema),
    UpdatePresenceClientMsg(presenceSchema),

    // Storage messages
    UpdateStorageClientMsg,
    FetchStorageClientMsg,

    // Y.Doc messages
    FetchYDocClientMsg,
    UpdateYDocClientMsg
  ).annotations(
    $I.annotations("ClientMsg", {
      description: "Complete union of all client message types for Yjs protocol",
    })
  );
};
