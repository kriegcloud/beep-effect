CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE TABLE "knowledge_mention_record" (
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
	"extraction_id" text NOT NULL,
	"document_id" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"raw_text" text NOT NULL,
	"mention_type" text NOT NULL,
	"confidence" real NOT NULL,
	"response_hash" text NOT NULL,
	"extracted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_entity_id" text,
	CONSTRAINT "knowledge_mention_record_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_mention_record" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_merge_history" (
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
	"source_entity_id" text NOT NULL,
	"target_entity_id" text NOT NULL,
	"merge_reason" text NOT NULL,
	"confidence" real NOT NULL,
	"merged_by" text,
	"merged_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_merge_history_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_merge_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "knowledge_mention_record" ADD CONSTRAINT "knowledge_mention_record_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_merge_history" ADD CONSTRAINT "knowledge_merge_history_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "mention_record_organization_id_idx" ON "knowledge_mention_record" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "mention_record_extraction_id_idx" ON "knowledge_mention_record" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "mention_record_document_id_idx" ON "knowledge_mention_record" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "mention_record_resolved_entity_id_idx" ON "knowledge_mention_record" USING btree ("resolved_entity_id");--> statement-breakpoint
CREATE INDEX "mention_record_org_extraction_idx" ON "knowledge_mention_record" USING btree ("organization_id","extraction_id");--> statement-breakpoint
CREATE INDEX "mention_record_raw_text_idx" ON "knowledge_mention_record" USING gin ("raw_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "mention_record_document_chunk_idx" ON "knowledge_mention_record" USING btree ("document_id","chunk_index");--> statement-breakpoint
CREATE INDEX "merge_history_organization_id_idx" ON "knowledge_merge_history" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "merge_history_target_entity_id_idx" ON "knowledge_merge_history" USING btree ("target_entity_id");--> statement-breakpoint
CREATE INDEX "merge_history_source_entity_id_idx" ON "knowledge_merge_history" USING btree ("source_entity_id");--> statement-breakpoint
CREATE INDEX "merge_history_org_target_idx" ON "knowledge_merge_history" USING btree ("organization_id","target_entity_id");--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_mention_record" ON "knowledge_mention_record" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_merge_history" ON "knowledge_merge_history" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);