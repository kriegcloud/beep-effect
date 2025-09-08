import { stringLiteralKit } from "@beep/schema/kits";
import { RecordUtils } from "@beep/utils";
import type * as S from "effect/Schema";

export const FontMimeTypeMap = {
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
} as const;

export const FontMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(FontMimeTypeMap), {
  enumMapping: [
    ["font/ttf", "ttf"],
    ["font/otf", "otf"],
    ["font/woff", "woff"],
    ["font/woff2", "woff2"],
  ],
});

export const FontExtKit = stringLiteralKit("ttf", "otf", "woff", "woff2");

export class FontMimeType extends FontMimeTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/FontMimeType"),
  identifier: "FontMimeType",
  title: "Font mime type",
  description: "Font mime type file extensions",
}) {
  static readonly Options = FontMimeTypeKit.Options;
  static readonly Enum = FontMimeTypeKit.Enum;
}

export class FontExt extends FontExtKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/FontExt"),
  identifier: "FontExt",
  title: "Font extension",
  description: "Font Mime type file extensions",
}) {
  static readonly Options = FontExtKit.Options;
  static readonly Enum = FontExtKit.Enum;
}

export namespace FontExt {
  export type Type = S.Schema.Type<typeof FontExt>;
  export type Encoded = S.Schema.Encoded<typeof FontExt>;
}
