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

## P7 Follow-Up Optimizations

- [ ] Split repo-export generator inputs so ordinary Quality CLI edits do not churn
  every package shard; prefer an explicit `catalogGeneratorVersion` or a smaller
  extractor fingerprint surface.
- [ ] Teach Yeet the composite pre-push lanes and persist per-lane success keyed by
  command, tree/commit fingerprint, and generator version.
- [ ] Add a shared docgen run manifest so check, generate, and aggregate can reuse
  one package graph and example typecheck cache.
- [ ] Rework terse-effect reporting into blocking files, informational files, and
  rewritable files with line-numbered findings.
- [ ] Parse known quality runner output into Yeet failure packets with failed
  subcommand, files, and suggested repair command.
- [x] Keep publish pushes branch-name independent with `git push -u origin HEAD`
  and add a preflight warning for mismatched upstream tracking.
- [x] Add a first-class push-only reuse path for exact verified commits.
- [ ] Add repo-level proof scheduling so only one full proof runs at a time while
  cheaper review-fix lanes can queue or proceed safely.
- [ ] Add `quality profile detect` and explicit profiles for current machine,
  workstation, and CI concurrency settings.
- [ ] Evolve closeout into a durable state machine for Greptile, CodeRabbit,
  ChatGPT, hosted checks, and unresolved actionable comments.
