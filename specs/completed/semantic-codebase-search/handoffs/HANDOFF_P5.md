# Handoff → P5: Verification & Spec Closeout

> Context transfer from P4 (Implementation) to P5 (Verification)
> Token budget: <=4,000 tokens

---

## Working Memory (<=2,000 tokens)

### Current Task
Execute end-to-end verification for semantic codebase search, publish objective pass/fail evidence, and close the spec if gates pass.

### P5 Objectives
1. Validate end-to-end retrieval behavior for real coding prompts.
2. Validate hook behavior (`SessionStart`, `UserPromptSubmit`) under timeout and relevance constraints.
3. Benchmark performance (search latency, full/incremental indexing).
4. Measure result quality on a fixed query set.
5. Finalize package documentation.
6. Produce a closure report and move the spec from `pending` to `completed`.

### Preconditions (Must Be True Before P5)
- P4a/P4b/P4c completed.
- `tooling/codebase-search` builds and tests pass.
- MCP server is runnable from `tooling/codebase-search/dist/bin.js`.
- Hook entry points are runnable from `tooling/codebase-search/dist/hooks/*.js`.

### P5 Work Items (<=7)
1. E2E: prompt "create Account schema" surfaces existing schema patterns.
2. E2E: prompt "add error handling" surfaces existing tagged error patterns.
3. E2E: hook auto-injection includes relevant symbols and no noise for skip prompts.
4. Benchmark: search latency for each MCP tool.
5. Benchmark: full and incremental index build times.
6. Quality: precision/recall-style scoring on 10 fixed queries.
7. Documentation: finalize `tooling/codebase-search/README.md`.

### Mandatory Verification Gate (Spec Complete)
- [ ] All E2E tests pass.
- [ ] Search latency <3s for all MCP tools.
- [ ] Precision >=70% on fixed query set.
- [ ] Full index build <30s.
- [ ] `tooling/codebase-search/README.md` complete and accurate.
- [ ] Effect v4 + JSDoc standards checks pass.

---

## Episodic Memory (<=1,000 tokens)

### What P3/P4 Locked In
- Architecture: ts-morph + doctrine extraction, CodeRankEmbed embeddings, LanceDB + BM25, MCP + hooks.
- MCP tools: `search_codebase`, `find_related`, `browse_symbols`, `reindex`.
- Hooks: `SessionStart`, `UserPromptSubmit`.
- Known cross-validation gap closures required in implementation:
  - two-pass import ID resolution,
  - canonical `SymbolRow` mapping,
  - relation target normalization,
  - category/layer tag enforcement strategy,
  - `tsdoc` tag parity.

### P5 Outcome Required
P5 is not design work. It must produce measurable evidence that implementation behavior matches P2/P3 specs and that the spec can be closed.

---

## Semantic Memory (<=500 tokens)

### Hard Constraints
- Runtime style: Effect v4 patterns.
- Test runner: `npx vitest run`.
- MCP server name: `codebase-search` (must not conflict with `graphiti-memory`).
- Hook timeout budget: 5,000ms.
- Index directory: `.code-index/`.

### Performance/Quality Targets
- Search tools: <3s latency.
- Full reindex: <30s.
- Query quality: >=70% precision on fixed test set.

---

## Procedural Memory (Links Only)

- `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`
- `specs/pending/semantic-codebase-search/outputs/hook-integration-design.md`
- `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- `specs/pending/semantic-codebase-search/outputs/task-graph.md`
- `specs/pending/semantic-codebase-search/outputs/cross-validation-report.md`
- `specs/pending/semantic-codebase-search/REFLECTION_LOG.md`
- `.repos/beep-effect/specs/_guide/HANDOFF_STANDARDS.md`

---

## Required P5 Output Artifacts

Create these files during P5:
- `specs/pending/semantic-codebase-search/outputs/p5-e2e-results.md`
- `specs/pending/semantic-codebase-search/outputs/p5-performance-benchmarks.md`
- `specs/pending/semantic-codebase-search/outputs/p5-search-quality-report.md`
- `specs/pending/semantic-codebase-search/outputs/p5-verification-summary.md`

Update these files during P5:
- `specs/pending/semantic-codebase-search/REFLECTION_LOG.md` (fill P4 and P5 sections)
- `specs/pending/semantic-codebase-search/README.md` (status -> complete)
- `tooling/codebase-search/README.md` (usage, tool schemas, hook setup)

---

## Closeout Sequence (If Gate Passes)

1. Run final verification checklist and capture command outputs in `p5-verification-summary.md`.
2. Update status in `specs/pending/semantic-codebase-search/README.md`.
3. Move spec from pending to completed:
   - `bun run spec:move -- semantic-codebase-search completed`
4. Confirm completed path contains outputs + handoffs + reflection log.

If any gate fails, do not move the spec; produce a failure report with blocking defects.

---

## Verification Table

| Artifact | Verification Check |
|---|---|
| `outputs/p5-e2e-results.md` | Contains both required E2E scenarios with pass/fail evidence |
| `outputs/p5-performance-benchmarks.md` | Contains latency and indexing timings against thresholds |
| `outputs/p5-search-quality-report.md` | Contains 10-query scoring and aggregate precision |
| `outputs/p5-verification-summary.md` | Consolidated gate status with explicit pass/fail |
| Updated `tooling/codebase-search/README.md` | Documents setup, reindex, MCP tools, and hooks |
| Spec moved to completed (if pass) | `specs/completed/semantic-codebase-search` exists |
