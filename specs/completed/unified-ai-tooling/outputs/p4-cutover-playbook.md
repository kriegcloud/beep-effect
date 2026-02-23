# P4 Cutover Playbook (.beep)

Date: 2026-02-23  
Status: completed

## 1) Scope and Locked Inputs

This playbook defines the migration and cutover procedure from manually maintained AI-tool configs to `.beep`-managed deterministic generation.

Locked inputs:

1. `specs/completed/unified-ai-tooling/README.md`
2. `specs/completed/unified-ai-tooling/handoffs/HANDOFF_P4.md`
3. `specs/completed/unified-ai-tooling/outputs/p1-schema-and-contract.md`
4. `specs/completed/unified-ai-tooling/outputs/p2-adapter-design.md`
5. `specs/completed/unified-ai-tooling/outputs/p3-runtime-integration.md`
6. `specs/completed/unified-ai-tooling/outputs/comprehensive-review.md`
7. `specs/completed/unified-ai-tooling/outputs/subtree-synthesis.md`
8. `specs/completed/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
9. `specs/completed/unified-ai-tooling/outputs/residual-risk-closure.md`
10. `specs/completed/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`

Locked constraints preserved in this cutover:

1. Team velocity must be preserved (short freeze window, shadow-first validation, staged ownership takeover).
2. Rollback must be simple and executable in one working session.
3. CI and hook rollout must mirror the local enforcement bundle so behavior is consistent across local and automation paths.
4. `revert` is mandatory in v1 and scoped to managed targets only.
5. POC-06 deterministic command output and dry-run no-churn invariants remain mandatory migration gates.

## 2) Migration Strategy Overview

Migration runs in four stages to prevent dual ownership and reduce operational risk:

1. **Pre-cutover inventory and baseline capture** (no writes to managed targets).
2. **Shadow mode validation** (`validate`, `apply --dry-run`, `check`, `doctor`) with deterministic/no-churn proofs.
3. **Ownership cutover** (unignore, generate, commit managed targets + manifests in bounded waves).
4. **Post-cutover stabilization** (freshness checks, rollback rehearsal evidence, follow-up tracking).

Velocity controls:

1. Keep existing manual workflows active until shadow-mode gates pass.
2. Cutover in bounded commits (instruction surfaces first, then tool configs).
3. Abort early on strict errors; never partially claim ownership of only part of a target family.

## 3) Managed Ownership Boundaries

Managed ownership in v1 is explicit and full-file rewrite only.

| Target Family | Paths | Ownership Marker Mode | Eligible for Orphan Cleanup | Eligible for `revert` |
|---|---|---|---|---|
| Instruction roots | `AGENTS.md`, `CLAUDE.md` | header | yes | yes |
| Instruction fanout | `<workspace>/AGENTS.md` for every workspace package | header | yes | yes |
| Codex MCP | `.codex/config.toml` | header | yes | yes |
| Claude MCP | `.mcp.json` | sidecar_only | yes | yes |
| Cursor targets | `.cursor/rules/*.md`, `.cursor/mcp.json` | header + sidecar_only | yes | yes |
| Windsurf targets | `.windsurf/rules/*.md`, `.windsurf/mcp_config.json` | header + sidecar_only | yes | yes |
| JetBrains targets | `.aiassistant/rules/*.md`, `.aiassistant/mcp.json`, `.aiassistant/prompt-library/*` | header + sidecar_only | yes | yes |
| Ownership metadata | `.beep/manifests/managed-files.json`, `.beep/manifests/state.json` | sidecar_only | n/a | yes |

Boundary rules:

1. Any file not listed in managed metadata is unmanaged and out-of-scope for cleanup/revert.
2. Orphan cleanup candidates are computed only as `previousManagedPaths - currentPlannedPaths`.
3. `revert` must fail with safety error on unmanaged targets (`E_REVERT_UNMANAGED_TARGET`).
4. No dual ownership: once a path is cut over, manual edits are treated as drift and corrected via `.beep` source + `apply`.

## 4) `.codex/` and `.mcp.json` Unignore/Commit Transition

Current precondition: repo ignore rules still include `.codex/` and `.mcp.json`; this must be reversed before managed ownership is claimed.

Transition steps:

1. Remove ignore entries for `.codex/` and `.mcp.json` from root `.gitignore` and any local exclude overlays used by the team.
2. Confirm unignore state:
   - `git check-ignore -v .mcp.json .codex/config.toml` must return no matches.
3. Run shadow-mode command bundle (section 5) before adding generated files.
4. Generate targets with `beep-sync apply` after shadow gates pass.
5. Stage and commit `.mcp.json`, `.codex/config.toml`, and sidecar metadata in same cutover wave.
6. Enforce that future edits to these files originate from `.beep/*`; direct manual edits are treated as drift and fixed via `apply`.

Guardrail:

1. Do not force-add ignored files as a long-term workaround; cutover must remove ignore source to keep workflow deterministic for every contributor.

## 5) Enforcement Gates (Local + CI/Hook)

Cutover requires the same gate bundle in local operator runs, CI jobs, and pre-push hooks:

```bash
bun tooling/beep-sync/bin/beep-sync validate
bun tooling/beep-sync/bin/beep-sync apply --dry-run
bun tooling/beep-sync/bin/beep-sync check
bun tooling/beep-sync/bin/beep-sync doctor
bun run beep-sync:test:unit
bun run beep-sync:test:fixtures
bun run beep-sync:test:integration
bun run beep-sync:test:coverage
```

Gate policy:

1. Any non-zero exit blocks cutover progress.
2. Strict-mode findings that imply lossy mappings or unsafe behavior block ownership takeover.
3. Gate results must be captured in the change record for auditability.

Rollout status in this branch:

1. CI wiring added in `.github/workflows/check.yml` as job `beep-sync-gates`.
2. Hook wiring added in `lefthook.yml` under `pre-push.commands.beep-sync-gates`.

## 6) POC-06 Invariant Preservation Checkpoints

The migration validation path must preserve both POC-06 invariants:

1. Deterministic command output across repeated runs.
2. Dry-run no-churn for managed baselines and manifest/state files.

Required checkpoint procedure:

```bash
bun tooling/beep-sync/bin/beep-sync validate > /tmp/p4-validate-1.txt
bun tooling/beep-sync/bin/beep-sync apply --dry-run > /tmp/p4-apply-1.txt
bun tooling/beep-sync/bin/beep-sync check > /tmp/p4-check-1.txt
bun tooling/beep-sync/bin/beep-sync doctor > /tmp/p4-doctor-1.txt

bun tooling/beep-sync/bin/beep-sync validate > /tmp/p4-validate-2.txt
bun tooling/beep-sync/bin/beep-sync apply --dry-run > /tmp/p4-apply-2.txt
bun tooling/beep-sync/bin/beep-sync check > /tmp/p4-check-2.txt
bun tooling/beep-sync/bin/beep-sync doctor > /tmp/p4-doctor-2.txt

diff -u /tmp/p4-validate-1.txt /tmp/p4-validate-2.txt
diff -u /tmp/p4-apply-1.txt /tmp/p4-apply-2.txt
diff -u /tmp/p4-check-1.txt /tmp/p4-check-2.txt
diff -u /tmp/p4-doctor-1.txt /tmp/p4-doctor-2.txt

sha256sum .beep/config.yaml .beep/manifests/managed-files.json .beep/manifests/state.json > /tmp/p4-hash-before.txt
# run validate/apply --dry-run/check/doctor command flow above
sha256sum .beep/config.yaml .beep/manifests/managed-files.json .beep/manifests/state.json > /tmp/p4-hash-after.txt
diff -u /tmp/p4-hash-before.txt /tmp/p4-hash-after.txt
```

All diffs must be clean before entering ownership cutover.

## 7) AGENTS Freshness Rollout and Rollback Playbooks

### 7.1 Rollout Playbook

1. Discover workspace package set from root workspace config.
2. Run `beep-sync apply --dry-run` and verify planned AGENTS set includes:
   - root `AGENTS.md`
   - root `CLAUDE.md`
   - `<workspace>/AGENTS.md` for every workspace package with `package.json`.
3. Execute `beep-sync apply` to claim managed ownership.
4. Run `beep-sync check` and verify no `E_AGENTS_MISSING`, `E_AGENTS_STALE`, or `E_AGENTS_SCOPE_DRIFT` diagnostics.
5. Commit AGENTS targets and updated manifest/state in same change.

### 7.2 Rollback Playbook

Use this when AGENTS generation introduces regressions or incorrect workspace fanout.

1. Execute `beep-sync revert` from repo root.
2. Verify restoration/removal behavior from command summary:
   - restored files where backups existed
   - removed generated-only managed files with matching hashes.
3. Re-run `beep-sync check` to validate post-rollback consistency for the restored baseline.
4. If rollback does not converge due metadata corruption, use backup restore fallback in section 9.

## 8) Orphan-Cleanup Rollout Safeguards and Dry-Run Checkpoints

Orphan cleanup is enabled only after dry-run review proves candidate scope is safe.

Safeguards:

1. Preview orphan candidates via `apply --dry-run`; record candidate list.
2. Confirm every candidate path is in prior managed metadata and inside repo root.
3. Block cutover if any candidate crosses boundary (`E_CLEANUP_OUT_OF_SCOPE`).
4. First live orphan deletion runs in a dedicated commit wave for easy revert/audit.
5. Post-cleanup run `beep-sync check` to verify no missing required managed targets.

Dry-run checkpoint acceptance:

1. Candidate list is deterministic across repeated dry-runs.
2. Candidate count matches expected `previousManagedPaths - currentPlannedPaths` difference.
3. No unmanaged user-authored files appear in candidate list.

## 9) Backup/Revert Operational Runbook (Cutover and Rollback)

`revert` is the primary rollback mechanism and is mandatory in v1.

### 9.1 Cutover-Time Backup Checkpoints

1. Before first write wave, ensure backup policy remains enabled (`require_revert_backups=true`).
2. During apply lifecycle, confirm overwrite candidates receive backup pointers in state metadata.
3. After each wave, verify state/manifests were atomically updated and committed.

### 9.2 One-Session Rollback Procedure

Target: complete rollback in one working session without touching unmanaged files.

1. Stop further generation activity.
2. Run `beep-sync revert` once.
3. Inspect result envelope for restored/removed managed targets and zero unmanaged mutations.
4. Run `beep-sync check`:
   - if restoring previous managed baseline branch, result should be clean for that baseline;
   - if reverting intentionally to pre-cutover manual state, drift is expected until baseline branch reset is complete.
5. If needed, rerun `beep-sync revert` to confirm idempotent no-op behavior.
6. Commit rollback state (or reset to pre-cutover commit) before resuming normal work.

### 9.3 Fallback Runbook (If `revert` Is Blocked)

Use only when `revert` fails due manifest/state corruption or missing backup safety checks.

1. Restore managed targets and sidecars from latest known-good backup commit.
2. Re-run local gate bundle (section 5) in dry-run mode to confirm deterministic baseline.
3. Reattempt cutover only after corruption root-cause is documented.

## 10) Checklists

### Pre-Cutover Checklist

- [ ] Managed target inventory is current and ownership boundaries are agreed.
- [ ] `.codex/` and `.mcp.json` ignore rules are removed and verified with `git check-ignore -v`.
- [ ] POC-06 invariant checkpoint procedure (section 6) passes with clean diffs.
- [ ] Local enforcement gate bundle (section 5) passes.
- [ ] Rollback operator and fallback owner are identified for the cutover window.

### Cutover Checklist

- [ ] Execute wave 1 with `beep-sync apply`: instruction surfaces (`AGENTS.md`, `CLAUDE.md`, package `AGENTS.md`).
- [ ] Execute wave 2 with `beep-sync apply`: `.mcp.json` and `.codex/config.toml`.
- [ ] Execute wave 3 with `beep-sync apply`: Cursor/Windsurf/JetBrains targets.
- [ ] Execute wave 4 with `beep-sync apply`: sidecar metadata finalization.
- [ ] Validate each wave with `beep-sync check` before proceeding.
- [ ] Review orphan cleanup candidates before any live deletion.
- [ ] Commit each successful wave with manifest/state updates.

### Post-Cutover Checklist

- [ ] Run local enforcement gate bundle once more on committed state.
- [ ] Execute rollback rehearsal (`beep-sync revert` on controlled fixture/baseline branch) and record result.
- [ ] Confirm AGENTS fanout remains in sync after workspace discovery.
- [ ] Confirm CI `beep-sync-gates` job and pre-push `beep-sync-gates` hook are active and green.

## 11) CI/Hook Rollout Status

Implemented in this branch:

1. CI pipeline job `beep-sync-gates` runs:
   - `validate`
   - `apply --dry-run`
   - `check`
   - `doctor`
   - `beep-sync:test:unit`
   - `beep-sync:test:fixtures`
   - `beep-sync:test:integration`
   - `beep-sync:test:coverage`
2. Repo `pre-push` hook now runs `bun run beep-sync:gates`.

Cutover contract impact:

1. Local, CI, and hook paths now share one gate contract.
2. Hook automation does not replace `revert`; operator rollback flow stays command-first and managed-target-only.

## 12) P4 Exit Assertions

P4 is complete when all are true:

1. Migration path from config sprawl to `.beep`-managed generation is explicit and staged.
2. `.codex/` and `.mcp.json` unignore/commit transition is explicit and auditable.
3. AGENTS freshness rollout and rollback playbooks are explicit.
4. Orphan-cleanup safeguards and dry-run checkpoints are explicit.
5. Backup/revert runbook is executable in one session.
6. Temporary local enforcement gates are integrated into cutover go/no-go checks.
7. POC-06 deterministic/no-churn invariants are preserved as mandatory validation checkpoints.
8. CI/hook rollout is explicitly integrated and mirrors the local gate bundle.

## Quality Gate Evidence

### Test Suites Executed

1. `bun run beep-sync:gates` (pass)
2. `cat specs/completed/unified-ai-tooling/outputs/manifest.json | jq .` (pass)
3. `rg -n "^## Quality Gate Evidence" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
4. `rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
5. `rg -n "^### (Pre-Cutover Checklist|Cutover Checklist|Post-Cutover Checklist)$" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
6. `rg -n "managed targets only|managed-target-only|E_CLEANUP_OUT_OF_SCOPE|E_REVERT_UNMANAGED_TARGET" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
7. `rg -n "beep-sync(-|:)gates" .github/workflows/check.yml lefthook.yml package.json` (pass)
8. `rg -n "^\| Design/Architecture \|" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
9. `rg -n "^\| Security/Secrets \|" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
10. `rg -n "^\| Migration/Operations \|" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
11. `! rg -n "\|[^|]*\|[^|]*\|[^|]*\| rejected \|" specs/completed/unified-ai-tooling/outputs/p4-cutover-playbook.md` (pass)
12. `jq '{ok,source,required,optional,redaction,diagnostics}' /tmp/poc05-desktop-success.json` (pass: `ok=true`, `source=desktop`, `valuesExposed=false`)
13. `jq '{ok,source,required,optional,redaction,diagnostics}' /tmp/poc05-service-success.json` (pass: `ok=true`, `source=service_account`, `valuesExposed=false`)

### Fixture Sets Used

1. Locked POC and runtime fixture references used as migration baseline evidence:
   - `tooling/beep-sync/fixtures/poc-04/*`
   - `tooling/beep-sync/fixtures/poc-05/*`
   - `tooling/beep-sync/fixtures/poc-06/*`
2. Phase contract artifacts:
   - `specs/completed/unified-ai-tooling/outputs/p3-runtime-integration.md`
   - `specs/completed/unified-ai-tooling/outputs/residual-risk-closure.md`
   - `specs/completed/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`

### TDD Evidence

No runtime code changes were made in P4; this phase defines migration/cutover operations.

Evidence model:

1. Existing POC and integration evidence remains the locked behavioral baseline for deterministic dry-run, cleanup safety, secret fail-hard behavior, and managed-target-only revert.
2. P4 adds executable migration/cutover checklists and rollback runbooks that consume those existing test-backed invariants.

### Pass/Fail Summary

- passed: 13
- failed: 0
- skipped: 0

### Unresolved Risks

None.

### Review Signoff

| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | Codex (P4 author) | 2026-02-23 | approved | Cutover sequencing, ownership boundaries, deterministic checkpoints, and checklist gating are explicit and implementation-ready. |
| Security/Secrets | Codex (P4 author) | 2026-02-23 | approved | Required-secret fail-hard posture and redaction boundaries are preserved; rollback operations remain managed-target-only with safety guards. |
| Migration/Operations | Codex (P4 author) | 2026-02-23 | approved | One-session rollback runbook, orphan cleanup safeguards, `.codex/.mcp` unignore transition, and CI/hook gate rollout are explicit. |
