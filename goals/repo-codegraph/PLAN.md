# Repo Codegraph Plan

## Phase 1 - Deterministic Lookup

- Create `@beep/repo-codegraph` as the schema-first lookup and enrichment
  package.
- Read `standards/repo-exports.catalog.jsonc` through typed JSONC/catalog
  decoders.
- Rank public exports by symbol exactness, lexical coverage, summary/category
  coverage, import graph preference, and advisory boundary posture.
- Return legal import candidates, a recommended import, source location,
  summary, score components, warnings, and catalog freshness status.
- Add `beep reuse lookup --query <text> --json`.
- Add `--from`, `--limit`, `--strict`, and `--snippet` flags.

## Phase 2 - Import Policy And Freshness

- Expand package-local `beep.importPolicy` records where package roots should
  beat subpath exports or specific symbols need a canonical import.
- Keep lookup advisory when no policy exists.
- Use `bun run repo-exports:catalog:check` as the strict freshness gate.
- Add examples to package docs after the CLI surface settles.

## Phase 3 - AST Structural Facts

- Add ts-morph extraction for exported declarations, local references, imports,
  call edges, schema/model relationships, and service/layer wiring.
- Keep AST facts in checked, deterministic artifacts before graph projection.
- Prefer source paths and line numbers as durable citations.

## Phase 4 - Semantic Retrieval

- Add provider-neutral embedding interfaces over metadata chunks.
- Embed symbol name, package, role, summary, categories, and selected doctrine
  pointers by default.
- Do not embed private source bodies unless an explicit local-only policy allows
  it.
- Return embedding hits as score components, not final authority.

## Phase 5 - Graph And MCP

- Project deterministic facts into a dedicated graph backend package, expected
  to be `@beep/falkordb`.
- Add an MCP lookup surface once deterministic and graph-backed payloads are
  stable.
- Keep Graphiti as durable repo memory, not the only graph source of truth for
  checked-in code facts.

## Phase 6 - Effectiveness Loop

- Add reuse and duplicate-helper evaluation cases.
- Track lookup usefulness in agent-quality reports.
- Promote repeated failure modes into explicit policy or generated topology
  facts rather than relying on prompt prose.

## Current Branch Slice

- Package scaffold and deterministic lookup are implemented.
- `beep reuse lookup` is wired with JSON and human output.
- Focused package and CLI tests cover the `UnknownRecord` seed proof.
