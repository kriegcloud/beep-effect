# MEDIUM Severity Modeling Issues Audit

**Date**: 2025-12-18
**Scope**: Ontology and TypeScript schema alignment for MVP timeline queries
**Status**: Audit Complete - Actionable Recommendations Provided

---

## Executive Summary

This audit reviews MEDIUM and LOW severity modeling issues identified in the code review. Analysis confirms **3 MEDIUM issues are MVP-blocking** for timeline queries ("what did we know when?"), and **2 LOW issues reduce data quality** but don't block MVP.

### Impact Assessment

| Issue | Severity | MVP Blocking? | Effort | Priority |
|-------|----------|---------------|--------|----------|
| Bitemporal Timestamps Missing | MEDIUM | **YES** | 3-5 days | P0 |
| Event Time Modeling (OWL-Time) | MEDIUM | **YES** | 2-3 days | P0 |
| TBox/ABox Mixing | MEDIUM | No (portability) | 1-2 days | P1 |
| seattle:announces range missing | LOW | No | 1 hour | P2 |
| Partial SHACL coverage | LOW | No | 1 day | P2 |

**Recommended Action**: Address P0 issues immediately (bitemporal timestamps + OWL-Time alignment) before MVP deployment.

---

## Issue 1: Bitemporal Timestamps Missing (MEDIUM → P0)

### Current State

**Ontology (`claims.ttl`):**
- ✅ `claims:eventTime` (when event occurred)
- ✅ `claims:extractedAt` (system timestamp)
- ❌ Missing: `publishedAt`, `ingestedAt`, `assertedAt`, `derivedAt`

**TypeScript (`DocumentMetadata.ts`):**
- ✅ `eventTime: Schema.optional(Schema.DateTimeUtc)` (line 270)
- ✅ `publishedAt: Schema.optional(Schema.DateTimeUtc)` (line 276)
- ✅ `ingestedAt: Schema.DateTimeUtc` (line 282)
- ❌ Missing in Entity model: `extractedAt` exists but no `assertedAt`/`derivedAt`

**TypeScript (`Entity.ts`):**
- ✅ `extractedAt: Schema.optional(Schema.DateTimeUtc)` (line 197)
- ✅ `eventTime: Schema.optional(Schema.DateTimeUtc)` (line 208)
- ❌ Missing: `assertedAt`, `derivedAt` for claims/assertions

### MVP Impact Analysis

**Competency Questions from mvp_discussion_research_case_study.md:**

❌ **BLOCKED** - Lines 61-68: "Each document card has timestamps: publishedAt, ingestedAt"
```markdown
Each fact/triple has timestamps:
• assertedAt (when the system added it)
• derivedAt (when inferred)
• optionally eventTime (when the underlying real-world event occurred)
```

❌ **BLOCKED** - Lines 196-214: "Bitemporal timeline sorting"
```markdown
Every Event or Claim should carry:
• eventTime (if extractable)
• publishedAt (doc)
• ingestedAt (system)
• assertedAt / derivedAt (KB commit time)
```

❌ **BLOCKED** - CQ-E1 in ONTOLOGY_DESIGN.md:318-335: "Which inferred facts were produced today?"
```sparql
SELECT ?assertion ?derivedAt WHERE {
  ?assertion prov:generatedAtTime ?derivedAt .
  FILTER (?derivedAt >= "2025-12-18T00:00:00Z"^^xsd:dateTime)
}
```

**Query Impact:**
- Cannot answer "what did we know when?" queries
- Cannot sort timeline by knowledge time vs event time vs publication time
- Cannot filter "show me facts derived today"
- Cannot implement debug mode timeline view

### Proposed Fix

#### Ontology Changes (`claims.ttl`)

Add missing bitemporal properties:

```turtle
# =============================================================================
# Bitemporal Timestamps (extend existing Temporal Validity section)
# =============================================================================

claims:publishedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "published at"@en ;
    rdfs:comment "When the source document was published by the original publisher."@en ;
    rdfs:domain claims:Claim ;
    rdfs:range xsd:dateTime .

claims:ingestedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "ingested at"@en ;
    rdfs:comment "When the source document was ingested into the knowledge system."@en ;
    rdfs:domain claims:Claim ;
    rdfs:range xsd:dateTime .

claims:assertedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "asserted at"@en ;
    rdfs:comment "When this claim was added to the knowledge base (system timestamp)."@en ;
    rdfs:domain claims:Claim ;
    rdfs:range xsd:dateTime .

claims:derivedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "derived at"@en ;
    rdfs:comment "When this claim was inferred by a reasoning rule (system timestamp)."@en ;
    rdfs:domain claims:Claim ;
    rdfs:range xsd:dateTime .
```

**Note**: Keep existing `claims:extractedAt` (line 122) for backward compatibility - it's semantically equivalent to `assertedAt` for extracted claims.

#### TypeScript Schema Changes

**Option A: Add to Entity model** (`Entity.ts`):
```typescript
/**
 * When this fact was asserted into the knowledge base
 *
 * For extracted claims, this equals extractedAt.
 * For manually curated facts, this is the curation timestamp.
 */
assertedAt: Schema.optional(Schema.DateTimeUtc).annotations({
  title: "Asserted At",
  description: "System timestamp when fact was added to KB"
}),

/**
 * When this fact was derived by inference
 *
 * Only populated for inferred facts (DerivedAssertion instances).
 * Null for asserted/extracted facts.
 */
derivedAt: Schema.optional(Schema.DateTimeUtc).annotations({
  title: "Derived At",
  description: "System timestamp when fact was inferred (null for asserted facts)"
})
```

**Option B: Create separate Claim/DerivedAssertion schemas** (recommended):
```typescript
// packages/@core-v2/src/Domain/Model/Claim.ts

export class Claim extends Schema.Class<Claim>("Claim")({
  // Reified statement
  claimSubject: Schema.String,
  claimPredicate: Schema.String,
  claimObject: Schema.Union(Schema.String, Schema.Number, Schema.Boolean),

  // Rank (from claims.ttl)
  rank: Schema.Literal("Preferred", "Normal", "Deprecated"),
  confidence: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0), Schema.lessThanOrEqualTo(1)),

  // Bitemporal timestamps
  eventTime: Schema.optional(Schema.DateTimeUtc),
  publishedAt: Schema.optional(Schema.DateTimeUtc),
  ingestedAt: Schema.DateTimeUtc,
  assertedAt: Schema.DateTimeUtc,
  extractedAt: Schema.DateTimeUtc, // Alias for assertedAt when extracted

  // Provenance
  statedIn: Schema.String, // Document IRI
  evidence: Schema.optional(EvidenceSpanSchema)
})

export class DerivedAssertion extends Schema.Class<DerivedAssertion>("DerivedAssertion")({
  // Extends Claim
  ...Claim.fields,

  // Inference-specific
  derivedAt: Schema.DateTimeUtc,
  wasGeneratedBy: Schema.String, // ReasoningActivity IRI
  appliedRule: Schema.String, // InferenceRule IRI
  supportingFacts: Schema.Array(Schema.String) // Claim IRIs
})
```

### Alignment Verification

**Check SPARQL queries work:**
1. CQ-E1: "Which inferred facts were produced today?"
2. Timeline sort by `publishedAt` vs `ingestedAt` vs `eventTime`
3. Debug mode: show `assertedAt`/`derivedAt` timeline

**RdfBuilder integration:**
- Ensure `RdfBuilder.buildGraph` populates bitemporal properties from Entity/Claim models
- Add timestamp fields to N3.Store quad generation

---

## Issue 2: Event Time Modeling - OWL-Time Pattern (MEDIUM → P0)

### Current State

**Incorrect Pattern** (`shapes.ttl:169-175`, `seattle.ttl:101-104`):
```turtle
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    time:inXSDDateTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;  # WRONG
    prov:wasDerivedFrom seattle:Doc_PressRelease_20251203 .
```

**Problem**: Directly using `time:inXSDDateTime` on Activities violates OWL-Time and PROV-O semantics.

**OWL-Time Spec** (https://www.w3.org/TR/owl-time/#time:Instant):
> "Temporal positions and durations may be expressed using `time:Instant` nodes with `time:inXSDDateTime` datatype properties."

**PROV-O Spec** (https://www.w3.org/TR/prov-o/#Activity):
> "Activities should use `prov:startedAtTime` and `prov:endedAtTime` for temporal bounds."

### MVP Impact Analysis

❌ **BLOCKED** - Conflict with PROV time usage in reasoning activities:
- `ReasoningActivityShape` (shapes.ttl:314-318) uses `prov:endedAtTime` correctly
- `StaffAnnouncementEventShape` (shapes.ttl:169-175) uses `time:inXSDDateTime` incorrectly
- Inconsistent temporal modeling across activity types

❌ **BLOCKED** - Cannot interoperate with PROV-O tools expecting standard patterns

❌ **BLOCKED** - Competency queries mixing PROV and OWL-Time properties will fail

### Proposed Fix

#### Ontology Changes (`seattle.ttl`)

**Replace direct time:inXSDDateTime with OWL-Time Instant pattern:**

```turtle
# BEFORE (incorrect):
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    time:inXSDDateTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;
    prov:wasDerivedFrom seattle:Doc_PressRelease_20251203 .

# AFTER (correct):
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    prov:startedAtTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;
    prov:endedAtTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;  # Instant event
    prov:wasDerivedFrom seattle:Doc_PressRelease_20251203 .
```

**OR use time:hasTime if OWL-Time reification is required:**

```turtle
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    time:hasTime [
        a time:Instant ;
        time:inXSDDateTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime
    ] ;
    prov:wasDerivedFrom seattle:Doc_PressRelease_20251203 .
```

**Recommendation**: Use `prov:startedAtTime`/`prov:endedAtTime` for consistency with PROV-O and ReasoningActivity pattern.

#### SHACL Changes (`shapes.ttl`)

```turtle
# BEFORE (line 169-175):
sh:property [
    sh:path time:inXSDDateTime ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype xsd:dateTime ;
    sh:message "Event must have exactly one time:inXSDDateTime"
] ;

# AFTER:
sh:property [
    sh:path prov:startedAtTime ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype xsd:dateTime ;
    sh:message "Event must have exactly one prov:startedAtTime"
] ;

sh:property [
    sh:path prov:endedAtTime ;
    sh:maxCount 1 ;
    sh:datatype xsd:dateTime ;
    sh:message "Event may have at most one prov:endedAtTime (omitted for instant events)"
] ;
```

#### Documentation Updates

Update `seattle/README.md:101-104`:
```markdown
### Staff Announcement Event

Events are `prov:Activity` with temporal bounds using PROV-O properties:

```turtle
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    seattle:announcedMembership seattle:Membership_Burgess_Deputy ;
    prov:startedAtTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;
    prov:endedAtTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;  # Instant event
    prov:wasDerivedFrom seattle:Doc_PressRelease_20251203 .
```
```

### Alignment Verification

**Check PROV-O consistency:**
1. All Activity subclasses use `prov:startedAtTime`/`prov:endedAtTime`
2. OWL-Time `time:Instant` only used for `org:memberDuring` intervals (existing correct usage)
3. SPARQL queries updated to use PROV properties

**TypeScript changes needed:**
- Update any code generating `time:inXSDDateTime` triples to use `prov:startedAtTime`
- RdfBuilder service alignment

---

## Issue 3: TBox/ABox Mixing (MEDIUM → P1)

### Current State

**Problem** (`seattle.ttl:276-368`):
- Lines 276-318: ABox instance data (seattle:CityOfSeattle, seattle:MayorsOffice, etc.)
- Mixed with TBox ontology definitions in same file

**From ONTOLOGY_DESIGN.md:552:**
> "Create `ontologies/seattle/data/` with seed data for testing"

### MVP Impact Analysis

✅ **NOT BLOCKING** for MVP functionality - all queries work regardless of file organization

⚠️ **REDUCES PORTABILITY**:
- Cannot reuse seattle.ttl ontology for other cities without editing
- Test data pollutes ontology file
- Harder to version-control ontology separately from instance data

### Proposed Fix

#### File Reorganization

**Create new structure:**
```
ontologies/seattle/
├── seattle.ttl              # TBox only (ontology definitions)
├── shapes.ttl               # SHACL validation (unchanged)
├── seed-data/
│   ├── organizations.ttl    # Seattle city structure (ABox)
│   ├── posts.ttl            # Position definitions (ABox)
│   └── README.md            # Seed data documentation
└── tests/
    └── competency-questions.sparql
```

**Extract lines 276-368 from seattle.ttl to `seed-data/organizations.ttl`:**

```turtle
@prefix seattle: <http://effect-ontology.dev/seattle/> .
@prefix org: <http://www.w3.org/ns/org#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@base <http://effect-ontology.dev/seattle/seed-data/organizations> .

# =============================================================================
# Seattle City Government Structure (Seed Data for Testing)
# =============================================================================

seattle:CityOfSeattle a org:FormalOrganization ;
    skos:prefLabel "City of Seattle"@en ;
    skos:altLabel "Seattle City Government"@en ;
    org:hasUnit seattle:MayorsOffice ,
                seattle:CityCouncil ,
                seattle:CityBudgetOffice .

# ... rest of instance data ...
```

**Update seattle.ttl header:**
```turtle
<http://effect-ontology.dev/seattle> a owl:Ontology ;
    dcterms:title "Seattle Mayor Administration Ontology Pack"@en ;
    dcterms:description """Production ontology for the Seattle mayor administration.

    This file contains ONLY the TBox (ontology definitions).
    See seed-data/ directory for ABox instance data."""@en ;
    # ... rest of ontology metadata ...
```

#### Testing Updates

Update test suite to load both files:
```typescript
// packages/@core-v2/test/Integration/OntologyService.test.ts

const SEATTLE_ONTOLOGY = "file:///path/to/seattle.ttl"
const SEATTLE_SEED_DATA = "file:///path/to/seed-data/organizations.ttl"

// Load both for testing
const store = await loadMultipleOntologies([SEATTLE_ONTOLOGY, SEATTLE_SEED_DATA])
```

### Effort Estimate

- **1-2 days**: Extract data, create files, update tests, verify queries still work
- **Priority P1**: Not blocking MVP launch but improves maintainability

---

## Issue 4: seattle:announces lacks skos:Concept range (LOW → P2)

### Current State

**Problem** (`seattle.ttl:119-122`):
```turtle
seattle:announces a owl:ObjectProperty ;
    rdfs:label "announces"@en ;
    rdfs:comment "Links an initiative event to the initiative being announced."@en ;
    rdfs:domain seattle:PolicyInitiativeEvent .
    # Missing: rdfs:range skos:Concept
```

**From ONTOLOGY_DESIGN.md:426:**
> "seattle:announces | seattle:PolicyInitiativeEvent | skos:Concept | Initiative being announced"

### MVP Impact Analysis

✅ **NOT BLOCKING** - SPARQL queries work without explicit range (open-world assumption)

⚠️ **REDUCES DATA QUALITY**:
- No validation that announced object is a skos:Concept
- OWL reasoners cannot infer type
- SHACL validation won't catch type errors

### Proposed Fix

#### Ontology Change (`seattle.ttl:119-123`)

```turtle
# BEFORE:
seattle:announces a owl:ObjectProperty ;
    rdfs:label "announces"@en ;
    rdfs:comment "Links an initiative event to the initiative being announced."@en ;
    rdfs:domain seattle:PolicyInitiativeEvent .

# AFTER:
seattle:announces a owl:ObjectProperty ;
    rdfs:label "announces"@en ;
    rdfs:comment "Links an initiative event to the initiative being announced."@en ;
    rdfs:domain seattle:PolicyInitiativeEvent ;
    rdfs:range skos:Concept .
```

#### SHACL Validation (optional enhancement)

Add shape for PolicyInitiativeEvent:
```turtle
# shapes.ttl

:PolicyInitiativeEventShape a sh:NodeShape ;
    sh:targetClass seattle:PolicyInitiativeEvent ;
    rdfs:label "Policy Initiative Event Shape"@en ;

    sh:property [
        sh:path seattle:announces ;
        sh:minCount 1 ;
        sh:class skos:Concept ;
        sh:message "Policy initiative must announce at least one skos:Concept"
    ] ;

    sh:property [
        sh:path prov:startedAtTime ;
        sh:minCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:message "Event must have prov:startedAtTime"
    ] .
```

### Effort Estimate

- **1 hour**: Add range declaration, test validation
- **Priority P2**: Nice-to-have for data quality

---

## Issue 5: Partial SHACL Coverage (LOW → P2)

### Current State

**Current SHACL Shapes** (`shapes.ttl`):
- ✅ PersonShape (lines 27-37)
- ✅ MembershipShape (lines 43-84)
- ✅ IntervalShape (lines 90-107)
- ✅ InstantShape (lines 113-130)
- ✅ PostShape (lines 136-151)
- ✅ StaffAnnouncementEventShape (lines 157-181)
- ✅ ClaimShape (lines 187-225)
- ✅ EvidenceShape (lines 231-267)
- ✅ OrganizationShape (lines 273-282)
- ✅ ReasoningActivityShape (lines 288-319)

**Missing Shapes** (from ONTOLOGY_DESIGN.md:525):
- ❌ PolicyInitiativeEvent
- ❌ BudgetActionEvent
- ❌ CouncilVoteEvent
- ❌ RuleUpdateEvent
- ❌ BoardOrCommission
- ❌ LeadershipPost

### MVP Impact Analysis

✅ **NOT BLOCKING** - Core entities (Person, Membership, Claim) are validated

⚠️ **REDUCES DATA QUALITY** for non-core event types:
- No validation for budget/policy/council events
- Cannot enforce provenance requirements
- Errors discovered at query time instead of ingestion time

### Proposed Fix

#### Add Missing Shapes (`shapes.ttl`)

```turtle
# -----------------------------------------------------------------------------
# Policy Initiative Event Shape
# -----------------------------------------------------------------------------

:PolicyInitiativeEventShape a sh:NodeShape ;
    sh:targetClass seattle:PolicyInitiativeEvent ;
    rdfs:label "Policy Initiative Event Shape"@en ;

    sh:property [
        sh:path seattle:announces ;
        sh:minCount 1 ;
        sh:class skos:Concept ;
        sh:message "Policy initiative must announce at least one skos:Concept"
    ] ;

    sh:property [
        sh:path prov:startedAtTime ;
        sh:minCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:message "Event must have prov:startedAtTime"
    ] ;

    sh:property [
        sh:path prov:wasDerivedFrom ;
        sh:minCount 1 ;
        sh:message "Event must have provenance (prov:wasDerivedFrom)"
    ] .

# -----------------------------------------------------------------------------
# Budget Action Event Shape
# -----------------------------------------------------------------------------

:BudgetActionEventShape a sh:NodeShape ;
    sh:targetClass seattle:BudgetActionEvent ;
    rdfs:label "Budget Action Event Shape"@en ;

    sh:property [
        sh:path seattle:impacts ;
        sh:minCount 1 ;
        sh:class org:Organization ;
        sh:message "Budget action must impact at least one organization"
    ] ;

    sh:property [
        sh:path prov:startedAtTime ;
        sh:minCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:message "Event must have prov:startedAtTime"
    ] ;

    sh:property [
        sh:path prov:wasDerivedFrom ;
        sh:minCount 1 ;
        sh:message "Event must have provenance"
    ] .

# -----------------------------------------------------------------------------
# Council Vote Event Shape
# -----------------------------------------------------------------------------

:CouncilVoteEventShape a sh:NodeShape ;
    sh:targetClass seattle:CouncilVoteEvent ;
    rdfs:label "Council Vote Event Shape"@en ;

    sh:property [
        sh:path seattle:voteResult ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:message "Council vote must have exactly one voteResult"
    ] ;

    sh:property [
        sh:path seattle:voteTally ;
        sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:message "Council vote may have vote tally"
    ] ;

    sh:property [
        sh:path prov:startedAtTime ;
        sh:minCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:message "Event must have prov:startedAtTime"
    ] .

# -----------------------------------------------------------------------------
# Rule Update Event Shape
# -----------------------------------------------------------------------------

:RuleUpdateEventShape a sh:NodeShape ;
    sh:targetClass seattle:RuleUpdateEvent ;
    rdfs:label "Rule Update Event Shape"@en ;

    sh:property [
        sh:path seattle:updatedRule ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:class seattle:InferenceRule ;
        sh:message "Rule update must specify exactly one updatedRule"
    ] ;

    sh:property [
        sh:path prov:endedAtTime ;
        sh:minCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:message "Rule update must have endedAtTime"
    ] .

# -----------------------------------------------------------------------------
# Board or Commission Shape
# -----------------------------------------------------------------------------

:BoardOrCommissionShape a sh:NodeShape ;
    sh:targetClass seattle:BoardOrCommission ;
    rdfs:label "Board or Commission Shape"@en ;

    sh:property [
        sh:path skos:prefLabel ;
        sh:minCount 1 ;
        sh:message "Board/Commission must have at least one skos:prefLabel"
    ] .

# -----------------------------------------------------------------------------
# Leadership Post Shape
# -----------------------------------------------------------------------------

:LeadershipPostShape a sh:NodeShape ;
    sh:targetClass seattle:LeadershipPost ;
    rdfs:label "Leadership Post Shape"@en ;

    sh:property [
        sh:path skos:prefLabel ;
        sh:minCount 1 ;
        sh:message "Leadership post must have at least one skos:prefLabel"
    ] ;

    sh:property [
        sh:path org:postIn ;
        sh:minCount 1 ;
        sh:message "Leadership post must specify org:postIn"
    ] ;

    sh:property [
        sh:path org:role ;
        sh:minCount 1 ;
        sh:message "Leadership post must specify org:role"
    ] .
```

### Effort Estimate

- **1 day**: Add shapes, test validation, verify error messages
- **Priority P2**: Nice-to-have for comprehensive validation

---

## Implementation Roadmap

### Phase 1: MVP Blockers (P0) - 5-8 days

**Week 1 Focus**: Fix bitemporal timestamps + OWL-Time alignment

1. **Bitemporal Timestamps** (3-5 days)
   - [ ] Add properties to `claims.ttl`: `publishedAt`, `ingestedAt`, `assertedAt`, `derivedAt`
   - [ ] Create Claim/DerivedAssertion TypeScript schemas in `Domain/Model/Claim.ts`
   - [ ] Update RdfBuilder to populate bitemporal properties
   - [ ] Update Entity model or migrate to Claim model
   - [ ] Write integration tests for bitemporal SPARQL queries
   - [ ] Verify CQ-E1 "facts produced today" query works

2. **OWL-Time Pattern** (2-3 days)
   - [ ] Replace `time:inXSDDateTime` with `prov:startedAtTime`/`prov:endedAtTime` in seattle.ttl
   - [ ] Update StaffAnnouncementEventShape in shapes.ttl
   - [ ] Update README.md examples
   - [ ] Update RdfBuilder to generate correct PROV properties
   - [ ] Test PROV-O interoperability
   - [ ] Verify all Activity subclasses use consistent pattern

**Acceptance Criteria**:
- [ ] All MVP competency questions (CQ-E1, timeline sorting) execute successfully
- [ ] SPARQL queries can filter by `publishedAt`, `ingestedAt`, `assertedAt`, `derivedAt`
- [ ] All Activity types use PROV-O temporal properties consistently
- [ ] SHACL validation passes for all test data

### Phase 2: Quality Improvements (P1-P2) - 2-3 days

**Week 2 Focus**: Improve portability and data quality

3. **TBox/ABox Separation** (1-2 days) - P1
   - [ ] Create `seed-data/` directory structure
   - [ ] Extract instance data from seattle.ttl
   - [ ] Update test suite to load multiple files
   - [ ] Verify all competency questions still work
   - [ ] Document seed data in README

4. **seattle:announces range** (1 hour) - P2
   - [ ] Add `rdfs:range skos:Concept` to seattle:announces
   - [ ] Add PolicyInitiativeEventShape
   - [ ] Test validation

5. **Complete SHACL Coverage** (1 day) - P2
   - [ ] Add missing event shapes (PolicyInitiative, BudgetAction, CouncilVote, RuleUpdate)
   - [ ] Add missing class shapes (BoardOrCommission, LeadershipPost)
   - [ ] Test validation with positive and negative cases
   - [ ] Document validation coverage in shapes.ttl

**Acceptance Criteria**:
- [ ] seattle.ttl contains only TBox definitions
- [ ] Seed data organized in separate files
- [ ] All domain classes have SHACL validation
- [ ] Validation errors provide helpful messages

---

## Testing Strategy

### Unit Tests

**Ontology Validation**:
```bash
# Validate ontology syntax
riot --validate ontologies/seattle/seattle.ttl

# SHACL validation
shacl validate --shapes ontologies/seattle/shapes.ttl \
               --data ontologies/seattle/seed-data/organizations.ttl
```

**TypeScript Schema Tests**:
```typescript
// packages/@core-v2/test/Domain/Model/Claim.test.ts

it.effect("Claim has bitemporal timestamps", () =>
  Effect.gen(function* () {
    const claim = new Claim({
      claimSubject: "seattle:TimBurgess",
      claimPredicate: "org:holds",
      claimObject: "seattle:DeputyMayorPost",
      rank: "Preferred",
      confidence: 0.95,
      eventTime: new Date("2025-01-01"),
      publishedAt: new Date("2025-12-03"),
      ingestedAt: new Date("2025-12-04"),
      assertedAt: new Date("2025-12-04T10:00:00Z"),
      statedIn: "seattle:Doc_PressRelease"
    })

    expect(claim.eventTime).toBeDefined()
    expect(claim.publishedAt).toBeDefined()
    expect(claim.ingestedAt).toBeDefined()
    expect(claim.assertedAt).toBeDefined()
  })
)
```

### Integration Tests

**SPARQL Competency Questions**:
```typescript
// Test bitemporal queries
it("CQ-E1: Facts produced today", async () => {
  const results = await executeSparql(`
    SELECT ?assertion ?derivedAt WHERE {
      ?assertion a claims:DerivedAssertion ;
                 claims:derivedAt ?derivedAt .
      FILTER (?derivedAt >= "2025-12-18T00:00:00Z"^^xsd:dateTime)
    }
  `)
  expect(results.length).toBeGreaterThan(0)
})

// Test timeline sorting
it("Timeline sort by publishedAt vs ingestedAt", async () => {
  const byPublished = await executeSparql("... ORDER BY ?publishedAt")
  const byIngested = await executeSparql("... ORDER BY ?ingestedAt")
  expect(byPublished[0]).not.toEqual(byIngested[0]) // Different orderings
})
```

---

## Files Requiring Changes

### Ontology Files

| File | Changes | Lines Affected |
|------|---------|----------------|
| `ontologies/claims/claims.ttl` | Add bitemporal properties | After line 110 |
| `ontologies/seattle/seattle.ttl` | Fix event time modeling, extract ABox | Lines 101-104, 276-368 |
| `ontologies/seattle/seattle.ttl` | Add range to seattle:announces | Line 119-122 |
| `ontologies/seattle/shapes.ttl` | Update StaffAnnouncementEventShape | Lines 169-175 |
| `ontologies/seattle/shapes.ttl` | Add missing shapes | Append |
| `ontologies/seattle/README.md` | Update examples | Line 101-104 |
| `ontologies/seattle/seed-data/organizations.ttl` | **NEW FILE** - ABox data | N/A |

### TypeScript Files

| File | Changes | Reason |
|------|---------|--------|
| `packages/@core-v2/src/Domain/Model/Claim.ts` | **NEW FILE** - Claim/DerivedAssertion schemas | Bitemporal modeling |
| `packages/@core-v2/src/Domain/Model/Entity.ts` | Add assertedAt/derivedAt OR migrate to Claim | Bitemporal timestamps |
| `packages/@core-v2/src/Domain/Schema/DocumentMetadata.ts` | No changes (already has bitemporal) | ✅ Already correct |
| `packages/@core-v2/src/Service/RdfBuilder.ts` | Update quad generation for PROV properties | Event time modeling |
| `packages/@core-v2/test/Domain/Model/Claim.test.ts` | **NEW FILE** - Test bitemporal schemas | Testing |
| `packages/@core-v2/test/Integration/OntologyService.test.ts` | Update to load multiple ontology files | TBox/ABox separation |

---

## Risk Assessment

### P0 Issues (MVP Blocking)

**Risk**: Delay MVP deployment if not addressed

**Mitigation**:
- Bitemporal timestamps: Well-scoped change, clear acceptance criteria
- OWL-Time alignment: Find-replace pattern, low risk
- Both changes have clear TypeScript/RDF mappings

**Estimated Risk Level**: **LOW** (straightforward fixes, 5-8 day timeline)

### P1-P2 Issues (Quality)

**Risk**: Technical debt if deferred

**Mitigation**:
- TBox/ABox separation improves but doesn't block
- SHACL coverage catches errors earlier but queries work without it
- Can be addressed post-MVP launch

**Estimated Risk Level**: **VERY LOW** (nice-to-have improvements)

---

## Recommendations

### Immediate Actions (This Week)

1. **Create beads issues** for P0 work (bitemporal + OWL-Time)
2. **Assign to current sprint** - must complete before MVP deployment
3. **Allocate 5-8 days** for P0 fixes + testing

### Post-MVP Actions (Next Sprint)

4. **File P1-P2 issues** for quality improvements
5. **Schedule TBox/ABox separation** for next maintenance window
6. **Complete SHACL coverage** incrementally

### Success Metrics

**MVP Timeline Queries Working**:
- [ ] "What did we know when?" queries execute
- [ ] Timeline sorts by publishedAt/ingestedAt/eventTime/assertedAt
- [ ] "Show facts derived today" filter works
- [ ] PROV-O interoperability with standard tools

**Data Quality Improved**:
- [ ] All event types have SHACL validation
- [ ] seattle.ttl reusable for other cities
- [ ] Validation errors caught at ingestion time

---

## Appendix A: Competency Query Examples

### CQ-E1: Facts Produced Today (REQUIRES: derivedAt)

```sparql
PREFIX claims: <http://effect-ontology.dev/claims#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?assertion ?subject ?predicate ?object ?derivedAt WHERE {
  ?assertion a claims:DerivedAssertion ;
             claims:claimSubject ?subject ;
             claims:claimPredicate ?predicate ;
             claims:claimObject ?object ;
             claims:derivedAt ?derivedAt .

  FILTER (?derivedAt >= "2025-12-18T00:00:00Z"^^xsd:dateTime)
  FILTER (?derivedAt < "2025-12-19T00:00:00Z"^^xsd:dateTime)
}
ORDER BY DESC(?derivedAt)
```

### Timeline Sort Comparison (REQUIRES: publishedAt, ingestedAt, eventTime)

```sparql
# Sort by when event happened (real-world time)
SELECT ?event ?eventTime WHERE {
  ?event a seattle:StaffAnnouncementEvent ;
         claims:eventTime ?eventTime .
}
ORDER BY ?eventTime

# Sort by when document was published
SELECT ?event ?publishedAt WHERE {
  ?event a seattle:StaffAnnouncementEvent ;
         claims:publishedAt ?publishedAt .
}
ORDER BY ?publishedAt

# Sort by when system learned about it
SELECT ?event ?ingestedAt WHERE {
  ?event a seattle:StaffAnnouncementEvent ;
         claims:ingestedAt ?ingestedAt .
}
ORDER BY ?ingestedAt

# Sort by when system added it to KB
SELECT ?event ?assertedAt WHERE {
  ?event a seattle:StaffAnnouncementEvent ;
         claims:assertedAt ?assertedAt .
}
ORDER BY ?assertedAt
```

---

## Appendix B: Schema Alignment Matrix

| Timestamp | claims.ttl | DocumentMetadata.ts | Entity.ts | Claim.ts (proposed) | Usage |
|-----------|------------|---------------------|-----------|---------------------|-------|
| eventTime | ✅ line 106 | ✅ line 270 | ✅ line 208 | ✅ | When event occurred |
| publishedAt | ❌ MISSING | ✅ line 276 | ❌ | ✅ | When doc published |
| ingestedAt | ❌ MISSING | ✅ line 282 | ❌ | ✅ | When doc ingested |
| extractedAt | ✅ line 122 | ❌ | ✅ line 197 | ✅ (alias) | When fact extracted |
| assertedAt | ❌ MISSING | ❌ | ❌ | ✅ | When fact added to KB |
| derivedAt | ❌ MISSING | ❌ | ❌ | ✅ | When fact inferred |

**Alignment Issues**:
- ❌ `claims.ttl` missing 4/6 timestamps for MVP queries
- ❌ `Entity.ts` missing provenance timestamps (only has extraction timestamps)
- ⚠️ No unified Claim schema - scattered across Entity and DocumentMetadata

**Recommendation**: Create unified `Claim.ts` schema with all bitemporal properties.

---

**END OF AUDIT**
