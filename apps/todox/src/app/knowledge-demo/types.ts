export interface EvidenceSpan {
  text: string;
  startChar: number;
  endChar: number;
  confidence?: number;
}

export interface Relation {
  id: string;
  subjectId: string;
  predicate: string;
  objectId?: string;
  literalValue?: string;
  evidence?: EvidenceSpan;
  groundingConfidence?: number;
}

export interface AssembledEntity {
  id: string;
  mention: string;
  primaryType: string;
  types: readonly string[];
  attributes: Record<string, string | number | boolean>;
  confidence: number;
  canonicalName?: string;
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
