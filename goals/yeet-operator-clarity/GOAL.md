# GOAL: Ship Yeet operator clarity to a mergeable PR

Repo: this `beep-effect` checkout.

Outcome: Yeet has a local-first `status` command, opt-in compact summaries for
monitor/closeout flows, and failure-local remediation hints, all implemented,
tested, published, and closed out through Yeet.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/yeet-operator-clarity/README.md`
- `goals/yeet-operator-clarity/SPEC.md` (normative)
- `goals/yeet-operator-clarity/PLAN.md`
- `goals/yeet-operator-clarity/ops/manifest.json`
- `goals/yeet-operator-clarity/research/grounding.md`

Read those first, then `AGENTS.md`, `CLAUDE.md`, and the `yeet`,
`effect-first-development`, `schema-first-development`, and
`jsdoc-annotation-specialist` skills. Higher repo standards outrank packet
prose.

Scope:

- In: `packages/tooling/tool/cli/src/commands/Yeet/**`,
  `packages/tooling/tool/cli/test/yeet.test.ts`,
  `.claude/skills/yeet/SKILL.md`, repo-export catalog artifacts, and this
  packet's status/evidence files.
- Out: graphify behavior changes, pglite flake repair, proof-lane weakening,
  hosted check-name changes, default output changes, unrelated repo-quality
  refactors, dependencies, and lockfiles.

Workflow:

1. Work from fresh `origin/main` on a feature branch.
2. Execute `PLAN.md` phases in order: P0 grounding, P1 packet, P2 status,
   P3 summaries + hints, P4 docs + proof, P5 closeout.
3. Preserve unrelated user/worktree changes and keep decisions tied to file,
   test, doc, or command evidence.
4. Regenerate repo exports only after exported test helpers settle.
5. After code edits, run `graphify update .`.
6. P5 close requires a reflection in
   `history/reflections/<YYYY-MM-DD>-<agent>.md` and
   `bun run beep lint reflection-artifacts`.

Acceptance:

- [ ] `SPEC.md` acceptance criteria pass.
- [ ] `yeet status --json`, `yeet status --remote --plan --json`,
      `yeet monitor --summary --plan --json`, and
      `yeet closeout --summary --plan --json` are valid.
- [ ] Focused Yeet tests and repo-export catalog checks pass.
- [ ] Full Yeet proof, hosted checks, Greptile 5/5 / 0 issues, and 0
      unresolved actionable review threads are green.
- [ ] No unrelated churn.

Verification:

```sh
test "$(wc -m < goals/yeet-operator-clarity/GOAL.md)" -le 4000
jq . goals/yeet-operator-clarity/ops/manifest.json
rg -n "yeet-operator-clarity|GOAL.md|agentLaunchers|packetAnchorDocument" goals/yeet-operator-clarity
git diff --check -- goals/yeet-operator-clarity
```

Stop and report before changing public API outside Yeet, weakening a proof
lane, changing hosted checks, repairing unrelated flakes, touching
dependencies/lockfiles, or using destructive state operations.

Done only when acceptance passes and the PR is mergeable, or when a blocker is
reported with file/command evidence.
