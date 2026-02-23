# Migration Plan

## Objective
Move from current env state to a 1Password-backed, non-interpolated, readable env contract with minimal disruption.

## Phase Steps

1. Contract inventory (P1)
- classify all current keys by namespace and sensitivity.
- mark each key as `keep`, `rename`, `drop`, or `derive-at-runtime`.

2. Integration design (P2)
- map existing scripts to 1Password execution wrappers.
- define bootstrap and validation commands.

3. File migration (P3)
- create new root `.env.example` with preserved visual format.
- regenerate local `.env` from template and secret references.

4. Verification (P4)
- verify command paths (services/dev/test/build).
- verify interpolation ban and required-key checks.

## Non-Goals During Migration
- no production secret backend changes.
- no unrelated package refactors.

## Exit Criteria
- root `.env.example` is authoritative and documented.
- local secret-dependent commands run via `op run` wrappers.
- interpolation references removed from canonical env files.
