# Schema-First Zero Actionables Spec

## Objective

Reach and preserve zero actionable schema-first findings across the repo, then
publish a ready-to-merge PR for the packet.

Zero actionable findings means:

- `bun run beep lint schema-first` reports no missing or stale entries.
- No non-exception schema-first candidates remain in
  `standards/schema-first.inventory.jsonc`.
- No active `schema-policy-advisory` entries remain.
- Existing exceptions remain only when still justified and non-actionable.
- Schema-first lint becomes a repo-wide hard gate for new non-exception
  candidates after the backlog is cleared.

## Non-Goals

- Do not rewrite generated files or generated driver output.
- Do not replace Box or other generated-driver pipelines without a separate
  generator parity spike.
- Do not sweep all existing exceptions unless they are touched, stale, or
  invalidated by detector changes.
- Do not mix unrelated dependency/docgen changes into the final PR without
  explicit triage evidence.

## Source Hierarchy

1. User objective that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. `standards/ARCHITECTURE.md`, `standards/effect-first-development.md`, and
   `.claude/skills/schema-first-development`.
4. Prior evidence in `goals/schema-first-v4-capabilities`.
5. This `SPEC.md`.
6. `PLAN.md`.
7. `GOAL.md`.
8. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`
- `standards/schema-first.inventory.jsonc`
- Schema-first candidate/advisory source files listed by the live inventory.
- Goal packet files under `goals/schema-first-zero-actionables/`.
- Focused package tests, docs, and export catalogs required by touched code.

## Constraints

- Detector first: when a false positive is mechanically distinguishable, update
  the detector before migrating product code or adding an exception.
- Handwritten wrappers are in scope even when they wrap generated models.
  Generated files and generator output are out of scope unless the detector
  needs to exclude them.
- Preserve the branch's pre-existing dirty files until they are classified as
  in-scope, intentionally separate, or excluded before publish.
- The branch intentionally carries pre-existing root dependency updates for
  `drizzle-orm`, `drizzle-kit`, `fallow`, and their lockfile entries because the
  user asked the new branch to include the checkout's current changes.
- Prefer schema-first migration over widening exceptions for true pure-data
  payloads.
- Run package-scoped verification for every touched cluster before relying on
  root proof.

## Acceptance Criteria

- [ ] Branch `schema-first-zero-actionables` exists and carries the initial
      dirty files from the source checkout.
- [ ] The pre-existing dirty files are classified before publish.
- [ ] Active schema-first candidates are zero.
- [ ] Active schema-policy advisories are zero.
- [ ] Missing and stale schema-first inventory entries are zero.
- [ ] Schema-first lint fails repo-wide for future non-exception candidates.
- [ ] Existing exceptions touched by this work have current, specific
      rationales or are remediated.
- [ ] Generated files remain untouched unless explicitly excluded by detector
      logic.
- [ ] A draft PR is opened and made merge-ready: hosted checks green, Yeet
      closeout reports zero actionable review comments, Greptile score 5/5,
      Greptile issues 0, and GitHub reports mergeable or not conflicted.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/schema-first-zero-actionables/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/schema-first-zero-actionables/ops/manifest.json` | Passes |
| Packet references | `rg -n "schema-first-zero-actionables\|GOAL.md\|agentLaunchers\|packetAnchorDocument" goals/schema-first-zero-actionables` | Finds expected references |
| Packet whitespace | `git diff --check -- goals/schema-first-zero-actionables` | Passes |
| Schema-first lint | `bun run beep lint schema-first` | Missing/stale/actionable/advisory counts are zero |
| Repo exports | `bun run repo-exports:catalog:check` | Passes or refreshed intentionally |
| Local proof | `bun run beep yeet verify` | Passes |
| PR monitor | `bun run beep yeet monitor` | Hosted checks green |
| PR closeout | `bun run beep yeet closeout --require-greptile-score 5/5 --require-greptile-issues 0 --require-review-comments 0` | Passes |

## Stop Conditions

- A detector change would hide a real pure-data schema-first violation.
- A migration requires public API or wire-shape changes not captured by this
  spec.
- Generated output needs rewriting rather than exclusion or handwritten wrapper
  migration.
- Verification requires unnamed credentials, cost, destructive side effects, or
  policy approval.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| Existing schema-first inventory exceptions | `standards/schema-first.inventory.jsonc` | owning package | Accepted as non-actionable unless touched, stale, or invalidated by detector changes. | Re-audit on touch, detector change, or stale rationale evidence. |
| Generated driver output | generated files and generated operation/model output | owning driver package | Generator parity is outside this packet. | Separate generator parity spike approves changes. |
