import { IamEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { userTable } from "./user.table";

export const walletAddressTable = Table.make(IamEntityIds.WalletAddressId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    address: pg.text("address").notNull(),
    chainId: pg.integer("chain_id").notNull(),
    isPrimary: pg.boolean("is_primary"),
  },
  (t) => [pg.uniqueIndex("wallet_address_user_chain_id_unique_idx").on(t.userId, t.address, t.chainId)]
);
