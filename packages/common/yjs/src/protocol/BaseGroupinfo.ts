import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/BaseGroupinfo");

export const BaseGroupInfo = S.Struct(
  {
    name: S.optional(S.String).annotations({
      description: "The name of the group.",
    }),
    avatar: S.optional(BS.URLString).annotations({
      description: "The avatar of the group.",
    }),
    description: S.optional(S.String).annotations({
      description: "The description of the group",
    }),
  },
  S.Record({
    key: S.String,
    value: S.Union(BS.Json, S.Undefined),
  })
).annotations(
  $I.annotations("BaseGroupInfo", {
    description: "Base group info for Yjs protocol",
  })
);

export declare namespace BaseGroupInfo {
  export type Type = S.Schema.Type<typeof BaseGroupInfo>;
  export type Encoded = S.Schema.Encoded<typeof BaseGroupInfo>;
}
