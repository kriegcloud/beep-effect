# GOAL: Implement Fallow Advisory Ratchets

Repo: repository root (`./`).

Outcome: implement the follow-up ratchet packet that turns selected advisory
Fallow lanes into narrow, policy-backed "new debt fails" gates without
promoting all current findings to blocking lanes.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/fallow-advisory-ratchets/README.md`
- `goals/fallow-advisory-ratchets/SPEC.md`
- `goals/fallow-advisory-ratchets/PLAN.md`
- `goals/fallow-advisory-ratchets/ops/manifest.json`
- `goals/fallow-advisory-ratchets/tasks/tasks.jsonc`

Read those first, then `AGENTS.md`, `CLAUDE.md`, and the parent packet:

- `goals/fallow-quality-enforcement/README.md`
- `goals/fallow-quality-enforcement/SPEC.md`
- `goals/fallow-quality-enforcement/research/feature-matrix.jsonc`
- `goals/fallow-quality-enforcement/tasks/tasks.jsonc`

Scope:

- In: this packet, `dupes` through the clone inventory ratchet, generated
  boundary config freshness, and seeded policy work for later lanes.
- Out: raw Fallow lane promotion, Knip removal, non-dry-run `fallow fix`,
  runtime coverage adoption, and new architecture doctrine.

Workflow:

1. Start from updated `origin/main` on `feat/fallow-advisory-ratchets`.
2. Preserve unrelated worktree changes and untracked files.
3. Keep `goals/fallow-quality-enforcement` reference-only unless the user
   explicitly asks to revise the completed parent record.
4. Use `standards/clone.inventory.jsonc` and `beep reuse clones --check` as
   the first `dupes` ratchet authority.
5. Wire generated boundary config freshness, not boundary analyzer findings.
6. Keep `health` and `flags` blocked by inventory/policy prerequisites.

Acceptance:

- [ ] Packet files exist and explain the ratchet sequence.
- [ ] `dupes` is wired inventory-first, not direct all-clone failure.
- [ ] `health` fails only future calibrated new/worsened critical or high debt.
- [ ] `boundaries` wires only generated config freshness.
- [ ] Later lanes are guarded or deferred.
- [ ] Packet validator passes.

Verification:

```sh
test "$(wc -m < goals/fallow-advisory-ratchets/GOAL.md)" -le 4000
bun goals/fallow-advisory-ratchets/ops/validate-packet.ts
bun goals/fallow-quality-enforcement/ops/validate-packet.ts
bun run beep reuse clones --check
bun run beep quality fallow boundaries config-check --check
bun test packages/tooling/tool/cli/test/quality-tasks.test.ts
git diff --check -- goals/fallow-advisory-ratchets
```

Stop and report before removing Knip, running non-dry-run `fallow fix`, making
runtime coverage blocking, encoding architecture meaning in Fallow config, or
promoting a lane with unresolved false positives or doctrine gaps.
