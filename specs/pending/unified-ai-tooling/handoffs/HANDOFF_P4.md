# HANDOFF P4: Validation, Migration, and Cutover

## Context Budget

Read first:
- `README.md`
- `outputs/p1-schema-and-contract.md`
- `outputs/p2-adapter-design.md`
- `outputs/p3-runtime-integration.md`
- `outputs/comprehensive-review.md`
- `outputs/subtree-synthesis.md`
- `outputs/quality-gates-and-test-strategy.md`

## Working Memory

### Phase Goal

Produce migration and cutover playbook for moving from scattered manual configs to `.beep` managed generation with reversible rollout.

### Deliverables

- `specs/pending/unified-ai-tooling/outputs/p4-cutover-playbook.md`
- Updated `specs/pending/unified-ai-tooling/outputs/manifest.json`

### Success Criteria

1. Migration sequence is safe and reversible.
2. `.codex/` and `.mcp.json` unignore/commit transition is explicit.
3. AGENTS freshness workflow rollout is explicit.
4. Rollback strategy is executable in one session.
5. CI/hook deferred state is acknowledged with clear follow-up integration points.
6. Orphan-cleanup rollout and safeguards are explicit.
7. Backup checkpoints and revert command usage are part of cutover procedure.
8. P4 output includes `Quality Gate Evidence` with required subsection schema and signoff rows.

### Blocking Issues

- None expected if P1-P3 outputs are complete and consistent.

### Key Constraints

- Preserve existing workflows during rollout.
- Keep managed outputs committed and auditable.
- Avoid dual-ownership periods where files are both manual and generated.

### Implementation Order

1. Inventory current files + classify managed targets.
2. Run shadow mode generation and diff review.
3. Transition to managed ownership + sidecar metadata.
4. Validate orphan-cleanup behavior in shadow mode.
5. Update ignore rules and commit strategy.
6. Cutover checklist and rollback flow.
7. Define migration test/rehearsal checkpoints and review signoff requirements.

## Verification Steps

```bash
cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .

rg -n "^## Quality Gate Evidence" specs/pending/unified-ai-tooling/outputs/p4-cutover-playbook.md

rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/pending/unified-ai-tooling/outputs/p4-cutover-playbook.md

rg -n "Design/Architecture|Security/Secrets|Migration/Operations" specs/pending/unified-ai-tooling/outputs/p4-cutover-playbook.md
```

## Known Issues and Gotchas

- Manual edits in managed outputs must be treated as drift, not source changes.
- Rollout docs must reflect deferred CI/hook integration explicitly.
- Rollback section must include both backup-based restore and command-based revert paths.
- `revert` scope is managed targets only in v1.
