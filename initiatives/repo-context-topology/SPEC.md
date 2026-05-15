# Repo Context Topology Specification

## Status

**Active**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-14
- **Updated:** 2026-05-14

## Mission

Compress repository context into executable topology and generated metadata so
coding agents discover existing repo surfaces before inventing local
substitutes.

The initiative is not a replacement for `AGENTS.md`, skills, MCP, or Graphiti.
It makes those systems easier to route by giving them deterministic repo facts
to cite: package names, legal import specifiers, public symbols, source paths,
JSDoc summaries, categories, and version tags.

The export catalog is descriptive current-state metadata. It does not decide
whether an import path, package root, wildcard export, or public symbol is the
canonical architecture surface for new code. Canonical boundary choices still
come from `standards/ARCHITECTURE.md`, the numbered architecture doctrine, and
package-local policy.

## Phase 1 Contract

Phase 1 owns a generated public export catalog:

- JSONC artifact: `standards/repo-exports.catalog.jsonc`
- Markdown artifact: `standards/repo-exports.catalog.md`
- Generator command: `bun run beep quality repo-exports-catalog`
- Check command: `bun run beep quality repo-exports-catalog --check`

The catalog MUST be generated from source of truth:

- root workspace package universe from `bun run topo-sort`;
- each package's local `package.json` `exports` map;
- TypeScript exported declarations resolved through ts-morph;
- JSDoc summaries, `@category`, `@since`, and tags from source declarations.

The catalog MUST record, at minimum, package name, package path, import
specifier, export subpath, exported-from path, symbol name, export kind, source
path, source line, JSDoc summary, categories, since tags, raw tags, and a
normalized `searchText` field.

The catalog MUST also record authority metadata that marks the artifact as
descriptive current-state export facts with canonicality not evaluated.

The catalog MUST be deterministic. Re-running check mode against a clean tree
must not fail because of timestamps or nondeterministic ordering.

## Seed Discovery Proof

`UnknownRecord` from `@beep/schema` is the first proof case. The generated
catalog must expose the root import answer:

```ts
import { UnknownRecord } from "@beep/schema"
```

The proof passes only when the catalog entry is derived from the real source
declaration in `packages/foundation/modeling/schema/src/Record.ts`, including
its JSDoc summary and source line.

## Boundaries

The export catalog is a generated discovery layer, not a new API authority. If
the catalog disagrees with package exports or source declarations, the catalog
is stale. If the catalog appears to disagree with architecture doctrine, use the
doctrine to choose the canonical boundary and treat the catalog as current export
evidence only.

The first phase intentionally does not add an MCP server, semantic embedding
index, or curated intent registry. Those are follow-up surfaces once the
tracked catalog shape has proved stable.

## Future Extension Points

- CLI lookup over the catalog, for example symbol and intent search commands.
- MCP tool wrapping the catalog for agent-facing symbol lookup with doctrine
  pointers.
- Curated failure-mode registry for repeated duplicate-symbol mistakes.
- Graphiti/FalkorDB projection that enriches deterministic export facts with
  semantic intent tags and cross-symbol relationships.
- Additional topology catalogs for package roles, canonical subpaths,
  operation-plan variants, and architecture proof surfaces.

## Verification

- Generator writes JSONC and Markdown artifacts.
- Check mode fails when artifacts are missing or stale.
- Repo-cli tests verify the `UnknownRecord` seed proof.
- Package check covers support-script typechecking.
- Root GitHub quality checks include catalog drift checks.
