# P6 Orchestrator Prompt — Blocker Remediation & Re-Verification

You are executing P6 for `semantic-codebase-search`.

## Mission
Fix the P5 blockers, rerun all mandatory verification gates, and close the spec only if every gate passes.

## Read First
- `specs/pending/semantic-codebase-search/handoffs/HANDOFF_P6.md`
- `specs/pending/semantic-codebase-search/outputs/p5-verification-summary.md`
- `specs/pending/semantic-codebase-search/outputs/p5-performance-benchmarks.md`
- `specs/pending/semantic-codebase-search/outputs/p5-search-quality-report.md`
- `specs/pending/semantic-codebase-search/outputs/p5-e2e-results.md`

## P6 Deliverables (Create All)
- `specs/pending/semantic-codebase-search/outputs/p6-remediation-results.md`
- `specs/pending/semantic-codebase-search/outputs/p6-rerun-performance-benchmarks.md`
- `specs/pending/semantic-codebase-search/outputs/p6-rerun-search-quality-report.md`
- `specs/pending/semantic-codebase-search/outputs/p6-closeout-summary.md`

Also update:
- `tooling/codebase-search/README.md`
- `specs/pending/semantic-codebase-search/REFLECTION_LOG.md`
- `specs/pending/semantic-codebase-search/README.md`

## Required Fixes

1. Embedding model runtime fix:
- Update `tooling/codebase-search/src/indexer/EmbeddingService.ts` to a compatible ONNX-available model/config so live embedding loads successfully.
- Rebuild and confirm no model-load failure during `reindex` and `search_codebase`.

2. Runtime/docs alignment:
- Ensure MCP runtime instructions match Bun-based entrypoint behavior.
- Ensure hook entrypoint paths in docs match built artifacts.

## Required Checks (Rerun)

1. E2E retrieval checks:
- `create Account schema` returns existing schema patterns.
- `add error handling` returns existing tagged error patterns.

2. Hook behavior checks:
- `SessionStart` includes package/symbol overview when index exists.
- `UserPromptSubmit` injects relevant context for coding prompts.
- Skip heuristics suppress injection for short/meta prompts.

3. Performance checks:
- MCP tool latencies (`search_codebase`, `find_related`, `browse_symbols`, `reindex`) are measured.
- Full index and incremental reindex timings are measured.

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
1. Record pass status in `p6-closeout-summary.md`.
2. Move spec to completed:
```bash
bun run spec:move -- semantic-codebase-search completed
```
3. Confirm completed path contains outputs + handoffs + logs.

If any gate fails:
- Do not move spec.
- Record blocking defects, failing metrics, and exact remediation tasks.
