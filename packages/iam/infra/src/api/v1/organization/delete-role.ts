/**
 * @module organization/delete-role
 *
 * Handler implementation for the delete-role endpoint.
 *
 * Dynamic Access Control endpoints aren't reflected in Better Auth's base TypeScript types.
 * We use the DynamicAccessControl wrapper functions from BetterAuthBridge.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Organization.DeleteRole.Payload>;

/**
 * Handler for the delete-role endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("DeleteRole")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.DeleteRole.Payload)(payload);

  const response = yield* Auth.deleteOrgRole(auth.api, {
    body: {
      roleId: body.roleId,
      organizationId: body.organizationId,
    },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.Organization.DeleteRole.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("delete-role"));
