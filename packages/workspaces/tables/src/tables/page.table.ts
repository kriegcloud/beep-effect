import type { SerializedEditorStateEnvelope } from "@beep/workspaces-domain/value-objects";
import { DefaultAccess, PageType } from "@beep/workspaces-domain/value-objects";
import { BS } from "@beep/schema";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import { bytea } from "@beep/shared-tables/columns/bytea";
import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { textStylePgEnum } from "./document.table";

export const pageTypePgEnum = BS.toPgEnum(PageType)("page_type_enum");
export const defaultAccessPgEnum = BS.toPgEnum(DefaultAccess)("default_access_enum");

export const page = OrgTable.make(WorkspacesEntityIds.PageId)(
  {
    createdById: pg
      .text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    parentId: pg.text("parent_id").$type<WorkspacesEntityIds.PageId.Type>(),
    title: pg.text("title"),
    icon: pg.text("icon"),
    coverImage: pg.text("cover_image"),
    type: pageTypePgEnum("type").notNull().default("document"),
    content: pg.text("content"),
    contentRich: pg.jsonb("content_rich").$type<SerializedEditorStateEnvelope.Encoded | null>(),
    yjsSnapshot: bytea("yjs_snapshot"),
    layoutConfig: pg.jsonb("layout_config"),
    ontologyId: pg.text("ontology_id").$type<KnowledgeEntityIds.OntologyId.Type>(),
    textStyle: textStylePgEnum("text_style").notNull().default("default"),
    smallText: pg.boolean("small_text").notNull().default(false),
    fullWidth: pg.boolean("full_width").notNull().default(false),
    lockPage: pg.boolean("lock_page").notNull().default(false),
    toc: pg.boolean("toc").notNull().default(true),
    isArchived: pg.boolean("is_archived").notNull().default(false),
    isPublished: pg.boolean("is_published").notNull().default(false),
    defaultAccess: defaultAccessPgEnum("default_access").notNull().default("private"),
    shareToken: pg.text("share_token"),
    position: pg.doublePrecision("position"),
    metadata: pg.jsonb("metadata"),
  },
  (t) => [
    pg.index("page_organization_id_idx").on(t.organizationId),
    pg.index("page_created_by_id_idx").on(t.createdById),
    pg.index("page_parent_id_idx").on(t.parentId),
    pg.index("page_type_idx").on(t.type),
    pg.index("page_is_archived_idx").on(t.isArchived),
    pg.index("page_is_published_idx").on(t.isPublished),
    pg.uniqueIndex("page_share_token_idx").on(t.shareToken),
    pg.index("page_position_idx").on(t.parentId, t.position),
    pg.index("page_search_idx").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', coalesce(${t.title}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${t.content}, '')), 'B')
      )`
    ),
  ]
);
