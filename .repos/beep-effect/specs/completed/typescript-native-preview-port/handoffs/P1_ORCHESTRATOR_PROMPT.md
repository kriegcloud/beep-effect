# Phase 1 Orchestrator Prompt: Discovery

Copy-paste this prompt to start Phase 1 (Research/Discovery).

---

## Prompt

You are executing Phase 1 (Discovery) of the TypeScript Native Preview Port spec for the `beep-effect` monorepo. You are working on branch `native-preview-experiment`.

### Context

This is a Bun-managed monorepo (50+ packages) that currently uses `tsc` (TypeScript 5.9.3) for type-checking and building. We want to migrate to `tsgo` (`@typescript/native-preview`) -- a Go-based rewrite of the TypeScript compiler that is 7-10x faster. Pre-seeded research is available at `specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md`.

The monorepo uses:
- **Bun 1.3.x** as runtime and package manager
- **Turborepo** for task orchestration
- **Effect 3** with advanced type-level programming (branded types, HKTs, generic layers)
- **Project references** with `composite: true` across 50+ packages
- **`tsc -b`** for both type-checking (`check` scripts) and JS+declaration emit (`build-esm` scripts)
- **ts-morph** in `tooling/cli` (runtime dependency on TypeScript JS API)
- **`effect-language-service patch`** in root `prepare` script (patches tsserver)
- **Biome** for linting (no TypeScript API dependency)

The standard per-package pattern is:
```json
{
  "build-esm": "tsc -b tsconfig.build.json",
  "check": "tsc -b tsconfig.json",
  "dev": "tsc -b tsconfig.build.json --watch"
}
```

Key tsconfig flags that may be problematic for tsgo:
- `rewriteRelativeImportExtensions: true`
- `erasableSyntaxOnly: true`
- `emitDecoratorMetadata: true`
- `experimentalDecorators: true`
- `declarationMap: true`

### Your Mission

Produce a comprehensive discovery report. You must complete ALL of the following tasks:

**Task 1: Install @typescript/native-preview**

```bash
bun add -D @typescript/native-preview
npx tsgo --version
```

Record the installed version.

**Task 2: Inventory ALL tsc invocations**

Search every `package.json` in the repo for scripts that invoke `tsc`:

```bash
grep -rn '"tsc ' packages/*/package.json
grep -rn '"tsc ' apps/*/package.json
grep -rn '"tsc ' tooling/*/package.json
grep -rn '"tsc ' scratchpad/*/package.json
grep -rn 'tsc' package.json
```

Create a complete list with: package name, script name, exact tsc command.

**Task 3: Inventory ALL TypeScript JS API consumers**

Find every file that imports `typescript` as a module or uses `ts-morph`:

```bash
grep -rn "from ['\"]typescript['\"]" packages/ apps/ tooling/ --include="*.ts" --include="*.js"
grep -rn "require(['\"]typescript['\"])" packages/ apps/ tooling/ --include="*.ts" --include="*.js"
grep -rn "from ['\"]ts-morph['\"]" packages/ apps/ tooling/ --include="*.ts" --include="*.js"
grep -rn "effect-language-service" package.json
```

For each consumer, record: file path, import type (runtime vs type-only), purpose, and whether it blocks removing the `typescript` package.

**Task 4: Test tsgo flag compatibility**

Test whether tsgo accepts the project's tsconfig:

```bash
# Test type-checking with base config on a small set of files
npx tsgo --noEmit -p packages/common/types/tsconfig.json 2>&1
```

If tsgo rejects any flags, record the exact error messages.

Also test these specific flags by creating a minimal tsconfig that uses them:

```bash
# Test with the full base config
npx tsgo -b packages/common/types/tsconfig.json 2>&1
```

Record: which flags are accepted, which are rejected, and what the error messages say.

**Task 5: Test tsgo on a leaf package (type-check only)**

```bash
# @beep/types - type-only package, zero runtime, simplest possible test
cd packages/common/types
npx tsgo -b tsconfig.json 2>&1
echo "Exit code: $?"
```

Compare with tsc:

```bash
npx tsc -b tsconfig.json 2>&1
echo "Exit code: $?"
```

Record: same errors? Different errors? Any errors at all?

**Task 6: Test tsgo build/emit on a leaf package**

```bash
cd packages/common/types
# Clean previous build artifacts
rm -rf build/
npx tsgo -b tsconfig.build.json 2>&1
echo "Exit code: $?"
ls -la build/esm/ 2>/dev/null
```

Record: did it emit JS files? Did it emit .d.ts files? Did it emit source maps?

**Task 7: Test tsgo on an Effect-heavy package**

```bash
cd packages/common/schema
npx tsgo -b tsconfig.json 2>&1
echo "Exit code: $?"
```

And compare:

```bash
npx tsc -b tsconfig.json 2>&1
echo "Exit code: $?"
```

Record: any discrepancies in error output? Effect types causing issues?

**Task 8: Feasibility assessment**

Based on tasks 1-7, determine which migration path is feasible:

- **STRICT**: tsgo can replace tsc everywhere. `typescript` package can be removed.
- **HYBRID**: tsgo can replace tsc for build+check. `typescript` must remain for JS API consumers (ts-morph, effect-language-service).
- **CHECK-ONLY**: tsgo can only handle type-checking (--noEmit). tsc must remain for JS+declaration emit.
- **NOT FEASIBLE**: tsgo cannot reliably type-check this project due to fundamental incompatibilities.

### Output

Write your findings to `specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md` with the following structure:

```markdown
# P1 Discovery Report

## tsgo Installation
- Version installed: ...
- Binary path: ...

## tsc Invocation Inventory
| Package | Script | Command |
|---------|--------|---------|
| ... | ... | ... |

## TypeScript JS API Consumers
| File | Import | Purpose | Blocks Strict? |
|------|--------|---------|---------------|
| ... | ... | ... | ... |

## Flag Compatibility
| Flag | Accepted? | Error (if rejected) |
|------|-----------|-------------------|
| ... | ... | ... |

## Leaf Package Test (@beep/types)
- Type-check result: ...
- Build/emit result: ...
- Comparison with tsc: ...

## Effect Package Test (@beep/schema)
- Type-check result: ...
- Comparison with tsc: ...
- Discrepancies: ...

## Feasibility Assessment
- Recommended path: STRICT / HYBRID / CHECK-ONLY / NOT FEASIBLE
- Rationale: ...
- Blockers: ...
- Risks: ...
```

### Verification

Before considering P1 complete, verify:

```bash
# The report file exists and is non-empty
wc -l specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md

# tsgo is installed
npx tsgo --version
```

### Success Criteria

- [ ] `@typescript/native-preview` installed and version recorded
- [ ] Complete inventory of all `tsc` invocations (every package.json)
- [ ] Complete inventory of all TypeScript JS API consumers
- [ ] Flag compatibility tested and documented
- [ ] Leaf package tested with tsgo (type-check + build)
- [ ] Effect-heavy package tested with tsgo (type-check)
- [ ] Feasibility assessment written with clear recommendation
- [ ] `outputs/P1_DISCOVERY_REPORT.md` created and complete

### Reference Files

- Research summary: `specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md`
- Root tsconfig: `tsconfig.base.jsonc`
- Build tsconfig: `tsconfig.build.json`
- Check tsconfig: `tsconfig.json`
- Example package.json: `packages/common/types/package.json`
- ts-morph usage: `tooling/cli/src/commands/create-slice/utils/ts-morph.ts`
- Root package.json: `package.json` (see `prepare` script)

### Next Phase

After completing Phase 1, the next agent session will use these findings to create a detailed migration plan (Phase 2). Your discovery report is the primary input to that planning phase.
