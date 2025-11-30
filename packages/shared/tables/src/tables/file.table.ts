import type { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "../OrgTable";
import { organization } from "./organization.table";

export const file = OrgTable.make(SharedEntityIds.FileId)({
  url: pg.text("url").notNull(),
  size: pg
    .bigint({
      mode: "number",
    })
    .notNull(),
  formattedSize: pg.text("formatted_size").notNull(),
  filename: pg.text("filename").notNull(),
  originalFilename: pg.text("original_filename").notNull(),
  basePath: pg.text("base_path").notNull(),
  path: pg.text("path").notNull(),
  ext: pg.text("ext").notNull().$type<BS.FileExtension.Type>(),
  mimeType: pg.text("mime_type").notNull().$type<BS.MimeType.Type>(),
  platform: pg.text("platform").notNull(),
  // Domain association
  entityKind: pg.text("entity_kind").notNull(),
  entityIdentifier: pg.text("entity_identifier").notNull(),
  entityAttribute: pg.text("entity_attribute").notNull(),
});

export const fileRelations = d.relations(file, ({ one }) => ({
  organization: one(organization, {
    fields: [file.organizationId],
    references: [organization.id],
  }),
}));
