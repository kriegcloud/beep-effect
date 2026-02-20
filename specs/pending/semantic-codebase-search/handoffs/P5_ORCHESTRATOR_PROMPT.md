# P5 Orchestrator Prompt — Verification & Closeout

You are executing P5 (Verification) for `semantic-codebase-search`.

## Mission
Validate that the implemented system works end-to-end and close the spec if all gates pass.

## Read First
- `specs/pending/semantic-codebase-search/handoffs/HANDOFF_P5.md`
- `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`
- `specs/pending/semantic-codebase-search/outputs/hook-integration-design.md`
- `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- `specs/pending/semantic-codebase-search/outputs/cross-validation-report.md`

## P5 Deliverables (Create All)
- `specs/pending/semantic-codebase-search/outputs/p5-e2e-results.md`
- `specs/pending/semantic-codebase-search/outputs/p5-performance-benchmarks.md`
- `specs/pending/semantic-codebase-search/outputs/p5-search-quality-report.md`
- `specs/pending/semantic-codebase-search/outputs/p5-verification-summary.md`

Also update:
- `tooling/codebase-search/README.md`
- `specs/pending/semantic-codebase-search/REFLECTION_LOG.md`
- `specs/pending/semantic-codebase-search/README.md`

## Required Checks

1. E2E retrieval checks:
- "create Account schema" returns existing schema patterns.
- "add error handling" returns existing tagged error patterns.

2. Hook behavior checks:
- `SessionStart` includes package/symbol overview when index exists.
- `UserPromptSubmit` injects relevant context for coding prompts.
- Skip heuristics suppress injection for short/meta prompts.

3. Performance checks:
- MCP tool latencies (`search_codebase`, `find_related`, `browse_symbols`, `reindex`).
- Full index build and incremental reindex timings.

4. Quality checks:
- Evaluate 10 fixed queries with expected relevant symbols.
- Compute aggregate precision (target >=70%).

5. Standards checks:
- Effect v4 + lint/docgen/test commands pass.

## Verification Commands

```bash
npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'
bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search
tsc -b tooling/codebase-search/tsconfig.json
npx vitest run tooling/codebase-search/test
```

## Final Gate (Must All Pass)
- All E2E checks pass.
- Search latency <3s for all tools.
- Precision >=70%.
- Full index <30s.
- README and reflection updates complete.

## Closeout Rule

If all gates pass:
1. Record pass status in `p5-verification-summary.md`.
2. Move spec to completed:
```bash
bun run spec:move -- semantic-codebase-search completed
```
3. Confirm completed path contains outputs + handoffs + logs.

If any gate fails:
- Do not move spec.
- Record blocking defects, failing metrics, and exact remediation tasks.
