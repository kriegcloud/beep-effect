import { BS } from "@beep/schema";

export class PageStatus extends BS.StringLiteralKit("draft", "published", "archived").annotations({
  schemaId: Symbol.for("@beep/documents-domain/value-objects/PageStatus"),
  identifier: "PageStatus",
  title: "Page Status",
  description: "The status of a page",
}) {}

export declare namespace PageStatus {
  export type Type = typeof PageStatus.Type;
  export type Encoded = typeof PageStatus.Encoded;
}
