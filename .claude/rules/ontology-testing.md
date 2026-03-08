---
paths:
  - "ontologies/*/tests/**/*.sparql"
  - "ontologies/*/tests/**/*.py"
  - "ontologies/*/tests/**/*.yaml"
  - "ontologies/*/docs/competency-questions.yaml"
---

# Ontology Testing Conventions (TDOD)

Follow Test-Driven Ontology Development (Keet & Lawrynowicz, 2016):

## Competency Questions

- Every ontology capability must be expressed as a competency question (CQ)
- CQs are formalized as SPARQL queries in `ontologies/{name}/tests/cq-{NNN}.sparql`
- CQs must be registered in both:
  - `ontologies/{name}/docs/competency-questions.yaml` (full specification)
  - `ontologies/{name}/tests/cq-test-manifest.yaml` (test runner manifest)
- CQ SPARQL tests must be added to the parametrized test list in
  `ontologies/{name}/tests/test_ontology.py`

## SPARQL Query Standards

- All queries must include PREFIX declarations (no implicit prefixes)
- Use the canonical `enews:` prefix for the energy-news namespace
- Validate syntax before committing
- SELECT queries must return non-empty results on sample data
- ASK queries document expected boolean result

## SHACL Validation

- Shapes live in `ontologies/{name}/shapes/{name}-shapes.ttl`
- SHACL conformance test must pass with `inference="none"`
- SPARQL-based constraints (`sh:SPARQLConstraint`) for cross-property validation

## Test Organization

- `tests/unit/` — Fast tests (rdflib in-memory graphs, no external services)
- `tests/integration/` — Tests requiring ROBOT, reasoners, or endpoints
- Parametrize CQ tests where possible for maintainability
