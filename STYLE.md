# Code Style — beep vs effect-smol

beep's lint toolchain is aligned to **effect-smol**'s code style where it fits, but beep
keeps **Biome** as its formatter and primary linter and intentionally diverges in several
places. This file is the durable record of those decisions (see
`goals/lint-toolchain-modernization/` for the initiative that produced it). effect-smol's
own style is enforced by **oxlint + dprint**; beep maps the *intent* of those rules onto
Biome lint rules + repo-local GritQL rules, not a 1:1 port.

## Formatting (frozen — Biome owns it)

Biome formatting is **not** changed by this initiative. effect-smol uses dprint with
`semiColons: "asi"` and `trailingCommas: "never"`; beep keeps Biome's
`semicolons: "always"` and `trailingCommas: "es5"`. Biome cannot replicate dprint's ASI
exactly, and a whole-repo reformat is out of scope.

| Concern | effect-smol (dprint) intent | beep choice | Status | Rationale |
| --- | --- | --- | --- | --- |
| Semicolons | `asi` (omit) | Biome `semicolons: "always"` | kept | Biome can't replicate dprint ASI; avoid whole-repo reformat. |
| Trailing commas | `never` | Biome `trailingCommas: "es5"` | kept | Same; formatting frozen for this initiative. |
| Arrow parens | force parens | Biome `arrowParentheses: "always"` (formatter default) | aligned via formatter | Biome's formatter already forces single-param arrow parens, so no separate lint rule is needed. |
| Quote style / width / indent | double / 120 / 2 | same | aligned | beep already matched these. |

## Lint rules — divergences (intentionally NOT ported / deferred)

| Rule (effect-smol) | Intent | beep choice | Status | Rationale |
| --- | --- | --- | --- | --- |
| `consistent-type-imports` (inline) | inline `import type` | Biome `useImportType: "separatedType"` | kept | beep keeps separated type-import statements. |
| `no-import-from-barrel-package` | forbid barrel/root package imports | not ported | skipped | `CLAUDE.md` deliberately allows root `effect` imports for core combinators; `laws effect-imports` already owns beep's import discipline (with `--write` remediation). |
| `no-js-extension-imports` | mandate `.ts` extension in relative imports | not ported | skipped | beep's `tsconfig.base.json` uses `module/moduleResolution: NodeNext`, which **requires** `.js` extensions on relative imports (~838 in-tree, all `.js`); porting would flag correct, required imports. |
| `jsdocs` | effect-smol JSDoc shape rule | not ported | skipped | beep has its own JSDoc tooling (`quality jsdoc-inventory`, jsdoc skills). |
| `no-opaque-instance-fields` | no instance members on `Schema.Opaque` classes | deferred to P3 oxlint | deferred | needs import-binding + static-vs-instance member scope; GritQL cannot express it cleanly. effect-smol's own implementation is an oxlint ESTree rule — beep ports it faithfully in the P3 oxlint lane. |
| `import/no-duplicates`, `import/no-self-import` | one import per module / no self-import | deferred to P3 oxlint | deferred | no Biome builtin; need multi-import / current-package scope (oxlint `import` plugin). |
| `no-bigint-literals` | forbid bigint literals | enabled, **advisory only** (src-scoped) | advisory (kept) | P2 verdict: the in-tree bigint literals are **intentional domain values** — `Match.when(1n, ...)` version discriminators, `1n << 32n` id seeds — not just test data. Forcing `BigInt(1)` is more verbose and less readable. Scoped to `**/src/**` (excludes test/`LiteralKit` data); kept `warn` (not mandatory) like `no-js-extension-imports`, because the literals beep writes are correct. |
| `noConsole` | disallow `console` | enabled, **advisory only** | advisory (kept) | P2 verdict: enforcing repo-wide as `error` is a large, separate effort (~118 sites) and much `console` use is legitimate (CLI output, scripts, diagnostics already allowlisted). Kept `warn` pending a dedicated logging-migration initiative. |
| `noUselessConstructor` | no useless constructors | enabled, **advisory only** | advisory (kept) | P2 verdict: the flagged constructors carry typed parameters / DI shape (e.g. `chalk` `ChalkValue(_options?: ...)`) that are not safely removable without changing call-site types. Kept `warn`. |

## beep checks kept in `ts-morph` (not migrated to GritQL)

These are type-aware, whole-file, or path-scoped and cannot be reproduced as single-file
GritQL patterns without coverage loss (SPEC Parity Gate / Stop Conditions):

| Check | Why it stays in `ts-morph` |
| --- | --- |
| `laws effect-fn --check` | A GritQL port produced 51 false positives in `packages/foundation` alone (the precise check finds 0) and a ~100× slowdown (~98s on `apps`) from `within`-ancestor traversal on the hot `Effect.gen` pattern. Needs direct-return-owner / nearest-owner / generator scope analysis. |
| `laws effect-imports --check`/`--write` | Whole-file import consolidation (moving named imports between root and submodules per an 8-entry alias table) is not a single-file pattern; the `--write` codemod is also required by `yeet` repair (`Yeet/internal/Planner.ts`). |
| `laws native-runtime --check` | Hybrid: path-scoped allowlist reconciliation + native method-call scope. GritQL could only detect `node:` imports, not the allowlist/scope logic. |
| `lint schema-first`, `lint circular`, `quality {turbo-config-proof,changeset-graph,jsdoc-inventory}` | Cross-file inventory / graph / governance validators — out of scope by design. |

## Lint rules — alignments (enabled by this initiative)

P1 shipped every rule advisory (`warn`). P2 flipped to **mandatory (`error`)** only the
rules that fit beep with zero violations; the rest stay advisory (see the divergence
table above for why).

| Concern | Mechanism | Status (post-P2) |
| --- | --- | --- |
| `no-var` | Biome `suspicious/noVar` | **mandatory** (0 violations) |
| tagged errors in tooling | GritQL `no-native-error` (`@beep/lint-rules`, tooling-src override) | **mandatory**; the superseded `lint tooling-tagged-errors` CLI check is **removed** (no dangling refs) |
| empty named imports | GritQL `no-empty-named-blocks` | **mandatory** (0 violations) |
| `.map().flat()` | GritQL `prefer-array-flat-map` | **mandatory** (0 violations) |
| `no-console` | Biome `suspicious/noConsole` | enabled, advisory (kept — see divergences) |
| `no-useless-constructor` | Biome `complexity/noUselessConstructor` | enabled, advisory (kept — see divergences) |
| bigint literals | GritQL `no-bigint-literals` (src-scoped) | enabled, advisory (kept — intentional domain values) |
| PascalCase tooling filenames | Biome `style/useFilenamingConvention` (scoped) | not migrated — the current `lint tooling-schema-first` filename check flags compound-extension files (`X.command.ts`) which `useFilenamingConvention` cannot reproduce without rewriting the convention; kept in ts-morph |
