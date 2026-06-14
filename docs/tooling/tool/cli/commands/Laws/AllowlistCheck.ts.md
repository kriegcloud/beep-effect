---
title: AllowlistCheck.ts
nav_order: 45
parent: "@beep/repo-cli"
---

## AllowlistCheck.ts overview

Effect laws allowlist integrity checks.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AllowlistCheckOptions (class)](#allowlistcheckoptions-class)
  - [AllowlistCheckSummary (class)](#allowlistchecksummary-class)
- [utilities](#utilities)
  - [ALLOWLIST_PATH](#allowlist_path)
  - [reportAllowlistCheckSummary](#reportallowlistchecksummary)
  - [runAllowlistCheck](#runallowlistcheck)
---

# models

## AllowlistCheckOptions (class)

Runtime options for allowlist integrity checks.

**Example**

```ts
console.log("AllowlistCheckOptions")
```

**Signature**

```ts
declare class AllowlistCheckOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/AllowlistCheck.ts#L120)

Since v0.0.0

## AllowlistCheckSummary (class)

Result of an allowlist integrity check.

**Example**

```ts
console.log("AllowlistCheckSummary")
```

**Signature**

```ts
declare class AllowlistCheckSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/AllowlistCheck.ts#L139)

Since v0.0.0

# utilities

## ALLOWLIST_PATH

Relative path to the effect laws allowlist.

**Example**

```ts
console.log("ALLOWLIST_PATH")
```

**Signature**

```ts
declare const ALLOWLIST_PATH: "standards/effect-laws.allowlist.jsonc"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/AllowlistCheck.ts#L36)

Since v0.0.0

## reportAllowlistCheckSummary

Print allowlist integrity diagnostics to the console.

**Example**

```ts
console.log("reportAllowlistCheckSummary")
```

**Signature**

```ts
declare const reportAllowlistCheckSummary: (summary: AllowlistCheckSummary) => Effect.Effect<void, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/AllowlistCheck.ts#L353)

Since v0.0.0

## runAllowlistCheck

Run the effect laws allowlist integrity check.

**Example**

```ts
console.log("runAllowlistCheck")
```

**Signature**

```ts
declare const runAllowlistCheck: (options: AllowlistCheckOptions) => Effect.Effect<AllowlistCheckSummary, PlatformError | NoSuchFileError | Issue, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/AllowlistCheck.ts#L285)

Since v0.0.0