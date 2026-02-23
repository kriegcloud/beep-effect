import { $YjsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/MentionData");

export class UserMentionData extends S.Class<UserMentionData>($I`UserMentionData`)(
  {
    kind: S.tag("user"),
    id: S.String,
  },
  $I.annotations("UserMentionData", {
    description: "User mention data for Yjs protocol",
  })
) {}

export class GroupMentionData extends S.Class<GroupMentionData>($I`GroupMentionData`)(
  {
    kind: S.tag("group"),
    id: S.String,
    userIds: S.optional(S.Array(S.String)),
  },
  $I.annotations("GroupMentionData", {
    description: "Group mention data for Yjs protocol",
  })
) {}

export class MentionData extends S.Union(UserMentionData, GroupMentionData).annotations(
  $I.annotations("MentionData", {
    description: "Mention data for Yjs protocol",
  })
) {}

export declare namespace MentionData {
  export type Type = S.Schema.Type<typeof MentionData>;
  export type Encoded = S.Schema.Encoded<typeof MentionData>;
}
