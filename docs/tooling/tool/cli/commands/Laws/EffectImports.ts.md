---
title: EffectImports.ts
nav_order: 48
parent: "@beep/repo-cli"
---

## EffectImports.ts overview

Effect import style migration and check logic.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EffectImportRulesOptions (class)](#effectimportrulesoptions-class)
  - [EffectImportRulesSummary (class)](#effectimportrulessummary-class)
- [utilities](#utilities)
  - [runEffectImportRules](#runeffectimportrules)
---

# models

## EffectImportRulesOptions (class)

Runtime options for effect import law migration checks.

**Example**

```ts
console.log("EffectImportRulesOptions")
```

**Signature**

```ts
declare class EffectImportRulesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts#L30)

Since v0.0.0

## EffectImportRulesSummary (class)

Summary of effect import law migration results.

**Example**

```ts
console.log("EffectImportRulesSummary")
```

**Signature**

```ts
declare class EffectImportRulesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts#L60)

Since v0.0.0

# utilities

## runEffectImportRules

Run effect import style migration/check logic.

**Example**

```ts
console.log("runEffectImportRules")
```

**Signature**

```ts
declare const runEffectImportRules: (options: EffectImportRulesOptions) => Effect.Effect<EffectImportRulesSummary, EffectImportRulesPersistenceError, Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts#L110)

Since v0.0.0