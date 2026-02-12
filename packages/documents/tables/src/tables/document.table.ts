import { TextStyle } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import { bytea } from "@beep/shared-tables/columns/bytea";
import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

export const textStylePgEnum = BS.toPgEnum(TextStyle)("text_style_enum");

export const document = OrgTable.make(DocumentsEntityIds.DocumentId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    templateId: pg.text("template_id"),
    parentDocumentId: pg.text("parent_document_id").$type<DocumentsEntityIds.DocumentId.Type>(),
    title: pg.text("title"),
    content: pg.text("content"),
    contentRich: pg.jsonb("content_rich").$type<string | null>(),
    yjsSnapshot: bytea("yjs_snapshot"),
    coverImage: pg.text("cover_image"),
    icon: pg.text("icon"),
    isPublished: pg.boolean("is_published").notNull().default(false),
    isArchived: pg.boolean("is_archived").notNull().default(false),
    textStyle: textStylePgEnum("text_style").notNull().default("default"),
    smallText: pg.boolean("small_text").notNull().default(false),
    fullWidth: pg.boolean("full_width").notNull().default(false),
    lockPage: pg.boolean("lock_page").notNull().default(false),
    toc: pg.boolean("toc").notNull().default(true),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("document_organization_id_idx").on(t.organizationId),
    pg.uniqueIndex("document_user_template_idx").on(t.userId, t.templateId),
    pg.index("document_user_idx").on(t.userId),
    pg.index("document_parent_idx").on(t.parentDocumentId),
    pg.index("document_is_published_idx").on(t.isPublished),
    pg.index("document_is_archived_idx").on(t.isArchived),
    // Full-text search GIN index on title and content
    // Title is weighted higher (A) than content (B) for relevance ranking
    pg.index("document_search_idx").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', coalesce(${t.title}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${t.content}, '')), 'B')
      )`
    ),
  ]
);
