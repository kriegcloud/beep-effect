/**
 * Bidirectional mappings between file extensions and MIME types using MappedLiteralKit.
 *
 * Provides O(1) lookup for extension → MIME and MIME → extension conversions,
 * along with literal kits for both sides of each category.
 *
 * @example
 * import { ImageExtensionToMime, extensionToMime, mimeToExtension } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * // O(1) lookup via maps
 * ImageExtensionToMime.decodeMap.get("png");  // "image/png"
 * ImageExtensionToMime.encodeMap.get("image/png");  // "png"
 *
 * // Helper functions
 * extensionToMime("png");  // "image/png"
 * mimeToExtension("image/png");  // "png"
 *
 * // Access literal kits
 * ImageExtensionToMime.From.Options;  // ["png", "jpg", ...]
 * ImageExtensionToMime.To.Options;    // ["image/png", "image/jpeg", ...]
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
import { MappedLiteralKit } from "@beep/schema/derived/kits/mapped-literal-kit";
import { $ContentTypeId } from "@beep/schema/internal";

const { $ExtensionMimeMappingId: Id } = $ContentTypeId.compose("extension-mime-mapping");

//----------------------------------------------------------------------------------------------------------------------
// APPLICATION EXTENSION ↔ MIME MAPPING
//----------------------------------------------------------------------------------------------------------------------
/**
 * Bidirectional mapping between application file extensions and MIME types.
 *
 * @example
 * import { ApplicationExtensionToMime } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * ApplicationExtensionToMime.decodeMap.get("json");  // "application/json"
 * ApplicationExtensionToMime.encodeMap.get("application/json");  // "json"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const ApplicationExtensionToMime = MappedLiteralKit(
  ["blend", "application/x-blender"],
  ["elf", "application/x-executable"],
  ["exe", "application/x-msdownload"],
  ["indd", "application/x-indesign"],
  ["macho", "application/x-mach-binary"],
  ["orc", "application/x-orc"],
  ["parquet", "application/vnd.apache.parquet"],
  ["ps", "application/postscript"],
  ["sqlite", "application/x-sqlite3"],
  ["stl", "application/sla"],
  ["pcap", "application/vnd.tcpdump.pcap"],
  ["json", "application/json"],
  ["xml", "application/xml"],
  ["js", "application/javascript"],
  ["pdf", "application/pdf"],
  ["lzh", "application/x-lzh-compressed"],
  ["zip", "application/zip"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["doc", "application/msword"],
  ["rar", "application/x-rar-compressed"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["ppt", "application/vnd.ms-powerpoint"],
  ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ["graphql", "application/graphql"],
  ["tar", "application/x-tar"],
  ["gzip", "application/gzip"],
  ["7z", "application/x-7z-compressed"],
  ["rtf", "application/rtf"]
).annotations(
  Id.annotations("ApplicationExtensionToMime", {
    description: "Bidirectional mapping between application file extensions and MIME types.",
  })
);

/**
 * Helper namespace for {@link ApplicationExtensionToMime}.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace ApplicationExtensionToMime {
  /** Extension literal (From side) */
  export type Extension = (typeof ApplicationExtensionToMime)["From"]["Options"][number];
  /** MIME type literal (To side) */
  export type MimeType = (typeof ApplicationExtensionToMime)["To"]["Options"][number];
}

//----------------------------------------------------------------------------------------------------------------------
// AUDIO EXTENSION ↔ MIME MAPPING
//----------------------------------------------------------------------------------------------------------------------
/**
 * Bidirectional mapping between audio file extensions and MIME types.
 *
 * @example
 * import { AudioExtensionToMime } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * AudioExtensionToMime.decodeMap.get("mp3");  // "audio/mpeg"
 * AudioExtensionToMime.encodeMap.get("audio/mpeg");  // "mp3"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const AudioExtensionToMime = MappedLiteralKit(
  ["mp3", "audio/mpeg"],
  ["wav", "audio/wav"],
  ["amr", "audio/amr"],
  ["ogg", "audio/ogg"],
  ["aac", "audio/aac"],
  ["flac", "audio/x-flac"],
  ["m4a", "audio/x-m4a"],
  ["wma", "audio/x-ms-wma"],
  ["opus", "audio/opus"],
  ["webm", "audio/webm"],
  ["aiff", "audio/aiff"]
).annotations(
  Id.annotations("AudioExtensionToMime", {
    description: "Bidirectional mapping between audio file extensions and MIME types.",
  })
);

/**
 * Helper namespace for {@link AudioExtensionToMime}.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace AudioExtensionToMime {
  /** Extension literal (From side) */
  export type Extension = (typeof AudioExtensionToMime)["From"]["Options"][number];
  /** MIME type literal (To side) */
  export type MimeType = (typeof AudioExtensionToMime)["To"]["Options"][number];
}

//----------------------------------------------------------------------------------------------------------------------
// FONT EXTENSION ↔ MIME MAPPING
//----------------------------------------------------------------------------------------------------------------------
/**
 * Bidirectional mapping between font file extensions and MIME types.
 *
 * @example
 * import { FontExtensionToMime } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * FontExtensionToMime.decodeMap.get("woff2");  // "font/woff2"
 * FontExtensionToMime.encodeMap.get("font/woff2");  // "woff2"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const FontExtensionToMime = MappedLiteralKit(
  ["ttf", "font/ttf"],
  ["otf", "font/otf"],
  ["woff", "font/woff"],
  ["woff2", "font/woff2"]
).annotations(
  Id.annotations("FontExtensionToMime", {
    description: "Bidirectional mapping between font file extensions and MIME types.",
  })
);

/**
 * Helper namespace for {@link FontExtensionToMime}.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace FontExtensionToMime {
  /** Extension literal (From side) */
  export type Extension = (typeof FontExtensionToMime)["From"]["Options"][number];
  /** MIME type literal (To side) */
  export type MimeType = (typeof FontExtensionToMime)["To"]["Options"][number];
}

//----------------------------------------------------------------------------------------------------------------------
// IMAGE EXTENSION ↔ MIME MAPPING
//----------------------------------------------------------------------------------------------------------------------
/**
 * Bidirectional mapping between image file extensions and MIME types.
 *
 * Note: Some extensions like jpg/jpeg map to the same MIME type. This mapping uses
 * canonical extensions (one per MIME type). For variants, see the extension literal kits.
 *
 * @example
 * import { ImageExtensionToMime } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * ImageExtensionToMime.decodeMap.get("png");  // "image/png"
 * ImageExtensionToMime.encodeMap.get("image/png");  // "png"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const ImageExtensionToMime = MappedLiteralKit(
  ["psd", "image/vnd.adobe.photoshop"],
  ["ppm", "image/x-portable-pixmap"],
  ["pgm", "image/x-portable-graymap"],
  ["pbm", "image/x-portable-bitmap"],
  ["ico", "image/x-icon"],
  ["heic", "image/heic"],
  ["cr2", "image/x-canon-cr2"],
  ["exr", "image/x-exr"],
  ["bpg", "image/bpg"],
  ["apng", "image/apng"],
  ["avif", "image/avif"],
  ["gif", "image/gif"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["svg", "image/svg+xml"],
  ["webp", "image/webp"],
  ["bmp", "image/bmp"],
  ["tiff", "image/tiff"]
).annotations(
  Id.annotations("ImageExtensionToMime", {
    description: "Bidirectional mapping between image file extensions and MIME types.",
  })
);

/**
 * Helper namespace for {@link ImageExtensionToMime}.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace ImageExtensionToMime {
  /** Extension literal (From side) */
  export type Extension = (typeof ImageExtensionToMime)["From"]["Options"][number];
  /** MIME type literal (To side) */
  export type MimeType = (typeof ImageExtensionToMime)["To"]["Options"][number];
}

//----------------------------------------------------------------------------------------------------------------------
// TEXT EXTENSION ↔ MIME MAPPING
//----------------------------------------------------------------------------------------------------------------------
/**
 * Bidirectional mapping between text file extensions and MIME types.
 *
 * @example
 * import { TextExtensionToMime } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * TextExtensionToMime.decodeMap.get("html");  // "text/html"
 * TextExtensionToMime.encodeMap.get("text/html");  // "html"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const TextExtensionToMime = MappedLiteralKit(
  ["html", "text/html"],
  ["txt", "text/plain"],
  ["css", "text/css"],
  ["mjs", "text/javascript"],
  ["xml", "text/xml"],
  ["csv", "text/csv"],
  ["md", "text/markdown"],
  ["yaml", "text/yaml"]
).annotations(
  Id.annotations("TextExtensionToMime", {
    description: "Bidirectional mapping between text file extensions and MIME types.",
  })
);

/**
 * Helper namespace for {@link TextExtensionToMime}.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace TextExtensionToMime {
  /** Extension literal (From side) */
  export type Extension = (typeof TextExtensionToMime)["From"]["Options"][number];
  /** MIME type literal (To side) */
  export type MimeType = (typeof TextExtensionToMime)["To"]["Options"][number];
}

//----------------------------------------------------------------------------------------------------------------------
// VIDEO EXTENSION ↔ MIME MAPPING
//----------------------------------------------------------------------------------------------------------------------
/**
 * Bidirectional mapping between video file extensions and MIME types.
 *
 * Note: swf maps to application/x-shockwave-flash but is historically grouped with video.
 *
 * @example
 * import { VideoExtensionToMime } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * VideoExtensionToMime.decodeMap.get("mp4");  // "video/mp4"
 * VideoExtensionToMime.encodeMap.get("video/mp4");  // "mp4"
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const VideoExtensionToMime = MappedLiteralKit(
  ["mp4", "video/mp4"],
  ["webm", "video/webm"],
  ["ogg", "video/ogg"],
  ["ogv", "video/ogv"],
  ["avi", "video/x-msvideo"],
  ["mkv", "video/x-matroska"],
  ["flv", "video/x-flv"],
  ["m4v", "video/x-m4v"],
  ["mov", "video/quicktime"],
  ["swf", "application/x-shockwave-flash"]
).annotations(
  Id.annotations("VideoExtensionToMime", {
    description: "Bidirectional mapping between video file extensions and MIME types.",
  })
);

/**
 * Helper namespace for {@link VideoExtensionToMime}.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export declare namespace VideoExtensionToMime {
  /** Extension literal (From side) */
  export type Extension = (typeof VideoExtensionToMime)["From"]["Options"][number];
  /** MIME type literal (To side) */
  export type MimeType = (typeof VideoExtensionToMime)["To"]["Options"][number];
}

//----------------------------------------------------------------------------------------------------------------------
// COMBINED MAPPING UTILITIES
//----------------------------------------------------------------------------------------------------------------------

/**
 * All category mappings as an array for iteration.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const AllExtensionToMimeMappings = [
  ApplicationExtensionToMime,
  AudioExtensionToMime,
  FontExtensionToMime,
  ImageExtensionToMime,
  TextExtensionToMime,
  VideoExtensionToMime,
] as const;

/**
 * Union type of all mapped extensions.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export type MappedExtension =
  | ApplicationExtensionToMime.Extension
  | AudioExtensionToMime.Extension
  | FontExtensionToMime.Extension
  | ImageExtensionToMime.Extension
  | TextExtensionToMime.Extension
  | VideoExtensionToMime.Extension;

/**
 * Union type of all mapped MIME types.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export type MappedMimeType =
  | ApplicationExtensionToMime.MimeType
  | AudioExtensionToMime.MimeType
  | FontExtensionToMime.MimeType
  | ImageExtensionToMime.MimeType
  | TextExtensionToMime.MimeType
  | VideoExtensionToMime.MimeType;

/**
 * Combined decode map (extension → MIME) from all categories.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const combinedDecodeMap: ReadonlyMap<MappedExtension, MappedMimeType> = new Map([
  ...ApplicationExtensionToMime.decodeMap,
  ...AudioExtensionToMime.decodeMap,
  ...FontExtensionToMime.decodeMap,
  ...ImageExtensionToMime.decodeMap,
  ...TextExtensionToMime.decodeMap,
  ...VideoExtensionToMime.decodeMap,
] as Array<[MappedExtension, MappedMimeType]>);

/**
 * Combined encode map (MIME → extension) from all categories.
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const combinedEncodeMap: ReadonlyMap<MappedMimeType, MappedExtension> = new Map([
  ...ApplicationExtensionToMime.encodeMap,
  ...AudioExtensionToMime.encodeMap,
  ...FontExtensionToMime.encodeMap,
  ...ImageExtensionToMime.encodeMap,
  ...TextExtensionToMime.encodeMap,
  ...VideoExtensionToMime.encodeMap,
] as Array<[MappedMimeType, MappedExtension]>);

//----------------------------------------------------------------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

/**
 * Convert a file extension to its corresponding MIME type.
 *
 * Returns undefined if the extension is not mapped.
 *
 * @example
 * import { extensionToMime } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * extensionToMime("png");   // "image/png"
 * extensionToMime("mp3");   // "audio/mpeg"
 * extensionToMime("json");  // "application/json"
 * extensionToMime("xyz");   // undefined
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const extensionToMime = (ext: MappedExtension): MappedMimeType | undefined => combinedDecodeMap.get(ext);

/**
 * Convert a MIME type to its corresponding file extension.
 *
 * Returns undefined if the MIME type is not mapped.
 *
 * @example
 * import { mimeToExtension } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * mimeToExtension("image/png");         // "png"
 * mimeToExtension("audio/mpeg");        // "mp3"
 * mimeToExtension("application/json");  // "json"
 * mimeToExtension("unknown/type");      // undefined
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const mimeToExtension = (mime: MappedMimeType): MappedExtension | undefined => combinedEncodeMap.get(mime);

/**
 * Check if a string is a mapped file extension.
 *
 * @example
 * import { isMappedExtension } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * isMappedExtension("png");  // true
 * isMappedExtension("xyz");  // false
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const isMappedExtension = (ext: string): ext is MappedExtension => combinedDecodeMap.has(ext as MappedExtension);

/**
 * Check if a string is a mapped MIME type.
 *
 * @example
 * import { isMappedMimeType } from "@beep/schema/primitives/content-types/extension-mime-mapping";
 *
 * isMappedMimeType("image/png");     // true
 * isMappedMimeType("unknown/type");  // false
 *
 * @category Primitives/Network/Mime
 * @since 0.1.0
 */
export const isMappedMimeType = (mime: string): mime is MappedMimeType => combinedEncodeMap.has(mime as MappedMimeType);
