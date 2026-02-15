# Phase 2 Handoff: Subset Curation & S3 Upload

## Context For Phase 2

### Working Context (<=2K tokens)

Current task: implement Phase 2 in `tooling/cli`:
- P2.1 thread scoring algorithm
- P2.2 curated subset selector
- P2.3 curated JSON + manifest upload to S3
- P2.4 scoring/selection validation tests

Phase 1 is complete.

Implemented in Phase 1:
- `tooling/cli/src/commands/enron/schemas.ts`
  - `EnronEmail`, `EnronThread`, `EnronDocument` (+ supporting metadata/date-range/span schemas)
- `tooling/cli/src/commands/enron/parser.ts`
  - RFC 2822 parsing via `postal-mime`
  - required header extraction (`From`, `To`, `CC`, `BCC`, `Date`, `Subject`, `Message-ID`, `In-Reply-To`, `References`)
  - multipart MIME / quoted-printable / base64 handling
  - explicit body normalization (quoted reply + signature stripping)
  - deterministic IDs from canonicalized Message-ID
  - `parseCsvContent`, `parseCsvFile`, `parseMaildir`
- `tooling/cli/src/commands/enron/thread-reconstructor.ts`
  - threading from `In-Reply-To`/`References`
  - orphan handling for broken references
  - cycle-safe root detection
  - participants/depth/dateRange derivation
- `tooling/cli/src/commands/enron/document-bridge.ts`
  - Enron email/thread -> TodoX-oriented document mapping
  - stable document IDs
  - body span support for evidence offsets

Phase 1 tests added:
- `tooling/cli/test/commands/enron/parser.test.ts`
- `tooling/cli/test/commands/enron/thread-reconstructor.test.ts`
- `tooling/cli/test/commands/enron/document-bridge.test.ts`
- fixtures in `tooling/cli/test/commands/enron/fixtures/`

Verification run (Phase 1):
- Requested spec filters use `@beep/tooling-cli`, but current workspace package name is `@beep/repo-cli`.
- Successful verification commands used:
  - `bun run check --filter @beep/repo-cli`
  - `bun run test --filter @beep/repo-cli`

Blocking issues:
- No implementation blockers.
- Documentation drift: package filter name mismatch (`@beep/tooling-cli` vs `@beep/repo-cli`).

Immediate dependencies to read first:
- `specs/pending/enron-data-pipeline/README.md` (Phase 2 section)
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P2.md` (this file)
- `tooling/cli/src/commands/enron/parser.ts`
- `tooling/cli/src/commands/enron/thread-reconstructor.ts`
- `tooling/cli/src/commands/enron/document-bridge.ts`

### Episodic Context (<=1K tokens)

- Phase 0 selected and uploaded canonical CMU raw corpus:
  - `s3://static.vaultctx.com/todox/test-data/enron/raw/enron_mail_20150507.tar.gz`
- Phase 0 parser recommendation was `postal-mime` (with `mailparser` fallback only if streaming pressure requires it).
- Phase 1 implemented parsing, threading, and bridge infrastructure in CLI package and validated with fixture-based tests.
- Key Phase 1 bug fixes:
  - canonical Message-ID normalization path fixed for Bun regex behavior
  - schema decode boundary fixed to provide encoded string values for `DateFromString`

### Semantic Context (<=500 tokens)

- Bucket ARN: `arn:aws:s3:::static.vaultctx.com`
- Raw prefix: `todox/test-data/enron/raw/`
- Curated prefix: `todox/test-data/enron/curated/`
- CLI package: `tooling/cli` (`@beep/repo-cli`)
- Deterministic IDs (Phase 1):
  - email: `email:<sha256(canonical-message-id)>`
  - thread: `thread:<sha256(canonical-root-message-id)>`
- Canonical Message-ID form: `<lowercase@token>`

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Phase 0 outputs:
  - `specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md`
  - `specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md`

## Phase 2 Focus

Implement:
- `tooling/cli/src/commands/enron/thread-scorer.ts`
- `tooling/cli/src/commands/enron/curator.ts`

Expected behavior:
1. Parse corpus -> reconstruct threads
2. Score threads by extraction-value heuristics
3. Select top diverse subset targeting 1-5K messages
4. Serialize curated documents/threads + `manifest.json`
5. Upload curated artifacts to `s3://static.vaultctx.com/todox/test-data/enron/curated/`

## Verification Checklist

- [ ] `thread-scorer.ts` implemented with deterministic scoring breakdown
- [ ] `curator.ts` implemented with selection + manifest generation
- [ ] Curated JSON artifact(s) created and validated locally
- [ ] Curated data uploaded to S3 curated prefix
- [ ] `manifest.json` uploaded and includes counts/criteria/hashes
- [ ] Phase 2 tests added and passing (`@beep/repo-cli` filter)
- [ ] `bun run check --filter @beep/repo-cli`
- [ ] `bun run test --filter @beep/repo-cli`
- [ ] `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` Phase 2 section updated
- [ ] Next handoff pair created:
  - `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P3.md`
  - `specs/pending/enron-data-pipeline/handoffs/P3_ORCHESTRATOR_PROMPT.md`
