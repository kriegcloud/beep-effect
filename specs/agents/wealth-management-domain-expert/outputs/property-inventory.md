# Wealth Management Ontology - Property Inventory

## Summary

| Category | Count |
|----------|-------|
| Object Properties | 15 |
| Datatype Properties | 22 |
| **Total Properties** | **37** |

---

## Object Properties

Object properties define relationships between entities (entity-to-entity links).

### Ownership & Custody

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:ownsAccount` | wm:Client | wm:Account | 1..* | **Required** - Evidence from account opening agreement |
| `wm:ownedBy` | wm:Account | wm:Client | 1..* | Inverse of ownsAccount |
| `wm:heldByCustodian` | wm:Account | wm:Custodian | exactly 1 | **Required** - Custodian feed authoritative |
| `wm:ownsEntity` | wm:Client | wm:LegalEntity | 0..* | Evidence from operating agreement |

### Holdings

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:containsInvestment` | wm:Account | wm:Investment | 0..* | Custodian feed authoritative |
| `wm:heldIn` | wm:Investment | wm:Account | 1 | Inverse of containsInvestment |

### Beneficiary Relationships

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:hasBeneficiary` | wm:Account, wm:Trust | wm:Beneficiary | 0..* | **Required** - Evidence from beneficiary form |
| `wm:beneficiaryOf` | wm:Beneficiary | wm:Account, wm:Trust | 1..* | Inverse of hasBeneficiary |

### Trust Relationships

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:establishedBy` | wm:Trust | wm:Client | 1..* | **Required** - Evidence from trust document |
| `wm:managedBy` | wm:Trust | wm:Client, wm:LegalEntity | 1..* | **Required** - Evidence from trust document |
| `wm:holdsAccount` | wm:Trust | wm:TrustAccount | 0..* | Links trust to its accounts |

### Household Membership

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:memberOf` | wm:Client | wm:Household | 0..1 | CRM data source |
| `wm:hasMember` | wm:Household | wm:Client | 0..* | Inverse of memberOf |

### Document Relationships

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:evidenceFor` | wm:Document | owl:Thing | 0..* | Links documents to facts |
| `wm:hasEvidence` | owl:Thing | wm:Document | 0..* | Inverse of evidenceFor |
| `wm:supersedes` | wm:Document | wm:Document | 0..1 | Document versioning |

### Entity Management

| Property | Domain | Range | Cardinality | Compliance |
|----------|--------|-------|-------------|------------|
| `wm:managedByEntity` | wm:LegalEntity | wm:LegalEntity | 0..* | GP manages LP pattern |

---

## Datatype Properties

Datatype properties define attributes of entities (entity-to-literal values).

### Client Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:legalName` | wm:Client | xsd:string | Yes | No | - |
| `wm:taxId` | wm:Client, wm:LegalEntity, wm:Trust | xsd:string | Yes | **Yes** | - |
| `wm:dateOfBirth` | wm:Client | xsd:date | No | **Yes** | - |
| `wm:netWorth` | wm:Client | xsd:decimal | No | **Yes** | - |
| `wm:riskTolerance` | wm:Client | xsd:string | Yes | No | "Conservative", "Moderate", "Aggressive" |
| `wm:kycStatus` | wm:Client | xsd:string | Yes | No | "Pending", "Verified", "Expired" |

### Account Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:accountNumber` | wm:Account | xsd:string | Yes | No | - |
| `wm:accountType` | wm:Account | xsd:string | Yes | No | - |
| `wm:taxStatus` | wm:Account | xsd:string | Yes | No | "Taxable", "Tax-Deferred", "Tax-Exempt" |
| `wm:openDate` | wm:Account | xsd:date | No | No | - |

### Investment Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:costBasis` | wm:Investment | xsd:decimal | No | No | - |
| `wm:marketValue` | wm:Investment | xsd:decimal | No | No | - |
| `wm:securityId` | wm:Investment | xsd:string | Conditional | No | - |
| `wm:ticker` | wm:Security | xsd:string | Conditional | No | - |

### Trust Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:trustName` | wm:Trust | xsd:string | Yes | No | - |
| `wm:establishedDate` | wm:Trust | xsd:date | No | No | - |
| `wm:jurisdiction` | wm:Trust | xsd:string | No | No | - |

### Document Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:documentDate` | wm:Document | xsd:date | No | No | - |
| `wm:effectiveDate` | wm:Document | xsd:date | No | No | - |
| `wm:expirationDate` | wm:Document | xsd:date | No | No | - |

### Beneficiary Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:beneficiaryType` | wm:Beneficiary | xsd:string | Yes | No | "Primary", "Contingent", "Per Stirpes" |
| `wm:beneficiaryPercentage` | wm:Beneficiary | xsd:decimal | No | No | - |

### Household Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:householdName` | wm:Household | xsd:string | No | No | - |

### Legal Entity Attributes

| Property | Domain | Range | Required | Sensitive | Enumeration |
|----------|--------|-------|----------|-----------|-------------|
| `wm:entityName` | wm:LegalEntity | xsd:string | Yes | No | - |
| `wm:stateOfFormation` | wm:LegalEntity | xsd:string | No | No | - |
| `wm:formationDate` | wm:LegalEntity | xsd:date | No | No | - |

---

## Compliance-Critical Properties

These properties require evidence linking to source documents for audit compliance.

### Evidence Requirements Matrix

| Property | Evidence Source | Required Fields | Grounding Threshold |
|----------|-----------------|-----------------|---------------------|
| `wm:ownsAccount` | Account opening agreement | text, startChar, endChar, documentId | 0.8 |
| `wm:hasBeneficiary` | Beneficiary designation form | text, startChar, endChar, documentId, effectiveDate | 0.8 |
| `wm:establishedBy` | Trust document | text, startChar, endChar, documentId | 0.8 |
| `wm:managedBy` | Trust document | text, startChar, endChar, documentId | 0.8 |
| `wm:riskTolerance` | Risk questionnaire or IPS | text, startChar, endChar, documentId, assessmentDate | 0.8 |
| Power of Attorney | POA document | text, startChar, endChar, documentId, expirationDate | 0.8 |

### Evidence Span Schema

All compliance-critical facts must include evidence matching the `EvidenceSpan` value object:

```typescript
interface EvidenceSpan {
  text: string;        // Exact text span from source
  startChar: number;   // 0-indexed character offset start
  endChar: number;     // Exclusive end offset
  confidence?: number; // 0-1 extraction confidence
}
```

**Grounding Rule**: Relations with `groundingConfidence < 0.8` should be:
1. Flagged for human review
2. Excluded from automated compliance reports
3. Preserved for potential future correction

---

## Sensitive Field Handling

Fields marked as SENSITIVE must use Effect's `S.Redacted` or `BS.FieldSensitiveOptionOmittable` patterns to suppress logging.

### Sensitive Properties List

| Property | Reason | Handling |
|----------|--------|----------|
| `wm:taxId` | PII - enables identity theft | Hash for storage, never log plaintext |
| `wm:dateOfBirth` | PII - used for identity verification | Encrypt at rest, log only year |
| `wm:netWorth` | Financial privacy | Never log, restrict API access |

### Effect Schema Mapping

```typescript
// Example: Client schema with sensitive handling
const ClientSchema = S.Struct({
  legalName: S.String,
  taxId: BS.FieldSensitiveOptionOmittable(S.String),  // Never logged
  dateOfBirth: BS.FieldSensitiveOptionOmittable(S.Date),
  netWorth: BS.FieldSensitiveOptionOmittable(S.Number),
  riskTolerance: S.Literal("Conservative", "Moderate", "Aggressive"),
  kycStatus: S.Literal("Pending", "Verified", "Expired"),
});
```

---

## Property Cardinality Constraints

### Required Relationships (min 1)

| Class | Property | Constraint | Rationale |
|-------|----------|------------|-----------|
| wm:Client | wm:ownsAccount | minCardinality 1 | Client must have at least one account |
| wm:Trust | wm:establishedBy | minCardinality 1 | Trust must have a grantor |

### Exact Cardinality (exactly 1)

| Class | Property | Constraint | Rationale |
|-------|----------|------------|-----------|
| wm:Account | wm:heldByCustodian | cardinality 1 | Each account has exactly one custodian |

### Functional Properties (max 1)

| Property | Rationale |
|----------|-----------|
| wm:memberOf | Client belongs to at most one household |
| wm:supersedes | Document supersedes at most one previous version |

---

## Integration with Effect Models

### Relation Model Mapping

Object properties map to `Relation` entities with `objectId`:

```typescript
// wm:ownsAccount -> Relation
{
  subjectId: "knowledge_entity__client-uuid",
  predicate: "https://beep.dev/ontology/wealth-management#ownsAccount",
  objectId: "knowledge_entity__account-uuid",
  evidence: {
    text: "John Smith, as account owner...",
    startChar: 245,
    endChar: 278,
    confidence: 0.92
  },
  groundingConfidence: 0.92
}
```

Datatype properties map to `Relation` entities with `literalValue`:

```typescript
// wm:legalName -> Relation
{
  subjectId: "knowledge_entity__client-uuid",
  predicate: "https://beep.dev/ontology/wealth-management#legalName",
  literalValue: "John Smith",
  literalType: "http://www.w3.org/2001/XMLSchema#string"
}
```

### Entity Model Mapping

Entity `types` array contains class IRIs:

```typescript
// Client entity
{
  mention: "John Smith",
  types: ["https://beep.dev/ontology/wealth-management#Client"],
  attributes: {
    "https://beep.dev/ontology/wealth-management#legalName": "John Smith",
    "https://beep.dev/ontology/wealth-management#kycStatus": "Verified"
  }
}
```

### Property IRI Format

All property IRIs follow the pattern:
```
https://beep.dev/ontology/wealth-management#{propertyName}
```

Example IRIs:
- `https://beep.dev/ontology/wealth-management#ownsAccount`
- `https://beep.dev/ontology/wealth-management#legalName`
- `https://beep.dev/ontology/wealth-management#taxId`
