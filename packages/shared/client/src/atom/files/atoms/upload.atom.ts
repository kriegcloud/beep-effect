import { BeepError } from "@beep/errors/shared";
import { BS } from "@beep/schema";
import { InitiateUpload } from "@beep/shared-domain/rpc/v1/files/_rpcs";
import { Atom } from "@effect-atom/atom-react";
import { Cause, Effect, Stream } from "effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { FilesApi, ImageCompressionClient, makePresignedPostOptions, uploadToS3 } from "../../services";
import {
  S3AbortedError,
  S3NetworkError,
  S3TimeoutError,
  S3UploadFailedError,
  S3ValidationError,
} from "../../services/Upload/Upload.errors";
import { MAX_FILE_SIZE_BYTES } from "../constants";
import { ImageTooLargeAfterCompression } from "../errors";
import { runtime } from "../runtime";
import { FileSync } from "../services";
import { type UploadInput, UploadPhase, UploadState } from "../types";

const makeUploadStream = (uploadId: string, input: UploadInput) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`[UploadStream] Starting upload stream`, {
      uploadId,
      fileName: input.file.name,
      fileSize: input.file.size,
      mimeType: input.file.type,
      folderId: input.folderId,
    });

    const api = yield* FilesApi.Service;
    const fileSync = yield* FileSync.Service;
    const imageCompression = yield* ImageCompressionClient.Service;

    const handleIdle = Effect.fnUntraced(function* (state: UploadState & { readonly _tag: "Idle" }) {
      yield* Effect.logInfo(`[UploadStream] Processing Idle state`, {
        uploadId,
        fileName: state.input.file.name,
        fileSize: state.input.file.size,
        mimeType: state.input.file.type,
        maxSizeBytes: MAX_FILE_SIZE_BYTES,
        needsCompression: state.input.file.size > MAX_FILE_SIZE_BYTES,
        isImage: F.pipe(state.input.file.type, BS.MimeType.isImageMimeType),
      });

      // If file is too large and is an image, compress first
      if (state.input.file.size > MAX_FILE_SIZE_BYTES && F.pipe(state.input.file.type, BS.MimeType.isImageMimeType)) {
        yield* Effect.logInfo(`[UploadStream] Transitioning to Compressing`, {
          uploadId,
          fileName: state.input.file.name,
          originalSize: state.input.file.size,
        });
        return O.some<readonly [UploadPhase, UploadState]>([
          UploadPhase.Compressing(),
          UploadState.Compressing({ input: state.input }),
        ]);
      }

      yield* Effect.logInfo(`[UploadStream] Transitioning to Uploading (no compression needed)`, {
        uploadId,
        fileName: state.input.file.name,
        fileSize: state.input.file.size,
      });
      // Otherwise, upload directly
      return O.some<readonly [UploadPhase, UploadState]>([
        UploadPhase.Uploading(),
        UploadState.Uploading({ input: state.input, fileToUpload: state.input.file }),
      ]);
    });

    const handleCompressing = Effect.fnUntraced(function* (state: UploadState & { readonly _tag: "Compressing" }) {
      const maxAttempts = 3;

      yield* Effect.logInfo(`[UploadStream] Starting compression`, {
        uploadId,
        fileName: state.input.file.name,
        originalSize: state.input.file.size,
        maxAttempts,
      });

      const compressed = yield* Effect.iterate(
        {
          data: new Uint8Array(yield* Effect.promise(state.input.file.arrayBuffer)),
          mimeType: state.input.file.type,
          attempt: 0,
        },
        {
          while: (s) => s.data.length > MAX_FILE_SIZE_BYTES && s.attempt < maxAttempts,
          body: Effect.fnUntraced(function* (s) {
            yield* Effect.logDebug(`[UploadStream] Compression attempt`, {
              uploadId,
              attempt: s.attempt + 1,
              currentSize: s.data.length,
              targetSize: MAX_FILE_SIZE_BYTES,
            });

            const result = yield* imageCompression.client.compress({
              data: s.data,
              mimeType: s.mimeType,
              fileName: state.input.file.name,
              maxSizeMB: 1,
            });

            return {
              data: new Uint8Array(result.data),
              mimeType: result.mimeType,
              attempt: s.attempt + 1,
            };
          }),
        }
      );

      yield* Effect.logInfo(`[UploadStream] Compression completed`, {
        uploadId,
        fileName: state.input.file.name,
        originalSize: state.input.file.size,
        compressedSize: compressed.data.length,
        attempts: compressed.attempt,
      });

      if (compressed.data.length > MAX_FILE_SIZE_BYTES) {
        yield* Effect.logError(`[UploadStream] File too large after compression`, {
          uploadId,
          fileName: state.input.file.name,
          originalSizeBytes: state.input.file.size,
          compressedSizeBytes: compressed.data.length,
          maxSizeBytes: MAX_FILE_SIZE_BYTES,
        });

        return yield* new ImageTooLargeAfterCompression({
          fileName: state.input.file.name,
          originalSizeBytes: state.input.file.size,
          compressedSizeBytes: compressed.data.length,
        });
      }

      const compressedFile = new File([compressed.data], state.input.file.name, {
        type: compressed.mimeType,
      });

      yield* Effect.logInfo(`[UploadStream] Transitioning to Uploading (after compression)`, {
        uploadId,
        fileName: state.input.file.name,
        fileSize: compressedFile.size,
      });

      return O.some<readonly [UploadPhase, UploadState]>([
        UploadPhase.Uploading(),
        UploadState.Uploading({ input: state.input, fileToUpload: compressedFile }),
      ]);
    });

    const handleUploading = Effect.fnUntraced(function* (state: UploadState & { readonly _tag: "Uploading" }) {
      yield* Effect.logInfo(`[UploadStream] Preparing upload payload`, {
        uploadId,
        fileName: state.fileToUpload.name,
        fileSize: state.fileToUpload.size,
        mimeType: state.fileToUpload.type,
        folderId: state.input.folderId,
      });

      const metadata = yield* BS.extractMetadata(state.fileToUpload);

      yield* Effect.logInfo("metadata extracted", {
        metadata,
      });

      // metadata schema uses JsonFromString, so we need to pass a JSON string
      const metadataJson = yield* S.encode(S.parseJson())(metadata);

      const payload = yield* S.decodeUnknown(InitiateUpload.Payload)({
        fileName: state.fileToUpload.name,
        fileSize: state.fileToUpload.size,
        mimeType: state.fileToUpload.type,
        folderId: state.input.folderId,
        entityKind: state.input.entityKind,
        entityIdentifier: state.input.entityIdentifier,
        entityAttribute: state.input.entityAttribute,
        metadata: metadataJson,
        fields: {},
      });

      yield* Effect.logInfo(`[UploadStream] Calling initiateUpload RPC`, {
        uploadId,
        payload: {
          fileName: payload.fileName,
          fileSize: payload.fileSize,
          mimeType: payload.mimeType,
          folderId: payload.folderId,
          metadata: payload.metadata,
        },
      });

      const initiateResult = yield* api.initiateUpload(payload);

      yield* Effect.logInfo(`[UploadStream] Received initiateUpload response`, {
        uploadId,
        presignedUrl: initiateResult.presignedUrl,
        fileKey: initiateResult.fileKey,
        hasPresignedUrl: !!initiateResult.presignedUrl,
        presignedUrlLength: initiateResult.presignedUrl?.length,
      });

      const uploadOptions = makePresignedPostOptions(
        uploadId,
        state.fileToUpload,
        initiateResult.presignedUrl,
        payload.fields
      );

      yield* Effect.logInfo(`[UploadStream] Starting S3 upload`, {
        uploadId,
        fileName: state.fileToUpload.name,
        fileSize: state.fileToUpload.size,
        presignedUrl: initiateResult.presignedUrl,
        fields: payload.fields,
      });

      // Use XHR-based upload with progress tracking
      yield* uploadToS3(uploadOptions);

      yield* Effect.logInfo(`[UploadStream] S3 upload completed`, {
        uploadId,
        fileKey: initiateResult.fileKey,
      });

      yield* Effect.logInfo(`[UploadStream] Transitioning to Syncing`, {
        uploadId,
        fileKey: initiateResult.fileKey,
      });

      return O.some<readonly [UploadPhase, UploadState]>([
        UploadPhase.Syncing(),
        UploadState.Syncing({ input: state.input, fileKey: initiateResult.fileKey }),
      ]);
    });

    const handleSyncing = Effect.fnUntraced(function* (state: UploadState & { readonly _tag: "Syncing" }) {
      yield* Effect.logInfo(`[UploadStream] Starting file sync`, {
        uploadId,
        fileKey: state.fileKey,
      });

      yield* fileSync.waitForFile(state.fileKey, uploadId);

      yield* Effect.logInfo(`[UploadStream] File sync completed`, {
        uploadId,
        fileKey: state.fileKey,
      });

      yield* Effect.logInfo(`[UploadStream] Transitioning to Done`, {
        uploadId,
      });

      return O.some<readonly [UploadPhase, UploadState]>([UploadPhase.Done(), UploadState.Done()]);
    });

    const handleDone = Effect.fnUntraced(function* () {
      yield* Effect.logInfo(`[UploadStream] Upload complete`, {
        uploadId,
      });
      return O.none<readonly [UploadPhase, UploadState]>();
    });

    const transition = Effect.fnUntraced(
      function* (state: UploadState) {
        yield* Effect.logDebug(`[UploadStream] State transition`, {
          uploadId,
          currentState: state._tag,
        });

        return yield* F.pipe(
          Match.value(state),
          Match.tag("Idle", handleIdle),
          Match.tag("Compressing", handleCompressing),
          Match.tag("Uploading", handleUploading),
          Match.tag("Syncing", handleSyncing),
          Match.tag("Done", handleDone),
          Match.exhaustive
        );
      },
      F.flow(
        Effect.tapErrorCause((cause) =>
          Effect.logError(`[UploadStream] State transition error`, {
            uploadId,
            error: Cause.pretty(cause),
            causeSquash: Cause.squash(cause),
          })
        ),
        Effect.catchAll(
          Effect.fn(function* (e: unknown) {
            // Handle Unauthorized error
            if (e instanceof BeepError.Unauthorized) {
              yield* Effect.logError(`[UploadStream] Unauthorized error`, {
                uploadId,
                error: e,
              });
              const errorJson = yield* S.encode(S.parseJson())(e);
              return yield* Effect.dieMessage(`[Unauthorized]: ${errorJson}`);
            }

            // Handle S3 errors
            if (
              e instanceof S3AbortedError ||
              e instanceof S3NetworkError ||
              e instanceof S3TimeoutError ||
              e instanceof S3UploadFailedError ||
              e instanceof S3ValidationError
            ) {
              yield* Effect.logError(`[UploadStream] S3 Upload error`, {
                uploadId,
                error: e,
              });
              const s3ErrorJson = yield* S.encode(S.parseJson())(e);
              return yield* Effect.dieMessage(`[S3UploadError]: ${s3ErrorJson}`);
            }

            // Handle RpcClientError (from @effect/rpc, uses standard tag)
            if (typeof e === "object" && e !== null && "_tag" in e) {
              const tag = (e as { _tag: string })._tag;
              if (tag === "RpcClientError" || tag.endsWith(":RpcClientError")) {
                yield* Effect.logError(`[UploadStream] RPC Client error`, {
                  uploadId,
                  error: e,
                });
                const rpcErrorJson = yield* S.encode(S.parseJson())(e);
                return yield* Effect.dieMessage(`[RpcClientError]: ${rpcErrorJson}`);
              }
            }

            // Re-fail with unknown error
            return yield* Effect.fail(e);
          })
        )
      )
    );

    return Stream.unfoldEffect(UploadState.Idle({ input }) as UploadState, transition);
  }).pipe(Stream.unwrap);

export const uploadAtom = Atom.family((uploadId: string) =>
  runtime.fn((input: UploadInput) => makeUploadStream(uploadId, input))
);
