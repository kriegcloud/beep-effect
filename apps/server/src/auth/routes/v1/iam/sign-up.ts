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
import { type SignUpPayload, SignUpSuccess } from "../../../api/sign-up";
import { AuthError } from "../../../shared";

const signUpHandler = Effect.fn("signUp")(function* (payload: SignUpPayload) {
  const { auth } = yield* AuthService;
  const request = yield* HttpServerRequest.HttpServerRequest;
  return yield* F.pipe(
    Effect.Do,
    Effect.bind("result", () =>
      Effect.tryPromise(() =>
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
      )
    ),
    Effect.bindAll(({ result }) => ({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(SignUpSuccess)(result.response),
    }))
  );
});

const signUp = Effect.fn("signUp")(function* ({ payload }: { readonly payload: SignUpPayload }) {
  const { headers, response } = yield* signUpHandler(payload);

  const setCookie = headers.get("set-cookie");

  return yield* HttpServerResponse.json(response).pipe(
    Effect.map((jsonResponse) =>
      setCookie ? F.pipe(jsonResponse, HttpServerResponse.setHeader("set-cookie", setCookie)) : jsonResponse
    )
  );
}, AuthError.flowMap("sign-up"));

export const SignUpRoutes = HttpApiBuilder.group(DomainApi, "signUp", (h) => h.handle("email", signUp));
