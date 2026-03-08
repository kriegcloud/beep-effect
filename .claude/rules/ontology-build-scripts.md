---
paths:
  - "scripts/**/*.py"
  - "ontologies/*/scripts/**/*.py"
  - "src/ontology_skill/**/*.py"
---

# Ontology Build Script Conventions

When modifying Python scripts that generate or manipulate ontology files:

## Methodology

- Follow the ontology engineering lifecycle: Specification > Acquisition > Conceptualization > Formalization > Integration > Evaluation
- Use the skill workflows defined in `.claude/skills/` for the appropriate phase
- Consult `.claude/skills/CONVENTIONS.md` for cross-skill handoff specifications

## Build Script Patterns

- Use `rdflib` for programmatic triple manipulation in build scripts
- Bind standard prefixes via a shared helper (see `bind_common_prefixes()`)
- Keep TBox (schema), ABox (data), reference individuals, and SHACL shapes in separate graphs/files
- Derive relationships programmatically where possible (e.g., `publishedBy` from URL domain)
- Document all changes in the KGCL change log (`ontologies/{name}/{name}-changes.kgcl`)

## Quality Gates

After modifying build scripts, always run:
```bash
uv run python ontologies/{name}/scripts/build.py  # Rebuild artifacts
uv run pytest ontologies/{name}/tests/             # Run tests
uv run ruff check .                           # Lint
uv run ruff format --check .                  # Format check
```
