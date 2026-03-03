# Action Items from MEDIUM Severity Modeling Audit

**Date**: 2025-12-18
**Source**: [2025-12-18-medium-severity-modeling-audit.md](./2025-12-18-medium-severity-modeling-audit.md)

---

## Critical Path (P0) - MVP Blockers

These issues **MUST** be resolved before MVP deployment. Timeline queries cannot function without bitemporal timestamps.

### Issue #1: Add Bitemporal Timestamps to Ontology and TypeScript

**Effort**: 3-5 days
**Priority**: P0 (MVP Blocker)
**Blocks**: Timeline queries, "what did we know when?" functionality

**Tasks**:

1. **Update `ontologies/claims/claims.ttl`** (1-2 hours)
   - Add `claims:publishedAt` property (when source published)
   - Add `claims:ingestedAt` property (when doc ingested into system)
   - Add `claims:assertedAt` property (when claim added to KB)
   - Add `claims:derivedAt` property (when claim inferred)
   - Keep existing `claims:extractedAt` for backward compatibility

2. **Create TypeScript Claim schemas** (1-2 days)
   - Create `/packages/@core-v2/src/Domain/Model/Claim.ts`
   - Define `Claim` class with bitemporal properties
   - Define `DerivedAssertion` class extending Claim
   - Add proper Schema.DateTimeUtc types
   - Include evidence, rank, confidence fields from claims.ttl

3. **Update RdfBuilder service** (1 day)
   - Modify quad generation to populate bitemporal properties
   - Map TypeScript Claim → RDF claims:Claim
   - Map TypeScript DerivedAssertion → RDF claims:DerivedAssertion
   - Ensure timestamps serialize correctly to xsd:dateTime

4. **Integration testing** (1 day)
   - Test SPARQL query: "Which facts were derived today?" (uses `claims:derivedAt`)
   - Test timeline sorting by `publishedAt` vs `ingestedAt` vs `eventTime`
   - Verify bitemporal filters work in competency questions
   - SHACL validation passes for all timestamp properties

**Files Changed**:
- `ontologies/claims/claims.ttl` (add 4 properties)
- `packages/@core-v2/src/Domain/Model/Claim.ts` (NEW FILE)
- `packages/@core-v2/src/Service/RdfBuilder.ts` (update quad generation)
- `packages/@core-v2/test/Domain/Model/Claim.test.ts` (NEW FILE)
- `packages/@core-v2/test/Integration/BiTemporalQueries.test.ts` (NEW FILE)

**Acceptance Criteria**:
- [ ] CQ-E1 SPARQL query executes: "Which inferred facts were produced today?"
- [ ] Timeline can sort by 4 different time dimensions (eventTime, publishedAt, ingestedAt, assertedAt/derivedAt)
- [ ] TypeScript Claim schema validates with all bitemporal properties
- [ ] RDF triples include all timestamp predicates

**Reference**: Full analysis in audit doc, sections "Issue 1" and "Appendix B: Schema Alignment Matrix"

---

### Issue #2: Fix Event Time Modeling (OWL-Time → PROV-O)

**Effort**: 2-3 days
**Priority**: P0 (MVP Blocker)
**Blocks**: PROV-O interoperability, consistent temporal modeling

**Tasks**:

1. **Update `ontologies/seattle/seattle.ttl`** (2-3 hours)
   - Replace `time:inXSDDateTime` with `prov:startedAtTime`/`prov:endedAtTime`
   - Update all StaffAnnouncementEvent instances
   - Update all PolicyInitiativeEvent instances
   - Update all BudgetActionEvent instances
   - Update all CouncilVoteEvent instances
   - Keep `time:Instant` usage in `org:memberDuring` intervals (correct pattern)

2. **Update `ontologies/seattle/shapes.ttl`** (1 hour)
   - Modify StaffAnnouncementEventShape to validate `prov:startedAtTime`
   - Remove `time:inXSDDateTime` constraint
   - Add optional `prov:endedAtTime` constraint

3. **Update documentation** (1 hour)
   - Fix `ontologies/seattle/README.md` examples (line 101-104)
   - Update ONTOLOGY_DESIGN.md if needed
   - Add comment explaining PROV-O vs OWL-Time usage

4. **Update RdfBuilder (if needed)** (1 day)
   - Check if code generates `time:inXSDDateTime` triples
   - Replace with `prov:startedAtTime`/`prov:endedAtTime` generation
   - Test with sample events

5. **Integration testing** (1 day)
   - Verify all Activity types use PROV-O properties consistently
   - Test SPARQL queries referencing event times
   - SHACL validation passes
   - No references to `time:inXSDDateTime` on Activities remain

**Files Changed**:
- `ontologies/seattle/seattle.ttl` (lines 101-104, all event instances)
- `ontologies/seattle/shapes.ttl` (lines 169-175)
- `ontologies/seattle/README.md` (lines 101-104)
- `packages/@core-v2/src/Service/RdfBuilder.ts` (if generating time triples)

**Acceptance Criteria**:
- [ ] All `prov:Activity` subclasses use `prov:startedAtTime`/`prov:endedAtTime`
- [ ] `time:Instant` only used in `org:memberDuring` intervals (correct OWL-Time pattern)
- [ ] PROV-O tools can parse temporal data correctly
- [ ] No SHACL validation errors for event times

**Reference**: Full analysis in audit doc, section "Issue 2: Event Time Modeling"

---

## Quality Improvements (P1-P2) - Post-MVP

These improve maintainability and data quality but don't block MVP launch.

### Issue #3: Separate TBox and ABox (P1)

**Effort**: 1-2 days
**Priority**: P1 (Portability improvement)
**Benefit**: Reusable ontology, cleaner testing

**Tasks**:
1. Create `ontologies/seattle/seed-data/` directory
2. Extract lines 276-368 from seattle.ttl → `seed-data/organizations.ttl`
3. Extract lines 320-368 from seattle.ttl → `seed-data/posts.ttl`
4. Update test suite to load multiple ontology files
5. Verify all SPARQL competency questions still work

**Files Changed**:
- `ontologies/seattle/seattle.ttl` (remove ABox data)
- `ontologies/seattle/seed-data/organizations.ttl` (NEW FILE)
- `ontologies/seattle/seed-data/posts.ttl` (NEW FILE)
- `packages/@core-v2/test/Integration/OntologyService.test.ts`

**Acceptance Criteria**:
- [ ] seattle.ttl contains only TBox (classes, properties)
- [ ] Seed data in separate files
- [ ] All tests pass with new file structure

---

### Issue #4: Add Range to seattle:announces (P2)

**Effort**: 1 hour
**Priority**: P2 (Data quality)
**Benefit**: Type validation for policy initiatives

**Tasks**:
1. Add `rdfs:range skos:Concept` to `seattle:announces` property (seattle.ttl:122)
2. Optionally add PolicyInitiativeEventShape to shapes.ttl
3. Test SHACL validation

**Files Changed**:
- `ontologies/seattle/seattle.ttl` (line 122)
- `ontologies/seattle/shapes.ttl` (optional shape)

**Acceptance Criteria**:
- [ ] `seattle:announces` has explicit range declaration
- [ ] SHACL validates that announced objects are skos:Concept

---

### Issue #5: Complete SHACL Coverage (P2)

**Effort**: 1 day
**Priority**: P2 (Data quality)
**Benefit**: Comprehensive validation for all event types

**Tasks**:
1. Add PolicyInitiativeEventShape
2. Add BudgetActionEventShape
3. Add CouncilVoteEventShape
4. Add RuleUpdateEventShape
5. Add BoardOrCommissionShape
6. Add LeadershipPostShape
7. Test validation with positive and negative examples

**Files Changed**:
- `ontologies/seattle/shapes.ttl` (append new shapes)

**Acceptance Criteria**:
- [ ] All domain classes have SHACL shapes
- [ ] Validation errors provide helpful messages
- [ ] Test suite validates positive and negative cases

---

## Implementation Order

**Week 1** (P0 work):
1. Day 1-3: Bitemporal timestamps (ontology + TypeScript + RdfBuilder)
2. Day 4-5: Event time modeling (PROV-O alignment)
3. Day 5: Integration testing + verification

**Week 2** (P1-P2 work, if time permits):
4. Day 6-7: TBox/ABox separation
5. Day 8: seattle:announces range + SHACL coverage

**Total Effort**: 5-8 days for P0, 2-3 additional days for P1-P2

---

## Dependencies

**Bitemporal Timestamps** depends on:
- Understanding of MVP timeline UX requirements (see mvp_discussion_research_case_study.md)
- RdfBuilder service architecture
- Current Entity/Relation schema patterns

**Event Time Modeling** depends on:
- PROV-O spec compliance (https://www.w3.org/TR/prov-o/)
- OWL-Time spec understanding (https://www.w3.org/TR/owl-time/)
- Existing ReasoningActivity pattern (already uses PROV-O correctly)

**No circular dependencies** - all issues can be worked in parallel if needed.

---

## Testing Checklist

After implementing P0 fixes, verify:

**Ontology Validation**:
- [ ] `riot --validate ontologies/claims/claims.ttl` passes
- [ ] `riot --validate ontologies/seattle/seattle.ttl` passes
- [ ] `shacl validate --shapes shapes.ttl --data seattle.ttl` passes

**SPARQL Competency Questions**:
- [ ] CQ-E1: "Which inferred facts were produced today?" returns results
- [ ] Timeline sort by `publishedAt` works
- [ ] Timeline sort by `ingestedAt` works
- [ ] Timeline sort by `eventTime` works
- [ ] Timeline sort by `assertedAt`/`derivedAt` works
- [ ] All 4 sorts produce **different orderings** (validates bitemporal modeling)

**TypeScript Schema Tests**:
- [ ] Claim schema validates with all timestamps
- [ ] DerivedAssertion schema extends Claim correctly
- [ ] RdfBuilder generates correct PROV-O triples
- [ ] Integration tests pass for timeline queries

**PROV-O Compliance**:
- [ ] All Activity instances use `prov:startedAtTime`
- [ ] No `time:inXSDDateTime` on Activities
- [ ] `time:Instant` only used in intervals (correct pattern)

---

## Success Metrics

**MVP Launch Readiness**:
- ✅ All P0 issues resolved
- ✅ Timeline queries functional
- ✅ Bitemporal sorting works
- ✅ PROV-O interoperability validated

**Post-MVP Quality**:
- ✅ Ontology portable (TBox/ABox separated)
- ✅ Comprehensive SHACL validation
- ✅ All event types validated

---

## References

- **Full Audit**: [2025-12-18-medium-severity-modeling-audit.md](./2025-12-18-medium-severity-modeling-audit.md)
- **MVP Requirements**: [packages/@core-v2/docs/mvp/mvp_discussion_research_case_study.md](../mvp/mvp_discussion_research_case_study.md)
- **Ontology Design**: [ontologies/seattle/ONTOLOGY_DESIGN.md](../../../ontologies/seattle/ONTOLOGY_DESIGN.md)
- **PROV-O Spec**: https://www.w3.org/TR/prov-o/
- **OWL-Time Spec**: https://www.w3.org/TR/owl-time/
