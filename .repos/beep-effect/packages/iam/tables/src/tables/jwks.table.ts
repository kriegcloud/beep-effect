import { IamEntityIds } from "@beep/shared-domain";
import { datetime, Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const jwks = Table.make(IamEntityIds.JwksId)({
  publicKey: pg.text("public_key").notNull(),
  privateKey: pg.text("private_key").notNull(),
  expiresAt: datetime("expires_at"),
});
