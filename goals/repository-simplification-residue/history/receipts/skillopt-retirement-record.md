# SkillOpt pilot: compact results record

Locked disposition (repository-simplification-confidence SPEC, workstream A):
retire the `tools/skillopt` training runner and pilot integration, keep a
compact results record, build no replacement optimizer.

## Verdict

The pilot adopted no improvement beyond baseline noise. In the final rerun
(2026-09-29), the baseline `schema-first-development` skill scored
0.9583 / 0.9583 / 0.8750 over three identical noise passes (spread 0.0833).
The loop baseline was 0.9167. Of the two accepted steps, one won by
+0.00000025 (rounding) and the other by +0.0833, exactly the measured spread.
The run executed 37 scored rollouts, and screening avoided 16 candidate
evaluations. With the scorer sandboxed, the corpus has no headroom to
measure skill lift.

## Evidence kept as history

- Final rerun: `goals/harness-evidence-ledger/history/p4-rerun/`
  (`FINDINGS.md`, `baseline-noise.json`, `ledger-rows.json`, `steps.jsonl`,
  `screen-log.jsonl`, `rescreen.jsonl`, `skills/`).
- Earlier rerun: `goals/harness-evidence-ledger/history/p2-rerun/FINDINGS.md`.
- Pilot packet: `goals/skillopt-training-pilot/` (completed-retained).
- Exploration: `explorations/skillopt-training-pilot/`, with headroom
  follow-up in `explorations/skillopt-corpus-headroom/`.
- Harness ledger: rerun rows `hl-20260929-*` in `harness-ledger/rows/2026-09.jsonl`.
  Two deferred candidates were tombstoned by RSCF-SKILLOPT-20261014
  (`hl-20261001-f181b84d` -> `hl-20261014-9e833571`,
  `hl-20261001-500b0523` -> `hl-20261014-69d53a31`). Rejected heads are untouched.

## What was removed

- `tools/skillopt/**` (54 files: uv project, `beep_skillopt` runner, tests,
  configs, vendored prompts, `uv.lock`).
- `docs/runbooks/skillopt-rerun.md`.
- `.gitignore` entries for `tools/skillopt/.venv/` and the
  harness-evidence-ledger p2/p4 rerun `out/` and `run.log` outputs.
- The `beep-effect.iml` `tools/skillopt/.venv` exclusion, plus the SkillOpt
  wording in the `flake.nix` Python comment. `python3` and `uv` stay because
  the ciops CQ checks and skill helper scripts use them.

## What survives

The `beep agent-effectiveness evals score` scorer (`SkillOptTaskManifest`
and the `AgentEffectiveness` eval modules) is independently useful and stays
(surviving-capabilities row "Retained SkillOpt scorer"). Reconsider a trainer
only with a corpus whose headroom exceeds the 0.0833 baseline spread.

Reversal: revert the retirement PR. The runner source is recoverable from git
history.
