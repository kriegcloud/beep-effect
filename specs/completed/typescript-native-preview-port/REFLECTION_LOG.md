# Reflection Log: TypeScript Native Preview Port

## P0 -- Pre-seeded Research (2026-02-10)

### What Was Done

External research was conducted on `@typescript/native-preview` (tsgo / Project Corsa / TypeScript 7) to assess feasibility of migrating the beep-effect monorepo from `tsc` to `tsgo`.

### Research Sources

- TypeScript GitHub repository and issue tracker (typescript-go)
- npm package `@typescript/native-preview` release notes
- Turborepo documentation on tsgo integration
- Community reports on tsgo adoption in monorepos
- Known issues list from the typescript-go project

### Key Findings

1. **Type checking is at ~99.6% parity** with tsc. The remaining 0.4% is mostly edge cases around overload resolution and advanced conditional types. This project uses Effect (extremely sophisticated type-level programming), which could hit those edge cases.

2. **Build mode (`--build`) is supported**, including project references. This is essential for this project since we use `tsc -b` extensively.

3. **Declaration emit is partial**. Common cases work, but edge cases fail. This is a significant risk because this project depends on declaration files for cross-package type resolution in the monorepo.

4. **JavaScript emit is not fully ported**. The build pipeline (`build-esm` scripts) uses `tsc -b tsconfig.build.json` to emit JavaScript. If tsgo cannot emit JS reliably, we must use the hybrid path.

5. **ts-morph is a hard blocker for strict replacement**. The `tooling/cli` package has a runtime dependency on ts-morph, which uses the TypeScript JavaScript API (Strada). tsgo does not expose a JavaScript API. The `typescript` package must remain installed for this.

6. **`effect-language-service patch`** in the root `prepare` script patches tsserver. This requires the `typescript` package to be installed. This is another reason the hybrid path is the likely outcome.

7. **Biome is fully compatible** with tsgo since it has no dependency on the TypeScript compiler API.

8. **Turborepo + tsgo are complementary** -- the swap is a script-level change (`tsc` to `tsgo`), not a config-level change.

### Patterns Identified

- **Standard per-package pattern**: `"check": "tsc -b tsconfig.json"` and `"build-esm": "tsc -b tsconfig.build.json"`. A sed/find-replace across all package.json files could handle the mechanical swap.
- **Hybrid path is the likely outcome** due to ts-morph and effect-language-service dependencies.
- **Leaf-first testing strategy** is recommended: start with packages that have no downstream consumers (e.g., `@beep/types`, `@beep/constants`) to validate tsgo compatibility before touching core packages.

### Risks Confirmed

| Risk | Assessment |
|------|-----------|
| Effect type-checking | MEDIUM -- needs empirical testing |
| Declaration emit | HIGH -- project depends on it |
| JS emit | HIGH -- build pipeline depends on it |
| Decorator support | MEDIUM -- `emitDecoratorMetadata` is enabled |
| Non-standard flags | MEDIUM -- `rewriteRelativeImportExtensions`, `erasableSyntaxOnly` need testing |
| ts-morph compatibility | CERTAIN blocker for strict path |

### Decision

Proceed to P1 (Discovery) to inventory all actual tsc/typescript usage and empirically test tsgo on a leaf package.

### Methodology Notes

- Pre-seeded research was effective for understanding the landscape but cannot substitute for empirical testing on the actual codebase.
- The hybrid vs strict decision tree should be resolved empirically in P1, not assumed from documentation alone.
- The 0.4% type-checking discrepancy is a paper number; Effect's type-level sophistication could push the actual discrepancy higher for this specific project.

---

## P2 -- Planning (2026-02-10)

### What Was Done

Analyzed P1 Discovery Report to determine migration path, then produced a comprehensive migration plan at `outputs/P2_MIGRATION_PLAN.md`.

### Decision: CHECK-ONLY Path

Applied the decision tree from the orchestrator prompt:

1. tsgo emits JS + declarations for leaf package (@beep/types)? **YES**
2. tsgo emits JS + declarations for Effect-heavy package (@beep/schema)? **NO** — const type parameter parser bug in .d.ts files
3. Therefore: **CHECK-ONLY**

HYBRID and STRICT are blocked by:
- **HYBRID**: tsgo -b fails on ~54 of 57 packages due to const type param self-incompatibility
- **STRICT**: typescript package required for ts-morph, effect-language-service, analyze-jsdoc

### Key Planning Decisions

1. **Uniform change pattern**: 63 of 64 packages use identical `tsc -b tsconfig.json` → `tsgo --noEmit -p tsconfig.json` transformation. This enables batch execution via two sed commands instead of per-package edits.

2. **No tsconfig changes needed**: P1 confirmed ALL flags accepted by tsgo, overriding P0's concerns about `rewriteRelativeImportExtensions`, `erasableSyntaxOnly`, and `emitDecoratorMetadata`.

3. **Resolution strategy shift**: Changing from `-b` (build mode, project references, .d.ts resolution) to `--noEmit -p` (paths-based, .ts source resolution). This is acceptable because:
   - Build scripts still validate project reference integrity
   - `tsconfig-sync` tool maintains reference correctness
   - Paths in tsconfig.base.jsonc cover all @beep/* packages

4. **No packages excluded**: Unlike HYBRID, CHECK-ONLY allows ALL packages to participate because --noEmit never touches .d.ts files.

### P0 Predictions vs P1 Reality

| P0 Prediction | P1 Reality | Impact on Plan |
|---------------|-----------|----------------|
| `rewriteRelativeImportExtensions` may not be supported | Accepted | No tsconfig changes needed |
| `erasableSyntaxOnly` may not be supported | Accepted | No tsconfig changes needed |
| `emitDecoratorMetadata` will fail | Accepted (at parse time) | No tsconfig changes needed |
| Declaration emit partial | Confirmed — const type params break parser | Blocks HYBRID, CHECK-ONLY unaffected |
| JS emit not fully ported | Not tested (superseded by CHECK-ONLY decision) | N/A |
| HYBRID path recommended | CHECK-ONLY is the viable path | Build scripts stay on tsc |

### Risks Identified

- **--noEmit vs -b behavioral gap**: Different resolution strategies could surface or mask different errors. Mitigation: full acceptance gate testing.
- **@ts-expect-error inconsistencies**: Minor — fix case-by-case.
- **Developer confusion**: Document in PR that check = tsgo, build = tsc.

### Methodology Notes

- The batch execution strategy (two sed commands) dramatically simplifies Phase 3 execution compared to the originally envisioned per-package approach.
- P1's empirical testing was essential — the P0 research was wrong about several flag compatibility predictions.
- The const type parameter parser bug is a fundamental limitation that cleanly determines the migration path without ambiguity.

---

## P4 -- Validation (2026-02-10)

### What Was Done

Executed the full 5-gate acceptance suite against the `native-preview-experiment` branch after P3's migration of 63 packages from `tsc` to `tsgo` for type-checking.

### Verification Results

All 5 gates passed:
- `bun run build`: 65/65 tasks (7m58s)
- `bun run check`: 118/118 tasks (43.2s)
- `bun run lint:fix`: 64/64 tasks (8.68s)
- `bun run lint`: 125/125 tasks (55.4s)
- `bun run test`: 584 pass, 29 skip, 0 fail (28s)

Critical package regression tests (schema, shared-domain, iam-domain, testkit) all pass.

### What Worked Well

1. **CHECK-ONLY path was the right call.** The const type parameter parser bug is a clean, binary blocker. There's no ambiguity — `--noEmit` works, `-b` doesn't. The decision tree from P1 made P2 planning trivial.

2. **Batch execution strategy.** Changing `tsc -b tsconfig.json` → `tsgo --noEmit -p tsconfig.json` across 63 packages was a mechanical find-replace. The uniform script pattern across the monorepo made this a two-command operation instead of 63 manual edits.

3. **Turborepo cache integration.** tsgo check results are cached by Turborepo identically to tsc results. No pipeline changes needed. The turbo.json `check` task definition works unchanged.

4. **Full gate verification caught the todox exclusion.** Running the full check suite before committing identified that todox needed to stay on tsc due to TS2578 (unused @ts-expect-error) and TS2430 (stricter MUI theme generics).

### What Was Harder Than Expected

1. **tsgo's self-incompatibility was surprising.** tsgo can generate `.d.ts` files containing `<const Value>` syntax but cannot parse them back. This is a fundamental limitation that wasn't documented in the project's known issues at the time of P0 research. P1's empirical testing was essential to discover this.

2. **The `--noEmit` vs `-b` flag difference.** The migration isn't just swapping a binary name — it changes from build mode (project references, .d.ts resolution) to paths-based resolution (.ts source files). This is a subtle behavioral difference that could theoretically surface or mask different classes of errors. In practice, no issues were observed.

3. **todox MUI theme extensions.** todox uses `declare module "@mui/material/styles"` to extend Material-UI's theme type system. tsgo handles these module augmentations more strictly than tsc, rejecting some patterns that tsc accepts. This is a tsgo behavioral difference, not a bug.

### Patterns Reusable for Other Tooling Migrations

1. **Leaf-first empirical testing**: Test on the simplest package first (no dependencies), then the most complex (many Effect types). If both pass, the middle likely will too.

2. **Decision tree with binary blockers**: Frame the migration path as a decision tree where each question has a clear YES/NO answer from empirical testing. This eliminates analysis paralysis.

3. **Batch execution for uniform patterns**: When all packages follow the same script convention, batch sed/find-replace is faster and more reliable than per-package edits. The uniform `"check": "tsc -b tsconfig.json"` pattern across 63 packages was key.

4. **Exclusion with documentation**: When a package can't be migrated, document WHY with specific error codes (TS2578, TS2430) so future revisits can check whether the blocker has been resolved.

5. **Full gate verification as acceptance**: Running all 5 gates (build, check, lint:fix, lint, test) provides high confidence that the migration doesn't regress any behavior. The gates are independent — lint uses Biome (no compiler dependency), tests exercise runtime behavior.

### tsgo Behavioral Differences Observed

| Behavior | tsc | tsgo | Impact |
|----------|-----|------|--------|
| Const type parameter in `.d.ts` | Parses correctly | TS1389 parser error | Blocks HYBRID/STRICT |
| Unused `@ts-expect-error` | Silently ignores | TS2578 error | Requires exclusion or directive removal |
| MUI theme module augmentation | Accepts broader patterns | TS2430 stricter constraints | todox excluded |
| All tsconfig flags in base config | Accepted | Accepted | No config changes needed |
| `--noEmit -p` resolution | Uses .ts sources via paths | Same behavior | CHECK-ONLY viable |

### Methodology Notes

- The 4-phase approach (P0 Research → P1 Discovery → P2 Planning → P3 Implementation → P4 Validation) was effective. Each phase produced a specific artifact that informed the next.
- P0's predictions were partially wrong (flag compatibility was better than expected, but declaration emit was worse). This validates the empirical-testing-first approach of P1.
- The spec structure with outputs/ directory kept artifacts organized and reviewable.
- Total execution time across all phases: ~2 hours of agent work, mostly in P3 (batch migration) and P4 (full gate verification).
