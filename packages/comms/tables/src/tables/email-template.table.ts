/**
 * EmailTemplate table definition for Comms slice
 *
 * Defines the database table schema for the EmailTemplate entity.
 * Replace or rename with your actual domain table definitions.
 *
 * @module comms-tables/tables/placeholder
 * @since 0.1.0
 */

import type { EmailTemplate } from "@beep/comms-domain/entities";
import { CommsEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, SharedDbSchema } from "@beep/shared-tables";
import { FK } from "@beep/shared-tables/common";
import * as pg from "drizzle-orm/pg-core";
import type * as S from "effect/Schema";
/**
 * EmailTemplate table for the comms slice.
 *
 * Uses Table.make factory to include standard audit columns
 * (id, createdAt, updatedAt).
 *
 * @since 0.1.0
 * @category tables
 */
export const emailTemplate = OrgTable.make(CommsEntityIds.EmailTemplateId)(
  {
    userId: pg
      .integer("user_id")
      .notNull()
      .references(() => SharedDbSchema.user._rowId, {
        onDelete: FK.Enum.CASCADE,
        onUpdate: FK.Enum.CASCADE,
      })
      .$type<SharedEntityIds.UserId.RowId.Type>(),
    name: pg.text("name").notNull(),
    subject: pg.text("subject"),
    body: pg.text("body"),
    to: pg.jsonb("to").$type<S.Schema.Encoded<typeof EmailTemplate.Model.fields.to>>(),
    cc: pg.jsonb("cc").$type<S.Schema.Encoded<typeof EmailTemplate.Model.fields.to>>(),
    bcc: pg.jsonb("bcc").$type<S.Schema.Encoded<typeof EmailTemplate.Model.fields.to>>(),
  },
  (t) => [
    pg.index("idx_email_template_user_id").on(t.userId),
    pg.index("idx_org_id").on(t.organizationId),
    pg.unique("uidx_email_template_org_id_user_id_name_unique").on(t.organizationId, t.userId, t.name),
  ]
);
