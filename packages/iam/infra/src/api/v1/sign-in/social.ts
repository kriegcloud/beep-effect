import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.Social.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignInSocial")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.SignIn.Social.Payload,
    successSchema: V1.SignIn.Social.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.signInSocial({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("sign-in"));
