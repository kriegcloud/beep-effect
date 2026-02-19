import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { ApiErrorResponse, UploadCallbackResponse } from "./UploadModels";

/**
 * Error that can occur when completing an upload
 */
export class CompleteUploadError extends Data.TaggedError("CompleteUploadError")<{
  readonly message: string;
  readonly code: string;
  readonly fileId?: string;
  readonly cause?: unknown;
}> {}

/**
 * Input for completing a file upload
 */
export interface CompleteUploadInput {
  readonly fileId: string;
  readonly key: string;
  readonly fileHash: string;
  readonly signature: string;
}

/**
 * Complete a file upload by notifying the server.
 *
 * This is called after the file has been successfully uploaded to S3.
 * The server will update the file status and persist the record.
 *
 * @param input - File ID, key, hash, and signature for verification
 * @returns Effect with callback response or error
 */
export const completeUpload = Effect.fn("completeUpload")(function* (input: CompleteUploadInput) {
  const requestBody = {
    fileId: input.fileId,
    key: input.key,
    fileHash: input.fileHash,
  };

  // Make API request
  const response = yield* Effect.tryPromise({
    try: async () => {
      return await fetch("/api/v1/files/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-beep-signature": input.signature,
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify(requestBody),
      });
    },
    catch: (error) =>
      new CompleteUploadError({
        code: "NETWORK_ERROR",
        message: "Failed to complete upload",
        fileId: input.fileId,
        cause: error,
      }),
  });

  // Parse response body
  const body = yield* Effect.tryPromise({
    try: () => response.json(),
    catch: (error) =>
      new CompleteUploadError({
        code: "PARSE_ERROR",
        message: "Failed to parse callback response",
        fileId: input.fileId,
        cause: error,
      }),
  });

  // Handle error responses
  if (!response.ok) {
    // Try to parse as error response
    const errorResult = yield* S.decodeUnknown(ApiErrorResponse)(body).pipe(
      Effect.map(
        (err) =>
          new CompleteUploadError({
            code: err.error.code,
            message: err.error.message,
            fileId: input.fileId,
          })
      ),
      Effect.orElse(() =>
        Effect.succeed(
          new CompleteUploadError({
            code: "API_ERROR",
            message: `API returned status ${response.status}`,
            fileId: input.fileId,
          })
        )
      )
    );

    return yield* Effect.fail(errorResult);
  }

  // Parse successful response
  return yield* S.decodeUnknown(UploadCallbackResponse)(body).pipe(
    Effect.mapError(
      (error) =>
        new CompleteUploadError({
          code: "VALIDATION_ERROR",
          message: "Invalid callback response format",
          fileId: input.fileId,
          cause: error,
        })
    )
  );
});

/**
 * Type-safe accessor for the result type
 */
export type CompleteUploadResult = S.Schema.Type<typeof UploadCallbackResponse>;
