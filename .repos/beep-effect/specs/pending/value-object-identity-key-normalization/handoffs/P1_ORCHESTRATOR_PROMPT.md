# P1 Orchestrator Prompt: value-object-identity-key-normalization

You are the orchestrator for:
`specs/pending/value-object-identity-key-normalization/`

## Goal

Apply the calendar identity-key/value-object naming migration pattern to these remaining domain slices:

- `packages/iam/domain`
- `packages/workspaces/domain`
- `packages/knowledge/domain`
- `packages/comms/domain`
- `packages/shared/domain`
- `packages/customization/domain`

## Read First

1. `specs/pending/value-object-identity-key-normalization/README.md`
2. `specs/pending/value-object-identity-key-normalization/handoffs/HANDOFF_P1.md`

## Hard Requirements

1. Canonical IdentityComposer format:
- `$<Slice>DomainId.create("values/<PascalName>.value")`
- Nested modules allowed: `values/<group>/<PascalName>.value`

2. Canonical value-object file naming:
- `PascalCase.value.ts` for value objects

3. Canonical directory naming:
- `src/values` (migrate from `src/value-objects` where needed)

4. Import safety:
- Use `mcp-refactor-typescript` for file/directory renames so dependent imports are updated.
- After refactors, run `rg` to confirm no stale paths.

5. Keep runtime behavior unchanged.

## Execution Steps

### Step 1: Inventory

Create `specs/pending/value-object-identity-key-normalization/outputs/value-object-inventory.md` with:
- current path
- target path
- exported value-object symbol
- old `$I` key
- new `$I` key
- notes/exceptions

### Step 2: Apply Renames and Key Updates

For each target slice:
1. Rename `value-objects` -> `values` when present.
2. Rename value-object files to `PascalCase.value.ts`.
3. Rewrite `$I` keys to canonical format.
4. Update barrels/imports (should mostly be automatic via refactor tool).

### Step 3: Verify

For each changed slice, run:
- `bun run --cwd packages/<slice>/domain check`

Then run focused grep assertions:
- no `value-objects` import paths in migrated slices
- no `.values` identity suffixes
- no kebab-case identity key tails for migrated value objects

### Step 4: Document Results

Create `specs/pending/value-object-identity-key-normalization/outputs/migration-notes.md` with:
- exact files renamed
- exact identity key rewrites
- any exceptions and rationale
- check command results

## Output Format Expectations

- Deterministic markdown tables for inventory and migration notes.
- Include absolute or workspace-relative file paths in reports.
- Include command output snippets for failed checks, if any.
