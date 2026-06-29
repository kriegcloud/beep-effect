/**
 * MIME type literal schemas derived from the official IANA registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { MimeTypesData } from "@beep/data";
import { $SchemaId } from "@beep/identity/packages";
import { A, Struct } from "@beep/utils";
import { Function as Fn, flow, pipe } from "effect";
import { LiteralKit } from "./LiteralKit/index.ts";
import type { LiteralKit as LiteralKitSchema } from "./LiteralKit/index.ts";

const $I = $SchemaId.create("MimeType");

type MimeTypeProperty = {
  readonly [mimeType: string]: unknown;
};
type MimeTypeKey<T extends MimeTypeProperty> = keyof T & string;

type MimeTypeKinds = {
  readonly Application: LiteralKitSchema<
    A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.OfficialMimeTypeDataByTopLevel.application, string>>
  >;
  readonly Video: LiteralKitSchema<
    A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.OfficialMimeTypeDataByTopLevel.video, string>>
  >;
  readonly Text: LiteralKitSchema<
    A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.OfficialMimeTypeDataByTopLevel.text, string>>
  >;
  readonly Image: LiteralKitSchema<
    A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.OfficialMimeTypeDataByTopLevel.image, string>>
  >;
  readonly Audio: LiteralKitSchema<
    A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.OfficialMimeTypeDataByTopLevel.audio, string>>
  >;
  readonly Misc: LiteralKitSchema<
    A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.OfficialMimeTypeDataByTopLevel.misc, string>>
  >;
};

type MimeTypeSchema = LiteralKitSchema<
  A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.OfficialMimeTypeDataByType, string>>
> & {
  readonly kinds: MimeTypeKinds;
};

/**
 * Extracts all MIME type keys from a MIME type dictionary as a deduplicated array.
 *
 * @example
 * ```ts
 * import { extractMimeTypes } from "@beep/schema/MimeType"
 *
 * const values = extractMimeTypes({
 *   "application/json": {},
 *   "text/plain": {},
 * })
 *
 * console.log(values.join(", ")) // "application/json, text/plain"
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const extractMimeTypes: <const T extends MimeTypeProperty>(mime: T) => ReadonlyArray<MimeTypeKey<T>> = flow(
  Struct.keys,
  A.dedupe
);

const extractNonEmptyMimeTypes = <const T extends MimeTypeProperty>(
  mime: T,
  fallback: MimeTypeKey<T>
): A.NonEmptyReadonlyArray<MimeTypeKey<T>> =>
  pipe(
    extractMimeTypes(mime),
    A.match({
      onEmpty: () => [fallback],
      onNonEmpty: Fn.identity,
    })
  );

/**
 * Schema kit that covers official IANA media type literals with per-category sub-schemas.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MimeType } from "@beep/schema/MimeType"
 *
 * const mediaType = S.decodeUnknownSync(MimeType)("application/json")
 * console.log(S.is(MimeType.kinds.Application)(mediaType)) // true
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const MimeType: MimeTypeSchema = pipe(
  {
    Application: LiteralKit(
      extractNonEmptyMimeTypes(MimeTypesData.OfficialMimeTypeDataByTopLevel.application, "application/json")
    ),
    Video: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.OfficialMimeTypeDataByTopLevel.video, "video/mp4")),
    Text: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.OfficialMimeTypeDataByTopLevel.text, "text/html")),
    Image: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.OfficialMimeTypeDataByTopLevel.image, "image/png")),
    Audio: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.OfficialMimeTypeDataByTopLevel.audio, "audio/mpeg")),
    Misc: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.OfficialMimeTypeDataByTopLevel.misc, "font/woff2")),
  } as const,
  (kinds) => {
    const base = LiteralKit(Struct.keysNonEmpty(MimeTypesData.OfficialMimeTypeDataByType)).pipe(
      $I.annoteSchema("MimeType", {
        description: "An official IANA media type.",
      })
    );
    Reflect.set(base, "kinds", kinds);
    return Fn.cast(base);
  }
);

/**
 * Union of official IANA media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MimeType } from "@beep/schema/MimeType"
 *
 * const mediaType: MimeType = S.decodeUnknownSync(MimeType)("text/plain")
 * console.log(mediaType) // "text/plain"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type MimeType = typeof MimeType.Type;

/**
 * Schema for `application/*` media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ApplicationMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType = S.decodeUnknownSync(ApplicationMimeType)("application/json")
 * console.log(mediaType) // "application/json"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ApplicationMimeType = MimeType.kinds.Application;

/**
 * Union of application media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ApplicationMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType: ApplicationMimeType = S.decodeUnknownSync(ApplicationMimeType)("application/json")
 * console.log(mediaType) // "application/json"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ApplicationMimeType = typeof MimeType.kinds.Application.Type;

/**
 * Schema for `video/*` media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { VideoMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType = S.decodeUnknownSync(VideoMimeType)("video/mp4")
 * console.log(mediaType) // "video/mp4"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const VideoMimeType = MimeType.kinds.Video;

/**
 * Union of video media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { VideoMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType: VideoMimeType = S.decodeUnknownSync(VideoMimeType)("video/mp4")
 * console.log(mediaType) // "video/mp4"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type VideoMimeType = typeof MimeType.kinds.Video.Type;

/**
 * Schema for `text/*` media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TextMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType = S.decodeUnknownSync(TextMimeType)("text/plain")
 * console.log(mediaType) // "text/plain"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TextMimeType = MimeType.kinds.Text;

/**
 * Union of text media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TextMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType: TextMimeType = S.decodeUnknownSync(TextMimeType)("text/plain")
 * console.log(mediaType) // "text/plain"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TextMimeType = typeof MimeType.kinds.Text.Type;

/**
 * Schema for `image/*` media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ImageMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType = S.decodeUnknownSync(ImageMimeType)("image/png")
 * console.log(mediaType) // "image/png"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ImageMimeType = MimeType.kinds.Image;

/**
 * Union of image media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ImageMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType: ImageMimeType = S.decodeUnknownSync(ImageMimeType)("image/png")
 * console.log(mediaType) // "image/png"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ImageMimeType = typeof MimeType.kinds.Image.Type;

/**
 * Schema for `audio/*` media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AudioMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType = S.decodeUnknownSync(AudioMimeType)("audio/mpeg")
 * console.log(mediaType) // "audio/mpeg"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const AudioMimeType = MimeType.kinds.Audio;

/**
 * Union of audio media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AudioMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType: AudioMimeType = S.decodeUnknownSync(AudioMimeType)("audio/mpeg")
 * console.log(mediaType) // "audio/mpeg"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type AudioMimeType = typeof MimeType.kinds.Audio.Type;

/**
 * Schema for non-core top-level media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MiscMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType = S.decodeUnknownSync(MiscMimeType)("font/woff2")
 * console.log(mediaType) // "font/woff2"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const MiscMimeType = MimeType.kinds.Misc;

/**
 * Union of non-core top-level media-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MiscMimeType } from "@beep/schema/MimeType"
 *
 * const mediaType: MiscMimeType = S.decodeUnknownSync(MiscMimeType)("font/woff2")
 * console.log(mediaType) // "font/woff2"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type MiscMimeType = typeof MimeType.kinds.Misc.Type;
