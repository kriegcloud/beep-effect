# Deprecated-API law lane on oxlint type-aware

Lifecycle: active. Parent: [lint-policy-single-digit](../lint-policy-single-digit/README.md).

**GO for local cutover; hosted <=150s timing remains pending.** The initial
2026-10-14 NO-GO wording is retained in the history and Decision Log next to the
orchestrator reclassification: preconditions incomplete; gates not yet run.

The executable preconditions are repaired. All 37 eligible allow-default subjects
have real strict projects. Full parity covers 5200 TypeScript files in 38 uncached
ESLint shards; both engines have zero findings and the normalized diff is empty.
The eight-case corpus produces ten identical findings per engine. A fresh
four-thread full Oxlint process scans 5215 files in 60.54s with 12308852 KiB peak RSS.
Hosted timing must come from the orchestrator's PR Lint Policy job.

The CLI now uses one four-thread native worker for full/hosted sweeps, while
package/affected modes preserve their flags and caller-base selection. The XML
option uses a behavior-tested EntityDecoder replacement, with no suppression.
Lane B retains typescript-eslint dependencies and shared profile environment.
Fingerprint and package scripts are regenerated; the reviewed cache baseline
records existing posture without granting qualification. Root deprecated-apis and
all 26 package owners pass, including the final CLI audit and docgen. The bounded full
policy replay fails only inherited JSDoc drift in unchanged source; the orchestrator
owns the consolidated main repair. Hosted timing remains pending.

See [SPEC.md](SPEC.md), [PLAN.md](PLAN.md), [history](history/2026-10-14-p2b-re-spike.md),
[triage](research/triage-2026-10-14.md), and [measured results](research/gate-results-resume.json).
The orchestrator owns git, publishing and packet completion.
