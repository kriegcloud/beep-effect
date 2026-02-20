# Master Orchestration — Env + 1Password Redesign

## Mission
Replace ad-hoc local secrets management with a 1Password Environments workflow while preserving the readability and namespaced style of existing env docs.

## Phase Plan

### P0: Scaffold + Baseline (Complete)
Deliverables:
- Spec scaffold files.
- Initial audit outputs.
- P1 handoff pair.

### P1: Contract Design (Complete)
Goal: lock a canonical env contract before changing scripts/files.

Work items:
1. Build variable catalog grouped by namespace and sensitivity class.
2. Mark each variable as `secret`, `non-secret`, `derived`, or `deprecated`.
3. Define interpolation-removal strategy for all derived fields.
4. Define `.env.example` section layout and ordering policy.
5. Define required vs optional variables for local bootstrap.

Outputs:
- `outputs/key-catalog.md`
- `outputs/contract-decisions.md`

Gate:
- All variables in current `.env` are classified with migration action.

### P2: Integration Design (Pending)
Goal: define exact command/runtime integration for 1Password.

Work items:
1. Standardize command wrappers using `op run --env-file=.env -- ...`.
2. Decide whether `dotenvx` remains for non-secret use-cases or is fully replaced.
3. Specify bootstrap script behavior for creating `.env` from `.env.example`.
4. Specify env validation checks (missing keys, interpolation ban, duplicate aliases).

Outputs:
- `outputs/script-and-command-matrix.md`
- `outputs/bootstrap-and-validation-design.md`

Gate:
- Script plan covers dev, services, migrations, and test paths.

### P3: File Migration (Pending)
Goal: migrate env files to new contract.

Work items:
1. Introduce new root `.env.example`.
2. Produce migration instructions for local `.env`.
3. Implement/update bootstrap + validation scripts.
4. Align package/root scripts with chosen `op run` wrappers.

Outputs:
- Updated `.env.example`
- Script changes (TBD in implementation phase)
- `outputs/migration-execution-notes.md`

Gate:
- Local setup works end-to-end without interpolation chains.

### P4: Verification + Handoff (Pending)
Goal: prove reliability and document usage.

Work items:
1. Run env validation checks.
2. Smoke test primary local commands.
3. Finalize docs and reflection entries.
4. Create next-phase/closure handoff docs.

Outputs:
- `outputs/verification-report.md`
- Final handoff pair

Gate:
- Verification checklist complete and reproducible.

## Constraints
- No real secret values in tracked files.
- Preserve human-readable section layout.
- Avoid branch-wide refactors unrelated to env/secrets.

## Verification Baseline (for implementation phases)
- `rg -n '\$\{' .env .env.example` returns zero in canonical files after migration.
- Local command wrappers that need secrets run successfully through 1Password CLI.
- `.env.example` remains readable and documented by section.
