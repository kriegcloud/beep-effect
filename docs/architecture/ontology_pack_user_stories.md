# Ontology Pack Architecture - User Stories & Design Decisions

**Date**: 2025-12-23
**Status**: Draft - Refining Requirements

---

## Summary

This document captures user stories, open questions, and emerging design decisions for the ontology pack architecture. The goal is to formalize a layered pack system that supports reusable core vocabularies, domain-specific extensions, and user-driven canonicalization.

---

## Key Insights (From Discussion)

1. **Entity store is first-class** - Entities are a primary data model, not derived from claims
2. **Mentions are queryable** - "Show me mentions of Katie Wilson where X is true" via SPARQL
3. **Entities improve extraction** - Canonical entities feed back into future extraction tasks
4. **Wikidata = page link only** - Not full Wikidata modeling, just external link for now
5. **GovernmentOfficial is Seattle-specific** - Confirms core vs domain separation
6. **Ontology maintains consistency** - Strong core modeling, not just claims

---

## User Stories

### US-1: Entity Canonicalization (Click-to-Link)

**As a** user viewing extracted entities in the timeline UI,
**I want to** click on an entity and canonicalize it (optionally linking to Wikidata),
**So that** future extractions recognize this entity consistently.

**Acceptance Criteria:**
- [ ] User can click an entity mention in the UI
- [ ] UI presents canonicalization options (create local canonical, link to Wikidata, link to existing local)
- [ ] Canonicalization is stored in the namespace's ontology (not just runtime)
- [ ] Future extractions use the canonical form

**Open Questions:**
- Where is the canonical mapping stored? (ABox in domain pack? Separate "entity registry"?)
- How does this interact with automated entity resolution?
- What's the UX for merging two entities that were initially separate?

---

### US-2: Reusable Domain Packs

**As a** developer building a knowledge graph for a new city,
**I want to** reuse the Seattle pack structure for another domain,
**So that** I don't reinvent common patterns.

**Acceptance Criteria:**
- [ ] Seattle pack contains only Seattle-specific classes/properties
- [ ] Core vocabularies (people, places, orgs) are imported, not duplicated
- [ ] Domain pack can be instantiated for "Portland", "Denver", etc.
- [ ] Seed data (org structures) is clearly separated from ontology definitions

**Open Questions:**
- What is the boundary between core and domain?
- How are domain-specific inference rules managed?
- How do we handle domain-specific SHACL shapes vs core shapes?

---

### US-3: Universal Entity Types (Core Packs)

**As a** system processing text from any domain,
**I want** universal entity recognition for people, places, organizations, dates,
**So that** basic entity extraction works before domain-specific ontology is loaded.

**Acceptance Criteria:**
- [ ] Core packs exist for: Person, Place, Organization, TemporalEntity
- [ ] Core packs import standard vocabularies (FOAF, Schema.org, OWL-Time, W3C ORG)
- [ ] Core packs provide base SHACL shapes for universal validation
- [ ] Domain packs extend (not replace) core types

**Open Questions:**
- What goes in core vs what's domain-specific? (e.g., is "Government Official" core or domain?)
- How granular should core packs be? (One big core? Separate person/place/org packs?)
- How do core packs version independently from domain packs?

---

### US-4: Entity Resolution Over Time

**As a** user viewing the timeline,
**I want to** see how an entity's identity evolved (same person, different roles),
**So that** I can understand career progressions and organizational changes.

**Acceptance Criteria:**
- [ ] Entity identity is stable across role changes
- [ ] Historical role memberships are preserved with temporal bounds
- [ ] Entity merges/splits are tracked with provenance
- [ ] "What position did X hold on date Y?" queries work

**Open Questions:**
- Is temporal identity handled at the entity level or claim level?
- How do we represent "Tim Burgess the councilmember" vs "Tim Burgess the deputy mayor" as the same person?
- What's the relationship between entity identity and claim validity periods?

---

### US-5: Claims vs Triples (Data Model)

**As a** developer building queries,
**I want** clarity on whether claims or triples are the primary data model,
**So that** I know how to write queries and understand data flow.

**Current State:**
- `claims.ttl` defines reified claims with ranks, temporal validity, provenance
- Extraction pipeline produces entities/relations (not explicitly claims)
- Unclear if triples are materialized from claims or claims are metadata on triples

**Options Under Consideration:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Claim-First** | Claims are primary; triples materialized as views | Full provenance, temporal queries, corrections | Query complexity, storage overhead |
| **Triple-First** | Triples primary; claims optional metadata | Simple queries, standard tooling | Provenance harder, corrections messy |
| **Hybrid** | Both coexist; claims for extracted, triples for curated | Flexibility | Two mental models, sync complexity |

**Open Questions:**
- Does the timeline UX need claim-level granularity or entity-level?
- How important is "what did we believe at time T?" vs simpler correction history?
- What's the query pattern for 80% of use cases?

---

### US-6: Entity Mentions in Articles

**As a** user viewing an article,
**I want to** see highlighted entity mentions linked to canonical entities,
**So that** I can understand who/what the article is about and navigate to entity details.

**As a** analyst,
**I want to** query mentions ("articles mentioning Katie Wilson where budget > $1M"),
**So that** I can find relevant documents based on entity co-occurrence and context.

**Acceptance Criteria:**
- [ ] Article view highlights entity mentions
- [ ] Mentions link to canonical entity (or unresolved entity)
- [ ] Mention metadata includes: text span, confidence, context
- [ ] SPARQL can query mentions with filters on co-occurring entities/claims
- [ ] Canonical entities inform future extraction (feedback loop)

**Data Model Questions:**
- Is a Mention a first-class type or a property on Evidence?
- What's the relationship: `Mention -> Entity` and `Claim -> Evidence -> Mention`?
- Should Mention store character offsets (like W3C Web Annotation)?

---

### US-7: Entities Improve Extraction (Feedback Loop)

**As a** extraction pipeline,
**I want** access to canonical entities during extraction,
**So that** I can recognize known entities and link to them rather than creating duplicates.

**Acceptance Criteria:**
- [ ] Extraction pipeline loads entity registry before processing
- [ ] Known entity names/aliases are used for NER boosting
- [ ] Extracted mentions are matched to canonical entities by similarity
- [ ] Unmatched mentions create candidate entities for review

**Open Questions:**
- Is entity matching done at extraction time or post-processing?
- How do embeddings fit in? (Entity embeddings for similarity?)
- What's the human-in-the-loop for confirming new entities?

---

### US-8: SHACL Validation Strategy

**As a** pipeline operator,
**I want** SHACL validation at appropriate pipeline stages,
**So that** bad data is caught early without blocking valid open-world scenarios.

**Acceptance Criteria:**
- [ ] Core shapes validate universal entity types
- [ ] Domain shapes validate domain-specific constraints
- [ ] Extraction-time validation catches structural errors
- [ ] Storage-time validation enforces completeness
- [ ] Validation profiles are versioned with packs

**Open Questions:**
- Should SHACL run before or after reasoning?
- How do we handle "incomplete but valid" vs "invalid" distinctions?
- Are shapes part of the pack or separate?
- How do we version shapes alongside ontology changes?

---

### US-9: Agentic Ontology Refinement

**As a** domain expert using the extraction system,
**I want** LLM agents to propose ontology refinements (new examples, disambiguation notes, extraction hints) based on extraction errors and gaps,
**So that** the ontology improves over time without requiring deep ontology expertise.

**Acceptance Criteria:**
- [ ] Agents can identify extraction errors and cluster them by pattern
- [ ] Agents can propose new few-shot examples for problematic predicates
- [ ] Agents can propose disambiguation notes when confusion patterns emerge
- [ ] All proposals require human approval before being added to the pack
- [ ] Approved refinements are versioned with the ontology pack

**Open Questions:**
- What triggers a refinement proposal? (Error threshold? Human request? Scheduled review?)
- How are proposals staged for review? (Separate branch? Staging graph?)
- How do we prevent drift from core patterns when domains add many refinements?

---

## Emerging Architecture

### Pack Hierarchy (Draft)

```
core/
├── claims/           # Reified claims, ranks, evidence, provenance
│   ├── claims.ttl
│   └── shapes/claims-shapes.ttl
├── entity/           # Universal entity types
│   ├── person.ttl    # Imports FOAF
│   ├── place.ttl     # Imports Schema.org/Place
│   ├── org.ttl       # Imports W3C ORG
│   └── shapes/
├── temporal/         # OWL-Time patterns, validity periods
│   ├── temporal.ttl
│   └── shapes/
└── provenance/       # PROV-O patterns, extraction metadata
    ├── provenance.ttl
    └── shapes/

domain/
├── seattle/          # Seattle-specific
│   ├── seattle.ttl   # TBox only (imports core/*)
│   ├── shapes/       # Domain-specific shapes
│   ├── rules/        # Inference rules
│   └── seed-data/    # ABox seed data
├── portland/         # Another city (same structure)
└── ...

user/
└── {namespace}/      # User-contributed canonicalizations
    ├── entities.ttl  # Canonical entity definitions
    └── alignments.ttl # Links to Wikidata, etc.
```

### Key Design Decisions (Pending)

| Decision | Options | Current Leaning | Needs Research |
|----------|---------|-----------------|----------------|
| Claim vs Triple primary | Claim-first, Triple-first, Hybrid | Unclear | Yes |
| Core pack granularity | Monolithic, Per-type, Per-concern | Per-concern | Yes |
| SHACL timing | Pre-reasoning, Post-reasoning, Both | Both (profiles) | Yes |
| Entity registry location | In domain pack, Separate store, User namespace | User namespace | Yes |
| Inference rules location | In domain pack, Separate rules pack | Domain pack | Maybe |

---

## Questions for User (Next Session)

### Entity Canonicalization (US-1)
1. When you click to canonicalize, what happens if the entity already exists with a different name? (Merge UI?)
2. Should canonicalization propagate to historical extractions or only future ones?
3. Is Wikidata the only external authority, or also VIAF, ORCID, etc.?

### Core Packs (US-3)
4. Should "GovernmentOfficial" be a core type or Seattle-specific?
5. Do you want separate imports for person/place/org or one unified core?
6. How should core pack versions be pinned in domain packs?

### Claims Model (US-5)
7. What's a concrete query you need that would help decide claim-first vs triple-first?
8. Is "show me what we believed on Dec 1st" a real use case or theoretical?
9. How often do corrections happen? (Rare edge case vs core workflow)

### SHACL (US-6)
10. What validation errors are you seeing today that shapes would catch?
11. Do you need different validation strictness for extraction vs storage?
12. Should shapes block bad data or just flag warnings?

---

## Comparable Systems & Inspiration

### Entity Linking / Annotation UIs

| System | Key Pattern | Relevance |
|--------|-------------|-----------|
| **[Ontotext Metadata Studio](https://www.ontotext.com/company/news/ontotext-metadata-studio-3-7-adds-further-usability-enhancements-to-forms-workflow/)** | CEEL tags People/Orgs/Locations to Wikidata; refined UI showing annotation density per section | Click-to-link UX, Wikidata integration |
| **[DrNote](https://github.com/frankkramer-lab/DrNote)** | Open tagging tool for text annotation + entity linking via OpenTapioca/Wikidata; web UI + API | OSS reference for annotation interface |
| **[Entity-fishing (DARIAH)](https://inria.hal.science/hal-01812100v2/document)** | Entity extraction + disambiguation against Wikipedia/Wikidata; REST API + web interface | Multi-language, PDF support |
| **[Wikidata Annotation Tool](https://www.mediawiki.org/wiki/Wikidata_annotation_tool)** | Browser plugin for highlighting text → composing triples (subject/predicate/object) with Wikidata suggestions | Triple composition UX pattern |

### News Knowledge Graphs

| System | Key Pattern | Relevance |
|--------|-------------|-----------|
| **[BBC Juicer / News Labs](https://source.opennews.org/articles/linked-data-bbc/)** | Auto semantic annotation of BBC articles; 650K+ articles, 150K+ tags; DBpedia linking; SPARQL API; user can add tags | Mentions, tagging, SPARQL queries |
| **[BBC Storyline Ontology](https://medium.com/@jeremytarling/storylines-as-data-in-bbc-news-bd92c25cba6b)** | Knowledge graph of storylines + topics + content associations; journalists query semantic DB for context on new stories | Storyline-centric navigation |
| **[BBC Dynamic Semantic Publishing](https://www.ontotext.com/knowledgehub/case-studies/bbc-boosted-efficiency-reduced-cost-using-semantic-publishing-to-power-the-fifa-world-cup-web-site/)** | "Edited by exception" - journalists set rules, system auto-aggregates; RDF semantics for content reuse | Ontology-driven automation |
| **[Diffbot Knowledge Graph](https://www.diffbot.com/products/knowledge-graph/)** | 10B+ entities, 1T+ facts from web crawl; links articles to mentioned entities; partnerships with FactMata/European Journalism Centre | Large-scale entity linking |

### Enterprise Knowledge Graphs

| System | Key Pattern | Relevance |
|--------|-------------|-----------|
| **[Palantir Foundry Entity Resolution](https://www.palantir.com/foundry-entity-resolution/)** | AI-powered record linking + deduplication; Ontology deeply integrated into analysis tools (Object Explorer, Quiver) | Enterprise ER patterns |
| **[Palantir Ontology](https://www.palantir.com/platforms/foundry/foundry-ontology/)** | Encapsulates domain knowledge in structured format; enables inference, pattern recognition, prediction | Ontology-as-product |

### Key Patterns to Adopt

1. **Mentions as First-Class** (BBC Juicer, Diffbot)
   - Articles linked to entities via mentions
   - Queryable: "articles mentioning X where Y"
   - User can add/correct tags

2. **Click-to-Link UX** (Ontotext, DrNote, Wikidata Annotation Tool)
   - Highlight text → suggest entity matches
   - Options: create new, link existing, link external (Wikidata)
   - Store as structured annotation (W3C Web Annotation pattern)

3. **Ontology-Driven Automation** (BBC DSP)
   - Rules define aggregation, journalists edit exceptions
   - Reduces manual curation overhead

4. **Entity Resolution as Service** (Palantir, Diffbot)
   - Separate ER pipeline from extraction
   - Canonical entities inform future extraction
   - Human-in-the-loop for ambiguous cases

5. **SPARQL + REST API** (BBC Juicer, Entity-fishing)
   - Power users query via SPARQL
   - Applications consume via REST
   - Both access same knowledge graph

---

## Research Needed

Based on these user stories, the following research questions are most urgent:

### High Priority
1. **Ontology modularization best practices** - How do OBO Foundry, Schema.org, and enterprise KGs structure reusable packs?
2. **Entity registry patterns** - How do systems like Wikidata, YAGO, and DBpedia manage canonical entity definitions?
3. **SHACL profiles** - What's the state of the art for validation profiles (extraction-time vs storage-time)?

### Medium Priority
4. **Claim-first architectures** - What systems use reified claims as primary model? (Wikidata, Freebase, others?)
5. **Temporal entity identity** - How do KGs handle "same entity, different roles over time"?

### Lower Priority
6. **User-contributed canonicalization** - What UX patterns exist for human-in-the-loop entity linking?
7. **Pack versioning** - How do multi-pack systems handle version dependencies?

### Ontology as Behavioral Program (New)
8. **Extraction annotation vocabularies** - What annotation schemes exist for embedding extraction guidance in ontologies? (SKOS notes? Custom predicates? OWL annotation properties?)
9. **Few-shot example structure** - How should few-shot examples be structured in RDF for retrieval and prompt injection?
10. **LLM-proposed ontology changes** - What patterns exist for LLM-proposed ontology refinements with human-in-the-loop approval?
11. **Predicate hierarchy for LLM grounding** - How do foundational ontologies (DOLCE, UFO, BFO) model events/actions, and how does hierarchy help LLM grounding?
12. **Ontology verbalization** - What verbalization patterns improve LLM understanding for both extraction and query generation?
13. **Neuro-symbolic predicate selection** - How do neuro-symbolic systems handle predicate selection during extraction?
14. **Core/domain query abstraction** - How do multi-layer ontology architectures handle query rewriting across abstraction levels?

---

## Emerging Architecture (Refined)

Based on user stories + comparable systems + ontology research, here's a refined pack architecture:

### Three-Layer Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
│  - Canonical entity definitions (user-curated)                  │
│  - External links (Wikidata page links)                         │
│  - Namespace: {domain}/entities/                                │
└─────────────────────────────────────────────────────────────────┘
                              ↑ extends
┌─────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                              │
│  - Domain-specific classes (GovernmentOfficial, CouncilVote)    │
│  - Domain SHACL shapes                                          │
│  - Domain inference rules                                       │
│  - Seed data (org structure, posts)                             │
│  - Namespace: seattle/, portland/, etc.                         │
└─────────────────────────────────────────────────────────────────┘
                              ↑ imports
┌─────────────────────────────────────────────────────────────────┐
│                        CORE LAYER                               │
│  - Universal types: Person, Place, Organization, Event          │
│  - Claims vocabulary: Claim, Evidence, Rank                     │
│  - Temporal: validFrom, assertedAt, eventTime                   │
│  - Mentions: Mention, mentionOf, textSpan                       │
│  - Provenance: PROV-O patterns                                  │
│  - Core SHACL shapes                                            │
│  - Namespace: core/                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↑ imports
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL LAYER                             │
│  - FOAF, W3C ORG, OWL-Time, PROV-O, SKOS, OA                   │
│  - Pinned versions, bundled for reproducibility                 │
│  - Namespace: external vocabs (unchanged)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Core Pack Contents (Proposed)

```
core/
├── person/
│   ├── person.ttl          # core:Person rdfs:subClassOf foaf:Person
│   └── shapes.ttl          # PersonShape (name required, aliases optional)
├── place/
│   ├── place.ttl           # core:Place, core:Location
│   └── shapes.ttl
├── organization/
│   ├── organization.ttl    # core:Organization rdfs:subClassOf org:Organization
│   └── shapes.ttl
├── claims/
│   ├── claims.ttl          # Claim, Evidence, Rank, temporal properties
│   └── shapes.ttl          # ClaimShape, EvidenceShape
├── mentions/
│   ├── mentions.ttl        # Mention rdfs:subClassOf oa:Annotation
│   │                       # mentionOf → Entity, textSpan, confidence
│   └── shapes.ttl          # MentionShape (source, offset required)
├── temporal/
│   ├── temporal.ttl        # Patterns for validFrom, assertedAt, eventTime
│   └── shapes.ttl
└── provenance/
    ├── provenance.ttl      # ExtractionActivity, CurationActivity
    └── shapes.ttl
```

### Entity Model (Draft)

```turtle
# Core entity type - all domain entities extend this
core:Entity a owl:Class ;
    rdfs:label "Entity"@en ;
    rdfs:comment "Base class for all canonical entities in the knowledge graph."@en .

# Canonical entity properties
core:canonicalName a owl:DatatypeProperty ;
    rdfs:domain core:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "The preferred display name for this entity."@en .

core:alias a owl:DatatypeProperty ;
    rdfs:domain core:Entity ;
    rdfs:range xsd:string ;
    rdfs:comment "Alternative names/spellings for this entity."@en .

core:externalLink a owl:ObjectProperty ;
    rdfs:domain core:Entity ;
    rdfs:range rdfs:Resource ;
    rdfs:comment "Link to external authority (Wikidata page, VIAF, etc.)."@en .

# Example: Wikidata link (not owl:sameAs, just a page link)
seattle:TimBurgess a core:Person, seattle:GovernmentOfficial ;
    core:canonicalName "Tim Burgess" ;
    core:alias "Timothy Burgess" ;
    core:externalLink <https://www.wikidata.org/wiki/Q7803942> .
```

### Mention Model (Draft)

```turtle
# Mention as W3C Web Annotation
core:Mention a owl:Class ;
    rdfs:subClassOf oa:Annotation ;
    rdfs:label "Mention"@en ;
    rdfs:comment "A reference to an entity within a document."@en .

core:mentionOf a owl:ObjectProperty ;
    rdfs:domain core:Mention ;
    rdfs:range core:Entity ;
    rdfs:comment "The canonical entity this mention refers to."@en .

core:mentionText a owl:DatatypeProperty ;
    rdfs:domain core:Mention ;
    rdfs:range xsd:string ;
    rdfs:comment "The exact text span of the mention."@en .

core:mentionConfidence a owl:DatatypeProperty ;
    rdfs:domain core:Mention ;
    rdfs:range xsd:double ;
    rdfs:comment "Confidence score for entity linking (0-1)."@en .

# Mention example
:mention_1 a core:Mention ;
    core:mentionOf seattle:TimBurgess ;
    core:mentionText "Tim Burgess" ;
    core:mentionConfidence 0.95 ;
    oa:hasSource :article_123 ;
    oa:hasSelector [
        a oa:TextPositionSelector ;
        oa:start 142 ;
        oa:end 153
    ] .
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Entity store** | First-class, separate from claims | Entities are stable identities; claims are assertions about them |
| **Mentions** | W3C Web Annotation pattern | Standard, supports text offsets, links to entities |
| **Wikidata links** | `core:externalLink` (not `owl:sameAs`) | Avoid sameAs explosion; just page link for now |
| **Core pack scope** | Person, Place, Org, Temporal, Claims, Mentions, Provenance | These have app infra built on them |
| **Domain pack scope** | GovernmentOfficial, Event types, Inference rules | Seattle-specific extensions |
| **SHACL** | Per-pack shapes, layered validation | Core shapes always apply; domain shapes add constraints |

---

## Ontology as Extraction & Agent Program

A key insight from design discussions: the ontology pack serves **two roles**:

1. **Schema** - defines what can be represented (classes, properties, constraints)
2. **Behavioral program** - guides how LLMs and agents interact with the domain

This is implemented via annotation properties on classes and predicates:

### Extraction Annotations

| Annotation | Purpose | Used by |
|------------|---------|---------|
| `core:extractionHint` | NL guidance for recognizing this predicate in text | Prompt construction |
| `core:fewShotExample` | Concrete text→triple examples | Few-shot prompt injection |
| `core:disambiguationNote` | Common confusions to avoid | Error prevention |
| `core:extractionComplexity` | simple/medium/high | Extraction strategy selection |

### Agent Behavior Annotations

| Annotation | Purpose | Used by |
|------------|---------|---------|
| `core:reasoningPattern` | How to chain inferences in this domain | Agent planning |
| `core:validationWorkflow` | Steps to verify extracted data | Quality assurance |
| `core:enrichmentStrategy` | How to augment sparse extractions | Data completion |
| `core:domainContext` | Background knowledge to inject | Prompt grounding |

### Example

```turtle
seattle:votedOn
    rdfs:subPropertyOf core:agentAction ;
    rdfs:label "voted on" ;

    # Extraction guidance
    core:extractionHint "Look for voting language: 'voted yes/no', 'cast a vote', 'the motion passed 7-2'" ;
    core:fewShotExample """
        Text: "Councilmember Wilson voted yes on the housing bill."
        → wilson votedOn housingBill ; voteValue "yes"
    """ ;
    core:disambiguationNote "Don't confuse with 'voiced support' (statement) or 'endorsed' (public stance)" ;
    core:extractionComplexity "medium" ;

    # Agent behavior
    core:validationWorkflow "Cross-reference with official council vote records" ;
    core:enrichmentStrategy "If vote value missing, check for 'unanimous' or vote count patterns" .
```

### Layer Responsibilities

| Layer | Schema responsibility | Behavioral responsibility |
|-------|----------------------|---------------------------|
| **Core** | Base types (Person, Event, Action) | Default extraction patterns, base prompts |
| **Domain** | Domain types (GovernmentOfficial, CouncilVote) | Domain-specific examples, disambiguation, workflows |
| **User** | Canonical entities, alignments | (Future) User-specific agent preferences |

### Agentic Refinement Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    Ontology Pack                            │
│  Schema + Extraction Hints + Agent Behaviors                │
└─────────────────────────────────────────────────────────────┘
        │                               ▲
        │ Load as context               │ Propose refinements
        ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                    LLM Agent                                │
│  1. Extract using ontology + hints                          │
│  2. Validate against SHACL                                  │
│  3. Identify gaps/errors                                    │
│  4. Propose: new examples, hints, disambiguation notes      │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              Human Review (required)                        │
│  Accept/reject/modify proposed refinements                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps / Questions to Refine

### For Mention Model
1. When user clicks an unlinked mention, what's the flow?
   - Show candidate matches from entity store?
   - Show Wikidata search results?
   - Allow creating new canonical entity?

2. Should mentions be stored in the same graph as entities/claims or separate?

3. How do mentions relate to claims? Is a Claim's evidence linked via mentions?
   ```
   Claim → hasEvidence → Evidence → derivedFromMention → Mention → mentionOf → Entity
   ```

### For Entity Store
4. How is the entity store populated initially?
   - From extraction (candidate entities)?
   - From Wikidata import?
   - Manual creation?

5. What triggers entity merge? (Two entities realized to be same)
   - User action in UI?
   - Automated similarity threshold?

### For Core Pack
6. Should `core:Person` be a subclass of `foaf:Person` or equivalent?
   - Subclass: allows adding core-specific properties
   - Equivalent: full FOAF compatibility

7. How do domain packs "register" with core?
   - `seattle:GovernmentOfficial rdfs:subClassOf core:Person`?
   - Or via SHACL target class?

### For Ontology-Driven Extraction
8. How does extraction use the entity store?
   - Load canonical names + aliases into NER?
   - Embed entities for similarity matching?
   - Both?

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-23 | Initial draft based on brainstorm session |
| 2025-12-23 | Added comparable systems research |
| 2025-12-23 | Added emerging architecture with core/domain/user layers |
| 2025-12-23 | Added US-9: Agentic Ontology Refinement |
| 2025-12-23 | Added "Ontology as Extraction & Agent Program" concept section |
| 2025-12-23 | Added research questions for behavioral ontology annotations |

