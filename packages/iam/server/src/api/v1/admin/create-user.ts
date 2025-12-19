/**
 * @module create-user
 *
 * Handler implementation for the create-user endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Admin.CreateUser.Payload>;

/**
 * Handler for the create-user endpoint.
 *
 * Calls Better Auth `auth.api.createUser` to create a new user as admin.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("CreateUser")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Get role and cast to expected type (better-auth only supports "user" | "admin")
  const roleValue = F.pipe(payload.role, O.getOrUndefined);
  const role = roleValue === "user" || roleValue === "admin" ? roleValue : undefined;

  // Manual transformation required for Redacted fields
  const response = yield* Effect.tryPromise(() =>
    auth.api.createUser({
      body: {
        email: Redacted.value(payload.email),
        password: Redacted.value(payload.password),
        name: payload.name,
        role,
        data: F.pipe(payload.data, O.getOrUndefined),
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(V1.Admin.CreateUser.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("create-user"));
