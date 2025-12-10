/**
 * Vendored version of mime-types that can run on the edge due to not using path.extname
 *
 * Also ported it to TypeScript cause it was easier than playing around with custom d.ts file
 *
 * Removed all the stuff we didn't use
 */
import { invariant } from "@beep/invariant";
import { StringLiteralKit } from "@beep/schema/derived";
import { HashSet, pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { application } from "./application";
import { audio } from "./audio";
import { image } from "./image";
import { misc } from "./misc";
import { text } from "./text";
import { video } from "./video";

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
    (extensions) => {
      const values = pipe(extensions, HashSet.fromIterable, HashSet.toValues);
      invariant(A.isNonEmptyReadonlyArray(values), "must be non empty", {
        file: "packages/common/schema/src/integrations/files/mime-types/index.ts",
        line: 36,
        args: [values],
      });

      return values;
    }
  );

export const extractMimeTypes = <const T extends MimeTypeProperty>(mime: T): A.NonEmptyReadonlyArray<keyof T> =>
  pipe(mime, Struct.keys, (mimeTypes) => {
    const values = pipe(mimeTypes, HashSet.fromIterable, HashSet.toValues);
    invariant(A.isNonEmptyReadonlyArray(values), "must be non empty", {
      file: "packages/common/schema/src/integrations/files/mime-types/index.ts",
      line: 50,
      args: [values],
    });

    return values;
  });

export class ApplicationMimeType extends StringLiteralKit(...extractMimeTypes(application)) {}

export declare namespace ApplicationMimeType {
  export type Type = typeof ApplicationMimeType.Type;
  export type Encoded = typeof ApplicationMimeType.Encoded;
}

export class VideoMimeType extends StringLiteralKit(...extractMimeTypes(video)) {}

export declare namespace VideoMimeType {
  export type Type = typeof VideoMimeType.Type;
  export type Encoded = typeof VideoMimeType.Encoded;
}

export class TextMimeType extends StringLiteralKit(...extractMimeTypes(text)) {}

export declare namespace TextMimeType {
  export type Type = typeof TextMimeType.Type;
  export type Encoded = typeof TextMimeType.Encoded;
}

export class ImageMimeType extends StringLiteralKit(...extractMimeTypes(image)) {}

export declare namespace ImageMimeType {
  export type Type = typeof ImageMimeType.Type;
  export type Encoded = typeof ImageMimeType.Encoded;
}

export class AudioMimeType extends StringLiteralKit(...extractMimeTypes(audio)) {}

export declare namespace AudioMimeType {
  export type Type = typeof AudioMimeType.Type;
  export type Encoded = typeof AudioMimeType.Encoded;
}

export class MiscMimeType extends StringLiteralKit(...extractMimeTypes(misc)) {}

export declare namespace MiscMimeType {
  export type Type = typeof MiscMimeType.Type;
  export type Encoded = typeof MiscMimeType.Encoded;
}

const mimes = {
  ...application,
  ...audio,
  ...image,
  ...text,
  ...video,
  ...misc,
} as const;

export class MimeType extends StringLiteralKit(
  ...ApplicationMimeType.Options,
  ...AudioMimeType.Options,
  ...ImageMimeType.Options,
  ...TextMimeType.Options,
  ...VideoMimeType.Options,
  ...MiscMimeType.Options
) {
  static readonly isApplicationMimeType = S.is(ApplicationMimeType);
  static readonly isAudioMimeType = S.is(AudioMimeType);
  static readonly isImageMimeType = S.is(ImageMimeType);
  static readonly isTextMimeType = S.is(TextMimeType);
  static readonly isVideoMimeType = S.is(VideoMimeType);
  static readonly isMiscMimeType = S.is(MiscMimeType);
}

export declare namespace MimeType {
  export type Type = typeof MimeType.Type;
  export type Encoded = typeof MimeType.Encoded;
}

export class ApplicationFileExtension extends StringLiteralKit(...extractMimeExtensions(application)) {}

export declare namespace ApplicationFileExtension {
  export type Type = typeof ApplicationFileExtension.Type;
  export type Encoded = typeof ApplicationFileExtension.Encoded;
}

export class AudioFileExtension extends StringLiteralKit(...extractMimeExtensions(audio)) {}

export declare namespace AudioFileExtension {
  export type Type = typeof AudioFileExtension.Type;
  export type Encoded = typeof AudioFileExtension.Encoded;
}

export class ImageFileExtension extends StringLiteralKit(...extractMimeExtensions(image)) {}

export declare namespace ImageFileExtension {
  export type Type = typeof ImageFileExtension.Type;
  export type Encoded = typeof ImageFileExtension.Encoded;
}

export class TextFileExtension extends StringLiteralKit(...extractMimeExtensions(text)) {}

export declare namespace TextFileExtension {
  export type Type = typeof TextFileExtension.Type;
  export type Encoded = typeof TextFileExtension.Encoded;
}

export class VideoFileExtension extends StringLiteralKit(...extractMimeExtensions(video)) {}

export declare namespace VideoFileExtension {
  export type Type = typeof VideoFileExtension.Type;
  export type Encoded = typeof VideoFileExtension.Encoded;
}

export class MiscFileExtension extends StringLiteralKit(...extractMimeExtensions(misc)) {}

export declare namespace MiscFileExtension {
  export type Type = typeof MiscFileExtension.Type;
  export type Encoded = typeof MiscFileExtension.Encoded;
}

export class FileExtension extends StringLiteralKit(
  ...ApplicationFileExtension.Options,
  ...AudioFileExtension.Options,
  ...ImageFileExtension.Options,
  ...TextFileExtension.Options,
  ...VideoFileExtension.Options,
  ...MiscFileExtension.Options
) {
  static readonly isApplicationFileExtension = S.is(ApplicationFileExtension);
  static readonly isAudioFileExtension = S.is(AudioFileExtension);
  static readonly isImageFileExtension = S.is(ImageFileExtension);
  static readonly isTextFileExtension = S.is(TextFileExtension);
  static readonly isVideoFileExtension = S.is(VideoFileExtension);
  static readonly isMiscFileExtension = S.is(MiscFileExtension);
}

export declare namespace FileExtension {
  export type Type = typeof FileExtension.Type;
  export type Encoded = typeof FileExtension.Encoded;
}

export const mimeTypes = mimes as unknown as Record<
  MimeType.Type,
  { source: string; extensions: FileExtension.Type[] }
>;

function extname(path: string) {
  const index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
}

const extensions = {} as Record<MimeType.Type, FileExtension.Type[]>;
const types = {} as Record<FileExtension.Type, MimeType.Type>;

// Introduce getters to improve tree-shakeability
export function getTypes(): Record<FileExtension.Type, MimeType.Type> {
  populateMaps(extensions, types);
  return types;
}

export function getExtensions(): Record<MimeType.Type, FileExtension.Type[]> {
  populateMaps(extensions, types);
  return extensions;
}

/**
 * Lookup the MIME type for a file path/extension.
 */
export function lookup(path: string): false | MimeType.Type {
  if (!path || !Str.isString(path)) {
    return false;
  }

  // get the extension ("ext" or ".ext" or full path)
  const extension = pipe(extname("x." + path), Str.toLowerCase, Str.substring(1));

  if (!extension) {
    return false;
  }

  return getTypes()[extension as keyof typeof types] || false;
}

let inittedMaps = false;

/**
 * Populate the extensions and types maps.
 * @private
 */

function populateMaps(
  extensions: Record<MimeType.Type, FileExtension.Type[]>,
  types: Record<FileExtension.Type, MimeType.Type>
) {
  if (inittedMaps) return;
  inittedMaps = true;
  // source preference (least -> most)
  const preference = ["nginx", "apache", undefined, "iana"];

  Struct.keys(mimeTypes).forEach((type) => {
    const mime = mimeTypes[type];
    const exts = mime.extensions;

    if (!exts.length) {
      return;
    }

    // mime -> extensions
    extensions[type] = exts;

    // extension -> mime

    for (const extension of exts) {
      if (extension in types) {
        const from = preference.indexOf(mimeTypes[types[extension]].source);
        const to = preference.indexOf(mime.source);

        if (
          types[extension] !== "application/octet-stream" &&
          (from > to || (from === to && types[extension].startsWith("application/")))
        ) {
          // skip the remapping
          continue;
        }
      }

      // set the extension -> mime
      types[extension] = type;
    }
  });
}

export class FileType extends StringLiteralKit("application", "audio", "image", "text", "video", "misc") {}

export declare namespace FileType {
  export type Type = typeof FileType.Type;
  export type Encoded = typeof FileType.Encoded;
}
