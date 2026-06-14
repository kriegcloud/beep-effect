---
title: DualArity.ts
nav_order: 46
parent: "@beep/repo-cli"
---

## DualArity.ts overview

Public API dual-arity inventory and enforcement law.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DualArityInventoryEntry (namespace)](#dualarityinventoryentry-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [DualArityRulesOptions (class)](#dualarityrulesoptions-class)
  - [DualArityRulesSummary (class)](#dualarityrulessummary-class)
- [utilities](#utilities)
  - [runDualArityRules](#rundualarityrules)
---

# models

## DualArityInventoryEntry (namespace)

Namespace for `DualArityInventoryEntry` companion types.

**Example**

```ts
console.log("DualArityInventoryEntry")
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/DualArity.ts#L113)

Since v0.0.0

### Encoded (type alias)

Encoded representation of `DualArityInventoryEntry`.

**Example**

```ts
console.log("Encoded")
```

**Signature**

```ts
type Encoded = typeof DualArityInventoryEntry.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/DualArity.ts#L124)

Since v0.0.0

## DualArityRulesOptions (class)

Runtime options for public API dual-arity enforcement.

**Example**

```ts
console.log("DualArityRulesOptions")
```

**Signature**

```ts
declare class DualArityRulesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/DualArity.ts#L159)

Since v0.0.0

## DualArityRulesSummary (class)

Summary of public API dual-arity inventory verification.

**Example**

```ts
console.log("DualArityRulesSummary")
```

**Signature**

```ts
declare class DualArityRulesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/DualArity.ts#L189)

Since v0.0.0

# utilities

## runDualArityRules

Run public API dual-arity inventory verification.

**Example**

```ts
console.log("runDualArityRules")
```

**Signature**

```ts
declare const runDualArityRules: (options: DualArityRulesOptions) => Effect.Effect<DualArityRulesSummary, S.SchemaError | PlatformError | DomainError | TsMorphProjectLoadError | TsMorphScopeResolutionError | TsMorphSourceFileError | TsMorphSymbolNotFoundError | TsMorphUnsupportedFileError | TsMorphServiceUnavailableError | DualArityInventoryReadError, FileSystem.FileSystem | Path.Path | FsUtils | TSMorphService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/DualArity.ts#L1425)

Since v0.0.0