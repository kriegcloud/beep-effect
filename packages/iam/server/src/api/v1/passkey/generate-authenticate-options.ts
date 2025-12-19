import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<undefined>;

export const Handler: HandlerEffect = Effect.fn("GenerateAuthenticateOptions")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Call Better Auth - passkey endpoints don't support returnHeaders
    // Cast headers to satisfy Better Auth's type expectations
    const result = yield* Effect.tryPromise(() =>
      auth.api.generatePasskeyAuthenticationOptions({
        headers: request.headers as Record<string, string>,
      })
    );

    // Decode response and return
    const decoded = yield* S.decodeUnknown(V1.Passkey.GenerateAuthenticateOptions.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to generate authentication options.",
        cause: e,
      })
  )
);
