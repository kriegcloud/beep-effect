import { BS } from "@beep/schema";

export class AccessLevel extends BS.StringLiteralKit("view", "comment", "edit", "full").annotations({
  schemaId: Symbol.for("@beep/documents-domain/value-objects/AccessLevel"),
  identifier: "AccessLevel",
  title: "Access Level",
  description: "Granular permission level: view (read-only), comment (view + annotate), edit (view + modify content), full (edit + manage sharing + delete)",
}) {}

export declare namespace AccessLevel {
  export type Type = typeof AccessLevel.Type;
  export type Encoded = typeof AccessLevel.Encoded;
}
