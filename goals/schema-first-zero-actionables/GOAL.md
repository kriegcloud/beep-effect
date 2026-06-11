# GOAL: zero actionable schema-first findings

Repo: this checkout of `beep-effect6`.

Outcome: drive schema-first governance to zero actionable findings, harden the
lint gate so the zero state is preserved, and publish a merge-ready PR.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/schema-first-zero-actionables/README.md`
- `goals/schema-first-zero-actionables/SPEC.md`
- `goals/schema-first-zero-actionables/PLAN.md`
- `goals/schema-first-zero-actionables/research/baseline-2026-06-11.md`
- `goals/schema-first-zero-actionables/ops/manifest.json`

Read those first, then read `AGENTS.md`, `CLAUDE.md`,
`standards/ARCHITECTURE.md`, `standards/effect-first-development.md`, and the
`schema-first-development` skill. Prior evidence lives in
`goals/schema-first-v4-capabilities`.

Scope:

- In: `SchemaFirst.ts`, `standards/schema-first.inventory.jsonc`, source files
  behind live schema-first candidates/advisories, focused tests, repo-export
  artifacts, and this packet.
- Out: generated driver output, generator replacement, full exception sweeps,
  and unrelated dependency/docgen changes unless triaged as in-scope.

Workflow:

1. Confirm branch `schema-first-zero-actionables` and current worktree state.
2. Classify the branch's pre-existing dirty files before publishing.
3. Run `bun run beep lint schema-first` and compare against the baseline.
4. Start each wave with a detector-first false-positive audit.
5. Remediate true pure-data candidates with schema-first models.
6. Resolve active advisories with source-schema-derived tests or precise
   non-actionable exceptions.
7. Make schema-first lint fail repo-wide for future non-exception candidates.
8. Verify locally, publish with Yeet, monitor hosted checks, and close PR review
   gates.

Acceptance:

- [ ] `SPEC.md` acceptance criteria are satisfied.
- [ ] Schema-first missing, stale, candidate, and active advisory counts are 0.
- [ ] Required verification commands pass or unrelated failures are recorded
      with evidence.
- [ ] PR is merge-ready: hosted checks green, zero actionable review comments,
      Greptile 5/5 with 0 issues, and mergeable/not conflicted.
- [ ] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/schema-first-zero-actionables/GOAL.md)" -le 4000
jq . goals/schema-first-zero-actionables/ops/manifest.json
git diff --check -- goals/schema-first-zero-actionables
bun run beep lint schema-first
bun run beep yeet verify
```

Stop and report before changing public API, schema wire formats, data
migrations, auth, infra, security behavior, dependencies, lockfiles, generated
files, or destructive state unless `SPEC.md` explicitly requires it.
