# Check Name Baseline

Status: `current-through-a7be8dc1`

Record this before workflow/job/matrix edits and again after CI proves the PR.

## Commands

```sh
gh pr checks 214 --json name,state,bucket,workflow,link,description
gh pr checks 214 --required
gh api repos/:owner/:repo/rulesets
```

## Baseline

| Check name | Workflow | Job or matrix row | Event | Required | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Lint | Check | verify matrix | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| Repo Sanity | Check | verify matrix | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| Check | Check | verify matrix | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| Test Unit | Check | verify matrix | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| Test Integration | Check | verify matrix | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| Docgen | Check | verify matrix | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; lane skipped work by workflow planning. |
| Secret Scanning | Check | secrets job | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| Security | Check | security job | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| Nix Shell | Check | nix job | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| SAST | Check | sast job | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`; preserve unless explicitly migrated. |
| PR Size Label | Check | changed-file count job | pull_request | no required checks reported | `.github/workflows/check.yml` | Passed on run `27064446802`. |
| Build | Check | build job | pull_request | no required checks reported | `.github/workflows/check.yml` | Present but intentionally skipped by workflow policy. |
| CodeRabbit | external status | review status | pull_request | no required checks reported | CodeRabbit | Passed; review body skipped because this PR exceeds the file-count limit. |
| Vercel Preview Comments | external check | deployment comment | pull_request | no required checks reported | Vercel | Passed. |
| Vercel - oip-web | external status | deployment | pull_request | no required checks reported | Vercel | Deployment completed. |
| Vercel - oip-web-staging | external status | deployment | pull_request | no required checks reported | Vercel | Deployment completed. |

## After Diff

| Check name | Status | Evidence |
| --- | --- | --- |
| All current PR check names | unchanged and green | `gh pr checks 214` on commit `a7be8dc1e1119d095be0239b39cd812e5650ebec` reported all non-skipped contexts passing; `Build` remains skipped by workflow policy. |
| Required checks | not reported for branch | `gh pr checks 214 --required` exited with `no required checks reported on the 'ontology_builder_refinement' branch`. |
| Rulesets | no blocking rule details returned | `gh api repos/kriegcloud/beep-effect/rulesets` returned active `main` branch ruleset metadata and no returned rule entries. |
