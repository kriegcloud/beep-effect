/**
 * @module organization/has-permission
 *
 * Handler implementation for the has-permission endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Organization.HasPermission.Payload>;

/**
 * Handler for the has-permission endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("HasPermission")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.HasPermission.Payload)(payload);

  const response = yield* Effect.tryPromise(() =>
    auth.api.hasPermission({
      body: {
        permissions: body.permissions,
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(V1.Organization.HasPermission.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("has-permission"));
