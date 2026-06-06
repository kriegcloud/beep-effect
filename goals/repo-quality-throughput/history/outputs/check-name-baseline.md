# Check Name Baseline

Status: `template`

Record this before workflow/job/matrix edits and again after CI proves the PR.

## Commands

```sh
gh pr checks ontology_builder_refinement --json name,workflow,event,state,bucket
gh pr checks ontology_builder_refinement --required
gh api repos/:owner/:repo/rulesets
```

## Baseline

| Check name | Workflow | Job or matrix row | Event | Required | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Lint | Check | verify matrix | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Repo Sanity | Check | verify matrix | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Check | Check | verify matrix | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Test Unit | Check | verify matrix | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Test Integration | Check | verify matrix | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Docgen | Check | verify matrix | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Secret Scanning | Check | secrets job | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Security | Check | security job | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| Nix Shell | Check | nix job | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |
| SAST | Check | sast job | pull_request | TBD | `.github/workflows/check.yml` | Preserve unless explicitly migrated. |

## After Diff

| Check name | Status | Evidence |
| --- | --- | --- |
| TBD | TBD | TBD |
