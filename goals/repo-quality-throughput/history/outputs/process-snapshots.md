# Process Snapshots

Status: `active`

Record repo-related process state before every research batch and before every
known-heavy local command.

## 2026-06-06 Batch 1 Closeout Snapshot

Command:

```sh
ps -eo pid,ppid,pcpu,pmem,etime,command | rg 'bun|turbo|docgen|vitest|semgrep|gitleaks|osv|nix|beep'
```

Result summary:

- Long-lived repo Graphiti proxy:
  `bun run beep graphiti proxy` and
  `bun run packages/tooling/tool/cli/src/bin.ts -- graphiti proxy`, low CPU.
- Biome LSP/proxy/server processes were running for the repo, low CPU.
- JetBrains TypeScript language service was running, low CPU and about 1.4
  percent memory.
- `nix-daemon --daemon` was running, idle.
- No Turbo, docgen, Vitest, Semgrep, gitleaks, OSV scanner, or repo quality lane
  was active at the time of the snapshot.
- Some non-repo Chrome renderer processes were active, including one high-CPU
  renderer in the sampled moment; this is not a repo quality process but should
  be considered when judging local timing noise.

Closeout waiver:

- `sourceStandard`: `goals/repo-quality-throughput/baseline-methodology.md`
- `reason`: The mandatory process snapshot requirement was added during the
  packet quality-review loop after Batch 1 had already completed.
- `owner`: repo tooling packet orchestrator
- `expiryOrFollowUp`: expires before Batch 2 launch; Batch 2 requires a fresh
  pre-batch snapshot in this file.
- `residualRisk`: Batch 1 timing evidence may under-report local resource noise.
- `acceptanceEvidence`: Batch 1 agents were read-only and no heavy local quality
  lane was observed in the closeout snapshot; future batches now have a hard
  snapshot gate.

## 2026-06-06 Pre-Batch 2 Snapshot

Command:

```sh
ps -eo pid,ppid,pcpu,pmem,etime,command | rg 'bun|turbo|docgen|vitest|semgrep|gitleaks|osv|nix|beep'
```

Result summary:

- Long-lived repo Graphiti proxy:
  `bun run beep graphiti proxy` and
  `bun run packages/tooling/tool/cli/src/bin.ts -- graphiti proxy`, low CPU.
- Biome LSP/proxy/server processes were running for the repo, low CPU.
- JetBrains TypeScript language service was running, low CPU and about 1.4
  percent memory.
- `nix-daemon --daemon` was running, idle.
- No Turbo, docgen, Vitest, Semgrep, gitleaks, OSV scanner, Yeet, or repo
  quality lane was active at the time of the snapshot.
- A Chrome renderer outside the repo process set was using high CPU during the
  sampled moment. Treat any local timing collected immediately after this
  snapshot as potentially noisy unless repeated or corroborated by CI evidence.

Batch 2 launch status: allowed for read-only agents. Do not launch heavy local
quality commands concurrently with the batch.

## 2026-06-06 Focused Proof Snapshot

Command:

```sh
ps -eo pid,ppid,pcpu,pmem,etime,command | rg 'bun run|docgen|yeet|quality|repo-exports|semgrep|gitleaks|osv|config-sync|vitest|turbo'
```

Result summary before focused proof:

- Long-lived Graphiti proxy was active and low CPU.
- No docgen, Turbo quality lane, Semgrep, gitleaks, OSV, repo-export catalog,
  or Yeet execution lane was active.

Focused proof commands run after this snapshot:

- `bunx --bun vitest run packages/tooling/tool/cli/test/yeet.test.ts`:
  18 tests passed in 2.58s.
- `bun run beep yeet verify --plan --json`: plan-only, one `full:pre-push`
  step, zero affected feedback tasks, `real 3.55`.
- `bun run beep yeet publish --message "fix(repo-cli): internalize quality helpers" --plan --json`:
  plan-only, commit/proof/push steps, zero affected feedback tasks,
  `real 3.82`.
- `bun run beep yeet repair --plan --json`: plan-only, prepare plus affected
  feedback steps preserved, 348 affected feedback tasks, `real 4.37`.
- `bun run lint:fix`: changed-file Biome path, checked 7 files in 4s, process
  wall 5.72s, no Turbo fan-out.
- `bun run test -- --filter=@beep/repo-cli`: passed. Unit test lane took
  2m40.974s, with `test/reuse-command.test.ts` taking 84.416s. The following
  `type-test` step ran root TSTyche from the repo-cli package script and passed
  106 dtslint files in 30.2s. Integration build dependencies were cache hits.
- `bun run repo-exports:catalog`: wrote
  `standards/repo-exports.catalog.jsonc` and
  `standards/repo-exports.catalog.md`; output reported 92 packages, 1078 import
  specifiers, and 15094 public export entries. The run took roughly 90 seconds.
- `bun run repo-exports:catalog:check`: passed with
  `[repo-exports-catalog] generated artifacts are current`; output reported the
  same 92 packages, 1078 import specifiers, and 15094 public export entries. The
  run took roughly 117 seconds.
- `bun run check -- --filter=@beep/repo-cli`: passed. Turbo reported 24 tasks,
  23 cached, and 1.247s.
- `bun run build -- --filter=@beep/repo-cli`: passed. Turbo reported 24 tasks,
  23 cached, and 18.129s. No tracked build output changed.
- `bun run lint -- --filter=@beep/repo-cli`: passed. Turbo reported 24 tasks,
  23 cached, and 6.154s.

Resource note:

- The focused repo-cli test command was bounded to one package through
  `beep-cli test --filter=@beep/repo-cli`, but package-local `type-test` still
  expands to root TSTyche. Treat this as a Batch 2 performance finding, not a
  failure of the Yeet implementation.
- Repo-export catalog refresh/check stayed sequential and silent for most of the
  wall clock. Treat package-local catalog sharding plus root aggregation as a
  high-value metadata performance task, not just a generated-file maintenance
  cleanup.

## 2026-06-06 `audit:github quality` Snapshot

Command:

```sh
bun run audit:github quality
```

Result summary:

- Command exited 0.
- The lane ran build, check, lint, docgen check/generate/aggregate,
  repo-export catalog check, test, integration test, repo sanity, and changeset
  status.
- Full docgen generation was the longest visible batch. Process samples showed
  rotating `packages/tooling/tool/docgen/src/bin.ts` workers and an example
  validation subprocess running `tsc --noEmit` for a package docs examples
  project.
- `repo-exports:catalog:check` ran as a single hot process and reported current
  generated artifacts: 92 packages, 1078 import specifiers, and 15094 public
  export entries.
- `test:integration` reported 99 successful tasks, 54 cached, and 57.513s. Many
  package tasks force-executed Vitest only to report no integration test files,
  reinforcing the selected test-participation optimization.
- The quality run emitted two JSDoc warnings for
  `packages/tooling/tool/cli/src/commands/Quality/internal/PackageVerify.ts`.
  They were fixed after the run, then verified with targeted ESLint and scoped
  repo-cli docgen.

Post-run repair commands:

- `bunx eslint packages/tooling/tool/cli/src/commands/Quality/internal/PackageVerify.ts`:
  passed after adding `@param report` and `@returns`.
- `nice -n 10 bun run beep docgen run -p @beep/repo-cli`: generated and
  aggregated only `packages/tooling/tool/cli`; no tracked doc output changed.
- `bun run lint:fix`: changed-file path, checked 8 processable files, applied
  no fixes, and stayed out of Turbo; latest shell samples were 5.58s to 8.68s.

Resource note:

- The repo process set was idle before the post-run scoped docgen refresh, but a
  non-repo JetBrains `tsgo --lsp` process from another project was using
  noticeable CPU and memory. The scoped docgen refresh was run with `nice -n 10`
  to reduce desktop contention.

## Repo-Exports Shard Review Snapshot

During the package-local shard design review, `bun run repo-exports:catalog:check`
completed successfully with:

```text
[repo-exports-catalog] generated artifacts are current
packages=92 importSpecifiers=1078 publicExportEntries=15094
```

The active process sample showed a single hot `bun run
packages/tooling/tool/cli/src/bin.ts -- quality repo-exports-catalog --check`
process. Other heavier Biome/tsgo LSP processes in the machine sample belonged
to different clones/repos, so they are environment noise for this PR's catalog
regression analysis.

## 2026-06-06 Batch 3 Pre-Launch Snapshot

Command:

```sh
ps -eo pid,ppid,pcpu,pmem,etime,command | rg 'bun run|docgen|yeet|quality|repo-exports|semgrep|gitleaks|osv|config-sync|vitest|turbo|gh pr checks|nix'
```

Result summary before launching Batch 3 read-only research agents:

- Long-lived repo Graphiti proxy was active and low CPU.
- No docgen, Yeet, quality, repo-export catalog, Turbo verification, Semgrep,
  gitleaks, OSV, config-sync, Vitest, or `gh pr checks` proof lane was active
  for this checkout.
- `nix-daemon` was idle, and one unrelated `packages/drivers/nlp-mcp` Bun
  process from another task was present at low CPU.

Batch 3 launch status: allowed for six read-only agents. Do not launch heavy
local quality commands concurrently with the batch.
