# Foreign-clone owner dispositions — 2026-10-23

Refs #1854. This is a read-only re-census of all 29 rows left in the preceding
archive receipt, not authorization to write another checkout. The S44 charter
disposition is **retain: live owner** for tracked working-tree content and
Serena project state. SST declarations remain with #1851. Original archives,
Vitest work and owner material remain untouched. No foreign checkout was mutated.

The adjacent JSON records every path's owner role, byte count, SHA-256 manifest,
tracked count, existence and visible process-cwd count. For a directory, hash
sorted relative regular-file names with each file's SHA-256 as
`<sha256>  <relative-name>\n`, concatenate and SHA-256 the UTF-8 result. For a
file use the same manifest form with its basename. An absent path has zero
files/bytes and an empty manifest hash. The two absent rows below were archive-retired
by TS7 under #1877, landed in #2173; they are not retained in place.
Recovery for retained paths is in place and checkout history; prior archived
paths keep the existing hash-verified restore instructions.

Visible process cwd census: 6 rows have live checkout cwds. There were 985 unreadable process cwd links; zero visible matches cannot prove idleness. Retained rows remain fenced; nothing was archived or deleted by this census.

Round-one existence recheck: all 29 paths checked against the live filesystem;
27 remain present and only the same two Vitest rows are absent. Byte/hash and
process counts above remain the original census snapshot. Retirement provenance
for those two rows was verified by the S44 orchestrator:

| Archived lane | Earlier tracked files | Recovery archive ref (in `$HOME/YeeBois/projects/beep-effect2`) | Archive tip | Residue directory under `$HOME/.cache/beep/worktree-residue/beep-effect2-ed013b4f7edc/` |
| --- | ---: | --- | --- | --- |
| effect-vitest-capability-leaves | 10,365 | `refs/archive/worktrees/effect-vitest-capability-leaves/20261023-205027` | `38ac5d9da9` | `effect-vitest-capability-leaves-20261023-205027` |
| effect-vitest-inventory-proof | 10,201 | `refs/archive/worktrees/effect-vitest-inventory-proof/20261023-205213` | `d9f74d230a` | `effect-vitest-inventory-proof-20261023-205213` |

Recovery for each archived row: restore the checkout from its archive ref, then
restore the preserved residue directory. Neither row has recovery content in
place. Branches also remain per the orchestrator's verification; preserve the
archive refs and residue through any restoration.

| Path | Owner | Exists | Visible checkout cwds | Disposition |
| --- | --- | --- | ---: | --- |
| `~/YeeBois/projects/beep-effect-worktrees/effect-schema-parity-align/explorations` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect-worktrees/effect-schema-parity-align/goals` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect14/.serena` | checkout owner / Serena owner | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect16/.serena` | checkout owner / Serena owner | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect18/.serena` | checkout owner / Serena owner | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect19/tools` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect2/.serena` | checkout owner / Serena owner | true | 8 | retain: live owner; checkout retirement fence |
| `~/YeeBois/projects/beep-effect2-worktrees/effect-vitest-capability-leaves/goals` | checkout owner (tracked content) | false | 0 | archived: #1877 (#2173) |
| `~/YeeBois/projects/beep-effect2-worktrees/effect-vitest-inventory-proof/goals` | checkout owner (tracked content) | false | 0 | archived: #1877 (#2173) |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-acceptance/goals` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-acceptance/packages` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-controls/goals` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-controls/packages` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-source/goals` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-test-policy-repairs/goals` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect20/.serena` | checkout owner / Serena owner | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect20-worktrees/bun-test-pilot/scratchpad` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect21-worktrees/node-modules-link-probe/.changeset` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect22/.serena` | checkout owner / Serena owner | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect3/.serena` | checkout owner / Serena owner | true | 42 | retain: live owner; checkout retirement fence |
| `~/YeeBois/projects/beep-effect3/packages` | checkout owner (tracked content) | true | 42 | retain: live owner; checkout retirement fence |
| `~/YeeBois/projects/beep-effect3/scratchpad` | checkout owner (tracked content) | true | 42 | retain: live owner; checkout retirement fence |
| `~/YeeBois/projects/beep-effect3/sst-env.d.ts` | SST owner (#1851) | true | 42 | retain: live owner; checkout retirement fence |
| `~/YeeBois/projects/beep-effect3-worktrees/coverage-floor/.changeset` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect3-worktrees/coverage-floor/packages` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect6/.serena` | checkout owner / Serena owner | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect6-worktrees/security-followup-2026-10-14/packages` | checkout owner (tracked content) | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect7/.serena` | checkout owner / Serena owner | true | 0 | retain: live owner |
| `~/YeeBois/projects/beep-effect8/.serena` | checkout owner / Serena owner | true | 8 | retain: live owner; checkout retirement fence |

Acceptance remains open for live-cwd checkouts until their owning lane retires,
and for SST (#1851). The two archived Vitest rows have explicit retirement
provenance and recovery destinations above.
This receipt supplies the explicit owner disposition; it does not claim a
completed cleanup of those paths. Reversal: supersede the retain decision with
a fresh owner/liveness census and preserve the earlier restore assets.
