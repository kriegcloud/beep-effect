import { $ } from "@beep/party-domain/internal";
import { BS } from "@beep/schema";

export class GroupType extends BS.StringLiteralKit("PERSON", "ORGANIZATION", "GROUP", "SYSTEM").annotations(
  $.annotations("GroupType", {
    description: "The type of the party",
  })
) {}

export declare namespace GroupType {
  export type Type = typeof GroupType.Type;
  export type Encoded = typeof GroupType.Encoded;
}
