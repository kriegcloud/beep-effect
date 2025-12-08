import { BS } from "@beep/schema";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { StringLiteralKit } from "../../derived";
import { DateTimeUtcFromAllAcceptable } from "../../primitives";
import { AspectRatio } from "./AspectRatio";
import { fileTypeChecker, getFileChunkEither } from "./file-types";
import { FileExtension, getTypes, MimeType } from "./mime-types";
import { formatSize } from "./utils";
export class FileType extends StringLiteralKit("image", "video", "audio", "pdf", "text", "blob") {}

export declare namespace FileType {
  export type Type = typeof FileType.Type;
  export type Encoded = typeof FileType.Encoded;
}
/**
 * Upload observability
 * - Spans, annotations, and metrics for the upload pipeline
 */

// Metrics

export type UploadAnnotation = Readonly<Record<string, unknown>>;

// Lightweight logging helpers (level-specific)

export const makeFileAnnotations = (file: File, extra?: UploadAnnotation | undefined): UploadAnnotation => ({
  service: "upload",
  fileName: file.name,
  fileType: file.type,
  fileSize: file.size,
  ...extra,
});

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly cause?: unknown | undefined;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly candidateMime?: string | undefined;
  readonly allowedMime?: ReadonlyArray<string> | undefined;
}> {}

export class DetectionError extends Data.TaggedError("DetectionError")<{
  readonly message: string;
  readonly cause?: unknown | undefined;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly chunkSize?: number | undefined;
}> {}

export class NativeFileInstance extends S.declare((i: unknown): i is File => i instanceof File).annotations({
  schemaId: Symbol.for("@beep/schema/integrations/files/NativeFileInstance"),
  identifier: "NativeFileInstance",
  title: "NativeFileInstance",
  description: "Base file instance schema",
}) {
  static readonly validateFile = Effect.fn("upload.validateFile")(function* (
    file: NativeFileInstance.Type,
    chunkSize = 64
  ) {
    const formattedSize = formatSize(file.size);
    // Size check (friendly message using BS.formatSize)

    const buffer = yield* Effect.tryPromise({
      try: async () => file.arrayBuffer(),
      catch: (e) =>
        new DetectionError({
          message: "Could not detect file type from signature",
          cause: e,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
    });
    const chunkResult = getFileChunkEither(buffer, chunkSize);
    if (Either.isLeft(chunkResult)) {
      return yield* new DetectionError({
        message: "Could not extract file chunk",
        cause: chunkResult.left,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        chunkSize,
      });
    }
    const chunk = chunkResult.right;
    const detected = F.pipe(fileTypeChecker.detectFileOption(chunk, { chunkSize }), O.getOrUndefined);
    if (!detected) {
      // increment metric and warn before failing

      return yield* new DetectionError({
        message: "Could not detect file type from signature",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        chunkSize,
      });
    }
    // Ensure detected mime is supported by our schema; fail early with a helpful error
    const candidate = detected?.mimeType ?? file.type;
    yield* S.decodeUnknown(BS.MimeType)(candidate).pipe(
      Effect.tapError((error) =>
        Effect.logWarning("upload.validateFile: unsupported mime type", {
          ...makeFileAnnotations(file),
          candidate,
          error,
        })
      ),
      Effect.mapError(
        (error) =>
          new ValidationError({
            message: `Unsupported mime type: ${candidate}`,
            cause: error,
            fileName: file.name,
            fileType: candidate,
            fileSize: file.size,
          })
      )
    );
    const fileInstance = yield* S.decode(FileInstanceFromNative)(file);

    return { detected, formattedSize, fileInstance, nativeFile: file };
  });
}

export declare namespace NativeFileInstance {
  export type Type = S.Schema.Type<typeof NativeFileInstance>;
  export type Encoded = S.Schema.Encoded<typeof NativeFileInstance>;
}

export class FileInstance extends S.Class<FileInstance>("@beep/schema/integrations/files/FileInstance")({
  size: S.NonNegativeInt,
  type: MimeType,
  lastModified: DateTimeUtcFromAllAcceptable,
  name: S.NonEmptyTrimmedString,
  webkitRelativePath: S.NonEmptyTrimmedString,
  width: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),
  height: S.optionalWith(S.NonNegativeInt, { as: "Option", nullable: true }),
}) {
  get formattedSize() {
    return formatSize(this.size);
  }

  get fileExtension() {
    return pipe(this.name, Str.split("."), A.lastNonEmpty, S.decodeUnknownSync(FileExtension));
  }

  get mimeType() {
    return getTypes()[this.fileExtension];
  }

  get mediaType() {
    return pipe(this.mimeType, Str.split("/"), A.lastNonEmpty, S.decodeUnknownSync(FileType));
  }

  get aspectRatio(): O.Option<`${number} / ${number}`> {
    return pipe(
      this.type,
      O.liftPredicate(P.or(MimeType.isImageType, MimeType.isVideoMimeType)),
      O.flatMap(() =>
        pipe(
          O.all({ width: this.width, height: this.height }),
          O.map(({ width, height }) => S.decodeSync(AspectRatio)({ width, height }))
        )
      )
    );
  }
}

export declare namespace FileInstance {
  export type Type = S.Schema.Type<typeof FileInstance>;
  export type Encoded = S.Schema.Encoded<typeof FileInstance>;
}

export class FileInstanceFromNative extends S.transformOrFail(NativeFileInstance, FileInstance, {
  strict: false,
  decode: (nativeFile, _, ast) =>
    ParseResult.try({
      try: () =>
        S.decodeUnknownSync(FileInstance)({
          size: nativeFile.size,
          type: nativeFile.type,
          lastModified: nativeFile.lastModified,
          name: nativeFile.name,
          webkitRelativePath: nativeFile.webkitRelativePath,
        }),
      catch: () => new ParseResult.Type(ast, nativeFile, "failed to transform native File to FileInstance"),
    }),
  encode: (_, __, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, _, "encode only schema")),
}) {}

export declare namespace FileInstanceFromNative {
  export type Type = S.Schema.Type<typeof FileInstanceFromNative>;
  export type Encoded = S.Schema.Encoded<typeof FileInstanceFromNative>;
}
