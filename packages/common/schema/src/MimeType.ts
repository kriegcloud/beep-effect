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

type MimeTypeExtension<T extends MimeTypeProperty> = T[keyof T]["extensions"][number];

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
 * Extracts all file extensions from a mime-type dictionary.
 *
 * @since 0.0.0
 */
export const extractMimeExtensions = <const T extends MimeTypeProperty>(
  mime: T
): A.NonEmptyReadonlyArray<MimeTypeExtension<T>> =>
  Fn.cast<Array<MimeTypeExtension<T>>, A.NonEmptyReadonlyArray<MimeTypeExtension<T>>>(
    pipe(
      mime,
      Struct.entries,
      A.flatMap(([_, { extensions }]) => extensions),
      A.dedupe
    )
  );

/**
 * Extracts all mime-type keys from a mime-type dictionary.
 *
 * @since 0.0.0
 */
export const extractMimeTypes = <const T extends MimeTypeProperty>(mime: T): A.NonEmptyReadonlyArray<keyof T> =>
  Fn.cast<Array<keyof T>, A.NonEmptyReadonlyArray<keyof T>>(pipe(mime, Struct.keys, A.dedupe));

/**
 * Schema kit that covers all supported mime types.
 *
 * @since 0.0.0
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
 * @since 0.0.0
 */
export type MimeType = MimeTypesData.MimeType;

/**
 * Application mime-type schema.
 *
 * @since 0.0.0
 */
export const ApplicationMimeType = MimeType.kinds.Application;

/**
 * Application mime-type literal union.
 *
 * @since 0.0.0
 */
export type ApplicationMimeType = typeof MimeType.kinds.Application.Type;

/**
 * Video mime-type schema.
 *
 * @since 0.0.0
 */
export const VideoMimeType = MimeType.kinds.Video;

/**
 * Video mime-type literal union.
 *
 * @since 0.0.0
 */
export type VideoMimeType = typeof MimeType.kinds.Video.Type;

/**
 * Text mime-type schema.
 *
 * @since 0.0.0
 */
export const TextMimeType = MimeType.kinds.Text;

/**
 * Text mime-type literal union.
 *
 * @since 0.0.0
 */
export type TextMimeType = typeof MimeType.kinds.Text.Type;

/**
 * Image mime-type schema.
 *
 * @since 0.0.0
 */
export const ImageMimeType = MimeType.kinds.Image;

/**
 * Image mime-type literal union.
 *
 * @since 0.0.0
 */
export type ImageMimeType = typeof MimeType.kinds.Image.Type;

/**
 * Audio mime-type schema.
 *
 * @since 0.0.0
 */
export const AudioMimeType = MimeType.kinds.Audio;

/**
 * Audio mime-type literal union.
 *
 * @since 0.0.0
 */
export type AudioMimeType = typeof MimeType.kinds.Audio.Type;

/**
 * Miscellaneous mime-type schema.
 *
 * @since 0.0.0
 */
export const MiscMimeType = MimeType.kinds.Misc;

/**
 * Miscellaneous mime-type literal union.
 *
 * @since 0.0.0
 */
export type MiscMimeType = typeof MimeType.kinds.Misc.Type;
