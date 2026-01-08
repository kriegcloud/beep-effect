import { $WebId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { ApiErrorResponse, PresignedUrlResponse } from "./UploadModels";

const $I = $WebId.create("features/upload/requestPresignedUrls");

/**
 * Error that can occur when requesting presigned URLs
 */
export class PresignedUrlError extends Data.TaggedError($I`PresignedUrlError`)<{
  readonly message: string;
  readonly code: string;
  readonly cause?: unknown;
}> {}

/**
 * Input for requesting presigned URLs
 */
export interface RequestPresignedUrlsInput {
  readonly files: ReadonlyArray<{
    readonly name: string;
    readonly size: number;
    readonly type: string;
    readonly lastModified?: undefined | number;
  }>;
  readonly input?: unknown; // Custom metadata
}

/**
 * Request presigned URLs from the server for file uploads.
 *
 * @param input - Files metadata and optional custom input
 * @returns Effect with presigned URL response or error
 */
export const requestPresignedUrls = Effect.fn("requestPresignedUrls")(function* (input: RequestPresignedUrlsInput) {
  // Build request body matching UploadActionPayload schema
  const requestBody = {
    files: A.map(input.files, (f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      ...(f.lastModified !== undefined ? { lastModified: f.lastModified } : {}),
    })),
    input: input.input ?? {},
  };

  // Make API request
  const response = yield* Effect.tryPromise({
    try: async () => {
      return await fetch("/api/v1/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify(requestBody),
      });
    },
    catch: (error) =>
      new PresignedUrlError({
        code: "NETWORK_ERROR",
        message: "Failed to request presigned URLs",
        cause: error,
      }),
  });

  // Parse response body
  const body = yield* Effect.tryPromise({
    try: () => response.json(),
    catch: (error) =>
      new PresignedUrlError({
        code: "PARSE_ERROR",
        message: "Failed to parse presigned URL response",
        cause: error,
      }),
  });

  // Handle error responses
  if (!response.ok) {
    // Try to parse as error response
    const errorResult = yield* S.decodeUnknown(ApiErrorResponse)(body).pipe(
      Effect.map(
        (err) =>
          new PresignedUrlError({
            code: err.error.code,
            message: err.error.message,
          })
      ),
      Effect.orElse(() =>
        Effect.succeed(
          new PresignedUrlError({
            code: "API_ERROR",
            message: `API returned status ${response.status}`,
          })
        )
      )
    );

    return yield* Effect.fail(errorResult);
  }

  // Parse successful response
  return yield* S.decodeUnknown(PresignedUrlResponse)(body).pipe(
    Effect.mapError(
      (error) =>
        new PresignedUrlError({
          code: "VALIDATION_ERROR",
          message: "Invalid presigned URL response format",
          cause: error,
        })
    )
  );
});

/**
 * Type-safe accessor for the result type
 */
export type PresignedUrlResult = S.Schema.Type<typeof PresignedUrlResponse>;
