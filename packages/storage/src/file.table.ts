// import { Common } from "@beep/shared-tables";
// import * as pg from "drizzle-orm/pg-core";
// import { BS } from "@beep/schema";
// import {EntityAttribute, EntityIdentifier, EntityKind, StoragePlatform} from "./StorageService.Contract";
// export const filesTable = pg.pgTable(
//   "file", {
//     id: pg.text("id").primaryKey(),
//     url: pg.varchar("url", { length: 512 }).notNull(),
//     size: pg.bigint({
//       mode: "number"
//     }).notNull(),
//     formattedSize: pg.text("formatted_size").notNull(),
//     filename: pg.text("filename").notNull(),
//     originalFilename: pg.text("original_filename").notNull(),
//     basePath: pg.text("base_path").notNull(),
//     path: pg.text("path").notNull(),
//     ext: pg.text("ext").notNull().$type<BS.Ext.Type>(),
//     mimeType: pg.text("mime_type").notNull().$type<BS.MimeType.Type>(),
//     platform: pg.text("platform").notNull().$type<StoragePlatform.Type>().default(StoragePlatform.Enum.s3),
//     // Domain association
//     entityKind: pg.text("entity_kind").notNull().$type<EntityKind.Type>(),
//     entityIdentifier: pg.text("entity_identifier").notNull().$type<EntityIdentifier.Type>(),
//     entityAttribute: pg.text("entity_attribute").notNull().$type<EntityAttribute.Type>
//   })
