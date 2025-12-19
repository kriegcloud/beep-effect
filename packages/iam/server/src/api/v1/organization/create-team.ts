/**
 * @module organization/create-team
 *
 * Handler implementation for the create-team endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Team } from "@beep/iam-domain/entities";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Organization.CreateTeam.Payload>;

/**
 * Handler for the create-team endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("CreateTeam")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.CreateTeam.Payload)(payload);

  const response = yield* Effect.tryPromise(() =>
    auth.api.createTeam({
      body: {
        name: body.name,
        organizationId: body.organizationId,
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(Team.Model)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("create-team"));
