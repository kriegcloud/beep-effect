import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_internal/api-key.schemas");

// =============================================================================
// API KEY SCHEMA
// =============================================================================

/**
 * API key schema returned by Better Auth's api-key plugin.
 *
 * Note: The `key` field is only returned on create - subsequent reads omit it.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/api-key/index.ts
 */
export class ApiKey extends S.Class<ApiKey>($I`ApiKey`)(
  {
    id: S.String,
    name: S.optionalWith(S.String, { nullable: true }),
    start: S.optionalWith(S.String, { nullable: true }),
    prefix: S.optionalWith(S.String, { nullable: true }),
    key: S.optional(S.String), // Only returned on create
    userId: S.String,
    refillInterval: S.optionalWith(S.Number, { nullable: true }),
    refillAmount: S.optionalWith(S.Number, { nullable: true }),
    lastRefillAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    enabled: S.Boolean,
    rateLimitEnabled: S.Boolean,
    rateLimitTimeWindow: S.optionalWith(S.Number, { nullable: true }),
    rateLimitMax: S.optionalWith(S.Number, { nullable: true }),
    requestCount: S.Number,
    remaining: S.optionalWith(S.Number, { nullable: true }),
    lastRequest: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    expiresAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    createdAt: BS.DateFromAllAcceptable,
    updatedAt: BS.DateFromAllAcceptable,
    metadata: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
    permissions: S.optionalWith(S.Record({ key: S.String, value: S.Array(S.String) }), { nullable: true }),
  },
  $I.annotations("ApiKey", {
    description: "API key entity from Better Auth api-key plugin.",
  })
) {}

/**
 * API key with key field included - only returned on create.
 */
export class ApiKeyWithKey extends S.Class<ApiKeyWithKey>($I`ApiKeyWithKey`)(
  {
    id: S.String,
    name: S.optionalWith(S.String, { nullable: true }),
    start: S.optionalWith(S.String, { nullable: true }),
    prefix: S.optionalWith(S.String, { nullable: true }),
    key: S.String, // Required on create response
    userId: S.String,
    refillInterval: S.optionalWith(S.Number, { nullable: true }),
    refillAmount: S.optionalWith(S.Number, { nullable: true }),
    lastRefillAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    enabled: S.Boolean,
    rateLimitEnabled: S.Boolean,
    rateLimitTimeWindow: S.optionalWith(S.Number, { nullable: true }),
    rateLimitMax: S.optionalWith(S.Number, { nullable: true }),
    requestCount: S.Number,
    remaining: S.optionalWith(S.Number, { nullable: true }),
    lastRequest: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    expiresAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    createdAt: BS.DateFromAllAcceptable,
    updatedAt: BS.DateFromAllAcceptable,
    metadata: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
    permissions: S.optionalWith(S.Record({ key: S.String, value: S.Array(S.String) }), { nullable: true }),
  },
  $I.annotations("ApiKeyWithKey", {
    description: "API key entity with key field (only returned on create).",
  })
) {}
