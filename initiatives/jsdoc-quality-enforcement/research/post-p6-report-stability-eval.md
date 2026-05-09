# Post-P6 Report Stability Evaluation

## Question

Did the P6 hardening work remove the blockers that kept V1 from closing as a
report-only JSDoc quality workflow?

## Scope

This pass re-ran the P5 architecture-stratified package sample after P6 landed:

- tooling: `@beep/repo-cli`, `@beep/repo-docgen`, `@beep/repo-utils`
- foundation: `@beep/schema`, `@beep/types`, `@beep/identity`
- drivers: `@beep/openai`
- shared kernel: `@beep/shared-domain`
- executable architecture fixture: `@beep/fixture-lab-specimen-domain`
- product slice domain: `@beep/workspace-domain`

The pass did not remediate source JSDoc, add blocking enforcement, run model
edits, change the rubric, or evaluate local model workers.

## Repo Evidence

Raw package reports were written under `/tmp/jsdoc-quality-post-p6/` during the
local run. The committed compact summary is
[`../history/outputs/jsdoc-quality-post-p6-summary.json`](../history/outputs/jsdoc-quality-post-p6-summary.json).

All ten deterministic package-local reports completed:

| Package | Family | Runtime | Subjects | Pass | Warn | Fail |
|---|---:|---:|---:|---:|---:|---:|
| `@beep/repo-cli` | tooling | 3.197s | 544 | 89 | 130 | 325 |
| `@beep/repo-docgen` | tooling | 2.331s | 67 | 11 | 56 | 0 |
| `@beep/repo-utils` | tooling | 1.911s | 608 | 104 | 389 | 115 |
| `@beep/schema` | foundation | 1.948s | 1281 | 306 | 136 | 839 |
| `@beep/types` | foundation | 0.365s | 11 | 11 | 0 | 0 |
| `@beep/openai` | drivers | 0.055s | 2 | 1 | 0 | 1 |
| `@beep/shared-domain` | shared | 1.622s | 185 | 183 | 2 | 0 |
| `@beep/fixture-lab-specimen-domain` | fixture | 1.490s | 11 | 11 | 0 | 0 |
| `@beep/workspace-domain` | slice | 1.437s | 39 | 39 | 0 | 0 |
| `@beep/identity` | foundation | 1.181s | 80 | 14 | 55 | 11 |

Aggregate deterministic findings across the sample:

| Finding code | Count |
|---|---:|
| `missing-example` | 1173 |
| `example-lacks-observable-result` | 794 |
| `example-only-voids-result` | 591 |
| `missing-description` | 367 |
| `example-too-trivial` | 82 |
| `missing-effects-for-effectful-symbol` | 73 |
| `missing-category` | 7 |
| `missing-since` | 5 |

Selective `--score codex --packet-limit 25` probes also completed without
executing edits:

| Package | Runtime | Packets | Omitted |
|---|---:|---:|---:|
| `@beep/repo-cli` | 2.942s | 25 | 430 |
| `@beep/schema` | 1.897s | 25 | 950 |
| `@beep/identity` | 1.095s | 25 | 41 |

## P5 Comparison

P5 found real signal but was not closure-ready: `@beep/schema` did not finish
within the evaluation ceiling, `@beep/repo-utils` took 124.636s, and
`@beep/repo-cli` took 75.250s in deterministic mode. P6 removed those runtime
blockers in this local post-P6 sample. The same representative package set now
has zero partial reports, zero timeouts, and a maximum deterministic runtime of
3.197s.

The finding counts changed because P6 intentionally narrowed the subject model
and rubric behavior: re-export declarations are graph edges instead of quality
subjects, type-only examples can be useful without runtime output, and advisory
Codex packets are capped. Treat the post-P6 counts as the new report baseline,
not an enforcement threshold.

## Recommendation

Close the current initiative as V1 complete, report-only.

The report machinery is now stable enough for routine advisory use and for
future remediation planning. It is still not appropriate to make findings
blocking inside this initiative because the sample intentionally contains 1,291
failures and 768 warnings across existing source documentation. Those are useful
work queues, not an evaluated pass/fail threshold.

Future enforcement should be proposed as a separate, narrower initiative after
teams have used the report output to remediate or explicitly accept package
baselines. A sensible next experiment is package opt-in warning mode, followed
by changed-files blocking only for high-confidence finding codes once precision
is measured on real documentation PRs.

## Closure Decision

- V1 quality reporting is implemented and hardened.
- V1 remains advisory and report-only.
- Universal `@example` remains the policy for owning exported symbols.
- Re-export declarations remain export graph edges, not exception categories.
- Codex packets remain bounded advisory work queues.
- Local model workers remain outside V1.
- Blocking enforcement is explicitly future work and should require a new
  decision plan.
