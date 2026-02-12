CREATE TYPE "public"."default_access_enum" AS ENUM('private', 'restricted', 'organization');--> statement-breakpoint
CREATE TYPE "public"."page_type_enum" AS ENUM('document', 'dashboard', 'client-database', 'workspace', 'template');--> statement-breakpoint
CREATE TABLE "documents_page" (
	"id" text NOT NULL,
	"_row_id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text DEFAULT 'app',
	"updated_by" text DEFAULT 'app',
	"deleted_by" text,
	"version" integer DEFAULT 1 NOT NULL,
	"source" text,
	"created_by_id" text NOT NULL,
	"parent_id" text,
	"title" text,
	"icon" text,
	"cover_image" text,
	"type" "page_type_enum" DEFAULT 'document' NOT NULL,
	"content" text,
	"content_rich" jsonb,
	"yjs_snapshot" "bytea",
	"layout_config" jsonb,
	"ontology_id" text,
	"text_style" text_style_enum DEFAULT 'default' NOT NULL,
	"small_text" boolean DEFAULT false NOT NULL,
	"full_width" boolean DEFAULT false NOT NULL,
	"lock_page" boolean DEFAULT false NOT NULL,
	"toc" boolean DEFAULT true NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"default_access" "default_access_enum" DEFAULT 'private' NOT NULL,
	"share_token" text,
	"position" double precision,
	"metadata" jsonb,
	CONSTRAINT "documents_page_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "documents_page" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "documents_page" ADD CONSTRAINT "documents_page_created_by_id_shared_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_page" ADD CONSTRAINT "documents_page_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "page_organization_id_idx" ON "documents_page" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "page_created_by_id_idx" ON "documents_page" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "page_parent_id_idx" ON "documents_page" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "page_type_idx" ON "documents_page" USING btree ("type");--> statement-breakpoint
CREATE INDEX "page_is_archived_idx" ON "documents_page" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "page_is_published_idx" ON "documents_page" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "page_share_token_idx" ON "documents_page" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "page_position_idx" ON "documents_page" USING btree ("parent_id","position");--> statement-breakpoint
CREATE INDEX "page_search_idx" ON "documents_page" USING gin ((
        setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("content", '')), 'B')
      ));--> statement-breakpoint
CREATE POLICY "tenant_isolation_documents_page" ON "documents_page" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);