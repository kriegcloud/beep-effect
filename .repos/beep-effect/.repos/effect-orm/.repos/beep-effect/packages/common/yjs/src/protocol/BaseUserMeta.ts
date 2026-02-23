import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/BaseUserMeta");

/**
 * Represents some constraints for user info. Basically read this as: "any JSON
 * object is fine, but _if_ it has a name field, it _must_ be a string."
 * (Ditto for avatar.)
 */
export const IUserInfo = S.Struct(
  {
    name: S.optional(S.String),
    avatar: S.optional(S.String),
  },
  S.Record({
    key: S.String,
    value: S.Union(BS.Json, S.Undefined),
  })
).annotations(
  $I.annotations("IUserInfo", {
    description: "User info for Yjs protocol",
  })
);

export declare namespace IUserInfo {
  export type Type = S.Schema.Type<typeof IUserInfo>;
  export type Encoded = S.Schema.Encoded<typeof IUserInfo>;
}

/**
 * This type is used by clients to define the metadata for a user.
 */
export class BaseUserMeta extends S.Class<BaseUserMeta>($I`BaseUserMeta`)(
  {
    /**
     * The id of the user that has been set in the authentication endpoint.
     * Useful to get additional information about the connected user.
     */
    id: S.optional(S.String).annotations({
      description:
        "The id of the user that has been set in the authentication endpoint.\n Useful to get additional information about the connected user.",
    }),
    /**
     * Additional user information that has been set in the authentication endpoint.
     */
    info: S.optional(IUserInfo).annotations({
      description: "Additional user information that has been set in the authentication endpoint.",
    }),
  },
  $I.annotations("BaseUserMeta", {
    description: "Base user meta for Yjs protocol",
  })
) {}
