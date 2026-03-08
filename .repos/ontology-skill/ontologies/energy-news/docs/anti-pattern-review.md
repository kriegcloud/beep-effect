# Anti-Pattern Review — Energy News Ontology

Produced by: ontology-conceptualizer remediation (Phase 5)
Per: Conceptualizer SKILL.md Step 6

## Methodology

Checked the conceptual model against 16 known ontology design anti-patterns
from the literature (Rector et al. 2004, Poveda-Villalon et al. 2014, OOPS!
catalog). Each anti-pattern was evaluated against the class hierarchy, property
design, and axiom plan.

## Anti-Patterns Checked

| # | Anti-Pattern | Status | Notes |
|---|-------------|--------|-------|
| 1 | **Lazy Class** (class with no properties or axioms) | Clear | All 8 OWL classes have properties or axioms |
| 2 | **Polysemy** (same name, different meanings) | Flagged | `domain` data property conflicted with OWL keyword `rdfs:domain`. **Fixed**: renamed to `siteDomain` |
| 3 | **Is-a vs. Has-a confusion** | Clear | Hierarchy uses rdfs:subClassOf for classes; skos:broader for topics |
| 4 | **Class-instance confusion (punning)** | Flagged | Original design modeled topic categories as both classes and classification tags. **Fixed**: converted to SKOS Concept individuals |
| 5 | **Overloaded hierarchy** (taxonomy mixing criteria) | Clear | Topic hierarchy uses single-criterion grouping (energy sector) |
| 6 | **Missing disjointness** | Clear | Top-level domain classes are pairwise disjoint; topic siblings use owl:AllDifferent |
| 7 | **Cycles in hierarchy** | Clear | SKOS broader hierarchy is acyclic (tree structure) |
| 8 | **Property domain/range too broad** | Clear | All properties have specific domain and range classes |
| 9 | **Property domain/range too narrow** | Clear | Properties are appropriately scoped |
| 10 | **Missing inverse** | Advisory | `publishedBy` / `postedBy` / `sharesArticle` could have inverses, but inverses are not needed by any CQ. Deferred to architect phase if needed |
| 11 | **Unconnected ontology elements** | Clear | All classes participate in at least one property |
| 12 | **Recursive definition** | Clear | No genus-differentia definitions reference themselves |
| 13 | **Singleton class** | Clear | No classes have exactly one possible instance by design |
| 14 | **Grammatical naming issues** | Clear | All class names are singular CamelCase; 5 plural names were fixed |
| 15 | **Missing annotations** | Clear | All terms have rdfs:label and skos:definition |
| 16 | **Ontology hijacking** (redefining external terms) | Clear | External terms (schema.org, SIOC) are aligned via equivalence/subclass axioms, not redefined |

## Summary

- **16 patterns checked**
- **2 flags found and fixed**: Polysemy (`domain` → `siteDomain`), Class-instance confusion (EnergyTopic → SKOS Concepts)
- **1 advisory**: Missing inverses for 3 object properties (deferred, not needed by CQs)
- **13 clear**: No issues detected

## References

- Rector, A. et al. (2004). "OWL Pizzas: Practical Experience of Teaching OWL-DL"
- Poveda-Villalon, M. et al. (2014). "A reuse-based lightweight method for developing linked data ontologies" (OOPS! pitfall catalog)
- Conceptualizer SKILL.md, Step 6: Anti-Pattern Detection
