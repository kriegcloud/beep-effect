# Practitioner Insights: Real-World Ontology Engineering

Research findings from professional ontology engineering communities,
synthesized to ground our 8-skill workspace in actual practice rather
than academic theory.

**Date**: 2026-02-10
**Scope**: OBO Foundry, ROBOT/ODK, oaklib, SSSOM, LinkML, BFO, and
broader semantic web practitioner communities.

---

## Theme 1: The ODK is the De Facto Standard -- and We Are Not Using It

### Key Insight

The Ontology Development Kit (ODK) is not just a convenience tool; it
is the standard workflow for the entire OBO Foundry ecosystem and
increasingly for non-OBO ontologies. Virtually every actively maintained
OBO ontology uses the ODK Makefile-driven pattern. Our workspace
describes ROBOT commands in isolation but does not acknowledge or
integrate with the ODK pattern, which is how professionals actually
structure their projects.

### What Practitioners Actually Do

- ODK provides a Docker container with all tools pre-installed (ROBOT,
  oaklib, owltools, fastobo-validator, etc.). Teams run `sh run.sh make`
  and get reproducible builds regardless of local environment.
- The ODK generates a complete project skeleton including:
  - A `src/ontology/` directory with an `-edit.owl` working file
  - A `Makefile` (auto-generated from `{name}-odk.yaml`) handling the
    full release pipeline: merge, reason, report, release artifacts
  - Import management: `src/ontology/imports/` with `*_import.owl` and
    `*_terms.txt` files, auto-refreshed via make targets
  - CI/CD via GitHub Actions (`.github/workflows/`)
  - A `SPARQL/` directory for quality checks as SPARQL queries
- The edit-release split is fundamental: developers edit `{name}-edit.owl`
  and never touch release artifacts. The Makefile generates the release
  ontology by merging imports, running the reasoner, and producing
  multi-format outputs.
- Pattern-based term creation uses DOSDP (Dead Simple OWL Design
  Patterns) -- YAML pattern files that generate OWL from TSV data. This
  is more structured than raw ROBOT templates.

### Relevance to Our Skills

- **ontology-architect**: Should understand the ODK edit-release
  pattern, not just isolated ROBOT commands. The skill should know about
  `{name}-edit.owl` vs `{name}.owl` and the Makefile pipeline.
- **ontology-validator**: ODK already runs `robot report`, `robot reason`,
  and custom SPARQL checks in CI. Our validator should integrate with,
  not duplicate, existing ODK pipelines.
- **ontology-curator**: ODK has built-in release workflows. Our curator
  skill should understand `make prepare_release` and similar targets.

### Actionable Recommendations

1. Add an ODK awareness section to `ontology-architect/SKILL.md`
   explaining the edit-release pattern and when to use ODK vs standalone
   ROBOT commands.
2. Add DOSDP pattern support to the architect skill as an alternative to
   raw ROBOT templates for pattern-based term generation.
3. Consider adding `odk-integration.md` to `_shared/` documenting how
   our skills interact with an ODK-managed project vs a standalone
   project.

---

## Theme 2: ROBOT Template Gotchas That Trip Up Everyone

### Key Insight

ROBOT templates are powerful but have numerous subtle pitfalls that are
not documented in the official docs and are learned through painful
experience. The OBO community has accumulated significant tribal
knowledge about these issues.

### What Practitioners Actually Say

- **Column header syntax is fragile**: The second row of a ROBOT
  template defines the column semantics (e.g., `SC %`, `A rdfs:label`,
  `EC %`). A single typo or extra space causes silent failures or
  incorrect output rather than errors.
- **The `%` placeholder**: `SC %` means "SubClassOf with value from this
  column." But `SC 'has part' some %` (with an embedded relation) is
  where most mistakes happen -- the quoting and spacing must be exact.
- **Merge vs replace semantics**: `robot template --merge-before` and
  `--merge-after` control whether the template output is merged with the
  input ontology or replaces it. Getting this wrong can delete your
  entire ontology.
- **IRI resolution**: Template values must be full IRIs or CURIEs that
  resolve via the ontology's prefix declarations. Undeclared prefixes
  produce blank or invalid output.
- **Multi-value columns**: To put multiple superclasses or annotations
  on one term, use `SPLIT=|` in the column header syntax. This is not
  obvious from the documentation.
- **Empty cells**: Empty cells in required columns silently skip the row
  rather than raising an error. This can cause terms to be partially
  created (label but no definition, for example).
- **Annotation language tags**: To add a language tag to a label or
  definition, use `A rdfs:label@en` in the header. Without the tag,
  labels are untagged string literals, which causes problems with tools
  that filter by language.

### Relevance to Our Skills

- **ontology-architect**: The ROBOT template workflow (Step 3) needs
  explicit warnings about these pitfalls.
- **ontology-validator**: Should check for common ROBOT template output
  issues (missing language tags, partially-created terms).

### Actionable Recommendations

1. Add a "ROBOT Template Pitfalls" subsection to the architect skill
   with the specific gotchas listed above.
2. Add a SPARQL check for terms missing language tags on labels to the
   quality checklist.
3. Include a template validation step before running `robot template`:
   check that all column headers parse correctly and all CURIEs resolve.

---

## Theme 3: oaklib/runoak Is More Fragile Than Advertised

### Key Insight

oaklib is a powerful tool but has significant rough edges that
practitioners regularly encounter. The community reports frequent issues
with adapter inconsistencies, KGCL limitations, and version
compatibility.

### What Practitioners Actually Report

- **Adapter inconsistency**: oaklib supports multiple backends (SQLite,
  OLS, BioPortal, local OWL files, Ubergraph). But operations that work
  on one adapter may fail or return different results on another. For
  example, `runoak -i sqlite:obo:go search "cell"` returns different
  result formats than `runoak -i ols: search "cell"`.
- **KGCL implementation is incomplete**: Not all KGCL commands are fully
  implemented in oaklib. `obsolete` works reliably, but some complex
  operations like `create axiom` with full Manchester Syntax may fail or
  produce unexpected results. The KGCL parser is actively developed and
  can be version-sensitive.
- **SQLite adapter caching**: The `sqlite:obo:` adapter downloads and
  caches SQLite versions of OBO ontologies. These can become stale, and
  there is no automatic cache invalidation. Practitioners manually
  delete `~/.data/oaklib/` to force refresh.
- **Local file editing via runoak**: Applying KGCL changes to local
  `.ttl` or `.owl` files via oaklib can produce output in a different
  serialization format or with different prefix ordering than the input.
  This causes noisy diffs in version control.
- **Performance on large ontologies**: oaklib's SQLite adapter is fast
  for search and navigation but slow for bulk KGCL application. For
  large batch changes, practitioners often fall back to ROBOT or direct
  rdflib manipulation.

### Relevance to Our Skills

- **ontology-architect** and **ontology-curator**: Both skills recommend
  KGCL via oaklib for individual changes. They need to document
  limitations and fallback strategies.
- **ontology-scout**: The search workflow relies heavily on oaklib
  adapters and needs to account for adapter inconsistencies.

### Actionable Recommendations

1. Add an "oaklib Limitations" subsection to `_shared/tool-decision-tree.md`
   documenting known adapter issues and KGCL implementation gaps.
2. Add a fallback strategy: for KGCL commands that fail via oaklib,
   fall back to direct rdflib manipulation or ROBOT operations.
3. Document the serialization instability issue and recommend using
   `robot convert` after oaklib edits to normalize serialization before
   committing.
4. Add cache management guidance: when to clear the oaklib SQLite cache.

---

## Theme 4: SSSOM Mapping Is Harder Than the Spec Suggests

### Key Insight

The SSSOM specification is well-designed, but real-world mapping
practice involves challenges that the spec does not address. The
mapping-commons community and Monarch Initiative practitioners have
accumulated significant practical knowledge about mapping workflows.

### What Practitioners Actually Encounter

- **Lexical matching produces massive false positive rates**: oaklib's
  lexmatch generates many candidates, but in practice, 40-60% of
  matches at the 0.7-0.95 confidence level are incorrect. Labels match
  but meanings differ (homonyms across domains). The LLM verification
  step is not optional -- it is essential.
- **The exactMatch transitivity trap is real and dangerous**: If you
  declare A exactMatch B and B exactMatch C, then A exactMatch C is
  implied. In large mapping sets, this creates "mapping cliques" where
  terms from 5+ ontologies are all declared equivalent to each other.
  Practitioners regularly find that one bad mapping in a clique
  contaminates all the others.
- **SSSOM metadata is burdensome but critical**: In practice, teams
  often skip the `mapping_justification` field or use a single value
  for all mappings. This makes it impossible to audit mappings later.
  The SEMAPV vocabulary for justifications is not well-known.
- **Version management of mappings is unsolved**: When source or target
  ontologies release new versions, existing mappings can break silently.
  There is no standard workflow for "mapping maintenance." Teams
  typically re-run lexmatch and diff the results, which is error-prone.
- **Cross-species and cross-domain mappings are qualitatively different**:
  Mapping between two ontologies in the same domain (e.g., two disease
  ontologies) is very different from mapping across domains (e.g.,
  disease to phenotype). The predicate selection guidance needs to
  account for this.
- **The sssom-py tool has rough edges**: Validation can be overly strict
  on some fields and too lenient on others. The merge operation does not
  always handle conflicting metadata headers gracefully.

### Relevance to Our Skills

- **ontology-mapper**: This is our most practice-sensitive skill.
  Several workflow assumptions need updating.

### Actionable Recommendations

1. Increase the LLM verification threshold: change auto-accept from
   >= 0.95 to >= 0.98, and require exact label match AND compatible
   parent classes.
2. Add a mandatory "clique analysis" step after mapping: compute the
   transitive closure of exactMatch and flag cliques larger than 3 for
   human review.
3. Add a "Mapping Maintenance" workflow (Workflow 3) for handling
   ontology version updates -- the current Workflow 2 covers this but
   needs more detail on the full re-validation process.
4. Add cross-domain mapping guidance: when mapping across domains, default
   to `skos:relatedMatch` or `skos:closeMatch`, not `skos:exactMatch`.
5. Add sssom-py version pinning guidance and document known validation
   quirks.

---

## Theme 5: BFO Alignment Is the #1 Source of Practitioner Confusion

### Key Insight

BFO alignment is theoretically clean but practically contentious. The
OBO Foundry community has years of debates about specific alignment
decisions, and many of these have no clear resolution. Our BFO
categories reference is good but misses the areas of genuine ambiguity.

### What Practitioners Actually Debate

- **Disease as Disposition vs Process**: BFO classifies disease as a
  Disposition (a tendency toward pathological processes), but many
  practitioners (especially from clinical backgrounds) think of disease
  as something that "happens" (a process) or something you "have" (an
  independent continuant). The OGMS (Ontology for General Medical
  Science) interpretation is that a disease is a Disposition, but this
  is not universally accepted.
- **Organization as Object vs Object Aggregate**: BFO 2020 treats
  organizations as Objects, but many biomedical ontologies model them as
  Object Aggregates (collections of people). The correct answer depends
  on whether you consider the organization's identity to persist through
  member changes (Object) or to be constituted by its members
  (Aggregate). There is no consensus.
- **Information entities are always tricky**: The ICE (Information
  Content Entity) pattern from IAO requires modeling information as a
  Generically Dependent Continuant (GDC) that is concretized in a
  Specifically Dependent Continuant (SDC) which inheres in a Material
  Entity. This three-hop pattern is correct but confusing to implement.
  Many practitioners skip the concretization step.
- **Roles vs Dispositions**: The distinction between Role (exists due to
  social/contextual factors) and Disposition (exists due to physical
  makeup) is theoretically clear but practically ambiguous. Is "being
  toxic" a disposition or a role? Is "being a drug" a function, a
  disposition, or a role? These questions have been debated for years.
- **The "what about X?" problem**: Practitioners regularly encounter
  entities that do not fit cleanly into BFO categories: algorithms,
  software, social conventions, legal entities, money, prices. BFO was
  designed for natural science ontologies and can be awkward for social,
  legal, or computational domains.
- **BFO 2020 vs BFO 2.0**: There are differences between the published
  book (2015, based on BFO 2.0) and the ISO standard (BFO 2020). Some
  category names and relations have changed. Practitioners must know
  which version they are aligning to.

### Relevance to Our Skills

- **ontology-conceptualizer**: The BFO alignment step needs to
  acknowledge genuine ambiguity and provide guidance for disputed cases.
- **_shared/bfo-categories.md**: Needs to document the common
  controversy areas, not just the clean decision tree.

### Actionable Recommendations

1. Add a "Known Ambiguities" section to `bfo-categories.md` documenting
   the disease, organization, information, and role/disposition debates
   with the current community consensus (or lack thereof).
2. For each ambiguous case, provide the recommended default alignment
   AND the alternative, with guidance on when to choose each.
3. Add a note about BFO version differences (2015 book vs 2020 ISO).
4. For non-natural-science domains (social, legal, computational), add
   guidance on when BFO alignment may not be appropriate and what
   alternatives exist (DOLCE, GFO, or no upper ontology).

---

## Theme 6: The Import Problem Is Everyone's Biggest Pain Point

### Key Insight

Ontology imports are the #1 source of build failures, performance
problems, and maintenance burden in real-world ontology projects. The
OBO community has developed extensive workarounds, but the fundamental
problems remain.

### What Practitioners Actually Experience

- **Import chains can be enormous**: Importing one OBO ontology can pull
  in dozens of transitive imports, each with its own imports. GO imports
  pull in RO, BFO, CHEBI fragments, etc. A "simple" import can add
  hundreds of thousands of axioms.
- **Import freshness**: OBO ontologies are released on different
  schedules. When you import GO, you import a specific version. When GO
  updates and changes a term you depend on, your import is stale. The
  ODK handles this with `make refresh-imports`, but it can break things.
- **MIREOT vs STAR vs BOT extraction**: The extraction method matters
  enormously.
  - MIREOT: minimal (just the term and its ancestors). Fast but you lose
    sibling context and some axioms.
  - STAR: includes all axioms involving the term. More complete but can
    pull in unexpected classes.
  - BOT: bottom module, includes term and all ancestors. Good middle
    ground.
  Most practitioners use MIREOT for large ontologies and STAR for small
  ones, but the choice is project-specific.
- **Circular imports**: Occasionally, ontology A imports B which imports
  C which imports A (or a fragment of A). This causes reasoner failures
  and is surprisingly common in the OBO ecosystem.
- **Import curation files**: The `*_terms.txt` file pattern (one IRI per
  line listing which terms to import) is easy to maintain but easy to
  break. Adding a term that has been obsoleted in the source ontology
  causes silent failures during import refresh.

### Relevance to Our Skills

- **ontology-scout**: The module extraction step (Step 4) needs much
  more detail about extraction method trade-offs and import management.
- **ontology-architect**: Needs guidance on managing imports over time.
- **ontology-curator**: Needs an "import refresh" workflow.

### Actionable Recommendations

1. Add extraction method comparison table to the scout skill with
   concrete guidance on when to use MIREOT vs STAR vs BOT.
2. Add an "Import Management" section to the architect skill covering:
   term file maintenance, import refresh workflow, circular import
   detection.
3. Add an "Import Refresh" workflow to the curator skill for handling
   upstream ontology updates.
4. Add a SPARQL check to the validator for detecting references to
   obsoleted imported terms.

---

## Theme 7: Reasoner Performance Is a Real Engineering Constraint

### Key Insight

Reasoner performance is not just a "nice to have" concern -- it is a
hard engineering constraint that shapes ontology design decisions.
Practitioners regularly make modeling trade-offs specifically to keep
reasoning tractable.

### What Practitioners Actually Do

- **ELK is the workhorse, not HermiT**: In practice, most OBO ontologies
  use ELK as their primary reasoner because HermiT is too slow on large
  ontologies (10K+ classes). ELK handles the OWL 2 EL profile, which
  covers most taxonomic reasoning needs. HermiT is reserved for
  pre-release validation or small ontologies.
- **Reasoner timeout is a common CI failure**: Many ontology CI pipelines
  have a 30-60 minute timeout. Complex ontologies (especially those with
  qualified cardinality restrictions or heavy use of universal
  restrictions) can exceed this. Teams restructure axioms to stay within
  time budgets.
- **Materialization vs on-demand**: Some teams pre-compute the reasoner
  output ("materialize" inferred axioms into the release file) while
  others ship the asserted ontology and let consumers reason. The ODK
  default is to materialize (robot reason --output includes inferred
  axioms).
- **Incremental reasoning is not widely supported**: Unlike compilers,
  OWL reasoners typically re-classify the entire ontology even for a
  single axiom change. This makes the "reason after every change"
  guidance impractical for interactive development. In practice, teams
  reason at commit time (pre-commit hook or CI), not after every edit.
- **Profile violations cause silent degradation**: If you use OWL 2 DL
  features (like qualified cardinality) but run ELK (which only supports
  EL), the reasoner silently ignores the unsupported axioms. This can
  cause missed inferences that are hard to debug.

### Relevance to Our Skills

- **ontology-architect**: The "ALWAYS run reasoner after changes"
  guidance is aspirational but impractical for large ontologies during
  active development. Need to provide more nuanced guidance.
- **ontology-validator**: Needs to understand reasoner limitations and
  profile-specific behavior.
- **_shared/tool-decision-tree.md**: Already has reasoner selection
  guidance but needs the performance context.

### Actionable Recommendations

1. Refine the "always run reasoner" guidance: distinguish between
   lightweight CI reasoning (ELK, every commit) and heavyweight
   validation reasoning (HermiT, pre-release only).
2. Add timing expectations: ELK on a 10K-class ontology takes seconds;
   HermiT on the same may take minutes to hours.
3. Add guidance on profile compliance checking: recommend running
   `robot validate-profile` (or equivalent) to detect axioms that will
   be ignored by the chosen reasoner.
4. Document the materialization decision: when to include inferred
   axioms in the release vs ship asserted-only.

---

## Theme 8: CI/CD for Ontologies Is Not Like CI/CD for Code

### Key Insight

While our workspace correctly advocates for CI/CD, ontology CI/CD has
unique characteristics that differ from software CI/CD in important
ways. The OBO community has evolved specific patterns.

### What Practitioners Actually Implement

- **GitHub Actions are standard**: Almost all OBO ontologies use GitHub
  Actions for CI. The typical workflow:
  1. On PR: run `robot report`, check for ERRORs
  2. On PR: run `robot reason`, check consistency
  3. On PR: run custom SPARQL checks
  4. On merge to main: run full release pipeline
  5. On tag: create GitHub release with multi-format artifacts
- **The "dashboard" pattern**: The OBO Foundry runs a community-wide
  dashboard (http://dashboard.obofoundry.org/) that scores every OBO
  ontology on quality metrics. Ontologies that fall below thresholds get
  flagged. This is a powerful social incentive for quality.
- **Pre-commit hooks for ontologies are rare**: Unlike code linting,
  ontology pre-commit hooks are uncommon because reasoning takes too
  long. Most teams rely on CI rather than pre-commit.
- **Diff-based review is hard**: `robot diff` produces output, but
  reviewing OWL diffs is much harder than reviewing code diffs. Changes
  to blank nodes, IRI reordering, and serialization changes create noise.
  Teams use `robot diff --format markdown` for human-readable output
  but it still requires ontology expertise to review.
- **Release management follows OBO conventions**: OBO ontologies use
  date-based versioning (YYYY-MM-DD), not semver. The release artifact
  is always at a stable PURL (e.g., http://purl.obolibrary.org/obo/go.owl)
  with versioned IRIs for each release.

### Relevance to Our Skills

- **ontology-validator**: Should understand the GitHub Actions patterns
  and dashboard metrics.
- **ontology-curator**: The release pipeline should follow OBO
  conventions (date-based versioning, PURL management).
- **CLAUDE.md**: Pre-commit hook expectations need to be realistic.

### Actionable Recommendations

1. Add a GitHub Actions workflow template to the workspace (or
   reference the ODK-generated one).
2. Document the OBO dashboard metrics and how they map to our quality
   checklist.
3. Revise expectations about pre-commit hooks: Python linting hooks are
   fine, but ontology reasoning should be in CI, not pre-commit.
4. Add `robot diff --format markdown` as the standard diff format for
   PR descriptions.
5. Document OBO date-based versioning alongside semver in the curator
   skill (currently only semver is documented).

---

## Theme 9: LinkML Is Great for Data Models, Awkward for Rich Ontologies

### Key Insight

LinkML is increasingly popular but has a specific sweet spot. The
community has learned where it excels and where it causes problems.
Our workspace treats it as a general-purpose ontology tool, which
overstates its scope.

### What Practitioners Actually Report

- **LinkML excels at data modeling**: It is outstanding for defining
  data schemas that need to be expressed in multiple formats (JSON
  Schema, SHACL, Python dataclasses, SQL DDL). The Monarch Initiative
  and NMDC use it extensively for data models.
- **LinkML is not ideal for rich OWL ontologies**: The OWL generator
  from LinkML produces relatively flat ontologies. Complex axiom
  patterns (qualified cardinality, property chains, complex equivalent
  class expressions) cannot be expressed in LinkML YAML and require
  post-processing with ROBOT or OWLAPY.
- **Schema-first vs ontology-first is a real design choice**: Some
  projects start with LinkML and generate OWL (schema-first). Others
  start with OWL and generate data validation artifacts. The choice
  depends on whether the primary artifact is a data schema or a domain
  ontology.
- **LinkML and OWL can coexist**: Some projects use LinkML for the data
  model (ABox validation) and a separate hand-crafted OWL ontology for
  the domain model (TBox). The two are linked via prefix alignment.
- **LinkML versioning and ecosystem churn**: The LinkML toolchain is
  actively evolving, and breaking changes between versions are not
  uncommon. Practitioners pin versions carefully.

### Relevance to Our Skills

- **ontology-architect**: The LinkML step (Step 6) is positioned as
  "for new ontologies" but should be more clearly scoped.
- **_shared/tool-decision-tree.md**: LinkML escalation criteria need
  refinement.

### Actionable Recommendations

1. Refine LinkML guidance in the architect skill: recommend it for data
   model schemas (ABox validation artifacts) rather than rich TBox
   ontologies.
2. Add a note that LinkML-generated OWL typically needs enrichment with
   ROBOT or OWLAPY for complex axioms.
3. In the tool decision tree, clarify that LinkML is best when the
   primary deliverable is a data schema, not a formal ontology.

---

## Theme 10: Domain/Range Is the Most Misunderstood OWL Feature

### Key Insight

Our anti-patterns document (#10) correctly identifies domain/range
overcommitment, but the depth of confusion in the community suggests
this needs even more emphasis. This is the single most common "gotcha"
that practitioners encounter.

### What Practitioners Actually Get Wrong

- **Domain/range as constraints vs inference**: Most newcomers (and many
  experienced practitioners) treat `rdfs:domain` and `rdfs:range` as
  constraints (like SQL foreign keys). They are not. They are inference
  rules. If you declare `prescribes rdfs:domain Physician`, then ANY
  subject of a `prescribes` triple is inferred to be a Physician -- even
  if it is a nurse or a veterinarian.
- **The SHACL alternative is underused**: When you actually want to
  constrain usage, SHACL `sh:class` on a property shape is the correct
  approach. But many ontology engineers do not know SHACL well enough
  to use it for this purpose.
- **Global vs local restrictions**: OWL domain/range are global (apply
  everywhere the property is used). Class-level restrictions
  (SubClassOf hasP some/only C) are local (apply only to that class).
  This distinction is fundamental but poorly taught.
- **The "too narrow domain" cascade**: Setting domain to a leaf class
  causes everything that uses the property to be classified as that leaf
  class. This is a major source of unexpected unsatisfiable classes.

### Relevance to Our Skills

- **ontology-conceptualizer**: The property design step needs explicit
  guidance on when to use domain/range vs local restrictions vs SHACL.
- **ontology-architect**: Needs concrete examples of the domain/range
  pitfall and the correct alternatives.
- **ontology-validator**: Should detect overly narrow domain/range
  declarations.

### Actionable Recommendations

1. Elevate the domain/range warning from anti-pattern #10 to a
   prominent callout in both the conceptualizer and architect skills.
2. Add a decision procedure: "Do you want inference or validation? If
   inference, use OWL domain/range. If validation, use SHACL sh:class."
3. Add a SPARQL query to the quality checklist that detects properties
   with domain/range set to leaf classes (high risk of misclassification).

---

## Theme 11: Competency Questions Are Often Cargo-Culted

### Key Insight

While CQ-driven development is methodologically sound, in practice many
teams treat CQs as a checkbox exercise rather than a genuine design
driver. Our requirements skill is strong but could benefit from
awareness of how CQs fail in practice.

### What Practitioners Actually Experience

- **CQs are written after the ontology, not before**: Many teams build
  the ontology first and then retroactively write CQs to justify it.
  This defeats the purpose of CQ-driven design.
- **CQs are too vague to be testable**: "What types of instruments
  exist?" is answerable by anything with a class hierarchy. Good CQs
  are specific enough to fail: "Which string instruments require a bow?"
- **CQ-to-SPARQL translation is non-trivial**: Even experienced
  practitioners struggle to formalize natural language CQs as SPARQL.
  The gap between "What is X?" and a correct SPARQL query is large.
  LLM assistance here is genuinely valuable.
- **CQ tests are rarely maintained**: Teams write CQ SPARQL tests during
  initial development but do not update them as the ontology evolves.
  Tests become stale and are eventually ignored.
- **CQ prioritization is political**: MoSCoW prioritization depends on
  stakeholder power dynamics. The most vocal stakeholder's CQs become
  "Must Have" regardless of actual importance.

### Relevance to Our Skills

- **ontology-requirements**: The CQ workflow is well-structured but
  should include warnings about these failure modes.

### Actionable Recommendations

1. Add an explicit process check: CQs must be written BEFORE
   conceptualization begins. Include a gate/checkpoint.
2. Add CQ quality criteria: every CQ must be specific enough that a
   reasonable SPARQL query could return zero results (i.e., it can fail).
3. Emphasize that the LLM (our agent) is well-suited for CQ-to-SPARQL
   translation -- this is a high-value use case for the skill.
4. Add CQ maintenance guidance: CQ tests must be reviewed and updated
   with every ontology version change (link to curator skill).
5. Add a note about prioritization bias and recommend involving multiple
   stakeholders independently before consolidation.

---

## Theme 12: OWLAPY/owlready2 Are Not Widely Used in the OBO Community

### Key Insight

Our workspace treats OWLAPY and owlready2 as key secondary tools, but
in the OBO community, they are rarely used. The community relies almost
entirely on ROBOT + oaklib + rdflib for programmatic ontology work.

### What Practitioners Actually Use

- **ROBOT + oaklib cover 95% of use cases**: Between ROBOT templates,
  ROBOT operations, and oaklib KGCL, there is very little need for
  Python-level OWL manipulation in typical ontology engineering.
- **rdflib is the Python escape hatch**: When practitioners need to
  manipulate ontologies programmatically in Python, they typically use
  rdflib directly (working at the triple level) rather than OWLAPY or
  owlready2 (working at the axiom level).
- **OWLAPY has a small community**: The OWLAPY project (dice-group) is
  primarily used by the DICE research group for ML-on-ontologies work,
  not by the broader ontology engineering community.
- **owlready2 is used for specific tasks**: owlready2 has a niche for
  Python applications that need to load and reason over ontologies at
  runtime (e.g., clinical decision support). It is not commonly used
  for ontology building.
- **The JVM dependency is a blocker**: OWLAPY requires a JVM, which
  adds complexity to Python environments. Many practitioners avoid it
  for this reason alone.

### Relevance to Our Skills

- **ontology-architect**: The tool decision tree correctly positions
  OWLAPY and owlready2 as secondary, but the OWLAPY code example in
  the architect skill may set unrealistic expectations.
- **_shared/tool-decision-tree.md**: The escalation to OWLAPY should
  note that most practitioners would use rdflib or ROBOT instead.

### Actionable Recommendations

1. Add rdflib as a more prominent secondary tool for programmatic OWL
   manipulation. Show a rdflib example for adding complex axioms
   alongside (or instead of) the OWLAPY example.
2. Note in the tool decision tree that OWLAPY is primarily for use cases
   requiring the full OWL API (e.g., computing entailments, working with
   DL learners) rather than for building ontologies.
3. Keep owlready2 for the specific use case of runtime ontology
   interaction in Python applications.

---

## Theme 13: SHACL Adoption Is Growing But SHACL Shape Authoring Is Hard

### Key Insight

SHACL is increasingly used in ontology workflows, but writing good SHACL
shapes is a distinct skill that ontology engineers often lack. The gap
between "we should use SHACL" and "here are our shapes" is significant.

### What Practitioners Actually Report

- **SHACL shape libraries are rare**: Unlike OWL ontologies (which have
  extensive reuse ecosystems), reusable SHACL shape libraries are still
  uncommon. Each project writes shapes from scratch.
- **SHACL-SPARQL is powerful but complex**: Advanced SHACL shapes
  (using `sh:sparql`) can express arbitrary constraints, but they are
  harder to write and debug than simple property shapes.
- **SHACL targets are tricky**: Getting the targeting right (which nodes
  should a shape apply to?) is error-prone. `sh:targetClass` seems
  simple but interacts with OWL reasoning in non-obvious ways (does it
  target asserted or inferred class membership?).
- **pyshacl has limitations**: pyshacl is the standard Python SHACL
  validator but can be slow on large graphs and does not support all
  SHACL-SPARQL features. Some teams use Apache Jena's SHACL validator
  instead.
- **OWL and SHACL can conflict**: It is possible to write SHACL shapes
  that contradict OWL axioms (e.g., SHACL says max 1, OWL says
  functional). Understanding the interaction between the two systems
  requires expertise in both.

### Relevance to Our Skills

- **ontology-architect**: The skill mentions generating SHACL shapes
  but does not provide templates or patterns.
- **ontology-validator**: Uses pyshacl but does not discuss its
  limitations.

### Actionable Recommendations

1. Add a "Standard SHACL Shape Templates" section to the architect skill
   or a new `_shared/shacl-patterns.md` reference, with copy-paste
   templates for common shapes (label required, definition recommended,
   no orphans, datatype constraints).
2. Document pyshacl limitations in the validator skill and provide Jena
   SHACL as an alternative for large graphs.
3. Add guidance on SHACL-OWL interaction: "SHACL validates data; OWL
   infers from data. Run reasoning first, then validate the
   reasoned output."

---

## Theme 14: The "Never Hand-Edit" Rule Has Practical Exceptions

### Key Insight

Our workspace has a strict "never hand-edit .owl or .ttl files" rule.
While this is a good default, practitioners in the OBO community
regularly hand-edit Turtle files for specific tasks, and the tools
sometimes require it.

### What Practitioners Actually Do

- **Quick annotation fixes**: Fixing a typo in a label or adding a
  missing annotation is often fastest done by editing the Turtle file
  directly. Running a full ROBOT pipeline for a one-character label
  fix is overhead that slows down development.
- **ODK edit files are meant to be edited**: The `{name}-edit.owl` file
  in an ODK project is the working copy. While ODK encourages using
  Protege or ROBOT for structural changes, small annotation edits are
  commonly done directly.
- **Prefix management**: Prefix declarations in Turtle files sometimes
  need manual adjustment, especially after ROBOT operations that add or
  reorder prefixes.
- **Merge conflict resolution**: When two developers edit the same
  ontology file, Git merge conflicts must be resolved manually. This
  inherently involves hand-editing the file.

### Relevance to Our Skills

- **CONVENTIONS.md** and **CLAUDE.md**: The absolute prohibition on
  hand-editing is too strict for practical use.

### Actionable Recommendations

1. Refine the rule to: "Never hand-edit structural axioms (SubClassOf,
   EquivalentClass, DisjointClasses, property assertions). Annotation
   edits (labels, definitions, synonyms) may be hand-edited if followed
   by `robot report` validation."
2. This keeps the safety benefit (structural integrity) while allowing
   practical flexibility for metadata.

---

## Theme 15: LLM-Assisted Ontology Engineering Is Emerging but Immature

### Key Insight

The use of LLMs for ontology engineering is a hot topic but is still in
early stages. The OBO Academy has introduced Claude Code tutorials, and
several research groups are experimenting with LLM-based ontology tools.

### What Practitioners Are Exploring

- **Term suggestion and definition writing**: LLMs are good at
  suggesting terms, writing genus-differentia definitions, and
  identifying synonyms. This is the most mature use case.
- **CQ-to-SPARQL translation**: LLMs can translate natural language CQs
  to SPARQL with reasonable accuracy, especially with few-shot examples.
  This is our requirements skill's strongest LLM use case.
- **Mapping verification**: LLMs can evaluate mapping pairs (given
  labels, definitions, and hierarchical context) and provide predicate
  recommendations. This is the mapper skill's core LLM application.
- **Anti-pattern detection**: LLMs can review ontology structures and
  identify potential anti-patterns, though they need to be guided with
  specific patterns to look for.
- **What LLMs struggle with**: LLMs have difficulty with:
  - Complex DL axiom construction (they hallucinate axiom syntax)
  - Reasoner behavior prediction (they cannot mentally simulate a
    reasoner)
  - Large-scale ontology understanding (they lose context with
    thousands of classes)
  - Nuanced BFO alignment (they default to common-sense classification
    rather than BFO-specific categories)
- **The "confident but wrong" problem**: LLMs generate ontology axioms
  with high confidence even when the axioms are logically incorrect.
  This makes the post-generation validation step absolutely critical.

### Relevance to Our Skills

- **All skills**: Understanding where LLM assistance adds value and
  where it requires verification.

### Actionable Recommendations

1. For each skill, document the specific LLM-assisted steps and the
   specific verification requirements for LLM-generated output.
2. Emphasize that LLM-generated axioms MUST be validated by the reasoner
   -- this is not optional.
3. Add "LLM Verification Required" markers in skill workflows where
   the agent generates ontology content (axioms, definitions, mappings).
4. For BFO alignment, provide the decision tree IN the prompt context
   rather than relying on the LLM's pre-trained knowledge of BFO.

---

## Theme 16: Multi-Ontology Projects Need Explicit Coordination

### Key Insight

Real-world ontology projects rarely involve a single ontology. Most
projects work with 5-20 ontologies (imports, mappings, bridge
ontologies) simultaneously. Our workspace's Pipeline A (new ontology)
assumes a single-ontology focus.

### What Practitioners Actually Manage

- **Import dependency graphs**: A project ontology typically imports
  from 3-10 external ontologies. Managing these imports (version
  pinning, refresh cycles, term list curation) is a significant ongoing
  effort.
- **Bridge ontologies**: When two ontologies need to be connected but
  neither should import the other, a bridge ontology provides the
  linking axioms. Bridge ontology maintenance is a distinct task.
- **Ontology registries**: Projects need to track which ontologies they
  use, which version, and what terms they import. This metadata is
  typically managed in the ODK's `{name}-odk.yaml` configuration.
- **Cross-ontology consistency**: When multiple ontologies are loaded
  together (for reasoning or querying), inconsistencies can arise from
  conflicting axioms across ontologies. This is hard to debug.

### Relevance to Our Skills

- **ontology-scout** and **ontology-mapper**: These skills handle
  cross-ontology work but could benefit from more explicit coordination
  guidance.
- **ontology-curator**: Needs import dependency management.

### Actionable Recommendations

1. Add a "Multi-Ontology Coordination" section to the curator skill
   covering import dependency tracking, bridge ontology maintenance,
   and cross-ontology consistency checking.
2. Consider a workspace-level `imports-manifest.yaml` tracking all
   external ontology dependencies, versions, and refresh dates.

---

## Theme 17: Documentation and Communication Matter More Than Tools

### Key Insight

The most common complaint from ontology practitioners is not about tools
but about communication: between ontology engineers and domain experts,
between ontology consumers and producers, and between team members
working on the same ontology.

### What Practitioners Actually Struggle With

- **Domain experts cannot read OWL**: Manchester Syntax is the most
  readable OWL serialization, but it still requires training. Most
  domain experts can only review natural language definitions, not
  axioms.
- **Ontology documentation is typically poor**: Most ontologies have
  minimal documentation beyond labels and definitions. WIDOCO
  (auto-generated HTML docs) helps but produces verbose output that
  domain experts do not read.
- **Change communication is hard**: When an ontology changes (especially
  deprecations), downstream consumers need to be notified. There is no
  standard notification mechanism.
- **Visualization is essential for review**: Tree views, graph
  visualizations, and tabular summaries are how domain experts actually
  review ontologies. Raw Turtle or OWL files are not reviewable.

### Relevance to Our Skills

- **ontology-conceptualizer**: The conceptual model should be in a
  format that domain experts can review (YAML, tables, diagrams).
- **ontology-curator**: Change communication needs formalization.

### Actionable Recommendations

1. For each skill that produces output, specify the "domain expert
   review format" alongside the machine-readable format. For example:
   the conceptualizer produces `conceptual-model.yaml` (machine) AND
   a summary table (human).
2. Add visualization commands to the conceptualizer and architect skills
   (oaklib `tree` command, mermaid diagrams from SPARQL queries).
3. Add a "Release Notes" template to the curator skill that is written
   for ontology consumers (not developers).

---

## Summary: Top Priority Gaps in Our Current Skills

Ranked by impact on real-world usability:

| # | Gap | Affected Skills | Effort |
|---|-----|----------------|--------|
| 1 | No ODK awareness or integration | architect, validator, curator | Medium |
| 2 | ROBOT template gotchas undocumented | architect | Low |
| 3 | oaklib/KGCL limitations undocumented | architect, curator | Low |
| 4 | Import management underspecified | scout, architect, curator | Medium |
| 5 | BFO alignment ambiguities not acknowledged | conceptualizer, bfo-categories | Low |
| 6 | SSSOM mapping challenges underestimated | mapper | Medium |
| 7 | Reasoner performance not contextualized | architect, validator | Low |
| 8 | Domain/range confusion needs more emphasis | conceptualizer, architect | Low |
| 9 | LinkML scope too broadly stated | architect, tool-decision-tree | Low |
| 10 | SHACL authoring guidance missing | architect, validator | Medium |
| 11 | "Never hand-edit" rule too absolute | CONVENTIONS.md | Low |
| 12 | CI/CD patterns need GitHub Actions examples | validator, curator | Medium |
| 13 | CQ failure modes undocumented | requirements | Low |
| 14 | OWLAPY/owlready2 prominence overstated | architect, tool-decision-tree | Low |
| 15 | Multi-ontology coordination missing | curator, scout | Medium |
| 16 | LLM limitations for ontology work undocumented | all skills | Low |
| 17 | OBO date-based versioning missing | curator | Low |

---

## Cross-Reference: How Findings Map to Our 8 Skills

| Skill | Themes with Actionable Impact |
|-------|-------------------------------|
| ontology-requirements | 11 (CQ cargo-culting) |
| ontology-scout | 1 (ODK), 6 (imports), 16 (multi-ontology) |
| ontology-conceptualizer | 5 (BFO ambiguity), 10 (domain/range), 17 (documentation) |
| ontology-architect | 1 (ODK), 2 (ROBOT gotchas), 3 (oaklib), 7 (reasoner), 9 (LinkML), 12 (OWLAPY), 13 (SHACL), 14 (hand-edit) |
| ontology-mapper | 4 (SSSOM challenges) |
| ontology-validator | 1 (ODK), 7 (reasoner), 8 (CI/CD), 13 (SHACL) |
| sparql-expert | (no major gaps from practitioner perspective) |
| ontology-curator | 1 (ODK), 6 (imports), 8 (CI/CD), 16 (multi-ontology), 17 (documentation) |
