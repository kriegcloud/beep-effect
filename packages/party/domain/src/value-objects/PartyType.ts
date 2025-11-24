import { $ } from "@beep/party-domain/internal";
import { BS } from "@beep/schema";

export class PartyType extends BS.StringLiteralKit("PERSON", "ORGANIZATION", "GROUP", "SYSTEM").annotations(
  $.annotations("PartyType", {
    description: "The type of the party",
  })
) {}

export declare namespace PartyType {
  export type Type = typeof PartyType.Type;
  export type Encoded = typeof PartyType.Encoded;
}
