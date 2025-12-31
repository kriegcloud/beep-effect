import {IamAuthError, V1} from "@beep/iam-domain/api";
import {Auth} from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type {Common} from "../../common";
import {runAuthEndpoint} from "../../common/schema-helpers";
import * as S from "effect/Schema";
type HandlerEffect = Common.HandlerEffect<V1.SignIn.Email.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignInEmail")(function* ({payload}) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;
  return yield* runAuthEndpoint({
    payloadSchema: V1.SignIn.Email.Payload,
    successSchema: V1.SignIn.Email.Success,
    payload,
    headers: request.headers,
    authHandler: ({body, headers}) =>
      Effect.tryPromise(() =>
        auth.api.signInEmail({
          body,
          headers,
          returnHeaders: true,
        })
      ).pipe(Effect.flatMap(({headers, response}) => Effect.all({
        headers: Effect.succeed(headers),
        response: S.decodeUnknown(V1.SignIn.Email.Success)(response)
      }))),
  });
}, IamAuthError.flowMap("sign-in"));
