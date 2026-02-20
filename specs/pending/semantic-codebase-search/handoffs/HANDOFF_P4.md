# HANDOFF_P4 — Semantic Codebase Search

## Scope Handed Off

P3 synthesis is complete. Use these artifacts as implementation truth:
- `specs/pending/semantic-codebase-search/outputs/package-scaffolding.md`
- `specs/pending/semantic-codebase-search/outputs/task-graph.md`
- `specs/pending/semantic-codebase-search/outputs/cross-validation-report.md`

## What Is Locked

- Package target: `tooling/codebase-search/`
- Runtime style: Effect v4 patterns (catalog deps, `Effect.fn`, `S.TaggedErrorClass`)
- Search architecture: hybrid vector (LanceDB) + BM25 + RRF
- Tool surface: exactly 4 MCP tools (`search_codebase`, `find_related`, `browse_symbols`, `reindex`)
- Hook surface: `SessionStart` + `UserPromptSubmit`

## P4 Execution Plan

Follow task IDs from `outputs/task-graph.md`.

1. P4a: T01-T04
2. P4b: T05-T14
3. P4c: T15-T18

Parallel starts allowed:
- T01 and T05
- T08 and T09

Critical path:
- `T05 -> T06 -> (T08,T09) -> T10 -> T11 -> T12 -> T14 -> T15 -> T16 -> T18`

## Cross-Validation Gaps to Resolve in P4

- CV-01: two-pass import-to-symbol-ID resolution (`T10`)
- CV-02: keep LanceDB mapping aligned with authoritative `SymbolRow` (`T12`)
- CV-03: normalize `provides/depends` relationship targets to IDs when possible (`T10`, `T17`)
- CV-04: require `@category` via custom lint or extractor validation (`T01`, `T10`)
- CV-05: enforce layer `@provides/@depends` using kind-aware validation (`T10`, `T14`)
- CV-06: add `@ignore` to `tsdoc.json` for tooling parity (`T02`)

## Mandatory Verification Gates

After P4a:
- `npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'`
- `bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search`

After P4b:
- `tsc -b tooling/codebase-search/tsconfig.json`
- `npx vitest run tooling/codebase-search/test`
- `reindex(full)` creates `.code-index/` with LanceDB + BM25 + file hashes

After P4c:
- MCP server responds to `tools/list` with 4 tools
- Hook commands run under 5s and do not throw
- `search_codebase` returns ranked results with scores and filters

## Residual Risks

- First embedding run downloads ONNX model (~521MB).
- JSDoc backfill (T04) may overrun if export count is high.
- Relation quality depends on ID normalization coverage in T10.
