# Hybrid Build Pipeline Research

## Table of Contents

- [Current Build Pipeline Analysis](#current-build-pipeline-analysis)
- [The Hybrid Approach Pattern](#the-hybrid-approach-pattern)
- [Bundler-by-Bundler Analysis](#bundler-by-bundler-analysis)
- [The isolatedDeclarations Question](#the-isolateddeclarations-question)
- [The Pure-Call Annotation Problem](#the-pure-call-annotation-problem)
- [TypeScript 7 (tsgo) -- The Wild Card](#typescript-7-tsgo----the-wild-card)
- [Recommendation Matrix](#recommendation-matrix)
- [Phased Migration Strategy](#phased-migration-strategy)
- [Appendix: Current Build Configuration](#appendix-current-build-configuration)

---

## Current Build Pipeline Analysis

### Two-Pass System

The repo uses the same pipeline as the upstream Effect library:

1. **`tsc -b tsconfig.json`** -- emits JS + `.d.ts` + source maps via project references (`composite: true`, `incremental: true`)
2. **`babel dist --plugins annotate-pure-calls --out-dir dist --source-maps`** -- re-processes JS to add `/*#__PURE__*/` annotations for tree-shaking

Each package's build script: `tsc -b tsconfig.json && bun run babel`

### What Gets Generated

Per package `dist/`:
```
*.js              # Compiled JavaScript
*.js.map          # Source maps
*.d.ts            # TypeScript declarations
*.d.ts.map        # Declaration maps
tsconfig.tsbuildinfo  # Incremental build cache (39-229 KB each)
```

### Pain Points

- **`.tsbuildinfo` proliferation** -- generated at root level (229 KB) and per-package, tracked as Turborepo outputs
- **Two-pass overhead** -- tsc emits JS, then Babel re-processes the same JS files
- **Incremental build fragility** -- `.tsbuildinfo` can become stale, requiring `pnpm clean` to recover
- **No bundler optimizations** -- tsc emits 1:1 file-to-file, no tree-shaking or dead code elimination at the package level

### What Works Well

- **Project references** -- IDE go-to-definition across packages is seamless
- **Internal packages pattern** -- `exports` point to `./src/index.ts` for dev, `publishConfig.exports` switch to `./dist/*.js` for publishing
- **Turborepo orchestration** -- `^build` ensures proper dependency ordering and caching
- **`tsgo -b` scripts already exist** -- `build:tsgo` defined in package.json, ready for drop-in replacement

---

## The Hybrid Approach Pattern

The pattern from [0x80/typescript-monorepo](https://github.com/0x80/typescript-monorepo) represents an emerging standard:

### How It Works

1. **`tsconfig.json`** with `composite: true`, project references -- used **only** by the IDE/language server for real-time type resolution and go-to-definition
2. **A bundler** (tsdown, esbuild, etc.) for actual build output -- JS, source maps, and optionally DTS
3. **Turborepo** caches build outputs, eliminating the need for `.tsbuildinfo`

### Who Does This

- **Turborepo docs** describe ["Internal Packages"](https://turborepo.dev/docs/core-concepts/internal-packages) where exports point to `.ts` source files directly -- exactly what this repo already does
- **Nx docs** extensively cover the hybrid approach with project references for type checking and separate bundling for output
- **Zod** created [zshy](https://github.com/colinhacks/zshy), a bundler-free tool powered by tsc for extension rewriting

### Why It Matters for This Repo

The repo already implements the "internal packages" pattern: apps consume source directly via the bundler (Next.js/Turbopack), and the full build pipeline is only needed for:
1. Publishing packages to npm
2. CI type-checking
3. Ensuring dist artifacts exist for non-bundler consumers

This means the bundler choice primarily affects CI build times and the publish pipeline -- not the day-to-day dev experience, which is already handled by project references.

---

## Bundler-by-Bundler Analysis

### 1. tsdown

**Engine:** Rolldown (Rust-based Rollup replacement)
**Repo:** [github.com/rolldown/tsdown](https://github.com/rolldown/tsdown)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Fastest library bundler available. 1.4-2x faster than esbuild on ESM. Real-world migration showed 49% build time improvement over tsup. |
| **DTS** | Two modes: (a) oxc-transform when `isolatedDeclarations` enabled (40x faster than tsc), (b) tsc fallback otherwise. Effect v4 requires the tsc fallback -- no speed gain for DTS. |
| **Source maps** | Full support: `true`, `'inline'`, `'hidden'`. Declaration maps auto-enabled. |
| **Monorepo** | Known issues: [#544](https://github.com/rolldown/tsdown/issues/544) workspace packages not always resolved. [#215](https://github.com/rolldown/tsdown/discussions/215) project references discussion open but unresolved. |
| **Effect compat** | JS output: fine (strips types, handles generators). DTS: falls back to tsc (no `isolatedDeclarations`). Pure annotations: not added automatically. |
| **Tree-shaking** | Built-in via Rolldown. Respects `sideEffects: []` and `/*#__PURE__*/`. |
| **tsbuildinfo** | Eliminated. |
| **Maturity** | Pre-1.0, backed by VoidZero (Evan You). tsup is abandoned in favor of tsdown. |
| **Config** | Minimal. `tsdown.config.ts` optional. |

**Verdict:** Best long-term bet for JS bundling. DTS generation won't be faster than tsc/tsgo for Effect code. Monorepo support needs maturation.

---

### 2. tsup

**Engine:** esbuild
**Repo:** [github.com/egoist/tsup](https://github.com/egoist/tsup)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Fast (esbuild). Slower than tsdown/Rolldown. |
| **DTS** | Shells out to tsc. Known to be slow. |
| **Monorepo** | Works but has known bugs. No workspace-aware features. |
| **Maturity** | **Abandoned.** Maintainer recommends tsdown. |

**Verdict:** Do not adopt. Dead project.

---

### 3. unbuild

**Engine:** Rollup + esbuild
**Repo:** [github.com/unjs/unbuild](https://github.com/unjs/unbuild)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Moderate. Rollup is JS-based -- fundamentally slower than Rust alternatives. |
| **DTS** | tsc API or rollup plugins. |
| **Monorepo** | mkdist file-to-file mode preserves directory structure. Auto-infers from package.json. |
| **Maturity** | Stable. UnJS/Nuxt ecosystem. |

**Verdict:** Solid but outpaced by Rust-based tools. Not optimal for speed-first requirements.

---

### 4. pkgroll

**Engine:** Rollup + esbuild
**Repo:** [github.com/privatenumber/pkgroll](https://github.com/privatenumber/pkgroll)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Rollup-speed, not Rust-speed. |
| **DTS** | Bundles and tree-shakes .d.ts files. Can inline types from devDependencies. |
| **Monorepo** | Limited. Zero-config from package.json exports. |
| **Maturity** | Stable, smaller community. |

**Verdict:** Elegant zero-config, not the fastest. Good for simple packages.

---

### 5. bunchee

**Engine:** Rollup + SWC
**Repo:** [github.com/huozhi/bunchee](https://github.com/huozhi/bunchee)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Faster than pure Rollup+esbuild (SWC is Rust-based for transforms). JS bundling still Rollup (JS-based). |
| **DTS** | Auto-generates matching output extensions. Uses tsc under the hood. |
| **Monorepo** | Used by t3-env. Package.json exports as single source of truth. |
| **Maturity** | Maintained by Jiachi Liu (Next.js team). Production-proven. |

**Verdict:** Good middle ground. SWC advantage is real for transforms but Rollup bottleneck remains.

---

### 6. esbuild (directly)

**Engine:** Go-based
**Repo:** [github.com/evanw/esbuild](https://github.com/evanw/esbuild)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Extremely fast. The benchmark baseline. |
| **DTS** | **None.** Will not implement ([issue #95](https://github.com/evanw/esbuild/issues/95)). Must pair with tsc. |
| **Monorepo** | No built-in awareness. |
| **Maturity** | Feature-complete, maintenance mode. |

**Verdict:** Excellent building block, not a standalone solution for library packages.

---

### 7. Rolldown (directly)

**Engine:** Rust-based (Rollup-compatible API)
**Repo:** [github.com/rolldown/rolldown](https://github.com/rolldown/rolldown)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | 1.4-2x faster than esbuild for ESM. 10-30x faster than Rollup. |
| **DTS** | None built-in. Requires `rolldown-plugin-dts`. |
| **Monorepo** | General-purpose, no monorepo abstractions. |
| **Maturity** | 1.0 RC. Will become Vite 8's default bundler. |

**Verdict:** Best-in-class engine. Use via tsdown rather than directly.

---

### 8. SWC (directly)

**Engine:** Rust-based compiler
**Repo:** [github.com/swc-project/swc](https://github.com/swc-project/swc)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Fast. 3-5x slower than oxc-transform. |
| **DTS** | **Not supported.** Open [issue #657](https://github.com/swc-project/swc/issues/657) since 2020. |
| **Bundler** | swcpack still experimental. |
| **Maturity** | Compiler stable (Next.js, Deno, Parcel). Being subsumed by Oxc/Rolldown ecosystem. |

**Verdict:** Excellent compiler but inadequate standalone. Role is being subsumed by Oxc.

---

### 9. Oxc (Oxidation Compiler)

**Engine:** Rust-based toolchain
**Repo:** [github.com/oxc-project/oxc](https://github.com/oxc-project/oxc)

| Attribute | Assessment |
|-----------|-----------|
| **Speed** | Fastest transformer available. 3-5x faster than SWC, 40x faster than tsc for isolated declarations. 20% less memory than SWC. 2MB package vs SWC's 37MB. |
| **DTS** | `isolatedDeclarations` emit only. No full DTS without type checker. |
| **Monorepo** | None. Collection of low-level tools (parser, transformer, linter, formatter). |
| **Maturity** | Parser and linter production-ready. Transformer alpha/beta. |

**Verdict:** The ultimate low-level tool. Its value is realized through Rolldown and tsdown, which use it under the hood.

---

## The isolatedDeclarations Question

This is the critical decision point for Effect v4 code.

### What `isolatedDeclarations` Requires

- Explicit return type annotations on all exported functions
- Explicit type annotations on all exported variables
- No inferred types crossing module boundaries

### Why This Conflicts with Effect v4

Effect's API design relies on type inference:

```ts
// This works today -- return type inferred from generator body
const myEffect = Effect.fnUntraced(function*(input: string) {
  const result = yield* someService.doThing(input)
  return result
})

// With isolatedDeclarations, you'd need:
const myEffect: (input: string) => Effect.Effect<
  SomeResult,
  SomeError | OtherError,
  SomeService | OtherService
> = Effect.fnUntraced(function*(input: string) {
  const result = yield* someService.doThing(input)
  return result
})
```

The explicit annotation is often 3-5x longer than the implementation and duplicates information the compiler already infers. Effect's `Schema.TaggedErrorClass`, `ServiceMap.Service` class extends, and branded types all produce complex inferred types that would be extremely verbose if written manually.

### Practical Implication

The "fast path" (oxc-transform) for DTS generation is unavailable. All bundlers that advertise blazing-fast DTS via `isolatedDeclarations` will fall back to tsc-based slow path for this codebase. **DTS generation speed is bounded by tsc (or tsgo) regardless of bundler choice.**

---

## The Pure-Call Annotation Problem

Effect's tree-shaking depends on `babel-plugin-annotate-pure-calls` adding `/*#__PURE__*/` annotations to function calls. No bundler listed above automatically adds these.

### Options

1. **Keep Babel as a post-pass** (current approach). Pipeline remains two-phase regardless of bundler.

2. **Write a Rolldown/tsdown plugin** replicating `annotate-pure-calls`. Rolldown supports the Rollup plugin API, so this is feasible but requires development effort.

3. **Adopt `#__NO_SIDE_EFFECTS__` on function declarations.** This is a newer pattern that Rolldown/esbuild/Rollup all respect natively. The upstream Effect library has [an open discussion (Effect-TS/effect#5967)](https://github.com/Effect-TS/effect/issues/5967) about migrating to this approach. If Effect v4 adopts `#__NO_SIDE_EFFECTS__` upstream, the Babel post-pass becomes unnecessary.

### Assessment

Option 3 is the cleanest long-term solution but depends on upstream adoption. Option 1 is the pragmatic choice today. Option 2 is worth exploring if the Babel post-pass becomes the bottleneck.

---

## TypeScript 7 (tsgo) -- The Wild Card

### Status (Feb 2026)

TypeScript 7.0 hit stable January 15, 2026. Written in Go, provides ~10x faster type checking and compilation over tsc 5.x. This repo already has `@typescript/native-preview` in the catalog and `build:tsgo` scripts defined in packages.

### Impact on This Decision

- **tsgo makes the tsc-based DTS path fast.** If tsc was the bottleneck for DTS generation, tsgo at 10x speed largely eliminates that bottleneck.
- **`tsgo -b` with project references** is experimental but basic compilation and DTS emit work.
- **No `.tsbuildinfo` consumption** -- tsgo cannot consume tsc-generated `.tsbuildinfo` files. Its own incremental support is experimental.

### Key Insight

tsgo changes the calculus significantly. The main argument for bundlers handling DTS was "tsc is slow for DTS generation." If tsgo is 10x faster, the argument weakens. The remaining arguments for a bundler are:

1. Eliminating `.tsbuildinfo` (Turborepo caching replaces incremental builds)
2. Bundler optimizations (tree-shaking, dead code elimination at package level)
3. Single-tool simplicity (one config instead of tsc + babel)

---

## Recommendation Matrix

| Tool | JS Speed | DTS (Effect v4) | Pure Annotations | Monorepo | Maturity | Overall |
|------|----------|-----------------|-----------------|----------|----------|---------|
| **tsdown** | Fastest | tsc fallback | Needs plugin/Babel | Known issues | Pre-1.0 | Best future bet |
| **tsup** | Fast | tsc-based | Needs Babel | Works | Abandoned | Avoid |
| **unbuild** | Moderate | tsc-based | Needs Babel | Good | Stable | Not fastest |
| **pkgroll** | Moderate | tsc-based | Needs Babel | Limited | Stable | Too simple |
| **bunchee** | Moderate+ | tsc-based | Needs Babel | Good | Stable | Middle ground |
| **esbuild** | Very fast | None | Needs Babel | None | Maintenance | Building block only |
| **Rolldown** | Fastest | via plugin | Needs plugin/Babel | None | 1.0 RC | Use tsdown |
| **SWC** | Fast | None | Needs Babel | None | Compiler stable | Subsumed by Oxc |
| **Oxc** | Fastest transform | isolatedDecl only | N/A | None | Alpha/Beta | Low-level building block |
| **tsgo** | 10x tsc | Full (native) | Needs Babel | Project refs | Stable | Game-changer for DTS |

---

## Phased Migration Strategy

### Path A: tsgo + Babel (Available Now)

**Replace `tsc -b` with `tsgo -b`, keep Babel post-pass.**

- ~10x faster type-check and emit
- Lowest risk -- drop-in replacement, `build:tsgo` scripts already exist
- `.tsbuildinfo` situation: tsgo's incremental support is experimental. Can disable `incremental`/`composite` in build-only tsconfig and rely purely on Turborepo caching.
- Babel post-pass unchanged

**Migration steps:**
1. Benchmark `tsgo -b` vs `tsc -b` on full build
2. Create `tsconfig.build.json` per package (no `composite`/`incremental`, no `.tsbuildinfo`)
3. Switch `build` scripts from `tsc -b tsconfig.json` to `tsgo -b tsconfig.build.json`
4. Keep `tsconfig.json` with `composite: true` for IDE project references
5. Verify Turborepo cache hit rates replace incremental build benefit

### Path B: tsdown for JS + tsgo for DTS (When Ready)

**tsdown bundles JS, tsgo with `emitDeclarationOnly` for DTS.**

- JS bundling speed: fastest available (Rolldown)
- DTS speed: 10x via tsgo
- Eliminates `.tsbuildinfo` completely
- Requires tsdown monorepo support to mature

**Migration steps (after Path A):**
1. Add `tsdown.config.ts` to one leaf package (e.g. `@beep/types`) as prototype
2. Validate: correct JS output, source maps, tree-shaking
3. Split build script: `tsdown && tsgo --emitDeclarationOnly`
4. Evaluate whether Babel post-pass can be replaced with Rolldown plugin
5. Roll out to remaining packages
6. Remove `tsc`/`tsgo` full-emit from build pipeline (keep for CI `check`)

### Path C: tsdown All-in-One (End State)

**tsdown handles JS + DTS, no Babel.**

Prerequisites:
- tsdown monorepo support stable
- Effect upstream adopts `#__NO_SIDE_EFFECTS__` (eliminates Babel dependency)
- tsdown DTS with tsc-fallback is reliable and fast enough

**This is the aspirational end state. Do not pursue until prerequisites are met.**

### Timeline Estimate

| Phase | Dependency | Readiness |
|-------|-----------|-----------|
| Path A | tsgo stable | **Now** |
| Path B | tsdown monorepo fixes | ~3-6 months (track rolldown/tsdown#544) |
| Path C | Effect `#__NO_SIDE_EFFECTS__` | Unknown (track Effect-TS/effect#5967) |

---

## Appendix: Current Build Configuration

### Root tsconfig.base.json (Key Options)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "incremental": true,
    "composite": true,
    "verbatimModuleSyntax": true,
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true
  }
}
```

### Package Build Script Pattern

```bash
# Every library package
"build": "tsc -b tsconfig.json && babel dist --plugins annotate-pure-calls --out-dir dist --source-maps"
"build:tsgo": "tsgo -b tsconfig.json && babel dist --plugins annotate-pure-calls --out-dir dist --source-maps"
```

### turbo.json Build Task

```json
{
  "build": {
    "dependsOn": ["^build"],
    "outputs": ["dist/**", ".next/**", ".tsbuildinfo/**", ".expo/**", ".output/**"]
  }
}
```

### Package Structure (16 packages + 1 app)

```
packages/
  common/
    types/       # @beep/types
    identity/    # @beep/identity
    utils/       # @beep/utils
    schema/      # @beep/schema
    data/        # @beep/data
    ontology/    # @beep/ontology
    messages/    # @beep/messages
  shared/
    domain/      # @beep/shared-domain
    env/         # @beep/shared-env
  ui/
    ui/          # @beep/ui
tooling/
  cli/           # @beep/repo-cli
  repo-utils/    # @beep/repo-utils
  beep-sync/     # @beep/beep-sync
  codebase-search/ # @beep/codebase-search
apps/
  web/           # @beep/web (Next.js 16 + Turbopack)
```

### Inter-Package Dependency Flow

```
@beep/types (leaf)
    |
@beep/identity
    |
@beep/utils
    |
@beep/schema ── @beep/data
    |               |
@beep/ontology ─────┘
    |
@beep/messages
    |
@beep/shared-domain
    |
@beep/shared-env
    |
@beep/web (consumer)
```

---

## Sources

- [tsdown Documentation](https://tsdown.dev/)
- [tsdown GitHub](https://github.com/rolldown/tsdown)
- [tsdown DTS Options](https://tsdown.dev/options/dts)
- [tsdown Monorepo Issue #544](https://github.com/rolldown/tsdown/issues/544)
- [tsdown Project References Discussion #215](https://github.com/rolldown/tsdown/discussions/215)
- [Switching from tsup to tsdown -- Alan Norbauer](https://alan.norbauer.com/articles/tsdown-bundler/)
- [Rolldown 1.0 RC Announcement](https://voidzero.dev/posts/announcing-rolldown-rc)
- [Rolldown Documentation](https://rolldown.rs/)
- [rolldown-plugin-dts](https://github.com/rolldown/rolldown-plugin-dts)
- [Oxc -- The JavaScript Oxidation Compiler](https://oxc.rs/)
- [unbuild GitHub](https://github.com/unjs/unbuild)
- [pkgroll GitHub](https://github.com/privatenumber/pkgroll)
- [bunchee GitHub](https://github.com/huozhi/bunchee)
- [esbuild DTS Issue #95](https://github.com/evanw/esbuild/issues/95)
- [SWC DTS Issue #657](https://github.com/swc-project/swc/issues/657)
- [Effect Tree-shaking Discussion #5967](https://github.com/Effect-TS/effect/issues/5967)
- [TypeScript 7 Native Port](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [TypeScript 7 Progress -- December 2025](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)
- [Turborepo Internal Packages](https://turborepo.dev/docs/core-concepts/internal-packages)
- [Managing TypeScript Packages in Monorepos -- Nx](https://nx.dev/blog/managing-ts-packages-in-monorepo)
- [zshy -- Bundler-free TypeScript](https://github.com/colinhacks/zshy)
- [TypeScript isolatedDeclarations TSConfig](https://www.typescriptlang.org/tsconfig/isolatedDeclarations.html)
- [Speeding up JavaScript Ecosystem -- Isolated Declarations](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-10/)
- [0x80/typescript-monorepo (reference repo)](https://github.com/0x80/typescript-monorepo)
