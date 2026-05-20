# P1: Schema Design

## Status

PENDING EXECUTION

## Objective

Define Effect Schema types for 15 node types and 11+ edge types as tagged unions with OWL traceability annotations, and document all reasoning constraints dropped during translation.

---

## NodeKind Union

```typescript
// Composed tagged union of all 15 node types
const NodeKind = S.Union(
  Patent,
  Trademark,
  CopyrightWork,
  LegalEntity,
  IPRight,
  License,
  Filing,
  Jurisdiction,
  ClassificationCode,
  Court,
  Judgment,
  LegalProvision,
  Norm,
  Expression,
  Claim,
)
```

## EdgeKind Union

```typescript
// Composed tagged union of all 11+ edge types
const EdgeKind = S.Union(
  Grants,
  HeldBy,
  FiledBy,
  ClassifiedAs,
  Infringes,
  Licenses,
  CoveredBy,
  Supersedes,
  DecidedBy,
  GovernedBy,
  Cites,
)
```

---

## Node Type Definitions

### Patent

- `_tag`: `Patent`
- Source: S2, S7
- Fields:
- OWL Class Mapping:

### Trademark

- `_tag`: `Trademark`
- Source: S2
- Fields:
- OWL Class Mapping:

### CopyrightWork

- `_tag`: `CopyrightWork`
- Source: S3
- Fields:
- OWL Class Mapping:

### LegalEntity

- `_tag`: `LegalEntity`
- Source: S1, S2
- Fields:
- OWL Class Mapping:

### IPRight

- `_tag`: `IPRight`
- Source: S2, S3
- Fields:
- OWL Class Mapping:

### License

- `_tag`: `License`
- Source: S3
- Fields:
- OWL Class Mapping:

### Filing

- `_tag`: `Filing`
- Source: S2
- Fields:
- OWL Class Mapping:

### Jurisdiction

- `_tag`: `Jurisdiction`
- Source: S1, S6
- Fields:
- OWL Class Mapping:

### ClassificationCode

- `_tag`: `ClassificationCode`
- Source: S7
- Fields:
- OWL Class Mapping:

### Court

- `_tag`: `Court`
- Source: S4
- Fields:
- OWL Class Mapping:

### Judgment

- `_tag`: `Judgment`
- Source: S4
- Fields:
- OWL Class Mapping:

### LegalProvision

- `_tag`: `LegalProvision`
- Source: S1, S6
- Fields:
- OWL Class Mapping:

### Norm

- `_tag`: `Norm`
- Source: S1, S6
- Fields:
- OWL Class Mapping:

### Expression

- `_tag`: `Expression`
- Source: S1
- Fields:
- OWL Class Mapping:

### Claim

- `_tag`: `Claim`
- Source: S2, S5
- Fields:
- OWL Class Mapping:

---

## Edge Type Definitions

### Grants

- `_type`: `GRANTS`
- Source: S1, S2
- `sourceId`: Jurisdiction
- `targetId`: IPRight
- Metadata Fields:

### HeldBy

- `_type`: `HELD_BY`
- Source: S2, S3
- `sourceId`: IPRight
- `targetId`: LegalEntity
- Metadata Fields:

### FiledBy

- `_type`: `FILED_BY`
- Source: S2
- `sourceId`: Filing
- `targetId`: LegalEntity
- Metadata Fields:

### ClassifiedAs

- `_type`: `CLASSIFIED_AS`
- Source: S7
- `sourceId`: Patent | Trademark
- `targetId`: ClassificationCode
- Metadata Fields:

### Infringes

- `_type`: `INFRINGES`
- Source: S2, S5
- `sourceId`: LegalEntity
- `targetId`: IPRight
- Metadata Fields:

### Licenses

- `_type`: `LICENSES`
- Source: S3
- `sourceId`: License
- `targetId`: IPRight
- Metadata Fields:

### CoveredBy

- `_type`: `COVERED_BY`
- Source: S1, S3
- `sourceId`: CopyrightWork | Patent
- `targetId`: LegalProvision
- Metadata Fields:

### Supersedes

- `_type`: `SUPERSEDES`
- Source: S2
- `sourceId`: IPRight
- `targetId`: IPRight
- Metadata Fields:

### DecidedBy

- `_type`: `DECIDED_BY`
- Source: S4
- `sourceId`: Judgment
- `targetId`: Court
- Metadata Fields:

### GovernedBy

- `_type`: `GOVERNED_BY`
- Source: S1, S6
- `sourceId`: IPRight
- `targetId`: Jurisdiction
- Metadata Fields:

### Cites

- `_type`: `CITES`
- Source: S4, S5
- `sourceId`: Judgment
- `targetId`: Judgment | LegalProvision
- Metadata Fields:

---

## OWL Reasoning Constraints Dropped

| Constraint | Source Ontology | OWL Axiom | Reason Dropped |
|---|---|---|---|
| | | | |

---

## Decision Closure Checklist

- [ ] All 15 node types defined with `_tag` and `@source` annotations
- [ ] All 11+ edge types defined with `_type`, `sourceId`, `targetId`
- [ ] `NodeKind` union composed with 15 branches
- [ ] `EdgeKind` union composed with 11+ branches
- [ ] Dropped OWL constraints documented with justifications
- [ ] No open design decisions remain
