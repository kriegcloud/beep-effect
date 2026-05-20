# Repo Quality Convergence Specification

## Status

**Local proof complete; awaiting fresh GitHub evidence**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-16
- **Updated:** 2026-05-20

## Mission

Make a repo-health score of 9/10 objective, repeatable, and backed by evidence.
The initiative closes current quality blockers first, then records the proof
bundle that justifies a 90/100 or better score.

## Score Rubric

The score is a documented evidence artifact, not a v1 CLI command.

| Area | Points | Requirement |
| --- | ---: | --- |
| Canonical gates and release | 50 | Local gates, GitHub Check, and GitHub Release are green or explicitly policy-skipped. |
| Governance drift | 20 | Source-law, generated-output, config, changeset, and package-graph drift are resolved or waived. |
| Agent and contributor ergonomics | 15 | Current commands, packet status, and guardrail ownership are discoverable. |
| Initiative hygiene | 10 | Active initiative packets have status, manifest, and stale-context classification. |
| Measured performance | 5 | Feedback-loop performance is measured and tracked through the acceleration packet. |

## Hard Blockers

The repository cannot be scored as 9/10 while any of these are true:

- `bun run lint` fails.
- `bun run check` fails.
- `bun run repo-exports:catalog:check` fails.
- `bun run audit:github repo-sanity` fails.
- A fresh GitHub Check workflow run is failing on the target branch or `main`.
- A fresh GitHub Release workflow run is failing on `main` for an unwaived
  release-graph issue.

## Evidence Standard

Each phase must update `history/outputs/current-state-evidence.md` with:

- commands run and concise outcomes;
- source paths used as evidence;
- GitHub workflow run IDs or URLs when CI state is cited;
- official external docs only when a recommendation depends on tool behavior;
- before/after notes for every blocker fixed.

## Generated Output Policy

Generated docs output is not source-law input. Repo source scanners must exclude
generated `docs` trees unless a future initiative explicitly promotes a generated
artifact into tracked source. Docgen and example-validation lanes own generated
documentation quality.

## Release Graph Policy

Changesets must name packages in the current workspace graph. A non-mutating
repo-owned guard must fail before `changesets/action` when a changeset names a
removed package.

## Completion Rules

The initiative reaches 9/10 only when:

- the scorecard is 90/100 or better;
- no hard blocker remains;
- local proof commands are recorded;
- fresh GitHub Check and Release evidence is recorded;
- a changed-scope review loop reports zero required blockers or records explicit
  waivers with owner, expiry, residual risk, and acceptance evidence.
