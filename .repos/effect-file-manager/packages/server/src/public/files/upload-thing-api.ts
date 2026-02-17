import { EnvVars } from "@/lib/env-vars";
import { withResponseErrorLogging } from "@/lib/with-response-error-logging";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpBody from "@effect/platform/HttpBody";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import { Policy } from "@example/domain";
import { FolderId, MAX_FILE_SIZE_MB } from "@example/domain/api/files/files-rpc";
import { UserId } from "@example/domain/policy";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";

export class UploadMetadata extends Schema.Class<UploadMetadata>("UploadMetadata")({
  userId: UserId,
  folderId: Schema.NullOr(FolderId),
}) {}

const PrepareUploadResponse = Schema.Struct({
  key: Schema.String,
  url: Schema.String,
  fields: Schema.Record({ key: Schema.String, value: Schema.String }),
});

export class UploadThingApi extends Effect.Service<UploadThingApi>()(
  "@example/server/public/files/upload-thing-api/UploadThingApi",
  {
    dependencies: [FetchHttpClient.layer, EnvVars.Default],
    effect: Effect.gen(function* () {
      const envVars = yield* EnvVars;
      const httpClient = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest((req) =>
          req.pipe(
            HttpClientRequest.prependUrl("https://api.uploadthing.com/v6"),
            HttpClientRequest.setHeader(
              "X-Uploadthing-Api-Key",
              Redacted.value(envVars.UPLOADTHING_SECRET),
            ),
          ),
        ),
        HttpClient.filterStatusOk,
        withResponseErrorLogging,
        HttpClient.retryTransient({
          times: 3,
          schedule: Schedule.exponential("250 millis", 1.5),
        }),
      );

      return {
        initiateUpload: (payload: {
          readonly fileName: string;
          readonly fileSize: number;
          readonly mimeType: string;
          readonly folderId: FolderId | null;
        }) =>
          Effect.gen(function* () {
            const currentUser = yield* Policy.CurrentUser;
            return yield* httpClient
              .post("/prepareUpload", {
                body: HttpBody.unsafeJson({
                  files: [{ name: payload.fileName, size: payload.fileSize }],
                  callbackUrl: `${envVars.API_URL}/uploadThingCallback`,
                  callbackSlug: "upload",
                  routeConfig: {
                    image: {
                      maxFileSize: `${MAX_FILE_SIZE_MB}MB`,
                      maxFileCount: 1,
                    },
                  },
                  metadata: new UploadMetadata({
                    userId: currentUser.userId,
                    folderId: payload.folderId,
                  }),
                }),
              })
              .pipe(
                Effect.flatMap(
                  HttpClientResponse.schemaBodyJson(Schema.Tuple(PrepareUploadResponse)),
                ),
                Effect.map(([file]) => file),
                Effect.tapErrorTag("ParseError", (e) =>
                  Effect.logError("UploadThing response parse failed", e.issue.actual),
                ),
                Effect.orDie,
                Effect.withSpan("UploadThingApi.initiateUpload"),
              );
          }),

        deleteFiles: (fileKeys: string[]) =>
          httpClient
            .post("/deleteFiles", {
              body: HttpBody.unsafeJson({
                fileKeys,
              }),
            })
            .pipe(Effect.orDie, Effect.withSpan("UploadThingApi.deleteFiles")),
      };
    }),
  },
) {}
