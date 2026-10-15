# ESLint removal — TS7 exit B2

Lifecycle: `completed-retained`

Implementation ready for orchestrator review; verification complete with attributed
inherited failures and the untracked-packet parity constraint.

Both lint lanes now use oxlint. Retained governance helpers move to laws/ and
internal/laws/; obsolete ESLint docs rules, config, dependencies and environment
are removed. See SPEC.md for decisions and reversals and PLAN.md for phases.

The Claude orchestrator owns git and publication. The durable lane report is
`~/.cache/beep/orchestrator/briefs/ts7-exit/lanes/report-B2.md`; raw logs live in
its sibling b2-logs directory. Packet closure remains pending merge.
