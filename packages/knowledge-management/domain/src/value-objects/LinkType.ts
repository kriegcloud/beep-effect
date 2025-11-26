import { BS } from "@beep/schema";

export class LinkType extends BS.StringLiteralKit("explicit", "inline-reference", "block_embed").annotations({
  schemaId: Symbol.for("@beep/knowledge-management-domain/value-objects/LinkType"),
  identifier: "LinkType",
  title: "Link Type",
  description: "The type of Link",
}) {}

export declare namespace LinkType {
  export type Type = typeof LinkType.Type;
  export type Encoded = typeof LinkType.Encoded;
}
