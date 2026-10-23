# Legacy per-checkout Turbo cache archive — 2026-10-23

Refs #1873 (criterion 3). Under the 2026-10-06 autonomy charter, dispatched by the S44 orchestrator: archiving (not deleting) the two retained legacy caches is reversible and involves no money, so the agent decides and records the reversal.

## Which caches

No packet file names the "two legacy per-checkout caches". They were identified on disk as the only clone-level `.turbo/cache` directories that still hold data; the other six (`beep-effect17` through `beep-effect22`) are empty. The [harness-cache census](./2026-10-23-harness-cache-census.md) shows every harness child resolving the shared `~/.cache/beep/turbo`, which makes these per-checkout caches legacy.

| Cache | Files | Bytes | Last write before archive |
| --- | ---: | ---: | --- |
| `~/YeeBois/projects/beep-effect0/.turbo/cache` | 765 | 15,038,524 | before 2026-10-01 (directory 2026-09-25) |
| `~/YeeBois/projects/beep-effect-private/.turbo/cache` | 7,137 | 247,791,102 | before 2026-10-01 (directory 2026-09-23) |

## Checks and move

Before each move:
- the destination was free;
- source and residue root were on the same btrfs filesystem, so the move is an atomic rename;
- no process held a descriptor under the cache, and no process had a cwd in either checkout.

Each cache was moved whole to `~/.cache/beep/worktree-residue/legacy-turbo-cache/<clone>-20261023-154747/cache`, and the file count was re-verified after the move. A `RESTORE.md` beside each records the origin, the checks and the restore command:

```sh
test ! -e ~/YeeBois/projects/<clone>/.turbo/cache && mv ~/.cache/beep/worktree-residue/legacy-turbo-cache/<clone>-20261023-154747/cache ~/YeeBois/projects/<clone>/.turbo/cache
```

Turbo recreates an absent per-checkout cache on demand, so no checkout depends on these directories. An archive move counts as zero physical reclamation until a separate purge.

## Left open (#1873)

- Criterion 1: the Cursor child-posture probe after Cursor's usage reset (2026-11-11).
- Criterion 2: the operator grants native environment/home write scope for the backed-up `environment.d` apply and its drift-refusal test.
