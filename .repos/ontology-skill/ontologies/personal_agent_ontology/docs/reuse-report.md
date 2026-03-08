# Reuse Report -- Personal Agent Ontology (PAO)

**Date**: 2026-02-18
**Phase**: Knowledge Acquisition (Pipeline A, Step 2)
**Input**: `scope.md`, `pre-glossary.csv` (33 classes, 35 properties, 8 individuals)

---

## 1. Baseline Reuse Decisions

These foundational vocabularies are included unless project-specific reasons exclude them:

| Vocabulary | Prefix | Decision | Rationale |
|-----------|--------|----------|-----------|
| Dublin Core Terms | `dcterms:` | **Use** | Metadata annotations (title, description, creator, license, modified) |
| SKOS | `skos:` | **Use** | Concept labels (definition, note, altLabel) for glossary |
| PROV-O | `prov:` | **Import** | Provenance backbone (see detailed evaluation below) |
| FOAF | `foaf:` | **Selective use** | Agent/Person hierarchy (see detailed evaluation) |

---

## 2. Registry Search Results

### 2.1 OLS (Ontology Lookup Service) Search

Searched all 33 pre-glossary class terms against OLS. Key findings:

| Term | OLS Hits | Relevant? | Best Match |
|------|----------|-----------|------------|
| Agent | 50+ | Low | NCIT:C1708 (biomedical), ICO:0000220 -- not our domain |
| Conversation | 50+ | Low | SNOMED terms -- clinical, not agent-interaction |
| Memory | 50+ | Low | GO:0007613 (biological memory), NCIT:C37992 |
| Episode | 50+ | Low | NCIT:C75539, SNOMED -- clinical episodes |
| Goal | 50+ | Low | SNOMED, NCIT -- healthcare goals |
| Plan | 50+ | Low | OBI:0000260 (experiment plan) -- closest but wrong domain |
| Action | 50+ | Low | NCIT:C25404, SNOMED -- too generic |
| Event | 50+ | Low | NCIT:C25499, EFO:0009629 |
| Session | 50+ | Low | NCIT:C67447 (computer session) -- closest |
| software agent | 50+ | Medium | Found "software agent role" -- but no standard AI agent ontology |
| episodic memory | 3 | Medium | NBO:0000187, EFO:0004333 -- neurobehavior, not engineering |
| semantic memory | 3 | Medium | NBO:0000186, SNOMED -- same |
| provenance | 50+ | High | NCIT:C43581, SEPIO:0000058, T4FS:0000309 |

**Conclusion**: OBO/OLS registries are dominated by biomedical ontologies. No
existing ontology in these registries covers our AI agent domain adequately.
The W3C standards and domain-specific ontologies identified in our research
phase are the correct reuse targets.

### 2.2 Web Search for Domain-Specific Ontologies

Six niche ontologies were investigated. See Section 4 for detailed findings.

---

## 3. Candidate Evaluation -- Primary Import Targets

### 3.1 PROV-O (W3C Provenance Ontology)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | High (65%) | Agent, Activity, Entity triad; Plan; Role; SoftwareAgent; delegation; derivation chains |
| **Quality** | Excellent | W3C Recommendation; 1,146 triples; 31 classes, 44 object properties, 6 datatype properties |
| **License** | W3C | Royalty-free W3C Recommendation |
| **Community** | Strong | W3C standard, widely adopted across domains |
| **BFO Alignment** | None native | Would need explicit alignment (prov:Agent -> BFO continuant; prov:Activity -> BFO process) |
| **Correctness** | Valid | Loads in rdflib without errors |
| **Modularization** | Yes | Core, qualified, inverse bundles available |
| **Metadata** | Complete | Full annotations, examples, editorial notes |

**PAO-Relevant Classes**: `Agent`, `SoftwareAgent`, `Person`, `Organization`,
`Activity`, `Entity`, `Plan`, `Role`, `Collection`, `Bundle`, `Delegation`,
`Association`, `Attribution`, `Derivation`, `Generation`, `Usage`,
`Communication`, `Revision`, `Influence`

**PAO-Relevant Properties**: `wasGeneratedBy`, `wasDerivedFrom`,
`wasAttributedTo`, `wasAssociatedWith`, `used`, `actedOnBehalfOf`,
`hadPlan`, `hadRole`, `wasRevisionOf`, `startedAtTime`, `endedAtTime`,
`atTime`, `qualifiedAssociation`, `qualifiedDerivation`

**CQ Probe Results**:
- CQ-014 (provenance chain): Fully answerable with `prov:wasGeneratedBy`, `prov:wasDerivedFrom`, `prov:wasAttributedTo`
- CQ-032 (derived items for deletion): Answerable with `prov:wasDerivedFrom+`
- CQ-036 (generator agent): Answerable with `prov:wasGeneratedBy` + `prov:wasAssociatedWith`

**Decision**: **IMPORT DIRECTLY** via `owl:imports`

---

### 3.2 OWL-Time (W3C Time Ontology)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | High (60%) | Instant, Interval, Duration; all 13 Allen interval relations; xsd:dateTime integration |
| **Quality** | Excellent | W3C Recommendation; 1,296 triples; 20 classes, 33 object properties, 25 datatype properties |
| **License** | CC BY 4.0 | Explicitly declared in ontology metadata |
| **Community** | Strong | W3C/OGC joint standard, actively maintained (updated 2020) |
| **BFO Alignment** | Partial | time:TemporalEntity aligns with BFO temporal region |
| **Correctness** | Valid | Loads in rdflib without errors |
| **Modularization** | Yes | Core temporal entities separate from calendar descriptions |
| **Metadata** | Complete | Full annotations with provenance |

**PAO-Relevant Classes**: `Instant`, `Interval`, `ProperInterval`, `Duration`,
`DurationDescription`, `TemporalEntity`, `DateTimeDescription`

**PAO-Relevant Properties**: `before`, `after`, `hasBeginning`, `hasEnd`,
`hasDuration`, `inXSDDateTimeStamp`, `inXSDDateTime`, all Allen relations
(`intervalBefore`, `intervalDuring`, `intervalOverlaps`, `intervalContains`,
`intervalMeets`, `intervalFinishes`, `intervalStarts`, etc.)

**CQ Probe Results**:
- CQ-021 (event A before B): Fully answerable with `time:before` or `time:intervalBefore`
- CQ-012 (episode temporal extent): Answerable with `time:hasBeginning`, `time:hasEnd`
- CQ-022 (temporal overlap): Answerable with `time:intervalOverlaps`

**Decision**: **IMPORT DIRECTLY** via `owl:imports`

---

### 3.3 ODRL 2.2 (Open Digital Rights Language)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Medium (40%) | Permission, Prohibition, Duty; Policy; Party; Constraint -- covers governance module well |
| **Quality** | Excellent | W3C Recommendation; 2,157 triples; 29 classes, 58 object properties |
| **License** | W3C | W3C Document License |
| **Community** | Strong | W3C standard, used in data governance and rights management |
| **BFO Alignment** | None | Would need explicit alignment |
| **Correctness** | Valid | Loads in rdflib without errors |
| **Modularization** | Yes | Core vocabulary separate from common vocabulary |
| **Metadata** | Complete | Full SKOS annotations |

**PAO-Relevant Classes**: `Policy`, `Permission`, `Prohibition`, `Duty`,
`Rule`, `Party`, `Asset`, `Constraint`, `LogicalConstraint`, `Action`,
`Agreement`, `Privacy`

**PAO-Relevant Properties**: `hasPermission`, `hasProhibition`, `hasDuty`,
`action`, `target`, `assignee`, `assigner`, `hasConstraint`,
`consentedParty`, `consentingParty`

**CQ Probe Results**:
- CQ-030 (permission policies): Partially answerable -- ODRL provides the policy structure; PAO needs to specialize for agent tool permissions
- CQ-031 (compliance check): ODRL provides the framework; compliance logic is application-level
- CQ-039 (policy violations): ODRL Prohibition class can model prohibited actions

**Decision**: **IMPORT DIRECTLY** via `owl:imports`. PAO will specialize ODRL
classes for agent-specific governance (e.g., `pao:ToolPermission rdfs:subClassOf odrl:Permission`).

---

### 3.4 FOAF (Friend of a Friend)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Low (15%) | Agent, Person, Group, Organization, OnlineAccount |
| **Quality** | Good | Mature vocabulary; 620 triples; 13 classes |
| **License** | CC-like | Not explicitly in RDF; Creative Commons on spec page |
| **Community** | Declining | Widely deployed but aging; no recent updates |
| **BFO Alignment** | None | Informal semantics |
| **Correctness** | Valid | Loads in rdflib without errors |
| **Modularization** | No | Single file |
| **Metadata** | Adequate | Labels and descriptions present |

**Overlap with PROV-O**: PROV-O already provides `Agent`, `Person`,
`Organization`, `SoftwareAgent` with stronger formal semantics. FOAF adds
`OnlineAccount`, `Group`, `knows`, and social properties.

**Decision**: **SELECTIVE REUSE**. Use `foaf:OnlineAccount` if needed for
user identity modeling. Prefer PROV-O for the agent hierarchy. Do not
import wholesale -- the dated properties (geekcode, myersBriggs, etc.)
add noise. If social relationships become important, consider `foaf:knows`.

---

### 3.5 Schema.org Actions

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Medium (30%) | 115 Action subtypes; good taxonomy for classifying agent actions |
| **Quality** | Good for web markup | 17,823 triples; uses rdfs:Class not owl:Class; loose domains/ranges |
| **License** | CC BY-SA 3.0 | Open license |
| **Community** | Very strong | Google/Bing/Yahoo consortium; ubiquitous on the web |
| **BFO Alignment** | None | Informal semantics, not designed for OWL reasoning |
| **Correctness** | N/A | Not OWL 2 DL -- uses Schema.org's own vocabulary conventions |
| **Modularization** | No | Monolithic vocabulary |
| **Metadata** | Variable | Labels and descriptions, no formal axioms |

**PAO-Relevant Action Types**: `CreateAction`, `DeleteAction`, `UpdateAction`,
`ReadAction`, `SearchAction`, `CommunicateAction`, `AskAction`, `ReplyAction`,
`InformAction`, `PlanAction`, `ScheduleAction`, `OrganizeAction`,
`AuthorizeAction`, `SendAction`, `ReceiveAction`, `ControlAction`,
`ActivateAction`, `DeactivateAction`, `AchieveAction`

**Decision**: **SSSOM ALIGNMENT ONLY**. Do not import -- schema.org's informal
semantics would weaken OWL reasoning. Instead, create SSSOM mappings between
PAO action classes and schema.org Action types for interoperability.

---

## 4. Candidate Evaluation -- Niche / Domain-Specific Ontologies

### 4.1 BDI Ontology ODP (arXiv:2511.17162, 2025)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Medium (25%) | Belief, Desire, Intention, Goal, Plan -- covers Module 5 concepts |
| **Quality** | Good | 547 axioms, 22 classes, 71 object properties, DL expressivity SRIQ(D) |
| **License** | Likely Apache | Verify at github.com/fossr-project/ontology |
| **Community** | Emerging | Published Nov 2025; active fossr-project GitHub org |
| **BFO Alignment** | No (DOLCE) | Aligns with DOLCE+DnS UltraLite, not BFO -- cross-alignment needed |
| **Availability** | Yes | `https://w3id.org/fossr/ontology/bdi/` with content negotiation |

**Decision**: **REFERENCE ONLY**. The BDI ODP uses DOLCE alignment, not BFO.
Importing would create an upper-ontology conflict. Instead, use as design
reference for PAO's goals/plans/intentions module. Record BDI concepts as
`skos:relatedMatch` mappings in SSSOM.

### 4.2 OASIS v2 (W3C Community Group)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Medium (30%) | Agent, Behaviour, Goal, Task, Commitment |
| **Quality** | Good | OWL 2 ontology, peer-reviewed |
| **License** | GPLv3+ | Copyleft -- may constrain PAO license choice |
| **Community** | Active | W3C CG; continued development through 2026 |
| **BFO Alignment** | None | Standalone upper-level |
| **Availability** | Yes | GitHub + University of Catania server |

**Decision**: **REFERENCE ONLY**. GPLv3 license is copyleft and may be
incompatible with PAO's intended license. Use as design reference for
agent behavior modeling. SSSOM mappings for interoperability.

### 4.3 SEM (Simple Event Model)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Low (15%) | Event, Actor, Place, Time -- very minimal |
| **Quality** | Good | Lightweight RDFS+OWL; deliberately minimal semantic commitment |
| **License** | Unspecified | Stable document at VU Amsterdam; no explicit license |
| **Community** | Dormant | Stable since 2011; 300+ citations; no updates |
| **BFO Alignment** | None | Standalone |
| **Availability** | Yes | `http://semanticweb.cs.vu.nl/2009/11/sem/` |

**Decision**: **ALIGNMENT TARGET**. SEM's minimal Event/Actor/Place/Time
model is a useful mapping target for interoperability. Create SSSOM mappings
(`sem:Event skos:broadMatch pao:Event`, etc.). Do not import -- too minimal
and license unclear.

### 4.4 Mem'Onto (Cognitive Memory Ontology, FOIS 2025)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Medium (20%) | Memory systems, mnesic processes (encoding, storage, retrieval) |
| **Quality** | Alpha | Research prototype, 2025 alpha release |
| **License** | Unknown | Check GitLab: gitlab.com/sfsoline.felice/memonto |
| **Community** | Nascent | Single research group |
| **BFO Alignment** | Unknown | Based on CoTOn (Cognitive Theory Ontology) |
| **Availability** | Yes (alpha) | GitLab TTL file |

**Decision**: **REFERENCE ONLY**. Alpha-stage, unknown license, unknown BFO
compatibility. Use as conceptual inspiration for PAO's memory module
(particularly the Tulving SPI model memory type taxonomy). Monitor for
stable release.

### 4.5 DIT++ / ISO 24617-2 (Dialog Act Taxonomy)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Coverage** | Low (10%) | Dialog acts -- relevant for turn classification |
| **Quality** | High (as taxonomy) | ISO standard; 56 communicative functions, 10 dimensions |
| **License** | ISO copyright | Standard is paywalled; taxonomy structure freely documented |
| **Community** | Moderate | ISO standard; last updated 2020 |
| **BFO Alignment** | N/A | Not an OWL ontology |
| **Availability** | No OWL | XML/DiAML format only; no RDF/OWL formalization exists |

**Decision**: **ENCODE AS VOCABULARY**. No OWL version exists. PAO will mint
its own dialog act classes/individuals based on the DIT++ taxonomy, citing the
ISO standard as source. This is a future-iteration enhancement (not required
for v1).

### 4.6 MATRIX Ontology (Multi-Agent Shared Memory, 2025)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Availability** | No | Paper published but no public OWL/RDF release |
| **License** | Unknown | Metaphacts (commercial company) |

**Decision**: **MONITOR ONLY**. Not publicly available. Interesting concept
(shared memory for heterogeneous agent teams) but cannot be evaluated.

---

## 5. Reuse Strategy Summary

### Direct Imports (`owl:imports`)

| Ontology | Prefix | Import IRI | PAO Modules Served |
|----------|--------|-----------|-------------------|
| PROV-O | `prov:` | `http://www.w3.org/ns/prov-o#` | Memory (provenance), Identity (agents), Actions |
| OWL-Time | `time:` | `http://www.w3.org/2006/time#` | Events/Time, Conversation (timestamps) |
| ODRL 2.2 | `odrl:` | `http://www.w3.org/ns/odrl/2/` | Governance (permissions, policies) |

### Selective Reuse

| Ontology | Prefix | Terms to Use | Method |
|----------|--------|-------------|--------|
| FOAF | `foaf:` | `OnlineAccount` (if needed) | Reference in annotations; consider MIREOT extraction if formal import needed |
| Dublin Core | `dcterms:` | `title`, `description`, `creator`, `license`, `modified`, `source` | Direct property use (no class import needed) |
| SKOS | `skos:` | `definition`, `note`, `altLabel`, `exactMatch`, `broadMatch` | Direct property use |

### SSSOM Alignment Targets

| Ontology | Prefix | Alignment Type |
|----------|--------|---------------|
| Schema.org | `schema:` | `skos:exactMatch` / `skos:broadMatch` for Action types |
| SEM | `sem:` | `skos:broadMatch` for Event/Actor |
| BFO 2020 | `BFO:` | `rdfs:subClassOf` for PAO top-level classes |
| ActivityStreams 2.0 | `as:` | `skos:exactMatch` for Activity/Actor |
| SIOC | `sioc:` | `skos:broadMatch` for conversation threading |

### Reference Only (Inform Design)

| Ontology | Use |
|----------|-----|
| BDI Ontology ODP | Design reference for goals/plans/intentions module |
| OASIS v2 | Design reference for agent behavior modeling |
| Mem'Onto | Conceptual inspiration for memory type taxonomy |
| CoALA framework | Memory tier vocabulary design |
| Letta/MemGPT | Memory tier and memory operation design |

---

## 6. Pre-Glossary Coverage Analysis

Of the 33 pre-glossary classes:

| Coverage Source | Classes Covered | Examples |
|----------------|----------------|---------|
| PROV-O provides | 5 | Agent (as prov:Agent), Plan (as prov:Plan), Role (as prov:Role) |
| OWL-Time provides | 0 directly | (PAO events use time:Interval/Instant as temporal extents, not as superclasses) |
| ODRL provides | 2 | PermissionPolicy (as odrl:Policy subclass), SafetyConstraint (as odrl:Prohibition) |
| PAO must create | 26+ | Conversation, Session, Turn, MemoryItem, MemoryTier, Episode, Claim, ToolInvocation, Goal, Task, etc. |

The majority of PAO classes are novel to the AI agent domain and must be
created by the conceptualizer and architect skills.

---

## 7. Handoff to Conceptualizer

This reuse report provides:
- [x] Every pre-glossary term searched in at least one registry (OLS)
- [x] Scored candidate evaluations with clear recommendations
- [x] Validated import candidates (PROV-O, OWL-Time, ODRL load without errors)
- [x] ODP recommendations (see `odp-recommendations.md`)
- [x] SSSOM alignment targets identified

The conceptualizer should:
1. Use PROV-O's Agent/Activity/Entity triad as the provenance backbone
2. Use OWL-Time for all temporal modeling
3. Use ODRL for the governance/permissions module
4. Create the 26+ novel PAO classes following BFO alignment guidance
5. Apply the ODPs documented in `odp-recommendations.md`
