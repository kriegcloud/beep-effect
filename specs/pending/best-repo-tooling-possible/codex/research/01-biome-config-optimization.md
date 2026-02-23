# Biome Config Optimization

## Current State
- `biome.jsonc` is already strong: Biome schema `2.4.4`, formatter/linter enabled, import organization enabled, targeted overrides for tests/tooling, and robust excludes.
- Current quality: `needs tuning` (not outdated).
- Main gaps from audit:
  - No explicit statement of full CSS/GraphQL lint/format coverage policy.
  - Import sorting behavior is enabled, but grouping semantics are not explicitly documented for this repo.
  - Some lint surface still depends on ESLint (`lint:jsdoc` path and pre-commit ESLint invocation), so Biome is not the sole quality gate.

## Recommendations

### Biome Language Surface Completion (CSS, GraphQL, JSONC)
- What: Expand Biome file coverage and parser/linter expectations for `.css`, `.graphql/.gql`, and `.jsonc` as first-class checked assets.
- Why: Repo uses Next.js + Tailwind + config-heavy monorepo files, and Biome v2 supports these formats; enabling explicit coverage prevents style/lint blind spots.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Single toolchain for formatting/linting across code + config + styling; lower contributor friction.
- Cons: May initially surface a large batch of legacy formatting/lint diffs.
- Conflicts with: Existing CSS/GraphQL formatters if added later.
- Config snippet:
```jsonc
{
  "files": {
    "includes": [
      "**/*.{ts,tsx,js,mjs,cjs,json,jsonc,css,graphql,gql}"
    ]
  },
  "json": { "parser": { "allowComments": true } }
}
```

### Biome Rule Baseline Hardening Pass
- What: Run a one-time strictness pass to identify additional rules that can move from `warn` to `error` and reduce broad overrides.
- Why: The current config is good but still permissive in test/tooling zones; tightening known-safe rules reduces long-term drift.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Higher signal quality; fewer regressions in low-visibility directories.
- Cons: Requires triaging initial warning/error burst.
- Conflicts with: None, if phased per directory.
- Config snippet:
```jsonc
{
  "overrides": [
    {
      "includes": ["tooling/**/*.ts"],
      "linter": {
        "rules": {
          "suspicious": { "noExplicitAny": "warn" },
          "style": { "noParameterAssign": "error" }
        }
      }
    }
  ]
}
```

### Import Ordering Policy Clarification
- What: Keep Biome organize-imports as default and explicitly document when custom import grouping is required.
- Why: Biome sorting is deterministic and fast, but if you require semantic groups (builtin/external/internal/type), Biome alone may be insufficient.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Preserves fast Biome workflow while making exceptions explicit.
- Cons: If strict group ordering is mandatory, a supplemental lint plugin is still needed.
- Conflicts with: ESLint `import/order` if both mutate ordering automatically.
- Config snippet:
```jsonc
{
  "assist": {
    "actions": {
      "source": { "organizeImports": "on" }
    }
  }
}
```

### ESLint Gap Matrix (Only for Biome Coverage Gaps)
- What: Reduce ESLint scope to gap-only checks (JSDoc quality, framework-specific rules not in Biome) and keep Biome as default for everything else.
- Why: Avoid tool sprawl while preserving checks Biome does not currently provide.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Keeps lint stack minimal and intentional; avoids duplicate rule noise.
- Cons: Node-based execution path remains for those checks.
- Conflicts with: Broad ESLint presets that overlap Biome diagnostics.
- Config snippet:
```json
{
  "scripts": {
    "lint": "bunx biome check .",
    "lint:gap": "eslint --config eslint.config.mjs tooling/src/** packages/**/src/**"
  }
}
```

## Head-to-Head Notes (Biome gaps)
- Custom import grouping: `eslint-plugin-import` has richer grouping than Biome; only add if semantic grouping is required.
- JSDoc enforcement: `eslint-plugin-jsdoc` remains stronger than Biome for detailed JSDoc policies.
- Recommendation: keep Biome primary, use focused ESLint only where Biome does not yet cover required policy.
