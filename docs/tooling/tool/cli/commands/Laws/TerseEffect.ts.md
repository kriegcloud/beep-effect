---
title: TerseEffect.ts
nav_order: 54
parent: "@beep/repo-cli"
---

## TerseEffect.ts overview

Terse Effect style migration and check logic.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [TerseEffectRulesOptions (class)](#terseeffectrulesoptions-class)
  - [TerseEffectRulesSummary (class)](#terseeffectrulessummary-class)
- [utilities](#utilities)
  - [runTerseEffectRules](#runterseeffectrules)
---

# models

## TerseEffectRulesOptions (class)

Runtime options for terse Effect style migration checks.

**Example**

```ts
console.log("TerseEffectRulesOptions")
```

**Signature**

```ts
declare class TerseEffectRulesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/TerseEffect.ts#L31)

Since v0.0.0

## TerseEffectRulesSummary (class)

Summary of terse Effect style migration results.

**Example**

```ts
console.log("TerseEffectRulesSummary")
```

**Signature**

```ts
declare class TerseEffectRulesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/TerseEffect.ts#L61)

Since v0.0.0

# utilities

## runTerseEffectRules

Run terse Effect style migration/check logic.

**Example**

```ts
console.log("runTerseEffectRules")
```

**Signature**

```ts
declare const runTerseEffectRules: (options: TerseEffectRulesOptions) => Effect.Effect<TerseEffectRulesSummary, TerseEffectRulesPersistenceError, Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/TerseEffect.ts#L571)

Since v0.0.0