# Effect Governance Replacement - P2 Planning

## Status

**COMPLETED**

## Objective

Turn the validated shortlist into a rank-ordered implementation plan with one chosen primary path.

## Decision

The chosen primary path is the validated repo-local hybrid staged cutover:

- repo-local Biome diagnostics become the fast default-path steering layer
- repo-local exact or near-exact surfaces become the authoritative parity layer
- hooks, startup guidance, and skills are updated only as supporting glue

This path is ranked first because it is the only validated option that can:

- reduce the current ESLint choke point on the Effect lane
- preserve or intentionally improve the current rule-by-rule governance surface
- steer agents earlier than repo-wide lint without making the system depend on hook availability

The execution target for P3 is a staged cutover that is eligible for a later `full replacement` verdict in P4. P2 does not assume that full replacement is already proven.

## Ranked Candidates

| Rank | Candidate | Weighted Score | Validation Gate Result | P2 Decision |
|---|---|---|---|---|
| 1 | Hybrid staged cutover: repo-local Biome diagnostics + repaired or expanded repo-local parity surfaces + allowlist-backed `no-native-runtime` runner + hook and instruction support | `2.60` | passes | chosen primary path |
| 2 | Hybrid staged cutover accelerated by external `linteffect` seed plus repo-local overlays | `2.35` | passes with narrower fit | keep as optional reference only |
| 3 | Pure repo-local Biome-only replacement | `1.70` | fails parity blocker | rejected |
| 4 | Hook-first steering stack using Claude or Codex hooks and repo-authored patterns | `1.55` | fails parity blocker | rejected |
| 5 | Existing CLI and inventory stack only | `1.30` | fails default steering and parity blocker | rejected |
| 6 | External `linteffect` as a drop-in replacement | `1.20` | fails parity blocker | rejected |
| 7 | Skills, AGENTS, and specialist subagent registry only | `1.05` | fails enforceability | rejected |
| 8 | Repo-memory idiom search or recommendation CLI only | `0.45` | fails enforceability | rejected |

## Why Rank 1 Won

- The repo already has root-level Biome, so the fast steering lane can be added to an existing toolchain instead of introducing a second formatter or linter stack.
- The repo already tolerates hybrid governance, which makes repo-local commands and inventory enforcement a natural destination for exact parity.
- The hardest blocker, `no-native-runtime`, needs explicit allowlist and hotspot behavior. A hybrid path is the only one that handles that cleanly.
- The accelerator variant is useful, but it adds packaging and provenance decisions without solving the repo-specific blockers on its own.

## Closed Planning Decisions

### `schema-first`

- Treat the broader inventory lane as an intentional day-one widening, not as a parity bug.
- P3 must fix the currently reported missing inventory entry in `packages/common/observability/src/CoreConfig.ts`.
- `bun run lint:schema-first` becomes the authoritative schema-first surface for the Effect lane.

### `no-native-runtime`

- Implement a repo-local parity runner for this family in P3.
- Keep the current allowlist file format unchanged.
- Preserve hotspot behavior and allowlist-backed exceptions explicitly.
- Keep the legacy ESLint surface available for rollback and audit until after P4.

### `effect-import-style`

- Repair the existing repo-local CLI path rather than trying to move exact parity into Biome.
- P3 must correct the stable-submodule handling bug and add dedicated CLI tests.

### `terse-effect-style`

- Expand the existing repo-local CLI to cover the missing `flow(...)` and shared thunk-helper cases.
- Use the Biome layer for broader idiomatic nudges, not as the first-wave exact parity authority for this rule family.

### External `linteffect`

- Do not make the external rule pack a required dependency, vendored bundle, or critical-path implementation input in P3.
- It may be used as reference material or as inspiration for individual repo-local Biome patterns if those patterns are rewritten and owned locally.

### Hooks, Skills, And Startup Guidance

- Keep these as supporting glue only.
- P3 should correct repo guidance that currently conflicts with the desired flatter idiom steering.
- P3 should not build a large new retrieval or specialist-subagent program as part of the first execution wave.

### ESLint Dependency Scope

- The current objective removes the Effect-specific governance lane from the blocking ESLint path.
- It does not promise full root-level ESLint removal because `lint:jsdoc` and the JSDoc or TSDoc lane remain separate.
- Any complete ESLint dependency removal must be treated as a later, separate lane unless P4 evidence makes that follow-up worth opening.

## Primary Path Architecture

### 1. Fast Default Steering Layer

- Add repo-local Effect-focused Biome diagnostics on top of the existing root `biome.jsonc`.
- Keep this layer focused on early, cheap, high-signal steering:
  - flat control-flow nudges
  - module and helper selection nudges
  - obvious anti-pattern detection from the locked steering corpus
- Do not require this layer to carry exact parity for all four current rule families.

### 2. Exact Or Near-Exact Parity Layer

This layer becomes the authoritative governance surface for the four current families:

- repaired `effect-import-style` repo-local command
- new allowlist-backed `no-native-runtime` repo-local runner
- promoted `schema-first` inventory lane
- expanded `terse-effect-style` repo-local command

### 3. Support Layer

- minimal Claude and Codex startup or hook nudges
- corrected AGENTS or skill wording where current guidance conflicts with desired idioms
- no new primary enforcement dependency on hook execution

### 4. Legacy Bridge And Rollback Layer

- keep `lint:effect-laws`, `lint:effect-laws:strict`, the current effect-specific ESLint rules, fixtures, and allowlist support in the repo through P4
- remove them from the blocking CI path during cutover
- use them for rollback and comparison, not as the default authority once P3 lands

## P3 Implementation Sequence

### Workstream 1. Shared Parity Harness

P3 must first make parity measurable before cutting over:

- preserve the current allowlist format
- preserve the current fixture corpus
- add dedicated command or runner tests where the existing exact surfaces are weak
- wire the locked `outputs/steering-eval-corpus.md` cases into the new execution and verification story without changing the corpus

### Workstream 2. Exact Surface Hardening

P3 must then make the exact surfaces credible enough to replace the ESLint lane:

- repair `effect-import-style`
- expand `terse-effect-style`
- implement `no-native-runtime` parity runner
- resolve the known `schema-first` inventory drift

### Workstream 3. Biome Steering Layer

After the exact surfaces are credible:

- add repo-local Biome diagnostics for high-signal idiomatic Effect steering
- keep the first-wave Biome scope intentionally narrow and safe
- ensure the Biome layer complements, rather than duplicates, the exact repo-local runners

### Workstream 4. Script And CI Cutover

P3 should introduce a single blocking aggregation surface for the Effect lane. The intended shape is:

- new root script: `lint:effect-governance`
- that script should aggregate:
  - repo-local Biome Effect diagnostics
  - `bun run check:effect-imports`
  - new `bun run beep laws native-runtime --check`
  - `bun run lint:schema-first`
  - expanded `bun run beep laws terse-effect --check`
  - `bun run check:effect-laws-allowlist`

Then P3 should:

- remove `lint:effect-laws` from the blocking root `lint` path
- update `.github/workflows/check.yml` so the new aggregator becomes the blocking Effect-lane command
- leave `lint:jsdoc` and the JSDoc or TSDoc lane untouched

### Workstream 5. Support-Layer Alignment

P3 should make only the supporting changes that directly strengthen the chosen path:

- correct conflicting skill guidance
- tighten startup or hook nudges where they materially improve default steering
- avoid opening a new repo-memory CLI or large specialist-subagent implementation unless P3 becomes blocked without it

## Migration Posture

The migration shape is:

1. make the new exact surfaces credible
2. add the fast Biome steering layer
3. cut the blocking CI path over to `lint:effect-governance`
4. keep the legacy ESLint effect-law lane dormant but available for audit and rollback until P4 decides the final verdict

This is intentionally a staged cutover, not a one-shot delete-and-pray replacement.

## Rollback Posture

Rollback must remain cheap during and immediately after P3:

- keep the legacy effect-specific ESLint implementation in the repo through P4
- keep the allowlist schema unchanged so rollback requires no data migration
- if parity or hotspot enforcement regresses, repoint root `lint` and `.github/workflows/check.yml` back to `lint:effect-laws`
- remove the new aggregator from the blocking path before deleting any new implementation surface

Rollback should be triggered if any of these occur:

- a locked binary parity case fails without an accepted widening rationale
- `no-native-runtime` hotspot coverage is weaker than the current lane
- the new blocking path produces unacceptable false positives or operational instability

## P4 Verification Requirements

P4 must measure the new system in three buckets:

### Parity

- compare the four rule families one by one using the locked parity matrix
- reuse the locked `12`-case steering corpus unchanged
- verify that accepted widenings are documented rather than accidental

### Performance

- compare wall-clock runtime of the old Effect ESLint lane against the new `lint:effect-governance` path
- capture both local and CI-relevant command evidence when possible
- explicitly note whether the blocking path got narrower, flatter, or more cache-friendly

### Steering

- verify that the new Biome and support layers improve early idiomatic steering on the strong and soft review cases
- verify that exact repo-local commands still preserve the binary parity behaviors

## Explicit Lane Separation

### Effect Lane Included In This Plan

- Effect-specific import governance
- native runtime governance
- schema-first governance for the Effect lane
- terse Effect helper style
- supporting hook, skill, and startup steering for these concerns

### JSDoc Or TSDoc Lane Explicitly Deferred

- `lint:jsdoc`
- root ESLint dependency removal as a whole-repo objective
- any standalone JSDoc or TSDoc replacement initiative

## What P3 Must Not Reopen

- whether hybrid is the right architecture
- whether `linteffect` should be the primary dependency
- whether the JSDoc or TSDoc lane belongs in this execution wave
- whether hooks or retrieval can replace deterministic parity surfaces

## Exit Gate

P2 is complete because:

- one primary path is chosen
- the ranking is explicit and score-backed
- migration and rollback posture are explicit
- the Effect lane remains separate from the JSDoc and TSDoc lane
- P3 can execute without reopening broad strategy questions
