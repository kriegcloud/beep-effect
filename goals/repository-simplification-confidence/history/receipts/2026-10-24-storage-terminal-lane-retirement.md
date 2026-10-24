# Storage retention census and terminal-lane retirement — 2026-10-24

Refs #1871. This receipt covers a fresh fleet census and the retirement of five lane worktrees that git and PR state prove finished. It does not meet #1871's acceptance: no `residue-reap` apply ran, and no bytes were physically reclaimed. The orchestrator routed the remaining work to a reaper authority change (see "Why the reaper applies nothing").

## Census

The command is the one the [2026-10-23 re-census](./2026-10-23-storage-retention-recensus.md) ran, from lane `chore/rsc-1871-terminal-reap` at `main` `e009710930`, scanned at `2026-10-24T14:50:16Z`:

```sh
bun run beep quality residue-reap --fleet --classes checkout-qa \
  --classes checkout-qualification --classes checkout-generated \
  --classes checkout-jobs --classes checkout-ledgers --classes checkout-pids \
  --classes checkout-material --json
```

| Measure | 2026-10-23 | 2026-10-24 |
| --- | ---: | ---: |
| Checkout roots scanned | 194 | 196 |
| Roots with candidate rows | 113 | 115 |
| Rows | 4,639 | 4,671 |
| Apparent / exclusive bytes | — | 8,248,938,755 / 8,018,898,944 |
| Rows eligible to apply | 0 | 0 |
| Skip reasons | 4,639 `foreign-owner` | 4,670 `foreign-owner`, 1 `owner-ruling-required` |

Rows by class: `checkout-material` 3,802, `checkout-jobs` 576, `checkout-generated` 131, `checkout-qa` 87, `checkout-qualification` 65, `checkout-ledgers` 8, `checkout-pids` 2.

## The provably terminal subset

A checkout counts as terminal from git and PR state when all of these hold:
- it is a linked lane worktree, not a primary clone;
- its branch's PR is MERGED;
- its HEAD equals the PR head or is an ancestor of it, so no local commit is beyond what merged;
- its tree is clean;
- no process has its cwd inside it;
- no live session-ledger row names it.

Primary clones on `main` are excluded, because sessions keep using them. So are detached replay worktrees, because they have no PR to prove anything.

Eleven checkouts have a MERGED PR, a clean tree and no process inside. Seven of them pass every condition:

| Lane | PR | Rows | Apparent bytes | Disposition |
| --- | --- | ---: | ---: | --- |
| `beep-effect2-worktrees/pr-531-lint-oom` | #531 | 3 | 14,580,031 | retired |
| `beep-effect-worktrees/repo-cli-deterministic-projections` | #933 | 1 | 15,293 | retired |
| `beep-effect-worktrees/yeet-inbox-backpressure-classification` | #912 | 1 | 14,348 | retired |
| `beep-effect21-worktrees/plasma-sensitive-entry` | #2113 | 4 | 26,399,792 | retired |
| `beep-effect21-worktrees/undici-osv-2026-10-23` | #2199 | 3 | 26,367,021 | retired |
| `beep-effect4-worktrees/effected-4ci` | #2179 | 6 | 26,929,692 | left for its owner |
| `beep-effect4-worktrees/effected-w4x` | #2184 | 6 | 26,529,435 | left for its owner |

The two effected lanes belong to a live session that retires its own lanes, so they were left in place.

Four candidates are excluded:
- `effect-nested-module-imports` (#1760), `pr2113-mergeable` (#2113) and `agent-rating-critique-fixes` (#1996) have commits beyond their PR head.
- `security-runtimes-20261022` (#2069) still has a live session-ledger row.

## Why the reaper applies nothing

Run from the owning checkout (`effected-4ci`, dry run), `residue-reap` still skips all six rows as `owner-ruling-required`. Its checkout authority (`checkoutAuthoritySkip` in `ResidueReap.ts`) needs two things: a ruling file at `<checkout>/.beep/retention/<class>.json`, and a git-tracked evidence file inside that checkout restating the ruling. It never makes `checkout-material` eligible at all.

A merged lane cannot produce tracked evidence without new commits on its branch. Staging a file in another session's checkout only to pass the guard would defeat the guard, and was not done.

The orchestrator's route (2026-10-24) has two parts:
- Retire the five lanes with no live owner through the archive-preserving `yeet sweep --retire` path. This receipt records that.
- Separately, design a git/PR-verified terminal-lane authority for `residue-reap`, then run its real dry/apply with the recovery journal and an interruption witness. That is the path that meets #1871's acceptance.

## Retirement

Each lane was retired from its owning clone with this lane's CLI, after a `--plan` run checked every precondition:

```sh
cd <owning-clone> && bun run <this-lane>/packages/tooling/tool/cli/src/bin.ts -- \
  yeet sweep --retire --lane <absolute lane path>
```

- **Misplaced lanes:** `repo-cli-deterministic-projections` and `yeet-inbox-backpressure-classification` sit under `beep-effect-worktrees/`, but their clones are `beep-effect9` and `beep-effect6`. The retire fence refuses a target outside the owning clone's managed root. Both were first moved with `git -C <clone> worktree move` into `<clone>-worktrees/`, then retired. Before the move: no process cwd inside, a clean tree, and a free destination.
- **Archive:** each retirement archived the lane's residue under `~/.cache/beep/worktree-residue/<clone>-<id>/<lane>-20261024-<time>/`. That includes the git-ignored `.beep` material, which #2167 now preserves. Each archive has a `manifest.json`. The lanes' squash-merged local commits were kept as `unpushed-commits` residue.
- **Clones:** every owning clone was on `main` and clean. Each sweep fast-forwarded it and re-checked its lockfile.

Twelve census rows went with the five lanes: 67,376,485 apparent and 67,379,200 exclusive bytes. They moved into archives, so physical reclamation is **0** under #1871's rule that archive moves alone count zero.

## Reversal

To restore a lane, move its archived material back and recreate the worktree from the clone. The branch is gone locally and remotely, but the commits survive in the archive's `unpushed-commits` residue and in the merged PR. Then `git worktree add <path> <commit>`. No tracked repository state changed, apart from this receipt and its Decision Log row.

## Left open (#1871)

- The terminal-lane authority for `residue-reap`, plus a real dry/apply pair with its recovery journal and interruption witness.
- Owner rulings for the remaining foreign rows, including the research, corpus and runtime protected rows.
- `effected-4ci` and `effected-w4x`, for their owner.
