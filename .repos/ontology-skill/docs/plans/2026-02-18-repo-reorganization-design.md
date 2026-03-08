# Repo Reorganization: Self-Contained Ontology Projects

**Date**: 2026-02-18
**Status**: Approved

## Problem

Energy-news ontology files are scattered across 6+ locations (root cq-*.csv,
docs/energy-news/, ontologies/energy-news/, tests/energy-news/,
scripts/build_energy_news.py, tests/unit/test_energy_news_ontology.py). The
repo should support developing arbitrary ontologies, each self-contained.

## Design

Each ontology project lives entirely under `ontologies/<name>/` with its own
docs, tests, scripts, mappings, and release artifacts. Top-level directories
hold only general infrastructure.

### Target: ontologies/energy-news/ (self-contained)

```
ontologies/energy-news/
├── docs/                          # All specification & design docs
│   ├── scope.md, orsd.md, use-cases.yaml, competency-questions.yaml
│   ├── glossary.csv, pre-glossary.csv, traceability-matrix.csv
│   ├── conceptual-model.yaml, property-design.yaml, axiom-plan.yaml
│   ├── bfo-alignment.md, anti-pattern-review.md, validation-report.md
│   ├── reuse-report.md, codex-review.md, codex-review-2.md
│   ├── energy-news.html
│   └── cq-exports/              # Root cq-*.csv files move here
├── energy-news.ttl              # TBox (stays)
├── energy-news-reference-individuals.ttl
├── energy-news-data.ttl
├── energy-news-changes.kgcl
├── energy-news-report.tsv
├── catalog-v001.xml
├── robot-report-profile.txt
├── imports/                     # (stays)
├── shapes/                      # (stays)
├── tests/                       # SPARQL + Python tests
│   ├── cq-*.sparql, neg-*, tbox-*, verify-*, prefixes.sparql
│   ├── cq-test-manifest.yaml
│   └── test_ontology.py         # Renamed from test_energy_news_ontology.py
├── scripts/
│   └── build.py                 # Renamed from build_energy_news.py
├── mappings/                    # SSSOM (empty, ready)
└── release/                     # (stays)
```

### Target: top-level (general infrastructure only)

```
├── CLAUDE.md, pyproject.toml, Justfile, README.md
├── docs/                        # General research only
│   ├── ontology_research.md, proposal.md, practitioner-insights.md
│   ├── bfo_extraction.md, kendall_mcguinness_extraction.md
│   ├── knowledge_graphs_extraction.md, change-proposal.md
│   ├── *.pdf (4 academic references)
│   └── plans/
├── src/ontology_skill/          # Shared Python library
├── scripts/                     # General validators
│   ├── validate_turtle.py
│   └── validate_sssom.py
├── tests/
│   ├── unit/test_smoke.py       # General tests only
│   └── integration/
├── sparql/                      # General queries
└── .claude/                     # Skills, rules, hooks
```

### File moves

| From | To |
|------|-----|
| `cq-{001..016}.csv` (root) | `ontologies/energy-news/docs/cq-exports/` |
| `docs/energy-news/*` (17 files) | `ontologies/energy-news/docs/` |
| `tests/energy-news/*` (32 files) | `ontologies/energy-news/tests/` |
| `tests/unit/test_energy_news_ontology.py` | `ontologies/energy-news/tests/test_ontology.py` |
| `scripts/build_energy_news.py` | `ontologies/energy-news/scripts/build.py` |

### Path updates

1. **Build script** (`ontologies/energy-news/scripts/build.py`):
   - `ROOT` = project root (parent of scripts/)
   - `DOCS` = `ROOT / "docs"` (was `ROOT / "docs" / "energy-news"`)
   - `OUT` = `ROOT` (was `ROOT / "ontologies" / "energy-news"`)

2. **Unit test** (`ontologies/energy-news/tests/test_ontology.py`):
   - `ROOT` = project root (parent of tests/)
   - `ONTOLOGY_DIR` = `ROOT` (was `ROOT / "ontologies" / "energy-news"`)
   - `SPARQL_DIR` = `ROOT / "tests"` (was `ROOT / "tests" / "energy-news"`)

3. **Justfile**: Update all energy-news paths to new locations.

4. **`.claude/rules/ontology-testing.md`**: Update path patterns.

5. **`.claude/rules/ontology-build-scripts.md`**: Update example commands.

### Empty directories cleaned up

- Remove empty top-level `mappings/` (each ontology has its own)
- Remove empty `tests/energy-news/` after move
- Remove empty `docs/energy-news/` after move
