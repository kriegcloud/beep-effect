# Phase 3 Handoff: CLI Loader Command

## Context For Phase 3

### Working Context (<=2K tokens)

Current task: implement Phase 3 in `tooling/cli`:
- P3.1 S3 data source service
- P3.2 local cache layer with manifest/hash validation
- P3.3 `enron` CLI subcommand (`download`, `info`, `parse`, `curate`)
- P3.4 CLI entrypoint wiring
- P3.5 integration tests for cache-first -> S3-fallback behavior

Phase 2 is complete.

Implemented in Phase 2:
- `tooling/cli/src/commands/enron/thread-scorer.ts`
  - deterministic multi-factor scoring
  - explainable score breakdown per factor
  - stable ranking/tie-break behavior
  - diversity categories for selection
- `tooling/cli/src/commands/enron/curator.ts`
  - parse -> reconstruct -> score -> select pipeline
  - deterministic subset selection with bounds
  - curated artifact serialization (`threads.json`, `documents.json`, `manifest.json`)
  - manifest generation with counts + criteria + SHA-256 hashes
  - artifact writing and S3 upload helpers
- Tests added:
  - `tooling/cli/test/commands/enron/thread-scorer.test.ts`
  - `tooling/cli/test/commands/enron/curator.test.ts`

Phase 2 verification run:
- `bun run check --filter @beep/repo-cli` ✅
- `bun run test --filter @beep/repo-cli` ✅

Curated artifacts uploaded:
- `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`

Manifest snapshot (uploaded set):
- `generatedAt`: `2026-02-15T03:22:05.011Z`
- `scoredThreadCount`: `200000`
- `selectedThreadCount`: `2500`
- `selectedMessageCount`: `2500`
- `datasetHash`: `72de84d49b3ab02460ee63d4f583ba1dc3c64cb0c4a1c95d0b802f10ef60fadd`
- artifact hashes:
  - `threads.json`: `458c2a5197fb9d92ffdb73c3988c6facacb1d5357fd43be8169c463d7f1b01ec`
  - `documents.json`: `65bca7c681dba853c48ef68478cb28110faeaef5ce15b9ea2ab96646316496ef`

Important Phase 2 caveat to preserve in Phase 3 behavior:
- In this corpus slice, explicit `In-Reply-To`/`References` thread linkage is sparse, so many reconstructed threads are single-message.
- Deep-thread signal now includes embedded quoted/forwarded-chain structure; `lengthDiversity` coverage was unavailable (`0`) in the uploaded set and is reported explicitly in manifest.

Blocking issues:
- No implementation blockers for P3.
- Legacy spec/package naming drift still exists in docs (`@beep/tooling-cli` vs actual `@beep/repo-cli`).

Immediate dependencies to read first:
- `specs/pending/enron-data-pipeline/README.md` (Phase 3 section)
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P3.md` (this file)
- `tooling/cli/src/commands/enron/curator.ts`
- `tooling/cli/src/commands/enron/thread-scorer.ts`
- `tooling/cli/src/index.ts`

### Episodic Context (<=1K tokens)

- Raw dataset remains in S3 and locally verified checksum matched previous Phase 0 value:
  - `s3://static.vaultctx.com/todox/test-data/enron/raw/enron_mail_20150507.tar.gz`
  - SHA-256: `b3da1b3fe0369ec3140bb4fbce94702c33b7da810ec15d718b3fadf5cd748ca7`
- Phase 2 curation execution used deterministic traversal of extracted maildir with a 200K-message parse window.
- Re-upload completed after scoring update to include embedded-depth signal, producing non-zero deep-thread coverage in selected set.

### Semantic Context (<=500 tokens)

- Bucket ARN: `arn:aws:s3:::static.vaultctx.com`
- Raw prefix: `todox/test-data/enron/raw/`
- Curated prefix: `todox/test-data/enron/curated/`
- CLI package: `tooling/cli` (`@beep/repo-cli`)
- Curated object sizes (latest upload):
  - `threads.json`: `38047023`
  - `documents.json`: `32831070`
  - `manifest.json`: `8316`

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Phase 2 implementation files:
  - `tooling/cli/src/commands/enron/thread-scorer.ts`
  - `tooling/cli/src/commands/enron/curator.ts`

## Verification Checklist (Phase 3)

- [ ] `tooling/cli/src/commands/enron/s3-client.ts` implemented
- [ ] `tooling/cli/src/commands/enron/cache.ts` implemented
- [ ] `tooling/cli/src/commands/enron/index.ts` implemented with `download/info/parse/curate`
- [ ] `tooling/cli/src/index.ts` wires `enron` subcommand
- [ ] Cache validation compares local artifacts against manifest hashes
- [ ] `bun run check --filter @beep/repo-cli`
- [ ] `bun run test --filter @beep/repo-cli`
- [ ] Reflection updated for Phase 3
- [ ] Next handoff pair created:
  - `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P4.md`
  - `specs/pending/enron-data-pipeline/handoffs/P4_ORCHESTRATOR_PROMPT.md`
