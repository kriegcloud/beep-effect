import { stringLiteralKit } from "@beep/schema/kits";
import type * as S from "effect/Schema";
import * as Application from "./ApplicationExt.schema";
import * as Audio from "./AudioExt.schema";
import * as Font from "./FontExt.schema";
import * as Image from "./ImageExt.schema";
import * as Text from "./TextExt.schema";
import * as Video from "./VideoExt.schema";

export const ExtKit = stringLiteralKit(
  ...Application.ApplicationExt.Options,
  ...Audio.AudioExt.Options,
  ...Image.ImageExt.Options,
  ...Video.VideoExt.Options,
  ...Font.FontExt.Options,
  ...Text.TextExt.Options
);

export class Ext extends ExtKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/Ext"),
  identifier: "Ext",
  title: "File extension",
  description: "File extension",
}) {}

export namespace Ext {
  export type Type = S.Schema.Type<typeof Ext>;
  export type Encoded = S.Schema.Encoded<typeof Ext>;
}

export const MimeTypeMap = {
  ...Application.ApplicationMimeTypeMap,
  ...Audio.AudioMimeTypeMap,
  ...Image.ImageMimeTypeMap,
  ...Video.VideoMimeTypeMap,
  ...Font.FontMimeTypeMap,
  ...Text.TextMimeTypeMap,
} as const;

// Simple combined MimeType schema without complex enumMapping
export const allMimeTypes = stringLiteralKit(
  ...Application.ApplicationMimeType.Options,
  ...Audio.AudioMimeType.Options,
  ...Image.ImageMimeType.Options,
  ...Video.VideoMimeType.Options,
  ...Font.FontMimeType.Options,
  ...Text.TextMimeType.Options,
  {
    enumMapping: [
      ["application/x-font-ttf", "app_ttf"],
      ["application/x-blender", "blend"],
      ["application/x-executable", "elf"],
      ["application/x-msdownload", "exe"],
      ["application/x-indesign", "indd"],
      ["application/x-mach-binary", "macho"],
      ["application/x-orc", "orc"],
      ["application/vnd.apache.parquet", "parquet"],
      ["application/postscript", "ps"],
      ["application/x-sqlite3", "sqlite"],
      ["application/sla", "stl"],
      ["application/vnd.tcpdump.pcap", "pcap"],
      ["application/x-lzh-compressed", "lzh"],
      ["application/x-rar-compressed", "rar"],
      ["application/json", "application_json"],
      ["application/xml", "application_xml"],
      ["application/javascript", "application_js"],
      ["application/pdf", "pdf"],
      ["application/zip", "zip"],
      ["application/vnd.ms-excel", "xls"],
      ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
      ["application/msword", "doc"],
      ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
      ["application/vnd.ms-powerpoint", "ppt"],
      ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
      ["application/graphql", "graphql"],
      ["application/graphql", "gql"],
      ["application/x-tar", "tar"],
      ["application/gzip", "gzip"],
      ["application/x-7z-compressed", "7z"],
      ["application/rtf", "rtf"],
      ["audio/amr", "amr"],
      ["audio/mpeg", "mp3"],
      ["audio/wav", "wav"],
      ["audio/ogg", "audio_ogg"],
      ["audio/aac", "aac"],
      ["audio/x-flac", "x-flac"],
      ["audio/x-m4a", "m4a"],
      ["audio/x-ms-wma", "wma"],
      ["audio/opus", "opus"],
      ["audio/webm", "audio_webm"],
      ["audio/aiff", "aiff"],
      ["font/ttf", "ttf"],
      ["font/otf", "otf"],
      ["font/woff", "woff"],
      ["font/woff2", "woff2"],
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
      ["image/x-canon-cr2", "cr2"],
      ["text/html", "html"],
      ["text/plain", "txt"],
      ["text/css", "css"],
      ["text/javascript", "js"],
      ["text/xml", "xml"],
      ["text/csv", "csv"],
      ["text/markdown", "md"],
      ["text/yaml", "yaml"],
      ["video/mp4", "mp4"],
      ["video/webm", "webm"],
      ["video/ogg", "ogg"],
      ["video/ogv", "ogv"],
      ["video/mp4", "video_mp4"],
      ["video/x-msvideo", "avi"],
      ["video/x-matroska", "mkv"],
      ["video/quicktime", "mov"],
      ["video/x-flv", "flv"],
      ["video/x-m4v", "m4v"],
      ["application/x-shockwave-flash", "swf"],
    ],
  }
);

export class MimeType extends allMimeTypes.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/extensions/MimeType"),
  identifier: "MimeType",
  title: "Mime type",
  description: "All supported mime types",
}) {
  static readonly Options = allMimeTypes.Options;
  static readonly Enum = allMimeTypes.Enum;
}

// Utility function to get mime type from extension
export function getMimeTypeFromExtension(ext: string): string | undefined {
  return MimeTypeMap[ext as keyof typeof MimeTypeMap];
}
