import { KnowledgeEntityIds } from "@beep/shared-domain";

export const MAX_DOCUMENTS_PER_SCENARIO = 25 as const;

// Deterministic ontology id for Enron knowledge demo ingestion.
export const ENRON_DEMO_ONTOLOGY_ID = KnowledgeEntityIds.OntologyId.make(
  "knowledge_ontology__00000000-0000-7000-8000-000000000001"
);
