# Phase 1 Handoff: Effect Schema Mapping

## Phase Summary

Phase 1 converts the wealth management OWL ontology from Phase 0 into Effect Schema models. This enables type-safe entity extraction, validation, and storage within the Effect ecosystem.

## Phase 0 Deliverables (Verified)

| Deliverable | Location | Status |
|-------------|----------|--------|
| Ontology (Turtle) | `outputs/wealth-management.ttl` | Complete |
| Class Hierarchy | `outputs/ontology-class-hierarchy.md` | Complete |
| Property Inventory | `outputs/property-inventory.md` | Complete |

### Verified Counts

| Metric | Count |
|--------|-------|
| OWL Classes | 33 |
| Object Properties | 17 |
| Datatype Properties | 26 |

---

## Source Verification

### Phase 0 Ontology Files

| File | Purpose | Key Sections |
|------|---------|--------------|
| `outputs/wealth-management.ttl` | Complete OWL ontology | Classes, properties, constraints |
| `outputs/ontology-class-hierarchy.md` | Class documentation | Hierarchy, properties per class |
| `outputs/property-inventory.md` | Property documentation | Domains, ranges, compliance |

### Existing Effect Model Patterns

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:46-135` | Entity model | types array, attributes map, EvidenceSpan |
| `packages/knowledge/domain/src/entities/Relation/Relation.model.ts:45-148` | Relation model | subjectId, predicate, objectId/literalValue |
| `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts:36-76` | Evidence span | text, startChar, endChar, confidence |
| `packages/shared/domain/src/entity-ids/entity-ids.ts:15-45` | Branded IDs | EntityId.builder pattern |

### BS Helper Patterns

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `.claude/rules/effect-patterns.md` | Schema patterns | BS helpers, sensitive fields |
| `packages/common/schema/src/` | @beep/schema | BS.FieldSensitiveOptionOmittable, BS.BoolWithDefault |

---

## OWL to Effect Schema Mapping

### Datatype Mapping

| OWL Datatype | Effect Schema | BS Helper | Notes |
|--------------|---------------|-----------|-------|
| xsd:string | S.String | — | Default text |
| xsd:string (sensitive) | S.String | BS.FieldSensitiveOptionOmittable | For taxId, etc. |
| xsd:decimal | S.Number | — | For amounts |
| xsd:date | S.Date | — | For dates |
| Enum values | S.Literal(...) | — | For status fields |
| IRI reference | BrandedId | makeEntityId | For entity refs |

### Property Mapping Strategy

**Object Properties → Relation with objectId:**
```typescript
// wm:ownsAccount → Relation
{
  predicate: "https://beep.dev/ontology/wealth-management#ownsAccount",
  objectId: KnowledgeEntityIds.KnowledgeEntityId
}
```

**Datatype Properties → Relation with literalValue:**
```typescript
// wm:legalName → Relation
{
  predicate: "https://beep.dev/ontology/wealth-management#legalName",
  literalValue: S.String,
  literalType: "http://www.w3.org/2001/XMLSchema#string"
}
```

---

## Entity ID Specifications

### Wealth Management Entity IDs

Each ontology class needs a corresponding branded ID type.

| OWL Class | Entity ID | Prefix | Location |
|-----------|-----------|--------|----------|
| wm:Client | WmClientId | `wm_client__` | New in @beep/shared-domain |
| wm:Account | WmAccountId | `wm_account__` | New in @beep/shared-domain |
| wm:Investment | WmInvestmentId | `wm_investment__` | New in @beep/shared-domain |
| wm:Trust | WmTrustId | `wm_trust__` | New in @beep/shared-domain |
| wm:Household | WmHouseholdId | `wm_household__` | New in @beep/shared-domain |
| wm:Beneficiary | WmBeneficiaryId | `wm_beneficiary__` | New in @beep/shared-domain |
| wm:Custodian | WmCustodianId | `wm_custodian__` | New in @beep/shared-domain |
| wm:LegalEntity | WmLegalEntityId | `wm_entity__` | New in @beep/shared-domain |
| wm:Document | Existing DocumentId | `documents_document__` | Use @beep/documents-domain |

### Entity ID Definition Pattern

```typescript
// packages/shared/domain/src/entity-ids/wealth-management/ids.ts
import { makeEntityId } from "../factory";

export const WmClientId = makeEntityId("wm_client");
export const WmAccountId = makeEntityId("wm_account");
export const WmInvestmentId = makeEntityId("wm_investment");
export const WmTrustId = makeEntityId("wm_trust");
export const WmHouseholdId = makeEntityId("wm_household");
export const WmBeneficiaryId = makeEntityId("wm_beneficiary");
export const WmCustodianId = makeEntityId("wm_custodian");
export const WmLegalEntityId = makeEntityId("wm_entity");
```

---

## Effect Schema Models to Create

### Priority 0: Core Entity Schemas

#### WmClient Schema

```typescript
export class WmClientSchema extends S.Class<WmClientSchema>("WmClientSchema")({
  id: WmClientId,
  organizationId: SharedEntityIds.OrganizationId,

  // Required attributes
  legalName: S.String,
  riskTolerance: S.Literal("Conservative", "Moderate", "Aggressive"),
  kycStatus: S.Literal("Pending", "Verified", "Expired"),

  // Sensitive attributes
  taxId: BS.FieldSensitiveOptionOmittable(S.String),
  dateOfBirth: BS.FieldSensitiveOptionOmittable(S.Date),
  netWorth: BS.FieldSensitiveOptionOmittable(S.Number),

  // Entity resolution keys
  normalizedName: BS.FieldOptionOmittable(S.String),
  taxIdHash: BS.FieldOptionOmittable(S.String),
}) {}
```

#### WmAccount Schema

```typescript
export class WmAccountSchema extends S.Class<WmAccountSchema>("WmAccountSchema")({
  id: WmAccountId,
  organizationId: SharedEntityIds.OrganizationId,

  // Required attributes
  accountNumber: S.String,
  accountType: S.Literal(
    "Individual", "Joint", "Trust", "Entity", "Retirement"
  ),
  taxStatus: S.Literal("Taxable", "Tax-Deferred", "Tax-Exempt"),

  // Optional attributes
  openDate: BS.FieldOptionOmittable(S.Date),

  // Relationships (stored as IDs, resolved via Relation)
  custodianId: WmCustodianId,
}) {}
```

#### WmInvestment Schema

```typescript
export class WmInvestmentSchema extends S.Class<WmInvestmentSchema>("WmInvestmentSchema")({
  id: WmInvestmentId,
  organizationId: SharedEntityIds.OrganizationId,

  // Required attributes
  investmentType: S.Literal(
    "Security", "PrivateFund", "RealEstate", "Alternative"
  ),

  // Optional attributes
  securityId: BS.FieldOptionOmittable(S.String),
  ticker: BS.FieldOptionOmittable(S.String),
  costBasis: BS.FieldOptionOmittable(S.Number),
  marketValue: BS.FieldOptionOmittable(S.Number),

  // Resolution key
  normalizedSecurityId: BS.FieldOptionOmittable(S.String),
}) {}
```

#### WmDocument Schema

```typescript
// Extends existing Document model with wealth management metadata
export class WmDocumentMetadata extends S.Class<WmDocumentMetadata>("WmDocumentMetadata")({
  documentType: S.Literal(
    "Agreement", "Statement", "LegalDocument", "ComplianceRecord"
  ),
  effectiveDate: BS.FieldOptionOmittable(S.Date),
  expirationDate: BS.FieldOptionOmittable(S.Date),
}) {}
```

### Priority 1: Complex Structure Schemas

#### WmTrust Schema

```typescript
export class WmTrustSchema extends S.Class<WmTrustSchema>("WmTrustSchema")({
  id: WmTrustId,
  organizationId: SharedEntityIds.OrganizationId,

  // Required attributes
  trustName: S.String,
  trustType: S.Literal(
    "Revocable", "Irrevocable", "Charitable"
  ),

  // Sensitive attributes
  taxId: BS.FieldSensitiveOptionOmittable(S.String),
  taxIdHash: BS.FieldOptionOmittable(S.String),

  // Optional attributes
  establishedDate: BS.FieldOptionOmittable(S.Date),
  jurisdiction: BS.FieldOptionOmittable(S.String),
}) {}
```

#### WmHousehold Schema

```typescript
export class WmHouseholdSchema extends S.Class<WmHouseholdSchema>("WmHouseholdSchema")({
  id: WmHouseholdId,
  organizationId: SharedEntityIds.OrganizationId,

  // Required attributes
  householdName: S.String,

  // Aggregated values (computed)
  memberCount: BS.FieldOptionOmittable(S.Number.pipe(S.int(), S.nonNegative())),
  totalAUM: BS.FieldOptionOmittable(S.Number),
}) {}
```

#### WmBeneficiary Schema

```typescript
export class WmBeneficiarySchema extends S.Class<WmBeneficiarySchema>("WmBeneficiarySchema")({
  id: WmBeneficiaryId,
  organizationId: SharedEntityIds.OrganizationId,

  // Required attributes
  beneficiaryType: S.Literal("Primary", "Contingent", "Per Stirpes"),

  // Optional attributes
  beneficiaryPercentage: BS.FieldOptionOmittable(
    S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(100))
  ),

  // May link to a Client entity
  linkedClientId: BS.FieldOptionOmittable(WmClientId),
}) {}
```

---

## Implementation Tasks

### P1.1: Create Entity ID Module

**Location**: `packages/shared/domain/src/entity-ids/wealth-management/`

Files to create:
- `ids.ts` - Branded ID definitions
- `table-name.ts` - Table name type union
- `any-id.ts` - Union type of all WM IDs
- `index.ts` - Barrel export

### P1.2: Create Domain Models

**Location**: `packages/wealth-management/domain/src/entities/`

Structure:
```
packages/wealth-management/domain/
├── src/
│   ├── entities/
│   │   ├── Client/
│   │   │   ├── Client.model.ts
│   │   │   └── index.ts
│   │   ├── Account/
│   │   │   ├── Account.model.ts
│   │   │   └── index.ts
│   │   ├── Investment/
│   │   ├── Trust/
│   │   ├── Household/
│   │   ├── Beneficiary/
│   │   ├── Custodian/
│   │   └── LegalEntity/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### P1.3: Create Ontology Integration

**Location**: `packages/wealth-management/domain/src/ontology/`

Files to create:
- `namespace.ts` - Ontology namespace constants
- `class-iris.ts` - Class IRI constants
- `property-iris.ts` - Property IRI constants
- `validation.ts` - Type validation against ontology

### P1.4: Update Knowledge Domain Integration

**Location**: `packages/knowledge/domain/`

Modifications:
- Add wealth management ontology ID to OntologyFormat enum (if needed)
- Add wealth management entity type mappings

---

## Verification Checklist

### Entity IDs

- [ ] All 8 entity IDs defined
- [ ] Prefixes follow `wm_<type>__` pattern
- [ ] IDs exported from @beep/shared-domain

### Effect Schemas

- [ ] All Priority 0 schemas created
- [ ] All Priority 1 schemas created
- [ ] Sensitive fields use BS.FieldSensitiveOptionOmittable
- [ ] Required fields validated with appropriate constraints
- [ ] organizationId present on all schemas

### Ontology Integration

- [ ] Namespace constant defined
- [ ] All class IRIs as constants
- [ ] All property IRIs as constants
- [ ] Type guards for ontology validation

### Tests

- [ ] Schema encode/decode round-trip tests
- [ ] Entity ID validation tests
- [ ] Ontology IRI constant tests

---

## Known Issues & Gotchas

1. **Multi-type entities**: Entities may have multiple types (e.g., Client + Beneficiary). Store all in Entity.types array.

2. **Sensitive field handling**: Use BS.FieldSensitiveOptionOmittable to suppress logging of taxId, dateOfBirth, netWorth.

3. **Document integration**: WmDocument extends existing @beep/documents-domain, not a new entity.

4. **Resolution keys**: normalizedName and taxIdHash fields enable entity resolution without exposing raw PII.

5. **Cardinality enforcement**: Cardinality constraints (min/max) are enforced at the Relation level, not in entity schemas.

---

## Success Criteria

- [ ] All 8 entity ID types defined and exported
- [ ] All 8 Effect Schema models created
- [ ] Ontology namespace and IRI constants defined
- [ ] Schema tests pass encode/decode round-trip
- [ ] Sensitive fields properly marked
- [ ] Documentation updated with schema examples

---

## Abort Conditions & Rollback

### When to Pause Phase 1

| Blocker | Detection | Mitigation |
|---------|-----------|------------|
| @beep/shared-domain changes | Entity ID factory signature changed | Align with new factory |
| Effect Schema breaking changes | S.Class pattern changed | Update to new pattern |
| BS helper deprecation | Helper not found | Use replacement helper |

### Rollback Steps

1. Document blocker in `REFLECTION_LOG.md`
2. Preserve partial work in `outputs/partial-phase1/`
3. Create GitHub issue with `blocker:spec` label
4. Update handoff with blocker status

---

## Next Phase

After completing Phase 1:

1. Update `REFLECTION_LOG.md` with:
   - Schema design decisions
   - Type mapping challenges
   - Integration insights

2. Create `handoffs/HANDOFF_P2.md` with:
   - Verified schema file paths
   - Extraction pipeline design
   - LLM prompt templates

3. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`
