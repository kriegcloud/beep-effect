# Actionable Guidance Extracted from Kendall & McGuinness (2019) "Ontology Engineering"

Source: Chapters 2-5 of *Ontology Engineering* (Synthesis Lectures on Data,
Semantics, and Knowledge), Elisa F. Kendall and Deborah L. McGuinness, Springer 2019.

---

## 1. Requirements & Competency Question Methodology

**Target skill:** `ontology-requirements`

### 1.1 The Non-Negotiable Starting Point

> "Most projects we've observed fail without a decent set of scoping requirements,
> and competency questions in particular." (Ch. 6, p94)

**Rule R-REQ-1:** Never skip requirements. Even "general-purpose reference ontologies"
have requirements -- they just require more effort to draw out from stakeholders.

**Rule R-REQ-2:** Requirements determine scope AND success criteria. Without them you
cannot know (a) when you are done, or (b) whether changes break something.

### 1.2 Requirements Gathering Checklist

Before beginning any ontology work, gather (Ch. 2, p17; Ch. 3, p27):

1. **Identify sub-domain / topic area** -- the specific organizational perspective to focus on
2. **Gather relevant content** -- policies, procedures, standards, controlled vocabularies,
   glossaries, dictionaries, data sources, regulations
3. **Identify key stakeholders and SMEs** -- who validates terminology, definitions, CQs
4. **Identify known interfaces and data sources** -- systems, APIs, databases that
   participate in the use case
5. **Sketch user stories / usage scenarios** -- from stakeholder perspective, not developer
6. **Seed the use case template** with as much information as possible

### 1.3 Use Case Structure (Ch. 3, pp32-38)

Every use case document must include:

| Section | Content |
|---------|---------|
| **Summary** | Short description of what requirement the use case supports; the business "why"; primary goals in short declarative sentences |
| **Scope** | What is in scope, what is explicitly out of scope |
| **Actors & Interfaces** | Primary actors (consumers), secondary actors (data providers, reasoners, services); all information sources |
| **Pre-conditions** | State of the world before execution |
| **Post-conditions** | Success scenario AND failure scenario with artifacts, impacts, metrics |
| **Triggers** | Events / conditions that initiate the flow |
| **Normal Flow** | Step-by-step process from one primary actor's perspective; every flow must include at least one step that consults the ontology |
| **Alternate Flows** | Initialization, error conditions, sensor-triggered, special cases |
| **Competency Questions** | Questions + representative sample answers + description of how answer is obtained |
| **Non-functional Requirements** | Performance, sizing, timing, maintainability, portability |
| **Resources** | Every non-human actor: resource description, information provided, access mechanisms, APIs, policies, license, owner |
| **Notes** | Miscellaneous items to be organized later |

**Rule R-REQ-3:** Use cases are *living documents*. Revise with every step of the
engineering process -- through development, testing, deployment, maintenance, and
evolution.

### 1.4 User Stories (Ch. 3, pp27-28, 36)

- User stories come from **stakeholders**, not developers/ontologists
- Brainstorming sessions with SMEs, starting from coarser "epics" and decomposing
- Each user story maps to at least one use case; every use case maps to at least one
  user story
- **Pitfall:** An approach based *solely* on user stories risks missing the overall
  architecture. Organize stories into broader "usage scenarios" or "threads" covering
  related capabilities.

### 1.5 Competency Questions (CQs) -- The Critical Section (Ch. 3, pp38-40)

**Definition:** CQs are "a set of questions and related answers that a knowledge base or
application must be able to answer correctly" (Uschold & Gruninger, 1996; Gruninger & Fox, 1995).

**Rule R-CQ-1:** CQs are MORE important than diagrams or alternate flows for validating
an ontology. They drive both the scope AND the architecture.

**Rule R-CQ-2:** Every CQ must have THREE components:
1. The **question** itself, using domain/stakeholder terminology
2. A **representative sample answer** (concrete, with real or realistic values)
3. A **description of how the answer should be obtained** -- what information must be
   encoded in the ontology and what processing is required

**Rule R-CQ-3:** CQs that span multiple information sources are especially important --
they test integration capability and should be prioritized.

**Rule R-CQ-4:** CQ answers serve as **regression tests**. Changes to the ontology must
not invalidate previously valid CQ answers.

**Rule R-CQ-5:** For each CQ, note:
- Whether inference/reasoning is required to answer
- Whether data integration across multiple sources is needed
- What property values and thresholds are involved
- Whether mapping between different ontologies is required

**Example CQ pattern** (from p39):
```
Question: From the set of approved trees for the city of Los Altos,
identify all those that are oak root fungus resistant, that flower,
that are deciduous, and whose leaves turn colors in the fall.

Answer: koelreuteria paniculata (golden rain tree), melaleuca
stypheloides (prickly paperbark), lagerstroemia indicus (crepe myrtle),
malus "Robinson" (Robinson crabapple), sapium sebiferum (Chinese tallow
tree) ... maybe others.

Answer: Definitely not a cinnamomum camphora (camphor tree).

How to determine: (1) downloading the list of trees; (2) analysis to
determine which are oak-root fungus resistant; (3) which are deciduous;
(4) which are flowering; (5) which have showy fall foliage.
```

### 1.6 Traceability

**Rule R-REQ-4:** Maintain a traceability map from requirements -> user stories -> use
cases -> CQs -> ontology elements. This serves as both validation input and
regression test foundation.

**Rule R-REQ-5:** Every functional requirement must be covered by at least one user
story, and every user story must be part of at least one use case.

### 1.7 Integration with Broader Requirements Documents (Ch. 3, pp41-44)

Ontology-specific additions to a standard BRD/SRD include:
- Additional references for terminology and definitions
- Competency questions with sample answers
- Identification of reusable external ontologies
- Potential mapping relationships between vocabularies
- Information about resources (data sources, APIs, services)
- Constraints on vocabulary for question answering, analysis, reporting

---

## 2. Reuse & Discovery Guidance

**Target skill:** `ontology-scout`

### 2.1 The Reuse Imperative

> "We feel it is misguided to build a new ontology without performing a thorough
> search for existing starting points, in fact." (Ch. 3, p32)

**Rule R-REUSE-1:** Always search for reusable ontologies before creating new ones.
Never start from scratch.

### 2.2 What to Gather for Reuse Assessment (Ch. 3, pp29-31)

Collect a representative set of:
- Controlled vocabularies and nomenclatures for the domain
- Well-known hierarchical/taxonomic resources
- Standard dictionaries for the domain
- Reference documents (ISO, IEEE, OMG, W3C, OASIS; ANSI, government agency
  glossaries, regulations, policies, procedures)
- Standard and de-facto standard ontologies

### 2.3 Where to Search (Ch. 5, pp69-71)

| Repository | Focus |
|------------|-------|
| BioPortal (bioportal.bioontology.org) | Biomedical, scientific, general |
| OMG specifications (omg.org) | Finance, software engineering, aerospace, retail, robotics |
| University of Toronto OOR (oor.net) | General repository listing |
| Schema.org | Structured data, web crawlers |
| Google Dataset Search | Dataset discovery |
| IBC Agroportal | Agriculture ontologies |
| COLORE | Common Logic community |

### 2.4 Always-Reuse Ontologies for Metadata (Ch. 5, p70)

These should be imported as starting points in virtually every project:
- **Dublin Core** -- metadata and annotations
- **SKOS** -- concept system representation and useful annotation properties
- **W3C PROV-O** -- provenance information
- **Specification Metadata** (OMG) -- metadata about standards, change management
- **Nanopublications** -- provenance augmentation for KG statements
- **Bibliographic Ontology** -- source documentation

### 2.5 Reuse Evaluation Criteria -- The Checklist (Ch. 5, pp71-73)

**Before recommending reuse, evaluate ALL of the following:**

1. **Licensing** -- MUST have explicit copyright and licensing information (Creative
   Commons or MIT preferred). No license = do not reuse. (This is the MOST important
   criterion.)
2. **Maintenance** -- Understand the developer's maintenance policies. Check update
   frequency. Avoid ontologies with no active maintenance community.
3. **Syntactic correctness** -- Verify using W3C RDF Validation Service or equivalent
4. **Logical consistency** -- Check with DL reasoners (HermiT, Pellet, FaCT++). Use
   at least one complete reasoner.
5. **Topic coverage** -- Does it cover the domain? At least 50% of terms must be
   reusable/extensible with limited conflict.
6. **Modularization** -- Can you separate what you need from the rest? Is the module
   self-contained?
7. **Metadata completeness** -- Every concept and property must have a label and
   definition, with source information.
8. **Change management** -- Does the project use version control (Git), issue tracking,
   change history? Do they accept contributions?
9. **CQ validation** -- Pose representative CQs against the candidate ontology. Do you
   get the expected answers? Still true after integration?

**Rule R-REUSE-2:** Prefer extending over starting from scratch. "If there is a gap in the
content... consider extending them rather than starting from scratch." (Ch. 3, p31)

**Rule R-REUSE-3:** Use the MIREOT approach for large ontologies -- reference only the
minimum information needed for an external term, maintaining metadata about the source.

**Rule R-REUSE-4:** Avoid ontologies without active user communities or collaboration
tools.

**Rule R-REUSE-5:** Require copyright and licensing metadata in all ontologies you
publish, even internal ones.

### 2.6 Ontology Architecture Layers (Ch. 2, pp15-16)

When structuring reuse, organize into layers:
1. **Foundational layer** -- Reusable metadata and provenance (Dublin Core, SKOS, PROV-O),
   potentially with context-specific extensions
2. **Domain-independent layer** -- Dates, times, geopolitical entities, languages, units of
   measure, commonly used concepts
3. **Domain-dependent layer** -- Standards for the domain (e.g., FIBO for finance)
4. **Problem-specific layer** -- Ontologies specific to the problems of interest, building on
   the other three layers

---

## 3. Naming & Labeling Rules

**Target skills:** `naming-conventions`, `ontology-conceptualizer`

### 3.1 IRI/Namespace Conventions (Ch. 5, pp75-78)

**IRI Structure Pattern:**
```
https://<authority>/<business unit>/<domain>/<subdomain>/<date or version>/<module>/<ontology name>/
```

**Namespace Prefix Pattern:**
```
<spec>-<domain>-<module>-<ontology abbreviation>
```

**Best Practices for IRIs:**
- **Availability:** People should be able to retrieve a description from the IRI
- **Understandability:** IRIs are unambiguous; one IRI = one resource; separate
  "subjects/topics" from real-world objects they characterize
- **Simplicity:** Short, mnemonic IRIs preferred for collaboration
- **Persistence:** IRIs should be stable; exclude implementation strategies (.php, .asp);
  understand that organization lifetime may be shorter than resource lifetime
- **Manageability:** Insert date/year in path so IRI schemes evolve without breaking
  older IRIs; designate an internal organization for IRI governance

**Rule R-NAME-1:** New versions should be published at new versioned IRIs, NOT
overwriting prior versions. Once published, an IRI should never change.

### 3.2 Element Naming Conventions (Ch. 5, p78)

**Rule R-NAME-2:** Use CamelCase without intervening spaces or special characters:
- **UpperCamelCase** for classes and datatype names (e.g., `FloweringPlant`, `BloomColor`)
- **lowerCamelCase** for properties (object properties and data properties) (e.g., `hasBloomColor`, `growsToAverageHeight`)

**Rule R-NAME-3:** Property names should use **verbs** and should NOT incorporate
domain or range (source/target) class names. This maximizes reusability across multiple
contexts. E.g., `hasColor` not `plantHasBloomColor`.

**Rule R-NAME-4:** Do NOT use underscores in names (many tools encode them as `%5F`
in IRIs, causing interoperability problems).

**Rule R-NAME-5:** For very large ontologies (biomedical, auto-generated), unique
opaque identifiers with human-readable labels are acceptable, but for business
vocabularies and data governance, prefer readable CamelCase names.

### 3.3 Concept Labeling (Ch. 4, pp58)

**Rule R-LABEL-1:** Labels should be plain text with proper spacing between words,
in lowercase, unless they represent proper names or abbreviations.

**Rule R-LABEL-2:** Every concept MUST have a `skos:prefLabel` (preferred label).

**Rule R-LABEL-3:** Alternate labels (`skos:altLabel`) capture variant names used by
different communities. Each alternate label must include metadata about the community
context where it is used.

**Rule R-LABEL-4:** Abbreviations (clipped terms, initialisms, acronyms) are NOT
separate concepts. If the abbreviation is the most common label, make it the preferred
label and put the expanded form as an alternate label.

**Rule R-LABEL-5:** Record the community context and source for every label
(`prefLabelContext`, `altLabelContext` annotations).

### 3.4 Synonym Handling (Ch. 4, p59)

**Rule R-SYN-1:** Initially capture synonyms as additional labels, not separate concepts.
As definitions are formalized, determine whether a synonym warrants a separate concept.

**Rule R-SYN-2:** For each synonym, document:
- The synonymous term itself in plain text
- The community context (who uses it and for what purpose)

---

## 4. Definition Writing Guidance

**Target skills:** `naming-conventions`, `ontology-conceptualizer`

### 4.1 The ISO 704 Genus-Differentia Pattern (Ch. 4, pp56, 59)

**Rule R-DEF-1:** Follow genus-differentia structure for ALL definitions:

- **For classes (nouns):** "A `<parent class>` that `<differentia>`" -- naming the parent(s)
  and including text that relates this concept to others through relationships and
  characteristics.
  - Example: *unilateral contract* = "a **contract** in which only one party makes an
    express promise, or undertakes a performance, without first securing a reciprocal
    agreement from the other party."

- **For properties (verbs):** "A `<parent relationship>` relation [between `<domain>` and
  `<range>`] that ..."
  - In a similar genus-differentia form as for classes.

### 4.2 Definition Quality Rules (Ch. 4, pp58-59)

**Rule R-DEF-2:** Definitions must be:
- **Unique** -- no two concepts share the same definition
- **Not overly wordy** -- terse, precise
- **Not circular** -- a concept must not be defined using itself
- **Substitutable** -- you should be able to replace the term with its definition in a
  sentence and have it remain grammatically correct and meaningful

**Rule R-DEF-3:** Definitions should incorporate information about related terms or
constraints that are intrinsic to the concept. (E.g., for a "unilateral contract," the
relationship between parties is intrinsic and must be in the definition.)

**Rule R-DEF-4:** Additional details -- examples, secondary explanatory information,
scoping -- go in annotations (`skos:scopeNote`, `skos:example`, `explanatoryNote`),
NOT in the definition itself.

**Rule R-DEF-5:** Definitions must be sourced. Track `definitionOrigin` (where
definition was taken directly) and `adaptedFrom` (where definition was modified from).

**Rule R-DEF-6:** Do not defer definition writing. Ontologies with poor definitions fail
to enable clear communication, which is one of their primary goals.

### 4.3 Full Vocabulary Entry (Ch. 4, pp57-58)

A fully curated vocabulary entry for every concept includes:

| Element | Annotation Property | Standard Source |
|---------|-------------------|----------------|
| Preferred label | `skos:prefLabel` | W3C/SKOS |
| Alternate label(s) | `skos:altLabel` | W3C/SKOS |
| Abbreviation | `abbreviation` | FIBO/FND, ISO 1087 |
| Synonym(s) | `synonym` | FIBO/FND, ISO 1087 |
| Community context | `community` | -- |
| Definition | `skos:definition` | W3C/SKOS, ISO 1087 |
| Scope note | `skos:scopeNote` | W3C/SKOS |
| Explanatory note | `explanatoryNote` | FIBO/FND |
| Usage note | `usageNote` | FIBO/FND |
| Example | `skos:example` | W3C/SKOS |
| Dependencies | `dependsOn` | OMG/SM |
| References | `dc:references` | dc/terms |
| Term origin/source | `termOrigin` | FIBO/FND |
| Definition origin | `definitionOrigin` | FIBO/FND |
| Definition adapted from | `adaptedFrom` | FIBO/FND |
| Concept status | `conceptStatus` | ISO 1087 |
| Status date | `conceptStatusDate` | -- |
| Steward | `steward` | -- |
| Change note | `skos:changeNote` | W3C/SKOS |
| Identifier(s) | `dc:identifier` | dc/terms, ISO 11179 |

---

## 5. Conceptual Modeling Methodology

**Target skill:** `ontology-conceptualizer`

### 5.1 Inputs Required Before Modeling (Ch. 5, p65)

Modeling CANNOT begin without:
1. One or more preliminary **use cases** with high-level requirements, CQs, and
   pointers to relevant vocabularies/ontologies
2. A **curated term list** with initial definitions, sources, and metadata
3. (Optional) Business architecture / business models

### 5.2 Preliminary Ontology Development Steps (Ch. 5, p68)

1. Select a subset of domain, use cases, and term list to build out
2. Identify concepts and preliminary relationships between them
3. Research existing ontologies/vocabularies for reusability
4. Identify and extend concepts from existing ontologies as appropriate
5. Connect concepts through relationships and constraints (derived from term list AND CQs)
6. Conduct basic consistency tests

### 5.3 Starting the Model (Ch. 5, pp69, 74)

**Rule R-MOD-1:** Start with 20-30 primary terms from high-priority CQs identified
with stakeholders.

**Rule R-MOD-2:** Limit each sub-graph or module to 100-150 concepts.

**Rule R-MOD-3:** Organize terms into rough topic areas for modularization early,
even in very early stages.

**Rule R-MOD-4:** Start with a "seed ontology" that imports metadata ontologies
(Dublin Core, SKOS, PROV-O, Specification Metadata).

**Rule R-MOD-5:** For each concept from the term list, create a class with:
- The metadata (label, definition, source, other notes)
- Hierarchical relationships (is-a)
- Lateral relationships (part-of, membership, functional, structural, behavioral)
- Known key attributes (dates, times, identifiers)

### 5.4 Modeling Approaches (Ch. 5, p82)

Three approaches, typically combined:
- **Top-down:** Define most general concepts first, then specialize
- **Bottom-up:** Define most specific concepts, then organize into general classes
- **Combined (recommended):** Breadth at top level + depth along a few branches to
  test design, then iterate

**Rule R-MOD-6:** Start from the top and build a broad 2-3 level hierarchy, laying out
high-level architecture. Then focus on relationships among classes in a bottom-up
fashion.

### 5.5 Hierarchy Rules (Ch. 5, pp81-82)

**Rule R-MOD-7:** is-a relationships MUST be true set-subset relationships. An instance
of the subclass MUST be an instance of the superclass. Violation causes reasoning errors.

**Rule R-MOD-8:** Do NOT model collections of orthogonal/independent attributes as
classes to inherit from. This OO-programming shortcut creates false taxonomies.

**Rule R-MOD-9:** DL supports and optimizes multiple inheritance and multiple
classification. Design ontologies to "slice and dice" data along many dimensions
using parallel hierarchies.

**Rule R-MOD-10:** Inheritance is transitive. If A subClassOf B subClassOf C, then
A subClassOf C. Ensure this always holds.

### 5.6 Properties and Relationships (Ch. 5, pp83-85)

**Property Categories:**
- **Intrinsic** -- inherent nature (e.g., leaf form, petal shape, soil requirements)
- **Extrinsic** -- externally imposed (e.g., retail price, grower)
- **Meronymic** (partonomic) -- part-whole relations
- **Spatio-temporal** -- geospatial and temporal relations
- **Object properties** -- relate classes/individuals to other classes/individuals
- **Data properties** -- relate to primitive values (strings, dates, numbers)

**Rule R-MOD-11:** DL properties are strictly binary. Use n-ary relation patterns
(W3C SWBP) to model ternary+ relationships.

**Constraint Types:**
- Cardinality (exact N), min cardinality, max cardinality
- allValuesFrom (universal quantification) -- restricts to members of a class/range
- someValuesFrom (existential quantification) -- at least one member
- hasValue -- restricts to a single specific value
- Qualified cardinality -- restricts count AND type simultaneously

### 5.7 Individuals (Ch. 5, pp89-90)

**Rule R-MOD-12:** Restrict individuals in the T-Box ontology to "rarified" or reference
individuals essential to describing the domain (e.g., enumerated color codes, country
codes, hardiness zones).

**Rule R-MOD-13:** Manage individuals in a SEPARATE ontology from the class/property
definitions. Changes to the ontology can cause logical inconsistencies that are hard to
debug if individuals are mixed in.

**Rule R-MOD-14:** A representative set of individuals is required for testing the
ontology (logical consistency + CQ answering). A complete set of individuals belongs
in a knowledge graph or data store, not the ontology.

### 5.8 Other Important Constructs (Ch. 5, p91)

- **Functional properties** -- for every domain value, exactly one range value
- **Inverse functional properties** -- for every range value, exactly one domain value
  (equivalent to a database key)
- **Property chains** -- link properties together to simplify search
- **Disjointness axioms** -- use to enforce mutual exclusivity, uncover logic errors,
  and tease out subtle distinctions across ontologies. Add proactively when you
  are confident two classes cannot share instances.
- **Equivalence expressions** -- identify same concepts across ontologies or name
  complex class expressions for reuse

### 5.9 Metadata Requirements (Ch. 5, pp78-79)

**At the ontology level:**
- Standardized metadata using Dublin Core, SKOS, ISO 11179, PROV-O
- Copyright, licensing, versioning information

**At the element level (minimum set):**
- Names (IRIs following naming conventions)
- Labels (`skos:prefLabel`)
- Formal definitions with source
- Required approval information

**Rule R-MOD-15:** Consistent use of the same annotations and annotation format
across the entire ontology. Improves readability, automated documentation generation,
and search.

---

## 6. Evaluation & Quality Criteria

**Target skill:** `ontology-validator`

### 6.1 The Four Expectations (Ch. 1/2, p4)

Every ontology, regardless of expressivity or purpose, must be:
1. **Encoded formally** in a declarative KR language
2. **Syntactically well-formed** (verified by syntax checker/parser)
3. **Logically consistent** (verified by reasoner/theorem prover)
4. **Meeting requirements** (demonstrated through extensive testing)

### 6.2 Semantic Evaluation Dimensions (Ch. 2, pp20-21)

| Dimension | What to Assess |
|-----------|---------------|
| **Expressivity** | Language level on the ontology spectrum; matches requirements? |
| **Complexity** | Number and nature of axioms; processing complexity for reasoning |
| **Granularity** | Level of detail; explicitly underspecifying may be appropriate for high-reuse ontologies |
| **Epistemological adequacy** | Coverage -- does it capture sufficient content richness and scope? |

### 6.3 Functional Evaluation Criteria (Ch. 2, p21)

| Criterion | Assessment |
|-----------|-----------|
| **Relevance** | Degree of relevance to the problem based on use cases |
| **Rigor** | How well the ontology supports its required level of correctness (prescriptive > descriptive) |
| **Automation support** | Extent to which ontology supports automated reasoning requirements |

### 6.4 Model-Centric Evaluation (Ch. 2, pp21-22)

| Perspective | Criteria |
|------------|---------|
| **Authoritativeness** | From broad/shallow to narrow/deep/authoritative |
| **Structure** | Passive (transcendent, external) vs. active (immanent, emergent from data) |
| **Formality** | Informal/taxonomic to fully formal with theories/axioms |
| **Model dynamics** | Read-only/static to fluid/evolving |
| **Instance dynamics** | Read-only instances to continuously changing |

### 6.5 Methodology Conformance Evaluation (Ch. 2, p22)

- Conformance with naming conventions, documentation, annotation usage
- Conformance with modularity requirements
- Test and validation policies
- Conformance with organizational governance policies
- Support for collaborative development and change management

### 6.6 Reuse Evaluation Checklist (Ch. 5, p72)

When evaluating an existing ontology for reuse:
1. Syntactically correct (W3C RDF Validator)
2. Logically consistent (at least one complete DL reasoner: HermiT or Pellet)
3. Good topic coverage (>= 50% of terms reusable/extensible)
4. Limited conflict with domain terms/definitions identified by SMEs
5. Modularized (can separate relevant modules from irrelevant)
6. Metadata complete (every concept/property has label + definition + source)
7. Licensing clear and acceptable
8. Actively maintained with change management

### 6.7 Testing Approach (from Ch. 5, pp67-68 Figure 5.1)

The development cycle includes explicit testing phases:
1. **Develop preliminary ontology**
2. **Develop diagrams and content reports for SME review**
3. **Conduct SME reviews of content; develop test data**
4. **Create test queries conforming to CQs; test ontology for completeness**
5. **Augment ontology to fill content gaps**
6. **Rerun regression and hygiene tests** to confirm coverage, consistency, and
   deductive closure

---

## 7. Design Patterns & Common Pitfalls

### 7.1 Design Patterns (Ch. 2, p23)

**Key ODP sources:**
- W3C Semantic Web Best Practices working group (early patterns for part-whole,
  n-ary relations, classes as property values, specified values and value sets)
- Ontology Design Patterns wiki (ontologydesignpatterns.org) -- Gangemi & Presutti
- Domain-specific pattern catalogs

**Rule R-PAT-1:** Combination of reusing existing ontologies AND applying known
design patterns results in higher quality, more maintainable, more reusable ontologies.

**Common patterns to know:**
- Part-whole relationships in OWL
- N-ary relations (mapping to binary)
- Classes as property values
- Specified values and value sets
- MIREOT (minimum information to reference an external term)

### 7.2 Common Pitfalls

**Pitfall P-1: Skipping requirements** (Ch. 3, p25-26)
> "We have participated in countless projects where there is pressure to skip the
> requirements step and jump straight into modeling."
Always do requirements first. There are always requirements -- they may just need more
effort to elicit.

**Pitfall P-2: Scope creep without CQs** (Ch. 2, p17)
Without scoping requirements and CQs, projects "wander down interesting but not
essential paths, and do not reach focused completion with clear termination criteria."

**Pitfall P-3: Using existing systems as blueprints** (Ch. 3, p42)
"Using an existing system as the primary blueprint for a new one often misses critical
requirements of end-users and stakeholders." Always do fresh requirements analysis.

**Pitfall P-4: Modeling from a technical perspective instead of domain** (Ch. 2, p14)
Software engineers and data engineers make assumptions about relationship representation
that don't hold in ontologies. "The remedy involves modeling concepts and relationships
more carefully from the domain or business perspective."

**Pitfall P-5: False is-a hierarchies from OO inheritance** (Ch. 5, p82)
"We have worked with people who modeled collections of sometimes orthogonal or
completely independent attributes as classes in object-oriented programming languages,
and then 'inherited' from these classes." These do not form true sets. Causes reasoning
errors.

**Pitfall P-6: Deferring definitions** (Ch. 4, p59)
"Putting this off often means that it doesn't get done. The result is that users of the
ontology are not clear on what any concept with a poor definition means."

**Pitfall P-7: Looking up definitions online instead of working with SMEs** (Ch. 5, p66)
"People who come from a software or data engineering background sometimes assume
that looking up definitions in dictionaries and modeling a domain based on what they
can find online... is 'good enough.' That approach may work for certain research or
software projects, but not for a serious ontology engineering effort."

**Pitfall P-8: Naming properties with domain/range** (Ch. 5, p78)
"Names that include the source and target *limit the reusability* of a property, thus
limiting the ability to use common queries across multiple resources that contain similar
relationships."

**Pitfall P-9: Mixing individuals with class definitions** (Ch. 5, p90)
"Changes made to the ontology can result in logical inconsistencies that can be difficult
to debug unless the individuals are managed separately."

**Pitfall P-10: Reusing ontologies without maintenance or licensing** (Ch. 5, pp71-72)
"No organization wants to invest in a significant ontology development effort that depends
on some other ontology that might break at a moment's notice, or change in some subtle
way that might cause downstream reasoning errors."

**Pitfall P-11: Destroying rather than deprecating** (Ch. 5, p73)
"By destructive, we mean any change that either (1) deletes any concept or property
rather than deprecating it, or (2) revises the logic in ways that make the ontology
logically inconsistent with prior versions."

### 7.3 Ontology Development Lifecycle (Ch. 4, pp47-49)

The full 9-phase methodology:

1. **Preparatory** -- Identify sub-domain/topic, gather documents, identify stakeholders/SMEs
2. **Initial term excerption** -- Extract keywords/phrases from sources into preliminary
   term list with definitions and source annotations
3. **Business architecture** (optional) -- Value streams, capabilities, information entities
4. **Subsequent term excerption and normalization** -- Augment from interviews, cross-reference
   to business models
5. **Use case development** -- Usage scenarios, CQs with sample answers, description of
   how answers are derived
6. **Term curation, reconciliation, augmentation** -- Prioritize with SMEs, map to concepts,
   reconcile definitions, capture metrics
7. **Ontology development** -- Formal conceptual model: concepts, definitions, relationships,
   axioms, links to reusable external concepts
8. **Review** -- SME/stakeholder review for correctness and completeness, validation
   with test data, regression testing
9. **Deployment** -- Publish via intranet/web, map to repositories and data stores,
   integrate with applications

### 7.4 Modularization Rules (Ch. 2, pp15-16; Ch. 5, p69)

**Rule R-MOD-A:** Decide modularization strategy early. Key questions:
- Is a concept/relationship general enough to be reused by other ontologies?
- Is it independent from others in the current work?

**Rule R-MOD-B:** Limit sub-graphs to 100-150 concepts each.

**Rule R-MOD-C:** Separation criteria at the domain-dependent level include:
- Behavioral, functional, structural knowledge
- Presentation-layer, process logic, business logic, infrastructure
- "As designed," "as built," "as configured," "as maintained"

---

## Summary: Key Rules by Skill

### ontology-requirements
R-REQ-1 through R-REQ-5, R-CQ-1 through R-CQ-5

### ontology-scout
R-REUSE-1 through R-REUSE-5

### naming-conventions
R-NAME-1 through R-NAME-5, R-LABEL-1 through R-LABEL-5, R-SYN-1, R-SYN-2

### ontology-conceptualizer
R-DEF-1 through R-DEF-6, R-MOD-1 through R-MOD-15, R-MOD-A through R-MOD-C

### ontology-validator
The Four Expectations (6.1), Semantic Dimensions (6.2), Functional Criteria (6.3),
Model-Centric (6.4), Methodology Conformance (6.5), Reuse Checklist (6.6),
Testing Approach (6.7)

### Common Pitfalls (all skills)
P-1 through P-11
