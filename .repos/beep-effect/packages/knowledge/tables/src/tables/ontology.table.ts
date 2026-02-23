import type { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const ontology = OrgTable.make(KnowledgeEntityIds.OntologyId)(
  {
    name: pg.text("name").notNull(),
    namespace: pg.text("namespace").notNull(),
    ontologyVersion: pg.text("ontology_version").notNull().default("1.0.0").$type<BS.SemanticVersion.Encoded>(),
    description: pg.text("description"),
    status: pg.text("status").notNull().default("active").$type<"draft" | "active" | "deprecated">(),
    format: pg.text("format").notNull().default("turtle").$type<"turtle" | "rdfxml" | "jsonld" | "ntriples">(),
    contentHash: pg.text("content_hash"),
    storagePath: pg.text("storage_path"),
    classCount: pg.integer("class_count"),
    propertyCount: pg.integer("property_count"),
    metadata: pg.jsonb("metadata").$type<Record<string, string>>(),
  },
  (t) => [
    pg.index("ontology_organization_id_idx").on(t.organizationId),
    pg.index("ontology_name_idx").on(t.name),
    pg.index("ontology_namespace_idx").on(t.namespace),
    pg.index("ontology_status_idx").on(t.status),
    pg
      .uniqueIndex("ontology_org_namespace_name_version_idx")
      .on(t.organizationId, t.namespace, t.name, t.ontologyVersion),
  ]
);
