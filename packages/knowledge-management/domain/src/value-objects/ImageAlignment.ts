import { BS } from "@beep/schema";

export class ImageAlignment extends BS.StringLiteralKit("left", "center", "right").annotations({
  schemaId: Symbol.for("@beep/knowledge-management-domain/value-objects/ImageAlignment"),
  identifier: "ImageAlignment",
  title: "Image Alignment",
  description: "The alignment of an image",
}) {}

export declare namespace ImageAlignment {
  export type Type = typeof ImageAlignment.Type;
  export type Encoded = typeof ImageAlignment.Encoded;
}
