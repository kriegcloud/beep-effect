import { serverEnv } from "@beep/core-env/server";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { runServerPromise } from "@beep/runtime-server";
import { FileStatus } from "@beep/shared-domain/entities/File/schemas";
import { verifySignature } from "@beep/shared-infra/internal/upload/crypto";
import { UploadError } from "@beep/shared-infra/internal/upload/error";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

/**
 * Schema for callback payload
 */
const UploadCallbackPayload = S.Struct({
  fileId: S.String,
  key: S.String,
  fileHash: S.String,
});

/**
 * POST /api/v1/files/callback
 * Handle upload completion callback
 *
 * NOTE: This is a POC implementation. In production, this would:
 * 1. Update the file record status in the database
 * 2. Trigger any post-upload workflows (thumbnails, virus scanning, etc.)
 * 3. Emit domain events for downstream consumers
 */
export async function POST(request: Request) {
  const effect = Effect.gen(function* () {
    // 1. Verify authentication
    const { auth } = yield* AuthService;

    const session = yield* Effect.tryPromise({
      try: async () => {
        const result = await auth.api.getSession({
          headers: request.headers,
        });
        return O.fromNullable(result);
      },
      catch: () =>
        new UploadError({
          code: "UNAUTHORIZED",
          message: "Failed to retrieve session",
        }),
    });

    if (O.isNone(session)) {
      return yield* Effect.fail(
        new UploadError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        })
      );
    }

    // 2. Verify signature
    const signatureHeader = request.headers.get("x-beep-signature");
    if (!signatureHeader) {
      return yield* Effect.fail(
        new UploadError({
          code: "BAD_REQUEST",
          message: "Missing signature header",
        })
      );
    }

    const signingSecret = Redacted.make(
      serverEnv.auth.secret ? Redacted.value(serverEnv.auth.secret) : "default-dev-secret"
    );

    // 3. Parse request body
    const bodyText = yield* Effect.tryPromise({
      try: () => request.text(),
      catch: () =>
        new UploadError({
          code: "PARSE_ERROR",
          message: "Failed to read request body",
        }),
    });

    const isValid = yield* verifySignature(bodyText, signatureHeader, signingSecret);
    if (!isValid) {
      return yield* Effect.fail(
        new UploadError({
          code: "FORBIDDEN",
          message: "Invalid signature",
        })
      );
    }

    // 4. Decode the body
    const body = yield* Effect.try({
      try: () => JSON.parse(bodyText),
      catch: () =>
        new UploadError({
          code: "PARSE_ERROR",
          message: "Invalid JSON body",
        }),
    });

    const payload = yield* S.decodeUnknown(UploadCallbackPayload)(body).pipe(
      Effect.mapError(
        (error) =>
          new UploadError({
            code: "VALIDATION_ERROR",
            message: `Invalid payload: ${error.message}`,
            cause: error,
          })
      )
    );

    // 5. Log the successful upload completion
    // NOTE: In production, this would update the file record in the database
    // For POC, we simply acknowledge the callback and return success
    yield* Effect.logInfo("Upload callback received", {
      fileId: payload.fileId,
      key: payload.key,
      fileHash: payload.fileHash,
    });

    return {
      success: true,
      fileId: payload.fileId,
      status: FileStatus.Enum.READY,
      message: "Upload completed successfully",
    };
  });

  try {
    const result = await runServerPromise(effect, "UploadCallbackRoute.POST");
    return Response.json(result);
  } catch (error) {
    // Handle tagged errors
    if (error && typeof error === "object" && "_tag" in error) {
      const taggedError = error as { _tag: string; code?: string; message?: string };

      const statusCode =
        taggedError.code === "UNAUTHORIZED"
          ? 401
          : taggedError.code === "FORBIDDEN"
            ? 403
            : taggedError.code === "VALIDATION_ERROR" ||
                taggedError.code === "PARSE_ERROR" ||
                taggedError.code === "BAD_REQUEST"
              ? 400
              : 500;

      return Response.json(
        {
          error: {
            _tag: taggedError._tag,
            code: taggedError.code ?? "SERVER_ERROR",
            message: taggedError.message ?? "An unexpected error occurred",
          },
        },
        { status: statusCode }
      );
    }

    return Response.json(
      {
        error: {
          _tag: "UploadError",
          code: "SERVER_ERROR",
          message: String(error),
        },
      },
      { status: 500 }
    );
  }
}
