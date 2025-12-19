/**
 * @module organization/delete
 *
 * Handler implementation for the delete organization endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Organization.Delete.Payload>;

/**
 * Handler for the delete organization endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("DeleteOrganization")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Organization.Delete.Payload,
    successSchema: V1.Organization.Delete.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.deleteOrganization({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("delete-organization"));
