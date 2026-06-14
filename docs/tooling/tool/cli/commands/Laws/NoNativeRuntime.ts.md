---
title: NoNativeRuntime.ts
nav_order: 52
parent: "@beep/repo-cli"
---

## NoNativeRuntime.ts overview

Repo-local no-native-runtime parity checker.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [NativeRuntimeViolationKeyOptions (class)](#nativeruntimeviolationkeyoptions-class)
  - [NoNativeRuntimeDiagnostic (class)](#nonativeruntimediagnostic-class)
  - [NoNativeRuntimeDiagnostic (namespace)](#nonativeruntimediagnostic-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [NoNativeRuntimeRulesOptions (class)](#nonativeruntimerulesoptions-class)
  - [NoNativeRuntimeRulesSummary (class)](#nonativeruntimerulessummary-class)
- [utilities](#utilities)
  - [collectNativeRuntimeViolationKeys](#collectnativeruntimeviolationkeys)
  - [runNoNativeRuntimeRules](#runnonativeruntimerules)
---

# models

## NativeRuntimeViolationKeyOptions (class)

Options for collecting native-runtime allowlist lookup keys.

**Example**

```ts
console.log("NativeRuntimeViolationKeyOptions")
```

**Signature**

```ts
declare class NativeRuntimeViolationKeyOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L207)

Since v0.0.0

## NoNativeRuntimeDiagnostic (class)

Single repo-local native runtime diagnostic.

**Example**

```ts
console.log("NoNativeRuntimeDiagnostic")
```

**Signature**

```ts
declare class NoNativeRuntimeDiagnostic
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L120)

Since v0.0.0

## NoNativeRuntimeDiagnostic (namespace)

Namespace for `NoNativeRuntimeDiagnostic` companion types.

**Example**

```ts
console.log("NoNativeRuntimeDiagnostic")
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L144)

Since v0.0.0

### Encoded (type alias)

Encoded representation of `NoNativeRuntimeDiagnostic`.

**Example**

```ts
console.log("Encoded")
```

**Signature**

```ts
type Encoded = typeof NoNativeRuntimeDiagnostic.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L155)

Since v0.0.0

## NoNativeRuntimeRulesOptions (class)

Runtime options for repo-local native runtime checks.

**Example**

```ts
console.log("NoNativeRuntimeRulesOptions")
```

**Signature**

```ts
declare class NoNativeRuntimeRulesOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L92)

Since v0.0.0

## NoNativeRuntimeRulesSummary (class)

Summary of repo-local native runtime checks.

**Example**

```ts
console.log("NoNativeRuntimeRulesSummary")
```

**Signature**

```ts
declare class NoNativeRuntimeRulesSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L168)

Since v0.0.0

# utilities

## collectNativeRuntimeViolationKeys

Collect normalized native-runtime violation keys for allowlist integrity checks.

**Example**

```ts
console.log("collectNativeRuntimeViolationKeys")
```

**Signature**

```ts
declare const collectNativeRuntimeViolationKeys: { (sourceFile: SourceFile, options: NativeRuntimeViolationKeyOptions): ReadonlyArray<string>; (options: NativeRuntimeViolationKeyOptions): (sourceFile: SourceFile) => ReadonlyArray<string>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L485)

Since v0.0.0

## runNoNativeRuntimeRules

Run repo-local native runtime checks.

Non-hotspot files remain warning-only for `--check` so the P3 cutover preserves the
old warn-vs-error split while moving the blocking path away from the repo-wide ESLint lane.

**Example**

```ts
console.log("runNoNativeRuntimeRules")
```

**Signature**

```ts
declare const runNoNativeRuntimeRules: (options: NoNativeRuntimeRulesOptions) => Effect.Effect<NoNativeRuntimeRulesSummary, NoNativeRuntimeRulesExecutionError, Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/NoNativeRuntime.ts#L510)

Since v0.0.0