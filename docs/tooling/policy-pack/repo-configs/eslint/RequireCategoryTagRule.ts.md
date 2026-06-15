---
title: RequireCategoryTagRule.ts
nav_order: 5
parent: "@beep/repo-configs"
---

## RequireCategoryTagRule.ts overview

Custom ESLint rule enforcing category tags on exported symbols.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [requireCategoryTagRule](#requirecategorytagrule)
---

# configuration

## requireCategoryTagRule

Custom ESLint rule that requires exported symbols to include an `@category` tag.

**Example**

```ts
import { requireCategoryTagRule } from "@beep/repo-configs/eslint/RequireCategoryTagRule"
console.log(requireCategoryTagRule)
```

**Signature**

```ts
declare const requireCategoryTagRule: Rule.RuleModule
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/RequireCategoryTagRule.ts#L117)

Since v0.0.0