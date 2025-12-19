import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<undefined>;

export const Handler: HandlerEffect = Effect.fn("GenerateRegisterOptions")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Call Better Auth - passkey endpoints don't support returnHeaders
    const result = yield* Effect.tryPromise(() =>
      auth.api.generatePasskeyRegistrationOptions({
        headers: request.headers,
      })
    );

    // Decode response and return
    const decoded = yield* S.decodeUnknown(V1.Passkey.GenerateRegisterOptions.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to generate register options.",
        cause: e,
      })
  )
);
