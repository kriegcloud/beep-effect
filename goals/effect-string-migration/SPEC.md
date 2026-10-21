# effect/String migration Spec

## Objective

Move native String method calls to effect/String so @effect/tsgo 0.55+ can arm preferEffectString at error

## Non-Goals

- No behaviour change: a rewrite whose result type changes (`Option`,
  `NonEmptyArray`) keeps the caller's observable result.
- No suppression comments, `@effect-diagnostics` directives, declared-off
  entry or other exception inventory for `preferEffectString` (S31).
- tsc-rs and the root compiler maps stay untouched; the rule lives in the
  standalone profile until tsc-rs knows its name.

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- Native `String.prototype` calls in workspace source and tests
  (`research/census-2026-10-21.md`).
- `package.json` catalog `@effect/tsgo` (0.54.1 → the 0.55+ release in hand).
- `standards/effect-diagnostics.profile.json` and `EffectDiagnosticsProfile`
  in `packages/tooling/tool/cli/src/commands/Quality/EffectDiagnostics.ts`.
- `docs/runbooks/typescript-toolchain.md` and the `syncpack.config.ts` pin note.

## Constraints

- Split by package family so each PR stays reviewable and avoids colliding
  with live lanes; the pin moves only in the PR that arms the rule.
- Rewrite the 766 shape-changing sites by hand or with reviewed Codex lanes;
  only the 647 "Same runtime behavior" sites may go through a codemod.
- Follow the AGENTS.md code laws: `effect/String` imported as a namespace
  from its leaf path.

## Acceptance Criteria

- [ ] `@effect/tsgo` is at 0.55 or later and `preferEffectString` is `error`
      in the standalone profile.
- [ ] `bun run beep quality effect-diagnostics` reports zero findings across
      every program, and `bun run beep quality tsgo-rules` passes.
- [ ] The declared-off ledger is unchanged (5 rules).
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/effect-string-migration/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/effect-string-migration/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/effect-string-migration` | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- Any spend: purchases, paid services, quota top-ups or plan changes need the
  operator.
- The same blocker repeats after reasonable investigation.

Scope growth, destructive side effects and policy calls are not stops: decide
them and record each in the Decision Log.

## Decision Log

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-21 | Ship the tsgo bump at 0.54.1 and move `preferEffectString` here. | The 0.55.0 census found 1,413 sites in 365 files; declaring it off would grow the exception inventory (S31). | Move the pin to 0.55+ with the rule at error once the sites are gone. |
| 2026-10-21 | Migrate in package waves, quietest packages first; repo-cli (674 sites) goes last. | Packages with few open lanes keep conflicts low; whole-package waves give each PR a zero-finding proof. | Re-order the remaining waves; no migrated site depends on order. |
| 2026-10-21 | Prove each wave with a temporary local 0.55.0 install and `effect-diagnostics --filter`, reverted before commit. | The pin moves only in the arming PR, so hosted CI cannot see the rule until then. | Drop the temporary step once the pin is at 0.55+. |
| 2026-10-21 | Fallbacks for Option results that cannot be empty use `constant(...)` from `effect/Function`, not a new arrow. | A never-called arrow is a new uncovered function and line, which the coverage ratchet counts. | Replace with an arrow plus a test that reaches it. |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
