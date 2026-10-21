# effect/String migration Plan

## Status

Status: `in-progress`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Inspect source hierarchy and confirm scope. | Required facts and blockers are recorded. |
| P1 Implement | in-progress | Migrate the census sites wave by wave, then arm the rule. | Acceptance criteria are met. |
| P2 Verify | pending | Run required checks and capture evidence. | Verification is green or blockers are documented. |
| P3 Yeet: PR to mergeable | pending | Publish through yeet and drive the PR to mergeable: required checks green, review comments answered and resolved. | `mergeStateStatus` is `CLEAN`; zero unresolved review threads. |
| P4 Close | pending | Write the closeout reflection and flip packet state. | Packet status and evidence are updated; a closeout reflection exists. |

## Waves

Each wave is one PR that migrates whole packages and changes no pin. The last
wave moves `@effect/tsgo` to 0.55+ and arms `preferEffectString` at `error`.

| Wave | Packages | Sites | State |
| --- | --- | ---: | --- |
| 1 | libpff, box-provisioning, qa-capture, ontology-use-cases, brand, agents-domain, freshbooks, repo-docgen, ontology-server, tika, nlp, hubspot, workspace-domain | 193 | merged (#1968) |
| 2 | technical-drawing, epistemic-server, epistemic-domain, law-practice-use-cases, law-practice-domain, epistemic-ui, documents-domain, m365, occt, openclaw, db-admin, practice-identify, documents-server, html, todox, agents-server, m365-mcp, uspto, epistemic-tables, file-processing, law-practice-tables, shared-use-cases, repo-configs, fc-runs | 145 | merged (#1976) |
| 3 | effect-drizzle, repo-ai-metrics, pdf-tools, nlp-processing, law-practice-server, semantica, identity, infra, ciops, mcp-kit, ui, oip-web, wink, test-runner, practice-gateway, ontology, box, ai-sync, windows-secrets, rdf, practice-setup, openai-compat, nlp-mcp, mcpb-kit | 237 | merged (#1983) |
| 4a | acp, test-utils (ai-provider-cli had no sites left) | 47 | merged (#1987) |
| 4b | editor, professional-desktop, schema, lint-rules, practice-claude-mod, repo-utils, storybook, utils, shared-domain, observability (open-lane hunks near their sites) | about 100 | pending |
| 5a | repo-cli: the 58 files no open PR or lane touched on 2026-10-21 | 202 | merged (#1993) |
| 5b | repo-cli: 49 of the remaining files (commands, internal, tests) | 224 | in review |
| 5c | repo-cli: 50 further files plus `scripts/CreateKnowledgeMintApp.ts` and `scripts/CreateReviewerApp.ts` | 213 | in review |
| 5d | repo-cli's 7 files with open-lane hunks (34 sites) and the root (16), then the pin moves to 0.55+ and the rule is armed | about 50 | pending |

Wave proof, per package: the package's tests, `package-verify --quick`, and a
temporary local `@effect/tsgo` 0.55.0 install with `preferEffectString` armed,
running `bun run beep quality effect-diagnostics --filter <pkg>`; the package's
own files must report zero `preferEffectString` and zero other findings. The
temporary install is reverted before commit. Coverage is compared per changed
source file against main's version on the same machine (lcov uncovered counts).
From wave 2 on, the site list is regenerated on the lane's own base with the
temporary install rather than read from the 2026-10-21 census.
A package joins a wave when none of its sites lies within three lines of a
hunk that an open PR or lane changes, measured against each lane's merge
base. Callback replacers use `replaceWith`/`replaceAllWith` from
`@beep/utils/Str`, except in packages `@beep/utils` depends on (such as
`@beep/identity`), which rewrite the call without it.

## Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses and a typed `proposedCloseout` with status `completed-retained`
   and finalPullRequest. Keep `initiative.status` operative until completion
   evidence verifies; do not close the external execution/session ledger from a proposal.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/effect-string-migration/GOAL.md)" -le 4000
jq . goals/effect-string-migration/ops/manifest.json
rg -n "effect-string-migration|GOAL.md|agentLaunchers|packetAnchorDocument" goals/effect-string-migration
git diff --check -- goals/effect-string-migration
```
