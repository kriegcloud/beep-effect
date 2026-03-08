# Repo Reorganization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate all energy-news ontology files into a self-contained project under `ontologies/energy-news/`, making the repo suitable for developing arbitrary ontologies.

**Architecture:** Use `git mv` to preserve history. Create target directories first, move files, then update all internal path references. Verify with existing test suite.

**Tech Stack:** git, Python (pathlib paths), Justfile, Claude rules (YAML frontmatter globs)

---

### Task 1: Create target directories

**Files:**
- Create: `ontologies/energy-news/docs/cq-exports/`
- Create: `ontologies/energy-news/tests/`
- Create: `ontologies/energy-news/scripts/`
- Create: `ontologies/energy-news/mappings/`

**Step 1: Create directories**

```bash
mkdir -p ontologies/energy-news/docs/cq-exports
mkdir -p ontologies/energy-news/tests
mkdir -p ontologies/energy-news/scripts
mkdir -p ontologies/energy-news/mappings
```

**Step 2: Commit**

```bash
git add ontologies/energy-news/mappings/.gitkeep
git commit -m "chore(energy-news): create self-contained project directories"
```

Note: `mappings/` needs a .gitkeep since it's empty. The other dirs will have files moved into them.

---

### Task 2: Move root cq-*.csv files

**Files:**
- Move: `cq-001.csv` through `cq-016.csv` → `ontologies/energy-news/docs/cq-exports/`

**Step 1: git mv all CSV files**

```bash
git mv cq-*.csv ontologies/energy-news/docs/cq-exports/
```

**Step 2: Commit**

```bash
git commit -m "chore(energy-news): move CQ export CSVs into project docs"
```

---

### Task 3: Move docs/energy-news/ into project

**Files:**
- Move: all 17 files from `docs/energy-news/*` → `ontologies/energy-news/docs/`
- Remove: empty `docs/energy-news/` directory

**Step 1: git mv all doc files**

```bash
git mv docs/energy-news/* ontologies/energy-news/docs/
```

This moves: scope.md, orsd.md, use-cases.yaml, competency-questions.yaml, glossary.csv, pre-glossary.csv, conceptual-model.yaml, property-design.yaml, axiom-plan.yaml, traceability-matrix.csv, bfo-alignment.md, anti-pattern-review.md, validation-report.md, reuse-report.md, codex-review.md, codex-review-2.md, energy-news.html

**Step 2: Remove empty directory**

```bash
rmdir docs/energy-news
```

**Step 3: Commit**

```bash
git commit -m "chore(energy-news): move spec docs into project directory"
```

---

### Task 4: Move tests/energy-news/ into project

**Files:**
- Move: all 32+ files from `tests/energy-news/*` → `ontologies/energy-news/tests/`
- Move: `tests/unit/test_energy_news_ontology.py` → `ontologies/energy-news/tests/test_ontology.py`
- Remove: empty `tests/energy-news/` directory

**Step 1: git mv SPARQL tests**

```bash
git mv tests/energy-news/* ontologies/energy-news/tests/
```

**Step 2: git mv Python unit test (with rename)**

```bash
git mv tests/unit/test_energy_news_ontology.py ontologies/energy-news/tests/test_ontology.py
```

**Step 3: Remove empty directory**

```bash
rmdir tests/energy-news
```

**Step 4: Commit**

```bash
git commit -m "chore(energy-news): move tests into project directory"
```

---

### Task 5: Move build script into project

**Files:**
- Move: `scripts/build_energy_news.py` → `ontologies/energy-news/scripts/build.py`

**Step 1: git mv with rename**

```bash
git mv scripts/build_energy_news.py ontologies/energy-news/scripts/build.py
```

**Step 2: Commit**

```bash
git commit -m "chore(energy-news): move build script into project directory"
```

---

### Task 6: Update build script paths

**Files:**
- Modify: `ontologies/energy-news/scripts/build.py` (lines 1-11, 49-51)

**Step 1: Update docstring**

Change lines 1-11 from:
```python
"""Build the Energy News Ontology from conceptual model artifacts.

Reads glossary.csv, conceptual-model.yaml, and property-design.yaml to produce:
  - ontologies/energy-news/energy-news.ttl (TBox: classes, properties, axioms)
  - ontologies/energy-news/energy-news-reference-individuals.ttl (SKOS topic individuals)
  - ontologies/energy-news/energy-news-data.ttl (Representative ABox sample data)
  - ontologies/energy-news/shapes/energy-news-shapes.ttl (SHACL structural shapes)

Usage:
    uv run python scripts/build_energy_news.py
"""
```

To:
```python
"""Build the Energy News Ontology from conceptual model artifacts.

Reads glossary.csv, conceptual-model.yaml, and property-design.yaml to produce:
  - energy-news.ttl (TBox: classes, properties, axioms)
  - energy-news-reference-individuals.ttl (SKOS topic individuals)
  - energy-news-data.ttl (Representative ABox sample data)
  - shapes/energy-news-shapes.ttl (SHACL structural shapes)

Usage:
    uv run python ontologies/energy-news/scripts/build.py
"""
```

**Step 2: Update path constants**

Change lines 48-51 from:
```python
# Project root
ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs" / "energy-news"
OUT = ROOT / "ontologies" / "energy-news"
```

To:
```python
# Ontology project root (ontologies/energy-news/)
PROJECT = Path(__file__).resolve().parent.parent
DOCS = PROJECT / "docs"
OUT = PROJECT
```

**Step 3: Update the docstring on load_yaml**

Change line 82 from:
```python
    """Load a YAML file from docs/energy-news/."""
```

To:
```python
    """Load a YAML file from the project docs/ directory."""
```

**Step 4: Update references from ROOT to PROJECT**

In `main()` there's no explicit `ROOT` usage beyond `DOCS` and `OUT`, which are already updated. But grep for any remaining `ROOT` references and update to `PROJECT`.

**Step 5: Run the build to verify**

```bash
uv run python ontologies/energy-news/scripts/build.py
```

Expected: Build completes, regenerates .ttl files in `ontologies/energy-news/`.

**Step 6: Commit**

```bash
git add ontologies/energy-news/scripts/build.py
git commit -m "fix(energy-news): update build script paths for new project layout"
```

---

### Task 7: Update test file paths

**Files:**
- Modify: `ontologies/energy-news/tests/test_ontology.py` (lines 21-27)

**Step 1: Update path constants**

Change lines 21-27 from:
```python
ROOT = Path(__file__).resolve().parent.parent.parent
ONTOLOGY_DIR = ROOT / "ontologies" / "energy-news"
TBOX_PATH = ONTOLOGY_DIR / "energy-news.ttl"
REF_PATH = ONTOLOGY_DIR / "energy-news-reference-individuals.ttl"
DATA_PATH = ONTOLOGY_DIR / "energy-news-data.ttl"
SHAPES_PATH = ONTOLOGY_DIR / "shapes" / "energy-news-shapes.ttl"
SPARQL_DIR = ROOT / "tests" / "energy-news"
```

To:
```python
PROJECT = Path(__file__).resolve().parent.parent
TBOX_PATH = PROJECT / "energy-news.ttl"
REF_PATH = PROJECT / "energy-news-reference-individuals.ttl"
DATA_PATH = PROJECT / "energy-news-data.ttl"
SHAPES_PATH = PROJECT / "shapes" / "energy-news-shapes.ttl"
SPARQL_DIR = PROJECT / "tests"
```

**Step 2: Run the tests to verify**

```bash
uv run pytest ontologies/energy-news/tests/test_ontology.py -v
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add ontologies/energy-news/tests/test_ontology.py
git commit -m "fix(energy-news): update test paths for new project layout"
```

---

### Task 8: Update Justfile

**Files:**
- Modify: `Justfile`

**Step 1: Update build-energy-news recipe** (line 108)

Change:
```just
build-energy-news:
    uv run python scripts/build_energy_news.py
```

To:
```just
build-energy-news:
    uv run python ontologies/energy-news/scripts/build.py
```

**Step 2: Update validate-energy-news recipe** (line 130)

Change the test line from:
```just
    uv run pytest tests/unit/test_energy_news_ontology.py -v
```

To:
```just
    uv run pytest ontologies/energy-news/tests/test_ontology.py -v
```

**Step 3: Update doc-energy-news recipe** (line 140)

Change the pylode output path from:
```just
    uv run pylode /tmp/energy-news-pylode.ttl \
        -o docs/energy-news/energy-news.html -c true
    @echo "Documentation generated: docs/energy-news/energy-news.html"
```

To:
```just
    uv run pylode /tmp/energy-news-pylode.ttl \
        -o ontologies/energy-news/docs/energy-news.html -c true
    @echo "Documentation generated: ontologies/energy-news/docs/energy-news.html"
```

**Step 4: Run just check to verify**

```bash
just build-energy-news
```

Expected: Build runs successfully with new paths.

**Step 5: Commit**

```bash
git add Justfile
git commit -m "fix: update Justfile paths for reorganized project layout"
```

---

### Task 9: Update .claude/rules/ path patterns

**Files:**
- Modify: `.claude/rules/ontology-testing.md` (lines 1-7, 17-19)
- Modify: `.claude/rules/ontology-build-scripts.md` (lines 1-5, 29-33)

**Step 1: Update ontology-testing.md paths frontmatter**

Change:
```yaml
---
paths:
  - "tests/**/*.sparql"
  - "tests/**/*.py"
  - "tests/**/*.yaml"
  - "docs/**/competency-questions.yaml"
---
```

To:
```yaml
---
paths:
  - "ontologies/*/tests/**/*.sparql"
  - "ontologies/*/tests/**/*.py"
  - "ontologies/*/tests/**/*.yaml"
  - "ontologies/*/docs/competency-questions.yaml"
---
```

**Step 2: Update ontology-testing.md body references**

Change line 18 from:
```
- CQs are formalized as SPARQL queries in `tests/{name}/cq-{NNN}.sparql`
```
To:
```
- CQs are formalized as SPARQL queries in `ontologies/{name}/tests/cq-{NNN}.sparql`
```

Change line 19-20 from:
```
- CQs must be registered in both:
  - `docs/{name}/competency-questions.yaml` (full specification)
  - `tests/{name}/cq-test-manifest.yaml` (test runner manifest)
```
To:
```
- CQs must be registered in both:
  - `ontologies/{name}/docs/competency-questions.yaml` (full specification)
  - `ontologies/{name}/tests/cq-test-manifest.yaml` (test runner manifest)
```

Change line 21-22 from:
```
- CQ SPARQL tests must be added to the parametrized test list in
  `tests/unit/test_{name}_ontology.py`
```
To:
```
- CQ SPARQL tests must be added to the parametrized test list in
  `ontologies/{name}/tests/test_ontology.py`
```

**Step 3: Update ontology-build-scripts.md paths frontmatter**

Change:
```yaml
---
paths:
  - "scripts/**/*.py"
  - "src/ontology_skill/**/*.py"
---
```

To:
```yaml
---
paths:
  - "scripts/**/*.py"
  - "ontologies/*/scripts/**/*.py"
  - "src/ontology_skill/**/*.py"
---
```

**Step 4: Update ontology-build-scripts.md example commands**

Change lines 29-33 from:
```bash
uv run python scripts/build_energy_news.py   # Rebuild artifacts
uv run pytest tests/unit/                     # Run tests
```
To:
```bash
uv run python ontologies/energy-news/scripts/build.py  # Rebuild artifacts
uv run pytest ontologies/energy-news/tests/             # Run tests
```

**Step 5: Update ontology-testing.md SHACL section**

Change:
```
- Shapes live in `ontologies/{name}/shapes/{name}-shapes.ttl`
```
This line is already correct! No change needed.

**Step 6: Commit**

```bash
git add .claude/rules/ontology-testing.md .claude/rules/ontology-build-scripts.md
git commit -m "fix: update claude rules path patterns for reorganized layout"
```

---

### Task 10: Clean up empty top-level mappings/ directory

**Files:**
- Remove: `mappings/` (empty top-level directory, each ontology now has its own)

**Step 1: Check if mappings/ is empty**

```bash
ls mappings/
```

Expected: empty or only .gitkeep

**Step 2: Remove**

```bash
rm -rf mappings/
git add -A mappings/
```

**Step 3: Commit**

```bash
git commit -m "chore: remove empty top-level mappings directory"
```

---

### Task 11: Run full verification

**Step 1: Rebuild ontology**

```bash
uv run python ontologies/energy-news/scripts/build.py
```

Expected: Build completes successfully.

**Step 2: Run energy-news tests**

```bash
uv run pytest ontologies/energy-news/tests/test_ontology.py -v
```

Expected: All tests pass.

**Step 3: Run general tests**

```bash
uv run pytest tests/unit/test_smoke.py -v
```

Expected: Smoke tests pass.

**Step 4: Run linter**

```bash
uv run ruff check .
```

Expected: No errors.

**Step 5: Run formatter check**

```bash
uv run ruff format --check .
```

Expected: All files formatted.

**Step 6: Run type checker**

```bash
uv run mypy src/
```

Expected: No type errors.

---

### Task 12: Final commit with all regenerated artifacts

**Step 1: Check for any regenerated files**

```bash
git status
```

If .ttl files were regenerated by the build script, they should be identical. Stage any that changed.

**Step 2: Final commit if needed**

```bash
git add -A
git commit -m "chore(energy-news): complete repo reorganization for multi-ontology support"
```
