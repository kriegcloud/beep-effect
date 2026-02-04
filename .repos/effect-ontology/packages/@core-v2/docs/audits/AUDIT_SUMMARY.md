# MEDIUM Severity Modeling Audit - Executive Summary

**Date**: 2025-12-18
**Auditor**: Claude (Effect Ontology Code Review Follow-up)
**Status**: ✅ Complete - Action Items Ready

---

## TL;DR

**3 MEDIUM issues are MVP-blocking** for timeline queries. Fix required before deployment: **5-8 days effort**.

**Quick Fix Summary**:
1. Add 4 missing timestamp properties to `claims.ttl` (publishedAt, ingestedAt, assertedAt, derivedAt)
2. Replace `time:inXSDDateTime` with `prov:startedAtTime` on Activities
3. Create TypeScript Claim schema with bitemporal properties

---

## Issues at a Glance

| # | Issue | Severity | MVP Blocker | Effort | Files Affected |
|---|-------|----------|-------------|--------|----------------|
| 1 | **Bitemporal timestamps missing** | MEDIUM | **YES** | 3-5 days | claims.ttl, Claim.ts (NEW), RdfBuilder.ts |
| 2 | **Event time uses wrong OWL pattern** | MEDIUM | **YES** | 2-3 days | seattle.ttl, shapes.ttl, README.md |
| 3 | TBox/ABox mixing | MEDIUM | No | 1-2 days | seattle.ttl → seed-data/ (NEW) |
| 4 | seattle:announces lacks range | LOW | No | 1 hour | seattle.ttl (1 line) |
| 5 | Partial SHACL coverage | LOW | No | 1 day | shapes.ttl (append) |

---

## Impact Analysis

### What Works Without Fixes
✅ Basic entity extraction
✅ Simple SPARQL queries
✅ RDF graph construction
✅ Current test suite

### What's Broken (MVP Blocking)
❌ **Timeline queries** - Cannot answer "what did we know when?"
❌ **Bitemporal sorting** - Cannot sort by publishedAt vs ingestedAt vs eventTime vs assertedAt
❌ **Inference tracking** - Cannot query "show facts derived today"
❌ **PROV-O interoperability** - Events use non-standard time modeling

### Example Broken Query (from MVP spec)

**User Request**: "Show me all facts we learned today"

**Required SPARQL** (currently fails):
```sparql
SELECT ?fact ?derivedAt WHERE {
  ?fact claims:derivedAt ?derivedAt .
  FILTER (?derivedAt >= "2025-12-18T00:00:00Z"^^xsd:dateTime)
}
```

**Why it fails**: `claims:derivedAt` property doesn't exist in ontology.

**Impact**: MVP timeline UX cannot function without this query working.

---

## Root Cause Analysis

### Issue 1: Schema Alignment Mismatch

**DocumentMetadata.ts has bitemporal properties:**
```typescript
eventTime: Schema.optional(Schema.DateTimeUtc),       // ✅
publishedAt: Schema.optional(Schema.DateTimeUtc),     // ✅
ingestedAt: Schema.DateTimeUtc,                       // ✅
```

**claims.ttl missing these properties:**
```turtle
claims:eventTime (exists)        # ✅
claims:extractedAt (exists)      # ✅
claims:publishedAt               # ❌ MISSING
claims:ingestedAt                # ❌ MISSING
claims:assertedAt                # ❌ MISSING
claims:derivedAt                 # ❌ MISSING
```

**Result**: TypeScript can track timeline data, but RDF cannot persist it.

### Issue 2: OWL-Time vs PROV-O Confusion

**Incorrect Pattern** (seattle.ttl):
```turtle
seattle:Event_Announcement a seattle:StaffAnnouncementEvent ;
    time:inXSDDateTime "2025-12-03T10:00:00Z"^^xsd:dateTime .  # ❌ WRONG
```

**Correct Pattern** (per PROV-O spec):
```turtle
seattle:Event_Announcement a seattle:StaffAnnouncementEvent ;
    prov:startedAtTime "2025-12-03T10:00:00Z"^^xsd:dateTime ;  # ✅ CORRECT
    prov:endedAtTime "2025-12-03T10:00:00Z"^^xsd:dateTime .    # ✅ CORRECT
```

**Why this matters**:
- `time:inXSDDateTime` is for `time:Instant` nodes, not Activities
- PROV-O tools expect `prov:startedAtTime`/`prov:endedAtTime`
- Mixing patterns breaks interoperability

---

## Recommended Action Plan

### Week 1: Critical Path (P0)

**Day 1-2: Ontology Fixes**
- [ ] Add 4 bitemporal properties to `claims.ttl`
- [ ] Replace `time:inXSDDateTime` with `prov:startedAtTime` in `seattle.ttl`
- [ ] Update SHACL shapes

**Day 3-4: TypeScript Implementation**
- [ ] Create `Claim.ts` with bitemporal schema
- [ ] Create `DerivedAssertion.ts` extending Claim
- [ ] Update RdfBuilder to generate correct triples

**Day 5: Testing & Verification**
- [ ] Run SPARQL competency questions
- [ ] Test timeline sorting (4 different time dimensions)
- [ ] Verify PROV-O compliance
- [ ] SHACL validation passes

### Week 2: Quality Improvements (P1-P2, Optional)

**Day 6-7: TBox/ABox Separation**
- [ ] Extract seed data to `ontologies/seattle/seed-data/`
- [ ] Update test suite

**Day 8: Complete SHACL Coverage**
- [ ] Add missing event shapes
- [ ] Test validation

---

## Files Requiring Changes

### Must Change (P0)

| File | Type | Change Summary |
|------|------|----------------|
| `ontologies/claims/claims.ttl` | Ontology | Add 4 properties: publishedAt, ingestedAt, assertedAt, derivedAt |
| `ontologies/seattle/seattle.ttl` | Ontology | Replace time:inXSDDateTime → prov:startedAtTime on all Activities |
| `ontologies/seattle/shapes.ttl` | Validation | Update StaffAnnouncementEventShape to validate prov:startedAtTime |
| `packages/@core-v2/src/Domain/Model/Claim.ts` | **NEW FILE** | Bitemporal Claim schema |
| `packages/@core-v2/src/Service/RdfBuilder.ts` | Service | Generate bitemporal + PROV-O triples |
| `packages/@core-v2/test/Domain/Model/Claim.test.ts` | **NEW FILE** | Unit tests |

### Should Change (P1-P2)

| File | Type | Change Summary |
|------|------|----------------|
| `ontologies/seattle/seed-data/organizations.ttl` | **NEW FILE** | ABox instance data |
| `ontologies/seattle/shapes.ttl` | Validation | Add 6 missing shapes |

---

## Testing Strategy

### Unit Tests (TypeScript)

```typescript
it.effect("Claim has all bitemporal properties", () =>
  Effect.gen(function* () {
    const claim = new Claim({
      eventTime: new Date("2025-01-01"),
      publishedAt: new Date("2025-12-03"),
      ingestedAt: new Date("2025-12-04"),
      assertedAt: new Date("2025-12-04T10:00:00Z")
    })
    expect(claim.publishedAt).toBeDefined()
    expect(claim.ingestedAt).toBeDefined()
    expect(claim.assertedAt).toBeDefined()
  })
)
```

### Integration Tests (SPARQL)

```typescript
it("Timeline sorts by 4 different time dimensions", async () => {
  const byEvent = await sparql("ORDER BY ?eventTime")
  const byPublished = await sparql("ORDER BY ?publishedAt")
  const byIngested = await sparql("ORDER BY ?ingestedAt")
  const byAsserted = await sparql("ORDER BY ?assertedAt")

  // Verify different orderings
  expect(byEvent[0]).not.toEqual(byPublished[0])
  expect(byPublished[0]).not.toEqual(byIngested[0])
  expect(byIngested[0]).not.toEqual(byAsserted[0])
})
```

### SHACL Validation

```bash
shacl validate --shapes ontologies/seattle/shapes.ttl \
               --data ontologies/seattle/seattle.ttl

# Should pass with 0 violations after fixes
```

---

## Risk Assessment

### Low Risk (P0 Fixes)

**Why low risk:**
- Well-scoped changes (4 properties, find-replace pattern)
- Clear acceptance criteria (SPARQL queries must work)
- Existing patterns to follow (DocumentMetadata already has bitemporal)
- No breaking changes to existing data (additive properties)

**Mitigation:**
- Incremental testing after each change
- SHACL validation catches errors early
- TypeScript schemas prevent runtime errors

### Estimated Timeline Confidence

- **5-8 days (P0)**: **High confidence** (80%)
- **+2-3 days (P1-P2)**: **Medium confidence** (60%)

**Buffer recommendation**: Add 2 days for unforeseen integration issues.

---

## Success Criteria

### MVP Launch Ready ✅

- [ ] All MVP competency questions execute successfully
- [ ] Timeline UX can sort by 4 time dimensions
- [ ] "What did we know when?" queries work
- [ ] PROV-O interoperability validated
- [ ] SHACL validation passes (0 violations)
- [ ] TypeScript schemas align with RDF properties

### Post-MVP Quality ✅

- [ ] Ontology portable (TBox/ABox separated)
- [ ] Comprehensive SHACL validation
- [ ] All event types have shapes

---

## Next Steps

### Immediate (Today)

1. **Review this audit** with team
2. **Prioritize P0 work** in sprint planning
3. **Allocate 5-8 days** for implementation
4. **Assign developer(s)** to bitemporal + OWL-Time fixes

### This Week

5. **Implement P0 fixes** following [ACTION_ITEMS.md](./ACTION_ITEMS.md)
6. **Run integration tests** daily
7. **Track progress** against acceptance criteria

### Next Sprint

8. **Address P1-P2 issues** for quality improvements
9. **Document patterns** for future ontology packs

---

## Questions for Discussion

1. **Timeline**: Can we allocate 5-8 days for P0 fixes before MVP launch?
2. **Scope**: Should we tackle P1-P2 issues now, or post-MVP?
3. **Testing**: Do we have SPARQL integration tests set up?
4. **Deployment**: Are there other dependencies blocking MVP beyond these modeling issues?

---

## Related Documents

- **Full Audit**: [2025-12-18-medium-severity-modeling-audit.md](./2025-12-18-medium-severity-modeling-audit.md) (detailed analysis)
- **Action Items**: [ACTION_ITEMS.md](./ACTION_ITEMS.md) (implementation checklist)
- **MVP Requirements**: [packages/@core-v2/docs/mvp/mvp_discussion_research_case_study.md](../mvp/mvp_discussion_research_case_study.md)
- **Seattle Ontology Design**: [ontologies/seattle/ONTOLOGY_DESIGN.md](../../../ontologies/seattle/ONTOLOGY_DESIGN.md)

---

**Prepared by**: Claude (Effect Ontology Project)
**Review Status**: Ready for team review
**Next Action**: Sprint planning + developer assignment
