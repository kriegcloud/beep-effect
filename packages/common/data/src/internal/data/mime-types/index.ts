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

import { thunkEmptyStr } from "@beep/utils";
import { pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { application as _application } from "./application.ts";
import { audio as _audio } from "./audio.ts";
import { image as _image } from "./image.ts";
import { misc as _misc } from "./misc.ts";
import { text as _text } from "./text.ts";
import { video as _video } from "./video.ts";

/**
 * Record of `application/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const application = _application;

/**
 * Record of `audio/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const audio = _audio;

/**
 * Record of `image/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const image = _image;

/**
 * Record of miscellaneous MIME type definitions covering chemical, font,
 * message, model, and x-conference types.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const misc = _misc;

/**
 * Record of `text/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const text = _text;

/**
 * Record of `video/*` MIME type definitions sourced from IANA, Apache,
 * and Nginx registries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const video = _video;

/**
 * Combined record of all MIME type definitions across every category
 * (application, audio, image, text, video, and miscellaneous).
 *
 * This is the raw merged data object that backs the `mimeTypes` typed record.
 *
 * @since 0.0.0
 * @category Configuration
 * @example
 * ```typescript
 * import { mimes } from "@beep/data"
 *
 * mimes["text/css"]
 * // { source: "iana", charset: "UTF-8", extensions: ["css"] }
 * ```
 */
export const mimes = {
  ...application,
  ...audio,
  ...image,
  ...text,
  ...video,
  ...misc,
};

/**
 * Union of all known MIME type strings derived from the vendored mime-db data.
 *
 * Each member is a full MIME type string such as `"application/json"` or `"image/png"`.
 *
 * @since 0.0.0
 * @category DomainModel
 * @example
 * ```typescript
 * import type { MimeType } from "@beep/data"
 *
 * const contentType: MimeType = "application/json"
 * ```
 */
export type MimeType = keyof typeof mimes;

/**
 * Union of all known file extension strings (without leading dot) derived
 * from the vendored mime-db data.
 *
 * Each member is a bare extension like `"json"`, `"html"`, or `"png"`.
 *
 * @since 0.0.0
 * @category DomainModel
 * @example
 * ```typescript
 * import type { FileExtension } from "@beep/data"
 *
 * const ext: FileExtension = "json"
 * ```
 */
export type FileExtension = (typeof mimes)[MimeType]["extensions"][number];

/**
 * Record mapping each known MIME type to its source registry and associated
 * file extensions. The source indicates where the MIME type definition
 * originated (`"iana"`, `"apache"`, or `"nginx"`).
 *
 * @since 0.0.0
 * @category Configuration
 * @example
 * ```typescript
 * import { mimeTypes } from "@beep/data"
 *
 * const json = mimeTypes["application/json"]
 * // { source: "iana", extensions: ["json", "map"] }
 * ```
 */
export const mimeTypes = mimes as unknown as Record<MimeType, { source: string; extensions: FileExtension[] }>;

function extname(path: string) {
  return Str.lastIndexOf(".")(path).pipe(
    O.map((index) => Str.substring(index)(path)),
    O.getOrElse(thunkEmptyStr)
  );
}

const extensions = R.empty<MimeType, FileExtension[]>();
const types = {} as Record<FileExtension, MimeType>;

/**
 * Returns a record mapping each file extension (without leading dot) to its
 * preferred MIME type string. Preference is determined by source priority:
 * IANA > unspecified > Apache > Nginx.
 *
 * Lazily populates the internal lookup tables on first call; subsequent
 * calls return the same cached object.
 *
 * @since 0.0.0
 * @category Utility
 * @example
 * ```typescript
 * import { getTypes } from "@beep/data"
 *
 * const types = getTypes()
 * types["json"] // "application/json"
 * types["html"] // "text/html"
 * ```
 */
export function getTypes(): Record<FileExtension, MimeType> {
  populateMaps(extensions, types);
  return types;
}

/**
 * Returns a record mapping each known MIME type to an array of its associated
 * file extensions (without leading dots).
 *
 * Lazily populates the internal lookup tables on first call; subsequent
 * calls return the same cached object.
 *
 * @since 0.0.0
 * @category Utility
 * @example
 * ```typescript
 * import { getExtensions } from "@beep/data"
 *
 * const extensions = getExtensions()
 * extensions["application/json"] // ["json", "map"]
 * extensions["text/html"]        // ["html", "htm", "shtml"]
 * ```
 */
export function getExtensions(): Record<MimeType, FileExtension[]> {
  populateMaps(extensions, types);
  return extensions;
}

/**
 * Look up the MIME type for a file path or extension.
 *
 * Accepts a bare extension (`"json"`), a dotted extension (`".json"`), or a
 * full file path (`"path/to/file.json"`). The lookup is case-insensitive.
 * Returns the matching MIME type string, or `false` if no match is found.
 *
 * @since 0.0.0
 * @category Utility
 * @example
 * ```typescript
 * import { lookup } from "@beep/data"
 *
 * lookup("json")            // "application/json"
 * lookup(".html")           // "text/html"
 * lookup("photo.png")       // "image/png"
 * lookup("unknown.zzzzz")   // false
 * ```
 */
export function lookup(path: string): false | MimeType {
  if (Str.isEmpty(path)) {
    return false;
  }

  // get the extension ("ext" or ".ext" or full path)
  const extension = pipe(extname(`x.${path}`), Str.toLowerCase, Str.substring(1));

  if (Str.isEmpty(extension)) {
    return false;
  }

  return getTypes()[extension as keyof typeof types] || false;
}

let inittedMaps = false;

// source preference (least -> most)
const preference: ReadonlyArray<string | undefined> = ["nginx", "apache", undefined, "iana"];

function preferenceOf(source: string): number {
  return pipe(
    preference,
    A.findFirstIndex((p) => p === source),
    O.getOrElse(() => -1)
  );
}

/**
 * Populate the extensions and types maps.
 * @private
 */
function populateMaps(extensions: Record<MimeType, FileExtension[]>, types: Record<FileExtension, MimeType>) {
  if (inittedMaps) return;
  inittedMaps = true;

  for (const type of Struct.keys(mimeTypes)) {
    const mime = mimeTypes[type];
    const exts = mime.extensions;

    if (A.isArrayEmpty(exts)) {
      continue;
    }

    // mime -> extensions
    extensions[type] = exts;

    // extension -> mime
    for (const extension of exts) {
      if (extension in types) {
        const from = preferenceOf(mimeTypes[types[extension]].source);
        const to = preferenceOf(mime.source);

        if (
          types[extension] !== "application/octet-stream" &&
          (from > to || (from === to && Str.startsWith("application/")(types[extension])))
        ) {
          // skip the remapping
          continue;
        }
      }

      // set the extension -> mime
      types[extension] = type;
    }
  }
}
