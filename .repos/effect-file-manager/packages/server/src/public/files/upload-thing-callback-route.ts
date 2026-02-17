import { EnvVars } from "@/lib/env-vars";
import * as Headers from "@effect/platform/Headers";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as Func from "effect/Function";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import crypto from "node:crypto";
import { EventStreamHub } from "../event-stream/event-stream-hub";
import { FilesRepo } from "./files-repo";
import * as UploadThingApi from "./upload-thing-api";

const CallbackPayload = Schema.Struct({
  status: Schema.Literal("uploaded"),
  metadata: UploadThingApi.UploadMetadata,
  file: Schema.Struct({
    url: Schema.String,
    key: Schema.String,
    name: Schema.String,
    size: Schema.Number,
    type: Schema.String,
  }),
});

const decodeHeaders = (headers: Headers.Headers) =>
  Schema.decodeUnknown(
    Schema.Struct({
      "uploadthing-hook": Schema.String,
      "x-uploadthing-signature": Schema.String,
    }).pipe(
      Schema.rename({
        "uploadthing-hook": "uploadthingHook",
        "x-uploadthing-signature": "uploadthingSignature",
      }),
    ),
  )(headers);

export const UploadThingCallbackRoute = HttpLayerRouter.use(
  Effect.fnUntraced(function* (router) {
    const repo = yield* FilesRepo;
    const envVars = yield* EnvVars;
    const eventStreamHub = yield* EventStreamHub;

    yield* router.add(
      "POST",
      "/uploadThingCallback",
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        const headers = yield* decodeHeaders(request.headers);
        const text = yield* request.text;

        const computedHash = crypto
          .createHmac("sha256", Redacted.value(envVars.UPLOADTHING_SECRET))
          .update(text)
          .digest("hex");

        const expectedSignature = `hmac-sha256=${computedHash}`;

        const isValid = yield* Effect.try(() =>
          crypto.timingSafeEqual(
            Buffer.from(headers.uploadthingSignature),
            Buffer.from(expectedSignature),
          ),
        ).pipe(Effect.orElseSucceed(Func.constFalse));

        if (!isValid) return yield* Effect.dieMessage("Invalid signature");

        const payload = yield* Schema.decodeUnknown(CallbackPayload)(yield* request.json);
        const file = yield* repo.insertFile({
          userId: payload.metadata.userId,
          folderId: payload.metadata.folderId,
          uploadthingKey: payload.file.key,
          uploadthingUrl: payload.file.url,
          name: payload.file.name,
          size: payload.file.size.toString(),
          mimeType: payload.file.type,
          uploadedByUserId: payload.metadata.userId,
        });

        yield* eventStreamHub.notifyUser(payload.metadata.userId, {
          _tag: "Files.Uploaded",
          file,
        });

        return yield* HttpServerResponse.text("OK");
      }).pipe(Effect.orDie, Effect.withSpan("UploadThingCallbackRoute")),
    );
  }),
).pipe(Layer.provide([FilesRepo.Default, EnvVars.Default, EventStreamHub.Default]));
