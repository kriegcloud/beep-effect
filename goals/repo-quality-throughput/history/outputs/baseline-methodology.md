# Baseline Methodology

Use this methodology before selecting implementation tasks and again when
recording after evidence.

## Local Commands

Fast local commands:

- Run at least five warm samples.
- Record min, median, max, cache state, dirty/clean state, and outliers.
- Use the exact command shape that developers run.
- For `lint:fix`, include both clean-tree and small changed-file probes.

Medium local commands:

- Run at least three comparable samples when the workstation remains
  responsive.
- Record whether Turbo was warm, cold, remote, local-only, or unknown.

Heavy local commands:

- Prefer GitHub Actions timing, Turbo dry-runs, or focused substeps first.
- One local sample is enough when repeated runs would be disruptive.
- Capture process/resource evidence before and during the run when possible.

Useful local probes:

```sh
/usr/bin/time -p <command>
bunx turbo run <task> --affected --summarize --dry-run=json
ps -eo pid,ppid,pcpu,pmem,etime,command | rg 'bun|turbo|docgen|vitest|semgrep|gitleaks|osv|nix'
```

## GitHub Actions

- Prefer at least three comparable run ids before and after.
- Record workflow, job name, check name, event, branch, commit, started time,
  completed time, and conclusion.
- Separate setup/cache/install time from verification time whenever job logs
  expose those boundaries.
- Treat before/after comparisons as low confidence when cache state, runner
  type, branch contents, or event type differs materially.

Useful GitHub probes:

```sh
gh run list --workflow check.yml --limit 10 --json databaseId,status,conclusion,createdAt,updatedAt,displayTitle,event,headBranch,headSha
gh run view <run-id> --json jobs
```

## Confidence

- `high`: comparable command shape, comparable cache state, enough repeated
  samples or run ids, and no major competing machine load.
- `medium`: mostly comparable evidence with one known variance.
- `low`: single sample, unknown cache state, changed command shape, or noisy
  machine/runner conditions.

Do not mark a task `done` from low-confidence timing unless the task is
measurement-unlocking or resource-safety work.
