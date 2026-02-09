import type { KnowledgeEntityIds } from "@beep/shared-domain";

export interface EvidenceSpan {
  text: string;
  startChar: number;
  endChar: number;
  confidence?: undefined | number;
}

export interface Relation {
  id: KnowledgeEntityIds.RelationId.Type;
  subjectId: KnowledgeEntityIds.KnowledgeEntityId.Type;
  predicate: string;
  objectId?: undefined | KnowledgeEntityIds.KnowledgeEntityId.Type;
  literalValue?: undefined | string;
  evidence?: undefined | EvidenceSpan;
  groundingConfidence?: undefined | number;
}

export interface AssembledEntity {
  id: KnowledgeEntityIds.KnowledgeEntityId.Type;
  mention: string;
  primaryType: string;
  types: readonly string[];
  attributes: Record<string, string | number | boolean>;
  confidence: number;
  canonicalName?: undefined | string;
}

export interface ExtractionResult {
  entities: readonly AssembledEntity[];
  relations: readonly Relation[];
  sourceText: string;
  stats: {
    entityCount: number;
    relationCount: number;
    durationMs: number;
  };
}

export interface GraphRAGConfig {
  readonly topK: number;
  readonly maxHops: number;
}

export interface GraphRAGStats {
  readonly seedEntityCount: number;
  readonly totalEntityCount: number;
  readonly totalRelationCount: number;
  readonly hopsTraversed: number;
  readonly estimatedTokens: number;
  readonly truncated: boolean;
}

export interface GraphRAGResult {
  readonly entities: readonly AssembledEntity[];
  readonly relations: readonly Relation[];
  readonly seeds: readonly AssembledEntity[];
  readonly context: string;
  readonly scores: Record<string, number>;
  readonly stats: GraphRAGStats;
}

// Entity cluster for resolution display
export interface EntityCluster {
  readonly id: KnowledgeEntityIds.EntityClusterId.Type;
  readonly canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly canonicalEntity: AssembledEntity;
  readonly memberIds: readonly string[];
  readonly memberEntities: readonly AssembledEntity[];
  readonly cohesion: number;
  readonly sharedTypes: readonly string[];
}

// Same-as link for provenance display
export interface SameAsLink {
  readonly id: KnowledgeEntityIds.SameAsLinkId.Type;
  readonly canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly memberId: string;
  readonly confidence: number;
  readonly reason: string; // "name_similarity", "attribute_match", etc.
  readonly sourceId?: undefined | string;
}

// Resolution result
export interface ResolutionResult {
  readonly clusters: readonly EntityCluster[];
  readonly sameAsLinks: readonly SameAsLink[];
  readonly stats: {
    readonly originalEntityCount: number;
    readonly resolvedEntityCount: number;
    readonly clusterCount: number;
    readonly sameAsLinkCount: number;
    readonly mergedEntityCount: number;
  };
}

// Extraction session for tracking multiple extractions
export interface ExtractionSession {
  readonly id: KnowledgeEntityIds.ExtractionId.Type;
  readonly timestamp: number;
  readonly sourceText: string;
  readonly entities: readonly AssembledEntity[];
  readonly relations: readonly Relation[];
  readonly stats: ExtractionResult["stats"];
}
