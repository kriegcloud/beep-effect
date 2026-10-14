# A retirement acceptance checkpoint

Date: 2026-10-14. Wave 1 only. [Resumed handoff](../handoffs/rsc-a-retire-2026-10-14.md)
records exact source heads, commands, results and blockers. The older shared
`stage-5-acceptance.md` remains historical evidence; this receipt follows
SPEC's per-lane receipt rule.

## Removals

The Knip implementation, dependency, patch, config, baseline, scripts and
CLI/Turbo wiring are retired locally. Every captured finding has a final
disposition in `research/knip-findings-2026-10-09.md`; the one-Govinfo scan
is historical proof for its recorded revision. Current main introduced a
live PDF raster-coverage importer, so its internal parser export is retained.

The live `check.yml` Knip job and required context remain E/orchestrator-owned
S3 blockers. Additional generated lock hoists require the S5 effected-port
notice before publication. No final retirement acceptance is claimed.
Other retirement surfaces belong to the next A wave.

## Retained tools

Pending wave 3: current consumers, owner commands, workflow execution and
reconsideration conditions need the retained-tools receipt and surviving
capabilities register.

## Retained patches

Pending wave 3: all five fail-unpatched/pass-patched regressions, with C's
ONNX move and H1's exact-version hold. No new patch proof is claimed.

## Harness ledger

Pending the compact-presentation wave. Append-only rows remain untouched.

## Package gates

Fresh integrated package qualification is pending. October 9 package passes
remain historical and are not substituted for current-head acceptance.

## Scope

Repository writes are confined to `rsc-a-retire`. No hosted ruleset, home
configuration, foreign clone residue or ledger row was changed. The worker
never merges this PR; the orchestrator owns its gate and post-merge routing.
