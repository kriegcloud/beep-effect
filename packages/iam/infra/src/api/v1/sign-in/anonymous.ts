/**
 * @fileoverview Anonymous sign-in handler implementation.
 *
 * Handles anonymous authentication by creating a temporary user and session.
 *
 * @category IAM API Handlers
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @see {@link @beep/iam-domain/api/v1/sign-in/anonymous | Domain Contract}
 */
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthQuery } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<undefined>;

/**
 * Handler for anonymous sign-in.
 *
 * Creates an anonymous user and session without requiring credentials.
 *
 * @since 1.0.0
 */
export const Handler: HandlerEffect = Effect.fn("SignInAnonymous")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // NOTE: signInAnonymous exists in Better Auth when anonymous plugin is enabled
    return yield* runAuthQuery({
      successSchema: V1.SignIn.Anonymous.Success,
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.signInAnonymous({
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to sign in anonymously.",
        cause: e,
      })
  )
);
