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
   staged as a sibling directory and published by rename, and the two renames run
   back to back with the previous trees set aside, so a failure rolls both back. A
   crash between the two renames leaves one target new and one old. The next
   `materialize` (or `--check`) detects that through the equivalence check, and a
   plain re-run is the recovery: it rebuilds both from the lock. The "cannot drift
   apart" guarantee therefore holds for every completed or recovered write. Tests
   inject a failure between the two target renames and assert the rollback, then the
   re-run repair.
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
   `skills-lock.json` or `.agents/skill-patches/**` runs `materialize --check` for old
   and new pins. It replays the patch series onto the new pristine tree and attaches two
   things to the PR: the upstream-vs-effective diff, and a per-hunk conflict report
   (applied, fuzz-applied, conflicted), keyed by hunk identity. A conflicted hunk fails
   the job and the PR waits for the review ritual. On a clean replay the workflow runs
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

## Decisions (B16–B21)

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
- **B22 — relock is a separate, plan-gated step.** Reason: `materialize --check`
  must validate against hashes that were deliberately recorded, never re-derive them
  during the check (review on #1689). Reverse: let `materialize --record` write the
  hashes in the same run.
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

## Sequencing

- **B-4 (P4):** `materialize [--check]`, the clearing-house writer and equivalence
  check, and `update --check` hand-edit detection, with tests: reconstruction parity
  for oracle (pristine plus 2 patches equals the installed files byte for byte), a
  hand-edit refusal, and a target-drift refusal. Run live: `materialize --check` is
  green on main.
- **B-5 (P5):** `skills relock`, the Renovate custom manager, the reconstruction workflow and per-hunk
  report, and the parent batch issue writer. Proof: a dry-run Renovate config
  validation (`renovate-config-validator`) plus a workflow run on a synthetic bump
  branch.
- **B-6 (P5):** the hunk ledger, `--ghost`, the two-strike query, `skills patch add`,
  and `skills review` with budget checkpoints. Proof: a scripted ledger replay over
  fixture bumps.
- **Ritual 1 (operator):** the initial HITL classification of oracle's two patches,
  prepared by `skills review` and decided by Benjamin. It is the only step on this list
  that needs him. Every other piece runs without him.
