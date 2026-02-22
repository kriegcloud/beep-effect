/**
 * Edge-compatible MIME type lookup utilities.
 *
 * Vendored from `mime-types`, ported to TypeScript, and adapted to avoid
 * Node-only APIs like `path.extname` so the module runs in edge runtimes
 * (Cloudflare Workers, Deno Deploy, Vercel Edge, etc.).
 *
 * @module
 * @since 0.0.0
 */

import * as internal from "./internal/data/mime-types/index.js";

// -------------------------------------------------------------------------------------
// types
// -------------------------------------------------------------------------------------

/**
 * Union of all known MIME type strings derived from the vendored mime-db data.
 *
 * Each member is a full MIME type string such as `"application/json"` or `"image/png"`.
 *
 * @since 0.0.0
 * @category types
 * @example
 * ```ts
 * import type { MimeType } from "@beep/data/MimeTypes"
 *
 * const contentType: MimeType = "application/json"
 * ```
 */
export type MimeType = internal.MimeType;

/**
 * Union of all known file extension strings (without leading dot) derived
 * from the vendored mime-db data.
 *
 * Each member is a bare extension like `"json"`, `"html"`, or `"png"`.
 *
 * @since 0.0.0
 * @category types
 * @example
 * ```ts
 * import type { FileExtension } from "@beep/data/MimeTypes"
 *
 * const ext: FileExtension = "json"
 * ```
 */
export type FileExtension = internal.FileExtension;

// -------------------------------------------------------------------------------------
// data
// -------------------------------------------------------------------------------------

/**
 * Record of `application/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category data
 * @example
 * ```ts
 * import { application } from "@beep/data/MimeTypes"
 *
 * application["application/json"]
 * // { source: "iana", extensions: ["json", "map"] }
 * ```
 */
export const application: typeof internal.application = internal.application;

/**
 * Record of `audio/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category data
 * @example
 * ```ts
 * import { audio } from "@beep/data/MimeTypes"
 *
 * audio["audio/mpeg"]
 * // { source: "iana", extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"] }
 * ```
 */
export const audio: typeof internal.audio = internal.audio;

/**
 * Record of `image/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category data
 * @example
 * ```ts
 * import { image } from "@beep/data/MimeTypes"
 *
 * image["image/png"]
 * // { source: "iana", extensions: ["png"] }
 * ```
 */
export const image: typeof internal.image = internal.image;

/**
 * Record of miscellaneous MIME type definitions covering chemical, font,
 * message, model, and x-conference types.
 *
 * @since 0.0.0
 * @category data
 * @example
 * ```ts
 * import { misc } from "@beep/data/MimeTypes"
 *
 * misc["font/woff2"]
 * // { source: "iana", extensions: ["woff2"] }
 * ```
 */
export const misc: typeof internal.misc = internal.misc;

/**
 * Record of `text/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category data
 * @example
 * ```ts
 * import { text } from "@beep/data/MimeTypes"
 *
 * text["text/html"]
 * // { source: "iana", extensions: ["html", "htm", "shtml"] }
 * ```
 */
export const text: typeof internal.text = internal.text;

/**
 * Record of `video/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category data
 * @example
 * ```ts
 * import { video } from "@beep/data/MimeTypes"
 *
 * video["video/mp4"]
 * // { source: "iana", extensions: ["mp4", "mp4v", "mpg4"] }
 * ```
 */
export const video: typeof internal.video = internal.video;

// -------------------------------------------------------------------------------------
// constants
// -------------------------------------------------------------------------------------

/**
 * Combined record of all MIME type definitions across every category
 * (application, audio, image, text, video, and miscellaneous).
 *
 * This is the raw merged data object that backs the `mimeTypes` typed record.
 *
 * @since 0.0.0
 * @category constants
 * @example
 * ```ts
 * import { mimes } from "@beep/data/MimeTypes"
 *
 * mimes["text/css"]
 * // { source: "iana", charset: "UTF-8", extensions: ["css"] }
 * ```
 */
export const mimes: typeof internal.mimes = internal.mimes;

/**
 * Record mapping each known MIME type to its source registry and associated
 * file extensions. The source indicates where the MIME type definition
 * originated (`"iana"`, `"apache"`, or `"nginx"`).
 *
 * @since 0.0.0
 * @category constants
 * @example
 * ```ts
 * import { mimeTypes } from "@beep/data/MimeTypes"
 *
 * const json = mimeTypes["application/json"]
 * // { source: "iana", extensions: ["json", "map"] }
 * ```
 */
export const mimeTypes: typeof internal.mimeTypes = internal.mimeTypes;

// -------------------------------------------------------------------------------------
// getters
// -------------------------------------------------------------------------------------

/**
 * Returns a record mapping each file extension (without leading dot) to its
 * preferred MIME type string. Preference is determined by source priority:
 * IANA > unspecified > Apache > Nginx.
 *
 * Lazily populates the internal lookup tables on first call; subsequent
 * calls return the same cached object.
 *
 * @since 0.0.0
 * @category getters
 * @example
 * ```ts
 * import { getTypes } from "@beep/data/MimeTypes"
 *
 * const types = getTypes()
 * types["json"] // "application/json"
 * types["html"] // "text/html"
 * ```
 */
export const getTypes: () => Record<FileExtension, MimeType> = internal.getTypes;

/**
 * Returns a record mapping each known MIME type to an array of its associated
 * file extensions (without leading dots).
 *
 * Lazily populates the internal lookup tables on first call; subsequent
 * calls return the same cached object.
 *
 * @since 0.0.0
 * @category getters
 * @example
 * ```ts
 * import { getExtensions } from "@beep/data/MimeTypes"
 *
 * const extensions = getExtensions()
 * extensions["application/json"] // ["json", "map"]
 * extensions["text/html"]        // ["html", "htm", "shtml"]
 * ```
 */
export const getExtensions: () => Record<MimeType, FileExtension[]> = internal.getExtensions;

// -------------------------------------------------------------------------------------
// lookups
// -------------------------------------------------------------------------------------

/**
 * Look up the MIME type for a file path or extension.
 *
 * Accepts a bare extension (`"json"`), a dotted extension (`".json"`), or a
 * full file path (`"path/to/file.json"`). The lookup is case-insensitive.
 * Returns the matching MIME type string, or `false` if no match is found.
 *
 * @since 0.0.0
 * @category lookups
 * @example
 * ```ts
 * import { lookup } from "@beep/data/MimeTypes"
 *
 * lookup("json")            // "application/json"
 * lookup(".html")           // "text/html"
 * lookup("photo.png")       // "image/png"
 * lookup("unknown.zzzzz")   // false
 * ```
 */
export const lookup: (path: string) => false | MimeType = internal.lookup;
