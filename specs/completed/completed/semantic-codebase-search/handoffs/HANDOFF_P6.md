# Handoff → P6: Blocker Remediation & Re-Verification

> Context transfer from P5 (failed verification) to P6 (fix + rerun)
> Token budget: <=4,000 tokens

---

## Working Memory (<=2,000 tokens)

### Current Task
Implement the blocking fixes discovered in P5, rerun all verification gates end-to-end, and close the spec only if all gates pass.

### Why P6 Exists
P5 produced valid verification evidence but failed mandatory closeout gates due to a runtime blocker:
- Embedding model load failure in live search/index paths:
  - `Failed to load embedding model: Could not locate file: "https://huggingface.co/nomic-ai/CodeRankEmbed/resolve/main/onnx/model.onnx".`

### P6 Objectives
1. Fix embedding model configuration so live `reindex` and search tools execute successfully.
2. Keep MCP runtime/docs aligned (Bun-based entrypoint, correct hook entrypoints).
3. Re-run full verification checks from P5 (E2E, hooks, performance, quality, standards).
4. Produce updated measurable evidence and final pass/fail gate summary.
5. Move spec to `completed` only if all gates pass.

### Preconditions (Must Be True Before P6)
- P5 outputs exist and are treated as baseline failure evidence.
- `tooling/codebase-search` builds and tests currently pass.
- Spec remains in `specs/pending/semantic-codebase-search`.

### P6 Work Items (<=7)
1. Update embedding model config in `tooling/codebase-search/src/indexer/EmbeddingService.ts` to an ONNX-available model compatible with `@huggingface/transformers` feature extraction.
2. Rebuild package and verify MCP entrypoint runtime behavior via Bun.
3. Run full reindex and incremental reindex successfully against `.code-index/`.
4. Re-run required E2E retrieval checks:
   - `create Account schema`
   - `add error handling`
5. Re-run MCP latency + index timing benchmarks and verify thresholds.
6. Re-run 10-query quality evaluation and recompute aggregate precision.
7. Update verification artifacts and closeout status.

### Mandatory Verification Gate (Spec Complete)
- [ ] All E2E checks pass.
- [ ] Search latency <3s for all MCP tools.
- [ ] Precision >=70% on fixed query set.
- [ ] Full index build <30s.
- [ ] README + reflection + summary updates complete and accurate.
- [ ] Effect v4 + lint/docgen/test commands pass.

---

## Episodic Memory (<=1,000 tokens)

### What P5 Established
- Standards commands passed (`eslint`, `docgen`, `tsc`, `vitest`).
- Hook behavior logic works (overview + injection + skip heuristics) when index exists.
- Live retrieval/performance/quality gates failed because embedding model initialization fails before tool execution.
- Closeout command was intentionally not run.

### P5 Artifacts to Trust as Baseline
- `specs/pending/semantic-codebase-search/outputs/p5-e2e-results.md`
- `specs/pending/semantic-codebase-search/outputs/p5-performance-benchmarks.md`
- `specs/pending/semantic-codebase-search/outputs/p5-search-quality-report.md`
- `specs/pending/semantic-codebase-search/outputs/p5-verification-summary.md`

### P6 Outcome Required
P6 must be implementation + verification, not additional design. It should either:
- fully clear gates and move the spec, or
- produce explicit residual blocker evidence and keep spec pending.

---

## Semantic Memory (<=500 tokens)

### Hard Constraints
- Runtime style: Effect v4 patterns.
- MCP server name: `codebase-search`.
- Hook timeout budget: 5,000ms.
- Index directory: `.code-index/`.
- Test runner: `npx vitest run`.

### Known Runtime Reality (from P5)
- MCP entrypoint is Bun-based (`@effect/platform-bun`), so runtime/docs must use Bun launch for MCP server.
- Hook entrypoints in dist are:
  - `tooling/codebase-search/dist/hooks/session-start-entry.js`
  - `tooling/codebase-search/dist/hooks/prompt-submit-entry.js`

---

## Procedural Memory (Links Only)

- `specs/pending/semantic-codebase-search/outputs/p5-verification-summary.md`
- `specs/pending/semantic-codebase-search/outputs/p5-performance-benchmarks.md`
- `specs/pending/semantic-codebase-search/outputs/p5-search-quality-report.md`
- `specs/pending/semantic-codebase-search/outputs/p5-e2e-results.md`
- `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`
- `specs/pending/semantic-codebase-search/outputs/hook-integration-design.md`
- `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- `tooling/codebase-search/src/indexer/EmbeddingService.ts`
- `.repos/beep-effect/specs/_guide/HANDOFF_STANDARDS.md`

---

## Required P6 Output Artifacts

Create these files during P6:
- `specs/pending/semantic-codebase-search/outputs/p6-remediation-results.md`
- `specs/pending/semantic-codebase-search/outputs/p6-rerun-performance-benchmarks.md`
- `specs/pending/semantic-codebase-search/outputs/p6-rerun-search-quality-report.md`
- `specs/pending/semantic-codebase-search/outputs/p6-closeout-summary.md`

Update these files during P6:
- `tooling/codebase-search/README.md` (final runtime/model setup accuracy)
- `specs/pending/semantic-codebase-search/REFLECTION_LOG.md` (P6 learnings)
- `specs/pending/semantic-codebase-search/README.md` (status and phase table)

---

## Verification Commands (P6)

Run all required standards commands:

```bash
npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'
bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search
tsc -b tooling/codebase-search/tsconfig.json
npx vitest run tooling/codebase-search/test
```

And run live verification with the fixed embedding configuration:
- full and incremental `reindex`
- `search_codebase` E2E prompts
- latency sampling for `search_codebase`, `find_related`, `browse_symbols`, `reindex`
- 10 fixed quality queries with precision calculation

---

## Closeout Sequence (If Gate Passes)

1. Record pass evidence in `p6-closeout-summary.md`.
2. Ensure spec README status is complete and outputs/handoffs are up to date.
3. Move spec from pending to completed:
   - `bun run spec:move -- semantic-codebase-search completed`
4. Confirm completed path contains outputs + handoffs + reflection log.

If any gate fails:
- Do not move the spec.
- Document exact failing metrics, errors, and remediation tasks in `p6-closeout-summary.md`.

---

## Verification Table

| Artifact | Verification Check |
|---|---|
| `outputs/p6-remediation-results.md` | Documents implemented fixes with before/after behavior |
| `outputs/p6-rerun-performance-benchmarks.md` | Contains MCP + indexing timings against thresholds |
| `outputs/p6-rerun-search-quality-report.md` | Contains 10-query scoring and aggregate precision |
| `outputs/p6-closeout-summary.md` | Consolidated gate status with explicit pass/fail and closeout decision |
| Updated `tooling/codebase-search/README.md` | Runtime/model/hook docs are accurate to implementation |
| Spec moved to completed (if pass) | `specs/completed/semantic-codebase-search` exists |
