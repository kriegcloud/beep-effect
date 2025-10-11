import { stringLiteralKit } from "@beep/schema/kits";
import type * as S from "effect/Schema";
//----------------------------------------------------------------------------------------------------------------------
// APPLICATION EXTENSIONS
//----------------------------------------------------------------------------------------------------------------------
export const ApplicationExtensionKit = stringLiteralKit(
  "json",
  "xml",
  "js",
  "mjs",
  "pdf",
  "zip",
  "xls",
  "xlsx",
  "doc",
  "docx",
  "lzh",
  "ppt",
  "rar",
  "pptx",
  "graphql",
  "gql",
  "tar",
  "gzip",
  "7z",
  "rtf",
  "blend",
  "elf",
  "exe",
  "indd",
  "macho",
  "orc",
  "parquet",
  "ps",
  "sqlite",
  "stl",
  "pcap",
  "ttf"
);

export class ApplicationExtension extends ApplicationExtensionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/FileExtension/ApplicationExtension"),
  identifier: "ApplicationExtension",
  title: "Application Extension",
  description: "Application Mime type file extension literals",
}) {
  static readonly Options = ApplicationExtensionKit.Options;
  static readonly Enum = ApplicationExtensionKit.Enum;
}

export declare namespace ApplicationExtension {
  export type Type = S.Schema.Type<typeof ApplicationExtension>;
  export type Encoded = S.Schema.Encoded<typeof ApplicationExtension>;
}

//----------------------------------------------------------------------------------------------------------------------
// AUDIO EXTENSIONS
//----------------------------------------------------------------------------------------------------------------------
export const AudioExtensionKit = stringLiteralKit(
  "flac",
  "amr",
  "mp3",
  "wav",
  "ogg",
  "aac",
  "flac",
  "m4a",
  "wma",
  "opus",
  "webm",
  "aiff"
);

export class AudioExtension extends AudioExtensionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/FileExtension/AudioExtension"),
  identifier: "AudioExtension",
  title: "Audio Extension",
  description: "Audio Mime type file extensions",
}) {
  static readonly Options = AudioExtensionKit.Options;
  static readonly Enum = AudioExtensionKit.Enum;
}

export declare namespace AudioExtension {
  export type Type = S.Schema.Type<typeof AudioExtension>;
  export type Encoded = S.Schema.Encoded<typeof AudioExtension>;
}

//----------------------------------------------------------------------------------------------------------------------
// FONT EXTENSIONS
//----------------------------------------------------------------------------------------------------------------------
export const FontExtensionKit = stringLiteralKit("ttf", "otf", "woff", "woff2");

export class FontExtension extends FontExtensionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/FileExtension/FontExtension"),
  identifier: "FontExtension",
  title: "Font Extension",
  description: "Font Mime type file extensions",
}) {
  static readonly Options = FontExtensionKit.Options;
  static readonly Enum = FontExtensionKit.Enum;
}

export declare namespace FontExtension {
  export type Type = S.Schema.Type<typeof FontExtension>;
  export type Encoded = S.Schema.Encoded<typeof FontExtension>;
}

//----------------------------------------------------------------------------------------------------------------------
// IMAGE EXTENSIONS
//----------------------------------------------------------------------------------------------------------------------
export const ImageExtensionKit = stringLiteralKit(
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

export class ImageExtension extends ImageExtensionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/FileExtension/ImageExtension"),
  identifier: "ImageExtension",
  title: "Image Extension",
  description: "Image Mime type file extensions",
}) {
  static readonly Options = ImageExtensionKit.Options;
  static readonly Enum = ImageExtensionKit.Enum;
}

export declare namespace ImageExtension {
  export type Type = S.Schema.Type<typeof ImageExtension>;
  export type Encoded = S.Schema.Encoded<typeof ImageExtension>;
}

//----------------------------------------------------------------------------------------------------------------------
// TEXT EXTENSIONS
//----------------------------------------------------------------------------------------------------------------------
export const TextExtensionKit = stringLiteralKit("html", "txt", "css", "js", "mjs", "xml", "csv", "md", "yaml");

export class TextExtension extends TextExtensionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/FileExtension/TextExtension"),
  identifier: "TextExtension",
  title: "Text Extension",
  description: "Text Mime type file extensions",
}) {
  static readonly Options = TextExtensionKit.Options;
  static readonly Enum = TextExtensionKit.Enum;
}

export declare namespace TextExtension {
  export type Type = S.Schema.Type<typeof TextExtension>;
  export type Encoded = S.Schema.Encoded<typeof TextExtension>;
}

//----------------------------------------------------------------------------------------------------------------------
// VIDEO EXTENSIONS
//----------------------------------------------------------------------------------------------------------------------

export const VideoExtensionKit = stringLiteralKit(
  "mp4",
  "webm",
  "ogg",
  "ogv",
  "m4v",
  "mov",
  "mv4",
  "swf",
  "avi",
  "mkv",
  "flv"
);

export class VideoExtension extends VideoExtensionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/FileExtension/VideoExtension"),
  identifier: "VideoExtension",
  title: "Video Extension",
  description: "Video Mime type file extensions",
}) {
  static readonly Options = VideoExtensionKit.Options;
  static readonly Enum = VideoExtensionKit.Enum;
}

export declare namespace VideoExtension {
  export type Type = S.Schema.Type<typeof VideoExtension>;
  export type Encoded = S.Schema.Encoded<typeof VideoExtension>;
}

//----------------------------------------------------------------------------------------------------------------------
// ALL FILE EXTENSIONS
//----------------------------------------------------------------------------------------------------------------------

export const FileExtensionKit = stringLiteralKit(
  ...ApplicationExtension.Options,
  ...AudioExtension.Options,
  ...FontExtension.Options,
  ...ImageExtension.Options,
  ...TextExtension.Options,
  ...VideoExtension.Options
);

export class FileExtension extends FileExtensionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/custom/FileExtension/FileExtension"),
  identifier: "FileExtension",
  title: "File Extension",
  description: "All file extensions",
}) {}

export declare namespace FileExtension {
  export type Type = S.Schema.Type<typeof FileExtension>;
  export type Encoded = S.Schema.Encoded<typeof FileExtension>;
}
