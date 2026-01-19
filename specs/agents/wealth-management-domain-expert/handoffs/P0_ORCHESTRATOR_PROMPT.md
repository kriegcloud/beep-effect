# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing **Phase 0: Ontology Design** of the Wealth Management Domain Expert agent specification.

### Context

This spec creates an AI agent with specialized knowledge of wealth management for ultra-high-net-worth individuals ($30M+ net worth). The agent will:
- Extract entities and relationships from wealth management documents
- Link every fact to source evidence (compliance critical)
- Resolve entities across custodian feeds, CRM, and documents
- Assemble relevant context for agent queries via GraphRAG

Phase 0 establishes the **domain ontology** using OWL/RDFS semantics.

### Your Mission

Design and implement the wealth management ontology with:

1. **Class hierarchy** (8+ classes across 2 priority tiers)
2. **Object properties** (relationships between entities)
3. **Datatype properties** (entity attributes)
4. **Cardinality constraints** (relationship rules)
5. **Evidence linking patterns** (compliance requirements)
6. **Entity resolution keys** (cross-source matching)

### Critical Patterns

**Ontology Class Pattern** (from existing codebase):
```turtle
wm:Client a owl:Class ;
    rdfs:label "Client" ;
    rdfs:comment "Natural person or entity receiving wealth management services" ;
    rdfs:subClassOf owl:Thing .
```

**Object Property Pattern**:
```turtle
wm:ownsAccount a owl:ObjectProperty ;
    rdfs:label "owns account" ;
    rdfs:domain wm:Client ;
    rdfs:range wm:Account ;
    rdfs:comment "Client ownership of a custodial account" .
```

**Cardinality Constraint Pattern**:
```turtle
wm:Client rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty wm:ownsAccount ;
    owl:minCardinality 1
] .
```

**Evidence Span Pattern** (from `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts`):
```typescript
export class EvidenceSpan extends S.Class<EvidenceSpan>("EvidenceSpan")({
  text: S.String,                    // Exact text span
  startChar: S.Number.pipe(S.int(), S.nonNegative()),
  endChar: S.Number.pipe(S.int(), S.nonNegative()),
  confidence: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))),
}) {}
```

### Reference Files

| File | Purpose |
|------|---------|
| `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P0.md` | **Full context** - class hierarchy, properties, evidence requirements |
| `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:97-108` | ClassDefinition schema reference |
| `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:163-173` | 6-phase extraction pipeline |
| `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:275-301` | Grounding service (0.8 threshold) |
| `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts:75-183` | Ontology storage model |
| `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:46-135` | Entity model with types array |
| `packages/knowledge/domain/src/entities/Relation/Relation.model.ts:45-148` | Relation model with evidence |
| `packages/knowledge/domain/src/entities/Mention/Mention.model.ts:49-148` | Mention model with character offsets |
| `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts:36-76` | Evidence linking pattern |

### Deliverables

Create these files:

1. `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl`
   - Complete ontology in Turtle format
   - At least 8 classes (Client, Account, Investment, Document, Household, Trust, Entity, Beneficiary)
   - At least 15 properties (object + datatype)
   - Cardinality constraints for required relationships

2. `specs/agents/wealth-management-domain-expert/outputs/ontology-class-hierarchy.md`
   - Visual class hierarchy diagram
   - Each class with label, description, properties

3. `specs/agents/wealth-management-domain-expert/outputs/property-inventory.md`
   - All properties with domain, range, cardinality
   - Compliance requirements noted

### Verification

After creating deliverables:

```bash
# Check Turtle syntax (if parser available)
bun run scripts/validate-ontology.ts outputs/wealth-management.ttl

# Count classes and properties
grep -c "owl:Class" specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl
grep -c "owl:ObjectProperty" specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl
grep -c "owl:DatatypeProperty" specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl
```

### Success Criteria

- [ ] Ontology parses without syntax errors
- [ ] At least 8 classes defined
- [ ] At least 9 object properties defined
- [ ] At least 6 datatype properties defined
- [ ] Cardinality constraints for: ownsAccount, heldByCustodian, establishedBy
- [ ] Evidence linking documented for 6 compliance-critical facts
- [ ] Entity resolution keys defined for: Client, Account, Trust, Investment
- [ ] Class hierarchy visualization generated

### Handoff Document

Read full context in: `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P0.md`

### Next Phase

After completing Phase 0:

1. Update `specs/agents/wealth-management-domain-expert/REFLECTION_LOG.md` with:
   - What worked well
   - Challenges encountered
   - Ontology design insights

2. Create `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P1.md` with:
   - Verified ontology file locations
   - Effect Schema mapping strategy
   - Entity ID specifications

3. Create `specs/agents/wealth-management-domain-expert/handoffs/P1_ORCHESTRATOR_PROMPT.md`

**A phase is NOT complete until BOTH handoff files exist.**

---

## Quick Start Checklist

1. [ ] Read `HANDOFF_P0.md` for complete context
2. [ ] Review existing ontology patterns in `specs/knowledge-graph-integration/`
3. [ ] Review existing Entity model in `packages/knowledge/domain/src/entities/Entity/`
4. [ ] Create `outputs/` directory if not exists
5. [ ] Implement `wealth-management.ttl` with all classes and properties
6. [ ] Generate class hierarchy documentation
7. [ ] Generate property inventory
8. [ ] Verify success criteria
9. [ ] Update reflection log
10. [ ] Create Phase 1 handoff documents
