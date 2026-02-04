import type { SharedEntityIds } from "@beep/shared-domain";
import { CommsEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import { user } from "@beep/shared-tables/schema";
import * as pg from "drizzle-orm/pg-core";
import { connection } from "./connection.table";

export const note = Table.make(CommsEntityIds.NoteId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),

    connectionId: pg
      .text("connection_id")
      .notNull()
      .$type<CommsEntityIds.ConnectionId.Type>()
      .references(() => connection.id, { onDelete: "cascade" }),

    threadId: pg.text("thread_id").notNull(),

    content: pg.text("content").notNull(),

    isPinned: pg.boolean("is_pinned").notNull().default(false),
  },
  (t) => [
    pg.index("note_user_id_idx").on(t.userId),
    pg.index("note_connection_id_idx").on(t.connectionId),
    pg.index("note_thread_id_idx").on(t.threadId),
    pg.index("note_connection_thread_idx").on(t.connectionId, t.threadId),
  ]
);
