/**
 * @module organization/update
 *
 * Handler implementation for the update organization endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Organization } from "@beep/iam-domain/entities";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Organization.Update.Payload>;

/**
 * Handler for the update organization endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("UpdateOrganization")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.Update.Payload)(payload);

  // Parse JSON fields from string to object if present
  // Uses type guard to avoid assertions
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

  const parseJson = (value: unknown): Record<string, unknown> | undefined => {
    if (value == null) return undefined;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return isRecord(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    }
    // Already an object
    return isRecord(value) ? value : undefined;
  };

  // Parse JSON fields upfront to avoid undefined values in spread
  const metadataJson = parseJson(body.data.metadata);
  const featuresJson = parseJson(body.data.features);
  const settingsJson = parseJson(body.data.settings);

  // Build update data, excluding null/undefined values to satisfy exactOptionalPropertyTypes
  const updateData = {
    ...(body.data.name != null && { name: body.data.name }),
    ...(body.data.slug != null && { slug: body.data.slug }),
    ...(body.data.logo != null && { logo: body.data.logo }),
    ...(metadataJson != null && { metadata: metadataJson }),
    ...(body.data.type != null && { type: body.data.type }),
    ...(body.data.ownerUserId != null && { ownerUserId: body.data.ownerUserId }),
    ...(body.data.isPersonal != null && { isPersonal: body.data.isPersonal }),
    ...(body.data.maxMembers != null && { maxMembers: body.data.maxMembers }),
    ...(featuresJson != null && { features: featuresJson }),
    ...(settingsJson != null && { settings: settingsJson }),
    ...(body.data.subscriptionTier != null && { subscriptionTier: body.data.subscriptionTier }),
    ...(body.data.subscriptionStatus != null && { subscriptionStatus: body.data.subscriptionStatus }),
  };

  const response = yield* Effect.tryPromise(() =>
    auth.api.updateOrganization({
      body: {
        ...(body.organizationId != null && { organizationId: body.organizationId }),
        data: updateData,
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(Organization.Model)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("update-organization"));
