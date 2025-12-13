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
import {IamAuthError, SignUp} from "@beep/iam-domain";


type HandlerEffect = (args: {
  readonly payload: SignUp.Email.Payload
}) => Effect.Effect<HttpServerResponse.HttpServerResponse, IamAuthError, AuthService | HttpServerRequest.HttpServerRequest>

export const Handler: HandlerEffect = Effect.fn("SignUpEmailHandler")(function* ({payload}) {
  const {auth} = yield* AuthService;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const {headers, response} = yield* F.pipe(
    Effect.Do,
    Effect.bind("result", () => Effect.tryPromise(() =>
      auth.api.signUpEmail({
        body: {
          email: Redacted.value(payload.email),
          password: Redacted.value(payload.password),
          name: payload.name,
          rememberMe: payload.rememberMe,
          image: F.pipe(payload.image, O.getOrElse(F.constUndefined)),
          callbackURL: F.pipe(payload.callbackURL, O.getOrElse(F.constUndefined)),
        },
        headers: request.headers,
        returnHeaders: true,
      })
    )),
    Effect.bindAll(({result}) => ({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(SignUp.Email.Success)(result.response),
    })));
  const setCookie = headers.get("set-cookie");

  return yield* HttpServerResponse.json(response).pipe(
    Effect.map((jsonResponse) =>
      setCookie ? F.pipe(jsonResponse, HttpServerResponse.setHeader("set-cookie", setCookie)) : jsonResponse
    )
  );
}, IamAuthError.flowMap("sign-up"));

