import {stringLiteralKit} from "@beep/schema/kits";
import {RecordUtils} from "@beep/utils";
import type * as S from "effect/Schema";

export const ImageMimeTypeMap = {
  psd: "image/vnd.adobe.photoshop",
  ppm: "image/x-portable-pixmap",
  pgm: "image/x-portable-graymap",
  pbm: "image/x-portable-bitmap",
  ico: "image/x-icon",
  heic: "image/heic",
  cr2: "image/x-canon-cr2",
  exr: "image/x-exr",
  bpg: "image/bpg",
  apng: "image/apng",
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpg",
  jfif: "image/jfif",
  pjpeg: "image/pjpeg",
  pjp: "image/pjp",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
  bmp: "image/bmp",
  tiff: "image/tiff",
} as const;

export const ImageMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(ImageMimeTypeMap), {
  enumMapping: [
    ["image/x-canon-cr2", "cr2"],
    ["image/vnd.adobe.photoshop", "psd"],
    ["image/x-portable-pixmap", "ppm"],
    ["image/x-portable-graymap", "pgm"],
    ["image/x-portable-bitmap", "pbm"],
    ["image/x-icon", "ico"],
    ["image/heic", "heic"],
    ["image/x-exr", "exr"],
    ["image/bpg", "bpg"],
    ["image/apng", "apng"],
    ["image/avif", "avif"],
    ["image/gif", "gif"],
    ["image/jpeg", "jpeg"],
    ["image/jpg", "jpg"],
    ["image/jfif", "jfif"],
    ["image/pjpeg", "pjpeg"],
    ["image/pjp", "pjp"],
    ["image/png", "png"],
    ["image/svg+xml", "svg"],
    ["image/webp", "webp"],
    ["image/bmp", "bmp"],
    ["image/tiff", "tiff"],
  ],
});

export const ImageExtKit = stringLiteralKit(
  "psd",
  "ppm",
  "pgm",
  "pbm",
  "ico",
  "hei",
  "exr",
  "bpg",
  "apng",
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "jfif",
  "heic",
  "cr2",
  "pjpeg",
  "pjp",
  "png",
  "svg",
  "webp",
  "bmp",
  "tiff"
);

export class ImageMimeType extends ImageMimeTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/ImageMimeType"),
  identifier: "ImageMimeType",
  title: "Image mime type",
  description: "Image mime type file extensions",
}) {
  static readonly Options = ImageMimeTypeKit.Options;
  static readonly Enum = ImageMimeTypeKit.Enum;
}

export class ImageExt extends ImageExtKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/ImageExt"),
  identifier: "ImageExt",
  title: "Image extension",
  description: "Image Mime type file extensions",
}) {
  static readonly Options = ImageExtKit.Options;
  static readonly Enum = ImageExtKit.Enum;
}

export namespace ImageExt {
  export type Type = S.Schema.Type<typeof ImageExt>;
  export type Encoded = S.Schema.Encoded<typeof ImageExt>;
}
