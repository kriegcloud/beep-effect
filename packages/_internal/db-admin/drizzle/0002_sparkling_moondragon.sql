CREATE TABLE "knowledge_class_definition" (
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
	"ontology_id" text NOT NULL,
	"iri" text NOT NULL,
	"label" text NOT NULL,
	"comment" text,
	"local_name" text,
	"properties" jsonb,
	"pref_labels" jsonb,
	"alt_labels" jsonb,
	"hidden_labels" jsonb,
	"definition" text,
	"scope_note" text,
	"example" text,
	"broader" jsonb,
	"narrower" jsonb,
	"related" jsonb,
	"equivalent_class" jsonb,
	"exact_match" jsonb,
	"close_match" jsonb,
	CONSTRAINT "knowledge_class_definition_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_entity" (
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
	"mention" text NOT NULL,
	"types" jsonb NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ontology_id" text DEFAULT 'default' NOT NULL,
	"document_id" text,
	"source_uri" text,
	"extraction_id" text,
	"grounding_confidence" real,
	"mentions" jsonb,
	CONSTRAINT "knowledge_entity_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_extraction" (
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
	"source_uri" text,
	"ontology_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"entity_count" integer,
	"relation_count" integer,
	"chunk_count" integer,
	"total_tokens" integer,
	"error_message" text,
	"config" jsonb,
	CONSTRAINT "knowledge_extraction_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_mention" (
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
	"entity_id" text NOT NULL,
	"text" text NOT NULL,
	"start_char" integer NOT NULL,
	"end_char" integer NOT NULL,
	"document_id" text NOT NULL,
	"chunk_index" integer,
	"extraction_id" text,
	"confidence" real,
	"is_primary" boolean DEFAULT false NOT NULL,
	"context" text,
	CONSTRAINT "knowledge_mention_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_ontology" (
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
	"name" text NOT NULL,
	"namespace" text NOT NULL,
	"ontology_version" text DEFAULT '1.0.0' NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"format" text DEFAULT 'turtle' NOT NULL,
	"content_hash" text,
	"storage_path" text,
	"class_count" integer,
	"property_count" integer,
	"metadata" jsonb,
	CONSTRAINT "knowledge_ontology_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_property_definition" (
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
	"ontology_id" text NOT NULL,
	"iri" text NOT NULL,
	"label" text NOT NULL,
	"comment" text,
	"local_name" text,
	"domain" jsonb,
	"range" jsonb,
	"range_type" text DEFAULT 'object' NOT NULL,
	"is_functional" boolean DEFAULT false NOT NULL,
	"inverse_of" jsonb,
	"pref_labels" jsonb,
	"alt_labels" jsonb,
	"hidden_labels" jsonb,
	"definition" text,
	"scope_note" text,
	"example" text,
	"broader" jsonb,
	"narrower" jsonb,
	"related" jsonb,
	"exact_match" jsonb,
	"close_match" jsonb,
	CONSTRAINT "knowledge_property_definition_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_relation" (
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
	"subject_id" text NOT NULL,
	"predicate" text NOT NULL,
	"object_id" text,
	"literal_value" text,
	"literal_type" text,
	"ontology_id" text DEFAULT 'default' NOT NULL,
	"extraction_id" text,
	"evidence" jsonb,
	"grounding_confidence" real,
	CONSTRAINT "knowledge_relation_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_class_definition" ADD CONSTRAINT "knowledge_class_definition_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_class_definition" ADD CONSTRAINT "knowledge_class_definition_ontology_id_knowledge_ontology_id_fk" FOREIGN KEY ("ontology_id") REFERENCES "public"."knowledge_ontology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_entity" ADD CONSTRAINT "knowledge_entity_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_extraction" ADD CONSTRAINT "knowledge_extraction_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_mention" ADD CONSTRAINT "knowledge_mention_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_ontology" ADD CONSTRAINT "knowledge_ontology_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_property_definition" ADD CONSTRAINT "knowledge_property_definition_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "knowledge_property_definition" ADD CONSTRAINT "knowledge_property_definition_ontology_id_knowledge_ontology_id_fk" FOREIGN KEY ("ontology_id") REFERENCES "public"."knowledge_ontology"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relation" ADD CONSTRAINT "knowledge_relation_organization_id_shared_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."shared_organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "class_definition_organization_id_idx" ON "knowledge_class_definition" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "class_definition_ontology_id_idx" ON "knowledge_class_definition" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "class_definition_iri_idx" ON "knowledge_class_definition" USING btree ("iri");--> statement-breakpoint
CREATE INDEX "class_definition_label_idx" ON "knowledge_class_definition" USING btree ("label");--> statement-breakpoint
CREATE UNIQUE INDEX "class_definition_ontology_iri_idx" ON "knowledge_class_definition" USING btree ("ontology_id","iri");--> statement-breakpoint
CREATE INDEX "entity_organization_id_idx" ON "knowledge_entity" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "entity_ontology_id_idx" ON "knowledge_entity" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "entity_document_id_idx" ON "knowledge_entity" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "entity_extraction_id_idx" ON "knowledge_entity" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "extraction_organization_id_idx" ON "knowledge_extraction" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "extraction_document_id_idx" ON "knowledge_extraction" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "extraction_ontology_id_idx" ON "knowledge_extraction" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "extraction_status_idx" ON "knowledge_extraction" USING btree ("status");--> statement-breakpoint
CREATE INDEX "extraction_status_created_at_idx" ON "knowledge_extraction" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "mention_organization_id_idx" ON "knowledge_mention" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "mention_entity_id_idx" ON "knowledge_mention" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "mention_document_id_idx" ON "knowledge_mention" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "mention_extraction_id_idx" ON "knowledge_mention" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "mention_char_range_idx" ON "knowledge_mention" USING btree ("document_id","start_char","end_char");--> statement-breakpoint
CREATE INDEX "mention_primary_idx" ON "knowledge_mention" USING btree ("entity_id","is_primary");--> statement-breakpoint
CREATE INDEX "ontology_organization_id_idx" ON "knowledge_ontology" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ontology_name_idx" ON "knowledge_ontology" USING btree ("name");--> statement-breakpoint
CREATE INDEX "ontology_namespace_idx" ON "knowledge_ontology" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "ontology_status_idx" ON "knowledge_ontology" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ontology_org_namespace_name_version_idx" ON "knowledge_ontology" USING btree ("organization_id","namespace","name","ontology_version");--> statement-breakpoint
CREATE INDEX "property_definition_organization_id_idx" ON "knowledge_property_definition" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "property_definition_ontology_id_idx" ON "knowledge_property_definition" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "property_definition_iri_idx" ON "knowledge_property_definition" USING btree ("iri");--> statement-breakpoint
CREATE INDEX "property_definition_label_idx" ON "knowledge_property_definition" USING btree ("label");--> statement-breakpoint
CREATE INDEX "property_definition_range_type_idx" ON "knowledge_property_definition" USING btree ("range_type");--> statement-breakpoint
CREATE UNIQUE INDEX "property_definition_ontology_iri_idx" ON "knowledge_property_definition" USING btree ("ontology_id","iri");--> statement-breakpoint
CREATE INDEX "relation_organization_id_idx" ON "knowledge_relation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "relation_subject_id_idx" ON "knowledge_relation" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "relation_object_id_idx" ON "knowledge_relation" USING btree ("object_id");--> statement-breakpoint
CREATE INDEX "relation_predicate_idx" ON "knowledge_relation" USING btree ("predicate");--> statement-breakpoint
CREATE INDEX "relation_ontology_id_idx" ON "knowledge_relation" USING btree ("ontology_id");--> statement-breakpoint
CREATE INDEX "relation_extraction_id_idx" ON "knowledge_relation" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "relation_triple_idx" ON "knowledge_relation" USING btree ("subject_id","predicate","object_id");