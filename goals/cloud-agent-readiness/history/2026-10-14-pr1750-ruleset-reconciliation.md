# PR 1750 ruleset reconciliation — 2026-10-14

At ba6b80a7d071004f48590e7afb7f3d72fd22db4f, the worker's full serial cheap
tier passed with exact request.head binding. Job
cfe0be2f-d624-4528-96e2-cdb79bee40d7 completed normally in 585,136 ms, exit zero,
with systemd invocation 92cfd396d6fb4d75bf9108dd20f069a2. Cache reuse was allowed.
The private worker archive is ~/.cache/beep/readiness/pr1750/proof-ba6b80a7d0.tar.gz,
SHA-256 7cbdbe6efe6284e76aa556a0221c20339c90da78e5e278fcc88d1f5d49501b73.
This is proof for that source head, not subsequent commits.

Hosted Security job 116076066579 failed its live ruleset check: the external
beep-reviewer GitHub App check was required by ruleset 10240248 but absent from
the repository's expected context names. Keep the live protection intact and
declare the external context explicitly alongside every required workflow lane.
Regression coverage accepts a reordered complete set and rejects a missing
reviewer, a missing Security lane, and an unexpected additional context.
The validator checks names; GitHub retains the existing App integration binding.

Merged origin/main at 061d5a40e425b7c03702a8ca03c4459e31166815, merge commit
13175d5c63e81049e994ca927929099f79c0112f. Main retired Knip in favor of its
transferred Fallow findings. The automatic merge retains the readiness branch's
worker-aware cheap-gate concurrency limit and removes the retired Knip lanes.
No code from the unmerged reviewer App PR 1749 was imported.

The frozen dependency install succeeds. The live read-only ruleset check now
reports declared contexts match GitHub. Governance/model/wave regression files
pass 39 tests; proof-job and quality-task files pass 359 tests. Changed TypeScript
files pass Biome. Old generated dependency declarations require rebuilding after
the main merge; this changes ignored build artifacts, not tracked source.

The earlier Check run 38623101300 lost its Coverage and Lint Policy EC2 Spot
instances with instance-terminated-no-capacity. After verifying both instances
were terminated through the existing read-only AWS credential route, canceled
that obsolete run. GitHub force-cancel released its remaining stuck job and the
new run. Runner capacity, budget and Spot configuration were not changed.

The YubiKey SSH notification/sound wrapper fix is tracked separately in
2026-10-14-yubikey-prompt-ergonomics.md. Privilege and authentication remain on
the canonical hardware-key routes. PR 1750 remains a draft; pending hosted
checks, deployment quota failures and actual review must be assessed separately.
