import type { SharedEntityIds } from "@beep/shared-domain";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import { OrgTable, team, user } from "@beep/shared-tables";

import * as pg from "drizzle-orm/pg-core";

export const knowledgeSpace = OrgTable.make(KnowledgeManagementEntityIds.KnowledgeSpaceId)(
  {
    teamId: pg
      .text("team_id")
      .references(() => team.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.TeamId.Type>(), // Nullable (organization-wide space)
    ownerId: pg
      .text("owner_id")
      .notNull()
      .references(() => user.id)
      .$type<SharedEntityIds.UserId.Type>(),
    name: pg.text("name").notNull(),
    slug: pg.text("slug").notNull(),
    description: pg.text("description"),
    isEncrypted: pg.boolean("is_encrypted").notNull(),
    encryptionKeyId: pg.text("encryption_key_id"),
    defaultPermissions: pg.jsonb("default_permissions").notNull().$type<{ canRead: string[]; canWrite: string[] }>(),
  },
  (t) => [
    pg.uniqueIndex("knowledge_space_org_slug_idx").on(t.organizationId, t.slug),
    pg.index("knowledge_space_owner_idx").on(t.ownerId),
  ]
);
