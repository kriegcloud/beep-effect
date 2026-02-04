# UK Government ORG Patterns

Research findings from UK Government Linked Data Working Group on W3C ORG usage.

## Overview

The UK Government was an early adopter of the W3C Organization Ontology, using it for Cabinet Office organogram publications. While detailed implementation examples are not publicly documented, the W3C ORG specification itself provides authoritative patterns.

## Source

- UK Gov LD Working Group: http://ukgovld.github.io/ukgovldwg/
- W3C ORG Recommendation: https://www.w3.org/TR/vocab-org/

## W3C ORG Core Patterns

### org:memberDuring with OWL-Time

The key pattern for temporal memberships uses `org:memberDuring` pointing to a `time:Interval`:

```turtle
@prefix org: <http://www.w3.org/ns/org#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix time: <http://www.w3.org/2006/time#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# Organization
<http://example.com/org#cabinet-office> a org:FormalOrganization ;
    skos:prefLabel "Cabinet Office" .

# Role definition
<http://example.com/roles#cto> a org:Role ;
    skos:prefLabel "Chief Technology Officer" .

# Membership with temporal interval
[] a org:Membership ;
    org:member <http://example.com/people#jane> ;
    org:organization <http://example.com/org#cabinet-office> ;
    org:role <http://example.com/roles#cto> ;
    org:memberDuring [
        a time:Interval ;
        time:hasBeginning [
            a time:Instant ;
            time:inXSDDateTime "2020-03-15T09:00:00Z"^^xsd:dateTime
        ] ;
        time:hasEnd [
            a time:Instant ;
            time:inXSDDateTime "2023-06-30T17:00:00Z"^^xsd:dateTime
        ]
    ] .
```

### Property Specifications

| Property | Domain | Range | Notes |
|----------|--------|-------|-------|
| `org:memberDuring` | org:Membership | (open, informally time:Interval) | Temporal validity |
| `org:member` | org:Membership | foaf:Agent | Functional property |
| `org:organization` | org:Membership | org:Organization | Functional property |
| `org:role` | org:Membership or org:Post | org:Role | Optional enrichment |

### N-ary Relationship Pattern

The `org:Membership` class is specifically designed as an n-ary relationship to capture:
1. The member (person or organization)
2. The organization context
3. The role/function
4. Temporal boundaries
5. Additional metadata

This is more expressive than simple `org:memberOf` which cannot carry temporal or role information.

## Government-Specific Considerations

### Organizations

UK Government uses `org:FormalOrganization` for:
- Government departments
- Agencies
- Non-departmental public bodies

### Posts

`org:Post` represents positions that exist independently of holders:
- Cabinet positions
- Departmental heads
- Senior civil service roles

### Historical Tracking

The ORG ontology explicitly supports:
- Organizational change over time
- Succession relationships
- Merged/split organizations
- Role changes

## Recommendations for Seattle Pack

Based on UK Government precedent and W3C ORG patterns:

### 1. Use Formal Organization

```turtle
seattle:CityOfSeattle a org:FormalOrganization ;
    skos:prefLabel "City of Seattle"@en ;
    org:hasUnit seattle:MayorsOffice .
```

### 2. Define Posts Independently

```turtle
seattle:MayorPost a org:Post ;
    skos:prefLabel "Mayor of Seattle"@en ;
    org:postIn seattle:CityOfSeattle .

seattle:DeputyMayorPost a org:Post ;
    skos:prefLabel "Deputy Mayor"@en ;
    org:postIn seattle:MayorsOffice .
```

### 3. Use Time Intervals for Membership

```turtle
seattle:Membership_BruceHarrell_Mayor a org:Membership ;
    org:member seattle:BruceHarrell ;
    org:organization seattle:CityOfSeattle ;
    org:role seattle:MayorPost ;
    org:memberDuring [
        a time:Interval ;
        time:hasBeginning [
            a time:Instant ;
            time:inXSDDate "2022-01-01"^^xsd:date
        ]
        # No hasEnd = current/ongoing
    ] .
```

### 4. Support Open-Ended Intervals

For current positions, omit `time:hasEnd` to indicate ongoing membership. This is cleaner than using a far-future sentinel date.

### 5. Time Precision

- Use `xsd:date` for day-precision (typical for government appointments)
- Use `xsd:dateTime` only when time-of-day matters
- Use `xsd:gYear` for year-only precision if needed

## Integration with Claims Model

The temporal membership pattern integrates with the claims model:

```turtle
# Claim about a membership start
seattle:Claim_HarrellMayorStart a claims:Claim ;
    claims:subject seattle:BruceHarrell ;
    claims:predicate org:holds ;
    claims:object seattle:MayorPost ;
    claims:rank claims:Normal ;
    prov:wasAttributedTo seattle:SeattleGov ;
    prov:generatedAtTime "2022-01-01"^^xsd:date .
```

This allows tracking:
- When the claim was made
- By whom (provenance)
- Confidence/rank
- Evidence spans

## References

- W3C ORG Specification: https://www.w3.org/TR/vocab-org/
- OWL-Time: https://www.w3.org/TR/owl-time/
- UK Gov LD WG: http://ukgovld.github.io/ukgovldwg/
