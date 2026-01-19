# Phase 0 Handoff: Ontology Design

## Phase Summary

Phase 0 establishes the wealth management domain ontology using OWL/RDFS semantics. This ontology defines the class hierarchy, property definitions, and constraint rules that will guide all subsequent extraction, resolution, and querying phases.

## Source Verification

### Knowledge Graph Integration Patterns

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:97-108` | ClassDefinition schema | IRI, label, properties, prefLabels, altLabels, parents, children |
| `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:136-148` | Entity resolution strategies | Frequency voting, union with override, signature dedup |
| `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:163-173` | 6-phase extraction pipeline | CHUNK→MENTION→ENTITY→SCOPE→RELATION→GROUND |
| `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md:275-301` | Grounding service | Cosine similarity, 0.8 threshold |
| `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts:75-183` | Ontology storage model | name, namespace, version, format, contentHash |
| `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts:36-76` | Evidence linking | text, startChar, endChar, confidence |

### Existing Entity Models

| File | Entity | Key Fields |
|------|--------|------------|
| `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:46-135` | Entity | types, mention, attributes, mentions, groundingConfidence |
| `packages/knowledge/domain/src/entities/Relation/Relation.model.ts:45-148` | Relation | subjectId, predicate, objectId/literalValue, evidence |
| `packages/knowledge/domain/src/entities/Mention/Mention.model.ts:49-148` | Mention | entityId, text, startChar, endChar, isPrimary |
| `packages/knowledge/domain/src/entities/Extraction/Extraction.model.ts:65-198` | Extraction | documentId, ontologyId, status, entityCount, relationCount |

---

## Reference Implementations

### Similar Domain Slices

| Slice | Location | Relevant Patterns |
|-------|----------|-------------------|
| IAM entities | `packages/iam/domain/src/entities/` | User model, team relationships |
| Documents entities | `packages/documents/domain/src/entities/` | Document model, versioning |

### Schema Patterns to Follow

| Pattern | Location | Line Numbers |
|---------|----------|--------------|
| Branded entity IDs | `packages/shared/domain/src/entity-ids/entity-ids.ts` | 15-45 |
| makeFields helper | `packages/shared/domain/src/common/makeFields.ts` | 1-50 |
| Sensitive field handling | `packages/iam/client/src/password/form.ts` | 22-30 |
| Enum/literal schemas | `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts` | 25-47 |
| Optional with default | `packages/knowledge/domain/src/entities/Entity/Entity.model.ts` | 81-84 |

### Multi-Tenant Patterns

| Pattern | Location | Description |
|---------|----------|-------------|
| organizationId field | `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:48` | Required on all tenant-scoped entities |
| RLS policy patterns | `documentation/patterns/database-patterns.md` | Row-level security patterns |

---

## Ontology Class Hierarchy

### Priority 0: Core Entities (Must Implement)

```
owl:Thing
├── wm:Client                    # Natural person or entity receiving services
│   └── wm:ClientProfile         # Extended client information
├── wm:Account                   # Custodial account container
│   ├── wm:IndividualAccount
│   ├── wm:JointAccount
│   ├── wm:TrustAccount
│   ├── wm:EntityAccount         # LLC, LP, Corp
│   └── wm:RetirementAccount     # IRA, 401k
├── wm:Investment                # Asset holding
│   ├── wm:Security              # Public market securities
│   ├── wm:PrivateFund           # Hedge fund, PE, VC
│   ├── wm:RealEstate
│   └── wm:Alternative           # Art, collectibles
└── wm:Document                  # Compliance evidence
    ├── wm:Agreement             # IPS, engagement letter
    ├── wm:Statement             # Custodian statement
    ├── wm:LegalDocument         # Trust deed, will
    └── wm:ComplianceRecord      # ADV, disclosures
```

### Priority 1: Complex Structures (Should Implement)

```
owl:Thing
├── wm:Household                 # Family unit grouping
├── wm:Trust                     # Legal trust structure
│   ├── wm:RevocableTrust
│   ├── wm:IrrevocableTrust
│   └── wm:CharitableTrust
├── wm:Entity                    # Legal entity
│   ├── wm:LLC
│   ├── wm:Partnership
│   └── wm:Foundation
└── wm:Beneficiary               # Death benefit recipient
```

### Priority 2: Financial Planning (Nice to Have)

```
owl:Thing
├── wm:Goal                      # Client objective
├── wm:Plan                      # Financial plan
├── wm:Projection                # Future scenario
└── wm:Scenario                  # What-if analysis
```

---

## Property Definitions

### Object Properties (Relationships)

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:ownsAccount` | wm:Client | wm:Account | 1..* | Must have evidence |
| `wm:containsInvestment` | wm:Account | wm:Investment | 0..* | Custodian feed |
| `wm:heldByCustodian` | wm:Account | wm:Custodian | 1 | Required |
| `wm:hasBeneficiary` | wm:Account, wm:Trust | wm:Beneficiary | 0..* | Must have evidence |
| `wm:establishedBy` | wm:Trust | wm:Client | 1 | Trust document |
| `wm:managedBy` | wm:Trust | wm:Client, wm:Entity | 1..* | Trust document |
| `wm:memberOf` | wm:Client | wm:Household | 0..1 | CRM data |
| `wm:evidenceFor` | wm:Document | owl:Thing | 0..* | N/A |
| `wm:supersedes` | wm:Document | wm:Document | 0..1 | Versioning |

### Datatype Properties (Attributes)

| Property | Domain | Range | Required | Sensitive |
|----------|--------|-------|----------|-----------|
| `wm:legalName` | wm:Client | xsd:string | Yes | No |
| `wm:taxId` | wm:Client, wm:Entity, wm:Trust | xsd:string | Yes | **Yes** |
| `wm:dateOfBirth` | wm:Client | xsd:date | No | Yes |
| `wm:netWorth` | wm:Client | xsd:decimal | No | Yes |
| `wm:riskTolerance` | wm:Client | {"Conservative", "Moderate", "Aggressive"} | Yes | No |
| `wm:kycStatus` | wm:Client | {"Pending", "Verified", "Expired"} | Yes | No |
| `wm:accountNumber` | wm:Account | xsd:string | Yes | No |
| `wm:accountType` | wm:Account | xsd:string | Yes | No |
| `wm:taxStatus` | wm:Account | {"Taxable", "Tax-Deferred", "Tax-Exempt"} | Yes | No |
| `wm:costBasis` | wm:Investment | xsd:decimal | No | No |
| `wm:marketValue` | wm:Investment | xsd:decimal | No | No |

---

## Evidence Linking Requirements

### Compliance-Critical Facts (Must Have Evidence)

| Fact Type | Evidence Source | Minimum Fields |
|-----------|-----------------|----------------|
| Account ownership | Account opening agreement | text, startChar, endChar, documentId |
| Beneficiary designation | Beneficiary form | text, startChar, endChar, documentId, effectiveDate |
| Trust terms | Trust document | text, startChar, endChar, documentId |
| Power of attorney | POA document | text, startChar, endChar, documentId, expirationDate |
| Investment suitability | IPS | text, startChar, endChar, documentId |
| Risk tolerance | Risk questionnaire | text, startChar, endChar, documentId, assessmentDate |

### Evidence Span Schema

```typescript
// Must match packages/knowledge/domain/src/value-objects/EvidenceSpan.ts
interface EvidenceSpan {
  text: string;              // Exact text span from source
  startChar: number;         // 0-indexed character offset start
  endChar: number;           // Exclusive end offset
  confidence?: number;       // 0-1 extraction confidence
}
```

### Grounding Threshold

- **Minimum grounding confidence**: 0.8
- Relations below this threshold are filtered as potential hallucinations
- Evidence spans with confidence < 0.8 should be flagged for human review

---

## Entity Resolution Strategy

### Matching Keys by Entity Type

| Entity Type | Primary Key | Fuzzy Keys |
|-------------|-------------|------------|
| Client | taxId (hashed) | normalizedName + dateOfBirth |
| Account | accountNumber + custodian | normalizedName + type |
| Trust | taxId (hashed) | normalizedName + establishedDate |
| Entity | taxId (hashed) | normalizedName + state |
| Investment | securityId (CUSIP/ISIN) | ticker + accountId |

### Source Priority

1. **Custodian feeds** (highest authority for financial data)
2. **Legal documents** (authority for ownership/beneficiary)
3. **CRM systems** (authority for relationships/demographics)
4. **Meeting notes/emails** (supplementary evidence)

### Conflict Resolution

| Conflict Type | Resolution | Example |
|---------------|------------|---------|
| Entity types | Union (multi-type allowed) | Client + Trustee |
| Attributes | Most recent wins | Address from latest statement |
| Evidence spans | Accumulate | Keep all mentions |
| Relations | Signature dedup | Same subject-predicate-object |

---

## Implementation Tasks

### P0.1: Create Ontology Turtle File

**Location**: `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl`

```turtle
@prefix wm: <https://beep.dev/ontology/wealth-management#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# Ontology declaration
<https://beep.dev/ontology/wealth-management> a owl:Ontology ;
    rdfs:label "Wealth Management Ontology" ;
    rdfs:comment "Domain ontology for UHNWI wealth management" ;
    owl:versionInfo "1.0.0" .

# Classes - Priority 0
wm:Client a owl:Class ;
    rdfs:label "Client" ;
    rdfs:comment "Natural person or entity receiving wealth management services" .

wm:Account a owl:Class ;
    rdfs:label "Account" ;
    rdfs:comment "Custodial account holding investments" .

# ... continue with full ontology
```

### P0.2: Generate Class Documentation

**Location**: `specs/agents/wealth-management-domain-expert/outputs/ontology-class-hierarchy.md`

Document each class with:
- Label and description
- Parent classes
- Direct properties (domain = this class)
- Inherited properties (from parents)
- Constraints (cardinality, value restrictions)

### P0.3: Generate Property Inventory

**Location**: `specs/agents/wealth-management-domain-expert/outputs/property-inventory.md`

Document each property with:
- IRI and label
- Domain and range
- Property type (object/datatype)
- Cardinality constraints
- Compliance requirements (if any)

### P0.4: Validate Against Existing Models

Cross-reference ontology with:
- `packages/knowledge/domain/src/entities/Entity/Entity.model.ts`
- `packages/knowledge/domain/src/entities/Relation/Relation.model.ts`

Ensure:
- Types array can store ontology class IRIs
- Attributes map can store property-value pairs
- Evidence spans follow existing pattern

---

## Verification Checklist

### Ontology Completeness

- [ ] All Priority 0 classes defined
- [ ] All Priority 1 classes defined (optional)
- [ ] All object properties have domain and range
- [ ] All datatype properties have domain and range
- [ ] Cardinality constraints documented
- [ ] Sensitive properties identified

### Evidence Linking

- [ ] EvidenceSpan schema matches existing pattern
- [ ] Compliance-critical facts have evidence requirements
- [ ] Grounding threshold defined (0.8)

### Entity Resolution

- [ ] Matching keys defined per entity type
- [ ] Source priority established
- [ ] Conflict resolution rules documented

### Integration Points

- [ ] Ontology format compatible with N3.js parser
- [ ] Class IRIs can be stored in Entity.types array
- [ ] Property IRIs can be stored as Relation.predicate

---

## Known Issues & Gotchas

1. **Turtle syntax**: Use `a` as shorthand for `rdf:type` in class declarations
2. **Property domains**: Use `owl:unionOf` for properties with multiple valid domains
3. **Blank nodes**: Avoid blank nodes for cardinality restrictions in serialized format
4. **IRI format**: Use full IRIs, not prefixed names, in JSON exports

---

## Success Criteria

- [ ] Ontology parses without errors using N3.js
- [ ] At least 8 classes defined (4 Priority 0 + 4 Priority 1)
- [ ] At least 15 properties defined (9 object + 6 datatype)
- [ ] Evidence linking pattern documented for 6 compliance-critical facts
- [ ] Entity resolution keys defined for all Priority 0 entities
- [ ] Class hierarchy visualization generated

---

## Abort Conditions & Rollback

### When to Pause Phase 0

Pause implementation and document in handoff if:

| Blocker | Detection | Mitigation |
|---------|-----------|------------|
| N3.js parser not available | `bun add n3` fails | Install N3.js or use alternative Turtle parser |
| Knowledge domain package missing | `packages/knowledge/domain/` doesn't exist | Create package first via `bun run create-slice` |
| Conflicting ontology exists | `outputs/wealth-management.ttl` already present | Review existing, merge or version |
| Upstream EvidenceSpan changes | `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts` signature changed | Align ontology evidence properties to new signature |
| @beep/schema breaking changes | BS helpers removed or renamed | Update property definitions to use new helpers |

### Rollback Steps

If Phase 0 cannot proceed:

1. **Document blocker** in `REFLECTION_LOG.md` under "Blockers Encountered"
2. **Create GitHub issue** for upstream dependency with label `blocker:spec`
3. **Update handoff notes** with:
   - What was attempted
   - Where it failed
   - What upstream fix is needed
4. **Notify orchestrator** to pause spec until blocker resolved
5. **Preserve partial work** in `outputs/partial/` directory

### Recovery After Blocker Resolution

1. Read `REFLECTION_LOG.md` for documented blocker
2. Verify blocker is resolved (check GitHub issue status)
3. Resume from last successful task in `## Implementation Tasks`
4. Update `REFLECTION_LOG.md` with resolution notes

---

## Next Phase

After completing Phase 0:

1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P1.md` with:
   - Verified ontology file paths
   - Effect Schema mapping strategy
   - Validation constraint specifications
3. Create `handoffs/P1_ORCHESTRATOR_PROMPT.md`
