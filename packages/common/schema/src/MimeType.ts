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

export const extractMimeTypes = <const T extends MimeTypeProperty>(mime: T): A.NonEmptyReadonlyArray<keyof T> =>
  pipe(
    mime,
    Struct.keys,
    (mimeTypes) => new Set([...mimeTypes]).values() as unknown as A.NonEmptyReadonlyArray<keyof T>
  );

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

export type MimeType = MimeTypesData.MimeType;

export const ApplicationMimeType = MimeType.kinds.Application;
export type ApplicationMimeType = typeof MimeType.kinds.Application.Type;

export const VideoMimeType = MimeType.kinds.Video;
export type VideoMimeType = typeof MimeType.kinds.Video.Type;
export const TextMimeType = MimeType.kinds.Text;
export type TextMimeType = typeof MimeType.kinds.Text.Type;

export const ImageMimeType = MimeType.kinds.Image;
export type ImageMimeType = typeof MimeType.kinds.Image.Type;
export const AudioMimeType = MimeType.kinds.Audio;
export type AudioMimeType = typeof MimeType.kinds.Audio.Type;
export const MiscMimeType = MimeType.kinds.Misc;
export type MiscMimeType = typeof MimeType.kinds.Misc.Type;
