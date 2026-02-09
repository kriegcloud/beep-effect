import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $DocumentsDomainId.create("value-objects/ShareType.value");

export class ShareType extends BS.StringLiteralKit("user", "team", "organization", "link").annotations($I.annotations("ShareType", {
  description: "Grantee type for page sharing: user (specific user), team (team members), organization (all org members), link (anyone with token)",
})) {}

export declare namespace ShareType {
  export type Type = typeof ShareType.Type;
  export type Encoded = typeof ShareType.Encoded;
}