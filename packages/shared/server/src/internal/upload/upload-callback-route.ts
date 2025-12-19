import crypto from "node:crypto";
import { $SharedInfraId } from "@beep/identity/packages";
import { File } from "@beep/shared-domain/entities";
import { EventStreamHub } from "@beep/shared-server/api/public/event-stream/event-stream-hub";
import { FileRepo } from "@beep/shared-server/repos";
import { serverEnv } from "@beep/shared-server/ServerEnv";
import type * as Headers from "@effect/platform/Headers";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const $I = $SharedInfraId.create("internal/upload/upload-callback-route");

export class CallbackPayload extends S.Class<CallbackPayload>($I`CallbackPayload`)({
  status: S.Literal("uploaded"),
  ...File.Model.insert.fields,
}) {}

const decodeHeaders = (headers: Headers.Headers) =>
  S.decodeUnknown(
    S.Struct({
      "upload-hook": S.String,
      "x-upload-signature": S.String,
    }).pipe(
      S.rename({
        "upload-hook": "uploadHook",
        "x-upload-signature": "uploadSignature",
      })
    )
  )(headers);

export const UploadCallbackRoute = HttpLayerRouter.use(
  Effect.fnUntraced(function* (router) {
    const fileRepo = yield* FileRepo;
    const eventStreamHub = yield* EventStreamHub;

    yield* router.add(
      "POST",
      "/upload-callback",
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const headers = yield* decodeHeaders(request.headers);
        const text = yield* request.text;

        const computedHash = crypto
          .createHmac("sha256", Redacted.value(serverEnv.cloud.aws.secretAccessKey))
          .update(text)
          .digest("hex");

        const expectedSignature = `hmac-sha256=${computedHash}`;

        const isValid = yield* Effect.try(() =>
          crypto.timingSafeEqual(Buffer.from(headers.uploadSignature), Buffer.from(expectedSignature))
        ).pipe(Effect.orElseSucceed(F.constFalse));

        if (!isValid) return yield* Effect.dieMessage("Invalid signature");

        const { status, ...fileInsertData } = yield* S.decodeUnknown(CallbackPayload)(yield* request.json);

        const file = yield* fileRepo.insert(fileInsertData);

        yield* eventStreamHub.notifyUser(fileInsertData.userId, {
          _tag: "Files.Uploaded",
          file,
        });

        return yield* HttpServerResponse.text("OK");
      }).pipe(Effect.orDie, Effect.withSpan("UploadCallback"))
    );
  })
).pipe(Layer.provide([FileRepo.Default, EventStreamHub.Default]));
