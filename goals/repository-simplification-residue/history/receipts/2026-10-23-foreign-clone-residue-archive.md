# Foreign-clone residue: archive pass (2026-10-23)

Refs #1854. Follows `2026-10-22-foreign-clone-residue.md` (#2050). That receipt left 34 rows owned by "none; program orchestrator disposition" in place. On 2026-10-23 the S44 orchestrator approved an archive-only disposition under these conditions:

- Archive a path only when no process has its cwd under its checkout, the session ledger shows no live row for that checkout, and the path holds no git-tracked file.
- Hard-exclude the `beep-effect` clone's working tree and `beep-effect11-worktrees/practice-services`.
- Never delete anything without an archive.

Each checkout was re-checked immediately before its move: process cwds (`/proc/*/cwd`), the `bun run beep session open` ledger, and `git ls-files` for the path. Each archived path is hashed before and after the move: a regular file as itself, and a directory as the sha256 of its sorted per-file `sha256  path` manifest. Archives live under `~/.cache/beep/residue/<checkout>/<path>`, and every row is restorable with its command.

## Archived (16, all verified)

Restore precheck, as in the 2026-10-22 receipt: before moving anything back, confirm the original path is absent, and verify the archive against its digest. For a file, `sha256sum <archive>` must equal the recorded SHA-256. For a directory, the manifest digest must match: `(cd <archive> && find . -type f -print0 | sort -z | xargs -0 sha256sum | sed 's#  ./#  #' | LC_ALL=C sort | head -c -1 | sha256sum)` (the manifest is hashed without a trailing newline; both directory digests below were re-verified with this command) must equal the recorded value. Then run the row's restore command. File rows use `mv -n`; directory rows use `mv -nT`, so the archive can never nest inside an existing directory. With an existing destination, both forms are a silent no-op: GNU coreutils 9.12 exits 0 and moves nothing. The precheck that the original is absent is therefore what makes the restore safe. Restore post-check: the archive path no longer exists, and the original path exists again (for a directory, re-run the manifest command on it and compare with the recorded digest).

| Path | Kind | Files | Bytes | SHA-256 (file or manifest) | Restore |
| --- | --- | ---: | ---: | --- | --- |
| `~/YeeBois/projects/beep-effect-worktrees/pr-1134-closeout/.pr1134-r4-summary.md` | file | 1 | 3423 | `1bdd22f075e08c2e22ed49ea2a5ef36f886f8f5ead4e9f6aa7d85073181e7237` | `mv -n ~/.cache/beep/residue/pr-1134-closeout/.pr1134-r4-summary.md ~/YeeBois/projects/beep-effect-worktrees/pr-1134-closeout/.pr1134-r4-summary.md` |
| `~/YeeBois/projects/beep-effect-worktrees/pr-1134-closeout/.review-r6` | directory | 18 | 135409 | `d00847ae59fae8cb7aa987f80d6008d7f0d0d2a9d83dd6f629aecf80a5cacb06` | `mv -nT ~/.cache/beep/residue/pr-1134-closeout/.review-r6 ~/YeeBois/projects/beep-effect-worktrees/pr-1134-closeout/.review-r6` |
| `~/YeeBois/projects/beep-effect-worktrees/pr-1138/.pr1138-review-payload.json` | file | 1 | 11804 | `ab0771d80177e767d62214e376f48b10478d20989cdde89b35151c14965383f5` | `mv -n ~/.cache/beep/residue/pr-1138/.pr1138-review-payload.json ~/YeeBois/projects/beep-effect-worktrees/pr-1138/.pr1138-review-payload.json` |
| `~/YeeBois/projects/beep-effect0-worktrees/pr1131-r5/review-summary.md` | file | 1 | 4981 | `8f90f1471f7398ee21039e5306afcc2d7deb5a8969404677e51fb6cef4dfc62d` | `mv -n ~/.cache/beep/residue/pr1131-r5/review-summary.md ~/YeeBois/projects/beep-effect0-worktrees/pr1131-r5/review-summary.md` |
| `~/YeeBois/projects/beep-effect0-worktrees/pr1132-e6b656/_review-r2` | directory | 7 | 267060 | `7907619bc5a5d2136ea75554be17f6fff850bc6de4ba9a90aac8fee9047fff21` | `mv -nT ~/.cache/beep/residue/pr1132-e6b656/_review-r2 ~/YeeBois/projects/beep-effect0-worktrees/pr1132-e6b656/_review-r2` |
| `~/YeeBois/projects/beep-effect12-pr874/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect12-pr874/.ignore ~/YeeBois/projects/beep-effect12-pr874/.ignore` |
| `~/YeeBois/projects/beep-effect13-handoff/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect13-handoff/.ignore ~/YeeBois/projects/beep-effect13-handoff/.ignore` |
| `~/YeeBois/projects/beep-effect16-widen2/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect16-widen2/.ignore ~/YeeBois/projects/beep-effect16-widen2/.ignore` |
| `~/YeeBois/projects/beep-effect16-widen3/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect16-widen3/.ignore ~/YeeBois/projects/beep-effect16-widen3/.ignore` |
| `~/YeeBois/projects/beep-effect19-openai-driver/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect19-openai-driver/.ignore ~/YeeBois/projects/beep-effect19-openai-driver/.ignore` |
| `~/YeeBois/projects/beep-effect19-scratchpad-type-repairs/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect19-scratchpad-type-repairs/.ignore ~/YeeBois/projects/beep-effect19-scratchpad-type-repairs/.ignore` |
| `~/YeeBois/projects/beep-effect2-goalshot2/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect2-goalshot2/.ignore ~/YeeBois/projects/beep-effect2-goalshot2/.ignore` |
| `~/YeeBois/projects/beep-effect2-proof/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect2-proof/.ignore ~/YeeBois/projects/beep-effect2-proof/.ignore` |
| `~/YeeBois/projects/beep-effect7-gitleaks-beta105/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect7-gitleaks-beta105/.ignore ~/YeeBois/projects/beep-effect7-gitleaks-beta105/.ignore` |
| `~/YeeBois/projects/beep-effect7-write-wall/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect7-write-wall/.ignore ~/YeeBois/projects/beep-effect7-write-wall/.ignore` |
| `~/YeeBois/projects/beep-effect9-ceiling/.ignore` | file | 1 | 180 | `5b345696ac9daf0b07ce5b9c56d5ec914815e395286f4c9f9ac3ec8ec83bf507` | `mv -n ~/.cache/beep/residue/beep-effect9-ceiling/.ignore ~/YeeBois/projects/beep-effect9-ceiling/.ignore` |

## Left in place

These are left for their owners or the operator. None was archived, because each failed a condition.

| Path | Reason |
| --- | --- |
| `~/YeeBois/projects/beep-effect-worktrees/effect-schema-parity-align/explorations` | contains git-tracked files (10380 files) |
| `~/YeeBois/projects/beep-effect-worktrees/effect-schema-parity-align/goals` | contains git-tracked files (7768 files) |
| `~/YeeBois/projects/beep-effect14/.serena` | live Serena MCP state |
| `~/YeeBois/projects/beep-effect16/.serena` | live Serena MCP state |
| `~/YeeBois/projects/beep-effect18/.serena` | live Serena MCP state |
| `~/YeeBois/projects/beep-effect19/tools` | contains git-tracked files (2 files) |
| `~/YeeBois/projects/beep-effect2/.serena` | live Serena MCP state; live process cwd in the checkout (6 processes) |
| `~/YeeBois/projects/beep-effect2-worktrees/effect-vitest-capability-leaves/goals` | contains git-tracked files (10365 files) |
| `~/YeeBois/projects/beep-effect2-worktrees/effect-vitest-inventory-proof/goals` | contains git-tracked files (10201 files) |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-acceptance/goals` | contains git-tracked files (11902 files) |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-acceptance/packages` | contains git-tracked files (5854 files) |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-controls/goals` | contains git-tracked files (11796 files) |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-controls/packages` | contains git-tracked files (5873 files) |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-capture-source/goals` | contains git-tracked files (8924 files) |
| `~/YeeBois/projects/beep-effect2-worktrees/qualification-test-policy-repairs/goals` | contains git-tracked files (11909 files) |
| `~/YeeBois/projects/beep-effect20/.serena` | live Serena MCP state |
| `~/YeeBois/projects/beep-effect20-worktrees/bun-test-pilot/scratchpad` | contains git-tracked files (736 files) |
| `~/YeeBois/projects/beep-effect21-worktrees/node-modules-link-probe/.changeset` | contains git-tracked files (556 files) |
| `~/YeeBois/projects/beep-effect22/.serena` | live Serena MCP state |
| `~/YeeBois/projects/beep-effect3/.serena` | live Serena MCP state; live process cwd in the checkout (31 processes) |
| `~/YeeBois/projects/beep-effect3/packages` | contains git-tracked files (12301 files); live process cwd in the checkout (31 processes) |
| `~/YeeBois/projects/beep-effect3/scratchpad` | contains git-tracked files (2518 files); live process cwd in the checkout (31 processes) |
| `~/YeeBois/projects/beep-effect3/sst-env.d.ts` | SST declarations belong to #1851; live process cwd in the checkout (31 processes) |
| `~/YeeBois/projects/beep-effect3-worktrees/coverage-floor/.changeset` | contains git-tracked files (658 files) |
| `~/YeeBois/projects/beep-effect3-worktrees/coverage-floor/packages` | contains git-tracked files (5728 files) |
| `~/YeeBois/projects/beep-effect6/.serena` | live Serena MCP state; live process cwd in the checkout (10 processes) |
| `~/YeeBois/projects/beep-effect6-worktrees/security-followup-2026-10-14/packages` | contains git-tracked files (6476 files) |
| `~/YeeBois/projects/beep-effect7/.serena` | live Serena MCP state; live process cwd in the checkout (17 processes) |
| `~/YeeBois/projects/beep-effect8/.serena` | live Serena MCP state; live process cwd in the checkout (25 processes); open ledger row for the checkout |

`~/YeeBois/projects/beep-effect2/map.html` is not listed: #2050 already archived it.

The tracked directories (`packages`, `goals`, `explorations`, `scratchpad`, `.changeset`, `tools`) are working-tree content of their checkouts, not residue. Their recorded byte totals count tracked files, so they are retired only through each checkout's own owner or worktree retirement, never by archiving.

