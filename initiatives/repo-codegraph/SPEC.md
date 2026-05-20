# Repo Codegraph Specification

## Status

**Active**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-20
- **Updated:** 2026-05-20

## Mission

Build an agent-facing repository codegraph that improves reuse, import
selection, boundary awareness, and implementation planning by grounding every
answer in current repo facts.

The system must be deterministic-first. Embeddings, graph database projection,
semantic expansion, and reasoning overlays are allowed only when their answers
can cite deterministic package, export, source, or architecture evidence.

## Source Of Truth

The first source of truth is `standards/repo-exports.catalog.jsonc`, generated
by `repo-context-topology` from:

- workspace package topology;
- package export maps;
- TypeScript exported declarations;
- JSDoc summaries and tags.

Future source-of-truth inputs may include:

- ts-morph AST symbol, reference, call, and import facts;
- architecture package role metadata and package-local import policy;
- generated route/table/service manifests;
- Graphiti/FalkorDB projections derived from checked-in facts;
- provider-neutral embedding records over public metadata.

## Non-Goals

- Do not make embeddings an authority over import legality.
- Do not infer private or internal package surfaces as recommended imports.
- Do not replace architecture doctrine with graph proximity.
- Do not require external services for deterministic lookup tests.
- Do not store source bodies in embedding indexes by default.

## Phase 1 Contract

Phase 1 owns deterministic lookup over the generated public export catalog.

It must provide:

- a package, `@beep/repo-codegraph`;
- schema-first request and response models;
- JSONC catalog reading with typed failures;
- package-local `beep.importPolicy` parsing for preferred imports;
- symbol and text lookup over `searchText`, summaries, categories, and names;
- explainable score components for exact, lexical, semantic, graph, and
  boundary signals;
- legal import candidates and one recommended import;
- advisory boundary guidance with architecture-doctrine citations;
- `beep reuse lookup` with JSON output;
- tests that run without external graph, embedding, or MCP services.

## Phase 2+ Contract

Later phases may add AST, embeddings, graph projection, MCP, and reasoning, but
each layer must preserve citation and fallback behavior:

- AST facts cite repo-relative source paths and line numbers.
- Semantic matches cite the metadata chunk that produced the embedding match.
- Graph answers cite deterministic nodes and edges, not only vector scores.
- MCP responses return compact, machine-readable payloads suitable for agents.
- Reasoning overlays must label inferences separately from catalog facts.

## Verification

- `bun run --filter=@beep/repo-codegraph check`
- `bun run --filter=@beep/repo-codegraph test`
- `bun run --filter=@beep/repo-cli check`
- targeted CLI tests for `beep reuse lookup --json`
- `bun run repo-exports:catalog:check`
- root config sync checks after package or path changes
