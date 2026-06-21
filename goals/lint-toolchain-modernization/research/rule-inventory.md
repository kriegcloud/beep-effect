# Rule Inventory — engine / severity / status

Rule-by-rule routing for the initiative. **Engine**: `gritql` (Biome plugin, P1),
`oxlint` (lint-only lane, P3), `keep-tsmorph` (unchanged), `hybrid`, or `biome-builtin`
(enable an existing Biome rule). **Status** starts `planned`; execution flips it to
`advisory` → `mandatory` → `done`. Confidence reflects recon certainty; verify in P0.

## A. CLI quality commands → migration verdict

| CLI command | Tech today | Engine | Conf. | Notes |
| --- | --- | --- | --- | --- |
| `lint tooling-tagged-errors` | ts-morph regex (`new Error`) | **gritql** | high | Cleanest port; match `new Error(...)`, suggest tagged error. ~40 LoC removed. |
| `lint tooling-schema-first` (filename checks only) | ts-morph + regex | **gritql** | high | Split the PascalCase/index-bin filename check into a GritQL rule; keep the pattern/inventory checks in ts-morph. |
| `laws effect-fn --check` | ts-morph Project | **gritql** | medium | Match `function*` decls + `Effect.fn.Return<…>` JSDoc; syntactic. JSDoc parsing is the risk. |
| `laws effect-imports --check` (lint path) | ts-morph Project + rewrite | **gritql** (lint) | medium | GritQL for the *diagnostic*; keep `laws effect-imports --write` (ts-morph) for remediation. |
| `laws native-runtime --check` | ts-morph + allowlist | **hybrid** | medium | GritQL detects `node:` imports; keep ts-morph for method-call scope + allowlist reconciliation. (Exact name confirmed: `native-runtime`, not `no-native-runtime`.) |
| `laws dual-arity --check` | ts-morph (types) | keep-tsmorph | high | Needs type info + exception inventory. |
| `laws terse-effect --check` | ts-morph (scope + rewrite) | keep-tsmorph | high | Multi-node codemods + scope analysis. |
| `lint schema-first` (full) | ts-morph + inventory | keep-tsmorph | high | Cross-file inventory reconciliation. |
| `lint circular` | madge graph | keep-tsmorph | high | Graph algorithm; no single-file AST equivalent. |
| `lint allowlist`, `quality turbo-config-proof`, `quality changeset-graph`, `quality jsdoc-inventory` | custom Effect / ts-morph | keep-tsmorph | high | Governance/graph/inventory validators, not lint rules. |

## B. New custom rules — t3code (named "add these"; P3 oxlint lane)

All four are **stateful / path-aware / scope-aware** → oxlint plugins in `@beep/lint-rules`,
not GritQL. Sourced from `t3code/oxlint-plugin-t3code/rules/*`.

| Rule | Enforces | Engine | Severity | Status / notes |
| --- | --- | --- | --- | --- |
| `namespace-node-imports` | Canonical namespace import for `node:*` builtins, e.g. `import * as NodeFS from "node:fs"` (alias = `Node` + PascalCased module; special maps `fs→FS`, `assert/strict→Assert`, …). | oxlint | error | New to beep. **Complements** `laws native-runtime` (different concern: import *style* vs native-API allowlist) — both run lint-only, no flag overlap. See SPEC "Rule Overlap Decisions". |
| `no-global-process-runtime` | Forbid `process.platform`/`process.arch` (incl. `globalThis.process`) outside a shared host-process reference file; tracks `node:os` imports. | oxlint | error | New to beep; needs a beep-specific host-process reference path (t3code hardcodes `packages/shared/src/hostProcess.ts`). |
| `no-inline-schema-compile` | Forbid `Schema` compiler methods (`is`/`asserts`/`decode*`/`encode*`) called **inside function bodies** on static schema refs (hot-path allocation). | oxlint | error | New to beep; complements schema-first discipline. Needs function-body scope. |
| `no-manual-effect-runtime-in-tests` | Forbid `Effect.run*` / `ManagedRuntime.make` in `*.test|spec` files, with a legacy baseline allowing existing counts. | oxlint | error | New to beep; **rebuild the `LEGACY_BASELINE` for beep's tree** (t3code's baseline is theirs). |

## C. New custom rules borrowed from effect-smol

effect-smol's own custom oxlint plugin (`packages/tools/oxc/src/oxlint`) exports exactly
**5** rules: `no-bigint-literals`, `no-import-from-barrel-package`, `no-js-extension-imports`,
`no-opaque-instance-fields`, `jsdocs`. The rest below are general lint rules effect-smol
enables via its `eslint`/`unicorn`/`import` oxlint presets, not custom rules. This table is
**beep's target**, not a 1:1 copy — routed by what each rule actually needs.

### C1. effect-smol custom rules → GritQL (P1)

| Rule | Enforces | Engine | Severity | Notes |
| --- | --- | --- | --- | --- |
| `no-bigint-literals` | Disallow `1n` literals; require `BigInt(1)`. | gritql | error | Syntactic, single-file. |
| `no-js-extension-imports` | Forbid `.js/.jsx/.mjs/.cjs` in relative imports. | gritql | error | Syntactic. |
| `no-opaque-instance-fields` | No instance fields on `Schema.Opaque` classes. | gritql | warn | Compound pattern (class + extends + field); medium complexity. |
| `jsdocs` | effect-smol's JSDoc shape rule. | keep-tsmorph | — | **Skip port** — beep already has its own JSDoc tooling (`quality jsdoc-inventory`, jsdoc skills). |

### C2. effect-smol preset lint rules → routed by need

| Rule | Enforces | Engine | Severity | Notes |
| --- | --- | --- | --- | --- |
| `import/no-empty-named-blocks` | No `import {} from "…"`. | gritql | error | Trivial single-file. P1. |
| `unicorn/prefer-array-flat-map` | `.map().flat()` → `.flatMap()`. | gritql | warn | Cosmetic; P1, low priority. |
| `arrow-function-parens` (force) | Lint mirror of effect-smol's dprint arrow-paren preference. | gritql | warn | Biome doesn't own this formatting; document in `STYLE.md`. P1. |
| `import/no-duplicates` | One import statement per module. | oxlint (P3) | error | Multi-import file scope; effect-smol uses the oxlint `import` plugin. Confirm a Biome builtin in P0 before authoring. |
| `import/no-self-import` | No import of the current package. | oxlint (P3) | error | Needs current-package context; effect-smol uses the oxlint `import` plugin. |

### C3. Deferred — type-aware (cannot be GritQL)

| Rule | Engine | Notes |
| --- | --- | --- |
| `no-unnecessary-type-assertion`, `no-unnecessary-type-constraint` | oxlint type-aware / keep-tsmorph | **Defer** — needs type inference; out of P1/P2 scope. |

### C4. Intentional divergences — do NOT port

| Rule | Why not ported |
| --- | --- |
| `consistent-type-imports` (inline) | beep keeps Biome `useImportType: separatedType`. Documented in `STYLE.md`. |
| `no-import-from-barrel-package` | **Contradicts beep policy** — `CLAUDE.md` deliberately allows root `effect` imports for core combinators. `laws effect-imports` owns Effect import discipline (it encodes beep's actual policy + has `--write` remediation). See SPEC "Rule Overlap Decisions". |

## D. `biome.jsonc` lint-rule alignment (P1 — enable/verify existing Biome rules)

Formatting is **frozen** (semicolons/ES5 trailing commas kept; see `STYLE.md`). These are
lint-rule toggles only. The packet describes the *current* state correctly — these rules are
off/absent today and P1 turns them on. Confirm exact Biome v2.5 rule ids/groups in P0
(`biome explain` / Biome docs) before editing.

| Intent (effect-smol) | Biome rule (confirm id in P0) | Current state | Action |
| --- | --- | --- | --- |
| `no-console` | `suspicious/noConsole` | absent | Enable (`error`); allowlist tests/examples via `overrides`. |
| `no-var` | `noVar` (confirm group — `style` vs `suspicious` in 2.5) | absent | Enable (`error`). |
| `no-useless-constructor` | `complexity/noUselessConstructor` | `off` (biome.jsonc:112) | Re-enable (`error`). |
| inline type imports | `style/useImportType` | `error`/`separatedType` | **Keep `separatedType`** (divergence, documented). |

> Import discipline overlaps are **pre-decided** in SPEC "Rule Overlap Decisions" — there is
> no open C/D dedup left to resolve during execution.
