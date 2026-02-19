# Phase 1 Handoff: Email Parsing Infrastructure

## Context For Phase 1

### Working Context (<=2K tokens)

Current task: implement Phase 1 in `tooling/cli`:
- P1.1 Enron schemas
- P1.2 RFC 2822 parser service
- P1.3 thread reconstructor
- P1.4 TodoX document bridge
- P1.5 unit tests

Phase 0 outputs are complete:
- `specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md`
- `specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md`
- `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` (Phase 0 updated)

Raw dataset state:
- Uploaded canonical CMU archive:
  - `s3://static.vaultctx.com/todox/test-data/enron/raw/enron_mail_20150507.tar.gz`
  - size: `443254787`
  - SSE: `AES256`
  - local SHA-256 at upload time: `b3da1b3fe0369ec3140bb4fbce94702c33b7da810ec15d718b3fadf5cd748ca7`

Key implementation decisions entering P1:
- Canonical raw source: CMU maildir tarball.
- Parser library recommendation: `postal-mime` (fallback: `mailparser` if streaming pressure requires it).
- Signature stripping is a separate normalization step (not provided natively by chosen parser).

Success criteria for Phase 1:
- [ ] `tooling/cli/src/commands/enron/schemas.ts` created and typed
- [ ] `tooling/cli/src/commands/enron/parser.ts` created using selected parser strategy
- [ ] `tooling/cli/src/commands/enron/thread-reconstructor.ts` created
- [ ] `tooling/cli/src/commands/enron/document-bridge.ts` created
- [ ] Tests for parser/thread/document bridge added and passing
- [ ] `bun run check --filter @beep/tooling-cli` passes
- [ ] `bun run test --filter @beep/tooling-cli` passes
- [ ] `REFLECTION_LOG.md` Phase 1 section updated
- [ ] Next handoff pair created:
  - `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P2.md`
  - `specs/pending/enron-data-pipeline/handoffs/P2_ORCHESTRATOR_PROMPT.md`

Blocking issues:
- None currently. Kaggle auth was unavailable in P0, but P1 can proceed from CMU artifact in S3.

Immediate dependencies to read first:
- `specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md`
- `specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md`
- `specs/pending/enron-data-pipeline/README.md` (Phase 1 section)
- `tooling/cli/src/index.ts`
- `tooling/cli/src/commands/` (existing command patterns)

### Episodic Context (<=1K tokens)

- Phase 0 completed dataset research + parser library evaluation + S3 raw upload.
- Kaggle metadata was verifiable, but direct download required login; CMU tarball was selected and uploaded as canonical raw source.
- `aws-api` MCP verified final object presence and metadata (`list-objects-v2`, `head-object`).

### Semantic Context (<=500 tokens)

- Bucket ARN: `arn:aws:s3:::static.vaultctx.com`
- Raw prefix: `todox/test-data/enron/raw/`
- Curated prefix: `todox/test-data/enron/curated/`
- CLI package: `tooling/cli`
- Target corpus: CMU Enron release (May 7, 2015)
- Target subset later (P2+): 1-5K threaded messages

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Spec README: `specs/pending/enron-data-pipeline/README.md`
- Phase 0 outputs:
  - `specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md`
  - `specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md`

## Verification Checklist

- [ ] Phase 0 artifacts still present and readable
- [ ] Raw CMU archive present in S3 raw prefix
- [ ] P1 implementation files created under `tooling/cli/src/commands/enron/`
- [ ] P1 tests added under `tooling/cli/test/commands/enron/` (or existing test location convention)
- [ ] `bun run check --filter @beep/tooling-cli`
- [ ] `bun run test --filter @beep/tooling-cli`
- [ ] Reflection log updated for Phase 1
- [ ] P2 handoff documents created
