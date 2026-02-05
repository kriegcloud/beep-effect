import { BS } from "@beep/schema";

export class ShareType extends BS.StringLiteralKit("user", "team", "organization", "link").annotations({
  schemaId: Symbol.for("@beep/documents-domain/value-objects/ShareType"),
  identifier: "ShareType",
  title: "Share Type",
  description: "Grantee type for page sharing: user (specific user), team (team members), organization (all org members), link (anyone with token)",
}) {}

export declare namespace ShareType {
  export type Type = typeof ShareType.Type;
  export type Encoded = typeof ShareType.Encoded;
}
