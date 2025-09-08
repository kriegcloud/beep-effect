import { IamEntityIds } from "@beep/shared-domain";
import { Common } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";
export const passkey = pg.pgTable(
  "passkey",
  {
    id: Common.idColumn("passkey", IamEntityIds.PasskeyId),
    name: pg.text("name"),
    publicKey: pg.text("public_key").notNull(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: pg.text("credential_i_d").notNull(),
    counter: pg.integer("counter").notNull(),
    deviceType: pg.text("device_type").notNull(),
    backedUp: pg.boolean("backed_up").notNull(),
    transports: pg.text("transports"),
    aaguid: pg.text("aaguid"),
    ...Common.defaultColumns,
  },
  (t) => [
    // Count constraints
    pg.check("passkey_counter_non_negative_check", d.sql`${t.counter} >= 0`),
  ]
);
