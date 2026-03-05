# Spell Checking & Documentation Quality

## Current State in This Repo

Based on the [audit](../00-current-state-audit.md):

- **Spell checking**: None. Listed as "Not present" in the audit summary table.
- **Markdown linting**: None. Biome formats `.md` files (via lefthook pre-commit) but does not lint markdown structure/content. Biome's markdown lint support is on their 2025/2026 roadmap but has no ETA ([Biome Roadmap 2026](https://biomejs.dev/blog/roadmap-2026/)).
- **JSDoc linting**: Well-configured via `eslint-plugin-jsdoc` v62.7.0 in `eslint.config.mjs`. Covers `tooling/*/src/**/*.ts` with custom `@category` tag enforcement, description quality checks (20-char minimum), and barrel file `@packageDocumentation` requirements.
- **API documentation**: `@effect/docgen` (PR build from `e7fe055`) generates docs per package. Each package has a `docgen.json` config. Turborepo `docgen` task is cached.
- **README checking**: None. No enforcement of required sections or structure.
- **Custom dictionaries**: N/A (no spell checker installed).

### Effect-TS Vocabulary Gap

This repo uses domain-specific terms that any spell checker will flag as false positives without a custom dictionary:

**Effect core**: `Effect`, `Layer`, `Schema`, `Fiber`, `Runtime`, `Scope`, `Context`, `Ref`, `Deferred`, `Queue`, `PubSub`, `Stream`, `Sink`, `Channel`, `Schedule`, `Cause`, `Exit`, `FiberId`, `FiberRef`, `FiberRefs`, `Supervisor`, `STM`, `TRef`, `TMap`, `TSet`, `TQueue`, `TPriorityQueue`, `HashMap`, `HashSet`, `MutableHashMap`, `MutableHashSet`, `Chunk`, `Duration`, `DateTime`, `Cron`, `Redacted`, `Predicate`, `Pipeable`, `Inspectable`, `Equivalence`, `Differ`, `SortedMap`, `SortedSet`, `MutableList`, `MutableRef`

**Effect patterns**: `pipe`, `yield`, `gen`, `fn`, `andThen`, `flatMap`, `mapError`, `catchTag`, `catchTags`, `orElse`, `orElseSucceed`, `orDie`, `tapError`, `acquireRelease`, `acquireUseRelease`, `scoped`, `provide`, `provideService`, `provideMerge`, `mergeAll`, `zipWith`, `forEach`, `unfold`, `fromIterable`, `toIterable`

**Effect Schema**: `TaggedErrorClass`, `TaggedClass`, `TaggedRequest`, `decodeUnknown`, `decodeUnknownSync`, `decodeUnknownEffect`, `encodeUnknown`, `annotate`, `annotateKey`, `optionalKey`, `fromJsonString`, `NonEmptyTrimmedString`, `Redacted`, `ULID`, `UUID`

**Effect platform/CLI**: `NodeFileSystem`, `NodePath`, `ChildProcessSpawner`, `BunFileSystem`, `BunPath`, `FileSystem`, `Terminal`

**Repo-specific**: `beep`, `docgen`, `tstyche`, `dtslint`, `syncpack`, `lefthook`, `bunfig`, `turborepo`, `turbo`, `vitest`, `biome`, `knip`, `madge`, `changeset`, `changesets`, `monorepo`, `pgvector`

---

## Recommendations

### 1. Spell Checking

#### typos-cli (via typos-rs-npm)
- **What**: Rust-native source code spell checker using a curated corrections list (not a dictionary)
- **Why**: Zero-config baseline spell checking for CI. Catches real typos in code, comments, docs, and filenames with almost no false positives. The repo currently has zero spell checking.
- **Type**: New tool
- **Maturity**: Stable (v1.43+, widely adopted by Rust ecosystem, vLLM, and many large projects)
- **Effort**: Low (< 1hr) -- install, create `_typos.toml` with Effect terms, add to lefthook/CI
- **Priority**: P0 (must-have) -- the repo has zero spell checking today; this is the lowest-friction starting point
- **Bun compatible**: Yes (via [typos-rs-npm](https://github.com/dalisoft/typos-rs-npm) wrapper: `bun add -D typos-rs-npm`)
- **Pros**:
  - Extremely fast (8s on moderate repos; compiled Rust binary, not Node.js)
  - Near-zero false positives by design (corrections list, not dictionary)
  - Handles camelCase, snake_case, SCREAMING_CASE identifier splitting
  - Ignores emails, URLs, hex, UUIDs, base64 automatically
  - Respects `.gitignore`
  - Can auto-fix with `typos -w`
  - GitHub Action available for CI
  - Dual licensed MIT/Apache-2.0
  - JSON output for tooling integration
- **Cons**:
  - Intentionally has false negatives (only catches known misspellings, not unknown words)
  - No custom dictionary in the traditional sense (only corrections mapping and word allowlists)
  - Less granular language/file-type configuration than cspell
  - npm wrapper is community-maintained, not official
- **Conflicts with**: Nothing (complementary to cspell if both are desired)
- **Config snippet**:
```toml
# _typos.toml
[files]
extend-exclude = [
  ".repos/",
  "node_modules/",
  "dist/",
  "*.lock",
  "bun.lock",
]

[default.extend-identifiers]
# Effect-TS terms that are valid identifiers
HashMap = "HashMap"
HashSet = "HashSet"
MutableHashMap = "MutableHashMap"
flatMap = "flatMap"
mapError = "mapError"
catchTag = "catchTag"
orElse = "orElse"
tapError = "tapError"
andThen = "andThen"

[default.extend-words]
# Domain terms
beep = "beep"
docgen = "docgen"
tstyche = "tstyche"
dtslint = "dtslint"
syncpack = "syncpack"
lefthook = "lefthook"
bunfig = "bunfig"
turborepo = "turborepo"
turbo = "turbo"
vitest = "vitest"
biome = "biome"
pgvector = "pgvector"
monorepo = "monorepo"
```

---

#### cspell
- **What**: Dictionary-based spell checker for code with extensive language/file-type support
- **Why**: Comprehensive spell checking that catches unknown words (not just known typos). Fills the false-negative gap that typos-cli intentionally leaves.
- **Type**: New tool
- **Maturity**: Stable (v9.6+, 4M+ weekly npm downloads, used by Angular, TypeScript compiler, many large monorepos)
- **Effort**: Medium (1-4hr) -- needs custom Effect-TS dictionary, per-package overrides, tuning to reduce false positives
- **Priority**: P1 (high value) -- adds comprehensive coverage on top of typos-cli's quick wins
- **Bun compatible**: Yes (`bun add -D cspell`, `bunx cspell`)
- **Pros**:
  - True dictionary-based checking catches unknown/misspelled words (not just known typos)
  - Built-in TypeScript dictionary (`@cspell/dict-typescript`)
  - Hierarchical config: root `cspell.json` + per-package overrides
  - Supports custom dictionaries via `.txt` word lists
  - VS Code extension for inline feedback
  - Mature monorepo support with glob-based overrides
  - Can check specific file types differently
  - Active maintenance, large community
- **Cons**:
  - Slower than typos (Node.js vs compiled Rust) -- seconds vs milliseconds on large repos
  - Requires significant initial dictionary tuning for Effect-TS vocabulary
  - More false positives out of the box (dictionary-based approach)
  - Heavier dependency footprint
- **Conflicts with**: Nothing (complementary to typos-cli; run typos in pre-commit for speed, cspell in CI for depth)
- **Config snippet**:
```jsonc
// cspell.json
{
  "version": "0.2",
  "language": "en",
  "dictionaries": ["typescript", "node", "npm", "effect-ts"],
  "dictionaryDefinitions": [
    {
      "name": "effect-ts",
      "path": "./dict/effect-ts.txt",
      "addWords": true
    }
  ],
  "ignorePaths": [
    ".repos/",
    "node_modules/",
    "dist/",
    "*.lock",
    "bun.lock"
  ],
  "overrides": [
    {
      "filename": "**/*.md",
      "dictionaries": ["en-gb"]
    }
  ]
}
```

---

#### codespell
- **What**: Python-based spell checker using a corrections list (similar approach to typos)
- **Why**: Alternative to typos-cli, but with a larger corrections database
- **Type**: New tool (alternative to typos)
- **Maturity**: Stable (widely used in Python ecosystem)
- **Effort**: Low (< 1hr)
- **Priority**: P2 (nice to have) -- typos-cli is faster and has better code-awareness
- **Bun compatible**: No (Python-only; requires `pip install codespell` or system package)
- **Pros**:
  - Larger corrections list (10x more entries than typos)
  - Well-established in open source
  - Simple to run
- **Cons**:
  - Python dependency in a TypeScript/Bun project (friction)
  - Slower than typos (Python vs Rust)
  - Does not handle camelCase/snake_case splitting as well as typos
  - No npm package; requires separate Python toolchain
  - GPLv2 license (more restrictive than typos MIT/Apache)
  - Despite larger list, empirically catches fewer real typos than typos on TS codebases
- **Conflicts with**: Overlaps with typos-cli (choose one or the other for the corrections-list approach)
- **Config snippet**:
```bash
# Not recommended for this repo -- prefer typos-cli
codespell --skip=".repos,node_modules,dist,*.lock" --ignore-words-list="beep,docgen,vitest"
```

---

### 2. Markdown Linting

#### markdownlint-cli2
- **What**: Fast, configuration-based CLI for linting Markdown files with the markdownlint library
- **Why**: The repo has no markdown quality enforcement. README files, changelogs, and spec documents have inconsistent formatting. Biome formats `.md` but does not lint structure.
- **Type**: New tool
- **Maturity**: Stable (v0.17+, used by GitLab, Azure DevOps docs, many major projects)
- **Effort**: Low (< 1hr) -- install, create `.markdownlint-cli2.jsonc`, add to lint script
- **Priority**: P1 (high value) -- enforces consistent markdown across specs/, README files, changelogs
- **Bun compatible**: Yes (`bun add -D markdownlint-cli2`, `bunx markdownlint-cli2`)
- **Pros**:
  - Very fast (async execution, designed for large file sets)
  - Simple JSON/YAML/JS config, cascading through directory tree
  - 50+ built-in rules covering headings, lists, links, code blocks, line length
  - Dedicated GitHub Action (`markdownlint-cli2-action`)
  - Good VS Code extension support
  - Fix mode (`--fix`) for auto-correction
  - Simpler config model than remark-lint
- **Cons**:
  - Does not support `.mdx` files (not a concern for this repo currently)
  - Less extensible than remark-lint (no AST plugin system)
  - Cannot transform/rewrite markdown (lint-only, not a full pipeline)
- **Conflicts with**: Biome markdown formatting (coordinate line-length rules; Biome formats, markdownlint lints structure)
- **Config snippet**:
```jsonc
// .markdownlint-cli2.jsonc
{
  "config": {
    "default": true,
    "MD013": { "line_length": 120 },  // match Biome line width
    "MD033": false,  // allow inline HTML (common in docs)
    "MD041": true,   // first line must be top-level heading
    "MD024": { "siblings_only": true }  // allow duplicate headings in different sections
  },
  "globs": [
    "**/*.md",
    "!.repos/**",
    "!node_modules/**",
    "!dist/**"
  ]
}
```

---

#### remark-lint
- **What**: Plugin-based markdown linter built on the unified/remark AST pipeline
- **Why**: Alternative to markdownlint with deeper extensibility and MDX support
- **Type**: New tool (alternative to markdownlint-cli2)
- **Maturity**: Stable (part of unified ecosystem, ~70 plugins)
- **Effort**: Medium (1-4hr) -- more complex setup with plugin configuration
- **Priority**: P2 (nice to have) -- markdownlint-cli2 covers the same ground with less setup
- **Bun compatible**: Yes (`bun add -D remark-cli remark-lint remark-preset-lint-recommended`)
- **Pros**:
  - Full AST-based analysis (can write custom plugins)
  - Supports `.mdx` files natively
  - Part of unified ecosystem (remark, rehype, retext)
  - Can transform/rewrite markdown, not just lint
  - More precise rule behavior through AST manipulation
- **Cons**:
  - Slower than markdownlint-cli2 (AST parsing overhead)
  - More complex configuration (plugin composition)
  - Steeper learning curve
  - Comparison doc between remark-lint and markdownlint is self-admittedly outdated
  - Heavier dependency tree
- **Conflicts with**: markdownlint-cli2 (choose one)
- **Config snippet**:
```json
// .remarkrc.json
{
  "plugins": [
    "remark-preset-lint-recommended",
    "remark-preset-lint-consistent",
    ["remark-lint-maximum-line-length", 120]
  ]
}
```

---

### 3. JSDoc & Documentation Quality

#### eslint-plugin-jsdoc (existing -- config improvements)
- **What**: Upgrade the existing ESLint JSDoc config to cover more rules and expand scope
- **Why**: The current config is well-structured but has gaps: only covers `tooling/*/src/**/*.ts`, missing `packages/*/src/**/*.ts` when those packages exist. Several useful rules are not enabled.
- **Type**: Config upgrade
- **Maturity**: Stable (v62.7.0 already in use)
- **Effort**: Low (< 1hr) -- add missing rules, extend file scope
- **Priority**: P1 (high value) -- quick wins from existing tooling
- **Bun compatible**: Yes (already installed)
- **Pros**:
  - Already configured and working
  - No new dependencies
  - Rules like `jsdoc/require-example`, `jsdoc/require-since`, `jsdoc/check-examples` add value
  - `recommended-typescript-error` preset available for stricter enforcement
- **Cons**:
  - ESLint is slower than Biome (but scoped narrowly, so acceptable)
  - Some rules overlap with `@effect/docgen` enforcement
- **Conflicts with**: Nothing
- **Config snippet** (additions to existing config):
```js
// Additional rules to enable in eslint.config.mjs
"jsdoc/require-since": "warn",           // enforce @since tags (docgen needs these)
"jsdoc/require-example": "off",          // enable later when ready
"jsdoc/check-line-alignment": "warn",    // consistent tag alignment
"jsdoc/no-bad-blocks": "error",          // catch malformed JSDoc blocks
"jsdoc/require-asterisk-prefix": "warn", // consistent * prefix
"jsdoc/require-hyphen-before-param-description": ["warn", "always"],
```

---

#### Biome JSDoc gaps (context note)
- **What**: Biome does not lint JSDoc content -- only ESLint does this in the repo
- **Why**: Understanding this gap prevents accidentally removing ESLint thinking Biome covers it
- **Type**: N/A (informational)
- **Details**: Biome 2.x has no JSDoc-specific lint rules. The `eslint-plugin-jsdoc` setup is the sole guardian of documentation quality for TypeScript code. Biome's `noUnusedVariables` is off (handled by TS), and it has no equivalent to `require-jsdoc`, `informative-docs`, `match-description`, or any tag validation. ESLint must stay for JSDoc enforcement even as Biome replaces other ESLint categories.

---

### 4. API Documentation Generation

#### @effect/docgen (existing -- keep and enhance)
- **What**: Effect-TS's own documentation generator, purpose-built for Effect projects
- **Why**: Already integrated, understands Effect patterns, enforces `@since` tags, type-checks examples
- **Type**: Existing tool (keep)
- **Maturity**: Growing (PR build, actively developed by Effect-TS team)
- **Effort**: N/A (already configured)
- **Priority**: P0 (must-have) -- already the right tool for this repo
- **Bun compatible**: Yes (already in use via `bunx turbo run docgen`)
- **Pros**:
  - Zero-config for Effect projects (uses `docgen.json` per package)
  - Type-checks code examples in JSDoc comments
  - Enforces `@since` version tags
  - Generates markdown docs from source
  - Built specifically for the Effect ecosystem
- **Cons**:
  - Not on npm registry (installed from PR build URL)
  - Less feature-rich than TypeDoc for non-Effect projects
  - Limited customization compared to TypeDoc
- **Conflicts with**: TypeDoc (choose one; docgen is the right choice here)
- **Config snippet**: Already configured in `tooling/*/docgen.json`

---

#### TypeDoc (alternative -- not recommended)
- **What**: General-purpose TypeScript API documentation generator
- **Why**: Considered as an alternative to @effect/docgen but not recommended for this repo
- **Type**: Alternative (not recommended)
- **Maturity**: Stable (v0.27+, industry standard)
- **Effort**: High (4hr+) -- would need significant custom theme and plugin work for Effect patterns
- **Priority**: P2 (nice to have) -- only if leaving the Effect ecosystem
- **Bun compatible**: Yes
- **Pros**:
  - Industry standard, huge ecosystem
  - Rich HTML output with search, navigation
  - Plugin system for customization
  - Understands full TypeScript type system via compiler API
- **Cons**:
  - Does not understand Effect-specific patterns (Layer, Service, pipe chains)
  - No built-in example type-checking
  - Would require custom plugin for `@since`, `@category`, `@domain` tags
  - Replacing working @effect/docgen setup would be regression
- **Conflicts with**: @effect/docgen (mutually exclusive)

---

### 5. README Completeness Checking

#### standard-readme (lint mode)
- **What**: CLI tool that lints README files against a structured specification
- **Why**: The monorepo has multiple packages, each needing consistent README structure (description, install, usage, API, license). Currently no enforcement.
- **Type**: New tool
- **Maturity**: Stable (well-established spec, modest adoption)
- **Effort**: Low (< 1hr) -- install, configure required sections
- **Priority**: P2 (nice to have) -- useful but not critical until packages are published
- **Bun compatible**: Yes (`bun add -D standard-readme`)
- **Pros**:
  - Enforces required sections (install, usage, contributing, license)
  - Checks heading order and structure
  - Ensures top-level heading matches package name
  - Good for monorepo consistency across packages
- **Cons**:
  - Opinionated section naming (may not match Effect ecosystem conventions)
  - Less flexible than markdownlint for general markdown quality
  - Small community, infrequent updates
  - Only checks README files, not other markdown
- **Conflicts with**: Nothing (complementary to markdownlint-cli2)
- **Config snippet**:
```bash
# Run in CI or as turbo task
bunx standard-readme lint tooling/*/README.md packages/*/README.md
```

---

#### Custom markdownlint rules for README sections
- **What**: Use markdownlint-cli2 with custom rules to enforce README section presence
- **Why**: More flexible than standard-readme, integrates with the already-recommended markdownlint setup
- **Type**: Config addition (to markdownlint-cli2)
- **Maturity**: Stable (custom rules are a supported markdownlint feature)
- **Effort**: Medium (1-4hr) -- write custom rule or script
- **Priority**: P2 (nice to have)
- **Bun compatible**: Yes
- **Pros**:
  - Single tool for all markdown linting + README checking
  - Fully customizable section requirements
  - No additional dependency
- **Cons**:
  - Requires writing a custom markdownlint plugin or wrapper script
  - More maintenance than a dedicated tool
- **Conflicts with**: Nothing

---

### 6. Integrated Spell Check + Lint Pipeline

#### Recommended pipeline for this repo

**Pre-commit (fast, via lefthook)**:
1. `typos` -- instant spell check on staged files (< 1s)
2. `biome check` -- format + lint (existing)
3. `eslint --jsdoc` -- JSDoc quality (existing)

**CI (comprehensive)**:
1. `typos` -- full repo spell check
2. `cspell` -- dictionary-based spell check (catches what typos misses)
3. `markdownlint-cli2` -- markdown structure/quality
4. `turbo run docgen` -- API docs generation + example validation (existing)
5. `eslint` -- JSDoc enforcement (existing)

**Config snippet** (lefthook addition):
```yaml
# lefthook.yml additions
pre-commit:
  commands:
    typos:
      glob: "*.{ts,tsx,js,jsx,json,md,yaml,yml,toml}"
      run: bunx typos {staged_files}
      stage_fixed: true
```

**Config snippet** (turbo task):
```jsonc
// turbo.json addition
{
  "spellcheck": {
    "inputs": ["**/*.ts", "**/*.md", "**/*.json"],
    "cache": true,
    "dependsOn": []
  }
}
```

---

## Summary Table

| Tool | Type | Priority | Effort | Bun | Recommendation |
|------|------|----------|--------|-----|----------------|
| typos-cli | New | P0 | Low | Yes | Install immediately -- zero-config baseline |
| cspell | New | P1 | Medium | Yes | Add for comprehensive dictionary checking in CI |
| markdownlint-cli2 | New | P1 | Low | Yes | Add for markdown quality across specs/README |
| eslint-plugin-jsdoc upgrades | Config | P1 | Low | Yes | Enable additional rules in existing config |
| @effect/docgen | Existing | P0 | N/A | Yes | Keep -- already the right tool |
| standard-readme | New | P2 | Low | Yes | Add when packages are published |
| codespell | New | P2 | Low | No | Skip -- typos-cli is superior for this repo |
| remark-lint | New | P2 | Medium | Yes | Skip -- markdownlint-cli2 is simpler |
| TypeDoc | Alternative | P2 | High | Yes | Skip -- @effect/docgen is purpose-built |

## Sources

- [typos-cli (crate-ci/typos)](https://github.com/crate-ci/typos)
- [typos-rs-npm wrapper](https://github.com/dalisoft/typos-rs-npm)
- [cspell](https://github.com/streetsidesoftware/cspell) | [cspell.org](https://cspell.org/)
- [@cspell/dict-typescript](https://www.npmjs.com/package/@cspell/dict-typescript)
- [codespell](https://github.com/codespell-project/codespell)
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
- [remark-lint](https://github.com/remarkjs/remark-lint) | [comparison to markdownlint](https://github.com/remarkjs/remark-lint/blob/main/doc/comparison-to-markdownlint.md)
- [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc)
- [@effect/docgen](https://github.com/Effect-TS/docgen)
- [TypeDoc](https://typedoc.org/)
- [standard-readme](https://github.com/RichardLitt/standard-readme)
- [Biome 2025 Roadmap](https://biomejs.dev/blog/roadmap-2025/) | [Biome 2026 Roadmap](https://biomejs.dev/blog/roadmap-2026/)
- [Survey of Code Spell Checking](https://blopker.com/writing/09-survey-of-the-current-state-of-code-spell-checking/)
- [Spell-checking code using Typos](https://ricostacruz.com/posts/spell-checking-using-typos)
- [vLLM: codespell to typos migration PR](https://github.com/vllm-project/vllm/pull/18711)
