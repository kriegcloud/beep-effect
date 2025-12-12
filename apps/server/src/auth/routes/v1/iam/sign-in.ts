import { AuthService } from "@beep/runtime-server/rpcs/AuthLive";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { DomainApi } from "../../../../DomainApi.ts";
import { type SignInContract, SignInSuccess } from "../../../api/sign-in";
import { AuthError } from "../../../shared";

const signInHandler = Effect.fn("signIn")(function* (payload: typeof SignInContract.payloadSchema.Type) {
  const { auth } = yield* AuthService;
  const request = yield* HttpServerRequest.HttpServerRequest;
  return yield* F.pipe(
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
    Effect.bindAll(({ result }) => ({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(SignInSuccess)(result.response),
    }))
  );
});

const signIn = Effect.fn("signIn")(function* ({
  payload,
}: {
  readonly payload: typeof SignInContract.payloadSchema.Type;
}) {
  const { headers, response } = yield* signInHandler(payload);

  const setCookie = headers.get("set-cookie");

  return yield* HttpServerResponse.json(response).pipe(
    Effect.map((jsonResponse) =>
      setCookie ? F.pipe(jsonResponse, HttpServerResponse.setHeader("set-cookie", setCookie)) : jsonResponse
    )
  );
}, AuthError.flowMap("sign-in"));

export const SignInRoutes = HttpApiBuilder.group(DomainApi, "signIn", (h) => h.handle("email", signIn));
