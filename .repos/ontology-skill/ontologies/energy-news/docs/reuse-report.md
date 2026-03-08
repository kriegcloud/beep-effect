# Ontology Reuse Report -- Energy News Media Ontology

## Summary

This report evaluates existing ontologies and vocabularies for potential reuse in
the Energy News Media Ontology (~8 classes, ~55 SKOS topic individuals, OWL 2 DL). The ontology models the
intersection of energy topics and news media activity as observed through Bluesky
social media, per the ORSD and scope documents.

**Key finding**: No single ontology covers our combined energy-news domain. The best
reuse strategy is a thin alignment approach: mint our own classes and properties in
our namespace, then declare `owl:equivalentClass`, `rdfs:subClassOf`, or
`skos:exactMatch` mappings to external vocabularies where appropriate. This keeps the
ontology self-contained and lightweight while maintaining semantic interoperability.

### Coverage Summary

| Domain Layer          | Pre-glossary Terms | Best Reuse Source           | Approach         |
|-----------------------|--------------------|-----------------------------|------------------|
| Energy topic taxonomy | ~55 classes        | None adequate; build custom | Reference ENVO/SWEET for alignment only |
| News/media entities   | ~7 classes         | schema.org + DCTerms        | Align properties |
| Organizations         | ~1 class           | schema.org Organization     | Align            |
| Geography             | ~1 class           | schema.org Place / GeoNames | Align            |
| Standard metadata     | Annotations        | DCTerms, SKOS, RDFS        | Direct import    |

---

## 1. Energy Domain Ontologies

### 1.1 SWEET (Semantic Web for Earth and Environmental Terminology)

- **URL**: https://sweetontology.net / https://github.com/ESIPFed/sweet
- **Format**: OWL 2
- **License**: Apache 2.0
- **Maintained**: Semi-active (ESIP Foundation stewardship; last substantive updates
  ~2020-2022, community maintenance ongoing)
- **Coverage**: Broad earth science vocabulary covering energy phenomena (solar
  radiation, wind, geothermal heat), materials (fossil fuels, minerals), and
  physical processes. Contains modules for `sweetEnergyFlux`, `sweetMaterial`,
  `sweetRealm`. Approximately 4,500 concepts across modular OWL files.
- **Relevance to our pre-glossary**: SWEET covers physical energy phenomena (Solar,
  Wind, Geothermal, Nuclear as physical processes) but NOT energy-as-industry
  concepts. It has nothing for EnergyMarkets, EnergyPolicy, PowerPurchaseAgreement,
  DataCenterDemand, or EnergyJustice. Its granularity is earth science, not news
  media.
- **Reuse recommendation**: **Reference only**. SWEET's concepts are too
  science-oriented for a news media taxonomy. We could declare `skos:relatedMatch`
  from our `enews:Solar` to `sweet:SolarRadiation` for downstream interoperability
  with earth science KGs, but importing any SWEET module would add hundreds of
  irrelevant classes.

### 1.2 ENVO (Environment Ontology)

- **URL**: https://github.com/EnvironmentOntology/envo / OBO: http://purl.obolibrary.org/obo/envo.owl
- **Format**: OWL 2 (OBO format)
- **License**: CC BY 4.0
- **Maintained**: Yes, actively maintained under OBO Foundry
- **Coverage**: Environmental systems, biomes, environmental materials, and
  environmental processes. Contains terms for fossil fuels (`ENVO:01000267`
  "fossil fuel"), solar energy (`ENVO:01000268` "solar energy"), wind energy, etc.
  Also has terms for power plants and energy infrastructure as environmental
  features.
- **Relevance to our pre-glossary**: ENVO covers energy sources as environmental
  entities -- useful for alignment but at the wrong level of abstraction. ENVO's
  "solar energy" is a physical phenomenon, not a news topic category.
  No coverage of media entities, markets, policy, or organizations.
- **Reuse recommendation**: **Reference only (SSSOM mappings)**. Declare
  `skos:broadMatch` or `skos:relatedMatch` from our energy topic terms to ENVO
  counterparts. Do not import. The OBO Foundry ID scheme (numeric CURIEs) and the
  heavy BFO alignment would add complexity disproportionate to benefit.

### 1.3 OBO Foundry -- General Energy Coverage

- **URL**: https://obofoundry.org
- **Findings**: The OBO Foundry catalog does not contain a dedicated "energy systems"
  or "energy industry" ontology. Energy-adjacent coverage exists in:
  - **ENVO** (environmental energy, covered above)
  - **CHEBI** (chemical entities -- could map fuels like methane, hydrogen)
  - **OBI** (Ontology for Biomedical Investigations -- has generic "device" and
    "material" but nothing energy-specific)
  - **PCO** (Population and Community Ontology -- irrelevant)
- OBO Foundry is biomedical-focused. No ontology covers energy markets, energy
  policy, grid infrastructure, or energy news.
- **Reuse recommendation**: **Skip for direct reuse**. Maintain awareness for
  future SSSOM mappings to ENVO and CHEBI if the ontology expands to cover fuel
  chemistry or environmental impacts.

### 1.4 IEC CDD / IEV (International Electrotechnical Vocabulary)

- **URL**: https://www.electropedia.org
- **Format**: Proprietary structured vocabulary (not OWL); some RDF exports attempted
- **License**: Restricted / standards body copyright
- **Maintained**: Yes (IEC maintains it)
- **Coverage**: Comprehensive electrical and energy terminology: power generation,
  transmission, distribution, renewable energy systems, nuclear power. Thousands
  of standardized terms with definitions.
- **Relevance to our pre-glossary**: Would cover GridAndInfrastructure, Transmission,
  Distribution, GridOperators, and energy technology terms well. However, the
  vocabulary is engineering-focused (technical specifications), not topic-level
  categories suitable for classifying news articles.
- **Reuse recommendation**: **Skip**. Licensing restrictions, non-OWL format, and
  wrong level of granularity (engineering specs vs. news topic categories).

### 1.5 EnergyPlus / EnergyOntology Efforts (Research)

- **URL**: Various academic papers; no stable published OWL ontology
- **Findings**: Several academic papers describe "energy ontologies" but most are:
  - Building energy performance ontologies (BIM/IFC domain)
  - Smart grid communication ontologies (CIM/IEC 61970)
  - Energy consumption modeling ontologies
  None of these are published as stable, reusable OWL artifacts with clear licensing.
  The W3C had a Semantic Web for Energy Management working group, but it did not
  produce a standard ontology.
- **Reuse recommendation**: **Skip**. No stable, licensed, maintained OWL artifacts
  exist for the energy industry domain at the topic-taxonomy level we need.

### 1.6 DBpedia / Wikidata Energy Categories

- **URL**: https://www.wikidata.org / https://dbpedia.org
- **Format**: RDF (Wikidata: custom data model; DBpedia: extracted from Wikipedia)
- **License**: CC0 (Wikidata), CC BY-SA (DBpedia)
- **Maintained**: Yes (community-driven)
- **Coverage**: Both contain extensive energy-related entities: energy sources,
  power plants, energy companies, energy policies, and geographic coverage. Wikidata
  has items for solar energy (Q12760), wind power (Q35127), nuclear power (Q12739),
  etc. DBpedia has structured category hierarchies.
- **Relevance to our pre-glossary**: Good alignment potential for entity-level
  linking (organizations, geographic entities, energy topics). However, neither
  provides a clean, curated taxonomy suitable for direct import -- they are
  encyclopedic knowledge bases, not designed ontologies.
- **Reuse recommendation**: **Reference only (entity linking)**. Use Wikidata QIDs
  as `skos:exactMatch` targets for our Organization and GeographicEntity instances
  during data population (e.g., `enews:org_catl skos:exactMatch wd:Q56798457`).
  Do not import their ontological structure.

---

## 2. News / Media Ontologies

### 2.1 schema.org (News and Media Types)

- **URL**: https://schema.org
- **Format**: RDFa / JSON-LD / Turtle (official RDF export available)
- **License**: CC BY-SA 3.0 (effectively open for any use)
- **Maintained**: Yes, actively maintained by the Schema.org Community Group (W3C)
- **Coverage -- News/Media types directly relevant to our ontology**:

  | schema.org Type             | Our Pre-glossary Term | Alignment |
  |-----------------------------|-----------------------|-----------|
  | `schema:NewsArticle`        | `Article`             | Very close; schema:NewsArticle is subclass of Article > CreativeWork > Thing |
  | `schema:Article`            | `Article`             | Parent type |
  | `schema:Organization`       | `Organization`        | Direct match |
  | `schema:NewsMediaOrganization` | `Publication`      | Close; subclass of Organization |
  | `schema:Person`             | `AuthorAccount`       | Related match; our AuthorAccount is a Bluesky account, not a person |
  | `schema:SocialMediaPosting` | `Post`                | Good match; subclass of Article > CreativeWork |
  | `schema:WebSite`            | (no direct match)     | Could model Bluesky feeds |
  | `schema:Place`              | `GeographicEntity`    | Close; has subtypes Country, State, etc. |
  | `schema:Country`            | `GeographicEntity`    | Subtype of Place |
  | `schema:MediaObject`        | (no direct match)     | Could model embedded media |

  **Key schema.org properties relevant to our ontology**:

  | schema.org Property     | Our Pre-glossary Property | Notes |
  |-------------------------|---------------------------|-------|
  | `schema:author`         | `postedBy`                | Range: Person or Organization |
  | `schema:publisher`      | `publishedBy`             | Range: Organization or Person |
  | `schema:headline`       | `title`                   | Text |
  | `schema:url`            | `url`                     | URL |
  | `schema:description`    | `description`             | Text |
  | `schema:datePublished`  | `publishedDate`           | Date |
  | `schema:about`          | `coversTopic`             | Range: Thing (very broad) |
  | `schema:mentions`       | `mentionsOrganization`    | Range: Thing |
  | `schema:sharedContent`  | `sharesArticle`           | On SocialMediaPosting |
  | `schema:contentLocation`| `hasGeographicFocus`      | Range: Place |

- **Relevance to our pre-glossary**: Excellent coverage of the news/media layer
  (7 of our 7 media-layer classes have schema.org counterparts). No coverage of
  energy topic taxonomy.
- **Reuse recommendation**: **Align properties and declare equivalences**. This is
  our highest-value reuse target. Recommended approach:
  1. Mint our own classes (`enews:Article`, `enews:Post`, etc.) for simplicity
  2. Declare `owl:equivalentClass` or `rdfs:subClassOf` mappings to schema.org
  3. For properties, either reuse schema.org properties directly (via `owl:equivalentProperty`)
     or declare our domain-specific properties and map them
  4. Do NOT import the full schema.org OWL file (~800+ types, 1400+ properties) --
     far too large. Cherry-pick via alignment axioms.

### 2.2 IPTC NewsCodes / rNews

- **URL**: https://iptc.org/standards/newscodes/ / https://iptc.org/standards/rnews/
- **Format**: rNews is an extension of schema.org (RDFa); NewsCodes available as
  SKOS concept schemes and XML
- **License**: CC BY 4.0 (NewsCodes); rNews is schema.org-aligned (open)
- **Maintained**: Yes, actively maintained by IPTC (International Press
  Telecommunications Council)
- **Coverage**:
  - **NewsCodes**: Controlled vocabularies for news categorization including subject
    codes (over 1,400 topics), media types, genre codes, and content descriptors.
    Contains an "Economy, Business and Finance" branch with energy sub-topics.
    The IPTC Media Topic vocabulary (`medtop`) includes:
    - `medtop:20000439` "energy and resource" (top level)
    - `medtop:20000440` "fossil fuel" (coal, natural gas, oil)
    - `medtop:20000444` "nuclear energy"
    - `medtop:20000445` "renewable energy" (with sub-topics for bio, geothermal,
      hydro, solar, wind)
    - `medtop:20000452` "electricity" (power grid, markets)
    - `medtop:20000454` "energy industry" (companies)
  - **rNews**: schema.org-based markup for news articles, extending NewsArticle
    with additional news-specific properties.
- **Relevance to our pre-glossary**: The IPTC Media Topic vocabulary has a curated
  energy topic hierarchy that partially overlaps with our energy topic taxonomy.
  Coverage of ~15 of our ~55 energy topic classes at a coarser granularity. rNews
  aligns with schema.org, adding little beyond what schema.org already provides.
- **Reuse recommendation**: **Reference / SSSOM mapping for energy topics**. The
  IPTC Media Topics vocabulary is the closest existing curated taxonomy for
  classifying energy news by topic. However:
  - It is much coarser than our taxonomy (no SMR, DataCenterDemand, CriticalMinerals,
    EnergyJustice, etc.)
  - Importing as SKOS concepts would give us a secondary classification axis but
    would not replace our custom taxonomy
  - Best approach: declare `skos:broadMatch` / `skos:narrowMatch` from our topics
    to IPTC `medtop` codes. This enables interoperability with news industry systems.
  - Store mappings in an SSSOM file (`mappings/enews-to-iptc.sssom.tsv`)

### 2.3 BBC News Ontology (BBC Ontologies)

- **URL**: https://www.bbc.co.uk/ontologies (historical); archived at
  https://github.com/bbc/ontologies (if available)
- **Format**: OWL / RDF
- **License**: Varies; some published as open linked data, others unclear
- **Maintained**: Uncertain. BBC published several ontologies circa 2012-2015 as
  part of their Linked Data Platform. Activity has slowed.
- **Coverage**: BBC created ontologies for:
  - **BBC Programmes Ontology**: Broadcast content (not news-specific)
  - **BBC News Ontology**: News stories, storylines, creative works
  - **BBC Sport Ontology**: Sports-specific
  - **Creative Work ontology** (`/ontologies/creativework`): Models news articles
    as creative works with properties for title, description, audience,
    category, and provenance.
- **Relevance to our pre-glossary**: The BBC Creative Work ontology is conceptually
  relevant for modeling news articles, but:
  - It was designed for BBC's internal content management
  - The class hierarchy is shallow and BBC-specific
  - It is not actively maintained
  - schema.org provides equivalent coverage with vastly wider adoption
- **Reuse recommendation**: **Skip**. schema.org supersedes this for our purposes.
  Not worth the dependency on an unmaintained, organization-specific ontology.

### 2.4 NERD (Named Entity Recognition and Disambiguation) Ontology

- **URL**: http://nerd.eurecom.fr/ontology
- **Format**: OWL
- **License**: Open (research project)
- **Maintained**: No (research project from ~2012-2014, inactive)
- **Coverage**: Taxonomy of named entity types for NER tasks: Person, Organization,
  Location, Event, Product, etc. Designed to unify NER type systems across
  different tools.
- **Relevance to our pre-glossary**: Minimal. We already model Organization,
  Person (AuthorAccount), and GeographicEntity. NERD's value was in NER tool integration,
  which is out of scope for our ontology.
- **Reuse recommendation**: **Skip**. Inactive, and schema.org covers entity types
  more comprehensively.

### 2.5 SIOC (Semantically-Interlinked Online Communities)

- **URL**: http://rdfs.org/sioc/spec/ / http://rdfs.org/sioc/ns#
- **Format**: OWL
- **License**: W3C Member Submission (open)
- **Maintained**: Stable but not actively developed (last update ~2018). Still
  widely referenced in social web research.
- **Coverage**: Models online community structures: `sioc:UserAccount`,
  `sioc:Post`, `sioc:Forum`, `sioc:Site`, `sioc:Thread`, `sioc:Community`.
  Properties for `sioc:has_creator`, `sioc:has_container`, `sioc:reply_of`,
  `sioc:content`, `sioc:num_replies`.
- **Relevance to our pre-glossary**:

  | SIOC Term          | Our Term    | Fit |
  |--------------------|-------------|-----|
  | `sioc:Post`        | `Post`      | Good match for social media posts |
  | `sioc:UserAccount` | `AuthorAccount` | Good match for Bluesky accounts |
  | `sioc:Forum`       | `Feed`      | Partial (a Bluesky feed is like a forum) |
  | `sioc:Site`        | (no match)  | Could model Bluesky platform |
  | `sioc:has_creator` | `postedBy`  | Direct equivalent |

- **Reuse recommendation**: **Reference / align via SSSOM**. SIOC is the most
  semantically precise vocabulary for our social media layer (Post, AuthorAccount, Feed).
  However:
  - It is relatively niche and not as widely adopted as schema.org
  - schema.org `SocialMediaPosting` now covers similar ground
  - Importing SIOC would add a dependency for marginal benefit
  - Best approach: declare `owl:equivalentClass` from `enews:Post` to
    `sioc:Post`, `enews:AuthorAccount` to `sioc:UserAccount` in our ontology header.
    This is lightweight and adds interoperability at zero import cost.

---

## 3. Standard Vocabularies (Direct Import / Heavy Reuse)

These are foundational vocabularies that should be directly used (imported or
referenced by prefix) in our ontology.

### 3.1 Dublin Core Terms (DCTerms)

- **URL**: https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
- **Namespace**: `http://purl.org/dc/terms/`
- **Format**: RDF/OWL
- **License**: CC BY 4.0
- **Maintained**: Yes (DCMI)
- **Relevance**: Standard metadata properties. Use directly for:

  | DCTerms Property    | Use in Our Ontology |
  |---------------------|---------------------|
  | `dcterms:title`     | Article title (alternative to minting `enews:title`) |
  | `dcterms:description` | Article description |
  | `dcterms:creator`   | Article/post creator |
  | `dcterms:publisher` | Article publisher |
  | `dcterms:date`      | Publication date |
  | `dcterms:subject`   | Topic assignment (broader than `coversTopic`) |
  | `dcterms:source`    | Link to original URL |
  | `dcterms:license`   | Ontology license |
  | `dcterms:created`   | Ontology creation date |

- **Reuse recommendation**: **Direct use for ontology metadata; align for data
  properties**. Use DCTerms for ontology-level metadata (dcterms:creator,
  dcterms:license on the ontology IRI). For data properties on Article instances,
  we can either reuse dcterms:title directly or mint `enews:title` and declare
  `owl:equivalentProperty dcterms:title`. The latter gives us domain/range control.

### 3.2 SKOS (Simple Knowledge Organization System)

- **URL**: https://www.w3.org/2004/02/skos/
- **Namespace**: `http://www.w3.org/2004/02/skos/core#`
- **Format**: OWL
- **License**: W3C (open)
- **Maintained**: Yes (W3C standard)
- **Relevance**: Essential for our energy topic taxonomy annotations:

  | SKOS Property         | Use in Our Ontology |
  |-----------------------|---------------------|
  | `skos:prefLabel`      | Primary label for all terms |
  | `skos:altLabel`       | Alternative names (e.g., "PV" for Solar, "LNG" for NaturalGas) |
  | `skos:definition`     | Term definitions |
  | `skos:broader`        | Topic hierarchy (if modeling topics as SKOS Concepts) |
  | `skos:narrower`       | Inverse of broader |
  | `skos:notation`       | Short codes for topics |
  | `skos:exactMatch`     | Mapping to external vocabularies |
  | `skos:broadMatch`     | Coarser external match |
  | `skos:relatedMatch`   | Related external match |
  | `skos:scopeNote`      | Usage guidance for topics |

- **Reuse recommendation**: **Direct import (annotation properties)**. SKOS should
  be used throughout the ontology for labels, definitions, and cross-vocabulary
  mappings. Import `skos:` prefix and use annotation properties on all classes.
  For the energy topic taxonomy itself, the design choice was:
  - ~~**Option A**: Model topics as OWL classes with `rdfs:subClassOf` hierarchy~~
    (superseded)
  - **Option B (adopted)**: Model topics as `skos:Concept` instances in a
    `skos:ConceptScheme`, simultaneously typed as instances of `enews:EnergyTopic`
  - **Decision**: Option B was adopted per DD-001 in `conceptual-model.yaml`.
    Topics are named individuals with `skos:broader`/`skos:narrower` hierarchy.
    SKOS annotation properties (`skos:prefLabel`, `skos:definition`,
    `skos:altLabel`) are used on the topic individuals. This follows W3C SKOS
    guidance, IPTC NewsCodes practice, and avoids class-as-instance punning.

### 3.3 RDFS / OWL Standard Vocabulary

- **Namespace**: `http://www.w3.org/2000/01/rdf-schema#` /
  `http://www.w3.org/2002/07/owl#`
- **Relevance**: Foundation. Use `rdfs:label`, `rdfs:comment`, `rdfs:subClassOf`,
  `owl:equivalentClass`, `owl:equivalentProperty`, `owl:ObjectProperty`,
  `owl:DatatypeProperty`, etc.
- **Reuse recommendation**: **Direct use** (implicit -- every OWL 2 ontology
  uses these).

### 3.4 PROV-O (Provenance Ontology)

- **URL**: https://www.w3.org/TR/prov-o/
- **Namespace**: `http://www.w3.org/ns/prov#`
- **Format**: OWL
- **License**: W3C (open)
- **Maintained**: Yes (W3C Recommendation)
- **Relevance**: Could model provenance chains: Article was published by
  Publication, shared via Post by AuthorAccount, collected from Feed. However, this
  adds complexity beyond our lightweight scope.
- **Reuse recommendation**: **Skip for v1; consider for future**. Our simple
  `publishedBy`, `postedBy`, `sharesArticle` properties handle the provenance
  chain without PROV-O's formal Agent/Activity/Entity model. If provenance
  auditing becomes a requirement, PROV-O would be the standard to align with.

### 3.5 FOAF (Friend of a Friend)

- **URL**: http://xmlns.com/foaf/0.1/
- **Format**: RDF/OWL
- **License**: Open
- **Maintained**: Stable but effectively frozen (last update 2014). Widely deployed.
- **Relevance**: `foaf:Person`, `foaf:Organization`, `foaf:OnlineAccount`,
  `foaf:Document`, `foaf:name`, `foaf:homepage`. Historically the go-to for
  modeling people and organizations in RDF.
- **Reuse recommendation**: **Skip in favor of schema.org**. FOAF's classes are
  subsumed by schema.org equivalents, and schema.org has much wider current
  adoption. If we were building for a pure Linked Data audience, FOAF alignment
  might be worth declaring, but for our use case schema.org is the better target.

---

## 4. LOV (Linked Open Vocabularies) Survey

LOV (https://lov.linkeddata.es) indexes RDF vocabularies. Based on LOV catalog
coverage:

### Energy Domain on LOV
- **No dedicated energy industry ontology** in LOV catalog
- `sweet:` (SWEET) is indexed -- see Section 1.1
- Several building/smart-home energy vocabularies exist (SAREF4ENER, PowerOnt,
  OpenADR) but these model energy consumption/demand-response, not news topics
- `dogont:` (DogOnt) models smart environments -- irrelevant

### News/Media Domain on LOV
- `schema:` -- indexed, see Section 2.1
- `sioc:` -- indexed, see Section 2.5
- `dcterms:` -- indexed, see Section 3.1
- `foaf:` -- indexed, see Section 3.5
- `bibo:` (Bibliographic Ontology) -- models scholarly publications, not news
- `po:` (BBC Programmes) -- broadcast media, not news articles
- `nif:` (NLP Interchange Format) -- NLP annotations, not content modeling

### LOV Assessment
LOV confirms our finding: the schema.org + DCTerms + SKOS stack is the
best-supported vocabulary combination for news content modeling in the Linked
Data ecosystem. No energy-specific news vocabulary exists on LOV.

---

## 5. Recommended Reuse Strategy

### Tier 1: Direct Use (import prefix, use properties directly)

| Vocabulary | Prefix       | What to Use |
|------------|--------------|-------------|
| RDFS       | `rdfs:`      | `label`, `comment`, `subClassOf`, `range`, `domain` |
| OWL        | `owl:`       | `Class`, `ObjectProperty`, `DatatypeProperty`, `equivalentClass` |
| SKOS       | `skos:`      | `prefLabel`, `altLabel`, `definition`, `scopeNote`, `notation` |
| XSD        | `xsd:`       | `string`, `dateTime`, `anyURI`, `integer` |
| DCTerms    | `dcterms:`   | `title`, `description`, `creator`, `license`, `created` (ontology metadata) |

### Tier 2: Alignment via Equivalence Axioms (no import; declare mappings in header)

| External Type/Property           | Our Term              | Axiom |
|----------------------------------|-----------------------|-------|
| `schema:NewsArticle`             | `enews:Article`       | `owl:equivalentClass` or `rdfs:subClassOf` |
| `schema:Organization`            | `enews:Organization`  | `owl:equivalentClass` |
| `schema:NewsMediaOrganization`   | `enews:Publication`   | `rdfs:subClassOf` (our Publication is narrower) |
| `schema:SocialMediaPosting`      | `enews:Post`          | `owl:equivalentClass` |
| `schema:Person`                  | `enews:AuthorAccount`  | `skos:relatedMatch` (account, not person) |
| `schema:Place`                   | `enews:GeographicEntity` | `rdfs:subClassOf` |
| `schema:about`                   | `enews:coversTopic`   | `owl:equivalentProperty` |
| `schema:publisher`               | `enews:publishedBy`   | `owl:equivalentProperty` |
| `schema:author`                  | `enews:postedBy`      | `rdfs:subPropertyOf` |
| `schema:headline`                | `enews:title`         | `owl:equivalentProperty` |
| `schema:datePublished`           | `enews:publishedDate` | `owl:equivalentProperty` |
| `schema:url`                     | `enews:url`           | `owl:equivalentProperty` |
| `sioc:Post`                      | `enews:Post`          | `owl:equivalentClass` |
| `sioc:UserAccount`               | `enews:AuthorAccount`  | `owl:equivalentClass` |

### Tier 3: SSSOM Mapping File (external cross-references, not in OWL file)

| Our Term         | External Term               | Predicate          | Store In |
|------------------|-----------------------------|--------------------|----------|
| `enews:Solar`    | `iptc:medtop/20000448`      | `skos:narrowMatch` | SSSOM    |
| `enews:Wind`     | `iptc:medtop/20000451`      | `skos:narrowMatch` | SSSOM    |
| `enews:Nuclear`  | `iptc:medtop/20000444`      | `skos:narrowMatch` | SSSOM    |
| `enews:Oil`      | `iptc:medtop/20000443`      | `skos:narrowMatch` | SSSOM    |
| `enews:NaturalGas`| `iptc:medtop/20000441`     | `skos:narrowMatch` | SSSOM    |
| `enews:Renewable`| `iptc:medtop/20000445`      | `skos:exactMatch`  | SSSOM    |
| `enews:Fossil`   | `iptc:medtop/20000440`      | `skos:exactMatch`  | SSSOM    |
| `enews:Solar`    | `sweet:SolarRadiation`      | `skos:relatedMatch`| SSSOM    |
| `enews:Wind`     | `sweet:Wind`                | `skos:relatedMatch`| SSSOM    |
| Various orgs     | Wikidata QIDs               | `skos:exactMatch`  | SSSOM    |
| Various geos     | GeoNames URIs               | `skos:exactMatch`  | SSSOM    |

### Tier 4: Skip (evaluated but not worth the dependency)

| Vocabulary       | Reason |
|------------------|--------|
| SWEET (import)   | Too large, wrong abstraction level |
| ENVO (import)    | OBO-oriented, heavy BFO, wrong granularity |
| BBC Ontologies   | Unmaintained, BBC-specific |
| NERD             | Inactive, subsumed by schema.org |
| FOAF             | Superseded by schema.org for our purposes |
| PROV-O           | Overkill for v1; revisit if provenance auditing needed |
| BIBO             | Scholarly publications, not news media |
| IEC CDD          | Restricted license, engineering-level granularity |
| SAREF4ENER       | Smart energy/IoT, not news topics |

---

## 6. Prefix Block for Ontology Header

Based on this analysis, the ontology should declare these prefixes:

```turtle
@prefix enews:   <http://example.org/ontology/energy-news#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix schema:  <https://schema.org/> .
@prefix sioc:    <http://rdfs.org/sioc/ns#> .
```

---

## 7. Gap Analysis

### What reuse covers

- **News/media entity modeling**: Fully covered by schema.org alignment (Article,
  Organization, Person, SocialMediaPosting, Place). We get interoperability with
  the entire schema.org ecosystem (Google Knowledge Graph, news aggregators, etc.)
  at near-zero cost.
- **Standard metadata properties**: Fully covered by DCTerms + SKOS + RDFS.
- **Social media modeling**: Covered by schema.org SocialMediaPosting + SIOC
  alignment.

### What we must build from scratch

- **Energy topic taxonomy** (~55 SKOS concept individuals): No existing ontology
  provides a curated, news-oriented energy topic hierarchy at our granularity.
  This is the core intellectual contribution of the ontology. Built as named
  individuals of `enews:EnergyTopic` within a `skos:ConceptScheme`, with
  `skos:broader`/`skos:narrower` hierarchy and rich SKOS annotations
  (`skos:prefLabel`, `skos:definition`, `skos:altLabel` for acronyms like
  SMR, PPA, CCUS, etc.).
- **Energy news-specific properties**: `coversTopic`, `sharesArticle`,
  `mentionsOrganization`, `hasGeographicFocus` -- these are domain-specific
  composites that no existing vocabulary provides at the right granularity.
  Align to schema.org equivalents where possible.
- **Bluesky-specific modeling**: `Feed`, `handle` property, Bluesky-specific
  metadata -- no existing vocabulary models Bluesky specifically (it is too new).

### What IPTC NewsCodes adds (optional enrichment)

- An industry-standard topic classification that news organizations already use
- Cross-walk mappings enable our energy topic taxonomy to interoperate with
  mainstream news classification systems
- Worth creating an SSSOM mapping file, but not an ontology dependency

---

## 8. Action Items

1. **Formalize prefix declarations** in ontology header (Section 6)
2. **Draft alignment axioms** for schema.org types (Tier 2 table) as part of
   ontology formalization
3. **Create SSSOM mapping file** `mappings/enews-to-external.sssom.tsv` with
   IPTC, SWEET, Wikidata, and GeoNames mappings (Tier 3 table)
4. **Build energy topic taxonomy** from scratch -- this is the primary creative
   work; no adequate reuse source exists
5. **Use SKOS annotation properties** on all OWL classes from the start
   (`skos:prefLabel`, `skos:definition`, `skos:altLabel`)
6. **Verify IPTC MediaTopic codes** -- confirm exact IPTC `medtop` URIs before
   committing SSSOM mappings (codes cited above are from training data and should
   be verified against the live IPTC NewsCodes CV at https://cv.iptc.org/newscodes/mediatopic/)

---

## 9. Scope Limitations

The following scout outputs were intentionally omitted as they are not
applicable to this lightweight ontology:

- **ROBOT extract module**: Not needed. The ontology does not import any
  external OWL modules. All reuse is via alignment axioms (owl:equivalentClass,
  rdfs:subClassOf) declared in the ontology header, not via owl:imports.
  ROBOT extract is designed for extracting subsets from large imported
  ontologies, which does not apply here.

- **Ontology Design Pattern (ODP) recommendations**: Not needed for this
  ontology. The design uses standard OWL + SKOS patterns (concept scheme
  for topic taxonomy, simple object/datatype properties for media entities).
  No complex reification, n-ary relations, or role patterns are required
  by the CQs.

- **Weighted reuse scorecard**: Omitted because all reuse is at the alignment
  level (Tier 2: equivalence axioms, Tier 3: SSSOM mappings). No modules
  are imported, so there is nothing to score on coverage, maintenance,
  license compatibility, or integration complexity dimensions.

---

## Methodology Note

This report was compiled from expert knowledge of the ontology landscape as of
early 2025. External network access was unavailable during compilation, so specific
version numbers, last-commit dates, and exact IPTC media topic codes should be
verified against live sources before being committed to SSSOM mapping files. The
assessments of schema.org, DCTerms, SKOS, SIOC, SWEET, ENVO, OBO Foundry, IPTC,
BBC Ontologies, FOAF, PROV-O, and LOV catalog coverage are based on well-established
knowledge of these vocabularies and their current status in the Semantic Web
ecosystem.
