/**
 * @module get-client
 *
 * OAuth2 get client endpoint contract.
 * Retrieves OAuth2 client information by ID.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/get-client");

/**
 * Path parameters for the get client endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class PathParams extends S.Class<PathParams>($I`PathParams`)(
  {
    /**
     * The OAuth2 client identifier.
     */
    id: S.String.annotations({
      description: "The OAuth2 client identifier.",
    }),
  },
  $I.annotations("OAuth2GetClientPathParams", {
    description: "Path parameters for the get client endpoint.",
  })
) {}

/**
 * Success response containing OAuth2 client information.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The client identifier.
     */
    clientId: S.String.annotations({
      description: "The client identifier.",
    }),

    /**
     * Human-readable name of the client application.
     */
    name: S.String.annotations({
      description: "Human-readable name of the client application.",
    }),

    /**
     * URL to the client's icon/logo.
     */
    icon: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL to the client's icon/logo.",
    }),
  },
  $I.annotations("OAuth2GetClientSuccess", {
    description: "Success response containing OAuth2 client information.",
  })
) {}

/**
 * OAuth2 get client endpoint contract.
 *
 * GET /oauth2/client/:id
 *
 * Retrieves public information about an OAuth2 client application.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-client", "/client/:id")
  .setPath(PathParams)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to retrieve client information.",
      })
    )
  )
  .addSuccess(Success);
