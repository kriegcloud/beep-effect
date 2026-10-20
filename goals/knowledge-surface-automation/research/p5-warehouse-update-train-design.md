# P4/P5 design: Workstream B materialize, clearing house, and the update train

Status: design (docs-only PR, per the packet rule). Builds on B-3b (#1679), which flipped
`skills-lock.json` to v2: vendored entries pinned at pristine revisions, plus oracle's
`temporary-drift` patch series under `.agents/skill-patches/`. SPEC §Workstream B and the
P2 decisions B1–B4 fix *what* the warehouse does. This document fixes *how* the remaining
pieces ship. They are the last B work in P4 (materialize, clearing house,
`update --check`) and all of P5 (Renovate update train, hunk ledger, review ritual).

## Decided contract

1. **`beep skills materialize [--check] [--skill <name>]` rebuilds installed trees.**
   For each vendored entry, it loads the pristine tree at `upstream.sourceRevision`
   through `SkillUpstreamContentSource`, verifies it against the lock's snapshot tree
   hash, replays the entry's patch series in order, and verifies the result against
   `effective.treeHash`. Only then does it write. `--check` writes nothing
   and fails on any difference. Local entries are not reconstructed. They are verified
   against `installedTreeHash`, which is the same oracle `update --check` uses.
2. **Clearing house: one effective tree, two thin adapters.** The verified effective
   tree is written to both `.claude/skills/<name>` and `.agents/skills/<name>` by one
   writer, and a cross-target equivalence check (mode-aware tree hash) runs after every
   write and in `--check`. The targets are never written independently. Each target is
   staged as a sibling directory and published by rename, back to back, with the
   previous trees set aside. Two interruption stories have different recoveries:
   - *A caught failure* before both renames succeed (an error the writer sees)
     restores both targets from the set-aside trees, so neither changes.
   - *A crash between the two renames* (the process dies, so no restore runs) leaves
     one target new and one old. The next `materialize` or `--check` detects the skew
     through the equivalence check, and the recovery is a plain re-run that rebuilds
     both targets from the lock. Set-aside trees are not used for this path.

   The "cannot drift apart" guarantee therefore holds for every completed or recovered
   write. Tests cover both: a failure injected after the first rename (restore), and a
   simulated crash that leaves the targets skewed (detection, then re-run repair).
3. **`skills update --check` fails on hand-edited vendored output.** For vendored
   entries it compares the installed tree hash with `effective.installedTreeHash`. A
   hand edit is reported as `hand-edited-vendored-output`, and the remedy names both
   options: add a patch (`skills patch add`, B-6) or revert with `materialize`. The
   floating-ref refusal (contract 7, B-3b) is unchanged.
4. **Renovate regex custom manager (B3).** `renovate.json` gains one `customManagers`
   entry. It matches each vendored entry's `upstream.repository` and
   `upstream.sourceRevision` in `skills-lock.json` with `datasourceTemplate:
   "git-refs"` and the tracking ref, and is grouped per skill (`groupName:
   "skill <name>"`). That gives one PR per independently clearable skill, so one
   conflict never stalls the others. Local entries carry no `upstream`, so they never
   match.
5. **Recording the effective hashes is its own step.** A pin bump changes
   `upstream.sourceRevision`, so the lock's `snapshot` and `effective` hashes are stale
   until recorded. `beep skills relock --skill <name> [--expect <digest>]` loads the new
   pristine tree, replays the patch series, and writes the new `snapshot.treeHash` and
   `manifestHash` plus `effective.treeHash` and `installedTreeHash` into the lock
   through the B-3b plan/expect writer. Only after that does `materialize --check`
   validate. A replay conflict refuses relock and leaves the lock untouched, which is
   what makes the PR wait for review (contract 6).
6. **CI reconstruction on every lock bump.** A workflow triggered by changes to
   `skills-lock.json` or `.agents/skill-patches/**` first runs a *replay*: it loads the
   new pin's pristine tree, replays the patch series onto it, and attaches two
   things to the PR: the upstream-vs-effective diff, and a per-hunk conflict report
   (applied, fuzz-applied, conflicted), keyed by hunk identity. A conflicted hunk fails
   the job and the PR waits for the review ritual. The replay does not run
   `materialize --check`, because the lock's recorded hashes are still the old pin's
   until relock (contracts 1 and 5). On a clean replay the workflow runs
   `skills relock` (contract 5), commits the recorded hashes to the Renovate branch,
   and then runs `materialize --check`, so the PR is mergeable without a human.
7. **Hunk ledger (`.agents/skill-patches/ledger.jsonl`), append-only.** Each row is
   keyed by (old rev, new rev, patch-set hash, hunk hash) and records the decision
   (keep, drop, rebase, promote-candidate), the reviewer, and the time. `--ghost`
   replays a prior decision when a byte-identical hunk recurs. The two-strike rule (B4)
   is a ledger query: the same hunk identity conflicting in two consecutive bumps marks
   the patch `promote-candidate` in the PR report, and promotion itself stays a HITL
   decision.
8. **The review ritual is a bounded, resumable session.** Monthly, and on demand
   whenever a conflicted update PR exists, `beep skills review` walks unresolved hunks
   across open update PRs within a ~20-minute budget. It checkpoints into the ledger,
   ships every skill whose hunks are all decided, and leaves the rest queued. The first
   ritual run is Benjamin's initial classification of the generated `temporary-drift`
   patches (SPEC: "that session is the first HITL review"). Until it happens, every
   patch keeps the conservative label (B8).
9. **A batch report for the parent.** The scheduled run also writes one parent tracking
   issue per batch, listing each skill's update PR, its replay status, and its
   unresolved hunks. That way the train is reviewable from one place without a parent
   PR that blocks the per-skill ones.

## Decisions (B16–B22)

- **B16 — one writer feeds both targets.** Reason: SPEC's clearing house; two writers
  were the original drift source. Reverse: per-target writers with the equivalence check
  kept as the only guard.
- **B17 — `materialize` verifies before it writes.** It checks the pristine tree
  against the snapshot hash and the reconstruction against the effective hash. Reason:
  a fetched tree or a stale patch must never land unverified (contract 5 of the B
  design). Reverse: none needed. Verification is cheap and the cache keeps it fast.
- **B18 — Renovate `git-refs` over the lock, grouped per skill.** Reason: B3's regex
  manager can express the v2 lock, because `repository` and `sourceRevision` are plain
  JSON string fields, so the scheduled-agent fallback is not needed. Reverse: a
  scheduled `beep skills bump --plan` session, if the regex manager proves brittle.
- **B19 — conflicts fail CI and clean replays merge themselves.** Reason: B3's "one
  conflict never stalls the train". The human is only needed where a hunk truly
  conflicts. Reverse: require review on every bump PR.
- **B20 — the ledger lives in the repo as append-only JSONL.** Reason: decisions must
  survive sessions and be reviewable in PRs, as with the doctor promotions file (K12
  pattern). Reverse: move it to `research/ledger/`-style single-writer storage if write
  contention appears.
- **B21 — the ritual's first run is the operator's HITL classification.** Reason: SPEC
  makes it a human session, and an agent pre-labelling hunks would launder that
  judgment (B8). Agents prepare the session; they do not decide it. Reverse: none.
  Classification authority is not delegable under the SPEC.
- **B22 — relock is a separate, plan-gated step.** Reason: `materialize --check`
  must validate against hashes that were deliberately recorded, never re-derive them
  during the check (review on #1689). Reverse: let `materialize --record` write the
  hashes in the same run.

## Decisions recorded while landing B-4 (B24–B27)

- **B24 — the clearing house resolves targets physically; here they collapse to one
  tree.** Verified on main: `.agents/skills` is a committed symlink onto
  `../.claude/skills` (and `skills update` keeps it one through its `.agents/skills`
  mirror check), so `.claude/skills/<name>` and `.agents/skills/<name>` are the same
  directory. The writer resolves each target's parent through `realPath`, drops
  duplicates, and stages and swaps once per *physical* target. On this repository
  that is one stage and one swap (set the old tree aside, rename the stage in), so the
  two targets cannot skew here. A crash inside that swap leaves the target missing,
  which `--check` reports and a re-run rebuilds. The cross-target equivalence check
  still reads both *logical* paths after every write and in `--check`. The writer stays
  general: a checkout whose `.agents/skills` is a real directory gets two stages renamed
  back to back, and the tests cover that layout (caught-failure restore, crash skew
  detected then repaired by a re-run). Reason: B16's "one writer" holds whatever the
  link layout is, and the link's own integrity already belongs to `skills update`.
  Reverse: drop `realPath` resolution and always write both logical targets (wrong
  for the symlinked layout, since the second write would land on the first), or
  replace the symlink with two real trees, which the writer already handles.
- **B25 — stages and set-aside trees live in a sibling work directory, never inside
  the skills directory.** They go under `<parent of the skills dir>/.skills-materialize/`
  (here `.claude/.skills-materialize/`), on the same filesystem, so every rename stays
  atomic. Reason: `listInstalledSkillNames` treats any directory with a `SKILL.md` under
  `.claude/skills` as an installed skill, so a stage left by a crash there would register
  as a skill. Both work directories are gitignored, the next publish of the skill sweeps
  that skill's leftovers, and an emptied work directory is removed. Reverse: stage as
  dot-prefixed siblings inside the skills directory and teach the lister to skip them.
- **B26 — local drift fails `materialize` in both modes.** `--check` fails on anything
  not `current`. A write run rebuilds vendored drift and still fails on `local-drift`,
  because it cannot rebuild a local skill and its postcondition ("every installed tree
  equals the lock") is unmet. The message names `skills update` as the remedy. Reason:
  a green write run must mean the tree matches the lock. Reverse: report local drift as
  an advisory in write mode.
- **B27 — the materialize applier is exact; fuzz is never a write path.** Every hunk
  must match at the line its header records, newline state included. There is no
  offset search and no fuzz. Renames, copies, and binary diffs are refused. Reason: the
  result must hash to `effective.treeHash` anyway, so a fuzzed apply either fails that
  check later with a worse message or reproduces a tree nobody reviewed. Contract 6's
  `fuzz-applied` column stays a B-5 *report* classification only. Reverse: let the
  replay report attempt a fuzzed apply to classify hunks, still never writing from it.

## Decisions recorded while landing B-5 (B28–B33)

- **B28 — Renovate never automerges a skill bump.** The skill rule sets
  `automerge: false`, overriding the `:automergeDigest` preset, and labels the PR
  `skills-update-train`. A clean, relocked bump is mergeable without a human (B19), and it
  merges through the repository's normal merge gate (review window, threads, orchestrator
  merge), like every other PR. Reason: `AGENTS.md` defines one merge gate; a bot merge
  path would bypass the review window. Reverse: set `automerge: true` on the rule.
- **B29 — replay is its own read-only command, and a fuzz-only replay fails CI.** `skills
  replay` and `skills relock` share one replay engine. A hunk is tried at its recorded
  line, then at the nearest exact match (`fuzz-applied`, report only, B27), else
  `conflicted`; its identity hashes the file path and body lines, never line numbers, so
  a shifted hunk keeps the identity the B-6 ledger will key on. A replay with a
  `fuzz-applied` hunk and no conflict is `fuzz-only`: relock refuses it
  (`replay-fuzz-only`) because the strict applier cannot reproduce it, so the workflow
  fails it like a conflict. Reason: a green replay must mean relock will succeed.
  Reverse: let `fuzz-only` pass the replay job with a warning and fail only relock.
- **B30 — relock seals its own small plan and rewrites only the lock.** The
  `skills-relock-plan/v1` digest covers the read lock's SHA-256, the skill, its
  `sourceRevision`, and the new `snapshot` and `effective` blocks. `--expect` re-plans,
  refuses a mismatch (`digest-mismatch`), reports `already-current` when the lock already
  holds those blocks, and otherwise publishes through a staged rename that re-checks the
  lock bytes (`lock-changed`). The patch series and every other entry are untouched, and
  the license is checked by byte hash only (`license-changed`); a relicense needs a
  reviewed `lock-plan`. Reason: B22's plan-gated step without re-running the full
  migration plan, whose upstream path-history walk is not needed to record a pin Renovate
  already chose. Reverse: route relock through `lock-plan --write` with the pin taken
  from the lock.
- **B31 — the workflow commits the relocked lock and the rebuilt trees together.**
  Contract 6's `materialize --check` can pass only once the installed trees match the new
  effective hash, so the relock job runs, per unrecorded skill, `relock` (plan, then
  `--expect`), `materialize --skill`, then `materialize --check` and `update --check`, and
  commits `skills-lock.json` plus `.claude/skills/<skill>` to the Renovate branch as
  `github-actions[bot]`. That author is in Renovate's `gitIgnoredAuthors`, so Renovate
  keeps rebasing the branch. The job runs only for same-repository PRs opened by
  `renovate[bot]`. It pushes with the `BEEP_SKILLS_TRAIN_TOKEN` secret when set; with the
  fallback `GITHUB_TOKEN` the push does not re-trigger workflows, so the new head's
  checks need a manual re-run. Reason: a bump PR must arrive at a provable state with no
  human step. Reverse: drop the commit step and make relock plus materialize a reviewer
  step on the branch.
- **B32 — the batch report is a weekly parent issue.** `skills train-issue` renders it
  from `gh pr list --json` for open `skills-update-train` PRs, reading each PR's latest
  replay marker (base64url `skills-replay/v1` JSON without diffs, in the sticky comment;
  a marker that does not decode is ignored). The workflow runs Monday 07:41 UTC (after
  Renovate's weekend schedule) and on dispatch, keys the issue by its ISO-week title and
  the `skills-update-train` label, edits it on re-run, and opens none when no update PR
  is open. Reason: contract 9's one place to review the train, without a parent PR that
  blocks the per-skill ones. Reverse: post the same body into Renovate's dependency
  dashboard.
- **B33 — the pin tracks the whole upstream ref.** `git-refs` follows the tracking ref's
  head, so an upstream commit that does not touch the skill's path also bumps the pin.
  Its replay is clean and already recorded (same tree hashes), so relock writes nothing
  and the PR only moves `sourceRevision`. Reason: accepted noise; a path-filtered
  datasource does not exist in Renovate. Reverse: B18's fallback, a scheduled
  `beep skills bump --plan` that proposes a pin only when the skill's path history moved.

## Decisions recorded while landing B-6 (B34–B41)

- **B34 — the old revision is the merge-base lock's pin.** `skills review` reads
  `skills-lock.json` at the merge-base of `HEAD` and `origin/main` and keys each hunk's
  old revision on that lock's `sourceRevision`. On a Renovate branch that is the pin the
  bump moved from; on `main`, and for any skill the base lock does not carry, old and new
  revision are both the current pin, which is how the first ritual's rows are keyed.
  Reason: the bumped lock no longer names its old pin, and the base branch is the one
  place that does without a new lock field. Reverse: add a `--base <ref>` flag, or record
  the previous pin in the lock at bump time.
- **B35 — the queue has two kinds of item, and they settle differently.** A hunk that
  did not apply exactly at the pin under review is a `conflict` item, settled by any
  decision recorded at its exact key (keep, drop, rebase, promote-candidate). A hunk that
  applies but was never classified is a `classification` item, settled by a labelled
  `keep` or a `drop` recorded under its identity at any key, so a classification survives
  later bumps of a byte-identical hunk. A classification answer that is not a labelled
  keep or a drop is refused (`invalid-decision`). Reason: Ritual 1 has no bump to key on,
  and re-asking Benjamin to classify an unchanged hunk on every bump would waste the
  budget. Reverse: key classifications on the exact key as well.
- **B36 — the two-strike query counts recorded conflicts at other pins.** A hunk is a
  second strike when the ledger holds a non-`applied` decision for the same skill and
  hunk identity at a different new revision. Clean bumps write no ledger rows, so
  "consecutive" is read as "no re-cut since", and a rebased hunk gets a new identity, so
  its count restarts. The replay report carries the flag as `promoteCandidates` (the PR
  comment and the batch issue print "two strikes: promote-candidate"); the field decodes
  to empty when absent, so `skills-replay/v1` markers written before B-6 still decode.
  Reason: B4 marks the candidate and keeps graduation a human decision. Reverse: write a
  ledger row for every replay, clean ones included, and count strictly consecutive bumps.
- **B37 — `--ghost` replays only within one pin.** It replays the latest non-`applied`
  decision for the same skill and hunk identity at the same new revision under a different
  key (the base pin or the patch-set hash moved), keeps that row's reviewer, and marks the
  new row `origin: "ghost"`. It never replays across pins and never answers a two-strike
  item: a recurrence at another pin is exactly what the two-strike rule hands to a human.
  Reason: a ghost replays a human decision; it must not hide the signal B4 exists to raise.
  Reverse: ghost across pins and keep the two-strike flag as a warning only.
- **B38 — answers come from a decider; listing is read-only.** `skills review` without
  `--interactive` or `--decisions` only lists the queue and writes nothing, ghost
  replays included. `--interactive` asks the terminal per hunk; `--decisions <file>`
  answers from a JSON list of `{ hunk, decision, label? }` (an identity or a unique prefix
  of at least 12 hex characters), refusing an entry that names no hunk or several. Both
  record under a required `--reviewer`, the human who decided, check the `--budget`
  (default 20 minutes) before each hunk, and append every answer as it is given, so
  quitting or running out of budget keeps the checkpoint. Reason: B21 lets agents prepare
  and transcribe a session but never decide it, and the scripted file is what makes the
  ledger replay provable in tests. Reverse: drop the scripted mode and keep only the
  terminal.
- **B39 — `skills patch add` appends patches, proven before sealing.** It reconstructs
  the verified effective tree (B17), requires every install target to exist and hold one
  tree, and plans one `temporary-drift` patch per changed file numbered after the existing
  series (owner from CODEOWNERS at the merge-base, B9). The new patches must replay with
  the strict applier onto the effective tree and reproduce the installed tree. The
  `skills-patch-add-plan/v1` digest seals the lock's SHA-256, the skill, its pin, and the
  new `patches` and `effective` blocks; `--expect` writes the patch files exclusive-create,
  then publishes the lock through the re-checked staged rename, and removes the new files
  if anything fails. Reason: the remedy `update --check` names must keep the effective hash
  deliberately recorded (B22) and never overwrite an existing patch. Reverse: regenerate
  the whole series from pristine through `lock-plan --write`.
- **B40 — `skills patch label` moves lock labels to the ledger.** A patch takes a label
  only when every one of its hunks has a latest classification that keeps it under that
  same label. Unclassified, mixed, and dropped patches stay as they are and are reported
  as pending. The `skills-patch-label-plan/v1` digest seals the lock's SHA-256, the skill,
  and the label changes; labels are outside the patch-set and effective hashes, so a
  relabel never touches an installed tree. Reason: the first ritual's classification must
  reach the lock without a hand edit (B23). Reverse: record labels per hunk in the lock.
- **B41 — `lock-plan --write` carries the ledger through its patch-tree swap.** Contract
  7 puts the ledger at `.agents/skill-patches/ledger.jsonl`, inside the directory the lock
  migration write replaces wholesale. The write now copies the ledger into its stage and
  leaves it out of the patch-tree digests that decide `already-applied`. Reason: an
  append-only ledger must survive every writer of its directory. Reverse: move the ledger
  out of the patch root (for example `.agents/skill-ledger.jsonl`).
- **B42 — the three patch labels mean what a bump does with the patch (operator, Ritual 1,
  2026-10-15).** `SkillPatchLabel` named the labels but nothing defined them, so the review
  ritual asked for a classification without saying what it committed to. `policy`: the
  patch enforces a repo rule (safety, money, path hygiene) and is replayed on every bump
  whatever upstream does. `repo-adaptation`: the patch fits the skill to this repo's tools
  or workflow; it is replayed, and dropped once upstream offers an equivalent option.
  `temporary-drift`: the difference is expected to vanish and is dropped when upstream
  contains an equivalent change (the default every generated patch carries). The labels
  carry no tool behavior yet; they tell the reviewer of a conflicting bump whether to fight
  for the hunk or let it go. Reason: a classification is only useful if both the operator
  and the next reviewer read it the same way. Reverse: drop this entry and leave the labels
  as free-form review tags.

## Sequencing

- **B-4 (P4) — landed.** `beep skills materialize [--check] [--skill <name>]`
  (`SkillMaterializer` service), the strict patch applier
  (`SkillPatches.apply.ts`), the clearing-house writer and post-write equivalence
  check (B24, B25), and `update --check` reporting `hand-edited-vendored-output` with
  both remedies. Tests: reconstruction parity on a fixture (pristine plus a two-patch
  series covering modify with a no-newline tail, delete, mode change, and new file
  reproduces the installed tree byte for byte), strict-apply refusals (shifted
  context, changed context, file exists, malformed, rename), the hand-edit report,
  target skew detected by `--check` and repaired by a re-run, a caught rename failure
  after the first target was published restoring both targets, and pristine and patch
  digest refusals before any write. Live on the lane: `materialize --check` is green
  (6 vendored current, oracle pristine plus 2 patches and shadcn pristine at `2d3f1cd4`
  plus 1 patch reproduce the installed bytes, 31 local current) and a write run is a
  no-op. Main's lock carried stale local hashes for `orchestrate` and `yeet` (edited
  after #1679 recorded the lock), so `skills update --check` was red at `08fa45bd98`;
  this lane refreshed those two local entries with `beep skills update`.
- **B-5 (P5) — landed (#1732).** `beep skills replay [--skill <name>] [--json]
  [--markdown <file>]` (read-only per-hunk report, `skills-replay/v1`), `beep skills
  relock --skill <name> [--json] [--expect <planDigest>]` (`skills-relock-plan/v1`), and
  `beep skills train-issue --batch <id> --prs <file> --body-out <file>` on the
  `SkillUpdateTrain` service; the per-skill Renovate `git-refs` regex manager in
  `renovate.json`; and `.github/workflows/skills-update-train.yml` (replay with a sticky
  PR comment and artifact, relock + materialize + commit on clean Renovate bumps, weekly
  batch issue). Tests (`test/skills-relock.test.ts`): clean replay at the recorded pin,
  bumped pin clean but unrecorded with nothing written, `fuzz-applied` and `conflicted`
  classification, hunk identity stable under a shift, plan then `--expect` write then
  `materialize` to `current`, the `already-current` fixed point and the stale-digest
  refusal, refusals for an unreviewed digest, a conflict (naming patch, file, and hunk),
  fuzz-only, a changed license, local and unknown skills, a changed patch digest and a
  lock changed under the stage, the comment marker round trip, the batch issue, and the
  Renovate regex matching exactly the live lock's vendored pins. Proof: the Renovate
  regex validates (`renovate-config-validator`: "Config validated successfully"; its
  `--strict` mode also asks to migrate the pre-existing `matchPackagePatterns` rules,
  which this PR does not touch). The workflow run on a synthetic bump branch needs a
  pushed branch, so it is the first hosted proof after this PR merges.
- **B-6 (P5) — landed in this PR.** The append-only hunk ledger
  (`.agents/skill-patches/ledger.jsonl`, `skills-hunk-ledger/v1`), `beep skills review
  [--skill <name>] [--json] [--interactive | --decisions <file>] [--reviewer <handle>]
  [--ghost] [--budget <minutes>]` on the `SkillHunkReview` service, the two-strike query
  in the replay report (`promoteCandidates`), and `beep skills patch add|label --skill
  <name> [--json] [--expect <planDigest>]` on the `SkillPatchRecorder` service. `update
  --check` now names `skills patch add` as the keep remedy for hand-edited vendored
  output. Proof (`test/skills-review.test.ts`): a scripted ledger replay over fixture
  bumps (classification checkpoints and resume, a script replayed as a no-op, refusals
  for an unlabelled keep, an unknown and a doubly answered hunk, the budget and quit
  stops, a hunk conflicting at two pins flagged as a promote candidate in the review and
  the PR report and never ghosted, a ghost replay after the base pin moved, and a
  malformed ledger line), `patch add` plan then `--expect` write then `materialize
  --check` current with its refusals, and `patch label` moving a label only when every
  hunk agrees. Decisions B34–B41 above.
- **Ritual 1 (operator):** the initial HITL classification of the generated
  `temporary-drift` patches (oracle's two and shadcn's one), prepared by `skills review`
  and decided by Benjamin. It is the only step on this list that needs him. Every other
  piece runs without him. The session: `bun run beep skills review` lists the queue;
  `bun run beep skills review --interactive --reviewer @kriegcloud` walks it within the
  budget (or an agent transcribes his answers into a `--decisions` file); then `bun run
  beep skills patch label --skill <name> --json` and `--expect <planDigest>` move the
  lock labels.
