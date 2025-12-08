import { SharedEntityIds } from "@beep/shared-domain";

import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "../OrgTable";

export const file = OrgTable.make(SharedEntityIds.FileId)({
  /** S3 object key (full path) */
  key: pg.text("key").notNull(),
  /** Public URL to the file */
  url: pg.text("url").notNull(),
});
