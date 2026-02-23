import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { entity } from "./entity.table";

export const sameAsLink = OrgTable.make(KnowledgeEntityIds.SameAsLinkId)(
  {
    canonicalId: pg
      .text("canonical_id")
      .notNull()
      .references(() => entity.id)
      .$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    memberId: pg
      .text("member_id")
      .notNull()
      .references(() => entity.id)
      .$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    confidence: pg.real("confidence").notNull(),
    sourceId: pg.text("source_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
  },
  (t) => [
    pg.index("same_as_canonical_idx").on(t.canonicalId),
    pg.index("same_as_member_idx").on(t.memberId),
    pg.index("same_as_org_idx").on(t.organizationId),
    pg.unique("same_as_unique").on(t.canonicalId, t.memberId),
  ]
);
