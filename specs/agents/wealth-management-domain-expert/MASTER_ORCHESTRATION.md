# Master Orchestration: Wealth Management Domain Expert Agent

## Overview

This document orchestrates the 6-phase implementation of a wealth management domain expert agent capable of:

1. **Ontology-Guided Extraction**: Constrain LLM outputs to valid wealth management concepts
2. **Evidence Linking**: Every extracted fact traces to source text (compliance critical)
3. **Entity Resolution**: Unify identities across custodian feeds, CRM, and documents
4. **GraphRAG Context Assembly**: Intelligent subgraph retrieval for agent queries

## Phase Summary

| Phase | Name | Sessions | Key Deliverables |
|-------|------|----------|------------------|
| P0 | Ontology Design | 1-2 | OWL/RDFS class hierarchy, property definitions |
| P1 | Domain Models | 2-3 | Effect Schema implementations, validation constraints |
| P2 | Extraction Pipeline | 2-3 | Stage implementations, ontology-guided prompts |
| P3 | Entity Resolution | 1-2 | Clustering, canonical selection, `owl:sameAs` links |
| P4 | GraphRAG Context | 1-2 | k-NN search, N-hop traversal, RRF ranking |
| P5 | Agent Integration | 1-2 | Agent prompt, tools, evidence citations |

---

## Phase 0: Ontology Design

### Objective
Define the wealth management domain ontology using OWL/RDFS semantics, establishing class hierarchies, property definitions, and constraint rules.

### Inputs
- Domain research (industry structure, compliance requirements)
- Existing knowledge graph patterns:
  - `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:97-108` - ClassDefinition schema
  - `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:163-173` - 6-phase extraction pipeline
- Effect-ontology reference implementation

### Tasks

#### P0.1: Core Entity Classes
Define the primary entity classes for the wealth management domain:

```turtle
# Priority 0 (Core)
wm:Client rdfs:subClassOf owl:Thing .
wm:Account rdfs:subClassOf owl:Thing .
wm:Investment rdfs:subClassOf owl:Thing .
wm:Document rdfs:subClassOf owl:Thing .

# Priority 1 (Complex Structures)
wm:Household rdfs:subClassOf owl:Thing .
wm:Trust rdfs:subClassOf wm:Entity .
wm:Entity rdfs:subClassOf owl:Thing .  # LLC, LP, Foundation
wm:Beneficiary rdfs:subClassOf owl:Thing .

# Priority 2 (Financial Planning)
wm:Goal rdfs:subClassOf owl:Thing .
wm:Plan rdfs:subClassOf owl:Thing .
wm:Projection rdfs:subClassOf owl:Thing .
```

#### P0.2: Property Definitions
Define object properties (relationships) and datatype properties (attributes):

**Object Properties**:
```turtle
wm:ownsAccount a owl:ObjectProperty ;
    rdfs:domain wm:Client ;
    rdfs:range wm:Account .

wm:containsInvestment a owl:ObjectProperty ;
    rdfs:domain wm:Account ;
    rdfs:range wm:Investment .

wm:hasBeneficiary a owl:ObjectProperty ;
    rdfs:domain [ owl:unionOf (wm:Account wm:Trust) ] ;
    rdfs:range wm:Beneficiary .

wm:establishedBy a owl:ObjectProperty ;
    rdfs:domain wm:Trust ;
    rdfs:range wm:Client .

wm:managedBy a owl:ObjectProperty ;
    rdfs:domain wm:Trust ;
    rdfs:range [ owl:unionOf (wm:Client wm:Entity) ] .

wm:evidenceFor a owl:ObjectProperty ;
    rdfs:domain wm:Document ;
    rdfs:range owl:Thing .
```

**Datatype Properties**:
```turtle
wm:taxId a owl:DatatypeProperty ;
    rdfs:domain [ owl:unionOf (wm:Client wm:Entity wm:Trust) ] ;
    rdfs:range xsd:string .

wm:netWorth a owl:DatatypeProperty ;
    rdfs:domain wm:Client ;
    rdfs:range xsd:decimal .

wm:riskTolerance a owl:DatatypeProperty ;
    rdfs:domain wm:Client ;
    rdfs:range [ owl:oneOf ("Conservative" "Moderate" "Aggressive") ] .

wm:kycStatus a owl:DatatypeProperty ;
    rdfs:domain wm:Client ;
    rdfs:range [ owl:oneOf ("Pending" "Verified" "Expired") ] .
```

#### P0.3: Relationship Cardinality & Constraints
Define constraints for domain integrity:

```turtle
# Client must have at least one account
wm:Client rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty wm:ownsAccount ;
    owl:minCardinality 1
] .

# Trust must have exactly one grantor
wm:Trust rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty wm:establishedBy ;
    owl:cardinality 1
] .

# Account must be held by exactly one custodian
wm:Account rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty wm:heldByCustodian ;
    owl:cardinality 1
] .
```

#### P0.4: Evidence Linking Properties
Define properties for compliance-critical provenance:

```turtle
wm:hasEvidence a owl:ObjectProperty ;
    rdfs:domain owl:Thing ;
    rdfs:range wm:EvidenceSpan .

wm:evidenceText a owl:DatatypeProperty ;
    rdfs:domain wm:EvidenceSpan ;
    rdfs:range xsd:string .

wm:startChar a owl:DatatypeProperty ;
    rdfs:domain wm:EvidenceSpan ;
    rdfs:range xsd:nonNegativeInteger .

wm:endChar a owl:DatatypeProperty ;
    rdfs:domain wm:EvidenceSpan ;
    rdfs:range xsd:nonNegativeInteger .

wm:sourceDocument a owl:ObjectProperty ;
    rdfs:domain wm:EvidenceSpan ;
    rdfs:range wm:Document .
```

### Outputs
- `outputs/wealth-management.ttl` - Complete ontology in Turtle format
- `outputs/ontology-class-hierarchy.md` - Visual class hierarchy
- `outputs/property-inventory.md` - Property definitions with domains/ranges

### Verification
```bash
# Validate ontology syntax
bun run scripts/validate-ontology.ts outputs/wealth-management.ttl

# Count classes and properties
grep -c "owl:Class" outputs/wealth-management.ttl
grep -c "owl:ObjectProperty" outputs/wealth-management.ttl
grep -c "owl:DatatypeProperty" outputs/wealth-management.ttl
```

### Handoff
- Create `handoffs/HANDOFF_P1.md` with verified ontology structure
- Create `handoffs/P1_ORCHESTRATOR_PROMPT.md` for Effect Schema implementation

---

## Phase 1: Domain Model Implementation

### Objective
Implement Effect Schema models for wealth management entities, integrating with `@beep/knowledge-domain` patterns.

### Inputs
- Validated ontology from Phase 0
- Existing knowledge domain models:
  - `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:46-135` - Entity model pattern
  - `packages/knowledge/domain/src/entities/Relation/Relation.model.ts:45-148` - Relation model pattern
  - `packages/knowledge/domain/src/entities/Mention/Mention.model.ts:49-148` - Mention model pattern
  - `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts:75-183` - Ontology model
  - `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts:36-76` - EvidenceSpan pattern
- Effect Schema patterns:
  - `.claude/rules/effect-patterns.md` (lines 1-150) - Namespace imports, PascalCase constructors
  - `.claude/rules/effect-patterns.md` (lines 150-250) - BS helper reference, sensitive fields

### Tasks

#### P1.1: Entity ID Definitions
Add wealth management entity IDs to shared domain:

```typescript
// packages/shared/domain/src/entity-ids/wealth-management/ids.ts
import * as B from "effect/Brand";
import * as S from "effect/Schema";

export const ClientId = S.String.pipe(
  S.brand("ClientId"),
  S.annotations({ identifier: "ClientId" })
);
export type ClientId = S.Schema.Type<typeof ClientId>;

export const AccountId = S.String.pipe(
  S.brand("AccountId"),
  S.annotations({ identifier: "AccountId" })
);
export type AccountId = S.Schema.Type<typeof AccountId>;

export const TrustId = S.String.pipe(
  S.brand("TrustId"),
  S.annotations({ identifier: "TrustId" })
);
export type TrustId = S.Schema.Type<typeof TrustId>;

// ... additional IDs
```

#### P1.2: Core Entity Models
Implement Effect Schema models following knowledge domain patterns:

```typescript
// packages/knowledge/domain/src/entities/WmClient/WmClient.model.ts
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { EvidenceSpan } from "../../value-objects/EvidenceSpan.js";
import { BS } from "@beep/schema";

export const RiskTolerance = S.Literal("Conservative", "Moderate", "Aggressive");
export const KycStatus = S.Literal("Pending", "Verified", "Expired");
export const ClientTier = S.Literal("UHNWI", "VHNWI");

export class Model extends M.Class<Model>("WmClientModel")(
  makeFields(WealthManagementEntityIds.ClientId, {
    organizationId: SharedEntityIds.OrganizationId,
    legalName: S.String,
    dateOfBirth: BS.FieldOptionOmittable(S.Date),
    taxId: BS.FieldSensitiveOptionOmittable(S.String),
    citizenship: S.Array(S.String),
    residencyState: S.String,
    residencyCountry: S.String,
    riskTolerance: RiskTolerance,
    investmentObjectives: S.Array(S.String),
    netWorth: S.Number,
    netWorthAsOf: S.Date,
    tier: ClientTier,
    kycStatus: KycStatus,
    amlCheckDate: BS.FieldOptionOmittable(S.Date),
    isPep: BS.BoolWithDefault(false),
    mentions: BS.FieldOptionOmittable(S.Array(EvidenceSpan)),
    groundingConfidence: BS.FieldOptionOmittable(
      S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))
    ),
  }),
  // ...
) {}
```

#### P1.3: Relationship Models
Implement relationship models for ownership and beneficiary structures:

```typescript
// packages/knowledge/domain/src/entities/WmOwnership/WmOwnership.model.ts
export class Model extends M.Class<Model>("WmOwnershipModel")(
  makeFields(WealthManagementEntityIds.OwnershipId, {
    subjectId: WealthManagementEntityIds.ClientId,
    predicate: S.Literal(
      "wm:ownsAccount",
      "wm:hasBeneficiary",
      "wm:establishedBy",
      "wm:managedBy"
    ),
    objectId: S.String, // Account, Trust, or Entity ID
    ownershipPercentage: BS.FieldOptionOmittable(S.Number.pipe(S.greaterThan(0), S.lessThanOrEqualTo(1))),
    role: BS.FieldOptionOmittable(S.Literal(
      "owner", "beneficiary", "grantor", "trustee", "successor_trustee",
      "managing_member", "general_partner", "limited_partner"
    )),
    effectiveDate: BS.FieldOptionOmittable(S.Date),
    terminationDate: BS.FieldOptionOmittable(S.Date),
    evidence: BS.FieldOptionOmittable(EvidenceSpan),
    groundingConfidence: BS.FieldOptionOmittable(
      S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))
    ),
  }),
  // ...
) {}
```

#### P1.4: Compliance Validation Constraints
Implement validation rules for regulatory compliance:

```typescript
// packages/knowledge/domain/src/value-objects/WmValidation.ts
import * as S from "effect/Schema";

// Tax ID validation (SSN format: XXX-XX-XXXX or EIN format: XX-XXXXXXX)
export const TaxIdFormat = S.String.pipe(
  S.pattern(/^(\d{3}-\d{2}-\d{4}|\d{2}-\d{7})$/),
  S.annotations({ description: "SSN or EIN format" })
);

// Net worth must be at least $30M for UHNWI
export const UHNWINetWorth = S.Number.pipe(
  S.greaterThanOrEqualTo(30_000_000),
  S.annotations({ description: "UHNWI threshold: $30M+" })
);

// KYC must be verified within 12 months
export const KycValidation = S.Struct({
  status: S.Literal("Verified"),
  verifiedAt: S.Date,
}).pipe(
  S.filter((kyc) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return kyc.verifiedAt >= oneYearAgo;
  }, { message: () => "KYC verification expired (>12 months old)" })
);
```

### Outputs
- `packages/knowledge/domain/src/entities/WmClient/` - Client model
- `packages/knowledge/domain/src/entities/WmAccount/` - Account model
- `packages/knowledge/domain/src/entities/WmTrust/` - Trust model
- `packages/knowledge/domain/src/entities/WmOwnership/` - Ownership relationship model
- `packages/shared/domain/src/entity-ids/wealth-management/` - Entity IDs

### Verification
```bash
bun run check --filter @beep/knowledge-domain
bun run test --filter @beep/knowledge-domain
```

### Handoff
- Create `handoffs/HANDOFF_P2.md` with model implementations
- Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` for extraction pipeline

---

## Phase 2: Extraction Pipeline

### Objective
Implement ontology-guided extraction stages for wealth management documents.

### Inputs
- Domain models from Phase 1
- Extraction pipeline patterns (`specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md`)
- 6-phase extraction architecture (CHUNK → MENTION → ENTITY → SCOPE → RELATION → GROUND)

### Tasks

#### P2.1: Wealth Management Chunking Strategy
Implement document chunking optimized for wealth management documents:

```typescript
// packages/knowledge/server/src/extraction/wm-chunk.stage.ts
export const WmChunkStage = Effect.gen(function* () {
  // Wealth management documents often have:
  // - Account statements with tabular data
  // - Legal documents with section headers
  // - Meeting notes with date/time boundaries

  const chunkConfig = {
    maxChunkSize: 1500, // tokens
    overlapSize: 200,   // tokens
    sentenceAware: true,
    preserveStructure: {
      tables: true,      // Keep account tables intact
      sections: true,    // Preserve legal document sections
      lists: true,       // Keep beneficiary lists together
    },
  };

  return chunkConfig;
});
```

#### P2.2: Entity Extraction Prompts
Create ontology-guided prompts for entity extraction:

```typescript
// packages/knowledge/server/src/extraction/wm-entity.stage.ts
const entityExtractionPrompt = (chunk: string, ontologyContext: OntologyContext) => `
You are extracting wealth management entities from the following text.

## Valid Entity Types
${ontologyContext.classDefinitions.map(c => `- ${c.label}: ${c.comment}`).join("\n")}

## Text to Analyze
${chunk}

## Instructions
1. Extract all entities matching the valid types above
2. For each entity, provide:
   - type: One of the valid entity types
   - mention: The exact text span where the entity appears
   - attributes: Key-value pairs matching the entity type's properties
   - startChar: Character offset where mention starts
   - endChar: Character offset where mention ends (exclusive)

## Output Schema
Return a JSON array of entities matching this schema:
${JSON.stringify(entitySchema, null, 2)}

CRITICAL: Only extract entities of the valid types listed above. Do not invent new types.
`;
```

#### P2.3: Relation Extraction with Property Scoping
Implement property-scoped relation extraction:

```typescript
// packages/knowledge/server/src/extraction/wm-relation.stage.ts
const getValidProperties = (subjectType: string, ontologyContext: OntologyContext) => {
  const classDef = ontologyContext.classDefinitions.get(subjectType);
  if (!classDef) return [];

  // Return properties where domain includes this type
  return ontologyContext.propertyDefinitions.filter(prop =>
    prop.domain.includes(subjectType) || prop.domain.includes("owl:Thing")
  );
};

const relationExtractionPrompt = (
  entities: Entity[],
  chunk: string,
  ontologyContext: OntologyContext
) => `
You are extracting relationships between wealth management entities.

## Entities Found
${entities.map(e => `- ${e.mention} (${e.type})`).join("\n")}

## Valid Relationships by Entity Type
${entities.map(e => {
  const props = getValidProperties(e.type, ontologyContext);
  return `### ${e.mention} (${e.type})
${props.map(p => `- ${p.label}: ${p.comment}`).join("\n")}`;
}).join("\n\n")}

## Text
${chunk}

## Instructions
Extract relationships between the entities above. For each relationship:
1. subjectId: ID of the source entity
2. predicate: One of the valid relationships for that entity type
3. objectId: ID of the target entity (if object property)
4. literalValue: Value (if datatype property)
5. evidence: The exact text span expressing this relationship

CRITICAL: Only use predicates valid for the subject entity's type.
`;
```

#### P2.4: Grounding Service
Implement hallucination filtering via embedding similarity:

```typescript
// packages/knowledge/server/src/extraction/wm-ground.stage.ts
const groundRelation = (
  relation: ExtractedRelation,
  sourceText: string,
  embeddingService: EmbeddingService
) =>
  Effect.gen(function* () {
    // Convert relation to natural language statement
    const statement = formatRelationAsStatement(relation);

    // Embed both statement and source text
    const [stmtEmbed, textEmbed] = yield* Effect.all([
      embeddingService.embed(statement, "search_query"),
      embeddingService.embed(sourceText, "search_document"),
    ]);

    // Calculate cosine similarity
    const similarity = cosineSimilarity(stmtEmbed, textEmbed);

    // Filter by threshold (0.8 filters >90% hallucinations)
    if (similarity >= 0.8) {
      return O.some({ ...relation, groundingConfidence: similarity });
    }

    // Log rejected relation for analysis
    yield* Effect.logWarning("Relation rejected by grounding", {
      relation,
      similarity,
      threshold: 0.8,
    });

    return O.none();
  });
```

### Outputs
- `packages/knowledge/server/src/extraction/wm-chunk.stage.ts`
- `packages/knowledge/server/src/extraction/wm-mention.stage.ts`
- `packages/knowledge/server/src/extraction/wm-entity.stage.ts`
- `packages/knowledge/server/src/extraction/wm-scope.stage.ts`
- `packages/knowledge/server/src/extraction/wm-relation.stage.ts`
- `packages/knowledge/server/src/extraction/wm-ground.stage.ts`

### Verification
```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server -- --grep "extraction"
```

### Handoff
- Create `handoffs/HANDOFF_P3.md` with extraction pipeline
- Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` for entity resolution

---

## Phase 3: Entity Resolution

### Objective
Implement cross-source entity matching to unify identities across custodian feeds, CRM systems, and documents.

### Inputs
- Extraction pipeline from Phase 2
- Entity resolution patterns (`specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md:860-872`)
- Embedding infrastructure

### Tasks

#### P3.1: Entity Fingerprinting
Create fingerprints for entity matching:

```typescript
// packages/knowledge/server/src/resolution/fingerprint.ts
const createClientFingerprint = (client: WmClient) => ({
  // Primary identifiers
  taxId: client.taxId ? hashSensitive(client.taxId) : null,

  // Fuzzy matching fields
  normalizedName: normalizeName(client.legalName),
  dateOfBirth: client.dateOfBirth?.toISOString().slice(0, 10),

  // Location-based
  residencyKey: `${client.residencyState}-${client.residencyCountry}`,
});

const createAccountFingerprint = (account: WmAccount) => ({
  // Primary identifier
  accountNumber: account.accountNumber,
  custodian: account.custodian,

  // Fuzzy matching
  normalizedName: normalizeName(account.accountName),
  type: account.type,
});
```

#### P3.2: Similarity-Based Clustering
Implement embedding-based entity clustering:

```typescript
// packages/knowledge/server/src/resolution/clustering.ts
const clusterEntities = (
  entities: Entity[],
  embeddingService: EmbeddingService
) =>
  Effect.gen(function* () {
    // 1. Embed all entities
    const embeddings = yield* Effect.all(
      entities.map(e =>
        embeddingService.embed(entityToText(e), "search_document")
      )
    );

    // 2. Calculate pairwise similarities
    const similarityMatrix = calculateSimilarityMatrix(embeddings);

    // 3. Cluster with threshold (0.85 for high precision)
    const clusters = agglomerativeClustering(similarityMatrix, 0.85);

    // 4. Select canonical entity per cluster
    return clusters.map(cluster => ({
      canonical: selectCanonical(cluster, entities),
      members: cluster,
      sameAsLinks: cluster.map(memberId => ({
        from: cluster[0], // canonical
        to: memberId,
        confidence: similarityMatrix[cluster[0]][memberId],
      })),
    }));
  });
```

#### P3.3: Cross-Source Matching
Match entities across integration sources:

```typescript
// packages/knowledge/server/src/resolution/cross-source.ts
const matchAcrossSources = (
  custodianEntities: Entity[],
  crmEntities: Entity[],
  documentEntities: Entity[]
) =>
  Effect.gen(function* () {
    // Priority order: Custodian > CRM > Document
    // Custodian data is authoritative for financial identifiers

    const allEntities = [
      ...custodianEntities.map(e => ({ ...e, source: "custodian", priority: 1 })),
      ...crmEntities.map(e => ({ ...e, source: "crm", priority: 2 })),
      ...documentEntities.map(e => ({ ...e, source: "document", priority: 3 })),
    ];

    // Cluster all entities
    const clusters = yield* clusterEntities(allEntities);

    // For each cluster, merge attributes with priority resolution
    return clusters.map(cluster => {
      const sorted = A.sortBy(cluster.members, (m) => m.priority);
      return mergeEntityAttributes(sorted);
    });
  });
```

#### P3.4: Maintain owl:sameAs Links
Store provenance for merged entities:

```typescript
// packages/knowledge/server/src/resolution/same-as.ts
const createSameAsRelation = (
  canonicalId: EntityId,
  memberId: EntityId,
  confidence: number,
  source: string
) => ({
  subjectId: canonicalId,
  predicate: "owl:sameAs",
  objectId: memberId,
  literalValue: null,
  evidence: {
    text: `Entity resolution: ${source}`,
    startChar: 0,
    endChar: 0,
    confidence,
  },
  groundingConfidence: confidence,
});
```

### Outputs
- `packages/knowledge/server/src/resolution/fingerprint.ts`
- `packages/knowledge/server/src/resolution/clustering.ts`
- `packages/knowledge/server/src/resolution/cross-source.ts`
- `packages/knowledge/server/src/resolution/same-as.ts`

### Verification
```bash
bun run test --filter @beep/knowledge-server -- --grep "resolution"

# Measure F1 score on test dataset
bun run scripts/evaluate-entity-resolution.ts
```

### Handoff
- Create `handoffs/HANDOFF_P4.md` with entity resolution implementation
- Create `handoffs/P4_ORCHESTRATOR_PROMPT.md` for GraphRAG context

---

## Phase 4: GraphRAG Context Assembly

### Objective
Implement intelligent context assembly for agent queries using k-NN search and subgraph traversal.

### Inputs
- Entity resolution from Phase 3
- pgvector infrastructure
- GraphRAG patterns (`specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md:877-892`)

### Tasks

#### P4.1: k-NN Entity Search
Implement fast entity retrieval:

```typescript
// packages/knowledge/server/src/graphrag/knn-search.ts
const knnEntitySearch = (
  query: string,
  k: number,
  ontologyId: string,
  organizationId: string
) =>
  Effect.gen(function* () {
    const embeddingService = yield* EmbeddingService;
    const db = yield* Database;

    // Embed query
    const queryEmbedding = yield* embeddingService.embed(query, "search_query");

    // pgvector k-NN search
    const results = yield* db.query`
      SELECT e.*, 1 - (e.embedding <=> ${queryEmbedding}::vector) as similarity
      FROM knowledge.entities e
      WHERE e.organization_id = ${organizationId}
        AND e.ontology_id = ${ontologyId}
      ORDER BY e.embedding <=> ${queryEmbedding}::vector
      LIMIT ${k}
    `;

    return results;
  });
```

#### P4.2: N-hop Subgraph Traversal
Expand context with relationship traversal:

```typescript
// packages/knowledge/server/src/graphrag/traversal.ts
const nHopTraversal = (
  seedEntityIds: EntityId[],
  hops: 1 | 2,
  maxNodes: number
) =>
  Effect.gen(function* () {
    const db = yield* Database;

    // 1-hop: Direct neighbors
    const hop1 = yield* db.query`
      SELECT DISTINCT e.*
      FROM knowledge.relations r
      JOIN knowledge.entities e ON (r.object_id = e.id OR r.subject_id = e.id)
      WHERE r.subject_id = ANY(${seedEntityIds})
         OR r.object_id = ANY(${seedEntityIds})
      LIMIT ${maxNodes}
    `;

    if (hops === 1) return hop1;

    // 2-hop: Neighbors of neighbors
    const hop1Ids = hop1.map(e => e.id);
    const hop2 = yield* db.query`
      SELECT DISTINCT e.*
      FROM knowledge.relations r
      JOIN knowledge.entities e ON (r.object_id = e.id OR r.subject_id = e.id)
      WHERE r.subject_id = ANY(${hop1Ids})
         OR r.object_id = ANY(${hop1Ids})
      LIMIT ${maxNodes - hop1.length}
    `;

    return [...hop1, ...hop2];
  });
```

#### P4.3: RRF Scoring
Combine retrieval signals with Reciprocal Rank Fusion:

```typescript
// packages/knowledge/server/src/graphrag/rrf.ts
const reciprocalRankFusion = (
  knnResults: ScoredEntity[],
  traversalResults: Entity[],
  k: number = 60
) => {
  const scores = new Map<EntityId, number>();

  // Score from k-NN ranking
  knnResults.forEach((entity, rank) => {
    const score = 1 / (k + rank + 1);
    scores.set(entity.id, (scores.get(entity.id) ?? 0) + score);
  });

  // Score from traversal (uniform weight for connectedness)
  traversalResults.forEach((entity, rank) => {
    const score = 0.5 / (k + rank + 1); // Lower weight than k-NN
    scores.set(entity.id, (scores.get(entity.id) ?? 0) + score);
  });

  // Sort by combined score
  return A.sortBy(
    [...scores.entries()].map(([id, score]) => ({ id, score })),
    (e) => -e.score
  );
};
```

#### P4.4: Token Budget Management
Fit context within model limits:

```typescript
// packages/knowledge/server/src/graphrag/budget.ts
const assembleContext = (
  rankedEntities: ScoredEntity[],
  relations: Relation[],
  tokenBudget: number
) =>
  Effect.gen(function* () {
    let usedTokens = 0;
    const includedEntities: Entity[] = [];
    const includedRelations: Relation[] = [];

    // Add entities until budget exhausted
    for (const entity of rankedEntities) {
      const entityTokens = estimateTokens(entityToText(entity));
      if (usedTokens + entityTokens > tokenBudget) break;

      includedEntities.push(entity);
      usedTokens += entityTokens;

      // Add relations involving this entity
      const entityRelations = relations.filter(
        r => r.subjectId === entity.id || r.objectId === entity.id
      );

      for (const rel of entityRelations) {
        const relTokens = estimateTokens(relationToText(rel));
        if (usedTokens + relTokens > tokenBudget) break;

        includedRelations.push(rel);
        usedTokens += relTokens;
      }
    }

    return { entities: includedEntities, relations: includedRelations, usedTokens };
  });
```

### Outputs
- `packages/knowledge/server/src/graphrag/knn-search.ts`
- `packages/knowledge/server/src/graphrag/traversal.ts`
- `packages/knowledge/server/src/graphrag/rrf.ts`
- `packages/knowledge/server/src/graphrag/budget.ts`
- `packages/knowledge/server/src/graphrag/assemble.ts`

### Verification
```bash
bun run test --filter @beep/knowledge-server -- --grep "graphrag"

# Benchmark k-NN search latency
bun run scripts/benchmark-knn.ts  # Target: <100ms for 10K entities
```

### Handoff
- Create `handoffs/HANDOFF_P5.md` with GraphRAG implementation
- Create `handoffs/P5_ORCHESTRATOR_PROMPT.md` for agent integration

---

## Phase 5: Agent Integration

### Objective
Create the wealth management domain expert agent with tools for querying the knowledge graph and citing evidence.

### Inputs
- GraphRAG context assembly from Phase 4
- Agent definition patterns (`.claude/agents/`)
- Tool definition patterns

### Tasks

#### P5.1: Agent Definition
Create the agent configuration:

```yaml
# .claude/agents/wealth-management-domain-expert.md
---
name: wealth-management-domain-expert
description: |
  Domain expert for wealth management serving UHNWI clients ($30M+ net worth).

  Use this agent when:
  - Answering questions about client portfolios, accounts, or investments
  - Explaining trust structures, beneficiary designations, or ownership
  - Providing compliance-critical information with evidence citations
  - Resolving entity references across multiple data sources

  This agent automatically:
  - Assembles relevant context from the knowledge graph
  - Cites evidence for every factual claim
  - Respects fiduciary duty and compliance requirements

model: sonnet
tools: [WmQuery, WmEvidence, WmEntityLookup, Read, Grep]
---

# Wealth Management Domain Expert

You are an expert in wealth management for ultra-high-net-worth individuals.
You have access to a knowledge graph containing client information, account
structures, investment holdings, and compliance documentation.

## Core Responsibilities

1. **Answer accurately**: Use only information from the knowledge graph
2. **Cite evidence**: Every factual claim must reference source documents
3. **Respect compliance**: Never disclose sensitive information inappropriately
4. **Explain structures**: Help users understand complex ownership hierarchies

## Evidence Citation Format

When citing evidence, use this format:
[Fact statement] (Source: [document name], [date], chars [start]-[end])

Example:
"John Doe owns 90% of Family LLC" (Source: Trust Agreement, 2024-01-15, chars 1234-1289)
```

#### P5.2: Tool Definitions
Create tools for knowledge graph interaction:

```typescript
// packages/knowledge/server/src/tools/wm-query.tool.ts
export const WmQueryTool = {
  name: "WmQuery",
  description: "Query the wealth management knowledge graph for client, account, and investment information.",
  parameters: S.Struct({
    query: S.String.pipe(S.annotations({ description: "Natural language query" })),
    entityTypes: S.optional(S.Array(S.String).pipe(
      S.annotations({ description: "Filter by entity types (Client, Account, Trust, etc.)" })
    )),
    maxResults: S.optional(S.Number.pipe(S.annotations({ description: "Maximum results to return" }))),
  }),
  execute: (params, context) =>
    Effect.gen(function* () {
      const graphrag = yield* GraphRAGService;

      // Assemble context from knowledge graph
      const result = yield* graphrag.assembleContext({
        query: params.query,
        entityTypes: params.entityTypes,
        maxResults: params.maxResults ?? 20,
        tokenBudget: 4000,
        organizationId: context.organizationId,
      });

      return formatContextForAgent(result);
    }),
};

// packages/knowledge/server/src/tools/wm-evidence.tool.ts
export const WmEvidenceTool = {
  name: "WmEvidence",
  description: "Retrieve source evidence for a specific entity or relationship.",
  parameters: S.Struct({
    entityId: S.optional(S.String),
    relationId: S.optional(S.String),
  }),
  execute: (params, context) =>
    Effect.gen(function* () {
      const repo = yield* EntityRepo;

      if (params.entityId) {
        const entity = yield* repo.findById(params.entityId);
        return formatEvidence(entity.mentions);
      }

      if (params.relationId) {
        const relation = yield* RelationRepo.findById(params.relationId);
        return formatEvidence([relation.evidence]);
      }

      return Effect.fail(new Error("Either entityId or relationId required"));
    }),
};
```

#### P5.3: Evidence Citation Service
Implement automatic evidence citation:

```typescript
// packages/knowledge/server/src/services/evidence-citation.service.ts
export const formatWithCitations = (
  response: string,
  entities: EntityWithEvidence[],
  relations: RelationWithEvidence[]
) => {
  let citedResponse = response;
  let citationIndex = 1;
  const citations: Citation[] = [];

  // Find entity mentions in response and add citations
  for (const entity of entities) {
    const regex = new RegExp(escapeRegex(entity.mention), "gi");
    if (regex.test(citedResponse) && entity.mentions?.length > 0) {
      const evidence = entity.mentions[0];
      citations.push({
        index: citationIndex,
        source: entity.sourceUri ?? "Unknown",
        text: evidence.text,
        startChar: evidence.startChar,
        endChar: evidence.endChar,
      });

      citedResponse = citedResponse.replace(
        regex,
        `${entity.mention} [${citationIndex}]`
      );
      citationIndex++;
    }
  }

  // Append citation list
  const citationList = citations.map(c =>
    `[${c.index}] ${c.source}, chars ${c.startChar}-${c.endChar}: "${c.text}"`
  ).join("\n");

  return `${citedResponse}\n\n---\nSources:\n${citationList}`;
};
```

#### P5.4: Compliance Guardrails
Implement safety checks:

```typescript
// packages/knowledge/server/src/services/compliance-guard.service.ts
export const complianceGuard = (response: string, context: QueryContext) =>
  Effect.gen(function* () {
    const checks = [
      // Never expose raw tax IDs
      checkNoTaxIdExposure(response),

      // Require evidence for financial claims
      checkFinancialClaimsCited(response, context.citations),

      // Warn about stale data
      checkDataFreshness(context.entities, Duration.days(90)),

      // Ensure user has access to referenced entities
      checkEntityAccess(context.entities, context.userId),
    ];

    const results = yield* Effect.all(checks);
    const warnings = results.filter(r => r.warning);

    if (warnings.length > 0) {
      return {
        response,
        warnings: warnings.map(w => w.warning),
        blocked: results.some(r => r.blocked),
      };
    }

    return { response, warnings: [], blocked: false };
  });
```

### Outputs
- `.claude/agents/wealth-management-domain-expert.md` - Agent definition
- `packages/knowledge/server/src/tools/wm-query.tool.ts`
- `packages/knowledge/server/src/tools/wm-evidence.tool.ts`
- `packages/knowledge/server/src/tools/wm-entity-lookup.tool.ts`
- `packages/knowledge/server/src/services/evidence-citation.service.ts`
- `packages/knowledge/server/src/services/compliance-guard.service.ts`

### Verification
```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server -- --grep "tools|citation|compliance"

# Manual agent testing
# Copy agent prompt and test with sample queries
```

### Final Deliverables

1. **Agent Definition**: `.claude/agents/wealth-management-domain-expert.md`
2. **Ontology**: `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl`
3. **Domain Models**: `packages/knowledge/domain/src/entities/Wm*/`
4. **Extraction Pipeline**: `packages/knowledge/server/src/extraction/wm-*.stage.ts`
5. **Entity Resolution**: `packages/knowledge/server/src/resolution/`
6. **GraphRAG**: `packages/knowledge/server/src/graphrag/`
7. **Tools**: `packages/knowledge/server/src/tools/wm-*.tool.ts`

---

## Reflection Log Updates

After each phase, update `REFLECTION_LOG.md` with:

```markdown
## YYYY-MM-DD - Phase [N] Reflection

### What Worked
- [Successful patterns]

### What Didn't Work
- [Challenges encountered]

### Methodology Improvements
- [ ] [Suggested changes]

### Prompt Refinements
**Original**: [quote]
**Problem**: [explanation]
**Refined**: [improvement]

### Domain-Specific Insights
- [Wealth management specific learnings]
```
