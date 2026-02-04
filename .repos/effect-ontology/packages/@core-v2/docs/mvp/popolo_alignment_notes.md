# Popolo Project Alignment Notes

Research findings from [Popolo Project specifications](https://www.popoloproject.com/specs/) for Seattle Ontology Pack alignment.

## Overview

Popolo is the de facto standard for civic/legislative data, adopted by Open Civic Data and used by legislative tracking systems worldwide. It deliberately builds on W3C vocabularies (FOAF, ORG, SKOS) while providing JSON serialization conventions for web APIs.

## Post Specification

**Source:** https://www.popoloproject.com/specs/post.html

### Definition
A post represents "a position that exists independent of the person holding it" - distinct from roles which describe functions people can fulfill across organizations.

### Core Properties

| Property | RDF Mapping | Type | Required | Notes |
|----------|-------------|------|----------|-------|
| label | `skos:prefLabel` | String | Yes | Descriptive label (e.g., "Mayor") |
| alternate_label | `skos:altLabel` | String | No | Abbreviations or variants |
| role | `org:role` | String | No | Function fulfilled by holder |
| organization | `org:postIn` | Reference | Yes | Post cannot exist outside organization |
| start_date | `schema:validFrom` | Date | No | Creation date of the post |
| end_date | `schema:validUntil` | Date | No | Elimination date of the post |
| contact_detail | `opengov:contactDetail` | Object | No | Holder contact information |
| links | `rdfs:seeAlso` | Array | No | External documentation URLs |

### Key Design Decisions

1. **Indirect Holding**: People hold posts through memberships, not directly. The spec explicitly states `org:heldBy` and `org:holds` "should not be used."

2. **Organization Dependency**: Posts must specify either `organization_id` or `organization`.

3. **JSON vs RDF Divergence**: JSON serialization uses different property names for consistency:
   - `label` instead of `prefLabel`
   - `start_date`/`end_date` instead of `validFrom`/`validUntil`

## Membership Specification

**Source:** https://www.popoloproject.com/specs/membership.html

### Definition
Represents "a relationship between a member and an organization" - an n-ary relation enabling complex metadata beyond simple binary connections.

### Core Properties

| Property | RDF Mapping | Type | Required | Notes |
|----------|-------------|------|----------|-------|
| label | `skos:prefLabel` | String | No | Describes membership (e.g., "Chairman of XYZ Party") |
| role | `org:role` | String | No | Role fulfilled by member |
| member | `org:member` | Reference | Yes* | Person or organization |
| organization | `org:organization` | Reference | Yes* | Organization context |
| post | `opengov:post` | Reference | No | Specific post held |
| on_behalf_of | `opengov:onBehalfOf` | Reference | No | Representing another org |
| start_date | `schema:validFrom` | Date | No | Commencement date |
| end_date | `schema:validUntil` | Date | No | Termination date |

*At least one member reference and one organization reference required.

### Temporal Pattern

Popolo uses `schema:validFrom` and `schema:validUntil` for temporal boundaries, which differs from W3C ORG's `org:memberDuring` with `time:Interval` pattern.

**Recommendation for Seattle Pack:** Use the W3C ORG pattern (`org:memberDuring` + `time:Interval`) for better OWL-Time integration, but document the Popolo equivalence.

## W3C ORG Comparison

### Temporal Modeling

| Aspect | Popolo | W3C ORG | Recommendation |
|--------|--------|---------|----------------|
| Start date | `schema:validFrom` on Membership | `time:hasBeginning` on Interval | Use OWL-Time for reasoning support |
| End date | `schema:validUntil` on Membership | `time:hasEnd` on Interval | Use OWL-Time for reasoning support |
| Interval | Not explicit | `org:memberDuring` → `time:Interval` | Prefer explicit Interval class |

### Post Modeling

| Aspect | Popolo | W3C ORG | Notes |
|--------|--------|---------|-------|
| Label | `skos:prefLabel` | `skos:prefLabel` | Aligned |
| Organization | `org:postIn` | `org:postIn` | Aligned |
| Holder | Via Membership only | Via `org:heldBy` (optional) | Popolo stricter |

### Membership Modeling

| Aspect | Popolo | W3C ORG | Notes |
|--------|--------|---------|-------|
| Person link | `org:member` | `org:member` | Aligned |
| Org link | `org:organization` | `org:organization` | Aligned |
| Role | `org:role` → String | `org:role` → `org:Role` | ORG allows richer typing |
| Post link | `opengov:post` | Via `org:holds` | Different approach |

## Seattle Pack Implications

### Recommended Pattern

```turtle
@prefix org: <http://www.w3.org/ns/org#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix time: <http://www.w3.org/2006/time#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix seattle: <http://example.org/seattle/> .

# Post definition
seattle:DeputyMayorPost a org:Post ;
    skos:prefLabel "Deputy Mayor"@en ;
    org:postIn seattle:CityOfSeattle .

# Person (using FOAF)
seattle:TimBurgess a foaf:Person ;
    foaf:name "Tim Burgess" .

# Membership with temporal interval
seattle:TimBurgessDeputyMayor2025 a org:Membership ;
    org:member seattle:TimBurgess ;
    org:organization seattle:CityOfSeattle ;
    org:role seattle:DeputyMayorPost ;
    org:memberDuring seattle:TimBurgessDeputyMayorInterval .

# Time interval (OWL-Time)
seattle:TimBurgessDeputyMayorInterval a time:Interval ;
    time:hasBeginning [ a time:Instant ;
        time:inXSDDate "2025-01-01"^^xsd:date ] .
```

### Key Decisions

1. **Use `org:memberDuring` + `time:Interval`** instead of Popolo's `schema:validFrom/validUntil` for better reasoning support

2. **Use `foaf:Person`** not custom Person class (Popolo-aligned)

3. **Use `skos:prefLabel`** for post names (both aligned)

4. **Use `org:postIn`** for post-organization relationship (both aligned)

5. **Link posts through `org:role`** on Membership (W3C ORG pattern, cleaner than Popolo's separate `opengov:post`)

## References

- Popolo Person: https://www.popoloproject.com/specs/person.html
- Popolo Post: https://www.popoloproject.com/specs/post.html
- Popolo Membership: https://www.popoloproject.com/specs/membership.html
- W3C ORG: https://www.w3.org/TR/vocab-org/
- OWL-Time: https://www.w3.org/TR/owl-time/
