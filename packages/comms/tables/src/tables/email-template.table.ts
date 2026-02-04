import type { SharedEntityIds } from "@beep/shared-domain";
import { CommsEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { user } from "@beep/shared-tables/schema";
import * as pg from "drizzle-orm/pg-core";

export const emailTemplate = OrgTable.make(CommsEntityIds.EmailTemplateId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.RowId.Type>()
      .references(() => user._rowId, { onDelete: "cascade" }),

    name: pg.text("name").notNull(),

    subject: pg.text("subject"),

    body: pg.text("body"),

    to: pg.text("to"),

    cc: pg.text("cc"),

    bcc: pg.text("bcc"),
  },
  (t) => [
    pg.index("email_template_user_id_idx").on(t.userId),
    pg.index("email_template_organization_id_idx").on(t.organizationId),
    pg.uniqueIndex("email_template_org_name_idx").on(t.organizationId, t.name),
  ]
);
