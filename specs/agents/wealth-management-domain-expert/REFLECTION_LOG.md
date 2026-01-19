# Reflection Log: Wealth Management Domain Expert Agent

This document captures cumulative learnings from each implementation phase.

---

## 2026-01-18 - Specification Creation Reflection

### What Worked
- Parallel agent orchestration for research phase gathered comprehensive context
- Knowledge graph integration spec provided proven patterns for ontology-guided extraction
- Domain research identified compliance-critical evidence linking requirements
- Existing `@beep/knowledge-domain` models established foundation patterns

### What Didn't Work
- N/A (initial specification)

### Methodology Improvements
- [x] Use `codebase-researcher` to understand existing patterns before designing new models
- [x] Use `ai-trends-researcher` for domain-specific knowledge gathering
- [ ] Consider consulting compliance experts for regulatory validation

### Codebase-Specific Insights
1. **EvidenceSpan pattern** at `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts:36-76` provides W3C Web Annotation semantics with character-level offsets
2. **Entity model pattern** at `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:46-135` includes `mentions` array for denormalized evidence access
3. **Multi-tenant architecture** requires `organizationId` on all tables with RLS policies
4. **Effect Schema imports** must use `* as S from "effect/Schema"` with PascalCase constructors

### Domain-Specific Insights
1. **Fiduciary duty** is the core regulatory obligation - every recommendation must trace to documented client objectives
2. **Complex ownership structures** (trusts, LLCs, partnerships) require graph-based modeling, not flat tables
3. **Cross-source entity resolution** is critical - same client appears in custodian feeds, CRM, and documents
4. **Compliance audit trails** need character-level provenance, not just document references

---

## 2026-01-18 - Phase 0 Pre-Implementation Reflection

### Prompt Refinement Examples

**Ontology Class Design**

| Attempt | Prompt | Outcome | Learning |
|---------|--------|---------|----------|
| 1 | "Create Client entity for wealth management" | Too generic, missed UHNWI-specific fields | Specify net worth tiers and complex structures |
| 2 | "Create Client entity with UHNWI fields including trusts, LLCs, household linkage" | Good structure, missing evidence linking | Always include compliance provenance requirements |
| 3 | "Create Client entity with UHNWI fields, evidence span requirements, and entity resolution keys (taxId, normalizedName + DOB)" | Complete design | Combine domain specifics + compliance + resolution in single prompt |

**Relationship Modeling**

| Attempt | Prompt | Outcome | Learning |
|---------|--------|---------|----------|
| 1 | "Define account ownership relationship" | Simple foreign key, no cardinality | OWL requires explicit cardinality constraints |
| 2 | "Define ownsAccount object property with domain=Client, range=Account, cardinality 1..*" | Correct constraints, missing evidence requirement | Compliance-critical relationships need evidence linking |
| 3 | "Define ownsAccount with domain=Client, range=Account, minCardinality=1, evidenceRequired=true (source: account opening agreement)" | Production ready | Include evidence source in property definition |

### Common Failure Patterns

| Pattern | Example | Resolution |
|---------|---------|------------|
| **Missing multi-tenancy** | Ontology without organizationId consideration | Add organizationId to all entity discussions |
| **Flat thinking** | Account as simple table with ownerId | Use graph model: Account ← ownsAccount → Client |
| **Generic compliance** | "Track who created what" | Specify character-level EvidenceSpan with confidence |
| **Single-source assumption** | "Client name from database" | Design for cross-source resolution (custodian, CRM, documents) |

### Codebase Pattern Discoveries

1. **Relation model** at `packages/knowledge/domain/src/entities/Relation/Relation.model.ts:45-148`:
   - Supports both entity references (`objectId`) and literal values (`literalValue`)
   - Evidence spans tracked via `evidence` field
   - Grounding confidence for hallucination filtering

2. **Mention model** at `packages/knowledge/domain/src/entities/Mention/Mention.model.ts:49-148`:
   - Links entity to specific text spans in documents
   - `isPrimary` flag for canonical reference selection
   - `chunkIndex` for pagination within large documents

3. **Ontology model** at `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts:75-183`:
   - Tracks `classCount` and `propertyCount` for validation
   - `contentHash` for versioning and deduplication
   - Status workflow: draft → active → deprecated

4. **Extraction model** at `packages/knowledge/domain/src/entities/Extraction/Extraction.model.ts:65-198`:
   - Tracks extraction runs with statistics
   - Links to ontology used for extraction
   - Status workflow: pending → running → completed/failed/cancelled

### Integration with Existing Patterns

**Effect-Ontology Analysis** at `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md`:

| Concept | Location | Adaptation for Wealth Management |
|---------|----------|----------------------------------|
| 6-phase extraction pipeline | Lines 163-173 | Same phases, wealth management ontology constraints |
| ClassDefinition schema | Lines 97-108 | Add wealth management classes as instances |
| Entity resolution strategies | Lines 136-148 | Apply to Client, Account, Trust matching |
| Grounding threshold 0.8 | Line 296 | Use for compliance-critical relation filtering |
| KnowledgeGraph Monoid | Lines 119-156 | Merge strategies for multi-source client data |

---

## Prompt Engineering Guidelines

### Effective Prompt Patterns

1. **Domain + Compliance + Resolution**
   ```
   Create {EntityType} for wealth management with:
   - UHNWI-specific fields ({specific fields})
   - Evidence span requirements for compliance ({source types})
   - Entity resolution keys ({primary key}, {fuzzy keys})
   ```

2. **Relationship with OWL Semantics**
   ```
   Define {propertyName} object property:
   - Domain: {DomainClass}
   - Range: {RangeClass}
   - Cardinality: {min}..{max}
   - Evidence required: {yes/no} (source: {document type})
   ```

3. **Multi-Source Entity Resolution**
   ```
   Design entity matching for {EntityType}:
   - Primary key: {exact match field}
   - Fuzzy keys: {normalized fields}
   - Source priority: {ordered list}
   - Conflict resolution: {strategy}
   ```

### Anti-Patterns to Avoid

| Anti-Pattern | Example | Better Approach |
|--------------|---------|-----------------|
| Vague entity request | "Create a user entity" | "Create Client entity with taxId, net worth tier, risk tolerance" |
| Missing cardinality | "Client has accounts" | "Client ownsAccount (1..*) Account" |
| No evidence requirement | "Track beneficiaries" | "Track beneficiaries with EvidenceSpan from beneficiary form" |
| Single-source design | "Get client from database" | "Resolve client across custodian, CRM, and documents" |

---

## 2026-01-18 - Phase 0 Entity Design Patterns

### What Worked
- Using OWL/RDFS semantics for class definitions provides interoperability
- Separating Priority 0 (core) from Priority 1 (complex) classes allows incremental implementation
- Documenting cardinality constraints upfront prevents relationship ambiguity

### What Didn't Work
- Initial entity designs lacked multi-tenancy consideration
- First-pass property definitions missed compliance evidence requirements

### Prompt Refinements

**Entity Class Design**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Create Account class for wealth management" | Too generic, no UHNWI specifics | "Create wm:Account owl:Class with subclasses for IndividualAccount, JointAccount, TrustAccount, EntityAccount (LLC/LP), RetirementAccount (IRA/401k), including taxStatus and custodian properties" | Complete class hierarchy with regulatory classifications |
| "Define client attributes" | Missing sensitive field marking | "Define wm:Client datatype properties with taxId (sensitive), legalName, dateOfBirth (sensitive), netWorth (sensitive), riskTolerance (enum: Conservative/Moderate/Aggressive), kycStatus (enum: Pending/Verified/Expired)" | Proper sensitivity classification |

**Relationship Design**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Link client to accounts" | No cardinality or evidence | "Define wm:ownsAccount object property with domain=Client, range=Account, cardinality 1..*, evidenceRequired=true (source: account opening agreement with EvidenceSpan)" | Compliance-ready relationship |
| "Model trust beneficiaries" | Missing trust types | "Define wm:hasBeneficiary with domain=(Account OR Trust), range=Beneficiary, where Trust includes RevocableTrust, IrrevocableTrust, CharitableTrust subtypes" | Complete beneficiary model with trust taxonomy |

### Codebase Discoveries

1. **Entity types array** at `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:64-69`:
   - Uses `S.Array(S.String).pipe(S.minItems(1))` - entities must have at least one type
   - Wealth management ontology classes will be stored as full IRIs in this array

2. **Relation evidence field** at `packages/knowledge/domain/src/entities/Relation/Relation.model.ts:109-114`:
   - Uses `BS.FieldOptionOmittable(EvidenceSpan)` pattern
   - Compliance-critical relations must populate this field

3. **Ontology status workflow** at `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts:25-28`:
   - Status enum: `draft → active → deprecated`
   - New wealth management ontology should start as `draft`

---

## 2026-01-18 - Phase 1 Effect Schema Mapping Patterns

### What Worked
- Mapping OWL datatypes to Effect Schema types (xsd:string → S.String, xsd:decimal → S.Number)
- Using BS helpers for optional sensitive fields
- Branded IDs for entity references

### What Didn't Work
- Initial attempt used raw TypeScript interfaces instead of S.Class
- Forgot to use namespace imports for Effect modules

### Prompt Refinements

**Schema Definition**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Create Client schema" | Used interface, not S.Class | "Create Client using S.Class pattern per `packages/knowledge/domain/src/entities/Entity/Entity.model.ts:46-135`, with branded ClientId via EntityId.builder, organizationId for multi-tenancy" | Correct Effect Schema model |
| "Add sensitive fields" | Used S.optional instead of BS helper | "Mark taxId, dateOfBirth, netWorth as sensitive using BS.FieldSensitiveOptionOmittable pattern per `.claude/rules/effect-patterns.md` Sensitive Field Guidelines" | Proper log suppression |

**Import Patterns**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Import Schema" | Used `import { Schema }` | "Use namespace import: `import * as S from 'effect/Schema'` per `.claude/rules/effect-patterns.md` Namespace Imports section" | Correct import pattern |

### Schema Type Mappings Established

| OWL Datatype | Effect Schema | BS Helper | Notes |
|--------------|---------------|-----------|-------|
| xsd:string | S.String | — | Default for text |
| xsd:string (sensitive) | S.String | BS.FieldSensitiveOptionOmittable | For taxId, etc. |
| xsd:decimal | S.Number | — | For amounts |
| xsd:date | S.Date | BS.DateTimeUtcFromAllAcceptable | For dates |
| enum | S.Literal(...) | — | For status fields |
| IRI reference | BrandedId | EntityId.builder | For entity refs |

---

## 2026-01-18 - Phase 2 Extraction Pipeline Patterns

### What Worked
- 6-phase pipeline from effect-ontology-analysis provides proven structure
- Ontology-guided prompts constrain LLM outputs to valid classes
- Grounding threshold 0.8 catches most hallucinations

### What Didn't Work
- First prompt attempts didn't include ontology context in extraction
- Entity resolution keys weren't extracted during mention phase

### Prompt Refinements

**Extraction Prompts**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Extract entities from document" | No ontology constraint | "Extract entities using wealth-management ontology classes only: wm:Client, wm:Account, wm:Investment, wm:Trust, wm:Document. For each entity, output types array, mention text, startChar, endChar" | Constrained extraction with provenance |
| "Find relationships" | No cardinality enforcement | "Extract relations using ontology properties only: wm:ownsAccount (Client→Account, 1..*), wm:containsInvestment (Account→Investment, 0..*), etc. Include evidence span for compliance relations" | Cardinality-aware extraction |

### Pipeline Phase Responsibilities

| Phase | Input | Output | Key Constraint |
|-------|-------|--------|----------------|
| CHUNK | Document | Text chunks | Sentence-aware splits |
| MENTION | Chunk | Entity mentions | Character offsets preserved |
| ENTITY | Mentions | Typed entities | Ontology classes only |
| SCOPE | Entities | Property scopes | Domain/range validation |
| RELATION | Scoped entities | Relations | Ontology properties only |
| GROUND | Relations | Grounded relations | Similarity ≥ 0.8 |

---

## 2026-01-18 - Phase 3 Entity Resolution Patterns

### What Worked
- Primary + fuzzy key strategy handles exact and approximate matches
- Source priority (custodian > legal > CRM > notes) resolves conflicts
- Accumulating evidence spans preserves all provenance

### What Didn't Work
- First attempt used simple string matching, missed normalized name comparisons
- Forgot to hash taxId before using as resolution key

### Prompt Refinements

**Resolution Strategy**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Match clients across sources" | No fuzzy matching | "Resolve Client entities using: primary key = taxId (hashed), fuzzy keys = (normalizedName + dateOfBirth). Priority: custodian feed > legal documents > CRM > meeting notes" | Multi-strategy resolution |
| "Merge duplicate accounts" | Lost evidence | "Merge Account entities by signature (accountNumber + custodian). For conflicts: types=union, attributes=most-recent-wins, evidence=accumulate all spans" | Evidence-preserving merge |

### Resolution Key Patterns

| Entity | Primary Key | Fuzzy Keys | Normalization |
|--------|-------------|------------|---------------|
| Client | SHA256(taxId) | lower(name) + DOB | Remove suffixes (Jr, III) |
| Account | accountNumber + custodianId | lower(name) + type | Normalize custodian names |
| Trust | SHA256(taxId) | lower(name) + establishDate | Remove "Trust" suffix |
| Investment | CUSIP or ISIN | ticker + accountId | Uppercase ticker |

---

## 2026-01-18 - Phase 0 Implementation Completion

### What Worked

1. **Turtle Syntax for OWL Ontology**
   - Using `a owl:Class` shorthand made class definitions readable
   - `owl:unionOf` pattern handled multi-domain properties (e.g., `wm:hasBeneficiary` for Account OR Trust)
   - Blank nodes for cardinality restrictions worked cleanly

2. **Class Hierarchy Design**
   - Separating Priority 0 (core) from Priority 1 (complex) classes enabled focused implementation
   - Subclass patterns (Account → IndividualAccount, JointAccount, etc.) provide clear taxonomy
   - Total of 33 classes provides comprehensive coverage without over-engineering

3. **Evidence Linking Documentation**
   - Embedding `COMPLIANCE REQUIREMENT` blocks directly in property comments keeps requirements co-located
   - 9 compliance-critical relationships documented with evidence source requirements
   - Grounding threshold of 0.8 consistently applied

4. **Entity Resolution Keys**
   - Documenting primary vs fuzzy keys in class comments enables extraction-time resolution
   - Source priority (custodian > legal > CRM > notes) documented for conflict resolution

### What Didn't Work

1. **Initial Property Count**
   - First draft had only 12 datatype properties; compliance review identified missing attributes
   - Added document date/effective/expiration fields, beneficiary type/percentage after review

2. **Domain Unions**
   - OWL blank node syntax for `owl:unionOf` required careful formatting to avoid parse errors
   - Had to use explicit `a owl:Class` declarations within union lists

### Methodology Improvements

- [x] Run `grep -c` verification before marking deliverable complete
- [x] Document class counts in hierarchy documentation for cross-reference
- [x] Include Effect model mapping examples in property inventory

### Deliverables Created

| File | Location | Status |
|------|----------|--------|
| Ontology (Turtle) | `outputs/wealth-management.ttl` | Complete |
| Class Hierarchy | `outputs/ontology-class-hierarchy.md` | Complete |
| Property Inventory | `outputs/property-inventory.md` | Complete |

### Verification Results

| Metric | Required | Actual | Status |
|--------|----------|--------|--------|
| Classes | ≥8 | 33 | Pass |
| Object Properties | ≥9 | 17 | Pass |
| Datatype Properties | ≥6 | 26 | Pass |
| Cardinality Constraints | 3 | 3 | Pass |
| Evidence Requirements | 6 | 9 | Pass |
| Entity Resolution Keys | 4 | 5 | Pass |

### Codebase-Specific Insights

1. **Entity.types array** maps directly to ontology class IRIs:
   ```typescript
   types: ["https://beep.dev/ontology/wealth-management#Client"]
   ```

2. **Relation.predicate field** stores property IRIs:
   ```typescript
   predicate: "https://beep.dev/ontology/wealth-management#ownsAccount"
   ```

3. **EvidenceSpan value object** aligns with `rdfs:comment` evidence requirements in ontology

### Domain-Specific Insights

1. **UHNWI complexity** - High-net-worth clients typically have 5+ account types, 2+ trusts, and multiple legal entities
2. **Beneficiary cascades** - Death benefit designations often involve per-stirpes distribution across generations
3. **Trust types matter** - Revocable vs irrevocable trusts have fundamentally different legal implications
4. **Custodian diversity** - Single client may use Schwab, Fidelity, and private bank simultaneously

---

## 2026-01-18 - Phase 1 Implementation Completion

### What Worked

1. **Entity ID Factory Pattern**
   - Using `makeEntityId("wm_client")` from `packages/shared/domain/src/entity-ids/factory.ts` provided consistent ID generation
   - Generated prefix pattern `wm_client__<uuid>` aligns with existing IAM and knowledge packages
   - Barrel exports through `index.ts` enabled clean `@beep/shared-domain` imports

2. **M.Class Model Pattern**
   - Using `M.Class<>()` from `@effect/sql/Model` provided proper schema variants (insert, select, update, json)
   - `makeFields` helper added standard fields: `_rowId`, `version`, `source`, `createdAt`, `updatedAt`, `organizationId`
   - `classIri` field with `S.propertySignature().withDefault()` enabled ontology integration

3. **Ontology Constants Separation**
   - Separating namespace, class IRIs, and property IRIs into distinct files enabled granular imports
   - Using full IRI strings (e.g., `https://beep.dev/ontology/wealth-management#Client`) matched knowledge graph patterns

4. **BS Helper Selection**
   - `BS.FieldSensitiveOptionOmittable(S.String)` for PII (taxId, etc.) provided log suppression
   - `BS.FieldOptionOmittable(S.String)` for non-sensitive optional fields
   - `S.Literal()` for enum constraints (riskTolerance, accountType, trustType, etc.)

### What Didn't Work

1. **Initial Test Approach**
   - First attempt used `S.decode(Entities.Client.Model)(data)` which expects the full select schema
   - This failed with `_rowId is missing` because select schema includes generated fields
   - Fix: Use `Model.insert.make({...})` pattern which only requires insert-time fields

2. **Sensitive Field Format in Tests**
   - Attempted to pass raw strings for sensitive fields: `taxId: "123-45-6789"`
   - Failed because `BS.FieldSensitiveOptionOmittable` wraps fields in `Option<Redacted<T>>`
   - Fix: Either omit sensitive fields (default to `O.none()`) or use `O.some(Redacted.make("value"))`

3. **Optional Field Wrapping**
   - Initially passed raw values for optional fields: `normalizedName: "john smith"`
   - Failed because `BS.FieldOptionOmittable` expects `Option<T>` in insert.make
   - Fix: Wrap optional values with `O.some()`: `normalizedName: O.some("john smith")`

4. **Turborepo Cascading Errors**
   - Running `bun run check --filter @beep/wm-domain` also checks all dependencies
   - Pre-existing error in `@beep/schema` blocked verification
   - Workaround: Run `bun test packages/wealth-management/domain/test/` directly for isolation

### Methodology Improvements

- [x] Use `Model.insert.make({...})` pattern in all schema tests
- [x] Read existing test files (e.g., `packages/knowledge/domain/test/`) before writing new tests
- [x] Verify schema variants (insert, select, update, json) in M.Class usage
- [x] Wrap optional fields with `O.some()` / `O.none()` in insert.make calls
- [ ] Consider adding test utilities for common entity creation patterns

### Prompt Refinements

**Schema Testing**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Test Client schema encode/decode" | Used `S.decode(Model)(data)` | "Test Client using `Model.insert.make({...})` pattern per `packages/knowledge/domain/test/entities/Entity.test.ts`" | Tests pass |
| "Create client with taxId" | Passed raw string | "For sensitive optional fields, either omit (defaults to O.none()) or use `O.some(Redacted.make(value))`" | Correct typing |

**Entity ID Creation**

| Original Prompt | Problem | Refined Prompt | Outcome |
|-----------------|---------|----------------|---------|
| "Create branded ID" | Used S.Brand instead of factory | "Use `makeEntityId('prefix')` from `packages/shared/domain/src/entity-ids/factory.ts`" | Consistent pattern |

### Test Pattern Discoveries

1. **Insert.make pattern** at `packages/knowledge/domain/test/entities/Entity.test.ts`:
   ```typescript
   const entity = Entities.Entity.Model.insert.make({
     id: testEntityId,
     organizationId: testOrgId,
     // ... only insert-time fields, no _rowId/version
     createdAt: now,
     updatedAt: now,
   });
   ```

2. **Optional field pattern**:
   ```typescript
   // Non-sensitive optional
   normalizedName: O.some("john smith"),

   // Sensitive optional (usually omit, defaults to O.none())
   taxIdHash: O.some("hashed_value"),
   ```

3. **DateTime handling**:
   ```typescript
   const now = yield* DateTime.now;
   // Use for createdAt/updatedAt in test data
   ```

### Deliverables Created

| File | Location | Status |
|------|----------|--------|
| Entity IDs | `packages/shared/domain/src/entity-ids/wealth-management/` | Complete |
| Entity Schemas | `packages/wealth-management/domain/src/entities/` | Complete |
| Ontology Constants | `packages/wealth-management/domain/src/ontology/` | Complete |
| Schema Tests | `packages/wealth-management/domain/test/entities/` | Complete |

### Verification Results

| Metric | Required | Actual | Status |
|--------|----------|--------|--------|
| Entity ID Types | 8 | 8 | Pass |
| Effect Schema Models | 8 | 8 | Pass |
| Class IRI Constants | ≥8 | 26 | Pass |
| Property IRI Constants | ≥9 | 47 | Pass |
| Passing Tests | ≥16 | 34 | Pass |

### Codebase-Specific Insights

1. **M.Class schema variants**:
   - `Model.insert` - Fields needed for creating new records
   - `Model.select` - Fields returned from database queries (includes _rowId, version)
   - `Model.update` - Fields allowed in update operations
   - `Model.json` / `Model.jsonCreate` / `Model.jsonUpdate` - JSON serialization variants

2. **makeFields helper** at `packages/shared/domain/src/common.ts`:
   - Adds standard audit fields to all models
   - `_rowId` uses `M.Generated` - auto-generated, not required in insert
   - `source` uses `BS.FieldOptionOmittable` - optional tracking field

3. **Test isolation**:
   - Direct test execution: `bun test packages/path/test/` bypasses turborepo
   - Useful when upstream packages have pre-existing errors

### Domain-Specific Insights

1. **Wealth management enums** require careful casing:
   - Risk tolerance: `"Conservative" | "Moderate" | "Aggressive"`
   - Account type: `"Individual" | "Joint" | "Trust" | "Entity" | "Retirement"`
   - Trust type: `"Revocable" | "Irrevocable" | "Charitable"`
   - KYC status: `"Pending" | "Verified" | "Expired"`

2. **Sensitive fields** identified (per compliance requirements):
   - Client: taxId, dateOfBirth, netWorth
   - Trust: taxId
   - LegalEntity: taxId
   - All use `BS.FieldSensitiveOptionOmittable` pattern

3. **Entity relationships** captured via branded ID references:
   - Account.custodianId → WmCustodianId
   - Beneficiary.linkedClientId → WmClientId (optional)
   - All entities have organizationId → SharedEntityIds.OrganizationId

---

## Maintenance Protocol

Review quarterly:
- [ ] File references still valid (check line numbers)
- [ ] Pattern examples up-to-date with current `.claude/rules/`
- [ ] BS helper references match latest `@beep/schema` API
- [ ] Integration agent list reflects current `.claude/agents/`
- [ ] Ontology classes align with regulatory requirements

---

## Template for Future Phases

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

### Codebase-Specific Insights
- [Pattern discoveries]

### Domain-Specific Insights
- [Wealth management learnings]
```
