# Proposed Ontology Changes - Ready to Apply

**Date**: 2025-12-18
**Status**: Copy-paste ready Turtle snippets
**Source**: [2025-12-18-medium-severity-modeling-audit.md](./2025-12-18-medium-severity-modeling-audit.md)

---

## Issue #1: Add Bitemporal Timestamps to claims.ttl

**File**: `/Users/pooks/Dev/effect-ontology/ontologies/claims/claims.ttl`
**Location**: Insert after line 110 (after existing `claims:eventTime` definition)

### Copy-Paste Snippet

```turtle
# =============================================================================
# Bitemporal Timestamps (Knowledge Time Tracking)
# =============================================================================
#
# These properties enable "what did we know when?" queries by tracking:
# - When documents were published (publishedAt)
# - When documents were ingested into the system (ingestedAt)
# - When claims were added to the knowledge base (assertedAt)
# - When claims were inferred by reasoning (derivedAt)
#
# See: MVP timeline requirements in docs/mvp/mvp_discussion_research_case_study.md
# =============================================================================

:publishedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "published at"@en ;
    rdfs:comment "When the source document was published by the original publisher (e.g., newspaper, website)."@en ;
    rdfs:domain :Claim ;
    rdfs:range xsd:dateTime .

:ingestedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "ingested at"@en ;
    rdfs:comment "When the source document was ingested into the knowledge system."@en ;
    rdfs:domain :Claim ;
    rdfs:range xsd:dateTime .

:assertedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "asserted at"@en ;
    rdfs:comment "When this claim was added to the knowledge base (system timestamp). For extracted claims, this equals extractedAt."@en ;
    rdfs:domain :Claim ;
    rdfs:range xsd:dateTime .

:derivedAt rdf:type owl:DatatypeProperty ;
    rdfs:label "derived at"@en ;
    rdfs:comment "When this claim was inferred by a reasoning rule (system timestamp). Only populated for DerivedAssertion instances."@en ;
    rdfs:domain :Claim ;
    rdfs:range xsd:dateTime .
```

**Note**: Keep existing `claims:extractedAt` (line 122-126) - it serves as a semantic alias for `assertedAt` on extracted claims.

### Verification Steps

After adding these properties:

1. **Validate Turtle syntax**:
   ```bash
   riot --validate ontologies/claims/claims.ttl
   ```

2. **Verify namespace resolution**:
   ```bash
   riot --output=turtle ontologies/claims/claims.ttl | grep -A2 "publishedAt\|ingestedAt\|assertedAt\|derivedAt"
   ```

3. **Check property count**:
   Should see 4 new properties in output:
   - `claims:publishedAt`
   - `claims:ingestedAt`
   - `claims:assertedAt`
   - `claims:derivedAt`

---

## Issue #2: Fix Event Time Modeling in seattle.ttl

**File**: `/Users/pooks/Dev/effect-ontology/ontologies/seattle/seattle.ttl`

### Change #1: Remove Incorrect time:inXSDDateTime Usage

**Find**: All instances of `time:inXSDDateTime` on Activity instances

**Example locations** (search for these patterns):
```turtle
# INCORRECT PATTERN (search for this):
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    time:inXSDDateTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;
    # ...
```

**Replace with**:
```turtle
# CORRECT PATTERN (PROV-O compliant):
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    prov:startedAtTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;
    prov:endedAtTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;  # Same time = instant event
    # ...
```

### Automated Find-Replace

Use this pattern for safe replacement:

**Search regex**:
```regex
time:inXSDDateTime\s+"([^"]+)"\^\^xsd:dateTime
```

**Replace with**:
```
prov:startedAtTime "$1"^^xsd:dateTime ;
    prov:endedAtTime "$1"^^xsd:dateTime
```

### Verification Steps

1. **Check no time:inXSDDateTime on Activities**:
   ```bash
   grep -n "time:inXSDDateTime" ontologies/seattle/seattle.ttl
   ```

   Should only find usage in `time:Instant` nodes (for `org:memberDuring` intervals), NOT on Activity instances.

2. **Validate all Activities have PROV-O timestamps**:
   ```bash
   grep -A5 "a seattle:.*Event" ontologies/seattle/seattle.ttl | grep "prov:startedAtTime"
   ```

3. **Validate Turtle syntax**:
   ```bash
   riot --validate ontologies/seattle/seattle.ttl
   ```

---

## Issue #2: Update SHACL Shapes for PROV-O Pattern

**File**: `/Users/pooks/Dev/effect-ontology/ontologies/seattle/shapes.ttl`
**Location**: Lines 169-175 (StaffAnnouncementEventShape)

### Find and Replace

**BEFORE** (lines 169-175):
```turtle
    sh:property [
        sh:path time:inXSDDateTime ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:message "Event must have exactly one time:inXSDDateTime"
    ] ;
```

**AFTER**:
```turtle
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

### Verification Steps

1. **Validate SHACL syntax**:
   ```bash
   riot --validate ontologies/seattle/shapes.ttl
   ```

2. **Test SHACL validation with test data**:
   ```bash
   shacl validate --shapes ontologies/seattle/shapes.ttl \
                  --data ontologies/seattle/seattle.ttl
   ```

   Should report 0 violations if all events use PROV-O pattern.

---

## Issue #2: Update Documentation

**File**: `/Users/pooks/Dev/effect-ontology/ontologies/seattle/README.md`
**Location**: Lines 101-104

### Find and Replace

**BEFORE** (lines 98-105):
```markdown
### Staff Announcement Event

Events are `prov:Activity` with provenance:

```turtle
seattle:Event_StaffAnnouncement_20251203 a seattle:StaffAnnouncementEvent ;
    seattle:announcedMembership seattle:Membership_Burgess_Deputy ;
    time:inXSDDateTime "2025-12-03T10:00:00-08:00"^^xsd:dateTime ;
    prov:wasDerivedFrom seattle:Doc_PressRelease_20251203 .
```
```

**AFTER**:
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

**Note**: For instant events (announcements), `prov:startedAtTime` and `prov:endedAtTime` are equal.
For duration events, use different values to represent the time span.
```

---

## Issue #4: Add Range to seattle:announces (P2)

**File**: `/Users/pooks/Dev/effect-ontology/ontologies/seattle/seattle.ttl`
**Location**: Lines 119-122

### Find and Replace

**BEFORE** (lines 119-122):
```turtle
seattle:announces a owl:ObjectProperty ;
    rdfs:label "announces"@en ;
    rdfs:comment "Links an initiative event to the initiative being announced."@en ;
    rdfs:domain seattle:PolicyInitiativeEvent .
```

**AFTER**:
```turtle
seattle:announces a owl:ObjectProperty ;
    rdfs:label "announces"@en ;
    rdfs:comment "Links an initiative event to the initiative being announced."@en ;
    rdfs:domain seattle:PolicyInitiativeEvent ;
    rdfs:range skos:Concept .
```

**Change**: Added `;` after `PolicyInitiativeEvent` and added `rdfs:range skos:Concept .` line.

### Verification

1. **Validate syntax**:
   ```bash
   riot --validate ontologies/seattle/seattle.ttl
   ```

2. **Verify range inference**:
   ```bash
   riot --output=ntriples ontologies/seattle/seattle.ttl | grep "seattle:announces.*rdfs:range"
   ```

---

## Complete Validation Checklist

After applying all changes:

### Ontology Validation

- [ ] `riot --validate ontologies/claims/claims.ttl` passes
- [ ] `riot --validate ontologies/seattle/seattle.ttl` passes
- [ ] `riot --validate ontologies/seattle/shapes.ttl` passes

### SHACL Validation

- [ ] `shacl validate --shapes ontologies/seattle/shapes.ttl --data ontologies/seattle/seattle.ttl` reports 0 violations

### Property Verification

```bash
# Count bitemporal properties in claims.ttl
grep -c "publishedAt\|ingestedAt\|assertedAt\|derivedAt" ontologies/claims/claims.ttl
# Should return 4 (one match per property)

# Check no time:inXSDDateTime on Activities
grep "a seattle:.*Event" ontologies/seattle/seattle.ttl -A5 | grep "time:inXSDDateTime"
# Should return empty (no matches)

# Check all Activities have prov:startedAtTime
grep "a seattle:.*Event" ontologies/seattle/seattle.ttl -A5 | grep "prov:startedAtTime" | wc -l
# Should match number of Activity instances
```

### Documentation Verification

- [ ] README.md examples use PROV-O pattern (prov:startedAtTime)
- [ ] No references to time:inXSDDateTime in examples
- [ ] Comments explain instant vs duration events

---

## Testing with SPARQL Queries

After applying changes, test these competency questions:

### Test 1: Bitemporal Timeline Query

```sparql
PREFIX claims: <http://effect-ontology.dev/claims#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

# Query facts by different time dimensions
SELECT ?claim ?eventTime ?publishedAt ?ingestedAt ?assertedAt WHERE {
  ?claim a claims:Claim ;
         claims:eventTime ?eventTime ;
         claims:publishedAt ?publishedAt ;
         claims:ingestedAt ?ingestedAt ;
         claims:assertedAt ?assertedAt .
}
ORDER BY ?eventTime
LIMIT 10
```

**Expected**: Returns claims with all 4 timestamp fields populated.

### Test 2: Facts Derived Today

```sparql
PREFIX claims: <http://effect-ontology.dev/claims#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

# Show inferred facts from today
SELECT ?fact ?derivedAt WHERE {
  ?fact a claims:Claim ;
        claims:derivedAt ?derivedAt .

  FILTER (?derivedAt >= "2025-12-18T00:00:00Z"^^xsd:dateTime)
  FILTER (?derivedAt < "2025-12-19T00:00:00Z"^^xsd:dateTime)
}
ORDER BY DESC(?derivedAt)
```

**Expected**: Returns inferred facts with derivedAt timestamps.

### Test 3: Event Time Consistency

```sparql
PREFIX seattle: <http://effect-ontology.dev/seattle/>
PREFIX prov: <http://www.w3.org/ns/prov#>

# Verify all events use PROV-O pattern
SELECT ?event ?startedAt ?endedAt WHERE {
  ?event a seattle:StaffAnnouncementEvent ;
         prov:startedAtTime ?startedAt .

  OPTIONAL { ?event prov:endedAtTime ?endedAt }
}
```

**Expected**: All events have prov:startedAtTime, optionally prov:endedAtTime.

### Test 4: No time:inXSDDateTime on Activities

```sparql
PREFIX seattle: <http://effect-ontology.dev/seattle/>
PREFIX time: <http://www.w3.org/2006/time#>
PREFIX prov: <http://www.w3.org/ns/prov#>

# This should return EMPTY (no results)
SELECT ?activity ?instant WHERE {
  ?activity a prov:Activity ;
            time:inXSDDateTime ?instant .
}
```

**Expected**: Empty result set (no Activities should use time:inXSDDateTime directly).

---

## Rollback Plan

If changes cause issues, revert with:

```bash
# Undo changes to claims.ttl
git checkout ontologies/claims/claims.ttl

# Undo changes to seattle.ttl
git checkout ontologies/seattle/seattle.ttl

# Undo changes to shapes.ttl
git checkout ontologies/seattle/shapes.ttl

# Undo changes to README.md
git checkout ontologies/seattle/README.md
```

Then re-validate original state:
```bash
riot --validate ontologies/claims/claims.ttl
riot --validate ontologies/seattle/seattle.ttl
shacl validate --shapes ontologies/seattle/shapes.ttl --data ontologies/seattle/seattle.ttl
```

---

## Next Steps

After ontology changes:

1. **TypeScript Schema Changes**
   - Create `/packages/@core-v2/src/Domain/Model/Claim.ts` with bitemporal properties
   - See [ACTION_ITEMS.md](./ACTION_ITEMS.md) for TypeScript implementation details

2. **RdfBuilder Updates**
   - Modify quad generation to use `prov:startedAtTime`/`prov:endedAtTime`
   - Add bitemporal property generation from Claim instances

3. **Integration Testing**
   - Run SPARQL competency questions
   - Verify timeline sorting works
   - Test SHACL validation passes

4. **Documentation Updates**
   - Update ONTOLOGY_DESIGN.md if needed
   - Document bitemporal query patterns

---

**Prepared by**: Claude (Effect Ontology Project)
**Status**: Ready to apply
**Estimated Time**: 2-3 hours for ontology changes, validation, and testing
