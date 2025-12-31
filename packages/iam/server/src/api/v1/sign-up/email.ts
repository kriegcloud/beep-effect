import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { Common } from "../../common";
import { forwardCookieResponse } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignUp.Email.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignUpEmailHandler")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Manual body transformation required for Redacted fields
  const { headers, response } = yield* F.pipe(
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
    ),
    Effect.flatMap((result) =>
      Effect.all({
        headers: Effect.succeed(result.headers),
        // Decode to validate, then encode back for JSON serialization
        response: S.decodeUnknown(V1.SignUp.Email.Success)(result.response).pipe(
          Effect.flatMap(S.encode(V1.SignUp.Email.Success))
        ),
      })
    )
  );

  return yield* forwardCookieResponse(headers, response);
}, IamAuthError.flowMap("sign-up"));
