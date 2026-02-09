CREATE TABLE "documents_document_source" (
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
	"document_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"source_thread_id" text,
	"source_uri" text,
	"source_internal_date" timestamp with time zone,
	"source_history_id" text,
	"source_hash" text NOT NULL,
	CONSTRAINT "documents_document_source_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "documents_document_source" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_relation_evidence" (
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
	"relation_id" text NOT NULL,
	"document_id" text NOT NULL,
	"document_version_id" text NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL,
	"text" text NOT NULL,
	"confidence" real,
	"extraction_id" text,
	CONSTRAINT "knowledge_relation_evidence_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_relation_evidence" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_meeting_prep_bullet" (
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
	"meeting_prep_id" text NOT NULL,
	"bullet_index" integer NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "knowledge_meeting_prep_bullet_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_meeting_prep_bullet" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_meeting_prep_evidence" (
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
	"bullet_id" text NOT NULL,
	"source_type" text NOT NULL,
	"mention_id" text,
	"relation_evidence_id" text,
	"document_id" text,
	"document_version_id" text,
	"start_char" integer,
	"end_char" integer,
	"text" text,
	"confidence" real,
	"extraction_id" text,
	CONSTRAINT "knowledge_meeting_prep_evidence_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_meeting_prep_evidence" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_email_thread" (
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
	"provider_account_id" text NOT NULL,
	"source_type" text DEFAULT 'gmail' NOT NULL,
	"source_thread_id" text NOT NULL,
	"subject" text,
	"participants" text[],
	"date_range_earliest" timestamp with time zone,
	"date_range_latest" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	CONSTRAINT "knowledge_email_thread_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_email_thread" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_email_thread_message" (
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
	"thread_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"source_id" text NOT NULL,
	"document_id" text NOT NULL,
	"source_internal_date" timestamp with time zone,
	"source_history_id" text,
	"source_hash" text,
	"ingest_seq" bigint NOT NULL,
	"sort_key" text NOT NULL,
	CONSTRAINT "knowledge_email_thread_message_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_email_thread_message" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "documents_document_version" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge_extraction" ADD COLUMN "document_version_id" text;--> statement-breakpoint
ALTER TABLE "knowledge_mention" ADD COLUMN "document_version_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents_document_source" ADD CONSTRAINT "documents_document_source_document_id_documents_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_document_source" ADD CONSTRAINT "documents_document_source_user_id_shared_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shared_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_document_source" ADD CONSTRAINT "documents_document_source_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_relation_evidence" ADD CONSTRAINT "knowledge_relation_evidence_relation_id_knowledge_relation_id_fk" FOREIGN KEY ("relation_id") REFERENCES "public"."knowledge_relation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relation_evidence" ADD CONSTRAINT "knowledge_relation_evidence_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_meeting_prep_bullet" ADD CONSTRAINT "knowledge_meeting_prep_bullet_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_meeting_prep_evidence" ADD CONSTRAINT "knowledge_meeting_prep_evidence_bullet_id_knowledge_meeting_prep_bullet_id_fk" FOREIGN KEY ("bullet_id") REFERENCES "public"."knowledge_meeting_prep_bullet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_meeting_prep_evidence" ADD CONSTRAINT "knowledge_meeting_prep_evidence_mention_id_knowledge_mention_id_fk" FOREIGN KEY ("mention_id") REFERENCES "public"."knowledge_mention"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_meeting_prep_evidence" ADD CONSTRAINT "knowledge_meeting_prep_evidence_relation_evidence_id_knowledge_relation_evidence_id_fk" FOREIGN KEY ("relation_evidence_id") REFERENCES "public"."knowledge_relation_evidence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_meeting_prep_evidence" ADD CONSTRAINT "knowledge_meeting_prep_evidence_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_email_thread" ADD CONSTRAINT "knowledge_email_thread_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_email_thread_message" ADD CONSTRAINT "knowledge_email_thread_message_thread_id_knowledge_email_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."knowledge_email_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_email_thread_message" ADD CONSTRAINT "knowledge_email_thread_message_org_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "document_source_org_id_idx" ON "documents_document_source" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "document_source_document_id_idx" ON "documents_document_source" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_source_user_id_idx" ON "documents_document_source" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_source_provider_account_id_idx" ON "documents_document_source" USING btree ("provider_account_id");--> statement-breakpoint
CREATE INDEX "document_source_thread_id_idx" ON "documents_document_source" USING btree ("source_thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_source_org_provider_source_uidx" ON "documents_document_source" USING btree ("organization_id","provider_account_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "relation_evidence_organization_id_idx" ON "knowledge_relation_evidence" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "relation_evidence_relation_id_idx" ON "knowledge_relation_evidence" USING btree ("relation_id");--> statement-breakpoint
CREATE INDEX "relation_evidence_document_id_idx" ON "knowledge_relation_evidence" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "relation_evidence_document_version_id_idx" ON "knowledge_relation_evidence" USING btree ("document_version_id");--> statement-breakpoint
CREATE INDEX "relation_evidence_extraction_id_idx" ON "knowledge_relation_evidence" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "relation_evidence_char_range_idx" ON "knowledge_relation_evidence" USING btree ("document_id","start_char","end_char");--> statement-breakpoint
CREATE INDEX "meeting_prep_bullet_organization_id_idx" ON "knowledge_meeting_prep_bullet" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "meeting_prep_bullet_meeting_prep_id_idx" ON "knowledge_meeting_prep_bullet" USING btree ("meeting_prep_id");--> statement-breakpoint
CREATE INDEX "meeting_prep_bullet_meeting_prep_id_bullet_index_idx" ON "knowledge_meeting_prep_bullet" USING btree ("meeting_prep_id","bullet_index");--> statement-breakpoint
CREATE INDEX "meeting_prep_evidence_organization_id_idx" ON "knowledge_meeting_prep_evidence" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "meeting_prep_evidence_bullet_id_idx" ON "knowledge_meeting_prep_evidence" USING btree ("bullet_id");--> statement-breakpoint
CREATE INDEX "meeting_prep_evidence_source_type_idx" ON "knowledge_meeting_prep_evidence" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "meeting_prep_evidence_mention_id_idx" ON "knowledge_meeting_prep_evidence" USING btree ("mention_id");--> statement-breakpoint
CREATE INDEX "meeting_prep_evidence_relation_evidence_id_idx" ON "knowledge_meeting_prep_evidence" USING btree ("relation_evidence_id");--> statement-breakpoint
CREATE INDEX "meeting_prep_evidence_document_id_idx" ON "knowledge_meeting_prep_evidence" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "meeting_prep_evidence_extraction_id_idx" ON "knowledge_meeting_prep_evidence" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "email_thread_organization_id_idx" ON "knowledge_email_thread" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_thread_provider_account_id_idx" ON "knowledge_email_thread" USING btree ("provider_account_id");--> statement-breakpoint
CREATE INDEX "email_thread_source_thread_id_idx" ON "knowledge_email_thread" USING btree ("source_thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_thread_org_provider_source_thread_uidx" ON "knowledge_email_thread" USING btree ("organization_id","provider_account_id","source_thread_id");--> statement-breakpoint
CREATE INDEX "email_thread_message_organization_id_idx" ON "knowledge_email_thread_message" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_thread_message_thread_id_idx" ON "knowledge_email_thread_message" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "email_thread_message_provider_account_id_idx" ON "knowledge_email_thread_message" USING btree ("provider_account_id");--> statement-breakpoint
CREATE INDEX "email_thread_message_source_id_idx" ON "knowledge_email_thread_message" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "email_thread_message_document_id_idx" ON "knowledge_email_thread_message" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "email_thread_message_thread_sort_key_idx" ON "knowledge_email_thread_message" USING btree ("thread_id","sort_key");--> statement-breakpoint
CREATE UNIQUE INDEX "email_thread_message_org_provider_source_uidx" ON "knowledge_email_thread_message" USING btree ("organization_id","provider_account_id","source_id");--> statement-breakpoint
CREATE INDEX "extraction_document_version_id_idx" ON "knowledge_extraction" USING btree ("document_version_id");--> statement-breakpoint
CREATE INDEX "mention_document_version_id_idx" ON "knowledge_mention" USING btree ("document_version_id");--> statement-breakpoint
CREATE POLICY "tenant_isolation_documents_document_source" ON "documents_document_source" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_relation_evidence" ON "knowledge_relation_evidence" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_meeting_prep_bullet" ON "knowledge_meeting_prep_bullet" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_meeting_prep_evidence" ON "knowledge_meeting_prep_evidence" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_email_thread" ON "knowledge_email_thread" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);--> statement-breakpoint
CREATE POLICY "tenant_isolation_knowledge_email_thread_message" ON "knowledge_email_thread_message" AS PERMISSIVE FOR ALL TO public USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text) WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);