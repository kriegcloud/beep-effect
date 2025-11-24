import { $ } from "@beep/party-domain/internal";
import { BS } from "@beep/schema";

export class ContactPointType extends BS.StringLiteralKit(
  "EMAIL",
  "PHONE",
  "ADDRESS",
  "WEBSITE",
  "SOCIAL",
  "OTHER"
).annotations(
  $.annotations("ContactPointType", {
    description: "The type of the party",
  })
) {}

export declare namespace ContactPointType {
  export type Type = typeof ContactPointType.Type;
  export type Encoded = typeof ContactPointType.Encoded;
}
