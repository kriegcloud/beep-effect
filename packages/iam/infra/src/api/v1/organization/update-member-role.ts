/**
 * @module organization/update-member-role
 *
 * Handler implementation for the update-member-role endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAdminEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.Organization.UpdateMemberRole.Payload>;

/**
 * Handler for the update-member-role endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("UpdateMemberRole")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Organization.UpdateMemberRole.Payload,
    successSchema: V1.Organization.UpdateMemberRole.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.updateMemberRole({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("update-member-role"));
