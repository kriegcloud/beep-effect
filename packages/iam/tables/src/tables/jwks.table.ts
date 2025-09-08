import { IamEntityIds } from "@beep/shared-domain";
import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const jwks = pg.pgTable("jwks", {
  id: Common.idColumn("jwks", IamEntityIds.JwksId),
  publicKey: pg.text("public_key").notNull(),
  privateKey: pg.text("private_key").notNull(),
  ...Common.globalColumns,
});
