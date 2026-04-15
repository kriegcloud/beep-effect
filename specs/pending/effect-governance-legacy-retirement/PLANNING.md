# Effect Governance Legacy Retirement - P2 Planning

## Status

**COMPLETED**

## Objective

Turn the validated shortlist into one rank-ordered, implementation-ready retirement plan without reopening broad strategy.

## Decision

The chosen primary path is `full retirement` of the remaining Effect-lane ESLint surface with:

- a docs-only ESLint split for `lint:jsdoc`
- an engine-neutral rewrite of the repo-local native-runtime checker
- removal of the leftover root `lint:effect-laws` lane and the legacy `beep-laws` rule corpus after the rewritten path is proven

This path ranks first because it is the only validated option that directly satisfies the user's primary objective:

- remove `beep-laws` from active Effect-lane governance
- remove `eslint` and `@typescript-eslint/parser` from the live Effect-lane CLI path
- keep the JSDoc and TSDoc lane intact instead of widening this package into repo-wide ESLint replacement

P3 should implement this as a staged cut with deletions late in the wave, not as a one-shot rewrite.

## Ranked Candidates

| Rank | Candidate | Weighted Score | P2 Decision |
|---|---|---:|---|
| 1 | `A` full retirement: docs-only ESLint split plus engine-neutral native-runtime rewrite plus late deletion of legacy rule surfaces | `4.55` | chosen primary path |
| 2 | `B` minimal shim retained: same split, but keep one narrow `eslint`-backed native-runtime bridge temporarily | `3.40` | explicit fallback only |
| 3 | `C` no-go: keep the leftover surface largely as-is | `2.40` | rejected |

## Why Rank 1 Won

- The live repo only exposed two real choke points: the mixed `ESLintConfig` publication path and the native-runtime CLI runner that still instantiates `eslint/Linter`.
- `lint:effect-governance` is already authoritative, so retiring the leftover root `lint:effect-laws` lane does not require inventing a new command architecture.
- `tooling/cli` is the clearest place to remove Effect-lane `eslint` entirely because its only live engine dependency is `commands/Laws/NoNativeRuntime.ts`.
- The docs lane can stay on ESLint cleanly if it is given an explicit docs-only config instead of sharing the old `beep-laws` bundle.
- Keeping a shim without first finding a second hidden blocker would preserve the exact choke point the package exists to remove.

## Closed Planning Decisions

### What `Full Retirement` Means In This Package

`full retirement` means:

- no active root `lint:effect-laws` command or strict wrapper
- no active Turbo metadata for that lane
- no active production Effect-lane runtime that depends on `eslint/Linter`
- no mixed root ESLint config that still carries `beep-laws` as part of the docs story
- no legacy Effect-rule corpus left alive only because the old lane existed

`full retirement` does **not** require:

- repo-wide ESLint removal
- replacing `lint:jsdoc`
- renaming every historical `effect-laws` noun on day one if the surface is now governance data instead of engine runtime

### Docs Lane Boundary

P3 should split the current mixed `ESLintConfig` into an explicit docs-only surface. The planned target shape is:

- `eslint.config.mjs` points at a docs-only config export
- the package root stops centering `ESLintConfig` as the headline shared surface
- `tooling/configs` retains only the ESLint pieces needed for JSDoc and TSDoc validation

The docs lane stays intentionally separate from Effect-lane retirement.

### Native Runtime Rewrite Boundary

P3 should replace the current `tooling/cli/src/commands/Laws/NoNativeRuntime.ts` engine path with a repo-local scanner that does **not** instantiate `eslint/Linter`.

The rewritten runner must preserve:

- the current file-glob scope
- hotspot-driven warn versus error behavior from `NoNativeRuntimeHotspots.ts`
- active allowlist suppression semantics
- allowlist-invalid diagnostics remaining blocking
- the existing CLI summary contract closely enough for P4 to compare behavior honestly

### Shared Governance Data Boundary

The allowlist and hotspot surface is active governance data, not dead rollback scaffolding. P3 should keep its function intact.

If the native-runtime rewrite needs shared modules that are no longer meaningfully tied to ESLint, move them to an engine-neutral home during the cut. That applies especially to:

- allowlist schemas and snapshot runtime helpers
- hotspot metadata consumed by the rewritten runner

### Naming Debt Boundary

P3 must remove stale operator-facing references to `lint:effect-laws` and the legacy bundled `ESLintConfig`.

P3 does **not** need to treat every internal `effect-laws` filename as a blocker to `full retirement` if:

- the surface is no longer tied to active ESLint execution
- renaming it would add churn without improving the cut

This keeps the package focused on retiring the actual choke point rather than repainting every noun.

### Minimal Shim Fallback Boundary

If the native-runtime rewrite fails a real parity or implementation-feasibility gate, the only honest fallback is `B`:

- keep one narrow native-runtime shim only
- still split the docs lane
- still remove the root legacy `lint:effect-laws` lane
- still remove the rest of the legacy rule corpus

P3 must not retain extra legacy rule surfaces once it crosses into the fallback posture.

## P3 Execution Workstreams

### 1. Split The Docs Lane Out Of The Mixed ESLint Surface

Required repo changes:

- introduce or expose an explicit docs-only ESLint config in `tooling/configs`
- repoint root [eslint.config.mjs](/home/elpresidank/YeeBois/projects/beep-effect/eslint.config.mjs:1) to that docs-only export
- stop advertising package-root `ESLintConfig` as the shared repo config story
- update `tooling/configs/README.md`, `tooling/configs/AGENTS.md`, and related trust text accordingly

P3 success signal:

- `lint:jsdoc` still works
- docs lane no longer depends on `beep-laws`

### 2. Rewrite The Native-Runtime Checker Off ESLint

Required repo changes:

- implement an engine-neutral native-runtime scanner behind `bun run beep laws native-runtime --check`
- preserve current hotspot severity semantics and allowlist behavior
- update [tooling/cli/src/commands/Laws/NoNativeRuntime.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/Laws/NoNativeRuntime.ts:1) and its tests
- remove `eslint` and `@typescript-eslint/parser` from `tooling/cli/package.json` once the new path is live

Preferred implementation posture:

- keep shared governance data reusable
- avoid building a second generic lint framework
- keep the rewritten runner purpose-built for repo governance rather than trying to re-host all legacy rule machinery

P3 success signal:

- the native-runtime command passes its focused tests without `eslint/Linter`
- `tooling/cli` no longer carries the legacy engine dependency

### 3. Retire The Leftover Legacy Lane

Required repo changes:

- remove root `lint:effect-laws`
- remove root `lint:effect-laws:strict`
- remove `//#lint:effect-laws` from [turbo.json](/home/elpresidank/YeeBois/projects/beep-effect/turbo.json:1)
- remove the legacy rule modules that only survived because of the old mixed config or native-runtime engine path
- reduce or delete legacy rule tests that no longer protect an active surface

Important sequencing rule:

- do this **after** the docs split and native-runtime rewrite are proven locally

P3 success signal:

- the authoritative lane remains `lint:effect-governance`
- there is no leftover active root entrypoint that can silently keep the legacy lane alive

### 4. Correct Operator And Trust Surfaces

Required repo changes:

- update CLI docs and descriptions that still advertise `lint:effect-laws`
- update trust strings in hooks or startup guidance that mention the old lane incorrectly
- keep the allowlist integrity gate visible as an active governance surface

P3 success signal:

- operators reading docs or command help are pointed at current governance, not rollback history

### 5. Optional Tail Cleanup

Only do this if it is cheap after the main cut:

- clean up stale downstream `eslint-disable beep-laws/*` comments
- rename engine-neutral allowlist files if the move already happened and the churn is bounded

This work is explicitly secondary to retiring the active choke points.

## Ordered Cut Sequence

1. Split the docs lane first and keep `lint:jsdoc` stable.
2. Land the engine-neutral native-runtime runner while legacy rule code still exists for comparison.
3. Verify the rewritten runner on the current focused test surface and package dependencies.
4. Remove the root legacy scripts and Turbo metadata.
5. Remove the legacy rule corpus and stale docs or trust references.
6. Clean up optional naming or annotation debt only if it does not blur the main cut.

## Fallback Triggers

Drop from option `A` to option `B` only if one of these becomes true during P3:

- the native-runtime rewrite cannot preserve hotspot or allowlist behavior without effectively rebuilding a general ESLint adapter
- the rewrite would require keeping `eslint` in `tooling/cli` for a second, unrelated production consumer that P2 did not validate
- the rewritten runner introduces unacceptable correctness risk that cannot be closed inside the execution wave

If a fallback is triggered, record it explicitly in `EXECUTION.md` rather than letting the repo drift into a silent partial retirement.

## Rollback Posture

Rollback during P3 should stay cheap by sequencing deletions late:

- keep the legacy code present until the rewritten native-runtime path is green
- remove root legacy scripts only after the replacement path is proven
- make the final deletions the last part of the execution wave

Once the package lands, rollback is expected to be a git revert, not a permanently preserved dormant legacy lane.

## P4 Verification Requirements

P4 must verify three buckets.

### Legacy Surface Retirement

P4 must confirm:

- `lint:effect-laws` and `lint:effect-laws:strict` are gone from root scripts
- `//#lint:effect-laws` is gone from Turbo metadata
- no active production Effect-lane command instantiates `eslint/Linter`
- the mixed package-root `ESLintConfig` story is retired

### Docs-Lane Safety

P4 must confirm:

- `lint:jsdoc` still runs through the docs-only ESLint path
- docs-lane package dependencies remain explicit and intentional
- docs and trust surfaces no longer point users at the retired legacy lane

### Dependency Or Operational Simplification

P4 must capture evidence for at least one of:

- `tooling/cli` no longer depends on `eslint`
- `tooling/cli` no longer depends on `@typescript-eslint/parser`
- the active Effect-lane path is operationally flatter than before
- command evidence shows the blocking lane no longer routes through the old ESLint stack

## Explicit Deferrals

P3 must not widen into:

- repo-wide ESLint removal
- a replacement for `lint:jsdoc`
- a broad rename campaign for every historical `effect-laws` file or symbol
- unrelated governance redesign beyond the two validated choke points

## What P3 Must Not Reopen

- whether `lint:effect-governance` is authoritative
- whether the JSDoc and TSDoc lane belongs in this package
- whether a broad repo-memory or hook system should replace deterministic governance
- whether keeping the leftover status quo is acceptable without a newly discovered blocker

## Exit Gate

P2 is complete because:

- one primary path is chosen
- the fallback posture is explicit and narrow
- the cut sequence is concrete
- rollback posture is defined
- P3 can execute without reopening strategy
