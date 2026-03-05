# Spell Checking & Docs Quality

## Current State
- No dedicated spell-check tooling is configured in root scripts.
- No Markdown lint tool is configured.
- JSDoc linting exists via ESLint (`lint:jsdoc`) but is separate from Biome.
- API doc generation exists (`docgen`) and uses Effect-oriented tooling, but there is no unified docs quality gate that covers spelling + markdown style + JSDoc consistency.
- Current quality: `needs tuning`.

## Recommendations

### cspell (Primary Spell Checker)
- What: Add `cspell` with a repo dictionary tuned for Effect-TS, domain language, package names, and internal terminology.
- Why: This monorepo has many framework/domain-specific identifiers that generic spell-checkers misclassify without custom dictionary support.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Strong dictionaries, markdown/code support, per-path ignore patterns.
- Cons: Node-based CLI; slower than typo-focused binaries on very large repos.
- Conflicts with: None.
- Config snippet:
```json
{
  "version": "0.2",
  "language": "en",
  "words": [
    "EffectTS",
    "effectful",
    "turborepo",
    "shadcn",
    "pgvector",
    "XState",
    "betterauth"
  ],
  "ignorePaths": ["bun.lock", "dist", "coverage", ".repos"]
}
```

### typos-cli (Fast Pre-commit Typos Gate)
- What: Use `typos-cli` as a fast typo scanner for changed files in hooks/CI.
- Why: It is significantly faster for short feedback loops and catches obvious token-level mistakes with low setup.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P2 (nice to have)
- Bun compatible: Yes
- Pros: Very fast binary, excellent hook ergonomics.
- Cons: Less context-aware than cspell for docs prose and domain dictionaries.
- Conflicts with: Can duplicate findings from cspell if both run on full repo.
- Config snippet:
```toml
[default]
extend-ignore-identifiers-re = ["[A-Z]{2,}"]
exclude = ["bun.lock", ".repos", "dist", "coverage"]
```

### markdownlint-cli2 (Docs Style Baseline)
- What: Add `markdownlint-cli2` with a pragmatic rule set for specs and AI instruction docs.
- Why: The repo has many process/spec docs; consistent markdown style improves review readability and AI-tool parsing.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Widely adopted, easy CI integration, configurable per-folder.
- Cons: Node runtime required.
- Conflicts with: Potential overlap with remark-lint if both enabled broadly.
- Config snippet:
```json
{
  "MD013": false,
  "MD033": false,
  "MD041": false,
  "MD046": { "style": "fenced" }
}
```

### remark-lint (Optional Semantic Markdown Layer)
- What: Use `remark-lint` only if you need AST-level markdown semantics beyond markdownlint rule coverage.
- Why: Useful for stricter documentation governance, but not required if markdownlint-cli2 already satisfies standards.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Partial
- Pros: AST-based rule ecosystem; richer custom rule authoring.
- Cons: More config and maintenance overhead than markdownlint-cli2.
- Conflicts with: markdownlint-cli2 rule duplication.
- Config snippet:
```json
{
  "plugins": ["remark-lint", "remark-preset-lint-consistent"]
}
```

### JSDoc Policy Consolidation (ESLint Gap-Only)
- What: Keep `eslint-plugin-jsdoc` but narrow it to JSDoc policy files/rules only.
- Why: Biome does not fully replace advanced JSDoc policy enforcement; this keeps coverage while minimizing lint overlap.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Retains rich JSDoc checks without reintroducing broad ESLint complexity.
- Cons: Additional Node-based lint path remains.
- Conflicts with: None if scoped to docs/JSDoc rules.
- Config snippet:
```json
{
  "scripts": {
    "lint:docs": "eslint --config eslint.config.mjs --ext .ts,.tsx packages tooling"
  }
}
```

### API Docs Pipeline Split (TypeDoc + Effect Docgen)
- What: Use TypeDoc for general TypeScript API docs and keep Effect docgen where Effect-specific rendering is required.
- Why: The repo mixes general TS modules and Effect-centric packages; one generator may not be optimal for all output types.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Partial
- Pros: Better docs quality per package type; clearer contributor expectations.
- Cons: Two docs toolchains to maintain.
- Conflicts with: None if package-scoped.
- Config snippet:
```json
{
  "scripts": {
    "docgen": "bunx turbo run docgen",
    "docgen:typedoc": "typedoc --options tsdoc.json"
  }
}
```

## Head-to-Head Notes
- `cspell` vs `typos-cli` vs `codespell`:
  - `cspell`: best for domain dictionaries and markdown/code prose quality.
  - `typos-cli`: best for very fast typo scanning in hooks.
  - `codespell`: Python-based and less ergonomic in Bun-first monorepos.
- Recommendation: `cspell` as baseline + optional `typos-cli` for staged-file speed; skip `codespell` here.
