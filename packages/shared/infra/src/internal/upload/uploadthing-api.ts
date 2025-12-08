import { EnvValue } from "@beep/constants";
import { withResponseErrorLogging } from "@beep/errors/server";
import { $SharedInfraId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { AnyEntityId, EntityKind, SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import { OrganizationType } from "@beep/shared-domain/entities/Organization";
import * as Policy from "@beep/shared-domain/Policy";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpBody from "@effect/platform/HttpBody";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import { Effect, Redacted, Schedule } from "effect";
import type * as A from "effect/Array";
import * as S from "effect/Schema";
import { serverEnv } from "../../ServerEnv.ts";

const $I = $SharedInfraId.create("upload/uploadthing-service");

export class UploadMetadata extends S.Class<UploadMetadata>($I`UploadMetadata`)(
  {
    env: EnvValue,
    fileId: SharedEntityIds.FileId,
    entityKind: EntityKind,
    organizationType: OrganizationType,
    organizationId: SharedEntityIds.OrganizationId,
    entityIdentifier: AnyEntityId,
    entityAttribute: S.NonEmptyTrimmedString,
    fileItemExtension: BS.FileExtension,
    userId: SharedEntityIds.UserId,
  },
  $I.annotations("UploadMetadata", {
    description: "Metadata for an upload",
  })
) {}

export class PrepareUploadResponse extends S.Class<PrepareUploadResponse>($I`PrepareUploadResponse`)(
  {
    key: File.UploadPath,
    url: BS.URLString,
    fields: S.Record({ key: S.String, value: S.String }),
  },
  $I.annotations("PrepareUploadResponse", {
    description: "Response from prepareUpload",
  })
) {}

export class UploadThingApi extends Effect.Service<UploadThingApi>()($I`UploadThingApi`, {
  dependencies: [FetchHttpClient.layer],
  effect: Effect.gen(function* () {
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest((req) =>
        req.pipe(
          HttpClientRequest.prependUrl("https://api.uploadthing.com/v6"),
          HttpClientRequest.setHeader("X-Uploadthing-Api-Key", Redacted.value(serverEnv.upload.secret))
        )
      ),
      HttpClient.filterStatusOk,
      withResponseErrorLogging,
      HttpClient.retryTransient({
        times: 3,
        schedule: Schedule.exponential("250 millis", 1.5),
      })
    );

    return {
      initiateUpload: (payload: {
        readonly fileName: string;
        readonly fileSize: number;
        readonly mimeType: BS.MimeType.Type;
        readonly entityKind: EntityKind.Type;
        readonly entityIdentifier: AnyEntityId.Type;
        readonly entityAttribute: string;
        readonly fileItemExtension: BS.FileExtension.Type;
      }) =>
        Effect.gen(function* () {
          const authCtx = yield* Policy.AuthContext;

          const organizationId = authCtx.session.activeOrganizationId;
          const organizationType = authCtx.organization.type;
          return yield* httpClient
            .post("/prepareUpload", {
              body: HttpBody.unsafeJson({
                files: [{ name: payload.fileName, size: payload.fileSize }],
                callbackUrl: `${serverEnv.app.apiUrl}/uploadThingCallback`,
                callbackSlug: "upload",
                routeConfig: {
                  image: {
                    maxFileSize: `${File.MAX_FILE_SIZE_MB}MB`,
                    maxFileCount: 1,
                  },
                },
                metadata: new UploadMetadata({
                  env: serverEnv.app.env,
                  fileId: SharedEntityIds.FileId.create(),
                  entityKind: payload.entityKind,
                  entityIdentifier: payload.entityIdentifier,
                  entityAttribute: payload.entityAttribute,
                  fileItemExtension: payload.fileItemExtension,
                  organizationType,
                  organizationId,
                  userId: authCtx.user.id,
                }),
              }),
            })
            .pipe(
              Effect.flatMap(HttpClientResponse.schemaBodyJson(S.Tuple(PrepareUploadResponse))),
              Effect.map(([file]) => file),
              Effect.tapErrorTag("ParseError", (e) =>
                Effect.logError("UploadThing response parse failed", e.issue.actual)
              ),
              Effect.orDie,
              Effect.withSpan("UploadThingApi.initiateUpload")
            );
        }),
      deleteFiles: (fileKeys: A.NonEmptyReadonlyArray<File.UploadPath.Type>) =>
        httpClient
          .post("/deleteFiles", {
            body: HttpBody.unsafeJson({
              fileKeys,
            }),
          })
          .pipe(Effect.orDie, Effect.withSpan("UploadThingApi.deleteFiles")),
    };
  }),
}) {}
