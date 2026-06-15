---
title: Laws.errors.ts
nav_order: 51
parent: "@beep/repo-cli"
---

## Laws.errors.ts overview

Tagged errors for the Laws command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [DualArityInventoryReadError (class)](#dualarityinventoryreaderror-class)
  - [EffectImportRulesPersistenceError (class)](#effectimportrulespersistenceerror-class)
  - [NoNativeRuntimeRulesExecutionError (class)](#nonativeruntimerulesexecutionerror-class)
  - [TerseEffectRulesPersistenceError (class)](#terseeffectrulespersistenceerror-class)
---

# errors

## DualArityInventoryReadError (class)

Failure raised when the dual-arity inventory cannot be read or decoded.

**Example**

```ts
import { DualArityInventoryReadError } from "@beep/repo-cli/commands/Laws/Laws.errors"

const error = DualArityInventoryReadError.new("Could not read standards/dual-arity.inventory.jsonc.")
console.log(error.message)
```

**Signature**

```ts
declare class DualArityInventoryReadError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/Laws.errors.ts#L31)

Since v0.0.0

## EffectImportRulesPersistenceError (class)

Failure raised when Effect import rule updates cannot be written.

**Example**

```ts
import { EffectImportRulesPersistenceError } from "@beep/repo-cli/commands/Laws/Laws.errors"

const error = EffectImportRulesPersistenceError.new("Could not write Effect import updates.")
console.log(error.message)
```

**Signature**

```ts
declare class EffectImportRulesPersistenceError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/Laws.errors.ts#L62)

Since v0.0.0

## NoNativeRuntimeRulesExecutionError (class)

Failure raised when native runtime enforcement cannot complete.

**Example**

```ts
import { NoNativeRuntimeRulesExecutionError } from "@beep/repo-cli/commands/Laws/Laws.errors"

const error = NoNativeRuntimeRulesExecutionError.new("Could not scan runtime usage.")
console.log(error.message)
```

**Signature**

```ts
declare class NoNativeRuntimeRulesExecutionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/Laws.errors.ts#L94)

Since v0.0.0

## TerseEffectRulesPersistenceError (class)

Failure raised when terse Effect rule updates cannot be written.

**Example**

```ts
import { TerseEffectRulesPersistenceError } from "@beep/repo-cli/commands/Laws/Laws.errors"

const error = TerseEffectRulesPersistenceError.new("Could not write terse Effect updates.")
console.log(error.message)
```

**Signature**

```ts
declare class TerseEffectRulesPersistenceError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/Laws.errors.ts#L126)

Since v0.0.0