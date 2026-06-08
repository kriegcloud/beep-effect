# Plan

## P0 Grounding

- Start from fresh `origin/main` on a feature branch.
- Confirm current worktree and preserve unrelated local changes.
- Review Yeet, quality, repo-run proof, and skill files.

## P1 Research Inputs

- Use parallel research lanes captured in `ops/prompts/`.
- Synthesize architecture, Yeet UX, PR bot, and quality throughput findings.
- Keep decisions in this packet and implementation comments only where useful.

## P2 Quality Lane

- Add `review-fix` to GitHub check modes and repo proof surfaces.
- Implement affected build/check/lint/test/docgen/repo-export sequence.
- Add affected repo-export shard selector with conservative full fallback.

## P3 Yeet Planner And Retry

- Add `YeetProofTier` and `closeout` mode.
- Add `publish --amend --no-edit --reuse-verified`.
- Write/read `.beep/yeet/runs/<runId>/state.json` after full proof.
- Require exact state match before skipping publish proof.

## P4 PR Closeout

- Add GitHub PR closeout helper using `gh`.
- Read PR metadata, review threads, comments, reviews, and bot summaries.
- Parse Greptile score/issues and emit QualityIssue packets on failures.
- Gate GitHub writes behind `--retrigger-greptile`.

## P5 Docs And Skill

- Add this packet.
- Update `.claude/skills/yeet/SKILL.md` with new retry, review-fix, and
  closeout workflows.

## P6 Proof And Publish

- Run focused tests.
- Run relevant type/quality checks.
- Regenerate/check repo export catalog.
- Stage only intended files.
- Publish through Yeet, create/monitor PR, run closeout, and address comments.
