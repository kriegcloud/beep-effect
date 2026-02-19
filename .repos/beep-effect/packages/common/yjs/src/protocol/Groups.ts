import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/Groups");

export class GroupMemberData extends S.Class<GroupMemberData>($I`GroupMemberData`)(
  {
    id: S.String,
    addedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("GroupMemberData", {
    description: "Group member data for Yjs protocol",
  })
) {}

export const GroupScopes = S.Struct({
  mention: S.Literal(true),
}).pipe(S.partial);

export declare namespace GroupScopes {
  export type Type = S.Schema.Type<typeof GroupScopes>;
  export type Encoded = S.Schema.Encoded<typeof GroupScopes>;
}

export class GroupData extends S.Class<GroupData>($I`GroupData`)(
  {
    type: S.tag("group"),
    id: S.String,
    tenantId: S.String,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    updatedAt: BS.DateTimeUtcFromAllAcceptable,
    scopes: GroupScopes,
    members: S.Array(GroupMemberData),
  },
  $I.annotations("GroupData", {
    description: "Group data for Yjs protocol",
  })
) {}
