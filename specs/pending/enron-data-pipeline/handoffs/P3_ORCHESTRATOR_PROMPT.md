# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 (CLI Loader Command) of the `enron-data-pipeline` spec.

### Context

Phase 2 is complete. Use these artifacts as inputs:
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P3.md`
- `tooling/cli/src/commands/enron/thread-scorer.ts`
- `tooling/cli/src/commands/enron/curator.ts`
- `tooling/cli/src/commands/enron/parser.ts`
- `tooling/cli/src/commands/enron/document-bridge.ts`

Curated dataset is already in S3:
- `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`

### Your Mission

Implement all Phase 3 tasks in `tooling/cli`:

1. Build S3 data source service:
- Create `tooling/cli/src/commands/enron/s3-client.ts`
- Support downloading curated artifacts from `s3://static.vaultctx.com/todox/test-data/`
- Return typed errors for missing objects / transport failures

2. Build local cache layer:
- Create `tooling/cli/src/commands/enron/cache.ts`
- Cache directory for curated artifacts
- Cache-first read with S3 fallback on miss
- Validate cache against manifest hash metadata
- Invalidate cache when manifest/artifact hashes change

3. Build `enron` CLI command:
- Create `tooling/cli/src/commands/enron/index.ts`
- Subcommands:
  - `download` (fetch curated set)
  - `info` (display counts/hash/cache status)
  - `parse` (emit curated documents for downstream extraction)
  - `curate` (invoke Phase 2 curation pipeline)

4. Wire command into CLI entrypoint:
- Update `tooling/cli/src/index.ts` to register `enron` command

5. Add integration tests:
- cache hit/miss behavior
- hash validation / invalidation
- `info` and `parse` output expectations

### Constraints

- Keep boundaries clean (`tooling/cli` only unless explicitly required).
- Follow monorepo and Effect patterns (`no any`, no unchecked casts, no `@ts-ignore`).
- Preserve deterministic behavior for cache validation and emitted output ordering.
- Do not start long-running dev servers.

### Verification

Run and pass:

```bash
bun run check --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
```

Then update:
- `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` (Phase 3 section)
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P4.md`
- `specs/pending/enron-data-pipeline/handoffs/P4_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `s3-client.ts` implemented with typed fetch/download paths
- [ ] `cache.ts` implemented with manifest-hash cache validation
- [ ] `enron` CLI command implemented (`download/info/parse/curate`)
- [ ] CLI entrypoint wiring completed
- [ ] Phase 3 tests pass for CLI package
- [ ] Reflection updated
- [ ] P4 handoff pair created
