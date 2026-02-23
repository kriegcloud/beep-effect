/**
 * @module create
 *
 * Domain contract for creating an API key.
 *
 * @category API/V1/ApiKey
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/api-key/create");

/**
 * Payload for creating an API key.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Name for the API key.",
    }),
    expiresIn: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Time in seconds until the key expires.",
    }),
    userId: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "User ID to associate with the key (admin only).",
    }),
    prefix: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Custom prefix for the API key.",
    }),
    remaining: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Number of remaining uses for the key.",
    }),
    metadata: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Custom metadata for the API key.",
    }),
    refillAmount: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Amount to refill remaining uses by.",
    }),
    refillInterval: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Interval in seconds for refilling remaining uses.",
    }),
    rateLimitTimeWindow: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Rate limit time window in seconds.",
    }),
    rateLimitMax: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Maximum requests allowed in the rate limit window.",
    }),
    rateLimitEnabled: S.optionalWith(S.Boolean, { nullable: true }).annotations({
      description: "Whether rate limiting is enabled for this key.",
    }),
    permissions: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Permissions for the API key.",
    }),
  },
  $I.annotations("ApiKeyCreatePayload", {
    description: "Payload for creating an API key.",
  })
) {}

/**
 * Success response after creating an API key.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: S.String.annotations({
      description: "API key ID.",
    }),
    key: S.String.annotations({
      description: "The full API key (only returned on create).",
    }),
    name: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Name of the API key.",
    }),
    start: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "First characters of the key for display.",
    }),
    prefix: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Prefix of the API key.",
    }),
    userId: S.String.annotations({
      description: "User ID associated with the key.",
    }),
    refillInterval: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Interval in seconds for refilling remaining uses.",
    }),
    refillAmount: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Amount to refill remaining uses by.",
    }),
    lastRefillAt: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { nullable: true }).annotations({
      description: "When the remaining uses were last refilled.",
    }),
    enabled: S.Boolean.annotations({
      description: "Whether the API key is enabled.",
    }),
    rateLimitEnabled: S.optionalWith(S.Boolean, { nullable: true }).annotations({
      description: "Whether rate limiting is enabled.",
    }),
    rateLimitTimeWindow: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Rate limit time window in seconds.",
    }),
    rateLimitMax: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Maximum requests in the rate limit window.",
    }),
    requestCount: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Total number of requests made with this key.",
    }),
    remaining: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Remaining uses for the key.",
    }),
    expiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { nullable: true }).annotations({
      description: "When the API key expires.",
    }),
    createdAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When the API key was created.",
    }),
    updatedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When the API key was last updated.",
    }),
    permissions: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Permissions for the API key (JSON string).",
    }),
    metadata: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Custom metadata for the API key.",
    }),
  },
  $I.annotations("ApiKeyCreateSuccess", {
    description: "Success response after creating an API key.",
  })
) {}

/**
 * Create API key endpoint contract.
 *
 * POST /api-key/create
 *
 * Creates a new API key.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("create", "/create")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to create API key.",
      })
    )
  )
  .addSuccess(Success);
