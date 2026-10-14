# Friction receipts

## 2026-10-14: capture refresh rejected prior triage lane syntax

- Doing: appending one newly detected finding from a full 48-record CSV export.
- Evidence: `beep codex findings ingest --refresh` rejected the existing
  `ops/triage.json` as not decodable. The prior hand-authored ledger used bare
  `L<n>` lane IDs and `already-fixed` as a work status; the current schema
  requires `L<n>-<slug>` and `not-required`. Four finding lane references had
  no matching lane record. Repairing those metadata values let the dry run
  preserve all 47 IDs and append CSF-048.
- Would have prevented it: schema validation of packet ledgers before the
  original P2 edits, with a diagnostic pointing to the invalid field.

## 2026-10-14: fresh worktree package check lacks built dependency declarations

- Doing: verifying the first `@beep/repo-cli` security repair in a newly
  bootstrapped sibling worktree.
- Evidence: `bun run beep quality package-verify @beep/repo-cli --quick`
  passed lint but its `beep:check` step reported `TS6305` for missing
  `@beep/utils`, `@beep/schema`, and repo-utils `dist/*.d.ts`, followed by
  cascaded type errors. The focused 21-test parser suite passed.
- Would have prevented it: package verification building or identifying its
  dependency declaration closure before reporting source diagnostics, or a
  clear preflight naming the required build command.

## 2026-10-14: GraphQL quota hides PR file ownership

- Doing: checking whether the open Yeet S11 PR overlaps the security repair.
- Evidence: `gh pr view 1678 --json files` returned `API rate limit already
  exceeded`; the REST `/pulls/1678/files` call supplied the file list.
- Would have prevented it: a REST fallback for the read-only PR-file lookup
  when GraphQL quota is exhausted.

## 2026-10-14: Bun config flag silently changed command interpretation

- Doing: blocking an untrusted source checkout from loading a Bun preload
  before the signed pilot worker starts.
- Evidence: with Bun 1.4.2, `--config <path>` still loaded the source checkout's
  `bunfig.toml` and did not run the worker, while `--config=<path>` suppressed
  the preload and ran the worker. Both forms exited zero in the small isolated
  reproduction.
- Would have prevented it: CLI argument-shape tests that execute the pinned
  Bun version instead of checking only a mocked process argument list.

## 2026-10-14: focused package verification missed the test typecheck lane

- Doing: publishing the 48-finding security PR after affected-package quick
  checks and Yeet cheap gates passed.
- Evidence: PR #1728 `Heavy / Check` failed in `quality:test-tsgo` on five
  changed repo-cli tests. Diagnostics included pipeable assertion style,
  prohibited Node filesystem/path imports, and a byte input passed to a
  string-only test helper. `package-verify @beep/repo-cli --quick` had passed
  because it runs package lint and source check, not this test typecheck lane.
- Would have prevented it: have the quick package verifier name the omitted
  test typecheck lane, or offer a repo-cli test typecheck profile before push.

## 2026-10-14: live knowledge-doctor test times out in the full repo-cli shard

- Doing: waiting for hosted proof of PR #1728 after the docket fixture repair.
- Evidence: `Test Unit (repo-cli-1)` timed out at 180 seconds in the live
  knowledge-doctor checkout test on both PR #1728 and the independently
  running `main` head. The isolated knowledge-doctor test file passed locally.
  The live test scanned the whole checkout twice even though its fixture suite
  already checks deterministic report encoding.
- Would have prevented it: keep the live checkout test to one scan and leave
  deterministic double-scan proof to the bounded fixture; set a timeout based
  on the hosted runner's measured runtime.

## 2026-10-14: Yeet publish pushes but cannot detach its monitor

- Doing: publishing each corrected security head through `beep yeet publish`.
- Evidence: cheap gates, fresh install, and `git push` succeeded, then monitor
  submission exited nonzero because no active systemd user manager was
  available. The published head was verified remotely and the documented
  attached `beep yeet monitor --until-ready` path resumed review tracking.
- Would have prevented it: have publish start the attached monitor fallback,
  or report pushed success distinctly from monitor submission failure.

## 2026-10-14: review fix added a Fallow complexity gate failure

- Doing: rerunning Yeet cheap gates after the drawings delivery symlink review fix.
- Evidence: `quality fallow audit --check` attributed one new cognitive
  complexity finding to the temporary-file cleanup inside
  `Drawings.review.ts`. Extracting that cleanup into a small named function
  cleared the introduced finding; the drawing review tests and test typecheck
  passed afterward.
- Would have prevented it: run the new-only Fallow audit on the reviewed
  change before starting the broader cheap-gates suite.

## 2026-10-14: hosted job log download timed out during CI attribution

- Doing: attributing a red repo-cli test shard on the shared `main` blocker.
- Evidence: the documented `gh api` job-log read ended with an `i/o timeout`
  while retrieving the completed job's log. The check-run annotations named
  only the shard exit, so the exact failing test remained unknown at that point.
- Would have prevented it: retain a concise failing-test summary in the check
  annotations or as a separately downloadable artifact when the large log
  blob is unavailable.

## 2026-10-14: coverage runner lost communication before a verdict

- Doing: attributing the optional Coverage Regression failure on PR #1728.
- Evidence: the completed check annotation says the self-hosted runner lost
  communication with GitHub. Its log stops during package coverage execution,
  with no coverage delta or final assertion. An EC2 state read confirms Spot
  instance termination, so the job cannot establish whether coverage passed
  or failed on that head.
- Would have prevented it: a durable runner heartbeat and a small final lane
  summary uploaded independently of the large test stream, plus runner health
  telemetry for memory, CPU, and network loss.

## 2026-10-14: main merge revived assertions for a removed export write

- Doing: integrating the current `main` into security PR #1728 before review.
- Evidence: the merged `PracticeMod.hooks.test.ts` still expected
  `practice-verdicts.jsonl`, `fs.write`, and `host.writeText`; this branch's
  CSF-050 repair returns JSONL for explicit saving. Three hook tests and hosted
  `Test Unit (unit-b)` failed until the test asserted the copy-out contract.
- Would have prevented it: run the affected package's focused tests after each
  base merge, before pushing the merged head.
