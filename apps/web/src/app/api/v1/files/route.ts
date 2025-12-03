import { serverEnv } from "@beep/core-env/server";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { runServerPromise } from "@beep/runtime-server";
import { BS } from "@beep/schema";
import { type AnyEntityId, type EntityKind, SharedEntityIds } from "@beep/shared-domain";
import type { File } from "@beep/shared-domain/entities";
import * as Organization from "@beep/shared-domain/entities/Organization";
import { UploadActionPayload } from "@beep/shared-infra/internal/upload/_internal/shared-schemas";
import { generateKey, signPayload } from "@beep/shared-infra/internal/upload/crypto";
import { UploadError } from "@beep/shared-infra/internal/upload/error";
import { UploadService } from "@beep/shared-infra/internal/upload/upload.service";
import { generateTraceHeaders } from "@beep/shared-infra/internal/upload/utils";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

/**
 * POST /api/v1/files
 * Request presigned URLs for file uploads
 */
export async function POST(request: Request) {
  const effect = Effect.gen(function* () {
    // 1. Get AuthService and validate session
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

    const userId = session.value.user.id;
    const activeOrganizationId = session.value.session.activeOrganizationId;

    if (!activeOrganizationId) {
      return yield* Effect.fail(
        new UploadError({
          code: "BAD_REQUEST",
          message: "No active organization. Please select an organization.",
        })
      );
    }

    // 2. Parse request body
    const body = yield* Effect.tryPromise({
      try: () => request.json(),
      catch: () =>
        new UploadError({
          code: "PARSE_ERROR",
          message: "Invalid JSON body",
        }),
    });

    const payload = yield* S.decodeUnknown(UploadActionPayload)(body).pipe(
      Effect.mapError(
        (error) =>
          new UploadError({
            code: "VALIDATION_ERROR",
            message: `Invalid payload: ${error.message}`,
            cause: error,
          })
      )
    );

    // 3. Get configuration
    const signingSecret = Redacted.make(
      serverEnv.auth.secret ? Redacted.value(serverEnv.auth.secret) : "default-dev-secret"
    );

    const env = serverEnv.app.env;

    // 4. Get upload service - provide layer locally
    const uploadService = yield* Effect.provide(UploadService, UploadService.Default);

    // 5. Generate trace headers
    const traceHeaders = generateTraceHeaders();

    // 6. Generate presigned URLs for each file
    const urls = yield* Effect.forEach(
      payload.files,
      (fileData) =>
        Effect.gen(function* () {
          // Generate file ID
          const fileId = SharedEntityIds.FileId.create();

          // Extract and validate extension
          const extensionRaw = fileData.name.split(".").pop() ?? "";
          const extension = yield* S.decodeUnknown(BS.FileExtension)(extensionRaw).pipe(
            Effect.mapError(
              () =>
                new UploadError({
                  code: "VALIDATION_ERROR",
                  message: `Unsupported file extension: ${extensionRaw}`,
                })
            )
          );

          // Build upload path data
          const uploadPathData: File.UploadPath.Encoded = {
            env,
            fileId,
            organizationType: Organization.OrganizationTypeEnum.individual,
            organizationId: SharedEntityIds.OrganizationId.make(activeOrganizationId),
            entityKind: "user" as EntityKind.Type,
            entityIdentifier: SharedEntityIds.UserId.make(userId) as AnyEntityId.Type,
            entityAttribute: "upload",
            fileItemExtension: extension,
          };

          // Get presigned URL from S3
          const presignedUrl = yield* uploadService.getPreSignedUrl(uploadPathData);

          // Generate SQID key for tracking
          const key = yield* generateKey(
            {
              name: fileData.name,
              size: fileData.size,
              type: fileData.type,
              lastModified: fileData.lastModified,
            },
            "beep-app"
          );

          return {
            url: presignedUrl,
            key,
            fileId,
            name: fileData.name,
            customId: null,
          };
        }),
      { concurrency: 5 }
    );

    // 7. Sign the response for callback verification
    const signature = yield* signPayload(JSON.stringify(urls), signingSecret);

    return {
      urls,
      traceHeaders,
      signature,
    };
  });

  try {
    const result = await runServerPromise(effect, "UploadRoute.POST");
    return Response.json(result);
  } catch (error) {
    // Handle tagged errors
    if (error && typeof error === "object" && "_tag" in error) {
      const taggedError = error as { _tag: string; code?: string; message?: string };

      const statusCode =
        taggedError.code === "UNAUTHORIZED"
          ? 401
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
