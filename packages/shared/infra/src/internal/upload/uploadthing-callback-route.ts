import crypto from "node:crypto";
import { $SharedInfraId } from "@beep/identity/packages";
import { File } from "@beep/shared-domain/entities";
import type * as Headers from "@effect/platform/Headers";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
// import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { EventStreamHub } from "../../EventStreamHub.ts";
import { FileRepo } from "../../repos/File.repo.ts";
import { serverEnv } from "../../ServerEnv.ts";
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
        const fileRepo = yield* FileRepo;
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

        const inserted = yield* fileRepo.insert({
          id: payload.metadata.fileId,
          key: payload.file.key,
          url: payload.file.url,
          organizationId: payload.metadata.organizationId,
          createdBy: payload.metadata.userId,
          deletedAt: O.none(),
          updatedBy: payload.metadata.userId,
          source: O.some("uploadthing"),
          deletedBy: O.none(),
        });

        yield* eventStreamHub.notifyUser(payload.metadata.userId, {
          _tag: "File.Uploaded",
          file: inserted,
        });

        return yield* HttpServerResponse.text("OK");
      }).pipe(Effect.orDie, Effect.withSpan("UploadThingCallbackRoute"))
    );
  })
);
