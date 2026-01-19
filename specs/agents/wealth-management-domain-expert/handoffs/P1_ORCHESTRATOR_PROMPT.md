# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing **Phase 1: Effect Schema Mapping** of the Wealth Management Domain Expert agent specification.

### Context

Phase 0 created the OWL/RDFS ontology with:
- 33 classes (Client, Account, Investment, Trust, etc.)
- 17 object properties (ownsAccount, hasBeneficiary, etc.)
- 26 datatype properties (legalName, taxId, etc.)
- 3 cardinality constraints
- 9 compliance evidence requirements

Phase 1 converts this ontology into Effect Schema models for type-safe extraction and storage.

### Your Mission

Create Effect Schema models and branded entity IDs:

1. **Entity ID definitions** (8 branded IDs)
2. **Effect Schema models** (8 entity schemas)
3. **Ontology integration** (namespace and IRI constants)
4. **Schema tests** (encode/decode round-trip)

### Critical Patterns

**Branded Entity ID Pattern** (from `packages/shared/domain/src/entity-ids/`):
```typescript
import { makeEntityId } from "../factory";

export const WmClientId = makeEntityId("wm_client");
export type WmClientId = typeof WmClientId.Type;
```

**Effect Schema Model Pattern** (from `packages/knowledge/domain/src/entities/Entity/`):
```typescript
export class WmClientSchema extends S.Class<WmClientSchema>("WmClientSchema")({
  id: WmClientId,
  organizationId: SharedEntityIds.OrganizationId,
  legalName: S.String,
  taxId: BS.FieldSensitiveOptionOmittable(S.String),
  riskTolerance: S.Literal("Conservative", "Moderate", "Aggressive"),
}) {}
```

**Sensitive Field Pattern** (from `.claude/rules/effect-patterns.md`):
```typescript
// Use BS.FieldSensitiveOptionOmittable for PII
taxId: BS.FieldSensitiveOptionOmittable(S.String),
dateOfBirth: BS.FieldSensitiveOptionOmittable(S.Date),
netWorth: BS.FieldSensitiveOptionOmittable(S.Number),
```

### Reference Files

| File | Purpose |
|------|---------|
| `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P1.md` | **Full context** - schema mappings, ID specs |
| `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl` | Source ontology |
| `specs/agents/wealth-management-domain-expert/outputs/property-inventory.md` | Property details |
| `packages/shared/domain/src/entity-ids/entity-ids.ts:15-45` | Entity ID factory |
| `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:46-135` | Effect model pattern |
| `.claude/rules/effect-patterns.md` | BS helper patterns |

### Deliverables

Create these files:

1. **Entity ID Module**
   ```
   packages/shared/domain/src/entity-ids/wealth-management/
   ├── ids.ts           # Branded ID definitions
   ├── table-name.ts    # Table name type union
   ├── any-id.ts        # Union of all WM IDs
   └── index.ts         # Barrel export
   ```

2. **Domain Models**
   ```
   packages/wealth-management/domain/src/entities/
   ├── Client/Client.model.ts
   ├── Account/Account.model.ts
   ├── Investment/Investment.model.ts
   ├── Trust/Trust.model.ts
   ├── Household/Household.model.ts
   ├── Beneficiary/Beneficiary.model.ts
   ├── Custodian/Custodian.model.ts
   ├── LegalEntity/LegalEntity.model.ts
   └── index.ts
   ```

3. **Ontology Integration**
   ```
   packages/wealth-management/domain/src/ontology/
   ├── namespace.ts     # Ontology namespace
   ├── class-iris.ts    # Class IRI constants
   ├── property-iris.ts # Property IRI constants
   └── index.ts
   ```

4. **Schema Tests**
   ```
   packages/wealth-management/domain/test/entities/
   ├── Client.test.ts
   ├── Account.test.ts
   └── ...
   ```

### OWL to Effect Type Mapping

| OWL Datatype | Effect Schema |
|--------------|---------------|
| xsd:string | S.String |
| xsd:string (sensitive) | BS.FieldSensitiveOptionOmittable(S.String) |
| xsd:decimal | S.Number |
| xsd:date | S.Date |
| Enum | S.Literal(...) |
| IRI reference | BrandedId |

### Verification

After creating deliverables:

```bash
# Type check new package
bun run check --filter @beep/wealth-management-domain

# Run tests
bun run test --filter @beep/wealth-management-domain

# Verify entity ID exports
grep "WmClientId" packages/shared/domain/src/entity-ids/wealth-management/ids.ts
```

### Success Criteria

- [ ] 8 entity ID types defined (WmClientId, WmAccountId, etc.)
- [ ] 8 Effect Schema models created with proper fields
- [ ] Sensitive fields use BS.FieldSensitiveOptionOmittable
- [ ] organizationId present on all schemas
- [ ] Ontology namespace constant: `https://beep.dev/ontology/wealth-management#`
- [ ] All class IRIs exported as constants
- [ ] All property IRIs exported as constants
- [ ] Schema tests pass encode/decode round-trip

### Handoff Document

Read full context in: `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:

1. Update `specs/agents/wealth-management-domain-expert/REFLECTION_LOG.md` with:
   - Schema design decisions
   - Type mapping challenges
   - Integration insights

2. Create `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P2.md` with:
   - Verified schema file paths
   - Extraction pipeline design
   - LLM prompt templates

3. Create `specs/agents/wealth-management-domain-expert/handoffs/P2_ORCHESTRATOR_PROMPT.md`

**A phase is NOT complete until BOTH handoff files exist.**

---

## Quick Start Checklist

1. [ ] Read `HANDOFF_P1.md` for complete context
2. [ ] Review existing entity ID patterns in `packages/shared/domain/src/entity-ids/`
3. [ ] Review existing model patterns in `packages/knowledge/domain/src/entities/`
4. [ ] Create wealth-management entity ID module
5. [ ] Create wealth-management domain package (if not exists)
6. [ ] Implement all 8 entity schemas
7. [ ] Create ontology IRI constants
8. [ ] Write schema tests
9. [ ] Verify success criteria
10. [ ] Update reflection log
11. [ ] Create Phase 2 handoff documents
