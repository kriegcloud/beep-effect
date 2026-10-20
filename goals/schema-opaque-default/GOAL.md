# GOAL: Schema shape default: branded S.Opaque for data

Repo root: the current working directory — the `beep-effect` checkout you are
running in. Do not assume an absolute path; several checkouts exist. All paths
below are repo-relative.

Outcome: Make branded S.Opaque the default shape for plain data schemas, brand every schema class, and arm schemaClassMissingBrand

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/schema-opaque-default/README.md`
- `goals/schema-opaque-default/SPEC.md`
- `goals/schema-opaque-default/PLAN.md`
- `goals/schema-opaque-default/ops/manifest.json`

Read those first, then read `AGENTS.md`, `CLAUDE.md`, and any governing
standards named by `SPEC.md`. Higher-priority repo standards outrank packet
prose when they conflict.

Scope:

- In: schema-class declarations repo-wide, the codemod under `ops/codemod/`, schema guidance docs, `lint schema-first`.
- Out: see SPEC Non-Goals (entity moves to the drizzle kit, `scratchpad/effected` reshaping, the 0.52 pin bump).

Workflow:

1. Inspect referenced files and current repo state.
2. Make the smallest change that satisfies `SPEC.md`.
3. Preserve unrelated user/worktree changes.
4. Keep decisions tied to evidence from files, tests, docs, or command output.
5. Update packet evidence/status if the implementation changes readiness.
6. At the Close phase, write a closeout reflection to
   `history/reflections/<YYYY-MM-DD>-<agent>.md` via the `/reflect` skill;
   `bun run beep lint reflection-artifacts` must pass.

Acceptance:

- [x] `SPEC.md` acceptance criteria are satisfied.
- [x] Required verification commands pass, or unrelated failures are reproduced
      and recorded separately.
- [x] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/schema-opaque-default/GOAL.md)" -le 4000
jq . goals/schema-opaque-default/ops/manifest.json
git diff --check -- goals/schema-opaque-default
```

Decide changes to public API, schema, data migration, auth, infra, security
behavior, dependencies, lockfiles, generated files, or destructive state
yourself when the goal needs them: record each in SPEC.md's Decision Log with
its reason and how to reverse it, then continue. Land the reversal path for an
irreversible change (a tested down-migration, a backup of deleted state) before
the change merges, and ship a breaking public API or schema change with a major
changeset. Escalate only what AGENTS.md "Autonomy" lists.

Done only when the goal reaches `completed-retained` (acceptance passes,
verification is complete, closeout and reflection landed), or when a blocker
that needs the operator is reported with file/command evidence.
