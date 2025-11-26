import { BS } from "@beep/schema";

export class BlockType extends BS.StringLiteralKit("paragraph", "heading", "code", "image", "file_embed").annotations({
  schemaId: Symbol.for("@beep/knowledge-management-domain/value-objects/BlockType"),
  identifier: "BlockType",
  title: "Block Type",
  description: "The type of Block",
}) {}

export declare namespace BlockType {
  export type Type = typeof BlockType.Type;
  export type Encoded = typeof BlockType.Encoded;
}
