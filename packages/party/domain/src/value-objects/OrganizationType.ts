import { $ } from "@beep/party-domain/internal";
import { BS } from "@beep/schema";

export class PartyOrganizationType extends BS.StringLiteralKit(
  "ADVISORY_FIRM",
  "BUSINESS_CLIENT",
  "CUSTODIAN",
  "BANK",
  "INSURER",
  "SAAS_VENDOR",
  "OTHER"
).annotations(
  $.annotations("PartyOrganizationType", {
    description: "The type of the organization",
  })
) {}

export declare namespace PartyOrganizationType {
  export type Type = typeof PartyOrganizationType.Type;
  export type Encoded = typeof PartyOrganizationType.Encoded;
}
