import {
  AuthService
} from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import {IamAuthError, SignIn} from "@beep/iam-domain";



type HandlerEffect = (args: { readonly payload: SignIn.Email.Payload }) => Effect.Effect<HttpServerResponse.HttpServerResponse, IamAuthError, AuthService | HttpServerRequest.HttpServerRequest>

export const Handler: HandlerEffect = Effect.fn("SignInEmail")(function* ({payload}) {
  const {auth} = yield* AuthService;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const {headers, response} = yield* F.pipe(
    Effect.Do,
    Effect.bind("result", () =>
      Effect.tryPromise(() =>
        auth.api.signInEmail({
          body: {
            email: Redacted.value(payload.email),
            password: Redacted.value(payload.password),
            rememberMe: payload.rememberMe,
            callbackURL: F.pipe(payload.callbackURL, O.getOrElse(F.constUndefined)),
          },
          headers: request.headers,
          returnHeaders: true,
        })
      )
    ),
    Effect.bindAll(({result}) => ({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(SignIn.Email.Success)(result.response),
    }))
  );

  const setCookie = headers.get("set-cookie");

  return yield* F.pipe(
    response,
    HttpServerResponse.json,
    Effect.map((jsonResponse) =>
      setCookie
        ? F.pipe(jsonResponse, HttpServerResponse.setHeader("set-cookie", setCookie))
        : jsonResponse)
  );
}, IamAuthError.flowMap("sign-in"));


