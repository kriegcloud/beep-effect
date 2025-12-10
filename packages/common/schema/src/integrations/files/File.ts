import { $SchemaId } from "@beep/identity/packages";
import { fileTypeChecker } from "@beep/schema/integrations/files/file-types";
import {
  ApplicationFileExtension,
  ApplicationMimeType,
  AudioFileExtension,
  AudioMimeType,
  ImageFileExtension,
  ImageMimeType,
  MimeType,
  MiscFileExtension,
  MiscMimeType,
  TextFileExtension,
  TextMimeType,
  VideoFileExtension,
  VideoMimeType,
} from "@beep/schema/integrations/files/mime-types";
import { DateTimeUtcFromAllAcceptable, DurationFromSeconds } from "@beep/schema/primitives";
import { Effect, Equivalence, Match, ParseResult, pipe } from "effect";
import * as A from "effect/Array";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { AspectRatio, AspectRatioStringSchema } from "./AspectRatio.ts";
import { ExifMetadata } from "./exif-metadata";
import { MetadataService } from "./metadata/Metadata.service.ts";
import { IAudioMetadata } from "./metadata/types.ts";
import { FileSizeBitsIEC, FileSizeBitsSI, FileSizeIEC, FileSizeSI } from "./utils/formatSize.ts";

/**
 * Schema that validates if a value is an IAudioMetadata instance.
 * Uses S.declare to avoid encode/decode transformation issues with nested Option fields.
 *
 * The IAudioMetadata class uses withNullableOption (S.optionalWith({ as: "Option" }))
 * for many fields, which causes validation failures when trying to encode instances
 * because the Option values can't be properly transformed back to encoded form
 * during S.Class validation checks.
 */
export const IAudioMetadataFromSelf = S.declare((u): u is IAudioMetadata => u instanceof IAudioMetadata, {
  identifier: "IAudioMetadataFromSelf",
  description: "IAudioMetadata instance (self-referential, skips encode validation)",
  pretty: (): Pretty.Pretty<IAudioMetadata> => (metadata) =>
    `IAudioMetadata { duration: ${O.getOrElse(metadata.format.duration, () => "none")}, sampleRate: ${O.getOrElse(metadata.format.sampleRate, () => "none")} }`,
});

const $I = $SchemaId.create("integrations/files/FileInstance");

// FileType is already exported from FileInstance.ts, no need to duplicate here

const isPositiveNumber = (n: unknown): n is number => P.compose(P.isNumber, Num.greaterThan(0))(n);

export const isFile: P.Refinement<unknown, File> = P.compose(
  (i): i is File => i instanceof File,
  P.struct({
    name: P.isString,
    type: P.isString,
    webkitRelativePath: P.isString,
    size: isPositiveNumber,
    lastModified: isPositiveNumber,
  })
);

export class FileFromSelf extends S.declare(
  isFile,
  $I.annotations("FileFromSelf", {
    description: "File from the File API",
    pretty: (): Pretty.Pretty<File> => (file) =>
      `File { name: "${file.name}", type: "${file.type}", size: ${file.size} bytes }`,
    equivalence: (): Equivalence.Equivalence<File> =>
      Equivalence.struct({
        name: Equivalence.string,
        type: Equivalence.string,
        size: Equivalence.number,
        lastModified: Equivalence.number,
      }),
    arbitrary: () => (fc) => fc.tuple(fc.string(), fc.string()).map(([content, path]) => new File([content], path)),
  })
) {}

export declare namespace FileFromSelf {
  export type Type = typeof FileFromSelf.Type;
  export type Encoded = typeof FileFromSelf.Encoded;
}

export const NormalizedFileFields = {
  file: FileFromSelf,
  name: S.NonEmptyTrimmedString,
  size: S.NonNegativeInt,
  lastModified: DateTimeUtcFromAllAcceptable,
  webkitRelativePath: S.NonEmptyTrimmedString,
  // File size fields use plain strings since they're pre-transformed from the raw size
  // The transformation happens in normalizeFileProperties using the format helpers
  fileSizeSI: S.String,
  fileSizeIEC: S.String,
  fileSizeBitsSI: S.String,
  fileSizeBitsIEC: S.String,
  // Use OptionFromSelf to preserve Option values without encode/decode transformation
  // This is necessary because the schema is used in transformOrFail which validates
  // returned values, and S.Option would try to encode to { _tag, value } format
  exif: S.OptionFromSelf(ExifMetadata),
  // Use IAudioMetadataFromSelf (declare schema) to avoid encode validation issues
  // with nested Option fields in IAudioMetadata class
  audioMetadata: S.OptionFromSelf(IAudioMetadataFromSelf),
  width: S.OptionFromSelf(S.NonNegativeInt),
  height: S.OptionFromSelf(S.NonNegativeInt),
  // Use AspectRatioStringSchema for pre-computed values, not the transform schema
  aspectRatio: S.OptionFromSelf(AspectRatioStringSchema),
  duration: S.OptionFromSelf(S.DurationFromSelf),
};

export class NormalizedAudioFile extends S.TaggedClass<NormalizedAudioFile>($I`NormalizedAudioFile`)("audio", {
  ...NormalizedFileFields,
  mimeType: AudioMimeType,
  extension: AudioFileExtension,
}) {}

export class NormalizedImageFile extends S.TaggedClass<NormalizedImageFile>($I`NormalizedImageFile`)("image", {
  ...NormalizedFileFields,
  mimeType: ImageMimeType,
  extension: ImageFileExtension,
}) {}

export class NormalizedApplicationFile extends S.TaggedClass<NormalizedApplicationFile>($I`NormalizedApplicationFile`)(
  "application",
  {
    ...NormalizedFileFields,
    mimeType: ApplicationMimeType,
    extension: ApplicationFileExtension,
  }
) {}

export class NormalizedTextFile extends S.TaggedClass<NormalizedTextFile>($I`NormalizedTextFile`)("text", {
  ...NormalizedFileFields,
  mimeType: TextMimeType,
  extension: TextFileExtension,
}) {}

export class NormalizedVideoFile extends S.TaggedClass<NormalizedVideoFile>($I`NormalizedVideoFile`)("video", {
  ...NormalizedFileFields,
  mimeType: VideoMimeType,
  extension: VideoFileExtension,
}) {}

export class NormalizedMiscFile extends S.TaggedClass<NormalizedMiscFile>($I`NormalizedMiscFile`)("misc", {
  ...NormalizedFileFields,
  mimeType: MiscMimeType,
  extension: MiscFileExtension,
}) {}

export class NormalizedFile extends S.Union(
  NormalizedApplicationFile,
  NormalizedImageFile,
  NormalizedAudioFile,
  NormalizedVideoFile,
  NormalizedTextFile,
  NormalizedMiscFile
) {}

export declare namespace NormalizedFile {
  export type Type = typeof NormalizedFile.Type;
  export type Encoded = typeof NormalizedFile.Encoded;
}

const normalizeFileProperties = Effect.fn("normalizeFile")(function* (file: FileFromSelf.Type) {
  const mimeType = yield* S.decodeUnknown(MimeType)(file.type);
  const name = yield* pipe(file.name, S.decode(S.NonEmptyTrimmedString));
  const size = yield* pipe(file.size, S.decode(S.NonNegativeInt));
  const extensionStr = yield* pipe(file.name, Str.split("."), A.tail, O.flatMap(A.last));
  const fileSizeSI = yield* pipe(file.size, S.decode(FileSizeSI));
  const fileSizeIEC = yield* pipe(file.size, S.decode(FileSizeIEC));
  const fileSizeBitsSI = yield* pipe(file.size, S.decode(FileSizeBitsSI));
  const fileSizeBitsIEC = yield* pipe(file.size, S.decode(FileSizeBitsIEC));
  const lastModified = yield* pipe(file.lastModified, S.decode(DateTimeUtcFromAllAcceptable));
  const webkitRelativePath = yield* pipe(file.webkitRelativePath, S.decode(S.NonEmptyTrimmedString));

  const baseProperties = {
    file,
    size,
    fileSizeSI,
    fileSizeIEC,
    fileSizeBitsSI,
    fileSizeBitsIEC,
    lastModified,
    webkitRelativePath,
    name,
  };

  return Match.value(mimeType).pipe(
    Match.when(MimeType.isApplicationMimeType, (mt) => ({
      _tag: "application" as const,
      ...baseProperties,
      mimeType: mt as ApplicationMimeType.Type,
      extension: extensionStr as ApplicationFileExtension.Type,
    })),
    Match.when(MimeType.isAudioMimeType, (mt) => ({
      _tag: "audio" as const,
      ...baseProperties,
      mimeType: mt as AudioMimeType.Type,
      extension: extensionStr as AudioFileExtension.Type,
    })),
    Match.when(MimeType.isImageMimeType, (mt) => ({
      _tag: "image" as const,
      ...baseProperties,
      mimeType: mt as ImageMimeType.Type,
      extension: extensionStr as ImageFileExtension.Type,
    })),
    Match.when(MimeType.isTextMimeType, (mt) => ({
      _tag: "text" as const,
      ...baseProperties,
      mimeType: mt as TextMimeType.Type,
      extension: extensionStr as TextFileExtension.Type,
    })),
    Match.when(MimeType.isVideoMimeType, (mt) => ({
      _tag: "video" as const,
      ...baseProperties,
      mimeType: mt as VideoMimeType.Type,
      extension: extensionStr as VideoFileExtension.Type,
    })),
    Match.when(MimeType.isMiscMimeType, (mt) => ({
      _tag: "misc" as const,
      ...baseProperties,
      mimeType: mt as MiscMimeType.Type,
      extension: extensionStr as MiscFileExtension.Type,
    })),
    Match.exhaustive
  );
});

export const extractMetadata = Effect.fn("extractMetadata")(function* (file: FileFromSelf.Type) {
  const metadataService = yield* MetadataService;
  const normalizedFileProperties = yield* normalizeFileProperties(file);

  const exifMetadata = yield* metadataService.exif.extractMetadata(file);

  const withExifMetadata = <Data extends Record<string, any>>(data: Data) => ({
    ...data,
    exif: O.some(exifMetadata),
  });

  return yield* Match.value(normalizedFileProperties).pipe(
    Match.tagsExhaustive({
      application: (fp) =>
        Effect.succeed(
          NormalizedApplicationFile.make(
            withExifMetadata({
              file: fp.file,
              name: fp.name,
              size: fp.size,
              mimeType: fp.mimeType,
              extension: fp.extension,
              fileSizeSI: fp.fileSizeSI,
              fileSizeIEC: fp.fileSizeIEC,
              fileSizeBitsSI: fp.fileSizeBitsSI,
              fileSizeBitsIEC: fp.fileSizeBitsIEC,
              lastModified: fp.lastModified,
              webkitRelativePath: fp.webkitRelativePath,
              audioMetadata: O.none(),
              width: O.none(),
              height: O.none(),
              aspectRatio: O.none(),
              duration: O.none(),
            })
          )
        ),
      audio: (fp) =>
        Effect.gen(function* () {
          const audioMetadata = yield* metadataService.audio.parseBlob(fp.file);
          const duration = pipe(audioMetadata.format.duration, O.flatMap(S.decodeOption(DurationFromSeconds)));
          return NormalizedAudioFile.make(
            withExifMetadata({
              file: fp.file,
              name: fp.name,
              size: fp.size,
              mimeType: fp.mimeType,
              extension: fp.extension,
              fileSizeSI: fp.fileSizeSI,
              fileSizeIEC: fp.fileSizeIEC,
              fileSizeBitsSI: fp.fileSizeBitsSI,
              fileSizeBitsIEC: fp.fileSizeBitsIEC,
              lastModified: fp.lastModified,
              webkitRelativePath: fp.webkitRelativePath,
              audioMetadata: O.some(audioMetadata),
              width: O.none(),
              height: O.none(),
              aspectRatio: O.none(),
              duration,
            })
          );
        }),
      image: (fp) =>
        Effect.gen(function* () {
          const width = pipe(exifMetadata.imageWidth, O.fromNullable, O.flatMap(S.decodeOption(S.NonNegativeInt)));
          const height = pipe(exifMetadata.imageHeight, O.fromNullable, O.flatMap(S.decodeOption(S.NonNegativeInt)));
          const aspectRatio = pipe(
            O.all({
              width,
              height,
            }),
            O.flatMap(S.decodeOption(AspectRatio))
          );
          return NormalizedImageFile.make(
            withExifMetadata({
              file: fp.file,
              name: fp.name,
              size: fp.size,
              mimeType: fp.mimeType,
              extension: fp.extension,
              fileSizeSI: fp.fileSizeSI,
              fileSizeIEC: fp.fileSizeIEC,
              fileSizeBitsSI: fp.fileSizeBitsSI,
              fileSizeBitsIEC: fp.fileSizeBitsIEC,
              lastModified: fp.lastModified,
              webkitRelativePath: fp.webkitRelativePath,
              audioMetadata: O.none(),
              width,
              height,
              aspectRatio,
              duration: O.none(),
            })
          );
        }),
      text: (fp) =>
        Effect.succeed(
          NormalizedTextFile.make(
            withExifMetadata({
              file: fp.file,
              name: fp.name,
              size: fp.size,
              mimeType: fp.mimeType,
              extension: fp.extension,
              fileSizeSI: fp.fileSizeSI,
              fileSizeIEC: fp.fileSizeIEC,
              fileSizeBitsSI: fp.fileSizeBitsSI,
              fileSizeBitsIEC: fp.fileSizeBitsIEC,
              lastModified: fp.lastModified,
              webkitRelativePath: fp.webkitRelativePath,
              audioMetadata: O.none(),
              width: O.none(),
              height: O.none(),
              aspectRatio: O.none(),
              duration: O.none(),
            })
          )
        ),
      video: (fp) =>
        Effect.gen(function* () {
          const audioMetadata = yield* metadataService.audio.parseBlob(fp.file);
          const duration = pipe(audioMetadata.format.duration, O.flatMap(S.decodeOption(DurationFromSeconds)));
          const width = pipe(exifMetadata.imageWidth, O.fromNullable, O.flatMap(S.decodeOption(S.NonNegativeInt)));
          const height = pipe(exifMetadata.imageHeight, O.fromNullable, O.flatMap(S.decodeOption(S.NonNegativeInt)));
          const aspectRatio = pipe(
            O.all({
              width,
              height,
            }),
            O.flatMap(S.decodeOption(AspectRatio))
          );
          return NormalizedVideoFile.make(
            withExifMetadata({
              file: fp.file,
              name: fp.name,
              size: fp.size,
              mimeType: fp.mimeType,
              extension: fp.extension,
              fileSizeSI: fp.fileSizeSI,
              fileSizeIEC: fp.fileSizeIEC,
              fileSizeBitsSI: fp.fileSizeBitsSI,
              fileSizeBitsIEC: fp.fileSizeBitsIEC,
              lastModified: fp.lastModified,
              webkitRelativePath: fp.webkitRelativePath,
              audioMetadata: O.some(audioMetadata),
              width,
              height,
              aspectRatio,
              duration,
            })
          );
        }),
      misc: (fp) =>
        Effect.succeed(
          NormalizedMiscFile.make(
            withExifMetadata({
              file: fp.file,
              name: fp.name,
              size: fp.size,
              mimeType: fp.mimeType,
              extension: fp.extension,
              fileSizeSI: fp.fileSizeSI,
              fileSizeIEC: fp.fileSizeIEC,
              fileSizeBitsSI: fp.fileSizeBitsSI,
              fileSizeBitsIEC: fp.fileSizeBitsIEC,
              lastModified: fp.lastModified,
              webkitRelativePath: fp.webkitRelativePath,
              audioMetadata: O.none(),
              width: O.none(),
              height: O.none(),
              aspectRatio: O.none(),
              duration: O.none(),
            })
          )
        ),
    })
  );
});

export class NormalizedFileFromSelf extends S.transformOrFail(FileFromSelf, NormalizedFile, {
  strict: false,
  decode: (file, _options, ast) =>
    Effect.gen(function* () {
      // 1. Read file buffer for validation
      const buffer = yield* Effect.tryPromise({
        try: () => file.arrayBuffer(),
        catch: (error) => new ParseResult.Type(ast, file, `Failed to read file buffer: ${error}`),
      });

      // 2. Extract file extension from filename
      const extensionOpt = pipe(file.name, Str.split("."), A.tail, O.flatMap(A.last));

      // 3. Validate file type signature matches the file's own extension
      // Only validate if we can extract an extension; skip validation otherwise
      const isValidType = pipe(
        extensionOpt,
        O.map((ext) => {
          try {
            return fileTypeChecker.validateFileType(buffer, [ext]);
          } catch {
            // Extension not supported by file type checker - skip validation
            return true;
          }
        }),
        O.getOrElse(() => true) // No extension found - skip validation
      );

      if (!isValidType) {
        return yield* Effect.fail(
          new ParseResult.Type(ast, file, "Invalid file type - signature does not match extension")
        );
      }

      // 3. Extract metadata (requires MetadataService from context)
      // Transform errors into ParseResult issues with specific messages
      return yield* extractMetadata(file).pipe(
        Effect.mapError(
          (error): ParseResult.ParseIssue =>
            Match.value(error).pipe(
              Match.tag(
                "MetadataParseError",
                (e) =>
                  new ParseResult.Type(
                    ast,
                    file,
                    `Metadata parse error: ${e.message}${e.phase ? ` (phase: ${e.phase})` : ""}`
                  )
              ),
              Match.tag(
                "ExifFileTooLargeError",
                (e) =>
                  new ParseResult.Type(ast, file, `File too large: ${e.fileSize} bytes exceeds max ${e.maxSize} bytes`)
              ),
              Match.tag(
                "ExifTimeoutError",
                (e) => new ParseResult.Type(ast, file, `EXIF extraction timed out after ${e.timeoutMs}ms`)
              ),
              Match.tag("ParseError", (e) => e.issue),
              Match.orElse((e) => new ParseResult.Type(ast, file, `Unexpected error: ${String(e)}`))
            )
        )
      );
    }),

  encode: (normalizedFile, _options, _ast) => Effect.succeed(normalizedFile.file),
}) {}
