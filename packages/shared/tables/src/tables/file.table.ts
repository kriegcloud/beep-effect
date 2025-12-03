import { EnvValue } from "@beep/constants";
import { BS } from "@beep/schema";
import { EntityKind, SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import type { ShardPrefix } from "@beep/shared-domain/entities/File/schemas";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "../OrgTable";
import { organization, organizationTypePgEnum } from "./organization.table";

export const envValuePgEnum = BS.toPgEnum(EnvValue)("env_value_enum");
export const fileTypePgEnum = BS.toPgEnum(BS.FileType)("file_type_enum");
export const fileStatusPgEnum = BS.toPgEnum(File.FileStatus)("file_status_enum");
export const extensionPgEnum = BS.toPgEnum(BS.FileExtension)("extension_enum");
export const mimeTypePgEnum = BS.toPgEnum(BS.MimeType)("mime_type_enum");
export const entityKindPgEnum = BS.toPgEnum(EntityKind)("entity_kind_enum");
export const file = OrgTable.make(SharedEntityIds.FileId)({
  /** S3 object key (full path) */
  key: pg.text("key").notNull(),
  /** Public URL to the file */
  url: pg.text("url").notNull(),
  /** File size in bytes */
  size: pg
    .bigint({
      mode: "number",
    })
    .notNull(),
  /** Human-readable formatted size (e.g., "1.5 MB") */
  sizeFormatted: pg.text("size_formatted").notNull(),
  /** Generated filename ({fileId}.{ext}) */
  filename: pg.text("filename").notNull(),
  /** Original filename from upload */
  originalFilename: pg.text("original_filename").notNull(),
  /** Environment: dev, staging, prod */
  environment: envValuePgEnum("environment").notNull(),
  /** Shard prefix for S3 load distribution (2-char hex) */
  shardPrefix: pg.text("shard_prefix").notNull().$type<ShardPrefix.Type>(),
  /** Organization type: individual, team, enterprise */
  organizationType: organizationTypePgEnum("organization_type").notNull(),
  /** File extension (jpg, png, pdf, etc.) */
  extension: extensionPgEnum("extension").notNull(),
  /** MIME type of the file */
  mimeType: mimeTypePgEnum("mime_type").notNull(),
  /** Month of upload (1-12) */
  uploadMonth: pg.smallint("upload_month").notNull(),
  /** File type category: image, video, audio, pdf, text, blob */
  fileType: fileTypePgEnum("file_type").notNull(),
  /** Upload status: PENDING, PROCESSING, FAILED, READY, PENDING_DELETION, DELETED */
  status: fileStatusPgEnum("status").notNull().default(File.FileStatus.Enum.PENDING),
  // Domain association
  /** Entity kind (organization, user, team) */
  entityKind: entityKindPgEnum("entity_kind").notNull(),
  /** Entity identifier (the entity's ID) */
  entityIdentifier: pg.text("entity_identifier").notNull(),
  /** Entity attribute/purpose (avatar, logo, document, etc.) */
  entityAttribute: pg.text("entity_attribute").notNull(),
});

export const fileRelations = d.relations(file, ({ one }) => ({
  organization: one(organization, {
    fields: [file.organizationId],
    references: [organization.id],
  }),
}));
