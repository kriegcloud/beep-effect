# GOAL: land the 8/10 rating and execute its critique fixes

Repo root: the current working directory — the `beep-effect` checkout you
are running in. Do not assume an absolute path; several checkouts exist.
All paths below are repo-relative.

Outcome: `goals/agent-rating-critique-fixes/research/repository-rating.md`
(the 2026-10-21 rating: 11 dimensions, overall 8/10) is landed as
evidence, and its deductions are executed in phases P1–P3 until a P4
re-rating under the same rubric shows overall ≥ 8.5.

This is a compact `/goal` launcher. Treat the packet files as the
detailed contract:

- `goals/agent-rating-critique-fixes/README.md`
- `goals/agent-rating-critique-fixes/SPEC.md`
- `goals/agent-rating-critique-fixes/PLAN.md`
- `goals/agent-rating-critique-fixes/ops/manifest.json`

Read those first, then `AGENTS.md` and
`goals/agent-rating-critique-fixes/research/repository-rating.md`.
Higher-priority repo standards outrank packet prose on conflict.

Scope:

- In: P0 this packet only. P1 `AGENTS.md`, `docs/runbooks/agent-pools.md`,
  `.agents/skills/`, `README.md`, root `vitest.config.ts`. P2 CI/lint/
  coverage config. P3 the four mega-files named in `SPEC.md` and
  generated registries under `src`.
- Out: changing the S11 policy (operator ruling; recommend only), new
  paid services, re-scoring without the baseline counting commands.

Workflow:

1. Inspect the rating section your phase cites and the current state.
2. Make the smallest change that satisfies `SPEC.md`; cite `(Dn)`.
3. Record before/after counts with the baseline command from the rating.
4. Package work: `bun run beep quality package-verify <pkg>` pre-handoff.
5. One PR per phase via Yeet; update `PLAN.md` status as phases land.
6. P4: write the re-rating, then the closeout reflection via `/reflect`;
   `bun run beep lint reflection-artifacts` must pass.

Acceptance:

- [ ] `SPEC.md` acceptance criteria for the active phase are satisfied.
- [ ] Required verification commands pass, or unrelated failures are
      reproduced and recorded separately.
- [ ] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/agent-rating-critique-fixes/GOAL.md)" -le 4000
jq . goals/agent-rating-critique-fixes/ops/manifest.json
git diff --check -- goals/agent-rating-critique-fixes
bun run beep goals doctor
```

Done only when P4 re-rating lands at overall ≥ 8.5 (or follow-up packets
are named per missed target) and the packet flips `completed-retained`
in the final PR, or when a blocker needing the operator is reported
with file/command evidence.
