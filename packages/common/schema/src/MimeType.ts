import { MimeTypesData } from "@beep/data";
import { $SchemaId } from "@beep/identity/packages";
import { Struct } from "@beep/utils";
import { pipe } from "effect";
import * as A from "effect/Array";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("MimeType");

type MimeTypeProperty = {
  readonly [mimeType: string]: {
    readonly source: string;
    readonly extensions: A.NonEmptyReadonlyArray<string>;
  };
};

type MimeTypeExtension<T extends MimeTypeProperty> = T[keyof T]["extensions"][number];

/**
 * @since 0.0.0
 */
export const extractMimeExtensions = <const T extends MimeTypeProperty>(
  mime: T
): A.NonEmptyReadonlyArray<MimeTypeExtension<T>> =>
  pipe(
    mime,
    Struct.entries,
    A.flatMap(([_, { extensions }]) => extensions),
    (extensions) =>
      new Set([...extensions]).values() as unknown as readonly [MimeTypeExtension<T>, ...MimeTypeExtension<T>[]]
  );

/**
 * @since 0.0.0
 */
export const extractMimeTypes = <const T extends MimeTypeProperty>(mime: T): A.NonEmptyReadonlyArray<keyof T> =>
  pipe(
    mime,
    Struct.keys,
    (mimeTypes) => new Set([...mimeTypes]).values() as unknown as A.NonEmptyReadonlyArray<keyof T>
  );

/**
 * @since 0.0.0
 */
export const MimeType = pipe(
  {
    Application: LiteralKit(extractMimeTypes(MimeTypesData.application)).annotate(
      $I.annote("MimeType.Application", {
        description: "a mime type that represents application data.",
      })
    ),
    Video: LiteralKit(extractMimeTypes(MimeTypesData.video)).annotate(
      $I.annote("MimeType.Video", {
        description: "a mime type that represents video data.",
      })
    ),
    Text: LiteralKit(extractMimeTypes(MimeTypesData.text)).annotate(
      $I.annote("MimeType.Text", {
        description: "a mime type that represents text data.",
      })
    ),
    Image: LiteralKit(extractMimeTypes(MimeTypesData.image)).annotate(
      $I.annote("MimeType.Image", {
        description: "a mime type that represents image data.",
      })
    ),
    Audio: LiteralKit(extractMimeTypes(MimeTypesData.audio)).annotate(
      $I.annote("MimeType.Audio", {
        description: "a mime type that represents audio data.",
      })
    ),
    Misc: LiteralKit(extractMimeTypes(MimeTypesData.misc)).annotate(
      $I.annote("MimeType.Misc", {
        description: "a mime type that represents miscellaneous data.",
      })
    ),
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
    ]);

    return Object.assign(base, {
      kinds,
    });
  }
).annotate(
  $I.annote("MimeType", {
    description: "a mime type.",
  })
);

/**
 * @since 0.0.0
 */
export type MimeType = MimeTypesData.MimeType;

/**
 * @since 0.0.0
 */
export const ApplicationMimeType = MimeType.kinds.Application;
/**
 * @since 0.0.0
 */
export type ApplicationMimeType = typeof MimeType.kinds.Application.Type;

/**
 * @since 0.0.0
 */
export const VideoMimeType = MimeType.kinds.Video;
/**
 * @since 0.0.0
 */
export type VideoMimeType = typeof MimeType.kinds.Video.Type;
/**
 * @since 0.0.0
 */
export const TextMimeType = MimeType.kinds.Text;
/**
 * @since 0.0.0
 */
export type TextMimeType = typeof MimeType.kinds.Text.Type;

/**
 * @since 0.0.0
 */
export const ImageMimeType = MimeType.kinds.Image;
/**
 * @since 0.0.0
 */
export type ImageMimeType = typeof MimeType.kinds.Image.Type;
/**
 * @since 0.0.0
 */
export const AudioMimeType = MimeType.kinds.Audio;
/**
 * @since 0.0.0
 */
export type AudioMimeType = typeof MimeType.kinds.Audio.Type;
/**
 * @since 0.0.0
 */
export const MiscMimeType = MimeType.kinds.Misc;
/**
 * @since 0.0.0
 */
export type MiscMimeType = typeof MimeType.kinds.Misc.Type;
