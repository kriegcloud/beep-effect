# Yeet Operator Clarity Plan

One PR. Keep implementation commits grouped by packet, status, summary/hints,
and docs/proof when practical.

## P0 - Grounding

- Re-read the completed predecessor packet at `goals/yeet-agent-ergonomics`.
- Confirm current Yeet command surfaces in `Yeet.command.ts`, `Planner.ts`,
  `Handler.ts`, `Verdict.ts`, `Closeout.ts`, and `QualityIssueIndex.ts`.
- Confirm repo doctrine: this is `tooling/tool` repo CLI work, not architecture
  doctrine or slice work.
- Record any drift in `research/grounding.md`.

## P1 - Packet

- Create the execution-capable packet files from `goals/_template`.
- Keep `GOAL.md` under 4,000 characters.
- Validate manifest JSON and packet references.

## P2 - `yeet status`

- Add status mode, CLI flags, plan steps, schema-first status snapshot, text
  summary renderer, and status artifact writing to `status.json`.
- Keep default status local-only; `--remote` is the only live GitHub path.
- Add focused tests for worktree count summaries, artifact absence/presence,
  JSON schema construction, next-command selection, and plan shape.

## P3 - Summaries + Hints

- Add opt-in `--summary` to monitor, closeout, and publish-with-monitor paths.
- Render concise operator summaries without changing default command output.
- Improve remediation hint selection to prefer failure-local evidence before
  broad output scans.
- Add focused tests for summary rendering and tail-needle misattribution.

## P4 - Docs + Proof

- Update `.claude/skills/yeet/SKILL.md`.
- Regenerate repo exports after new exported helpers settle.
- Run focused tests, status/plan smokes, packet checks, catalog check, and
  repo-quality checks.

## P5 - Closeout

- Run full `bun run beep yeet verify` when focused checks are stable.
- Publish with Yeet, create/monitor the PR, and run strict closeout:
  Greptile 5/5, 0 Greptile issues, 0 unresolved actionable review threads.
- Write the required reflection under `history/reflections/` and verify
  `bun run beep lint reflection-artifacts`.

## Current Blockers

None.
