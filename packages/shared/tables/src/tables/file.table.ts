import type { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import type { File } from "@beep/shared-domain/entities";
import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "../OrgTable";
import { folder } from "./folder.table";
import { user } from "./user.table";

export const file = OrgTable.make(SharedEntityIds.FileId)({
  /** S3 object key (full path) */
  key: pg.text("key").$type<(typeof File.Model.Type)["key"]>().notNull(),
  /** Public URL to the file */
  url: pg.text("url").$type<BS.URLString.Type>().notNull(),
  name: pg.text("name").notNull(),
  size: pg.integer("size").notNull(),
  mimeType: pg.text("mime_type").notNull().$type<BS.MimeType.Type>(),
  userId: pg
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .$type<SharedEntityIds.UserId.Type>(),
  folderId: pg
    .text("folder_id")
    .references(() => folder.id, { onDelete: "cascade" })
    .notNull()
    .$type<SharedEntityIds.FolderId.Type>(),
  uploadedByUserId: pg
    .text("uploaded_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .$type<SharedEntityIds.UserId.Type>(),
  metadata: pg.text("metadata").notNull().$type<(typeof File.Model.Encoded)["metadata"]>(),
});
