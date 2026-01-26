ALTER TABLE "knowledge_embedding" ALTER COLUMN "ontology_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "knowledge_embedding" ALTER COLUMN "ontology_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge_entity" ALTER COLUMN "attributes" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "knowledge_entity" ALTER COLUMN "ontology_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "knowledge_entity" ALTER COLUMN "ontology_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge_entity_cluster" ALTER COLUMN "ontology_id" DROP NOT NULL;