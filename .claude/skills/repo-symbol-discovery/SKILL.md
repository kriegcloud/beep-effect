---
name: repo-symbol-discovery
description: >
  Use when looking for existing exports, canonical symbols, shared helpers,
  schemas, utilities, models, duplicate helper avoidance, import paths, or
  repo-level symbol discovery. Trigger on "does this already exist?", symbol
  lookup, export map, UnknownRecord, canonical export, and reuse questions.
version: 0.2.0
status: active
---

# Repo Symbol Discovery

Search the source with ripgrep before creating a new helper, schema, model,
service, utility, or public symbol that may already exist. There is no
generated catalog — the source tree and package barrels are the source of
truth.

## Canonical Lookup

Search public export declarations across all package sources:

```sh
rg -n "export (const|function|class|type|interface) .*<symbol-or-intent>" \
  packages --glob '**/src/**/*.ts' --glob '!**/*.test.ts'
```

Package barrels (`packages/*/*/*/src/index.ts`) list the public surface of each
package — grep them to see what a package advertises:

```sh
rg -n "<symbol-or-intent>" packages --glob '**/src/index.ts'
```

For an intent-based search (you know what it does, not its name), search bodies
and JSDoc:

```sh
rg -in "<concept words>" packages --glob '**/src/**/*.ts' --glob '!**/*.test.ts'
```

## Deciding Canonicality

Architecture doctrine decides canonical boundaries. Use
`standards/ARCHITECTURE.md`, `standards/architecture/README.md`, and
package-local policy when deciding whether an import path is appropriate for
new code. Prefer importing through a package's `@beep/*` barrel over reaching
into its `src/` internals.

## Duplicate-Avoidance Rule

If a needed concept sounds generic or repo-wide, search first. For example:

```sh
rg -in "unknown record|UnknownRecord" packages --glob '**/src/**/*.ts'
```

Prefer importing a discovered canonical export over redefining a local
equivalent.
