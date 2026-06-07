/**
 * Hand-written byte and event stream adapters for the Box Node SDK.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import { Cause, Effect, Exit, Queue, Result, Stream } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as M from "./_generated/Box.models.gen.ts";
import { BoxError } from "./Box.errors.ts";
import { BOX_SDK_VERSION } from "./internal/Box.constants.ts";
import { decodeWith, logDriverFailure } from "./internal/Box.runtime.ts";
import type { BoxMethodName } from "./_generated/Box.models.gen.ts";

/**
 * Byte input accepted by Box upload adapters.
 *
 * @example
 * ```ts
 * import { Stream } from "effect"
 * import type { BoxByteInput } from "@beep/box"
 *
 * const bytes: BoxByteInput = Stream.make(new Uint8Array([1, 2, 3]))
 * console.log(bytes)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxByteInput = Uint8Array | Readable | Stream.Stream<Uint8Array, BoxError, never>;

/**
 * Byte stream returned by Box download adapters.
 *
 * @example
 * ```ts
 * import { Stream } from "effect"
 * import type { BoxByteStream } from "@beep/box"
 *
 * const bytes: BoxByteStream = Stream.empty
 * console.log(bytes)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxByteStream = Stream.Stream<Uint8Array, BoxError, never>;

/**
 * Technical accumulator used by the Box chunked-upload reducer helper.
 *
 * @example
 * ```ts
 * import type { BoxPartAccumulator } from "@beep/box"
 *
 * type LastIndex = BoxPartAccumulator["lastIndex"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxPartAccumulator = {
  readonly fileHash: unknown;
  readonly fileSize: number;
  readonly lastIndex: number;
  readonly parts: readonly M.UploadPart[];
  readonly uploadPartUrl: string;
};

/**
 * Payload for `avatars.createUserAvatar`.
 *
 * @example
 * ```ts
 * import type { BoxCreateUserAvatarPayload } from "@beep/box"
 *
 * type RequestBody = BoxCreateUserAvatarPayload["requestBody"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxCreateUserAvatarPayload = {
  readonly optionalsInput?: M.CreateUserAvatarOptionalsInput;
  readonly requestBody: Omit<M.CreateUserAvatarRequestBody, "pic"> & {
    readonly pic: BoxByteInput;
  };
  readonly userId: string;
};

/**
 * Payload for `avatars.getUserAvatar`.
 *
 * @example
 * ```ts
 * import type { BoxGetUserAvatarPayload } from "@beep/box"
 *
 * const payload: BoxGetUserAvatarPayload = { userId: "12345" }
 * console.log(payload.userId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxGetUserAvatarPayload = {
  readonly optionalsInput?: M.GetUserAvatarOptionalsInput;
  readonly userId: string;
};

/**
 * Payload for `downloads.downloadFile`.
 *
 * @example
 * ```ts
 * import type { BoxDownloadFilePayload } from "@beep/box"
 *
 * const payload: BoxDownloadFilePayload = { fileId: "12345" }
 * console.log(payload.fileId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxDownloadFilePayload = {
  readonly fileId: string;
  readonly optionalsInput?: M.DownloadFileOptionalsInput;
};

/**
 * Payload for `files.getFileThumbnailById`.
 *
 * @example
 * ```ts
 * import type { BoxGetFileThumbnailByIdPayload } from "@beep/box"
 *
 * const payload: BoxGetFileThumbnailByIdPayload = { extension: "png", fileId: "12345" }
 * console.log(payload.extension)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxGetFileThumbnailByIdPayload = {
  readonly extension: M.GetFileThumbnailByIdExtension;
  readonly fileId: string;
  readonly optionalsInput?: M.GetFileThumbnailByIdOptionalsInput;
};

/**
 * Payload for `uploads.uploadFileVersion`.
 *
 * @example
 * ```ts
 * import type { BoxUploadFileVersionPayload } from "@beep/box"
 *
 * type RequestBody = BoxUploadFileVersionPayload["requestBody"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxUploadFileVersionPayload = {
  readonly fileId: string;
  readonly optionalsInput?: M.UploadFileVersionOptionalsInput;
  readonly requestBody: Omit<M.UploadFileVersionRequestBody, "file"> & {
    readonly file: BoxByteInput;
  };
};

/**
 * Payload for `uploads.uploadFile`.
 *
 * @example
 * ```ts
 * import type { BoxUploadFilePayload } from "@beep/box"
 *
 * type RequestBody = BoxUploadFilePayload["requestBody"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxUploadFilePayload = {
  readonly optionalsInput?: M.UploadFileOptionalsInput;
  readonly requestBody: Omit<M.UploadFileRequestBody, "file"> & {
    readonly file: BoxByteInput;
  };
};

/**
 * Payload for `uploads.uploadWithPreflightCheck`.
 *
 * @example
 * ```ts
 * import type { BoxUploadWithPreflightCheckPayload } from "@beep/box"
 *
 * type RequestBody = BoxUploadWithPreflightCheckPayload["requestBody"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxUploadWithPreflightCheckPayload = {
  readonly optionalsInput?: M.UploadWithPreflightCheckOptionalsInput;
  readonly requestBody: Omit<M.UploadWithPreflightCheckRequestBody, "file"> & {
    readonly file: BoxByteInput;
  };
};

/**
 * Payload for `chunkedUploads.uploadFilePartByUrl`.
 *
 * @example
 * ```ts
 * import type { BoxUploadFilePartByUrlPayload } from "@beep/box"
 *
 * type Headers = BoxUploadFilePartByUrlPayload["headersInput"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxUploadFilePartByUrlPayload = {
  readonly headersInput: M.UploadFilePartByUrlHeadersInput;
  readonly optionalsInput?: M.UploadFilePartByUrlOptionalsInput;
  readonly requestBody: BoxByteInput;
  readonly url: string;
};

/**
 * Payload for `chunkedUploads.uploadFilePart`.
 *
 * @example
 * ```ts
 * import type { BoxUploadFilePartPayload } from "@beep/box"
 *
 * type Headers = BoxUploadFilePartPayload["headersInput"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxUploadFilePartPayload = {
  readonly headersInput: M.UploadFilePartHeadersInput;
  readonly optionalsInput?: M.UploadFilePartOptionalsInput;
  readonly requestBody: BoxByteInput;
  readonly uploadSessionId: string;
};

/**
 * Payload for `chunkedUploads.reducer`.
 *
 * @example
 * ```ts
 * import type { BoxChunkedUploadReducerPayload } from "@beep/box"
 *
 * type Acc = BoxChunkedUploadReducerPayload["acc"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxChunkedUploadReducerPayload = {
  readonly acc: BoxPartAccumulator;
  readonly chunk: BoxByteInput;
};

/**
 * Payload for `chunkedUploads.uploadBigFile`.
 *
 * @example
 * ```ts
 * import type { BoxUploadBigFilePayload } from "@beep/box"
 *
 * type FileSize = BoxUploadBigFilePayload["fileSize"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxUploadBigFilePayload = {
  readonly file: BoxByteInput;
  readonly fileName: string;
  readonly fileSize: number;
  readonly parentFolderId: string;
};

/**
 * Payload for `events.getEventStream`.
 *
 * @example
 * ```ts
 * import type { BoxGetEventStreamPayload } from "@beep/box"
 *
 * const payload: BoxGetEventStreamPayload = {}
 * console.log(payload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxGetEventStreamPayload = {
  readonly headersInput?: M.GetEventStreamHeadersInput;
  readonly queryParams?: M.GetEventStreamQueryParams;
};

/**
 * Payload for `zipDownloads.getZipDownloadContent`.
 *
 * @example
 * ```ts
 * import type { BoxGetZipDownloadContentPayload } from "@beep/box"
 *
 * const payload: BoxGetZipDownloadContentPayload = { downloadUrl: "https://example.com/content" }
 * console.log(payload.downloadUrl)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxGetZipDownloadContentPayload = {
  readonly downloadUrl: string;
  readonly optionalsInput?: M.GetZipDownloadContentOptionalsInput;
};

/**
 * Payload for `zipDownloads.downloadZip`.
 *
 * @example
 * ```ts
 * import type { BoxDownloadZipPayload } from "@beep/box"
 *
 * type RequestBody = BoxDownloadZipPayload["requestBody"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxDownloadZipPayload = {
  readonly optionalsInput?: M.DownloadZipOptionalsInput;
  readonly requestBody: M.ZipDownloadRequest;
};

/**
 * Hand-written streaming operation groups for the Box SDK.
 *
 * @example
 * ```ts
 * import type { BoxStreamingOperations } from "@beep/box"
 *
 * type StreamingManagers = keyof BoxStreamingOperations
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type BoxStreamingOperations = {
  readonly avatars: {
    readonly createUserAvatar: (payload: BoxCreateUserAvatarPayload) => Effect.Effect<M.UserAvatar, BoxError>;
    readonly getUserAvatar: (payload: BoxGetUserAvatarPayload) => BoxByteStream;
  };
  readonly chunkedUploads: {
    readonly reducer: (payload: BoxChunkedUploadReducerPayload) => Effect.Effect<BoxPartAccumulator, BoxError>;
    readonly uploadBigFile: (payload: BoxUploadBigFilePayload) => Effect.Effect<M.FileFull, BoxError>;
    readonly uploadFilePart: (payload: BoxUploadFilePartPayload) => Effect.Effect<M.UploadedPart, BoxError>;
    readonly uploadFilePartByUrl: (payload: BoxUploadFilePartByUrlPayload) => Effect.Effect<M.UploadedPart, BoxError>;
  };
  readonly downloads: {
    readonly downloadFile: (payload: BoxDownloadFilePayload) => BoxByteStream;
  };
  readonly events: {
    readonly getEventStream: (payload: BoxGetEventStreamPayload) => Stream.Stream<M.Event, BoxError>;
  };
  readonly files: {
    readonly getFileThumbnailById: (payload: BoxGetFileThumbnailByIdPayload) => BoxByteStream;
  };
  readonly uploads: {
    readonly uploadFile: (payload: BoxUploadFilePayload) => Effect.Effect<M.Files, BoxError>;
    readonly uploadFileVersion: (payload: BoxUploadFileVersionPayload) => Effect.Effect<M.Files, BoxError>;
    readonly uploadWithPreflightCheck: (
      payload: BoxUploadWithPreflightCheckPayload
    ) => Effect.Effect<M.Files, BoxError>;
  };
  readonly zipDownloads: {
    readonly downloadZip: (payload: BoxDownloadZipPayload) => BoxByteStream;
    readonly getZipDownloadContent: (payload: BoxGetZipDownloadContentPayload) => BoxByteStream;
  };
};

const BoxCreateUserAvatarPayloadSchema = S.Struct({
  optionalsInput: M.CreateUserAvatarOptionalsInput.pipe(S.optionalKey),
  requestBody: M.CreateUserAvatarRequestBody,
  userId: S.String,
});

const BoxGetUserAvatarPayloadSchema = S.Struct({
  optionalsInput: M.GetUserAvatarOptionalsInput.pipe(S.optionalKey),
  userId: S.String,
});

const BoxDownloadFilePayloadSchema = S.Struct({
  fileId: S.String,
  optionalsInput: M.DownloadFileOptionalsInput.pipe(S.optionalKey),
});

const BoxGetFileThumbnailByIdPayloadSchema = S.Struct({
  extension: M.GetFileThumbnailByIdExtension,
  fileId: S.String,
  optionalsInput: M.GetFileThumbnailByIdOptionalsInput.pipe(S.optionalKey),
});

const BoxUploadFileVersionPayloadSchema = S.Struct({
  fileId: S.String,
  optionalsInput: M.UploadFileVersionOptionalsInput.pipe(S.optionalKey),
  requestBody: M.UploadFileVersionRequestBody,
});

const BoxUploadFilePayloadSchema = S.Struct({
  optionalsInput: M.UploadFileOptionalsInput.pipe(S.optionalKey),
  requestBody: M.UploadFileRequestBody,
});

const BoxUploadWithPreflightCheckPayloadSchema = S.Struct({
  optionalsInput: M.UploadWithPreflightCheckOptionalsInput.pipe(S.optionalKey),
  requestBody: M.UploadWithPreflightCheckRequestBody,
});

const BoxUploadFilePartByUrlPayloadSchema = S.Struct({
  headersInput: M.UploadFilePartByUrlHeadersInput,
  optionalsInput: M.UploadFilePartByUrlOptionalsInput.pipe(S.optionalKey),
  requestBody: S.Unknown,
  url: S.String,
});

const BoxUploadFilePartPayloadSchema = S.Struct({
  headersInput: M.UploadFilePartHeadersInput,
  optionalsInput: M.UploadFilePartOptionalsInput.pipe(S.optionalKey),
  requestBody: S.Unknown,
  uploadSessionId: S.String,
});

const BoxPartAccumulatorSchema = S.Struct({
  fileHash: S.Unknown,
  fileSize: S.Finite,
  lastIndex: S.Finite,
  parts: M.UploadPart.pipe(S.Array),
  uploadPartUrl: S.String,
});

const BoxChunkedUploadReducerPayloadSchema = S.Struct({
  acc: BoxPartAccumulatorSchema,
  chunk: S.Unknown,
});

const BoxUploadBigFilePayloadSchema = S.Struct({
  file: S.Unknown,
  fileName: S.String,
  fileSize: S.Finite,
  parentFolderId: S.String,
});

const BoxGetEventStreamPayloadSchema = S.Struct({
  headersInput: M.GetEventStreamHeadersInput.pipe(S.optionalKey),
  queryParams: M.GetEventStreamQueryParams.pipe(S.optionalKey),
});

const BoxGetZipDownloadContentPayloadSchema = S.Struct({
  downloadUrl: S.String,
  optionalsInput: M.GetZipDownloadContentOptionalsInput.pipe(S.optionalKey),
});

const BoxDownloadZipPayloadSchema = S.Struct({
  optionalsInput: M.DownloadZipOptionalsInput.pipe(S.optionalKey),
  requestBody: M.ZipDownloadRequest,
});

const readProperty = (value: unknown, key: PropertyKey): unknown =>
  P.isObject(value)
    ? Result.getOrElse(
        Result.try(() => Reflect.get(value, key)),
        () => undefined
      )
    : undefined;

const sdkShapeFailure = (manager: string, method: string): Readonly<Record<string, string>> => ({
  _tag: "BoxSdkShapeError",
  manager,
  method,
});

const invokeSdkPromise = (
  client: unknown,
  manager: string,
  method: string,
  methodName: BoxMethodName,
  args: ReadonlyArray<unknown>
): Effect.Effect<unknown, BoxError> =>
  Effect.tryPromise({
    try: () => {
      const managerValue = readProperty(client, manager);
      const methodValue = readProperty(managerValue, method);

      if (!P.isFunction(methodValue)) {
        return Promise.reject(sdkShapeFailure(manager, method));
      }

      const result = Result.try(() => Reflect.apply(methodValue, managerValue, args));
      return Result.match(result, {
        onFailure: (cause) => Promise.reject(cause),
        onSuccess: (value) => Promise.resolve(value),
      });
    },
    catch: (cause) => BoxError.fromUnknown(methodName, cause),
  });

const invokeSdkSync = (
  client: unknown,
  manager: string,
  method: string,
  methodName: BoxMethodName,
  args: ReadonlyArray<unknown>
): Effect.Effect<unknown, BoxError> => {
  const managerValue = readProperty(client, manager);
  const methodValue = readProperty(managerValue, method);

  if (!P.isFunction(methodValue)) {
    return Effect.fail(BoxError.fromUnknown(methodName, sdkShapeFailure(manager, method)));
  }

  return Effect.try({
    try: () => Reflect.apply(methodValue, managerValue, args),
    catch: (cause) => BoxError.fromUnknown(methodName, cause),
  });
};

const mergeCancellation = <A>(
  input: A | undefined,
  signal: AbortSignal
): A | { readonly cancellationToken: AbortSignal } => {
  if (P.isObject(input)) {
    return { ...input, cancellationToken: signal };
  }
  return { cancellationToken: signal };
};

const byteInputToReadable = (method: BoxMethodName, value: unknown): Effect.Effect<Readable, BoxError> => {
  if (value instanceof Uint8Array) {
    return Effect.succeed(Readable.from([Buffer.from(value)]));
  }
  if (value instanceof Readable) {
    return Effect.succeed(value);
  }
  if (isBoxByteEffectStream(value)) {
    return Effect.succeed(Readable.from(Stream.toAsyncIterable(value)));
  }
  return Effect.fail(
    BoxError.fromReason("stream", {
      cause: "Expected Uint8Array, Node Readable, or Effect Stream byte input",
      method,
    })
  );
};

const isAsyncIterable = (value: unknown): value is AsyncIterable<unknown> =>
  P.isObject(value) && P.isFunction(Reflect.get(value, Symbol.asyncIterator));

const isBoxByteEffectStream = (value: unknown): value is Stream.Stream<Uint8Array, BoxError, never> =>
  Stream.isStream(value);

const destroyReadable = (value: unknown): void => {
  if (value instanceof Readable && !value.destroyed) {
    value.destroy();
  }
};

const chunkToBytes =
  (method: BoxMethodName) =>
  (chunk: unknown): Effect.Effect<Uint8Array, BoxError> => {
    if (chunk instanceof Uint8Array) {
      return Effect.succeed(chunk);
    }
    if (P.isString(chunk)) {
      return Effect.succeed(Buffer.from(chunk));
    }
    return Effect.fail(
      BoxError.fromReason("stream", {
        cause: "Box SDK byte stream emitted a non-byte chunk",
        method,
      })
    );
  };

const byteStreamFromSdkValue = (method: BoxMethodName, value: unknown, controller: AbortController): BoxByteStream => {
  const finalizer = Effect.sync(() => {
    controller.abort();
    destroyReadable(value);
  });

  if (value === undefined) {
    return Stream.empty.pipe(Stream.ensuring(finalizer));
  }
  if (!isAsyncIterable(value)) {
    return Stream.fail(
      BoxError.fromReason("stream", {
        cause: "Box SDK did not return a readable byte stream",
        method,
      })
    ).pipe(Stream.ensuring(finalizer));
  }

  const sdkStream: Stream.Stream<unknown, BoxError, never> = Stream.fromAsyncIterable(value, (cause) =>
    BoxError.fromUnknown(method, cause)
  );

  return sdkStream.pipe(Stream.mapEffect(chunkToBytes(method)), Stream.ensuring(finalizer));
};

const runJsonSdkCall = <Payload, Success>(
  methodName: BoxMethodName,
  payloadSchema: S.Decoder<Payload>,
  successSchema: S.Decoder<Success>,
  payload: unknown,
  invoke: (decoded: Payload, signal: AbortSignal) => Effect.Effect<unknown, BoxError>
): Effect.Effect<Success, BoxError> =>
  Effect.acquireUseRelease(
    Effect.sync(() => new AbortController()),
    (controller) =>
      decodeWith(methodName, payloadSchema, payload, "request encoding").pipe(
        Effect.flatMap((decoded) => invoke(decoded, controller.signal)),
        Effect.flatMap((result) => decodeWith(methodName, successSchema, result, "response decoding")),
        Effect.tapError(logDriverFailure("box.streaming_json_failure")),
        Effect.withSpan(`box.${methodName}`, {
          attributes: {
            "box.method": methodName,
            "box.sdk.version": BOX_SDK_VERSION,
          },
        })
      ),
    (controller) => Effect.sync(() => controller.abort())
  );

const runByteStreamSdkCall = <Payload>(
  methodName: BoxMethodName,
  payloadSchema: S.Decoder<Payload>,
  payload: unknown,
  invoke: (decoded: Payload, signal: AbortSignal) => Effect.Effect<unknown, BoxError>
): BoxByteStream =>
  Stream.unwrap(
    Effect.acquireUseRelease(
      Effect.sync(() => new AbortController()),
      (controller) =>
        decodeWith(methodName, payloadSchema, payload, "request encoding").pipe(
          Effect.flatMap((decoded) => invoke(decoded, controller.signal)),
          Effect.map((result) => byteStreamFromSdkValue(methodName, result, controller)),
          Effect.tapError(logDriverFailure("box.streaming_byte_failure")),
          Effect.withSpan(`box.${methodName}`, {
            attributes: {
              "box.method": methodName,
              "box.sdk.version": BOX_SDK_VERSION,
            },
          })
        ),
      (controller, exit) => (Exit.isSuccess(exit) ? Effect.void : Effect.sync(() => controller.abort()))
    )
  ).pipe(
    Stream.withSpan(`box.${methodName}.stream`, {
      attributes: {
        "box.method": methodName,
        "box.sdk.version": BOX_SDK_VERSION,
      },
    })
  );

const eventStreamFromSdkValue = (method: BoxMethodName, value: unknown): Stream.Stream<M.Event, BoxError> => {
  if (!(value instanceof Readable)) {
    return Stream.fail(
      BoxError.fromReason("stream", {
        cause: "Box SDK did not return a readable event stream",
        method,
      })
    );
  }

  const readable = value;

  return Stream.callback<M.Event, BoxError>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        let ended = false;

        function removeListeners(): void {
          readable.off("data", onData);
          readable.off("error", onError);
          readable.off("end", onEnd);
          readable.off("close", onEnd);
        }

        function closeReadable(): void {
          removeListeners();
          destroyReadable(readable);
        }

        function fail(error: BoxError): void {
          if (!ended) {
            ended = true;
            closeReadable();
            Queue.failCauseUnsafe(queue, Cause.fail(error));
          }
        }

        function onData(payload: unknown): void {
          if (ended) {
            return;
          }

          const result = S.decodeUnknownResult(M.Event)(payload);
          if (Result.isSuccess(result)) {
            Queue.offerUnsafe(queue, result.success);
            return;
          }

          fail(
            BoxError.fromReason("response decoding", {
              cause: result.failure,
              method,
            })
          );
        }

        function onError(cause: unknown): void {
          fail(BoxError.fromUnknown(method, cause));
        }

        function onEnd(): void {
          if (!ended) {
            ended = true;
            removeListeners();
            Queue.endUnsafe(queue);
          }
        }

        readable.on("data", onData);
        readable.on("error", onError);
        readable.on("end", onEnd);
        readable.on("close", onEnd);

        return closeReadable;
      }),
      (closeReadable) => Effect.sync(closeReadable)
    )
  ).pipe(
    Stream.withSpan(`box.${method}.stream`, {
      attributes: {
        "box.method": method,
        "box.sdk.version": BOX_SDK_VERSION,
      },
    })
  );
};

const runEventStreamSdkCall = <Payload>(
  methodName: BoxMethodName,
  payloadSchema: S.Decoder<Payload>,
  payload: unknown,
  invoke: (decoded: Payload) => Effect.Effect<unknown, BoxError>
): Stream.Stream<M.Event, BoxError> =>
  Stream.unwrap(
    decodeWith(methodName, payloadSchema, payload, "request encoding").pipe(
      Effect.flatMap(invoke),
      Effect.map((value) => eventStreamFromSdkValue(methodName, value)),
      Effect.tapError(logDriverFailure("box.event_stream_failure")),
      Effect.withSpan(`box.${methodName}`, {
        attributes: {
          "box.method": methodName,
          "box.sdk.version": BOX_SDK_VERSION,
        },
      })
    )
  );

/**
 * Build hand-written Box byte/event operation groups from a SDK client.
 *
 * @example
 * ```ts
 * import { makeStreamingOperations } from "@beep/box"
 *
 * console.log(makeStreamingOperations)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeStreamingOperations = (client: unknown): BoxStreamingOperations => ({
  avatars: {
    createUserAvatar: (payload) =>
      runJsonSdkCall(
        "avatars.createUserAvatar",
        BoxCreateUserAvatarPayloadSchema,
        M.UserAvatar,
        payload,
        (decoded, signal) =>
          byteInputToReadable("avatars.createUserAvatar", decoded.requestBody.pic).pipe(
            Effect.flatMap((pic) =>
              invokeSdkPromise(client, "avatars", "createUserAvatar", "avatars.createUserAvatar", [
                decoded.userId,
                { ...decoded.requestBody, pic },
                mergeCancellation(decoded.optionalsInput, signal),
              ])
            )
          )
      ),
    getUserAvatar: (payload) =>
      runByteStreamSdkCall("avatars.getUserAvatar", BoxGetUserAvatarPayloadSchema, payload, (decoded, signal) =>
        invokeSdkPromise(client, "avatars", "getUserAvatar", "avatars.getUserAvatar", [
          decoded.userId,
          mergeCancellation(decoded.optionalsInput, signal),
        ])
      ),
  },
  chunkedUploads: {
    reducer: (payload) =>
      runJsonSdkCall(
        "chunkedUploads.reducer",
        BoxChunkedUploadReducerPayloadSchema,
        BoxPartAccumulatorSchema,
        payload,
        (decoded) =>
          byteInputToReadable("chunkedUploads.reducer", decoded.chunk).pipe(
            Effect.flatMap((chunk) =>
              invokeSdkPromise(client, "chunkedUploads", "reducer", "chunkedUploads.reducer", [decoded.acc, chunk])
            )
          )
      ),
    uploadBigFile: (payload) =>
      runJsonSdkCall(
        "chunkedUploads.uploadBigFile",
        BoxUploadBigFilePayloadSchema,
        M.FileFull,
        payload,
        (decoded, signal) =>
          byteInputToReadable("chunkedUploads.uploadBigFile", decoded.file).pipe(
            Effect.flatMap((file) =>
              invokeSdkPromise(client, "chunkedUploads", "uploadBigFile", "chunkedUploads.uploadBigFile", [
                file,
                decoded.fileName,
                decoded.fileSize,
                decoded.parentFolderId,
                signal,
              ])
            )
          )
      ),
    uploadFilePart: (payload) =>
      runJsonSdkCall(
        "chunkedUploads.uploadFilePart",
        BoxUploadFilePartPayloadSchema,
        M.UploadedPart,
        payload,
        (decoded, signal) =>
          byteInputToReadable("chunkedUploads.uploadFilePart", decoded.requestBody).pipe(
            Effect.flatMap((requestBody) =>
              invokeSdkPromise(client, "chunkedUploads", "uploadFilePart", "chunkedUploads.uploadFilePart", [
                decoded.uploadSessionId,
                requestBody,
                decoded.headersInput,
                mergeCancellation(decoded.optionalsInput, signal),
              ])
            )
          )
      ),
    uploadFilePartByUrl: (payload) =>
      runJsonSdkCall(
        "chunkedUploads.uploadFilePartByUrl",
        BoxUploadFilePartByUrlPayloadSchema,
        M.UploadedPart,
        payload,
        (decoded, signal) =>
          byteInputToReadable("chunkedUploads.uploadFilePartByUrl", decoded.requestBody).pipe(
            Effect.flatMap((requestBody) =>
              invokeSdkPromise(client, "chunkedUploads", "uploadFilePartByUrl", "chunkedUploads.uploadFilePartByUrl", [
                decoded.url,
                requestBody,
                decoded.headersInput,
                mergeCancellation(decoded.optionalsInput, signal),
              ])
            )
          )
      ),
  },
  downloads: {
    downloadFile: (payload) =>
      runByteStreamSdkCall("downloads.downloadFile", BoxDownloadFilePayloadSchema, payload, (decoded, signal) =>
        invokeSdkPromise(client, "downloads", "downloadFile", "downloads.downloadFile", [
          decoded.fileId,
          mergeCancellation(decoded.optionalsInput, signal),
        ])
      ),
  },
  events: {
    getEventStream: (payload) =>
      runEventStreamSdkCall("events.getEventStream", BoxGetEventStreamPayloadSchema, payload, (decoded) =>
        invokeSdkSync(client, "events", "getEventStream", "events.getEventStream", [
          decoded.queryParams,
          decoded.headersInput,
        ])
      ),
  },
  files: {
    getFileThumbnailById: (payload) =>
      runByteStreamSdkCall(
        "files.getFileThumbnailById",
        BoxGetFileThumbnailByIdPayloadSchema,
        payload,
        (decoded, signal) =>
          invokeSdkPromise(client, "files", "getFileThumbnailById", "files.getFileThumbnailById", [
            decoded.fileId,
            decoded.extension,
            mergeCancellation(decoded.optionalsInput, signal),
          ])
      ),
  },
  uploads: {
    uploadFile: (payload) =>
      runJsonSdkCall("uploads.uploadFile", BoxUploadFilePayloadSchema, M.Files, payload, (decoded, signal) =>
        byteInputToReadable("uploads.uploadFile", decoded.requestBody.file).pipe(
          Effect.flatMap((file) =>
            invokeSdkPromise(client, "uploads", "uploadFile", "uploads.uploadFile", [
              { ...decoded.requestBody, file },
              mergeCancellation(decoded.optionalsInput, signal),
            ])
          )
        )
      ),
    uploadFileVersion: (payload) =>
      runJsonSdkCall(
        "uploads.uploadFileVersion",
        BoxUploadFileVersionPayloadSchema,
        M.Files,
        payload,
        (decoded, signal) =>
          byteInputToReadable("uploads.uploadFileVersion", decoded.requestBody.file).pipe(
            Effect.flatMap((file) =>
              invokeSdkPromise(client, "uploads", "uploadFileVersion", "uploads.uploadFileVersion", [
                decoded.fileId,
                { ...decoded.requestBody, file },
                mergeCancellation(decoded.optionalsInput, signal),
              ])
            )
          )
      ),
    uploadWithPreflightCheck: (payload) =>
      runJsonSdkCall(
        "uploads.uploadWithPreflightCheck",
        BoxUploadWithPreflightCheckPayloadSchema,
        M.Files,
        payload,
        (decoded, signal) =>
          byteInputToReadable("uploads.uploadWithPreflightCheck", decoded.requestBody.file).pipe(
            Effect.flatMap((file) =>
              invokeSdkPromise(client, "uploads", "uploadWithPreflightCheck", "uploads.uploadWithPreflightCheck", [
                { ...decoded.requestBody, file },
                mergeCancellation(decoded.optionalsInput, signal),
              ])
            )
          )
      ),
  },
  zipDownloads: {
    downloadZip: (payload) =>
      runByteStreamSdkCall("zipDownloads.downloadZip", BoxDownloadZipPayloadSchema, payload, (decoded, signal) =>
        invokeSdkPromise(client, "zipDownloads", "downloadZip", "zipDownloads.downloadZip", [
          decoded.requestBody,
          mergeCancellation(decoded.optionalsInput, signal),
        ])
      ),
    getZipDownloadContent: (payload) =>
      runByteStreamSdkCall(
        "zipDownloads.getZipDownloadContent",
        BoxGetZipDownloadContentPayloadSchema,
        payload,
        (decoded, signal) =>
          invokeSdkPromise(client, "zipDownloads", "getZipDownloadContent", "zipDownloads.getZipDownloadContent", [
            decoded.downloadUrl,
            mergeCancellation(decoded.optionalsInput, signal),
          ])
      ),
  },
});
