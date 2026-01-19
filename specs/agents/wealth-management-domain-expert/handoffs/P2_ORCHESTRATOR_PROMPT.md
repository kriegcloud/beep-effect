# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing **Phase 2: Knowledge Graph Extraction Pipeline** of the Wealth Management Domain Expert agent specification.

### Context

Phase 1 completed Effect Schema mapping with:
- 8 branded entity IDs (WmClientId, WmAccountId, etc.)
- 8 Effect Schema models with sensitive field handling
- 26 class IRI constants, 47 property IRI constants
- 34 passing schema tests

Phase 2 builds the LLM-powered extraction pipeline that uses these schemas to extract wealth management entities from unstructured documents.

### Your Mission

Create the extraction pipeline that:

1. **Extraction Service Interface** - Effect service for entity/relation extraction
2. **LLM Prompt Templates** - Ontology-constrained prompts for extraction
3. **Schema Validation Layer** - Validate LLM outputs against Effect schemas
4. **Knowledge Graph Storage** - Persist extracted entities and relations

### Critical Patterns

**Extraction Service Pattern** (from `packages/knowledge/server/src/`):
```typescript
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

**Schema Validation Pattern**:
```typescript
import { Entities } from "@beep/wm-domain";
import * as S from "effect/Schema";

const validateExtractedClient = (
  raw: unknown
): Effect.Effect<typeof Entities.Client.Model.insert.Type, ParseError> =>
  S.decode(Entities.Client.Model.insert)(raw);
```

**Ontology IRI Usage** (from `@beep/wm-domain/ontology`):
```typescript
import { CLIENT_IRI, OWNS_ACCOUNT_IRI } from "@beep/wm-domain/ontology";

// Use in LLM prompts
const prompt = `Extract entities of type ${CLIENT_IRI}...`;

// Validate extracted types
if (entity.classIri !== CLIENT_IRI) throw new InvalidClassError();
```

### Reference Files

| File | Purpose |
|------|---------|
| `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P2.md` | **Full context** - pipeline design, prompt templates |
| `packages/wealth-management/domain/src/entities/` | Entity schemas for validation |
| `packages/wealth-management/domain/src/ontology/` | Class and property IRIs |
| `packages/knowledge/domain/src/entities/Extraction/Extraction.model.ts` | Extraction tracking model |
| `packages/knowledge/domain/src/entities/Mention/Mention.model.ts` | Text evidence model |
| `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts` | Source evidence pattern |

### Deliverables

Create these files:

1. **Extraction Service**
   ```
   packages/wealth-management/server/src/Extraction/
   ├── WmExtractionService.ts      # Service interface
   ├── WmExtractionServiceLive.ts  # Implementation
   └── index.ts
   ```

2. **LLM Prompts**
   ```
   packages/wealth-management/server/src/Extraction/prompts/
   ├── entity-extraction.prompt.ts    # Extract entities
   ├── relation-extraction.prompt.ts  # Extract relations
   ├── attribute-extraction.prompt.ts # Extract attributes
   └── index.ts
   ```

3. **Validation Layer**
   ```
   packages/wealth-management/server/src/Extraction/validation/
   ├── validateExtraction.ts  # Schema validation
   ├── validateRelation.ts    # Relation validation
   └── index.ts
   ```

4. **Storage Integration**
   ```
   packages/wealth-management/server/src/Extraction/storage/
   ├── storeExtraction.ts  # Entity/relation persistence
   └── index.ts
   ```

5. **Tests**
   ```
   packages/wealth-management/server/test/Extraction/
   ├── WmExtractionService.test.ts      # Unit tests
   ├── entity-extraction.test.ts        # Prompt parsing tests
   └── integration.test.ts              # End-to-end tests
   ```

### LLM Prompt Design

**Entity Extraction Prompt Template**:
```markdown
You are a wealth management document analyst. Extract entities from the following text.

## Ontology Classes (ONLY use these types)
- wm:Client (https://beep.dev/ontology/wealth-management#Client)
- wm:Account (https://beep.dev/ontology/wealth-management#Account)
- wm:Investment (https://beep.dev/ontology/wealth-management#Investment)
- wm:Trust (https://beep.dev/ontology/wealth-management#Trust)
- wm:Household (https://beep.dev/ontology/wealth-management#Household)
- wm:Beneficiary (https://beep.dev/ontology/wealth-management#Beneficiary)
- wm:Custodian (https://beep.dev/ontology/wealth-management#Custodian)
- wm:LegalEntity (https://beep.dev/ontology/wealth-management#LegalEntity)

## Output JSON Schema
{
  "entities": [
    {
      "classIri": "https://beep.dev/ontology/wealth-management#Client",
      "attributes": { "legalName": "...", "riskTolerance": "..." },
      "evidence": { "text": "...", "startChar": 0, "endChar": 100, "confidence": 0.95 }
    }
  ]
}

## Document Text
{chunk}
```

**Relation Extraction Prompt Template**:
```markdown
Given these extracted entities, identify relationships using ONLY these predicates:

## Ontology Properties
- wm:ownsAccount (Client → Account)
- wm:holdsInvestment (Account → Investment)
- wm:managedBy (Account → Custodian)
- wm:hasBeneficiary (Account/Trust → Beneficiary)
- wm:memberOf (Client → Household)
- wm:controlledBy (LegalEntity → Client)

## Output JSON Schema
{
  "relations": [
    {
      "predicate": "https://beep.dev/ontology/wealth-management#ownsAccount",
      "subjectIndex": 0,
      "objectIndex": 1,
      "evidence": { "text": "...", "startChar": 0, "endChar": 50, "confidence": 0.9 }
    }
  ]
}

## Entities
{entities}
```

### Verification

After creating deliverables:

```bash
# Type check new package
bun run check --filter @beep/wm-server

# Run tests
bun run test --filter @beep/wm-server

# Verify service interface
grep "WmExtractionService" packages/wealth-management/server/src/Extraction/WmExtractionService.ts
```

### Success Criteria

- [ ] WmExtractionService interface defined with Effect types
- [ ] Entity extraction implemented with ontology-constrained prompts
- [ ] Relation extraction implemented with property IRI validation
- [ ] Schema validation layer validates all 8 entity types
- [ ] Sensitive fields excluded from LLM prompts (taxId, DOB, netWorth)
- [ ] Evidence spans captured with confidence scores
- [ ] Storage integration uses EntityRepo and RelationRepo
- [ ] Unit tests for prompt parsing
- [ ] Integration tests with mock LLM responses

### Known Gotchas

1. **LLM Hallucination**: Always validate extracted classIri against ontology constants
2. **Multi-type entities**: A text span may mention multiple types; create separate Entity records
3. **Confidence scoring**: Capture LLM confidence in EvidenceSpan
4. **Sensitive data**: NEVER include taxId, SSN, or DOB in LLM prompts
5. **Chunk boundaries**: Entities may span chunks; implement entity merging

### Handoff Document

Read full context in: `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:

1. Update `specs/agents/wealth-management-domain-expert/REFLECTION_LOG.md` with:
   - Extraction accuracy metrics
   - Prompt refinement decisions
   - LLM response parsing challenges

2. Create `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P3.md` with:
   - Verified extraction patterns
   - Query interface design
   - UI integration plan

3. Create `specs/agents/wealth-management-domain-expert/handoffs/P3_ORCHESTRATOR_PROMPT.md`

**A phase is NOT complete until BOTH handoff files exist.**

---

## Quick Start Checklist

1. [ ] Read `HANDOFF_P2.md` for complete context
2. [ ] Review existing extraction patterns in `packages/knowledge/server/src/`
3. [ ] Review LLM service patterns (if available) or create mock
4. [ ] Create wealth-management server package structure
5. [ ] Implement extraction service interface
6. [ ] Create ontology-constrained LLM prompts
7. [ ] Implement schema validation layer
8. [ ] Create storage integration
9. [ ] Write unit and integration tests
10. [ ] Verify success criteria
11. [ ] Update reflection log
12. [ ] Create Phase 3 handoff documents
