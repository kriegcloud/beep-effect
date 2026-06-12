# Lint Advisory Hardening Spec

## Objective

Make root lint advisories and law warnings fail locally and in PR CI after the
current backlog is removed and false-positive-prone checks are tightened.

The objective is complete only when:

- current root-lint nonfatal findings are fixed, suppressed by precise checker
  hardening, or recorded as justified Effect-law allowlist exceptions;
- future `terse-effect`, `native-runtime`, `reflection-artifacts`, and
  `schema-first` advisories fail the relevant command;
- PR CI runs the unscoped repo-wide lint policy checks even when package lint
  stays affected-only;
- Yeet can verify, publish, and monitor the branch to mergeable PR state.

## Non-Goals

- Do not promote Fallow advisory lanes in this packet.
- Do not rewrite general architecture doctrine unless implementation proves a
  genuine doctrine gap.
- Do not add broad path carve-outs for native-runtime warnings.
- Do not add a `terse-effect` flow-candidate autofix in v1.

## Source Hierarchy

1. User objective and accepted proposed plan for lint advisory hardening.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. `standards/effect-laws-v1.md`.
4. `standards/architecture/07-non-slice-families.md` and
   `standards/architecture/08-testing.md`.
5. This `SPEC.md`.
6. `PLAN.md`, `GOAL.md`, `tasks/tasks.jsonc`, and supporting artifacts.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `packages/tooling/tool/cli`
- `packages/tooling/policy-pack/repo-configs`
- `.github/workflows/check.yml`
- `standards/effect-laws-v1.md`
- `standards/effect-laws.allowlist.jsonc` and generated snapshot when needed
- Current source files reported by `terse-effect` and `native-runtime`
- Completed goal packets missing closeout reflections

## Constraints

- V1 scope is root `bun run lint` policy only.
- `native-runtime` false-positive hardening must be context-specific. Safe
  platform availability guards such as `typeof window === "undefined"` may be
  excluded; broad tooling/UI path carve-outs are not allowed.
- Ordinary native-runtime findings should be fixed with Effect helpers/modules.
  Rare irreducible technical exceptions use the existing Effect-laws allowlist
  with owner, reason, and issue.
- `beep lint policy` must run the full repo-wide policy suite that affected lint
  currently skips.
- Reflection policy becomes: every completed packet needs a valid closeout
  reflection.

## Acceptance Criteria

- [ ] Packet exists and records current inventory, scope, tasks, and proof.
- [ ] `bun run beep lint policy` exists and runs the full root lint policy suite.
- [ ] `.github/workflows/check.yml` has a dedicated unscoped policy lane.
- [ ] `bun run beep laws terse-effect --check` reports zero findings and fails
      future flow candidates.
- [ ] `bun run beep laws native-runtime --check` reports zero warnings/errors
      after precise false-positive hardening and allowlisted exceptions.
- [ ] `bun run beep lint reflection-artifacts` reports zero advisories/blockers.
- [ ] `bun run beep lint schema-first` fails future advisory counters.
- [ ] `bun run lint` passes.
- [ ] Yeet publish/monitor creates or updates a mergeable PR.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/lint-advisory-hardening/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/lint-advisory-hardening/ops/manifest.json` | Passes |
| Packet whitespace | `git diff --check -- goals/lint-advisory-hardening` | Passes |
| Terse Effect | `bun run beep laws terse-effect --check` | Zero findings; future flow candidates fail |
| Native runtime | `bun run beep laws native-runtime --check` | Zero warnings/errors except allowlisted exceptions |
| Reflections | `bun run beep lint reflection-artifacts` | `blocking_findings=0`, `advisory_findings=0` |
| Schema-first | `bun run beep lint schema-first` | All advisory counters zero; future advisories fail |
| Policy lane | `bun run beep lint policy` | Passes |
| Repo lint | `bun run lint` | Passes |
| Repo CLI package | `bun run --cwd packages/tooling/tool/cli beep:check && bun run --cwd packages/tooling/tool/cli beep:test && bun run --cwd packages/tooling/tool/cli beep:lint` | Passes |
| Yeet | `bun run beep yeet verify`, publish, and monitor | Branch reaches mergeable PR state |

## Stop Conditions

- Required source files are missing or materially contradictory.
- Implementation would expand into Fallow advisory promotion.
- Native-runtime hardening requires broad path suppression instead of precise
  false-positive elimination.
- Verification requires credentials, cost, destructive actions, or policy
  approval not named here.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None yet | N/A | N/A | N/A | N/A |
