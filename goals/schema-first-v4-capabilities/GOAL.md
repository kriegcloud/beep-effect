# GOAL: Harden schema-first Effect v4 capabilities

Repo: `/home/elpresidank/YeeBois/projects/beep-effect3`.

Outcome: turn the repo's schema-first law into enforceable, ergonomic Effect v4
practice: defaults live in schemas, property tests derive data from schemas,
schema-derived static APIs replace duplicated branching/guard plumbing, schema
comparisons use derived equivalence, and underused Schema tooling is documented,
enforced, and remediated in phases.

This is a compact `/goal` launcher. Treat these packet files as the detailed
contract:

- `goals/schema-first-v4-capabilities/README.md`
- `goals/schema-first-v4-capabilities/SPEC.md`
- `goals/schema-first-v4-capabilities/PLAN.md`
- `goals/schema-first-v4-capabilities/research/reports/effect-v4-schema-capabilities.md`
- `goals/schema-first-v4-capabilities/reviews/round-01.md`
- `goals/schema-first-v4-capabilities/ops/manifest.json`

Read the scratch examples before editing production code:

- `scratchpad/index.ts` demonstrates Effect v4 Schema default combinators.
- `scratchpad/test/schema-arbitrary-fastcheck.test.ts` demonstrates
  `S.toArbitrary`, schema arbitrary annotations, FastCheck, and Faker.
- `scratchpad/test/schema-static-apis.test.ts` demonstrates `TaggedUnion`,
  `LiteralKit`, `MappedLiteralKit`, and schema-derived static APIs.

Scope:

- In: schema-first standards, schema-first skill/pattern docs, `beep lint
  schema-first` enforcement, Yeet issue surfacing, targeted schema remediation,
  and small reusable helpers where the repo has an obvious gap.
- Out: immediate repo-wide rewrites, Box generator replacement without a spike,
  public API migrations without a packet phase, and unrelated formatting churn.

Workflow:

1. Inspect the packet, scratch files, current worktree, and live schema-first
   lint behavior.
2. Preserve unrelated user/worktree changes.
3. Check local `.repos/effect-v4` docs/source before choosing nontrivial
   Schema APIs.
4. Strengthen docs and enforcement before broad remediation.
5. Route new checks through `beep lint schema-first`; prove structured Yeet
   `schema-first-policy` output before claiming that issue shape is wired.
6. Remediate in small phases with false-positive review after each phase.
7. Use Yeet's current flow for closure: verify locally, use exact proof reuse
   only when accepted, treat `--start-pr-early --monitor` as opt-in overlap
   when requested, and run read-first `yeet closeout` on the PR branch.

Acceptance:

- [ ] `SPEC.md` acceptance criteria are satisfied for the current phase.
- [ ] Scratch examples still typecheck/test or any unrelated scratch blocker is
      recorded with command output.
- [x] Current enforcement failures are emitted by `beep lint schema-first` as
      structured `[schema-first:issue]` lines and P2 proves their Yeet issue
      shape. Future advisory rules remain phased work.
- [ ] Remediation commits do not hide unrelated quality failures.

Verification:

```sh
test "$(wc -m < goals/schema-first-v4-capabilities/GOAL.md)" -le 4000
jq . goals/schema-first-v4-capabilities/ops/manifest.json
bunx tsc -p scratchpad/tsconfig.json --pretty false
bunx vitest run --config scratchpad/vitest.config.ts
bun run beep lint schema-first
bun run beep yeet verify --plan --json
gh pr view --json number >/dev/null 2>&1 && bun run beep yeet closeout --plan --json || true
git diff --check -- goals/schema-first-v4-capabilities scratchpad standards .claude package.json bun.lock packages/tooling/tool/cli
```

Stop and report before changing public API, schema wire formats, data
migrations, auth, infra, security behavior, generated driver output, or
dependencies beyond the packet's stated needs.
