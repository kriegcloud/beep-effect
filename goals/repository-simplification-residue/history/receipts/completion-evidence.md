# #1878 completion evidence

Lane: `residue-completion-evidence`. Base: main `d23e463b03`. Route: S39/S41, a
`claude-opus-5-5` Claude child. Owning package: `@beep/repo-cli`.

## Problem

#1574/#1744 read required checks from the history of each ruleset that current
enumeration still lists. GitHub's ruleset list omits rulesets deleted since a
merge, so the adapter hard-coded `inventoryComplete: false`. No typed packet could
verify, and #1429, #1462 and #1427 stayed `completion-gate-unknown`.

## Design

**Schema** (`commands/Goals/Goals.schemas.ts`, `CompletionEvidence.schemas.ts`):

- `GoalMergeTimeInventory` is GitHub's rule suite for the merge push: its endpoint,
  suite id, ref, `afterSha`, push time, overall result, and one
  `GoalMergeTimeRuleSource` per evaluated rule source. Each rule source carries its
  type and id, enforcement (`active`, `evaluate` or `deleted ruleset`), GitHub's
  merge-time required-status-checks result, whether current enumeration still lists
  it, and the history version endpoint read for the merge time.
- `GoalRequiredCheckFact` binds one required context to the accepted head: newest
  pre-merge check-run id, conclusion, outcome and source.
- `GoalEvidenceFactSource` (`rule-suite`, `ruleset-version`, `check-run`) names
  where each fact came from.
- `GoalCompletionEvidenceGap` names why evidence is incomplete:
  `network-failure`, `inventory-unobserved`, `rule-suite-unavailable`,
  `deleted-ruleset-unrecoverable`, `unsupported-rule-source`, `inventory-mismatch`,
  `partial-ruleset-reads`, `required-check-unobserved`.
- `GoalCompletionEvidenceVerdict` is a tagged union: `verified` (non-empty
  head-bound green facts), `unsatisfied` (head-bound reds or a failed rule-suite
  required-status-checks rule) and `unknown` (non-empty gaps).
- `GoalRequiredCheckSnapshot` gains `mergeTimeInventory` and `gaps`, and
  `GoalCompletionReceipt` gains `requiredCheckFacts`. The verified case holds at
  least one fact; the schema checks that minimum. All three decode with
  defaults, so stored receipts written before this change still decode, and they
  stay unknown.

**Contract** (`CompletionEvidence.service.ts`): `GoalMergeTimeEvidenceProvider`
takes the facts the CLI already holds (`GoalMergeTimeEvidenceRequest`: base ref,
merge commit, merge time, accepted head, check runs) and never fails. Failed reads
become gaps. `GoalCompletionIo`, the existing GitHub/git port, moves next to it
unchanged.

**Implementation** (`CompletionEvidence.ts`):

- `GoalMergeTimeEvidenceProviderLive` reads through the existing `gh` REST
  adapter, or `GoalCompletionIo` when one is provided. It lists rule suites for
  `refs/heads/<base>`, picks the one suite whose `after_sha` is the merge commit
  (deduplicated by id, since paging can repeat rows), and reads its detail. It then
  reads each surviving ruleset's history version at merge, as before.
- A rule-suite ruleset with required status checks that current enumeration no
  longer lists is deleted. It is recovered only from that ruleset's history
  endpoint. If history is gone, the gap is `deleted-ruleset-unrecoverable` and no
  contexts are invented.
- A surviving ruleset that history says applied but the rule suite did not
  evaluate (or the reverse), or two suites for one merge commit, is
  `inventory-mismatch`. Classic branch protection and organization rulesets have
  no readable history here and are `unsupported-rule-source`.
- `decideGoalCompletionEvidence` is pure. A head-bound required red, or a failed
  active required-status-checks rule in the bound rule suite, is `unsatisfied`
  even when other evidence is missing. Otherwise any gap is `unknown`. It
  re-derives completeness from the stored rule suite, so a stored
  `inventoryComplete: true` with no rule suite does not verify.
- Per context, the newest pre-merge run on the accepted head wins (highest
  check-run id). A newer green rerun supersedes an older red, and a newer red is
  never hidden. Stored receipts keep their existing freshness rule: the newest
  definite receipt wins, so a newer complete green receipt replaces an older red.
- The hosted required-checks evidence check still reports what the head-bound facts
  show. Overall `verified` also requires the verdict to be `verified`.
- Two adjacent fixes: the merge-commit read projects only the decoded fields with
  `--jq`, because file patches in large merge commits truncated the captured
  response (PR #295 lost its merge facts this way). Doctor now says plainly when
  PR, merge or check facts could not be read.

## Evidence sources and limits

| Source | Endpoint | Limit |
| --- | --- | --- |
| Rule suite at merge push | `repos/{owner}/{repo}/rulesets/rule-suites?ref=…&time_period=month`, then `rule-suites/<id>` | GitHub lists rule suites for one month at most. Older merges are `rule-suite-unavailable`. |
| Ruleset version at merge | `rulesets/<id>/history`, `rulesets/<id>/history/<version>` | History for ruleset 10240248 starts 2026-06-18; deleted rulesets have no history. |
| Current inventory | `rulesets?includes_parents=true` | Omits deleted rulesets; used only as a cross-check. |
| Check runs | `commits/<head>/check-runs?filter=all` | Already fetched; unchanged. |
| Organization audit log | `orgs/beep-effect/audit-log` | Returns 404 for this repository, so it is not a source. |

Read-only `gh api` calls made by this lane: the ruleset list, ruleset 10240248
history and version `50918272`, the rule-suite list and suites `4377188695`,
`4383622002` and `4377574834` (the #1429, #1462 and #1427 merges), PR #1429 with its
merge commit and check runs, `commits/<sha>/pulls` for the five packets' commits,
the audit-log probe and classic branch protection (none on `main`). The recorded
fixture `packages/tooling/tool/cli/test/fixtures/goals-completion-evidence/pr-1429.json`
is the #1429 responses, trimmed to the fields the decoders read.

The rule suites for the three 2026-10-06 merges leave GitHub's one-month listing around
2026-11-05. `bun run beep goals completion refresh` should persist their receipts
before then. That writes the owning clone's ledger, so the driver runs it.

## Packets

Already typed: #1429 (`document-ast-pattern-classification`), #1462
(`practice-box-onboarding`) and #1427 (`push-first-publish`) verify online. Each
merge-push suite evaluated only ruleset 10240248, and all 16 required contexts were
green on the accepted head before merge.

Subject-only packets: none migrated. A typed final-PR declaration that cannot
verify would only add an offline `completion-gate-unknown` advisory.

| Packet | Final PR evidence | Disposition |
| --- | --- | --- |
| `agent-pipeline-velocity` | #295: GitHub links it to the shipping commit `2a0fca454c`. It is already declared as legacy `mergedPullRequest`. | Left. Merged 2026-07-06, outside the rule-suite window, so it stays `unknown` online. |
| `chat-input-and-theming` | #272: GitHub links it to the packet commits, and the packet README names it. | Left. Merged 2026-06-21, outside the window. |
| `effect-native-migration` | None. The work landed as direct commits released through changeset PR #173, and the packet was reconciled in docs-only #401. | Left. No authoritative final PR. |
| `mcp-host-retrofit` | None. The work arrived through local merge `8dbd778313`, and GitHub links no PR to it or its commits. | Left. No PR exists. |
| `uspto-mcp` | None. Same local merge `8dbd778313`. | Left. No PR exists. |

## Verification

Commands ran in the lane worktree on the uncommitted tree; heavy ones through
`beep-heavy`.

| Command | Result |
| --- | --- |
| Scoped Bun run (`bunx --bun vitest run` on six goals/merge-gate files) | 6 files, 147 tests pass |
| Scoped Node run (`bunx vitest run`, same files) | 6 files, 147 tests pass |
| `bun run beep quality package-verify @beep/repo-cli` | exit 0: audit ok (1261.1s, full Bun suite 338 files), docgen ok (38.0s) |
| `bun run coverage -- --filter=@beep/repo-cli` | `coverage-ratchet ok`, 338 files. The new `CompletionEvidence*` files are 100% on all four metrics; `Completion.ts` and `Doctor.ts` meet their committed floors. |
| `bun run beep lint effect-vitest` | `introduced=0` (`resolved=66` predates this lane) |
| `bun run beep lint schema-first` | parity ratchet ok, `introduced=0` |
| `bun run beep quality effect-diagnostics --filter repo-cli` | check and test overlays, 0 errors, 0 warnings |
| `bunx oxlint <changed source and test files>` | exit 0 |
| `bun run beep observability catalog --check` | current after `--write`, which adds the new spans and drops `Goals.Completion.historicalRequiredChecks` |
| `bun run beep lint schema-catalog` | current after `--write` |
| `bun run beep quality fallow audit --base origin/main --check` | exit 0, 0 findings, after the hosted-outcome helper was extracted to clear one introduced complexity finding |
| `bun run beep laws retired-effect-paths` | 0 findings |
| `bun run beep goals doctor` | before 15 advisories, after 15; 0 blocking |
| `bun run beep goals doctor --online` (read-only) | 52 advisories, 0 blocking. #1429, #1462 and #1427 are absent (verified). Known required reds: #1728, #1766, #1573, #1588. The old adapter could verify no typed packet online. |
| jsdoc inventory then `jsdoc-ratchet` | `increased=0`; two totals decreased, baseline not rewritten |

Paired tests in `packages/tooling/tool/cli/test/goals-completion-evidence.test.ts`
cover:

- **Verified:** the recorded #1429 evidence.
- **Unsatisfied:** a head-bound red, and a failed rule-suite required-checks rule
  on a bypassed push.
- **Unknown:** five network-failure points; a deleted ruleset without history; a
  missing rule suite; an unevaluated surviving ruleset; classic branch protection;
  a missing required check; two suites for one merge.
- **Recovery:** a deleted ruleset whose history is still served.
- **Supersession:** an older red superseded by a newer green, a newer red kept, and
  a stored red receipt replaced by a newer complete green one.
- **Pagination:** a rule suite repeated across pages.
- **Property:** `verified` never appears without a bound rule suite, zero gaps,
  complete reads and a green head-bound fact for every context. It runs over
  arbitrary inputs and over arbitrary inputs mixed into the complete recorded
  evidence.

The provider tests use `it.layer` with the live provider built over a recorded
`GoalCompletionIo` layer, so no test reaches GitHub.

Two runs needed attribution, and neither is a source change. The checkout-parity
test `knowledge-doctor-evaluators` compares the committed tree with the filesystem,
so it fails while the packet manifest is uncommitted. The lane manifest was swapped
for its `HEAD` copy during the final package and coverage runs, then restored. One
coverage run hit an inherited race: `goals-bootstrap-plan`'s zero-write proof saw
another test's `test/.tmp/` directory appear. The rerun passed. Earlier ratchet runs
found a `Doctor.ts` branch drop and uncovered units in the new file. Tests were added
for stored-receipt doctor messages, non-required reds, disabled or unversioned
history, organization rulesets, unrecognized conclusions and the adapter fallback.
No baseline rows were written.

Existing fixtures that faked completeness with `inventoryComplete: true` now carry
a bound rule suite and facts. The flag-only case is asserted `unknown`. Doctor text
assertions follow the new messages.

`tooling-schema-first` (not a ratchet; 473 findings before) reports two
`pascal-case-file` rows for `CompletionEvidence.schemas.ts` and
`CompletionEvidence.service.ts`. They use the same `.schemas.ts`/`.service.ts`
naming as `Goals.schemas.ts` and `CatalogUsage.service.ts`. Knowledge refs and
knowledge doctor read the committed tree, so the driver reruns them.
`@beep/repo-cli` is private, so no changeset. No baseline, inventory, exception or
suppression row is added (S31).

## Review round 1 (#1921)

Three P2 threads, fixed in the lane on head `06e5be3e57`:

- **Deleted rulesets with a failed check.** The rule-suite red check counted only
  `enforcement: "active"`, so a ruleset deleted after the push, which GitHub reports
  as `deleted ruleset`, could hide a failed required check. `GoalMergeTimeRuleSource`
  now carries `history` (`unread`, `gating` or `not-gating`, decoding default
  `unread`). The recovered history version restores the merge-time enforcement. A
  failed rule from a deleted ruleset that history shows gated the merge is
  `unsatisfied` when the rest of the evidence is complete and `unknown` otherwise.
  It is never `verified`.
- **Non-gating history.** A recovered evaluate-mode, inactive or non-matching
  version is now `not-gating`, so it no longer blocks verification.
  Before, it was reported as `deleted-ruleset-unrecoverable`. A truly unreadable
  history stays `deleted-ruleset-unrecoverable`.
- **Doctor wording.** Doctor no longer prints the merge-time verdict for an
  unknown completion; that verdict could read "verified" when a different fact was
  missing. A new export, `goalCompletionUnknownReasons`, lists each missing fact:
  merge facts, the accepted head, the accepted-head declaration digest, an unknown
  declared gating evidence check, or the merge-time gaps. `overallOutcome` uses
  the same list, so the printed reasons and the outcome cannot disagree.

New tests:
- A recovered-gating deleted ruleset with a failed check: `unsatisfied` with
  complete evidence, `unknown` with a missing check, `unknown` with unrecoverable
  history.
- A recovered evaluate-mode version and a non-matching version: neither blocks
  `verified`.
- Doctor wording for a missing declaration digest, an unknown gating check, and a
  verified receipt (no advisory).

All checks were rerun on the final round-1 tree:

| Check | Result |
| --- | --- |
| Scoped Bun / Node (six goals and merge-gate files) | 154 tests pass under each |
| `package-verify @beep/repo-cli` | exit 0: audit 1273.0s, docgen 38.4s |
| `bun run coverage -- --filter=@beep/repo-cli` | 340 files, `coverage-ratchet ok`. `CompletionEvidence.ts` is at 100%. |
| effect-vitest / schema-first | `introduced=0` / parity ok |
| effect-diagnostics | 0 errors on check and test overlays |
| oxlint | exit 0 |
| fallow audit | exit 0, 0 findings |
| jsdoc ratchet | `increased=0` |
| catalogs | observability current; schema catalog current after `--write` |
| offline `goals doctor` | 15 advisories, 0 blocking |

One ratchet run reported a single uncovered function in `CompletionEvidence.ts`: an
unreachable branch for a deleted ruleset whose history has no version at merge. A
deleted ruleset has no listed creation time, so that read fails instead, and the
case is now handled as unrecoverable.

## Reversal

Revert the PR. The added snapshot and receipt fields are decoding-defaulted, and
the old reader ignores them. Receipts written by this code still decode there, but
they read as `unknown` because the old reader cannot see the rule suite. The
observability and schema catalog shards return through their owner commands.
