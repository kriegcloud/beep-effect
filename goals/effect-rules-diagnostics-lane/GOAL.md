# GOAL: Effect rules on their own diagnostics lane

Work only in the assigned `ts7-tsgo-052` lane. The Claude orchestrator owns git,
publication and the final lifecycle flip. No git add/commit/push, gh or Yeet.

Outcome: decouple current Effect language-service rules from the Rust compiler
pin while preserving type-error gates and proving shared-rule coverage.

Read `SPEC.md`, `PLAN.md`, `research/SOURCES.md`, `AGENTS.md`, the TypeScript
toolchain runbook and `goals/tsc-rs-gates/SPEC.md` Decision Log first.

1. Compare actual 0.51.1/0.52/0.53 rules and standalone CLI behavior.
2. Spike 0.53.0 (eight synchronized packages), retaining tsc-rs 0.6.0.
3. Discover and measure every check/test project, with wall time, time -v RSS,
   per-rule census, shared-rule parity and a separate root check.
4. Record GO/NO-GO in `history/2026-10-14-spike.md`. On NO-GO, stop implementation.
5. On GO, add the schema-first Effect CLI quality lane with command-identical
   hosted/local execution, explicit rule severities, source fixes and policy docs.
6. Apply the amended performance wave: bounded concurrency 1/2/4/6 measured on
   CPUs 0-7, affected workspace/dependent selection on PRs, and a full standalone
   parallel hosted job capped at 19 GiB. Keep schemaClassMissingBrand off for its
   owner closing PR. Split the public catalog payload rename into the external
   patch and retain five precise temporary suppressions. Never merge main.
7. Verify touched packages, full/affected diagnostics and required cheap gates;
   attribute failures (#1792 fixes the inherited runtime test on main).
8. Write `~/.cache/beep/orchestrator/briefs/ts7-exit/lanes/report-H2.md` (<=120 lines).

Keep raw logs outside the packet in the H2 cache log directory. Record decisions
with reason/reversal in SPEC and friction immediately in research/OPPORTUNITIES.
Keep the packet active for the orchestrator; do not publish or mark completed.
