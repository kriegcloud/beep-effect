# Knowledge Server Tests: Non-Fatal Effect Lint/Warning Cleanup

## Status

- Status: `pending`
- Slice: `packages/knowledge/server/test/**`
- Type: Optional cleanup (no product behavior changes intended)

## Problem Statement

`packages/knowledge/server` tests currently emit one or more **non-fatal** Effect-related lint/warning messages (the test command exits `0`, but the logs contain warnings). This has a few downsides:

- Lowers signal-to-noise in CI and local runs (real regressions are easier to miss).
- Makes it harder to treat warnings as meaningful (warnings become "background noise").
- Can mask real resource leaks (unscoped fibers, unclosed resources) if those are the underlying cause.

This spec is narrowly scoped to **tests only** under `packages/knowledge/server/test/**`.

## Scope

In scope:

- Identify each distinct warning/lint message emitted during `@beep/knowledge-server` test runs.
- For each message: determine root cause and the smallest safe fix.
- Apply fixes in `packages/knowledge/server/test/**` and/or test harness setup used by those tests (only).
- Keep test behavior and assertions intact unless a test is provably relying on incorrect behavior.

Out of scope:

- Any changes to `packages/knowledge/server/src/**` (production/server runtime code).
- Cross-slice changes (anything outside `packages/knowledge/server/**`), except if a shared test utility is the only clean solution and remains test-only.
- Silencing warnings globally by redirecting or dropping stderr/stdout without understanding the warning source.

## Goals

1. `@beep/knowledge-server` tests run with **no remaining non-fatal Effect lint/warning messages** in normal output.
2. Test exit codes remain unchanged (tests still pass).
3. Fixes are minimal, localized, and explainable (avoid broad config changes).

## Non-Goals

- Turning warnings into errors (the goal is removal, not stricter enforcement).
- Refactoring unrelated test code "while we're here."
- Cleaning warnings from other packages' tests (knowledge domain/tables/client/ui tests are explicitly excluded).

## Working Definition: "Non-Fatal Effect Lint/Warning"

A message counts if all of the following are true:

- It appears in the output of the verification commands below.
- It is clearly emitted by Effect (or the Effect language service/runtime integration), or is an Effect-adjacent warning triggered by Effect usage in tests.
- The test command exits successfully (exit code `0`).

If a message is not reliably attributable to Effect, capture it anyway in inventory, then explicitly decide if it belongs in-scope.

## Proposed Approach

### Phase 1: Inventory (Log Capture)

1. Run the verification command(s) and capture raw output.
2. Extract and deduplicate warning/lint messages.
3. Write an inventory in `outputs/`:
   - The exact message text (or a stable identifying excerpt if it contains timestamps/paths).
   - Frequency (once vs repeated per test).
   - Which test file(s) trigger it (best-effort).

Suggested artifacts:

- `outputs/baseline-test-output.txt`
- `outputs/warnings-inventory.md`

### Phase 2: Root Cause Analysis

For each warning message, record in `outputs/warnings-inventory.md`:

- Hypothesized cause (with pointers to relevant test/harness code).
- Candidate fixes ordered by minimality and correctness.
- Risk notes (e.g., might hide a real leak; might change timing/concurrency).

Common root-cause buckets to consider (examples, not assumptions):

- Resource/finalizer warnings due to missing `Scope` handling in tests.
- "Unsafe" runtime usage (`Effect.runPromise` / `unsafeRun*`) without proper lifecycle management.
- Unhandled fiber failures (background fibers started in tests and not joined/interrupted).
- Logger/test runtime configuration causing warnings (e.g., debug diagnostics enabled).

### Phase 3: Fix + Verify

Implement the smallest safe fix per message (prefer eliminating the cause over suppressing output).

Allowed exception (must be explicit and narrow):

- If a warning is confirmed to be from an upstream dependency or Bun/runner behavior that cannot be fixed locally, add a **targeted** suppression that:
  - Matches only the specific message (or stable signature).
  - Is limited to `@beep/knowledge-server` tests.
  - Includes a comment explaining why the suppression is correct and how to remove it later.

## Verification

Run from repo root:

```bash
# Package-local test run (fastest feedback)
bun run --cwd packages/knowledge/server test
```

Optional (turbo path, closer to CI):

```bash
# Filtered turbo run (ensures build deps are respected)
bun run test --filter=@beep/knowledge-server
```

Success conditions:

- Commands exit `0`.
- No remaining in-scope Effect lint/warning messages appear in output.

## Acceptance Criteria

- `outputs/warnings-inventory.md` exists and lists all warnings previously observed, with a resolution per item.
- Verification commands run clean (no remaining in-scope warnings).
- Changes are limited to knowledge server tests/harness only, or a narrowly-scoped test-only shared utility if unavoidable.

## Notes / Open Questions

- If warnings are intermittent (timing-dependent), the inventory must document a reproduction strategy (reruns, ordering, env vars) rather than assuming a single run is representative.
