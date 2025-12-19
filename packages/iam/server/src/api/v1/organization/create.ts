/**
 * @module organization/create
 *
 * Handler implementation for the create organization endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Organization.Create.Payload>;

/**
 * Handler for the create organization endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("CreateOrganization")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.Create.Payload)(payload);

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
  const metadataJson = parseJson(body.metadata);
  const featuresJson = parseJson(body.features);
  const settingsJson = parseJson(body.settings);

  // Build request body, excluding null/undefined values to satisfy exactOptionalPropertyTypes
  // type and isPersonal are required by Better Auth with defaults
  const requestBody = {
    name: body.name,
    slug: body.slug,
    type: body.type ?? "individual",
    isPersonal: body.isPersonal ?? false,
    ...(body.logo != null && { logo: body.logo }),
    ...(metadataJson != null && { metadata: metadataJson }),
    ...(body.ownerUserId != null && { ownerUserId: body.ownerUserId }),
    ...(body.maxMembers != null && { maxMembers: body.maxMembers }),
    ...(featuresJson != null && { features: featuresJson }),
    ...(settingsJson != null && { settings: settingsJson }),
    ...(body.subscriptionTier != null && { subscriptionTier: body.subscriptionTier }),
    ...(body.subscriptionStatus != null && { subscriptionStatus: body.subscriptionStatus }),
  };

  const response = yield* Effect.tryPromise(() =>
    auth.api.createOrganization({
      body: requestBody,
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(Organization.Model)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("create-organization"));
