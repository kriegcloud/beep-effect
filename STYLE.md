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
| `no-bigint-literals` | forbid bigint literals | advisory only (P1); P2 scopes to source | advisory | 446 in-tree occurrences are **dominated by legitimate test/domain data** (e.g. `LiteralKit([1, 20n, ...])`); forcing `BigInt(n)` reduces readability in those contexts. P2 scopes to source (excluding tests/fixtures) before any mandatory flip, or keeps it advisory. |

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

| Concern | Mechanism | Status |
| --- | --- | --- |
| `no-console` | Biome `suspicious/noConsole` | enabled (advisory P1 → mandatory P2 with test/example overrides) |
| `no-var` | Biome `suspicious/noVar` | enabled (0 violations) |
| `no-useless-constructor` | Biome `complexity/noUselessConstructor` | re-enabled (was `off`) |
| tagged errors in tooling | GritQL `no-native-error` (`@beep/lint-rules`) | replaces `lint tooling-tagged-errors` (parity-proven) |
| empty named imports | GritQL `no-empty-named-blocks` | enabled |
| `.map().flat()` | GritQL `prefer-array-flat-map` | enabled |
| PascalCase tooling filenames | Biome `style/useFilenamingConvention` (scoped) | replaces the filename portion of `lint tooling-schema-first` (P2) |
