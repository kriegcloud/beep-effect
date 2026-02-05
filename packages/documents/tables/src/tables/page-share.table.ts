import { AccessLevel, ShareType } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { page } from "./page.table";

export const shareTypePgEnum = BS.toPgEnum(ShareType)("share_type_enum");
export const accessLevelPgEnum = BS.toPgEnum(AccessLevel)("access_level_enum");

export const pageShare = OrgTable.make(DocumentsEntityIds.PageShareId)(
  {
    pageId: pg
      .text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.PageId.Type>(),
    shareType: shareTypePgEnum("share_type").notNull(),
    granteeId: pg.text("grantee_id"),
    accessLevel: accessLevelPgEnum("access_level").notNull().default("view"),
    shareToken: pg.text("share_token"),
    expiresAt: pg.timestamp("expires_at", { withTimezone: true }),
    grantedBy: pg
      .text("granted_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
  },
  (t) => [
    pg.index("page_share_page_id_idx").on(t.pageId),
    pg.index("page_share_organization_id_idx").on(t.organizationId),
    pg.index("page_share_grantee_id_idx").on(t.granteeId),
    pg.uniqueIndex("page_share_token_idx").on(t.shareToken),
    pg.index("page_share_expires_at_idx").on(t.expiresAt),
  ]
);
