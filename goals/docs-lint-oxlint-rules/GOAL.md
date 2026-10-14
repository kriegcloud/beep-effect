# TS7 lane B: documentation lint on oxlint

Implement the documentation lint migration in this worktree. The Claude orchestrator owns
all git operations and publishing; never stage, commit, push, call gh or Yeet from this lane.
Read SPEC.md, PLAN.md and ops/manifest.json for current scope and receipts.

Scope: repo-owned mandatory JSDoc rules, category and TSDoc checks in @beep/lint-rules;
package/root/staged runners; docs-specific Turbo inputs and quality task plans; current docs.
ESLint removal, deprecated-API profiles, shared environment and laws helper moves are deferred
until lane A merges. Historical goal records remain intact except the requested dated
repository-simplification opportunity note.

Use tsc-rs 0.6.0 for gates and the pinned @effect/tsgo 0.51.1 for rule/example proofs.
Build package dependencies first. Admit heavy work with beep-heavy; record every verification
command and exit code, attribution, decisions and reversal routes. Keep packet lifecycle active.
When done or blocked, write the orchestrator lane report to its assigned report-B.md path.
The orchestrator performs the publishing and post-merge completion/reflection phases.
