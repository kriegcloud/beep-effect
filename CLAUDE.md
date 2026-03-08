# Ontology Engineering Workspace

## Project Overview

Programmatic Ontology Development (POD) workspace for building, maintaining,
and integrating OWL 2 ontologies using Python tooling and CLI tools. All
ontology modifications are performed through code, never by hand-editing
serialized files.

## Python Environment -- STRICTLY UV

**uv is the ONLY package manager for this project. Never use pip, pip-tools,
pipenv, poetry, conda, or any other package manager.**

### Commands

| Task | Command |
|------|---------|
| Install deps | `uv sync --group dev` |
| Add a dependency | `uv add <package>` |
| Add a dev dependency | `uv add --group dev <package>` |
| Remove a dependency | `uv remove <package>` |
| Run any Python command | `uv run <command>` |
| Run a script | `uv run python scripts/foo.py` |
| Run tests | `uv run pytest` |
| Run linter | `uv run ruff check .` |
| Run formatter | `uv run ruff format .` |
| Run type checker | `uv run mypy src/` |

### Rules

- ALWAYS prefix Python commands with `uv run` (e.g., `uv run pytest`, `uv run python`)
- NEVER run bare `python`, `pip`, or `pytest` -- always go through uv
- NEVER create requirements.txt -- dependencies live in pyproject.toml
- NEVER manually edit uv.lock -- it is auto-generated
- Use `uv add <pkg>` to add dependencies, not manual pyproject.toml edits
- Use dependency groups: production deps in `[project.dependencies]`,
  dev tools in `[dependency-groups] dev`

## Python Standards

- **Target**: Python 3.12+
- **Style**: Ruff for both linting AND formatting (no black, no isort, no flake8)
- **Types**: Use type hints on all function signatures. mypy for checking.
- **Pathlib**: Use `pathlib.Path` not `os.path` (enforced by Ruff PTH rules)
- **Modern syntax**: Use `|` union types not `Union`, `X | None` not `Optional[X]`,
  f-strings not `.format()`, `match` statements where appropriate
- **Imports**: sorted by Ruff (isort rules). First-party package is `ontology_skill`.
- **Line length**: 100 characters
- **Quotes**: double quotes
- **Docstrings**: Google style. Required on public modules, classes, and functions.

## Project Layout

```
ontologies/{name}/         # Self-contained ontology projects
  ├── {name}.ttl           #   Main ontology (TBox)
  ├── imports/             #   Imported declarations
  ├── shapes/              #   SHACL shapes
  ├── docs/                #   Specification, glossary, conceptual model
  ├── tests/               #   SPARQL CQ tests + Python unit tests
  ├── scripts/             #   Build scripts
  ├── mappings/            #   SSSOM mapping files
  └── release/             #   Frozen release artifacts
src/ontology_skill/        # Shared library code (importable package)
scripts/                   # General validation scripts
tests/unit/                # General tests (not ontology-specific)
tests/integration/         # Tests requiring external services
docs/                      # General research and methodology docs
sparql/                    # General shared SPARQL queries
.claude/skills/            # Ontology engineering skills (8 slash commands)
.claude/rules/             # Path-specific rules (auto-loaded by file context)
.claude/hooks/             # Safety hooks (ontology file protection)
```

## Ontology Engineering Skills

Eight skills map to the ontology engineering lifecycle. Invoke with
`/skill-name` or let Claude activate them automatically based on context:

| Skill | Phase | Use When |
|-------|-------|----------|
| `/ontology-requirements` | 1. Specification | Eliciting CQs, writing ORSD, generating test suites |
| `/ontology-scout` | 2. Acquisition | Finding reusable ontologies, ODPs, imports |
| `/ontology-conceptualizer` | 3. Conceptualization | Designing taxonomy, BFO alignment, anti-pattern review |
| `/ontology-architect` | 4. Formalization | Creating OWL axioms, ROBOT templates, KGCL patches |
| `/ontology-mapper` | 5. Integration | SSSOM mappings, lexmatch, cross-ontology alignment |
| `/ontology-validator` | 6. Evaluation | Reasoner, SHACL, CQ tests, ROBOT report |
| `/sparql-expert` | Cross-cutting | Query generation, validation, execution |
| `/ontology-curator` | Maintenance | Deprecation, versioning, releases |

Skills reference shared materials in `.claude/skills/_shared/` (methodology,
axiom patterns, anti-patterns, naming conventions, BFO categories, tool
decision tree). See `.claude/skills/CONVENTIONS.md` for the full standard.

## Quality Gates (run before committing)

```bash
uv run ruff check .              # Lint passes
uv run ruff format --check .     # Formatting consistent
uv run mypy src/                 # Type checks pass
uv run pytest                    # Tests pass
```

Or use the Justfile: `just check`

## Ontology Tool Strategy

Primary tools (use first):
- **ROBOT CLI**: build operations (merge, reason, report, convert, template, verify, diff)
- **oaklib** (`uv run runoak`): navigation, search, KGCL changes, lexmatch
- **KGCL**: human-reviewable change proposals

Secondary tools (specialized use):
- **OWLAPY**: complex DL axioms requiring OWL API (qualified cardinality, role chains)
- **owlready2**: rapid prototyping, ORM-style ontology interaction
- **LinkML**: schema-first modeling, polyglot artifact generation
- **rdflib**: RDF graph manipulation, serialization
- **pyshacl**: SHACL shape validation
- **sssom-py**: ontology mapping management

## Ontology Safety Rules

- NEVER hand-edit .owl or .ttl files -- use ROBOT, oaklib, or Python libraries
- ALWAYS run `robot reason` after structural changes
- ALWAYS run `robot report` before committing ontology changes
- NEVER delete ontology terms -- deprecate with `owl:deprecated true`
- Propose KGCL patches for human review before applying
- Validate SPARQL syntax before execution
- Check for existing terms (via oaklib search) before creating new ones

## Git Conventions

- Commits: `<type>(<scope>): <description>`
- Types: feat, fix, refactor, docs, test, chore
- Scope: ontology name or component
- Pre-commit hooks are installed -- they run Ruff lint, Ruff format, and mypy automatically

## Namespace Prefixes

Standard prefixes (always use):
- rdf, rdfs, owl, skos, sh, xsd, dcterms
- obo: http://purl.obolibrary.org/obo/
- BFO: http://purl.obolibrary.org/obo/BFO_
- RO: http://purl.obolibrary.org/obo/RO_
- IAO: http://purl.obolibrary.org/obo/IAO_

## Serialization

- Default format: Turtle (.ttl)
- Manchester Syntax for human review / LLM interaction
- Use CamelCase for class names, camelCase for properties
- All new classes require: rdfs:label, skos:definition, rdfs:subClassOf
- Follow genus-differentia pattern: "A [parent] that [differentia]"
