# H2 performance wave (2026-10-14)

Workload: full 291-project production CLI, taskset CPUs 0-7, /usr/bin/time -v.
Time excludes admission wait; controller samples /proc/meminfo (MemTotal minus
MemAvailable), descendant RSS and, from c2 onward, own job memory.current every
second target. C1/C2 initially slept one second after collection (mean intervals
1.051s/1.049s, max 1.190s/1.153s); final sampling accounts for collection time
to retain a one-second cadence and also records kernel memory.peak. Wall below is controller elapsed with <=1 sampling interval of latency;
exact GNU time elapsed and per-process max RSS remain in external perf-cN.time.

The workstation reports 125.13 GiB MemTotal and has other admitted jobs. Host baseline/peak/delta
are preserved as measured but cannot be treated as a clean 32-GiB VM budget.
Use conservative summed process-tree RSS and own cgroup samples for capacity;
final selected-default full proof will use the actual 19-GiB hosted cap.

| Projects in flight | Wall s | Process max RSS GiB | Peak tree RSS GiB | Peak job cgroup GiB | System peak GiB | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1497.811 | 8.31 | 8.89 | not sampled | 94.03 | slower |
| 2 | 717.407 | 7.87 | 12.03 | 11.89 | 85.93 | GO default |
| 4 | 381.481 | 8.09 | 21.81 | 21.52 | 73.67 | NO-GO memory |
| 6 | 302.028 | 8.33 | 24.98 | 24.65 | 69.65 | NO-GO memory |

C1: inherited strictEffectProvide, three H2 shared-rule errors and two
unused-directive string warnings. All five introduced occurrences are repaired;
the latest selector/helper tests pass all 12 cases. C2/C4/C6: three introduced shared-rule errors plus inherited strictEffectProvide;
new-version rule findings remain zero. The shared-rule errors are repaired
after the final log review; a fresh full-inventory capped replay is running.
C4 completes all 291 targets with the same four-error census, but is NO-GO for
the default: cgroup 21.52 GiB exceeds the 19.2-GiB target. C6 completes in 302.028s but is NO-GO at 24.65 GiB kernel peak. The final
capped hosted PR/full-coverage replay is running at default concurrency 2.

Raw artifacts are under ~/.cache/beep/orchestrator/briefs/ts7-exit/lanes/h2-logs/;
no raw logs are committed. Initial c1 host baseline 62,036,324 KiB, peak
98,601,596 KiB, delta 36,565,272 KiB. C2 host baseline 57,056,580 KiB,
peak 90,108,936 KiB, delta 33,052,356 KiB. These deltas include unrelated work.

The final capped command replays scripts/ci-runner-resources.sh and `beep ci
lane effect-diagnostics --affected --base origin/main`, which dispatches exactly
`beep quality effect-diagnostics --base origin/main`. No concurrency override is
passed. Root compiler/lockfile changes select all 291 projects. The completed
c2 run is the full run at the unchanged chosen default; this final replay also
proves full-inventory coverage inside the real hosted cap, without a duplicate
uncapped full scan. C4/C6 share the exact four-error census with c2; the three H2 errors are now repaired.

## Repaired capped PR replay

Default 2, no concurrency override, CPUs 0-7, actual hosted wrapper and dispatcher,
MemoryMax=19G, MemorySwapMax=0. All 291 projects / 72,975 file visits complete.
Wall: 793.080s. Process max RSS: 8,492,116 KiB. Peak tree RSS: 13,049,988 KiB.
Sampled job cgroup peak: 12,943,196 KiB; kernel memory.peak: 12,985,732 KiB
(12.38 GiB). System baseline: 70,036,568 KiB; peak: 108,741,396 KiB;
delta: 38,704,828 KiB, including unrelated host activity. No swap allowed.

Exit 1: only inherited strictEffectProvide at AgentMessage.runtime.test.ts:322.
verify-final-census.py passes (exit 0), independently asserting all raw diagnostics,
the complete rule census, project count and file visits. The focused CLI recheck
also has check project 0 errors/warnings, test project inherited-only.

Historical c1 has four errors plus two unused-directive string warnings; c2/c4/c6
and the first capped run have four errors. The three H2 shared-rule errors and
two string warnings are fixed. Their original timing data is retained, while
this repaired run is authoritative for the final census. Runtime timing variation
on the busy workstation is visible; this is not an isolated hosted P50 claim.
