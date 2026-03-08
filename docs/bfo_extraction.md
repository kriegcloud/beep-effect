# BFO Ontology Engineering -- Actionable Rules & Guidance

*Extracted from Arp, Smith & Spear, "Building Ontologies with Basic Formal Ontology" (MIT Press, 2015), Chapters 2-4 and 7.*

---

## 1. Design Principles

### 1.1 Eight General Principles of Ontology Design (Box 3.1, p.50)

1. **Realism** -- The goal of an ontology is to describe reality, not concepts, language, or mental representations. Ontologies represent universals and the relations between them as they exist in reality.

2. **Perspectivalism** -- There are multiple accurate descriptions of reality. Ontology developers should not seek to represent all of reality in a single ontology but should use a modular approach, with each module maintained by experts in the corresponding scientific discipline.

3. **Fallibilism** -- Ontologies, like scientific theories, are revisable in light of new discoveries.
   - **3a**: Every ontology must have sophisticated version-tracking strategies.
   - **3b**: Every ontology must have a tracking service allowing users to report errors and gaps.

4. **Adequatism** -- Entities in a given domain should be taken seriously on their own terms, not reduced to other kinds of entities. All scientific disciplines are prima facie of equal worth. Ontologies must allow for entities at multiple levels of granularity.

5. **Principle of Reuse** -- Always examine existing ontology resources before creating new content. Reuse as much relevant ontological content as already exists. Even where content cannot be reused, use it as a benchmark for adequacy of new content. Due diligence is required -- much available ontology content is poor in quality.

6. **Balance Utility and Realism** -- Do not sacrifice adequacy to reality for short-term local utility. Reality as described in best current science provides the common benchmark for consistent development.

7. **Open-Ended Process** -- Ontology design is the first step in an ongoing process of maintenance, evaluation, updating, and correction. Ontologies should be designed to be expandable and amendable through time.

8. **Low-Hanging Fruit** -- Begin with the features of the domain that are easiest to understand and define. Start by categorizing simple universals and relations first; identify terms from introductory textbooks and work progressively toward more complex entities.

### 1.2 Domain Ontology Design Process (Table 3.1, p.50)

| Step | Activity |
|------|----------|
| 1 | Demarcate the subject matter of the ontology |
| 2 | Gather information: identify general terms from existing ontologies and standard textbooks; analyze to remove redundancies |
| 3 | Order terms in a hierarchy of more and less general |
| 4 | Regiment the result for: (a) logical, philosophical, scientific coherence; (b) coherence and compatibility with neighboring ontologies; (c) human understandability through human-readable definitions |
| 5 | Formalize the regimented artifact in a computer-usable language |

### 1.3 Scoping Rules

- Explicitly determine the intended scope: "What part of reality is this ontology an ontology of?" State what is included AND excluded.
- Scope determines granularity level (organisms, cells, molecules, etc.).
- Determine relevance by: (1) current state of science, (2) degree to which existing neighboring ontologies can be relied upon, (3) practical goals the ontology must satisfy.
- Ontologies should consist of representations only of types for which there is good evidence that instances exist (the **No Nonexistents** rule).
- Application ontologies should reuse portions of reference ontologies to the maximal possible extent.

### 1.4 Top-Level Ontology Alignment

- At the outset, consider what top-level ontological categories and relations apply to the domain, and select a top-level ontology (e.g., BFO) with sufficient categories for the basic kinds of entities.
- A top-level ontology must be domain-neutral -- it should not contain domain-specific relations or universals.
- Domain ontologies are constructed by **downward population** from a common top level using Aristotelian definitions.
- The top-level enforces correctness constraints at lower levels (e.g., flagging violations of `part_of` transitivity, detecting ambiguity between things and processes).

---

## 2. Naming & Definition Rules

### 2.1 Terminology Principles (Chapter 4, principles 1-12)

| # | Rule | Detail |
|---|------|--------|
| 1 | Include terms used by influential domain scientists | Select terms for the most important types of entities to be represented |
| 2 | Maximize consensus with domain terminology | Work with domain experts; negotiate terminological compromises where needed |
| 3 | Track disciplinary overlap and synonyms | Where usage is inconsistent across subdisciplines, record synonyms alongside the preferred label |
| 4 | Don't reinvent the wheel | Stay as close as possible to actual domain expert usage; reuse existing terminologies and ontologies |
| 5 | **Use singular nouns** | All terms should be singular nouns or singular noun phrases. Each term refers to a universal or defined class, which is singular ("organism" not "organisms") |
| 6 | **Use lowercase italic for common nouns** | For human review: lowercase italic for universals/classes (e.g., *cell*, *eukaryotic cell*). Initial capitals only for proper names (instances). For machine encoding: use underscore, single quotes, or CamelCase consistently |
| 7 | **Avoid acronyms** | Use complete noun/noun phrases as primary labels. Exception: acronyms that have become part of the language (DNA, AIDS, ATPase) |
| 8 | **Assign unique alphanumeric identifiers** | Each term gets a persistent ID. The ID is associated with the term, its human-readable definition, and its logical formalization |
| 9 | **Ensure univocity** | Every term must have exactly one meaning on every occasion of use. Multiple terms may have the same meaning (synonyms are fine) but declare one as preferred |
| 10 | **Ensure univocity of relational expressions** | Relations like `is_a` and `part_of` must have consistent, unambiguous meaning throughout the ontology. Never overload `is_a` to mean both subclass-of and instance-of |
| 11 | **Avoid mass nouns** | Mass nouns (water, tissue, meat) are ambiguous between types and portions. Transform them into count nouns using "portion of" prefix: "portion of blood," "portion of tissue," "portion of chemical substance" |
| 12 | **Distinguish general from particular** | Ontologies should represent universals and defined classes, not individuals. Individuals belong in an A-box (assertions), not the T-box (terminology). Mixing the two is associated with making errors |

### 2.2 Definition Principles (Chapter 4, principles 13-19)

| # | Rule | Detail |
|---|------|--------|
| 13 | **Provide all nonroot terms with definitions** | Every term (except very general root/primitive terms) must have a definition stated as necessary and sufficient conditions |
| 14 | **Use Aristotelian definitions** | Form: `S = def. a G that Ds` where G = genus (immediate parent) and D = differentia (what distinguishes S from other children of G). Examples: `human = def. an animal that is rational`; `cell = def. an anatomical structure that has as its boundary the external surface of a maximally connected plasma membrane` |
| 15 | **Use essential features** | The definition captures those features without which the thing would not be the kind of thing it is. Test: mentally subtract/vary features -- if the entity ceases to be an instance of the universal, that feature is essential |
| 16 | **Start definitions top-down** | Define the most general universals first, then work downward through the is_a hierarchy toward progressively more specific terms |
| 17 | **Avoid circularity** | A definition is circular if the term being defined (or a near synonym) occurs in the definition itself. Example of violation: `hydrogen = def. anything having the same atomic composition as hydrogen` |
| 18 | **Use simpler terms than the term being defined** | Definition terms must be more intelligible, more scientifically/logically/ontologically basic than the definiendum. Each step in the direction of greater complexity uses terms already defined in earlier steps |
| 19 | **Do not create terms for universals through logical combination** | Avoid negative terms ("nonrabbit," "nonheart") -- there are no negative universals. Avoid postulating class complements as ontology entries |

### 2.3 Advantages of Aristotelian Definitions

- Every definition, when unpacked, traces back to the root node of the ontology.
- Circularity is avoided automatically.
- The definition author always knows where to start (the parent term).
- Easier to coordinate the work of multiple definition authors.
- The definition structure mirrors and cross-checks the is_a hierarchy.
- Root/primitive terms cannot be defined but can be elucidated via illustrative examples, statements of recommended usage, and axioms.

### 2.4 Essential Components of Every Ontology Node

Each node in the ontology must consist of (p.36):
1. A term (preferred label)
2. Synonyms (when necessary)
3. A unique alphanumeric identifier
4. An Aristotelian genus-differentia definition
5. Placement in the is_a backbone taxonomy

---

## 3. BFO Classification Guidance

### 3.1 The Primary Classification Question

Given a universal that current science tells us exists (has instances), the first question is: **Are these instances continuant or occurrent entities?**

- **Continuants**: three-dimensional entities that continue to exist through time (objects, qualities, spatial regions). They have no temporal parts.
- **Occurrents**: entities that unfold or occur in time (processes, events). They have temporal parts. They occupy spatiotemporal regions.

### 3.2 Continuant Classification Decision Tree

If continuant, ask: **Independent or dependent?**

- **Independent continuants**: can exist on their own (material entities, sites, spatial regions)
  - Examples: organisms, cells, anatomical entities, portions of substance
- **Dependent continuants**: require a bearer to exist
  - **Qualities**: properties that inhere in independent continuants (color, shape, mass)
  - **Realizable entities**: dispositions and roles (fragility, the role of being a student)
  - **Functions**: a subtype of disposition that is grounded in the physical makeup of the bearer

### 3.3 Occurrent Classification Decision Tree

If occurrent, ask: **Process, process boundary, spatiotemporal region, or temporal region?**

- **Process**: has temporal parts and proper temporal parts. Examples: cell division, breathing, meiosis
- **Process boundary**: instantaneous temporal boundary of a process (beginning, ending). No temporal parts.
- **History**: the sum of all processes within/involving a material entity over its entire existence. One-to-one with its bearer.
- **Temporal region**: zero-dimensional (instant) or one-dimensional (interval)
- **Spatiotemporal region**: four-dimensional region of spacetime

### 3.4 BFO Perspectivalism in Practice

BFO is perspectival along two dimensions:
- **Continuant perspective**: represents entities as they exist at given instants of time (anatomy = three-dimensional structures)
- **Occurrent perspective**: represents entities as they unfold through time (physiology = processes in which structures participate)

GO's three branches map to BFO:
- Cellular Components = independent continuants
- Molecular Functions = dependent continuants (specifically, functions)
- Biological Processes = occurrents

### 3.5 OBO Foundry Alignment Matrix (Figure 6.2)

| Granularity | Independent Continuant | Dependent Continuant | Occurrent |
|-------------|----------------------|---------------------|-----------|
| Organ/organism | Organism (NCBI taxonomy), Anatomical entity (FMA, CARO) | Organ function, Phenotypic quality (PATO) | Biological process (GO) |
| Cell/cellular | Cell (CL, FMA), Cellular component (FMA, GO) | Cellular function, Disease (OGMS, DO, HPO) | Biological process (GO) |
| Molecule | Molecule (ChEBI, SO, PRO) | Molecular function (GO), Phenotype quality (PATO) | Molecular process (MPO) |

---

## 4. Relation/Property Patterns

### 4.1 Three Families of Relations (Box 7.1)

| Family | Notation Style | Example |
|--------|---------------|---------|
| Universal-universal | *italic* | *cancer is_a disease* |
| Particular-universal | **bold** | this cell **instance_of** *cell* |
| Particular-particular | **bold** | this nucleus **continuant_part_of** this cell **at** t |

### 4.2 Core BFO Relations (Box 7.2)

**Foundational Relations:**
1. `is_a` (subtype of) -- backbone taxonomic relation
2. `continuant_part_of` -- parthood between continuants (time-indexed)
3. `occurrent_part_of` -- parthood between occurrents (time-independent)

**Spatial Relations:**
4. `located_in` -- spatial containment (not parthood)
5. `adjacent_to` -- proximity between disjoint continuants

**Temporal Relations:**
6. `derives_from` -- material derivation across a temporal divide
7. `preceded_by` -- temporal ordering of occurrents

**Participation Relations:**
8. `has_participant` -- links a process (occurrent) to a continuant involved in it

### 4.3 Primitive Instance-Level Relations

These are the undefined building blocks from which universal-level relations are constructed:

| Relation | Domain | Range | Time-indexed? | Meaning |
|----------|--------|-------|---------------|---------|
| `c instance_of C at t` | continuant particular | continuant universal | yes | instantiation at a time |
| `p instance_of P` | occurrent particular | occurrent universal | no | instantiation (timeless) |
| `c continuant_part_of d at t` | continuant | continuant | yes | parthood at a time |
| `p occurrent_part_of q` | occurrent | occurrent | no | subprocess relation |
| `r continuant_part_of r'` | spatial region | spatial region | no | spatial parthood |
| `c inheres_in d at t` | dependent cont. | independent cont. | yes | quality/disposition inheres in bearer |
| `c located_in r at t` | continuant | spatial region | yes | spatial location |
| `r adjacent_to r'` | spatial region | spatial region | no | spatial proximity |
| `c derives_from d` | material cont. | material cont. | implicit | material derivation |
| `p has_participant c` | process | continuant | implicit | participation |

### 4.4 Formal Definitions of Universal-Level Relations

All universal-level relations are defined by quantifying over instances:

- `A is_a B` = def. A and B are universals and for all x (if x **instance_of** A then x **instance_of** B)
- `C continuant_part_of D` = def. for every particular continuant c and every time t, if c **instance_of** C **at** t, then there is some d such that d **instance_of** D **at** t and c is a **continuant_part_of** d **at** t
- `P occurrent_part_of Q` = def. for every particular occurrent p, if p **instance_of** P, then there is some q such that q **instance_of** Q and p **occurrent_part_of** q
- `C located_in D` = def. for every particular continuant c and every time t, if c **instance_of** C **at** t, then there is some d such that d **instance_of** D **at** t and c **located_in** d **at** t
- `C adjacent_to D` = def. for every particular continuant c and every time t, if c **instance_of** C **at** t, then there is some d such that d **instance_of** D **at** t and c **adjacent_to** d **at** t
- `C derives_from D` = def. for every particular continuant c and every time t, if c **instance_of** C **at** t, then there is some d and some earlier time t' such that d **instance_of** D **at** t', and c **derives_from** d
- `P preceded_by Q` = def. for every particular occurrent p, if p **instance_of** P, then there is some q such that q **instance_of** Q and p **preceded_by** q
- `P has_participant C` = def. for every particular occurrent p, if p **instance_of** P, then there is some c and some time t such that c **instance_of** C **at** t and p **has_participant** c at t

### 4.5 Additional Relations from the Relation Ontology (RO)

- `proper_continuant_part_of` / `proper_occurrent_part_of` -- parthood where part is not identical to whole
- `located_in` is NOT the same as `part_of` -- all continuant parts are located in their wholes, but not all things located in something are parts of it (e.g., kidney after transplant: located_in torso, but canonical anatomy defines structural parthood separately)

### 4.6 Key Axioms on Relations

- If c **continuant_part_of** d **at** t, then both c and d exist at t.
- If c **instance_of** *continuant*, then there is no d such that c **occurrent_part_of** d **at** t (continuants cannot be occurrent parts).
- `derives_from` can be extended to `mediately_derives_from` via transitivity: if C derives_from D and D derives_from E, then C mediately_derives_from E.

---

## 5. Anti-Patterns & Mistakes

### 5.1 Terminology Anti-Patterns

| Anti-Pattern | Example | Correction |
|-------------|---------|------------|
| **Plural nouns as labels** | "political systems," "social sciences" | Use singular: "political system," "social science" |
| **Mixed singular/plural** | MeSH hierarchy: some singular, some plural | Enforce singular consistently |
| **Acronyms as primary labels** | "BP" for "biological process" | Use full noun phrase; allow acronym as synonym only if widely established (DNA, AIDS) |
| **Mass nouns as labels** | "tissue," "water," "blood" | Rewrite as "portion of tissue," "portion of water," "portion of blood" |
| **Ambiguous terms (univocity violation)** | "cell" meaning both biological cell and prison cell; "disease progression" with 3 incompatible definitions | Give each sense a distinct term and identifier |
| **is_a overloading** | Using `is_a` for both subclass and instance_of | Strictly distinguish the two relations |
| **part_of overloading** | "A part_of B" meaning sometimes all-some, sometimes some-some | Use precise quantification: all As have some B as part vs. some As have some B as part |
| **Negative universals** | "nonrabbit," "nonheart" | Never create. There are no negative universals. |
| **Class complements as entries** | complement of "dog" = everything that is not a dog | Never include. Complements have no scientific coherence. |
| **Invented jargon** | Creating entirely new labels unknown to domain experts | Use established terminology; do not invent labels for entities domain experts already name |
| **Individuals in the T-box** | SNOMED: "National Spiritualist Church" as a subclass of "spiritual or religious belief" | Ontologies represent universals/types. Individuals go in the A-box. |

### 5.2 Definition Anti-Patterns

| Anti-Pattern | Example | Correction |
|-------------|---------|------------|
| **Circular definition** | `hydrogen = def. anything having the same atomic composition as hydrogen` | Define using more basic terms; never use the definiendum or a near synonym in the definition |
| **Non-Aristotelian definition** | A definition that lacks genus or differentia | Always use "S = def. a G that Ds" form |
| **Usage notes in the definition** | "This concept is most often used for chronic diseases" mixed into the definition | Separate usage information into rdfs:comment; definitions state only necessary and sufficient conditions |
| **Multiple incompatible definitions** | NCI Thesaurus: "disease progression" with 3 definitions referring to different types of entities | One term, one definition. Create separate terms for distinct meanings. |
| **Inessential features in definitions** | `person = def. a human being uniquely identifiable through legal documents` | Include only essential features -- those without which the entity would not be what it is |
| **Definitions using more complex terms** | Defining a basic term using specialized/obscure technical terms | Definitions must use simpler, more basic terms than the definiendum |
| **Missing definitions** | Terms without any definition | Every nonroot term requires a definition |

### 5.3 Structural Anti-Patterns

| Anti-Pattern | Correction |
|-------------|------------|
| **No top-level alignment** | Root nodes must be defined using genus terms from a domain-neutral top-level ontology (BFO) |
| **Confusing continuants and occurrents** | "gene mutation" is ambiguous (thing vs. process). Separate the product from the process. |
| **Missing transitivity axiom for part_of** | If the ontology uses `part_of`, it must respect transitivity: if x part_of y and y part_of z, then x part_of z |
| **Treating located_in as part_of** | Distinguish containment (located_in) from structural parthood (continuant_part_of) |
| **Building in isolation** | Ontologies should not be developed in isolation; always develop in tandem with neighboring ontologies that share the same top-level |

---

## 6. Quality Criteria

### 6.1 Ontology Completeness Checklist

Every well-formed ontology node must have:
- [ ] A preferred label (singular noun, lowercase)
- [ ] A unique persistent alphanumeric identifier
- [ ] Synonyms (where applicable)
- [ ] An Aristotelian genus-differentia definition (for all nonroot terms)
- [ ] Placement in the is_a backbone taxonomy with asserted single inheritance path to root
- [ ] Relations to other terms where applicable (part_of, located_in, has_participant, etc.)

### 6.2 Structural Quality Criteria

- **Single is_a backbone**: All nodes must be linked to the root by a unique chain of is_a relations.
- **Asserted single inheritance**: Each term should have one asserted parent (multiple inheritance may be inferred by reasoner but should not be manually asserted without careful justification).
- **Consistent use of relations**: Every relational expression (is_a, part_of, etc.) must have the same meaning throughout the ontology.
- **Domain/range constraints**: When defining relations, specify what categories of objects form the domain and range (e.g., `has_participant` domain = occurrent, range = continuant).
- **Temporal indexing**: Relations between continuants must be temporally indexed (they may change over time). Relations between occurrents need not be.

### 6.3 Process Quality Criteria

- **Versioning**: Maintain sophisticated version tracking; ontologies change as science advances.
- **Issue tracking**: Provide a public tracking service for error reports and gap identification.
- **Iterative review**: Regimentation is iterative -- cycles of review for logical, philosophical, and scientific adequacy, consistency, and completeness.
- **Cross-ontology coherence**: Ensure compatibility with neighboring ontologies that share the same top-level framework.
- **Reasoning validation**: Use automated reasoning to detect inconsistencies. If an ontology can be used to annotate data and then used as a tool to detect errors in that data, it is functioning well.
- **Human intelligibility**: Definitions must be understandable by domain experts, not just by logicians. This is a primary function of Aristotelian definitions.

### 6.4 Relation Quality Criteria

- Every relation must have a clear formal definition specifying: domain, range, quantification pattern, and whether it is time-indexed.
- Use only the established BFO/RO core relations unless there is a demonstrated need for a new relation.
- New relations should be defined in terms of the primitive instance-level BFO relations.
- Axioms should be provided for formal properties (reflexivity, transitivity, symmetry, etc.) of each relation.
