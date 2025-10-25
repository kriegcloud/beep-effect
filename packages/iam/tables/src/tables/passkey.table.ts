import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

export const passkey = OrgTable.make(IamEntityIds.PasskeyId)(
  {
    name: pg.text("name").notNull(),
    publicKey: pg.text("public_key").notNull(),
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: pg.text("credential_i_d").notNull(),
    counter: pg.integer("counter").notNull(),
    deviceType: pg.text("device_type").notNull(),
    backedUp: pg.boolean("backed_up").notNull().default(false),
    transports: pg.text("transports"),
    aaguid: pg.text("aaguid"),
  },
  (t) => [
    // Count constraints
    pg.check("passkey_counter_non_negative_check", d.sql`${t.counter} >= 0`),
  ]
);
