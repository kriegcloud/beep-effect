import crypto from "node:crypto";
import { $SharedInfraId } from "@beep/identity/packages";
import { File } from "@beep/shared-domain/entities";
import type * as Headers from "@effect/platform/Headers";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
// import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
// import { SharedEntityIds } from "@beep/shared-domain"
import * as S from "effect/Schema";
import { EventStreamHub } from "../../EventStreamHub.ts";
import { serverEnv } from "../../ServerEnv.ts";
// import { FilesRepo } from "./files-repo";
import * as UploadThingApi from "./uploadthing-api";

const $I = $SharedInfraId.create("upload/uploadthing-callback-route");

export class CallbackPayload extends S.Class<CallbackPayload>($I`CallbackPayload`)({
  status: S.Literal("uploaded"),
  metadata: UploadThingApi.UploadMetadata,
  file: File.Model.insert,
}) {}

const decodeHeaders = F.flow(
  (headers: Headers.Headers) => headers,
  S.decodeUnknown(
    S.Struct({
      "uploadthing-hook": S.String,
      "x-uploadthing-signature": S.String,
    }).pipe(
      S.rename({
        "uploadthing-hook": "uploadthingHook",
        "x-uploadthing-signature": "uploadthingSignature",
      })
    )
  )
);

export const UploadThingCallbackRoute = HttpLayerRouter.use(
  Effect.fnUntraced(function* (router) {
    const eventStreamHub = yield* EventStreamHub;

    yield* Effect.logInfo(eventStreamHub);
    yield* router.add(
      "POST",
      "/uploadThingCallback",
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        const headers = yield* decodeHeaders(request.headers);
        const text = yield* request.text;

        const computedHash = crypto
          .createHmac("sha256", Redacted.value(serverEnv.upload.secret))
          .update(text)
          .digest("hex");

        const expectedSignature = `hmac-sha256=${computedHash}`;

        const isValid = yield* Effect.try(() =>
          crypto.timingSafeEqual(Buffer.from(headers.uploadthingSignature), Buffer.from(expectedSignature))
        ).pipe(Effect.orElseSucceed(F.constFalse));
        if (!isValid) return yield* Effect.dieMessage("Invalid signature");

        const payload = yield* S.decodeUnknown(CallbackPayload)(yield* request.json);

        yield* Effect.logInfo(payload);

        // const uploadPath = yield* S.decode(File.UploadPath)({
        //   env: serverEnv.app.env,
        //   fileId: SharedEntityIds.FileId.create(),
        //   organizationType:
        // })

        // yield* eventStreamHub.notifyUser(payload.metadata.userId, {
        //   _tag: "File.Uploaded",
        //   // file: payload.file,
        // });

        return yield* HttpServerResponse.text("OK");
      }).pipe(Effect.orDie, Effect.withSpan("UploadThingCallbackRoute"))
    );
  })
);
