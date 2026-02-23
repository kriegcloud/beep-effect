/**
 * @module organization/update-role
 *
 * Handler implementation for the update-role endpoint.
 *
 * Dynamic Access Control endpoints aren't reflected in Better Auth's base TypeScript types.
 * We use the DynamicAccessControl wrapper functions from BetterAuthBridge.
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

type HandlerEffect = Common.HandlerEffect<V1.Organization.UpdateRole.Payload>;

/**
 * Handler for the update-role endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("UpdateRole")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.UpdateRole.Payload)(payload);

  const response = yield* Auth.updateOrgRole(auth.api, {
    body,
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.Organization.UpdateRole.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("update-role"));
