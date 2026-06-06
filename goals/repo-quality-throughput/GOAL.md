# GOAL: Accelerate End-to-End Green

Repo: `/home/elpresidank/YeeBois/projects/beep-effect`.

Outcome: research, rank, implement, and prove top End-to-End Green performance
wins without weakening the final quality proof.

This is a compact `/goal` launcher. Treat these packet files as the detailed
contract:

- `goals/repo-quality-throughput/README.md`
- `goals/repo-quality-throughput/SPEC.md`
- `goals/repo-quality-throughput/PLAN.md`
- `goals/repo-quality-throughput/ops/manifest.json`
- `goals/repo-quality-throughput/research/known-findings.md`
- `goals/repo-quality-throughput/tasks/tasks.jsonc`

Read those first, then read `AGENTS.md`, `CLAUDE.md`, `standards/ARCHITECTURE.md`,
`standards/architecture/07-non-slice-families.md`,
`standards/architecture/08-testing.md`,
`standards/architecture/11-evolution-and-deprecation.md`,
`standards/architecture/12-observability.md`, and
`.patterns/jsdoc-documentation.md`. Higher-priority repo standards outrank
packet prose when they conflict.

Scope:

- In: `@beep/repo-cli`, `@beep/repo-utils`, repo tooling libraries, `turbo.json`,
  package-local config where measured, `lefthook.yml`, GitHub workflows/actions,
  docgen, Yeet, quality commands, generated repo metadata, and task evidence.
- Out: product slice behavior, shared-kernel semantics, unrelated refactors,
  unproven symbol-level docgen selectivity, destructive actions, and durable
  root scripts for tooling-owned behavior.

Workflow:

1. Inspect current repo state and seed findings.
2. Run three bounded research batches from `ops/prompts/`; agents are read-only
   unless assigned a later disjoint implementation task.
3. Write reports under `research/` and synthesize ranked tasks into
   `tasks/tasks.jsonc`.
4. Implement the highest-impact current-PR tasks until remaining work is low
   impact, high risk, or needs a separate proof gate.
5. Prove with a before/after matrix, fast `lint:fix`, Yeet repair/verify,
   canonical quality proof, and PR/CI monitoring.
6. Record deferred tasks with risk, owner, rollback, and next proof step.

Rules:

- Optimize End-to-End Green, not one isolated command.
- Select tasks only when they can produce substantial measured benefit, remove
  duplicated work, prevent resource regression, or unlock larger measured wins.
- Use Yeet as the fast-plus-monitor developer path once proven; keep an
  explicit full local proof.
- Preserve GitHub check names and the authoritative full proof.
- Eliminate duplicate expensive waits across Yeet, hooks, push, PR checks, and
  CI only when a named fallback proof remains.
- Use bounded concurrency, check repo processes before heavy local lanes, and
  stop if a command makes the workstation unusable.
- Follow Effect-first, schema-first, and strict JSDoc standards for code.

Acceptance:

- [ ] `SPEC.md` acceptance criteria are satisfied.
- [ ] Research, synthesis, implementation, and proof evidence are recorded.
- [ ] Required verification passes, or unrelated failures are documented with
      file/command evidence.
- [ ] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/repo-quality-throughput/GOAL.md)" -le 4000
jq . goals/repo-quality-throughput/ops/manifest.json
jq . goals/repo-quality-throughput/tasks/tasks.schema.json
git diff --check -- goals/repo-quality-throughput goals/repo-quality-acceleration
```

Done only when End-to-End Green is measurably faster, the final proof is green,
and remaining opportunities are explicitly deferred.
