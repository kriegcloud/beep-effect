import { BS } from "@beep/schema";

export class DefaultAccess extends BS.StringLiteralKit("private", "restricted", "organization").annotations({
  schemaId: Symbol.for("@beep/documents-domain/value-objects/DefaultAccess"),
  identifier: "DefaultAccess",
  title: "Default Access",
  description: "Base visibility of a page: private (creator only), restricted (explicit shares only), organization (all org members can view)",
}) {}

export declare namespace DefaultAccess {
  export type Type = typeof DefaultAccess.Type;
  export type Encoded = typeof DefaultAccess.Encoded;
}
