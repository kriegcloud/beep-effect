/**
 * @module organization/update-team
 *
 * Handler implementation for the update-team endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Team } from "@beep/iam-domain/entities";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Organization.UpdateTeam.Payload>;

/**
 * Handler for the update-team endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("UpdateTeam")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.UpdateTeam.Payload)(payload);

  // Build data object, excluding null/undefined values to satisfy exactOptionalPropertyTypes
  const updateData = {
    ...(body.data.name != null && { name: body.data.name }),
    ...(body.data.description != null && { description: body.data.description }),
    ...(body.data.metadata != null && { metadata: body.data.metadata }),
    ...(body.data.logo != null && { logo: body.data.logo }),
  };

  const response = yield* Effect.tryPromise(() =>
    auth.api.updateTeam({
      body: {
        teamId: body.teamId,
        data: updateData,
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(Team.Model)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("update-team"));
