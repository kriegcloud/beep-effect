import { CommsEntityIds } from "@beep/shared-domain";
import { datetime, Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { connection } from "./connection.table";

export const sentimentEnum = pg.pgEnum("comms_sentiment_enum", ["positive", "negative", "neutral"]);

export const threadSummary = Table.make(CommsEntityIds.ThreadSummaryId)(
  {
    connectionId: pg
      .text("connection_id")
      .notNull()
      .$type<CommsEntityIds.ConnectionId.Type>()
      .references(() => connection.id, { onDelete: "cascade" }),

    threadId: pg.text("thread_id").notNull(),

    summary: pg.text("summary").notNull(),

    keyPoints: pg.text("key_points"),

    sentiment: sentimentEnum("sentiment"),

    actionItems: pg.text("action_items"),

    generatedAt: datetime("generated_at").notNull(),
  },
  (t) => [
    pg.index("thread_summary_connection_id_idx").on(t.connectionId),
    pg.uniqueIndex("thread_summary_connection_thread_idx").on(t.connectionId, t.threadId),
  ]
);
