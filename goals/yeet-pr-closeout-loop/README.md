# Yeet PR Closeout Loop

Status: active implementation packet.

Mission: make Yeet handle the slow PR tail: local retry after proof, hosted
review/bot closeout, targeted review-fix quality, and updated operator skill
guidance.

Launcher:

```sh
/goal follow the instructions in goals/yeet-pr-closeout-loop/GOAL.md
```

Reading order:

1. `GOAL.md`
2. `SPEC.md`
3. `PLAN.md`
4. `ops/manifest.json`
5. `.claude/skills/yeet/SKILL.md`

Key decisions:

- `yeet monitor` remains a narrow PR check watcher.
- `yeet closeout` owns review-thread, CodeRabbit/ChatGPT/Greptile, and
  explicit Greptile rerun gates.
- `publish` keeps full local proof unless `--fast --monitor` is explicitly
  selected.
- `publish --start-pr-early --monitor` overlaps hosted PR startup with full
  local proof; hooks are tripwires, not authoritative gates.
- `publish --amend --no-edit --reuse-verified` reuses only exact matching full
  proof state.
- `review-fix` is a loop accelerator, not a replacement for full pre-push.

Verification focus:

- Planner and handler tests for Yeet command shape and retry safety.
- Quality command tests for `review-fix` and affected repo-export selection.
- Packet validation with `jq` and `git diff --check`.
- Yeet plan/proof commands before publish.
