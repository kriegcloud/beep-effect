import { BS } from "@beep/schema";

export class TextStyle extends BS.StringLiteralKit("default", "serif", "mono").annotations({
  schemaId: Symbol.for("@beep/knowledge-management-domain/value-objects/TextStyle"),
  identifier: "TextStyle",
  title: "Text Style",
  description: "The text style for document content",
}) {}

export declare namespace TextStyle {
  export type Type = typeof TextStyle.Type;
  export type Encoded = typeof TextStyle.Encoded;
}
