# Fallow Debt Burn-Down Spec

## Objective

Create an execution packet for resolving Fallow-identified debt. The packet must
move advisory findings into concrete remediation tasks and later repo-quality
ratchets, while preserving the parent policy that inherited advisory debt does
not fail wholesale.

The thesis is "fix selected debt, then fail new regressions".

## Source Hierarchy

1. User objective for Fallow debt burn-down.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. `goals/fallow-quality-enforcement/SPEC.md` and
   `goals/fallow-quality-enforcement/research/feature-matrix.jsonc`.
4. This `SPEC.md`.
5. `PLAN.md`, `GOAL.md`, and supporting packet artifacts.

## Branch And Worktree

Start from updated `origin/main`:

```sh
git fetch origin main:refs/remotes/origin/main --quiet
git switch main
git pull --ff-only origin main
git switch -c feat/fallow-debt-burndown
```

Preserve unrelated local and untracked work. Do not stage sibling packet residue
such as `goals/fallow-zero-dead-code/history/CODEX-HANDOFF.md`.

## Packet Scope

Create an execution packet at `goals/fallow-debt-burndown/`.

Required packet artifacts:

- `GOAL.md`
- `README.md`
- `SPEC.md`
- `PLAN.md`
- `research/current-fallow-snapshot.md`
- `tasks/tasks.jsonc`
- `tasks/tasks.schema.json`
- `ops/manifest.json`
- `ops/validate-packet.ts`

## Remediation Contracts

### Boundaries

Fallow boundary analysis currently reports direct imports into package internals.
The first burn-down target is to replace those imports with package exports or
to add canonical exports where the dependency is legitimate.

Do not make architecture-role legality blocking by editing Fallow config before
canonical architecture doctrine exists. Generated boundary config freshness may
remain a hard check, but raw analyzer findings stay advisory until the direct
import cleanup and doctrine split are complete.

### Health

Health work targets critical/high functions first. The first tranche should
prefer non-generated, high-impact hotspots such as repo-cli orchestration and UI
theme branching.

Valid fixes include extracting named helpers, reducing nested branching,
splitting command phases, and adding tests or package checks around changed
behavior. Inline `fallow-ignore` complexity suppressions are not the default
fix.

### Security

Fallow security reports are candidates. Existing security lanes remain
authoritative until a candidate is verified. Each candidate must be triaged as
one of:

- confirmed risk to fix,
- covered by existing security lane,
- verified false positive with expiry,
- policy gap requiring a follow-up standard.

A future gate may fail only new untriaged candidates, not the current candidate
set.

### Dupes

Duplication cleanup is out of scope for this packet because the repo-owned
duplication quality lane has been removed.

### Quality Wiring

Quality checks may be added only after the relevant debt class is resolved or
inventory-backed. The allowed shape is "new or regressed debt fails"; the
disallowed shape is "all current Fallow findings fail".

## Acceptance Criteria

- [ ] Packet exists at `goals/fallow-debt-burndown`.
- [ ] Current Fallow findings are summarized as a remediation queue.
- [ ] Boundary work targets direct internal imports before architecture doctrine
      enforcement.
- [ ] Health work targets critical/high refactors, not blanket suppression.
- [ ] Security work starts with candidate triage and confirmed fixes.
- [ ] Future quality checks fail only new or regressed debt.
- [ ] Parent feature matrix still has only `audit` and `dead-code` promoted.
- [ ] Packet validator passes.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Launcher size | `test "$(wc -m < goals/fallow-debt-burndown/GOAL.md)" -le 4000` | Passes |
| Packet validity | `bun goals/fallow-debt-burndown/ops/validate-packet.ts` | Passes |
| Parent validity | `bun goals/fallow-quality-enforcement/ops/validate-packet.ts` | Passes |
| Fallow wrappers | `bun run beep quality fallow command-contract-check --assert audit,dead-code,health,boundaries,flags,security,fix-preview --require-envelope --out-dir .beep/fallow` | Passes |
| Boundary evidence | `bun run beep quality fallow boundaries --advisory --base origin/main --out .beep/fallow/boundaries.json --quiet` | Emits advisory envelope |
| Health evidence | `bun run beep quality fallow health --advisory --base origin/main --out .beep/fallow/health.json --quiet` | Emits advisory envelope |
| Security evidence | `bun run beep quality fallow security --advisory --base origin/main --out .beep/fallow/security.json --quiet` | Emits advisory envelope |
| Promotion contract | `bun run beep quality github-checks plan-contract-check --mode pre-push --feature-matrix goals/fallow-quality-enforcement/research/feature-matrix.jsonc --expect-promoted-fallow-lanes` | Only promoted lanes are wired |
| Whitespace | `git diff --check -- goals/fallow-debt-burndown` | Passes |

## Stop Conditions

- Do not remove Knip.
- Do not run non-dry-run `fallow fix`.
- Do not make runtime coverage blocking.
- Do not encode architecture meaning in Fallow config before doctrine.
- Do not promote lanes with unresolved false positives or doctrine gaps.
- Do not make all current advisory findings fail.
- Do not resolve findings primarily by adding inline `fallow-ignore`
  suppressions.
