# Effect Governance Replacement - P1 Validated Options

## Status

**COMPLETED**

## Objective

Validate research claims, lock the fixed steering evaluation corpus, and narrow the option set to a credible shortlist.

## Validated Rule-By-Rule Calls

| Rule | Current Baseline | Validated Parity Call | Surviving Replacement Surface | Evidence | Gap Or Planning Note |
|---|---|---|---|---|---|
| `effect-import-style` | ESLint custom rule plus fixture coverage for alias mismatches, root-import promotion, and canonical root alias rejection | Partial today, but credible after repair or replacement inside a hybrid plan | repair and retain `bun run beep laws effect-imports --check|--write`, or replace its exact behavior with a new repo-local surface, then optionally add Biome shadow diagnostics | `tooling/configs/src/eslint/EffectImportStyleRule.ts`, `tooling/cli/src/commands/Laws/EffectImports.ts:81-310`, `tooling/configs/test/eslint-rules.test.ts:136-240`, `bun run check:effect-imports` | The current CLI is not exact parity today. Its `isStableSubmodule` predicate is wrong, stable-submodule handling is incomplete, and there are no dedicated CLI tests. |
| `no-native-runtime` | ESLint custom rule plus hotspot severity escalation plus a 14-entry allowlist | Hybrid-only. Pure Biome, hooks, or instructions do not provide credible full parity today | add or retain a repo-local parity runner for hotspot scope plus allowlist-backed exceptions, optionally shadowed by Biome diagnostics; keep `allowlist-check` | `tooling/configs/src/eslint/NoNativeRuntimeRule.ts`, `tooling/configs/src/eslint/ESLintConfig.ts:113-168`, `standards/effect-laws.allowlist.jsonc`, `tooling/configs/test/eslint-rules.test.ts:243-358`, `bun run check:effect-laws-allowlist` | This is the main blocker for full ESLint removal. Any P2 plan must reproduce hotspot behavior and exception handling explicitly. |
| `schema-first` | Conservative ESLint suggestion for exported pure-data interfaces and type literals, plus a stronger repo-wide inventory command | Stronger-than-current parity is already credible through the inventory command and should become the authoritative lane | keep `bun run beep lint schema-first` as the primary source of truth; treat ESLint parity as a subset, not the target | `tooling/configs/src/eslint/SchemaFirstRule.ts`, `tooling/cli/src/commands/Lint/SchemaFirst.ts`, `tooling/configs/test/eslint-rules.test.ts:150-167`, `bun run lint:schema-first` | This is the only rule family with a credible repo-local blocking replacement already in place. The command is broader than the ESLint rule and currently reports one missing inventory entry in `packages/common/observability/src/CoreConfig.ts`. |
| `terse-effect-style` | ESLint custom rule covers direct helper refs, `flow(...)` passthrough callbacks, and shared thunk helpers | Partial today, not exact parity | expand `bun run beep laws terse-effect` and or add repo-local Biome diagnostics; keep hooks and instructions as supporting nudges only | `tooling/configs/src/eslint/TerseEffectStyleRule.ts:148-260`, `tooling/cli/src/commands/Laws/TerseEffect.ts:114-247`, `tooling/configs/test/eslint-rules.test.ts:381-458`, `bun run beep laws terse-effect --check` | P0 overstated CLI parity. The current CLI only rewrites the direct helper-reference subset and does not cover the `flow(...)` or thunk-helper cases. |

## Locked Corpus

The fixed steering evaluation corpus now lives in `outputs/steering-eval-corpus.md`.

- Locked case count: `12`
- Binary parity cases: `9`
- Steering review cases: `3`
- Locked evaluation modes:
  - `binary-parity`
  - `strong-nudge`
  - `soft-review`

P4 must reuse that file unchanged.

## Credible Shortlist

### 1. Hybrid Staged Cutover

Validated shape:

- repo-local Biome diagnostics become the fast default-path steering lane
- repo-local exact or near-exact surfaces stay or expand where they already outperform lint:
  - repaired or replaced `effect-import-style` exact surface
  - `schema-first` inventory
  - expanded `terse-effect` exact helper surface
  - a new or retained allowlist-backed `no-native-runtime` parity runner
- Claude and Codex hooks, AGENTS guidance, skills, and repo-memory stay as supporting layers rather than the primary governance boundary

Why it survives:

- it matches the repo's already-hybrid governance reality
- it is the only candidate that credibly preserves parity while also reducing ESLint pipeline pressure
- it can separate exact repo-law enforcement from broader idiomatic flatness steering

### 2. Hybrid Staged Cutover Accelerated By External `linteffect` Seed

Validated shape:

- same target architecture as shortlist item 1
- bootstrap the general flatness and control-flow Biome layer from the external `@catenarycloud/linteffect` rule pack, then add repo-local overlays for parity gaps

Why it survives:

- the external pack is real, published, and philosophically aligned
- it can accelerate the generic Biome layer for flat composition and branch steering

Why it does not outrank item 1:

- it does not cover the repo-specific parity surface closely enough
- it is diagnostics-only today and does not replace the repo's exact fixer or allowlist needs

## Rejected Options

| Option | Verdict | Reason |
|---|---|---|
| External `linteffect` as a drop-in replacement | rejected | Strong seed, weak parity. It does not cover canonical import aliases, the breadth of `no-native-runtime`, or the exact `terse-effect-style` helper laws closely enough. |
| Pure repo-local Biome-only replacement | rejected as a sole answer | Biome is a strong default-path surface, but P1 did not validate full parity for `effect-import-style`, `no-native-runtime`, or `terse-effect-style` without companion repo-local surfaces. |
| Existing CLI and inventory stack only | rejected | `schema-first` is strong, but `effect-imports` and `terse-effect` are partial, there is no standalone `no-native-runtime` parity runner today, and default-path steering is too weak by itself. |
| Hook-first steering stack | rejected as a primary replacement | Hooks are excellent early nudges, but they are tool-loop dependent and do not give one-rule-at-a-time deterministic parity for the current governance lane. |
| Skills, AGENTS, and specialist subagents only | rejected | Advisory only, and some current guidance conflicts with the user's steering objective by explicitly preferring `Bool.match(...)` and `Match.value(...)` in cases now under review. |
| Repo-memory idiom search or recommendation CLI only | rejected | Useful for retrieval and suggestion, but it does not enforce policy or provide default-path coverage by itself. |

## Validated Supporting Layers

- Claude hooks survive as a supporting layer. The repo already ships real `PreToolUse` and `PostToolUse` pattern detection, and the official Claude hooks surface is rich enough to support tool-loop steering.
- Codex hooks survive as a supporting layer. The repo has a real `SessionStart` helper, but current official Codex hook capabilities are stronger for startup and prompt steering than for comprehensive source-shape enforcement.
- AGENTS, skills, and repo-local instruction surfaces survive as supporting layers only. They matter, but today they are not sufficient as the primary governance boundary and may need correction before they steer toward the desired flatter idioms.
- Repo-memory survives as a supporting layer only. It is a strong substrate for idiom lookup, symbol search, and recommendation tooling, not a standalone enforcement surface.
- Claude `subagent-init` is present but should not be treated as a major validated steering asset until its actual hook behavior is rechecked; it likely overstates what it is currently accomplishing.

## Important Validated Notes

- The JSDoc and TSDoc lane remains separate. Nothing in P1 changed that scope boundary.
- The phase stayed read-only outside this spec package.
- Only `schema-first` already has a credible repo-local blocking replacement in place.
- `effect-import-style` and `terse-effect-style` both need repair or expansion before they can stand in for ESLint.
- `no-native-runtime` remains the hardest parity blocker by a wide margin.
- The current CI shape is already softer than a hard-stop governance lane because `lint:effect-laws` runs warnings and the workflow does not use `lint:effect-laws:strict`.
- Instruction-only steering is weaker than expected because the repo's current skill guidance already encodes some of the heuristics the user wants reevaluated.

## Unresolved Questions That Still Matter For Planning

- Should P2 treat the broader `schema-first` inventory lane as an intentional widening on day one, or stage that widening after the main cutover?
- Should `no-native-runtime` parity be implemented as a new repo-local runner, or should the P2 plan keep a temporary bridge until that runner exists?
- Should the Biome layer be authored entirely repo-locally, or should P3 vendor or fork a validated subset from `linteffect` as a starting point?
- Should exact `effect-import-style` parity continue through a repaired CLI, or should that exact surface move into a different repo-local mechanism?
- Should exact `terse-effect-style` parity live in an expanded repo-local CLI, in repo-local Biome rules, or in a split exact-plus-advisory model?

## Exit Gate

- evaluation corpus locked: yes
- shortlist explicit: yes
- current rules mapped one by one: yes
- rejected options documented: yes
- P2 can plan without reopening broad exploration: yes
