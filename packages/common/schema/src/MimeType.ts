/**
 * MIME type literal schemas derived from bundled MIME metadata.
 *
 * @module
 * @since 0.0.0
 */

import { MimeTypesData } from "@beep/data";
import { $SchemaId } from "@beep/identity/packages";
import { Struct } from "@beep/utils";
import { Function as Fn, pipe } from "effect";
import * as A from "effect/Array";
import { LiteralKit, type LiteralKit as LiteralKitSchema } from "./LiteralKit.ts";

const $I = $SchemaId.create("MimeType");

type MimeTypeProperty = {
  readonly [mimeType: string]: {
    readonly source: string;
    readonly extensions: A.NonEmptyReadonlyArray<string>;
  };
};

type MimeTypeKinds = {
  readonly Application: LiteralKitSchema<
    A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.application, string>>
  >;
  readonly Video: LiteralKitSchema<A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.video, string>>>;
  readonly Text: LiteralKitSchema<A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.text, string>>>;
  readonly Image: LiteralKitSchema<A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.image, string>>>;
  readonly Audio: LiteralKitSchema<A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.audio, string>>>;
  readonly Misc: LiteralKitSchema<A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.misc, string>>>;
};

type MimeTypeSchema = LiteralKitSchema<A.NonEmptyReadonlyArray<Extract<keyof typeof MimeTypesData.mimes, string>>> & {
  readonly kinds: MimeTypeKinds;
};

/**
 * Extracts all mime-type keys from a mime-type dictionary as a deduplicated array.
 *
 * @example
 * ```ts
 * import { extractMimeTypes } from "@beep/schema/MimeType"
 *
 * const types = extractMimeTypes({
 *
 *
 * })
 * console.log(types) // ["text/plain", "text/html"]
 * ```
 *
 * @since 0.0.0
 * @category Utility
 */
export const extractMimeTypes = <const T extends MimeTypeProperty>(mime: T): A.NonEmptyReadonlyArray<keyof T> =>
  Fn.cast<Array<keyof T>, A.NonEmptyReadonlyArray<keyof T>>(pipe(mime, Struct.keys, A.dedupe));

/**
 * Schema kit that covers all supported mime types with per-category sub-schemas.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MimeType } from "@beep/schema/MimeType"
 *
 * const mimeType = S.decodeUnknownSync(MimeType)("application/json")
 * console.log(mimeType) // "application/json"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const MimeType: MimeTypeSchema = pipe(
  {
    Application: LiteralKit(extractMimeTypes(MimeTypesData.application)),
    Video: LiteralKit(extractMimeTypes(MimeTypesData.video)),
    Text: LiteralKit(extractMimeTypes(MimeTypesData.text)),
    Image: LiteralKit(extractMimeTypes(MimeTypesData.image)),
    Audio: LiteralKit(extractMimeTypes(MimeTypesData.audio)),
    Misc: LiteralKit(extractMimeTypes(MimeTypesData.misc)),
  } as const,
  (kinds) => {
    const { Application, Video, Text, Image, Audio, Misc } = kinds;
    const base = LiteralKit([
      ...Application.Options,
      ...Video.Options,
      ...Text.Options,
      ...Image.Options,
      ...Audio.Options,
      ...Misc.Options,
    ]).annotate(
      $I.annote("MimeType", {
        description: "a mime type.",
      })
    );
    Reflect.set(base, "kinds", kinds);
    return Fn.cast(base);
  }
);

/**
 * Union of supported mime-type literals.
 *
 * @example
 * ```ts
 * import type { MimeType } from "@beep/schema/MimeType"
 *
 * const contentType: MimeType = "application/json" as MimeType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MimeType = MimeTypesData.MimeType;

/**
 * Schema for `application/*` mime-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ApplicationMimeType } from "@beep/schema/MimeType"
 *
 * const mt = S.decodeUnknownSync(ApplicationMimeType)("application/pdf")
 * console.log(mt) // "application/pdf"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const ApplicationMimeType = MimeType.kinds.Application;

/**
 * Union of application mime-type literals.
 *
 * @example
 * ```ts
 * import type { ApplicationMimeType } from "@beep/schema/MimeType"
 *
 * const contentType: ApplicationMimeType = "application/json" as ApplicationMimeType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ApplicationMimeType = typeof MimeType.kinds.Application.Type;

/**
 * Schema for `video/*` mime-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { VideoMimeType } from "@beep/schema/MimeType"
 *
 * const mt = S.decodeUnknownSync(VideoMimeType)("video/mp4")
 * console.log(mt) // "video/mp4"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const VideoMimeType = MimeType.kinds.Video;

/**
 * Union of video mime-type literals.
 *
 * @example
 * ```ts
 * import type { VideoMimeType } from "@beep/schema/MimeType"
 *
 * const mt: VideoMimeType = "video/mp4" as VideoMimeType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type VideoMimeType = typeof MimeType.kinds.Video.Type;

/**
 * Schema for `text/*` mime-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TextMimeType } from "@beep/schema/MimeType"
 *
 * const mt = S.decodeUnknownSync(TextMimeType)("text/plain")
 * console.log(mt) // "text/plain"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const TextMimeType = MimeType.kinds.Text;

/**
 * Union of text mime-type literals.
 *
 * @example
 * ```ts
 * import type { TextMimeType } from "@beep/schema/MimeType"
 *
 * const mt: TextMimeType = "text/plain" as TextMimeType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TextMimeType = typeof MimeType.kinds.Text.Type;

/**
 * Schema for `image/*` mime-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ImageMimeType } from "@beep/schema/MimeType"
 *
 * const mt = S.decodeUnknownSync(ImageMimeType)("image/png")
 * console.log(mt) // "image/png"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const ImageMimeType = MimeType.kinds.Image;

/**
 * Union of image mime-type literals.
 *
 * @example
 * ```ts
 * import type { ImageMimeType } from "@beep/schema/MimeType"
 *
 * const mt: ImageMimeType = "image/png" as ImageMimeType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ImageMimeType = typeof MimeType.kinds.Image.Type;

/**
 * Schema for `audio/*` mime-type literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AudioMimeType } from "@beep/schema/MimeType"
 *
 * const mt = S.decodeUnknownSync(AudioMimeType)("audio/mpeg")
 * console.log(mt) // "audio/mpeg"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const AudioMimeType = MimeType.kinds.Audio;

/**
 * Union of audio mime-type literals.
 *
 * @example
 * ```ts
 * import type { AudioMimeType } from "@beep/schema/MimeType"
 *
 * const mt: AudioMimeType = "audio/mpeg" as AudioMimeType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AudioMimeType = typeof MimeType.kinds.Audio.Type;

/**
 * Schema for miscellaneous mime-type literals that do not fit standard categories.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MiscMimeType = MimeType.kinds.Misc;

/**
 * Union of miscellaneous mime-type literals.
 *
 * @example
 * ```ts
 * import type { MiscMimeType } from "@beep/schema/MimeType"
 *
 * const mt: MiscMimeType = "application/octet-stream" as MiscMimeType
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MiscMimeType = typeof MimeType.kinds.Misc.Type;
