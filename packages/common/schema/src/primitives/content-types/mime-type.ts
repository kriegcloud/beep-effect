/**
 * MIME type schemas grouped by media categories (application, audio, font, image, text, video).
 *
 * Exposes extension-to-MIME maps, literal kits, and schema classes so upload workflows, Content-Type guards,
 * and documentation flows can reuse the same canonical MIME values.
 *
 * For bidirectional extension↔MIME mappings with O(1) lookup, see:
 * - {@link ApplicationExtensionToMime}, {@link AudioExtensionToMime}, etc. from extension-mime-mapping.ts
 * - {@link extensionToMime} and {@link mimeToExtension} helper functions
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ImageMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(ImageMimeType)("image/png");
 *
 * @example
 * // Bidirectional mapping with O(1) lookup
 * import { ImageExtensionToMime, extensionToMime, mimeToExtension } from "@beep/schema/primitives/content-types/mime-type";
 *
 * ImageExtensionToMime.decodeMap.get("png");  // "image/png"
 * extensionToMime("png");  // "image/png"
 * mimeToExtension("image/png");  // "png"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import { $ContentTypeId } from "@beep/schema/internal";
import { RecordUtils } from "@beep/utils";
import type * as S from "effect/Schema";

// Re-export bidirectional mappings from extension-mime-mapping
export {
  AllExtensionToMimeMappings,
  ApplicationExtensionToMime,
  AudioExtensionToMime,
  combinedDecodeMap,
  combinedEncodeMap,
  extensionToMime,
  FontExtensionToMime,
  ImageExtensionToMime,
  isMappedExtension,
  isMappedMimeType,
  type MappedExtension,
  type MappedMimeType,
  mimeToExtension,
  TextExtensionToMime,
  VideoExtensionToMime,
} from "./extension-mime-mapping";

const { $MimeTypeId: Id } = $ContentTypeId.compose("mime-type");
//----------------------------------------------------------------------------------------------------------------------
// APPLICATION MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mapping of application file extensions to MIME types.
 *
 * @example
 * import { ApplicationExtensionMimeTypeMap } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = ApplicationExtensionMimeTypeMap.json;
 * // "application/json"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const ApplicationExtensionMimeTypeMap = {
  blend: "application/x-blender",
  elf: "application/x-executable",
  exe: "application/x-msdownload",
  indd: "application/x-indesign",
  macho: "application/x-mach-binary",
  orc: "application/x-orc",
  parquet: "application/vnd.apache.parquet",
  ps: "application/postscript",
  sqlite: "application/x-sqlite3",
  stl: "application/sla",
  pcap: "application/vnd.tcpdump.pcap",
  //
  json: "application/json",
  xml: "application/xml",
  js: "application/javascript",
  pdf: "application/pdf",
  lzh: "application/x-lzh-compressed",
  zip: "application/zip",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  doc: "application/msword",
  rar: "application/x-rar-compressed",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  graphql: "application/graphql",
  gql: "application/graphql",
  tar: "application/x-tar",
  gzip: "application/gzip",
  "7z": "application/x-7z-compressed",
  rtf: "application/rtf",
  ttf: "application/x-font-ttf",
} as const;

/**
 * Schema validating application MIME type strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ApplicationMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(ApplicationMimeType)("application/json");
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export class ApplicationMimeType extends StringLiteralKit(
  ...RecordUtils.recordStringValues(ApplicationExtensionMimeTypeMap),
  {
    enumMapping: [
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
      ["application/x-font-ttf", "app_ttf"],
    ],
  }
).annotations(
  Id.annotations("ApplicationMimeType", {
    description: "Application MIME types.",
  })
) {}

/**
 * Helper namespace for {@link ApplicationMimeType}.
 *
 * @example
 * import type { ApplicationMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * let mime: ApplicationMimeType.Type;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace ApplicationMimeType {
  /**
   * Runtime type for {@link ApplicationMimeType}.
   *
   * @example
   * import type { ApplicationMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let mime: ApplicationMimeType.Type;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ApplicationMimeType>;
  /**
   * Encoded representation accepted by {@link ApplicationMimeType}.
   *
   * @example
   * import type { ApplicationMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let encoded: ApplicationMimeType.Encoded;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ApplicationMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// AUDIO MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mapping of audio extensions to MIME types.
 *
 * @example
 * import { AudioExtensionMimeTypeMap } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = AudioExtensionMimeTypeMap.mp3;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const AudioExtensionMimeTypeMap = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  amr: "audio/amr",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/x-flac",
  m4a: "audio/x-m4a",
  wma: "audio/x-ms-wma",
  opus: "audio/opus",
  webm: "audio/webm",
  aiff: "audio/aiff",
} as const;

/**
 * Schema validating audio MIME types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { AudioMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(AudioMimeType)("audio/mpeg");
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export class AudioMimeType extends StringLiteralKit(...RecordUtils.recordStringValues(AudioExtensionMimeTypeMap), {
  enumMapping: [
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
  ] as const,
}).annotations(
  Id.annotations("AudioMimeType", {
    description: "Audio MIME types.",
  })
) {}

/**
 * Helper namespace for {@link AudioMimeType}.
 *
 * @example
 * import type { AudioMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * let audio: AudioMimeType.Type;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace AudioMimeType {
  /**
   * Runtime type for {@link AudioMimeType}.
   *
   * @example
   * import type { AudioMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let audio: AudioMimeType.Type;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof AudioMimeType>;
  /**
   * Encoded representation accepted by {@link AudioMimeType}.
   *
   * @example
   * import type { AudioMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let encoded: AudioMimeType.Encoded;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof AudioMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// FONT MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mapping of font extensions to MIME types.
 *
 * @example
 * import { FontExtensionMimeTypeMap } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = FontExtensionMimeTypeMap.woff2;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const FontExtensionMimeTypeMap = {
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
} as const;

/**
 * Schema validating font MIME types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FontMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(FontMimeType)("font/woff");
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export class FontMimeType extends StringLiteralKit(...RecordUtils.recordStringValues(FontExtensionMimeTypeMap), {
  enumMapping: [
    ["font/ttf", "ttf"],
    ["font/otf", "otf"],
    ["font/woff", "woff"],
    ["font/woff2", "woff2"],
  ],
}).annotations(
  Id.annotations("FontMimeType", {
    description: "Font MIME types.",
  })
) {}

/**
 * Helper namespace for {@link FontMimeType}.
 *
 * @example
 * import type { FontMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * let font: FontMimeType.Type;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace FontMimeType {
  /**
   * Runtime type for {@link FontMimeType}.
   *
   * @example
   * import type { FontMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let font: FontMimeType.Type;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FontMimeType>;
  /**
   * Encoded representation accepted by {@link FontMimeType}.
   *
   * @example
   * import type { FontMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let encoded: FontMimeType.Encoded;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FontMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// IMAGE MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mapping of image extensions to MIME types.
 *
 * @example
 * import { ImageExtensionMimeTypeMap } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = ImageExtensionMimeTypeMap.png;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const ImageExtensionMimeTypeMap = {
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

/**
 * Literal kit derived from {@link ImageExtensionMimeTypeMap}.
 *
 * @example
 * import { ImageMimeTypeKit } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const options = ImageMimeTypeKit.Options;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const ImageMimeTypeKit = StringLiteralKit(...RecordUtils.recordStringValues(ImageExtensionMimeTypeMap), {
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

/**
 * Schema validating image MIME type strings.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ImageMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(ImageMimeType)("image/png");
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export class ImageMimeType extends StringLiteralKit(...RecordUtils.recordStringValues(ImageExtensionMimeTypeMap), {
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
}).annotations(
  Id.annotations("ImageMimeType", {
    description: "Image MIME types.",
  })
) {}

/**
 * Helper namespace for {@link ImageMimeType}.
 *
 * @example
 * import type { ImageMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * let image: ImageMimeType.Type;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace ImageMimeType {
  /**
   * Runtime type for {@link ImageMimeType}.
   *
   * @example
   * import type { ImageMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let image: ImageMimeType.Type;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ImageMimeType>;
  /**
   * Encoded representation accepted by {@link ImageMimeType}.
   *
   * @example
   * import type { ImageMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let encoded: ImageMimeType.Encoded;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ImageMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// TEXT MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mapping of text extensions to MIME types.
 *
 * @example
 * import { TextExtensionMimeTypeMap } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = TextExtensionMimeTypeMap.html;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const TextExtensionMimeTypeMap = {
  html: "text/html",
  plain: "text/plain",
  css: "text/css",
  js: "text/javascript",
  xml: "text/xml",
  csv: "text/csv",
  md: "text/markdown",
  yaml: "text/yaml",
} as const;

/**
 * Schema validating text MIME types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TextMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(TextMimeType)("text/plain");
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export class TextMimeType extends StringLiteralKit(...RecordUtils.recordStringValues(TextExtensionMimeTypeMap), {
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
}).annotations(
  Id.annotations("TextMimeType", {
    description: "Text MIME types.",
  })
) {}

/**
 * Helper namespace for {@link TextMimeType}.
 *
 * @example
 * import type { TextMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * let mime: TextMimeType.Type;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace TextMimeType {
  /**
   * Runtime type for {@link TextMimeType}.
   *
   * @example
   * import type { TextMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let text: TextMimeType.Type;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof TextMimeType>;
  /**
   * Encoded representation accepted by {@link TextMimeType}.
   *
   * @example
   * import type { TextMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let encoded: TextMimeType.Encoded;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof TextMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// VIDEO MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
/**
 * Mapping of video extensions to MIME types.
 *
 * @example
 * import { VideoExtensionMimeTypeMap } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = VideoExtensionMimeTypeMap.mp4;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const VideoExtensionMimeTypeMap = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogv",
  mv4: "video/mp4",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  flv: "video/x-flv",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  swf: "application/x-shockwave-flash",
} as const;

/**
 * Schema validating video MIME types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { VideoMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(VideoMimeType)("video/mp4");
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export class VideoMimeType extends StringLiteralKit(...RecordUtils.recordStringValues(VideoExtensionMimeTypeMap), {
  enumMapping: [
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
}).annotations(
  Id.annotations("VideoMimeType", {
    description: "Video MIME types.",
  })
) {}

/**
 * Helper namespace for {@link VideoMimeType}.
 *
 * @example
 * import type { VideoMimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * let video: VideoMimeType.Type;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace VideoMimeType {
  /**
   * Runtime type for {@link VideoMimeType}.
   *
   * @example
   * import type { VideoMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let video: VideoMimeType.Type;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof VideoMimeType>;
  /**
   * Encoded representation accepted by {@link VideoMimeType}.
   *
   * @example
   * import type { VideoMimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let encoded: VideoMimeType.Encoded;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof VideoMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// ALL MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
/**
 * Combined mapping of every supported extension to its MIME type.
 *
 * @example
 * import { FileExtensionMimeTypeMap } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = FileExtensionMimeTypeMap.png;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const FileExtensionMimeTypeMap = {
  ...ApplicationExtensionMimeTypeMap,
  ...AudioExtensionMimeTypeMap,
  ...ImageExtensionMimeTypeMap,
  ...VideoExtensionMimeTypeMap,
  ...FontExtensionMimeTypeMap,
  ...TextExtensionMimeTypeMap,
} as const;

/**
 * Schema validating any MIME type tracked by the repository.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { MimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * const mime = S.decodeSync(MimeType)("image/png");
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export class MimeType extends StringLiteralKit(
  ...ApplicationMimeType.Options,
  ...AudioMimeType.Options,
  ...ImageMimeType.Options,
  ...VideoMimeType.Options,
  ...FontMimeType.Options,
  ...TextMimeType.Options,
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
).annotations(
  Id.annotations("MimeType", {
    description: "All supported MIME types.",
  })
) {}

/**
 * Helper namespace for {@link MimeType}.
 *
 * @example
 * import type { MimeType } from "@beep/schema/primitives/content-types/mime-type";
 *
 * let mime: MimeType.Type;
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace MimeType {
  /**
   * Runtime type for {@link MimeType}.
   *
   * @example
   * import type { MimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let mime: MimeType.Type;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof MimeType>;
  /**
   * Encoded representation accepted by {@link MimeType}.
   *
   * @example
   * import type { MimeType } from "@beep/schema/primitives/content-types/mime-type";
   *
   * let encoded: MimeType.Encoded;
   *
   * @category Primitives/Network/Mime
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MimeType>;
}
