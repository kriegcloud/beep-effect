# Wealth Management Ontology - Class Hierarchy

## Visual Hierarchy

```
owl:Thing
|
+-- wm:Client                          [Priority 0]
|   +-- wm:ClientProfile               Extended client information
|
+-- wm:Account                         [Priority 0]
|   +-- wm:IndividualAccount           Single owner
|   +-- wm:JointAccount                Multiple owners with survivorship
|   +-- wm:TrustAccount                Trust-owned account
|   +-- wm:EntityAccount               LLC/LP/Corp owned
|   +-- wm:RetirementAccount           IRA, 401k, Roth
|
+-- wm:Investment                      [Priority 0]
|   +-- wm:Security                    Public market securities
|   +-- wm:PrivateFund                 PE, VC, Hedge funds
|   +-- wm:RealEstate                  Direct or REIT
|   +-- wm:Alternative                 Art, collectibles, crypto
|
+-- wm:Document                        [Priority 0]
|   +-- wm:Agreement                   IPS, engagement letters
|   +-- wm:Statement                   Custodian statements
|   +-- wm:LegalDocument               Trust deeds, wills, POA
|   +-- wm:ComplianceRecord            ADV, KYC, disclosures
|
+-- wm:Household                       [Priority 1]
|
+-- wm:Trust                           [Priority 1]
|   +-- wm:RevocableTrust              Living trust
|   +-- wm:IrrevocableTrust            Cannot be modified
|   +-- wm:CharitableTrust             CRT, CLT
|
+-- wm:LegalEntity                     [Priority 1]
|   +-- wm:LLC                         Limited liability company
|   +-- wm:Partnership                 LP, LLP
|   +-- wm:Foundation                  Private foundation
|
+-- wm:Beneficiary                     [Priority 1]
|
+-- wm:Custodian                       [Priority 1]
```

---

## Class Details

### Priority 0: Core Entities

#### wm:Client

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Client` |
| **Label** | Client |
| **Alt Labels** | Customer, Investor |
| **Description** | Natural person or entity receiving wealth management services. UHNWI threshold: $30M+ net worth. |
| **Parent** | owl:Thing |
| **Cardinality Constraints** | `wm:ownsAccount` minCardinality 1 |

**Direct Properties (Domain = Client):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:ownsAccount | Object | wm:Account | Yes (min 1) |
| wm:memberOf | Object | wm:Household | No |
| wm:ownsEntity | Object | wm:LegalEntity | No |
| wm:legalName | Datatype | xsd:string | Yes |
| wm:taxId | Datatype | xsd:string | Yes (SENSITIVE) |
| wm:dateOfBirth | Datatype | xsd:date | No (SENSITIVE) |
| wm:netWorth | Datatype | xsd:decimal | No (SENSITIVE) |
| wm:riskTolerance | Datatype | xsd:string | Yes |
| wm:kycStatus | Datatype | xsd:string | Yes |

**Entity Resolution Keys:**
- Primary: `taxId` (hashed)
- Fuzzy: `normalizedName` + `dateOfBirth`

---

#### wm:Account

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Account` |
| **Label** | Account |
| **Alt Labels** | Custodial Account, Brokerage Account |
| **Description** | Custodial account holding investments at a financial institution. |
| **Parent** | owl:Thing |
| **Cardinality Constraints** | `wm:heldByCustodian` exactly 1 |

**Subclasses:**
- `wm:IndividualAccount` - Single owner
- `wm:JointAccount` - Multiple owners with survivorship rights
- `wm:TrustAccount` - Held in name of a trust
- `wm:EntityAccount` - Owned by LLC, LP, Corporation
- `wm:RetirementAccount` - Tax-advantaged (IRA, 401k, Roth)

**Direct Properties (Domain = Account):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:heldByCustodian | Object | wm:Custodian | Yes (exactly 1) |
| wm:containsInvestment | Object | wm:Investment | No |
| wm:hasBeneficiary | Object | wm:Beneficiary | No |
| wm:ownedBy | Object | wm:Client | Yes (inverse) |
| wm:accountNumber | Datatype | xsd:string | Yes |
| wm:accountType | Datatype | xsd:string | Yes |
| wm:taxStatus | Datatype | xsd:string | Yes |
| wm:openDate | Datatype | xsd:date | No |

**Entity Resolution Keys:**
- Primary: `accountNumber` + `custodian`
- Fuzzy: `normalizedName` + `accountType`

---

#### wm:Investment

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Investment` |
| **Label** | Investment |
| **Alt Labels** | Asset, Holding |
| **Description** | Asset holding within an account. |
| **Parent** | owl:Thing |

**Subclasses:**
- `wm:Security` - Publicly traded (stocks, bonds, ETFs)
- `wm:PrivateFund` - PE, VC, hedge funds
- `wm:RealEstate` - Direct ownership or REIT
- `wm:Alternative` - Art, collectibles, commodities, crypto

**Direct Properties (Domain = Investment):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:heldIn | Object | wm:Account | Yes (inverse) |
| wm:costBasis | Datatype | xsd:decimal | No |
| wm:marketValue | Datatype | xsd:decimal | No |
| wm:securityId | Datatype | xsd:string | Conditional |
| wm:ticker | Datatype | xsd:string | Conditional (Securities only) |

**Entity Resolution Keys:**
- Primary: `securityId` (CUSIP/ISIN)
- Fuzzy: `ticker` + `accountId`

---

#### wm:Document

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Document` |
| **Label** | Document |
| **Description** | Compliance evidence and client documentation. |
| **Parent** | owl:Thing |

**Subclasses:**
- `wm:Agreement` - IPS, engagement letters, advisory agreements
- `wm:Statement` - Custodian statements, performance reports
- `wm:LegalDocument` - Trust deeds, wills, power of attorney
- `wm:ComplianceRecord` - ADV Part 2, disclosures, KYC forms

**Direct Properties (Domain = Document):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:evidenceFor | Object | owl:Thing | No |
| wm:supersedes | Object | wm:Document | No |
| wm:documentDate | Datatype | xsd:date | No |
| wm:effectiveDate | Datatype | xsd:date | No |
| wm:expirationDate | Datatype | xsd:date | No |

---

### Priority 1: Complex Structures

#### wm:Household

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Household` |
| **Label** | Household |
| **Alt Labels** | Family Unit |
| **Description** | Family unit grouping for consolidated reporting and fee calculation. |
| **Parent** | owl:Thing |

**Direct Properties (Domain = Household):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:hasMember | Object | wm:Client | No |
| wm:householdName | Datatype | xsd:string | No |

---

#### wm:Trust

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Trust` |
| **Label** | Trust |
| **Description** | Legal trust structure for estate planning and asset protection. |
| **Parent** | owl:Thing |
| **Cardinality Constraints** | `wm:establishedBy` minCardinality 1 |

**Subclasses:**
- `wm:RevocableTrust` - Can be modified/revoked during grantor's lifetime
- `wm:IrrevocableTrust` - Cannot be modified after creation
- `wm:CharitableTrust` - Benefits charitable organizations (CRT, CLT)

**Direct Properties (Domain = Trust):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:establishedBy | Object | wm:Client | Yes (min 1) |
| wm:managedBy | Object | wm:Client OR wm:LegalEntity | Yes |
| wm:hasBeneficiary | Object | wm:Beneficiary | No |
| wm:holdsAccount | Object | wm:TrustAccount | No |
| wm:trustName | Datatype | xsd:string | Yes |
| wm:taxId | Datatype | xsd:string | Yes (SENSITIVE) |
| wm:establishedDate | Datatype | xsd:date | No |
| wm:jurisdiction | Datatype | xsd:string | No |

**Entity Resolution Keys:**
- Primary: `taxId` (hashed)
- Fuzzy: `normalizedName` + `establishedDate`

---

#### wm:LegalEntity

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#LegalEntity` |
| **Label** | Legal Entity |
| **Description** | Business or legal entity used for asset holding or operations. |
| **Parent** | owl:Thing |

**Subclasses:**
- `wm:LLC` - Limited Liability Company
- `wm:Partnership` - LP, LLP, GP
- `wm:Foundation` - Private charitable foundation

**Direct Properties (Domain = LegalEntity):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:managedByEntity | Object | wm:LegalEntity | No |
| wm:entityName | Datatype | xsd:string | Yes |
| wm:taxId | Datatype | xsd:string | Yes (SENSITIVE) |
| wm:stateOfFormation | Datatype | xsd:string | No |
| wm:formationDate | Datatype | xsd:date | No |

**Entity Resolution Keys:**
- Primary: `taxId` (hashed)
- Fuzzy: `normalizedName` + `stateOfFormation`

---

#### wm:Beneficiary

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Beneficiary` |
| **Label** | Beneficiary |
| **Description** | Individual or entity designated to receive benefits from an account or trust. |
| **Parent** | owl:Thing |

**Direct Properties (Domain = Beneficiary):**
| Property | Type | Range | Required |
|----------|------|-------|----------|
| wm:beneficiaryOf | Object | wm:Account OR wm:Trust | Yes (inverse) |
| wm:beneficiaryType | Datatype | xsd:string | Yes |
| wm:beneficiaryPercentage | Datatype | xsd:decimal | No |

---

#### wm:Custodian

| Property | Value |
|----------|-------|
| **IRI** | `https://beep.dev/ontology/wealth-management#Custodian` |
| **Label** | Custodian |
| **Alt Labels** | Broker-Dealer |
| **Description** | Financial institution holding client assets in custody. |
| **Parent** | owl:Thing |

---

## Class Count Summary

| Priority | Classes | Subclasses | Total |
|----------|---------|------------|-------|
| Priority 0 | 4 | 17 | 21 |
| Priority 1 | 6 | 7 | 13 |
| **Total** | **10** | **24** | **34** |

## Integration with Effect Models

### Entity.types Array

The `types` field in `packages/knowledge/domain/src/entities/Entity/Entity.model.ts` accepts an array of class IRIs:

```typescript
// Example: Multi-typed entity
{
  types: [
    "https://beep.dev/ontology/wealth-management#Client",
    "https://beep.dev/ontology/wealth-management#Beneficiary"
  ]
}
```

### Relation.predicate Field

The `predicate` field in `packages/knowledge/domain/src/entities/Relation/Relation.model.ts` stores property IRIs:

```typescript
// Example: Object property relation
{
  subjectId: "client-123",
  predicate: "https://beep.dev/ontology/wealth-management#ownsAccount",
  objectId: "account-456"
}

// Example: Datatype property relation
{
  subjectId: "client-123",
  predicate: "https://beep.dev/ontology/wealth-management#legalName",
  literalValue: "John Smith",
  literalType: "http://www.w3.org/2001/XMLSchema#string"
}
```
