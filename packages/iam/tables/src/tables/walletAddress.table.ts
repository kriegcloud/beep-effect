import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { Table, userTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const walletAddressTable = Table.make(IamEntityIds.WalletAddressId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => userTable.id, { onDelete: "cascade" }),
    address: pg.text("address").notNull(),
    chainId: pg.integer("chain_id").notNull(),
    isPrimary: pg.boolean("is_primary").notNull().default(false),
  },
  (t) => [pg.uniqueIndex("wallet_address_user_chain_id_unique_idx").on(t.userId, t.address, t.chainId)]
);
