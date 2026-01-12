import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
const $I = $TodoxId.create("utils/schemas");

export class RoomPermissionLiteral extends BS.StringLiteralKit(
  "room:write",
  "room:read",
  "room:presence:write",
  "comments:write"
).annotations(
  $I.annotations(
    "RoomPermissionLiteral",
    {
      description: "Permission for a room",
    }
  )
) {}

export declare namespace RoomPermissionLiteral {
  export type Type = typeof RoomPermissionLiteral.Type;
  export type Enum = typeof RoomPermissionLiteral.Enum;
}

export class EmptyArray extends S.declare((u: unknown): u is readonly [] => A.isArray(u) && A.isEmptyArray(u)) {}


export const RoomPermission = S.Union(
  EmptyArray,
  S.Tuple(S.Literal(RoomPermissionLiteral.Enum["room:write"])),
  S.Tuple(S.Literal(RoomPermissionLiteral.Enum["room:read"]), S.Literal(RoomPermissionLiteral.Enum["room:presence:write"])),
  S.Tuple(S.Literal(RoomPermissionLiteral.Enum["room:read"]), S.Literal(RoomPermissionLiteral.Enum["room:presence:write"]), S.Literal(RoomPermissionLiteral.Enum["comments:write"]))
)

export declare namespace RoomPermission {
  export type Type = S.Schema.Type<typeof RoomPermission>;
}

export class RoomAccesses extends S.Record({
  key: S.String,
  value: S.Union(
    S.Tuple(S.Literal(RoomPermissionLiteral.Enum["room:write"])),
    S.Tuple(S.Literal(RoomPermissionLiteral.Enum["room:read"]), S.Literal(RoomPermissionLiteral.Enum["room:presence:write"])),
    S.Tuple(S.Literal(RoomPermissionLiteral.Enum["room:read"]), S.Literal(RoomPermissionLiteral.Enum["room:presence:write"]), S.Literal(RoomPermissionLiteral.Enum["comments:write"]))
  )
}) {}

export declare namespace RoomAccesses {
  export type Type = S.Schema.Type<typeof RoomAccesses>;
}

export class RoomMetadata extends S.Struct({
  pageId: S.String,
}, S.Record({
  key: S.String,
  value: S.Union(
    S.String,
    S.Array(S.String)
  )
})) {}

export declare namespace RoomMetadata {
  export type Type = S.Schema.Type<typeof RoomMetadata>;
}


export class RoomData extends S.Class<RoomData>($I`RoomData`)({
  type: S.tag("room"),
  id: S.String,
  createdAt: BS.DateTimeUtcFromAllAcceptable,
  lastConnectionAt: BS.OptionFromOptionalProperty(BS.DateTimeUtcFromAllAcceptable),
  defaultAccesses: RoomPermission,
  usersAccesses: RoomAccesses,
  groupsAccesses: RoomAccesses,
  metadata: RoomMetadata,
}) {}