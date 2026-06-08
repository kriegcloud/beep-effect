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
- Add explicit start-PR-early UX:
  `bun run beep yeet publish --start-pr-early --monitor --message "..."`.
- Add `bun run beep quality github-checks review-fix`.
- Add affected repo-export shard checks while preserving full fallback.
- Update `.claude/skills/yeet/SKILL.md` after code is shipped.

Additional optimization scope for follow-up commits in this PR:

- Narrow repo-export invalidation by decoupling generator fingerprints from
  monolithic Quality command edits.
- Persist composite quality sub-lane proof state so late failures do not force
  clean reruns of already-proven lanes.
- Share docgen plan/result manifests across check, generate, and aggregate.
- Split terse-effect output into blocking, informational, and rewritable files.
- Extract known failed sub-lanes into Yeet failure packets with exact repair
  commands.
- Make `git push -u origin HEAD` the default publish push and warn on mismatched
  upstream branch names.
- Add an explicit push-only reuse mode for already-verified commits.
- Codify start-PR-early publish plus hook-as-tripwire guidance.
- Add machine-aware proof scheduling plus explicit hardware profiles.
- Model PR closeout as durable states for bot gates and Greptile reruns.

Guardrails:

- Full pre-push remains canonical for publish.
- `--fast --monitor` stays opt-in only.
- `--start-pr-early --monitor` skips hooks only to start hosted review early;
  full local proof and hosted monitor remain required.
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
