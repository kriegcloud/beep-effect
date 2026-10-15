# H2 performance-wave cache review (2026-10-14)

Reviewer: Codex H2 implementation lane.

The new quality:effect-diagnostics GithubCheckLaneSpec invokes the CLI directly
and does not declare a cached Turbo computation. Heavy Check loses its serial
standalone diagnostics step; its Turbo check commands, inputs, outputs and cache
settings stay unchanged. Hosted Effect Diagnostics has a separate matrix job,
affected PR selection, full main-push selection, and a 19-GiB hard transient-service
ceiling, no swap, named-unit cleanup and an 85-minute runtime limit. No package script words, dependency edges, global Turbo inputs or cache
qualification are added. The standalone rule CLI inherits project severity policy.

Review scope is // and @beep/repo-cli, which own orchestration. Preserve every
prior review outside those subjects, the current qualification scope, profile and
epoch. A reviewed baseline request is recorded because lane specs changed,
even though the initial audit reports zero blocking findings. No qualification
or new cache reuse is granted. Reversal: restore the Check step and lane specs,
then re-record the baseline with a review of the resulting projection.

The new pre-push lane is also added to the existing scheduler seed and its
generated handoff fixture under TTC ruling 76. Its cost is the 1497.811s
eight-CPU serial observation as an explicit conservative external-run proxy,
not a claimed hosted P50; no cached computation settings change. The selected
default is two projects; four and six exceed the 19.2-GiB capacity budget.
