/**
 * SameAsLink table definition for Knowledge slice
 *
 * Stores owl:sameAs provenance links between entities that
 * refer to the same real-world entity.
 *
 * @module knowledge-tables/tables/sameAsLink
 * @since 0.1.0
 */

import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { entity } from "./entity.table.js";

/**
 * SameAsLink table for the knowledge slice.
 *
 * Uses OrgTable.make factory to include standard audit columns
 * and organization scoping.
 *
 * @since 0.1.0
 * @category tables
 */
export const sameAsLink = OrgTable.make(KnowledgeEntityIds.SameAsLinkId)(
  {
    // Canonical entity ID (the authoritative entity)
    canonicalId: pg
      .text("canonical_id")
      .notNull()
      .references(() => entity.id),

    // Member entity ID that is "same as" the canonical
    memberId: pg
      .text("member_id")
      .notNull()
      .references(() => entity.id),

    // Confidence score for this link (0-1)
    confidence: pg.real("confidence").notNull(),

    // Source extraction/document ID that produced the member entity
    sourceId: pg.text("source_id"),
  },
  (t) => [
    // Index for looking up links by canonical entity
    pg
      .index("same_as_canonical_idx")
      .on(t.canonicalId),
    // Index for looking up links by member entity
    pg
      .index("same_as_member_idx")
      .on(t.memberId),
    // Organization ID index for RLS filtering
    pg
      .index("same_as_org_idx")
      .on(t.organizationId),
    // Unique constraint to prevent duplicate links
    pg
      .unique("same_as_unique")
      .on(t.canonicalId, t.memberId),
  ]
);
