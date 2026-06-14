---
title: NoNativeRuntimeHotspots.ts
nav_order: 4
parent: "@beep/repo-configs"
---

## NoNativeRuntimeHotspots.ts overview

Native runtime lint hotspot configuration for repository governance.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [NO_NATIVE_RUNTIME_ERROR_FILES](#no_native_runtime_error_files)
  - [NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS](#no_native_runtime_extra_check_patterns)
- [predicates](#predicates)
  - [isNoNativeRuntimeErrorFile](#isnonativeruntimeerrorfile)
  - [isNoNativeRuntimeExtraCheckHotspot](#isnonativeruntimeextracheckhotspot)
---

# configuration

## NO_NATIVE_RUNTIME_ERROR_FILES

Files that currently receive blocking `no-native-runtime` severity in the legacy ESLint surface.

Keep this list aligned with the legacy rollback lane so the repo-local checker preserves
the old warn-vs-error split while P3 is active.

**Example**

```ts
import { NO_NATIVE_RUNTIME_ERROR_FILES } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
const firstPath = NO_NATIVE_RUNTIME_ERROR_FILES[0]
console.log(firstPath)
```

**Signature**

```ts
declare const NO_NATIVE_RUNTIME_ERROR_FILES: readonly ["packages/tooling/tool/cli/src/commands/DocsAggregate.ts", "packages/tooling/tool/cli/src/commands/Lint/index.ts", "packages/tooling/tool/cli/src/commands/Laws/index.ts", "packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts", "packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyConfig.ts", "packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyServices.ts", "packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyRuntime.ts"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/NoNativeRuntimeHotspots.ts#L25)

Since v0.0.0

## NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS

Paths that enable the stricter hotspot-only runtime checks inside the ESLint rule logic.

**Example**

```ts
import { NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
const firstPattern = NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS[0]
console.log(firstPattern)
```

**Signature**

```ts
declare const NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/NoNativeRuntimeHotspots.ts#L47)

Since v0.0.0

# predicates

## isNoNativeRuntimeErrorFile

Check whether a file path matches the native runtime error file allowlist.

**Example**

```ts
import { isNoNativeRuntimeErrorFile } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
const matches = isNoNativeRuntimeErrorFile("packages/tooling/tool/cli/src/commands/Lint/index.ts")
console.log(matches)
```

**Signature**

```ts
declare const isNoNativeRuntimeErrorFile: (relativeFilePath: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/NoNativeRuntimeHotspots.ts#L76)

Since v0.0.0

## isNoNativeRuntimeExtraCheckHotspot

Check whether a file path matches a native runtime extra-check hotspot pattern.

**Example**

```ts
import { isNoNativeRuntimeExtraCheckHotspot } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
const matches = isNoNativeRuntimeExtraCheckHotspot("packages/tooling/tool/cli/src/commands/Laws/index.ts")
console.log(matches)
```

**Signature**

```ts
declare const isNoNativeRuntimeExtraCheckHotspot: (relativeFilePath: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/NoNativeRuntimeHotspots.ts#L93)

Since v0.0.0