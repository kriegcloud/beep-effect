# Repo Context Topology Plan

## Phase 1 - Public Export Catalog

- Add a repo-cli support generator for `standards/repo-exports.catalog.jsonc`
  and `standards/repo-exports.catalog.md`.
- Wire `bun run beep quality repo-exports-catalog` for writes and
  `bun run beep quality repo-exports-catalog --check` for drift checks.
- Add root convenience scripts:
  - `bun run repo-exports:catalog`
  - `bun run repo-exports:catalog:check`
- Generate catalog entries from package export maps plus TypeScript exported
  declarations and JSDoc.
- Keep ordering deterministic and avoid generated timestamps.
- Prove `UnknownRecord` resolves to `@beep/schema` from the generated catalog.

## Phase 2 - Agent Lookup Surface

- Hand off the active lookup implementation to `goals/repo-codegraph`.
- Add and maintain `beep reuse lookup` as the first small CLI query command.
- Query by symbol name, package, import specifier, category, or text in
  `searchText`.
- Return anti-duplication hints only after repeated failure modes justify a
  curated registry.

## Phase 3 - Tooling Integration

- Wrap the stable catalog in an MCP tool or Graphiti projection.
- Feed skill routing with compact pointers to the catalog instead of copying
  large symbol lists into skills.
- Add more generated topology catalogs only when they answer a concrete agent
  mistake or review-loop finding.
