# PR 1750 current-head proof and first CI triage — 2026-10-14

## Clean worker proof at ae91b527c5

Created a disposable detached worker checkout at exact PR head
ae91b527c5f7e5acac173397303d763c615b0eb7.
Frozen Bun 1.4.2 install passes. No active worker proof jobs existed beforehand.
Submitted serial cheap gates through beep-worker-yeet, with --base HEAD,
--detach and a 20-minute ceiling, preserving the existing worker slice limits.
Fallow's actual audit base was origin/main at
c6c9acb7a20f7555e8ebb8198d003bd73ea32237. The clean branch tree, not the dirty
worker readiness checkout, supplied the proof source. Turbo cache reuse was
allowed; this is not a cache-free rerun.

Job 1c0946b4-aa8c-40ed-b1eb-0b858bdc0e1a finished success in 539,442 ms. Normal
systemd finalization records success, exit 0, invocation
eb30ccf4459949efb69ceca5e4c0df92; job wait exits zero. All collected cheap lanes
pass. Uncached Fallow audit and health report zero findings, with health taking
168,779 ms. Observed MemoryPeak=6,101,340,160 bytes stays below unchanged worker
limits; this is an observation, not a final maximum after unit collection.
The source remains ae91b527c5; a later test-fixture fix must have its own proof.

## Hosted CI triage at the same head

Three Vercel contexts explicitly report the daily deployment limit, not source
failures. Their statuses are optional deployment failures, not proof of deployed
applications. CodeRabbit says draft PR not reviewed; its success status is not
a code-review result. No review threads existed at the first inspection.

Heavy jobs were admitted but queued for the organization beep-ec2-heavy pool.
The organization runner API showed one online busy runner and two offline
registrations at inspection; repository-scoped runner listing alone was empty.
Existing runner sizing/budget policy was not changed. Pending jobs are unknown,
not green or inherited source failures.

Test Unit (repo-cli-2), job 116047944365 in run 38620930203, completed red:
2996 passed, seven skipped, two failed in yeet-wave-rerun.test.ts. Both failures
were unexpected systemctl calls querying detailed recovery properties. This
branch adds that recovery observation; the wave fixture only knew LoadState.
The failures reproduce locally: nine pass, two fail in the 11-test wave file.

Updated only the fake systemd process response to represent the existing live
monitor job: active/running, nonzero main PID and task count. Unknown commands
still fail. Production recovery behavior and the wave assertions are unchanged.
The wave file and full proof-job regressions then pass: 115 tests in two files,
22.12 seconds. This is the fix for an introduced fixture integration gap, not an
inherited main failure or a relaxed recovery predicate.

Private logs and plan remain under local ~/.cache/beep/pr1750/. Worker job logs,
verdict and Turbo summaries remain in its disposable proof checkout until
archived. Full/heavy hosted checks and remaining shard/property results were
still pending when this receipt was written; no merge-ready claim is made.
