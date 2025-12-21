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
import { faker } from "@faker-js/faker";
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
import { IAudioMetadata, ICommonTagsResult, IFormat, IQualityInformation } from "./metadata/types.ts";
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
  arbitrary: () => (fc) =>
    fc.constant(null).map(() => {
      // Create instances by setting prototypes directly to bypass S.Class constructor validation
      // This is necessary because the constructor validation serializes Options during comparison
      const format = Object.assign(Object.create(IFormat.prototype), {
        trackInfo: [],
        tagTypes: [],
        container: O.some(faker.helpers.arrayElement(["mp3", "flac", "ogg", "wav", "aac"])),
        duration: O.some(faker.number.float({ min: 30, max: 600, fractionDigits: 2 })),
        bitrate: O.some(faker.number.int({ min: 128000, max: 320000 })),
        sampleRate: O.some(faker.helpers.arrayElement([44100, 48000, 96000])),
        bitsPerSample: O.some(faker.helpers.arrayElement([16, 24, 32])),
        tool: O.none(),
        codec: O.some(faker.helpers.arrayElement(["MP3", "FLAC", "AAC", "Vorbis"])),
        codecProfile: O.none(),
        lossless: O.some(faker.datatype.boolean()),
        numberOfChannels: O.some(faker.helpers.arrayElement([1, 2])),
        numberOfSamples: O.none(),
        audioMD5: O.none(),
        chapters: O.none(),
        creationTime: O.none(),
        modificationTime: O.none(),
        trackGain: O.none(),
        trackPeakLevel: O.none(),
        albumGain: O.none(),
        hasAudio: O.some(true),
        hasVideo: O.some(false),
      });

      const quality = Object.assign(Object.create(IQualityInformation.prototype), {
        warnings: [],
      });

      const common = Object.assign(Object.create(ICommonTagsResult.prototype), {
        track: { no: faker.number.int({ min: 1, max: 20 }), of: faker.number.int({ min: 10, max: 20 }) },
        disk: { no: 1, of: 1 },
        movementIndex: { no: null, of: null },
        year: O.some(faker.number.int({ min: 1970, max: 2024 })),
        title: O.some(faker.music.songName()),
        artist: O.some(faker.person.fullName()),
        artists: O.none(),
        albumartist: O.none(),
        album: O.some(faker.lorem.words(3)),
        date: O.none(),
        originaldate: O.none(),
        originalyear: O.none(),
        releasedate: O.none(),
        comment: O.none(),
        genre: O.some([faker.music.genre()]),
        picture: O.none(),
        composer: O.none(),
        lyrics: O.none(),
        albumsort: O.none(),
        titlesort: O.none(),
        work: O.none(),
        artistsort: O.none(),
        albumartistsort: O.none(),
        composersort: O.none(),
        lyricist: O.none(),
        writer: O.none(),
        conductor: O.none(),
        remixer: O.none(),
        arranger: O.none(),
        engineer: O.none(),
        publisher: O.none(),
        producer: O.none(),
        djmixer: O.none(),
        mixer: O.none(),
        technician: O.none(),
        label: O.none(),
        grouping: O.none(),
        subtitle: O.none(),
        description: O.none(),
        longDescription: O.none(),
        discsubtitle: O.none(),
        totaltracks: O.none(),
        totaldiscs: O.none(),
        movementTotal: O.none(),
        compilation: O.none(),
        rating: O.none(),
        bpm: O.some(faker.number.int({ min: 60, max: 180 })),
        mood: O.none(),
        media: O.none(),
        catalognumber: O.none(),
        tvShow: O.none(),
        tvShowSort: O.none(),
        tvSeason: O.none(),
        tvEpisode: O.none(),
        tvEpisodeId: O.none(),
        tvNetwork: O.none(),
        podcast: O.none(),
        podcasturl: O.none(),
        releasestatus: O.none(),
        releasetype: O.none(),
        releasecountry: O.none(),
        script: O.none(),
        language: O.none(),
        copyright: O.none(),
        license: O.none(),
        encodedby: O.none(),
        encodersettings: O.none(),
        gapless: O.none(),
        barcode: O.none(),
        isrc: O.none(),
        asin: O.none(),
        musicbrainz_recordingid: O.none(),
        musicbrainz_trackid: O.none(),
        musicbrainz_albumid: O.none(),
        musicbrainz_artistid: O.none(),
        musicbrainz_albumartistid: O.none(),
        musicbrainz_releasegroupid: O.none(),
        musicbrainz_workid: O.none(),
        musicbrainz_trmid: O.none(),
        musicbrainz_discid: O.none(),
        acoustid_id: O.none(),
        acoustid_fingerprint: O.none(),
        musicip_puid: O.none(),
        musicip_fingerprint: O.none(),
        website: O.none(),
        "performer:instrument": O.none(),
        averageLevel: O.none(),
        peakLevel: O.none(),
        notes: O.none(),
        originalalbum: O.none(),
        originalartist: O.none(),
        discogs_artist_id: O.none(),
        discogs_release_id: O.none(),
        discogs_label_id: O.none(),
        discogs_master_release_id: O.none(),
        discogs_votes: O.none(),
        discogs_rating: O.none(),
        replaygain_track_gain_ratio: O.none(),
        replaygain_track_peak_ratio: O.none(),
        replaygain_track_gain: O.none(),
        replaygain_track_peak: O.none(),
        replaygain_album_gain: O.none(),
        replaygain_album_peak: O.none(),
        replaygain_undo: O.none(),
        replaygain_track_minmax: O.none(),
        replaygain_album_minmax: O.none(),
        key: O.none(),
        category: O.none(),
        hdVideo: O.none(),
        keywords: O.none(),
        movement: O.none(),
        podcastId: O.none(),
        showMovement: O.none(),
        stik: O.none(),
        playCounter: O.none(),
      });

      // Create IAudioMetadata instance with proper prototype chain
      return Object.assign(Object.create(IAudioMetadata.prototype), {
        format,
        native: {},
        quality,
        common,
      });
    }),
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
  name: S.String,
  size: S.NonNegativeInt,
  lastModified: DateTimeUtcFromAllAcceptable,
  webkitRelativePath: S.String,
  // File size fields use plain strings since they're pre-transformed from the raw size
  // The transformation happens in normalizeFileProperties using the format helpers
  fileSizeSI: S.String,
  fileSizeIEC: S.String,
  fileSizeBitsSI: S.String,
  fileSizeBitsIEC: S.String,
  // Use S.OptionFromSelf since extractMetadata passes decoded Option values (O.some/O.none)
  // rather than the encoded form ({ _tag: "Some", value: ... })
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
  const name = yield* pipe(file.name, S.decode(S.String));
  const size = yield* pipe(file.size, S.decode(S.NonNegativeInt));
  const extensionStr = yield* pipe(file.name, Str.split("."), A.tail, O.flatMap(A.last));
  const fileSizeSI = yield* pipe(file.size, S.decode(FileSizeSI));
  const fileSizeIEC = yield* pipe(file.size, S.decode(FileSizeIEC));
  const fileSizeBitsSI = yield* pipe(file.size, S.decode(FileSizeBitsSI));
  const fileSizeBitsIEC = yield* pipe(file.size, S.decode(FileSizeBitsIEC));
  const lastModified = yield* pipe(file.lastModified, S.decode(DateTimeUtcFromAllAcceptable));
  const webkitRelativePath = yield* pipe(file.webkitRelativePath, S.decode(S.String));

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
