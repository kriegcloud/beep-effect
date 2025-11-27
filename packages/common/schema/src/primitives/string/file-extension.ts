/**
 * File extension literal kits grouped by media type.
 *
 * Surfaces schemas and enums for application, audio, image, text, and video extensions.
 *
 * For bidirectional extension↔MIME mappings with O(1) lookup, see:
 * - {@link ApplicationExtensionToMime}, {@link AudioExtensionToMime}, etc.
 * - {@link extensionToMime} and {@link mimeToExtension} helper functions
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FileExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * const png = S.decodeSync(FileExtension)("png");
 *
 * @example
 * // Bidirectional mapping with O(1) lookup
 * import { ImageExtensionToMime, extensionToMime } from "@beep/schema/primitives/string/file-extension";
 *
 * ImageExtensionToMime.decodeMap.get("png");  // "image/png"
 * extensionToMime("png");  // "image/png"
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import { $StringId } from "@beep/schema/internal";
import type * as S from "effect/Schema";

// Re-export bidirectional mappings from extension-mime-mapping
export {
  ApplicationExtensionToMime,
  AudioExtensionToMime,
  FontExtensionToMime,
  ImageExtensionToMime,
  TextExtensionToMime,
  VideoExtensionToMime,
  AllExtensionToMimeMappings,
  combinedDecodeMap,
  combinedEncodeMap,
  extensionToMime,
  mimeToExtension,
  isMappedExtension,
  isMappedMimeType,
  type MappedExtension,
  type MappedMimeType,
} from "@beep/schema/primitives/content-types/extension-mime-mapping";

const { $FileExtensionId: Id } = $StringId.compose("file-extension");

/**
 * Schema representing supported application extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ApplicationExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * const parsed = S.decodeSync(ApplicationExtension)("pdf");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class ApplicationExtension extends StringLiteralKit(
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
) {}

/**
 * Namespace exposing helper types for {@link ApplicationExtension}.
 *
 * @example
 * import type { ApplicationExtension } from "@beep/schema/primitives/string/file-extension";
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
 * Schema validating supported audio extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { AudioExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * const value = S.decodeSync(AudioExtension)("mp3");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class AudioExtension extends StringLiteralKit(
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
).annotations(
  Id.annotations("AudioExtension", {
    description: "Audio MIME-type file extensions.",
  })
) {}

/**
 * Namespace exposing helper types for {@link AudioExtension}.
 *
 * @example
 * import type { AudioExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { AudioExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { AudioExtension } from "@beep/schema/primitives/string/file-extension";
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
 * import { FontExtensionKit } from "@beep/schema/primitives/string/file-extension";
 *
 * const fonts = FontExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const FontExtensionKit = StringLiteralKit("ttf", "otf", "woff", "woff2");

/**
 * Schema representing supported font extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FontExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * const font = S.decodeSync(FontExtension)("woff2");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class FontExtension extends StringLiteralKit("ttf", "otf", "woff", "woff2").annotations(
  Id.annotations("FontExtension", {
    description: "Font MIME-type file extensions.",
  })
) {}

/**
 * Helper types for {@link FontExtension}.
 *
 * @example
 * import type { FontExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { FontExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { FontExtension } from "@beep/schema/primitives/string/file-extension";
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
 * import { ImageExtensionKit } from "@beep/schema/primitives/string/file-extension";
 *
 * const images = ImageExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const ImageExtensionKit = StringLiteralKit(
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
 * import { ImageExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * const png = S.decodeSync(ImageExtension)("png");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class ImageExtension extends StringLiteralKit(
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
).annotations(
  Id.annotations("ImageExtension", {
    description: "Image MIME-type file extensions.",
  })
) {}

/**
 * Helper types for {@link ImageExtension}.
 *
 * @example
 * import type { ImageExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { ImageExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { ImageExtension } from "@beep/schema/primitives/string/file-extension";
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
 * import { TextExtensionKit } from "@beep/schema/primitives/string/file-extension";
 *
 * const text = TextExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const TextExtensionKit = StringLiteralKit("html", "txt", "css", "js", "mjs", "xml", "csv", "md", "yaml");

/**
 * Schema validating text-based extensions.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TextExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * const html = S.decodeSync(TextExtension)("html");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class TextExtension extends StringLiteralKit(
  "html",
  "txt",
  "css",
  "js",
  "mjs",
  "xml",
  "csv",
  "md",
  "yaml"
).annotations(
  Id.annotations("TextExtension", {
    description: "Text MIME-type file extensions.",
  })
) {}

/**
 * Helper namespace for {@link TextExtension}.
 *
 * @example
 * import type { TextExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { TextExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { TextExtension } from "@beep/schema/primitives/string/file-extension";
   *
   * let encoded: TextExtension.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof TextExtension>;
}

/**
 * Schema ensuring file extensions correspond to supported video formats.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { VideoExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * const mp4 = S.decodeSync(VideoExtension)("mp4");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class VideoExtension extends StringLiteralKit(
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
).annotations(
  Id.annotations("VideoExtension", {
    description: "Video MIME-type file extensions.",
  })
) {}

/**
 * Helper types for {@link VideoExtension}.
 *
 * @example
 * import type { VideoExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { VideoExtension } from "@beep/schema/primitives/string/file-extension";
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
   * import type { VideoExtension } from "@beep/schema/primitives/string/file-extension";
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
 * import { FileExtensionKit } from "@beep/schema/primitives/string/file-extension";
 *
 * const all = FileExtensionKit.Options;
 *
 * @category Primitives/String
 * @since 0.1.0
 */

/**
 * Schema validating any supported file extension literal.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FileExtension } from "@beep/schema/primitives/string/file-extension";
 *
 * S.decodeSync(FileExtension)("png");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class FileExtension extends StringLiteralKit(
  ...ApplicationExtension.Options,
  ...AudioExtension.Options,
  ...FontExtension.Options,
  ...ImageExtension.Options,
  ...TextExtension.Options,
  ...VideoExtension.Options
).annotations(
  Id.annotations("FileExtension", {
    description: "All supported file extensions.",
  })
) {}

/**
 * Helper types for {@link FileExtension}.
 *
 * @example
 * import type { FileExtension } from "@beep/schema/primitives/string/file-extension";
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
