import { stringLiteralKit } from "@beep/schema/kits";
import { RecordUtils } from "@beep/utils";
import type * as S from "effect/Schema";

export const TextMimeTypeMap = {
  html: "text/html",
  plain: "text/plain",
  css: "text/css",
  js: "text/javascript",
  xml: "text/xml",
  csv: "text/csv",
  md: "text/markdown",
  yaml: "text/yaml",
} as const;

export const TextMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(TextMimeTypeMap), {
  enumMapping: [
    ["text/html", "html"],
    ["text/plain", "txt"],
    ["text/css", "css"],
    ["text/javascript", "js"],
    ["text/xml", "xml"],
    ["text/csv", "csv"],
    ["text/markdown", "md"],
    ["text/yaml", "yaml"],
  ],
});

export const TextExtKit = stringLiteralKit("html", "txt", "css", "js", "mjs", "xml", "csv", "md", "yaml");

export class TextMimeType extends TextMimeTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/TextMimeType"),
  identifier: "TextMimeType",
  title: "Text mime type",
  description: "Text mime type file extensions",
}) {
  static readonly Options = TextMimeTypeKit.Options;
  static readonly Enum = TextMimeTypeKit.Enum;
}

export class TextExt extends TextExtKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/TextExt"),
  identifier: "TextExt",
  title: "Text extension",
  description: "Text Mime type file extensions",
}) {
  static readonly Options = TextExtKit.Options;
  static readonly Enum = TextExtKit.Enum;
}

export namespace TextExt {
  export type Type = S.Schema.Type<typeof TextExt>;
  export type Encoded = S.Schema.Encoded<typeof TextExt>;
}
