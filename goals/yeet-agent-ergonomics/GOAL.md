# GOAL: Ship the Yeet agent-ergonomics enhancements to a mergeable PR

Repo: this `beep-effect` checkout.

Outcome: all ten enhancements in `SPEC.md` are implemented, tested, and merged-
ready on one PR (one commit per phase), published and closed out through Yeet
itself, with hosted checks green, Greptile 5/5 / 0 issues, and 0 unresolved
actionable review threads.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/yeet-agent-ergonomics/README.md`
- `goals/yeet-agent-ergonomics/SPEC.md` (normative)
- `goals/yeet-agent-ergonomics/PLAN.md` (phases P0-P5)
- `goals/yeet-agent-ergonomics/ops/manifest.json`
- `goals/yeet-agent-ergonomics/research/session-findings.md` (evidence +
  per-enhancement file-level designs - read before coding)

Read those first, then `AGENTS.md`, `CLAUDE.md`, and the `yeet`,
`effect-first-development`, and `jsdoc-annotation-specialist` skills. Higher
repo standards outrank packet prose.

Scope:

- In: `packages/tooling/tool/cli/src/commands/Yeet/**` (+ new
  `internal/Verdict.ts`), `packages/tooling/tool/cli/test/yeet.test.ts`,
  `test/quality-tasks.test.ts`, `.claude/skills/yeet/SKILL.md`, repo-exports
  catalog artifacts, this packet's status files.
- Out: proof-lane weakening, hosted check names, closeout read-first default,
  any other package, unrelated refactors.

Workflow:

1. Work on a feature branch, never `main`.
2. Execute `PLAN.md` phases in order (P0 grounding -> P1 correctness ->
   P2 flow completion -> P3 QoL+docs -> P4 verify+publish -> P5 closeout).
   One commit per implementation phase.
3. Respect the dependency chain: path summarizer -> packet helper -> refusal
   rewiring; verdict before `--pr` body templating.
4. Run the focused tests after each phase; run
   `bun run repo-exports:catalog` only after the tree is stable (P3 end).
5. Preserve unrelated user/worktree changes. Keep decisions tied to evidence
   from files, tests, or command output; record corrections in
   `research/grounding.md`.
6. P4 publish must dogfood the new surface: deliberate untracked residue +
   `bun run beep yeet publish --staged-only --pr --monitor --message "..."`.
7. P5: closeout gates green; reply/resolve addressed threads with the new
   write-back flags; update packet status + `history/`.

Acceptance:

- [ ] `SPEC.md` acceptance criteria and verification matrix all pass.
- [ ] Focused vitest suites pass; full Yeet proof green; catalog current.
- [ ] PR created by `yeet publish --pr`; verdict.json written for the run;
      stash restored (or ref reported).
- [ ] Hosted checks green; Greptile 5/5, 0 issues; 0 unresolved actionable
      threads; no unrelated churn.

Verification:

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/yeet.test.ts packages/tooling/tool/cli/test/quality-tasks.test.ts
bun run beep yeet publish --staged-only --pr --plan --json
bun run beep yeet verify --plan --json
bun run repo-exports:catalog:check
test "$(wc -m < goals/yeet-agent-ergonomics/GOAL.md)" -le 4000
jq . goals/yeet-agent-ergonomics/ops/manifest.json
git diff --check -- goals/yeet-agent-ergonomics
```

Stop and report before weakening any proof lane, changing public API outside
the named scope, touching dependencies/lockfiles (beyond catalog regen),
auto-dropping stashed work, or any destructive state change `SPEC.md` does not
require.

Done only when acceptance passes and the PR is mergeable, or when a blocker is
reported with file/command evidence.
