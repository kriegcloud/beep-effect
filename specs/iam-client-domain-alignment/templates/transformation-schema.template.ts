/**
 * Transformation Schema Template
 *
 * Use this template when creating new Better Auth → Domain transformation schemas.
 *
 * Replace:
 * - {{Entity}} with the entity name (e.g., Member, Invitation, Organization)
 * - {{entity}} with lowercase entity name (e.g., member, invitation, organization)
 * - {{EntityId}} with the branded ID type (e.g., MemberId, InvitationId, OrganizationId)
 * - {{DomainPackage}} with the domain package (e.g., @beep/iam-domain, @beep/shared-domain)
 */

import { $IamClientId } from "@beep/identity/packages";
import { {{Entity}} } from "{{DomainPackage}}/entities";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_internal/{{entity}}.schemas");

// =============================================================================
// Better Auth Response Schema
// =============================================================================

/**
 * Captures the raw Better Auth response shape.
 *
 * CRITICAL: Uses S.Struct + S.Record extension pattern to:
 * 1. Strongly type known fields
 * 2. Pass through unknown plugin fields for transformation
 */
export const BetterAuth{{Entity}}Schema = S.Struct(
  {
    // Core fields from Better Auth base schema
    id: S.String,
    // ... add core fields here

    // additionalFields (entity-specific, configured in Options.ts)
    // ... add additionalFields here

    // additionalFieldsCommon (audit columns, all entities)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optional(S.String),
    createdBy: S.optional(S.NullOr(S.String)),
    updatedBy: S.optional(S.NullOr(S.String)),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optional(S.NullOr(S.String)),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("BetterAuth{{Entity}}", {
    description:
      "The {{entity}} object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuth{{Entity}} = S.Schema.Type<typeof BetterAuth{{Entity}}Schema>;

// =============================================================================
// Transformation Schema
// =============================================================================

/**
 * Type alias for the encoded form of the domain model.
 * Used in the decode function to construct the return value.
 */
type {{Entity}}ModelEncoded = S.Schema.Encoded<typeof {{Entity}}.Model>;

/**
 * Transforms Better Auth {{entity}} response to domain {{Entity}}.Model.
 *
 * Decode: Better Auth response → Domain model
 * Encode: Domain model → Better Auth format (for round-trip)
 */
export const Domain{{Entity}}FromBetterAuth{{Entity}} = S.transformOrFail(
  BetterAuth{{Entity}}Schema,
  {{Entity}}.Model,
  {
    strict: true,
    decode: Effect.fn(function* (ba, _options, ast) {
      // =======================================================================
      // ID Validation
      // =======================================================================
      // Use branded type guard, NOT string prefix checking
      const isValid{{Entity}}Id = IamEntityIds.{{EntityId}}.is(ba.id);
      if (!isValid{{Entity}}Id) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba,
            `Invalid {{entity}} ID format: expected "{{id_prefix}}__<uuid>", got "${ba.id}"`
          )
        );
      }

      // =======================================================================
      // Build Encoded Form
      // =======================================================================
      const encoded: {{Entity}}ModelEncoded = {
        // Direct mappings from core fields
        id: ba.id,
        // ... add field mappings

        // Date → DateTime conversions
        createdAt: toDate(ba.createdAt),
        updatedAt: ba.updatedAt ? toDate(ba.updatedAt) : toDate(ba.createdAt),

        // Audit columns from additionalFieldsCommon
        _rowId: ba._rowId,
        version: ba.version,
        source: ba.source,
        createdBy: ba.createdBy,
        updatedBy: ba.updatedBy,
      };

      return encoded;
    }),
    encode: Effect.fn(function* (model, _options, _ast) {
      // =======================================================================
      // Build Better Auth Format
      // =======================================================================
      const ba: BetterAuth{{Entity}} = {
        id: model.id,
        // ... add field mappings

        // DateTime → Date conversions
        createdAt: new Date(model.createdAt),
        updatedAt: new Date(model.updatedAt),

        // Include audit columns for round-trip encoding
        _rowId: model._rowId,
        version: model.version,
        source: model.source,
        createdBy: model.createdBy,
        updatedBy: model.updatedBy,
      };
      return ba;
    }),
  }
).annotations(
  $I.annotations("Domain{{Entity}}FromBetterAuth{{Entity}}", {
    description: "Transforms Better Auth {{entity}} response to domain {{Entity}}.Model",
  })
);
