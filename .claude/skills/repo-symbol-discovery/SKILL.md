---
name: repo-symbol-discovery
description: >
  Use when looking for existing exports, canonical symbols, shared helpers,
  schemas, utilities, models, duplicate helper avoidance, import paths, or
  repo-level symbol discovery. Trigger on "does this already exist?", symbol
  lookup, export map, UnknownRecord, canonical export, and reuse questions.
version: 0.1.0
status: active
---

# Repo Symbol Discovery

Use the generated repo export catalog before creating a new helper, schema,
model, service, utility, or public symbol that may already exist.

## Canonical Lookup

Start with the human-readable catalog:

```sh
rg -i "<symbol-or-intent>" standards/repo-exports.catalog.md
```

Use the JSONC catalog when you need structured fields such as package path,
import specifier, source path, categories, tags, or generated search text:

```sh
rg -i "<symbol-or-intent>" standards/repo-exports.catalog.jsonc
```

## What The Catalog Means

- `standards/repo-exports.catalog.jsonc` is the machine-readable repo-level
  catalog.
- `standards/repo-exports.catalog.md` is the human and agent-readable view.
- The catalog is descriptive current-state metadata: it lists legal public
  export facts.
- Architecture doctrine still decides canonical boundaries. Use
  `standards/ARCHITECTURE.md`, `standards/architecture/README.md`, and
  package-local policy when deciding whether an import path is appropriate for
  new code.

## Freshness

Refresh generated artifacts after changing package export maps or public
exports:

```sh
bun run repo-exports:catalog
```

Verify tracked artifacts are current:

```sh
bun run repo-exports:catalog:check
```

The pre-push hook runs the check for export-relevant pushed changes.

## Duplicate-Avoidance Rule

If a needed concept sounds generic or repo-wide, search first. For example:

```sh
rg -i "unknown record|UnknownRecord" standards/repo-exports.catalog.md
```

Prefer importing a discovered canonical export over redefining a local
equivalent.
