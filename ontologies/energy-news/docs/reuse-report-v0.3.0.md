# Reuse Report — Energy News Ontology v0.3.0

**Date:** 2026-02-26
**Phase:** Knowledge Acquisition (Scout)
**Scope:** 14 new OWL classes added in v0.3.0 gap analysis

## Baseline Reuse (Already In Use)

| Vocabulary | Usage | Status |
|-----------|-------|--------|
| SKOS | Topic concept scheme, broader/narrower, labels | Active |
| Dublin Core Terms | Ontology metadata (title, description, creator, date, license) | Active |
| BFO 2020 | Upper ontology alignment (Object, Process, Site, GDC) | Active (declaration stubs) |
| OWL 2 DL | Class axioms, property characteristics, disjointness | Active |
| RDFS | Labels, definitions, subclass hierarchy | Active |

## Candidate Ontologies Evaluated

### Tier 1: Primary Alignment Target

#### Open Energy Ontology (OEO)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Coverage | **High** | Covers all 9 target class categories across 3 modules (physical, social, model) |
| Quality | **High** | ~900 classes, community-governed, published in Energy & AI journal |
| License | **CC0-1.0** | Public domain — zero restrictions |
| Community | **High** | Active commits through 2026; v2.10.0 current |
| BFO Alignment | **Yes** | Built on BFO 2020 from the ground up |
| Modularization | **Good** | oeo-physical, oeo-social, oeo-model modules |

**Class-level alignment:**

| Our Class | OEO Equivalent | Relationship |
|-----------|---------------|-------------|
| enews:PowerPlant | OEO power plant (material entity) | skos:closeMatch |
| enews:EnergyProject | OEO process classes | skos:closeMatch |
| enews:RenewableInstallation | OEO renewable energy converting devices | skos:closeMatch |
| enews:GridZone | OEO grid component role / voltage levels | skos:relatedMatch |
| enews:EnergyTechnology | OEO energy transformation subclasses | skos:closeMatch |
| enews:PolicyInstrument | OEO oeo-social political/regulatory entities | skos:closeMatch |
| enews:RegulatoryBody | OEO oeo-social organization roles | skos:closeMatch |
| enews:MarketInstrument | OEO market exchange role | skos:closeMatch |
| enews:CapacityMeasurement | OEO physical quantity classes | skos:closeMatch |

**Recommendation:** Create SSSOM mappings to OEO. Do NOT import modules — our
ontology operates at a different granularity (news classification vs. energy
systems analysis). SSSOM alignment enables interoperability without coupling.

### Tier 2: Supplementary Alignment

#### ENVO (Environment Ontology)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Coverage | **Medium** | Strong power plant taxonomy (7+ subtypes); limited outside facilities |
| License | CC-BY 4.0 | Open with attribution |
| BFO Alignment | Yes | OBO Foundry member |

**Key terms:**
- `ENVO:00002214` — power plant (parent class)
- `ENVO:00002215` — geothermal power plant
- `ENVO:00002271` — nuclear power plant
- `ENVO:2000038` — coal power plant
- `ENVO:03501241` — wind farm

**Recommendation:** Map enews:PowerPlant to ENVO:00002214 via SSSOM.
Consider MIREOT extraction if we need the power plant subtype hierarchy.

#### Wikidata

| Criterion | Score | Notes |
|-----------|-------|-------|
| Coverage | **Medium** | Good entity-level coverage for disambiguation |
| License | CC0 | Public domain |
| Stability | Stable QIDs | Persistent identifiers |

**Key QIDs:**
- Q159719 — power station
- Q12705 — renewable energy
- Q1003207 — photovoltaic power station
- Q194356 — wind farm
- Q112046 — transmission system operator
- Q1805337 — energy policy
- Q676081 — electricity market
- Q1239166 — energy market

**Recommendation:** Include Wikidata QIDs in SSSOM mappings for LOD integration.

#### Schema.org

| Criterion | Score | Notes |
|-----------|-------|-------|
| Coverage | **Low** | No energy infrastructure classes; org/content types already mapped |
| License | CC-BY-SA 3.0 | Open |

**New mappings to add:**
- enews:RegulatoryBody → schema:GovernmentOrganization (skos:closeMatch)
- enews:CapacityMeasurement → schema:QuantitativeValue (skos:broadMatch)

#### DBpedia

| Criterion | Score | Notes |
|-----------|-------|-------|
| Coverage | **Low** | dbo:PowerStation, dbo:GovernmentAgency only |
| License | CC-BY-SA 3.0 | Open |

**New mappings to add:**
- enews:PowerPlant → dbo:PowerStation (skos:closeMatch)
- enews:RegulatoryBody → dbo:GovernmentAgency (skos:closeMatch)

### Tier 3: Not Recommended for Alignment

| Ontology | Reason |
|----------|--------|
| SAREF4ENER | Wrong granularity — smart appliances, not utility-scale infrastructure |
| SEAS | Dormant since 2018; useful vocabulary but unmaintained |
| CIM (IEC 61970) | Licensing barriers (IEC standard requires purchase); reference only |
| OntoPowSys | Academic, limited availability |

## ODP Recommendations

| Pattern | Applicability | Where |
|---------|--------------|-------|
| Value Partition | ProjectStatus values (planned/approved/under_construction/operational/decommissioned) | Already using SKOS-like approach; consider formal OWL value partition |
| N-ary Relation | PriceDataPoint (commodity × price × date × market) | Could formalize as reified relationship |
| Participation | PowerPlant participatedIn EnergyEvent | BFO-standard participation pattern |

## Reuse Decision Summary

| Term | Reuse Strategy | Source |
|------|---------------|--------|
| PowerPlant | SSSOM mapping | OEO, ENVO:00002214, Wikidata Q159719, dbo:PowerStation |
| EnergyProject | SSSOM mapping | OEO process classes |
| RenewableInstallation | SSSOM mapping | OEO renewable devices, Wikidata Q194356/Q1003207 |
| GridZone | SSSOM mapping | OEO grid components, Wikidata Q112046 |
| EnergyTechnology | SSSOM mapping | OEO energy transformations |
| PolicyInstrument | SSSOM mapping | OEO oeo-social, Wikidata Q1805337 |
| RegulatoryBody | SSSOM mapping | OEO org roles, schema:GovernmentOrganization, dbo:GovernmentAgency |
| MarketInstrument | SSSOM mapping | OEO market exchange, Wikidata Q676081 |
| CapacityMeasurement | SSSOM mapping | OEO physical quantities, schema:QuantitativeValue |

**Overall strategy:** SSSOM alignment, not direct import. Our ontology serves a
different purpose (energy news classification) than OEO (energy systems analysis).
Maintaining independence while documenting precise mappings gives the best balance
of interoperability and autonomy.

## Next Steps

1. Download OEO release and extract exact IRIs for SSSOM subject_id mapping
2. Create `ontologies/energy-news/mappings/enews-to-oeo.sssom.tsv`
3. Create `ontologies/energy-news/mappings/enews-to-wikidata.sssom.tsv`
4. Create `ontologies/energy-news/mappings/enews-to-misc.sssom.tsv` (Schema.org, DBpedia, ENVO)
5. Hand off to ontology-mapper skill for formal SSSOM generation and validation
