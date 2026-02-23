# HANDOFF P5: Runtime Implementation + Skill Sync

## Context Budget

Read first:
- `specs/pending/unified-ai-tooling/README.md`
- `specs/pending/unified-ai-tooling/handoffs/HANDOFF_P4.md`
- `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md`
- `specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md`
- `specs/pending/unified-ai-tooling/outputs/p3-runtime-integration.md`
- `specs/pending/unified-ai-tooling/outputs/p4-cutover-playbook.md`
- `specs/pending/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
- `specs/pending/unified-ai-tooling/outputs/residual-risk-closure.md`
- `specs/pending/unified-ai-tooling/outputs/poc-04-managed-ownership-revert-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-05-secret-resolution-results.md`
- `specs/pending/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`
- `tooling/beep-sync/README.md`
- `tooling/beep-sync/src/bin.ts`

Budget guidance:
- This phase is implementation, not additional design-only writing.
- Replace scaffold behavior with real runtime behavior for v1 scope.

## Working Memory

### Phase Goal

Implement non-scaffold `beep-sync` runtime behavior and close the cross-agent skill sync gap so `.beep/` is a real source of truth for managed targets.

### Deliverables

- Runtime code and tests under `tooling/beep-sync/*` implementing P1-P4 contracts.
- `specs/pending/unified-ai-tooling/outputs/p5-runtime-implementation.md`
- Updated `specs/pending/unified-ai-tooling/outputs/manifest.json` (P5 status)

### Success Criteria

1. `validate`, `apply`, `check`, `doctor`, and `revert` execute real logic (no scaffold placeholder output).
2. Managed outputs are deterministic with hash-aware skip-write and no-churn behavior aligned to POC-06.
3. Skill assets from `.beep/skills/*` are synchronized to explicit agent-consumed managed targets (including `.agents/skills/*` where applicable in this repo).
4. Managed ownership boundaries are explicit; `revert` affects managed targets only.
5. Required secret resolution fails hard and redaction invariants remain intact.
6. Temporary local enforcement gates are executable and documented pending CI/hook rollout.
7. P5 output includes `## Quality Gate Evidence` with required subsection schema and required signoff rows.

### Blocking Issues

- If target skill discovery paths differ per agent runtime, codify the matrix in implementation docs and tests before claiming completion.

### Key Constraints

- Preserve team velocity during migration.
- Do not weaken POC-06 deterministic and no-churn invariants.
- Explicitly acknowledge deferred CI/hook rollout in evidence docs.
- Keep rollback path one-session executable.
- Do not expand `revert` scope beyond managed targets.

### Implementation Order

1. Replace scaffold command plumbing with real command handlers.
2. Implement compile pipeline from canonical model to managed target set.
3. Implement skill-sync target mapping and deterministic materialization.
4. Implement managed-state tracking, orphan cleanup safeguards, backup, and revert.
5. Add unit/fixture/integration coverage for runtime commands and skill sync.
6. Execute quality commands and capture evidence in P5 output.
7. Update manifest with phase progress and evidence references.

## Verification Steps

```bash
# No scaffold placeholders remain in runtime entrypoint
! rg -n "scaffold|Replace scaffold behavior" tooling/beep-sync/src/bin.ts

# Validate, apply, and check should execute real behavior
bun tooling/beep-sync/bin/beep-sync validate --fixture tooling/beep-sync/fixtures/poc-05/secrets-required-sa.yaml
bun tooling/beep-sync/bin/beep-sync apply --dry-run
bun tooling/beep-sync/bin/beep-sync check
bun tooling/beep-sync/bin/beep-sync doctor

# Revert must be available and scoped to managed targets only
bun tooling/beep-sync/bin/beep-sync revert --dry-run

# Required quality evidence structure
rg -n "^## Quality Gate Evidence" specs/pending/unified-ai-tooling/outputs/p5-runtime-implementation.md
rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/pending/unified-ai-tooling/outputs/p5-runtime-implementation.md
rg -n "^\\| Design/Architecture \\|" specs/pending/unified-ai-tooling/outputs/p5-runtime-implementation.md
rg -n "^\\| Security/Secrets \\|" specs/pending/unified-ai-tooling/outputs/p5-runtime-implementation.md
rg -n "^\\| Migration/Operations \\|" specs/pending/unified-ai-tooling/outputs/p5-runtime-implementation.md
! rg -n "\\|[^|]*\\|[^|]*\\|[^|]*\\| rejected \\|" specs/pending/unified-ai-tooling/outputs/p5-runtime-implementation.md
```

## Known Issues and Gotchas

- Existing repo tooling may still rely on manually curated files; keep ownership boundaries explicit to avoid accidental deletion.
- Skill target paths must match actual runtime discovery behavior for each agent tool in this repo.
- Temporary local enforcement is mandatory until CI/hook rollout lands.
