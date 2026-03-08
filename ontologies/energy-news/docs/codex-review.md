# Codex Review — Energy News Ontology Pipeline Artifacts

Reviewed artifacts:
`docs/energy-news/scope.md`, `docs/energy-news/use-cases.yaml`, `docs/energy-news/orsd.md`, `docs/energy-news/competency-questions.yaml`, `docs/energy-news/pre-glossary.csv`, `docs/energy-news/traceability-matrix.csv`, `docs/energy-news/reuse-report.md`, `docs/energy-news/glossary.csv`, `docs/energy-news/conceptual-model.yaml`, `docs/energy-news/bfo-alignment.md`, `docs/energy-news/property-design.yaml`, `docs/energy-news/axiom-plan.yaml`.

Evaluation baseline:
`skills/ontology-requirements/SKILL.md`, `skills/ontology-scout/SKILL.md`, `skills/ontology-conceptualizer/SKILL.md`.

## Findings (ordered by severity)

1. [Critical] Requirements-phase test artifacts are missing.
Evidence: `skills/ontology-requirements/SKILL.md:155-162` and `skills/ontology-requirements/SKILL.md:217-228` require `tests/cq-*.sparql` plus `tests/cq-test-manifest.yaml`; `docs/energy-news/traceability-matrix.csv:2-15` references these test files, but they do not exist under `tests/`. Impact: acceptance criteria are not executable.

2. [Critical] Scout-phase output set is incomplete.
Evidence: `skills/ontology-scout/SKILL.md:227-233` requires reuse report + import term lists + extracted modules + ODP recommendations; only `docs/energy-news/reuse-report.md` is present. Also missing explicit weighted scorecard (`skills/ontology-scout/SKILL.md:76-89`) and CQ benchmark probes (`skills/ontology-scout/SKILL.md:105-114`). Impact: reuse decisions are not fully reproducible and handoff is partial.

3. [Critical] Core modeling inconsistency: `EnergyTopic` classes are used as `coversTopic` object values.
Evidence: CQs use triples like `?article enews:coversTopic enews:EnergyStorage` (`docs/energy-news/competency-questions.yaml:53-57`, `docs/energy-news/competency-questions.yaml:93-95`), while `EnergyTopic` is modeled as a class hierarchy (`docs/energy-news/conceptual-model.yaml:74-191`) and `coversTopic` range is `EnergyTopic` (`docs/energy-news/property-design.yaml:8-13`). Inference claims in `docs/energy-news/conceptual-model.yaml:247-252` and `docs/energy-news/axiom-plan.yaml:37-40` depend on class-subclass propagation through that relation, which is not valid OWL DL behavior without explicit metamodeling strategy. Impact: CQ-to-axiom methodology is unsound at the semantic core.

4. [High] ORSD is stale on term counts.
Evidence: `docs/energy-news/orsd.md:56-57` says "28 candidate classes, 8 candidate properties," but `docs/energy-news/pre-glossary.csv` contains 74 classes and 12 properties. Impact: requirements summary is internally inconsistent with actual artifacts.

5. [High] CQ formalization misses required fields.
Evidence: requirements skill asks for explicit `out_of_scope` boundaries and structured formalization including required-axiom traceability (`skills/ontology-requirements/SKILL.md:103-105`, `skills/ontology-requirements/SKILL.md:116-143`); `docs/energy-news/competency-questions.yaml` has no `out_of_scope` and no `required_axioms` entries. Impact: incomplete requirement contract for downstream formalization/testing.

6. [High] Two use cases do not meet CQ derivation guidance.
Evidence: guidance says 3-10 CQs per use case (`skills/ontology-requirements/SKILL.md:72-74`); `UC-004` has 2 CQs (`docs/energy-news/use-cases.yaml:58`) and `UC-005` has 2 CQs (`docs/energy-news/use-cases.yaml:72`). Impact: likely under-capture of organization/geography information needs.

7. [High] Property design omits required BFO/RO relation field.
Evidence: conceptualizer property schema requires BFO/RO specialization (`skills/ontology-conceptualizer/SKILL.md:106-118`); not present in `docs/energy-news/property-design.yaml`. Impact: weaker upper-level semantic grounding for architect handoff.

8. [Medium] Anti-pattern detection output is not explicit.
Evidence: conceptualizer Step 6 requires anti-pattern review and corrections (`skills/ontology-conceptualizer/SKILL.md:174-190`); no explicit anti-pattern findings section appears in the conceptual artifacts. Impact: unresolved modeling risks are harder to audit.

9. [Medium] CQ SPARQL snippets omit prefix declarations.
Evidence: requirements examples include explicit `PREFIX` blocks (`skills/ontology-requirements/SKILL.md:130-137`); none appear in `docs/energy-news/competency-questions.yaml`. Impact: portability/executability depends on external prefix injection.

10. [Medium] Naming conventions are inconsistently followed.
Evidence: singular CamelCase class convention (`skills/_shared/naming-conventions.md:9-12`) conflicts with names like `GridOperators`, `Tariffs`, `Commodities`, `Patents`, `SupplyChains` in `docs/energy-news/glossary.csv`; data property `has*` convention (`skills/_shared/naming-conventions.md:26-27`) conflicts with `title`, `url`, `domain`, `description`, `publishedDate`, `handle`. Impact: governance drift and avoidable term ambiguity.

11. [Medium] `Author` alignment is semantically conflicted.
Evidence: `Author` is defined as account-level GDC (`docs/energy-news/bfo-alignment.md:70-80`) but aligned as `rdfs:subClassOf schema:Person` (`docs/energy-news/conceptual-model.yaml:212`). Impact: account-vs-person semantics blur in mappings and data integration.

12. [Low] Minor wording inconsistency in axiom plan.
Evidence: CQ-012 says "No additional axioms beyond CQ-003" while introducing `mentionsOrganization` requirement (`docs/energy-news/axiom-plan.yaml:152-156`). Impact: editorial clarity issue.

## Internal consistency checks that passed

1. `pre-glossary.csv` and `glossary.csv` have matching term inventory (86 total; 74 classes, 12 properties).
2. CQ IDs are complete and aligned across `competency-questions.yaml` (14), `traceability-matrix.csv` (14), and `axiom-plan.yaml` (14).
3. Every CQ `required_properties` value is declared in `property-design.yaml`.
4. Glossary class terms match conceptual model class terms (no name drift detected).

## Methodology assessment

1. Genus-differentia definitions are mostly well-formed, but `EnergyTopic` is weakly defined as "An owl:Thing..." (`docs/energy-news/glossary.csv:2`) and should use a more informative genus.
2. BFO rationales are generally explicit and justified in `docs/energy-news/bfo-alignment.md`; however, broad "none (classification category)" treatment for the topic taxonomy departs from stricter conceptualizer handoff expectations (`skills/ontology-conceptualizer/SKILL.md:229-231`).
3. Design decisions are mostly pragmatic and coherent, but the class/instance handling of topics undermines the central CQ/axiom reasoning story.

## Recommended improvements (priority order)

1. Resolve topic representation cleanly: either keep topics as classes and change article classification pattern accordingly, or model topics as concept individuals and align CQ/property/axiom artifacts to that choice.
2. Complete missing phase outputs: generate CQ SPARQL tests + manifest, and produce scout import/ODP artifacts (or explicit waivers).
3. Repair requirement formalization gaps: add `out_of_scope` and `required_axioms` fields to all CQs, and refresh stale ORSD counts.
4. Strengthen conceptualizer deliverables: add BFO/RO relation mapping in property design and explicit anti-pattern review outcomes.
5. Normalize naming/alignment choices: singularize class names, define data property naming policy, and separate `AuthorAccount` semantics from person-level mappings.
