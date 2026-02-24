import type { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { discussion } from "./discussion.table";

export const comment = OrgTable.make(DocumentsEntityIds.CommentId)(
  {
    discussionId: pg
      .text("discussion_id")
      .notNull()
      .references(() => discussion.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.DiscussionId.Type>(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    content: pg.text("content").notNull(),
    contentRich: pg.jsonb("content_rich"),
    isEdited: pg.boolean("is_edited").notNull().default(false),
  },
  (t) => [pg.index("comment_discussion_idx").on(t.discussionId), pg.index("comment_user_idx").on(t.userId)]
);
