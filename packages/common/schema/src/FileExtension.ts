/**
 * Schema-backed file extension literals derived from the shared mime-type tables.
 *
 * This module exposes per-category schemas for the supported mime datasets and a
 * combined {@link FileExtension} schema that accepts any known extension from
 * those groups.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { FileExtension, ImageFileExtension } from "@beep/schema/FileExtension";
 *
 * const png = S.decodeUnknownSync(FileExtension)("png");
 * const jpeg = S.decodeUnknownSync(ImageFileExtension)("jpeg");
 * console.log([png, jpeg]);
 * ```
 *
 * @module @beep/schema/FileExtension
 * @since 0.0.0
 */

import { application, audio, image, misc, text, video } from "@beep/data/MimeTypes";
import { $SchemaId } from "@beep/identity";
import { A, Struct } from "@beep/utils";
import { pipe } from "effect";
import { cast } from "effect/Function";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("FileExtension");

type MimeTypeProperty = {
  readonly [mimeType: string]: {
    readonly source: string;
    readonly extensions: A.NonEmptyReadonlyArray<string>;
  };
};

type MimeTypeExtension<T extends MimeTypeProperty> = T[keyof T]["extensions"][number];

/**
 * Extracts the distinct file extensions from a mime-type dictionary.
 *
 * The output preserves the encounter order from the input map while flattening
 * nested `extensions` arrays and removing duplicates.
 *
 * @example
 * ```typescript
 * import { extractMimeExtensions } from "@beep/schema/FileExtension";
 *
 * const extensions = extractMimeExtensions({
 *   "text/plain": {
 *     source: "iana",
 *     extensions: ["txt"] as const,
 *   },
 *   "text/markdown": {
 *     source: "iana",
 *     extensions: ["md", "markdown"] as const,
 *   },
 *   "text/x-readme": {
 *     source: "custom",
 *     extensions: ["md"] as const,
 *   },
 * });
 *
 * console.log(extensions); // ["txt", "md", "markdown"]
 * ```
 *
 * @param mime {T} - The mime-type dictionary whose extensions should be collected.
 * @returns {A.NonEmptyReadonlyArray<MimeTypeExtension<T>>} - A deduplicated non-empty list of extensions.
 * @since 0.0.0
 * @category Utility
 */
export const extractMimeExtensions = <const T extends MimeTypeProperty>(
  mime: T
): A.NonEmptyReadonlyArray<MimeTypeExtension<T>> =>
  cast<Array<MimeTypeExtension<T>>, A.NonEmptyReadonlyArray<MimeTypeExtension<T>>>(
    pipe(
      mime,
      Struct.entries,
      A.flatMap(([_, { extensions }]) => extensions),
      A.dedupe
    )
  );

/**
 * Schema for file extensions associated with `application/*` mime types.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ApplicationFileExtension = pipe(
  application,
  extractMimeExtensions,
  LiteralKit,
  $I.annoteSchema("ApplicationExtension", {
    description: "A file extension for a mime type that is an application.",
  })
);

/**
 * Union of literals accepted by {@link ApplicationFileExtension}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ApplicationFileExtension = typeof ApplicationFileExtension.Type;

/**
 * Schema for file extensions associated with `video/*` mime types.
 *
 * @since 0.0.0
 * @category Validation
 */
export const VideoFileExtension = pipe(
  video,
  extractMimeExtensions,
  LiteralKit,
  $I.annoteSchema("VideoExtension", {
    description: "A file extension for a mime type that is a video.",
  })
);

/**
 * Union of literals accepted by {@link VideoFileExtension}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type VideoFileExtension = typeof VideoFileExtension.Type;

/**
 * Schema for file extensions associated with `text/*` mime types.
 *
 * @since 0.0.0
 * @category Validation
 */
export const TextFileExtension = pipe(
  text,
  extractMimeExtensions,
  LiteralKit,
  $I.annoteSchema("TextExtension", {
    description: "A file extension for a mime type that is text.",
  })
);

/**
 * Union of literals accepted by {@link TextFileExtension}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TextFileExtension = typeof TextFileExtension.Type;

/**
 * Schema for file extensions associated with `image/*` mime types.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ImageFileExtension = pipe(
  image,
  extractMimeExtensions,
  LiteralKit,
  $I.annoteSchema("ImageExtension", {
    description: "A file extension for a mime type that is an image.",
  })
);

/**
 * Union of literals accepted by {@link ImageFileExtension}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ImageFileExtension = typeof ImageFileExtension.Type;

/**
 * Schema for file extensions associated with `audio/*` mime types.
 *
 * @since 0.0.0
 * @category Validation
 */
export const AudioFileExtension = pipe(
  audio,
  extractMimeExtensions,
  LiteralKit,
  $I.annoteSchema("AudioExtension", {
    description: "A file extension for a mime type that is an audio file.",
  })
);

/**
 * Union of literals accepted by {@link AudioFileExtension}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AudioFileExtension = typeof AudioFileExtension.Type;

/**
 * Schema for file extensions associated with miscellaneous mime types.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MiscFileExtension = pipe(
  misc,
  extractMimeExtensions,
  LiteralKit,
  $I.annoteSchema("MiscExtension", {
    description: "A file extension for a mime type that is miscellaneous.",
  })
);

/**
 * Union of literals accepted by {@link MiscFileExtension}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MiscFileExtension = typeof MiscFileExtension.Type;

/**
 * Schema for any supported file extension across the shared mime-type dataset.
 *
 * This combines the application, video, text, image, audio, and miscellaneous
 * extension groups into a single literal schema.
 *
 * @since 0.0.0
 * @category Validation
 */
export const FileExtension = LiteralKit([
  ...ApplicationFileExtension.Options,
  ...VideoFileExtension.Options,
  ...TextFileExtension.Options,
  ...ImageFileExtension.Options,
  ...AudioFileExtension.Options,
  ...MiscFileExtension.Options,
]).pipe(
  $I.annoteSchema("FileExtension", {
    description: "A file extension for a mime type.",
  })
);

/**
 * Union of literals accepted by {@link FileExtension}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FileExtension = typeof FileExtension.Type;
