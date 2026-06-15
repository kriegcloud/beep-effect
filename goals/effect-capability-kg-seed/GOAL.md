# GOAL: Prove the Effect capability KG seed

Repo: `beep-effect`.

Outcome: implement the first deterministic seed proof that turns Effect v4
`Combiner`, `Reducer`, `Filter`, and adjacent helper JSDoc/AST facts into an
evidence-cited capability graph/report with tiny advisory fixtures.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/effect-capability-kg-seed/README.md`
- `goals/effect-capability-kg-seed/SPEC.md`
- `goals/effect-capability-kg-seed/PLAN.md`
- `goals/effect-capability-kg-seed/ops/manifest.json`

Read those first, then read `AGENTS.md`, `CLAUDE.md`, and any governing
standards named by `SPEC.md`. Higher-priority repo standards outrank packet
prose when they conflict.

Scope:

- In: tooling-owned implementation under `packages/tooling/**`; read-only
  Effect v4 seed corpus under `.repos/effect-v4/packages/effect/src`; tests,
  packet evidence, and any required package-local docs.
- Out: runtime hooks, embeddings/vector stores, graph DB/storage commitments,
  full Effect v4 ingestion, hard enforcement gates, broad sub-agent taxonomy,
  and unrelated package/app refactors.

Workflow:

1. Inspect referenced files and current repo state.
2. During P0, choose the smallest tooling home and record exact package checks
   in `PLAN.md` before changing source.
3. Make the smallest change that satisfies `SPEC.md`.
4. Preserve unrelated user/worktree changes.
5. Keep decisions tied to evidence from files, tests, docs, or command output.
6. Update packet evidence/status if the implementation changes readiness.
7. At P3 Close, write a closeout reflection to
   `history/reflections/<YYYY-MM-DD>-<agent>.md` via the `/reflect` skill (see
   `PLAN.md` P3 Closeout Checklist); `bun run beep lint reflection-artifacts`
   must pass.

Acceptance:

- [x] `SPEC.md` acceptance criteria are satisfied.
- [x] Required verification commands pass, or unrelated failures are reproduced
      and recorded separately.
- [x] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/effect-capability-kg-seed/GOAL.md)" -le 4000
jq . goals/effect-capability-kg-seed/ops/manifest.json
git diff --check -- goals/effect-capability-kg-seed
```

Stop and report before changing public API, schema, data migration, auth, infra,
security behavior, dependencies, lockfiles, generated files, or destructive
state unless `SPEC.md` explicitly requires it.

Done only when acceptance passes and verification is complete, or when a blocker
is reported with file/command evidence.
