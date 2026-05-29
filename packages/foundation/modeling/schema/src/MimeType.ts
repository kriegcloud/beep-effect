/**
 * MIME type literal schemas derived from bundled MIME metadata.
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
  readonly [mimeType: string]: {
    readonly source: string;
    readonly extensions: A.NonEmptyReadonlyArray<string>;
  };
};
type MimeTypeKey<T extends MimeTypeProperty> = keyof T & string;

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
 * const htmlExtensions: readonly ["html"] = ["html"]
 * const plainExtensions: readonly ["txt"] = ["txt"]
 *
 * const types = extractMimeTypes({
 *   "text/html": {
 *     source: "iana",
 *     extensions: htmlExtensions
 *   },
 *   "text/plain": {
 *     source: "iana",
 *     extensions: plainExtensions
 *   }
 * })
 * console.log(types)
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
 * Schema kit that covers all supported mime types with per-category sub-schemas.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { MimeType } from "@beep/schema/MimeType"
 *
 * const program = S.decodeUnknownEffect(MimeType)("application/json")
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const MimeType: MimeTypeSchema = pipe(
  {
    Application: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.application, "application/json")),
    Video: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.video, "video/mp4")),
    Text: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.text, "text/html")),
    Image: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.image, "image/png")),
    Audio: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.audio, "audio/mpeg")),
    Misc: LiteralKit(extractNonEmptyMimeTypes(MimeTypesData.misc, "font/woff2")),
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
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { MimeType } from "@beep/schema/MimeType"
 * import type { MimeType as MimeTypeValue } from "@beep/schema/MimeType"
 *
 * const program = Effect.gen(function* () {
 *   const contentType: MimeTypeValue = yield* S.decodeUnknownEffect(MimeType)("application/json")
 *   return contentType
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type MimeType = MimeTypesData.MimeType;

/**
 * Schema for `application/*` mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { ApplicationMimeType } from "@beep/schema/MimeType"
 *
 * const program = S.decodeUnknownEffect(ApplicationMimeType)("application/pdf")
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ApplicationMimeType = MimeType.kinds.Application;

/**
 * Union of application mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { ApplicationMimeType } from "@beep/schema/MimeType"
 * import type { ApplicationMimeType as ApplicationMimeTypeValue } from "@beep/schema/MimeType"
 *
 * const program = Effect.gen(function* () {
 *   const contentType: ApplicationMimeTypeValue =
 *     yield* S.decodeUnknownEffect(ApplicationMimeType)("application/json")
 *   return contentType
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ApplicationMimeType = typeof MimeType.kinds.Application.Type;

/**
 * Schema for `video/*` mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { VideoMimeType } from "@beep/schema/MimeType"
 *
 * const program = S.decodeUnknownEffect(VideoMimeType)("video/mp4")
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const VideoMimeType = MimeType.kinds.Video;

/**
 * Union of video mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { VideoMimeType } from "@beep/schema/MimeType"
 * import type { VideoMimeType as VideoMimeTypeValue } from "@beep/schema/MimeType"
 *
 * const program = Effect.gen(function* () {
 *   const mimeType: VideoMimeTypeValue = yield* S.decodeUnknownEffect(VideoMimeType)("video/mp4")
 *   return mimeType
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type VideoMimeType = typeof MimeType.kinds.Video.Type;

/**
 * Schema for `text/*` mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { TextMimeType } from "@beep/schema/MimeType"
 *
 * const program = S.decodeUnknownEffect(TextMimeType)("text/plain")
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TextMimeType = MimeType.kinds.Text;

/**
 * Union of text mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { TextMimeType } from "@beep/schema/MimeType"
 * import type { TextMimeType as TextMimeTypeValue } from "@beep/schema/MimeType"
 *
 * const program = Effect.gen(function* () {
 *   const mimeType: TextMimeTypeValue = yield* S.decodeUnknownEffect(TextMimeType)("text/plain")
 *   return mimeType
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TextMimeType = typeof MimeType.kinds.Text.Type;

/**
 * Schema for `image/*` mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { ImageMimeType } from "@beep/schema/MimeType"
 *
 * const program = S.decodeUnknownEffect(ImageMimeType)("image/png")
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const ImageMimeType = MimeType.kinds.Image;

/**
 * Union of image mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { ImageMimeType } from "@beep/schema/MimeType"
 * import type { ImageMimeType as ImageMimeTypeValue } from "@beep/schema/MimeType"
 *
 * const program = Effect.gen(function* () {
 *   const mimeType: ImageMimeTypeValue = yield* S.decodeUnknownEffect(ImageMimeType)("image/png")
 *   return mimeType
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ImageMimeType = typeof MimeType.kinds.Image.Type;

/**
 * Schema for `audio/*` mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { AudioMimeType } from "@beep/schema/MimeType"
 *
 * const program = S.decodeUnknownEffect(AudioMimeType)("audio/mpeg")
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const AudioMimeType = MimeType.kinds.Audio;

/**
 * Union of audio mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { AudioMimeType } from "@beep/schema/MimeType"
 * import type { AudioMimeType as AudioMimeTypeValue } from "@beep/schema/MimeType"
 *
 * const program = Effect.gen(function* () {
 *   const mimeType: AudioMimeTypeValue = yield* S.decodeUnknownEffect(AudioMimeType)("audio/mpeg")
 *   return mimeType
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type AudioMimeType = typeof MimeType.kinds.Audio.Type;

/**
 * Schema for miscellaneous mime-type literals that do not fit standard categories.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { MiscMimeType } from "@beep/schema/MimeType"
 *
 * const program = S.decodeUnknownEffect(MiscMimeType)("font/woff2")
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const MiscMimeType = MimeType.kinds.Misc;

/**
 * Union of miscellaneous mime-type literals.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { MiscMimeType } from "@beep/schema/MimeType"
 * import type { MiscMimeType as MiscMimeTypeValue } from "@beep/schema/MimeType"
 *
 * const program = Effect.gen(function* () {
 *   const mimeType: MiscMimeTypeValue = yield* S.decodeUnknownEffect(MiscMimeType)("font/woff2")
 *   return mimeType
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type MiscMimeType = typeof MimeType.kinds.Misc.Type;
