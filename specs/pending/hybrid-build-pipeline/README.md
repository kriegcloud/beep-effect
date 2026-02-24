# Hybrid Build Pipeline

## Status

- Status: `pending`
- Started: `2026-02-23`
- Branch: TBD

## Purpose

Replace the current `tsc -b` + Babel two-pass compilation pipeline with a hybrid approach: TypeScript project references for IDE/development, a fast Rust-based bundler for production output. Goals: eliminate `.tsbuildinfo` artifacts, maximize build speed, maintain full Effect v4 compatibility.

## Current State

- **Compiler**: `tsc -b` with `composite: true`, `incremental: true`, project references
- **Post-pass**: `babel-plugin-annotate-pure-calls` for tree-shaking annotations
- **Artifacts**: `.tsbuildinfo` at root and per-package, `.d.ts`, `.d.ts.map`, `.js`, `.js.map`
- **Orchestration**: Turborepo `^build` dependency graph
- **Alt compiler**: `tsgo -b` scripts already defined but not default

## Key Constraints

1. **No `isolatedDeclarations`** -- Effect v4 relies on heavy type inference (generators, branded types, `ServiceMap.Service` class extends). The upstream Effect library does not use `isolatedDeclarations`.
2. **`/*#__PURE__*/` annotations required** -- Effect's tree-shaking depends on `babel-plugin-annotate-pure-calls`. No bundler natively adds these.
3. **ESM-first** -- `module: NodeNext`, `verbatimModuleSyntax: true`, `rewriteRelativeImportExtensions: true`.
4. **`erasableSyntaxOnly: true`** -- enables direct Bun execution of source files.

## Research Output

See `outputs/research.md` for comprehensive bundler analysis, compatibility assessment, and phased migration recommendation.

## Decision Matrix (Summary)

| Path | Tooling | Speed Gain | Risk | Timeline |
|------|---------|-----------|------|----------|
| **A: tsgo + Babel** | Replace `tsc` with `tsgo`, keep Babel post-pass | ~10x type-check/emit | Lowest | Now |
| **B: tsdown + tsgo DTS** | tsdown for JS, tsgo `emitDeclarationOnly` for DTS | JS bundling + 10x DTS | Medium | When tsdown monorepo matures |
| **C: tsdown all-in-one** | tsdown with tsc-fallback DTS | Single tool | Highest | When Effect adopts `#__NO_SIDE_EFFECTS__` |

## Follow-Up Tracking

- [ ] Benchmark `tsgo -b` vs `tsc -b` on this repo's full build
- [ ] Evaluate tsdown monorepo support maturity (track rolldown/tsdown#544)
- [ ] Monitor Effect upstream `#__NO_SIDE_EFFECTS__` adoption (Effect-TS/effect#5967)
- [ ] Prototype tsdown single-package build (e.g. `@beep/types`) to validate compatibility
- [ ] Investigate Rolldown plugin for `annotate-pure-calls` equivalent
