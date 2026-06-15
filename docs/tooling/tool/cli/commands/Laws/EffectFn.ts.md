---
title: EffectFn.ts
nav_order: 47
parent: "@beep/repo-cli"
---

## EffectFn.ts overview

Repo-local Effect.fn supplemental law.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EffectFnDiagnostic (class)](#effectfndiagnostic-class)
  - [EffectFnRulesOptions (class)](#effectfnrulesoptions-class)
  - [EffectFnRulesSummary (class)](#effectfnrulessummary-class)
- [utilities](#utilities)
  - [runEffectFnRules](#runeffectfnrules)
---

# models

## EffectFnDiagnostic (class)

Single Effect.fn supplemental law diagnostic.

**Example**

```ts
import { EffectFnDiagnostic } from "@beep/repo-cli/commands/Laws/EffectFn"

const diagnostic = EffectFnDiagnostic.make({
  file: "packages/demo/src/index.ts",
  line: 4,
  column: 42,
  ruleId: "beep-laws/effect-fn",
  ownerName: "loadDemo",
  recommendation: "Effect.fn",
  message: "Function \"loadDemo\" directly returns Effect.gen; wrap it with Effect.fn.",
})

console.log(diagnostic.recommendation)
```

**Signature**

```ts
declare class EffectFnDiagnostic
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/EffectFn.ts#L96)

Since v0.0.0

## EffectFnRulesOptions (class)

Runtime options for the Effect.fn supplemental law.

**Example**

```ts
import { EffectFnRulesOptions } from "@beep/repo-cli/commands/Laws/EffectFn"

const options = EffectFnRulesOptions.make({
  strictCheck: true,
  excludePaths: ["packages/demo/test/index.ts"],
})

console.log(options.strictCheck)
```

**Signature**

```ts
declare class EffectFnRulesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/EffectFn.ts#L58)

Since v0.0.0

## EffectFnRulesSummary (class)

Summary of Effect.fn supplemental law results.

**Example**

```ts
import { EffectFnRulesSummary } from "@beep/repo-cli/commands/Laws/EffectFn"

const summary = EffectFnRulesSummary.make({
  scannedFiles: 12,
  touchedFiles: 1,
  violationCount: 1,
  strictFailure: true,
})

console.log(summary.strictFailure)
```

**Signature**

```ts
declare class EffectFnRulesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/EffectFn.ts#L130)

Since v0.0.0

# utilities

## runEffectFnRules

Run the repo-local Effect.fn supplemental law.

**Example**

```ts
import { Effect } from "effect"
import { runEffectFnRules, EffectFnRulesOptions } from "@beep/repo-cli/commands/Laws/EffectFn"

const program = Effect.map(
  runEffectFnRules(EffectFnRulesOptions.make({ strictCheck: true })),
  (summary) => summary.violationCount,
)

console.log(program)
```

**Signature**

```ts
declare const runEffectFnRules: (options: EffectFnRulesOptions) => Effect.Effect<EffectFnRulesSummary, S.SchemaError | TsMorphProjectLoadError | TsMorphScopeResolutionError | TsMorphSourceFileError | TsMorphSymbolNotFoundError | TsMorphUnsupportedFileError | TsMorphServiceUnavailableError, Path.Path | TSMorphService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/EffectFn.ts#L391)

Since v0.0.0