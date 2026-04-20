# Effect Governance Replacement - P4 Verification

## Status

**COMPLETED**

## Final Recommendation

`full replacement`

## Objective

Verify the chosen replacement path using the locked parity matrix and fixed steering evaluation corpus.

## Summary

This verification file now reflects the fresh explicit re-review performed after the post-P4 steering follow-up. The earlier `staged cutover` hold is no longer the active package verdict.

The parity bucket remains satisfied, with `schema-first` intentionally remapped to the stronger inventory lane rather than treated as an ESLint-clone requirement. The performance bucket also remains satisfied and was re-measured in the same local environment: `lint:effect-governance` finished in `32.70s`, while the legacy `lint:effect-laws --max-warnings=0` lane took `44.67s` and still failed by reintroducing JSDoc concerns into the Effect-specific path.

The steering bucket now supports `full replacement`. The locked binary parity cases are still covered, and the previously missing default-path idiomatic steering has now shipped as checked-in repo guidance, Codex session-start steering, Claude prompt-hook steering, Claude post-edit matcher patterns, and a blocking `check:effect-steering` gate inside `lint:effect-governance`.

## Evidence Buckets

### 1. Parity Against The Current Effect-Specific Governance Surface

- `effect-import-style`
  - Verified as preserved.
  - Evidence:
    - `bun run check:effect-imports` passed.
    - `tooling/cli` focused tests passed with `3` files and `11` tests.
    - `tooling/configs/test/eslint-rules.test.ts` passed with `28` tests, keeping the legacy fixture corpus green.
  - Call:
    - the repaired repo-local command is now a credible exact surface for the locked `IMP-01` and `IMP-02` cases.

- `no-native-runtime`
  - Verified as preserved for the Effect-lane behavior that mattered to the replacement.
  - Evidence:
    - `bun run beep laws native-runtime --check` passed with `warnings=2` and `errors=0`.
    - the warning sites remain:
      - `packages/common/ui/src/components/orb.tsx:131:50`
      - `packages/common/ui/src/components/tour.tsx:162:9`
    - focused CLI tests passed and the shared hotspot definitions still align the repo-local runner with the legacy rule.
  - Call:
    - hotspot-vs-broad severity behavior and allowlist-backed exceptions were preserved.
    - the two remaining UI warnings are explicit carry-forward warnings, not hidden regressions.

- `schema-first`
  - Verified as an intentional stronger remap, not a parity loss.
  - Evidence:
    - `bun run lint:schema-first` passed with:
      - `live_entries=132`
      - `tracked_entries=132`
      - `missing_entries=0`
      - `stale_entries=0`
      - `enforced_candidates=0`
  - Call:
    - the inventory lane is now the authoritative source of truth, exactly as planned in P2 and executed in P3.

- `terse-effect-style`
  - Verified as preserved for the locked binary corpus.
  - Evidence:
    - `bun run beep laws terse-effect --check` passed with `touched_files=0`.
    - focused CLI tests passed for helper-ref, `flow(...)`, and thunk-helper coverage.
    - the legacy fixture suite remained green.
  - Call:
    - the repo-local surface now credibly covers `TRS-01`, `TRS-02`, and `TRS-03`.

### 2. Performance Improvement Relative To The Previous Lane

- Benchmark posture:
  - local warm-run measurement on the current dirty worktree
  - no cache reset and no CI remote-cache instrumentation
  - use the numbers as directional but concrete evidence, not as a lab-grade benchmark

- Measured commands:
  - `bun run lint:effect-laws --max-warnings=0`
    - `real 44.67s`
    - failed because the legacy lane still pulled JSDoc enforcement into the Effect-specific path via `tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts`
  - `bun run lint:effect-governance`
    - `real 32.70s`
    - passed

- Performance call:
  - the new blocking Effect-governance lane was about `11.97s` faster locally, or about `27%` faster on this run.
  - the new path is also operationally cleaner because it:
    - keeps the Effect lane separate from the JSDoc or TSDoc lane
    - avoids relying on one whole-repo ESLint pass as the blocking Effect-governance authority
    - replaces duplicated broad checks with narrower repo-local parity commands plus the inventory lane

### 3. Steering Improvement On The Locked Evaluation Corpus

- Locked binary parity cases:
  - `IMP-01` through `TRS-03` pass as governance cases through the focused CLI tests, the surviving legacy fixture suite, and the live repo-local commands.

- Locked steering-review cases:
  - `IDI-01`
    - verdict: pass
    - reason:
      - the canonical `effect-first-development` skill now explicitly prefers the flattest equivalent boolean form first and treats `Bool.match(...)` as something to keep only when both branches do meaningful work or readability clearly improves
      - Codex session-start guidance now nudges fresh sessions away from nested `Bool.match(...)` trees
      - Claude post-edit pattern detection now flags nested `Bool.match(...)` as `flatter-bool-control` and points to flatter control-flow alternatives
      - `check:effect-steering` keeps this default-path advisory surface live in the blocking lane
  - `IDI-02`
    - verdict: pass
    - reason:
      - the canonical skill and the Codex session-start context now explicitly tell agents to prefer `Match.type<T>().pipe(...)` or `Match.tags(...)` for reusable matchers
      - the Claude prompt hook emits the same steering automatically for Effect-first prompts
      - Claude post-edit pattern detection now flags `Match.value(...)` and explains the keep rule for concrete local boundary values versus reusable or extracted matcher bodies
  - `IDI-03`
    - verdict: pass
    - reason:
      - the canonical skill, Codex session-start context, and Claude prompt hook all now explicitly require checking `O.map(...)`, `O.flatMap(...)`, `O.liftPredicate(...)`, and `O.getOrElse(...)` before keeping `O.match(...)`
      - Claude post-edit pattern detection now flags `O.match(...)` and explicitly preserves the keep-case when branches do distinct work or different effects
      - this is enough to satisfy the locked rubric because the case now receives automatic default-path review rather than silence

- Steering call:
  - the system now ships the missing default steering layer as automatic agent-facing surfaces rather than as future work.
  - the steering layer is cheap enough to run by default and explicit enough to satisfy the locked idiomaticity rubric.
  - custom Effect-focused Biome diagnostics would still be a possible future enhancement, but they are no longer required for an honest `full replacement` verdict under this package objective.

## Final Verdict Rationale

Choose `full replacement`.

- Do not choose `staged cutover`:
  - the specific blocker that kept the package at staged cutover has now been addressed with shipped, automatic steering surfaces that are themselves verified inside the blocking lane.
- Do not choose `no-go yet`:
  - the shipped lane is narrower, faster, parity-holding, and now steering-complete enough for the package objective.

The honest conclusion is that the repo-local hybrid lane has now crossed the package threshold from a credible staged cutover into a real replacement for the Effect-specific governance lane. The legacy ESLint path may remain available as rollback or comparison scaffolding, but it is no longer the authoritative Effect-governance surface.

## Explicit Routing Back To Execution

P4 did not patch implementation gaps inside the verification phase. The remaining gaps should route back to execution follow-up rather than be hidden inside this verdict.

### Remaining Follow-Up After `Full Replacement`

- keep `check:effect-steering` wired into `lint:effect-governance` so the automatic steering surfaces do not drift
- optionally add custom Effect-focused Biome diagnostics later if the repo wants even earlier author-time backpressure
- decide separately whether and when the legacy ESLint implementation can be fully deleted once the non-Effect governance lanes no longer depend on it

## Exit Gate

P4 is complete because:

- all three evidence buckets are addressed
- the final conclusion is explicit
- residual risks are explicit
- the remaining implementation gaps are routed clearly rather than hidden

## Fresh Re-Review Addendum

The original P4 verdict was `staged cutover`. After that verdict, a follow-up implementation pass landed the missing default steering layer:

- explicit Codex session-start steering for the locked matcher-shape concerns
- prompt-hook steering for Effect-first prompts
- post-edit matcher-smell patterns for nested `Bool.match(...)`, reusable `Match.value(...)`, and review-worthy `O.match(...)`
- a blocking `check:effect-steering` gate inside `lint:effect-governance`

This addendum now records the fresh explicit re-review result: the shipped follow-up is strong enough to promote the package from `staged cutover` to `full replacement`.
