# P4_ORCHESTRATOR_PROMPT

Implement Phase 4 of `specs/pending/semantic-codebase-search` using the finalized P3 artifacts.

## Inputs (Read First)

- `specs/pending/semantic-codebase-search/outputs/package-scaffolding.md`
- `specs/pending/semantic-codebase-search/outputs/task-graph.md`
- `specs/pending/semantic-codebase-search/outputs/cross-validation-report.md`
- All P2 design docs in `specs/pending/semantic-codebase-search/outputs/`

## Non-Negotiable Constraints

- Follow Effect v4 conventions from project memory/AGENTS guidance.
- Use the exact 18-task plan from `task-graph.md`.
- Do not introduce additional MCP tools beyond the defined four.
- Keep hook output compact and resilient (never throw; empty output on failure).
- Preserve catalog dependency pattern in package manifests.

## Execution Order

1. Run P4a tasks T01-T04.
2. Run P4b tasks T05-T14.
3. Run P4c tasks T15-T18.

Allowed parallelism:
- `T01 || T05`
- `T08 || T09`

## Required Deliverables

- `tooling/codebase-search/` scaffold and implementation per task outputs.
- Updated root lint/docgen/tsdoc configuration.
- Working indexing pipeline (`full` + `incremental`) with LanceDB + BM25.
- Working MCP server with tools:
  - `search_codebase`
  - `find_related`
  - `browse_symbols`
  - `reindex`
- Working hooks:
  - `SessionStart`
  - `UserPromptSubmit`

## Gap-Closure Requirements

Close all cross-validation items during implementation:
- CV-01 in T10
- CV-02 in T12
- CV-03 in T10/T17
- CV-04 in T01/T10
- CV-05 in T10/T14
- CV-06 in T02

## Verification Commands

Run these gates before declaring P4 complete:

```bash
npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'
bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search
tsc -b tooling/codebase-search/tsconfig.json
npx vitest run tooling/codebase-search/test
```

And runtime checks:

1. MCP server returns all 4 tools in `tools/list`.
2. `reindex` full mode builds `.code-index/` and reports stats.
3. `search_codebase` returns ranked results with score + filters.
4. Hook entrypoints run under 5s and never crash.

## Completion Output Format

Provide:
- Task completion checklist (T01-T18)
- Verification results (pass/fail per gate)
- Any deviations from plan with rationale
- Remaining risks or follow-up work
