/**
 * Entity Schema Template
 *
 * Use this template when defining new knowledge domain entities.
 * Replace {{EntityName}} with your actual entity name (e.g., Entity, Relation).
 *
 * @template
 */
import * as S from "effect/Schema";
import { SharedEntityIds } from "@beep/shared-domain";

// =============================================================================
// Entity ID (Branded)
// =============================================================================

/**
 * Branded identifier for {{EntityName}}.
 *
 * Pattern: Use EntityId.builder from @beep/schema/identity for consistency.
 *
 * @example
 * ```typescript
 * import { EntityId } from "@beep/schema/identity";
 * const make = EntityId.builder("knowledge");
 * export const EntityId = make("entity", { brand: "EntityId" });
 * ```
 */
export const {{EntityName}}Id = S.String.pipe(S.brand("{{EntityName}}Id"));
export type {{EntityName}}Id = S.Schema.Type<typeof {{EntityName}}Id>;

// =============================================================================
// Supporting Schemas
// =============================================================================

/**
 * Evidence span linking extracted data to source text.
 *
 * ALWAYS include evidence spans for provenance tracking.
 */
export class EvidenceSpan extends S.Class<EvidenceSpan>("EvidenceSpan")({
  /** The exact text that was extracted */
  text: S.String,
  /** Character offset from document start */
  startOffset: S.Number,
  /** Character offset of span end */
  endOffset: S.Number,
  /** URI identifying the source document */
  sourceUri: S.String,
  /** Confidence score from extraction (0-1) */
  confidence: S.Number,
}) {}

// =============================================================================
// Main Entity Schema
// =============================================================================

/**
 * {{EntityName}} domain model.
 *
 * Key patterns:
 * - Use branded IDs for type safety
 * - Include organizationId for multi-tenancy
 * - Use S.Array for collections, not native arrays
 * - Use S.optional for nullable fields
 * - Include audit timestamps
 */
export class {{EntityName}} extends S.Class<{{EntityName}}>("{{EntityName}}")({
  /** Unique identifier */
  id: {{EntityName}}Id,

  /** Organization for multi-tenancy (REQUIRED for all entities) */
  organizationId: SharedEntityIds.OrganizationId,

  // -------------------------------------------------------------------------
  // Domain-specific fields
  // -------------------------------------------------------------------------

  /** OWL class IRIs this entity belongs to */
  types: S.Array(S.String),

  /** Canonical surface form (display name) */
  mention: S.String,

  /** Key-value attributes extracted from ontology properties */
  attributes: S.Record({ key: S.String, value: S.Unknown }),

  /** Evidence spans linking to source text (optional) */
  mentions: S.optional(S.Array(EvidenceSpan)),

  /** Grounding confidence from embedding similarity (optional) */
  groundingConfidence: S.optional(S.Number),

  // -------------------------------------------------------------------------
  // Audit fields
  // -------------------------------------------------------------------------

  /** Creation timestamp */
  createdAt: S.Date,

  /** Last update timestamp */
  updatedAt: S.Date,
}) {}

// =============================================================================
// Type Exports
// =============================================================================

export type {{EntityName}}Type = S.Schema.Type<typeof {{EntityName}}>;
export type {{EntityName}}Encoded = S.Schema.Encoded<typeof {{EntityName}}>;

// =============================================================================
// Factory Functions (Optional)
// =============================================================================

/**
 * Create a new {{EntityName}} with defaults.
 *
 * @example
 * ```typescript
 * const entity = make{{EntityName}}({
 *   id: {{EntityName}}Id.make("knowledge_entity__uuid"),
 *   organizationId: orgId,
 *   types: ["ex:Person"],
 *   mention: "John Doe",
 * });
 * ```
 */
export const make{{EntityName}} = (
  partial: Omit<{{EntityName}}Type, "createdAt" | "updatedAt" | "attributes"> &
    Partial<Pick<{{EntityName}}Type, "attributes">>
): {{EntityName}}Type => ({
  ...partial,
  attributes: partial.attributes ?? {},
  createdAt: new Date(),
  updatedAt: new Date(),
});
