# Phase 2 Handoff: Knowledge Graph Extraction Pipeline

## Phase 1 Summary (COMPLETED)

Phase 1 successfully converted the wealth management OWL ontology into Effect Schema models with branded entity IDs, ontology IRI constants, and comprehensive tests.

## Phase 1 Deliverables (Verified)

| Deliverable | Location | Status |
|-------------|----------|--------|
| Entity IDs (8 types) | `packages/shared/domain/src/entity-ids/wealth-management/` | Complete |
| Entity Schemas (8 models) | `packages/wealth-management/domain/src/entities/` | Complete |
| Ontology Constants | `packages/wealth-management/domain/src/ontology/` | Complete |
| Schema Tests (34 tests) | `packages/wealth-management/domain/test/entities/` | Complete |

### Verified Counts

| Metric | Count |
|--------|-------|
| Entity ID Types | 8 |
| Effect Schema Models | 8 |
| Class IRI Constants | 26 |
| Property IRI Constants | 47 (17 object + 30 datatype) |
| Passing Tests | 34 |

---

## Created Files Reference

### Entity IDs

| File | Exports |
|------|---------|
| `packages/shared/domain/src/entity-ids/wealth-management/ids.ts` | WmClientId, WmAccountId, WmInvestmentId, WmTrustId, WmHouseholdId, WmBeneficiaryId, WmCustodianId, WmLegalEntityId |
| `packages/shared/domain/src/entity-ids/wealth-management/table-name.ts` | WmTableName union type |
| `packages/shared/domain/src/entity-ids/wealth-management/any-id.ts` | AnyWmEntityId union |
| `packages/shared/domain/src/entity-ids/wealth-management/index.ts` | Barrel export |

### Entity Schemas

| File | Model | Key Fields |
|------|-------|------------|
| `packages/wealth-management/domain/src/entities/Client/Client.model.ts` | Client.Model | legalName, riskTolerance, kycStatus, taxId (sensitive), dateOfBirth (sensitive), netWorth (sensitive) |
| `packages/wealth-management/domain/src/entities/Account/Account.model.ts` | Account.Model | accountNumber, accountType, taxStatus, custodianId, openDate |
| `packages/wealth-management/domain/src/entities/Investment/Investment.model.ts` | Investment.Model | investmentType, securityId, ticker, costBasis, marketValue |
| `packages/wealth-management/domain/src/entities/Trust/Trust.model.ts` | Trust.Model | trustName, trustType, taxId (sensitive), establishedDate, jurisdiction |
| `packages/wealth-management/domain/src/entities/Household/Household.model.ts` | Household.Model | householdName, memberCount, totalAUM |
| `packages/wealth-management/domain/src/entities/Beneficiary/Beneficiary.model.ts` | Beneficiary.Model | beneficiaryType, beneficiaryPercentage, linkedClientId |
| `packages/wealth-management/domain/src/entities/Custodian/Custodian.model.ts` | Custodian.Model | custodianName, custodianCode |
| `packages/wealth-management/domain/src/entities/LegalEntity/LegalEntity.model.ts` | LegalEntity.Model | entityName, entityType, taxId (sensitive), stateOfFormation, formationDate |

### Ontology Constants

| File | Exports |
|------|---------|
| `packages/wealth-management/domain/src/ontology/namespace.ts` | WM_NAMESPACE |
| `packages/wealth-management/domain/src/ontology/class-iris.ts` | CLASS_IRI, ENTITY_IRI, CLIENT_IRI, ACCOUNT_IRI, etc. |
| `packages/wealth-management/domain/src/ontology/property-iris.ts` | Object property IRIs, Datatype property IRIs |

---

## Phase 2 Objective

Build the extraction pipeline that uses LLM prompts to extract wealth management entities and relationships from unstructured documents, storing them in the knowledge graph.

---

## Phase 2 Architecture

### Pipeline Flow

```
Document → Chunking → LLM Extraction → Schema Validation → Knowledge Graph Storage
    ↓           ↓            ↓                ↓                    ↓
  Input     Semantic     Structured      Effect Schema        Entity/Relation
  Files     Chunks        Output        Validation           Persistence
```

### Integration Points

| Component | Location | Purpose |
|-----------|----------|---------|
| Entity Schemas | `@beep/wm-domain` | Type validation for extracted data |
| Ontology IRIs | `@beep/wm-domain/ontology` | Class/property identification |
| Knowledge Tables | `@beep/knowledge-tables` | Entity/Relation/Extraction storage |
| Knowledge Server | `@beep/knowledge-server` | Repository layer |

---

## Implementation Tasks

### P2.1: Extraction Service Interface

**Location**: `packages/wealth-management/server/src/Extraction/`

```typescript
// WmExtractionService.ts
interface WmExtractionService {
  readonly extractEntities: (
    documentId: DocumentId,
    chunk: DocumentChunk
  ) => Effect.Effect<readonly ExtractedEntity[], ExtractionError, LLMService>;

  readonly extractRelations: (
    documentId: DocumentId,
    entities: readonly ExtractedEntity[],
    chunk: DocumentChunk
  ) => Effect.Effect<readonly ExtractedRelation[], ExtractionError, LLMService>;
}
```

### P2.2: LLM Prompt Templates

**Location**: `packages/wealth-management/server/src/Extraction/prompts/`

Templates to create:
- `entity-extraction.prompt.ts` - Extract wealth management entities
- `relation-extraction.prompt.ts` - Extract relationships between entities
- `attribute-extraction.prompt.ts` - Extract entity attributes

### P2.3: Schema Validation Layer

**Location**: `packages/wealth-management/server/src/Extraction/validation/`

```typescript
// validateExtraction.ts
const validateExtractedClient = (
  raw: unknown
): Effect.Effect<Client.Model.insert, ParseError> =>
  S.decode(Client.Model.jsonCreate)(raw);
```

### P2.4: Knowledge Graph Integration

**Location**: `packages/wealth-management/server/src/Extraction/storage/`

```typescript
// storeExtraction.ts
const storeExtractedEntity = (
  entity: ExtractedEntity,
  extraction: Extraction
): Effect.Effect<Entity.Model, PersistenceError, EntityRepo> =>
  // Store entity with classIri from ontology
```

---

## Existing Patterns to Follow

### Knowledge Domain Extraction

| File | Purpose | Key Pattern |
|------|---------|-------------|
| `packages/knowledge/domain/src/entities/Extraction/Extraction.model.ts` | Extraction tracking | Links document → entities |
| `packages/knowledge/domain/src/entities/Mention/Mention.model.ts` | Text evidence | Spans linking extraction to source |
| `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts` | Source evidence | text, startChar, endChar, confidence |

### LLM Service Pattern

| File | Purpose | Key Pattern |
|------|---------|-------------|
| (To be defined) | LLM invocation | Effect-wrapped OpenAI/Claude calls |

---

## LLM Prompt Design

### Entity Extraction Prompt

```markdown
You are a wealth management document analyst. Extract entities from the following text.

## Ontology Classes
- Client: Individual or entity receiving wealth management services
- Account: Financial account with custodian
- Investment: Security, fund, or alternative investment
- Trust: Legal trust structure
- Household: Family grouping of clients
- Beneficiary: Person or entity receiving benefits
- Custodian: Financial institution holding assets
- LegalEntity: LLC, partnership, or corporation

## Required Output Format
{
  "entities": [
    {
      "type": "wm:Client",
      "classIri": "https://beep.dev/ontology/wealth-management#Client",
      "attributes": {
        "legalName": "...",
        "riskTolerance": "...",
        ...
      },
      "evidence": {
        "text": "...",
        "startChar": 0,
        "endChar": 100
      }
    }
  ]
}
```

### Relation Extraction Prompt

```markdown
Given these extracted entities, identify relationships between them.

## Ontology Relations
- ownsAccount: Client → Account
- holdsInvestment: Account → Investment
- managedBy: Account → Custodian
- hasBeneficiary: Account/Trust → Beneficiary
- memberOf: Client → Household
- controlledBy: LegalEntity → Client

## Output Format
{
  "relations": [
    {
      "predicate": "https://beep.dev/ontology/wealth-management#ownsAccount",
      "subjectId": "...",
      "objectId": "...",
      "evidence": {...}
    }
  ]
}
```

---

## Verification Checklist

### Extraction Service

- [ ] WmExtractionService interface defined
- [ ] Entity extraction implemented
- [ ] Relation extraction implemented
- [ ] Attribute extraction implemented

### LLM Integration

- [ ] Prompt templates created
- [ ] Response parsing implemented
- [ ] Error handling for malformed responses

### Schema Validation

- [ ] All 8 entity types validated
- [ ] Sensitive field handling preserved
- [ ] Default values applied (classIri)

### Storage Integration

- [ ] Entity storage via EntityRepo
- [ ] Relation storage via RelationRepo
- [ ] Extraction tracking via ExtractionRepo
- [ ] Mention storage for evidence

### Tests

- [ ] Unit tests for extraction parsing
- [ ] Integration tests with mock LLM responses
- [ ] End-to-end tests with real documents

---

## Known Issues & Gotchas

1. **LLM hallucination**: Validate all extracted entity types against ontology class IRIs.

2. **Multi-type entities**: A single text span may mention multiple entity types. Create separate Entity records for each type.

3. **Confidence scoring**: LLM-provided confidence should be captured in evidence spans.

4. **Sensitive data**: Never include raw taxId, SSN, or DOB in LLM prompts. Extract normalized values only.

5. **Chunking boundaries**: Entities may span chunk boundaries. Implement entity merging for continued extractions.

---

## Success Criteria

- [ ] Extraction service processes wealth management documents
- [ ] Entities validated against Effect schemas
- [ ] Relations captured with proper predicates
- [ ] Evidence spans link to source documents
- [ ] Integration tests demonstrate end-to-end flow

---

## Abort Conditions & Rollback

### When to Pause Phase 2

| Blocker | Detection | Mitigation |
|---------|-----------|------------|
| LLM service unavailable | Connection errors | Use mock service for testing |
| Schema changes from Phase 1 | Import failures | Re-run Phase 1 verification |
| Knowledge domain breaking changes | Repo signature changes | Align with new patterns |

### Rollback Steps

1. Document blocker in `REFLECTION_LOG.md`
2. Preserve partial work in `outputs/partial-phase2/`
3. Create GitHub issue with `blocker:spec` label
4. Update handoff with blocker status

---

## Next Phase

After completing Phase 2:

1. Update `REFLECTION_LOG.md` with:
   - Extraction accuracy metrics
   - Prompt refinement decisions
   - Performance observations

2. Create `handoffs/HANDOFF_P3.md` with:
   - Verified extraction patterns
   - Query interface design
   - UI integration plan

3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`
