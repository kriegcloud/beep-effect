/**
 * File extension literal kits grouped by media type.
 *
 * Surfaces schemas and enums for application, audio, image, text, and video extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FileExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const png = S.decodeSync(FileExtension)("png");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import { stringLiteralKit } from "@beep/schema-v2/derived/kits/string-literal-kit";
import type * as S from "effect/Schema";
import { Id } from "./_id";
/**
 * Literal kit covering application file extensions.
 *
 * @example
 * import { ApplicationExtensionKit } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const values = ApplicationExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
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

/**
 * Schema representing supported application extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ApplicationExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const parsed = S.decodeSync(ApplicationExtension)("pdf");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class ApplicationExtension extends ApplicationExtensionKit.Schema.annotations(
  Id.annotations("ApplicationExtension", {
    description: "Application MIME-type extensions.",
  })
) {
  /**
   * Literal list reused for dropdowns.
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  static readonly Options = ApplicationExtensionKit.Options;
  /**
   * Enum keyed by normalized extension identifiers.
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  static readonly Enum = ApplicationExtensionKit.Enum;
}

/**
 * Namespace exposing helper types for {@link ApplicationExtension}.
 *
 * @example
 * import type { ApplicationExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * let ext: ApplicationExtension.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace ApplicationExtension {
  /**
   * Runtime type of {@link ApplicationExtension}.
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ApplicationExtension>;
  /**
   * Encoded representation of {@link ApplicationExtension}.
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ApplicationExtension>;
}

/**
 * Literal kit covering audio-related file extensions.
 *
 * @example
 * import { AudioExtensionKit } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const options = AudioExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
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

/**
 * Schema validating supported audio extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { AudioExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const value = S.decodeSync(AudioExtension)("mp3");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class AudioExtension extends AudioExtensionKit.Schema.annotations(
  Id.annotations("AudioExtension", {
    description: "Audio MIME-type file extensions.",
  })
) {
  /** @category Primitives/String @since 0.1.0 */
  static readonly Options = AudioExtensionKit.Options;
  /** @category Primitives/String @since 0.1.0 */
  static readonly Enum = AudioExtensionKit.Enum;
}

/**
 * Namespace exposing helper types for {@link AudioExtension}.
 *
 * @example
 * import type { AudioExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * let audio: AudioExtension.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace AudioExtension {
  /**
   * Runtime type inferred from {@link AudioExtension}.
   *
   * @example
   * import type { AudioExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let extension: AudioExtension.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof AudioExtension>;
  /**
   * Encoded representation accepted by {@link AudioExtension}.
   *
   * @example
   * import type { AudioExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let encoded: AudioExtension.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof AudioExtension>;
}

/**
 * Literal kit for font file extensions.
 *
 * @example
 * import { FontExtensionKit } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const fonts = FontExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const FontExtensionKit = stringLiteralKit("ttf", "otf", "woff", "woff2");

/**
 * Schema representing supported font extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FontExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const font = S.decodeSync(FontExtension)("woff2");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class FontExtension extends FontExtensionKit.Schema.annotations(
  Id.annotations("FontExtension", {
    description: "Font MIME-type file extensions.",
  })
) {
  /** @category Primitives/String @since 0.1.0 */
  static readonly Options = FontExtensionKit.Options;
  /** @category Primitives/String @since 0.1.0 */
  static readonly Enum = FontExtensionKit.Enum;
}

/**
 * Helper types for {@link FontExtension}.
 *
 * @example
 * import type { FontExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * let font: FontExtension.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace FontExtension {
  /**
   * Runtime type inferred from {@link FontExtension}.
   *
   * @example
   * import type { FontExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let font: FontExtension.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FontExtension>;
  /**
   * Encoded representation accepted by {@link FontExtension}.
   *
   * @example
   * import type { FontExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let encoded: FontExtension.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FontExtension>;
}

/**
 * Literal kit for raster/vector image extensions.
 *
 * @example
 * import { ImageExtensionKit } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const images = ImageExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
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

/**
 * Schema ensuring file extensions correspond to supported image formats.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ImageExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const png = S.decodeSync(ImageExtension)("png");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class ImageExtension extends ImageExtensionKit.Schema.annotations(
  Id.annotations("ImageExtension", {
    description: "Image MIME-type file extensions.",
  })
) {
  /** @category Primitives/String @since 0.1.0 */
  static readonly Options = ImageExtensionKit.Options;
  /** @category Primitives/String @since 0.1.0 */
  static readonly Enum = ImageExtensionKit.Enum;
}

/**
 * Helper types for {@link ImageExtension}.
 *
 * @example
 * import type { ImageExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * let img: ImageExtension.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace ImageExtension {
  /**
   * Runtime type inferred from {@link ImageExtension}.
   *
   * @example
   * import type { ImageExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let image: ImageExtension.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof ImageExtension>;
  /**
   * Encoded representation accepted by {@link ImageExtension}.
   *
   * @example
   * import type { ImageExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let encoded: ImageExtension.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof ImageExtension>;
}

/**
 * Literal kit for structured/plain text file extensions.
 *
 * @example
 * import { TextExtensionKit } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const text = TextExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const TextExtensionKit = stringLiteralKit("html", "txt", "css", "js", "mjs", "xml", "csv", "md", "yaml");

/**
 * Schema validating text-based extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TextExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const html = S.decodeSync(TextExtension)("html");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class TextExtension extends TextExtensionKit.Schema.annotations(
  Id.annotations("TextExtension", {
    description: "Text MIME-type file extensions.",
  })
) {
  /** @category Primitives/String @since 0.1.0 */
  static readonly Options = TextExtensionKit.Options;
  /** @category Primitives/String @since 0.1.0 */
  static readonly Enum = TextExtensionKit.Enum;
}

/**
 * Helper namespace for {@link TextExtension}.
 *
 * @example
 * import type { TextExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * let extension: TextExtension.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace TextExtension {
  /**
   * Runtime type inferred from {@link TextExtension}.
   *
   * @example
   * import type { TextExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let text: TextExtension.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof TextExtension>;
  /**
   * Encoded representation accepted by {@link TextExtension}.
   *
   * @example
   * import type { TextExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let encoded: TextExtension.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof TextExtension>;
}

/**
 * Literal kit for common video file extensions.
 *
 * @example
 * import { VideoExtensionKit } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const video = VideoExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
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

/**
 * Schema ensuring file extensions correspond to supported video formats.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { VideoExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const mp4 = S.decodeSync(VideoExtension)("mp4");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class VideoExtension extends VideoExtensionKit.Schema.annotations(
  Id.annotations("VideoExtension", {
    description: "Video MIME-type file extensions.",
  })
) {
  /** @category Primitives/String @since 0.1.0 */
  static readonly Options = VideoExtensionKit.Options;
  /** @category Primitives/String @since 0.1.0 */
  static readonly Enum = VideoExtensionKit.Enum;
}

/**
 * Helper types for {@link VideoExtension}.
 *
 * @example
 * import type { VideoExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * let video: VideoExtension.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace VideoExtension {
  /**
   * Runtime type inferred from {@link VideoExtension}.
   *
   * @example
   * import type { VideoExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let video: VideoExtension.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof VideoExtension>;
  /**
   * Encoded representation accepted by {@link VideoExtension}.
   *
   * @example
   * import type { VideoExtension } from "@beep/schema-v2/primitives/string/file-extension";
   *
   * let encoded: VideoExtension.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof VideoExtension>;
}

/**
 * Literal kit that merges every per-category extension.
 *
 * @example
 * import { FileExtensionKit } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * const all = FileExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const FileExtensionKit = stringLiteralKit(
  ...ApplicationExtension.Options,
  ...AudioExtension.Options,
  ...FontExtension.Options,
  ...ImageExtension.Options,
  ...TextExtension.Options,
  ...VideoExtension.Options
);

/**
 * Schema validating any supported file extension literal.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FileExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * S.decodeSync(FileExtension)("png");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class FileExtension extends FileExtensionKit.Schema.annotations(
  Id.annotations("FileExtension", {
    description: "All supported file extensions.",
  })
) {}

/**
 * Helper types for {@link FileExtension}.
 *
 * @example
 * import type { FileExtension } from "@beep/schema-v2/primitives/string/file-extension";
 *
 * let ext: FileExtension.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace FileExtension {
  /**
   * Runtime type of {@link FileExtension}.
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FileExtension>;
  /**
   * Encoded representation of {@link FileExtension}.
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FileExtension>;
}
