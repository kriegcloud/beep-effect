# GOAL: Ship Yeet PR Closeout Loop

Repo: `/home/elpresidank/YeeBois/projects/beep-effect`.

Outcome: implement the Yeet optimizations from the quality/CI retrospective,
prove them with Yeet, update the `$yeet` skill, and publish a mergeable PR.

This is an implementation `/goal` packet. Start from current `main`, create a
fresh feature branch, and keep unrelated local state out of the commit.

Read first:

- `goals/yeet-pr-closeout-loop/README.md`
- `goals/yeet-pr-closeout-loop/SPEC.md`
- `goals/yeet-pr-closeout-loop/PLAN.md`
- `goals/yeet-pr-closeout-loop/ops/manifest.json`
- `AGENTS.md`, `CLAUDE.md`, `standards/ARCHITECTURE.md`
- `.claude/skills/yeet/SKILL.md`

Parallel research inputs are captured under `ops/prompts/` and summarized in
`research/README.md`. Do not rerun research unless the source architecture has
drifted materially.

Implementation scope:

- Add `bun run beep yeet closeout` for PR review-thread and bot gates.
- Keep `yeet monitor` as the simple hosted check watcher.
- Add durable Yeet run state in `.beep/yeet/runs/<runId>/state.json`.
- Add exact-match retry UX:
  `bun run beep yeet publish --amend --no-edit --reuse-verified`.
- Add targeted loop proof:
  `bun run beep yeet verify --tier review-fix`.
- Add `bun run beep quality github-checks review-fix`.
- Add affected repo-export shard checks while preserving full fallback.
- Update `.claude/skills/yeet/SKILL.md` after code is shipped.

Guardrails:

- Full pre-push remains canonical for publish.
- `--fast --monitor` stays opt-in only.
- GitHub write behavior is limited to explicit Greptile retrigger comments.
- Do not auto-resolve or auto-reply to review threads.
- Secrets, SAST, security, Nix, and full quality lanes remain intact.

Done means:

- Focused tests and relevant type/quality checks pass.
- Repo export catalog is regenerated/checked when exported symbols change.
- Packet verification passes.
- Changes are committed and pushed through Yeet.
- A PR exists, hosted checks are monitored, actionable comments are addressed,
  and closeout gates pass or have concrete blocker evidence.

Packet verification:

```sh
test "$(wc -m < goals/yeet-pr-closeout-loop/GOAL.md)" -le 4000
jq . goals/yeet-pr-closeout-loop/ops/manifest.json
git diff --check -- goals/yeet-pr-closeout-loop
```
