import { stringLiteralKit } from "@beep/schema/kits";
import { RecordUtils } from "@beep/utils";
import type * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("mime_type");
//----------------------------------------------------------------------------------------------------------------------
// APPLICATION MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
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

export const ApplicationMimeTypeKit = stringLiteralKit(
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
);

export class ApplicationMimeType extends ApplicationMimeTypeKit.Schema.annotations(
  Id.annotations("ApplicationMimeType", {
    description: "Application mime type file extensions",
  })
) {
  static readonly Options = ApplicationMimeTypeKit.Options;
  static readonly Enum = ApplicationMimeTypeKit.Enum;
}

export declare namespace ApplicationMimeType {
  export type Type = S.Schema.Type<typeof ApplicationMimeType>;
  export type Encoded = S.Schema.Encoded<typeof ApplicationMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// AUDIO MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
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

export const AudioMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(AudioExtensionMimeTypeMap), {
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
});

export class AudioMimeType extends AudioMimeTypeKit.Schema.annotations(
  Id.annotations("AudioMimeType", {
    description: "Audio mime type file extensions",
  })
) {
  static readonly Options = AudioMimeTypeKit.Options;
  static readonly Enum = AudioMimeTypeKit.Enum;
}

export declare namespace AudioMimeType {
  export type Type = S.Schema.Type<typeof AudioMimeType>;
  export type Encoded = S.Schema.Encoded<typeof AudioMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// FONT MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
export const FontExtensionMimeTypeMap = {
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
} as const;

export const FontMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(FontExtensionMimeTypeMap), {
  enumMapping: [
    ["font/ttf", "ttf"],
    ["font/otf", "otf"],
    ["font/woff", "woff"],
    ["font/woff2", "woff2"],
  ],
});

export class FontMimeType extends FontMimeTypeKit.Schema.annotations(
  Id.annotations("FontMimeType", {
    description: "Font mime type file extensions",
  })
) {
  static readonly Options = FontMimeTypeKit.Options;
  static readonly Enum = FontMimeTypeKit.Enum;
}

export declare namespace FontMimeType {
  export type Type = S.Schema.Type<typeof FontMimeType>;
  export type Encoded = S.Schema.Encoded<typeof FontMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// IMAGE MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
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

export const ImageMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(ImageExtensionMimeTypeMap), {
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

export class ImageMimeType extends ImageMimeTypeKit.Schema.annotations(
  Id.annotations("ImageMimeType", {
    description: "Image mime type file extensions",
  })
) {
  static readonly Options = ImageMimeTypeKit.Options;
  static readonly Enum = ImageMimeTypeKit.Enum;
}

export declare namespace ImageMimeType {
  export type Type = S.Schema.Type<typeof ImageMimeType>;
  export type Encoded = S.Schema.Encoded<typeof ImageMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// TEXT MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
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

export const TextMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(TextExtensionMimeTypeMap), {
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

export class TextMimeType extends TextMimeTypeKit.Schema.annotations(
  Id.annotations("TextMimeType", {
    description: "Text mime type file extensions",
  })
) {
  static readonly Options = TextMimeTypeKit.Options;
  static readonly Enum = TextMimeTypeKit.Enum;
}

export declare namespace TextMimeType {
  export type Type = S.Schema.Type<typeof TextMimeType>;
  export type Encoded = S.Schema.Encoded<typeof TextMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// VIDEO MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
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

export const VideoMimeTypeKit = stringLiteralKit(...RecordUtils.recordStringValues(VideoExtensionMimeTypeMap), {
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
});

export class VideoMimeType extends VideoMimeTypeKit.Schema.annotations(
  Id.annotations("VideoMimeType", {
    description: "Video mime type file extensions",
  })
) {
  static readonly Options = VideoMimeTypeKit.Options;
  static readonly Enum = VideoMimeTypeKit.Enum;
}

export declare namespace VideoMimeType {
  export type Type = S.Schema.Type<typeof VideoMimeType>;
  export type Encoded = S.Schema.Encoded<typeof VideoMimeType>;
}

//----------------------------------------------------------------------------------------------------------------------
// ALL MIME TYPES
//----------------------------------------------------------------------------------------------------------------------
export const FileExtensionMimeTypeMap = {
  ...ApplicationExtensionMimeTypeMap,
  ...AudioExtensionMimeTypeMap,
  ...ImageExtensionMimeTypeMap,
  ...VideoExtensionMimeTypeMap,
  ...FontExtensionMimeTypeMap,
  ...TextExtensionMimeTypeMap,
} as const;

export const MimeTypeKit = stringLiteralKit(
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
);

export class MimeType extends MimeTypeKit.Schema.annotations(
  Id.annotations("MimeType", {
    description: "All supported mime types",
  })
) {
  static readonly Options = MimeTypeKit.Options;
  static readonly Enum = MimeTypeKit.Enum;
}

export declare namespace MimeType {
  export type Type = S.Schema.Type<typeof MimeType>;
  export type Encoded = S.Schema.Encoded<typeof MimeType>;
}
