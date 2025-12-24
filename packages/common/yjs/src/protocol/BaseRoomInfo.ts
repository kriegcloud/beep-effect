import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/BaseRoomInfo");

export const BaseRoomInfo = S.Struct(
  {
    name: S.optional(S.String).annotations({
      description: "The name of the room",
    }),
    url: S.optional(BS.URLString).annotations({
      description: "The URL of the room",
    }),
  },
  S.Record({
    key: S.String,
    value: S.Union(BS.Json, S.Undefined),
  })
).annotations(
  $I.annotations("BaseRoomInfo", {
    description: "Base room info for Yjs protocol",
  })
);

export declare namespace BaseRoomInfo {
  export type Type = S.Schema.Type<typeof BaseRoomInfo>;
  export type Encoded = S.Schema.Encoded<typeof BaseRoomInfo>;
}
