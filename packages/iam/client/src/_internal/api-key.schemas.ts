import * as ApiKeyModel from "@beep/iam-domain/entities/api-key";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireNumber, requireString, toDate } from "./transformation-helpers.ts";

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
    id: IamEntityIds.ApiKeyId,
    name: S.optionalWith(S.String, { nullable: true }),
    start: S.optionalWith(S.String, { nullable: true }),
    prefix: S.optionalWith(S.String, { nullable: true }),
    key: S.optional(S.String), // Only returned on create
    userId: SharedEntityIds.UserId,
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
    id: IamEntityIds.ApiKeyId,
    name: S.optionalWith(S.String, { nullable: true }),
    start: S.optionalWith(S.String, { nullable: true }),
    prefix: S.optionalWith(S.String, { nullable: true }),
    key: S.String, // Required on create response
    userId: SharedEntityIds.UserId,
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

// =============================================================================
// BETTER AUTH API KEY SCHEMA (for transformation)
// =============================================================================

/**
 * Schema representing a Better Auth API key object.
 *
 * This captures the API key structure returned by Better Auth's api-key plugin,
 * including core fields and additionalFields configured in Options.ts.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthApiKeySchema = S.Struct(
  {
    id: S.String,
    name: S.optionalWith(S.String, { nullable: true }),
    start: S.optionalWith(S.String, { nullable: true }),
    prefix: S.optionalWith(S.String, { nullable: true }),
    key: S.optional(S.String), // Only returned on create, sensitive
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
    organizationId: S.optionalWith(S.String, { nullable: true }),
    // additionalFieldsCommon (audit columns, all entities)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optionalWith(S.String, { nullable: true }),
    createdBy: S.optionalWith(S.String, { nullable: true }),
    updatedBy: S.optionalWith(S.String, { nullable: true }),
    deletedAt: S.optional(BS.DateFromAllAcceptable),
    deletedBy: S.optionalWith(S.String, { nullable: true }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("BetterAuthApiKey", {
    description: "The API key object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuthApiKey = S.Schema.Type<typeof BetterAuthApiKeySchema>;

// =============================================================================
// API KEY TRANSFORMATION SCHEMA
// =============================================================================

/**
 * Type alias for ApiKey.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type ApiKeyModelEncoded = S.Schema.Encoded<typeof ApiKeyModel.Model>;

/**
 * Transforms a Better Auth API key object into the domain ApiKey.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to ApiKey.Model encoded representation
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 *
 * The `key` field is sensitive and only returned on create. It is mapped
 * to the domain model's sensitive field wrapper.
 */
export const DomainApiKeyFromBetterAuthApiKey = S.transformOrFail(BetterAuthApiKeySchema, ApiKeyModel.Model, {
  strict: true,
  decode: Effect.fn(function* (ba, _options, ast) {
    // Validate API key ID format
    const isValidApiKeyId = IamEntityIds.ApiKeyId.is(ba.id);
    if (!isValidApiKeyId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(ast, ba, `Invalid API key ID format: expected "iam_apikey__<uuid>", got "${ba.id}"`)
      );
    }

    // Validate user ID format
    const isValidUserId = SharedEntityIds.UserId.is(ba.userId);
    if (!isValidUserId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(
          ast,
          ba.userId,
          `Invalid user ID format: expected "shared_user__<uuid>", got "${ba.userId}"`
        )
      );
    }

    // Validate organizationId if present
    if (ba.organizationId) {
      const isValidOrgId = SharedEntityIds.OrganizationId.is(ba.organizationId);
      if (!isValidOrgId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba.organizationId,
            `Invalid organization ID format: expected "shared_organization__<uuid>", got "${ba.organizationId}"`
          )
        );
      }
    }

    // =======================================================================
    // REQUIRED FIELDS - Must be present in Better Auth response
    // These use require* helpers that FAIL if the field is missing
    // =======================================================================
    const _rowId = yield* requireNumber(ba, "_rowId", ast);
    const version = yield* requireNumber(ba, "version", ast);
    const source = yield* requireString(ba, "source", ast);
    const createdBy = yield* requireString(ba, "createdBy", ast);
    const updatedBy = yield* requireString(ba, "updatedBy", ast);

    // Construct the encoded form of ApiKey.Model
    const encoded: ApiKeyModelEncoded = {
      // Core identity fields
      id: ba.id,
      userId: ba.userId,
      createdAt: toDate(ba.createdAt),
      updatedAt: toDate(ba.updatedAt),

      // API key specific fields
      name: ba.name ?? null,
      start: ba.start ?? null,
      prefix: ba.prefix ?? null,
      key: ba.key ?? null, // Sensitive field, only on create

      // Rate limiting fields
      refillInterval: ba.refillInterval ?? null,
      refillAmount: ba.refillAmount ?? null,
      lastRefillAt: ba.lastRefillAt ? toDate(ba.lastRefillAt) : null,
      enabled: ba.enabled,
      rateLimitEnabled: ba.rateLimitEnabled,
      rateLimitTimeWindow: ba.rateLimitTimeWindow ?? 86400000,
      rateLimitMax: ba.rateLimitMax ?? 10,
      requestCount: ba.requestCount ?? null,
      remaining: ba.remaining ?? null,
      lastRequest: ba.lastRequest ? toDate(ba.lastRequest) : null,
      expiresAt: ba.expiresAt ? toDate(ba.expiresAt) : null,

      // Permissions and metadata
      permissions: ba.permissions ? JSON.stringify(ba.permissions) : null,
      metadata: ba.metadata ? JSON.stringify(ba.metadata) : null,
      organizationId: ba.organizationId ?? null,

      // Audit fields from additionalFieldsCommon (required, validated above)
      _rowId,
      version,
      source,
      createdBy,
      updatedBy,
      deletedAt: ba.deletedAt ? toDate(ba.deletedAt) : null,
      deletedBy: ba.deletedBy ?? null,
    };

    return encoded;
  }),
  encode: Effect.fn(function* (apiKey, _options, _ast) {
    // Handle potentially undefined id by creating a new one
    const id = apiKey.id ?? IamEntityIds.ApiKeyId.create();

    // Parse JSON strings back to objects for permissions and metadata
    const permissions = apiKey.permissions ? JSON.parse(apiKey.permissions) : undefined;
    const metadata = apiKey.metadata ? JSON.parse(apiKey.metadata) : undefined;

    const ba: BetterAuthApiKey = {
      id,
      userId: apiKey.userId,
      createdAt: toDate(apiKey.createdAt),
      updatedAt: toDate(apiKey.updatedAt),
      name: apiKey.name ?? undefined,
      start: apiKey.start ?? undefined,
      prefix: apiKey.prefix ?? undefined,
      key: apiKey.key ?? undefined,
      refillInterval: apiKey.refillInterval ?? undefined,
      refillAmount: apiKey.refillAmount ?? undefined,
      lastRefillAt: apiKey.lastRefillAt ? toDate(apiKey.lastRefillAt) : undefined,
      enabled: apiKey.enabled ?? true,
      rateLimitEnabled: apiKey.rateLimitEnabled ?? true,
      rateLimitTimeWindow: apiKey.rateLimitTimeWindow ?? undefined,
      rateLimitMax: apiKey.rateLimitMax ?? undefined,
      requestCount: apiKey.requestCount ?? 0,
      remaining: apiKey.remaining ?? undefined,
      lastRequest: apiKey.lastRequest ? toDate(apiKey.lastRequest) : undefined,
      expiresAt: apiKey.expiresAt ? toDate(apiKey.expiresAt) : undefined,
      permissions,
      metadata,
      organizationId: apiKey.organizationId ?? undefined,
      // Include audit columns for round-trip encoding
      _rowId: apiKey._rowId,
      version: apiKey.version,
      source: apiKey.source ?? undefined,
      createdBy: apiKey.createdBy ?? undefined,
      updatedBy: apiKey.updatedBy ?? undefined,
      deletedAt: apiKey.deletedAt ? toDate(apiKey.deletedAt) : undefined,
      deletedBy: apiKey.deletedBy ?? undefined,
    };
    return ba;
  }),
}).annotations(
  $I.annotations("DomainApiKeyFromBetterAuthApiKey", {
    description: "Transforms Better Auth API key response to domain ApiKey.Model",
  })
);

export declare namespace DomainApiKeyFromBetterAuthApiKey {
  export type Type = typeof DomainApiKeyFromBetterAuthApiKey.Type;
  export type Encoded = typeof DomainApiKeyFromBetterAuthApiKey.Encoded;
}
