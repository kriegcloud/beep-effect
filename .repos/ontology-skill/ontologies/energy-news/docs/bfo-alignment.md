# BFO Alignment — Energy News Ontology

## Alignment Strategy

Per scope constraint: **"Minimal BFO alignment where natural; not forced."**

BFO (ISO 21838-2) is used as a reference frame. Starting with v0.1.0, all 8
domain classes have explicit `rdfs:subClassOf` axioms to their respective BFO
categories via MIREOT-style declarations (`imports/bfo-declarations.ttl`). This
declares only the 3 BFO classes directly referenced (Site, Object, GDC) without
importing all of BFO, keeping the ontology lightweight.

## Top-Level Class Alignment

### EnergyTopic (and all instances)

**BFO Category**: Information Content Entity (IAO:0000030)

**Rationale**: EnergyTopic is an owl:Class whose ~55 instances are SKOS Concepts
representing topical classification categories used to tag news articles. Each
instance (e.g., enews:Solar, enews:Wind) is an information content entity — a
concept definition that is about a real-world phenomenon. This aligns with
IAO:0000030 (information content entity), which is a subclass of Generically
Dependent Continuant (BFO:0000031).

The topic hierarchy is expressed via `skos:broader`/`skos:narrower` relationships
between individuals, not via `rdfs:subClassOf`. Articles link to topic instances
via the `coversTopic` object property.

### Article

**BFO Category**: Generically Dependent Continuant (BFO:0000031)

**Rationale**: An Article is an information content entity — a piece of
news content that can be concretized in multiple physical forms (web page,
PDF, cached copy). It depends on physical carriers for its existence but
can migrate between them. This aligns with the IAO:0000030 (information
content entity) pattern, which is a subclass of GDC.

**schema.org alignment**: `enews:Article rdfs:subClassOf schema:NewsArticle`

### Publication

**BFO Category**: Object (BFO:0000030)

**Rationale**: A Publication (e.g., Bloomberg, Reuters, Canary Media) is a
news media organization — a persistent entity with identity that survives
changes in staff and content. Per BFO 2020, organizations are modeled as
Objects (not Object Aggregates), since their identity persists through
membership changes.

**schema.org alignment**: `enews:Publication rdfs:subClassOf schema:NewsMediaOrganization`

### Post

**BFO Category**: Generically Dependent Continuant (BFO:0000031)

**Rationale**: A Bluesky Post is an information content entity — text and
metadata created by an author on the Bluesky platform. It is concretized
in the AT Protocol data store and potentially cached in multiple locations.

**schema.org alignment**: `enews:Post owl:equivalentClass schema:SocialMediaPosting`

### AuthorAccount

**BFO Category**: Generically Dependent Continuant (BFO:0000031)

**Rationale**: AuthorAccount (renamed from Author) represents a Bluesky
account (handle + profile), not a natural person. A Bluesky account is an
information entity — it exists in the AT Protocol identity system and
depends on infrastructure for its existence. One natural person may have
multiple AuthorAccount instances.

The `rdfs:subClassOf schema:Person` axiom has been removed because a social
media account is not a subclass of Person — it is an information artifact
about/operated by a person. Instead, we declare:
- `owl:equivalentClass sioc:UserAccount` (precise semantic match)
- `skos:relatedMatch schema:Person` (loose cross-vocabulary link)

**SIOC alignment**: `enews:AuthorAccount owl:equivalentClass sioc:UserAccount`

### Feed

**BFO Category**: Generically Dependent Continuant (BFO:0000031)

**Rationale**: A Bluesky Feed is a curated algorithm/configuration that
defines a collection of posts. It is an information artifact — a set of
rules concretized in the AT Protocol feed generator system.

### Organization

**BFO Category**: Object (BFO:0000030)

**Rationale**: Organizations mentioned in energy news (CATL, Tesla, FERC,
OPEC, etc.) are persistent entities with identity. Per BFO 2020, organizations
are Objects. Their identity persists through changes in membership, location,
and leadership.

**schema.org alignment**: `enews:Organization owl:equivalentClass schema:Organization`

### GeographicEntity

**BFO Category**: Site (BFO:0000029)

**Rationale**: Countries, regions, and states are immaterial entities that
serve as geographic containers. In BFO, a Site is a three-dimensional
immaterial entity bounded by material entities or fiat boundaries. Countries
and regions fit this category — they are bounded spaces, not material
objects themselves.

**schema.org alignment**: `enews:GeographicEntity rdfs:subClassOf schema:Place`

## Summary Table

| Class | BFO Category | BFO ID | Alignment Strength |
|-------|-------------|--------|-------------------|
| EnergyTopic (class) | ICE | IAO:0000030 | Natural (concept definitions) |
| EnergyTopic instances | ICE | IAO:0000030 | Natural (concept definitions) |
| Article | GDC | BFO:0000031 | Natural |
| Publication | Object | BFO:0000030 | Natural |
| Post | GDC | BFO:0000031 | Natural |
| AuthorAccount | GDC | BFO:0000031 | Natural (account, not person) |
| Feed | GDC | BFO:0000031 | Natural |
| Organization | Object | BFO:0000030 | Natural (per BFO 2020) |
| GeographicEntity | Site | BFO:0000029 | Natural |
